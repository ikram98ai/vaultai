use tauri::{State, AppHandle, Manager, path::BaseDirectory};
use crate::AppState;
use serde_json::Value;

#[tauri::command]
pub async fn ingest_document(
    state: State<'_, AppState>,
    doc_id: String,
    text: String,
    source: String,
    project_slug: Option<String>,
    metadata: Option<Value>,
) -> Result<(), String> {
    state
        .rag
        .index_document(
            &doc_id,
            &text,
            &source,
            project_slug.as_deref(),
            metadata,
        )
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn ingest_file(
    app_handle: AppHandle,
    state: State<'_, AppState>,
    file_id: String,
    file_name: String,
    project_id: Option<String>,
    metadata: Option<Value>,
) -> Result<(), String> {
    // Resolve the file path in AppData
    let dir = if let Some(ref pid) = project_id {
        format!("knowledgebase/project-{}", pid)
    } else {
        "knowledgebase".to_string()
    };

    let file_path = app_handle
        .path()
        .resolve(format!("{}/{}", dir, file_id), BaseDirectory::AppData)
        .map_err(|e| e.to_string())?;

    // Extract text
    let text = crate::rag::RagSystem::extract_text(&file_path)
        .map_err(|e| e.to_string())?;

    // Index
    state
        .rag
        .index_document(
            &file_id,
            &text,
            &file_name,
            project_id.as_deref(),
            metadata,
        )
        .await
        .map_err(|e| e.to_string())
}
