/* Sanctuary — interaction dispatch and all dialogue/scene scripting */
(function () {
  const A = (SAN.actions = {});
  const U = SAN.util;

  const S = () => SAN.state.S;

  /* =========================================================
     WORLD TRANSITIONS
     ========================================================= */
  A.transition = function (ex) {
    if (ex.locked && SAN.world.locked(ex.locked)) {
      SAN.ui.toast('The path is hidden. Something must change first.', 'info');
      return;
    }
    SAN.ui.fadeTo(function () {
      SAN.world.load(ex.to, ex.tx, ex.ty);
      SAN.cat.placeNearPlayer();
    }, 260);
  };

  A.enterArea = function (id, tx, ty) {
    SAN.ui.fadeTo(function () {
      SAN.world.load(id, tx, ty);
      SAN.cat.placeNearPlayer();
    }, 260);
  };

  /* =========================================================
     INTERACTION ENTRY
     ========================================================= */
  A.interact = function () {
    const S_ = S();
    if (!S_) return;
    const h = SAN.world.hint;
    if (!h) return;
    if (h.kind === 'npc') { A.talkTo(h.npc); return; }
    if (h.kind === 'cat') { SAN.cat.pet(); return; }
    if (h.kind === 'water') { A.fish(); return; }
    if (h.kind === 'plot') { A.plotAction(h.plot); return; }
    if (h.kind === 'prop') { A.prop(h.prop); return; }
  };

  A.fish = function () {
    const S_ = S();
    if (S_.energy <= 0) { SAN.ui.toast('You are too tired to hold a rod steady.', 'warn'); return; }
    SAN.fishing.start();
  };

  A.plotAction = function (plot) {
    const S_ = S();
    const st = SAN.farming.stateAt(plot);
    if (!st || !st.tilled) { SAN.farming.till(plot); return; }
    if (!st.crop) { SAN.ui.openPanel('seeds', { plot }); return; }
    const crop = SAN.data.crops[st.crop];
    if (st.stage >= crop.days) { SAN.farming.harvest(plot); return; }
    if (!st.watered) { SAN.farming.water(plot); return; }
    SAN.ui.toast('The ' + crop.name + ' is ' + SAN.farming.describe(plot) + '.', 'info');
  };

  A.prop = function (p) {
    const it = p.interact || {};
    const S_ = S();
    if (SAN.world.cur === 'home' && !S_.flags.looked_around) {
      SAN.quests.setFlag('looked_around', true);
    }
    switch (it.type) {
      case 'area':
        if (it.to === 'meadow' && !S().unlocked.meadow) { SAN.ui.toast('The path north is overgrown. The forest is not ready to share it.', 'info'); return; }
        A.enterArea(it.to, it.tx, it.ty); return;
      case 'shop': SAN.ui.openPanel('shop', { shopId: it.shop }); return;
      case 'board': SAN.ui.openPanel('board'); return;
      case 'sleep': A.sleepConfirm(); return;
      case 'journal': SAN.ui.openPanel('journal'); return;
      case 'customize': SAN.ui.openPanel('customize', { mode: 'wardrobe' }); return;
      case 'collection': SAN.ui.openPanel('collection'); return;
      case 'cook': SAN.ui.openPanel('cook'); return;
      case 'craft': SAN.ui.openPanel('craft'); return;
      case 'fireplace':
        S().flags.fireplace = !S().flags.fireplace;
        SAN.ui.toast(S().flags.fireplace ? 'You light the fire. The cottage fills with warmth.' : 'You let the fire settle down to embers.', 'info');
        if (S().flags.fireplace) SAN.audio.sfx('water');
        return;
      case 'fountain': A.fountain(); return;
      case 'well': A.well(); return;
      case 'sign': SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: it.text }] }); return;
      case 'sit': A.sit(p); return;
      case 'rune': SAN.living.rune(p.symbol || 'moth'); return;
      case 'grove': SAN.living.groveGate(); return;
      case 'read': A.readBook(p); return;
      case 'peek': A.peekWindow(p); return;
      case 'music': A.playMusic(p); return;
      case 'birds': A.feedBirds(p); return;
      case 'sunset': A.watchSunset(p); return;
      case 'stargaze': A.stargaze(p); return;
      case 'letter': A.readLetter(p); return;
      case 'camera': SAN.photos.open(); return;
      case 'chest': A.chest(p); return;
      case 'forage': A.forage(p); return;
      case 'memory': A.memoryStone(p); return;
      case 'lamp': A.lighthouseLamp(); return;
      case 'shrine': A.shrine(); return;
      default: return;
    }
  };

  A.sleepConfirm = function () {
    SAN.ui.confirm('Sleep until morning?', 'Your crops will grow, and the day will begin again at 6:00 AM.', function () {
      SAN.time.sleep();
    });
  };

  A.fountain = function () {
    const S_ = S();
    const lines = [
      'The water catches the light and gives it back in pieces. You feel, briefly, like a person with time.',
      'You toss a small pebble in. It does not grant a wish, but the sound is satisfying.',
      'Someone has left flowers at the rim. You add nothing. You are allowed to just look.',
    ];
    if (Math.random() < 0.4) {
      S_.energy = Math.min(S_.maxEnergy, S_.energy + 4);
      SAN.ui.toast('The sound of the water restores a little energy.', 'info');
    }
    SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: U.pick(lines) }] });
  };

  A.well = function () {
    const S_ = S();
    if (Math.random() < 0.5) {
      SAN.state.addItem('stone', 1, { silent: true });
      SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: 'You draw up the bucket. It comes back with cold water and a small smooth stone. You keep the stone.' }] });
    } else {
      SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: 'The well is deep and quiet. For a moment, the whole village is far away.' }] });
    }
  };

  A.shrine = function () {
    const S_ = S();
    if (!S_.flags.shrineBlessed) {
      S_.flags.shrineBlessed = true;
      S_.maxEnergy = 115;
      SAN.ui.dialogue({
        pages: [
          { speaker: 'narrator', text: 'The little shrine in the meadow is warm to the touch. Someone tends it, though you have never seen anyone here.' },
          { speaker: 'narrator', text: 'You leave a flower. The air smells briefly of rain and lilac.' },
          { speaker: 'narrator', text: 'You feel a little more room inside you for long days. (Max energy increased.)' },
        ],
      });
      SAN.audio.sfx('sparkle');
    } else {
      SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: 'The shrine is quiet. Your flower from before is still there, a little faded and entirely valid.' }] });
    }
  };

  A.chest = function (p) {
    const S_ = S();
    const cid = p.interact.cid;
    if (S_.chests[cid]) {
      SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: 'The chest is empty now. It still smells of old wood and possibility.' }] });
      return;
    }
    S_.chests[cid] = true;
    SAN.audio.sfx('catch');
    const pages = [{ speaker: 'narrator', text: 'The lid opens with a sound like an old apology.' }];
    (p.interact.loot || []).forEach(([id, qty]) => {
      SAN.state.addItem(id, qty);
      pages.push({ speaker: 'narrator', text: 'You found: ' + SAN.data.item(id).name + ' ×' + qty + '.' });
    });
    SAN.ui.dialogue({ pages });
    SAN.progression.checkAchievements();
  };

  A.forage = function (p) {
    const S_ = S();
    const f = p.interact;
    const key = f.fid + '_' + S_.time.day;
    if (S_.forage[key]) {
      SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: 'You have already gathered everything here today. It will be back tomorrow, the way small things are.' }] });
      return;
    }
    S_.forage[key] = true;
    SAN.audio.sfx('harvest');
    const items = f.items || ['fiber'];
    const id = items[Math.floor(Math.random() * items.length)];
    SAN.state.addItem(id, 1);
    const flavour = {
      shell: 'A shell, perfectly curled. The sea is generous in small ways.',
      sea_glass: 'Sea glass, green and soft-edged. It survived the ocean and got prettier.',
      star_hook: 'Finn\'s grandfather\'s star-shaped hook, caught between two planks. It glints like it has been waiting.',
      old_photo: 'A faded photograph, half-buried in the sand: two people by a lighthouse, a heart drawn on the back. This is not yours. You think you know whose it is.',
      sea_letter: 'A bottle with a letter inside. It reads: "If you are reading this, the tide brought you something kind."',
      music_box: 'A broken music box. Three notes, then silence, then an attempt at starting again.',
      windmill_note: 'One of Rowan\'s notes. It says: "it is fine, probably" eleven times, then stops.',
      starflower: 'A starflower, growing where nobody planted it.',
      moonpetal: 'A moonpetal, folded shut and waiting for the dark.',
      snowdrop: 'A snowdrop. It only blooms when the world is quiet.',
    };
    SAN.ui.dialogue({
      pages: [
        { speaker: 'narrator', text: 'You search ' + f.name + '.' },
        { speaker: 'narrator', text: flavour[id] || 'You find ' + SAN.data.item(id).name + '.' },
      ],
    });
    SAN.quests.notify('collect', id, 1);
    if (id === 'letter_old') SAN.living.discover('letter_beach');
    if (id === 'letter_unknown') SAN.living.discover('letter_library');
    if (id === 'letter_grove') SAN.living.discover('letter_grove');
    if (id === 'star_hook') SAN.living.discover('secret_cache');
  };

  A.memoryStone = function (p) {
    const S_ = S();
    if (!S_.unlocked.memory_vault) {
      SAN.ui.dialogue({
        pages: [
          { speaker: 'narrator', text: 'A grey stone, ringed by smaller stones. It looks like it has been waiting a long time.' },
          { speaker: 'narrator', text: 'You do not know what to do with it yet. Perhaps the journal on your desk will explain.' },
        ],
      });
      return;
    }
    SAN.ui.openPanel('memories', { idx: p.idx || 0 });
  };

  A.lighthouseLamp = function () {
    const S_ = S();
    const q = S_.quests.active.lh_3;
    if (q && !S_.flags.lamp_lit) {
      S_.flags.lamp_lit = true;
      S_.world.lampLit = true;
      A.lampScene();
      SAN.quests.notify('talk', 'liora', 1);
      return;
    }
    if (q && SAN.quests.isComplete('lh_3')) {
      A.turnInDialogue('lh_3'); return;
    }
    if (q) {
      SAN.ui.dialogue({
        pages: [
          { speaker: 'narrator', text: 'The great lamp is huge and quiet. The brass is warm from the sun.' },
          { speaker: 'narrator', text: 'Liora usually lights it alone. Maybe you should ask her first.' },
        ],
      });
      return;
    }
    SAN.ui.dialogue({
      pages: [
        { speaker: 'narrator', text: 'The lamp burns steady and low. Liora has already been up here today — you can tell by the fresh oil on the glass.' },
      ],
    });
  };

  /* =========================================================
     SMALL ACTIVITIES & ENVIRONMENT
     ========================================================= */
  A.sit = function (p) {
    const S_ = S();
    const W = SAN.world;
    const near = W.npcs.filter((n) => Math.hypot(n.px - W.player.px, n.py - W.player.py) < 64);
    const tea = S_.inventory['lavender_tea'] || 0;
    if (W.cur === 'teashop' && near.length && tea > 0 && SAN.living.activity('tea_' + near[0].def.id)) {
      const npc = near[0];
      SAN.ui.dialogue({
        pages: [{ speaker: npc.def.id, text: U.pick(['"You are sitting down. Good. It is a very good table for it."', '"I was hoping someone would sit here. I did not want to drink alone."', '"The tea is better when someone else is across from you. That is a scientific fact."']), }, { speaker: 'narrator', text: 'There is a pot of lavender tea in your satchel. It would be easy to offer.' }],
        choices: [
          { label: 'Offer a cup of tea', cb: function () {
              SAN.state.removeItem('lavender_tea', 1);
              SAN.rel.add(npc.def.id, 6);
              SAN.progression.addXp('exploration', 5);
              SAN.audio.sfx('sparkle');
              SAN.ui.dialogue({ pages: [{ speaker: npc.def.id, text: U.pick(['"Oh." She wraps both hands around the cup. "I did not know I needed this."', '"You did not have to share. That makes it better."', '"This is the correct amount of conversation for a Tuesday."']) }, { speaker: 'narrator', text: 'You sit together for a while without needing to say anything else.' }] });
              SAN.save.autosave(true);
            } },
          { label: 'Just sit quietly', cb: function () {
              SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: 'You sit. The shop hums. Nobody asks you to perform being fine.' }] });
            } },
        ],
      });
      return;
    }
    SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: (p.interact && p.interact.line) || 'You sit for a while. Nothing is required of you.' }] });
  };

  A.readBook = function (p) {
    const first = SAN.living.activity('read');
    const lines = [
      'A history of the village, written by someone who kept spelling "sanctuary" wrong and refused to correct it.',
      'A guide to coastal plants. Someone has pressed a real bluebell between pages forty and forty-one.',
      'A novel about a lighthouse keeper who is not lonely, which the margin note calls "wishful".',
      'The village ledger: births, storms, the price of onions. Onions have been the same price for nine years.',
      'A book of letters never sent, collected by someone who felt they should exist somewhere.',
      'A children\'s book about a cat who runs a bakery. The cat is very rude. It is the best book in the library.',
    ];
    const pages = [{ speaker: 'narrator', text: U.pick(lines) }];
    if (first) {
      pages.push({ speaker: 'narrator', text: 'You read for a while. The quiet here is the kind that keeps you company.' });
      SAN.progression.addXp('exploration', 5);
      SAN.audio.sfx('page');
    }
    SAN.ui.dialogue({ pages });
  };

  A.peekWindow = function (p) {
    const S_ = S();
    const first = SAN.living.activity('window');
    const phase = SAN.living.phaseKey();
    const weather = S_.time.weather;
    const outside = SAN.world.cur === 'home' ? 'the hill and the village below' : 'the street';
    const weatherLine = {
      sunny: 'The light is doing that thing where everything looks recently washed.',
      cloudy: 'The sky is a soft grey blanket that has not decided anything yet.',
      rain: 'Rain is drawing slow lines down the glass. You watch one win.',
      storm: 'The wind is throwing leaves at the window with real commitment.',
      fog: 'Fog has swallowed the far trees. The near ones look smug about surviving.',
      snow: 'Snow is falling in no hurry at all, like it has nowhere to be.',
    }[weather] || 'The world outside is being itself.';
    const timeLine = {
      morning: 'Morning outside ' + outside + ': birds, bread, and somebody sweeping a step.',
      afternoon: 'Afternoon outside ' + outside + ': slow shadows and the smell of cut grass.',
      evening: 'Evening outside ' + outside + ': gold light, and lamps coming on one by one.',
      night: 'Night outside ' + outside + ': a few lit windows and a sky doing more than you expected.',
    }[phase];
    SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: timeLine }, { speaker: 'narrator', text: weatherLine }] });
    if (first) SAN.progression.addXp('exploration', 2);
  };

  A.playMusic = function (p) {
    const first = SAN.living.activity('music');
    const W = SAN.world;
    SAN.audio.sfx('bell');
    setTimeout(() => SAN.audio.sfx('sparkle'), 320);
    setTimeout(() => SAN.audio.sfx('bell'), 640);
    const near = W.npcs.filter((n) => Math.hypot(n.px - W.player.px, n.py - W.player.py) < 90);
    const pages = [{ speaker: 'narrator', text: (p.interact && p.interact.line) || 'You play something slow and half-remembered. The room gets quieter around it.' }];
    if (near.length && first) {
      pages.push({ speaker: near[0].def.id, text: U.pick(['"I did not know you played." They sound pleased, and a little shy about being pleased.', '"That was my grandmother\'s favourite. Or close enough that it does not matter."', '"Do not stop. Or do. I am not going to be strange about it."']) });
      SAN.rel.add(near[0].def.id, 3);
    }
    if (first) SAN.progression.addXp('exploration', 4);
    SAN.ui.dialogue({ pages });
  };

  A.feedBirds = function (p) {
    const S_ = S();
    if (!S_.inventory.bread) {
      SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: 'The birds look at you with professional interest. You have nothing to give them today.' }] });
      return;
    }
    const first = SAN.living.activity('birds');
    SAN.state.removeItem('bread', 1);
    SAN.audio.sfx('sparkle');
    const pages = [{ speaker: 'narrator', text: 'You crumble the bread and step back. The birds arrive like a rumour that turned out to be true.' }];
    if (first) {
      pages.push({ speaker: 'narrator', text: 'One of them stays behind afterwards, watching you. You find a small white feather on the bench.' });
      SAN.state.addItem('feather', 1);
      SAN.progression.addXp('exploration', 4);
    }
    SAN.ui.dialogue({ pages });
  };

  A.watchSunset = function (p) {
    const S_ = S();
    const mins = S_.time.minutes;
    if (mins < 16 * 60 + 30 || mins > 21 * 60) {
      SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: 'The horizon is doing something beautiful, but not yet the thing you came for. Come back near evening.' }] });
      return;
    }
    const first = SAN.living.activity('sunset');
    const pages = [
      { speaker: 'narrator', text: 'You sit at the end of the pier with your feet over the water. The sun goes down slowly, as if it has all the time in the world.' },
      { speaker: 'narrator', text: 'The lighthouse comes on while you are watching. Gold, then white, then gold again.' },
    ];
    if (first) {
      pages.push({ speaker: 'narrator', text: 'Something in your chest unclenches by about a millimetre. It counts.' });
      SAN.progression.addXp('exploration', 6);
      SAN.state.S.energy = Math.min(SAN.state.S.maxEnergy, SAN.state.S.energy + 4);
    }
    SAN.ui.dialogue({ pages });
  };

  A.stargaze = function (p) {
    const S_ = S();
    const mins = S_.time.minutes;
    if (mins < 20 * 60 && mins > 5 * 60) {
      SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: 'The blanket is warm and the grass smells good, but the stars are not out yet. This is an evening thing.' }] });
      return;
    }
    const first = SAN.living.activity('stars');
    const pages = [
      { speaker: 'narrator', text: 'You lie back on the blanket. The sky is enormous and completely uninterested in your problems.' },
      { speaker: 'narrator', text: 'It is a relief, being small. The fireflies drift past like they are on their way somewhere important.' },
    ];
    if (first) {
      SAN.progression.addXp('exploration', 7);
      if (Math.random() < 0.5) {
        SAN.state.addItem('memory_shard', 1);
        pages.push({ speaker: 'narrator', text: 'Something glints in the grass beside you. A memory shard, warm from the day.' });
      }
    }
    SAN.ui.dialogue({ pages });
  };

  A.readLetter = function (p) {
    const id = p.interact && p.interact.letter;
    SAN.state.addItem(id || 'letter_unknown', 1);
    if (id === 'letter_old') SAN.living.discover('letter_beach');
    if (id === 'letter_unknown') SAN.living.discover('letter_library');
    if (id === 'letter_grove') SAN.living.discover('letter_grove');
    SAN.ui.dialogue({
      pages: [
        { speaker: 'narrator', text: (p.interact && p.interact.text) || 'A letter, folded small and left where someone hoped it would be found.' },
        { speaker: 'narrator', text: 'You put it in your satchel. Some things are worth carrying.' },
      ],
    });
  };

  /* =========================================================
     NPC CONVERSATION
     ========================================================= */
  A.speakerName = function (def) { return def ? def.name : ''; };

  A.talkTo = function (npc) {
    const def = npc.def;
    const S_ = S();
    const firstTime = !SAN.rel.get(def.id).met;
    SAN.rel.talk(def.id);
    SAN.rel.get(def.id).met = true;
    SAN.quests.notify('talk', def.id, 1);
    SAN.quests.notify('talk', 'any_npc', 1);
    // story scenes that belong to this exact moment
    if (def.id === 'rowan' && S_.quests.active.wm_3 && !S_.flags.wm_quiet && SAN.quests.progressOf('wm_3', 0).done) {
      S_.flags.wm_quiet = true;
      A.windmillScene();
      return;
    }
    const ready = SAN.quests.readyTurnInsFor(def.id);
    if (ready.length) { A.turnInDialogue(ready[0].id); return; }
    if (def.id === 'liora' && S_.quests.active.lh_2 && !S_.flags.lh_letter_choice && SAN.state.count('old_photo') > 0) { A.letterScene(npc); return; }
    if (def.id === 'elowen' && S_.quests.active.gh_1 && !S_.flags.gh_help_choice) { A.helpScene(npc); return; }
    if (def.id === 'rowan' && S_.quests.active.wm_1 && !S_.flags.reframe_choice) { A.reframeScene(npc); return; }
    if (!firstTime) {
      const ms = SAN.living.pendingMilestone(def.id);
      if (ms) { SAN.living.playMilestone(def.id, ms); return; }
    }
    const avail = SAN.quests.availableFor(def.id);
    if (avail) { A.offerQuest(avail); return; }
    A.chat(npc, { firstTime });
  };

  A.greetingFor = function (def) {
    const pts = SAN.rel.pts(def.id);
    const tiers = [0, 21, 41, 61, 81];
    let tier = 0;
    tiers.forEach((t, i) => { if (pts >= t) tier = t; });
    const pool = def.greetings[tier] || def.greetings[0] || ['"Hello."'];
    const festival = SAN.time.todayEvent();
    const lines = [U.pick(pool)];
    if (festival) lines.unshift('"' + festival.name + ' — I always forget how much I like it until it is happening."');
    if (S().time.weather === 'rain' && Math.random() < 0.5) lines.push('"Rain again. I do not mind. It gives everyone permission to stay in."');
    if (S().time.weather === 'snow') lines.push('"Look at the snow. The whole village has gone quiet and polite."');
    const extras = SAN.living.extras(def.id);
    extras.slice(0, 2).forEach((l) => lines.push(l));
    return lines;
  };

  A.chat = function (npc, opts) {
    const def = npc.def;
    const S_ = S();
    const f = SAN.rel.get(def.id);
    const firstMeeting = !!(opts && opts.firstTime);

    const lines = [];
    const closeFriend = SAN.rel.pts(def.id) >= 40;
    if (firstMeeting) {
      lines.push({ speaker: def.id, text: 'You must be the one in the cottage on the hill. I heard about you.', context: 'responsibility' });
      lines.push({ speaker: 'player', text: 'All good things, I hope.', mood: 'embarrassed' });
      lines.push({ speaker: def.id, text: (def.greetings[0] || ['"All things."'])[0], context: 'greeting' });
    } else {
      // the greeting warms up as the friendship grows: greeting is happy, small talk is neutral
      A.greetingFor(def).forEach((l, i) => lines.push({
        speaker: def.id,
        text: l,
        context: i === 0 ? (closeFriend ? 'greeting' : 'responsibility') : undefined,
      }));
      const reaction = {
        liora: S_.flags.lh_letter_choice ? '"You did not push me about the letters. I keep thinking about that."' : null,
        elowen: S_.flags.sat_with_elowen ? '"You sat with me by the pond. I have not forgotten, you know."' : null,
        rowan: S_.flags.reframe_choice ? '"I used the thing you said. It worked for about an hour. That is a record."' : null,
      }[def.id];
      if (reaction && !S_.dialogueSeen['react_' + def.id]) {
        S_.dialogueSeen['react_' + def.id] = true;
        lines.push({ speaker: def.id, text: reaction, context: 'memory' });
      }
    }

    const choices = [];
    (def.topics || []).forEach((t) => {
      if (SAN.rel.pts(def.id) >= t.min && !(S_.dialogueSeen[def.id + '_' + t.id])) {
        choices.push({
          label: t.min >= 41 ? 'Ask something closer' : 'Ask about them',
          icon: '❦',
          cb: function () { A.topic(npc, t); },
        });
      }
    });
    choices.push({ label: 'Give a gift', icon: '🎁', cb: function () { SAN.ui.openPanel('gift', { npcId: def.id }); } });
    choices.push({ label: 'Just talk', icon: '💬', cb: function () { A.smallTalk(npc); } });
    choices.push({ label: 'Not right now', icon: '✕', cb: function () { } });

    SAN.ui.dialogue({ pages: lines, choices });
  };

  A.smallTalk = function (npc) {
    const def = npc.def;
    const line = U.pick(def.daily || ['"It is a good day for nothing in particular."']);
    SAN.ui.dialogue({
      pages: [{ speaker: def.id, text: line, context: 'greeting' }],
      choices: [
        { label: 'Give a gift', icon: '🎁', cb: function () { SAN.ui.openPanel('gift', { npcId: def.id }); } },
        { label: 'Not right now', icon: '✕', cb: function () { } },
      ],
    });
  };

  A.topic = function (npc, topic) {
    const def = npc.def;
    const S_ = S();
    S_.dialogueSeen[def.id + '_' + topic.id] = true;
    SAN.rel.add(def.id, 2, true);
    const pages = topic.lines.map((l) => ({ speaker: def.id, text: l, context: 'memory' }));
    SAN.ui.dialogue({ pages, choices: [{ label: 'Not right now', icon: '✕', cb: function () { } }] });
  };

  A.giveGift = function (npcId, itemId) {
    const S_ = S();
    const res = SAN.rel.gift(npcId, itemId);
    if (res.tooMany) {
      SAN.ui.dialogue({ pages: [{ speaker: npcId, text: '"You have given me so much today already. Tomorrow, perhaps. I am not going anywhere."', mood: 'neutral' }] });
      return;
    }
    SAN.state.removeItem(itemId, 1);
    if (!S_.world.gifts) S_.world.gifts = {};
    S_.world.gifts[npcId] = itemId;
    SAN.quests.notify('gift', npcId, 1, itemId);
    const def = SAN.data.npcs[npcId];
    const giftMood = res.reaction === 'love' || res.reaction === 'like' ? 'happy' : 'neutral';
    const pages = [
      { speaker: npcId, text: res.line || '"Thank you."', mood: giftMood },
    ];
    if (res.reaction === 'love') pages.push({ speaker: 'narrator', text: 'Their whole expression changes. You remembered something real. (Friendship +' + res.pts + ')' });
    else if (res.reaction === 'like') pages.push({ speaker: 'narrator', text: 'A good choice. (Friendship +' + res.pts + ')' });
    else if (res.reaction === 'dislike') pages.push({ speaker: 'narrator', text: 'Perhaps not their favourite. They are polite about it. (Friendship ' + res.pts + ')' });
    else pages.push({ speaker: 'narrator', text: '(Friendship +' + res.pts + ')' });
    SAN.ui.dialogue({ pages });
    SAN.save.autosave();
  };

  /* =========================================================
     QUESTS: OFFERS, TURN-INS, SCENES
     ========================================================= */
  const OFFERS = {
    main_first_plant: {
      pages: [
        { speaker: 'nyssa', text: '"The garden behind your cottage has been sleeping. Gardens do that. They wake up when someone decides to try."' },
        { speaker: 'nyssa', text: '"Till the soil, plant something, water it. Then wait. Waiting is the part people forget to enjoy."' },
      ],
      accept: 'I will plant something.',
    },
    main_journal: {
      pages: [
        { speaker: 'nyssa', text: '"There is a journal on your desk. I did not put it there. I suspect you did, in a way."' },
        { speaker: 'nyssa', text: '"Write one honest page. Not a good page. An honest one."' },
      ],
      accept: 'I will write something.',
    },
    main_meet: {
      pages: [
        { speaker: 'nyssa', text: '"You have met a few of us. There are more. Nobody expects you to remember all our names today."' },
        { speaker: 'nyssa', text: '"Talk to four villagers. Not for me — for the part of you that forgets other people are also doing their best."' },
      ],
      accept: 'I will introduce myself.',
    },
    lh_1: {
      pages: [
        { speaker: 'liora', text: '"The wind chime on the porch has been silent since the last storm. One of the shells cracked."' },
        { speaker: 'liora', text: '"It is a small thing. I keep meaning to fix it. I keep not doing it."' },
        { speaker: 'liora', text: '"If you happen to find shells on the shore — two would do. No rush. I am not going anywhere."' },
      ],
      accept: 'I will look for shells.',
    },
    lh_2: {
      pages: [
        { speaker: 'liora', text: '"You found a photograph." She does not take it. Her hands stay very still.' },
        { speaker: 'liora', text: '"That is my mother. And me, before. She left in the spring, and I have been keeping a lamp for ships ever since, which is a strange way to wait for someone."' },
        { speaker: 'liora', text: '"There are letters, too. In a drawer. I never sent them. I do not know if I want to read them. I do not know if I want you to."' },
      ],
      accept: 'We can decide together.',
    },
    lh_3: {
      pages: [
        { speaker: 'liora', text: '"The lamp needs lighting at dusk. I have done it alone for four years."' },
        { speaker: 'liora', text: '"I am not asking you to come. I am also not not asking. I am very bad at this part."' },
      ],
      accept: 'I will be there.',
    },
    gh_1: {
      pages: [
        { speaker: 'elowen', text: 'She is on her knees in the greenhouse, surrounded by a heap of pulled weeds. She does not look up.' },
        { speaker: 'elowen', text: '"I am nearly done. It is fine. You do not have to — I have it."' },
        { speaker: 'elowen', text: 'Her hands are shaking slightly. The heap is not nearly done.' },
      ],
      accept: 'Let me help anyway.',
    },
    gh_2: {
      pages: [
        { speaker: 'elowen', text: '"The beds are ready. I thought I would plant them myself, but there are more than I expected."' },
        { speaker: 'elowen', text: '"I am going to ask you to help. I have practised saying it. It still feels like asking for a kidney."' },
      ],
      accept: 'Two pairs of hands.',
    },
    gh_3: {
      pages: [
        { speaker: 'elowen', text: '"Something is flowering. The starflower — I did not think it would take."' },
        { speaker: 'elowen', text: '"I keep waiting for it to be a mistake. It keeps just being a flower."' },
      ],
      accept: 'Let us look at it together.',
    },
    wm_1: {
      pages: [
        { speaker: 'rowan', text: '"Sorry. I am — I have been thinking about something I said on Tuesday and I cannot get out of the loop."' },
        { speaker: 'rowan', text: '"I know it is a loop. Knowing has not helped. My brain has a very strong argument and it is mostly made of fog."' },
        { speaker: 'rowan', text: '"Could you sit with me? You do not have to fix it. I just do not want to be in here alone."' },
      ],
      accept: 'I will sit with you.',
    },
    wm_2: {
      pages: [
        { speaker: 'rowan', text: '"I have been writing notes and leaving them everywhere. Library, fountain, the bakery bag. It is not a system, it is a symptom."' },
        { speaker: 'rowan', text: '"Could you gather them? I think I need to see them all in one place, and then maybe put them in a drawer."' },
      ],
      accept: 'I will find them.',
    },
    wm_3: {
      pages: [
        { speaker: 'rowan', text: '"I want to try an evening without fixing anything. No analysis. No reviewing the conversation."' },
        { speaker: 'rowan', text: '"Just the windmill and the wind and someone who does not need me to be better by eight o\'clock."' },
      ],
      accept: 'I will come at dusk.',
    },
    side_mira: {
      pages: [
        { speaker: 'mira', text: '"You know what nobody ever does? Bring ME bread. Which is fine! I am the baker. It is normal."' },
        { speaker: 'mira', text: 'She laughs, then looks at the counter for a moment too long.' },
      ],
      accept: 'I will bring you something.',
    },
    side_finn: {
      pages: [
        { speaker: 'finn', text: '"Lost my grandfather\'s hook off the pier. Star-shaped. Old as anything."' },
        { speaker: 'finn', text: '"It is not important. It is only the last thing of his that I actually used."' },
      ],
      accept: 'I will have a look.',
    },
    side_aria: {
      pages: [
        { speaker: 'aria', text: '"I keep the village ledger. Births, storms, the price of onions. It is missing one thing."' },
        { speaker: 'aria', text: '"Something written by you. Anything. Two pages, if you can manage it. I will not read it. Or I will — but only with permission."' },
      ],
      accept: 'I will write.',
    },
    side_celeste: {
      pages: [
        { speaker: 'celeste', text: '"A bouquet for the lighthouse. Lavender for steadiness, bluebell for constancy, marigold for warmth."' },
        { speaker: 'celeste', text: '"He will not ask who it is from. That is the point of flowers."' },
      ],
      accept: 'I will bring the flowers.',
    },
    side_theo: {
      pages: [
        { speaker: 'theo', text: '"I am looking for something specific. A broken music box. Brass, three notes, a hinge that sticks."' },
        { speaker: 'theo', text: '"Why? A merchant never explains his inventory. Unless you find it. Then I might."' },
      ],
      accept: 'I will keep an eye out.',
    },
    side_cat: {
      pages: [
        { speaker: 'nyssa', text: '"Your cat sleeps in the same square of sunlight every afternoon. Cats are very good at knowing what they need."' },
        { speaker: 'nyssa', text: '"Perhaps you could make them something soft. Perhaps you could also sit in the sunlight."' },
      ],
      accept: 'I will make a proper bed.',
    },
    side_memory: {
      pages: [
        { speaker: 'nyssa', text: '"In the forest there are stones that people left behind. Not the memories — the weight of them."' },
        { speaker: 'nyssa', text: '"You may water one. You may plant a flower. You do not have to do anything at all. But if you do, it counts."' },
      ],
      accept: 'I might visit.',
    },
  };

  const COMPLETE_LINES = {
    main_arrive: ['"You looked around. That is more than most people do on a first day."', '"The cottage suits you. It has been waiting for someone who needs a window."'],
    main_first_plant: ['"You planted something. It will not thank you, which is honest of it."', '"Gardens teach patience in a way that is very hard to argue with."'],
    main_journal: ['"You wrote it. Good. That page belongs to you, no one else."', '"The forest stones will open to you now. Only if you want them to."'],
    main_meet: ['"Four names. You are becoming a person of this village."', '"They will remember you now. It is a small place. That is a gift, mostly."'],
    lh_1: ['"You brought them. Two whole shells." Liora turns them over, and something in her face loosens.', '"I will fix the chime tomorrow. Or today. Thank you."'],
    lh_2: ['"I read them. Some of them." Her voice is careful, not broken.', '"She was not leaving me. She was leaving a situation. I have spent four years confusing those two things."', '"I am still learning. But the lamp is not the only thing that can stay lit, apparently."'],
    lh_3: ['The lamp catches. Light spills out over the water in a long gold path.', '"I usually do this alone," Liora says, and then, quietly, "I think I have been doing too many things alone."'],
    gh_1: ['"You did not take over. You just — stayed." Elowen sounds puzzled by this, as if it were a rare species of plant.', '"Thank you. I hated that. I might do it again."'],
    gh_2: ['The two of you plant in silence, and it is the good kind.', '"I keep waiting for you to be annoyed with me," she says. "You keep not being."'],
    gh_3: ['The starflower opens in the afternoon light. It is small and entirely real.', '"I grew this. We grew this. I do not know which one to be proud of."', '"Both, I think. I am told you are allowed to have both."'],
    wm_1: ['"That helped. Not in a solving way. In a not-alone way."', 'Rowan breathes out. "I am going to write that in the notebook. The kind version. Not the audit."'],
    wm_2: ['Rowan lays the notes out on the mill table. Eleven pages of "it is fine, probably."', '"That is a lot of fog," he says. "But it is just fog. It is not a verdict."', 'He puts them in a drawer. Closes it. Opens the window.'],
    wm_3: ['The windmill turns. Neither of you says anything for a long time.', '"This is the quiet I have been trying to get to," Rowan says. "Turns out it needed company."'],
    side_mira: ['"You brought me something. And it is not bread." She holds it like it might dissolve.', '"I am going to sit down. For five minutes. In front of a witness."'],
    side_finn: ['"My grandfather\'s hook." Finn is quiet for a long moment.', '"You know what he used to say? The sea gives you what it gives you." He smiles. "It gave me this back."'],
    side_aria: ['"Two pages. I am filing them under \'things that arrived and were worth keeping\'."', '"I did not read them. I wanted to. I did not."'],
    side_celeste: ['Celeste arranges them without a word. The bouquet is slightly asymmetrical and very alive.', '"He will know," she says. "But he will not have to say it. That is the whole art."'],
    side_theo: ['Theo turns the music box over three times. His face does something complicated.', '"This was mine. A long time ago. I sold it in a town I have been trying to forget."', '"Keep it. Or throw it in the sea. Either is a decision. That is the important part."'],
    side_cat: ['Your cat investigates the new bed with deep suspicion, then curls into it and falls asleep in four seconds.', '"A very good cat," Nyssa observes, "and a very good bed."'],
    side_memory: ['"You watered a stone," Nyssa says. "It sounds foolish. It is not."', '"Some things only need to be visited. You have visited."'],
  };

  A.offerQuest = function (q) {
    const offer = OFFERS[q.id] || {
      pages: [{ speaker: q.giver, text: '"I could use a hand with something, if you have the time. No pressure."' }],
      accept: 'I will help.',
    };
    const pages = offer.pages.map((p) => ({ speaker: p.speaker, text: p.text }));
    SAN.ui.dialogue({
      pages,
      choices: [
        { label: offer.accept, cb: function () { if (SAN.quests.start(q.id)) SAN.quests.notify('talk', q.giver, 1); } },
        { label: 'Maybe later', cb: function () { SAN.ui.toast('You can always ask again. Nothing is lost.', 'info'); } },
      ],
    });
  };

  A.turnInDialogue = function (id) {
    const q = SAN.data.quests[id];
    if (!q) return;
    const lines = COMPLETE_LINES[id] || ['"That is done, then. Thank you."'];
    const pages = lines.map((l) => ({ speaker: q.giver === 'board' ? 'narrator' : q.giver, text: l }));
    const rewards = [];
    const r = q.rewards || {};
    if (r.money) rewards.push(r.money + ' coins');
    if (r.items) r.items.forEach(([iid, n]) => rewards.push(SAN.data.item(iid).name + ' ×' + n));
    if (rewards.length) pages.push({ speaker: 'narrator', text: 'Reward: ' + rewards.join(', ') + '.' });
    if (q.giver !== 'board') SAN.rel.add(q.giver, 4, true);
    SAN.ui.dialogue({
      pages,
      choices: [{ label: 'Thank them', cb: function () { SAN.quests.turnIn(id); } }],
    });
  };

  /* =========================================================
     SPECIAL SCENES (branching)
     ========================================================= */
  A.letterScene = function (npc) {
    SAN.ui.dialogue({
      pages: [
        { speaker: 'liora', text: 'She is holding the drawer handle. "I have not opened this since she left."' },
        { speaker: 'liora', text: '"Do I read them? I genuinely do not know. I have been not-knowing for four years."' },
      ],
      choices: [
        {
          label: 'Read them together',
          cb: function () {
            SAN.quests.setFlag('lh_letter_choice', 'read');
            SAN.ui.dialogue({
              pages: [
                { speaker: 'narrator', text: 'The letters are short and ordinary. Weather. A recipe. An apology that arrives three sentences late.' },
                { speaker: 'liora', text: '"She says she is sorry she was not braver." Liora laughs once, wetly. "She sounds exactly like me."' },
                { speaker: 'liora', text: '"I think I have been waiting for a sentence that was never going to be written. This is not that sentence. But it is something."' },
              ],
            });
          },
        },
        {
          label: 'Leave them sealed',
          cb: function () {
            SAN.quests.setFlag('lh_letter_choice', 'sealed');
            SAN.ui.dialogue({
              pages: [
                { speaker: 'narrator', text: 'She closes the drawer, gently, the way you close a door on a room someone is sleeping in.' },
                { speaker: 'liora', text: '"Not today. Maybe not ever. I do not have to open a thing to be allowed to move on from it."' },
                { speaker: 'liora', text: '"Thank you for not pushing. People always push. They think it is helping."' },
              ],
            });
          },
        },
      ],
    });
  };

  A.helpScene = function (npc) {
    SAN.ui.dialogue({
      pages: [
        { speaker: 'elowen', text: '"You do not have to." She says it like a reflex. Then, quieter: "I am not sure what to do if you do."' },
      ],
      choices: [
        {
          label: 'Kneel down and start weeding',
          cb: function () {
            SAN.quests.setFlag('gh_help_choice', 'stay');
            SAN.ui.dialogue({
              pages: [
                { speaker: 'narrator', text: 'You pull weeds beside her. Neither of you says anything for ten minutes. It is not uncomfortable.' },
                { speaker: 'elowen', text: '"...This is okay," she says, as if checking the words for holes. "This is okay."' },
              ],
            });
          },
        },
        {
          label: 'Bring materials and give her space',
          cb: function () {
            SAN.quests.setFlag('gh_help_choice', 'space');
            SAN.ui.dialogue({
              pages: [
                { speaker: 'narrator', text: 'You stack the fibre by the door where she can reach it, and step back outside.' },
                { speaker: 'elowen', text: 'She looks at the stack. Then at you. "...That is the right amount of help," she says. "How did you know?"' },
              ],
            });
          },
        },
      ],
    });
  };

  A.reframeScene = function (npc) {
    SAN.ui.dialogue({
      pages: [
        { speaker: 'rowan', text: '"They invited me to the tea gathering. I have decided it is out of pity. I have a whole case built for this."' },
        { speaker: 'rowan', text: '"Say something. Anything. I will be reasonable about it. Probably."' },
      ],
      choices: [
        {
          label: '"Or maybe they just like you."',
          cb: function () {
            SAN.quests.setFlag('reframe_choice', 'kind');
            SAN.quests.notify('reframe', 'any', 1);
            SAN.ui.dialogue({
              pages: [
                { speaker: 'rowan', text: '"...Huh." He blinks. "That is a much smaller story than the one I built."' },
                { speaker: 'rowan', text: '"The fog version is always bigger. That is how you know it is fog."' },
              ],
            });
          },
        },
        {
          label: '"You are overthinking it."',
          cb: function () {
            SAN.quests.setFlag('reframe_choice', 'dismiss');
            SAN.quests.notify('reframe', 'any', 1);
            SAN.ui.dialogue({
              pages: [
                { speaker: 'rowan', text: '"I know. That is the problem." He rubs his eyes. "Gently, though. Gently is better."' },
                { speaker: 'rowan', text: '"But you stayed. That helps more than being right."' },
              ],
            });
          },
        },
        {
          label: '"We do not have to talk about it."',
          cb: function () {
            SAN.quests.setFlag('reframe_choice', 'skip');
            SAN.quests.notify('reframe', 'any', 1);
            SAN.ui.dialogue({
              pages: [
                { speaker: 'rowan', text: '"Thank you." He sags with relief. "I can be quiet with someone. I forgot that was allowed."' },
                { speaker: 'narrator', text: 'You sit on the mill steps and watch the sails turn. It is enough.' },
              ],
            });
          },
        },
      ],
    });
  };

  A.lampScene = function () {
    const S_ = S();
    SAN.ui.dialogue({
      pages: [
        { speaker: 'liora', text: 'Liora hands you the long brass lighter. "Your turn. If you want. You can hand it back."' },
        { speaker: 'narrator', text: 'The wick catches. The lamp room goes gold, then white, then gold again.' },
        { speaker: 'liora', text: '"I have been the one who keeps the light for everyone. I did not think anyone would ever keep one for me."' },
        { speaker: 'liora', text: '"You do not have to promise anything. I am trying to learn that people can be here without promising."' },
      ],
      choices: [
        {
          label: '"I am here."',
          cb: function () {
            SAN.quests.setFlag('lh_lamp_choice', 'here');
            SAN.ui.dialogue({ pages: [{ speaker: 'liora', text: 'She nods, once, and looks out at the water. "That is enough. That is actually enough."' }] });
          },
        },
        {
          label: '"I do not know how long I can stay."',
          cb: function () {
            SAN.quests.setFlag('lh_lamp_choice', 'honest');
            SAN.ui.dialogue({ pages: [{ speaker: 'liora', text: '"That is the most honest thing anyone has said to me in years." She smiles. "I can work with honest."' }] });
          },
        },
      ],
    });
  };

  A.windmillScene = function () {
    SAN.ui.dialogue({
      pages: [
        { speaker: 'narrator', text: 'Evening at the windmill. The sails turn slowly. Rowan is sitting on the step with two cups of tea he did not mention making.' },
        { speaker: 'rowan', text: '"I have not analysed anything for an hour. It is very loud in a completely different way."' },
        { speaker: 'rowan', text: '"I keep almost saying something self-critical. Can we just — not? For a bit?"' },
      ],
      choices: [
        { label: 'Sit quietly together', cb: function () { A.windmillQuiet(); } },
        { label: '"You are allowed to have a good evening."', cb: function () { A.windmillQuiet(); } },
      ],
    });
  };
  A.windmillQuiet = function () {
    SAN.ui.dialogue({
      pages: [
        { speaker: 'narrator', text: 'You sit. The wind moves through the wheat. Somewhere behind you a cat is being extremely judgmental about a beetle.' },
        { speaker: 'rowan', text: '"This is the quiet I have been trying to reach for years. Turns out it is not a place. It is a permission."' },
      ],
    });
  };

  A.catAdoptScene = function () {
    SAN.ui.dialogue({
      pages: [
        { speaker: 'narrator', text: 'On the doorstep of your new cottage there is a small, extremely self-possessed cat. It looks at you like you are the one who has been adopted.' },
        { speaker: 'narrator', text: 'It has been waiting. You do not know for how long. You are not sure it would tell you.' },
      ],
      choices: [
        { label: 'Offer it your hand', cb: function () { SAN.ui.openPanel('catadopt'); } },
      ],
    });
  };

  A.firstJournalScene = function () {
    SAN.ui.dialogue({
      pages: [
        { speaker: 'narrator', text: 'On the desk: a notebook with a ribbon in it. The first page says, in handwriting that is almost yours: "For whatever you cannot say out loud."' },
        { speaker: 'narrator', text: 'There is a pen. There is no one watching. There is no correct thing to write.' },
      ],
      choices: [{ label: 'Open the journal', cb: function () { SAN.ui.openPanel('journal'); } }],
    });
  };
})();
