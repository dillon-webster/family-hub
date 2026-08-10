//! Pulling a recipe off a web page.
//!
//! Most recipe sites publish a schema.org/Recipe object as JSON-LD, because
//! that is what search engines read. When one is present it is the best source
//! available — exact quantities, exact steps, no guessing — so it is tried
//! first and the language model is only a fallback for pages that don't.

use anyhow::{Context, anyhow};
use scraper::{Html, Selector};
use serde_json::Value;

use crate::models::{Category, Ingredient, RecipeDraft};

/// Units that may follow a number in an ingredient line. Only consulted after
/// a number has been seen, so "large egg" keeps "large" as part of the name.
const UNITS: &[&str] = &[
    "g", "gram", "grams", "kg", "kilogram", "kilograms", "mg", "ml", "l", "liter", "liters",
    "litre", "litres", "oz", "ounce", "ounces", "lb", "lbs", "pound", "pounds", "cup", "cups",
    "tbsp", "tbs", "tablespoon", "tablespoons", "tsp", "teaspoon", "teaspoons", "clove", "cloves",
    "can", "cans", "tin", "tins", "jar", "jars", "pinch", "pinches", "dash", "bunch", "bunches",
    "slice", "slices", "piece", "pieces", "head", "heads", "stick", "sticks", "sprig", "sprigs",
    "leaf", "leaves", "nest", "nests", "bulb", "bulbs", "fillet", "fillets", "package", "packages",
    "pkg", "packet", "packets", "quart", "quarts", "pint", "pints", "gallon", "gallons", "fl",
    "handful", "handfuls", "stalk", "stalks", "ear", "ears", "sheet", "sheets", "strip", "strips",
];

fn is_quantity_token(token: &str) -> bool {
    let cleaned = token.trim_matches(|c: char| c == '(' || c == ')' || c == ',');
    if cleaned.is_empty() {
        return false;
    }
    // Digits, decimals, ranges ("2-3"), fractions ("1/2") and the vulgar
    // fraction characters recipe sites are fond of.
    cleaned
        .chars()
        .all(|c| c.is_ascii_digit() || matches!(c, '.' | '/' | '-' | '–' | '¼'..='¾' | '⅐'..='⅞'))
}

fn is_unit_token(token: &str) -> bool {
    let cleaned = token
        .trim_matches(|c: char| !c.is_alphabetic())
        .to_lowercase();
    UNITS.contains(&cleaned.as_str())
}

/// Split "500 g potato gnocchi" into `("500 g", "potato gnocchi")`.
///
/// The design keeps the amount and the ingredient in separate columns, and the
/// shopping list merges on the name alone, so this split is load-bearing rather
/// than cosmetic.
pub fn split_quantity(line: &str) -> Ingredient {
    let line = line.trim();
    let tokens: Vec<&str> = line.split_whitespace().collect();

    let mut taken = 0;
    let mut saw_number = false;

    for token in &tokens {
        if is_quantity_token(token) {
            saw_number = true;
            taken += 1;
        } else if saw_number && is_unit_token(token) {
            taken += 1;
            // A unit ends the quantity: in "2 cloves garlic, sliced" nothing
            // after "cloves" is part of the amount.
            break;
        } else {
            break;
        }
    }

    // An entire line of numbers and units is not a quantity plus a name — it is
    // a name we failed to understand. Keep it whole.
    if taken == 0 || taken == tokens.len() {
        return Ingredient {
            qty: String::new(),
            name: line.to_string(),
        };
    }

    Ingredient {
        qty: tokens[..taken].join(" "),
        name: tokens[taken..].join(" "),
    }
}

/// Parse an ISO 8601 duration ("PT1H15M") into whole minutes.
pub fn parse_iso_duration(value: &str) -> Option<i32> {
    let rest = value.strip_prefix("PT")?;
    let mut minutes = 0i32;
    let mut number = String::new();

    for ch in rest.chars() {
        match ch {
            '0'..='9' => number.push(ch),
            'H' => {
                minutes += number.parse::<i32>().ok()? * 60;
                number.clear();
            }
            'M' => {
                minutes += number.parse::<i32>().ok()?;
                number.clear();
            }
            'S' => number.clear(),
            _ => return None,
        }
    }

    (minutes > 0).then_some(minutes)
}

/// Render minutes the way the design writes them: "30 min", "1 hr 15".
pub fn format_duration(minutes: i32) -> String {
    match (minutes / 60, minutes % 60) {
        (0, m) => format!("{m} min"),
        (h, 0) => format!("{h} hr"),
        (h, m) => format!("{h} hr {m:02}"),
    }
}

fn as_text(value: &Value) -> Option<String> {
    match value {
        Value::String(s) => Some(s.trim().to_string()),
        // HowToStep and friends carry the prose under `text`.
        Value::Object(map) => map
            .get("text")
            .or_else(|| map.get("name"))
            .and_then(as_text),
        _ => None,
    }
}

