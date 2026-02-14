use std::path::Path;
use anyhow::{Result, anyhow};
use dotext::{doc::OpenOfficeDoc, *};
use std::io::Read;
use calamine::{Reader, Xlsx, open_workbook, Data};
use csv::ReaderBuilder;

pub fn extract_text(path: &Path) -> Result<String> {
    let extension = path.extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("")
        .to_lowercase();

    let raw_text = match extension.as_str() {
        "pdf" => {
            pdf_extract::extract_text(path).map_err(|e| anyhow!("Failed to extract PDF: {}", e))?
        },
        "docx" => {
            let mut docx = Docx::open(path).map_err(|e| anyhow!("Failed to open DOCX: {}", e))?;
            let mut text = String::new();
            docx.read_to_string(&mut text).map_err(|e| anyhow!("Failed to read DOCX: {}", e))?;
            text
        },
        "odt" => {
            let mut odt = Odt::open(path).map_err(|e| anyhow!("Failed to open ODT: {}", e))?;
            let mut text = String::new();
            odt.read_to_string(&mut text).map_err(|e| anyhow!("Failed to read ODT: {}", e))?;
            text
        },
        "csv" => {
            extract_csv(path)?
        },
        "xlsx" => {
            extract_xlsx(path)?
        },
        "html" | "htm" => {
            let html = std::fs::read_to_string(path).map_err(|e| anyhow!("Failed to read HTML: {}", e))?;
            html2text::from_read(html.as_bytes(), 80)
        },
        "txt" | "md" | "json" => {
            std::fs::read_to_string(path).map_err(|e| anyhow!("Failed to read text file: {}", e))?
        },
        _ => return Err(anyhow!("Unsupported file extension: {}", extension)),
    };

    Ok(clean_extracted_text(&raw_text))
}

fn extract_csv(path: &Path) -> Result<String> {
    let mut reader = ReaderBuilder::new()
        .has_headers(true)
        .from_path(path)
        .map_err(|e| anyhow!("Failed to open CSV: {}", e))?;

    let headers = reader.headers()?.clone();
    let mut text = String::new();

    for result in reader.records() {
        let record = result.map_err(|e| anyhow!("Failed to read CSV record: {}", e))?;
        for (i, field) in record.iter().enumerate() {
            if let Some(header) = headers.get(i) {
                text.push_str(&format!("{}: {} ", header, field));
            } else {
                text.push_str(&format!("{} ", field));
            }
        }
        text.push('\n');
    }

    Ok(text)
}

fn extract_xlsx(path: &Path) -> Result<String> {
    let mut workbook: Xlsx<_> = open_workbook(path).map_err(|e| anyhow!("Failed to open Excel: {}", e))?;
    let mut text = String::new();

    // Iterate over all sheets
    let sheet_names = workbook.sheet_names().to_vec();
    for sheet_name in sheet_names {
        if let Ok(range) = workbook.worksheet_range(&sheet_name) {
            text.push_str(&format!("Sheet: {}\n", sheet_name));
            for row in range.rows() {
                for (i, cell) in row.iter().enumerate() {
                    let cell_text = match cell {
                        Data::Empty => "".to_string(),
                        Data::String(s) => s.clone(),
                        Data::Float(f) => f.to_string(),
                        Data::Int(i) => i.to_string(),
                        Data::Bool(b) => b.to_string(),
                        Data::DateTime(d) => d.to_string(),
                        Data::Error(e) => format!("Error({:?})", e),
                        Data::DateTimeIso(t) => t.clone(),
                        Data::DurationIso(t) => t.clone(),
                    };
                    text.push_str(&cell_text);
                    if i < row.len() - 1 {
                        text.push('\t');
                    }
                }
                text.push('\n');
            }
            text.push('\n');
        }
    }

    Ok(text)
}

fn clean_extracted_text(text: &str) -> String {
    let mut cleaned = String::new();
    let mut empty_line_count = 0;

    for line in text.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            empty_line_count += 1;
            if empty_line_count <= 1 {
                cleaned.push('\n');
            }
        } else {
            empty_line_count = 0;
            cleaned.push_str(trimmed);
            cleaned.push('\n');
        }
    }

    cleaned.trim().to_string()
}
