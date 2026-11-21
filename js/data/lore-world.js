/* Sanctuary — world history, places, traditions and the master timeline.
   The story begins in Spring, Year 1. Anything earlier is written as
   "Year -N", so every age, arrival and building date can be checked against
   one clock. NPC ages and tenures here are the canonical ones used by
   lore-characters.js. */
(function () {
  const D = SAN.data || (SAN.data = {});
  const W = (D.worldLore = {});

  W.START = { season: 0, day: 1, year: 1 };
  W.FOUNDING_YEAR = -180;

  W.PLACES = {
    village: {
      name: 'Sanctuary Village',
      built: -180,
      history: 'Founded by nine households who arrived after a flood took their river town. They built around a spring that never froze, and named the place for what it was: a shelter, not a destination.',
      now: 'The well in the square is the oldest structure; its stones were carried from the ruin in the forest. The village has never had a wall or a gate, which the founders considered the whole point.',
    },
    lighthouse: {
      name: 'The Lighthouse',
      built: -122,
      history: 'Built after the wreck of the Merrow in a fog that lasted nine days. The first keeper, Alder Vey, kept the lamp lit with whale oil and a promise to every ship that passed: someone is awake.',
      now: 'The lamp was converted to gas in Year -40, and the logbook has been kept without a gap since Year -122. Lucien writes in it every night.',
    },
    windmill: {
      name: 'The Whispering Windmill',
      built: -96,
      history: 'Raised by the Ashcombe family to grind grain for the whole valley. Its gears were cut by a millwright who refused to draw plans, so every repair since has been a conversation with a stubborn ghost.',
      now: 'The mill still turns for bread, and the sound it makes in a north wind is where the name comes from. Rowan has repaired the same gear three times and named it.',
    },
    greenhouse: {
      name: 'The Shared Greenhouse',
      built: -74,
      history: 'Glass bought with money the village raised to keep a physician from leaving. She stayed two years, taught the valley to grow winter greens, and left the building to the village rather than to a family.',
      now: 'It is held in common, worked by Elowen, and the only place in Sanctuary where something is always blooming, even in snow.',
    },
    bakery: {
      name: 'The Village Bakery',
      built: -61,
      history: 'Started in a front room by Odile Marchetti, who baked for the mill workers on credit and kept the debts in a book she never collected.',
      now: 'Mira runs it and continues the tradition of the unpaid page. The oven is older than the building around it.',
    },
    flower: {
      name: 'The Flower Shop',
      built: -58,
      history: 'Marigold Wren turned a cutting garden into a shop after the influenza winter of Year -59, when the village needed something to put in the hands of the grieving.',
      now: 'Celeste keeps the language of flowers her grandmother taught her, including the meanings nobody asks for.',
    },
    library: {
      name: 'The Village Library',
      built: -49,
      history: 'A reading room added to the schoolhouse by Maren Vale, who believed a village that keeps records cannot be lied to easily. The first ledger of Sanctuary is kept here.',
      now: 'Aria catalogues everything, including a box of papers people asked the village to forget.',
    },
    beach: {
      name: 'The Shore & Fishing Huts',
      built: -170,
      history: 'The original settlers fished before they built. The huts were rebuilt after the storm of Year -33, when three boats were lost and the village learned how quickly the sea can change its mind.',
      now: 'Finn keeps the last of the old family boats afloat. The star hook hangs in his shed, and nobody else is allowed to use it.',
    },
    teashop: {
      name: 'The Tea Shop',
      built: -44,
      history: 'Opened by a retired lighthouse keeper who could not sleep without a light on. It has never once closed early.',
      now: 'The back table is understood to belong to whoever needs it most that day.',
    },
    grove: {
      name: 'The Hidden Grove',
      built: null,
      history: 'Older than the village. Three standing stones with the marks of moth, wave and leaf; the founders found it and deliberately left it out of the first map.',
      now: 'The forest keeps it shut to anyone who has not learned the order. What is buried there was buried on purpose.',
    },
    forest: {
      name: 'The Memory Forest',
      built: null,
      history: 'The settlers called it that because they buried their dead at its edge and planted a tree for each name. The oldest trees are named in the ledger.',
      now: 'People still leave small things at the roots: a shell, a ribbon, a note that says only "I was here."',
    },
  };

  W.TRADITIONS = [
    { name: 'First Lantern', when: 'Spring 1', text: 'One lantern is lit at the well and carried to the lighthouse. Whoever carries it does not speak the whole way. The village says the wish travels better in silence.' },
    { name: 'Bread for the Unpaid Page', when: 'Every market day', text: 'A loaf is set aside for anyone who cannot pay. The ledger of debts is never collected and never thrown away.' },
    { name: 'Flowers to the Light', when: 'Early spring', text: 'A bouquet is left at the lighthouse door on the anniversary of the Merrow. The sender is not named.' },
    { name: 'The Fence Mending', when: 'Late autumn', text: 'Everyone repairs the same boundary fence together. It is not really about the fence.' },
    { name: 'Names at the Roots', when: 'Winter solstice', text: 'Small objects are left at the oldest trees for people who are gone. Nobody explains what they leave.' },
  ];

  W.LEGENDS = [
    'The Guardian: the village says a promise was made at the well by the founder, Elspeth Wren, and that the promise still walks. Nyssa neither confirms nor denies it, which the village takes as confirmation.',
    'The Merrow: a ship that went down in fog off the point. Its bell is said to ring on the night before a storm, though the lighthouse log records no bell.',
    'The Ninth Household: the founding charter names nine families, but only eight are listed in the cemetery. The ninth name was scraped off the stone, and the ledger page has been cut out.',
    'The Keeper\'s Rule: a lighthouse keeper must never let the lamp go dark for a person, only for weather. Breaking it is said to call a ship home that should not come back.',
  ];

  W.SECRETS = [
    { id: 'ninth_household', title: 'The Ninth Household', text: 'The missing founder was Elspeth Wren\'s sister, Sable, who left the village in its third year after a quarrel over the well. The page was cut out by Elspeth herself. Sable\'s descendants are not recorded — but the cottage on the hill was built for her, and stayed empty for a century.' },
    { id: 'unlabelled_box', title: 'The Unlabelled Box', text: 'The library keeps a box of letters people asked the village to forget: confessions, refusals, one unsent apology from a keeper to his mother. Aria has never opened it. She knows exactly where it is.' },
    { id: 'ilse_letter', title: 'The Letter That Washed Up', text: 'Ilse wrote to Lucien from the port, four sentences late. The letter never reached him; it went into the sea and came back years later. Celeste recognised the handwriting and has said nothing.' },
    { id: 'maren_page', title: 'Maren\'s Last Page', text: 'The final page of the village ledger, written the week before Maren Vale died, names the cottage on the hill and says: "Leave it to the one who comes asking. They will need a place that does not require them to be anyone yet."' },
    { id: 'winter_route', title: 'Theo\'s Winter', text: 'Theo does not vanish in winter for mystery. He spends it with his brother\'s family in Greyford, helping with a shop he once lost. He has never told anyone in Sanctuary because he is ashamed of how much he needs to be needed there.' },
    { id: 'star_hook', title: 'The Star Hook', text: 'Finn\'s grandfather made the star hook for Finn\'s father, who drowned with it in his pocket. Finn found it years later in the wreck, cleaned it, and tells everyone it was "the last thing that was actually his" — meaning his father\'s, not his own.' },
  ];

  W.HISTORICAL_EVENTS = [
    { year: -180, title: 'The Nine Households Arrive', text: 'Flood refugees settle around a spring that never freezes. The first winter kills eleven; the survivors plant gardens over the graves.' },
    { year: -176, title: 'The Well Is Dug', text: 'The spring is walled in. Elspeth Wren makes a promise there that the village will remain a place people can return to.' },
    { year: -122, title: 'The Merrow Wreck', text: 'A ship is lost in a nine-day fog. The village raises a lighthouse on the point, funded by the families of the drowned.' },
    { year: -96, title: 'The Windmill Rises', text: 'The Ashcombes grind the valley\'s first harvest. Bread stops being a thing brought in by cart.' },
    { year: -74, title: 'The Greenhouse Is Given', text: 'The village pools money for a physician; she leaves the greenhouse to the village instead of a family.' },
    { year: -61, title: 'Odile\'s Oven', text: 'The bakery opens on credit and never closes. Its debt book becomes a village joke and then a village ethic.' },
    { year: -59, title: 'The Influenza Winter', text: 'Forty-one people die. Marigold Wren plants a cutting garden so the grieving have something to hold.' },
    { year: -49, title: 'The Reading Room', text: 'Maren Vale adds a library to the schoolhouse and begins the village ledger.' },
    { year: -33, title: 'The Storm', text: 'Three fishing boats are lost. The village rebuilds the huts and starts the tradition of the fence.' },
    { year: -12, title: 'The Long Dry Summer', text: 'The well drops; the greenhouse keeps the valley fed. Rowan, then thirteen, carries water for the mill.' },
    { year: -4, title: 'The Lamp Changes Hands', text: 'Old Bram retires and Ilse leaves the same spring. Lucien, twenty-three, takes the lamp alone and does not ask anyone to stay.' },
    { year: -1, title: 'Maren Vale Dies', text: 'The library closes for a week. Aria finds the last page of the ledger, and the cottage on the hill is left empty.' },
    { year: 1, title: 'You Arrive', text: 'The cottage is unlocked, the kettle is where someone left it, and the village has been expecting someone without knowing who.' },
  ];

  /* Master timeline — the one place to check ages, arrivals and tenures. */
  W.TIMELINE = [
    { year: -180, title: 'Sanctuary founded', text: 'Nine households; the well promise.' },
    { year: -122, title: 'Lighthouse built', text: 'After the Merrow.' },
    { year: -96, title: 'Windmill built', text: 'Ashcombe mill.' },
    { year: -74, title: 'Greenhouse built', text: 'Given to the village.' },
    { year: -61, title: 'Bakery opens', text: 'Odile Marchetti.' },
    { year: -58, title: 'Flower shop opens', text: 'Marigold Wren.' },
    { year: -49, title: 'Library founded', text: 'Maren Vale begins the ledger.' },
    { year: -41, title: 'Finn born', text: 'Native; fishing family.' },
    { year: -35, title: 'Celeste born', text: 'Native; Wren flower family.' },
    { year: -32, title: 'Mira born', text: 'Greyford.' },
    { year: -30, title: 'Theo born', text: 'Ashford Cross.' },
    { year: -29, title: 'Aria born', text: 'Meridian.' },
    { year: -29, title: 'Finn\'s father drowns', text: 'Finn is twelve; the star hook is lost and later found.' },
    { year: -27, title: 'Lucien born', text: 'Hallowmere, inland.' },
    { year: -25, title: 'Rowan born', text: 'Native; mill apprentice line.' },
    { year: -24, title: 'Elowen born', text: 'Native; greenhouse family.' },
    { year: -17, title: 'Celeste leaves for art school', text: 'Port Meridian, at eighteen; returns Year -13.' },
    { year: -14, title: 'Mira arrives', text: 'Age eighteen, with her aunt Petra; bakery apprenticeship.' },
    { year: -13, title: 'Celeste returns', text: 'Takes the flower shop after Marigold\'s death.' },
    { year: -11, title: 'Theo leaves home', text: 'Begins the trade road at nineteen.' },
    { year: -9, title: 'Aria arrives', text: 'Age twenty; inherits Maren\'s ledger work.' },
    { year: -9, title: 'Rowan apprentices', text: 'Old Wick takes him at sixteen.' },
    { year: -12, title: 'The long dry summer', text: 'The well drops; the greenhouse feeds the valley. Rowan, thirteen, carries water.' },
    { year: -8, title: 'Lucien arrives', text: 'Age nineteen; assistant keeper under Old Bram.' },
    { year: -8, title: 'Finn\'s mother dies', text: 'Finn keeps the boat and the house.' },
    { year: -6, title: 'Theo first visits Sanctuary', text: 'Winters in Greyford ever since.' },
    { year: -5, title: 'Rowan takes the mill', text: 'Old Wick retires to the coast.' },
    { year: -4, title: 'Ilse leaves; Bram retires', text: 'Lucien becomes keeper alone.' },
    { year: -3, title: 'Elowen takes the greenhouse', text: 'His parents move to the coast; his sister Iris is already in Meridian.' },
    { year: -1, title: 'Maren Vale dies', text: 'The cottage is left to "whoever comes asking".' },
    { year: 1, title: 'Main story begins', text: 'The player arrives in spring.' },
  ];

  /* newest first, so the codex reads like a chronicle */
  W.TIMELINE.sort((a, b) => b.year - a.year);

  W.NEIGHBOURS = {
    greyford: 'Market town two days east. Mira\'s family bakery, Theo\'s brother\'s shop, and the road that most newcomers arrive by.',
    meridian: 'Port city three days south. Art school, university, and the place Celeste, Iris and Aria each tried to become someone else.',
    hallowmere: 'Inland lake town. Lucien\'s birthplace; known for bells and for people leaving quietly.',
    ashford: 'Crossroads village north. Theo\'s birthplace; a place of carts and other people\'s goods.',
  };

  W.ARC = {
    title: 'The Ledger of Kept Things',
    premise: 'Sanctuary survives by keeping what people ask it to forget. Maren Vale kept the ledger and the unlabelled box; Aria inherited both; Nyssa has been keeping the promise underneath it for a hundred and eighty years. The player arrives in the cottage built for the founder who was written out.',
    beats: [
      'Arrival: the cottage, the ledger page with your name, Nyssa at the well.',
      'Belonging: work, neighbours, the first festival, the first thing you are trusted with.',
      'Cracks: letters that never arrived, a ninth founder, a keeper who will not ask anyone to stay.',
      'The box: Aria must decide whether the village may read what it asked to forget.',
      'The promise: Nyssa reveals what she actually promised, and what it costs her.',
      'Keeping: the player chooses what Sanctuary remembers — and what it is allowed to release.',
    ],
  };
})();
