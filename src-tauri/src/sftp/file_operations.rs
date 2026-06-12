use ssh2::Sftp;
use std::{
    fs::File,
    io::{Read, Write},
    path::Path,
};
use tauri::{Emitter, Window};

use crate::sftp::connection_pool::CONNECTION_POOL;

// Upload a file.
#[tauri::command]
pub async fn upload_file(
    connection_id: String,
    local_path: String,
    remote_path: String,
    transfer_id: String,
    window: Window,
) -> Result<(), String> {
    let conn = match CONNECTION_POOL.get(&connection_id) {
        Some(session) => session,
        None => return Err("Connection not found".to_string()),
    };

    const BUFFER_SIZE: usize = 8192; // 8KB buffer

    const LOCAL_READ_BUFFER_SIZE: usize = 65536;
    const SFTP_WRITE_BUFFER_SIZE: usize = 32768;

    let conn = conn.clone();
    let local_path_clone = local_path.clone();
    let remote_path_clone = remote_path.clone();
    let transfer_id_return = transfer_id.clone();

    let result = tokio::task::spawn_blocking(move || {
        // Open the local file.
        let mut local_file =
            File::open(&local_path_clone).map_err(|e| format!("Error opening file: {}", e))?;
        let total_size = local_file
            .metadata()
            .map_err(|e| format!("Error getting file metadata: {}", e))?
            .len();

        // Create the remote file.
        let mut remote_file = conn
            .sftp
            .create(Path::new(&remote_path_clone))
            .map_err(|e| format!("Error creating remote file: {}", e))?;
        // Copy the file.
        // std::io::copy(&mut local_file, &mut remote_file).map_err(|e| format!("Error copying file: {}", e))?;
        let mut local_buffer = [0u8; LOCAL_READ_BUFFER_SIZE];
        let mut sftp_buffer = Vec::with_capacity(SFTP_WRITE_BUFFER_SIZE);
        let mut transferred: u64 = 0;

        loop {
            // 1. Read from the local file.

            let bytes_read = local_file
                .read(&mut local_buffer)
                .map_err(|e| format!("Error reading from local file: {}", e))?;
            if bytes_read == 0 {
                break;
            }
            // 2. Write to the remote file.
            sftp_buffer.extend_from_slice(&local_buffer[..bytes_read]);
            // 3. Update the progress.
            if sftp_buffer.len() >= SFTP_WRITE_BUFFER_SIZE {
                remote_file
                    .write_all(&sftp_buffer[..])
                    .map_err(|e| format!("Error writing to remote file: {}", e))?;
                transferred += bytes_read as u64;
                sftp_buffer.clear();

                // upload progress
                let _ = window.emit(
                    "upload_progress",
                    serde_json::json!({
                        "connection_id": connection_id,
                        "path": remote_path,
                        "transferred": transferred,
                        "total": total_size,
                        "type": "upload",
                        "transfer_id": transfer_id_return
                    }),
                );
            }
        }

        // Write any remaining data in the buffer.
        if !sftp_buffer.is_empty() {
            remote_file
                .write_all(&sftp_buffer[..])
                .map_err(|e| format!("Error writing to remote file: {}", e))?;
            transferred += sftp_buffer.len() as u64;
        }

        Ok(())
    })
    .await;

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
pub async fn delete_item(connection_id: String, remote_path: String) -> Result<(), String> {
    let conn = match CONNECTION_POOL.get(&connection_id) {
        Some(session) => session,
        None => return Err("Connection not found".to_string()),
    };
    let path = Path::new(&remote_path);

    let metadata = conn
        .sftp
        .stat(path)
        .map_err(|e| format!("Error getting metadata: {}", e))?;
    let is_directory = metadata.is_dir();

    if is_directory {
        delete_directory(&conn.sftp, path)?;
    } else {
        conn.sftp
            .unlink(path)
            .map_err(|e| format!("Error deleting file: {}", e))?;
    }
    Ok(())
}

fn delete_directory(sftp: &Sftp, path: &Path) -> Result<(), String> {
    // 1. Read all the directory contents.
    let entries = sftp
        .readdir(path)
        .map_err(|e| format!("Error reading directory: {}", e))?;

    // 2. Delete each file or directory.
    for (entry_path, metadata) in entries {
        let is_directory = metadata.is_dir();
        if is_directory {
            delete_directory(sftp, &entry_path)?;
        } else {
            sftp.unlink(&entry_path)
                .map_err(|e| format!("Error deleting file: {}", e))?;
        }
    }
    // 3. Delete the directory.
    sftp.rmdir(path)
        .map_err(|e| format!("Error deleting directory: {}", e))?;

    Ok(())
}

// Rename a file or directory.
#[tauri::command]
pub async fn rename_item(
    connection_id: String,
    old_path: String,
    new_path: String,
) -> Result<(), String> {
    let conn = match CONNECTION_POOL.get(&connection_id) {
        Some(session) => session,
        None => return Err("Connection not found".to_string()),
    };
    conn.sftp
        .rename(Path::new(&old_path), Path::new(&new_path), None)
        .map_err(|e| format!("Error renaming file: {}", e))?;
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
