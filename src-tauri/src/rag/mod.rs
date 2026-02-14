pub(crate) mod ingestion;
pub(crate) mod retrieval;
pub(crate) mod extraction;

use qdrant_client::Qdrant;
use fastembed::{TextEmbedding, SparseTextEmbedding, EmbeddingModel, SparseModel, SparseEmbedding, TextInitOptions, SparseInitOptions};
use std::sync::Arc;
use anyhow::Result;
use std::path::PathBuf;
use tokio::sync::Mutex;

pub const SPARSE_VECTOR_NAME: &str = "text";
pub const DENSE_VECTOR_NAME: &str = "dense";
pub const COLLECTION_NAME: &str = "vaultai_docs";

pub struct RagSystem {
    pub qdrant_client: Arc<Qdrant>,
    pub dense_model: Mutex<TextEmbedding>,
    pub sparse_model: Mutex<SparseTextEmbedding>,
}

impl RagSystem {
    pub async fn new(tier: &str) -> Result<Self> {
        let qdrant_url = "http://localhost:6333";
        let qdrant_client = Arc::new(Qdrant::from_url(qdrant_url).build()?);

        let dense_model = TextEmbedding::try_new(
            TextInitOptions::new(EmbeddingModel::AllMiniLML6V2)
                .with_cache_dir(PathBuf::from("models/embed"))
        )?;

        let sparse_model = SparseTextEmbedding::try_new(
            SparseInitOptions::new(SparseModel::SPLADEPPV1) 
                .with_cache_dir(PathBuf::from("models/embed"))
        )?;

        Ok(Self {
            qdrant_client,
            dense_model: Mutex::new(dense_model),
            sparse_model: Mutex::new(sparse_model),
        })
    }

    pub fn get_collection_name(project_slug: Option<&str>, source: Option<&str>) -> String {
        if let Some(slug) = project_slug {
            format!("vaultai_project_{}", slug)
        } else if source == Some("global_knowledgebase") {
            "vaultai_global_kb".to_string()
        } else {
            COLLECTION_NAME.to_string()
        }
    }

    pub async fn generate_vectors(&self, text: &str) -> Result<(Vec<f32>, SparseEmbedding)> {
        let mut dense_model = self.dense_model.lock().await;
        let dense_embeddings = dense_model.embed(vec![text], None)?;
        let dense_vector = dense_embeddings[0].clone();

        let mut sparse_model = self.sparse_model.lock().await;
        let sparse_embeddings = sparse_model.embed(vec![text], None)?;
        let sparse_vector = SparseEmbedding {
            indices: sparse_embeddings[0].indices.clone(),
            values: sparse_embeddings[0].values.clone(),
        };

        Ok((dense_vector, sparse_vector))
    }
}
