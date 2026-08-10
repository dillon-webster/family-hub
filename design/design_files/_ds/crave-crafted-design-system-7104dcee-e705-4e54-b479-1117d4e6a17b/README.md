# Crave Crafted — Design System

**Crave Crafted** is a warm, personal recipe-keeper. It lets people collect every
recipe they love in one place — typed in by hand, scanned from a cookbook with
the camera, or pulled in from the web via recipe search — then sort, tag, and
cook from them. The product's emotional promise is *warmth*: the unhurried,
homey feeling of a well-worn family cookbook, rebuilt as a calm modern app.

A signature feature is **personalization**: every user can re-theme one or two
accent colors so the app feels like *theirs*. The whole visual system is built
so that swapping `--primary` (and optionally `--accent`) recolors the product
coherently without breaking contrast or warmth.

> Tagline: **Keep every recipe you love in one place.**

---

## Provenance / sources

This system was created **from a written brief**, not from an existing codebase,
Figma file, or brand kit. There were **no source assets provided** — no logo,
no screenshots, no slide decks, no repository. Everything here (name, logo,
palette, type, components) is an original direction proposed to fit the brief:

> "An app that lets users store all of their favorite recipes in one place.
> Features: recipe sorting, camera scanning, and API search through recipes.
> Warm feeling. Users can customize one or two of the colors to personalize."

If you have brand assets, screenshots, or a real product to align with, hand
them over and this system should be re-grounded against them.

**Fonts** are loaded from the Google Fonts CDN (they *are* the chosen brand
fonts, so no substitution flag is needed):
- **Newsreader** — display / editorial / recipe titles (warm serif)
- **Hanken Grotesk** — UI & body (friendly humanist sans)
- **DM Mono** — quantities, timers, measurements (numeric mono)

**Icons** use **Lucide** (CDN) — a clean, consistent 2px line-icon set whose
rounded, friendly stroke matches Crave Crafted's warmth. See ICONOGRAPHY below.

---

## What's here

See the **Index** section at the bottom for a full file manifest.

---

## CONTENT FUNDAMENTALS — voice & tone

Crave Crafted talks like a **warm, capable friend in the kitchen** — never a
chef showing off, never a sterile utility. The tone is encouraging, unfussy,
and a little sensory.

- **Person:** Address the user as **you**; the app refers to itself rarely and
  by name ("Crave Crafted pulls out the ingredients for you"). First-person
  "we" is avoided in-product.
- **Casing:** **Sentence case everywhere** — buttons, titles, menu items
  ("Start cooking", "Save to library", "Add recipe"). The only UPPERCASE is the
  tracked **overline** label style (e.g. `RESULTS FROM THE WEB`, `MAKE IT
  YOURS`). Never Title Case buttons.
