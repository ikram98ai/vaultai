use crate::app_state::AppState;
use crate::types;
use tauri::State;

// ============ File Commands ============

#[tauri::command]
pub fn get_files(state: State<AppState>) -> Vec<types::FileInfo> {
    state.files.lock().unwrap().clone()
}

#[tauri::command]
pub fn upload_files(state: State<AppState>, files: Vec<types::FileInfo>) -> types::UploadResult {
    let mut stored_files = state.files.lock().unwrap();
    stored_files.extend(files.clone());

    types::UploadResult {
        success: true,
        files: Some(files),
        error: None,
    }
}

#[tauri::command]
pub fn delete_file(state: State<AppState>, file_id: String) -> bool {
    let mut files = state.files.lock().unwrap();
    let initial_len = files.len();
    files.retain(|f| f.id != file_id);
    files.len() < initial_len
}
