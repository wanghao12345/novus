use tauri::Window;


// Upload a file.
#[tauri::command]
pub async fn upload_file(
    connection_id: String,
    local_path: String,
    remote_path: String,
    window: Window
) -> Result<(), String> {
    Ok(())
}

// Download a file.
#[tauri::command]
pub async fn download_file(
    connection_id: String,
    local_path: String,
    remote_path: String,
    window: Window
) -> Result<(), String> {
    Ok(())
}

// Delete a file or directory.
#[tauri::command]
pub async fn delete_item(
    connection_id: String,
    path: String,
    id_directory: bool,
    window: Window
) -> Result<(), String> {
    Ok(())
}

// Rename a file or directory.
#[tauri::command]
pub async fn rename_item(
    connection_id: String,
    old_path: String,
    new_path: String
) -> Result<(), String> {
    Ok(())
}

// Cancel a transfer.
#[tauri::command]
pub async fn cancel_transfer(
    connection_id: String,
    window: Window
) -> Result<(), String> {
    Ok(())
}
