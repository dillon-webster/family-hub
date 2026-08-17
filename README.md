# Family Hub

The household's dinners, shopping, calendar and jobs, on two screens:

- **The kitchen display** — an iPad on the wall, always on, dark warm theme.
  Tonight's dinner, the week's plan, the recipe library, the family calendar,
  and a household task board.
- **The phone companion** — `/phone`, cream theme. The shopping list at the
  shop, recipe capture, and a compact week planner.

They stay in sync live. Plan a dinner on the phone and it lands on the kitchen
display before you put the phone back in your pocket.

Built from the Crave Crafted design handoff in `design/`. Rust + Axum on the
back, React on the front, Postgres underneath, reachable only over Tailscale.

---

## The core loop

Plan dinners for the week → the hub merges those recipes' ingredients into one
de-duplicated shopping list → someone reviews it and checks it off at the shop.

Three things about that loop are worth knowing, because they are the design:

**The shopping list is never stored.** It is rebuilt from the plan every time
anyone looks at it. Swap Thursday's dinner or fix a typo in a recipe and the
list is correct immediately. Only the human decisions are persisted — what has
been bought, what you already have, and what someone typed in at the shop.

**Ingredients merge on identity, not on text.** "garlic, thinly sliced" and
"garlic, halved" are one line reading `2 cloves + 1 head · 2 meals`. Everything
after the first comma is preparation, not identity. Quantities are listed rather
than summed: units differ, and a wrong total is worse than two amounts.

**Eating out is a plan, not an absence.** A night marked "eating out" counts
toward "4 of 7 planned" and contributes nothing to the shopping list. That
distinction is the whole reason the feature exists.
