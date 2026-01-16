pub(crate) mod app_state;
pub(crate) mod commands;
pub(crate) mod types;

// ============ App Entry Point ============

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .manage(app_state::AppState::default())
        .invoke_handler(tauri::generate_handler![
            // Chat
            commands::chat::get_all_chats,
            commands::chat::get_chat,
            commands::chat::save_chat,
            commands::chat::delete_chat,
            commands::chat::update_chat_property,
            commands::chat::send_query,
            // Files
            commands::file::get_files,
            commands::file::upload_files,
            commands::file::delete_file,
            // Projects
            commands::project::get_all_projects,
            commands::project::get_project,
            commands::project::create_project,
            commands::project::update_project,
            commands::project::delete_project,
            commands::project::get_project_files,
            commands::project::upload_project_files,
            // Profile
            commands::profile::get_user_profile,
            commands::profile::save_user_profile,
            commands::profile::clear_user_profile,
            // Settings
            commands::settings::get_settings,
            commands::settings::save_settings,
            commands::settings::get_system_tier,
            commands::settings::get_memory_usage,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
