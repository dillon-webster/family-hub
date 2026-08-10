# Handoff: Family Hub — kitchen display + phone companion

## Overview
Family Hub is a two-surface household app built on the **Crave Crafted** design system:

1. **Kitchen display (iPad, 1180 × 820 landscape, always-on, dark warm theme)** — the wall/counter screen: tonight's dinner, the week's meal plan, the recipe library, the family calendar, and a household task board.
2. **Phone companion (393 × 852, light cream theme)** — used at the store and away from home: the shopping list, recipe capture (camera scan / paste a link / type it in), and a compact week planner. It stays in sync with the hub.

Core loop: plan dinners for the week → the hub merges the recipes' ingredients into a de-duplicated shopping list → a family member reviews and checks it off on the phone. Any night can instead be marked **eating out**, which fills the slot and contributes nothing to the shopping list.

## About the design files
The files in `design_files/` are **design references authored in HTML** — prototypes showing intended look and behavior, not production code to copy. The task is to **recreate these designs in the target codebase's existing environment** (React Native, SwiftUI, React web, etc.) using its established components, routing, and data layer. If no environment exists yet, choose the framework that fits the product (an iPad kiosk display + an iOS phone app suggests React Native/Expo or SwiftUI) and implement there.

The prototypes are written with a small in-house template runtime (`<x-dc>`, `{{ holes }}`, `<sc-if>`, `<sc-for>`, and a `Component extends DCLogic` class at the bottom of each file). Treat the template as markup + the class as view-model logic; do not port the runtime.

## Fidelity
**High fidelity.** Colors, type, spacing, radii, copy, and interaction states are final and should be matched closely. All values below are exact. Sizes are given at the design canvas scale (the prototype scales the whole canvas to fit the viewport; in the real product, lay out natively at the device size).

---

## Screens — Kitchen display (`Family Hub.dc.html`, 1180 × 820)

Persistent chrome: a **104px left rail** (`#171412`, right border `1px rgba(252,247,239,0.08)`, padding `18px 0 20px`).
- Brand tile 44 × 44, radius 12, `#C8553D`, cream steaming-bowl glyph, 14px bottom margin.
- Five nav items, each 84 × 74, radius 16, icon 26px + 12px/600 label, 6px gap. Active: background `rgba(200,85,61,0.20)`, foreground `#E37A57`. Inactive: transparent, `#8E8073`. Press: `rgba(200,85,61,0.30)`. Order: Home, Meals, Recipes, Calendar, Tasks.
- Bottom: two 26px round member avatars — Maya `#C8553D`, Dan `#4F7CA0`, initials 12px/700 `#FFF8F2`.

Content area background `#1E1A17`. All screens pad `30px 34px`.

### 1. Home
- Header row: greeting `Newsreader 38px/500, -0.02em, #FAF3E9` ("Good evening, Maya"), sub `17px #BFB0A0` ("Wednesday, August 12 · 3 things on today"). Right: live clock `DM Mono 66px/500, -0.03em, tabular-nums` + `14px/700 uppercase 0.10em #8E8073` meridiem + weather line. Clock ticks every 20s.
- Body grid `1fr 386px`, gap 22.
- **Tonight card** (268px tall, `#2A2420`, border `1px rgba(252,247,239,0.09)`, radius 24, shadow `0 12px 28px rgba(0,0,0,0.28)`): left 214px category color field (`linear-gradient(160deg,#C8553D,#8F3626)`) with overline `Dinner` and `DM Mono 15px` "30 min · serves 4"; right: overline `Tonight`, title `Newsreader 44px/1.08`, blurb `17px #BFB0A0`, then buttons **Start cooking** (52px tall, radius 14, `#C8553D`, press `#A23F29`) and **See the week** (outline `1px rgba(252,247,239,0.20)`).
- **Rest of the week**: overline + 4-column grid of day cards (`#2A2420`, radius 18, padding `14px 14px 16px`): day short + date (`DM Mono 13px`), a 6px category color bar, title `Newsreader 19px`. Empty day → "Nothing planned yet" in `#8E8073`; eating-out day → the place name with a `#8A7B6B` bar. Tap: planned → nothing/plan screen; empty → Meals screen with that day's assign panel open.
- **Today panel** (right column, `#2A2420`, radius 24, padding 22): "Today" `Newsreader 26px` + "Week ›" link `#E37A57`; event rows (`#332C27`, radius 14, min-height 64) with a 4px owner-colored spine, title `18px/600`, owner `14px #8E8073`, time `DM Mono 16px #BFB0A0`; footer tile `#3A3129`, radius 14 — "N household tasks open" + "Board ›" in `#E3A85C`.

