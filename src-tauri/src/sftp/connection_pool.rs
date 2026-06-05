use std::{sync::Arc, time::Duration};

use dashmap::DashMap;
use once_cell::sync::Lazy;
use serde::Serialize;
use ssh2::{Session, Sftp};
use tauri::AppHandle;
use tokio::time::interval;



#[derive(Serialize, Clone)]
pub struct ConnectionMeta {
    pub id: String,
    pub host: String,
    pub username: String,
    pub session_name: String,
}

pub struct ConnectionPool {
    pub meta: ConnectionMeta,
    pub session: Session,
    pub sftp: Sftp,
}

pub static CONNECTION_POOL: Lazy<DashMap<String, Arc<ConnectionPool>>> = Lazy::new(DashMap::new);

pub fn start_heartbeat_task(app_handle: AppHandle) {
    tokio::spawn(async move {
        let mut ticker = interval(Duration::from_secs(30));

        loop {
            ticker.tick().await;

            
        }
    });
}
