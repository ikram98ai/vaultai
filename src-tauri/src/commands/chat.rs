use crate::types;
use crate::AppState;
use anyhow::Result;
use reqwest::Client;
use serde_json::json;
use tauri::State;

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

fn strip_think_tags(content: String) -> String {
    let mut result = String::new();
    let mut current = content.as_str();

    while let Some(start_idx) = current.find("<think>") {
        result.push_str(&current[..start_idx]);
        if let Some(end_idx) = current[start_idx..].find("</think>") {
            // Move current past the </think> tag
            current = &current[start_idx + end_idx + "</think>".len()..];
        } else {
            // If there's a <think> but no </think>, we strip everything after the tag
            current = "";
            break;
        }
    }
    result.push_str(current);
    result.trim().to_string().replace("<|eot_id|>", "")
}

async fn generate(
    prompt: String,
    system_prompt: String,
    history: &Vec<types::ChatMessage>,
) -> Result<String, anyhow::Error> {
    let client = Client::new();
    let url = "http://localhost:8080/v1/chat/completions";

    // Build messages array from system + history + current user prompt
    let mut messages = Vec::new();
    messages.push(json!({"role": "system", "content": system_prompt}));
    for m in history.iter() {
        messages.push(json!({"role": m.role, "content": m.content}));
    }
    messages.push(json!({"role": "user", "content": prompt}));

    // Prepare the payload
    let payload = json!({
        "messages": messages,
        "temperature": 0.7,
        "stream": false
    });

    // Send the request
    let response = client
        .post(url)
        .json(&payload)
        .send()
        .await?;

    let response_json: serde_json::Value = response.json().await?;
    
    // Extract the assistant content if present
    let content = response_json["choices"][0]["message"]["content"]
        .as_str()
        .ok_or_else(|| anyhow::anyhow!("Unexpected response format from llama.cpp: {:?}", response_json))?
        .to_string();

    println!("Response: {}", content);

    let cleaned_content = strip_think_tags(content);

    Ok(cleaned_content)
}


#[tauri::command]
pub async fn send_query(
    state: State<'_, AppState>,
    query: String,
    system_prompt: String,
    history: Vec<types::ChatMessage>,
    options: types::QueryOptions,
) -> Result<types::QueryResponse, String> {

    let generation_time = std::time::Instant::now();

    let mut context = String::new();
    
    // Perform RAG if enabled
    if options.rag_enabled || options.project_ids.is_some() {
        let project_slugs = options.project_ids.clone().unwrap_or_default();
        match state.rag.query_index(&query, 5, project_slugs).await {
            Ok(results) => {
                for (i, result) in results.iter().enumerate() {
                    context.push_str(&format!("\n--- Document {} ---\n{}\n", i + 1, result.content));
                }
                if results.is_empty() {
                    context.push_str("No relevant documents found in the knowledgebase.\n");
                }
            },
            Err(e) => {
                println!("RAG error: {:?}", e);
                context.push_str(&format!("Error retrieving context: {}\n", e));
            }
        }
    }

    if options.web_search_enabled {
        context.push_str("\n[Web search results would be here]\n ");
    }

    let prompt = if context.is_empty() {
        query.clone()
    } else {
        build_prompt(&query, &context, &options)
    };

    let content_result = generate(prompt, system_prompt, &history).await;

    let generation_duration = generation_time.elapsed();

    match content_result {
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
