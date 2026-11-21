/* Sanctuary — romance data: stages, activities, boundaries, per-character scenes.
   Every NPC here is an adult; nothing sexual is ever described, only faded out. */
(function () {
  const D = SAN.data || (SAN.data = {});
  const R = (D.romance = {});

  /* ---------------- relationship stages ---------------- */
  R.STAGES = [
    { id: 'stranger', name: 'Stranger' },
    { id: 'acquaintance', name: 'Acquaintance' },
    { id: 'friend', name: 'Friend' },
    { id: 'closefriend', name: 'Close Friend' },
    { id: 'interest', name: 'Romantic Interest' },
    { id: 'dating', name: 'Dating' },
    { id: 'committed', name: 'Committed' },
    { id: 'partner', name: 'Life Partner' },
  ];

  /* ---------------- shared activities ----------------
     minStage indexes R.STAGES. gain is affection, never friendship alone.
     once: at most once per day. home: only inside your cottage. */
  R.ACTIVITIES = [
    { id: 'walk', label: 'Walk together', icon: '🥾', minStage: 1, gain: 4, once: true, blurb: 'A slow loop of the village, no destination.' },
    { id: 'hand', label: 'Hold hands', icon: '🤝', minStage: 4, gain: 3, once: false, limit: 2, blurb: 'Fingers laced, unhurried.' },
    { id: 'hug', label: 'Hug', icon: '🫂', minStage: 4, gain: 3, once: false, limit: 2, blurb: 'A long one. The kind that resets a day.' },
    { id: 'stargaze', label: 'Stargaze', icon: '✦', minStage: 4, gain: 6, once: true, night: true, blurb: 'Lie back and name what you can see.' },
    { id: 'dance', label: 'Dance', icon: '♫', minStage: 4, gain: 7, once: true, blurb: 'No music but the room.' },
    { id: 'memory', label: 'Share a memory', icon: '📖', minStage: 3, gain: 6, once: true, blurb: 'Tell them something you have not told anyone.' },
    { id: 'gift', label: 'Give a romantic gift', icon: '🌷', minStage: 4, gain: 5, once: true, blurb: 'Something with meaning, not price.' },
    { id: 'dinner', label: 'Romantic dinner', icon: '🍷', minStage: 5, gain: 8, once: true, evening: true, blurb: 'Two plates, one candle, no rush.' },
    { id: 'kiss', label: 'Kiss', icon: '💗', minStage: 5, gain: 5, once: false, limit: 2, privateOnly: true, blurb: 'Ask first. Always.' },
    { id: 'cuddle', label: 'Cuddle', icon: '🛏️', minStage: 5, gain: 4, once: true, privateOnly: true, blurb: 'Close, warm, and entirely yours to stop.' },
    { id: 'cook', label: 'Cook together', icon: '🍲', minStage: 5, gain: 6, once: true, home: true, blurb: 'Flour everywhere. Laughing anyway.' },
    { id: 'fire', label: 'Sit by the fire', icon: '🔥', minStage: 5, gain: 5, once: true, home: true, evening: true, blurb: 'Two chairs, one blanket, quiet.' },
    { id: 'craft', label: 'Craft together', icon: '🧵', minStage: 5, gain: 5, once: true, home: true, blurb: 'Making something small and useless and perfect.' },
  ];

  R.ACTIVITY = (id) => R.ACTIVITIES.find((a) => a.id === id);

  /* a memory is written when something real happens */
  R.romanceable = ['nyssa', 'liora', 'elowen', 'rowan', 'mira', 'celeste', 'theo', 'aria', 'finn'];

  const N = (R.npcs = {});

  /* =========================================================
     NYSSA — village guardian, older than counting
     ========================================================= */
  N.nyssa = {
    adult: true, // every romanceable character is an adult; intimate scenes fade to black
    style: 'luminous, patient, and afraid of wanting',
    pace: 0.7,
    boundaries: {
      pda: false,
      privateOnly: true,
      note: 'She will not be touched in front of the village. Not yet. Not as a spectacle.',
      noTouching: ['kiss', 'cuddle'],
    },
    refusals: {
      private: '\"Not here, with the whole village watching. Some things are only for quiet rooms.\"',
      pace: '\"You are moving faster than I know how to. Let me catch up to you.\"',
      low: '\"I care for you. I am not there yet, and I will not pretend to be.\"',
      night: '\"The morning is kinder for this. Ask me then.\"',
    },
    lines: {
      walk: 'She walks half a step behind you, so she can watch the way you notice things.',
      hand: 'Her hand is cool and very steady. She holds on like it is a decision, not a habit.',
      hug: 'She does not breathe for a moment, then does, slowly, against your shoulder.',
      stargaze: '\"I have watched those stars move. They are the only things older than me that still bother to show up.\"',
      dance: 'She moves like water finding a shape. \"I have not done this in a century. Do not laugh.\"',
      memory: 'You tell her about the year you could not get out of bed. She says, \"Thank you for surviving it in front of me.\"',
      gift: 'She turns the gift over. \"You keep giving me reasons to stay in one place.\"',
      dinner: 'She hardly eats. She watches you eat, and that seems to be the meal.',
      kiss: 'She closes her eyes a second before you do, like she has already decided to trust you.',
      cuddle: 'She is warm in a way that has nothing to do with temperature. \"Do not tell the village I do this.\"',
      cook: 'She burns the onions and apologises to them. You have never loved anyone so specifically.',
      fire: 'She sits on the floor rather than the chair, back against your knees, and says nothing for an hour.',
      craft: 'She makes a small clay bird. It is terrible. She keeps it in her sleeve.',
      rain: 'Rain on the cottage roof. She listens to it like a message she has been waiting for.',
    },
    morning: '\"You are still here.\" She says it as a fact she is checking, gently.',
    goodnight: '\"Sleep. I will keep the lamp low and the night honest.\"',
    comfort: 'She sits beside you without asking what is wrong, and that is exactly right.',
    events: {
      friend: ['\"You have stopped flinching when I appear. I noticed. It took four months.\"'],
      story: ['\"I was made to watch over this place. Nobody asked if I wanted a smaller life.\"', '\"You are the first person who asked what I wanted instead.\"'],
      date: ['\"A whole evening with no duties. I do not know what to do with my hands.\"', 'She decides: hold yours.'],
      commit: ['\"I have watched generations love each other badly and call it fate.\"', '\"I would like to do this well, with you, on purpose.\"'],
      anniversary: ['\"One more year of you. I have counted carefully. I intend to keep counting.\"'],
    },
    confession: {
      ask: 'You take her hand and tell her the truth you have been carrying.',
      yes: ['She is quiet for a long moment. \"I was afraid you would ask, and more afraid you would not.\"', '\"Yes. Slowly. Honestly. Yes.\"'],
      notYet: '\"Not yet. Not because I do not want it — because I want it to be true when I say it.\"',
    },
    home: {
      cook: 'She stands very close and does not help, and you let her.',
      fire: 'She watches the fire like an old friend, then watches you like a new one.',
      craft: 'She holds the thread while you sew. It is the most ordinary happiness you have had.',
    },
  };

  /* =========================================================
     LIORA — lighthouse keeper, steady and scared of being left
     ========================================================= */
  N.liora = {
    adult: true, // every romanceable character is an adult; intimate scenes fade to black
    style: 'warm, careful, and braver than she believes',
    pace: 1,
    boundaries: {
      pda: true,
      privateOnly: false,
      note: 'She is fine being seen with you. She is not fine being a rumour.',
    },
    refusals: {
      private: '\"Not in the middle of the village. I have a reputation for being sensible.\"',
      pace: '\"Slow down. I am not running. That is the whole point of me.\"',
      low: '\"I like you. I am not ready for that, and I am allowed to say so.\"',
      night: '\"The lamp needs me tonight. Ask me when the sky is clear.\"',
    },
    lines: {
      walk: 'She takes the sea path, then admits she chose it because the sunset is better there.',
      hand: 'Her hands are rough from rope and lamp oil. She laces her fingers in yours anyway.',
      hug: 'She holds on a beat longer than expected, then steps back and pretends she did not.',
      stargaze: '\"Out there, a ship is using my lamp to find its way home. Feels strange to be the reason.\"',
      dance: 'She counts the steps under her breath. Then stops counting.',
      memory: 'You tell her about the night you left somewhere. She says, \"I know that night. I have been in it.\"',
      gift: 'She puts it on the windowsill immediately, where she can see it from the stairs.',
      dinner: 'She lights the good candle and pretends it was already there.',
      kiss: 'She asks, \"Is this all right?\" before, and again after, and means it both times.',
      cuddle: 'She falls asleep first, which she would be embarrassed about if she knew.',
      cook: 'She is a terrible cook and a wonderful accomplice.',
      fire: 'She tells you the story of every dent in the lamp room floor.',
      craft: 'She makes a rope bracelet, badly, and ties it on your wrist herself.',
      rain: 'She opens the window to hear it. \"Storms are just weather being honest.\"',
    },
    morning: '\"Morning. The kettle is on. I am not good at this yet, but I am trying.\"',
    goodnight: '\"Goodnight. If you cannot sleep, the lamp room is warm.\"',
    comfort: 'She sits with you on the west step until you can breathe again.',
    events: {
      friend: ['\"I saved you a seat. I have started saving you a seat. That is a thing I do now.\"'],
      story: ['\"Four years alone up here. I told myself it was duty.\"', '\"It was easier than asking someone to stay and hearing them say no.\"'],
      date: ['She brings a blanket to the beach and apologises for the sand twice.', '\"I planned this. That is not something I usually admit.\"'],
      commit: ['\"I have kept a light burning for strangers my whole life.\"', '\"I would like to keep one for you. Not as a duty. As a choice.\"'],
      anniversary: ['\"Every year the lamp gets serviced. This is the only anniversary I look forward to.\"'],
    },
    confession: {
      ask: 'You tell her you would like to be the person who keeps coming back.',
      yes: ['\"Oh.\" Her eyes go bright and she laughs at herself. \"I practised a calm response. That is gone now.\"', '\"Yes. I want that. I have wanted it for a while.\"'],
      notYet: '\"I need a little time. Not a no — a not yet. Please do not go far.\"',
    },
    home: {
      cook: 'She burns the bread and you eat it anyway, both of you laughing.',
      fire: 'She falls asleep against your shoulder and wakes up apologising.',
      craft: 'She is hopeless with a needle and very proud of the crooked result.',
    },
  };

  /* =========================================================
     ELOWEN — gardener, self-reliant, learning to be helped
     ========================================================= */
  N.elowen = {
    adult: true, // every romanceable character is an adult; intimate scenes fade to black
    style: 'quiet, observant, and easily overwhelmed by kindness',
    pace: 0.8,
    boundaries: {
      pda: false,
      privateOnly: true,
      note: 'Affection is not a performance for her. It happens in greenhouses and kitchens.',
      noTouching: ['kiss', 'cuddle'],
    },
    refusals: {
      private: '\"Not outside. Please. I do not want to be looked at while I feel something.\"',
      pace: '\"That is a lot. In a good way. I still need a minute to hold it.\"',
      low: '\"I like you. I am not there yet. I am not going to say it to be polite.\"',
      night: '\"I have seedlings that need me at dawn. Another night.\"',
    },
    lines: {
      walk: 'She names every plant you pass. Half of them she apologises to.',
      hand: 'She goes still, then holds on with the concentration of someone carrying something fragile.',
      hug: 'She forgets to let go, then remembers, then looks at the floor.',
      stargaze: '\"The stars are just very far plants. I know that is not accurate. I like it anyway.\"',
      dance: 'She dances like she is being watched. Then you close the curtain, and she does not.',
      memory: 'You tell her about asking for help and being refused. She says, \"That is why I stopped asking.\"',
      gift: 'She turns it over twice. \"You noticed. Nobody notices the specific things.\"',
      dinner: 'She brings vegetables from the greenhouse and refuses to be thanked.',
      kiss: 'She asks if it is okay with her eyes before she moves, and waits for the answer.',
      cuddle: 'She is tense for a minute, then goes soft, like soil after rain.',
      cook: 'She cuts everything into perfect pieces and cannot explain why it matters.',
      fire: 'She sits close enough that your sleeves touch, and pretends not to notice.',
      craft: 'She makes a tiny pot by hand. \"For a cutting. Not for you. Maybe for you.\"',
      rain: '\"The beds needed this,\" she says, and then stays at the window anyway.',
    },
    morning: '\"You are up. Good. I was going to be normal about it and then I saw you.\"',
    goodnight: '\"Sleep well. I will be here in the morning. That is — that is fine, right?\"',
    comfort: 'She does not say anything useful. She stays, and that is the useful part.',
    events: {
      friend: ['\"I saved you a cutting. It is nothing.\" It is clearly not nothing.'],
      story: ['\"When the roof broke I fixed it alone because asking felt like a bill I could not pay.\"', '\"You asked me to let you help and I have been thinking about it for weeks.\"'],
      date: ['She takes you to the greenhouse after closing. It is the most personal place she has.', '\"I want you to see it. That is a big thing for me. Please do not make it weird.\"'],
      commit: ['\"I have been alone on purpose for a long time. It stopped being a preference and became a habit.\"', '\"I would like to break it with you. Carefully.\"'],
      anniversary: ['\"The lavender we planted is four years old now. So are we. Both still alive. Good.\"'],
    },
    confession: {
      ask: 'You tell her you would like to be someone she does not have to do everything without.',
      yes: ['She covers her face with both hands for a second. \"Okay. Okay. Yes.\"', '\"I am going to be bad at this. I want to be bad at it with you.\"'],
      notYet: '\"I need time. I am not saying no. I am saying I need to be sure I mean it.\"',
    },
    home: {
      cook: 'She arranges the vegetables by colour and you let her, because it makes her happy.',
      fire: 'She brings a plant to the fire because \"it was cold\". You let that happen too.',
      craft: 'She learns the stitch in one try and then teaches it back to you, patiently.',
    },
  };

  /* =========================================================
     ROWAN — windmill keeper, overthinking, generous
     ========================================================= */
  N.rowan = {
    adult: true, // every romanceable character is an adult; intimate scenes fade to black
    style: 'nervous, sincere, and always rehearsing',
    pace: 1,
    boundaries: {
      pda: true,
      privateOnly: false,
      note: 'He is fine being seen. He will simply think about it for three days afterwards.',
    },
    refusals: {
      private: '\"Oh — here? In front of the bread queue? I would love to. I would also die.\"',
      pace: '\"Can I have a second? Not because I do not want to. Because I am me.\"',
      low: '\"I like you a lot. I am not ready to say the bigger thing yet. I hope that is okay.\"',
      night: '\"I have to be up with the sails. Rain check? That was not a weather joke. Or it was.\"',
    },
    lines: {
      walk: 'He talks the whole way about a conversation you had last week, then apologises for it.',
      hand: 'He checks twice that your hand is comfortable. Then he relaxes, finally.',
      hug: 'He holds on and says, \"Okay. This is good. I am noting this.\"',
      stargaze: '\"I have counted those three about forty times. I keep thinking they will change.\"',
      dance: 'He is a terrible dancer and stops apologising after the second song.',
      memory: 'You tell him the thing you have never said out loud. He says, \"I will not repeat it. I will just know it.\"',
      gift: 'He looks at it for a long time. \"You chose this for me. On purpose. That is — okay. Wow.\"',
      dinner: 'He rehearsed three topics. You talk about none of them and it is better.',
      kiss: 'He says, \"I have thought about this so much,\" and then stops thinking.',
      cuddle: 'He goes quiet in a way that means his head has finally stopped.',
      cook: 'He reads the recipe aloud like a legal document. It helps, somehow.',
      fire: 'He asks if he can put his head on your shoulder. Then asks again to be sure.',
      craft: 'He makes a mess and a small wooden bird. \"It is a bird. It is not a good bird.\"',
      rain: 'He stands at the window and says, \"Rain is just the sky doing something instead of nothing.\"',
    },
    morning: '\"Hi. Good morning. I have already thought about six things to say. This is the one.\"',
    goodnight: '\"Goodnight. I will probably replay this conversation. In a nice way.\"',
    comfort: 'He asks what would help, then does exactly that, then asks if it helped.',
    events: {
      friend: ['\"I wrote you a note and then did not send it. Here. I am sending it now. Please read it later.\"'],
      story: ['\"I keep a notebook of things I almost said. There are a lot of pages.\"', '\"You are the first person I have read one to.\"'],
      date: ['He plans it for two weeks. The plan is a disaster. The date is not.', '\"I am going to stop apologising for being excited. Starting now. Sorry. Starting now.\"'],
      commit: ['\"I used to think if I stopped worrying I would miss something.\"', '\"With you I miss fewer things. I would like to keep doing that.\"'],
      anniversary: ['\"I remembered the date without checking. That is a first. I am very proud.\"'],
    },
    confession: {
      ask: 'You tell him that you have noticed the notes, and that you would like to be the person they are for.',
      yes: ['\"Oh. Oh no. I had a whole calm speech.\"', '\"Yes. Obviously yes. I have been obvious, haven\'t I?\"'],
      notYet: '\"I need to be sure I am not just excited. That is not a no. Please wait for me.\"',
    },
    home: {
      cook: 'He measures everything twice. You kiss his shoulder and he loses count.',
      fire: 'He sits on the floor by your chair and finally stops talking.',
      craft: 'He makes a second bird, better than the first, and gives it to you without a joke.',
    },
  };

  /* =========================================================
     MIRA — baker, generous, learning to receive
     ========================================================= */
  N.mira = {
    adult: true, // every romanceable character is an adult; intimate scenes fade to black
    style: 'warm, funny, and quietly starving for care',
    pace: 1.2,
    boundaries: {
      pda: true,
      privateOnly: false,
      note: 'She will hold your hand across the counter in front of everyone. She will not be rushed.',
    },
    refusals: {
      private: '\"Sweetheart, there are four people in this shop. Later.\"',
      pace: '\"Not so fast. I have spent my whole life being the one who gives. Let me breathe.\"',
      low: '\"I adore you. I am not ready for that. Please do not make it heavy.\"',
      night: '\"I am up at four. Another night, I promise.\"',
    },
    lines: {
      walk: 'She brings bread for the walk and gives half of it away before you leave the square.',
      hand: 'She holds your hand over the counter and dares anyone to comment.',
      hug: 'She hugs like she is putting something down that she has carried all day.',
      stargaze: 'She brings a blanket and two slices of cake and says, \"A picnic. At night. I am a genius.\"',
      dance: 'She dances like the kitchen is a ballroom and the flour is confetti.',
      memory: 'You tell her about being the one who holds everything. She says, \"Oh, honey. Me too.\"',
      gift: 'She actually sits down with it. \"Nobody gives me things. I do not know where to put my face.\"',
      dinner: 'She cooks, you wash up, and she lets you.',
      kiss: 'She tastes like cinnamon and she laughs halfway through, delighted.',
      cuddle: 'She falls asleep in three minutes flat and wakes up saying sorry.',
      cook: 'She bosses you around the kitchen lovingly and feeds you constantly.',
      fire: 'She brings a tray of mostly-failed pastries and calls it dinner.',
      craft: 'She decorates everything you make with little dough flowers. It is not a craft anymore.',
      rain: 'She opens the shop door to the rain and says, \"Smell that. Free aromatherapy.\"',
    },
    morning: '\"Morning, love. There is bread. There is always bread. Sit down.\"',
    goodnight: '\"Goodnight. Eat something before bed. That is an order from a professional.\"',
    comfort: 'She feeds you first and asks questions second, which is exactly the right order.',
    events: {
      friend: ['\"You are taking the bread. Good. People who refuse things make me nervous.\"'],
      story: ['\"I inherited this shop. Everyone says how lucky. I have never once said how tired.\"', '\"I am telling you because you would not make it a thing.\"'],
      date: ['She closes the bakery early, which has never happened. \"Do not tell the village.\"', 'She sets the table with the good plates and cries a little at the good plates.'],
      commit: ['\"I have looked after this whole village. It is a good life. It is also very loud.\"', '\"I want one quiet person to look after me. I am choosing you. Please choose back.\"'],
      anniversary: ['\"One year since I let someone bring me bread. Life-changing. Genuinely.\"'],
    },
    confession: {
      ask: 'You tell her you would like to be the one who brings her bread.',
      yes: ['She puts down the tray she is holding. \"Say that again. Slowly.\"', '\"Yes. God, yes. I have been so obvious.\"'],
      notYet: '\"I need to believe it first. Give me a little time. I am not going anywhere.\"',
    },
    home: {
      cook: 'You cook together and she tastes everything with a spoon and gives notes.',
      fire: 'She puts her feet in your lap and says, \"This is the entire holiday I wanted.\"',
      craft: 'She is covered in flour and glitter and having the best evening of her month.',
    },
  };

  /* =========================================================
     CELESTE — florist, gentle, speaks in flowers
     ========================================================= */
  N.celeste = {
    adult: true, // every romanceable character is an adult; intimate scenes fade to black
    style: 'slow, tender, and a little far away',
    pace: 0.8,
    boundaries: {
      pda: false,
      privateOnly: true,
      note: 'She keeps affection out of the shop. Flowers are for the public; this is not.',
    },
    refusals: {
      private: '\"Not in the shop. The whole village buys flowers here and I would like to keep it mine.\"',
      pace: '\"Let this be slow. Slow things keep.\"',
      low: '\"There is affection here. There is not yet the thing you are asking for.\"',
      night: '\"The flowers need closing up. Tomorrow, if the weather is kind.\"',
    },
    lines: {
      walk: 'She stops at every garden. You are late everywhere and it does not matter.',
      hand: 'She holds your hand like she is arranging it, then leaves it alone.',
      hug: 'She smells of green stems and rain. She holds you until you let go first.',
      stargaze: '\"Starflowers open for the moon. I think they are showing off.\"',
      dance: 'She dances with her eyes closed. \"I am not good at this. I am good at meaning it.\"',
      memory: 'You tell her about someone you lost. She does not comfort you with flowers. She just listens.',
      gift: 'She presses it into her book immediately. \"This one goes in the good book.\"',
      dinner: 'She arranges the table like a bouquet and refuses to explain the symbolism.',
      kiss: 'She takes your face in both hands first, and asks with a look.',
      cuddle: 'She is still for once. No arranging. No planning. Just there.',
      cook: 'She puts edible flowers on everything, including things that should not have flowers.',
      fire: 'She talks about the village in bouquets: who is grieving, who is in love, who is pretending.',
      craft: 'She makes a dried-flower charm and ties it to your bag without a word.',
      rain: 'She stands in the doorway with you, watching the garden drink.',
    },
    morning: '\"You are here. Good. I picked something for you at dawn. I always do now.\"',
    goodnight: '\"Sleep. I will leave the window open for the night flowers.\"',
    comfort: 'She brings you a single stem and sits beside you, saying nothing.',
    events: {
      friend: ['\"I put your flowers in the front window now. I do not do that for everyone.\"'],
      story: ['\"I loved someone once who bought flowers every week for someone else.\"', '\"I gave him the best ones. I have been trying to be less generous with myself since.\"'],
      date: ['She closes the shop and lights a single candle among the buckets.', '\"This is the first time this room has been only mine, and I am sharing it.\"'],
      commit: ['\"I have spent ten years saying things with flowers because words frightened me.\"', '\"Here are the words: I want a life with you in it.\"'],
      anniversary: ['\"The peonies come back every year without being asked. I am trying to learn that.\"'],
    },
    confession: {
      ask: 'You tell her, in words, what the flowers have been saying.',
      yes: ['She is quiet for a long time. \"I wondered if I was inventing it.\"', '\"Yes. I would like that very much. Slowly.\"'],
      notYet: '\"Not yet. I need to be sure it is not just the season. Wait for me.\"',
    },
    home: {
      cook: 'She makes tea out of things she grew and you pretend to like all of them.',
      fire: 'She sits with her head on your shoulder and names the plants in the firelight.',
      craft: 'She presses flowers into the pages of your notebook, marking days.',
    },
  };

  /* =========================================================
     THEO — merchant, theatrical, secretly steady
     ========================================================= */
  N.theo = {
    adult: true, // every romanceable character is an adult; intimate scenes fade to black
    style: 'playful on the surface, sincere underneath',
    pace: 1,
    boundaries: {
      pda: true,
      privateOnly: false,
      note: 'He will flirt in public all day. He will only mean it in private.',
    },
    refusals: {
      private: '\"In the market? My reputation is theatrical, not scandalous.\"',
      pace: '\"You are outpacing the cart. The cart is slow. Be slow with me.\"',
      low: '\"I like you. I am not ready to make it a fact. Give me a season.\"',
      night: '\"The cart leaves at dawn. Tonight I need to pack. Ask me tomorrow.\"',
    },
    lines: {
      walk: 'He narrates the walk like a tour of places that do not exist. It is wonderful.',
      hand: 'He holds your hand and says, \"Careful. I am a bad investment,\" and does not let go.',
      hug: 'He hugs like a man who has not been hugged in a while and is pretending it is casual.',
      stargaze: '\"I have navigated by those. Badly. That is why I stay on roads.\"',
      dance: 'He is excellent and makes sure you notice, then gets shy when you say so.',
      memory: 'You tell him something true. He drops the performance completely. \"Thank you. That is the real thing.\"',
      gift: 'He examines it like merchandise, then puts it in his coat pocket, close.',
      dinner: 'He sets the table with things from the cart and tells you what each one cost, then admits the real price.',
      kiss: 'He is quiet afterwards, which from him is enormous.',
      cuddle: 'He strokes your hair and says nothing clever at all.',
      cook: 'He claims to have invented the recipe. He has not. He is a good chopper.',
      fire: 'He tells you a story with three endings until you tell him which one you believe.',
      craft: 'He makes something with too many clasps and is unreasonably proud.',
      rain: 'He says, \"Rain is good for the cart. Rust is good for the story.\"',
    },
    morning: '\"Good morning. I have already invented a rumour about us. It is tasteful.\"',
    goodnight: '\"Goodnight. I will be here in the morning. That is not a sales pitch.\"',
    comfort: 'He makes a joke, then stops making jokes, then stays.',
    events: {
      friend: ['\"I do not usually stay two seasons in one place. Ask me why I am still here.\"'],
      story: ['\"My father drove this cart. He sold a man a map to a place that was not real, and the man found it.\"', '\"I have been trying to work out if I am running toward something or from it.\"'],
      date: ['He takes you to the cart after closing, which is the closest thing he has to a home.', '\"This is not impressive. It is the most honest thing I own.\"'],
      commit: ['\"I could leave tomorrow. I have done it before, easily.\"', '\"The fact that I do not want to is the most frightening thing in my life. I would like to stay.\"'],
      anniversary: ['\"One year in one place. My father would be astonished. He would also approve.\"'],
    },
    confession: {
      ask: 'You tell him you would like him to stay because he wants to, not because the cart is stuck.',
      yes: ['\"You know I am going to say something theatrical.\" He does not. He just nods, twice.', '\"Yes. Stay. I will stay. That is the whole answer.\"'],
      notYet: '\"Ask me when I have unpacked. I want to give you a real answer, not a performance.\"',
    },
    home: {
      cook: 'He seasons things by instinct and is right every time, which is infuriating.',
      fire: 'He tells you about the roads, one town at a time, until you both fall asleep.',
      craft: 'He builds a little shelf for your things and hides a note under it.',
    },
  };

  /* =========================================================
     ARIA — librarian, dry, hopelessly romantic under it
     ========================================================= */
  N.aria = {
    adult: true, // every romanceable character is an adult; intimate scenes fade to black
    style: 'dry, precise, and devastating when she means something',
    pace: 0.9,
    boundaries: {
      pda: false,
      privateOnly: true,
      note: 'The library is her whole self. She will not be affectionate where she works.',
    },
    refusals: {
      private: '\"Not in the library. I have a system. The system does not include this.\"',
      pace: '\"Let me finish the sentence, at least. You are always three lines ahead.\"',
      low: '\"I am fond of you. I am not finished deciding how much. Do not take that as a no.\"',
      night: '\"I have an index to finish. Tomorrow.\"',
    },
    lines: {
      walk: 'She brings a book and does not read a word of it.',
      hand: 'She laces her fingers through yours and says, \"Filed under: good.\"',
      hug: 'She is stiff, then not, and then says, \"Do not tell anyone I am like this.\"',
      stargaze: '\"None of this is catalogued. It is deeply upsetting. It is also beautiful.\"',
      dance: 'She claims not to dance. She dances exactly three steps and then cannot stop.',
      memory: 'You tell her about a thing you have been trying to outlive. She says, \"I am putting it in the record. It is not a sad entry.\"',
      gift: 'She goes quiet. \"This is going on the shelf. The special one. I told you about the special one.\"',
      dinner: 'She brings a book to dinner and closes it before the first course.',
      kiss: 'She takes off her glasses. That is the whole sentence.',
      cuddle: 'She reads aloud to you, badly, on purpose, and keeps going after you fall asleep.',
      cook: 'She follows the recipe exactly and it is the blandest meal you have ever loved.',
      fire: 'She reads you the village ledger from a hundred years ago. It is funnier than it should be.',
      craft: 'She writes a label for everything you make, including the failures.',
      rain: 'She opens the window and says, \"The library needed the noise.\"',
    },
    morning: '\"Morning. I wrote something about you. No, you cannot read it. Yes, it is good.\"',
    goodnight: '\"Goodnight. I will leave a lamp on. That is not a metaphor. It is also a metaphor.\"',
    comfort: 'She puts down the book entirely. That is how you know.',
    events: {
      friend: ['\"You are in the ledger. Under things worth keeping.\"'],
      story: ['\"I remember everything so it cannot surprise me at night.\"', '\"You are the first thing I have wanted to be surprised by.\"'],
      date: ['She closes the library early and takes you to the back room nobody sees.', '\"This is the real building. The rest is a public service.\"'],
      commit: ['\"I am very good at recording other people\'s lives. I have not been brave about my own.\"', '\"I would like to write you in. Permanently.\"'],
      anniversary: ['\"One year. I have the date in three places, and I checked all three this morning.\"'],
    },
    confession: {
      ask: 'You tell her you would like to be a fact she keeps, not a footnote.',
      yes: ['\"Oh.\" She takes off her glasses, which is a whole language.', '\"Yes. I have had this drafted for some time. I was waiting for the right edition.\"'],
      notYet: '\"I need to be certain. Not about you. About me. Give me a little time.\"',
    },
    home: {
      cook: 'She alphabetises the spices and you let her, then she cooks something wonderful.',
      fire: 'She reads to you in the firelight until her voice goes soft.',
      craft: 'She writes a tiny title on the book you bind and hides her pride badly.',
    },
  };

  /* =========================================================
     FINN — fisherman, easygoing, quietly grieving
     ========================================================= */
  N.finn = {
    adult: true, // every romanceable character is an adult; intimate scenes fade to black
    style: 'easy, warm, and slower than he looks',
    pace: 1,
    boundaries: {
      pda: true,
      privateOnly: false,
      note: 'He is comfortable in public. He will not be rushed into anything that matters.',
    },
    refusals: {
      private: '\"Here? With the whole pier watching? No, thank you.\"',
      pace: '\"Slow down, friend. The good fish take time.\"',
      low: '\"I am fond of you. I am not ready to say it bigger than that.\"',
      night: '\"Tide turns at four. Tonight is not the night.\"',
    },
    lines: {
      walk: 'He walks the tideline, points at nothing, and is right about most of it.',
      hand: 'He holds your hand and says, \"Well. This is a good day.\"',
      hug: 'He gives a long, solid hug and then clears his throat and changes the subject.',
      stargaze: 'He names the stars wrong on purpose until you laugh at him.',
      dance: 'He shuffles, entirely unembarrassed, and it is the most charming thing in the village.',
      memory: 'You tell him something heavier than you meant to. He says, \"I know that weight. I will not tell you it is light.\"',
      gift: 'He turns it in his hands. \"My wife would have liked you. That is not a sad thing. It is the highest thing.\"',
      dinner: 'He cooks fish. You act surprised. He acts surprised that you are surprised.',
      kiss: 'He is careful and warm and afterwards he just smiles, that slow one.',
      cuddle: 'He is solid and still, and says, \"This is the best weather.\"',
      cook: 'He guts the fish with terrifying efficiency and then apologises for the smell.',
      fire: 'He tells you about his father and the three bass, and cries a little, and keeps talking.',
      craft: 'He mends a net and teaches you a knot you will never forget.',
      rain: 'He says, \"The sea is doing its big mood. We can do ours.\"',
    },
    morning: '\"Morning. Kettle is on. The water is calm today. Good sign.\"',
    goodnight: '\"Sleep easy. If you cannot, come out and we will watch the dark together.\"',
    comfort: 'He sits beside you with a hand on your back and does not say a word.',
    events: {
      friend: ['\"I saved your spot on the pier. It is a real spot. I painted a small mark.\"'],
      story: ['\"My wife died six years ago. I came out here the next morning and kept working.\"', '\"I am not sad all the time. I am sad at the edges. That is easier to carry.\"'],
      date: ['He takes you out on the water at sunset. \"This is the good tour. There is no other tour.\"', 'He is quiet out here in a way that makes you quiet too.'],
      commit: ['\"I thought I had my one great love and that was that.\"', '\"I keep finding out I was wrong about how much room there is. I would like to make room with you.\"'],
      anniversary: ['\"One year of good weather. Not the literal weather. You.\"'],
    },
    confession: {
      ask: 'You tell him that this has stopped being friendship for you, and you are not asking for guarantees.',
      yes: ['She (He) nods slowly, twice. \"I was hoping. I did not want to presume.\"', '\"Yes. Come on, then. Let us be weather-companions properly.\"'],
      notYet: '\"I need a little while. Not because of you. Because of me. Do not go far.\"',
    },
    home: {
      cook: 'He cooks, you fetch things, and he narrates the meal like a sea voyage.',
      fire: 'He sits with his arm along the back of the sofa and lets the fire do the talking.',
      craft: 'He fixes a chair that did not need fixing and looks pleased about it.',
    },
  };

  /* fill pronoun tokens in any line */
  R.fill = function (text, player) {
    const p = SAN.state.pronoun(player && player.pronoun);
    return String(text)
      .replace(/\{name\}/g, (player && player.name) || 'you')
      .replace(/\{they\}/g, p.subject)
      .replace(/\{them\}/g, p.object)
      .replace(/\{their\}/g, p.possessive)
      .replace(/\{They\}/g, p.subject.charAt(0).toUpperCase() + p.subject.slice(1));
  };
})();
