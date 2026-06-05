use std::{net::TcpStream, path::Path, sync::Arc};

use ssh2::Session;
use uuid::Uuid;

use crate::{
    sftp::connection_pool::{ConnectionMeta, SftpSession, CONNECTION_POOL},
    types::*,
};

#[tauri::command]
pub async fn connect_sftp(config: ConnectionConfig) -> Result<String, String> {
    dbg!(&config);
    // 1、Create TCP stream
    let tcp = TcpStream::connect(format!("{}:{}", config.host, config.port)).map_err(|e| {
        format!(
            "Failed to connect to {}: {}, {}",
            config.host, config.port, e
        )
    })?;

    // 2、Create SSH Session
    let mut session = Session::new().map_err(|e| format!("Failed to create SSH session: {}", e))?;
    session.set_tcp_stream(tcp);
    session
        .handshake()
        .map_err(|e| format!("Failed to handshake: {}", e))?;

    // 3、Authenticate or use default authentication
    if let Some(password) = &config.password {
        session
            .userauth_password(&config.username, &password)
            .map_err(|e| format!("Failed to auth password: {}", e))?;
    } else if let Some(private_key_path) = &config.private_key_path {
        session
            .userauth_pubkey_file(
                &config.username,
                None,
                Path::new(private_key_path),
                config.passphrase.as_deref(),
            )
            .map_err(|e| format!("Failed to auth pubkey file: {}", e))?;
    } else {
        return Err("No password or private key path provided".to_string());
    }

    if !session.authenticated() {
        return Err("Failed to authenticate".to_string());
    }
    // 4、Create SFTP session
    let sftp = session
        .sftp()
        .map_err(|e| format!("Failed to create SFTP session: {}", e))?;

    // 5、Create connection pool
    let connection_id = Uuid::new_v4().to_string();
    let meta = ConnectionMeta {
        id: connection_id.clone(),
        session_name: config.session_name.clone(),
        host: config.host.clone(),
        username: config.username.clone(),
    };
    let connection = Arc::new(SftpSession {
        meta: meta.clone(),
        session,
        sftp,
    });
    CONNECTION_POOL.insert(connection_id.clone(), connection);

    Ok(connection_id)
}

#[tauri::command]
pub async fn disconnect_sftp(connection_id: String) -> Result<(), String> {
    // 实现SFTP断开连接逻辑
    CONNECTION_POOL.remove(&connection_id);
    Ok(())
}
