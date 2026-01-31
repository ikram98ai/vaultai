use crate::types;
use crate::app_state::AppState;
use anyhow::Result;
use mistralrs::{
    PagedAttentionMetaBuilder, 
    TextMessageRole, TextMessages, 
    TextModelBuilder, 
    VisionModelBuilder, Model,
};
use tauri::{Manager, State};
use tauri::path::BaseDirectory;
use std::path::PathBuf;


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


pub async fn generate(messages: Vec<types::ChatMessage>, model: &Model) -> Result<String> {
    
    let mut chat_request = TextMessages::new();
    for msg in messages {
        let role = match msg.role.as_str() {
            "system" => TextMessageRole::System,
            "user" => TextMessageRole::User,
            "assistant" => TextMessageRole::Assistant,
            _ => TextMessageRole::User,
        };
        chat_request = chat_request.add_message(role, msg.content);
    }
   
    let response = model.send_chat_request(chat_request).await?;

    let response_text = response.choices[0].message.content.clone().unwrap_or_default();
    println!("Model response: {}", response_text);
    dbg!(
        response.usage.avg_prompt_tok_per_sec,
        response.usage.avg_compl_tok_per_sec
    );

    Ok(response_text)
}



#[tauri::command]
pub async fn send_query(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    query: String,
    system_prompt: String,
    history: Vec<types::ChatMessage>,
    model: String,
    options: types::QueryOptions,
) -> Result<types::QueryResponse, String> {

    let generation_time = std::time::Instant::now();

    let model_path_buf = app.path().resolve("_up_/models/gemma-3-270m-it", BaseDirectory::Resource)
        .unwrap_or_else(|_| PathBuf::from("_up_/models/gemma-3-270m-it"));
    
    let model_id = model_path_buf.to_string_lossy().to_string();

    println!("Model path: {:?}", model_path_buf);
    println!("User query: {}", query);

    let mut context = String::new();
    if options.rag_enabled {
        context.push_str("RAG is enabled.\n\n ");
    }
    if options.web_search_enabled {
        context.push_str("Web search is enabled.\n\n ");
    }
    if options.agent_mode_enabled {
        context.push_str("Agent mode is enabled.\n\n ");
    }
    if options.project_ids.is_some() {
        context.push_str("Project-specific context is included. ");
    }

    let prompt = build_prompt(&query, &context, &options);


    let mut messages = vec![types::ChatMessage {
        role: "system".to_string(),
        content: system_prompt, 
    }];

    let mut clean_history = history.clone();
    if let Some(last_msg) = clean_history.last() {
        if last_msg.role == "user" {
            clean_history.pop();
        }
    }

    messages.extend(clean_history);
    messages.push(types::ChatMessage {
        role: "user".to_string(),
        content: prompt,
    });

    // Model loading logic
    let mut state_guard = state.model.lock().await;
    
    let need_reload = if let Some((loaded_id, _)) = &*state_guard {
        loaded_id != &model_id
    } else {
        true
    };

    if need_reload {
         println!("Loading model: {}", model_id);
         
         // Explicitly type the result of the async block to avoid inference ambiguity
         let load_result: Result<Model> = async {
            if model_id.contains("gemma-3") {
                println!("Using VisionModelBuilder");
                VisionModelBuilder::new(model_id.clone())
                    .with_logging()
                    .with_paged_attn(|| PagedAttentionMetaBuilder::default().build())? 
                    .build()
                    .await
            } else {
                TextModelBuilder::new(model_id.clone())
                    .with_logging()
                    .with_paged_attn(|| PagedAttentionMetaBuilder::default().build())? 
                    .build()
                    .await
            }
         }.await;

         match load_result {
            Ok(new_model) => {
                *state_guard = Some((model_id.clone(), new_model));
            }
            Err(e) => {
                // Return a successful IPC call containing the error info
                return Ok(types::QueryResponse {
                    success: false,
                    content: None,
                    generation_time: None,
                    error: Some(format!("Failed to load model: {}", e)),
                });
            }
         }
    } else {
         println!("Using cached model: {}", model_id);
    }

    let model_instance = &state_guard.as_ref().unwrap().1;

    let response_content = generate(messages, model_instance).await;

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
