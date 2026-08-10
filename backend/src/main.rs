mod claude;
mod config;
mod error;
mod events;
mod ics;
mod models;
mod recipe_import;
mod routes;
mod shopping;
mod state;

use std::time::Duration;

use axum::Router;
use axum::http::{HeaderValue, header};
use tower_http::compression::CompressionLayer;
use tower_http::services::{ServeDir, ServeFile};
use tower_http::set_header::SetResponseHeaderLayer;
use tower_http::trace::TraceLayer;

use crate::config::Config;
use crate::state::AppState;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    // The container healthcheck runs the same binary rather than shipping curl
    // into the runtime image just to make one local request.
    if std::env::args().any(|arg| arg == "--healthcheck") {
        return healthcheck().await;
    }

    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "family_hub_server=info,tower_http=warn".into()),
        )
        .init();

    let config = Config::from_env()?;
    let addr = config.addr;
    let static_dir = config.static_dir.clone();
    let ics_interval = config.ics_sync_interval;
    let members_seed = config.members_seed.clone();

    tracing::info!(%addr, "starting family hub");

    let state = AppState::connect(config).await?;
    routes::members::ensure_seeded(&state.db, &members_seed).await?;

    spawn_calendar_sync(state.clone(), ics_interval);

    // Anything that isn't /api is the single-page app. Unknown paths fall back
    // to index.html so the kiosk can be locked to /hub and deep links work.
    let index = static_dir.join("index.html");
    let spa = ServeDir::new(&static_dir).fallback(ServeFile::new(index));

    // The companion has its own HTML entry point, served here rather than left
    // to the SPA fallback. Both pages run the same bundle; what differs is the
    // head, and it has to be the head Safari parses on first load — Add to Home
    // Screen pins the manifest's start_url, so a /phone that arrived as
    // index.html pins the kitchen display instead of the companion.
    let phone = static_dir.join("phone.html");

    let app = Router::new()
        .nest("/api", routes::api_router())
        .route_service("/phone", ServeFile::new(&phone))
        .route_service("/phone/{*rest}", ServeFile::new(&phone))
        .fallback_service(spa)
        .layer(TraceLayer::new_for_http())
        .layer(CompressionLayer::new())
        // The hub is reachable only over Tailscale, but a stray referrer or a
        // framed page is still worth closing off.
        .layer(SetResponseHeaderLayer::if_not_present(
            header::REFERRER_POLICY,
            HeaderValue::from_static("same-origin"),
        ))
        .layer(SetResponseHeaderLayer::if_not_present(
            header::X_CONTENT_TYPE_OPTIONS,
            HeaderValue::from_static("nosniff"),
        ))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    tracing::info!(%addr, "listening");

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

/// Ask the running server whether it is healthy, and exit accordingly.
///
/// Always talks to loopback: this runs inside the container, where the listener
/// may be bound to 0.0.0.0 but is reachable at 127.0.0.1 either way.
async fn healthcheck() -> anyhow::Result<()> {
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".into());
    let url = format!("http://127.0.0.1:{port}/api/health");

    let healthy = tokio::time::timeout(Duration::from_secs(4), reqwest::get(&url))
        .await
        .ok()
        .and_then(|result| result.ok())
        .is_some_and(|response| response.status().is_success());

    if healthy {
        Ok(())
    } else {
        // A non-zero exit is the whole contract with Docker; the message is for
        // whoever reads `docker inspect`.
        eprintln!("family hub is not healthy at {url}");
        std::process::exit(1);
    }
}

/// Poll subscribed ICS calendars on an interval.
///
/// Runs one sync at startup so a hub that has been off overnight is current
/// before anyone looks at it, then settles into the configured cadence.
fn spawn_calendar_sync(state: AppState, interval: Duration) {
    tokio::spawn(async move {
        let mut ticker = tokio::time::interval(interval);
        loop {
            ticker.tick().await;
            match ics::sync_all(&state.db, &state.http).await {
                Ok(0) => {}
                Ok(count) => {
                    tracing::info!(count, "synced calendar feeds");
                    state.bus.publish(events::Topic::Calendar);
                }
                Err(err) => tracing::warn!(error = %err, "calendar sync failed"),
            }
        }
    });
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to listen for ctrl-c");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("failed to listen for SIGTERM")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    tracing::info!("shutting down");
}
