//! Turning a week of dinners into one shopping list.
//!
//! The list is never stored. It is rebuilt from the plan on every read, so
//! swapping Thursday's dinner or fixing a typo in a recipe is reflected the
//! next time anyone looks at their phone. Only the human decisions — bought,
//! "already have it", and items added by hand — are persisted, keyed by the
//! same normalized ingredient key the merge produces.

use serde::Serialize;
use std::collections::HashMap;
use uuid::Uuid;

use crate::models::Ingredient;

/// The five buckets the list is grouped into, in the order they are shown.
///
/// Each carries two colors because the same aisle appears on both surfaces: the
/// dark kitchen display needs lifted, desaturated values and the cream phone
/// needs the fuller brand hues.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum Aisle {
    Produce,
    Meat,
    Cold,
    Pantry,
    Misc,
}

impl Aisle {
    pub const ORDER: [Aisle; 5] = [
        Aisle::Produce,
        Aisle::Meat,
        Aisle::Cold,
        Aisle::Pantry,
        Aisle::Misc,
    ];

    pub fn label(self) -> &'static str {
        match self {
            Aisle::Produce => "Produce",
            Aisle::Meat => "Meat",
            Aisle::Cold => "Cold",
            Aisle::Pantry => "Pantry",
            Aisle::Misc => "Bathroom / misc",
        }
    }

    /// Color on the dark kitchen display.
    pub fn hub_color(self) -> &'static str {
        match self {
            Aisle::Produce => "#93B278",
            Aisle::Meat => "#E37A57",
            Aisle::Cold => "#7FA9C7",
            Aisle::Pantry => "#E3A85C",
            Aisle::Misc => "#BFB0A0",
        }
    }

    /// Color on the cream phone.
    pub fn phone_color(self) -> &'static str {
        match self {
            Aisle::Produce => "#6E8B57",
            Aisle::Meat => "#C8553D",
            Aisle::Cold => "#4F7CA0",
            Aisle::Pantry => "#D9962B",
            Aisle::Misc => "#9C8E7E",
        }
    }

    pub fn from_label(label: &str) -> Option<Aisle> {
        Aisle::ORDER.into_iter().find(|a| a.label() == label)
    }
}

/// Words that force an ingredient into a bucket, checked in this order.
///
/// Order is the whole trick. "Crushed tomatoes" has to be caught by the pantry
/// list before "tomato" sends it to produce, and "buttermilk" has to reach cold
/// before anything else claims it. Tune these freely — they are a heuristic for
/// walking a supermarket, not a taxonomy.
const SHELF_STABLE: &[&str] = &[
    "crushed tomato",
    "canned",
    "tinned",
    "can of",
    "jar",
    "dried",
    "stock",
    "broth",
    "miso",
    "soy sauce",
    "vinegar",
    "sauce",
    "paste",
];

const MEAT: &[&str] = &[
    "chicken", "salmon", "beef", "thigh", "pork", "bacon", "sausage", "turkey", "lamb", "shrimp",
    "prawn", "fish", "mince", "steak", "ham",
];

const COLD: &[&str] = &[
    "butter",
    "buttermilk",
    "parmesan",
    "pecorino",
    "egg",
    "feta",
    "cream",
    "milk",
    "yogurt",
    "yoghurt",
    "cheese",
    "gnocchi",
    "tofu",
    "mozzarella",
    "ricotta",
];

const PRODUCE: &[&str] = &[
    "sage",
    "garlic",
    "lemon",
    "lime",
    "thyme",
    "rosemary",
    "basil",
    "mushroom",
    "fennel",
    "orange",
    "broccoli",
    "scallion",
    "spring onion",
    "onion",
    "shallot",
    "apple",
    "plum",
    "pepper",
    "parsley",
    "cilantro",
    "coriander",
    "spinach",
    "kale",
    "carrot",
    "potato",
    "celery",
    "cucumber",
    "avocado",
    "banana",
    "berry",
    "lettuce",
    "zucchini",
    "courgette",
    "leek",
    "ginger",
    "chili",
    "chilli",
];

/// Which aisle an ingredient belongs in.
pub fn aisle_for(name: &str) -> Aisle {
    let n = name.to_lowercase();
    let has = |words: &[&str]| words.iter().any(|w| n.contains(w));

    if has(SHELF_STABLE) {
        Aisle::Pantry
    } else if has(MEAT) {
        Aisle::Meat
    } else if has(COLD) {
        Aisle::Cold
    } else if has(PRODUCE) {
        Aisle::Produce
    } else {
        Aisle::Pantry
    }
}

