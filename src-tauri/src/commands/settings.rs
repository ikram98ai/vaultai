use crate::types;
use sysinfo::System;


#[tauri::command]
pub fn get_system_tier() -> types::SystemTier {
    types::SystemTier {
        tier: "lite".to_string(),
        recommended_models: types::RecommendedModels {
            default: "vaultai16-code".to_string(),
        },
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