/// Flatten instructions, which appear as a string, a list of strings, a list of
/// HowToStep objects, or HowToSections containing any of the above.
fn collect_steps(value: &Value, out: &mut Vec<String>) {
    match value {
        Value::String(s) => {
            // A single prose blob: split it into sentences-as-steps only if it
            // clearly contains several, otherwise keep it whole.
            for part in s.split(['\n', '\r']).filter(|p| !p.trim().is_empty()) {
                out.push(part.trim().to_string());
            }
        }
        Value::Array(items) => items.iter().for_each(|item| collect_steps(item, out)),
        Value::Object(map) => {
            if let Some(items) = map.get("itemListElement") {
                collect_steps(items, out);
            } else if let Some(text) = as_text(value) {
                if !text.is_empty() {
                    out.push(text);
                }
            }
        }
        _ => {}
    }
}

fn category_from(value: Option<&Value>) -> Category {
    let raw = value
        .and_then(|v| match v {
            Value::String(s) => Some(s.clone()),
            Value::Array(items) => items.first().and_then(|i| i.as_str().map(str::to_string)),
            _ => None,
        })
        .unwrap_or_default()
        .to_lowercase();

    if raw.contains("dessert") || raw.contains("cake") || raw.contains("sweet") {
        Category::Dessert
    } else if raw.contains("breakfast") || raw.contains("brunch") {
        Category::Breakfast
    } else if raw.contains("vegetarian") || raw.contains("vegan") {
        Category::Vegetarian
    } else {
        Category::Dinner
    }
}

/// Walk a JSON-LD document looking for the first schema.org/Recipe node.
/// They hide inside `@graph`, plain arrays, or sit at the top level.
fn find_recipe_node(value: &Value) -> Option<&Value> {
    match value {
        Value::Array(items) => items.iter().find_map(find_recipe_node),
        Value::Object(map) => {
            let is_recipe = match map.get("@type") {
                Some(Value::String(t)) => t.eq_ignore_ascii_case("Recipe"),
                Some(Value::Array(types)) => types
                    .iter()
                    .any(|t| t.as_str().is_some_and(|s| s.eq_ignore_ascii_case("Recipe"))),
                _ => false,
            };
            if is_recipe {
                return Some(value);
            }
            map.get("@graph").and_then(find_recipe_node)
        }
        _ => None,
    }
}

fn draft_from_node(node: &Value, url: &str) -> anyhow::Result<RecipeDraft> {
    let title = node
        .get("name")
        .and_then(as_text)
        .filter(|t| !t.is_empty())
        .ok_or_else(|| anyhow!("the recipe on that page has no name"))?;

    let ingredients: Vec<Ingredient> = node
        .get("recipeIngredient")
        .or_else(|| node.get("ingredients"))
        .and_then(|v| v.as_array())
        .map(|items| {
            items
                .iter()
                .filter_map(as_text)
                .filter(|line| !line.is_empty())
                .map(|line| split_quantity(&line))
                .collect()
        })
        .unwrap_or_default();

    let mut steps = Vec::new();
    if let Some(value) = node.get("recipeInstructions") {
        collect_steps(value, &mut steps);
    }

    if ingredients.is_empty() && steps.is_empty() {
        return Err(anyhow!("that page has a recipe tag but no recipe in it"));
    }

    let minutes = node
        .get("totalTime")
        .or_else(|| node.get("cookTime"))
        .and_then(as_text)
        .and_then(|d| parse_iso_duration(&d));

    Ok(RecipeDraft {
        title,
        category: category_from(node.get("recipeCategory")),
        time_label: minutes.map(format_duration).unwrap_or_default(),
        time_minutes: minutes,
        serves_label: node
            .get("recipeYield")
            .and_then(as_text)
            .map(|y| {
                // "4" becomes "serves 4"; "4 servings" is already a sentence.
                if y.chars().all(|c| c.is_ascii_digit()) {
                    format!("serves {y}")
                } else {
                    y
                }
            })
            .unwrap_or_default(),
        blurb: node
            .get("description")
            .and_then(as_text)
            .map(|d| d.chars().take(160).collect())
            .unwrap_or_default(),
        ingredients,
        steps,
        source_url: Some(url.to_string()),
    })
}

