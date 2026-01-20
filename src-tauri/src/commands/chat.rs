use crate::types;


#[tauri::command]
pub fn send_query(
    _message: String,
    _model: String,
    _options: types::QueryOptions,
) -> types::QueryResponse {
    // Dummy implementation - returns a mock response
    types::QueryResponse {
        success: true,
        content: Some("This is a dummy response from the Tauri backend. The actual AI integration will be implemented here.".to_string()),
        generation_time: Some(0.5),
        error: None,
    }
}
