use serde::{Deserialize, Serialize};


#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QueryOptions {
    pub rag_enabled: bool,
    pub web_search_enabled: bool,
    pub agent_mode_enabled: bool,
    pub user_profile_enabled: bool,
    pub project_id: Option<String>,
    pub project_slugs: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QueryResponse {
    pub success: bool,
    pub content: Option<String>,
    pub generation_time: Option<f64>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemTier {
    pub tier: String,
    pub recommended_models: RecommendedModels,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecommendedModels {
    pub default: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryUsage {
    pub used: u64,
    pub total: u64,
    pub percentage: f64,
}
