//! Reading a recipe out of a photo (or an unstructured web page) with Claude.
//!
//! Rust has no official Anthropic SDK, so this talks to the Messages API over
//! HTTP directly. Two things do the heavy lifting:
//!
//!   * **Structured outputs** (`output_config.format`) constrain the reply to
//!     the recipe schema, so there is no prose to strip and no JSON to repair.
//!   * **Vision** — the cookbook photo goes in as a base64 image block ahead of
//!     the text block, which is the ordering the model reads best.

use anyhow::{Context, anyhow};
use serde::Deserialize;
use serde_json::{Value, json};

use crate::models::{Ingredient, RecipeDraft};

const API_URL: &str = "https://api.anthropic.com/v1/messages";
const API_VERSION: &str = "2023-06-01";

/// The largest photo we will forward. Phone cameras happily produce 8 MB
/// files; the API caps a request at 32 MB and there is no accuracy to be had
/// from a picture of a page that large.
pub const MAX_IMAGE_BYTES: usize = 6 * 1024 * 1024;

const SYSTEM_PROMPT: &str = "\
You transcribe recipes for a family kitchen hub. Copy what the source actually \
says: keep the original quantities, units and wording of each ingredient, and \
keep the method steps in order and complete.

Put the amount in `qty` and the ingredient in `name` — \"2 cloves\" and \
\"garlic, thinly sliced\", not \"2 cloves garlic\". Leave `qty` empty for \
things listed without an amount, such as salt and pepper to taste; the shopping \
list deliberately skips those.

`time_label` is how a person would say it (\"30 min\", \"1 hr 15\"), and \
`time_minutes` is that same duration as a whole number. The categories offered \
are this household's own, so pick the one that fits how they would eat the \
dish — prefer the more specific of two that both apply. `blurb` is one short \
sentence someone would read on a wall display before deciding to cook it.

Transcribe only what is there. If part of the page is cut off or unreadable, \
leave that entry out rather than inventing it.";

/// The JSON Schema the reply is constrained to.
///
/// Every object sets `additionalProperties: false` and lists every key in
/// `required` — structured outputs rejects a schema that does not.
/// The categories are the household's own, passed in rather than fixed, so the
/// model picks from the list this kitchen actually uses. Constraining the enum
/// is what makes the answer land in an existing category instead of inventing
/// "Weeknight" and falling back to the first one on save.
fn recipe_schema(categories: &[String]) -> Value {
    json!({
        "type": "object",
        "properties": {
            "title": { "type": "string" },
            "category": {
                "type": "string",
                "enum": categories
            },
            "time_label": { "type": "string" },
            "time_minutes": { "type": "integer" },
            "serves_label": { "type": "string" },
            "blurb": { "type": "string" },
            "ingredients": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "qty": { "type": "string" },
                        "name": { "type": "string" }
                    },
                    "required": ["qty", "name"],
                    "additionalProperties": false
                }
            },
            "steps": { "type": "array", "items": { "type": "string" } }
        },
        "required": [
            "title", "category", "time_label", "time_minutes",
            "serves_label", "blurb", "ingredients", "steps"
        ],
        "additionalProperties": false
    })
}

/// The subset of the response we read.
#[derive(Debug, Deserialize)]
struct MessagesResponse {
    #[serde(default)]
    content: Vec<ContentBlock>,
    #[serde(default)]
    stop_reason: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(tag = "type")]
enum ContentBlock {
    #[serde(rename = "text")]
    Text { text: String },
    /// Thinking blocks arrive alongside the answer and carry no text unless
    /// summaries are requested; they are simply skipped.
    #[serde(other)]
    Other,
}

/// What the model produced, before it becomes a `RecipeDraft`.
#[derive(Debug, Deserialize)]
struct ExtractedRecipe {
    title: String,
    category: String,
    time_label: String,
    time_minutes: Option<i32>,
    serves_label: String,
    blurb: String,
    ingredients: Vec<Ingredient>,
    steps: Vec<String>,
}

