use crate::LlamafileState;
use tauri_plugin_shell::ShellExt;

#[tauri::command]
pub async fn start_llamafile(
    app: tauri::AppHandle,
    state: tauri::State<'_, LlamafileState>,
    model_path: String,
) -> std::result::Result<bool, String> {
    // 1. Stop existing model if any
    let mut child_guard = state.child.lock().unwrap();
    if let Some(child) = child_guard.take() {
        let _ = child.kill();
    }    
    
    println!("Starting llamafile: {}", &model_path);

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        if let Ok(metadata) = std::fs::metadata(&model_path) {
            let mut perms = metadata.permissions();
            perms.set_mode(0o755);
            let _ = std::fs::set_permissions(&model_path, perms);
        }
    }

    let command = if cfg!(target_os = "linux") {
        app.shell().command("sh").arg(&model_path)
    } else {
        app.shell().command(&model_path)
    };
    
    match command.spawn() {
        Ok((_rx, child)) => {
            *child_guard = Some(child);
            let mut current_model = state.current_model.lock().unwrap();
            *current_model = Some(model_path);
            Ok(true)
        }
        Err(e) => Err(format!("Failed to spawn llamafile (check if it is in allowlist): {}", e)),
    }
}

#[tauri::command]
pub fn get_running_model(
    state: tauri::State<'_, LlamafileState>,
) -> Option<String> {
    state.current_model.lock().unwrap().clone()
}
