use axum::Json;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use serde_json::json;

/// Every fallible handler returns this. The `Display` text is what the client
/// sees, so it is written for a person standing at the kitchen counter rather
/// than for a log file.
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("{0}")]
    NotFound(&'static str),

    #[error("{0}")]
    BadRequest(String),

    #[error("{0}")]
    Upstream(String),

    #[error("Something went wrong on the hub.")]
    Internal(#[from] anyhow::Error),

    #[error("Something went wrong on the hub.")]
    Database(#[from] sqlx::Error),
}

impl AppError {
    fn status(&self) -> StatusCode {
        match self {
            AppError::NotFound(_) => StatusCode::NOT_FOUND,
            AppError::BadRequest(_) => StatusCode::BAD_REQUEST,
            // The caller asked for something reasonable; a recipe site or a
            // calendar feed let us down. 502 keeps that distinction visible.
            AppError::Upstream(_) => StatusCode::BAD_GATEWAY,
            AppError::Internal(_) | AppError::Database(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let status = self.status();

        // Internal failures get logged with their real cause; the client is only
        // told that something broke.
        match &self {
            AppError::Internal(err) => tracing::error!(error = ?err, "request failed"),
            AppError::Database(err) => tracing::error!(error = ?err, "database error"),
            AppError::Upstream(msg) => tracing::warn!(%msg, "upstream failure"),
            _ => {}
        }

        (status, Json(json!({ "error": self.to_string() }))).into_response()
    }
}

pub type AppResult<T> = Result<T, AppError>;
