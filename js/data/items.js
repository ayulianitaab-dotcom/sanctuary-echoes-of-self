/* Sanctuary — item, crop, fish, recipe, furniture and shop definitions */
(function () {
  const D = SAN.data || (SAN.data = {});
  const I = (D.items = {});

  function item(id, name, cat, sell, desc, extra) {
    I[id] = Object.assign({
      id, name, cat, sell, desc, icon: id, rarity: 'common', stack: 99,
    }, extra || {});
  }

  /* ---------- Materials ---------- */
  item('wood', 'Bundle of Wood', 'materials', 4, 'Warm-smelling timber from the Memory Forest. Used for crafting.', { buy: 12 });
  item('stone', 'Smooth Stone', 'materials', 3, 'Rounded by years of river water. Good for garden paths.', { buy: 10 });
  item('fiber', 'Soft Fiber', 'materials', 2, 'Spun from wild grass and vines. The village\'s favourite crafting staple.', { buy: 6 });
  item('clay', 'Pale Clay', 'materials', 5, 'Cool to the touch, perfect for small pots.', { buy: 14 });
  item('shell', 'Spiral Shell', 'materials', 8, 'You can hear the tide inside it, even far from the sea.', { buy: 26 });
  item('sea_glass', 'Sea Glass', 'materials', 14, 'A shard of green glass polished soft by the ocean.', { rarity: 'uncommon' });
  item('pearl', 'Moonlit Pearl', 'materials', 60, 'It holds a little of the moon inside.', { rarity: 'rare' });
  item('iron', 'Old Iron', 'materials', 10, 'Salvaged from the lighthouse stairs. Still strong.', { buy: 30 });
  item('glow_moss', 'Glow Moss', 'materials', 16, 'It glows faintly, like a held breath.', { rarity: 'uncommon' });
  item('flour', 'Stone-milled Flour', 'materials', 12, 'Mira\'s flour. Soft as an apology.', { buy: 30 });
  item('honey', 'Wild Honey', 'materials', 20, 'Sticky gold from the meadow hives.', { buy: 48 });
  item('berry', 'Sunberry', 'materials', 6, 'A small sweet berry from forest bushes.');
  item('herb', 'Wild Herb', 'materials', 5, 'Smells like rain on a warm afternoon.');
  item('snowdrop', 'Snowdrop', 'flowers', 18, 'It only blooms when the world is quiet.', { rarity: 'uncommon' });

  /* ---------- Wild flowers ---------- */
  item('daisy', 'White Daisy', 'flowers', 8, 'A simple flower that always turns toward the light.', { giftTags: ['gentle'] });
  item('forget_me_not', 'Forget-Me-Not', 'flowers', 12, 'A tiny blue promise.');
  item('wild_lavender', 'Wild Lavender', 'flowers', 10, 'Crush a stem between your fingers and the whole day softens.');
  item('wild_rose', 'Bramble Rose', 'flowers', 14, 'It grows where nobody planted it, and blooms anyway.');

  /* ---------- Seeds ---------- */
  item('seed_lavender', 'Lavender Seeds', 'seeds', 10, 'Grows in 3 days. Likes gentle weather.', { buy: 24, crop: 'lavender' });
  item('seed_marigold', 'Marigold Seeds', 'seeds', 8, 'Grows in 2 days. Cheerful and quick.', { buy: 18, crop: 'marigold' });
  item('seed_moonpetal', 'Moonpetal Seeds', 'seeds', 22, 'Grows in 4 days. Blooms best in Autumn.', { buy: 55, crop: 'moonpetal' });
  item('seed_sunrose', 'Sunrose Seeds', 'seeds', 18, 'Grows in 3 days. Loves Summer light.', { buy: 44, crop: 'sunrose' });
  item('seed_bluebell', 'Bluebell Seeds', 'seeds', 14, 'Grows in 3 days. A Spring favourite.', { buy: 34, crop: 'bluebell' });
  item('seed_starflower', 'Starflower Seeds', 'seeds', 40, 'Grows in 5 days. Rare, and worth the wait.', { buy: 95, crop: 'starflower' });
  item('seed_pumpkin', 'Pumpkin Seeds', 'seeds', 16, 'Grows in 4 days. Heavy, warm, Autumn.', { buy: 38, crop: 'pumpkin' });
  item('seed_carrot', 'Carrot Seeds', 'seeds', 9, 'Grows in 2 days. Reliable little things.', { buy: 20, crop: 'carrot' });

  /* ---------- Crops ---------- */
  item('lavender', 'Lavender Bundle', 'crops', 26, 'Calming, fragrant, a little bit magic.');
  item('marigold', 'Marigold', 'crops', 20, 'Orange as a kitchen window at dusk.');
  item('moonpetal', 'Moonpetal', 'crops', 58, 'Pale petals that open only at night.', { rarity: 'uncommon' });
  item('sunrose', 'Sunrose', 'crops', 48, 'It stores warmth for the evening.');
  item('bluebell', 'Bluebell', 'crops', 36, 'The sound of a bell you almost remember.');
  item('starflower', 'Starflower', 'crops', 120, 'A flower with a tiny constellation in each petal.', { rarity: 'rare' });
  item('pumpkin', 'Pumpkin', 'crops', 42, 'Big enough to sit on. Warm enough to share.');
  item('carrot', 'Carrot', 'crops', 18, 'Sweet and crooked, like most good things.');

  /* ---------- Fish ---------- */
  item('minnow', 'Minnow', 'fish', 8, 'Small, quick, endlessly optimistic.', { rarity: 'common' });
  item('carp', 'Mud Carp', 'fish', 16, 'Patient and unbothered.', { rarity: 'common' });
  item('bass', 'Lake Bass', 'fish', 34, 'A proper catch. Fights with its whole body.', { rarity: 'common' });
  item('moonfin', 'Moonfin', 'fish', 70, 'Its scales catch moonlight even underwater.', { rarity: 'uncommon' });
  item('silverfin', 'Silverfin', 'fish', 95, 'Silver as a held breath.', { rarity: 'uncommon' });
  item('koi', 'Pink Koi', 'fish', 130, 'A fish that belongs to a pond in a story.', { rarity: 'rare' });
  item('starray', 'Starray', 'fish', 180, 'It glows faintly, like a fallen star that learned to swim.', { rarity: 'rare' });
  item('glassfish', 'Glass Fish', 'fish', 240, 'You can see its heart beating through its skin.', { rarity: 'rare' });
  item('memoryfish', 'Memoryfish', 'fish', 480, 'It surfaces only where something was once lost.', { rarity: 'legendary' });

  /* ---------- Food ---------- */
  item('bread', 'Warm Bread', 'food', 22, 'Still warm. Butter optional, but recommended.', { energy: 18, buy: 55, giftTags: ['cozy'] });
  item('berry_tart', 'Sunberry Tart', 'food', 48, 'A little tart, a little sweet. Like most days.', { energy: 26, giftTags: ['sweet'] });
  item('lavender_tea', 'Lavender Tea', 'food', 55, 'Steam curls and your shoulders drop.', { energy: 30, giftTags: ['gentle'] });
  item('honey_cake', 'Honey Cake', 'food', 85, 'Dense, golden, and generous.', { energy: 40, giftTags: ['sweet'] });
  item('pumpkin_soup', 'Pumpkin Soup', 'food', 70, 'The colour of a lantern on a cold evening.', { energy: 38, giftTags: ['cozy'] });
  item('fish_stew', 'Harbour Stew', 'food', 95, 'Finn\'s recipe. Tastes like being welcome.', { energy: 45, giftTags: ['cozy'] });
  item('flower_salad', 'Flower Salad', 'food', 60, 'Edible petals. Reminds you the day is a gift.', { energy: 32, giftTags: ['gentle'] });
  item('moon_cookie', 'Moon Cookie', 'food', 78, 'Cut into a crescent. Best eaten slowly.', { energy: 36, giftTags: ['sweet'] });

  /* ---------- Furniture / decor ---------- */
  const furn = (id, name, price, desc, extra) =>
    item(id, name, 'furniture', Math.round(price * 0.4), desc, Object.assign({ buy: price, placeable: true }, extra || {}));
  furn('bed_oak', 'Oak Four-Poster Bed', 0, 'A bed big enough for a whole quiet life.');
  furn('bed_rose', 'Rose Linen Bed', 320, 'Lavender sheets that smell of summer.');
  furn('chair_wicker', 'Wicker Chair', 120, 'It creaks kindly.');
  furn('chair_velvet', 'Velvet Armchair', 260, 'For sitting in, pretending to read.');
  furn('table_round', 'Round Tea Table', 180, 'Big enough for two cups.');
  furn('bookshelf_tall', 'Tall Bookshelf', 240, 'Smells of paper and patience.');
  furn('rug_rose', 'Rose Wool Rug', 200, 'Soft underfoot, warm in colour.');
  furn('rug_sage', 'Sage Round Rug', 180, 'Like standing on a meadow.');
  furn('lamp_glow', 'Glow Lamp', 160, 'A jar of bottled dusk.');
  furn('lamp_candle', 'Candle Cluster', 70, 'Small flames, big comfort.');
  furn('plant_fern', 'Potted Fern', 90, 'A little green opinion in the corner.');
  furn('plant_lavender', 'Lavender Pot', 110, 'The room smells like rest.');
  furn('painting_sea', 'Sea Painting', 300, 'Painted by someone who missed the water.');
  furn('curtain_lace', 'Lace Curtains', 220, 'Sunlight comes through in pieces.');
  furn('cat_bed', 'Cat Bed', 140, 'A round nest with a soft blanket.');
  furn('cat_tower', 'Cat Tower', 260, 'Three levels of excellent views.');
  furn('garden_bench', 'Garden Bench', 150, 'For sitting and not fixing anything.');
  furn('memory_lantern', 'Memory Lantern', 0, 'A lantern for the Memory Vault. Holds a warm, steady light.');
  furn('wind_chime', 'Shell Wind Chime', 0, 'It speaks when the wind does.');
  furn('flower_arrangement', 'Flower Arrangement', 0, 'A small celebration in a vase.');
  furn('bird_feeder', 'Bird Feeder', 0, 'The garden gets noisier and better.');

  /* ---------- Quest / collectible items ---------- */
  item('letter_unopened', 'Sealed Letter', 'quest', 0, 'Addressed to you, in handwriting you almost recognise.', { stack: 1 });
  item('windmill_note', 'Windmill Note', 'quest', 0, 'A page of crossed-out thoughts. Rowan\'s.', { stack: 1 });
  item('lighthouse_key', 'Lighthouse Key', 'quest', 0, 'Cold iron, warm meaning.', { stack: 1 });
  item('greenhouse_key', 'Greenhouse Key', 'quest', 0, 'A brass key with a leaf pressed into it.', { stack: 1 });
  item('memory_shard', 'Memory Shard', 'quest', 0, 'A fragment of something bright.', { stack: 1 });
  item('music_box', 'Broken Music Box', 'collectibles', 90, 'It plays three notes, then stops, then tries again.', { stack: 1, rarity: 'uncommon' });
  item('old_photo', 'Faded Photograph', 'collectibles', 0, 'Two people by a lighthouse. Someone has drawn a heart on the back.', { stack: 1 });
  item('camera', 'Brass Camera', 'tools', 0, 'A heavy little camera with a leather strap. It has seen more than it lets on.', { stack: 1, rarity: 'rare' });
  item('letter_old', 'Sealed Letter', 'quest', 0, 'Addressed only: "The lighthouse. For whoever is there." The ink has bled at the edges.', { stack: 1 });
  item('letter_unknown', 'Unsent Letter', 'collectibles', 0, 'A letter someone never sent. It is not yours to read. It is yours to keep.', { stack: 1 });
  item('feather', 'Gull Feather', 'collectibles', 4, 'Soft, white, slightly judgemental.', { stack: 1 });
  item('sea_letter', 'Bottle Letter', 'collectibles', 0, '"If you are reading this, the tide brought you something kind."', { stack: 1 });
  item('brass_key', 'Tarnished Brass Key', 'collectibles', 0, 'It opens something in the village. Probably.', { stack: 1 });
  item('star_hook', 'Star Hook', 'collectibles', 0, 'A fishing hook shaped like a star. Finn\'s grandfather made it.', { stack: 1 });
  item('cat_collar', 'Silver Cat Collar', 'quest', 0, 'A tiny bell that rings when your cat trots.', { stack: 1 });
  item('firefly_jar', 'Firefly Jar', 'collectibles', 0, 'Borrowed light, to be returned at dawn.', { stack: 1 });
  item('yarn_ball', 'Yarn Ball', 'materials', 20, 'Cat toy and crafting material in one.', { buy: 40 });

  /* ---------- Crops data ---------- */
  D.crops = {
    lavender: { id: 'lavender', name: 'Lavender', seed: 'seed_lavender', item: 'lavender', days: 3, stages: 4, water: 1, seasons: [0, 1], yield: [1, 2], xp: 8 },
    marigold: { id: 'marigold', name: 'Marigold', seed: 'seed_marigold', item: 'marigold', days: 2, stages: 4, water: 1, seasons: [0, 1, 2], yield: [1, 2], xp: 6 },
    moonpetal: { id: 'moonpetal', name: 'Moonpetal', seed: 'seed_moonpetal', item: 'moonpetal', days: 4, stages: 5, water: 1, seasons: [2], yield: [1, 2], xp: 14 },
    sunrose: { id: 'sunrose', name: 'Sunrose', seed: 'seed_sunrose', item: 'sunrose', days: 3, stages: 5, water: 1, seasons: [1], yield: [1, 2], xp: 12 },
    bluebell: { id: 'bluebell', name: 'Bluebell', seed: 'seed_bluebell', item: 'bluebell', days: 3, stages: 4, water: 1, seasons: [0], yield: [2, 3], xp: 10 },
    starflower: { id: 'starflower', name: 'Starflower', seed: 'seed_starflower', item: 'starflower', days: 5, stages: 5, water: 2, seasons: [1, 2], yield: [1, 1], xp: 22 },
    pumpkin: { id: 'pumpkin', name: 'Pumpkin', seed: 'seed_pumpkin', item: 'pumpkin', days: 4, stages: 5, water: 1, seasons: [2], yield: [1, 1], xp: 14 },
    carrot: { id: 'carrot', name: 'Carrot', seed: 'seed_carrot', item: 'carrot', days: 2, stages: 4, water: 1, seasons: [0, 2], yield: [1, 3], xp: 5 },
  };

  /* ---------- Fish data ---------- */
  D.fish = {
    minnow: { id: 'minnow', name: 'Minnow', diff: 0.18, speed: 0.5, areas: ['beach', 'garden', 'forest'], time: 'any', weather: 'any', minLevel: 0, size: 'Tiny' },
    carp: { id: 'carp', name: 'Mud Carp', diff: 0.28, speed: 0.6, areas: ['garden', 'forest'], time: 'any', weather: 'any', minLevel: 0, size: 'Small' },
    bass: { id: 'bass', name: 'Lake Bass', diff: 0.42, speed: 0.85, areas: ['garden', 'forest', 'beach'], time: 'any', weather: 'any', minLevel: 1, size: 'Medium' },
    moonfin: { id: 'moonfin', name: 'Moonfin', diff: 0.5, speed: 0.9, areas: ['beach', 'garden'], time: 'night', weather: 'any', minLevel: 2, size: 'Medium' },
    silverfin: { id: 'silverfin', name: 'Silverfin', diff: 0.55, speed: 1.05, areas: ['beach'], time: 'morning', weather: 'any', minLevel: 2, size: 'Medium' },
    koi: { id: 'koi', name: 'Pink Koi', diff: 0.6, speed: 0.95, areas: ['forest', 'garden'], time: 'any', weather: 'any', minLevel: 3, size: 'Large' },
    starray: { id: 'starray', name: 'Starray', diff: 0.7, speed: 1.15, areas: ['beach', 'forest'], time: 'night', weather: 'clear', minLevel: 4, size: 'Large' },
    glassfish: { id: 'glassfish', name: 'Glass Fish', diff: 0.78, speed: 1.25, areas: ['beach', 'garden'], time: 'night', weather: 'rain', minLevel: 4, size: 'Large' },
    memoryfish: { id: 'memoryfish', name: 'Memoryfish', diff: 0.9, speed: 1.4, areas: ['beach', 'forest'], time: 'any', weather: 'fog', minLevel: 6, size: 'Huge' },
  };

  /* ---------- Cooking recipes ---------- */
  D.cookRecipes = [
    { id: 'cook_tea', out: 'lavender_tea', name: 'Lavender Tea', need: { lavender: 2, honey: 1 }, energy: 30, desc: 'Steep slowly. Breathe.' },
    { id: 'cook_tart', out: 'berry_tart', name: 'Sunberry Tart', need: { berry: 3, flour: 1 }, energy: 26, desc: 'Sweet things take time.' },
    { id: 'cook_cake', out: 'honey_cake', name: 'Honey Cake', need: { honey: 2, flour: 2, berry: 1 }, energy: 40, desc: 'For sharing, mostly.' },
    { id: 'cook_soup', out: 'pumpkin_soup', name: 'Pumpkin Soup', need: { pumpkin: 1, herb: 1 }, energy: 38, desc: 'Warmth you can hold.' },
    { id: 'cook_stew', out: 'fish_stew', name: 'Harbour Stew', need: { carp: 1, carrot: 1 }, energy: 45, desc: 'Finn\'s father\'s recipe.' },
    { id: 'cook_salad', out: 'flower_salad', name: 'Flower Salad', need: { daisy: 2, carrot: 1 }, energy: 32, desc: 'A little ridiculous. Lovely.' },
    { id: 'cook_cookie', out: 'moon_cookie', name: 'Moon Cookie', need: { moonpetal: 2, flour: 1 }, energy: 36, desc: 'Eat it while looking up.' },
    { id: 'cook_bread', out: 'bread', name: 'Warm Bread', need: { flour: 2 }, energy: 18, desc: 'The beginning of everything.' },
  ];

  /* ---------- Crafting ---------- */
  D.craftRecipes = [
    { id: 'craft_bench', out: 'garden_bench', name: 'Garden Bench', need: { wood: 4 }, level: 0 },
    { id: 'craft_arrangement', out: 'flower_arrangement', name: 'Flower Arrangement', need: { lavender: 2, fiber: 1 }, level: 0 },
    { id: 'craft_lamp', out: 'lamp_glow', name: 'Glow Lamp', need: { wood: 2, sea_glass: 1, glow_moss: 1 }, level: 1 },
    { id: 'craft_memlantern', out: 'memory_lantern', name: 'Memory Lantern', need: { sea_glass: 2, iron: 1 }, level: 1 },
    { id: 'craft_fern', out: 'plant_fern', name: 'Potted Fern', need: { fiber: 3, clay: 1 }, level: 0 },
    { id: 'craft_rug', out: 'rug_rose', name: 'Rose Wool Rug', need: { fiber: 6, lavender: 3 }, level: 2 },
    { id: 'craft_curtain', out: 'curtain_lace', name: 'Lace Curtains', need: { fiber: 4, shell: 1 }, level: 1 },
    { id: 'craft_painting', out: 'painting_sea', name: 'Sea Painting', need: { wood: 2, shell: 2 }, level: 2 },
    { id: 'craft_chime', out: 'wind_chime', name: 'Shell Wind Chime', need: { shell: 3, iron: 1 }, level: 1 },
    { id: 'craft_feeder', out: 'bird_feeder', name: 'Bird Feeder', need: { wood: 3, fiber: 1 }, level: 0 },
    { id: 'craft_cattoy', out: 'yarn_ball', name: 'Yarn Ball', need: { fiber: 2 }, level: 0 },
    { id: 'craft_planter', out: 'plant_lavender', name: 'Lavender Pot', need: { clay: 2, lavender: 1 }, level: 0 },
    { id: 'craft_catbed', out: 'cat_bed', name: 'Cat Bed', need: { fiber: 4, wood: 2 }, level: 1 },
    { id: 'craft_cattower', out: 'cat_tower', name: 'Cat Tower', need: { wood: 6, fiber: 3 }, level: 3 },
    { id: 'craft_table', out: 'table_round', name: 'Round Tea Table', need: { wood: 5, iron: 1 }, level: 2 },
    { id: 'craft_chair', out: 'chair_wicker', name: 'Wicker Chair', need: { fiber: 5, wood: 2 }, level: 1 },
    { id: 'craft_bookshelf', out: 'bookshelf_tall', name: 'Tall Bookshelf', need: { wood: 8, iron: 2 }, level: 3 },
  ];

  /* ---------- Shops ---------- */
  D.shops = {
    store: {
      name: 'Sanctuary General Store',
      keeper: null,
      line: 'The co-op shelves are tidy, labelled in three different handwritings.',
      stock: ['seed_lavender', 'seed_marigold', 'seed_carrot', 'seed_bluebell', 'seed_sunrose', 'seed_pumpkin',
        'flour', 'honey', 'fiber', 'wood', 'stone', 'clay', 'yarn_ball'],
    },
    flower: {
      name: 'Celeste\'s Flower Shop',
      keeper: 'celeste',
      line: 'Celeste is trimming stems. "Take your time. They do."',
      stock: ['seed_moonpetal', 'seed_starflower', 'daisy', 'wild_lavender', 'wild_rose', 'forget_me_not', 'plant_lavender', 'flower_arrangement'],
    },
    bakery: {
      name: 'Mira\'s Bakery',
      keeper: 'mira',
      line: 'The whole shop smells like an apology you didn\'t know you needed.',
      stock: ['bread', 'berry_tart', 'honey_cake', 'flour', 'honey'],
    },
    teashop: {
      name: 'The Steeping Room',
      keeper: null,
      line: 'A kettle sings somewhere behind the counter. Nobody is there. It feels fine.',
      stock: ['lavender_tea', 'moon_cookie', 'flower_salad', 'herb', 'honey'],
    },
    theo: {
      name: 'Theo\'s Traveling Cart',
      keeper: 'theo',
      line: '"Ah! A customer with taste. Or at least curiosity."',
      stock: ['pearl', 'sea_glass', 'glow_moss', 'iron', 'star_hook', 'music_box', 'snowdrop', 'furn_seed_mystery'],
    },
  };

  D.itemList = Object.keys(I);
  D.byCategory = (cat) => D.itemList.filter((id) => I[id].cat === cat).map((id) => I[id]);

  D.item = (id) => I[id] || {
    id, name: id, cat: 'materials', sell: 1, desc: 'A small mystery.', rarity: 'common', stack: 99,
  };

  D.rarityColor = {
    common: '#8b7d6b', uncommon: '#5b8a72', rare: '#7a6bb5', legendary: '#c08a3e',
  };
})();
