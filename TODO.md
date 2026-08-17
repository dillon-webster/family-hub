# Still to do

Written 2026-08-10, after the twelve changes from the kitchen notes went in.
All twelve shipped and are running on the hub; what follows is what that work
left behind, plus the gaps it exposed.

Ordered by whether it is currently wrong, not by effort.

---

## Live regressions from this round

**Past weeks shows lunches as if they were dinners.**
`byWeek()` in `frontend/src/lib/history.ts` groups every `PlanEntry` it is
given, and the plan now carries two slots per day. A day with both a dinner and
a lunch prep appears twice in the history sheet, same date, no way to tell which
row is which. Both surfaces use this loader, so both are wrong.

Probably: filter to `slot === 'dinner'` in `loadHistory`, since "what you've
cooked" has always meant dinners — or keep both and label the lunch row. The
first is one line and matches the sheet's existing copy.

---

## Gaps this work opened but did not close

**Editing a planned recipe still slips past approval.**
Planning a dinner now sends the week back to review (`reopen_weeks_covering` in
`backend/src/routes/plan.rs`). Editing the *ingredients* of a recipe that is
already planned does the same thing to the list — new items on a signed-off
list — and does not reopen it. Same hole, different door. The fix is the same
call from `recipes::update`, over the weeks that recipe is planned in.

**A category cannot be deleted while anything is in it.**
By design — the foreign key is `on delete restrict` and the API returns a
sentence naming the count. But there is no way to move those recipes somewhere
else first, so the only route is editing each recipe by hand. Wants a "move
these N recipes to …" step in the delete flow (`CategoriesSheet.tsx`).

**Double batch is the only batch.**
The database and the API accept 1–4 (`MAX_BATCH`), the quantity scaler is
tested at ×3, and the plan tile renders any `×N`. The UI only ever offers ×2,
because a checkbox was the right control for the question actually asked. If
×3 is ever wanted, the backend is already there and it is a control change.

**Hand-typed lunch items all land in one aisle.**
The hub's "Add to the list" in the lunch strip hardcodes `Bathroom / misc`
(`LunchStrip.tsx`). The shopping sheet's own keyboard asks which aisle; this one
does not, so a bag of apples lands next to the shampoo.

**No timer on the phone.**
`RecipeTimer` is hub-only. Reasonable — you cook at the hub — but the phone can
open a recipe and has no way to time anything.

**The shopping sheet does not close on Escape.**
Every `Sheet`-based panel does; the shopping sheet is its own overlay and
doesn't. Irrelevant on a kiosk with no keyboard, and it cost twenty minutes of
test debugging, which is the real argument for fixing it.

---

## Housekeeping

**The repo has no commits.**
`git init` was run; nothing has ever been committed. Everything from this round
exists only in the working tree and on the server. This is the highest-value
item on the page and the cheapest.

**The server runs an rsync, not a checkout.**
Deploying is `rsync` into `~/family-hub` on homeserver, then
`docker compose up -d --build`. There is no way to tell what version is running
or to roll back to the previous one short of re-syncing an older tree. Once
there are commits, deploying a tag would fix both.

**`Family Hub Kitchen Display.zip`** (426 KB) duplicates what is already in
`design/`. Commit it or ignore it, but decide.

**Backup before the next migration.** The pre-migration dump from this round is
`~/backups/family_hub-pre-migration-20260810-085508.sql.gz` on homeserver, with
the path also in `~/backups/LATEST_FAMILY_HUB_BACKUP`. There is no automatic
dump — the next schema change needs one taken by hand the same way.

---

## Worth considering, not asked for

**Weather on Home.** Still the gap the README calls out: the design shows
`74°F clear` next to the clock and there is no provider wired up.

**The scan importer picks from the household's categories now.** Adding a
category mid-week means the model can use it immediately, which is right — but
nothing tells the household that a category they add becomes an option for
scanned recipes. No action needed; worth knowing when the categories screen is
next touched.

**Guided Access does not survive a reboot.** Unchanged and unchangeable from
here; it is in the README because someone has to know it after a power cut.
