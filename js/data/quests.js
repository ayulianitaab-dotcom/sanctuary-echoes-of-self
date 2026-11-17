/* Sanctuary — quests, achievements, festivals and reflection prompts */
(function () {
  const D = SAN.data || (SAN.data = {});

  /* Objective kinds: talk, gift, collect, harv, catch, visit, memory, cook, craft, journal, decorate, flag */
  const Q = (D.quests = {});

  function q(def) { Q[def.id] = def; }

  /* ================= MAIN STORY (onboarding) ================= */
  q({
    id: 'main_arrive', title: 'A Room With A Window', giver: 'nyssa', type: 'main', auto: true,
    desc: 'You have a cottage, a key, and a whole quiet life ahead of you. Look around. Nothing here is urgent.',
    objectives: [{ kind: 'flag', target: 'looked_around', qty: 1, label: 'Look around your cottage' },
      { kind: 'talk', target: 'nyssa', qty: 1, label: 'Speak with Nyssa at the fountain' }],
    rewards: { money: 150, items: [['seed_lavender', 3], ['seed_marigold', 2]] },
    next: 'main_first_plant',
  });
  q({
    id: 'main_first_plant', title: 'Something Small and Green', giver: 'nyssa', type: 'main',
    desc: 'The garden behind your cottage is overgrown but not ruined. Nyssa says that things grow back. Even gardens. Even people.',
    objectives: [{ kind: 'plant', target: 'any', qty: 3, label: 'Plant 3 seeds in the garden' },
      { kind: 'water', target: 'any', qty: 3, label: 'Water 3 plots' },
      { kind: 'harv', target: 'any', qty: 1, label: 'Harvest your first crop' }],
    rewards: { money: 200, items: [['seed_bluebell', 2], ['fertilizer_note', 1]] },
    next: 'main_journal',
  });
  q({
    id: 'main_journal', title: 'A Page Of Your Own', giver: 'nyssa', type: 'main',
    desc: 'On your desk is a journal you did not buy. The first page says: "For whatever you cannot say out loud."',
    objectives: [{ kind: 'journal', target: 'any', qty: 1, label: 'Write your first journal entry' }],
    rewards: { money: 120, unlock: 'memory_vault' },
    next: 'main_meet',
  });
  q({
    id: 'main_meet', title: 'The People Here', giver: 'nyssa', type: 'main',
    desc: 'Eight names, eight lives, one very small village. Nobody expects you to remember them all today.',
    objectives: [{ kind: 'talk', target: 'any_npc', qty: 4, label: 'Introduce yourself to 4 villagers' }],
    rewards: { money: 250, items: [['bread', 2], ['yarn_ball', 1]] },
    next: null,
  });

  /* ================= QUESTLINE A: LIGHTHOUSE ================= */
  q({
    id: 'lh_1', title: 'The Light That Waits', giver: 'liora', type: 'story', line: 'Lighthouse',
    desc: 'Liora has been keeping the lamp alone for four years. The wind chime on her porch has been silent since the storm. She says it does not matter.',
    objectives: [
      { kind: 'talk', target: 'liora', qty: 1, label: 'Ask Liora about the quiet wind chime' },
      { kind: 'collect', target: 'shell', qty: 2, label: 'Gather 2 spiral shells from the shore' },
      { kind: 'talk', target: 'liora', qty: 1, label: 'Bring the shells back to Liora' },
    ],
    rewards: { money: 220, items: [['lighthouse_key', 1]], friendship: { liora: 12 }, unlock: 'lighthouse_key' },
    next: 'lh_2',
  });
  q({
    id: 'lh_2', title: 'Letters Never Sent', giver: 'liora', type: 'story', line: 'Lighthouse',
    desc: 'A faded photograph washed up on the beach. Two people by a lighthouse, a heart drawn on the back. Liora goes very quiet when she sees it.',
    objectives: [
      { kind: 'collect', target: 'old_photo', qty: 1, label: 'Find the photo on the eastern shore' },
      { kind: 'talk', target: 'liora', qty: 1, label: 'Show Liora the photograph' },
      { kind: 'flag', target: 'lh_letter_choice', qty: 1, label: 'Decide what to do with the unsent letters' },
    ],
    rewards: { money: 260, friendship: { liora: 14 }, items: [['sea_glass', 2]], recipe: 'craft_memlantern' },
    next: 'lh_3',
  });
  q({
    id: 'lh_3', title: 'A Light You Keep', giver: 'liora', type: 'story', line: 'Lighthouse',
    desc: 'The lamp needs lighting at dusk. Liora has always done it alone. She has not asked you to come. She has not not asked either.',
    objectives: [
      { kind: 'visit', target: 'lighthouse', qty: 1, label: 'Climb to the lighthouse lamp room' },
      { kind: 'talk', target: 'liora', qty: 1, label: 'Light the lamp with Liora' },
      { kind: 'decorate', target: 'any', qty: 1, label: 'Place something warm in your home' },
    ],
    rewards: { money: 450, items: [['pearl', 1], ['lamp_glow', 1]], friendship: { liora: 18 }, achievement: 'lighthouse_keeper' },
    next: null,
  });

  /* ================= QUESTLINE B: GREENHOUSE ================= */
  q({
    id: 'gh_1', title: 'The Door Left Open', giver: 'elowen', type: 'story', line: 'Greenhouse',
    desc: 'Elowen has been clearing the greenhouse alone. She says she is nearly done. The pile of weeds says otherwise.',
    objectives: [
      { kind: 'talk', target: 'elowen', qty: 1, label: 'Offer Elowen help (she will refuse)' },
      { kind: 'flag', target: 'gh_help_choice', qty: 1, label: 'Decide how to help without taking over' },
      { kind: 'collect', target: 'fiber', qty: 3, label: 'Bring 3 bundles of soft fiber for the beds' },
    ],
    rewards: { money: 180, friendship: { elowen: 12 }, items: [['greenhouse_key', 1]] },
    next: 'gh_2',
  });
  q({
    id: 'gh_2', title: 'Two Pairs Of Hands', giver: 'elowen', type: 'story', line: 'Greenhouse',
    desc: 'The beds are ready. Elowen is standing very still with a trowel, trying to work out how to accept help gracefully.',
    objectives: [
      { kind: 'plant_greenhouse', target: 'any', qty: 3, label: 'Plant 3 seeds in the shared greenhouse' },
      { kind: 'water_greenhouse', target: 'any', qty: 3, label: 'Water the shared beds together' },
      { kind: 'talk', target: 'elowen', qty: 1, label: 'Check in with Elowen' },
    ],
    rewards: { money: 240, friendship: { elowen: 15 }, items: [['seed_moonpetal', 2]] },
    next: 'gh_3',
  });
  q({
    id: 'gh_3', title: 'What We Grew', giver: 'elowen', type: 'story', line: 'Greenhouse',
    desc: 'Something is flowering in the shared greenhouse. Elowen has not said whether she is proud. Her hands say it for her.',
    objectives: [
      { kind: 'harv_greenhouse', target: 'any', qty: 1, label: 'Harvest a crop from the greenhouse' },
      { kind: 'talk', target: 'elowen', qty: 1, label: 'Sit with Elowen among the flowers' },
    ],
    rewards: { money: 380, items: [['seed_starflower', 2], ['glow_moss', 3]], friendship: { elowen: 18 }, achievement: 'trusted_hands' },
    next: null,
  });

  /* ================= QUESTLINE C: WINDMILL ================= */
  q({
    id: 'wm_1', title: 'The Loop', giver: 'rowan', type: 'story', line: 'Windmill',
    desc: 'Rowan has been re-reading a conversation in his head for three days. He knows it is a loop. Knowing has not helped yet.',
    objectives: [
      { kind: 'talk', target: 'rowan', qty: 1, label: 'Sit with Rowan at the windmill' },
      { kind: 'reframe', target: 'any', qty: 1, label: 'Help Rowan reframe one thought' },
    ],
    rewards: { money: 170, friendship: { rowan: 12 }, items: [['windmill_note', 1]] },
    next: 'wm_2',
  });
  q({
    id: 'wm_2', title: 'A Smaller Story', giver: 'rowan', type: 'story', line: 'Windmill',
    desc: 'Rowan\'s notes are scattered all over the village — a page in the library, one by the fountain, one folded into a bakery bag.',
    objectives: [
      { kind: 'collect', target: 'windmill_note', qty: 3, label: 'Find 3 of Rowan\'s scattered notes' },
      { kind: 'talk', target: 'rowan', qty: 1, label: 'Return the notes (or do not read them)' },
    ],
    rewards: { money: 260, friendship: { rowan: 16 }, items: [['moon_cookie', 2]] },
    next: 'wm_3',
  });
  q({
    id: 'wm_3', title: 'The Quiet After', giver: 'rowan', type: 'story', line: 'Windmill',
    desc: 'Rowan wants to try an evening without fixing anything. Just the windmill, the wind, and company.',
    objectives: [
      { kind: 'visit', target: 'windmill', qty: 1, label: 'Go to the windmill in the evening' },
      { kind: 'talk', target: 'rowan', qty: 1, label: 'Sit with Rowan and let the silence be fine' },
    ],
    rewards: { money: 400, items: [['glow_moss', 2], ['lavender_tea', 2]], friendship: { rowan: 18 }, achievement: 'quiet_mind' },
    next: null,
  });

  /* ================= SIDE QUESTS ================= */
  q({
    id: 'side_mira', title: 'Bread For The Baker', giver: 'mira', type: 'side',
    desc: 'Mira has been up since four. She would never ask. Bring her something she did not have to make herself.',
    objectives: [{ kind: 'gift', target: 'mira', qty: 1, label: 'Give Mira a gift she did not bake' }],
    rewards: { money: 120, items: [['honey_cake', 1]], friendship: { mira: 8 } },
  });
  q({
    id: 'side_finn', title: 'The Star Hook', giver: 'finn', type: 'side',
    desc: 'Finn lost his grandfather\'s hook somewhere on the pier. He says it does not matter, twice.',
    objectives: [{ kind: 'gift', target: 'finn', item: 'star_hook', qty: 1, label: 'Find the hook on the pier and return it to Finn' }],
    rewards: { money: 150, friendship: { finn: 10 }, items: [['starray', 1]] },
  });
  q({
    id: 'side_aria', title: 'Margins', giver: 'aria', type: 'side',
    desc: 'Aria is collecting village memories for the ledger. She would like something written by you — anything at all.',
    objectives: [{ kind: 'journal', target: 'any', qty: 2, label: 'Write 2 journal entries' }],
    rewards: { money: 140, items: [['moon_cookie', 1]], friendship: { aria: 9 } },
  });
  q({
    id: 'side_celeste', title: 'A Language Of Flowers', giver: 'celeste', type: 'side',
    desc: 'Celeste wants three different flowers to make a bouquet for the lighthouse. She will not say for whom.',
    objectives: [{ kind: 'collect', target: 'lavender', qty: 1, label: 'Lavender' },
      { kind: 'collect', target: 'bluebell', qty: 1, label: 'Bluebell' },
      { kind: 'collect', target: 'marigold', qty: 1, label: 'Marigold' }],
    rewards: { money: 200, friendship: { celeste: 10 }, items: [['flower_arrangement', 1]] },
  });
  q({
    id: 'side_theo', title: 'A Fair Trade', giver: 'theo', type: 'side',
    desc: 'Theo will not say what he is looking for. He says you will know it when you find it.',
    objectives: [{ kind: 'collect', target: 'music_box', qty: 1, label: 'Find a broken music box in the forest' },
      { kind: 'talk', target: 'theo', qty: 1, label: 'Show Theo the music box' }],
    rewards: { money: 300, items: [['sea_glass', 2]], friendship: { theo: 10 } },
  });
  q({
    id: 'side_cat', title: 'A Small Warm Thing', giver: 'nyssa', type: 'side',
    desc: 'Your cat has been sleeping in the same sunbeam all week. Maybe it needs a proper bed. Or maybe you both do.',
    objectives: [{ kind: 'craft', target: 'craft_catbed', qty: 1, label: 'Craft a cat bed' },
      { kind: 'decorate', target: 'cat_bed', qty: 1, label: 'Place it in your home' }],
    rewards: { money: 100, items: [['yarn_ball', 2]], friendship: {} },
  });
  q({
    id: 'side_memory', title: 'A Garden In Stone', giver: 'nyssa', type: 'side', unlocks: 'memory_vault',
    desc: 'In the Memory Forest there are stones that hold what people could not carry. You may water one. You may plant one flower. Nothing more is required.',
    objectives: [{ kind: 'memory', target: 'any', qty: 3, label: 'Care for a memory stone 3 times' }],
    rewards: { money: 160, items: [['memory_lantern', 1]], achievement: 'little_things' },
  });

  /* ================= DAILY BOARD QUESTS ================= */
  D.boardQuests = [
    { id: 'board_wood', text: 'The co-op needs 5 bundles of wood for the winter shed.', need: { wood: 5 }, money: 120, items: [['seed_marigold', 2]] },
    { id: 'board_catch', text: 'Finn bet the baker he could get three carp by noon. Help him win.', need: { carp: 3 }, money: 150, items: [['bread', 2]] },
    { id: 'board_flowers', text: 'Celeste needs five fresh daisies for the fountain arrangement.', need: { daisy: 5 }, money: 100, items: [['wild_lavender', 2]] },
    { id: 'board_stone', text: 'The garden path needs mending. Four smooth stones, please.', need: { stone: 4 }, money: 90, items: [['clay', 2]] },
    { id: 'board_berry', text: 'Mira is trying a new tart and needs six sunberries.', need: { berry: 6 }, money: 130, items: [['berry_tart', 1]] },
    { id: 'board_shell', text: 'The children are making a wind chime. They need three spiral shells.', need: { shell: 3 }, money: 110, items: [['yarn_ball', 1]] },
    { id: 'board_fiber', text: 'Aria is rebinding old books. Four bundles of fiber, if you have them.', need: { fiber: 4 }, money: 95, items: [['moon_cookie', 1]] },
    { id: 'board_herb', text: 'The Steeping Room ran out of wild herbs again.', need: { herb: 4 }, money: 100, items: [['lavender_tea', 1]] },
  ];

  /* ================= ACHIEVEMENTS ================= */
  D.achievements = [
    { id: 'first_sunrise', name: 'First Sunrise', desc: 'Wake up in Sanctuary for the first time.', icon: 'sun' },
    { id: 'garden_own', name: 'A Garden of My Own', desc: 'Harvest 10 crops.', icon: 'flower' },
    { id: 'friend_sanctuary', name: 'A Friend in Sanctuary', desc: 'Reach Friend with any villager.', icon: 'heart' },
    { id: 'letters_never_sent', name: 'Letters Never Sent', desc: 'Complete chapter two of the lighthouse story.', icon: 'letter' },
    { id: 'little_things', name: 'Little Things Matter', desc: 'Care for a memory stone three times.', icon: 'stone' },
    { id: 'lighthouse_keeper', name: 'The Lighthouse Keeper', desc: 'Light the lamp with Liora.', icon: 'lamp' },
    { id: 'trusted_hands', name: 'Trusted Hands', desc: 'Grow something together in the greenhouse.', icon: 'leaf' },
    { id: 'quiet_mind', name: 'A Quieter Mind', desc: 'Sit with Rowan through the quiet.', icon: 'wind' },
    { id: 'angler', name: 'Patient Waters', desc: 'Catch 15 fish.', icon: 'fish' },
    { id: 'decorator', name: 'Home Is Always Here', desc: 'Place 8 pieces of furniture.', icon: 'home' },
    { id: 'archivist', name: 'The Village Ledger', desc: 'Write 10 journal entries.', icon: 'book' },
    { id: 'wanderer', name: 'Every Path Eventually', desc: 'Discover all nine areas of Sanctuary.', icon: 'map' },
    { id: 'cat_friend', name: 'A Very Good Cat', desc: 'Become trusted by your cat.', icon: 'cat' },
    { id: 'memory_garden', name: 'A Garden of Quiet', desc: 'Bring a memory stone fully into bloom.', icon: 'bloom' },
  ];

  /* ================= FESTIVALS / VILLAGE EVENTS ================= */
  D.events = [
    {
      id: 'flower_festival', name: 'Flower Festival', season: 0, day: 14,
      desc: 'The square fills with cut stems and argument about arrangement. Celeste wins every year and pretends to be surprised.',
      bonus: 'Gifts given today count double. Celeste sells rare seeds.',
      area: 'village',
    },
    {
      id: 'tea_gathering', name: 'Evening Tea Gathering', season: 0, day: 21, hour: 18,
      desc: 'Everyone brings a cup and something to complain about, gently.',
      bonus: 'Friendship gained from talking is doubled this evening.',
      area: 'teashop',
    },
    {
      id: 'moonlight_fishing', name: 'Moonlight Fishing', season: 1, day: 8, hour: 20,
      desc: 'Lanterns on the pier, lines in the water, nobody keeping score (they are keeping score).',
      bonus: 'Rare fish appear more often tonight.',
      area: 'beach',
    },
    {
      id: 'rainy_market', name: 'Rainy Day Market', season: 1, day: 19,
      desc: 'The market moves under awnings. Everything is slightly damp and everyone is delighted.',
      bonus: 'Theo stocks rarities all day.',
      area: 'village',
    },
    {
      id: 'lantern_festival', name: 'Lantern Festival', season: 2, day: 12, hour: 19,
      desc: 'Paper lanterns go up the hill and out over the water. People write one thing they are done carrying.',
      bonus: 'Lighting a memory lantern grants a soul garden bloom.',
      area: 'village',
    },
    {
      id: 'cat_day', name: 'Cat Appreciation Day', season: 2, day: 24,
      desc: 'The village observes a solemn holiday in honour of cats, who are unimpressed.',
      bonus: 'Your cat finds extra gifts today.',
      area: 'village',
    },
    {
      id: 'memory_celebration', name: 'Memory Garden Celebration', season: 3, day: 6, hour: 17,
      desc: 'A quiet walk through the Memory Forest with candles. Nobody has to speak.',
      bonus: 'Memory stone care grants double growth.',
      area: 'forest',
    },
    {
      id: 'snowfall', name: 'First Snow', season: 3, day: 1,
      desc: 'Sanctuary goes white and quiet. Even the windmill pauses.',
      bonus: 'Snowy weather all week.',
      area: 'village',
    },
  ];
  D.eventOn = (season, day) => D.events.filter((e) => e.season === season && e.day === day);

  /* ================= REFLECTION PROMPTS ================= */
  D.reflectPrompts = [
    'What would you say to a friend who felt exactly this?',
    'Where do you feel this in your body right now?',
    'What is one small thing that would make tonight 5% easier?',
    'Was there a moment today that felt lighter than the rest?',
    'If this feeling could speak, what would it be asking for?',
    'What is something you did today that took effort nobody saw?',
    'Who is one person you feel safe being quiet with?',
    'What would "enough" look like today?',
    'Is there a boundary you wish you could say out loud?',
    'What is one thing you are allowed to stop doing?',
  ];
  D.moods = [
    { id: 'happy', label: 'Happy', color: '#e8b84b', icon: 'sun' },
    { id: 'sad', label: 'Sad', color: '#7f9fc4', icon: 'drop' },
    { id: 'anxious', label: 'Anxious', color: '#c58f6b', icon: 'knot' },
    { id: 'angry', label: 'Angry', color: '#c46b6b', icon: 'flame' },
    { id: 'lonely', label: 'Lonely', color: '#8a7fae', icon: 'moon' },
    { id: 'tired', label: 'Tired', color: '#9a9384', icon: 'cloud' },
    { id: 'grateful', label: 'Grateful', color: '#9bb178', icon: 'leaf' },
    { id: 'confused', label: 'Confused', color: '#a99bc0', icon: 'spiral' },
    { id: 'calm', label: 'Calm', color: '#8fb8b0', icon: 'wave' },
    { id: 'hopeful', label: 'Hopeful', color: '#e2a9a0', icon: 'star' },
  ];
  D.journalTags = ['work', 'friends', 'family', 'rest', 'growth', 'fear', 'gratitude', 'boundaries', 'the village', 'my cat'];

  /* ================= MEMORY OBJECTS ================= */
  D.memoryObjects = [
    { id: 'stone', name: 'Grey Stone', glyph: 'stone' },
    { id: 'lantern', name: 'Small Lantern', glyph: 'lantern' },
    { id: 'boat', name: 'Paper Boat', glyph: 'boat' },
    { id: 'seed', name: 'Paper Seed Packet', glyph: 'seed' },
    { id: 'letter', name: 'Unsent Letter', glyph: 'letter' },
    { id: 'shell', name: 'Spiral Shell', glyph: 'shell' },
  ];
  D.memoryEmotions = ['grief', 'fear', 'anger', 'shame', 'loneliness', 'relief', 'longing', 'hope'];
  D.memoryCare = [
    { id: 'water', label: 'Water the stone', line: 'You pour a little water at the base. Nothing demands anything of you.' },
    { id: 'flowers', label: 'Place flowers', line: 'You set three small flowers down in a careful ring.' },
    { id: 'letter', label: 'Write a letter', line: 'You write what you would have said. You keep the page. Or you do not.' },
    { id: 'lantern', label: 'Light a lantern', line: 'The wick catches. The dark moves back a little — not away, just back.' },
    { id: 'boat', label: 'Release a paper boat', line: 'It drifts. You do not follow it. That is allowed.' },
    { id: 'seed', name: 'Plant a symbolic seed', label: 'Plant a symbolic seed', line: 'You press a seed into the soil beside the stone. Something here is alive.' },
  ];
})();
