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

---

## Running it

```sh
cp .env.example .env      # set BIND_IP at minimum
docker compose up -d --build
```

Then open `http://<tailscale-ip>:3008` on the iPad and `…:3008/phone` on a
phone.

`BIND_IP` is the one setting you should not skip. It binds the hub to this
machine's Tailscale address, so it is reachable from your devices on the tailnet
and from nowhere else — not the LAN, not the internet, regardless of what the
firewall is doing. Get it with `tailscale ip -4`. Left unset, the hub answers
only on the host itself, which fails closed rather than open.

Everything else in `.env.example` has a working default.

### Serving it over HTTPS (recommended)

```sh
tailscale serve --bg --https=443 http://127.0.0.1:3008
```

Worth doing, because two browser features are gated on a secure context and
plain `http://100.x.y.z` is not one:

- **The live camera viewfinder** for scanning a cookbook page. Without HTTPS the
  scan route falls back to the system camera via a file picker — it still works,
  you just lose the viewfinder with the sweeping scan line.
- **The screen wake lock** that keeps the wall display lit. Without HTTPS, set
  the iPad's own Auto-Lock to Never instead.

---

## Putting the iPad on the wall

1. Open the hub in Safari and **Share → Add to Home Screen**. This matters: the
   installed app opens standalone with no Safari chrome, which is what Guided
   Access then locks onto. Opening it as a tab gets you an address bar in your
   kitchen forever.
2. **Settings → Display & Brightness → Auto-Lock → Never.**
3. **Settings → Accessibility → Guided Access → On**, and set a passcode.
4. Launch the hub from the home screen and triple-click the side button to
   start Guided Access.

The known gap, and it is a real one: **Guided Access does not survive a full
reboot.** After a power cut, someone has to unlock the iPad, open the app and
triple-click again. Everything else recovers on its own — the app reconnects its
event stream with a backoff, re-acquires the wake lock when the screen comes
back, and refetches on the way in from sleep so a display left running for weeks
never drifts.

---

## Recipes

Three ways in, all landing in the same library:

**Paste a link.** Most recipe sites publish their recipe as schema.org JSON-LD
because that is what search engines read. When one is there, the import is
exact, instant and free — real quantities, real steps, no guessing. For sites
that don't, the page text goes to Claude as a fallback.

**Scan a page.** A photo of a cookbook page or an index card, read by Claude
with structured output so the reply matches the recipe schema exactly — no prose
to strip, no JSON to repair. Needs `ANTHROPIC_API_KEY`. Without it the scan
route says so up front rather than failing at the camera.

**Type it in.** Ingredients go in as plain lines (`500 g potato gnocchi`); the
server splits the amount from the name using the same parser the link importer
uses, so there is one implementation of that rule rather than two that drift.

---

## Calendar

Two sources, merged:

- **Local events** added on the hub, owned by a household member, which is what
  colours the spine on the Home panel and the border on the day columns.
- **Subscribed ICS feeds** — Google Calendar, iCloud, a school calendar. Paste
  the secret address; recurring events are expanded to real occurrences, and
  feeds re-sync every 15 minutes.

Feed URLs are write-only. The address of a shared calendar is a bearer token in
disguise, so the API never sends it back to the browser and the hub never shows
it again once saved.

---

## Development

```sh
# Postgres for local work
docker compose up -d db

# Backend, with the frontend proxied through Vite
cd backend && DATABASE_URL=postgresql://postgres:localtest@127.0.0.1:5436/family_hub cargo run
cd frontend && npm run dev
```

```sh
cd backend  && cargo test        # 18 unit tests
cd frontend && npm run test:e2e  # 6 end-to-end tests, needs a running hub
```

The Rust tests cover the parts where a subtle bug would be invisible until it
mattered: ingredient merging and aisle bucketing, the quantity splitter, ICS
recurrence expansion. The Playwright tests cover both surfaces, including one
that opens the kitchen display and a phone side by side, plans a dinner on the
phone, and asserts it appears on the display — the one behaviour no unit test
can reach.

Set `BASE_URL` to point the e2e suite at a different hub (it defaults to
`http://127.0.0.1:3108`). Note that it plans and clears dinners in the current
week of whatever database it is pointed at.

### Layout

```
backend/
  src/shopping.rs        the merge: normalization, aisles, de-duplication
  src/recipe_import.rs   JSON-LD parsing and the quantity splitter
  src/claude.rs          vision + structured output for scanned pages
  src/ics.rs             feed parsing and recurrence expansion
  src/routes/            the API
  migrations/            schema and the seed library
frontend/
  src/design/            Crave Crafted tokens — colours, type, category fields
  src/hub/               the kitchen display
  src/phone/             the phone companion
  src/api/store.tsx      bootstrap, live event stream, wake-from-sleep recovery
design/                  the original handoff, kept for reference
```

---

## Notes on a few decisions

**The server has no idea what "today" means.** Both surfaces compute their own
week from the device clock and pass explicit dates to the API. That is what
keeps the display right through a DST change without the server knowing where
the house is.

**Both surfaces type on their own keyboard** for adding shopping items. The
system keyboard resizes the viewport when it opens, which shifts a fixed kiosk
layout and makes the phone's floating tab bar jump. The in-app one is part of
the sheet, so the list stays put while you add to it.

**The hub is unauthenticated by design.** It is reachable only from the tailnet,
and a kitchen display that asks who you are before showing you dinner is a
kitchen display nobody uses. If you ever expose it more widely, that assumption
is the first thing to revisit.

**No weather on the Home screen.** The design shows `74°F clear` next to the
clock; wiring it up needs a weather provider and a location, which is a
different feature. The clock and meridiem are there; the weather line is not.