### 2. Meals (week plan)
- Header: "Meal plan" `Newsreader 36px`, sub "August 10 – 16 · N of 7 dinners planned". Right: **Shopping list** button (48px pill, `#C8553D`) + prev/next 52px square outline buttons.
- 7-column grid, row height ≤ 470, gap 12. Each column = day header chip (today: `rgba(200,85,61,0.20)` bg, `#E37A57` text) + slot card (radius 20, `#2A2420`, border `1px rgba(252,247,239,0.09)`).
  - **Cooking**: 150px category color field with the category overline; body: title `Newsreader 22px`, time `DM Mono 13px #8E8073`.
  - **Eating out**: 150px field `linear-gradient(160deg,#8A7B6B,#5A4E43)` with overline `EATING OUT`; body: place name (or "Eating out") `Newsreader 22px`, meta "no cooking".
  - **Empty**: transparent `rgba(252,247,239,0.02)` with `2px dashed rgba(252,247,239,0.16)` (`2px dashed #C8553D` while that day is the active assign target); centered 56px round `+` and "Tap to add dinner".
  - Tap: cooking → opens that recipe's detail; empty/out → opens the assign panel for that day.
- **Assign panel** (right sheet, 430px, `#241F1B`, left border `1px rgba(252,247,239,0.12)`, shadow `-24px 0 48px rgba(0,0,0,0.35)`, scrim `rgba(12,10,9,0.55)`):
  - Header: overline `Assign dinner`, day label `Newsreader 30px` ("Thu, August 13"), 52px round close.
  - Section overline **NOT COOKING** → "Going out to eat" row (`#2E2823`, radius 16, min-height 72): 56px tile with the taupe gradient + utensils icon, title `Newsreader 20px`, sub "Nothing is added to the shopping list". Below it a wrapping row of 40px outline chips of frequent spots: **Pino's pizza, Bo's taqueria, Noodle bar, Burger night** — picking a chip stores that name as the day's label.
  - Section overline **FROM YOUR LIBRARY** → recipe rows (56px swatch, `Newsreader 20px` title, `DM Mono 13px` "time · category").
- **Shopping list sheet** (640px right sheet): a ~1.4s "Reading N dinners and merging what repeats…" pulse state, then the merged list grouped by aisle with counts; "N left to buy" header.

### 3. Recipes
- Header "Recipes" + count; **Add recipe** pill (`#C8553D`) and filter pills (All selected `rgba(200,85,61,0.22)`/`#E37A57`; Dinner, Vegetarian, Under 30 min outlined — visual only in the prototype).
- 4-column card grid, gap 16: 104px category color field with category overline, body with `Newsreader 23px` title, blurb, `DM Mono` meta.
- **Add recipe sheet** (470px): menu of three routes — *Paste a link* (terracotta icon tile), *Scan a cookbook page* (sage), *Type it in* (honey). Link route shows the URL in a mono field → ~1.6s "Reading the page…" pulse → "Recipe found" preview card → **Save to library**. Scan route shows a 300px camera frame with a 2px `#E37A57` scan line sweeping (2.2s ease-in-out loop) → "Recipe detected" → preview → save. Manual route shows Name / Time / Serves fields and category pills → save. A **Back** button returns to the menu. Saved recipes are appended to the library and are immediately assignable.
- **Recipe detail** (full-bleed over the content area): 196px category color header with a 56px translucent blurred back button, category overline, title `Newsreader 44px`; body grid `352px 1fr` — ingredients column (`#241F1B`, qty in `DM Mono 16px #E37A57` with 86px min width, name `18px`, hairline `rgba(252,247,239,0.07)` dividers) and Method column of numbered step cards (`#2A2420`, radius 16, 38px round number in `rgba(200,85,61,0.18)`/`#E37A57`, step text `20px/1.5`).

### 4. Calendar
"This week" + date range; legend dots Maya `#C8553D`, Dan `#4F7CA0`. 7-column grid of day columns (radius 18, today highlighted); each event is a card with a 3px left border in the owner's color, `DM Mono 13px` time and `15px/600` title.

### 5. Tasks (Household)
"Household" + "N open · tap a card to check it off". 3-column bucket board (`#241F1B`, radius 22): bucket overline in the bucket color + open count in `DM Mono`; task cards toggle done on tap (done → dimmed with strikethrough).

---

## Screens — Phone companion (`Family Hub Phone.dc.html`, 393 × 852)

