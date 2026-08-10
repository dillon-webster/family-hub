-- Seed the starting recipe library, household task board and frequent spots.
--
-- Members are deliberately NOT seeded here: they come from FAMILY_HUB_MEMBERS
-- at boot (see members::ensure_seeded), so the household can be named in .env
-- without editing SQL.

-- ---------------------------------------------------------------- recipes ---
insert into recipes (title, category, time_label, time_minutes, serves_label, blurb, source)
values
    ('Brown butter gnocchi',         'Dinner',     '30 min',  30, 'serves 4',  'Crisped in nutty brown butter and sage.',      'seed'),
    ('Lemon herb roast chicken',     'Dinner',     '1 hr 15', 75, 'serves 5',  'Sunday chicken with lemon under the skin.',    'seed'),
    ('Miso mushroom ramen',          'Vegetarian', '40 min',  40, 'serves 4',  'Deep, savory broth built in one pot.',         'seed'),
    ('Sheet-pan salmon & fennel',    'Dinner',     '35 min',  35, 'serves 4',  'One pan, fennel sweet under the fish.',        'seed'),
    ('Charred broccoli orecchiette', 'Vegetarian', '30 min',  30, 'serves 4',  'Blistered broccoli, garlic, lots of lemon.',   'seed'),
    ('Weekend shakshuka',            'Breakfast',  '25 min',  25, 'serves 3',  'Eggs poached in smoky tomato and pepper.',     'seed'),
    ('Buttermilk pancakes',          'Breakfast',  '20 min',  20, 'makes 12',  'The Saturday standard, thick and tangy.',      'seed'),
    ('Olive oil plum cake',          'Dessert',    '55 min',  55, 'serves 8',  'Late-summer plums sunk into a soft crumb.',    'seed');

-- Ingredients and steps are attached by title so this migration does not depend
-- on generated uuids.
insert into ingredients (recipe_id, position, qty, name)
select r.id, v.position, v.qty, v.name
from (values
    ('Brown butter gnocchi', 0, '500 g',     'potato gnocchi'),
    ('Brown butter gnocchi', 1, '85 g',      'unsalted butter'),
    ('Brown butter gnocchi', 2, '12 leaves', 'fresh sage'),
    ('Brown butter gnocchi', 3, '2 cloves',  'garlic, thinly sliced'),
    ('Brown butter gnocchi', 4, '40 g',      'parmesan, grated'),
    ('Brown butter gnocchi', 5, '½ tsp',     'flaky salt'),

    ('Lemon herb roast chicken', 0, '1.8 kg',  'whole chicken'),
    ('Lemon herb roast chicken', 1, '2',       'lemons, halved'),
    ('Lemon herb roast chicken', 2, '1 bunch', 'thyme'),
    ('Lemon herb roast chicken', 3, '3 tbsp',  'olive oil'),
    ('Lemon herb roast chicken', 4, '1 head',  'garlic, halved'),
    ('Lemon herb roast chicken', 5, '1 tbsp',  'kosher salt'),

    ('Miso mushroom ramen', 0, '400 g',  'mixed mushrooms'),
    ('Miso mushroom ramen', 1, '3 tbsp', 'white miso'),
    ('Miso mushroom ramen', 2, '1.4 L',  'vegetable stock'),
    ('Miso mushroom ramen', 3, '4 nests','ramen noodles'),
    ('Miso mushroom ramen', 4, '2 tsp',  'toasted sesame oil'),
    ('Miso mushroom ramen', 5, '4',      'soft-boiled eggs'),

    ('Sheet-pan salmon & fennel', 0, '4 fillets', 'salmon, skin on'),
    ('Sheet-pan salmon & fennel', 1, '2 bulbs',   'fennel, sliced thin'),
    ('Sheet-pan salmon & fennel', 2, '1',         'orange, sliced'),
    ('Sheet-pan salmon & fennel', 3, '3 tbsp',    'olive oil'),
    ('Sheet-pan salmon & fennel', 4, '½ tsp',     'chili flakes'),
    ('Sheet-pan salmon & fennel', 5, '',          'salt and pepper'),

    ('Charred broccoli orecchiette', 0, '400 g',    'orecchiette'),
    ('Charred broccoli orecchiette', 1, '2 heads',  'broccoli, in florets'),
    ('Charred broccoli orecchiette', 2, '4 cloves', 'garlic, sliced'),
    ('Charred broccoli orecchiette', 3, '60 ml',    'olive oil'),
    ('Charred broccoli orecchiette', 4, '1',        'lemon, zest and juice'),
    ('Charred broccoli orecchiette', 5, '50 g',     'pecorino'),

    ('Weekend shakshuka', 0, '2 tbsp', 'olive oil'),
    ('Weekend shakshuka', 1, '1',      'red pepper, diced'),
    ('Weekend shakshuka', 2, '1 tsp',  'smoked paprika'),
    ('Weekend shakshuka', 3, '800 g',  'crushed tomatoes'),
    ('Weekend shakshuka', 4, '5',      'eggs'),
    ('Weekend shakshuka', 5, '80 g',   'feta'),

    ('Buttermilk pancakes', 0, '250 g',  'all-purpose flour'),
    ('Buttermilk pancakes', 1, '2 tsp',  'baking powder'),
    ('Buttermilk pancakes', 2, '400 ml', 'buttermilk'),
    ('Buttermilk pancakes', 3, '2',      'eggs'),
    ('Buttermilk pancakes', 4, '50 g',   'melted butter'),
    ('Buttermilk pancakes', 5, '2 tbsp', 'sugar'),

    ('Olive oil plum cake', 0, '200 g',  'flour'),
    ('Olive oil plum cake', 1, '160 g',  'sugar'),
    ('Olive oil plum cake', 2, '120 ml', 'olive oil'),
    ('Olive oil plum cake', 3, '2',      'eggs'),
    ('Olive oil plum cake', 4, '6',      'plums, quartered'),
    ('Olive oil plum cake', 5, '1 tsp',  'vanilla')
) as v (recipe_title, position, qty, name)
join recipes r on r.title = v.recipe_title;

