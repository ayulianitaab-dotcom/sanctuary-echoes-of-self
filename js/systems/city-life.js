/* Sanctuary — the living village.
   Finds the right event for the actual context (hour, weather, season, place,
   who is around, how close they are), runs it as a cinematic scene, applies
   small human consequences, and lets NPCs have their own lives off-screen.

   This is a scheduler on top of the existing systems: it never re-implements
   dialogue, scenes, relationships or save data. */
(function () {
  const CL = (SAN.cityLife = {});
  const S = () => SAN.state.S;
  const C = () => SAN.data.city;
  let acc = 0;
  let witnessAcc = 0;

  CL.ensure = function () {
    const s = S();
    if (!s) return null;
    if (!s.city || typeof s.city !== 'object') s.city = {};
    const c = s.city;
    if (!c.seen) c.seen = {};
    if (!c.cooldowns) c.cooldowns = {};
    if (!c.bonds) c.bonds = {};
    if (c.eventsToday == null) c.eventsToday = 0;
    if (c.day == null) c.day = -1;
    if (c.lastMinute == null) c.lastMinute = -999;
    if (!c.witnessed) c.witnessed = [];
    (C().BONDS || []).forEach((b) => {
      const k = CL.key(b.a, b.b);
      if (!c.bonds[k]) c.bonds[k] = { warmth: b.warmth, day: s.time.day, shifts: [] };
    });
    return c;
  };

  CL.key = (a, b) => (a < b ? a + '|' + b : b + '|' + a);

  CL.bond = function (a, b) {
    const c = CL.ensure();
    if (!c) return null;
    const k = CL.key(a, b);
    if (!c.bonds[k]) c.bonds[k] = { warmth: 40, day: S().time.day, shifts: [] };
    return c.bonds[k];
  };

  CL.bondInfo = function (a, b) {
    const k = CL.key(a, b);
    return (C().BONDS || []).find((x) => CL.key(x.a, x.b) === k) || null;
  };

  CL.shiftBond = function (a, b, delta, why) {
    const st = CL.bond(a, b);
    if (!st) return null;
    st.warmth = Math.max(0, Math.min(100, st.warmth + delta));
    st.day = S().time.day;
    st.shifts.push({ delta, why: why || '', day: S().time.day });
    if (st.shifts.length > 20) st.shifts.shift();
    return st;
  };

  CL.stage = (id) => {
    const R = SAN.romance;
    return R && R.stageIndex ? R.stageIndex(id) : 0;
  };

  CL.present = function () {
    const W = SAN.world;
    if (!W || !W.npcs) return [];
    return W.npcs.map((n) => n.def.id);
  };

  CL.hourOK = function (ev) {
    const s = S();
    if (!ev.hours) return true;
    const h = s.time.minutes / 60;
    return h >= ev.hours[0] && h < ev.hours[1];
  };

  CL.calendarOK = function (ev) {
    const t = S().time;
    if (ev.seasons && ev.seasons.indexOf(t.season) < 0) return false;
    if (ev.days && (t.day < ev.days[0] || (ev.days[1] ? t.day > ev.days[1] : t.day !== ev.days[0]))) return false;
    if (ev.weathers && ev.weathers.indexOf(t.weather) < 0) return false;
    if (ev.check && !ev.check()) return false;
    return true;
  };

  CL.areaOK = function (ev, area) {
    if (!ev.areas) return true;
    return ev.areas.indexOf(area) >= 0;
  };

  CL.cooledDown = function (ev) {
    const c = CL.ensure();
    const once = ev.once;
    if (once) {
      const t = S().time;
      const key = once === 'year' ? 'y' + t.year : once === 'season' ? 'y' + t.year + 's' + t.season : 'd' + t.day;
      if (c.seen[ev.id] === key) return false;
    }
    const last = c.cooldowns[ev.id];
    if (last == null) return true;
    return S().time.day - last >= (ev.cooldownDays || 1);
  };

  /* who could plausibly be part of this, given who is actually standing here */
  CL.participant = function (ev) {
    const here = CL.present();
    const pool = ev.npcPool || null;
    let ids = pool ? pool.slice() : here.slice();
    if (pool) {
      const near = ids.filter((id) => here.indexOf(id) >= 0);
      if (near.length) ids = near;
    }
    ids = ids.filter((id) => SAN.data.npcs && SAN.data.npcs[id]);
    ids = ids.filter((id) => CL.stage(id) >= (ev.minStage || 0));
    if (!ids.length) return null;
    return ids[Math.floor(Math.random() * ids.length)];
  };

  CL.candidates = function () {
    const s = S();
    if (!s) return [];
    const area = s.player.area;
    const here = CL.present();
    const all = []
      .concat((C().SEASONAL || []).map((e) => ({ ev: e, w: 6 })))
      .concat((C().SPECIAL || []).map((e) => ({ ev: e, w: 4 })))
      .concat((C().DAILY || []).map((e) => ({ ev: e, w: 2 })))
      .concat((C().RANDOM || []).map((e) => ({ ev: e, w: 3 })));
    const out = [];
    all.forEach((row) => {
      const ev = row.ev;
      if (!CL.areaOK(ev, area)) return;
      if (!CL.hourOK(ev)) return;
      if (!CL.calendarOK(ev)) return;
      if (!CL.cooledDown(ev)) return;
      /* an event that needs somebody needs somebody who is actually here,
         unless its pool names people who live wherever they are */
      const pool = ev.npcPool;
      const poolHere = pool && pool.some((id) => here.indexOf(id) >= 0);
      if (!pool && !here.length && !ev.npcPool) {
        /* narrator-only moments still need some company to land */
        return;
      }
      if (pool && !poolHere && ev.areas) return;
      const npc = CL.participant(ev);
      if (!npc) return;
      let w = row.w;
      if (ev.seasons) w += 5;
      if (ev.once) w += 3;
      if (CL.stage(npc) >= 5 && ev.minStage) w += 2;
      out.push({ ev, npc, w });
    });
    return out;
  };

  CL.pick = function () {
    const list = CL.candidates();
    if (!list.length) return null;
    let total = 0;
    list.forEach((x) => { total += x.w; });
    let r = Math.random() * total;
    for (let i = 0; i < list.length; i++) {
      r -= list[i].w;
      if (r <= 0) return list[i];
    }
    return list[0];
  };

  CL.context = function (ev, npcId) {
    const d = SAN.data.npcs[npcId] || {};
    return {
      npc: npcId,
      name: d.name || '',
      title: ev.title,
      player: S().player,
      area: S().player.area,
    };
  };

  CL.sceneFor = function (ev, npcId, spec) {
    const s = spec || {};
    const FM = SAN.scenes && SAN.scenes.build;
    if (!FM) return null;
    return FM({
      cat: 'event',
      key: ev.id,
      npc: npcId,
      title: ev.title,
      backdrop: ev.backdrop || undefined,
      area: s.area || S().player.area,
      caption: s.caption || '',
    });
  };

  CL.finish = function (ev, npcId) {
    const c = CL.ensure();
    const t = S().time;
    c.cooldowns[ev.id] = t.day;
    c.eventsToday = (c.eventsToday || 0) + 1;
    c.lastMinute = t.minutes;
    if (ev.once) {
      c.seen[ev.id] = ev.once === 'year' ? 'y' + t.year : ev.once === 'season' ? 'y' + t.year + 's' + t.season : 'd' + t.day;
    }
    const fx = ev.effects || {};
    if (SAN.rel && SAN.rel.add) SAN.rel.add(npcId, ev.minStage ? 3 : 2, true);
    if (SAN.psychology) SAN.psychology.onEvent(npcId, fx.psychology || 'quality_time');
    if (SAN.romance && ev.minStage) SAN.romance.addAffection(npcId, 1, true);
    if (SAN.memoryBook) {
      SAN.memoryBook.add({
        kind: ev.cat === 'random' ? 'moment' : 'city',
        key: 'city:' + ev.id + ':' + (ev.once ? 'once' : t.day),
        title: ev.title,
        text: ev.memory || '',
        npc: npcId,
        scene: CL.sceneFor(ev, npcId) ? CL.sceneFor(ev, npcId).id : null,
        once: !!ev.once,
      });
    }
    if (SAN.state && SAN.state.save) SAN.state.save();
  };

  /* run the event: cinematic plate first, then the conversation on top of it */
  CL.run = function (ev, npcId) {
    if (!ev || !npcId) return false;
    const ctx = CL.context(ev, npcId);
    const pages = typeof ev.pages === 'function' ? ev.pages(ctx) : (ev.pages || []);
    const spec = CL.sceneFor(ev, npcId);
    const talk = function () {
      SAN.ui.dialogue({
        pages: pages,
        onClose: function () {
          CL.finish(ev, npcId);
          if (ev.memory) SAN.ui.toast(ev.memory, 'memory');
        },
      });
    };
    if (spec && SAN.scenes && SAN.scenes.show) SAN.scenes.show(spec, talk);
    else talk();
    return true;
  };

  /* invitations are opt-in, and "not now" is a real answer, not a failure */
  CL.invite = function (ev, npcId) {
    const ctx = CL.context(ev, npcId);
    const pages = (typeof ev.pages === 'function' ? ev.pages(ctx) : ev.pages || []).slice();
    const name = ctx.name;
    pages.push({ speaker: 'narrator', text: 'You can accept, ask for another time, or say no. None of these is the wrong answer.' });
    SAN.ui.dialogue({
      pages: pages,
      choices: [
        { label: 'Accept', icon: '✓', cb: function () { CL.run(ev, npcId); } },
        { label: 'Not now', icon: '◷', cb: function () {
          const c = CL.ensure();
          c.cooldowns[ev.id] = S().time.day;
          SAN.ui.toast(name + ' nods. "Another time, then. I will ask again."', 'friend');
          SAN.psychology.onEvent(npcId, 'space_given');
        } },
        { label: 'Decline', icon: '✕', cb: function () {
          const c = CL.ensure();
          c.cooldowns[ev.id] = S().time.day;
          SAN.psychology.onEvent(npcId, 'declined_invite');
          SAN.ui.toast(name + ' smiles, a little carefully. "That is alright. Truly."', 'friend');
        } },
      ],
    });
    return true;
  };

  CL.fire = function (ev, npcId) {
    if (ev.invite) return CL.invite(ev, npcId);
    return CL.run(ev, npcId);
  };

  CL.force = function (id) {
    const all = [].concat(C().DAILY || [], C().SEASONAL || [], C().SPECIAL || [], C().RANDOM || []);
    const ev = all.find((e) => e.id === id);
    if (!ev) { SAN.ui.toast('No such city event: ' + id, 'system'); return false; }
    const npc = CL.participant(ev) || (ev.npcPool && ev.npcPool[0]) || CL.present()[0];
    if (!npc) { SAN.ui.toast('Nobody is around for that event right now.', 'system'); return false; }
    CL.fire(ev, npc);
    return true;
  };

  /* two NPCs, on their own, in front of whoever happens to be nearby */
  CL.autonomous = function (force) {
    const s = S();
    const c = CL.ensure();
    const here = CL.present();
    if (here.length < 2) return false;
    if (!force && Math.random() > 0.34) return false;
    const pairs = (C().BONDS || []).filter((b) => here.indexOf(b.a) >= 0 && here.indexOf(b.b) >= 0);
    if (!pairs.length) return false;
    const b = pairs[Math.floor(Math.random() * pairs.length)];
    const info = CL.bondInfo(b.a, b.b);
    const st = CL.bond(b.a, b.b);
    const warm = st.warmth >= 45;
    const lines = C().BOND_MOMENTS || [];
    const line = lines[Math.floor(Math.random() * lines.length)];
    const a = SAN.data.npcs[b.a].name;
    const bb = SAN.data.npcs[b.b].name;
    c.witnessed.unshift({ a: b.a, b: b.b, day: s.time.day, line: line });
    if (c.witnessed.length > 12) c.witnessed.pop();
    SAN.ui.toast(a + ' and ' + bb + ': ' + line, 'friend');
    if (SAN.memoryBook) {
      SAN.memoryBook.add({
        kind: 'village',
        key: 'village:' + CL.key(b.a, b.b) + ':' + s.time.day,
        title: a + ' & ' + bb,
        text: (info ? info.note : '') + ' ' + line,
        npcs: [b.a, b.b],
        once: true,
      });
    }
    CL.shiftBond(b.a, b.b, warm ? 1 : -1, warm ? 'a good afternoon' : 'a small friction');
    return true;
  };

  CL.witnessLine = function () {
    const c = CL.ensure();
    return c && c.witnessed && c.witnessed.length ? c.witnessed[0] : null;
  };

  CL.tickDay = function () {
    const s = S();
    const c = CL.ensure();
    if (!s || !c) return;
    c.day = s.time.day;
    c.eventsToday = 0;
    c.lastMinute = -999;
    if (SAN.psychology) SAN.psychology.tickDay();
    /* the village keeps living: two quiet bond shifts per day */
    const bonds = C().BONDS || [];
    for (let i = 0; i < 2 && bonds.length; i++) {
      const b = bonds[Math.floor(Math.random() * bonds.length)];
      const drift = Math.random() < 0.55 ? 1 : -1;
      CL.shiftBond(b.a, b.b, drift, drift > 0 ? 'an ordinary kindness' : 'an ordinary misunderstanding');
    }
    CL.autonomous();
  };

  CL.update = function (dt) {
    const s = S();
    if (!s) return;
    const c = CL.ensure();
    if (c.day !== s.time.day) {
      c.day = s.time.day;
      c.eventsToday = 0;
    }
    if (SAN.ui.isPaused && SAN.ui.isPaused()) return;
    if (SAN.ui.dialogueState) return;
    if (SAN.scenes && SAN.scenes.current) return;
    if (S().settings && S().settings.cityEvents === false) return;
    acc += dt;
    witnessAcc += dt;
    if (witnessAcc > 75) {
      witnessAcc = 0;
      CL.autonomous();
    }
    if (acc < 9) return;
    acc = 0;
    if ((c.eventsToday || 0) >= 3) return;
    if (s.time.minutes - c.lastMinute < 40) return;
    if (Math.random() > 0.3) return;
    const pick = CL.pick();
    if (!pick) return;
    CL.fire(pick.ev, pick.npc);
  };
})();
