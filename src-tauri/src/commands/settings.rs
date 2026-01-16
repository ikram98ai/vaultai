use crate::app_state::AppState;
use crate::types;
use tauri::State;

// ============ Settings Commands ============

#[tauri::command]
pub fn get_settings(state: State<AppState>) -> Option<types::Settings> {
    state.settings.lock().unwrap().clone()
}

#[tauri::command]
pub fn save_settings(state: State<AppState>, settings: types::Settings) -> types::Settings {
    *state.settings.lock().unwrap() = Some(settings.clone());
    settings
}

// ============ System Commands ============

#[tauri::command]
pub fn get_system_tier() -> types::SystemTier {
    types::SystemTier {
        tier: "lite".to_string(),
        recommended_models: types::RecommendedModels {
            default: "vaultai16-code".to_string(),
        },
    }
}

#[tauri::command]
pub fn get_memory_usage() -> types::MemoryUsage {
    // Dummy memory usage
    types::MemoryUsage {
        used: 4 * 1024 * 1024 * 1024,   // 4GB
        total: 16 * 1024 * 1024 * 1024, // 16GB
        percentage: 25.0,
    }
}
