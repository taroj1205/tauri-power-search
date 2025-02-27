use base64::{engine::general_purpose::STANDARD, Engine as _};
use log;
use pdf_extract;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::Write;
use std::path::PathBuf;
use tauri::{command, Emitter, Window};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PdfPage {
    page_number: u32,
    text: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PdfProcessingResult {
    id: String,
    file_name: String,
    pages: Vec<PdfPage>,
    total_pages: u32,
    text: String,
}

#[derive(Debug, Serialize, Clone)]
struct ProgressEvent {
    id: String,
    stage: String,
    progress: f32,
    message: String,
}

#[derive(Debug, Serialize, Clone)]
struct PageExtractedEvent {
    id: String,
    page_number: u32,
    text: String,
    total_pages: u32,
    file_name: String,
}

#[command]
pub fn extract_pdf_text(
    window: Window,
    file_data: String,
    file_name: String,
) -> Result<PdfProcessingResult, String> {
    let id = Uuid::new_v4().to_string();

    // Emit initial progress
    emit_progress(
        &window,
        &id,
        "Decoding PDF data",
        0.0,
        "Starting PDF processing",
    );

    log::debug!("Processing PDF data for file: {}", file_name);

    // Remove data URL prefix if present
    let base64_data = if file_data.starts_with("data:application/pdf;base64,") {
        file_data.replace("data:application/pdf;base64,", "")
    } else {
        file_data
    };

    // Decode base64 data
    emit_progress(&window, &id, "Decoding", 0.2, "Decoding PDF data");
    let pdf_data = STANDARD
        .decode(base64_data)
        .map_err(|e| format!("Failed to decode base64 data: {}", e))?;

    // Create a temporary file
    emit_progress(
        &window,
        &id,
        "Creating temp file",
        0.4,
        "Preparing for text extraction",
    );
    // Create a temporary file path
    let temp_path: PathBuf = std::env::temp_dir().join(format!("pdf_{}.pdf", id));

    // Create and write to temporary file
    let mut temp_file =
        File::create(&temp_path).map_err(|e| format!("Failed to create temporary file: {}", e))?;

    temp_file
        .write_all(&pdf_data)
        .map_err(|e| format!("Failed to write PDF data: {}", e))?;

    // Extract text using the temporary file path
    let pages_text = pdf_extract::extract_text_by_pages(&temp_path)
        .map_err(|e| format!("Failed to extract PDF text: {}", e))?;

    // Clean up the temporary file
    if let Err(e) = std::fs::remove_file(&temp_path) {
        log::warn!("Failed to remove temporary file: {}", e);
    }

    let total_pages = pages_text.len() as u32;

    // Convert pages to PdfPage struct and emit events for each page
    emit_progress(
        &window,
        &id,
        "Processing pages",
        0.8,
        "Processing extracted text",
    );
    let pages: Vec<PdfPage> = pages_text
        .into_iter()
        .enumerate()
        .map(|(idx, text)| {
            let page_number = (idx + 1) as u32;

            // Emit event for this page
            let _ = window.emit(
                "pdf-page-extracted",
                PageExtractedEvent {
                    id: id.clone(),
                    page_number,
                    text: text.clone(),
                    total_pages,
                    file_name: file_name.clone(),
                },
            );

            PdfPage { page_number, text }
        })
        .collect();

    // Combine all page texts
    let full_text = pages
        .iter()
        .map(|page| page.text.clone())
        .collect::<Vec<String>>()
        .join("\n");

    // Emit completion progress
    emit_progress(&window, &id, "Complete", 1.0, "PDF processing complete");

    Ok(PdfProcessingResult {
        id,
        file_name,
        total_pages,
        pages,
        text: full_text,
    })
}

fn emit_progress(window: &Window, id: &str, stage: &str, progress: f32, message: &str) {
    let _ = window.emit(
        "pdf-progress",
        ProgressEvent {
            id: id.to_string(),
            stage: stage.to_string(),
            progress,
            message: message.to_string(),
        },
    );
    log::debug!("Progress {}: {} - {}", id, stage, message);
}
