use serde::{Deserialize, Serialize};


#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ConnectionConfig {
    pub session_name: String,
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: Option<String>,
    pub private_key_path: Option<String>,
    pub passphrase: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileItem {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    pub size: Option<u64>,
    pub modified: Option<u64>, // Unix timestamp
    pub permissions: Option<u32>,
}
