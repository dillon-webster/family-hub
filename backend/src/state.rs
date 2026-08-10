use std::sync::Arc;
use std::time::Duration;

use sqlx::PgPool;
use sqlx::postgres::PgPoolOptions;

use crate::config::Config;
use crate::events::Bus;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub bus: Bus,
    pub config: Arc<Config>,
    /// Shared outbound client for recipe imports, the Claude API and ICS
    /// fetches, so connection pools and DNS results are reused.
    pub http: reqwest::Client,
}

impl AppState {
    pub async fn connect(config: Config) -> anyhow::Result<Self> {
        let db = PgPoolOptions::new()
            // A household hub with two surfaces; a large pool would only make
            // Postgres hold more idle connections.
            .max_connections(8)
            .acquire_timeout(Duration::from_secs(10))
            .connect(&config.database_url)
            .await?;

        sqlx::migrate!("./migrations").run(&db).await?;

        let http = reqwest::Client::builder()
            .timeout(Duration::from_secs(30))
            // Some recipe sites serve a stub to unknown agents. Identify as a
            // normal browser so the JSON-LD block is actually in the response.
            .user_agent(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 \
                 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 FamilyHub/1.0",
            )
            .build()?;

        Ok(Self {
            db,
            bus: Bus::new(),
            config: Arc::new(config),
            http,
        })
    }
}