/// Extract a recipe from an HTML document's JSON-LD, if it has one.
pub fn from_json_ld(html: &str, url: &str) -> anyhow::Result<RecipeDraft> {
    let document = Html::parse_document(html);
    let selector = Selector::parse(r#"script[type="application/ld+json"]"#)
        .map_err(|e| anyhow!("bad selector: {e}"))?;

    for element in document.select(&selector) {
        let raw = element.text().collect::<String>();
        let Ok(value) = serde_json::from_str::<Value>(&raw) else {
            // One malformed block should not stop us looking at the others.
            continue;
        };
        if let Some(node) = find_recipe_node(&value) {
            return draft_from_node(node, url);
        }
    }

    Err(anyhow!("no recipe data on that page"))
}

/// Strip a page down to readable text, for the language-model fallback.
pub fn readable_text(html: &str) -> String {
    let document = Html::parse_document(html);
    let selector = Selector::parse("body").unwrap();

    let body = document
        .select(&selector)
        .next()
        .map(|b| b.text().collect::<Vec<_>>().join(" "))
        .unwrap_or_default();

    // Collapse the whitespace that markup leaves behind.
    body.split_whitespace().collect::<Vec<_>>().join(" ")
}

pub async fn fetch(http: &reqwest::Client, url: &str) -> anyhow::Result<String> {
    let response = http
        .get(url)
        .send()
        .await
        .context("could not open that link")?;

    if !response.status().is_success() {
        return Err(anyhow!("that page returned {}", response.status()));
    }

    Ok(response.text().await?)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn splits_an_amount_from_the_ingredient() {
        let cases = [
            ("500 g potato gnocchi", "500 g", "potato gnocchi"),
            ("2 cloves garlic, thinly sliced", "2 cloves", "garlic, thinly sliced"),
            ("1.8 kg whole chicken", "1.8 kg", "whole chicken"),
            ("2 lemons, halved", "2", "lemons, halved"),
            ("½ tsp flaky salt", "½ tsp", "flaky salt"),
            ("1/2 cup olive oil", "1/2 cup", "olive oil"),
        ];

        for (line, qty, name) in cases {
            let parsed = split_quantity(line);
            assert_eq!(parsed.qty, qty, "qty for {line:?}");
            assert_eq!(parsed.name, name, "name for {line:?}");
        }
    }

    #[test]
    fn a_line_with_no_amount_stays_whole() {
        let parsed = split_quantity("salt and pepper");
        assert_eq!(parsed.qty, "");
        assert_eq!(parsed.name, "salt and pepper");
    }

    #[test]
    fn a_size_word_without_a_number_is_part_of_the_name() {
        let parsed = split_quantity("large free-range eggs");
        assert_eq!(parsed.qty, "");
        assert_eq!(parsed.name, "large free-range eggs");
    }

    #[test]
    fn durations_round_trip_into_the_designs_wording() {
        assert_eq!(parse_iso_duration("PT30M"), Some(30));
        assert_eq!(parse_iso_duration("PT1H15M"), Some(75));
        assert_eq!(parse_iso_duration("PT2H"), Some(120));
        assert_eq!(parse_iso_duration("garbage"), None);

        assert_eq!(format_duration(30), "30 min");
        assert_eq!(format_duration(75), "1 hr 15");
        assert_eq!(format_duration(120), "2 hr");
    }

    #[test]
    fn reads_a_recipe_out_of_a_graph_wrapped_json_ld_block() {
        let html = r#"
        <html><head>
        <script type="application/ld+json">
        {"@context":"https://schema.org","@graph":[
          {"@type":"WebSite","name":"Some Blog"},
          {"@type":["Recipe"],"name":"Sesame chicken traybake",
           "description":"Sticky sesame chicken with charred scallion.",
           "totalTime":"PT45M","recipeYield":"4","recipeCategory":"Dinner",
           "recipeIngredient":["8 chicken thighs","3 tbsp soy sauce","salt and pepper"],
           "recipeInstructions":[
             {"@type":"HowToStep","text":"Whisk the marinade."},
             {"@type":"HowToStep","text":"Roast at 425F for 30 minutes."}]}
        ]}
        </script></head><body></body></html>"#;

        let draft = from_json_ld(html, "https://example.com/r").unwrap();

        assert_eq!(draft.title, "Sesame chicken traybake");
        assert_eq!(draft.time_label, "45 min");
        assert_eq!(draft.time_minutes, Some(45));
        assert_eq!(draft.serves_label, "serves 4");
        assert_eq!(draft.steps.len(), 2);
        assert_eq!(draft.ingredients[0].qty, "8");
        assert_eq!(draft.ingredients[0].name, "chicken thighs");
        // The amount-less line survives, and the shopping list will skip it.
        assert_eq!(draft.ingredients[2].qty, "");
    }

    #[test]
    fn a_page_without_recipe_data_is_an_error_not_an_empty_recipe() {
        let html = "<html><body><p>Just a blog post.</p></body></html>";
        assert!(from_json_ld(html, "https://example.com").is_err());
    }

    #[test]
    fn sweet_and_meatless_categories_are_recognized() {
        let vegetarian = json!({ "recipeCategory": "Vegetarian main" });
        let dessert = json!({ "recipeCategory": ["Dessert", "Baking"] });
        let breakfast = json!({ "recipeCategory": "Brunch" });

        assert_eq!(category_from(vegetarian.get("recipeCategory")), Category::Vegetarian);
        assert_eq!(category_from(dessert.get("recipeCategory")), Category::Dessert);
        assert_eq!(category_from(breakfast.get("recipeCategory")), Category::Breakfast);
        assert_eq!(category_from(None), Category::Dinner);
    }

    use serde_json::json;
}
