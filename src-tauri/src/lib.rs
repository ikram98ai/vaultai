pub(crate) mod commands;
pub(crate) mod types;
use tauri_plugin_shell::process::CommandChild;
use std::sync::Mutex;

pub struct LlamafileState {
    pub child: Mutex<Option<CommandChild>>,
    pub current_model: Mutex<Option<String>>,
}

// ============ App Entry Point ============


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(LlamafileState {
            child: Mutex::new(None),
            current_model: Mutex::new(None),
        })
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // Chat

            commands::chat::send_query,

            // Models
            commands::models::start_llamafile,
            commands::models::get_running_model,

            // Settings
            commands::settings::get_system_tier,
            commands::settings::get_memory_usage,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
