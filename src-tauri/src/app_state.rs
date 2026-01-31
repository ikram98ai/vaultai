use tokio::sync::Mutex;
use mistralrs::Model;

// ============ App State ============


pub struct AppState {
    pub model: Mutex<Option<(String, Model)>>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            model: Mutex::new(None),
        }
    }
}

