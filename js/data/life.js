/* Sanctuary — the village's inner life: traits, histories, milestones, chatter,
   secrets, photo challenges. Loaded after npcs.js so it can annotate them. */
(function () {
  const D = SAN.data || (SAN.data = {});

  /* =========================================================
     INNER LIFE — every villager has a past, habits and a way of
     being seen that changes as trust grows.
     ========================================================= */
  D.npcLife = {
    nyssa: {
      traits: ['ancient', 'patient', 'quietly amused'],
      history: 'She has watched Sanctuary through nine generations of gardens. She remembers every person who ever left, and every one who came back.',
      timeLines: {
        morning: '"The village is still yawning. This is my favourite hour — everyone is honest before they are awake."',
        afternoon: '"You are allowed to do nothing today. I will not tell anyone."',
        evening: '"Evenings are for putting things down. Whatever you are carrying can wait until morning."',
        night: '"The well and I keep each other company. It is not a lonely job if you like the company."',
      },
      weatherLines: {
        rain: '"Rain is the village exhaling. Stay a while."',
        fog: '"Fog makes everything a rumour. Even your worries."',
        snow: '"Snow is silence you can walk through."',
      },
      milestones: {
        21: {
          title: 'The Guardian Notices',
          pages: [
            { speaker: 'nyssa', text: '"You have started saying hello to the well. It told me. It is a terrible gossip."' },
            { speaker: 'nyssa', text: '"I do not need you to be grateful for this place. I only hoped you would stop bracing for it to be taken away."' },
          ],
        },
        41: {
          title: 'What The Village Remembers',
          pages: [
            { speaker: 'nyssa', text: '"When you first came, you walked like someone apologising for the space they took."' },
            { speaker: 'nyssa', text: '"You take up room now. I have been waiting to see it."' },
          ],
        },
        61: {
          title: 'The Long Watch',
          pages: [
            { speaker: 'nyssa', text: '"I am not a god, whatever the older villagers say. I am a promise that outlived the people who made it."' },
            { speaker: 'nyssa', text: '"Someone once asked me to keep this valley kind. I have been doing that ever since. It is the only thing I have ever wanted to be good at."' },
          ],
        },
        81: {
          title: 'A Place You Can Return To',
          pages: [
            { speaker: 'nyssa', text: '"You know you can leave, don\'t you? Sanctuary will still be here. That is the whole point of it."' },
            { speaker: 'nyssa', text: '"And you will still be welcome. That is the other half of the point."' },
          ],
        },
      },
    },

    liora: {
      traits: ['steady', 'warm', 'braced for departure'],
      history: 'She came inland-to-sea at nineteen and stayed. Her mother left in spring, four years ago, and Liora has kept a lamp for strangers ever since.',
      timeLines: {
        morning: '"The tide went out further than usual. I always take that personally, which is silly."',
        afternoon: '"Afternoon light makes the lens look like it is full of honey. I polish it slower than I need to."',
        evening: '"This is the hour I used to dread. It is getting easier. Some evenings."',
        night: '"The lamp is lit. Whatever else is true, that part is done."',
      },
      weatherLines: {
        rain: '"Ships cannot see rain. They can see the lamp. That is why I keep it clean."',
        storm: '"Storms are honest. They do not pretend to be anything else."',
        fog: '"Fog is the worst. You keep the light on and trust that someone is out there."',
      },
      milestones: {
        21: {
          title: 'The West Step',
          pages: [
            { speaker: 'liora', text: '"You can sit here. It is not reserved. I only say that because I used to pretend it was."' },
            { speaker: 'liora', text: 'She does not move over to make room. She has already left space.' },
          ],
        },
        41: {
          title: 'A Door Left Unlocked',
          pages: [
            { speaker: 'liora', text: '"I have been thinking about why I keep the lamp lit for strangers and not for — anyone else."' },
            { speaker: 'liora', text: '"I think it is easier to be needed by people who cannot leave. Ships always leave."' },
            { speaker: 'narrator', text: 'She looks at you, then away. "That was more than I meant to say. You can stay anyway."' },
          ],
        },
        61: {
          title: 'The Photograph',
          pages: [
            { speaker: 'liora', text: '"I found the photograph again. I put it in a drawer with the letters, which is progress, or at least tidying."' },
            { speaker: 'liora', text: '"I used to think if I stopped waiting, it meant I agreed with how she left. I do not think that anymore. Mostly."' },
          ],
        },
        81: {
          title: 'Someone To Look For',
          pages: [
            { speaker: 'liora', text: '"When you are out walking, I find myself checking the path. Not because I am worried."' },
            { speaker: 'liora', text: '"Because there is somebody I would be glad to see. That is different. I had to learn the difference."' },
          ],
        },
      },
    },

    elowen: {
      traits: ['observant', 'self-reliant', 'easily embarrassed by kindness'],
      history: 'She rebuilt the greenhouse roof alone last winter and tells everyone it was fine. She keeps a cutting of every plant that survived her.',
      timeLines: {
        morning: '"Morning is for checking who made it through the night. Plants are very honest about that."',
        afternoon: '"I have been repotting since noon. My hands smell like soil and I have forgotten to eat. Again."',
        evening: '"The light in here goes gold at this hour. It makes even the weeds look intentional."',
        night: '"I should go home. I am going to stay a bit longer. Do not tell anyone."',
      },
      weatherLines: {
        rain: '"Rain means I do not have to water. It also means I have no excuse to avoid thinking."',
        storm: '"The roof holds. I checked it twice. Three times."',
        snow: '"Everything outside is asleep. In here it is still stubbornly green."',
      },
      milestones: {
        21: {
          title: 'A Cutting',
          pages: [
            { speaker: 'elowen', text: '"I saved this for you. It is a lavender cutting. It is not a — I am not good at this part."' },
            { speaker: 'elowen', text: '"You do not have to keep it alive. But it would be nice."' },
          ],
        },
        41: {
          title: 'The Cost Of Asking',
          pages: [
            { speaker: 'elowen', text: '"I practised asking you for help in my head for two days. Then I did it myself and cried in the shed."' },
            { speaker: 'elowen', text: '"It is not that I think you would say no. It is that I do not know who I am if I need someone."' },
          ],
        },
        61: {
          title: 'The Sister',
          pages: [
            { speaker: 'elowen', text: '"My sister sends letters. I answer them with plant advice, because plant advice is safe."' },
            { speaker: 'elowen', text: '"She wrote: \'I do not need you to be useful, I need you to be my sister.\' I have not answered that one yet. I will."' },
          ],
        },
        81: {
          title: 'Two Pairs Of Hands',
          pages: [
            { speaker: 'elowen', text: '"The starflower came back this year. I did not do that alone."' },
            { speaker: 'elowen', text: 'She says it plainly, without apologising, and goes back to the trays. It is the most she has ever said.' },
          ],
        },
      },
    },

    rowan: {
      traits: ['curious', 'self-critical', 'kind in a sideways way'],
      history: 'He took over the windmill from a man who never explained anything. He has been reverse-engineering the gears, and his own thoughts, ever since.',
      timeLines: {
        morning: '"I was awake at four. Not on purpose. My brain had a meeting and I was not invited."',
        afternoon: '"I have been oiling the same gear for twenty minutes. It is very well oiled now."',
        evening: '"The wind drops at this hour. My head gets louder. I am trying to find that funny."',
        night: '"If I am still up, come and sit. Misery loves company, and so does almost everything else."',
      },
      weatherLines: {
        rain: '"Rain on the mill roof is the best sound. It drowns out about forty percent of me."',
        fog: '"Fog days are dangerous. My imagination has nowhere else to go."',
        snow: '"Look — the whole world has stopped performing. Very restful."',
      },
      milestones: {
        21: {
          title: 'A Smaller Story',
          pages: [
            { speaker: 'rowan', text: '"I replayed our last conversation for an hour. You did not do anything wrong. I just wanted you to know that I know that."' },
            { speaker: 'rowan', text: '"My brain writes sequels nobody asked for."' },
          ],
        },
        41: {
          title: 'The Argument In My Head',
          pages: [
            { speaker: 'rowan', text: '"There is a version of this conversation where you are bored of me. He is very convincing. He has citations."' },
            { speaker: 'rowan', text: '"You are still here, though. That is evidence. I am trying to collect evidence."' },
          ],
        },
        61: {
          title: 'Something Kind, Said Plainly',
          pages: [
            { speaker: 'rowan', text: '"I have been trying to say one kind thing about myself a day. Today: I got out of bed and the mill is still standing."' },
            { speaker: 'rowan', text: '"It sounds small. It is not small. You would be surprised how loud small can be."' },
          ],
        },
        81: {
          title: 'The Quiet After',
          pages: [
            { speaker: 'rowan', text: '"I had a whole evening without analysing anything. My brain kept offering, and I kept saying: not now."' },
            { speaker: 'rowan', text: '"You were there. I think that helped more than the technique."' },
          ],
        },
      },
    },

    mira: {
      traits: ['generous', 'cheerful', 'never asks for anything'],
      history: 'She has run the bakery since she was twenty-two and gives away more than she sells. She is the first to notice when someone has not eaten.',
      timeLines: {
        morning: '"Everything is out of the oven and the whole street smells like a promise."',
        afternoon: '"The afternoon lull. I always mean to sit down and then I start on the next batch."',
        evening: '"I love this hour. The shop is warm and everyone is a bit softer."',
        night: '"I am supposed to be closed. I am not closed. I am \'finishing up\'."',
      },
      weatherLines: {
        rain: '"Rain days are bread days. Everyone wants something warm to hold."',
        storm: '"I keep the oven on for the smell. It makes the storm less dramatic."',
        snow: '"Snow means cinnamon. It is not a rule, it is just true."',
      },
      milestones: {
        21: {
          title: 'The Offcuts Plate',
          pages: [
            { speaker: 'mira', text: '"Take the plate. It is offcuts. It is not a favour, it is — it is just what happens at closing."' },
            { speaker: 'narrator', text: 'The plate is not offcuts. It is the good pastry, arranged.' },
          ],
        },
        41: {
          title: 'Nobody Asks The Baker',
          pages: [
            { speaker: 'mira', text: '"Do you know what nobody ever says to me? \'How are you, actually.\' They say \'smells great\' and I say \'thanks!\' and that is the whole conversation."' },
            { speaker: 'mira', text: '"I am fine. Mostly. It is just nice to be asked."' },
          ],
        },
        61: {
          title: 'The Recipe Book',
          pages: [
            { speaker: 'mira', text: '"This was my mother\'s. She wrote notes in the margins. Mostly complaints about my father. Some about flour."' },
            { speaker: 'mira', text: '"I add a note every year. Last year\'s says: \'still here, still baking, still nobody asks.\'" Then she laughs, and does not look at you.' },
          ],
        },
        81: {
          title: 'Something For The Baker',
          pages: [
            { speaker: 'mira', text: '"You brought me something and did not say \'you can share it\'. Do you know how rare that is?"' },
            { speaker: 'mira', text: '"I did share it. But I ate the first one. That is growth."' },
          ],
        },
      },
    },

    celeste: {
      traits: ['gentle', 'perceptive', 'speaks in flowers'],
      history: 'She learned the language of flowers from her grandmother, who used bouquets to say the things their family could not. She still sends flowers to the lighthouse every spring.',
      timeLines: {
        morning: '"Morning flowers open for nobody in particular. I find that admirable."',
        afternoon: '"Afternoons are for arranging. The stems tell you where they want to go."',
        evening: '"Evening is when the scent gets brave. Lilac especially."',
        night: '"Some flowers only open at night. I keep the shop lit for them."',
      },
      weatherLines: {
        rain: '"Rain makes the colours honest. Come and see."',
        fog: '"Fog is a very soft grey. It goes with everything."',
        snow: '"Nothing blooms in snow. That is why we keep dried ones."',
      },
      milestones: {
        21: {
          title: 'A Flower For No Occasion',
          pages: [
            { speaker: 'celeste', text: '"A sprig of rosemary. For remembrance. Not of anything in particular — just, remembrance as a habit."' },
            { speaker: 'celeste', text: '"People only buy flowers for occasions. It is a shame. Tuesdays deserve flowers."' },
          ],
        },
        41: {
          title: 'The Language',
          pages: [
            { speaker: 'celeste', text: '"My grandmother used bouquets instead of sentences. Lavender for steadiness. Bluebell for constancy."' },
            { speaker: 'celeste', text: '"She sent my grandfather a bouquet that meant \'I am angry and I love you and I am not leaving\'. He kept it until it crumbled."' },
          ],
        },
        61: {
          title: 'Someone Who Does Not Ask',
          pages: [
            { speaker: 'celeste', text: '"The lighthouse gets flowers every spring. No name. He knows it is me. He has never once asked."' },
            { speaker: 'celeste', text: '"That is the kindest thing anyone has ever done for me — letting me give without making me explain."' },
          ],
        },
        81: {
          title: 'Tuesdays',
          pages: [
            { speaker: 'celeste', text: '"This is for today. Not a birthday, not an apology. Just a Tuesday."' },
            { speaker: 'celeste', text: 'She ties the ribbon with the ease of someone who has been waiting to give you something uncomplicated.' },
          ],
        },
      },
    },

    theo: {
      traits: ['wry', 'private', 'surprisingly loyal'],
      history: 'He arrives with a cart, a story and no fixed address. Nobody knows where he goes in winter. He knows everyone\'s favourite thing and never says how.',
      timeLines: {
        morning: '"Early bird gets the — actually, I have never been up this early. What is happening?"',
        afternoon: '"Afternoon trade. Best time for people to buy something they do not need."',
        evening: '"The light is good for selling. Sentiment gets cheaper after sunset, and more expensive."',
        night: '"I do not sleep much on the road. The stall is the closest thing I have to a home."',
      },
      weatherLines: {
        rain: '"Rain is good for business. People buy things to feel less damp."',
        fog: '"Mysterious weather. I have been leaning into it."',
        snow: '"Snow means nobody travels. Which means I am staying. Which is — fine. It is fine."',
      },
      milestones: {
        21: {
          title: 'A Fair Trade',
          pages: [
            { speaker: 'theo', text: '"You actually came back. Most people browse and vanish. I respect a browser, but a returner is rarer."' },
            { speaker: 'theo', text: '"Here. No charge. Do not tell the other customers, they will want a personality discount."' },
          ],
        },
        41: {
          title: 'The Cart',
          pages: [
            { speaker: 'theo', text: '"This cart has been everywhere. It has a dent from a town that no longer exists."' },
            { speaker: 'theo', text: '"I keep moving because stopping means being somewhere. Somewhere means someone can leave. You see the problem."' },
          ],
        },
        61: {
          title: 'Winter Address',
          pages: [
            { speaker: 'theo', text: '"I do not usually tell people this. In winter I stay with my sister. She has a spare room and a very loud dog."' },
            { speaker: 'theo', text: '"I told you because you would not make it a thing. Please do not make it a thing."' },
          ],
        },
        81: {
          title: 'Staying A While',
          pages: [
            { speaker: 'theo', text: '"I have been parked here eleven days. That is a personal record, and mildly alarming."' },
            { speaker: 'theo', text: '"It turns out it is easier to stay somewhere when someone is glad you did. Who knew. Everyone. Everyone knew."' },
          ],
        },
      },
    },

    aria: {
      traits: ['precise', 'sentimental', 'keeps everything'],
      history: 'She has kept the village ledger for nine years — births, storms, the price of onions. She keeps an unlabelled box of things people asked her to forget.',
      timeLines: {
        morning: '"The light comes in at this hour and lands exactly on the oldest page. I have never moved the desk."',
        afternoon: '"Afternoon is for indexing. Nobody indexes anymore. I am the last of a dying art."',
        evening: '"Evenings are for reading what other people wrote. It is the most companionable way to be alone."',
        night: '"The library at night is not empty. It is just quiet in a way that includes you."',
      },
      weatherLines: {
        rain: '"Rain days are busy. Everyone remembers they meant to read something."',
        fog: '"Fog does something to the light in here. Very flattering to old paper."',
        snow: '"Snow and libraries. The two best reasons to stay indoors."',
      },
      milestones: {
        21: {
          title: 'Your Entry',
          pages: [
            { speaker: 'aria', text: '"I have started an entry for you. Name, arrival date, and one line of description."' },
            { speaker: 'aria', text: '"It says: \'arrived in spring, looked like someone who had been carrying their own suitcase for years\'. Is that all right?"' },
          ],
        },
        41: {
          title: 'The Box',
          pages: [
            { speaker: 'aria', text: '"There is a box in the back. People bring me things they want kept but not remembered. I never open it."' },
            { speaker: 'aria', text: '"I used to think that was discipline. Now I think I am afraid of what I would find of my own in there."' },
          ],
        },
        61: {
          title: 'One Line At A Time',
          pages: [
            { speaker: 'aria', text: '"I wrote about my father\'s boat in the ledger. Not the date it sank — the day he taught me knots on it."' },
            { speaker: 'aria', text: '"Records are supposed to be facts. I have decided this one can be a feeling. He would have liked that."' },
          ],
        },
        81: {
          title: 'The Ledger, Continuing',
          pages: [
            { speaker: 'aria', text: '"I have begun writing about the living. Births. Gardens. Who sits with whom at the tea shop."' },
            { speaker: 'aria', text: '"You are in it more than anyone. That is not an accident of record-keeping."' },
          ],
        },
      },
    },

    finn: {
      traits: ['easygoing', 'observant', 'quieter than he looks'],
      history: 'He has fished these waters since he was six. His grandfather taught him knots; the star hook was the last thing that was actually his.',
      timeLines: {
        morning: '"Best hour for fish, worst for conversation. Do not take it personally."',
        afternoon: '"Afternoons are for repairing nets and inventing excuses not to."',
        evening: '"The sunset is doing its thing again. Show-off."',
        night: '"Night fishing is just sitting with better lighting."',
      },
      weatherLines: {
        rain: '"Fish do not care about rain. Fish are very philosophic."',
        storm: '"Not today. Even I am not that attached to the pier."',
        fog: '"You can hear the harbour before you see it. Strange comfort."',
      },
      milestones: {
        21: {
          title: 'Two Chairs',
          pages: [
            { speaker: 'finn', text: '"I brought a second chair. For the pier. Not for anyone specific. It is just a nice chair."' },
            { speaker: 'narrator', text: 'The chair is clearly for you. You sit in it.' },
          ],
        },
        41: {
          title: 'The Best Spot',
          pages: [
            { speaker: 'finn', text: '"I have a spot nobody knows about. I am going to show you, and you have to promise not to bring anyone. Not because it is secret. Because it is mine."' },
            { speaker: 'finn', text: '"It is two rocks and a view. It is not even that good. It is mine."' },
          ],
        },
        61: {
          title: 'Grandfather',
          pages: [
            { speaker: 'finn', text: '"My grandfather fished alone for thirty years. I used to think that was romantic."' },
            { speaker: 'finn', text: '"Now I think he was just lonely and nobody asked. I do not want to be noble about it. I want to be asked."' },
          ],
        },
        81: {
          title: 'The Quiet Someone',
          pages: [
            { speaker: 'finn', text: '"You do not talk while I fish. That is a specific talent."' },
            { speaker: 'finn', text: '"Most people fill the quiet. You let it be quiet. I did not know how much I needed that until you did it."' },
          ],
        },
      },
    },
  };

  /* =========================================================
     OVERHEARD CONVERSATIONS
     ========================================================= */
  D.chatter = [
    { a: 'mira', b: 'nyssa', lines: ['"You never eat anything I bake." / "I eat the idea of it, Mira. Constantly."', '"That is not the compliment you think it is."'] },
    { a: 'liora', b: 'finn', lines: ['"Anything biting?" / "One carp. He looked at me with real disappointment."', '"Carp are like that."'] },
    { a: 'elowen', b: 'celeste', lines: ['"The starflower took." / "Of course it did. You asked it nicely."', '"I did not — I just watered it."'] },
    { a: 'rowan', b: 'aria', lines: ['"Do you have anything about gears?" / "Only about people who talk about gears."', '"That is basically the same book."'] },
    { a: 'theo', b: 'mira', lines: ['"I have a jar of honey from the meadow." / "You have a jar of honey from somewhere. Fixed it for you."'] },
    { a: 'nyssa', b: 'aria', lines: ['"The ledger is getting long." / "That is what living does, Nyssa."', '"It is a good problem."'] },
    { a: 'finn', b: 'rowan', lines: ['"You are thinking too loud." / "I am thinking at an appropriate volume."'] },
    { a: 'mira', b: 'celeste', lines: ['"These are for the bakery window." / "These are for the lighthouse. Do not tell anyone."'] },
  ];

  /* =========================================================
     SECRETS & DISCOVERIES
     ========================================================= */
  D.secrets = {
    grove_open: {
      name: 'The Hidden Grove',
      text: 'Three old runes, read in the right order, opened a path the forest had been holding shut. Nobody else seems to have found it.',
      icon: 'leaf',
    },
    rune_puzzle: {
      name: 'The Order of Stones',
      text: 'Moth, then wave, then leaf. The ruin said it plainly, in the way old carvings always think is plain.',
      icon: 'stone',
    },
    letter_beach: {
      name: 'A Letter That Washed Up',
      text: 'A letter from someone called Ilse, to someone at the lighthouse. It is only weather and recipes, and an apology four sentences late.',
      icon: 'paper',
    },
    letter_library: {
      name: 'The Page In The Book',
      text: 'A note in the back of a returned novel: "If you are reading this, you are not the only one who needed to sit quietly today."',
      icon: 'paper',
    },
    letter_grove: {
      name: 'The Grove Letter',
      text: 'A note left by the shrine, wrapped in oilcloth: "I planted this for a feeling I could not name. It is doing well. I hope you are too."',
      icon: 'paper',
    },
    lighthouse_log: {
      name: 'The Lighthouse Log',
      text: 'Every vessel, every storm, every quiet night, for four years. On the first page: "For whoever comes in."',
      icon: 'book',
    },
    secret_cache: {
      name: 'The Buried Cache',
      text: 'Someone buried a tin under the forest roots: sea glass, a shell, and a note that says "I was here. That is enough."',
      icon: 'chest',
    },
    lost_kitten: {
      name: 'The Kitten In The Rain',
      text: 'A very small, very wet cat in the middle of the path, furious about the weather. It let you help. That felt like a decision it made.',
      icon: 'cat',
    },
    sudden_bloom: {
      name: 'The Wrong-Season Starflower',
      text: 'A starflower opened in the garden in the wrong month, entirely on purpose as far as it is concerned.',
      icon: 'flower',
    },
    lantern_night: {
      name: 'Lantern Night',
      text: 'Nobody planned it. Somebody lit one lantern and the whole square followed. You were allowed to just stand there and be part of it.',
      icon: 'lamp',
    },
    cellar: {
      name: 'The Cottage Cellar',
      text: 'Behind a loose board under the kitchen table: one bottle of something old and a very dusty jar of jam. The jam is still good.',
      icon: 'book',
    },
  };

  /* =========================================================
     PHOTO CHALLENGES
     ========================================================= */
  D.photoChallenges = [
    { id: 'ph_home', name: 'Home, Remembered', desc: 'Photograph your own cottage from outside.', reward: 80 },
    { id: 'ph_lighthouse', name: 'The Light Returning', desc: 'Photograph the lighthouse at sunset.', reward: 120 },
    { id: 'ph_cat', name: 'A Very Good Cat', desc: 'Catch your cat sleeping.', reward: 60 },
    { id: 'ph_life', name: 'Village Life', desc: 'Fit three villagers into one photograph.', reward: 140 },
    { id: 'ph_rain', name: 'Rain On The Glass', desc: 'Take a photograph while it rains.', reward: 100 },
    { id: 'ph_night', name: 'Somewhere Quiet', desc: 'Photograph the meadow at night.', reward: 160 },
    { id: 'ph_grove', name: 'A Place Nobody Knows', desc: 'Photograph the hidden grove.', reward: 200 },
    { id: 'ph_festival', name: 'The Village, Together', desc: 'Photograph a festival.', reward: 180 },
  ];
})();
