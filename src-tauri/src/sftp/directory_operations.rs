use crate::sftp::connection_pool::CONNECTION_POOL;

// List the contents of a directory.
#[tauri::command]
pub async fn list_directory(connection_id: String, path: String) -> Result<Vec<String>, String> {
    let conn = match CONNECTION_POOL.get(&connection_id) {
        Some(session) => session,
        None => return Err("Connection not found".to_string()),
    };
    match conn.sftp.readdir(&path) {
        Ok(entries) => {
            for (path, metadata) in entries {
                println!(
                    "文件: {:?}, 大小: {:?}, 权限: {:?}",
                    path.file_name().unwrap_or_default(),
                    metadata.size,
                    metadata.perm
                )
            }
        }
        Err(e) => return Err(format!("Failed to read directory: {}", e)),
    }

    Ok(vec![])
}

// Create a directory.
#[tauri::command]
pub async fn create_directory(connection_id: String, path: String) -> Result<(), String> {
    dbg!(connection_id, &path);
    Ok(())
}

// Delete a directory.
#[tauri::command]
pub async fn delete_directory(connection_id: String, path: String) -> Result<(), String> {
    dbg!(connection_id, &path);
    Ok(())
}
