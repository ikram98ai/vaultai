use super::{RagSystem, DENSE_VECTOR_NAME, SPARSE_VECTOR_NAME};
use qdrant_client::qdrant::{
    QueryPointsBuilder, PrefetchQueryBuilder, Filter, Fusion, Query,
};
use anyhow::Result;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResult {
    pub content: String,
    pub metadata: serde_json::Value,
    pub score: f32,
    pub id: String,
    pub collection: String,
}

impl RagSystem {
    pub async fn search_collection(
        &self,
        query_text: &str,
        collection_name: &str,
        n_results: u64,
        _metadata_filter: Option<Filter>,
    ) -> Result<Vec<SearchResult>> {
        if !self.qdrant_client.collection_exists(collection_name).await? {
            return Ok(vec![]);
        }

        let (dense, sparse) = self.generate_vectors(query_text).await?;

        let mut query_builder = QueryPointsBuilder::new(collection_name)
            .limit(n_results)
            .with_payload(true);

        // Add dense prefetch
        query_builder = query_builder.add_prefetch(
            PrefetchQueryBuilder::default()
                .query(Query::from(dense))
                .using(DENSE_VECTOR_NAME)
                .limit(n_results * 2)
        );

        // Add sparse prefetch
        let sparse_vector: Vec<(u32, f32)> = sparse.indices.iter()
            .zip(sparse.values.iter())
            .map(|(&i, &v)| (i as u32, v))
            .collect();
            
        query_builder = query_builder.add_prefetch(
            PrefetchQueryBuilder::default()
                .query(Query::from(sparse_vector))
                .using(SPARSE_VECTOR_NAME)
                .limit(n_results * 2)
        );

        // Use Fusion to combine the prefetches
        query_builder = query_builder.query(Query::from(Fusion::Rrf));

        let response = self.qdrant_client.query(query_builder).await?;

        let mut results = Vec::new();
        for point in response.result {
            let payload = point.payload;
            let content = payload.get("text")
                .and_then(|v| {
                    if let Some(qdrant_client::qdrant::value::Kind::StringValue(s)) = &v.kind {
                        Some(s.clone())
                    } else {
                        None
                    }
                })
                .unwrap_or_default();
            
            let mut metadata = serde_json::Map::new();
            for (k, v) in payload {
                if k != "text" {
                    metadata.insert(k, json_from_qdrant_value(v));
                }
            }

            let id_str = match point.id {
                Some(id) => match id.point_id_options {
                    Some(qdrant_client::qdrant::point_id::PointIdOptions::Num(n)) => n.to_string(),
                    Some(qdrant_client::qdrant::point_id::PointIdOptions::Uuid(s)) => s,
                    None => "".to_string(),
                },
                None => "".to_string(),
            };

            results.push(SearchResult {
                content,
                metadata: serde_json::Value::Object(metadata),
                score: point.score,
                id: id_str,
                collection: collection_name.to_string(),
            });
        }

        Ok(results)
    }

    pub async fn query_index(
        &self,
        query_text: &str,
        n_results: u64,
        project_slugs: Vec<String>,
    ) -> Result<Vec<SearchResult>> {
        let mut collections_to_search = Vec::new();
        if project_slugs.is_empty() {
            let collections = self.qdrant_client.list_collections().await?;
            for col in collections.collections {
                collections_to_search.push(col.name);
            }
        } else {
            for slug in project_slugs {
                collections_to_search.push(Self::get_collection_name(Some(&slug), None));
            }
        }

        let mut all_results = Vec::new();
        for col in collections_to_search {
            match self.search_collection(query_text, &col, n_results, None).await {
                Ok(mut results) => all_results.append(&mut results),
                Err(e) => println!("Error searching collection {}: {}", col, e),
            }
        }

        all_results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));
        all_results.truncate(n_results as usize);

        Ok(all_results)
    }
}

fn json_from_qdrant_value(value: qdrant_client::qdrant::Value) -> serde_json::Value {
    use qdrant_client::qdrant::value::Kind;
    match value.kind {
        Some(Kind::NullValue(_)) => serde_json::Value::Null,
        Some(Kind::DoubleValue(n)) => serde_json::json!(n),
        Some(Kind::IntegerValue(n)) => serde_json::json!(n),
        Some(Kind::StringValue(s)) => serde_json::json!(s),
        Some(Kind::BoolValue(b)) => serde_json::json!(b),
        Some(Kind::StructValue(s)) => {
            let mut map = serde_json::Map::new();
            for (k, v) in s.fields {
                map.insert(k, json_from_qdrant_value(v));
            }
            serde_json::Value::Object(map)
        }
        Some(Kind::ListValue(l)) => {
            let vec = l.values.into_iter().map(json_from_qdrant_value).collect();
            serde_json::Value::Array(vec)
        }
        None => serde_json::Value::Null,
    }
}