insert into steps (recipe_id, position, body)
select r.id, v.position, v.body
from (values
    ('Brown butter gnocchi', 0, 'Boil the gnocchi in well-salted water just until they float, about 2 minutes. Drain and pat dry.'),
    ('Brown butter gnocchi', 1, 'Melt the butter in a wide skillet over medium heat until it foams, smells nutty, and the milk solids turn amber.'),
    ('Brown butter gnocchi', 2, 'Add the sage and garlic, then the gnocchi in one layer. Leave them alone 3 minutes so they crisp.'),
    ('Brown butter gnocchi', 3, 'Toss, finish with parmesan and flaky salt, and serve straight from the pan.'),

    ('Lemon herb roast chicken', 0, 'Heat the oven to 425°F. Pat the chicken dry and salt it all over, inside too.'),
    ('Lemon herb roast chicken', 1, 'Tuck thyme and lemon halves into the cavity; rub oil over the skin.'),
    ('Lemon herb roast chicken', 2, 'Roast 55–65 minutes until the thigh reads 165°F and the skin is deep gold.'),
    ('Lemon herb roast chicken', 3, 'Rest 15 minutes before carving, then spoon the pan juices over.'),

    ('Miso mushroom ramen', 0, 'Sear the mushrooms hard in a dry pot until browned, then add sesame oil.'),
    ('Miso mushroom ramen', 1, 'Whisk the miso into a ladle of warm stock, then stir it back into the pot with the rest.'),
    ('Miso mushroom ramen', 2, 'Simmer 15 minutes; taste and adjust with soy and a splash of rice vinegar.'),
    ('Miso mushroom ramen', 3, 'Cook the noodles separately and ladle the broth over. Top with halved eggs and scallion.'),

    ('Sheet-pan salmon & fennel', 0, 'Heat the oven to 400°F. Toss fennel and orange with oil, salt, and chili on a sheet pan.'),
    ('Sheet-pan salmon & fennel', 1, 'Roast 15 minutes until the fennel edges brown.'),
    ('Sheet-pan salmon & fennel', 2, 'Nestle the salmon on top, oil the skin, and roast 12 minutes more.'),
    ('Sheet-pan salmon & fennel', 3, 'Finish with lemon and the fennel fronds.'),

    ('Charred broccoli orecchiette', 0, 'Boil the pasta; save a mug of the water before draining.'),
    ('Charred broccoli orecchiette', 1, 'Char the broccoli in a very hot pan with oil until spotted black in places.'),
    ('Charred broccoli orecchiette', 2, 'Add garlic and chili for 30 seconds, then the pasta and a splash of the water.'),
    ('Charred broccoli orecchiette', 3, 'Toss hard with pecorino, lemon zest, and juice until it turns glossy.'),

    ('Weekend shakshuka', 0, 'Soften the onion and pepper in oil for 8 minutes with the paprika and cumin.'),
    ('Weekend shakshuka', 1, 'Add the tomatoes and simmer until thick enough to hold a spoon trail.'),
    ('Weekend shakshuka', 2, 'Make wells and crack in the eggs; cover and cook 6 minutes for soft yolks.'),
    ('Weekend shakshuka', 3, 'Crumble over feta and parsley; eat with warm bread.'),

    ('Buttermilk pancakes', 0, 'Whisk the dry ingredients; whisk the wet ones separately.'),
    ('Buttermilk pancakes', 1, 'Fold together until just combined — lumps are fine. Rest 10 minutes.'),
    ('Buttermilk pancakes', 2, 'Cook on a buttered griddle over medium until bubbles set at the edges, then flip.'),
    ('Buttermilk pancakes', 3, 'Hold them in a 200°F oven until everyone is at the table.'),

    ('Olive oil plum cake', 0, 'Heat the oven to 350°F and line a 9-inch pan.'),
    ('Olive oil plum cake', 1, 'Beat the eggs and sugar until pale, then stream in the oil.'),
    ('Olive oil plum cake', 2, 'Fold in the dry ingredients, scrape into the pan, and press the plums on top.'),
    ('Olive oil plum cake', 3, 'Bake 40–45 minutes until the center springs back. Cool before slicing.')
) as v (recipe_title, position, body)
join recipes r on r.title = v.recipe_title;

-- ------------------------------------------------------------- out spots ---
insert into out_spots (name, position) values
    ('Pino''s pizza',  0),
    ('Bo''s taqueria', 1),
    ('Noodle bar',     2),
    ('Burger night',   3);

-- ----------------------------------------------------------------- tasks ---
insert into tasks (title, meta, bucket, position) values
    ('Take the recycling out',       'Bins go out tonight',           0, 0),
    ('Water the herb boxes',         'Back deck',                     0, 1),
    ('Sign the field-trip form',     'Due Friday',                    0, 2),
    ('Refill the dog food bin',      'Two scoops left',               0, 3),
    ('Book the dentist check-up',    'Before September',              1, 0),
    ('Replace the furnace filter',   'Last changed in April',         1, 1),
    ('Plan the birthday',            'Invite list first',             1, 2),
    ('Repaint the back deck',        'Two dry weekends needed',       2, 0),
    ('Get three solar quotes',       'One in, two to go',             2, 1),
    ('Research summer camps',        'Registration opens January',    2, 2);