Canvas `#FCF7EF`, radius 44, custom status bar (54px, `DM Mono 15px` clock left, signal/battery right). Bottom chrome: a 118px cream protection gradient, a floating tab bar (`left/right 16px, bottom 26px`, 74px tall, `#FFFDF9`, border `1px #E9DDCA`, radius 26, shadow `0 12px 28px rgba(67,47,28,0.14)`) with **List** and **Week** tabs (active `#C8553D`, inactive `#9C8E7E`) and a centered 66px terracotta camera FAB lifted `-26px`, plus a home indicator.

### List (shopping)
- "Shopping list" `Newsreader 32px` + subtitle that switches between "N added by hand · N waiting to be checked" and "N left · from this week's dinners".
- **Review banner** (`#F7E4D9`, border `#EBC9B8`, radius 18) with the pending count in a 42px terracotta circle → opens the review screen.
- Sync strip (`#F6EDDE`, radius 14) with a sage dot: "Synced with the kitchen hub · just now".
- Aisle groups: colored dot + uppercase aisle overline, then item rows (`#FFFDF9`, border `1px #E9DDCA`, radius 16, min-height 60, shadow `0 1px 3px rgba(67,47,28,0.08)`): 30px round checkbox, name `17px/600` (strikethrough + 0.45 opacity when bought), `DM Mono 13px` quantity, and a 26px `#4F7CA0` "D" avatar when another member added it. Each group ends with a dashed **Add item** row that opens the in-app keyboard sheet.
- **Keyboard sheet** (`#EFE3D0`, radius 24 top): draft field with a blinking `#C8553D` caret, **Add** button, "Adding to {aisle}" overline, QWERTY rows of 33 × 46 keys, plus Cancel / space / ⌫.
- **Review screen**: "Check before adding" (honey overline), grouped items, tap to skip/keep, primary button "Add N items to the list".

### Week
Day rows (min-height 80, radius 18): day short + `DM Mono 20px` date (today in `#C8553D`), 48px swatch, title + meta. Planned → recipe title and "time · category"; **eating out** → taupe gradient swatch, place name, meta "Eating out · no cooking"; empty → `#EFE3D0` swatch, "Add a dinner", "Tap to pick from the library". Tapping any row opens the assign sheet.

**Assign sheet** (600px bottom sheet, `#FCF7EF`, radius 28 top, grabber): header overline "Assign dinner" + day label; then the **Going out to eat** row (taupe gradient tile, "Nothing added to the shopping list") and the four spot chips (38px, border `#DBCBB1`); then the **FROM YOUR LIBRARY** overline and the recipe rows. Any pick closes the sheet and fires the toast "Sent to the kitchen hub".

### Capture (FAB)
"Add a recipe" → 300px dark camera frame with dashed guide and the sweeping `#E37A57` scan line, **Scan this page** button, an "Or" divider, then *Paste a link* and *Type it in* rows. Shooting shows "Reading the page…" (~1.5s) then a "Recipe found" card (color field + title + `DM Mono` meta + parsed-ingredient summary) with **Save to the hub** / **Not this one**.

### Toast
Bottom toast (`#2B2521`, radius 18, above the tab bar), sage check circle, message `16px/600`, auto-dismiss ~2s.

---

## Interactions & behavior
- **Assign a dinner**: tap an empty (or existing) day → assign sheet → pick a library recipe *or* "Going out to eat" *or* a named spot → the day slot fills, the sheet closes, phone shows a confirmation toast.
- **Eating out**: stored as the day's plan value; renders with the taupe field, counts toward "N of 7 planned", and is **excluded from shopping-list generation**. Re-tapping the day reopens the sheet so it can be changed.
- **Shopping-list generation**: iterate the week's planned recipes, skip eating-out days, normalize ingredient names to a key, merge duplicates (keep one entry, note the extra sources), bucket each into an aisle by keyword, then let the user review before items are committed.
- **Check off**: tapping an item toggles bought (strikethrough + 0.45 opacity). Tapping a review item toggles skipped ("already have it").
- **Add recipe** (both surfaces): three routes — link, scan, manual — each with a simulated processing state, a found/preview state, and a save that appends to the shared library.
- **Tasks**: tap toggles done.
- **Timing**: all hover/press color transitions `0.15s`; scan line `2.2s ease-in-out infinite`; pulse dots `1.1s ease-in-out infinite`; processing states resolve after ~1.4–1.6s; toast ~2s.
- **Press feedback is color only** — no scale or bounce.

