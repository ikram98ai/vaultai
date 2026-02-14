use super::{RagSystem};
use anyhow::Result;
use serde::{Deserialize, Serialize};
use lancedb::query::{ExecutableQuery, QueryBase};
use arrow_array::{RecordBatch, StringArray, Float32Array};
use futures::StreamExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResult {
    pub content: String,
    pub source: String,
    pub score: f32,
    pub id: String,
    pub collection: String,
}

impl RagSystem {
    pub async fn search_collection(
        &self,
        query_text: &str,
        table_name: &str,
        n_results: u64,
    ) -> Result<Vec<SearchResult>> {
        let table_names = self.lancedb_conn.table_names().execute().await?;
        if !table_names.contains(&table_name.to_string()) {
            return Ok(vec![]);
        }

        let table = self.lancedb_conn.open_table(table_name).execute().await?;
        let dense = self.generate_vectors(query_text).await?;

        let query = table.vector_search(dense)
            .map_err(|e| anyhow::anyhow!("Search error: {}", e))?
            .limit(n_results as usize);

        let mut stream = query.execute().await?;
        let mut results = Vec::new();

        while let Some(batch_result) = stream.next().await {
            let batch = batch_result?;
            results.extend(self.process_batch(batch, table_name)?);
        }

        Ok(results)
    }

    fn process_batch(&self, batch: RecordBatch, collection_name: &str) -> Result<Vec<SearchResult>> {
        let mut results = Vec::new();
        
        let texts = batch.column_by_name("text")
            .ok_or_else(|| anyhow::anyhow!("text column not found"))?
            .as_any().downcast_ref::<StringArray>()
            .ok_or_else(|| anyhow::anyhow!("text column is not StringArray"))?;
            
        let ids = batch.column_by_name("id")
            .ok_or_else(|| anyhow::anyhow!("id column not found"))?
            .as_any().downcast_ref::<StringArray>()
            .ok_or_else(|| anyhow::anyhow!("id column is not StringArray"))?;

        let source = batch.column_by_name("source")
            .ok_or_else(|| anyhow::anyhow!("source column not found"))?
            .as_any().downcast_ref::<StringArray>()
            .ok_or_else(|| anyhow::anyhow!("source column is not StringArray"))?;

        // LanceDB search result batch usually includes a "_distance" column
        let scores = batch.column_by_name("_distance")
            .and_then(|c| c.as_any().downcast_ref::<Float32Array>());

        for i in 0..batch.num_rows() {
            let content = texts.value(i).to_string();
            let id = ids.value(i).to_string();
            let source = source.value(i).to_string();
            
            // Vector distance to score conversion (simplified: 1 / (1 + distance))
            let score = scores.map(|s| 1.0 / (1.0 + s.value(i))).unwrap_or(0.0);

            results.push(SearchResult {
                content,
                score,
                id,
                source,
                collection: collection_name.to_string(),
            });
        }

        Ok(results)
    }

    pub async fn query_index(
        &self,
        query_text: &str,
        n_results: u64,
        project_ids: Vec<String>,
    ) -> Result<Vec<SearchResult>> {
        let mut tables_to_search = Vec::new();
        let all_tables = self.lancedb_conn.table_names().execute().await?;

        if project_ids.is_empty() {
            tables_to_search = all_tables;
        } else {
            for id in project_ids {
                let table_name = Self::get_collection_name(Some(&id), None);
                if all_tables.contains(&table_name) {
                    tables_to_search.push(table_name);
                }
            }
        }

        let mut all_results = Vec::new();
        for table in tables_to_search {
            match self.search_collection(query_text, &table, n_results).await {
                Ok(mut results) => all_results.append(&mut results),
                Err(e) => println!("Error searching table {}: {}", table, e),
            }
        }

        all_results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));
        all_results.truncate(n_results as usize);

        Ok(all_results)
    }
}
