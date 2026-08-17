-- Categories become the household's own, rather than a closed set of four.
--
-- The original design fixed the categories because each one owns a gradient
-- that stands in for photography — there are no recipe photos in this product,
-- so the colour field is the only thing distinguishing one card from another.
-- That constraint does not go away by making the set editable: it moves. A
-- category now carries its own two-stop gradient, and creating one means
-- choosing those two colours, which is why they are `not null` here.

create table recipe_categories (
    id         uuid primary key default gen_random_uuid(),
    name       text not null unique,
    -- The two ends of the 160deg linear gradient the surfaces render. Stored
    -- as hex, the same way member colours are, because they are edited by a
    -- human picking swatches rather than computed.
    color_from text not null,
    color_to   text not null,
    position   int  not null default 0,
    created_at timestamptz not null default now()
);

-- The four from the handoff, with the exact values the frontend had hard-coded
-- in design/category.ts. These are not defaults to be improved on — they are
-- the Crave Crafted palette, and the seeded library is coloured by them.
insert into recipe_categories (name, color_from, color_to, position) values
    ('Dinner',     '#C8553D', '#8F3626', 0),
    ('Breakfast',  '#D9962B', '#9A6414', 1),
    ('Vegetarian', '#6E8B57', '#455A34', 2),
    ('Dessert',    '#7C4E6B', '#4E2E43', 3);

-- Repoint recipes at the table. Done as add-backfill-drop rather than a type
-- change so the enum values survive long enough to be matched by name.
alter table recipes add column category_id uuid references recipe_categories (id);

update recipes
   set category_id = c.id
  from recipe_categories c
 where c.name = recipes.category::text;

alter table recipes alter column category_id set not null;
alter table recipes drop column category;
alter table recipes drop constraint if exists recipes_category_id_fkey;

-- Restrict rather than cascade: deleting a category that recipes still use
-- would silently delete the recipes with it. The API turns this into a
-- sentence naming the count instead.
alter table recipes
    add constraint recipes_category_id_fkey
    foreign key (category_id) references recipe_categories (id) on delete restrict;

create index recipes_category_idx on recipes (category_id);

drop type recipe_category;
