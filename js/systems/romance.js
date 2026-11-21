/* Sanctuary — romance: affection, stages, consent, activities, events, cottage visits.
   Friendship is unchanged; romance sits on top of it. Nothing here can lower friendship. */
(function () {
  const RM = (SAN.romance = {});
  const D = () => SAN.data.romance;
  const S = () => SAN.state.S;
  const ACT = (id) => D().ACTIVITY(id);
  const DAILY_AFFECTION_CAP = 22;

  const PHYSICAL = ['hand', 'hug', 'kiss', 'cuddle'];
  const MIN_AFFECTION = { hand: 26, hug: 26, kiss: 46, cuddle: 46, dinner: 40, dance: 28, stargaze: 24, gift: 20, memory: 30, walk: 0, cook: 40, fire: 35, craft: 35 };

  function today() { const s = S(); return s.time.season * 28 + s.time.day; }

  RM.def = (id) => D().npcs[id] || null;
  RM.romanceable = (id) => !!D().npcs[id] && D().romanceable.indexOf(id) >= 0;
  // hard guard: romance is adults only, checked against both the NPC record and its romance entry
  RM.adult = function (id) {
    const info = SAN.data.npcs[id] || {};
    const def = RM.def(id);
    if (!info || !def || !def.adult) return false;
    return info.age == null ? true : info.age >= 18;
  };

  RM.state = function (id) {
    const s = S();
    if (!s) return null;
    if (!s.romance) s.romance = {};
    if (!s.romance[id]) {
      s.romance[id] = {
        affection: 0, accepted: false, committed: false, partner: false,
        datingDay: null, datingSeason: null, commitDay: null, partnerDay: null,
        events: {}, memories: [], history: [],
        activityDay: 0, activityCount: {}, affectionToday: 0,
        notYet: false, lastMorning: 0, lastGoodnight: 0, lastRain: 0, declined: {},
      };
    }
    const st = s.romance[id];
    if (st.activityDay !== today()) { st.activityDay = today(); st.activityCount = {}; st.affectionToday = 0; }
    if (!st.memories) st.memories = [];
    if (!st.history) st.history = [];
    if (!st.events) st.events = {};
    return st;
  };

  RM.affection = (id) => (RM.state(id) ? RM.state(id).affection : 0);
  RM.friendship = (id) => (SAN.rel ? SAN.rel.pts(id) : 0);

  RM.stageIndex = function (id) {
    const st = RM.state(id);
    if (!st) return 0;
    if (st.partner) return 7;
    if (st.committed) return 6;
    if (st.accepted) return 5;
    const f = RM.friendship(id);
    let base = 0;
    if (f >= 61) base = 3; else if (f >= 41) base = 2; else if (f >= 21) base = 1;
    if (base >= 3 && st.affection >= 20) return 4;
    return base;
  };
  RM.stage = (id) => D().STAGES[RM.stageIndex(id)] || D().STAGES[0];
  RM.statusName = (id) => RM.stage(id).name;

  RM.partnerId = function () {
    const s = S();
    if (!s || !s.romance) return null;
    const ids = Object.keys(s.romance).filter((id) => s.romance[id].partner || s.romance[id].committed);
    // the deepest bond is the one who comes home
    ids.sort((a, b) => RM.stageIndex(b) - RM.stageIndex(a));
    return ids[0] || null;
  };
  RM.datingIds = function () {
    const s = S();
    if (!s || !s.romance) return [];
    return Object.keys(s.romance).filter((id) => s.romance[id].accepted);
  };

  /* ---------------- memories & history ---------------- */
  RM.remember = function (id, text, kind) {
    const st = RM.state(id);
    const s = S();
    const entry = { text: D().fill(text, s.player), kind: kind || 'moment', day: s.time.day, season: s.time.season, year: s.time.year };
    st.memories.push(entry);
    st.history.push(Object.assign({}, entry));
    if (st.memories.length > 60) st.memories.shift();
    if (st.history.length > 80) st.history.shift();
    if (SAN.journal && SAN.journal.add) { /* journal integration is optional */ }
    return entry;
  };

  RM.npcLine = function (id, key) {
    const def = RM.def(id);
    if (!def) return '';
    return D().fill((def.lines && def.lines[key]) || '', S().player);
  };
  RM.voice = function (id, key) {
    const def = RM.def(id);
    if (!def) return '';
    return D().fill((def[key]) || '', S().player);
  };
  RM.eventLines = function (id, kind) {
    const def = RM.def(id);
    const arr = (def && def.events && def.events[kind]) || [];
    return arr.map((t) => D().fill(t, S().player));
  };

  /* ---------------- affection ---------------- */
  RM.addAffection = function (id, n, silent) {
    const st = RM.state(id);
    if (!st) return 0;
    const room = Math.max(0, DAILY_AFFECTION_CAP - st.affectionToday);
    const gain = Math.min(Math.max(0, n), room);
    if (n < 0) { st.affection = Math.max(0, st.affection + n); return st.affection; }
    st.affection = Math.min(100, st.affection + gain);
    st.affectionToday += gain;
    if (!silent && gain > 0 && SAN.ui) SAN.ui.toast('+' + gain + ' affection', 'friend');
    return st.affection;
  };

  /* ---------------- activity availability ---------------- */
  RM.activityGain = function (id, actId) {
    const a = ACT(actId);
    const def = RM.def(id);
    if (!a) return 0;
    const pace = (def && def.pace) || 1;
    const stage = RM.stageIndex(id);
    let g = a.gain;
    if (stage <= 4) g = Math.round(g * 0.8 * pace);
    else if (stage >= 6) g = Math.round(g * 1.1);
    return Math.max(1, g);
  };

  RM.canActivity = function (id, actId) {
    const a = ACT(actId);
    const def = RM.def(id);
    const st = RM.state(id);
    const s = S();
    if (!a || !def || !st) return { ok: false, why: 'Not now.' };
    if (!RM.romanceable(id)) return { ok: false, why: 'You do not think of them this way.' };
    if (!RM.adult(id)) return { ok: false, why: 'Not like this.' };
    if (RM.stageIndex(id) < a.minStage) {
      return { ok: false, why: D().STAGES[a.minStage].name + ' or closer before this.' };
    }
    if (a.home && s.player.area !== 'home') return { ok: false, why: 'Only at your cottage.' };
    if (a.night && s.time.minutes < 18 * 60) return { ok: false, why: 'Better after dark.' };
    if (a.evening && s.time.minutes < 17 * 60) return { ok: false, why: 'Better in the evening.' };
    const used = st.activityCount[actId] || 0;
    if (a.once && used >= 1) return { ok: false, why: 'Already today. Tomorrow, maybe.' };
    if (!a.once && a.limit && used >= a.limit) return { ok: false, why: 'That is enough for today.' };
    if (a.gain > 0 && st.affectionToday >= DAILY_AFFECTION_CAP) return { ok: false, why: 'Today is already full. Let it settle.' };
    if (RM.affection(id) < (MIN_AFFECTION[actId] || 0)) {
      return { ok: false, why: def.refusals.pace, refuse: true };
    }
    // personal boundaries: privacy, public affection, comfort with touching
    const b = def.boundaries || {};
    const npcInfo = SAN.data.npcs[id] || {};
    const atHome = s.player.area === 'home';
    const hereDef = SAN.world.areas[s.player.area] || {};
    // "their place" only counts when it is a room, not the whole village square
    const theirPlace = npcInfo.homeArea === s.player.area && hereDef.region === 'indoor';
    if (a.privateOnly && !atHome && !theirPlace) return { ok: false, why: def.refusals.private, refuse: true };
    if (b.privateOnly && PHYSICAL.indexOf(actId) >= 0 && !atHome && !theirPlace) {
      return { ok: false, why: def.refusals.private, refuse: true };
    }
    if (b.pda === false && PHYSICAL.indexOf(actId) >= 0 && !atHome && !theirPlace && s.player.area === 'village') {
      return { ok: false, why: def.refusals.private, refuse: true };
    }
    if (b.noTouching && b.noTouching.indexOf(actId) >= 0 && RM.stageIndex(id) < 6) {
      return { ok: false, why: def.refusals.pace };
    }
    if (actId === 'gift' && !RM.romanticGiftId()) return { ok: false, why: 'You have no flower or keepsake to give.' };
    return { ok: true };
  };

  RM.activities = function (id) {
    return D().ACTIVITIES.map((a) => Object.assign({}, a, RM.canActivity(id, a.id), { computedGain: RM.activityGain(id, a.id) }));
  };

  RM.romanticGiftId = function () {
    const s = S();
    const pool = ['wild_lavender', 'lavender', 'starflower', 'moonpetal', 'snowdrop', 'wild_rose', 'bluebell', 'sunrose', 'forget_me_not', 'daisy', 'sunflower', 'pearl', 'sea_glass'];
    return pool.find((id) => s.inventory[id] > 0) || null;
  };

  /* ---------------- consent ---------------- */
  RM.askConsent = function (opts) {
    const o = Object.assign({ onYes: null, onNo: null, yesLabel: 'Yes, please', noLabel: 'Not tonight', prompt: '' }, opts || {});
    SAN.ui.dialogue({
      pages: [{ speaker: o.speaker || 'narrator', text: o.prompt }],
      choices: [
        { label: o.yesLabel, icon: '💗', cb: function () { if (o.onYes) o.onYes(); } },
        { label: o.noLabel, icon: '🤍', cb: function () { if (o.onNo) o.onNo(); } },
        { label: 'Say nothing for now', icon: '✕', cb: function () { if (o.onNo) o.onNo(); } },
      ],
    });
  };

  RM.refuse = function (id, why) {
    const npc = SAN.data.npcs[id];
    SAN.ui.dialogue({ pages: [{ speaker: id, text: why, context: 'concerned' }] });
    const st = RM.state(id);
    st.declined[why.slice(0, 24)] = (st.declined[why.slice(0, 24)] || 0) + 1;
    // a no is information, not a penalty: no points are removed anywhere
  };

  /* ---------------- performing an activity ---------------- */
  RM.perform = function (id, actId) {
    if (!RM.adult(id)) return false;
    const npc = SAN.data.npcs[id];
    const def = RM.def(id);
    const st = RM.state(id);
    const a = ACT(actId);
    if (!npc || !a || !st) return false;
    const can = RM.canActivity(id, actId);
    if (!can.ok) { RM.refuse(id, can.why || 'Not now.'); return false; }

    const run = function () {
      let extra = null;
      if (actId === 'gift') {
        const item = RM.romanticGiftId();
        if (item) { SAN.state.removeItem(item, 1); extra = SAN.data.item(item).name; }
      }
      const gain = RM.activityGain(id, actId);
      RM.addAffection(id, gain, true);
      st.activityCount[actId] = (st.activityCount[actId] || 0) + 1;
      const line = RM.npcLine(id, actId);
      const pages = [{ speaker: 'narrator', text: RM.activityNarration(id, actId, extra) }, { speaker: id, text: line, context: actId === 'kiss' || actId === 'cuddle' ? 'gentle' : 'happy' }];
      if (actId !== 'walk') RM.remember(id, line, actId);
      const play = function () { SAN.ui.dialogue({ pages, onClose: function () { SAN.progression.checkAchievements(); } }); };
      if (SAN.scenes) SAN.scenes.showActivity(id, actId, play); else play();
      SAN.audio.sfx(actId === 'kiss' ? 'sparkle' : 'page');
      RM.heartFx(actId);
      if (RM.stageIndex(id) >= 5) RM.checkPartnerAvailable(id);
    };

    const needsConsent = actId === 'kiss' || actId === 'cuddle';
    if (needsConsent) {
      RM.askConsent({
        speaker: 'narrator',
        prompt: RM.consentPrompt(id, actId),
        yesLabel: 'Yes, that is what I want',
        noLabel: 'Not right now',
        onYes: run,
        onNo: function () { RM.remember(id, 'You asked, and they said not now. Nothing changed between you.', 'consent'); },
      });
      return true;
    }
    run();
    return true;
  };

  // every romantic beat becomes a cinematic frame; if scenes are unavailable the
  // dialogue still runs exactly as before
  RM.withScene = function (id, kind, fn) {
    if (SAN.scenes && SAN.scenes.showEvent) { SAN.scenes.showEvent(id, kind, fn); return true; }
    fn();
    return false;
  };

  RM.activityNarration = function (id, actId, itemName) {
    const npc = SAN.data.npcs[id].name;
    const map = {
      walk: 'You walk with ' + npc + ' for a while, saying very little.',
      hand: 'You offer your hand. ' + npc + ' takes it.',
      hug: npc + ' steps into the hug and stays there.',
      stargaze: 'The two of you sit out under the dark and look up.',
      dance: 'You hold out a hand and ' + npc + ' takes it, laughing at the lack of music.',
      memory: 'You tell ' + npc + ' something you do not usually say out loud.',
      gift: 'You give ' + npc + ' the ' + (itemName || 'flower') + '.',
      dinner: 'You set out two plates and one candle.',
      kiss: 'You ask, quietly. ' + npc + ' says yes.',
      cuddle: 'You settle in close, and it is easy to stay.',
      cook: 'You cook together, badly and happily.',
      fire: 'You sit by the fire with ' + npc + ' until the room goes soft.',
      craft: 'You make something small together, badly, on purpose.',
    };
    return map[actId] || 'You spend a while together.';
  };

  RM.consentPrompt = function (id, actId) {
    const npc = SAN.data.npcs[id].name;
    if (actId === 'kiss') return 'You would like to kiss ' + npc + '. You have not asked yet. You can still not ask.';
    return 'You would like to be closer to ' + npc + '. Nothing happens unless they say yes, and they can change their mind.';
  };

  /* ---------------- confession, commitment, partnership ---------------- */
  RM.canConfess = function (id) {
    const st = RM.state(id);
    if (!RM.romanceable(id) || st.accepted) return false;
    return RM.friendship(id) >= 55 && st.affection >= 35;
  };
  RM.canCommit = function (id) {
    const st = RM.state(id);
    if (!st.accepted || st.committed) return false;
    const days = RM.daysSince(st.datingDay, st.datingSeason);
    return days >= 3 && st.affection >= 78;
  };
  RM.canPartner = function (id) {
    const st = RM.state(id);
    if (!st.committed || st.partner) return false;
    return RM.daysSince(st.commitDay, st.commitSeason) >= 5 && st.affection >= 92;
  };
  RM.daysSince = function (day, season) {
    if (day == null) return 0;
    const s = S();
    const now = s.time.season * 28 + s.time.day;
    const then = (season || 0) * 28 + day;
    return Math.max(0, now - then);
  };

  RM.confess = function (id) {
    const npc = SAN.data.npcs[id];
    const def = RM.def(id);
    const st = RM.state(id);
    if (!RM.canConfess(id)) {
      SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: 'Not yet. There is not enough between you for words this big.' }] });
      return;
    }
    const enough = st.affection >= 45 && RM.friendship(id) >= 60;
    SAN.ui.dialogue({
      pages: [
        { speaker: 'narrator', text: def.confession.ask },
        { speaker: 'player', text: 'I would like this to be more than friendship. If you do not, I will still be here.' },
      ],
      choices: [
        { label: 'Wait for their answer', icon: '💗', cb: function () {
          if (!enough) {
            st.notYet = true;
            RM.remember(id, D().fill(def.confession.notYet, S().player), 'not_yet');
            SAN.ui.dialogue({ pages: [{ speaker: id, text: def.confession.notYet, context: 'concerned' }] });
            return;
          }
          st.accepted = true;
          st.notYet = false;
          st.datingDay = S().time.day;
          st.datingSeason = S().time.season;
          st.events.date = st.events.date || false;
          RM.addAffection(id, 6, true);
          RM.remember(id, 'You told ' + npc.name + ' the truth, and they said yes.', 'confession');
          RM.withScene(id, 'confession', function () {
            SAN.ui.dialogue({
              pages: def.confession.yes.map((t, i) => ({ speaker: id, text: D().fill(t, S().player), context: i === 0 ? 'surprised' : 'happy' })),
              onClose: function () {
                RM.playEvent(id, 'date');
                SAN.ui.toast('You are dating ' + npc.name + '.', 'friend');
              },
            });
          });
          SAN.audio.sfx('sparkle');
        } },
        { label: 'Decide not to say it', icon: '✕', cb: function () {
          RM.remember(id, 'You almost said it, and decided the moment was not yours to take.', 'unspoken');
        } },
      ],
    });
  };

  RM.commit = function (id) {
    const npc = SAN.data.npcs[id];
    const def = RM.def(id);
    const st = RM.state(id);
    if (!RM.canCommit(id)) {
      SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: 'Not yet. A commitment should not be a shortcut past the ordinary days.' }] });
      return;
    }
    SAN.ui.dialogue({
      pages: [{ speaker: 'narrator', text: 'You ask ' + npc.name + ' to stop being a maybe.' }],
      choices: [
        { label: 'Ask them to be yours, and you theirs', icon: '💞', cb: function () {
          st.committed = true;
          st.commitDay = S().time.day;
          st.commitSeason = S().time.season;
          RM.addAffection(id, 5, true);
          RM.remember(id, 'You and ' + npc.name + ' chose each other, out loud.', 'commitment');
          RM.withScene(id, 'commit', function () {
            SAN.ui.dialogue({ pages: def.events.commit.map((t, i) => ({ speaker: id, text: D().fill(t, S().player), context: i === 0 ? 'serious' : 'gentle' })) });
          });
          SAN.audio.sfx('sparkle');
          SAN.ui.toast('Committed to ' + npc.name + '.', 'friend');
        } },
        { label: 'Not yet', icon: '✕', cb: function () {} },
      ],
    });
  };

  RM.propose = function (id) {
    const npc = SAN.data.npcs[id];
    const st = RM.state(id);
    if (!RM.canPartner(id)) {
      SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: 'Not yet. There is more ordinary life to live first.' }] });
      return;
    }
    SAN.ui.dialogue({
      pages: [{ speaker: 'narrator', text: 'You ask ' + npc.name + ' whether this is the life, the whole of it, shared.' }],
      choices: [
        { label: 'Ask them to share your life', icon: '💍', cb: function () {
          st.partner = true;
          st.partnerDay = S().time.day;
          RM.remember(id, npc.name + ' said yes to a shared life.', 'partner');
          RM.withScene(id, 'partner', function () {
            SAN.ui.dialogue({ pages: [{ speaker: id, text: 'Yes. Not as an ending. As the ordinary thing we keep choosing.', context: 'happy' }] });
          });
          SAN.audio.sfx('sparkle');
          SAN.ui.toast(npc.name + ' is your life partner.', 'friend');
        } },
        { label: 'Not yet', icon: '✕', cb: function () {} },
      ],
    });
  };

  /* ---------------- events ---------------- */
  RM.pendingScene = function (id) {
    const st = RM.state(id);
    if (!RM.romanceable(id)) return null;
    const f = RM.friendship(id);
    if (!st.events.friend && f >= 41) return 'friend';
    if (!st.events.story && f >= 61 && st.affection >= 18) return 'story';
    return null;
  };

  RM.playEvent = function (id, kind) {
    const st = RM.state(id);
    if (!st || !kind) return false;
    const lines = RM.eventLines(id, kind);
    if (!lines.length) { st.events[kind] = true; return false; }
    st.events[kind] = true;
    RM.remember(id, lines[0], 'event_' + kind);
    RM.withScene(id, kind, function () {
      SAN.ui.dialogue({
        pages: lines.map((t, i) => ({ speaker: id, text: t, context: i === 0 ? 'serious' : 'gentle' })),
        onClose: function () { if (kind === 'story') RM.addAffection(id, 4, true); },
      });
    });
    return true;
  };

  RM.anniversaryDue = function (id) {
    const st = RM.state(id);
    if (!st.accepted || st.datingDay == null) return false;
    const s = S();
    if (s.time.day !== st.datingDay) return false;
    if (s.time.season !== st.datingSeason) return false;
    const yearKey = 'anniversary_' + s.time.year;
    if (st.events[yearKey]) return false;
    st.events[yearKey] = true;
    return true;
  };

  RM.celebrateAnniversary = function (id) {
    const npc = SAN.data.npcs[id];
    RM.remember(id, 'An anniversary with ' + npc.name + '.', 'anniversary');
    RM.addAffection(id, 4, true);
    RM.withScene(id, 'anniversary', function () {
      SAN.ui.dialogue({
        pages: [
          { speaker: 'narrator', text: 'It is the day you began. Neither of you said so out loud this morning, and both of you remembered.' },
        ].concat(RM.eventLines(id, 'anniversary').map((t) => ({ speaker: id, text: t, context: 'happy' }))),
      });
    });
    SAN.audio.sfx('sparkle');
  };

  /* ---------------- check-ins ---------------- */
  RM.checkPartnerAvailable = function (id) {
    const st = RM.state(id);
    if (st.accepted && RM.stageIndex(id) === 5) {
      // nothing forced: the cottage visit is a possibility, not a demand
      return true;
    }
    return false;
  };

  RM.comfort = function (id) {
    const def = RM.def(id);
    const st = RM.state(id);
    if (RM.affection(id) < 25) {
      SAN.ui.dialogue({ pages: [{ speaker: id, text: 'I am all right. But thank you for asking. People do not usually.' }] });
      return;
    }
    RM.addAffection(id, 3, true);
    st.activityCount.comfort = (st.activityCount.comfort || 0) + 1;
    RM.remember(id, 'You asked if they were all right, and stayed for the answer.', 'comfort');
    SAN.ui.dialogue({
      pages: [
        { speaker: 'narrator', text: 'You ask, plainly, how they are. Not the polite version.' },
        { speaker: id, text: D().fill(def.comfort, S().player), context: 'gentle' },
      ],
    });
  };

  RM.stayNight = function (id) {
    if (!RM.adult(id)) return;
    const npc = SAN.data.npcs[id];
    const def = RM.def(id);
    const st = RM.state(id);
    const s = S();
    if (!st.accepted) {
      SAN.ui.dialogue({ pages: [{ speaker: 'narrator', text: 'That is not where this story is yet.' }] });
      return;
    }
    if (s.player.area !== 'home') {
      SAN.ui.dialogue({ pages: [{ speaker: id, text: 'My place is not built for two. Yours might be.' }] });
      return;
    }
    if (RM.affection(id) < 50) {
      SAN.ui.dialogue({ pages: [{ speaker: id, text: def.refusals.pace, context: 'concerned' }] });
      return;
    }
    RM.askConsent({
      prompt: 'You ask ' + npc.name + ' to stay. You mean: sleep beside me, nothing more than that. They can say no, and it changes nothing.',
      yesLabel: 'Ask them to stay',
      noLabel: 'Not tonight',
      onYes: function () {
        RM.remember(id, 'You slept beside ' + npc.name + ', and woke up to the same quiet.', 'night');
        RM.heartFx('cuddle');
        st.lastGoodnight = today();
        const sleepNow = function () {
          SAN.ui.fadeTo(function () {
          SAN.time.sleep(true);
          RM.addAffection(id, 4, true);
          SAN.ui.dialogue({
            pages: [
              { speaker: 'narrator', text: 'The lamp goes out. The rest of the night belongs to the two of you, and to no one else.' },
              { speaker: id, text: D().fill(def.morning, s.player), context: 'gentle' },
            ],
          });
          }, 900);
        };
        if (SAN.scenes) SAN.scenes.showEvent(id, 'night', sleepNow); else sleepNow();
        st.lastMorning = today() + 1;
        if (SAN.state.S.stats) SAN.state.S.stats.nightsTogether = (SAN.state.S.stats.nightsTogether || 0) + 1;
      },
      onNo: function () {
        RM.remember(id, 'You asked them to stay, and they did not, and the morning was still kind.', 'consent');
        SAN.ui.dialogue({ pages: [{ speaker: id, text: 'Not tonight. But I am glad you asked instead of assuming.', context: 'gentle' }] });
      },
    });
  };

  /* ---------------- cottage guest ---------------- */
  RM.guestExpected = function () {
    const s = S();
    const dated = RM.datingIds().sort((a, b) => RM.stageIndex(b) - RM.stageIndex(a));
    const pid = RM.partnerId() || dated[0];
    if (!pid) return null;
    const st = RM.state(pid);
    if (!st.accepted) return null;
    const hour = Math.floor(s.time.minutes / 60);
    if (st.committed || st.partner) return hour >= 16 || hour < 7 ? pid : null;
    return hour >= 18 && hour < 22 ? pid : null;
  };

  RM.addCottageGuest = function (W) {
    if (!W || W.cur !== 'home') return;
    const pid = RM.guestExpected();
    if (!pid) return;
    if (W.npcs.some((n) => n.def.id === pid)) return;
    const def = SAN.data.npcs[pid];
    if (!def) return;
    const spots = [[11.5, 7.4], [14.5, 8.4], [13.5, 9.6], [9.5, 5.6]];
    let spot = spots.find((p) => !W.isSolid(Math.floor(p[0]), Math.floor(p[1]))) || [10.5, 8.4];
    W.npcs.push({
      def, x: spot[0], y: spot[1], px: spot[0] * 16, py: spot[1] * 16,
      facing: 'down', moving: false, think: 2 + Math.random() * 2,
      anchor: { x: spot[0], y: spot[1] }, target: { x: spot[0], y: spot[1] },
      act: 'visiting you', pose: 'stand', bubble: null, chatTimer: 0, chatting: false, guest: true,
    });
  };

  RM.onEnter = function (areaId) {
    if (areaId !== 'home') return;
    const pid = RM.guestExpected();
    if (!pid) return;
    const st = RM.state(pid);
    const def = RM.def(pid);
    const s = S();
    const key = today();
    if (s.time.minutes < 11 * 60 && st.lastMorning !== key) {
      st.lastMorning = key;
      setTimeout(function () {
        if (SAN.ui.isPaused() || SAN.world.cur !== 'home') return;
        SAN.ui.dialogue({ pages: [{ speaker: pid, text: D().fill(def.morning, s.player), context: 'gentle' }] });
      }, 700);
    }
  };

  /* greeting flavour added to ordinary chats */
  RM.chatFlavour = function (id) {
    const def = RM.def(id);
    const st = RM.state(id);
    if (!def || !st || !st.accepted) return null;
    const s = S();
    const key = today();
    if ((s.time.weather === 'rain' || s.time.weather === 'storm') && st.lastRain !== key) {
      st.lastRain = key;
      return { text: D().fill(def.lines.rain, s.player), context: 'gentle' };
    }
    if (s.time.minutes >= 20 * 60 && st.lastGoodnight !== key) {
      st.lastGoodnight = key;
      return { text: D().fill(def.goodnight, s.player), context: 'gentle' };
    }
    return null;
  };

  // a small, motion-safe flourish so an interaction reads as happening
  RM.heartFx = function (actId) {
    if (!S() || (S().settings && S().settings.reduceMotion)) return;
    const glyph = actId === 'kiss' || actId === 'cuddle' ? '💗' : actId === 'dance' ? '♪' : '❦';
    const host = document.createElement('div');
    host.className = 'rom-fx';
    for (let i = 0; i < 5; i++) {
      const dot = document.createElement('span');
      dot.textContent = glyph;
      dot.style.left = (32 + Math.random() * 36) + '%';
      dot.style.animationDelay = (i * 0.11) + 's';
      dot.style.fontSize = (12 + Math.random() * 10) + 'px';
      host.appendChild(dot);
    }
    document.body.appendChild(host);
    setTimeout(function () { host.remove(); }, 1900);
  };

  RM.nextStep = function (id) {
    if (!RM.romanceable(id)) return '';
    if (RM.canPartner(id)) return 'You could ask them to share your life.';
    if (RM.canCommit(id)) return 'You could ask them to commit.';
    if (RM.canConfess(id)) return 'You could tell them how you feel.';
    if (RM.stageIndex(id) >= 4) return 'Spend more time together. Affection grows from doing things, not from gifts.';
    if (RM.stageIndex(id) >= 2) return 'Closer friendship first. Keep talking, keep showing up.';
    return 'Get to know them.';
  };
})();
