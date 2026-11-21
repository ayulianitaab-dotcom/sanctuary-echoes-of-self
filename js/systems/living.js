/* Sanctuary — living world: village routines, overheard conversations, random
   events, secrets, branching moments and small optional activities. */
(function () {
  const L = (SAN.living = {});
  const D = SAN.data;
  const U = SAN.util;
  const S = () => SAN.state.S;

  let eventTimer = 16;
  let chatterTimer = 5;

  /* =========================================================
     DISCOVERIES
     ========================================================= */
  L.discover = function (id, silent) {
    const S_ = S();
    const sec = D.secrets[id];
    if (!S_ || !sec) return false;
    if (!S_.discoveries) S_.discoveries = {};
    if (S_.discoveries[id]) return false;
    S_.discoveries[id] = { day: S_.time.day, season: S_.time.season, year: S_.time.year };
    if (!silent) {
      SAN.ui.toast('Discovered — ' + sec.name, 'discover');
      SAN.audio.sfx('sparkle');
    }
    SAN.progression.addXp('exploration', 16);
    SAN.state.log('Discovered: ' + sec.name);
    SAN.save.autosave();
    return true;
  };
  L.discoveryCount = function () {
    const S_ = S();
    return S_ && S_.discoveries ? Object.keys(S_.discoveries).length : 0;
  };

  /* =========================================================
     FRIENDSHIP MILESTONES
     ========================================================= */
  L.pendingMilestone = function (npcId) {
    const S_ = S();
    const life = D.npcLife[npcId];
    if (!S_ || !life || !life.milestones) return null;
    const pts = SAN.rel.pts(npcId);
    for (const t of [21, 41, 61, 81]) {
      if (pts >= t && !S_.dialogueSeen['ms_' + npcId + '_' + t] && life.milestones[t]) {
        return { tier: t, scene: life.milestones[t] };
      }
    }
    return null;
  };

  L.playMilestone = function (npcId, ms) {
    const S_ = S();
    if (!S_ || !ms) return;
    S_.dialogueSeen['ms_' + npcId + '_' + ms.tier] = true;
    const npc = D.npcs[npcId];
    const pages = [{ speaker: 'narrator', text: ms.scene.title }].concat(ms.scene.pages);
    SAN.ui.dialogue({ pages });
    SAN.rel.add(npcId, 3, true);
    SAN.state.log('A moment with ' + (npc ? npc.name : npcId) + ': ' + ms.scene.title);
    SAN.progression.checkAchievements();
    SAN.save.autosave(true);
  };

  /* =========================================================
     GREETING EXTRAS — time, weather, remembered kindnesses
     ========================================================= */
  L.phaseKey = function () {
    const S_ = S();
    if (!S_) return 'afternoon';
    const mins = S_.time.minutes;
    if (mins >= 6 * 60 && mins < 12 * 60) return 'morning';
    if (mins < 17 * 60) return 'afternoon';
    if (mins < 21 * 60) return 'evening';
    return 'night';
  };

  L.extras = function (id) {
    const S_ = S();
    const life = D.npcLife[id];
    const out = [];
    if (!S_ || !life) return out;
    const w = S_.time.weather;
    if (life.weatherLines && life.weatherLines[w] && Math.random() < 0.7) out.push(life.weatherLines[w]);
    else if (life.timeLines && life.timeLines[L.phaseKey()] && Math.random() < 0.55) out.push(life.timeLines[L.phaseKey()]);
    if (!S_.world) return out;
    const gift = S_.world.gifts && S_.world.gifts[id];
    if (gift && S_.world.giftDay[id] !== S_.time.day && Math.random() < 0.4) {
      S_.world.giftDay[id] = S_.time.day;
      const item = D.item(gift);
      out.push('"The ' + item.name.toLowerCase() + ' you gave me is still on the shelf. I look at it more than I admit."');
    }
    const done = Object.keys(S_.quests.completed).filter((qid) => D.quests[qid] && D.quests[qid].giver === id);
    if (done.length && S_.world.favorDay[id] !== S_.time.day) {
      S_.world.favorDay[id] = S_.time.day;
      const ch = {
        lucien: '"You came back. You keep coming back. I am starting to believe it is a habit and not a favour."',
        elowen: '"The beds you helped with are still growing. I keep expecting you to want something for it. You never do."',
        rowan: '"I used the thing you said. The reframe. It worked for about an hour, which is a record."',
        mira: '"You are the only person who has ever asked me how I am and waited for the answer."',
        finn: '"You still have not asked me for a fishing secret. It is unsettling. In a nice way."',
        aria: '"I added a line about you. It is not a fact, strictly. It is a good line."',
        celeste: '"The lighthouse flowers are still going. You never asked who they were for."',
        theo: '"I owe you one. I do not say that to people. I am saying it to you."',
        nyssa: '"The village is doing well. You keep showing up for it. That is the whole job, you know."',
      }[id] || '"You helped me. I remember that."';
      out.push(ch);
    }
    return out;
  };

  /* =========================================================
     SMALL ACTIVITIES
     ========================================================= */
  L.activity = function (key) {
    const S_ = S();
    if (!S_ || !S_.world) return false;
    const k = key + '_' + S_.time.day;
    if (S_.world.activities[k]) return false;
    S_.world.activities[k] = true;
    return true;
  };

  /* =========================================================
     RUNE PUZZLE & THE HIDDEN GROVE
     ========================================================= */
  L.RUNE_ORDER = ['moth', 'wave', 'leaf'];

  L.rune = function (symbol) {
    const S_ = S();
    if (!S_) return;
    if (S_.world.groveOpen) {
      SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: 'The rune is warm and quiet. The forest is still holding the path open for you.' }] });
      return;
    }
    if (!Array.isArray(S_.world.runes)) S_.world.runes = [];
    S_.world.runes.push(symbol);
    const ok = S_.world.runes.every((v, i) => L.RUNE_ORDER[i] === v);
    if (!ok) {
      S_.world.runes = [];
      SAN.audio.sfx('close');
      SAN.ui.dialogue({
        pages: [
          { speaker: 'narrator', text: 'The rune dims, and something in the forest settles back to sleep.' },
          { speaker: 'narrator', text: 'Three stones. An order. You should look at the old wall again.' },
        ],
      });
      return;
    }
    if (S_.world.runes.length === L.RUNE_ORDER.length) {
      S_.world.groveOpen = true;
      SAN.audio.sfx('achieve');
      L.discover('rune_puzzle');
      L.discover('grove_open');
      SAN.ui.dialogue({
        pages: [
          { speaker: 'narrator', text: 'The three runes glow at once, and the vines between the trees draw back like a held breath.' },
          { speaker: 'narrator', text: 'A path opens to the north-west. It smells of rain and old flowers.' },
        ],
      });
      SAN.save.autosave(true);
      return;
    }
    SAN.audio.sfx('sparkle');
    SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: 'The rune glows. Somewhere behind the trees, something shifts and waits for the next word.' }] });
  };

  L.groveGate = function (fromArea) {
    const S_ = S();
    if (!S_.world.groveOpen) {
      SAN.ui.dialogue({
        pages: [
          { speaker: 'narrator', text: 'Vines grow across the path in a deliberate, patient way. Three stones stand along the forest trail, each carved with a shape.' },
          { speaker: 'narrator', text: 'The old wall near the ruin might say more. It usually does.' },
        ],
      });
      return;
    }
    SAN.ui.fadeTo(function () { SAN.world.load('grove', 13, 17); }, 280);
  };

  L.onEnter = function (areaId) {
    const S_ = S();
    if (!S_) return;
    if (areaId === 'grove') L.discover('grove_open');
  };

  /* =========================================================
     WORLD EVENTS
     ========================================================= */
  const EVENTS = [];
  function event(def) { EVENTS.push(def); }

  /* --- a very small wet cat --- */
  event({
    id: 'lost_kitten', area: 'village', phases: ['morning', 'afternoon'], once: true, minDay: 2, chance: 0.5,
    run: function () {
      SAN.audio.sfx('purr');
      SAN.ui.dialogue({
        pages: [
          { speaker: 'narrator', text: 'A very small kitten is sitting in the middle of the path, soaked through and furious about it.' },
          { speaker: 'narrator', text: 'It looks at you the way cats look at weather: personally offended, and willing to negotiate.' },
        ],
        choices: [
          {
            label: 'Sit down and wait for it to calm',
            cb: function () {
              SAN.living.discover('lost_kitten');
              SAN.progression.addXp('exploration', 10);
              SAN.ui.dialogue({
                pages: [
                  { speaker: 'narrator', text: 'You sit on the wet stones and do nothing at all. After a while the kitten climbs into your lap, as if it was your idea.' },
                  { speaker: 'narrator', text: 'When it is warm and dry it walks off without a backward glance. You feel absurdly honoured.' },
                ],
              });
              SAN.save.autosave();
            },
          },
          {
            label: 'Carry it to the bakery door',
            cb: function () {
              SAN.living.discover('lost_kitten');
              SAN.rel.add('mira', 5);
              SAN.state.addItem('yarn_ball', 1);
              SAN.ui.dialogue({
                pages: [
                  { speaker: 'narrator', text: 'You tuck the kitten inside your coat and leave it by the warm bakery door with a saucer of milk.' },
                  { speaker: 'narrator', text: 'Later, Mira will tell you a cat has moved into the bakery and has opinions about the bread schedule.' },
                ],
              });
              SAN.save.autosave();
            },
          },
        ],
      });
    },
  });

  /* --- someone at the pond --- */
  event({
    id: 'pond_crying', area: 'garden', phases: ['evening'], once: true, minDay: 3, chance: 0.6,
    check: function () { return !!SAN.world.npcById('elowen'); },
    run: function () {
      const npc = SAN.world.npcById('elowen');
      if (!npc) return;
      SAN.ui.dialogue({
        pages: [
          { speaker: 'narrator', text: 'Elowen is sitting on the bench by the pond with his hands in his lap. He is crying, very quietly, the way people do when they have practised not making noise.' },
          { speaker: 'elowen', text: '"Oh. Hello." She wipes her face with her sleeve. "It is the soil. It is not — it is fine."' },
        ],
        choices: [
          {
            label: 'Sit down beside her and say nothing',
            cb: function () {
              SAN.rel.add('elowen', 7);
              SAN.quests.setFlag('sat_with_elowen', true);
              SAN.audio.sfx('sparkle');
              SAN.ui.dialogue({
                pages: [
                  { speaker: 'narrator', text: 'You sit. The frogs keep arguing. After a long time her breathing evens out.' },
                  { speaker: 'elowen', text: '"You did not ask me what was wrong." She sounds almost surprised. "Thank you."' },
                ],
              });
              SAN.save.autosave(true);
            },
          },
          {
            label: 'Ask if she wants to talk about it',
            cb: function () {
              SAN.rel.add('elowen', 4);
              SAN.ui.dialogue({
                pages: [
                  { speaker: 'elowen', text: '"Not really. But I like that you asked instead of deciding for me."' },
                  { speaker: 'narrator', text: 'She stays a while longer. So do you.' },
                ],
              });
              SAN.save.autosave();
            },
          },
          {
            label: 'Give her space',
            cb: function () {
              SAN.rel.add('elowen', 2);
              SAN.ui.dialogue({
                pages: [{ speaker: 'narrator', text: 'You leave quietly. There is no penalty for not being needed. She knows where to find you.' }],
              });
            },
          },
        ],
      });
    },
  });

  /* --- a letter on the tide line --- */
  event({
    id: 'beach_letter', area: 'beach', phases: ['morning', 'afternoon'], once: true, minDay: 2, chance: 0.55,
    run: function () {
      SAN.state.addItem('letter_old', 1);
      SAN.living.discover('letter_beach');
      SAN.ui.dialogue({
        pages: [
          { speaker: 'narrator', text: 'Something pale is caught in the wrack. A sealed letter in a waxed envelope, addressed only: "The lighthouse. For whoever is there."' },
          { speaker: 'narrator', text: 'The ink has bled at the edges. It is not yours to open. It is yours to carry.' },
        ],
      });
      SAN.save.autosave(true);
    },
  });

  /* --- the visitor --- */
  event({
    id: 'mysterious_visitor', area: 'village', phases: ['evening'], once: true, minDay: 4, chance: 0.5,
    run: function () {
      SAN.ui.dialogue({
        pages: [
          { speaker: 'narrator', text: 'A traveller in a grey cloak has set a crate on the edge of the square. They do not look like they are selling anything.' },
          { speaker: 'narrator', text: '"I heard there is a gardener here," they say, "who can keep a starflower alive through a bad winter."' },
          { speaker: 'narrator', text: 'They hold up a paper packet: a single seed, very old, very carefully kept.' },
        ],
        choices: [
          {
            label: 'Trade a bramble rose for it',
            cb: function () {
              if (!SAN.state.count('wild_rose')) {
                SAN.ui.toast('You do not have a bramble rose.', 'info');
                return;
              }
              SAN.state.removeItem('wild_rose', 1);
              SAN.state.addItem('seed_starflower', 1);
              SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: 'They wrap the seed in a square of cloth and hand it over with both hands. "It likes being spoken to. Do not tell anyone I said that."' }] });
              SAN.save.autosave(true);
            },
          },
          {
            label: 'Buy it for 120 coins',
            cb: function () {
              if (!SAN.state.spend(120)) { SAN.ui.toast('You do not have enough coins.', 'warn'); return; }
              SAN.state.addItem('seed_starflower', 1);
              SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: 'They count the coins without looking at them. "It likes being spoken to," they say. "That is all the advice I have."' }] });
              SAN.save.autosave(true);
            },
          },
          { label: 'Say no, and let them rest a while', cb: function () {
              SAN.rel.add('nyssa', 1);
              SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: 'They nod, unsurprised, and sit on the fountain rim with you for a while. In the morning the crate is gone, but the square smells of rain and old flowers.' }] });
            } },
        ],
      });
    },
  });

  /* --- something blooming out of season --- */
  event({
    id: 'sudden_bloom', area: 'garden', phases: ['morning', 'afternoon'], once: true, minDay: 3, chance: 0.45,
    run: function () {
      SAN.state.addItem('starflower', 1);
      SAN.state.addItem('glow_moss', 1);
      SAN.living.discover('sudden_bloom');
      SAN.audio.sfx('sparkle');
      SAN.ui.dialogue({
        pages: [
          { speaker: 'narrator', text: 'At the edge of the beds, where nobody planted anything, a starflower has opened in the wrong season.' },
          { speaker: 'narrator', text: 'It is not supposed to be here. It is doing it anyway. You take one bloom and leave the rest.' },
        ],
      });
      SAN.save.autosave();
    },
  });

  /* --- a small request --- */
  event({
    id: 'village_favour', area: 'village', phases: ['morning', 'afternoon', 'evening'], cooldownDays: 3, minDay: 3, chance: 0.5,
    check: function () { return SAN.state.count('fiber') >= 3; },
    run: function () {
      const present = SAN.world.npcs.filter((n) => n.def.id !== 'nyssa');
      const npc = present.length ? U.pick(present) : null;
      const name = npc ? npc.def.name : 'Someone';
      SAN.ui.dialogue({
        pages: [
          { speaker: npc ? npc.def.id : 'narrator', text: '"Oh — good, you are here. I need three bundles of soft fibre for the winter repair list, and I keep forgetting to ask."' },
          { speaker: 'narrator', text: 'They say it lightly. Asking is the hard part, for some people.' },
        ],
        choices: [
          { label: 'Hand over three fibre', cb: function () {
              if (!SAN.state.count('fiber') >= 3) return;
              SAN.state.removeItem('fiber', 3);
              SAN.state.earn(90);
              if (npc) SAN.rel.add(npc.def.id, 6);
              SAN.ui.dialogue({ pages: [{ speaker: npc ? npc.def.id : 'narrator', text: '"You did not make it into a whole thing. I appreciate that more than the fibre."' }] });
              SAN.save.autosave(true);
            } },
          { label: 'Ask what it is for', cb: function () {
              SAN.ui.dialogue({ pages: [{ speaker: npc ? npc.def.id : 'narrator', text: '"The shelter roof. The one behind the store. It leaks on the crates." A pause. "I have been meaning to ask someone for a month."' }] });
            } },
        ],
      });
    },
  });

  /* --- a cache under the roots --- */
  event({
    id: 'forest_cache', area: 'forest', phases: ['morning', 'afternoon', 'evening', 'night'], cooldownDays: 4, minDay: 2, chance: 0.5,
    run: function () {
      const loot = U.pick([['sea_glass', 2], ['pearl', 1], ['glow_moss', 2], ['stone', 3]]);
      SAN.state.addItem(loot[0], loot[1]);
      SAN.living.discover('secret_cache');
      SAN.ui.dialogue({
        pages: [
          { speaker: 'narrator', text: 'Your boot knocks something hollow under the roots. A tin, rusted at the seams, wrapped in oilcloth.' },
          { speaker: 'narrator', text: 'Inside: ' + loot[1] + ' ' + D.item(loot[0]).name.toLowerCase() + ', and a note that says "I was here. That is enough."' },
        ],
      });
      SAN.save.autosave(true);
    },
  });

  /* --- the weather turns --- */
  event({
    id: 'sudden_storm', area: null, outdoor: true, phases: ['afternoon', 'evening'], cooldownDays: 5, minDay: 3, chance: 0.4,
    check: function (S_) { return S_.time.weather === 'sunny' || S_.time.weather === 'cloudy'; },
    run: function () {
      const S_ = S();
      S_.time.weather = 'storm';
      SAN.audio.ambient('storm');
      SAN.ui.toast('The sky turns over. Rain arrives all at once.', 'info');
      SAN.ui.dialogue({
        pages: [
          { speaker: 'narrator', text: 'The light goes green-grey, the wind picks up, and the whole village starts moving toward doors at the same time.' },
          { speaker: 'narrator', text: 'You are soaked through in nine seconds. It is somehow wonderful.' },
        ],
      });
      S_.energy = Math.max(0, S_.energy - 3);
      SAN.save.autosave(true);
    },
  });

  /* --- lantern night --- */
  event({
    id: 'lantern_night', area: 'village', phases: ['night'], once: true, minDay: 5, chance: 0.6,
    run: function () {
      const S_ = S();
      S_.world.lanternNight = true;
      S_.world.lanternDay = S_.time.day;
      SAN.audio.sfx('bell');
      SAN.ui.dialogue({
        pages: [
          { speaker: 'narrator', text: 'The square is full of lanterns. Nobody announced this. Somebody simply started, and everyone else brought a light.' },
          { speaker: 'narrator', text: 'Mira is handing out something warm. Lucien has come down from the lighthouse without being asked. Rowan is standing in the middle of it, not analysing anything.' },
          { speaker: 'narrator', text: 'Nobody asks you to do anything. You are allowed to just be here.' },
        ],
      });
      D.npcOrder.forEach((id) => { if (S_.friendship[id]) SAN.rel.add(id, 2); });
      SAN.progression.addXp('exploration', 12);
      SAN.living.discover('lantern_night');
      SAN.save.autosave(true);
    },
  });

  /* =========================================================
     EVENT SCHEDULER
     ========================================================= */
  function currentPhase() { return L.phaseKey(); }

  L.attemptEvent = function (force) {
    const S_ = S();
    const W = SAN.world;
    if (!S_ || !W.cur || !S_.started) return false;
    if (!S_.world) return false;
    if (S_.world.eventDay !== S_.time.day) { S_.world.eventDay = S_.time.day; S_.world.eventsToday = 0; }
    if (!force && S_.world.eventsToday >= 2) return false;
    const area = W.area;
    const phase = currentPhase();
    const pool = EVENTS.filter((ev) => {
      if (ev.area && ev.area !== W.cur) return false;
      if (ev.outdoor && area && (area.region === 'indoor')) return false;
      if (ev.phases && ev.phases.indexOf(phase) < 0) return false;
      if (ev.minDay && S_.time.day < ev.minDay) return false;
      const seen = S_.world.seen[ev.id];
      if (ev.once && seen) return false;
      if (ev.cooldownDays && seen && S_.time.day - seen.day < ev.cooldownDays) return false;
      if (ev.check && !ev.check(S_)) return false;
      return true;
    });
    if (!pool.length) return false;
    const ev = U.pick(pool);
    if (!force && Math.random() > (ev.chance == null ? 0.55 : ev.chance)) return false;
    S_.world.seen[ev.id] = { day: S_.time.day, season: S_.time.season };
    S_.world.eventsToday = (S_.world.eventsToday || 0) + 1;
    S_.world.lastEventMinute = S_.time.minutes;
    ev.run(S_);
    return true;
  };

  /* =========================================================
     NPC OVERHEARD CONVERSATIONS
     ========================================================= */
  const GENERIC_CHATTER = [
    '"Cold for the season." / "Mm. Good for the soil."',
    '"Did you see the light this morning?" / "I slept through it. Deliberately."',
    '"The bread is good today." / "The bread is good every day. Say something else."',
    '"Any luck with the nets?" / "Define luck."',
    '"You look tired." / "I am awake. That is the whole claim."',
    '"I am going to sit down for a minute." / "You said that an hour ago. Sit down anyway."',
    '"Did you water the bluebells?" / "The sky did. I supervised."',
    '"I keep meaning to ask you something." / "Ask me later. Ask me later is my favourite conversation."',
    '"The wind is doing that thing again." / "It is a windmill. It does the thing."',
  ];

  function tickChatter(dt) {
    const S_ = S();
    const W = SAN.world;
    if (!S_ || !W.cur) return;
    W.npcs.forEach((n) => { if (n.bubble) n.bubble.t -= dt; });
    chatterTimer -= dt;
    if (chatterTimer > 0) return;
    chatterTimer = 2.4 + Math.random() * 3.6;
    if (W.npcs.length < 2) return;
    for (let i = 0; i < W.npcs.length; i++) {
      for (let j = i + 1; j < W.npcs.length; j++) {
        const a = W.npcs[i], b = W.npcs[j];
        if (a.bubble || b.bubble) continue;
        if (Math.hypot(a.px - b.px, a.py - b.py) > 56) continue;
        const convo = D.chatter.find((c) => (c.a === a.def.id && c.b === b.def.id) || (c.a === b.def.id && c.b === a.def.id));
        const line = convo ? U.pick(convo.lines) : U.pick(GENERIC_CHATTER);
        if (!line) continue;
        const parts = line.split(' / ');
        const saidA = parts[0].replace(/^"|"$/g, '');
        const saidB = (parts[1] || '…').replace(/^"|"$/g, '');
        a.bubble = { text: saidA, t: 4.6, self: true };
        b.bubble = { text: saidB, t: 4.6, self: false };
        a.facing = b.px < a.px ? 'left' : 'right';
        b.facing = a.px < b.px ? 'left' : 'right';
        a.chatting = b.chatting = true;
        a.huddle = b.huddle = false;
        a.chatTimer = b.chatTimer = 4.6;
        return;
      }
    }
    // nobody close enough to talk: bring the nearest pair together
    let best = null;
    for (let i = 0; i < W.npcs.length; i++) {
      for (let j = i + 1; j < W.npcs.length; j++) {
        const a = W.npcs[i], b = W.npcs[j];
        if (a.pose === 'sit' || b.pose === 'sit' || a.chatTimer > 0 || b.chatTimer > 0) continue;
        const d = Math.hypot(a.px - b.px, a.py - b.py);
        if (d > 230 || d < 12) continue;
        if (!best || d < best.d) best = { a, b, d };
      }
    }
    if (!best || Math.random() > 0.75) return;
    const a = best.a, b = best.b;
    const ax = a.px / 16, ay = a.py / 16, bx = b.px / 16, by = b.py / 16;
    const nearA = { x: ax + (bx - ax) * 0.38, y: ay + (by - ay) * 0.38 };
    const nearB = { x: bx + (ax - bx) * 0.38, y: by + (ay - by) * 0.38 };
    if (!SAN.world.isSolid(Math.floor(nearA.x), Math.floor(nearA.y))) { a.target = nearA; a.pose = 'hurry'; a.huddle = true; }
    if (!SAN.world.isSolid(Math.floor(nearB.x), Math.floor(nearB.y))) { b.target = nearB; b.pose = 'hurry'; b.huddle = true; }
  }

  /* =========================================================
     UPDATE
     ========================================================= */
  L.update = function (dt) {
    const S_ = S();
    if (!S_ || !S_.started) return;
    tickChatter(dt);

    if (S_.world.eventDay !== S_.time.day) { S_.world.eventDay = S_.time.day; S_.world.eventsToday = 0; }
    if (S_.world.eventsToday >= 2) return;
    if (S_.world.lastEventMinute != null && S_.time.minutes - S_.world.lastEventMinute < 70) return;
    eventTimer -= dt;
    if (eventTimer > 0) return;
    eventTimer = 18 + Math.random() * 12;
    if (S_.stats.daysPlayed < 2) return;
    L.attemptEvent(false);
  };

  /* Debug/testing hook */
  L.events = EVENTS;
})();
