use crate::types;

use anyhow::{Error as E, Result};

use candle_transformers::models::gemma3::{Config, Model };

use candle_core::{DType, Device, Tensor};
use crate::ai::token_output_stream::TokenOutputStream;
use candle_nn::VarBuilder;
use candle_transformers::generation::LogitsProcessor;
use tokenizers::Tokenizer;



struct TextGeneration {
    model: Model,
    device: Device,
    tokenizer: TokenOutputStream,
    logits_processor: LogitsProcessor,
    repeat_penalty: f32,
    repeat_last_n: usize,
}

impl TextGeneration {
    #[allow(clippy::too_many_arguments)]
    fn new(
        model: Model,
        tokenizer: Tokenizer,
        seed: u64,
        temp: Option<f64>,
        top_p: Option<f64>,
        repeat_penalty: f32,
        repeat_last_n: usize,
        device: &Device,
    ) -> Self {
        let logits_processor = LogitsProcessor::new(seed, temp, top_p);
        Self {
            model,
            tokenizer: TokenOutputStream::new(tokenizer),
            logits_processor,
            repeat_penalty,
            repeat_last_n,
            device: device.clone(),
        }
    }

    fn run(&mut self, prompt: &str, sample_len: usize) -> Result<String> {
        self.tokenizer.clear();
        let mut tokens = self
            .tokenizer
            .tokenizer()
            .encode(prompt, true)
            .map_err(E::msg)?
            .get_ids()
            .to_vec();

        let mut generated_text = String::new();
        let mut generated_tokens = 0usize;
        let eos_token = match self.tokenizer.get_token("<eos>") {
            Some(token) => token,
            None => anyhow::bail!("cannot find the <eos> token"),
        };

        let eot_token = match self.tokenizer.get_token("<end_of_turn>") {
            Some(token) => token,
            None => eos_token,
        };

        for index in 0..sample_len {
            let context_size = if index > 0 { 1 } else { tokens.len() };
            let start_pos = tokens.len().saturating_sub(context_size);
            let ctxt = &tokens[start_pos..];
            let input = Tensor::new(ctxt, &self.device)?.unsqueeze(0)?;
            let logits = self.model.forward(&input, start_pos)?;
            let logits = logits.squeeze(0)?.squeeze(0)?.to_dtype(DType::F32)?;
            let logits = if self.repeat_penalty == 1. {
                logits
            } else {
                let start_at = tokens.len().saturating_sub(self.repeat_last_n);
                candle_transformers::utils::apply_repeat_penalty(
                    &logits,
                    self.repeat_penalty,
                    &tokens[start_at..],
                )?
            };

            let next_token = self.logits_processor.sample(&logits)?;
            tokens.push(next_token);
            generated_tokens += 1;
            if next_token == eos_token || next_token == eot_token {
                break;
            }
            if let Some(t) = self.tokenizer.next_token(next_token)? {
                generated_text.push_str(&t);
            }
        }
        if let Some(rest) = self.tokenizer.decode_rest().map_err(E::msg)? {
            generated_text.push_str(&rest);
        }
        println!("Generated tokens: {}", generated_tokens);
        Ok(generated_text)
    }
}

fn get_device() -> Result<Device> {

    if candle_core::utils::cuda_is_available() {
        Ok(Device::new_cuda(0)?)
    } else if candle_core::utils::metal_is_available() {
        Ok(Device::new_metal(0)?)
    } else {
        Ok(Device::Cpu)
    }
}
fn format_prompt(messages: &[types::ChatMessage]) -> String {
    let mut prompt = String::new();
    for msg in messages {
        let role = if msg.role == "assistant" {
            "model"
        } else {
            &msg.role
        };
        prompt.push_str(&format!(
            "<start_of_turn>{}\n{}<end_of_turn>\n",
            role, msg.content
        ));
    }
    prompt.push_str("<start_of_turn>model\n");
    prompt
}

pub fn generate(messages: Vec<types::ChatMessage>, model_path: String) -> Result<String, String> {

    let tokenizer_filename = model_path.clone() + "/tokenizer.json";
    let config_filename = model_path.clone() + "/config.json";

    let filenames = model_path.clone() + "/model.safetensors";

    let tokenizer = Tokenizer::from_file(tokenizer_filename).map_err(|e| e.to_string())?;
    let device = get_device().map_err(|e| e.to_string())?;
    let dtype = if device.is_cuda() {
        DType::BF16
    } else {
        DType::F32
    };

    let vb = unsafe {
        VarBuilder::from_mmaped_safetensors(&[filenames], dtype, &device).map_err(|e| e.to_string())?
    };

    let config: Config = serde_json::from_reader(std::fs::File::open(config_filename)
    .map_err(|e| e.to_string())?,)
    .map_err(|e| e.to_string())?;

    let model = Model::new(false, &config, vb).map_err(|e| e.to_string())?;

    let mut pipeline = TextGeneration::new(
        model,
        tokenizer,
        299792458, // seed
        Some(0.7), // temp
        None,      // top_p
        1.1,       // repeat_penalty
        64,        // repeat_last_n
        &device,
    );
    let prompt = format_prompt(&messages);
    pipeline.run(&prompt, 10000).map_err(|e| e.to_string())

}
