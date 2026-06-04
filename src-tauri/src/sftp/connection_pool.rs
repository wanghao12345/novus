use std::sync::Arc;

use dashmap::DashMap;
use once_cell::sync::Lazy;
use serde::Serialize;
use ssh2::{Session, Sftp};



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
