use std::net::{IpAddr, SocketAddr};
use std::path::PathBuf;
use std::time::Duration;

/// Everything the process needs from the environment, read once at boot so a
/// misconfiguration fails immediately rather than on the first request.
#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub addr: SocketAddr,
    /// Directory holding the built Vite bundle. Served for every non-/api path.
    pub static_dir: PathBuf,
    /// Absent means the scan route is disabled and says so, rather than
    /// failing at the moment someone points the camera at a cookbook.
    pub anthropic_api_key: Option<String>,
    pub anthropic_model: String,
    /// `Name:#hex` pairs, used only when the members table is still empty.
    pub members_seed: String,
    pub ics_sync_interval: Duration,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        let database_url = std::env::var("DATABASE_URL")
            .map_err(|_| anyhow::anyhow!("DATABASE_URL must be set"))?;

        let host: IpAddr = std::env::var("BIND_HOST")
            .unwrap_or_else(|_| "0.0.0.0".into())
            .parse()?;
        let port: u16 = std::env::var("PORT")
            .unwrap_or_else(|_| "3000".into())
            .parse()?;

        let anthropic_api_key = std::env::var("ANTHROPIC_API_KEY")
            .ok()
            .filter(|k| !k.trim().is_empty());

        Ok(Self {
            database_url,
            addr: SocketAddr::new(host, port),
            static_dir: std::env::var("STATIC_DIR")
                .unwrap_or_else(|_| "./static".into())
                .into(),
            anthropic_api_key,
            anthropic_model: std::env::var("ANTHROPIC_MODEL")
                .unwrap_or_else(|_| "claude-opus-5".into()),
            members_seed: std::env::var("FAMILY_HUB_MEMBERS")
                .unwrap_or_else(|_| "Maya:#C8553D,Dan:#4F7CA0".into()),
            ics_sync_interval: Duration::from_secs(
                std::env::var("ICS_SYNC_INTERVAL_SECS")
                    .ok()
                    .and_then(|v| v.parse().ok())
                    .unwrap_or(900),
            ),
        })
    }
}
