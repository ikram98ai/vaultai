use crate::types;
use sysinfo::System;
use std::fs;
use std::path::{Path, PathBuf};
use crate::types::ModelInfo;
use tauri::Manager;
use anyhow::Result;


pub fn get_dir_size<P: AsRef<Path>>(path: P) -> Result<u64> {
    let mut size = 0;
    for entry in fs::read_dir(path)? {
        let entry = entry?;
        let metadata = entry.metadata()?;
        if metadata.is_dir() {
            size += get_dir_size(entry.path())?;
        } else {
            size += metadata.len();
        }
    }
    Ok(size)
}

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

pub fn get_available_models(app_handle: Option<&tauri::AppHandle>) -> Vec<ModelInfo> {
    let mut models = Vec::new();
    
    // Try to get models from the app resource directory
    let models_path = if let Some(app) = app_handle {
        app.path().resolve("_up_/models", tauri::path::BaseDirectory::Resource)
            .unwrap_or_else(|_| PathBuf::from("../models"))
    } else {
        PathBuf::from("../models")
    };
    
    if let Ok(entries) = fs::read_dir(&models_path) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_dir() {
                    let dir_path = entry.path();
                    let dir_name = entry.file_name();
                    let model_id = dir_name.to_string_lossy().to_string();
                    
                    let size = get_dir_size(&dir_path).unwrap_or(0);
                    
                    models.push(ModelInfo {
                        name: model_id.clone(),
                        model_path: models_path.join(&model_id).to_string_lossy().to_string(),
                        size: format_size(size),
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

    // Get available models from directory
    let available_models = get_available_models(Some(&app));
    
    // Use first available model as default, fallback to hardcoded default
    let default_model = available_models.first()
        .map(|m| m.model_path.clone())
        .unwrap_or_else(|| "gemma-3-270m-it".to_string());

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
