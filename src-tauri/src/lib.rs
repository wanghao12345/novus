
mod command;
mod types;
mod sftp;

use sftp::*;

use crate::sftp::connection_pool::start_heartbeat_task;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_handle = app.handle().clone();
            start_heartbeat_task(app_handle);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            connect_sftp,
            disconnect_sftp,
            list_directory,
            create_directory,
            delete_directory,
            upload_file,
            download_file,
            copy_item,
            move_item,
            cancel_transfer,
            get_active_transfers,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
