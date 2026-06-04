
// List the contents of a directory.
#[tauri::command]
pub async fn list_directory(
    connection_id: String,
    path: String,
) -> Result<Vec<String>, String> {
    dbg!(connection_id, &path);
    Ok(vec![])
}

// Create a directory.
#[tauri::command]
pub async fn create_directory(
    connection_id: String,
    path: String,
) -> Result<(), String> {
    dbg!(connection_id, &path);
    Ok(())
}

// Delete a directory.
#[tauri::command]
pub async fn delete_directory(
    connection_id: String,
    path: String,
) -> Result<(), String> {
    dbg!(connection_id, &path);
    Ok(())
}