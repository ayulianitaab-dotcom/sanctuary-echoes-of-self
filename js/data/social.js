/* Sanctuary — city life data: daily, seasonal and special village events,
   plus the relationships the NPCs have with each other.
   Events only fire when their context is true: hour, weather, season, place,
   relationship stage, and how recently they were seen. */
(function () {
  const D = SAN.data || (SAN.data = {});
  const C = (D.city = {});

  C.SEASONS = ['spring', 'summer', 'autumn', 'winter'];

  /* ---------------- daily life ---------------- */
  C.DAILY = [
    {
      id: 'market_morning',
      title: 'Morning Market',
      hours: [6, 11],
      areas: ['village'],
      npcPool: ['mira', 'celeste', 'theo', 'finn'],
      backdrop: 'village-square',
      cooldownDays: 2,
      pages: (c) => [
        { speaker: 'narrator', text: 'Bread, flowers, and somebody arguing gently about the price of rope.' },
        { speaker: c.npc, text: '"You are here early. Good. Hold this and look like you know what to do with it."' },
      ],
      memory: 'The morning market, with flour on everything.',
    },
    {
      id: 'tea_afternoon',
      title: 'Afternoon Tea',
      hours: [13, 17],
      areas: ['teashop'],
      npcPool: ['aria', 'elowen', 'celeste', 'nyssa'],
      backdrop: 'teashop',
      cooldownDays: 2,
      pages: (c) => [
        { speaker: 'narrator', text: 'The tea shop is warm and half empty. Two cups arrive without being ordered.' },
        { speaker: c.npc, text: '"I was going to sit alone. This is better. Do not make it a thing."' },
      ],
      memory: 'An unhurried cup of tea in the village tea shop.',
    },
    {
      id: 'street_food_evening',
      title: 'Evening Street Food',
      hours: [17, 20],
      areas: ['village'],
      npcPool: ['finn', 'mira', 'rowan'],
      backdrop: 'bakery',
      cooldownDays: 2,
      pages: (c) => [
        { speaker: 'narrator', text: 'Someone is frying something in a pan too small for the crowd around it.' },
        { speaker: c.npc, text: '"Careful, it is hot. I have already burned myself twice, for research."' },
      ],
      memory: 'Street food eaten standing up, out of a paper cone.',
    },
    {
      id: 'night_market',
      title: 'Night Market',
      hours: [19, 23],
      areas: ['village'],
      npcPool: ['theo', 'celeste', 'mira'],
      backdrop: 'village-square',
      cooldownDays: 3,
      pages: (c) => [
        { speaker: 'narrator', text: 'Lanterns, ribbons, and a merchant who insists everything is a bargain.' },
        { speaker: c.npc, text: '"Do not buy the blue one. I am telling you as a friend, and as someone selling the blue one."' },
      ],
      memory: 'The night market, all paper light and impossible prices.',
    },
    {
      id: 'village_music',
      title: 'Music in the Square',
      hours: [18, 21],
      areas: ['village', 'meadow'],
      npcPool: ['rowan', 'aria', 'finn'],
      backdrop: 'village-square',
      cooldownDays: 3,
      pages: (c) => [
        { speaker: 'narrator', text: 'A fiddle, badly tuned, and nobody minding. Someone starts clapping off the beat.' },
        { speaker: c.npc, text: '"I am not dancing. I am standing rhythmically. There is a difference."' },
      ],
      memory: 'Music in the square, and a hand offered halfway.',
    },
    {
      id: 'community_work',
      title: 'Community Work',
      hours: [9, 13],
      areas: ['garden', 'village'],
      npcPool: ['rowan', 'nyssa', 'elowen'],
      backdrop: 'garden',
      cooldownDays: 3,
      pages: (c) => [
        { speaker: 'narrator', text: 'A fence needs mending before the weather turns. Everyone has an opinion about the fence.' },
        { speaker: c.npc, text: '"We could finish this in an hour if we stopped discussing it. Just a thought."' },
      ],
      memory: 'Mending the village fence with more opinions than tools.',
    },
    {
      id: 'garden_day',
      title: 'Public Garden Day',
      hours: [10, 16],
      areas: ['garden', 'greenhouse'],
      npcPool: ['elowen', 'celeste', 'nyssa'],
      backdrop: 'greenhouse',
      cooldownDays: 2,
      pages: (c) => [
        { speaker: 'narrator', text: 'Seedlings in trays, soil under every fingernail, and a label garden nobody can read.' },
        { speaker: c.npc, text: '"That one is a maybe. I planted it out of spite and now I am attached."' },
      ],
      memory: 'Planting seedlings that were only slightly out of spite.',
    },
    {
      id: 'weekend_gathering',
      title: 'Weekend Gathering',
      hours: [15, 19],
      areas: ['meadow', 'village', 'garden'],
      npcPool: ['nyssa', 'mira', 'finn', 'theo', 'celeste'],
      backdrop: 'meadow',
      cooldownDays: 4,
      check: () => {
        const S = SAN.state.S;
        return S && (S.time.day % 7 === 0 || S.time.day % 7 === 6);
      },
      pages: (c) => [
        { speaker: 'narrator', text: 'Blankets on the grass, too much food, and the particular ease of a day with nothing required of it.' },
        { speaker: c.npc, text: '"Sit. Eat. Nobody is allowed to be useful for the next hour."' },
      ],
      memory: 'A weekend afternoon with nowhere else to be.',
    },
  ];

  /* ---------------- seasonal ---------------- */
  C.SEASONAL = [
    {
      id: 'spring_flower_festival',
      title: 'Spring Flower Festival',
      seasons: [0], days: [8, 14],
      hours: [9, 19],
      areas: ['garden', 'village'],
      npcPool: ['celeste', 'elowen', 'nyssa'],
      backdrop: 'garden',
      once: 'season',
      pages: (c) => [
        { speaker: 'narrator', text: 'The whole village smells of cut stems. Children are wearing flowers they did not ask for.' },
        { speaker: c.npc, text: '"I entered the arrangement contest. I am pretending I did not. Do not look at the third table."' },
      ],
      memory: 'The Spring Flower Festival, and a ribbon that was quietly deserved.',
    },
    {
      id: 'summer_beach_festival',
      title: 'Summer Beach Festival',
      seasons: [1], days: [10, 18],
      hours: [11, 20],
      areas: ['beach'],
      npcPool: ['finn', 'lucien', 'mira'],
      backdrop: 'beach-sunset',
      once: 'season',
      pages: (c) => [
        { speaker: 'narrator', text: 'Bonfires, wet sand, and someone insisting the water is warmer than it is.' },
        { speaker: c.npc, text: '"I am not swimming. I am supervising the swimming. From a safe, dry distance."' },
      ],
      memory: 'The Summer Beach Festival, sand in everything, nobody minding.',
    },
    {
      id: 'autumn_harvest_festival',
      title: 'Autumn Harvest Festival',
      seasons: [2], days: [12, 20],
      hours: [10, 19],
      areas: ['village', 'garden'],
      npcPool: ['mira', 'rowan', 'elowen'],
      backdrop: 'village-square',
      once: 'season',
      pages: (c) => [
        { speaker: 'narrator', text: 'Squash arranged like treasure. A prize goose nobody has explained. Cider for everyone.' },
        { speaker: c.npc, text: '"If you tell anyone I cried at the prize goose, I will deny it with my whole chest."' },
      ],
      memory: 'The Autumn Harvest Festival and the famous prize goose.',
    },
    {
      id: 'winter_snow_festival',
      title: 'Winter Snow Festival',
      seasons: [3], days: [6, 16],
      hours: [12, 20],
      areas: ['village', 'meadow'],
      npcPool: ['nyssa', 'aria', 'theo'],
      backdrop: 'village-square',
      once: 'season',
      pages: (c) => [
        { speaker: 'narrator', text: 'Snow, mulled something, and lanterns sunk halfway into drifts. Everyone is rosy and pretending to be cold.' },
        { speaker: c.npc, text: '"My hands are frozen. I refuse to go inside. This is the best day of the year."' },
      ],
      memory: 'The Winter Snow Festival, cold hands and warm cups.',
    },
    {
      id: 'christmas_eve',
      title: 'Christmas Eve',
      seasons: [3], days: [24],
      hours: [16, 23],
      areas: ['village', 'home', 'cottage'],
      npcPool: ['mira', 'celeste', 'nyssa', 'elowen'],
      backdrop: 'village-square',
      once: 'year',
      pages: (c) => [
        { speaker: 'narrator', text: 'A small tree by the well, badly decorated, with one candle left for whoever arrives last.' },
        { speaker: c.npc, text: '"I made you something. It is not much. I made it twice because the first one was worse."' },
      ],
      memory: 'Christmas Eve by the village well.',
    },
    {
      id: 'new_year_celebration',
      title: 'New Year Celebration',
      seasons: [3], days: [28],
      hours: [18, 24],
      areas: ['village', 'meadow'],
      npcPool: ['theo', 'rowan', 'mira', 'aria'],
      backdrop: 'village-square',
      once: 'year',
      pages: (c) => [
        { speaker: 'narrator', text: 'The year is ending without asking permission. Someone is counting down far too early.' },
        { speaker: c.npc, text: '"Same time next year? I know. I said it out loud. You are allowed to hold me to it."' },
      ],
      memory: 'A new year, said out loud in a crowd.',
    },
  ];


  /* ---------------- special city events ---------------- */
  C.SPECIAL = [
    {
      id: 'lantern_festival', title: 'Lantern Festival', hours: [18, 23], areas: ['village', 'beach'], npcPool: ['nyssa', 'lucien', 'aria'], backdrop: 'lighthouse-night', once: 'year', cooldownDays: 10,
      pages: (c) => [
        { speaker: 'narrator', text: 'Paper lanterns drift out over the water, each one carrying something nobody says aloud.' },
        { speaker: c.npc, text: '"I wrote something on mine. You are not allowed to read it. You are allowed to stand here with me."' },
      ],
      memory: 'Lanterns on the water, and what was not written on them.',
    },
    {
      id: 'village_anniversary', title: 'Village Anniversary', seasons: [0], days: [12], hours: [10, 20], areas: ['village'], npcPool: ['nyssa', 'mira', 'rowan'], backdrop: 'village-square', once: 'year',
      pages: (c) => [
        { speaker: 'narrator', text: 'The village is older than anyone remembers and younger than it looks. There is cake about it.' },
        { speaker: c.npc, text: '"Every year I think this will be the year it feels ordinary. It never is."' },
      ],
      memory: 'The village anniversary, and cake older than the argument about the cake.',
    },
    {
      id: 'cooking_competition', title: 'Cooking Competition', seasons: [2], days: [6, 22], hours: [11, 18], areas: ['bakery', 'village'], npcPool: ['mira', 'finn', 'theo'], backdrop: 'bakery', once: 'season',
      pages: (c) => [
        { speaker: 'narrator', text: 'Three judges, one fire alarm, and a pie that is definitely a little burned.' },
        { speaker: c.npc, text: '"Do not say anything. I know. I know. Help me hide the edges."' },
      ],
      memory: 'The cooking competition, and a pie with a hidden dark side.',
    },
    {
      id: 'fishing_tournament', title: 'Fishing Tournament', seasons: [1], days: [4, 24], hours: [7, 15], areas: ['beach'], npcPool: ['finn', 'lucien', 'rowan'], backdrop: 'beach-sunset', once: 'season',
      pages: (c) => [
        { speaker: 'narrator', text: 'Rods, buckets, and a scoreboard that is mostly wishful thinking.' },
        { speaker: c.npc, text: '"Whoever catches the smallest one wins my respect. The big ones are showing off."' },
      ],
      memory: 'The fishing tournament, and the small brave fish.',
    },
    {
      id: 'gardening_competition', title: 'Gardening Competition', seasons: [0, 2], days: [5, 25], hours: [10, 17], areas: ['garden', 'greenhouse'], npcPool: ['elowen', 'celeste', 'nyssa'], backdrop: 'garden', once: 'season',
      pages: (c) => [
        { speaker: 'narrator', text: 'Enormous vegetables, suspiciously perfect roses, and one honest weed in a pot.' },
        { speaker: c.npc, text: '"That one is mine. The weed. I think it is doing very well and nobody else agrees."' },
      ],
      memory: 'The gardening competition, and the honest weed.',
    },
    {
      id: 'book_fair', title: 'Book Fair', seasons: [2], days: [2, 26], hours: [9, 18], areas: ['library', 'village'], npcPool: ['aria', 'rowan', 'theo'], backdrop: 'library', once: 'season',
      pages: (c) => [
        { speaker: 'narrator', text: 'Tables of books outside the library, and a queue for the one copy everyone wants.' },
        { speaker: c.npc, text: '"I put a book aside for you. Do not tell the queue. The queue is very serious."' },
      ],
      memory: 'The book fair, and a book saved from the queue.',
    },
    {
      id: 'art_exhibition', title: 'Art Exhibition', seasons: [1, 2], days: [9, 23], hours: [13, 20], areas: ['village', 'teashop'], npcPool: ['celeste', 'aria', 'mira'], backdrop: 'village-square', once: 'season',
      pages: (c) => [
        { speaker: 'narrator', text: 'Paintings propped on easels, one sculpture covered in a sheet, and a guest book nobody dares sign first.' },
        { speaker: c.npc, text: '"The one with the badly painted sea is mine. I am going to stand next to it and pretend to be a stranger."' },
      ],
      memory: 'The art exhibition, and a badly painted, beloved sea.',
    },
    {
      id: 'charity_event', title: 'Charity Evening', seasons: [3], days: [2, 20], hours: [16, 21], areas: ['village', 'teashop'], npcPool: ['theo', 'celeste', 'mira'], backdrop: 'teashop', once: 'season',
      pages: (c) => [
        { speaker: 'narrator', text: 'A table of donated things, prices written in hopeful handwriting, and a jar that is doing most of the work.' },
        { speaker: c.npc, text: '"I donated something I actually like. Do not ask which one. Buy it and keep it safe."' },
      ],
      memory: 'The charity evening, and something given that was actually liked.',
    },
    {
      id: 'secret_admirer', title: 'A Letter With No Name', hours: [7, 10], areas: ['home', 'cottage', 'village'], npcPool: ['aria', 'lucien', 'finn', 'rowan'], backdrop: 'cottage-day', once: 'season', minStage: 3,
      pages: (c) => [
        { speaker: 'narrator', text: 'A folded note under the bakery door. No signature. The handwriting is trying very hard to be ordinary.' },
        { speaker: c.npc, text: '"That is not mine. Why are you looking at me. I am allowed to be defensive for no reason."' },
      ],
      memory: 'A note with no name, and a someone trying very hard to look innocent.',
    },
    {
      id: 'couple_festival', title: 'Couple Festival', seasons: [1], days: [14, 16], hours: [15, 22], areas: ['meadow', 'village'], npcPool: ['mira', 'lucien', 'elowen', 'aria', 'theo'], backdrop: 'meadow', once: 'year', minStage: 5,
      pages: (c) => [
        { speaker: 'narrator', text: 'Pairs carrying paper flowers, a ribbon game nobody understands, and a bad song played on purpose.' },
        { speaker: c.npc, text: '"We do not have to do the ribbon thing. I just wanted to be here with you while it happens."' },
      ],
      memory: 'The Couple Festival, skipping the ribbon game together.',
    },
    {
      id: 'moonlight_dance', title: 'Moonlight Dance', hours: [20, 23], weathers: ['sunny', 'cloudy'], areas: ['village', 'meadow', 'beach'], npcPool: ['lucien', 'celeste', 'rowan', 'mira', 'aria', 'finn', 'theo', 'elowen'], backdrop: 'beach-sunset', once: 'season', minStage: 5,
      pages: (c) => [
        { speaker: 'narrator', text: 'Lanterns low, music slower than usual, and everyone pretending they are not watching who dances with whom.' },
        { speaker: c.npc, text: '"One dance. Then you can go back to being sensible about all this."' },
      ],
      memory: 'A moonlight dance, and being sensible about none of it.',
    },
    {
      id: 'fireworks_night', title: 'Fireworks Night', seasons: [1], days: [20], hours: [19, 23], areas: ['village', 'meadow', 'beach'], npcPool: ['nyssa', 'finn', 'mira', 'theo'], backdrop: 'beach-sunset', once: 'year',
      pages: (c) => [
        { speaker: 'narrator', text: 'The first rocket goes up crooked and everyone applauds anyway. The second one is beautiful.' },
        { speaker: c.npc, text: '"Say something before it gets loud. I will not hear you after."' },
      ],
      memory: 'Fireworks, and something said before the noise.',
    },
  ];

  /* ---------------- contextual random events ----------------
     These are about the relationship, not the calendar, so they carry a
     minimum stage and a long cooldown. Invitations ask first. */
  C.RANDOM = [
    {
      id: 'chance_meeting', title: 'A Chance Meeting', hours: [8, 21], areas: null, npcPool: null, backdrop: null, cooldownDays: 4,
      pages: (c) => [
        { speaker: 'narrator', text: 'You both reach the same corner from different directions and stop, caught being glad.' },
        { speaker: c.npc, text: '"I was not looking for you. That is not the same as being sorry to find you."' },
      ],
      memory: 'Running into someone at the same corner.',
    },
    {
      id: 'ask_help', title: 'Asked For Help', hours: [7, 20], areas: null, npcPool: null, backdrop: null, cooldownDays: 5, minStage: 3,
      pages: (c) => [
        { speaker: c.npc, text: '"I need a hand. I have been standing here for ten minutes trying to phrase that in a way that does not sound like a favour."' },
        { speaker: 'narrator', text: 'It takes less time to do the thing than it took them to ask.' },
      ],
      memory: 'Being asked for help, and being allowed to give it.',
      effects: { psychology: 'acts_of_service' },
    },
    {
      id: 'personal_trouble', title: 'A Bad Day', hours: [15, 23], areas: null, npcPool: null, backdrop: null, cooldownDays: 6, minStage: 2,
      pages: (c) => [
        { speaker: 'narrator', text: 'They are pretending to be busy with something that does not need doing.' },
        { speaker: c.npc, text: '"It is nothing. It is a day. Days happen." They do not stop pretending.' },
      ],
      memory: 'A bad day, and staying anyway.',
      effects: { psychology: 'listened' },
    },
    {
      id: 'invite_walk', title: 'An Invitation to Walk', hours: [9, 19], areas: null, npcPool: null, backdrop: null, cooldownDays: 5, minStage: 2, invite: true,
      pages: (c) => [
        { speaker: c.npc, text: '"I am going for a walk. You are not required to come. I would like it if you did."' },
      ],
      memory: 'A walk that was not required.',
    },
    {
      id: 'invite_home', title: 'Come In For A Minute', hours: [17, 22], areas: null, npcPool: null, backdrop: null, cooldownDays: 7, minStage: 4, invite: true,
      pages: (c) => [
        { speaker: c.npc, text: '"You have been standing outside long enough. Come in. I will make the tea that is slightly too strong."' },
      ],
      memory: 'The first time they let you in.',
    },
    {
      id: 'small_gathering', title: 'A Small Gathering', hours: [17, 22], areas: null, npcPool: null, backdrop: null, cooldownDays: 8, minStage: 3, invite: true,
      pages: (c) => [
        { speaker: c.npc, text: '"A few of us are gathering. Nothing formal. You would make it better. That is the whole invitation."' },
      ],
      memory: 'A small gathering that felt bigger than it was.',
    },
    {
      id: 'surprise_gift', title: 'Something Small', hours: [8, 20], areas: null, npcPool: null, backdrop: null, cooldownDays: 7, minStage: 2,
      pages: (c) => [
        { speaker: c.npc, text: '"I saw this and thought of you. That is all. Do not make it a speech."' },
        { speaker: 'narrator', text: 'It is small, specific, and exactly right.' },
      ],
      memory: 'A small gift that proved someone was paying attention.',
      effects: { psychology: 'gift' },
    },
    {
      id: 'overheard_secret', title: 'Overheard', hours: [10, 22], areas: null, npcPool: null, backdrop: null, cooldownDays: 9, minStage: 3,
      pages: (c) => [
        { speaker: 'narrator', text: 'You catch the end of a conversation that was not meant for you. They see you see them.' },
        { speaker: c.npc, text: '"You heard that. I am not going to pretend you did not. Ask me later, when I have decided how to say it."' },
      ],
      memory: 'An overheard sentence and a promise to ask later.',
      effects: { psychology: 'boundary_respected' },
    },
    {
      id: 'bad_weather_shelter', title: 'Shelter From The Rain', hours: [8, 22], weathers: ['rain', 'storm'], areas: null, npcPool: null, backdrop: null, cooldownDays: 5,
      pages: (c) => [
        { speaker: 'narrator', text: 'The rain arrives all at once. You end up under the same narrow awning, not quite touching.' },
        { speaker: c.npc, text: '"We can stand here being sensible, or we can admit this is the best part of the day."' },
      ],
      memory: 'Rain, and one narrow awning.',
    },
    {
      id: 'reconciliation_moment', title: 'An Honest Minute', hours: [9, 23], areas: null, npcPool: null, backdrop: null, cooldownDays: 3, minStage: 2,
      check: () => {
        const S = SAN.state.S;
        if (!S || !S.psychology) return false;
        return Object.keys(S.psychology).some((id) => (S.psychology[id].resentment || 0) >= 20);
      },
      pages: (c) => [
        { speaker: c.npc, text: '"I have been carrying something and I would rather say it badly than not at all."' },
        { speaker: 'narrator', text: 'It is not a neat conversation. It is a real one, which is better.' },
      ],
      memory: 'Saying something badly instead of not at all.',
      effects: { psychology: 'honest_talk' },
    },
  ];

  /* ---------------- who knows whom ----------------
     NPC relationships exist without the player: friendships, friction,
     work tensions, quiet crushes. The player can witness some of it. */
  C.BONDS = [
    { a: 'mira', b: 'rowan', type: 'friends', label: 'Old friends', warmth: 62, note: 'She feeds him; he fixes her oven and pretends it was nothing.' },
    { a: 'elowen', b: 'celeste', type: 'work', label: 'Work neighbours', warmth: 48, note: 'They trade cuttings and complaints about customers.' },
    { a: 'lucien', b: 'finn', type: 'friends', label: 'Quiet company', warmth: 44, note: 'Two men who can sit in silence and call it a conversation.' },
    { a: 'lucien', b: 'nyssa', type: 'old', label: 'Old obligation', warmth: 38, note: 'She remembers the night he first climbed the lighthouse stairs.' },
    { a: 'aria', b: 'rowan', type: 'tension', label: 'Borrowed books', warmth: 22, note: 'He returns books late with very good excuses.' },
    { a: 'theo', b: 'mira', type: 'spark', label: 'Unspoken', warmth: 57, note: 'He flirts; she laughs; neither says the real thing.' },
    { a: 'finn', b: 'theo', type: 'rivalry', label: 'Friendly rivalry', warmth: 30, note: 'They compete about everything, including who is less competitive.' },
    { a: 'celeste', b: 'aria', type: 'friends', label: 'Gentle alliance', warmth: 55, note: 'They understand each other without needing to explain.' },
    { a: 'nyssa', b: 'elowen', type: 'mentor', label: 'Tending', warmth: 60, note: 'She comes to the greenhouse to be quiet, and he lets her.' },
    { a: 'rowan', b: 'finn', type: 'work', label: 'Fence builders', warmth: 40, note: 'They have mended the same fence four times; it is never the fence.' },
    { a: 'mira', b: 'celeste', type: 'friends', label: 'Shared counter', warmth: 58, note: 'Flowers on the bakery tables, bread in the flower shop.' },
    { a: 'lucien', b: 'elowen', type: 'tension', label: 'Warmth and distance', warmth: 26, note: 'Elowen keeps offering help; Lucien keeps saying it is handled.' },
  ];

  /* what the village says when a bond shifts, so the player can witness it */
  C.BOND_MOMENTS = [
    '"You two are arguing about the fence again." / "We are not arguing. We are agreeing loudly."',
    '"She left you the good seat." / "Do not make it into a thing."',
    '"I saw him carry her basket all the way uphill." / "I always carry her basket."',
    '"He returned the book. Only seven weeks late." / "It was a long book."',
    '"You have both been in that greenhouse for six hours." / "Time is different in here."',
    '"Do not think I did not notice you paying for her tea." / "Then it is working."',
  ];

})();
