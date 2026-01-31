pub(crate) mod commands;
pub(crate) mod types;
pub(crate) mod app_state;

// ============ App Entry Point ============

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .manage(app_state::AppState::default())
        .invoke_handler(tauri::generate_handler![
            // Chat

            commands::chat::send_query,

            // Settings
            commands::settings::get_system_tier,
            commands::settings::get_memory_usage,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
