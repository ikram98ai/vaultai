use crate::types;
use sysinfo::System;


#[tauri::command]
pub fn get_system_tier() -> types::SystemTier {
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

    let (default_model, supported_models) = get_models_for_tier(&tier);

    types::SystemTier {
        tier,
        default_model,
        supported_models,
    }
}

fn get_models_for_tier(tier: &str) -> (String, Vec<types::ModelInfo>) {
    match tier {
        "lite" => (
            "llama-3.2-3b".to_string(),
            vec![
                types::ModelInfo {
                    id: "mistral-nemo-12b".to_string(),
                    name: "Mistral Nemo 12B".to_string(),
                    description: "Smart, fast conversations on any topic - rivals GPT-4".to_string(),
                },
                types::ModelInfo {
                    id: "llama-3.2-3b".to_string(),
                    name: "Llama 3.2 3B".to_string(),
                    description: "Swift, responsive, creative - perfect for writing".to_string(),
                },
                types::ModelInfo {
                    id: "devstral-small".to_string(),
                    name: "Devstral-Small-2505-Q4_K_M".to_string(),
                    description: "Efficient coding assistance tailored to developers".to_string(),
                },
                types::ModelInfo {
                    id: "flux-schnell".to_string(),
                    name: "FLUX.1-schnell".to_string(),
                    description: "Generate professional-grade visuals in seconds".to_string(),
                },
            ],
        ),
        "pro" => (
            "gemma3-4b".to_string(),
            vec![
                types::ModelInfo {
                    id: "gemma3-4b".to_string(),
                    name: "Gemma3:4B".to_string(),
                    description: "Lightweight and efficient reasoning model".to_string(),
                },
                types::ModelInfo {
                    id: "llama3-8b".to_string(),
                    name: "LLaMA3 8-13B".to_string(),
                    description: "High performance general purpose models".to_string(),
                },
                types::ModelInfo {
                    id: "gpt-oss-20b".to_string(),
                    name: "GPT-OSS:20B".to_string(),
                    description: "Advanced open-source intelligence".to_string(),
                },
                types::ModelInfo {
                    id: "deepseek-coder".to_string(),
                    name: "DeepSeek Coder".to_string(),
                    description: "Advanced coding assistance".to_string(),
                },
                types::ModelInfo {
                    id: "codellama-34b".to_string(),
                    name: "Codellama-34B".to_string(),
                    description: "Powerful coding model for complex tasks".to_string(),
                },
            ],
        ),
        "multi-user" => (
            "gpt-oss-20b".to_string(),
            vec![
                types::ModelInfo {
                    id: "gpt-oss-20b".to_string(),
                    name: "GPT-OSS:20B".to_string(),
                    description: "Advanced open-source intelligence".to_string(),
                },
                types::ModelInfo {
                    id: "gemma3-12b".to_string(),
                    name: "Gemma3:12B".to_string(),
                    description: "Advanced reasoning for multiple users".to_string(),
                },
                types::ModelInfo {
                    id: "deepseek-coder-33b".to_string(),
                    name: "DeepSeek Coder-33B".to_string(),
                    description: "High-capacity coding model".to_string(),
                },
                types::ModelInfo {
                    id: "vaultai16-code".to_string(),
                    name: "VaultAI16-Code".to_string(),
                    description: "Optimized enterprise coding model".to_string(),
                },
            ],
        ),
        "ultra" => (
            "gpt-oss-20b".to_string(),
            vec![
                types::ModelInfo {
                    id: "gpt-oss-20b".to_string(),
                    name: "GPT-OSS:20B".to_string(),
                    description: "Advanced open-source intelligence".to_string(),
                },
                types::ModelInfo {
                    id: "deepseek-llm-67b".to_string(),
                    name: "DeepSeek LLM-67B".to_string(),
                    description: "Massive scale reasoning and knowledge".to_string(),
                },
                types::ModelInfo {
                    id: "gemma3-27b".to_string(),
                    name: "Gemma3:27B".to_string(),
                    description: "Top-tier performance for complex tasks".to_string(),
                },
                types::ModelInfo {
                    id: "deepseek-coder-33b-ent".to_string(),
                    name: "Enterprise Code Models".to_string(),
                    description: "Including DeepSeek Coder-33B".to_string(),
                },
            ],
        ),
        "max" => (
            "gpt-oss-120b".to_string(),
            vec![
                types::ModelInfo {
                    id: "gpt-oss-120b".to_string(),
                    name: "GPT-OSS:120B".to_string(),
                    description: "Surpasses GPT-4 capabilities".to_string(),
                },
                types::ModelInfo {
                    id: "mixtral-8x22b".to_string(),
                    name: "Mixtral-8x22B".to_string(),
                    description: "Multi-expert system for complex reasoning".to_string(),
                },
                types::ModelInfo {
                    id: "deepseek-r1-32b".to_string(),
                    name: "DeepSeek R1-32B".to_string(),
                    description: "Advanced reasoning and analysis".to_string(),
                },
                types::ModelInfo {
                    id: "simultaneous-models".to_string(),
                    name: "Multi-Model Execution".to_string(),
                    description: "Multiple models running simultaneously".to_string(),
                },
                types::ModelInfo {
                    id: "deepseek-coder-33b-max".to_string(),
                    name: "DeepSeek Coder-33B".to_string(),
                    description: "Enterprise development".to_string(),
                },
                types::ModelInfo {
                    id: "codellama-34b-max".to_string(),
                    name: "Codellama-34B".to_string(),
                    description: "Full-stack capabilities".to_string(),
                },
                types::ModelInfo {
                    id: "flux-creative".to_string(),
                    name: "FLUX bf16/fp16".to_string(),
                    description: "4K+ image generation*".to_string(),
                },
                types::ModelInfo {
                    id: "seedance-1080p".to_string(),
                    name: "Seedance 1080p".to_string(),
                    description: "Video generation*".to_string(),
                },
                types::ModelInfo {
                    id: "hunyuan-avatar".to_string(),
                    name: "HunyuanVideo-Avatar".to_string(),
                    description: "Avatar creation".to_string(),
                },
                types::ModelInfo {
                    id: "medgemma-9b".to_string(),
                    name: "MedGemma-9B".to_string(),
                    description: "Medical analysis*".to_string(),
                },
                types::ModelInfo {
                    id: "qwen2.5-vl-7b".to_string(),
                    name: "Qwen2.5-VL-7B".to_string(),
                    description: "Vision language understanding".to_string(),
                },

            ],
        ),
        _ => (
            "mistral-nemo-12b".to_string(),
            vec![]
        )
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
