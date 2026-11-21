/* Sanctuary — the lore engine.
   LoreUnlockManager + BackstoryEventManager + MemoryRegistry access, all on
   top of the systems that already exist (relationships, romance, scenes,
   dialogue, memory book, save). Nothing here duplicates them.

   Reveal rules:
   • who someone is, is free (occupation, manner, why they are here);
   • family and childhood need 21 friendship;
   • wounds and secrets need 41–61;
   • the deepest layer needs 81, or the story flag that earns it. */
(function () {
  const LO = (SAN.lore = {});
  const S = () => SAN.state.S;
  const D = () => SAN.data;

  LO.ensure = function () {
    const s = S();
    if (!s) return null;
    if (!s.lore || typeof s.lore !== 'object') s.lore = {};
    if (!s.lore.unlocked) s.lore.unlocked = {};
    if (!s.lore.seen) s.lore.seen = {};
    if (!s.lore.flags) s.lore.flags = {};
    if (!s.lore.offers) s.lore.offers = {};
    return s.lore;
  };

  LO.char = (id) => (D().lore && D().lore.characters[id]) || null;
  LO.memory = (id) => (D().loreMemories || []).find((m) => m.id === id) || null;
  LO.memoriesFor = (id) => (D().loreMemories || []).filter((m) => m.npc === id);

  LO.friend = (id) => {
    const R = SAN.rel;
    if (!R) return 0;
    if (R.pts) return R.pts(id);
    const f = R.get ? R.get(id) : null;
    return f ? f.pts || 0 : 0;
  };

  LO.depth = function (id) {
    const pts = LO.friend(id);
    const R = SAN.romance;
    const stage = R && R.stageIndex ? R.stageIndex(id) : 0;
    let d = 0;
    if (pts >= 81) d = 81;
    else if (pts >= 61) d = 61;
    else if (pts >= 41) d = 41;
    else if (pts >= 21) d = 21;
    if (stage >= 5 && d < 61) d = 61;
    return d;
  };

  LO.requirements = function (m) {
    const u = m.unlock || {};
    const s = S();
    const missing = [];
    if (u.friend && LO.friend(m.npc) < u.friend) missing.push('friendship ' + u.friend);
    if (u.romance) {
      const R = SAN.romance;
      const st = R && R.stageIndex ? R.stageIndex(m.npc) : 0;
      if (st < u.romance) missing.push('a closer relationship');
    }
    if (u.item && s && !(s.inventory && s.inventory[u.item])) missing.push('an object you have not found');
    if (u.flag && s && !(s.flags && s.flags[u.flag])) missing.push('something still hidden');
    if (u.season != null && s && s.time.season !== u.season) missing.push('another season');
    return missing;
  };

  LO.canReveal = (m) => LO.requirements(m).length === 0;

  LO.availableFor = function (id) {
    const st = LO.ensure();
    if (!st) return [];
    return LO.memoriesFor(id).filter((m) => !st.unlocked[m.id] && LO.canReveal(m));
  };

  LO.isUnlocked = function (id) {
    const st = LO.ensure();
    return !!(st && st.unlocked[id]);
  };

  LO.unlock = function (id, silent) {
    const st = LO.ensure();
    const m = LO.memory(id);
    if (!st || !m) return false;
    if (st.unlocked[id]) return false;
    st.unlocked[id] = { day: S().time.day, season: S().time.season, year: S().time.year };
    st.seen[id] = true;
    if (SAN.memoryBook) {
      SAN.memoryBook.add({
        kind: 'lore', key: 'lore:' + id, title: m.title, text: m.summary,
        npc: m.npc, scene: m.plate || null, once: true,
      });
    }
    if (!silent && SAN.ui) SAN.ui.toast('A memory surfaces: ' + m.title, 'memory');
    if (SAN.save && SAN.save.autosave) SAN.save.autosave();
    return true;
  };

  /* how many memories of each person are unlocked, for the codex */
  LO.progress = function (id) {
    const list = LO.memoriesFor(id);
    const st = LO.ensure();
    const got = list.filter((m) => st && st.unlocked[m.id]).length;
    return { got, total: list.length };
  };

  LO.spec = function (m) {
    const SM = SAN.scenes;
    if (!SM || !SM.build) return null;
    return SM.build({
      cat: 'memory',
      key: 'lore_' + m.id,
      npc: m.npc,
      title: m.title,
      caption: m.date + ' · ' + m.place,
      backdrop: m.plate || undefined,
      mood: 'gentle',
    });
  };

  /* the conversation that reveals a memory, with its plate behind it */
  LO.reveal = function (id) {
    const m = LO.memory(id);
    if (!m) return false;
    const pages = [];
    pages.push({ speaker: 'narrator', text: m.summary });
    (m.pages || []).forEach((p) => pages.push(p));
    const spec = LO.spec(m);
    const talk = function () {
      SAN.ui.dialogue({
        pages: pages,
        onClose: function () {
          LO.unlock(id);
          SAN.ui.toast('Remembered: ' + m.title, 'memory');
        },
      });
    };
    if (spec && SAN.scenes && SAN.scenes.show) SAN.scenes.show(spec, talk);
    else talk();
    return true;
  };

  /* called from the conversation menu: the next thing this person can bear
     to show you, if anything */
  LO.talk = function (id) {
    const list = LO.availableFor(id);
    if (!list.length) {
      const name = (D().npcs[id] || {}).name || 'They';
      const deeper = LO.memoriesFor(id).some((m) => !LO.isUnlocked(m.id));
      SAN.ui.dialogue({
        pages: [{ speaker: 'narrator', text: deeper
          ? name + ' has more to tell you, but not today. Some things need a longer acquaintance.'
          : name + ' has shown you everything they keep in reach.' }],
      });
      return false;
    }
    return LO.reveal(list[0].id);
  };

  /* the biography as the player can currently read it */
  LO.biography = function (id) {
    const c = LO.char(id);
    if (!c) return null;
    const d = LO.depth(id);
    const att = (D().psychology && D().psychology.ATTACHMENTS) || {};
    const attInfo = att[c.attachment] || {};
    const layers = [
      {
        label: 'At a glance', open: true, text:
          c.fullName + ' · ' + c.age + ' · ' + c.profession + '. ' +
          'Born in ' + c.birthplace + '. ' + c.occupation,
      },
      {
        label: 'Why they are here', open: true, text:
          c.arrival.reason + ' ' +
          (c.arrival.bornHere ? 'They were born here and have lived here ' + c.arrival.years + '.'
            : 'They came ' + c.arrival.years + ' ago, from ' + c.arrival.from + ', invited by ' + c.arrival.invitedBy + '.') +
          ' They have considered leaving: ' + c.arrival.leavingConsidered,
      },
      {
        label: 'Family', open: d >= 21, text:
          c.family.parents + ' ' + c.family.siblings + ' ' + c.family.note,
      },
      {
        label: 'Childhood', open: d >= 21, text: c.childhood,
      },
      {
        label: 'Growing up', open: d >= 41, text: c.teens,
      },
      {
        label: 'What shaped them', open: d >= 41, text:
          (c.majorEvents || []).join(' ') + ' Wounds: ' + (c.wounds || []).join(' '),
      },
      {
        label: 'What they are afraid of', open: d >= 41, text: (c.insecurities || []).join(' '),
      },
      {
        label: 'How they love', open: d >= 41, text:
          'Attachment, as a tendency rather than a diagnosis: ' + (attInfo.name || c.attachment) + '. ' +
          (attInfo.blurb || '') + ' Boundaries: ' + (c.boundaries || []).join(' '),
      },
      {
        label: 'What they keep to themselves', open: d >= 61, text: (c.secrets || []).join(' '),
      },
      {
        label: 'What they are working towards', open: d >= 61, text:
          (c.goals || []).join(' ') + ' ' + c.arc,
      },
    ];
    return {
      id,
      name: c.name,
      fullName: c.fullName,
      age: c.age,
      birthday: c.birthday,
      profession: c.profession,
      depth: d,
      layers,
      memories: LO.memoriesFor(id).map((m) => ({
        id: m.id, title: m.title, unlocked: LO.isUnlocked(m.id), hint: LO.requirements(m).join(', '),
      })),
    };
  };

  LO.mc = function () {
    const s = S();
    const base = (D().lore && D().lore.mc) || {};
    if (!s) return base;
    const bg = SAN.state.background(s.player.background);
    const reason = LO.reason(s.player.reason);
    const origin = (D().lore.ORIGIN_LINES || {})[s.player.background] || {};
    return Object.assign({}, base, {
      origin: origin.previousLife || '',
      expectation: origin.expectation || '',
      reason,
      background: bg,
      line: reason.line,
    });
  };

  LO.reason = function (id) {
    const list = (D().lore && D().lore.REASONS) || [];
    return list.find((r) => r.id === id) || list[0] || null;
  };

  LO.setReason = function (id) {
    const s = S();
    if (!s) return;
    s.player.reason = LO.reason(id).id;
  };

  LO.timeline = function () {
    return ((D().worldLore && D().worldLore.TIMELINE) || []).slice();
  };

  LO.places = function () {
    const p = (D().worldLore && D().worldLore.PLACES) || {};
    return Object.keys(p).map((k) => Object.assign({ id: k }, p[k]));
  };

  LO.relationships = function () {
    const list = ((D().lore && D().lore.history) || []).slice();
    return list.map((r) => ({
      a: r.a, b: r.b, since: r.since, how: r.how, conflict: r.conflict, now: r.now,
      aName: ((D().npcs[r.a] || {}).name) || r.a,
      bName: ((D().npcs[r.b] || {}).name) || r.b,
      sinceLabel: r.since < 0 ? Math.abs(r.since) + ' years before you arrived' : 'this year',
    }));
  };

  LO.story = function () {
    const links = (D().lore && D().lore.STORY_LINKS) || {};
    const st = LO.ensure();
    const map = { cottage: ['mem_cottage_ledger'], ledger: ['mem_nyssa_page'], flowers: ['mem_celeste_letter'], letters: ['mem_lucien_letters'], unlabelled_box: ['mem_aria_box'], promise: ['mem_nyssa_promise'], ninth: ['mem_nyssa_page', 'mem_grove_stones'], star_hook: ['mem_finn_hook'], winter_route: ['mem_theo_winter'], maren: ['mem_cottage_ledger'] };
    return Object.keys(links).map((k) => {
      const need = map[k] || [];
      const open = need.length ? need.some((id) => st && st.unlocked[id]) : false;
      return { id: k, title: links[k].title, text: links[k].text, arc: links[k].arc, open };
    });
  };

  LO.arcStage = function () {
    const st = LO.ensure();
    const n = st ? Object.keys(st.unlocked).length : 0;
    const world = D().worldLore || {};
    const beats = (world.ARC && world.ARC.beats) || [];
    const idx = Math.min(beats.length - 1, Math.floor(n / 4));
    return { unlocked: n, total: (D().loreMemories || []).length, title: world.ARC ? world.ARC.title : '', beat: beats[idx] || '' };
  };

  /* consistency check for the whole bible: ages against birth years, reveal
     order, memory references, relationship pairs, timeline ordering */
  LO.validate = function () {
    const problems = [];
    const lore = D().lore || {};
    const chars = lore.characters || {};
    const ids = Object.keys(chars);
    if (ids.length !== 9) problems.push('expected 9 characters, found ' + ids.length);
    const births = {};
    (D().worldLore ? D().worldLore.TIMELINE : []).forEach((t) => {
      const m = /^([A-Za-z]+) born$/.exec(t.title || '');
      if (m) births[m[1].toLowerCase()] = t.year;
    });
    ids.forEach((id) => {
      const c = chars[id];
      if (c.id !== id) problems.push(id + ': id mismatch');
      if (typeof c.age === 'number' && births[id] != null) {
        const implied = 1 - births[id];
        /* a birthday later in the year means they are still one year younger */
        if (c.age !== implied && c.age !== implied - 1) {
          problems.push(id + ': age ' + c.age + ' but born Year ' + births[id] + ' (implies ' + (implied - 1) + ' or ' + implied + ')');
        }
      }
      let lastDepth = -1;
      (c.reveal || []).forEach((r) => {
        if (r.depth <= lastDepth) problems.push(id + ': reveal depths not ascending');
        lastDepth = r.depth;
        if (!r.text) problems.push(id + ': empty reveal at depth ' + r.depth);
      });
      if (!c.arrival || c.arrival.from == null) problems.push(id + ': missing arrival history');
      if (!c.goals || !c.goals.length) problems.push(id + ': missing goals');
      if (!c.secrets || !c.secrets.length) problems.push(id + ': missing secrets');
    });
    (D().loreMemories || []).forEach((m) => {
      if (!chars[m.npc]) problems.push(m.id + ': unknown npc ' + m.npc);
      if (!m.plate) problems.push(m.id + ': no illustration plate');
      if (!m.pages || m.pages.length < 1) problems.push(m.id + ': no dialogue');
      const need = m.unlock || {};
      if (need.friend && [21, 41, 61, 81].indexOf(need.friend) < 0) problems.push(m.id + ': unusual friendship gate ' + need.friend);
    });
    (lore.history || []).forEach((r) => {
      if (!chars[r.a] || !chars[r.b]) problems.push('history pair references unknown npc: ' + r.a + '/' + r.b);
      if (r.a === r.b) problems.push('history pair points at one person: ' + r.a);
    });
    const tl = (D().worldLore ? D().worldLore.TIMELINE : []).slice();
    for (let i = 1; i < tl.length; i++) {
      if (tl[i].year > tl[i - 1].year) problems.push('timeline out of order at ' + tl[i].title);
    }
    return { ok: problems.length === 0, problems };
  };

  /* a new day: places offer what the season allows */
  LO.tickDay = function () {
    const st = LO.ensure();
    if (!st) return;
    (D().loreMemories || []).forEach((m) => {
      if (st.unlocked[m.id]) return;
      if (!LO.canReveal(m)) return;
      if (m.unlock && m.unlock.season != null) st.offers[m.id] = S().time.day;
    });
  };
})();