/// Collapse an ingredient name to the key two recipes must share to merge.
///
/// Everything after the first comma is preparation, not identity — "garlic,
/// thinly sliced" and "garlic, halved" are one line on the list. The plural
/// trim is crude but catches the common cases (eggs/egg, plums/plum,
/// tomatoes/tomatoe→tomato).
pub fn normalize_key(name: &str) -> String {
    let base = name.split(',').next().unwrap_or(name).trim().to_lowercase();
    let base = base
        .strip_suffix("oes")
        .map(|s| format!("{s}o"))
        .unwrap_or(base);
    let base = base
        .strip_suffix("ies")
        .map(|s| format!("{s}y"))
        .unwrap_or(base);
    match base.strip_suffix('s') {
        // A trailing "s" preceded by "s" or "u" is part of the word, not a
        // plural: couscous, hummus, asparagus, molasses.
        Some(trimmed)
            if trimmed.len() > 2 && !trimmed.ends_with('s') && !trimmed.ends_with('u') =>
        {
            trimmed.to_string()
        }
        _ => base,
    }
}

/// The display name for a merged line — the first comma-free form seen.
fn display_name(name: &str) -> String {
    name.split(',').next().unwrap_or(name).trim().to_string()
}

#[derive(Debug, Clone, Serialize)]
pub struct ListItem {
    /// Stable across rebuilds; this is what bought/skipped state is keyed on.
    pub key: String,
    pub name: String,
    /// Every distinct amount seen, e.g. `["2 cloves", "1 head"]`. Deliberately
    /// not summed: units differ and a wrong total is worse than two amounts.
    pub qtys: Vec<String>,
    /// How many of the week's dinners want this. Drives the "· 3 meals" note.
    pub meals: usize,
    pub aisle: Aisle,
    /// True for items typed in at the store rather than derived from a recipe.
    /// These skip the review step and go straight onto the list.
    pub hand: bool,
    pub bought: bool,
    pub skipped: bool,
    /// Which recipes contributed, so the phone can explain where a line
    /// came from.
    pub sources: Vec<String>,
    pub added_by: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize)]
pub struct AisleGroup {
    pub aisle: Aisle,
    pub label: &'static str,
    pub hub_color: &'static str,
    pub phone_color: &'static str,
    pub items: Vec<ListItem>,
}

/// A recipe's contribution to the week, as the builder needs it.
pub struct PlannedRecipe {
    pub title: String,
    pub ingredients: Vec<Ingredient>,
    /// How many times over it is being made. Quantities are multiplied by this
    /// before they are merged, so a doubled night reaches the shop as the
    /// amount actually needed rather than the recipe's own.
    pub batch: i16,
}

/// A hand-added item as stored.
pub struct Extra {
    pub id: Uuid,
    pub name: String,
    pub qty: String,
    pub aisle: String,
    pub added_by: Option<Uuid>,
}

/// The persisted decision for one key.
#[derive(Debug, Clone, Copy, Default)]
pub struct ItemState {
    pub bought: bool,
    pub skipped: bool,
}

