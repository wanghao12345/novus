use std::{fs::File, path::Path};

use tauri::Window;

use crate::sftp::connection_pool::CONNECTION_POOL;

// Upload a file.
#[tauri::command]
pub async fn upload_file(
    connection_id: String,
    local_path: String,
    remote_path: String,
    window: Window,
) -> Result<(), String> {
    let conn = match CONNECTION_POOL.get(&connection_id) {
        Some(session) => session,
        None => return Err("Connection not found".to_string()),
    };

    let conn = conn.clone();
    let local_path_clone = local_path.clone();
    let remote_path_clone = remote_path.clone();

    let result = tokio::task::spawn_blocking(move || {
        // Open the local file.
        let mut local_file = File::open(&local_path_clone).map_err(|e| format!("Error opening file: {}", e))?;
        // Create the remote file.
        let mut remote_file = conn.sftp.create(Path::new(&remote_path_clone)).map_err(|e| format!("Error creating remote file: {}", e))?;
        // Copy the file.
        std::io::copy(&mut local_file, &mut remote_file).map_err(|e| format!("Error copying file: {}", e))?;

        Ok(())
    }).await;

    match result {
        Ok(res) => res,
        Err(e) => Err(e.to_string()),
    }
}

// Download a file.
#[tauri::command]
pub async fn download_file(
    connection_id: String,
    local_path: String,
    remote_path: String,
    window: Window,
) -> Result<(), String> {
    Ok(())
}

// Delete a file or directory.
#[tauri::command]
pub async fn delete_item(
    connection_id: String,
    path: String,
    id_directory: bool,
    window: Window,
) -> Result<(), String> {
    Ok(())
}

// Rename a file or directory.
#[tauri::command]
pub async fn rename_item(
    connection_id: String,
    old_path: String,
    new_path: String,
) -> Result<(), String> {
    Ok(())
}

// Cancel a transfer.
#[tauri::command]
pub async fn cancel_transfer(transfer_id: String) -> Result<(), String> {
    Ok(())
}

// Get the active transfers.
#[tauri::command]
pub async fn get_active_transfers() -> Result<Vec<String>, String> {
    Ok(vec![])
}

// Copy a file or directory.
#[tauri::command]
pub async fn copy_item(
    connection_id: String,
    source_path: String,
    target_path: String,
    is_directory: bool,
    window: Window,
) -> Result<(), String> {
    Ok(())
}

// Move a file or directory.
#[tauri::command]
pub async fn move_item(
    connection_id: String,
    source_path: String,
    target_path: String,
) -> Result<(), String> {
    Ok(())
}