## State
| State | Shape | Notes |
|---|---|---|
| `screen` / `tab` | enum | hub: home / plan / recipes / cal / tasks · phone: list / capture / plan |
| `plan` | array of 7 values | recipe id, `'out'`, `'out:<place>'`, or `null` |
| `assignDay` | 0–6 or null | non-null opens the assign panel/sheet |
| `detailId` | recipe id or null | recipe detail overlay |
| `addMode` | null / menu / link / linkFound / scan / scanFound / manual | add-recipe flow |
| `added` | recipe[] | recipes saved this session, merged with the seed library |
| `bought`, `skipped` | key → bool | shopping-list item state |
| `extras` | item[] | hand-added items (name, qty, aisle, who) |
| `approved` | bool | whether generated items have been committed to the list |
| `kbAisle`, `draft` | string | in-app keyboard |
| `toast` | string or null | phone confirmation |
| `now` | Date | clock, 20s tick |

Real implementation needs: a recipe store (with ingredient rows), a week plan keyed by date, a derived shopping list, per-member attribution, and live sync between hub and phone (the copy promises near-instant sync both ways).

## Design tokens (Crave Crafted)
`design_files/_ds/.../colors_and_type.css` holds the canonical token set; the hub uses the dark variant of the same palette.

**Warm neutrals (phone / light):** paper `#FCF7EF`, card `#FFFDF9`, well `#F6EDDE`, pressed `#EFE3D0`, hairline `#E9DDCA`, line `#DBCBB1`, ink `#2B2521`, body `#6F6357`, muted `#9C8E7E`.

**Dark surfaces (hub):** page `#1E1A17`, desk `#14110F`, rail `#171412`, card `#2A2420`, raised `#2E2823` / `#332C27`, sheet `#241F1B`, field `#1C1815`, border `rgba(252,247,239,0.08–0.12)`; text `#FAF3E9`, secondary `#BFB0A0`, muted `#8E8073`.

**Brand & category:** primary `#C8553D` (press `#A23F29`, on-dark accent `#E37A57`), Dinner `#C8553D` / gradient `160deg #C8553D→#8F3626`, Breakfast `#D9962B` → `#9A6414`, Vegetarian `#6E8B57` → `#455A34`, Dessert `#7C4E6B` → `#4E2E43`, **Eating out `#8A7B6B` → `#5A4E43`**. Members: Maya `#C8553D`, Dan `#4F7CA0`. Success `#6E8B57` / `#3F7D4F`, warning `#D9962B` / `#E3A85C`.

**Type:** Newsreader (serif) for titles — 19/20/22/23/26/30/32/36/38/44px at weight 500, tracking `-0.02em` on large sizes. Hanken Grotesk for UI/body — 11–20px, 400/600/700. DM Mono for all numbers, times, quantities and the clock. Overline = 11–12px, 700, uppercase, `0.10em` tracking, muted color. Body line-height 1.5; titles 1.15–1.28.

**Spacing:** 4px base. Screen gutters 20px (phone) / 30–34px (hub). Card padding 12–26px. Grid gaps 10–22px.

**Radii:** chips 6–7, buttons/inputs 14–18, small cards 14–18, cards/sheets 20–26, hero/phone frame 28–44, pills/avatars 999.

**Shadows (warm brown cast only):** `0 1px 3px rgba(67,47,28,0.08)`, `0 4px 12px rgba(67,47,28,0.10)`, `0 12px 28px rgba(67,47,28,0.14–0.28)`, FAB `0 10px 22px rgba(200,85,61,0.42)`, hub sheets `-24px 0 48px rgba(0,0,0,0.35)`.

**Touch targets:** nothing below 44px; list rows 60–88px; primary buttons 52–64px.

## Assets
- Icons: **Lucide** (2px rounded stroke) — inlined as SVG in the prototypes; use the Lucide package in the codebase. Sizes 14–28px, `currentColor`.
- Brand mark: original steaming-bowl glyph in the same 2px line language (`mark.svg` / `mark-glyph.svg` in the design system).
- Fonts: Newsreader, Hanken Grotesk, DM Mono (Google Fonts).
- **No photography** — recipes intentionally use category color fields instead of images.

## Files
```
design_files/
  Family Hub.dc.html          iPad kitchen display (1180×820)
  Family Hub Phone.dc.html    phone companion (393×852)
  support.js                  prototype runtime (reference only — do not port)
  _ds/crave-crafted-design-system-.../
    colors_and_type.css       canonical design tokens
    _ds_bundle.js             design-system components used by the prototypes
    README.md                 brand, voice & tone, visual foundations
```
Open either `.dc.html` in a browser to interact with the prototype. In each file the markup is the template and the `<script type="text/x-dc">` block at the bottom is the view-model (seed data, derived values, handlers).

## Voice & copy rules
Sentence case everywhere (never Title Case buttons); verb-first actions ("Start cooking", "Save to library", "Add a dinner", "Going out to eat"); one calm sentence of helper text; numbers and units in DM Mono; no emoji.
