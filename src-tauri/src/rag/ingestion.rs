use super::{RagSystem, DENSE_VECTOR_NAME, SPARSE_VECTOR_NAME};
use qdrant_client::qdrant::{
    CreateCollectionBuilder, Distance, VectorParamsBuilder, VectorsConfigBuilder,
    SparseVectorParamsBuilder, SparseVectorsConfigBuilder, PointStruct, UpsertPointsBuilder,
    NamedVectors, Vector,
};
use qdrant_client::Payload;
use serde_json::json;
use anyhow::{Result};
use chrono::Utc;
use uuid::Uuid;
use std::path::Path;

impl RagSystem {
    pub async fn ensure_collection_exists(&self, collection_name: &str) -> Result<()> {
        if self.qdrant_client.collection_exists(collection_name).await? {
            return Ok(());
        }

        // Generate dummy vectors to get sizes
        let (dense, _) = self.generate_vectors("Initialize").await?;
        let dense_size = dense.len() as u64;

        let mut vectors_config = VectorsConfigBuilder::default();
        vectors_config.add_named_vector_params(
            DENSE_VECTOR_NAME,
            VectorParamsBuilder::new(dense_size, Distance::Cosine),
        );

        let mut sparse_vectors_config = SparseVectorsConfigBuilder::default();
        sparse_vectors_config.add_named_vector_params(
            SPARSE_VECTOR_NAME,
            SparseVectorParamsBuilder::default(),
        );

        self.qdrant_client
            .create_collection(
                CreateCollectionBuilder::new(collection_name)
                    .vectors_config(vectors_config)
                    .sparse_vectors_config(sparse_vectors_config)
            )
            .await?;

        Ok(())
    }

    pub fn chunk_text(text: &str, chunk_size: usize, overlap: usize) -> Vec<String> {
        if text.len() <= chunk_size {
            return vec![text.to_string()];
        }

        let mut chunks = Vec::new();
        let mut start = 0;
        
        while start < text.len() {
            let end = std::cmp::min(start + chunk_size, text.len());
            let mut chunk = text[start..end].to_string();
            
            // Try to snap to a newline or space to avoid cutting words
            if end < text.len() {
                if let Some(last_space) = chunk.rfind(|c: char| c.is_whitespace()) {
                    if last_space > chunk_size / 2 {
                        chunk.truncate(last_space);
                    }
                }
            }
            
            let actual_chunk_len = chunk.len();
            chunks.push(chunk);
            
            if start + actual_chunk_len >= text.len() {
                break;
            }
            
            start += actual_chunk_len - std::cmp::min(overlap, actual_chunk_len);
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
        project_slug: Option<&str>,
        metadata: Option<serde_json::Value>,
    ) -> Result<()> {
        let collection_name = Self::get_collection_name(project_slug, Some(source));
        self.ensure_collection_exists(&collection_name).await?;

        // Split text into chunks (e.g., 1000 chars with 200 overlap)
        let chunks = Self::chunk_text(text, 1000, 200);

        for (i, chunk) in chunks.iter().enumerate() {
            let (dense, sparse) = self.generate_vectors(chunk).await?;

            let mut payload_json = json!({
                "doc_id": doc_id,
                "chunk_index": i,
                "source": source,
                "text": chunk,
                "indexed_at": Utc::now().to_rfc3339(),
            });

            if let Some(slug) = project_slug {
                payload_json["project_slug"] = json!(slug);
            }

            if let Some(meta) = metadata.as_ref() {
                if let Some(obj) = meta.as_object() {
                    for (k, v) in obj {
                        payload_json[k] = v.clone();
                    }
                }
            }

            let sparse_indices: Vec<u32> = sparse.indices.iter().map(|&i| i as u32).collect();
            let sparse_values: Vec<f32> = sparse.values;
            
            let vectors = NamedVectors::default()
                .add_vector(DENSE_VECTOR_NAME, dense)
                .add_vector(SPARSE_VECTOR_NAME, Vector::new_sparse(sparse_indices, sparse_values));

            let payload: Payload = serde_json::from_value(payload_json)?;

            let point = PointStruct::new(
                Uuid::new_v4().to_string(),
                vectors,
                payload,
            );

            self.qdrant_client
                .upsert_points(UpsertPointsBuilder::new(&collection_name, vec![point]))
                .await?;
        }

        Ok(())
    }
}
