use crate::types;
use std::sync::Mutex;

// ============ App State ============

pub struct AppState {
    pub chats: Mutex<Vec<types::Chat>>,
    pub projects: Mutex<Vec<types::Project>>,
    pub files: Mutex<Vec<types::FileInfo>>,
    pub settings: Mutex<Option<types::Settings>>,
    pub profile: Mutex<Option<types::UserProfile>>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            chats: Mutex::new(Vec::new()),
            projects: Mutex::new(Vec::new()),
            files: Mutex::new(Vec::new()),
            settings: Mutex::new(Some(types::Settings {
                model: types::ModelSettings {
                    chat: "vaultai16-code".to_string(),
                },
                ui: types::UiSettings {
                    streaming_enabled: false,
                },
                rag: types::RagSettings { enabled: true },
                private_search: true,
            })),
            profile: Mutex::new(None),
        }
    }
}