- **Length:** Short and active. Buttons are verb-first ("Save to library",
  "Scan a recipe", "Start cooking"). Helper text is one calm sentence ("Pick
  the color that flavors your whole app.").
- **Voice examples:**
  - Greeting: *"Good evening, Maya — what are you cooking?"*
  - Empty/search prompt: *"Search your library & the web"*
  - Scan success: *"Recipe detected"* → *"Recipe added from scan"*
  - Personalization: *"Make it yours"*, *"Pick the color that flavors your
    whole app."*
- **Sensory, not flowery:** recipe blurbs evoke texture and warmth ("Pillowy
  potato gnocchi crisped in nutty brown butter") but stay to one line.
- **Numbers & units:** quantities, times and temperatures are set in **DM Mono**
  (`30 min`, `200 g`, `350°F`, `1½ tbsp`) so they read as data, distinct from
  prose.
- **Emoji:** **Not used** in the UI. Warmth comes from color, serif type, and
  photography direction — not emoji. (The one playful flourish is the italic
  "*Crafted*" in the wordmark.)

---

## VISUAL FOUNDATIONS

**Overall vibe.** Modern cookbook. Warm cream "paper" surfaces, an editorial
serif for anything titular, a friendly sans for the working UI, and a single
appetizing accent (terracotta by default) that the user can change. Generous
softness — nothing sharp, nothing cold.

**Color.**
- A warm neutral spine: cream **paper** (`#FCF7EF`) backgrounds, near-white
  **card** surfaces, warm near-black **ink** text (`#2B2521`), warm-taupe
  secondaries. No pure white, no pure gray, no pure black anywhere.
- **Primary** is "Paprika" terracotta (`#C8553D`) — the single customizable
  brand hue. **Secondary** is "Basil" sage. Semantic colors are nudged warm
  (honey warning, tomato danger, garden-green success).
- **Imagery is replaced by color fields.** Per product direction recipes carry
  **no photos**; detail headers and cards use category-tinted color blocks and
  accent rules instead. Category colors: Dinner→terracotta, Breakfast→honey,
  Vegetarian→sage, Dessert→plum.

**Type.** Newsreader (serif) for display, headings and **recipe titles** — this
serif is the brand's signature. Hanken Grotesk for body and all UI chrome. DM
Mono for numerics. Display tracks tight (`-0.02em`); body is `1.5` line-height;
overlines track wide (`0.10em`) and uppercase.

**Spacing & layout.** 4px base scale. Comfortable, roomy padding (cards
~14–16px, screens ~20px gutters). Mobile-first; bottom tab bar floats as a
rounded card above a protection gradient; primary action (camera) is a center
FAB lifted above the bar.

**Corner radii.** Soft throughout — chips/tags 6px, buttons & inputs 10px,
menus/small cards 14px, recipe cards & sheets 20px, hero/modal 28px, pills &
avatars fully round. Nothing square.

**Elevation / shadows.** Warm-tinted only — every shadow uses a brown cast
(`rgba(67,47,28,…)`) so cards feel like paper lifting off paper, never glassy
gray. Five-step scale (xs→xl) plus an inset for wells. Cards rest at sm/md;
sheets and the FAB at lg; modals at xl.

**Borders.** Hairline warm borders (`#E9DDCA`) on cards and inputs; a stronger
warm line (`#DBCBB1`) for dividers and secondary-button outlines. Focus rings
are a 3px soft tint of the accent (`var(--primary-soft)`).

**Backgrounds.** Flat warm cream, occasionally a very subtle radial warm-up
toward the top (as on the kit's stage). No busy gradients, no textures, no
patterns. Color-field recipe headers carry a faint top-light radial + a gentle
bottom darkening to seat overlaid white text.

**Transparency & blur.** Used sparingly: round buttons floating over color-field
headers use a light blur + translucent fill; category chips over color fields
use a translucent white. The bottom-bar protection gradient fades cream→cream
to lift the tab bar off scrolling content.

**Motion.** Calm and quick. Interactive states transition ~0.15s. The only
looping motion is functional: the scan line sweeps during scanning and the
search caret blinks. No bounce, no parallax, no decorative animation.

**Hover / press states.** Primary fills darken on hover (`--primary-hover`) and
darken further on press (`--primary-press`); secondary/ghost controls shift to a
soft tint background. Selected chips/tabs fill with the accent. Avoid scale/
shrink effects — color change carries state.

**Cards.** Cream card surface, 1px warm hairline border, sm/md warm shadow,
20px radius. Recipe cards add a 4px category-color accent rule along the top, a
tinted category tag, a serif title, a hairline divider, then a mono-free meta
row. Calm, scannable, editorial — like entries in a cookbook index.

---

## ICONOGRAPHY

- **System:** **Lucide** (https://lucide.dev), loaded from CDN
  (`unpkg.com/lucide`). Chosen because its **2px rounded-stroke, open** style
  matches the brand's friendly warmth, and it has full coverage for a recipe
  app (clock, flame, star, bookmark, camera, search, folder, book-open, chef-
  hat, sparkles, etc.). This is a **substitution** for a bespoke set — the brief
  shipped no icons — flagged here so it can be swapped later.
- **Usage:** Line icons only, `stroke-width: 2`, sized 14–26px in-product. Icons
  inherit `currentColor` so they recolor with the theme. Filled variants are
  reserved for **rating stars** (gold) and the active **bookmark**.
- **No emoji, no unicode glyphs** as icons anywhere.
- **Logo / mark:** The brand mark is an original **steaming bowl** drawn in the
  *same* 2px rounded line language as the Lucide set, so mark and UI icons feel
  like one family. Files in `assets/`:
  - `mark.svg` — terracotta app-icon tile with cream glyph (primary lockup mark)
  - `mark-glyph.svg` — glyph only, `currentColor` (place on any background)
  - Wordmark: set in Newsreader, with "**Crave**" upright + "*Crafted*" italic
    (italic colored with the accent on light backgrounds).
- In React (`ui.jsx`) icons are rendered through an `<Icon name=… />` wrapper
  around `lucide.createIcons()`.

---

## INDEX — file manifest

Root:
- `README.md` — this file (brand context, voice, visual foundations, iconography)
- `colors_and_type.css` — all design tokens: fonts, color vars, semantic type
  classes, spacing, radii, shadows. **Import this in every artifact.**
- `SKILL.md` — Agent-Skill front matter so this folder works in Claude Code
- `assets/` — `mark.svg`, `mark-glyph.svg` (logo / app-icon)
- `preview/` — small specimen cards that populate the Design System tab
  (type, color, spacing, components, brand)
- `ui_kits/app/` — the **Crave Crafted iOS app** UI kit (see its own README)
- `screenshots/` — verification captures (not part of the system)

UI kits:
- `ui_kits/app/` — mobile recipe app: Library, Detail, Discover, Scan, You,
  Collections; live accent personalization.

No slide deck template was provided, so `slides/` is intentionally omitted.

