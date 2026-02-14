use super::{RagSystem};
use lancedb::database::CreateTableMode;
use arrow_array::{
    FixedSizeListArray, Float32Array, RecordBatch, RecordBatchIterator, StringArray, Int32Array,
};
use arrow_schema::{DataType, Field, Schema};
use anyhow::{Result};
use chrono::Utc;
use uuid::Uuid;
use std::path::Path;
use std::sync::Arc;

impl RagSystem {
    pub async fn ensure_table_exists(&self, table_name: &str, dim: usize) -> Result<()> {
        let table_names = self.lancedb_conn.table_names().execute().await?;
        if table_names.contains(&table_name.to_string()) {
            return Ok(());
        }

        let schema = Arc::new(Schema::new(vec![
            Field::new("id", DataType::Utf8, false),
            Field::new("doc_id", DataType::Utf8, false),
            Field::new("chunk_index", DataType::Int32, false),
            Field::new("source", DataType::Utf8, false),
            Field::new("text", DataType::Utf8, false),
            Field::new(super::DENSE_VECTOR_NAME, DataType::FixedSizeList(Arc::new(Field::new("item", DataType::Float32, true)), dim as i32), false),
            Field::new("project_id", DataType::Utf8, true),
            Field::new("indexed_at", DataType::Utf8, false),
        ]));

        let batches = RecordBatchIterator::new(vec![Ok(RecordBatch::new_empty(schema.clone()))], schema);

        self.lancedb_conn
            .create_table(table_name, batches)
            .mode(CreateTableMode::Overwrite)
            .execute()
            .await?;

        Ok(())
    }

    pub fn chunk_text(text: &str, chunk_size: usize, overlap: usize) -> Vec<String> {
        let chars: Vec<char> = text.chars().collect();
        if chars.len() <= chunk_size {
            return vec![text.to_string()];
        }

        let mut chunks = Vec::new();
        let mut start = 0;
        
        while start < chars.len() {
            let end = std::cmp::min(start + chunk_size, chars.len());
            let mut chunk_chars = chars[start..end].to_vec();
            
            // Try to break at whitespace if not at the end of text
            if end < chars.len() {
                if let Some(last_space) = chunk_chars.iter().rposition(|c| c.is_whitespace()) {
                    // Only truncate if the space is reasonably far into the chunk
                    if last_space > chunk_size / 2 {
                        chunk_chars.truncate(last_space);
                    }
                }
            }
            
            let actual_chunk_char_len = chunk_chars.len();
            let chunk: String = chunk_chars.into_iter().collect();
            chunks.push(chunk);
            
            if start + actual_chunk_char_len >= chars.len() {
                break;
            }
            
            let safe_overlap = std::cmp::min(overlap, actual_chunk_char_len);
            start += actual_chunk_char_len - safe_overlap;
            
            // Safety: ensure we always progress even if chunking is weird
            if actual_chunk_char_len == 0 {
                start += 1;
            }
        }
        
        chunks
    }

    pub fn extract_text(path: &Path) -> Result<String> {
        super::extraction::extract_text(path)
    }

    pub async fn index_document(
        &self,
        doc_id: &str,
        text: &str,
        source: &str,
        project_id: Option<&str>,
    ) -> Result<()> {
        println!("Indexing document: {} (source: {})", doc_id, source);
        let table_name = Self::get_collection_name(project_id, Some(source));
        
        // Split text into chunks
        let chunks = Self::chunk_text(text, 1000, 200);
        if chunks.is_empty() {
            println!("No text to index for document: {}", doc_id);
            return Ok(());
        }
        println!("Document split into {} chunks", chunks.len());

        // Generate first vector to get dimension
        let first_dense = self.generate_vectors(&chunks[0]).await?;
        let dim = first_dense.len();

        self.ensure_table_exists(&table_name, dim).await?;

        let mut ids = Vec::new();
        let mut doc_ids = Vec::new();
        let mut chunk_indices = Vec::new();
        let mut sources = Vec::new();
        let mut texts = Vec::new();
        let mut vectors = Vec::new();
        let mut project_ids = Vec::new();
        let mut indexed_ats = Vec::new();

        for (i, chunk) in chunks.iter().enumerate() {
            if i % 100 == 0 && i > 0 {
                println!("Processing chunk {}/{}...", i, chunks.len());
            }
            let dense = self.generate_vectors(chunk).await?;

            ids.push(Uuid::new_v4().to_string());
            doc_ids.push(doc_id.to_string());
            chunk_indices.push(i as i32);
            sources.push(source.to_string());
            texts.push(chunk.clone());
            vectors.extend_from_slice(&dense);
            project_ids.push(project_id.map(|s| s.to_string()));
            indexed_ats.push(Utc::now().to_rfc3339());
        }

        println!("Adding {} chunks to table {}", chunks.len(), table_name);

        let schema = Arc::new(Schema::new(vec![
            Field::new("id", DataType::Utf8, false),
            Field::new("doc_id", DataType::Utf8, false),
            Field::new("chunk_index", DataType::Int32, false),
            Field::new("source", DataType::Utf8, false),
            Field::new("text", DataType::Utf8, false),
            Field::new(super::DENSE_VECTOR_NAME, DataType::FixedSizeList(Arc::new(Field::new("item", DataType::Float32, true)), dim as i32), false),
            Field::new("project_id", DataType::Utf8, true),
            Field::new("indexed_at", DataType::Utf8, false),
        ]));

        let id_array = StringArray::from(ids);
        let doc_id_array = StringArray::from(doc_ids);
        let chunk_index_array = Int32Array::from(chunk_indices);
        let source_array = StringArray::from(sources);
        let text_array = StringArray::from(texts);
        let project_id_array = StringArray::from(project_ids);
        let indexed_at_array = StringArray::from(indexed_ats);

        let vector_values = Float32Array::from(vectors);
        let vector_array = FixedSizeListArray::try_new(
            Arc::new(Field::new("item", DataType::Float32, true)),
            dim as i32,
            Arc::new(vector_values),
            None
        )?;

        let batch = RecordBatch::try_new(
            schema.clone(),
            vec![
                Arc::new(id_array),
                Arc::new(doc_id_array),
                Arc::new(chunk_index_array),
                Arc::new(source_array),
                Arc::new(text_array),
                Arc::new(vector_array),
                Arc::new(project_id_array),
                Arc::new(indexed_at_array),
            ],
        )?;

        let table = self.lancedb_conn.open_table(&table_name).execute().await?;
        table.add(RecordBatchIterator::new(vec![Ok(batch)], schema)).execute().await?;

        Ok(())
    }
}
