use crate::app_state::AppState;
use crate::types;
use tauri::State;

// ============ Profile Commands ============

#[tauri::command]
pub fn get_user_profile(state: State<AppState>) -> Option<types::UserProfile> {
    state.profile.lock().unwrap().clone()
}

#[tauri::command]
pub fn save_user_profile(
    state: State<AppState>,
    profile: types::UserProfile,
) -> types::UserProfile {
    *state.profile.lock().unwrap() = Some(profile.clone());
    profile
}

#[tauri::command]
pub fn clear_user_profile(state: State<AppState>) -> bool {
    *state.profile.lock().unwrap() = None;
    true
}
