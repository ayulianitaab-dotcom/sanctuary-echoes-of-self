/* Sanctuary — cinematic scene catalog.
   Characters are NEVER redrawn: every scene composites the official character
   artwork over a location plate. Plates live in assets/scenes/backdrops/ and are
   produced once by tools/scene-generate.php, then cached and shipped offline. */
(function () {
  const D = SAN.data || (SAN.data = {});
  const SC = (D.scenes = {});

  SC.CATEGORIES = {
    daily: 'Daily Life',
    conversations: 'Conversations',
    romance: 'Romance',
    intimate: 'Intimate Moments',
    'special-events': 'Special Events',
    'npc-stories': 'NPC Stories',
  };

  /* ---------------- location plates ----------------
     file is relative to assets/scenes/backdrops/. Generated art is optional:
     a missing plate falls back to a painted gradient of the same palette, so
     the game never shows a broken image and never calls an API at runtime. */
  SC.BACKDROPS = {
    cottage_day: { file: 'cottage-day', name: 'Your Cottage', area: 'home', tint: 'day' },
    cottage_night: { file: 'cottage-night', name: 'Your Cottage, Evening', area: 'home', tint: 'night' },
    beach_sunset: { file: 'beach-sunset', name: 'The Shore at Sunset', area: 'beach', tint: 'dusk' },
    greenhouse: { file: 'greenhouse', name: 'The Shared Greenhouse', area: 'greenhouse', tint: 'day' },
    garden: { file: 'garden', name: 'The Garden', area: 'garden', tint: 'day' },
    village: { file: 'village-square', name: 'Sanctuary Village', area: 'village', tint: 'day' },
    library: { file: 'library', name: 'The Library', area: 'library', tint: 'warm' },
    lighthouse: { file: 'lighthouse-night', name: 'The Lighthouse', area: 'lighthouse', tint: 'night' },
    windmill: { file: 'village-square', name: 'The Windmill Yard', area: 'windmill', tint: 'day' },
    bakery: { file: 'bakery', name: "Mira's Bakery", area: 'bakery', tint: 'warm' },
    teashop: { file: 'teashop', name: 'The Tea Shop', area: 'teashop', tint: 'warm' },
    flower: { file: 'garden', name: 'The Flower Shop', area: 'flower', tint: 'day' },
    forest: { file: 'garden', name: 'The Memory Forest', area: 'forest', tint: 'forest' },
    meadow: { file: 'garden', name: 'The Hidden Meadow', area: 'meadow', tint: 'dusk' },
  };

  SC.AREA_BACKDROP = {
    home: 'cottage_day',
    beach: 'beach_sunset',
    greenhouse: 'greenhouse',
    garden: 'garden',
    village: 'village',
    library: 'library',
    lighthouse: 'lighthouse',
    windmill: 'windmill',
    bakery: 'bakery',
    teashop: 'teashop',
    flower: 'flower',
    forest: 'forest',
    meadow: 'meadow',
    grove: 'forest',
  };

  /* ---------------- activity & event framing ---------------- */
  SC.ACTIVITY_FRAMES = {
    walk: { cat: 'conversations', title: 'Walking Together', frame: 'side by side, unhurried, the village behind them' },
    hand: { cat: 'romance', title: 'Holding Hands', frame: 'close, fingers laced, a soft blush' },
    hug: { cat: 'romance', title: 'A Long Hug', frame: 'embracing, faces turned into each other\'s shoulders' },
    stargaze: { cat: 'romance', title: 'Under the Stars', frame: 'sitting on the grass, looking up, faces lit by starlight' },
    dance: { cat: 'romance', title: 'A Dance With No Music', frame: 'mid-turn, hands raised, skirt and coat in motion' },
    memory: { cat: 'conversations', title: 'Something True', frame: 'sitting close, speaking quietly, eyes lowered' },
    gift: { cat: 'romance', title: 'A Gift With Meaning', frame: 'offering a flower, both hands, a small smile' },
    dinner: { cat: 'romance', title: 'Dinner for Two', frame: 'candlelit table, two plates, leaning slightly in' },
    kiss: { cat: 'intimate', title: 'A First Kiss', frame: 'foreheads tilted together, eyes closed, tender' },
    cuddle: { cat: 'intimate', title: 'Close and Warm', frame: 'curled together, blanket, safe and quiet' },
    cook: { cat: 'daily', title: 'Cooking Together', frame: 'flour on sleeves, shared chopping board, laughing' },
    fire: { cat: 'intimate', title: 'By the Fire', frame: 'two chairs, one blanket, embers glowing' },
    craft: { cat: 'daily', title: 'Making Something Small', frame: 'hands busy over a workbench, thread and wood shavings' },
  };

  SC.EVENT_FRAMES = {
    friend: { cat: 'conversations', title: 'A Little Closer', frame: 'an easy conversation, shoulders relaxed' },
    story: { cat: 'npc-stories', title: 'Their Own Story', frame: 'a personal confession, guarded but honest' },
    date: { cat: 'romance', title: 'The First Date', frame: 'a table or a blanket, nervous happiness' },
    commit: { cat: 'romance', title: 'Choosing Each Other', frame: 'hands held, promises spoken, warm light' },
    anniversary: { cat: 'special-events', title: 'An Anniversary', frame: 'small gift, candles, comfortable silence' },
    confession: { cat: 'romance', title: 'The Confession', frame: 'one step closer, heart visibly fast, hopeful' },
    partner: { cat: 'special-events', title: 'A Shared Life', frame: 'the cottage doorway, morning light, together' },
    night: { cat: 'intimate', title: 'Morning After', frame: 'fade-to-black frame: only a rumpled quilt and dawn light, no figures' },
  };

  SC.CHAT_FRAMES = {
    first: { cat: 'conversations', title: 'A First Meeting', frame: 'introducing themselves, curious and polite' },
    emotional: { cat: 'conversations', title: 'A Hard Day', frame: 'sitting near, listening, no fixing' },
    serious: { cat: 'conversations', title: 'Something Serious', frame: 'facing each other, steady eye contact' },
    farewell: { cat: 'conversations', title: 'A Farewell', frame: 'a doorway, a last look back' },
  };

  SC.DAILY_SCENES = {
    cook: { cat: 'daily', title: 'Cooking', frame: 'at the stove, steam and herbs, sleeves pushed up' },
    craft: { cat: 'daily', title: 'At the Workbench', frame: 'focused hands, small tools, sawdust' },
    fish: { cat: 'daily', title: 'A Good Cast', frame: 'on the pier, rod bent, sea light' },
    harvest: { cat: 'daily', title: 'Harvest', frame: 'basket full, soil on hands, satisfied' },
    rest: { cat: 'daily', title: 'Rest', frame: 'curtains half drawn, quilt, quiet afternoon' },
    mochi: { cat: 'daily', title: 'Mochi', frame: 'a cat in a sunbeam, a hand reaching to pet' },
  };

  SC.TIME_TINT = {
    day: 'scene-tint-day', dawn: 'scene-tint-dawn', dusk: 'scene-tint-dusk',
    night: 'scene-tint-night', warm: 'scene-tint-warm', forest: 'scene-tint-forest',
  };

  SC.tintFor = function (minutes, weather) {
    if (weather === 'rain' || weather === 'storm') return 'rain';
    if (minutes == null) return 'day';
    if (minutes < 7 * 60) return 'dawn';
    if (minutes < 17 * 60) return 'day';
    if (minutes < 19 * 60 + 30) return 'dusk';
    return 'night';
  };

  SC.backdropFor = function (area, minutes, weather, prefer) {
    if (prefer && SC.BACKDROPS[prefer]) return prefer;
    let key = SC.AREA_BACKDROP[area] || 'village';
    if (area === 'home' && (SC.tintFor(minutes, weather) === 'night' || SC.tintFor(minutes, weather) === 'dusk')) key = 'cottage_night';
    return key;
  };

  SC.backdropPath = function (key, ext) {
    const b = SC.BACKDROPS[key] || SC.BACKDROPS.village;
    return 'assets/scenes/backdrops/' + b.file + '.' + (ext || 'jpg');
  };

  /* the ids used for generated full illustrations, if any ever exist */
  SC.sceneId = function (cat, npcId, key) {
    return (npcId ? npcId + '-' : '') + key;
  };

  /* ---------------- prompt builder (development only) ----------------
     The generator uses this so every plate is asked for in one consistent
     style; the game itself never builds prompts at runtime. */
  SC.STYLE_PROMPT = [
    'High-quality anime visual novel background illustration, romantic Victorian fantasy,',
    'soft pastel lighting, detailed environment, cinematic wide composition,',
    'lavender, cream, dusty pink, sage green and antique gold palette,',
    'painterly light, gentle depth of field, no text, no watermark, no characters, no people.',
  ].join(' ');

  SC.promptFor = function (backdropKey) {
    const b = SC.BACKDROPS[backdropKey] || SC.BACKDROPS.village;
    const subject = {
      'cottage-day': 'A cozy Victorian cottage interior in daylight: oak panel walls, cream plaster, long plank floor, lavender sofa, stone fireplace, lace table runner, potted lavender, warm morning light through lace-curtained windows.',
      'cottage-night': 'The same cozy Victorian cottage at night: fireplace glowing amber, candles, lavender quilt, deep blue dusk outside the windows, quiet and intimate.',
      'beach-sunset': 'A quiet pebble shore at sunset in a fantasy coastal village, lighthouse silhouette far off, warm rose and gold sky, gentle surf, wooden pier.',
      'greenhouse': 'The interior of a Victorian glass greenhouse, iron arches, ferns and seedlings on wooden benches, soft diffused daylight, watering cans.',
      'garden': 'A cottage garden in full bloom, lavender and sage beds, stone path, low stone wall, soft morning haze.',
      'village-square': 'A small fantasy village square with timber-framed cottages, a stone well, flower carts and bunting, golden afternoon light.',
      'library': 'A Victorian village library interior, tall oak shelves, warm lamps, reading table with books and a ladder, dust motes in window light.',
      'lighthouse-night': 'The lamp room of a lighthouse at night, brass lens glowing, iron stairs, sea and stars beyond the glass.',
      'bakery': 'A warm village bakery interior at dawn, wooden counter, bread loaves, flour dust in the light, copper pots.',
      'teashop': 'A cozy Victorian tea shop interior, lace curtains, small round tables, porcelain cups, hanging lamps.',
    }[b.file] || 'A cozy fantasy village interior, warm light and quiet detail.';
    return subject + ' ' + SC.STYLE_PROMPT;
  };

  /* full illustrations produced by an external reference-capable model are
     registered here by tools/scene-generate.php (empty until any exist) */
  SC.ILLUSTRATED = (typeof window !== 'undefined' && window.SAN_SCENE_ILLUSTRATED) || {};
})();
