use crate::types;
use crate::ai::textgen;
use anyhow::Result;


fn build_prompt(
    query: &str,
    context: &str,
    query_option: &types::QueryOptions,
) -> String {
    let has_knowledgebase = query_option.rag_enabled;
    let has_project_search = query_option.project_ids.is_some();
    let has_web_search = query_option.web_search_enabled;

    let context_source_label = if has_project_search && !has_knowledgebase && !has_web_search {
        "PROJECT DOCUMENTS"
    } else if has_knowledgebase && !has_project_search && !has_web_search {
        "KNOWLEDGEBASE DOCUMENTS"
    } else if has_web_search && !has_project_search && !has_knowledgebase {
        "WEB SEARCH RESULTS"
    } else {
        "SEARCH RESULTS"
    };
    format!(
        "User Query:\n{}\n\nContext:\n    [{} - THESE ARE THE FACTS]\n⚠️ CRITICAL: Read these documents CAREFULLY. They contain the CORRECT information:\n{}",
        query, context_source_label, context
    )
}



#[tauri::command]
pub async fn send_query(
    query: String,
    system_prompt: String,
    history: Vec<types::ChatMessage>,
    model_path: String,
    options: types::QueryOptions,
) -> Result<types::QueryResponse, String> {

    let generation_time = std::time::Instant::now();

    println!("Model path: {}", model_path);
    println!("User query: {}\nSystem prompt: {}", query, system_prompt);

    let mut context = String::new();
    if options.rag_enabled {
        context.push_str("RAG is enabled.\n\n ");
    }
    if options.web_search_enabled {
        context.push_str("Web search is enabled.\n\n ");
    }
    if options.project_ids.is_some() {
        context.push_str("Project-specific context is included. ");
    }

    let prompt = build_prompt(&query, &context, &options);


    let mut messages = vec![types::ChatMessage {
        role: "system".to_string(),
        content: system_prompt, 
    }];
    messages.extend(history);
    messages.push(types::ChatMessage {
        role: "user".to_string(),
        content: prompt,
    });

    let response_content = textgen::generate(messages, model_path);

    let generation_duration = generation_time.elapsed();
    
    match response_content {
        Ok(content) => Ok(types::QueryResponse {
            success: true,
            content: Some(content),
            generation_time: Some(generation_duration.as_secs_f64()),
            error: None,
        }),
        Err(e) => {
            println!("Generation error: {:?}", e);
            Ok(types::QueryResponse {
                success: false,
                content: None,
                generation_time: Some(generation_duration.as_secs_f64()),
                error: Some(e.to_string()),
            })
        }
    }
}
