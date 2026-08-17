use axum::Json;
use axum::extract::State;
use base64::Engine;
use base64::engine::general_purpose::STANDARD;
use serde::{Deserialize, Serialize};

use crate::claude::{Claude, MAX_IMAGE_BYTES};
use crate::error::{AppError, AppResult};
use crate::models::RecipeDraft;
use crate::recipe_import;
use crate::state::AppState;

/// A parsed recipe, shown as a preview before anyone commits it to the library.
/// Nothing is written until the preview is saved.
#[derive(Debug, Serialize)]
pub struct ImportPreview {
    #[serde(flatten)]
    pub draft: RecipeDraft,
    /// How it was read, so the sheet can say "Recipe found" versus
    /// "Read from the page text" and set expectations accordingly.
    pub method: &'static str,
}

#[derive(Debug, Deserialize)]
pub struct LinkInput {
    pub url: String,
}

/// The household's category names, for the schema the model's reply is
/// constrained to. Read per request rather than cached: adding a category and
/// immediately scanning a recipe into it is a completely reasonable thing to
/// do, and this is one small query against a table with a handful of rows.
async fn category_names(state: &AppState) -> AppResult<Vec<String>> {
    Ok(super::categories::load_all(&state.db)
        .await?
        .into_iter()
        .map(|category| category.name)
        .collect())
}

/// Read a recipe from a link.
///
/// Structured data first: when a site publishes schema.org/Recipe the result is
/// exact, free, and instant. The model is only asked about pages that don't.
pub async fn from_link(
    State(state): State<AppState>,
    Json(input): Json<LinkInput>,
) -> AppResult<Json<ImportPreview>> {
    let url = input.url.trim();
    if !(url.starts_with("http://") || url.starts_with("https://")) {
        return Err(AppError::BadRequest(
            "That does not look like a link.".into(),
        ));
    }

    let html = recipe_import::fetch(&state.http, url)
        .await
        .map_err(|e| AppError::Upstream(e.to_string()))?;

    match recipe_import::from_json_ld(&html, url) {
        Ok(draft) => {
            return Ok(Json(ImportPreview {
                draft,
                method: "structured",
            }));
        }
        Err(err) => tracing::debug!(%url, error = %err, "no structured recipe data, trying Claude"),
    }

    let Some(api_key) = state.config.anthropic_api_key.as_deref() else {
        return Err(AppError::BadRequest(
            "That page doesn't publish its recipe in a readable format, and \
             scanning is not set up on this hub. Try typing it in."
                .into(),
        ));
    };

    let text = recipe_import::readable_text(&html);
    if text.len() < 200 {
        return Err(AppError::Upstream(
            "There was nothing readable on that page.".into(),
        ));
    }

    let mut draft = Claude {
        http: &state.http,
        api_key,
        model: &state.config.anthropic_model,
    }
    .read_text(&text, url, &category_names(&state).await?)
    .await
    .map_err(|e| AppError::Upstream(e.to_string()))?;

    draft.source_url = Some(url.to_string());

    Ok(Json(ImportPreview {
        draft,
        method: "read",
    }))
}

/// The most photographs one recipe may be spread over. Front and back of a card
/// is two; a long recipe across a spread is four. Past that it is a cookbook
/// chapter, and the request gets expensive enough to be worth refusing.
const MAX_PAGES: usize = 4;

#[derive(Debug, Deserialize)]
pub struct ScanInput {
    /// One page. Kept alongside `images` because the phone is installed to a
    /// home screen and can be running a cached bundle from before multi-page
    /// scanning existed; that client still posts a bare `image`.
    #[serde(default)]
    pub image: Option<String>,
    /// The pages of one recipe, in reading order.
    #[serde(default)]
    pub images: Option<Vec<String>>,
    #[serde(default)]
    pub media_type: Option<String>,
}

/// Split a `data:` URL into its media type and payload, falling back to the
/// caller's declared type for a bare base64 string.
///
/// Pulled out of the handler so the parsing has a test: a client that sends a
/// full data URL and one that sends raw base64 must land in the same place.
fn split_data_url(raw: &str, fallback: Option<&str>) -> AppResult<(String, String)> {
    match raw.strip_prefix("data:") {
        Some(rest) => {
            let (meta, data) = rest
                .split_once(',')
                .ok_or_else(|| AppError::BadRequest("That image could not be read.".into()))?;
            let media = meta.split(';').next().unwrap_or("image/jpeg").to_string();
            Ok((media, data.to_string()))
        }
        None => Ok((
            fallback.unwrap_or("image/jpeg").to_string(),
            raw.to_string(),
        )),
    }
}

