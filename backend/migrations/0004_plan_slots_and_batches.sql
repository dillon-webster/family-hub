-- Three changes to what a planned day can say.
--
-- 1. A day has more than one meal on it. Lunch prep is planned on Sunday for
--    the week, so the plan needs a slot as well as a date.
-- 2. "Leftovers" is a third answer to what's for dinner, alongside cooking and
--    going out. Like eating out it counts as planned and contributes nothing to
--    the shopping list — that is the entire reason to record it.
-- 3. A night can be a double batch, which the shopping list has to multiply.

-- ------------------------------------------------------------------ slots ---
create type meal_slot as enum ('dinner', 'lunch');

alter table plan_entries add column slot meal_slot not null default 'dinner';

-- The primary key was the date alone, which is what limited a day to one meal.
alter table plan_entries drop constraint plan_entries_pkey;
alter table plan_entries add primary key (day, slot);

-- -------------------------------------------------------------- leftovers ---
-- The shape check comes off first. Its expression holds `plan_kind` literals,
-- and Postgres revalidates every constraint on the column when the column's
-- type changes — leaving it in place fails with "operator does not exist:
-- plan_kind_next = plan_kind". It is rebuilt at the bottom against the new type.
alter table plan_entries drop constraint plan_entry_shape;

-- A new enum type swapped in rather than `alter type ... add value`: Postgres
-- refuses to *use* a value added in the same transaction, and the rebuilt check
-- below has to name it. sqlx runs each migration in one transaction, so the
-- swap is the only version of this that works.
create type plan_kind_next as enum ('cook', 'out', 'leftovers');

alter table plan_entries
    alter column kind type plan_kind_next using kind::text::plan_kind_next;

drop type plan_kind;
alter type plan_kind_next rename to plan_kind;

-- ------------------------------------------------------------------ batch ---
-- How many times the recipe is being made. 1 is a normal night; 2 is the
-- double batch that halves next week's cooking. Capped at 4 because beyond
-- that someone is catering, not planning dinner.
alter table plan_entries
    add column batch smallint not null default 1 check (batch between 1 and 4);

-- ------------------------------------------------------------------ shape ---
alter table plan_entries add constraint plan_entry_shape check (
       (kind = 'cook'      and recipe_id is not null and out_place is null)
    or (kind = 'out'       and recipe_id is null)
    -- Leftovers of *what* is deliberately not recorded. The fridge knows, and
    -- asking someone to pick the originating recipe on a Tuesday is friction
    -- for a fact nothing downstream reads.
    or (kind = 'leftovers' and recipe_id is null and out_place is null)
);

-- Only a cooked night can be scaled; eating out and leftovers have no
-- ingredients to multiply.
alter table plan_entries add constraint plan_entry_batch_shape check (
    kind = 'cook' or batch = 1
);
