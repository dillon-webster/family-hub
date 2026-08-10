-- Family Hub — initial schema.
--
-- A note on time: nothing here stores a "current week" or a server-side notion
-- of today. The iPad and the phone know their own timezone, so the client
-- computes which Monday a week starts on and passes explicit dates in. Day-level
-- columns are `date`; only genuine instants (calendar events) are timestamptz.
-- That keeps the kitchen display correct across DST without the server caring
-- what timezone the house is in.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- members ---
create table members (
    id         uuid primary key default gen_random_uuid(),
    name       text not null,
    initial    text not null,
    -- Hex, and it is load-bearing: it colors the avatar, the calendar legend,
    -- the 4px event spine on Home, and the 3px border on calendar cards.
    color      text not null,
    position   int  not null default 0,
    created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- recipes ---
-- The four categories are a closed set because each one owns a gradient in the
-- design system. Adding a fifth means designing a fifth color field.
create type recipe_category as enum ('Dinner', 'Breakfast', 'Vegetarian', 'Dessert');

create type recipe_source as enum ('manual', 'link', 'scan', 'seed');

create table recipes (
    id           uuid primary key default gen_random_uuid(),
    title        text not null,
    category     recipe_category not null,
    -- Kept as the human string ("1 hr 15") because that is what the design
    -- renders. time_minutes exists only so "Under 30 min" can filter.
    time_label   text not null,
    time_minutes int,
    serves_label text not null default '',
    blurb        text not null default '',
    source       recipe_source not null default 'manual',
    source_url   text,
    created_at   timestamptz not null default now()
);

create index recipes_created_at_idx on recipes (created_at desc);

create table ingredients (
    id        uuid primary key default gen_random_uuid(),
    recipe_id uuid not null references recipes (id) on delete cascade,
    position  int  not null,
    -- Blank qty is meaningful: "salt and pepper" has no amount, and the
    -- shopping merge deliberately skips those rather than listing them.
    qty       text not null default '',
    name      text not null
);

create index ingredients_recipe_idx on ingredients (recipe_id, position);

create table steps (
    id        uuid primary key default gen_random_uuid(),
    recipe_id uuid not null references recipes (id) on delete cascade,
    position  int  not null,
    body      text not null
);

create index steps_recipe_idx on steps (recipe_id, position);

-- ------------------------------------------------------------- week plan ---
create type plan_kind as enum ('cook', 'out');

-- One row per planned day; absence of a row means "nothing planned yet".
create table plan_entries (
    day        date primary key,
    kind       plan_kind not null,
    recipe_id  uuid references recipes (id) on delete cascade,
    -- Null with kind='out' renders as the generic "Eating out"; a value is a
    -- named spot like "Pino's pizza".
    out_place  text,
    updated_at timestamptz not null default now(),

    constraint plan_entry_shape check (
        (kind = 'cook' and recipe_id is not null and out_place is null)
     or (kind = 'out'  and recipe_id is null)
    )
);

-- --------------------------------------------------------- shopping list ---
-- The list itself is never stored: it is derived on every read from the week's
-- planned recipes, so editing a recipe or swapping a dinner is reflected
-- immediately. Only the human decisions about it are persisted.

-- Per-item decisions, keyed by the normalized ingredient key.
create table shopping_states (
    week_start date not null,
    item_key   text not null,
    bought     bool not null default false,
    -- "Already have it" from the review step. Skipped items never reach the list.
    skipped    bool not null default false,
    actor_id   uuid references members (id) on delete set null,
    updated_at timestamptz not null default now(),
    primary key (week_start, item_key)
);

-- Things added by hand at the store, which belong to no recipe.
create table shopping_extras (
    id         uuid primary key default gen_random_uuid(),
    week_start date not null,
    name       text not null,
    qty        text not null default '1',
    aisle      text not null,
    added_by   uuid references members (id) on delete set null,
    created_at timestamptz not null default now()
);

create index shopping_extras_week_idx on shopping_extras (week_start);

-- Whether the generated items have been reviewed and committed for a week.
create table week_meta (
    week_start  date primary key,
    approved    bool not null default false,
    approved_at timestamptz
);

-- ---------------------------------------------------------------- calendar --
create table calendar_feeds (
    id             uuid primary key default gen_random_uuid(),
    name           text not null,
    -- Secret ICS URLs. Never sent to the browser; the API returns feeds with
    -- the url column omitted.
    url            text not null,
    member_id      uuid references members (id) on delete set null,
    color          text,
    enabled        bool not null default true,
    last_synced_at timestamptz,
    last_error     text,
    created_at     timestamptz not null default now()
);

create table calendar_events (
    id           uuid primary key default gen_random_uuid(),
    title        text not null,
    starts_at    timestamptz not null,
    ends_at      timestamptz,
    all_day      bool not null default false,
    member_id    uuid references members (id) on delete set null,
    -- Null feed_id means a local event someone typed into the hub. Feed-backed
    -- events are replaced wholesale on each sync, so they must not be edited.
    feed_id      uuid references calendar_feeds (id) on delete cascade,
    external_uid text,
    created_at   timestamptz not null default now()
);

create unique index calendar_events_feed_uid_idx
    on calendar_events (feed_id, external_uid)
    where feed_id is not null and external_uid is not null;

create index calendar_events_starts_idx on calendar_events (starts_at);

-- ------------------------------------------------------------------ tasks ---
-- Buckets are the board's three columns: 0 short-term, 1 medium, 2 long.
create table tasks (
    id         uuid primary key default gen_random_uuid(),
    title      text not null,
    meta       text not null default '',
    bucket     smallint not null default 0 check (bucket between 0 and 2),
    done       bool not null default false,
    position   int not null default 0,
    created_at timestamptz not null default now()
);

create index tasks_bucket_idx on tasks (bucket, position);

-- ------------------------------------------------------------- out spots ---
-- The frequent-spot chips in the assign sheet.
create table out_spots (
    id       uuid primary key default gen_random_uuid(),
    name     text not null unique,
    position int not null default 0
);

-- -------------------------------------------------------------- settings ---
create table settings (
    key   text primary key,
    value text not null
);
