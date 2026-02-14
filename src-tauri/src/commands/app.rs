use tauri::{AppHandle, Manager, Emitter, State};
use crate::AppState;
use serde::Serialize;

#[derive(Clone, Serialize)]
struct InitProgress {
    status: String,
    details: String,
    progress: f32,
}

#[tauri::command]
pub async fn initialize_application(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let splash = app.get_webview_window("splashscreen").unwrap();
    let main = app.get_webview_window("main").unwrap();

    // 1. Initialize RAG System (Models + DB)
    splash.emit("init-progress", InitProgress {
        status: "Loading AI Models...".into(),
        details: "This may take a moment on first launch".into(),
        progress: 20.0,
    }).map_err(|e| e.to_string())?;

    let _rag = state.rag.get_or_try_init(|| async {
        crate::rag::RagSystem::new(&app).await
    }).await.map_err(|e| e.to_string())?;

    splash.emit("init-progress", InitProgress {
        status: "Models Loaded".into(),
        details: "Setting up database...".into(),
        progress: 60.0,
    }).map_err(|e| e.to_string())?;

    // 2. Start default LLM model (Llamafile)
    let system_tier = crate::commands::settings::get_system_tier(app.clone());
    let default_model = system_tier.default_model;

    if default_model.ends_with(".llamafile") {
        splash.emit("init-progress", InitProgress {
            status: "Starting AI Engine...".into(),
            details: format!("Loading {}", default_model.split('/').last().unwrap_or("model")),
            progress: 75.0,
        }).map_err(|e| e.to_string())?;

        let llamafile_state = app.state::<crate::LlamafileState>();
        match crate::commands::models::start_llamafile(app.clone(), llamafile_state, default_model).await {
            Ok(_) => println!("Default model started successfully"),
            Err(e) => println!("Failed to start default model: {}", e),
        }
    }

    // 3. Finalizing
    splash.emit("init-progress", InitProgress {
        status: "Finalizing...".into(),
        details: "Starting main interface".into(),
        progress: 95.0,
    }).map_err(|e| e.to_string())?;

    // Small delay to show 100%
    tokio::time::sleep(std::time::Duration::from_millis(500)).await;

    // 3. Switch windows
    main.show().map_err(|e| e.to_string())?;
    splash.close().map_err(|e| e.to_string())?;

    Ok(())
}
