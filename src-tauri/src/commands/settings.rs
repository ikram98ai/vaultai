use crate::types;
use sysinfo::System;
use std::fs;
use std::path::{PathBuf};
use crate::types::ModelInfo;
use tauri::Manager;



pub fn format_size(size: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;

    if size >= GB {
        format!("{:.2} GB", size as f64 / GB as f64)
    } else if size >= MB {
        format!("{:.2} MB", size as f64 / MB as f64)
    } else if size >= KB {
        format!("{:.2} KB", size as f64 / KB as f64)
    } else {
        format!("{} B", size)
    }
}

pub fn get_available_models(models_path: &PathBuf) -> Vec<ModelInfo> {
    let mut models = Vec::new();
    

    // read dir recursively to look for model in models and models/image dir for .llamafiles
    if let Ok(entries) = fs::read_dir(&models_path) {
        for entry in entries.flatten() {

            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file(){
                    let file_path = entry.path();
                    let file_name = entry.file_name().to_string_lossy().to_string();
                    let display_name = file_name.split(".llamafile").next().unwrap_or(&file_name).to_string();
                    let model_path = models_path.join(file_path).to_string_lossy().to_string();
                    
                    models.push(ModelInfo {
                        name: display_name,
                        model_path,
                        size: format_size(metadata.len()),
                    });
                }
            }
        }
    }
    models
}


#[tauri::command]
pub fn get_system_tier(app: tauri::AppHandle) -> types::SystemTier {
    let mut system = System::new_all();
    system.refresh_memory();
    
    let total_memory = system.total_memory(); // in bytes
    let total_gb = total_memory as f64 / (1024.0 * 1024.0 * 1024.0);

    let tier = if total_gb <= 16.0 {
        "lite".to_string()
    } else if total_gb <= 32.0 {
        "pro".to_string()
    } else if total_gb <= 64.0 {
        "multi-user".to_string()
    } else if total_gb <= 128.0 {
        "ultra".to_string()
    } else {
        "max".to_string()
    };

    // Try to get models from the app resource directory
    let models_path = app.path()
        .resolve("../models", tauri::path::BaseDirectory::Resource)
        .unwrap_or_else(|_| {
            let mut path = std::env::current_dir().unwrap_or_default();
            path.push("../models");
            path
        });
 
    
    // Get available models from directory
    let available_models = get_available_models(&models_path);
    
    // Use first available model as default, fallback to hardcoded default
    let default_model = available_models.first()
        .map(|m| m.model_path.clone())
        .unwrap_or_else(|| "../models/llama3.2-1b.llamafile".to_string());

    types::SystemTier {
        tier,
        default_model,
        available_models,
    }
}

#[tauri::command]
pub fn get_memory_usage() -> types::MemoryUsage {
    let mut system = System::new_all();
    system.refresh_memory();

    types::MemoryUsage {
        used: system.used_memory(),
        total: system.total_memory(),
        percentage: (system.used_memory() as f64 / system.total_memory() as f64) * 100.0,
    }
}