/// Drop entries that carry no text.
///
/// A model that cannot read part of a page sometimes returns placeholders — an
/// ingredient with an empty name, a step that is one space — rather than a
/// shorter list. Those survive the emptiness check but are skipped at insert,
/// so the recipe reaches the library with fewer rows than it claimed, or none.
/// Pruning first makes the check mean what it says.
fn prune_blanks(extracted: &mut ExtractedRecipe) {
    extracted
        .ingredients
        .retain(|ingredient| !ingredient.name.trim().is_empty());
    extracted.steps.retain(|step| !step.trim().is_empty());
}

impl From<ExtractedRecipe> for RecipeDraft {
    fn from(value: ExtractedRecipe) -> Self {
        RecipeDraft {
            title: value.title,
            category: value.category,
            time_label: value.time_label,
            time_minutes: value.time_minutes,
            serves_label: value.serves_label,
            blurb: value.blurb,
            ingredients: value.ingredients,
            steps: value.steps,
            source_url: None,
        }
    }
}

pub struct Claude<'a> {
    pub http: &'a reqwest::Client,
    pub api_key: &'a str,
    pub model: &'a str,
}

impl<'a> Claude<'a> {
    /// Read a recipe from one or more photos of a cookbook page or recipe card.
    ///
    /// Several photos are one recipe, not several: a card has its ingredients on
    /// the front and its method on the back, and a cookbook recipe runs across a
    /// spread. Each page is labelled ahead of its image so the order is stated
    /// rather than inferred, and the closing instruction is explicit that the
    /// pages must be merged — otherwise a heading repeated on both sides of a
    /// card comes back as a duplicated ingredient.
    pub async fn read_images(
        &self,
        pages: &[(String, String)],
        categories: &[String],
    ) -> anyhow::Result<RecipeDraft> {
        let mut content: Vec<Value> = Vec::with_capacity(pages.len() * 2 + 1);

        for (index, (data, media_type)) in pages.iter().enumerate() {
            if pages.len() > 1 {
                content.push(json!({
                    "type": "text",
                    "text": format!("Page {} of {}:", index + 1, pages.len())
                }));
            }
            content.push(json!({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": media_type,
                    "data": data
                }
            }));
        }

        content.push(json!({
            "type": "text",
            "text": if pages.len() == 1 {
                "Transcribe the recipe on this page.".to_string()
            } else {
                format!(
                    "These {} photographs are one recipe — the front and back of a \
                     card, or facing pages of a book. Transcribe them as a single \
                     recipe. Do not repeat an ingredient or a step that appears on \
                     more than one page, and keep the method steps in the order the \
                     pages run.",
                    pages.len()
                )
            }
        }));

