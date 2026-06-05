use std::path::Path;

use crate::{sftp::connection_pool::CONNECTION_POOL, types::FileItem};

// List the contents of a directory.
#[tauri::command]
pub async fn list_directory(connection_id: String, path: String) -> Result<Vec<FileItem>, String> {
    let conn = match CONNECTION_POOL.get(&connection_id) {
        Some(session) => session,
        None => return Err("Connection not found".to_string()),
    };
    let files =match conn.sftp.readdir(&path) {
        Ok(entries) => {
            let mut files = Vec::new();
            for (path, metadata) in entries {
                files.push(FileItem {
                    name: path.file_name().unwrap_or_default().to_string_lossy().to_string(),
                    path: path.to_string_lossy().to_string(),
                    is_directory: metadata.is_dir(),
                    size: metadata.size,
                    modified: metadata.mtime,
                    permissions: metadata.perm,
                });
            }
            files
        }
        Err(e) => return Err(format!("Failed to read directory: {}", e)),
    };

    Ok(files)
}

// Create a directory.
#[tauri::command]
pub async fn create_directory(connection_id: String, path: String) -> Result<(), String> {
    let conn = match CONNECTION_POOL.get(&connection_id) {
        Some(session) => session,
        None => return Err("Connection not found".to_string()),
    };
    conn.sftp.mkdir(Path::new(&path), 0o755).map_err(|e| format!("Failed to create directory: {}", e))?;
    Ok(())
}

// Delete a directory.
#[tauri::command]
pub async fn delete_directory(connection_id: String, path: String) -> Result<(), String> {
    let conn = match CONNECTION_POOL.get(&connection_id) {
        Some(session) => session,
        None => return Err("Connection not found".to_string()),
    };
    conn.sftp.rmdir(Path::new(&path)).map_err(|e| format!("Failed to delete directory: {}", e))?;
    Ok(())
}