/// Read a recipe from a photo of a cookbook page.
pub async fn from_scan(
    State(state): State<AppState>,
    Json(input): Json<ScanInput>,
) -> AppResult<Json<ImportPreview>> {
    let Some(api_key) = state.config.anthropic_api_key.as_deref() else {
        return Err(AppError::BadRequest(
            "Scanning needs an Anthropic API key. Add ANTHROPIC_API_KEY to the \
             hub's environment and restart it."
                .into(),
        ));
    };

    // `images` wins when both are present; `image` is the older client's shape.
    let raw_pages: Vec<String> = match (input.images, input.image) {
        (Some(pages), _) if !pages.is_empty() => pages,
        (_, Some(single)) => vec![single],
        _ => {
            return Err(AppError::BadRequest(
                "There was no photo to read.".into(),
            ));
        }
    };

    if raw_pages.len() > MAX_PAGES {
        return Err(AppError::BadRequest(format!(
            "That is {} photos. A recipe can be read from at most {MAX_PAGES}.",
            raw_pages.len()
        )));
    }

    let mut pages: Vec<(String, String)> = Vec::with_capacity(raw_pages.len());

    for (index, raw) in raw_pages.iter().enumerate() {
        // Which page failed, because "that image could not be read" is no help
        // when you have just photographed both sides of a card.
        let where_ = |message: &str| -> AppError {
            if raw_pages.len() == 1 {
                AppError::BadRequest(message.to_string())
            } else {
                AppError::BadRequest(format!("Page {}: {message}", index + 1))
            }
        };

        let (media_type, payload) = split_data_url(raw, input.media_type.as_deref())
            .map_err(|_| where_("That image could not be read."))?;

        if !matches!(
            media_type.as_str(),
            "image/jpeg" | "image/png" | "image/gif" | "image/webp"
        ) {
            return Err(where_("That image format is not supported."));
        }

        // Validate the payload here rather than paying for a round trip to find
        // out the client sent something unusable.
        let decoded = STANDARD
            .decode(payload.as_bytes())
            .map_err(|_| where_("That image could not be read."))?;

        if decoded.is_empty() {
            return Err(where_("That image is empty."));
        }
        if decoded.len() > MAX_IMAGE_BYTES {
            return Err(where_(
                "That photo is too large. Try again — the camera will send a smaller one.",
            ));
        }

        pages.push((payload, media_type));
    }

    let draft = Claude {
        http: &state.http,
        api_key,
        model: &state.config.anthropic_model,
    }
    .read_images(&pages, &category_names(&state).await?)
    .await
    .map_err(|e| AppError::Upstream(e.to_string()))?;

    Ok(Json(ImportPreview {
        draft,
        method: "scan",
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_data_url_carries_its_own_media_type() {
        let (media, data) = split_data_url("data:image/png;base64,AAAA", None).unwrap();
        assert_eq!(media, "image/png");
        assert_eq!(data, "AAAA");
    }

    #[test]
    fn a_data_url_beats_the_declared_type() {
        // The camera sends a data URL and may also declare a type; the URL is
        // the one that describes the bytes actually attached.
        let (media, _) = split_data_url("data:image/webp;base64,AAAA", Some("image/jpeg")).unwrap();
        assert_eq!(media, "image/webp");
    }

    #[test]
    fn bare_base64_falls_back_to_the_declared_type() {
        let (media, data) = split_data_url("AAAA", Some("image/png")).unwrap();
        assert_eq!(media, "image/png");
        assert_eq!(data, "AAAA");
    }

    #[test]
    fn bare_base64_with_nothing_declared_is_assumed_jpeg() {
        let (media, _) = split_data_url("AAAA", None).unwrap();
        assert_eq!(media, "image/jpeg");
    }

    #[test]
    fn a_data_url_with_no_comma_is_rejected() {
        // Truncated upload rather than a valid image with an empty payload.
        assert!(split_data_url("data:image/png;base64", None).is_err());
    }
}

#[derive(Debug, Serialize)]
pub struct ImportStatus {
    /// False when no API key is configured; the surfaces use this to show the
    /// scan route as unavailable instead of failing at the camera.
    pub scanning_enabled: bool,
}

pub async fn status(State(state): State<AppState>) -> Json<ImportStatus> {
    Json(ImportStatus {
        scanning_enabled: state.config.anthropic_api_key.is_some(),
    })
}
