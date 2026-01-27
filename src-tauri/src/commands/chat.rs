use chrono::Local;
use crate::types;

// Helper to build temporal anchor like in rag_Routes.js
fn build_temporal_anchor() -> String {
    let now = Local::now();
    format!(
        "TEMPORAL ANCHOR - CRITICAL FOR ALL TIME REFERENCES:\n\
        Current Date: {}\n\
        Current Time: {}\n\
        Use this as your reference point for ANY temporal reference.\n\n",
        now.format("%A, %B %d, %Y"),
        now.format("%I:%M:%S %p")
    )
}

// Helper to build user profile section (simulated for now)
fn build_user_profile_section(enabled: bool) -> String {
    if !enabled {
        return String::new();
    }
    "[USER PROFILE]\n\
    Name: User (Simulated)\n\
    Note: Profile integration is enabled.\n\n"
        .to_string()
}

// Helper to build project context (simulated for now)
fn build_project_context(project_slugs: &Option<Vec<String>>) -> String {
    let slugs = match project_slugs {
        Some(s) if !s.is_empty() => s,
        _ => return String::new(),
    };

    let mut context = String::from("[PROJECT CONTEXT]\n\
        You are working within the following project(s): ");
    context.push_str(&slugs.join(", "));
    context.push_str("\n\
        When answering questions:\n\
        - Prioritize information from these project documents\n\
        - Use \"we\" when referring to work in these projects\n\
        - Reference project-specific details when relevant\n\n");
    context
}

#[tauri::command]
pub fn send_query(
    message: String,
    _history: Vec<types::ChatMessage>,
    model: String,
    options: types::QueryOptions,
) -> types::QueryResponse {

    let generation_time = std::time::Instant::now();

    let temporal_anchor = build_temporal_anchor();
    let user_profile = build_user_profile_section(options.user_profile_enabled);
    let project_context = build_project_context(&options.project_slugs);
    

    let mut enabled_sources = Vec::new();
    if options.rag_enabled {
        enabled_sources.push("Knowledge Base");
    }
    if options.web_search_enabled {
        enabled_sources.push("Web Search");
    }
    if options.user_profile_enabled {
        enabled_sources.push("User Profile");
    }
    if let Some(slugs) = &options.project_slugs {
        if !slugs.is_empty() {
            enabled_sources.push("Project Documents");
        }
    }

    let system_prompt_logic = format!(
        "{}You are VaultAI, a private AI assistant with access to multiple information sources.\n\n\
        {}{}\
        CONTEXT PRIORITY ORDER:\n\
        1. PROJECT-SPECIFIC context (highest priority)\n\
        2. KNOWLEDGEBASE DOCUMENTS\n\
        3. WEB SEARCH RESULTS\n\
        4. User's profile information\n\n\
        [SEARCH RESULTS - SIMULATED]\n\
        (Retrieval logic would insert documents here based on enabled sources)\n",
        temporal_anchor,
        project_context,
        user_profile
    );

    let response_content = format!(
        "### Dummy Response (Tauri Backend)\n\n\
        I have received your request and constructed the following context structure based on your settings:\n\n\
        **User Message:** \"{}\"\n\
        **Model:** `{}`\n\n\
        **Enabled Sources:**\n{}\n\n\
        --- \n\
        **System Prompt Construction Logic:**\n\
        ```\n\
        {}\
        ```\n\
        --- \n\
        The actual integration with Ollama and retrieval from Qdrant/DuckDuckGo is being implemented in the Rust layer to match the Node.js reference logic.",
        message,
        model,
        if enabled_sources.is_empty() { "- None".to_string() } else { enabled_sources.iter().map(|s| format!("- {}", s)).collect::<Vec<_>>().join("\n") },
        system_prompt_logic
    );

    // Simulate generation time
    std::thread::sleep(std::time::Duration::from_millis(1500));

    let generation_duration = generation_time.elapsed();
    types::QueryResponse {
        success: true,
        content: Some(response_content),
        generation_time: Some(generation_duration.as_secs_f64()),
        error: None,
    }
}
