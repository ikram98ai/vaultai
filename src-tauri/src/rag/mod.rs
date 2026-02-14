pub(crate) mod ingestion;
pub(crate) mod retrieval;
pub(crate) mod extraction;

use lancedb::Connection;
use fastembed::{TextEmbedding, EmbeddingModel, TextInitOptions};
use anyhow::Result;
use tokio::sync::Mutex;
use tauri::{AppHandle, Manager};

pub const DENSE_VECTOR_NAME: &str = "dense";
pub const COLLECTION_NAME: &str = "vaultai_docs";

pub struct RagSystem {
    pub lancedb_conn: Connection,
    pub dense_model: Mutex<TextEmbedding>,
}

impl RagSystem {
    pub async fn new(app_handle: &AppHandle) -> Result<Self> {
        let app_dir = app_handle.path().app_data_dir()?;
        
        let db_path = app_dir.join("vectordb").join("lancedb");
        println!("Initializing LanceDB at: {:?}", db_path);
        std::fs::create_dir_all(&db_path)?;
        
        let db_path_str = db_path.to_string_lossy();
        let lancedb_conn = lancedb::connect(&db_path_str).execute().await?;

        let cache_dir = app_dir.join("vectordb").join("model");
        println!("Embedding model cache directory: {:?}", cache_dir);
        std::fs::create_dir_all(&cache_dir)?;

        println!("Initializing dense embedding model (FastEmbed)...");
        let dense_model = TextEmbedding::try_new(
            TextInitOptions::new(EmbeddingModel::AllMiniLML6V2)
                .with_cache_dir(cache_dir.clone())
                .with_show_download_progress(true)
        )?;

        println!("RAG System initialized successfully.");
        Ok(Self {
            lancedb_conn,
            dense_model: Mutex::new(dense_model),
        })
    }

    pub fn get_collection_name(project_id: Option<&str>, source: Option<&str>) -> String {
        if let Some(id) = project_id {
            format!("vaultai_project_{}", id)
        } else if source == Some("global_knowledgebase") {
            "vaultai_global_kb".to_string()
        } else {
            COLLECTION_NAME.to_string()
        }
    }

    pub async fn generate_vectors(&self, text: &str) -> Result<Vec<f32>> {
        let mut dense_model = self.dense_model.lock().await;
        let dense_embeddings = dense_model.embed(vec![text], None)?;
        let dense_vector = dense_embeddings[0].clone();

        Ok(dense_vector)
    }
}
