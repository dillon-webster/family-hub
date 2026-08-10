# Working on Family Hub

Read `README.md` first — it explains the core loop and why the shopping list is
derived rather than stored. This file is the stuff that is easy to get wrong.

## The design is final

`design/` holds the original Crave Crafted handoff: two HTML prototypes and the
token file. Colours, type, spacing, radii and copy in `design/README.md` are
exact values, not suggestions. When adding UI, take them from
`frontend/src/design/tokens.css` rather than inventing near-misses.

A few rules from the handoff that are easy to violate by accident:

- **Press feedback is colour only.** Nothing scales, bounces, or lifts. Use the
  `.pressable` class with `--bg` / `--bg-press`, or `.press-lift` for gradient
  tiles.
- **Numbers are always mono.** Times, quantities, dates, counts, the clock —
  `class="mono"` (DM Mono). Titles are always serif (Newsreader). Body is
  Hanken Grotesk.
- **Sentence case everywhere.** "Save to library", never "Save To Library".
  Verb-first for actions. One calm sentence of helper text. No emoji.
- **No photography.** Recipes are represented by category colour fields. If you
  add a category, it needs a gradient in `CATEGORY_FIELD`.

## Things that will bite you

**Dates are computed on the client, never the server.** Both surfaces derive the
week from the device clock and send explicit `YYYY-MM-DD` values. Use
`isoDate()` from `lib/week.ts`, never `toISOString()` — the latter is UTC and
shifts the date by a day for anyone west of UTC in the evening, which is exactly
when a kitchen display is being read.

**Bootstrap returns a wider plan range than the week on screen.** Home looks
four days past today, which crosses into next week from Thursday. Narrowing that
range makes planned dinners silently render as "nothing planned yet".

**Parse ingredient quantities in Rust, not TypeScript.** `split_quantity` in
`recipe_import.rs` is shared by the link importer and the manual form (which
posts `ingredient_lines`). Adding a second implementation in the browser is how
the two drift.

**Every mutation must publish on the bus.** `state.bus.publish(Topic::…)` is
what makes the other surface update. A handler that writes to the database and
publishes nothing works fine in a single-tab test and looks broken in the
kitchen. Anything touching recipe ingredients or the plan must publish
`Topic::Shopping` too, because the list is derived from both.

**Feed URLs never go to the browser.** `CalendarFeedPublic` deliberately has no
`url` field. A shared calendar address is a bearer token.

## Testing

`cargo test` covers the logic where a subtle bug hides: the ingredient merge,
aisle bucketing, the quantity splitter, ICS recurrence expansion. Add to it when
you touch any of those — they are pure functions and cheap to test.

`npm run test:e2e` needs a hub running (`BASE_URL` to point elsewhere). It
mutates the current week of whatever database it hits, so don't aim it at a
household's real hub.

## Stack notes

Rust 1.94+ is required (sqlx 0.9). The Dockerfile pins 1.95 rather than using a
floating tag. The frontend is React 19 + Vite with no router — `/phone` is the
companion, everything else is the display, which keeps the kiosk from ever
navigating.