        self.extract(Value::Array(content), categories).await
    }

    /// Read a recipe out of page text, for sites that publish no structured
    /// recipe data. Only reached after the JSON-LD parser has come up empty.
    pub async fn read_text(
        &self,
        page_text: &str,
        url: &str,
        categories: &[String],
    ) -> anyhow::Result<RecipeDraft> {
        // Recipe pages carry a lot of preamble; the recipe itself is reliably
        // in the first stretch of extracted text, and trimming keeps a very
        // long article from dominating the request.
        let trimmed: String = page_text.chars().take(24_000).collect();

        let content = json!([{
            "type": "text",
            "text": format!(
                "Transcribe the recipe from this page ({url}). The text was \
                 extracted from the page, so ignore navigation, comments and \
                 advertising.\n\n{trimmed}"
            )
        }]);

        self.extract(content, categories).await
    }

    async fn extract(
        &self,
        content: Value,
        categories: &[String],
    ) -> anyhow::Result<RecipeDraft> {
        let body = json!({
            "model": self.model,
            "max_tokens": 16000,
            "system": SYSTEM_PROMPT,
            // Transcription is careful reading rather than hard reasoning;
            // medium keeps the kitchen from waiting on deliberation it does
            // not need. The schema does the rest of the work.
            "output_config": {
                "effort": "medium",
                "format": { "type": "json_schema", "schema": recipe_schema(categories) }
            },
            "messages": [{ "role": "user", "content": content }]
        });

        let response = self
            .http
            .post(API_URL)
            .header("x-api-key", self.api_key)
            .header("anthropic-version", API_VERSION)
            .header("content-type", "application/json")
            .json(&body)
            .send()
            .await
            .context("could not reach the Claude API")?;

        let status = response.status();
        let text = response.text().await?;

        if !status.is_success() {
            // The API's own message is far more useful than the status code
            // when a key is wrong or an image is oversized.
            let detail = serde_json::from_str::<Value>(&text)
                .ok()
                .and_then(|v| v["error"]["message"].as_str().map(str::to_string))
                .unwrap_or_else(|| text.clone());
            return Err(anyhow!("Claude returned {status}: {detail}"));
        }

        let parsed: MessagesResponse =
            serde_json::from_str(&text).context("unexpected response shape from Claude")?;

        // Check why generation stopped before reading content: a declined
        // request returns 200 with an empty content array.
        match parsed.stop_reason.as_deref() {
            Some("refusal") => {
                return Err(anyhow!(
                    "Claude would not transcribe that image. Try a clearer photo of the recipe itself."
                ));
            }
            Some("max_tokens") => {
                return Err(anyhow!(
                    "That page was too long to transcribe in one go. Try photographing one recipe at a time."
                ));
            }
            _ => {}
        }

        let json_text = parsed
            .content
            .iter()
            .find_map(|block| match block {
                ContentBlock::Text { text } => Some(text.as_str()),
                ContentBlock::Other => None,
            })
            .ok_or_else(|| anyhow!("Claude returned nothing to read."))?;

        let mut extracted: ExtractedRecipe = serde_json::from_str(json_text)
            .context("Claude's reply did not match the recipe schema")?;

        prune_blanks(&mut extracted);

        // Ingredients specifically, not "ingredients or steps": the shopping
        // list is derived from them, so a recipe without any is inert — it can
        // be planned for a night and still contribute nothing to the shop. A
        // half-read photo used to save exactly that, leaving a title in the
        // library with nothing behind it.
        if extracted.ingredients.is_empty() {
            return Err(anyhow!(
                "The ingredients could not be read from that photo. Check the \
                 whole ingredient list is in frame and in focus, then try again."
            ));
        }

        Ok(extracted.into())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn extracted(ingredients: Vec<Ingredient>, steps: Vec<String>) -> ExtractedRecipe {
        ExtractedRecipe {
            title: "Chipotle bean burritos".into(),
            category: "Dinner".into(),
            time_label: "25 min".into(),
            time_minutes: Some(25),
            serves_label: "serves 4".into(),
            blurb: "Smoky beans in warm tortillas.".into(),
            ingredients,
            steps,
        }
    }

    fn ingredient(qty: &str, name: &str) -> Ingredient {
        Ingredient {
            qty: qty.into(),
            name: name.into(),
        }
    }

    #[test]
    fn a_real_reading_is_left_alone() {
        let mut recipe = extracted(
            vec![ingredient("2 tbsp", "olive oil"), ingredient("", "salt")],
            vec!["Heat the oil.".into()],
        );
        prune_blanks(&mut recipe);

        // An empty qty is meaningful — "salt and pepper to taste" is an
        // ingredient with no amount, and it must survive.
        assert_eq!(recipe.ingredients.len(), 2);
        assert_eq!(recipe.steps.len(), 1);
    }

    #[test]
    fn nameless_ingredients_are_dropped() {
        let mut recipe = extracted(
            vec![ingredient("2 tbsp", "olive oil"), ingredient("1", "   ")],
            vec![],
        );
        prune_blanks(&mut recipe);
        assert_eq!(recipe.ingredients.len(), 1);
    }

    #[test]
    fn a_list_of_blanks_prunes_to_nothing() {
        // The shape that used to pass the emptiness check and then vanish at
        // insert, leaving a title in the library with nothing behind it.
        let mut recipe = extracted(
            vec![ingredient("", ""), ingredient("", " ")],
            vec!["".into(), "  ".into()],
        );
        prune_blanks(&mut recipe);
        assert!(recipe.ingredients.is_empty());
        assert!(recipe.steps.is_empty());
    }
}