/// Merge a week's planned dinners and hand-added items into grouped aisles.
///
/// Callers pass only the days that are actually being cooked — eating-out days
/// contribute nothing, which is the whole point of marking them.
pub fn build(
    planned: &[PlannedRecipe],
    extras: &[Extra],
    states: &HashMap<String, ItemState>,
) -> Vec<AisleGroup> {
    let mut items: Vec<ListItem> = Vec::new();
    let mut index: HashMap<String, usize> = HashMap::new();

    // Hand-added items first so they sit at the top of their aisle, and so an
    // ingredient that matches one merges into it rather than duplicating it.
    for extra in extras {
        let key = format!("x-{}", extra.id);
        let state = states.get(&key).copied().unwrap_or_default();
        index.insert(normalize_key(&extra.name), items.len());
        items.push(ListItem {
            key,
            name: extra.name.clone(),
            qtys: vec![extra.qty.clone()],
            meals: 1,
            aisle: Aisle::from_label(&extra.aisle).unwrap_or(Aisle::Misc),
            hand: true,
            bought: state.bought,
            skipped: state.skipped,
            sources: Vec::new(),
            added_by: extra.added_by,
        });
    }

    for recipe in planned {
        // A doubled night says so on the list, because "2 kg beef mince" with
        // no explanation reads as a mistake next to a recipe that calls for 1.
        let source = if recipe.batch > 1 {
            format!("{} ×{}", recipe.title, recipe.batch)
        } else {
            recipe.title.clone()
        };

        for ingredient in &recipe.ingredients {
            // No amount means it is a seasoning the house already has.
            if ingredient.qty.trim().is_empty() {
                continue;
            }
            let key = normalize_key(&ingredient.name);
            let qty = crate::recipe_import::scale_quantity(&ingredient.qty, recipe.batch);

            if let Some(&position) = index.get(&key) {
                let item = &mut items[position];
                if !item.qtys.contains(&qty) {
                    item.qtys.push(qty);
                }
                item.meals += 1;
                if !item.sources.contains(&source) {
                    item.sources.push(source.clone());
                }
                continue;
            }

            let state = states.get(&key).copied().unwrap_or_default();
            index.insert(key.clone(), items.len());
            items.push(ListItem {
                name: display_name(&ingredient.name),
                aisle: aisle_for(&ingredient.name),
                key,
                qtys: vec![qty],
                meals: 1,
                hand: false,
                bought: state.bought,
                skipped: state.skipped,
                sources: vec![source.clone()],
                added_by: None,
            });
        }
    }

    Aisle::ORDER
        .into_iter()
        .filter_map(|aisle| {
            let group: Vec<ListItem> = items.iter().filter(|i| i.aisle == aisle).cloned().collect();
            if group.is_empty() {
                return None;
            }
            Some(AisleGroup {
                aisle,
                label: aisle.label(),
                hub_color: aisle.hub_color(),
                phone_color: aisle.phone_color(),
                items: group,
            })
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ing(qty: &str, name: &str) -> Ingredient {
        Ingredient {
            qty: qty.into(),
            name: name.into(),
        }
    }

    #[test]
    fn preparation_after_a_comma_is_not_part_of_the_identity() {
        assert_eq!(normalize_key("garlic, thinly sliced"), "garlic");
        assert_eq!(normalize_key("garlic, halved"), "garlic");
        assert_eq!(normalize_key("lemon, zest and juice"), "lemon");
    }

    #[test]
    fn plurals_collapse_without_mangling_words_that_end_in_s() {
        assert_eq!(normalize_key("eggs"), "egg");
        assert_eq!(normalize_key("plums"), "plum");
        assert_eq!(normalize_key("tomatoes"), "tomato");
        assert_eq!(normalize_key("berries"), "berry");
        assert_eq!(normalize_key("couscous"), "couscous");
        assert_eq!(normalize_key("glass noodles"), "glass noodle");
    }

    #[test]
    fn canned_goods_beat_the_produce_keyword_that_also_matches() {
        assert_eq!(aisle_for("crushed tomatoes"), Aisle::Pantry);
        assert_eq!(aisle_for("vegetable stock"), Aisle::Pantry);
        assert_eq!(aisle_for("buttermilk"), Aisle::Cold);
        assert_eq!(aisle_for("chicken thighs"), Aisle::Meat);
        assert_eq!(aisle_for("fresh sage"), Aisle::Produce);
        assert_eq!(aisle_for("all-purpose flour"), Aisle::Pantry);
    }

    #[test]
    fn the_same_ingredient_from_two_dinners_becomes_one_line() {
        let planned = vec![
            PlannedRecipe {
                title: "Brown butter gnocchi".into(),
                ingredients: vec![ing("2 cloves", "garlic, thinly sliced")],
                batch: 1,
            },
            PlannedRecipe {
                title: "Lemon herb roast chicken".into(),
                ingredients: vec![ing("1 head", "garlic, halved")],
                batch: 1,
            },
        ];

        let groups = build(&planned, &[], &HashMap::new());
        let garlic = groups
            .iter()
            .flat_map(|g| &g.items)
            .find(|i| i.key == "garlic")
            .expect("garlic should be on the list");

        assert_eq!(garlic.meals, 2);
        assert_eq!(garlic.qtys, vec!["2 cloves", "1 head"]);
        assert_eq!(garlic.sources.len(), 2);
        assert_eq!(garlic.name, "garlic");
    }

    #[test]
    fn a_double_batch_reaches_the_shop_doubled() {
        let planned = vec![PlannedRecipe {
            title: "Dad's Sunday chili".into(),
            ingredients: vec![ing("900 g", "ground beef"), ing("", "salt and pepper")],
            batch: 2,
        }];

        let items: Vec<ListItem> = build(&planned, &[], &HashMap::new())
            .into_iter()
            .flat_map(|g| g.items)
            .collect();

        let beef = items.iter().find(|i| i.key == "ground beef").unwrap();
        assert_eq!(beef.qtys, vec!["1.8 kg"]);
        // The list says why the amount is what it is, so 1.8 kg next to a
        // recipe calling for 900 g does not read as a bug.
        assert_eq!(beef.sources, vec!["Dad's Sunday chili ×2"]);

        // Doubling does not conjure an amount for something that never had one.
        assert!(!items.iter().any(|i| i.key == "salt and pepper"));
    }

    #[test]
    fn the_same_dinner_twice_at_different_sizes_lists_both_amounts() {
        // Not summed, for the reason every other amount on this list is not
        // summed: 500 g plus 1 kg is arithmetic the hub can do and a unit
        // mismatch it cannot see coming.
        let planned = vec![
            PlannedRecipe {
                title: "Gnocchi".into(),
                ingredients: vec![ing("500 g", "potato gnocchi")],
                batch: 1,
            },
            PlannedRecipe {
                title: "Gnocchi".into(),
                ingredients: vec![ing("500 g", "potato gnocchi")],
                batch: 2,
            },
        ];

        let items: Vec<ListItem> = build(&planned, &[], &HashMap::new())
            .into_iter()
            .flat_map(|g| g.items)
            .collect();

        let gnocchi = items.iter().find(|i| i.key == "potato gnocchi").unwrap();
        assert_eq!(gnocchi.qtys, vec!["500 g", "1 kg"]);
        assert_eq!(gnocchi.meals, 2);
    }

    #[test]
    fn an_identical_amount_is_not_listed_twice() {
        let planned = vec![
            PlannedRecipe {
                title: "A".into(),
                ingredients: vec![ing("3 tbsp", "olive oil")],
                batch: 1,
            },
            PlannedRecipe {
                title: "B".into(),
                ingredients: vec![ing("3 tbsp", "olive oil")],
                batch: 1,
            },
        ];

        let groups = build(&planned, &[], &HashMap::new());
        let oil = groups
            .iter()
            .flat_map(|g| &g.items)
            .find(|i| i.key == "olive oil")
            .unwrap();

        assert_eq!(oil.qtys, vec!["3 tbsp"]);
        assert_eq!(oil.meals, 2);
    }

    #[test]
    fn ingredients_with_no_amount_are_left_off() {
        let planned = vec![PlannedRecipe {
            title: "Sheet-pan salmon & fennel".into(),
            ingredients: vec![ing("", "salt and pepper"), ing("2 bulbs", "fennel, sliced thin")],
            batch: 1,
        }];

        let keys: Vec<String> = build(&planned, &[], &HashMap::new())
            .iter()
            .flat_map(|g| g.items.iter().map(|i| i.key.clone()))
            .collect();

        assert_eq!(keys, vec!["fennel"]);
    }

    #[test]
    fn bought_and_skipped_state_survives_a_rebuild() {
        let planned = vec![PlannedRecipe {
            title: "A".into(),
            ingredients: vec![ing("1", "lemon"), ing("250 g", "flour")],
            batch: 1,
        }];
        let states = HashMap::from([
            (
                "lemon".to_string(),
                ItemState {
                    bought: true,
                    skipped: false,
                },
            ),
            (
                "flour".to_string(),
                ItemState {
                    bought: false,
                    skipped: true,
                },
            ),
        ]);

        let items: Vec<ListItem> = build(&planned, &[], &states)
            .into_iter()
            .flat_map(|g| g.items)
            .collect();

        assert!(items.iter().find(|i| i.key == "lemon").unwrap().bought);
        assert!(items.iter().find(|i| i.key == "flour").unwrap().skipped);
    }

    #[test]
    fn groups_come_back_in_shopping_order_and_empty_aisles_are_dropped() {
        let planned = vec![PlannedRecipe {
            title: "A".into(),
            ingredients: vec![ing("1", "lemon"), ing("4 fillets", "salmon, skin on")],
            batch: 1,
        }];

        let labels: Vec<&str> = build(&planned, &[], &HashMap::new())
            .iter()
            .map(|g| g.label)
            .collect();

        assert_eq!(labels, vec!["Produce", "Meat"]);
    }
}
