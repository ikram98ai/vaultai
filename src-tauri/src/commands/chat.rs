use crate::app_state::AppState;
use crate::types;
use tauri::State;

// ============ Chat Commands ============

#[tauri::command]
pub fn get_all_chats(state: State<AppState>) -> Vec<types::Chat> {
    state.chats.lock().unwrap().clone()
}

#[tauri::command]
pub fn get_chat(state: State<AppState>, chat_id: String) -> Option<types::Chat> {
    state
        .chats
        .lock()
        .unwrap()
        .iter()
        .find(|c| c.id == chat_id)
        .cloned()
}

#[tauri::command]
pub fn save_chat(state: State<AppState>, chat_data: types::Chat) -> types::Chat {
    let mut chats = state.chats.lock().unwrap();

    // Find existing chat or add new one
    if let Some(pos) = chats.iter().position(|c| c.id == chat_data.id) {
        chats[pos] = chat_data.clone();
    } else {
        chats.push(chat_data.clone());
    }
    println!("Saved chat: {:?}", chat_data);
    chat_data
}

#[tauri::command]
pub fn delete_chat(state: State<AppState>, chat_id: String) -> bool {
    let mut chats = state.chats.lock().unwrap();
    let initial_len = chats.len();
    chats.retain(|c| c.id != chat_id);
    chats.len() < initial_len
}

#[tauri::command]
pub fn update_chat_property(
    state: State<AppState>,
    chat_id: String,
    property: String,
    value: serde_json::Value,
) -> Option<types::Chat> {
    let mut chats = state.chats.lock().unwrap();

    if let Some(chat) = chats.iter_mut().find(|c| c.id == chat_id) {
        match property.as_str() {
            "title" => {
                if let Some(title) = value.as_str() {
                    chat.title = title.to_string();
                }
            }
            "pinned" => {
                if let Some(pinned) = value.as_bool() {
                    chat.pinned = pinned;
                }
            }
            _ => {}
        }
        return Some(chat.clone());
    }

    None
}

// ============ Query Commands ============

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
