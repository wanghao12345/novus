use std::{sync::Arc, time::Duration};

use dashmap::DashMap;
use once_cell::sync::Lazy;
use serde::Serialize;
use ssh2::{Session, Sftp};
use tauri::{AppHandle, Emitter};
use tokio::time::interval;



#[derive(Serialize, Clone)]
pub struct ConnectionMeta {
    pub id: String,
    pub host: String,
    pub username: String,
    pub session_name: String,
}

pub struct SftpSession {
    pub meta: ConnectionMeta,
    pub session: Session,
    pub sftp: Sftp,
}

pub static CONNECTION_POOL: Lazy<DashMap<String, Arc<SftpSession>>> = Lazy::new(DashMap::new);

pub fn start_heartbeat_task(app_handle: AppHandle) {
    tokio::spawn(async move {
        let mut ticker = interval(Duration::from_secs(30));

        loop {
            ticker.tick().await;

            let dead_connections: Vec<String> = CONNECTION_POOL
            .iter()
            .filter_map(|entry| {
                let conn_id = entry.key().clone();
                let conn = entry.value().clone();
                if conn.session.keepalive_send().is_err() {
                    Some(conn_id)
                } else {
                    None
                }
            }).collect();

            if !dead_connections.is_empty() {
                for conn_id in &dead_connections {
                    CONNECTION_POOL.remove(conn_id);
                    let _ = app_handle.emit("connection_dead", conn_id);
                }
            }

        }
    });
}
