/* Sanctuary — NPC definitions: portraits, personalities, schedules, dialogue, gifts */
(function () {
  const D = SAN.data || (SAN.data = {});
  const N = (D.npcs = {});

  N.nyssa = {
    id: 'nyssa', name: 'Nyssa', title: 'Village Guardian', pronoun: 'she',
    colors: { hair: '#e9e4ff', skin: '#efe6ff', eye: '#b9a6f0', dress: '#a7b6d8', accent: '#fff6e2', ribbon: '#d9c8f2' },
    hair: 'wavy', accessory: 'halo', glow: true,
    personality: 'Ancient, patient, and quietly amused by humans.',
    bio: 'The spirit who has watched over Sanctuary since before it had a name. She appears where the light pools.',
    loves: ['starflower', 'pearl', 'memory_shard'], likes: ['daisy', 'forget_me_not', 'lavender_tea'], dislikes: [],
    homeArea: 'village',
    always: true,
    schedule: [{ from: 6, to: 23, area: 'village', x: 32, y: 27, act: 'watching' }],
    greetings: {
      0: [
        '"You came back. I hoped you would." Nyssa\'s light drifts like dust in a sunbeam.',
        '"Sanctuary does not ask you to be better. Only to be here."',
      ],
      21: ['"You walk differently now. Slower. That is a good sign."'],
      41: ['"The village is fond of you. Even the well, and it is very difficult to impress."'],
      61: ['"I have watched many people try to earn rest. You are learning to simply take it."'],
      81: ['"Whatever you were before this place — you are welcome here. Both of you."'],
    },
    daily: ['"The wind is telling stories again."', '"If today is heavy, do one small thing. Then stop."'],
    topics: [
      { id: 'nyssa_1', min: 0, lines: ['"This village was built by people who needed somewhere to put their grief."', '"They planted gardens over it. That is all healing is, sometimes."'] },
      { id: 'nyssa_2', min: 30, lines: ['"You do not owe anyone a performance of being fine."'] },
      { id: 'nyssa_3', min: 55, lines: ['"Every stone in your vault was once something you carried alone. Now it has a garden."'] },
    ],
    gift: { love: '"Ah. You remembered something I said. That is the real gift."', like: '"Kind of you. I will put it where the light falls."', neutral: '"I will find a use for it. Guardians are very good at finding uses."', dislike: '"...I will treasure it. Dutifully."' },
  };

  N.liora = {
    id: 'liora', name: 'Liora', title: 'Lighthouse Keeper', age: 27,
    colors: { hair: '#e7d9bd', skin: '#f6ddc9', eye: '#8fb3d9', dress: '#5c7599', accent: '#eef3fb', ribbon: '#d8c3a0' },
    hair: 'long', accessory: 'clip',
    personality: 'Steady, warm, and a little afraid of being left behind — though she would call it "being sensible".',
    bio: 'She keeps the lamp burning so no ship has to guess where the shore is. She has kept it burning alone for four years.',
    loves: ['pearl', 'memoryfish', 'lavender_tea', 'sea_glass'],
    likes: ['shell', 'daisy', 'moon_cookie', 'bread', 'silverfin'],
    dislikes: ['carp', 'stone'],
    homeArea: 'lighthouse',
    schedule: [
      { from: 6, to: 8, area: 'beach', x: 20, y: 22, act: 'walking the shore' },
      { from: 8, to: 12, area: 'lighthouse', x: 18, y: 14, act: 'polishing the lens' },
      { from: 12, to: 14, area: 'teashop', x: 8, y: 6, act: 'taking tea' },
      { from: 14, to: 18, area: 'lighthouse', x: 18, y: 14, act: 'climbing the stairs' },
      { from: 18, to: 21, area: 'beach', x: 34, y: 20, act: 'watching the sunset' },
      { from: 21, to: 23, area: 'lighthouse', x: 18, y: 8, act: 'lighting the lamp' },
    ],
    ifRain: { area: 'lighthouse', x: 18, y: 12 },
    greetings: {
      0: ['"Careful on the rocks — they get slick after rain." She smiles, but keeps one hand on the railing.', '"You are the new one. The cottage on the hill, yes? I hope it is warm."'],
      21: ['"Oh — you again. That came out wrong. I meant it pleasantly."', '"I was just thinking about the tide. It always comes back. I like things that come back."'],
      41: ['"I saved you a seat on the west step. The sunset is better there."', '"People ask why I stay out here alone. I have started saying: because the light needs someone. That is only half true."'],
      61: ['"You always knock. I notice that. Most people just walk in and assume I am fine."', '"If you ever need to sit somewhere dark and quiet, the lamp room is yours."'],
      81: ['"When you are away, I keep the lamp low. Not because I am worried. Because I like knowing where to look."', '"You are one of the few people I do not have to be brave for."'],
    },
    daily: ['"The lamp needs polishing again. It is a good excuse to think."', '"I found a bottle on the shore this morning. Empty, sadly. Or maybe luckily."'],
    topics: [
      { id: 'liora_sea', min: 0, lines: ['"I grew up inland. I had never seen the sea until the night I arrived here."', '"It was so loud I could not hear myself worry. I have stayed near it ever since."'] },
      { id: 'liora_letters', min: 25, lines: ['"I used to write letters to people who had already left. I never sent them."', '"Not because I was angry. Because I did not want to be a burden at their new address."'] },
      { id: 'liora_light', min: 45, lines: ['"My mother said a lighthouse is a promise you make to strangers."', '"I used to think that meant I had to be strong all the time. I am trying to think it means I only have to be here."'] },
      { id: 'liora_alone', min: 65, lines: ['"Sometimes I am lonely and it does not mean anything is wrong with my life."', '"It just means I am a person who would like some company. That took me years to be able to say."'] },
      { id: 'liora_trust', min: 85, lines: ['"I am learning that people can leave and still love you. And that some people simply do not leave."', '"You are the second kind. I am still getting used to it."'] },
    ],
    gift: {
      love: '"Oh. You — this is exactly right. How did you know?" She holds it carefully, like a small animal.',
      like: '"Thank you. I will keep it on the windowsill where I can see it from the stairs."',
      neutral: '"That is thoughtful. Truly."',
      dislike: '"...Ah. Thank you. I will find somewhere for it." She does not.',
    },
    questline: 'lighthouse',
  };

  N.elowen = {
    id: 'elowen', name: 'Elowen', title: 'Greenhouse Gardener', age: 24,
    colors: { hair: '#9d7a5a', skin: '#eecfb4', eye: '#7fa06b', dress: '#7d9a72', accent: '#f4f0dd', ribbon: '#b9c9a0' },
    hair: 'braid', accessory: 'leaf',
    personality: 'Quiet, observant, and fiercely self-reliant in a way that costs her.',
    bio: 'She can name every plant in Sanctuary and will apologise for needing help before you finish offering it.',
    loves: ['seed_starflower', 'snowdrop', 'flower_salad', 'glow_moss'],
    likes: ['seed_moonpetal', 'clay', 'fiber', 'daisy', 'plant_fern'],
    dislikes: ['honey_cake', 'music_box'],
    homeArea: 'greenhouse',
    schedule: [
      { from: 6, to: 9, area: 'garden', x: 18, y: 16, act: 'checking the beds' },
      { from: 9, to: 13, area: 'greenhouse', x: 14, y: 12, act: 'tending seedlings' },
      { from: 13, to: 15, area: 'flower', x: 10, y: 6, act: 'buying soil' },
      { from: 15, to: 20, area: 'greenhouse', x: 10, y: 8, act: 'repotting' },
      { from: 20, to: 22, area: 'garden', x: 22, y: 20, act: 'watering late' },
    ],
    ifRain: { area: 'greenhouse', x: 14, y: 12 },
    greetings: {
      0: ['She looks up, startled, then nods at you over a tray of seedlings.', '"The greenhouse door sticks. You have to lift it."'],
      21: ['"Oh. You. Hello." She wipes her hands twice. "Sorry. Dirt."', '"The bluebells are doing well. I thought you would want to know. I do not know why I thought that."'],
      41: ['"I saved a cutting for you. It is nothing. It is a little thing." It is clearly not nothing.', '"You can sit if you want. I will not talk much. It is not personal."'],
      61: ['"I almost asked you for help yesterday. I practised in my head. Then I did it myself and cried a bit."', '"You do not have to be useful here. I am trying to learn that myself."'],
      81: ['"When the roof leaked I thought: I should tell someone. And the someone was you. That is new for me."', '"You are safe to be quiet with. Do you know how rare that is?"'],
    },
    daily: ['"Plants do not perform gratitude. They just grow. I like that about them."', '"I have been reading about soil. It is mostly alive. That is comforting."'],
    topics: [
      { id: 'elowen_help', min: 0, lines: ['"I have always done things alone. It is not because I do not like people."', '"It is because asking feels like handing someone a bill."'] },
      { id: 'elowen_roof', min: 25, lines: ['"The greenhouse roof broke last winter. I fixed it. Badly."', '"The plants survived anyway. I think about that more than I should."'] },
      { id: 'elowen_trust', min: 45, lines: ['"My sister used to say I treat help like weather — something that happens to other people."', '"I am trying to stand in it."'] },
      { id: 'elowen_growth', min: 70, lines: ['"Nothing here grows because I am good. It grows because I keep showing up."', '"You keep showing up too. I notice."'] },
    ],
    gift: {
      love: 'She goes very still. "You — I have been trying to find one of these for weeks. Thank you." Her ears are red.',
      like: '"This is lovely. I will — um. I will put it with the others."',
      neutral: '"Thank you. I will find a place for it."',
      dislike: 'She turns it over, clearly puzzled. "Oh. Thank you." She puts it down gently, like it might be fragile.',
    },
    questline: 'greenhouse',
  };

  N.rowan = {
    id: 'rowan', name: 'Rowan', title: 'Windmill Keeper', age: 25,
    colors: { hair: '#8a6a4b', skin: '#f0d3ba', eye: '#b58a4e', dress: '#9b7c56', accent: '#f6efe1', ribbon: '#c8a878' },
    hair: 'short', accessory: 'none',
    personality: 'Curious, quick-minded, and trapped in loops of "what if I had said it differently".',
    bio: 'He keeps the windmill turning and his thoughts turning faster. He has a notebook full of crossed-out sentences.',
    loves: ['moon_cookie', 'music_box', 'lavender_tea', 'glow_moss'],
    likes: ['bread', 'bookshelf_tall', 'forget_me_not', 'flour'],
    dislikes: ['bass', 'yarn_ball'],
    homeArea: 'windmill',
    schedule: [
      { from: 6, to: 10, area: 'windmill', x: 18, y: 18, act: 'oiling the sails' },
      { from: 10, to: 12, area: 'village', x: 34, y: 20, act: 'buying bread' },
      { from: 12, to: 16, area: 'windmill', x: 14, y: 14, act: 'pacing' },
      { from: 16, to: 19, area: 'library', x: 10, y: 8, act: 'reading' },
      { from: 19, to: 22, area: 'windmill', x: 18, y: 12, act: 'sitting on the steps' },
    ],
    ifRain: { area: 'library', x: 10, y: 8 },
    greetings: {
      0: ['"Hi. Sorry. I was somewhere else." He blinks like he has just arrived in his own body.', '"Windmill\'s fine. Everything\'s fine. Probably."'],
      21: ['"I replayed our last conversation three times last night. For no reason. It went fine."', '"Do you ever say something and then hear it in your head for hours? Asking for a friend. The friend is me."'],
      41: ['"I wrote a note to Mira and then rewrote it eleven times and then didn\'t send it."', '"The windmill needs the wind. It does not need it to be a perfect wind. I am working on the metaphor."'],
      61: ['"Sometimes I think if I stop worrying I will have missed something important."', '"Then you show up and I remember that not everything needs monitoring."'],
      81: ['"I am allowed to have a bad day without it meaning anything about my future. You taught me that. Gently. Repeatedly."', '"You are the person I tell the first draft to. That is the highest honour I have."'],
    },
    daily: ['"The sails were squeaking. It was probably just the wind. It is always the wind."', '"I had a thought and then a thought about the thought. Very busy up here."'],
    topics: [
      { id: 'rowan_loop', min: 0, lines: ['"My head is loud. Not in a dramatic way. Just — busy."', '"I can take one worry and build a whole house out of it."'] },
      { id: 'rowan_notes', min: 25, lines: ['"I keep notes. Not a diary. Notes. Different thing."', '"Mostly they say: it is fine, Rowan. That is fine."'] },
      { id: 'rowan_kindness', min: 45, lines: ['"I am trying to talk to myself the way I talk to other people."', '"Turns out I am much nicer to strangers."'] },
      { id: 'rowan_now', min: 70, lines: ['"The windmill only moves with the wind that is actually here. Not the wind I am worried about."', '"I think about that when my chest gets tight. It helps. Sometimes."'] },
    ],
    gift: {
      love: '"Oh — this is — wait, let me look at it properly." He turns it over three times. "I am going to keep this. Forever. Sorry. That was a lot."',
      like: '"That is really kind. I will put it where I work."',
      neutral: '"Thanks. That was nice of you."',
      dislike: '"Oh! Interesting. I do not understand it, but I respect it."',
    },
    questline: 'windmill',
  };

  N.mira = {
    id: 'mira', name: 'Mira', title: 'Village Baker', age: 32,
    colors: { hair: '#c07a4e', skin: '#f2d2b6', eye: '#7d5a3c', dress: '#d8a37b', accent: '#fff3e3', ribbon: '#e8c9a0' },
    hair: 'bun', accessory: 'apron',
    personality: 'Generous, cheerful, and the village\'s unofficial keeper of everyone\'s bad days.',
    bio: 'She wakes at four to bake and never mentions it. Her bread is famous. Her own needs are a mystery to her.',
    loves: ['honey', 'moonpetal', 'sunflower', 'honey_cake', 'wild_lavender'],
    likes: ['berry', 'flour', 'berry_tart', 'daisy', 'pumpkin'],
    dislikes: ['stone', 'carp'],
    homeArea: 'bakery',
    schedule: [
      { from: 6, to: 12, area: 'bakery', x: 10, y: 4, act: 'baking' },
      { from: 12, to: 14, area: 'village', x: 30, y: 26, act: 'carrying a basket' },
      { from: 14, to: 18, area: 'bakery', x: 6, y: 4, act: 'kneading' },
      { from: 18, to: 21, area: 'teashop', x: 9, y: 6, act: 'taking a break, finally' },
    ],
    ifRain: { area: 'bakery', x: 10, y: 4 },
    greetings: {
      0: ['"You are new! Sit, sit. You look like you have not eaten properly in a week." She is already cutting you a slice.', '"No charge for the first loaf. Village rule, I just invented it."'],
      21: ['"Two loaves today. One is for later. You are taking it, do not argue."', '"There is a plate of offcuts on the counter. They have no calories, obviously."'],
      41: ['"I have decided: today you are doing something nice for yourself. I will not be checking."', '"The village would fall apart without me, which I say with love and a certain amount of exhaustion."'],
      61: ['"Some days I want someone to bring ME bread. And then I feel ungrateful, which is silly."', '"You are not allowed to be useful in my shop. Sit down. Be decorative."'],
      81: ['"I told someone no yesterday. Sweetheart, it was terrifying. I feel wonderful."', '"You are the one who looks after the ones who look after everyone. Thank you."'],
    },
    daily: ['"The dough is rising. We are all rising. Very slow, very necessary."', '"I am trying a new recipe. It has more butter and fewer apologies in it."'],
    topics: [
      { id: 'mira_shop', min: 0, lines: ['"I inherited this shop from my mother. She did not ask if I wanted it."', '"I did want it. I did not want to be the only one who ever could."'] },
      { id: 'mira_rest', min: 25, lines: ['"I do not know what to do with a day off. I just clean the shop differently."', '"That is a little sad, isn\'t it? Do not answer that."'] },
      { id: 'mira_help', min: 45, lines: ['"People bring me their problems with their order. I never mind."', '"What I mind is that I do not know how to do the same."'] },
      { id: 'mira_receive', min: 70, lines: ['"You brought me something. And I did not deflect it. Small win."', '"Receiving is a skill. I am a beginner."'] },
    ],
    gift: {
      love: '"For me? Oh, look at that. I am going to put it where the morning light hits it." She beams, and then her eyes get a little bright.',
      like: '"You are a sweetheart. Absolutely not paying for your bread today."',
      neutral: '"Aww, thank you! Come by the shop, I will sort you out."',
      dislike: '"Oh! Lovely. I will — yes. Somewhere. Thank you, sweetheart."',
    },
    questline: null,
  };

  N.celeste = {
    id: 'celeste', name: 'Celeste', title: 'Flower Shop Owner', age: 35,
    colors: { hair: '#7d6b8f', skin: '#e8cfc0', eye: '#a07fb5', dress: '#b39ac2', accent: '#fbf4ff', ribbon: '#d9c3e8' },
    hair: 'wavy', accessory: 'flower',
    personality: 'Gentle, perceptive, speaks in flowers and very long pauses.',
    bio: 'She has run the flower shop for a decade and remembers what every bouquet in Sanctuary meant to who.',
    loves: ['starflower', 'moonpetal', 'lavender', 'forget_me_not', 'snowdrop'],
    likes: ['daisy', 'wild_rose', 'bluebell', 'sunrose', 'flower_arrangement'],
    dislikes: ['iron', 'fish_stew'],
    homeArea: 'flower',
    schedule: [
      { from: 6, to: 7, area: 'garden', x: 16, y: 20, act: 'cutting flowers at dawn' },
      { from: 7, to: 13, area: 'flower', x: 10, y: 4, act: 'arranging' },
      { from: 13, to: 15, area: 'village', x: 26, y: 24, act: 'walking with a bucket' },
      { from: 15, to: 19, area: 'flower', x: 6, y: 5, act: 'pressing petals' },
      { from: 19, to: 21, area: 'garden', x: 24, y: 14, act: 'sitting with the flowers' },
    ],
    ifRain: { area: 'flower', x: 10, y: 4 },
    greetings: {
      0: ['"Ah. A new face. That calls for something white and small." She picks a daisy without asking.', '"Flowers do not require you to explain yourself. That is their whole value."'],
      21: ['"Lavender for the morning, rose for the evening. You look like an evening person."', '"Bring me a flower from your travels and I will tell you what it means."'],
      41: ['"The bluebell means constancy. I put them in bouquets for people who are afraid of being forgotten."', '"I could tell you a lot about the village by its bouquets. I will not. Mostly."'],
      61: ['"You have started walking with your shoulders down. I noticed. It is a compliment."', '"People think I am calm. I am just very slow to panic."'],
      81: ['"When you are quiet, the room is still kind. Not many people can do that."', '"Take these. Starflowers. They mean: you are not required to be anyone else."'],
    },
    daily: ['"Some flowers open only at night. Nothing is wasted on them."', '"I sold a bouquet to Finn today. For his boat. He is a romantic, quietly."'],
    topics: [
      { id: 'celeste_meanings', min: 0, lines: ['"Flowers are a language for things people cannot say out loud."', '"I have never once convinced anyone to say the thing out loud. But they keep buying flowers."'] },
      { id: 'celeste_shop', min: 25, lines: ['"I opened this shop because I could not think of anything more useful to do with my hands."', '"It turns out that is a perfectly good reason to do a thing."'] },
      { id: 'celeste_sad', min: 45, lines: ['"There was someone. A long time ago. He bought roses every week and never once looked at me."', '"He was buying them for her. I still gave him the best ones."'] },
      { id: 'celeste_life', min: 70, lines: ['"You are allowed to be a person, not a symptom, or a lesson, or a story for someone else."', '"I put that in bouquets. It takes more flowers than you would think."'] },
    ],
    gift: {
      love: 'She turns the flower to the light. "Yes. You have been paying attention. That is the rarest thing."',
      like: '"Beautiful. I will press this one. I press the good ones."',
      neutral: '"How thoughtful. I will find exactly the right place."',
      dislike: '"Ah — well. Everything can be dried and used for something, eventually."',
    },
    questline: null,
  };

  N.theo = {
    id: 'theo', name: 'Theo', title: 'Traveling Merchant', age: 30,
    colors: { hair: '#4c4a5e', skin: '#d9b391', eye: '#8c7d5c', dress: '#5f5a7a', accent: '#e9dcc6', ribbon: '#a8916a' },
    hair: 'ponytail', accessory: 'scarf',
    personality: 'Mysterious, theatrical, and hiding a surprising amount of genuine kindness.',
    bio: 'His cart arrives before breakfast and leaves before dark. He knows every road and is suspiciously vague about his own.',
    loves: ['old_photo', 'music_box', 'brass_key', 'sea_letter'],
    likes: ['pearl', 'starflower', 'iron', 'rare fish', 'glow_moss'],
    dislikes: ['bread', 'daisy'],
    homeArea: 'village',
    schedule: [
      { from: 8, to: 17, area: 'village', x: 36, y: 25, act: 'trading' },
      { from: 17, to: 19, area: 'teashop', x: 11, y: 6, act: 'making an elaborate order' },
      { from: 19, to: 22, area: 'village', x: 36, y: 25, act: 'packing the cart' },
    ],
    ifRain: { area: 'teashop', x: 11, y: 6 },
    greetings: {
      0: ['"A new customer! I have exactly what you need, and several things you do not." He fans out a handful of trinkets.', '"The cart is only here on certain days, so buy your chaos early."'],
      21: ['"Ah, my favourite patron of questionable purchases."', '"I have a rule: I only sell things people are ready for. The cart decides."'],
      41: ['"I stopped in a village three months back and found a music box like the one you passed up."', '"You passed it up. I remember everything I sell. It is a professional curse."'],
      61: ['"Do you ever feel you are running from something interesting rather than toward something safe?"', '"Ignore me. Merchants are allowed one dramatic sentence a day."'],
      81: ['"I have been thirteen places and this is the only one I remember by name."', '"If I ever settle down, it will be somewhere with a very stubborn cat."'],
    },
    daily: ['"Today\'s cart contains: three secrets, one spoon, and a modest amount of regret."', '"I am not a mysterious merchant. I am a merchant with poor documentation."'],
    topics: [
      { id: 'theo_roads', min: 0, lines: ['"I have been to towns where the only thing anyone wanted to buy was certainty."', '"I do not stock it. Bad margins."'] },
      { id: 'theo_cart', min: 25, lines: ['"The cart is older than I am. My father drove it. He was a much worse salesman."', '"He once sold a man a map to a place that was not real. The man found it. Father was furious."'] },
      { id: 'theo_staying', min: 45, lines: ['"People think leaving is freedom. Mostly it is just a different set of rooms to be yourself in."', '"Unless you are very careful. Or very lucky. Or, occasionally, both."'] },
      { id: 'theo_truth', min: 70, lines: ['"I sold the lighthouse a lamp once. Liora paid in seashells because she did not have the coins."', '"I kept the shells. Do not tell her. It would ruin my reputation."'] },
    ],
    gift: {
      love: 'He actually stops moving. "Now that is worth the cart."',
      like: '"Excellent taste. I will not undersell this."',
      neutral: '"I will give you a fair price for it, if you ever want to be rid of it."',
      dislike: '"Ah, common goods. I have a hundred. Do not look so worried — the thought counts. Apparently."',
    },
    questline: null,
  };

  N.aria = {
    id: 'aria', name: 'Aria', title: 'Village Librarian', age: 29,
    colors: { hair: '#5b4636', skin: '#e6c6a8', eye: '#6f8fa8', dress: '#6a7f96', accent: '#f2ead9', ribbon: '#c2a67c' },
    hair: 'bob', accessory: 'glasses',
    personality: 'Dry, warm, and hopelessly fond of forgotten things.',
    bio: 'She catalogues the village\'s memories and reads three books at once. She is writing one of her own, badly, on purpose.',
    loves: ['old_photo', 'sea_letter', 'memory_shard', 'forget_me_not', 'moon_cookie'],
    likes: ['bookshelf_tall', 'lavender_tea', 'starflower', 'music_box', 'wild_rose'],
    dislikes: ['glow_moss', 'carp'],
    homeArea: 'library',
    schedule: [
      { from: 6, to: 12, area: 'library', x: 7, y: 5, act: 'cataloguing' },
      { from: 12, to: 14, area: 'village', x: 30, y: 22, act: 'walking with a book, not reading it' },
      { from: 14, to: 18, area: 'library', x: 12, y: 8, act: 'putting books away' },
      { from: 18, to: 21, area: 'teashop', x: 7, y: 4, act: 'reading in public, delightedly' },
    ],
    ifRain: { area: 'library', x: 7, y: 5 },
    greetings: {
      0: ['"Quiet section is at the back. Loud section is also at the back, but after me."', '"You may borrow anything. I will know. I always know."'],
      21: ['"I found a sentence in an old ledger that I think about constantly."', '"It said: paid in bread and apologies. Beautiful, isn\'t it? Do sit."'],
      41: ['"Someone wrote in the margin of this book: I was here. That is the whole record of a life."', '"I have started writing in the margins of my own books. Just in case."'],
      61: ['"I wrote a paragraph I am actually proud of. No, you cannot read it. No, I am not explaining why."', '"Libraries are just a very organised way of loving the past."'],
      81: ['"You are in the village ledger now. Under \'things that arrived and were worth keeping.\'"', '"I do not say that to everyone. I have never said it, in fact."'],
    },
    daily: ['"A book was returned with crumbs in it. I have questions and I will not ask them."', '"I am alphabetising by emotional weight. The system is beautiful and nobody understands it."'],
    topics: [
      { id: 'aria_archive', min: 0, lines: ['"Everything in Sanctuary ends up here eventually. Births, storms, the price of onions, someone\'s last letter."', '"I do not choose what matters. I just make sure it is not lost."'] },
      { id: 'aria_book', min: 25, lines: ['"I am writing a book about the village. It is currently four pages of names and a very good title."', '"Losers and Lanterns. Too dramatic? You are right. It is perfect."'] },
      { id: 'aria_past', min: 45, lines: ['"People think remembering is the same as getting stuck. It is not."', '"I remember everything on purpose so it cannot surprise me at night."'] },
      { id: 'aria_own', min: 70, lines: ['"I put myself in one paragraph. It was hard. I may keep it."', '"You are the first person I have told that to. Please be normal about it."'] },
    ],
    gift: {
      love: '"Oh. OH. Do you know what this is? I am going to need a moment and then a very long conversation."',
      like: '"That is going in the special shelf. I have one. Do not tell the others."',
      neutral: '"Noted. Filed. Appreciated."',
      dislike: '"Interesting. I will catalogue it under \'received with affection, valued for other reasons\'."',
    },
    questline: null,
  };

  N.finn = {
    id: 'finn', name: 'Finn', title: 'Fisherman', age: 41,
    colors: { hair: '#6a6a70', skin: '#e3ba96', eye: '#5f8c85', dress: '#5f7f78', accent: '#eaf2ec', ribbon: '#b98d5e' },
    hair: 'short', accessory: 'cap',
    personality: 'Easygoing, friendly, gives advice like he is telling you a story about someone else.',
    bio: 'He has fished this coast since he was six, and he still says "good morning" to the water.',
    loves: ['bass', 'memoryfish', 'fish_stew', 'glassfish'],
    likes: ['carp', 'shell', 'bread', 'lighthouse_key', 'sea_letter'],
    dislikes: ['honey_cake', 'starflower'],
    homeArea: 'beach',
    schedule: [
      { from: 6, to: 11, area: 'beach', x: 40, y: 18, act: 'fishing' },
      { from: 11, to: 13, area: 'village', x: 28, y: 22, act: 'selling the catch' },
      { from: 13, to: 18, area: 'beach', x: 30, y: 14, act: 'mending nets' },
      { from: 18, to: 22, area: 'beach', x: 40, y: 18, act: 'fishing at dusk' },
    ],
    ifRain: { area: 'teashop', x: 12, y: 6 },
    greetings: {
      0: ['"Morning! Well — it is whatever you make it." He reels in a line that has caught nothing and seems delighted anyway.', '"Fish are not in a hurry. Good role models, mostly."'],
      21: ['"The tide was kind today. That is all I will ask of it."', '"You want to know a secret? The best fishing spots are the ones with a nice view. The fish are a bonus."'],
      41: ['"My father used to say: the sea gives you what it gives you. I have not decided if that is wisdom or an excuse."', '"Probably both. Most useful things are both."'],
      61: ['"I had a hard year a while back. Fished every day. Caught almost nothing."', '"Still a good year. Took me a while to see it that way."'],
      81: ['"You know what I like about you? You do not try to fix the weather. You just sit in it with me."', '"That is the whole trick, I think. Being weather-companions."'],
    },
    daily: ['"The water is a bit moody today. We can be too."', '"I named a fish once. Regret it. Could not eat it. Named her Mildred."'],
    topics: [
      { id: 'finn_sea', min: 0, lines: ['"The sea is not calming, exactly. It is just bigger than your problems. That helps."', '"Not a cure. Just perspective with seaweed in it."'] },
      { id: 'finn_father', min: 25, lines: ['"My father fished here too. He talked even less than I do, which nobody believed."', '"When he died I came out here the next morning. Caught three bass. Cried about it. Good day, strangely."'] },
      { id: 'finn_lonely', min: 45, lines: ['"There is a difference between lonely and alone. I learned it late. Some days I still mix them up."', '"Lonely is a guest. Alone is a room. You can leave a room."'] },
      { id: 'finn_advice', min: 70, lines: ['"You ever notice nobody asks the fisherman if he is okay? It is a great disguise."', '"I am okay. Mostly. Nice to be asked. Thank you."'] },
    ],
    gift: {
      love: '"Well, look at that. You know, a thing like this — that is a good day right there."',
      like: '"That is a fine gift. I will trade you a fishing spot for it. A good one."',
      neutral: '"Much obliged. Sit a while if you like. The fish will not mind."',
      dislike: '"Ah. Well. My wife would have liked it. Rest her. I will hold onto it."',
    },
    questline: null,
  };

  D.npcOrder = ['nyssa', 'liora', 'elowen', 'rowan', 'mira', 'celeste', 'theo', 'aria', 'finn'];

  /* =========================================================
     OFFICIAL CHARACTER ARTWORK — one registry per character
     Every character ships the same ten files in
     assets/portraits/<id>/: a full body plus nine expressions.
     Paths are always built from that character's own id, so an NPC can
     never show another NPC's face. render.portraitArtFor() reads this
     registry, and any mood a character does not ship falls back to
     neutral instead of inventing an expression.
     ========================================================= */
  const NPC_ART_FILES = {
    neutral: 'neutral.png',
    happy: 'happy.png',
    sad: 'sad.png',
    smile: 'smile.png',
    serious: 'serious.png',
    thinking: 'thinking.png',
    concerned: 'concerned.png',
    gentle: 'gentle.png',
    // the uploads spell this "suprise.png"; stored under its correct name
    surprised: 'surprised.png',
  };

  D.npcArt = function (id) {
    const expressions = {};
    Object.keys(NPC_ART_FILES).forEach((mood) => {
      expressions[mood] = 'assets/portraits/' + id + '/' + NPC_ART_FILES[mood];
    });
    return { fullBody: 'assets/portraits/' + id + '/fullbody.png', expressions };
  };

  D.npcOrder.forEach((id) => {
    if (!N[id]) return;
    N[id].art = D.npcArt(id);
    N[id].fullBody = N[id].art.fullBody;
    N[id].expressions = Object.keys(N[id].art.expressions);
  });

  D.FRIEND_TIERS = [
    { min: 0, name: 'Stranger' },
    { min: 21, name: 'Acquaintance' },
    { min: 41, name: 'Friend' },
    { min: 61, name: 'Close Friend' },
    { min: 81, name: 'Trusted Companion' },
  ];
  D.friendTier = (pts) => {
    let t = D.FRIEND_TIERS[0];
    for (const x of D.FRIEND_TIERS) if (pts >= x.min) t = x;
    return t;
  };

  /* refined anime palette — silver/lavender/navy/rose fantasy tones */
  const PALETTE = {
    nyssa: { hair: '#ece9f6', skin: '#f7efe9', eye: '#c3b2e8', dress: '#ded8f0', accent: '#fffaf0', ribbon: '#cbb8e6' },
    liora: { hair: '#4b3a5c', skin: '#f6e2d2', eye: '#8063b4', dress: '#3f4a6e', accent: '#e4e9f4', ribbon: '#a9b4d0' },
    elowen: { hair: '#f2b9c6', skin: '#f8e6da', eye: '#7fae86', dress: '#cfdcc2', accent: '#fbf4e4', ribbon: '#e8a9b8' },
    rowan: { hair: '#4a3328', skin: '#f0d6bc', eye: '#c68a4a', dress: '#46506b', accent: '#cbb79a', ribbon: '#8a6d52' },
    mira: { hair: '#8a5a3c', skin: '#f7ddc7', eye: '#d9a95e', dress: '#e8cfd0', accent: '#fbf1e4', ribbon: '#c98f7a' },
    celeste: { hair: '#e9d095', skin: '#f8e4d0', eye: '#9dbb8f', dress: '#e6d3e8', accent: '#f8f2e2', ribbon: '#d9be7a' },
    theo: { hair: '#b9c6d9', skin: '#f2ddcd', eye: '#6f9fc4', dress: '#5a5266', accent: '#dfe3ea', ribbon: '#8fa0b8' },
    aria: { hair: '#2f3a56', skin: '#f5e2d4', eye: '#9b7fc4', dress: '#7186a8', accent: '#f3efe2', ribbon: '#b9a6d8' },
    finn: { hair: '#a85c3e', skin: '#efcfae', eye: '#9b6b46', dress: '#c9c0a8', accent: '#f6efe0', ribbon: '#7f9bb0' },
  };
  Object.keys(PALETTE).forEach((id) => {
    if (N[id]) N[id].colors = Object.assign({}, N[id].colors, PALETTE[id]);
  });
  /* =========================================================
     REFERENCE-FAITHFUL APPEARANCE — single source of truth
     Taken directly from the supplied reference sheets:
       • "Main Character Reference" / "Anime Style Reference" → the player
       • "NPC Lineup Reference" → the nine NPCs below
     Hair style, ornaments and every colour here are read straight from
     those images. Both the pixel sprite (drawPlayer / drawNPC) and the
     anime SVG portrait (render.portrait) render from this one table, so
     each character keeps the same identity in every view and expression.
     Only change these values against an updated reference sheet.
     ========================================================= */
  const APPEARANCE = {
    // silver-white layered hair, violet eyes, white-and-silver cloak, gold filigree
    nyssa: {
      hair: 'wavy', accessory: 'flower', extras: [], glow: true,
      colors: { hair: '#ece9f6', skin: '#f7efe9', eye: '#bda6ea', dress: '#e8e4f3', accent: '#fffaf0', ribbon: '#cbb8e6', trim: '#d9b06a', accColor: '#ece3fb', accColor2: '#e0c070' },
    },
    // deep plum wavy hair, violet eyes, deep purple gown, gold floral ornament
    liora: {
      hair: 'wavy', accessory: 'flower', extras: [],
      colors: { hair: '#4b3159', skin: '#f6e2d2', eye: '#ab8ed6', dress: '#4e3a63', accent: '#f4eef8', ribbon: '#c9a86a', trim: '#c9a86a', accColor: '#c9a86a', accColor2: '#8a6a3f' },
    },
    // pink wavy hair with white daisies, green eyes, white pinafore over green skirt
    elowen: {
      hair: 'wavy', accessory: 'flower', extras: [],
      colors: { hair: '#f0b8c4', skin: '#f8e6da', eye: '#7fae86', dress: '#94b487', accent: '#faf6ea', ribbon: '#e8a9b8', trim: '#7d9a72', accColor: '#fffdf8', accColor2: '#f0d98a' },
    },
    // near-black short hair, amber eyes, charcoal-navy coat over a white shirt
    rowan: {
      hair: 'short', accessory: 'none', extras: [],
      colors: { hair: '#2e2620', skin: '#f0d6bc', eye: '#c68a4a', dress: '#3a4054', accent: '#efe7d8', ribbon: '#8a6d52', trim: '#c9a86a', accColor: '#8a6d52', accColor2: '#c9a86a' },
    },
    // brown wavy hair with a peach flower headband, amber eyes, rose blouse + white apron
    mira: {
      hair: 'wavy', accessory: 'apron', extras: ['headband'],
      colors: { hair: '#8a5a3c', skin: '#f7ddc7', eye: '#cf9a55', dress: '#e3b3b8', accent: '#fdf6ec', ribbon: '#e8c9a0', trim: '#c98f7a', accColor: '#f6d0c4', accColor2: '#fbeecb' },
    },
    // golden wavy hair, green eyes, cream floral dress, large white flower headdress
    celeste: {
      hair: 'wavy', accessory: 'flower', extras: [],
      colors: { hair: '#e9d095', skin: '#f8e4d0', eye: '#9dbb8f', dress: '#efe7d2', accent: '#fbf7ee', ribbon: '#e8d9a8', trim: '#c9b58a', accColor: '#fffdf6', accColor2: '#f0d98a' },
    },
    // silver-lavender tousled hair, round glasses, dark navy coat, purple accents
    theo: {
      hair: 'short', accessory: 'glasses', extras: ['scarf'],
      colors: { hair: '#c3c9dc', skin: '#f4e4d8', eye: '#93a8cc', dress: '#3f4459', accent: '#dfe3ea', ribbon: '#6b5f8a', trim: '#8a7db0', accColor: '#b9bec9', accColor2: '#6b5f8a' },
    },
    // deep navy long hair with a blue flower, glasses, navy Victorian dress, white lace
    aria: {
      hair: 'long', accessory: 'glasses', extras: ['flower'],
      colors: { hair: '#2f3a56', skin: '#f5e2d4', eye: '#9b7fc4', dress: '#3e4a75', accent: '#f3efe2', ribbon: '#b9a6d8', trim: '#cfd8f0', accColor: '#5a6ea8', accColor2: '#cfd8f0' },
    },
    // ginger-red short curls, brown eyes, straw hat, white shirt with brown suspenders
    finn: {
      hair: 'short', accessory: 'hat', extras: ['suspenders'],
      colors: { hair: '#b05c3e', skin: '#eccfb0', eye: '#9b6b46', dress: '#8a6a4a', accent: '#f6f1e4', ribbon: '#c2a06a', trim: '#8a6a4a', accColor: '#d9bd8a', accColor2: '#c2a06a' },
    },
  };
  Object.keys(APPEARANCE).forEach((id) => {
    const a = APPEARANCE[id];
    const n = N[id];
    if (!n) return;
    n.hair = a.hair;
    n.accessory = a.accessory;
    n.extras = a.extras || [];
    if (a.glow !== undefined) n.glow = a.glow;
    n.colors = Object.assign({}, n.colors, a.colors);
  });

  // distinct silhouettes: the three men wear tailored tunics/coats
  ['rowan', 'theo', 'finn'].forEach((id) => {
    if (!N[id]) return;
    N[id].gender = 'masculine';
    N[id].outfit = 'tunic';
  });
})();
