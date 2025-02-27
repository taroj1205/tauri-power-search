use base64::{engine::general_purpose::STANDARD, Engine};
use std::env::temp_dir;
use std::fs::File;
use tokio::task;
use win_ocr::ocr;

#[tauri::command]
pub async fn extract_text_from_base64(base64_str: String, id: String) -> Result<String, String> {
    let handle = task::spawn_blocking(move || {
        // Decode the base64 string to bytes
        let image_data = match STANDARD.decode(base64_str) {
            Ok(data) => data,
            Err(e) => return Err(e.to_string()),
        };

        // Save directly to a temporary file
        let temp_path = temp_dir().join(format!("temp_image_{}.png", id));
        let file = File::create(&temp_path).map_err(|e| e.to_string())?;
        // Write the decoded data directly to file
        std::io::Write::write_all(&mut std::io::BufWriter::new(file), &image_data)
            .map_err(|e| e.to_string())?;

        // Perform OCR on the image
        let ocr_text = match ocr(temp_path.to_str().unwrap()) {
            Ok(text) => {
                if let Err(e) = std::fs::remove_file(&temp_path) {
                    eprintln!("Failed to remove temp file: {}", e);
                }
                text
            }
            Err(e) => return Err(e.to_string()),
        };

        Ok(ocr_text)
    });

    handle.await.map_err(|e| e.to_string())?
}
