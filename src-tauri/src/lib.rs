pub(crate) mod commands;
pub(crate) mod types;
pub(crate) mod rag;
use tauri_plugin_shell::process::CommandChild;
use std::sync::{Arc, Mutex};
use rag::RagSystem;

pub struct LlamafileState {
    pub child: Mutex<Option<CommandChild>>,
    pub current_model: Mutex<Option<String>>,
}

pub struct AppState {
    pub llamafile: LlamafileState,
    pub rag: Arc<RagSystem>,
}

// ============ App Entry Point ============


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // We'll use a block_on or just initialize it synchronously if possible, 
    // but since RagSystem::new is async, we use tokio
    let rt = tokio::runtime::Runtime::new().unwrap();
    let rag_system = rt.block_on(async {
        RagSystem::new("lite").await.expect("Failed to initialize RAG system")
    });
    let rag = Arc::new(rag_system);

    tauri::Builder::default()
        .manage(AppState {
            llamafile: LlamafileState {
                child: Mutex::new(None),
                current_model: Mutex::new(None),
            },
            rag,
        })
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // Chat
            commands::chat::send_query,

            // Ingestion
            commands::ingestion::ingest_document,
            commands::ingestion::ingest_file,

            // Models
            commands::models::start_llamafile,
            commands::models::get_running_model,

            // Settings
            commands::settings::get_system_tier,
            commands::settings::get_memory_usage
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
