/* Sanctuary — quest system: chapters, objectives, rewards, board */
(function () {
  const Q = (SAN.quests = {});
  const D = SAN.data;

  Q.def = (id) => D.quests[id];

  Q.start = function (id, silent) {
    const S = SAN.state.S;
    const q = D.quests[id];
    if (!q || S.quests.active[id] || S.quests.completed[id]) return null;
    S.quests.active[id] = { id, progress: q.objectives.map(() => 0), startedDay: S.time.day, startedSeason: S.time.season, ready: false };
    if (!silent) {
      SAN.ui.toast('New quest — ' + q.title, 'quest');
      SAN.audio.sfx('open');
      SAN.state.log('Quest started: ' + q.title);
    }
    return S.quests.active[id];
  };

  Q.availableFor = function (npcId) {
    const S = SAN.state.S;
    const list = Object.values(D.quests);
    for (const q of list) {
      if (q.type === 'main' || q.type === 'story' || q.type === 'side') {
        if (q.giver !== npcId) continue;
        if (S.quests.active[q.id] || S.quests.completed[q.id]) continue;
        const prev = list.find((x) => x.next === q.id);
        if (prev && !S.quests.completed[prev.id]) continue;
        if (q.id === 'side_memory' && !S.unlocked.memory_vault) continue;
        if (q.id === 'side_cat' && !S.cat.adopted) continue;
        return q;
      }
    }
    return null;
  };

  Q.activeList = function () {
    const S = SAN.state.S;
    return Object.keys(S.quests.active).map((id) => ({ id, def: D.quests[id], state: S.quests.active[id] })).filter((x) => x.def);
  };

  Q.progressOf = function (id, idx) {
    const S = SAN.state.S;
    const q = D.quests[id];
    const st = S.quests.active[id];
    if (!q) return { cur: 0, need: 1, done: false, label: '' };
    const obj = q.objectives[idx];
    if (!obj) return { cur: 0, need: 1, done: true, label: '' };
    let cur = 0;
    if (obj.kind === 'collect') cur = SAN.state.count(obj.target);
    else if (st) cur = st.progress[idx] || 0;
    const need = obj.qty || 1;
    return { cur: Math.min(cur, need), need, done: cur >= need, label: obj.label || obj.target };
  };

  Q.isComplete = function (id) {
    const q = D.quests[id];
    if (!q) return false;
    return q.objectives.every((o, i) => Q.progressOf(id, i).done);
  };

  Q.refreshReady = function (id) {
    const S = SAN.state.S;
    const st = S.quests.active[id];
    if (!st) return false;
    const wasReady = st.ready;
    st.ready = Q.isComplete(id);
    if (st.ready && !wasReady) {
      SAN.ui.toast('Quest ready to turn in: ' + D.quests[id].title, 'quest');
      SAN.audio.sfx('sparkle');
      st.ready = true;
    }
    if (id.indexOf('board_') === 0) st.ready = Q.isComplete(id);
    return st.ready;
  };

  Q.notify = function (kind, target, amount, itemId) {
    const S = SAN.state.S;
    if (!S) return;
    const n = amount == null ? 1 : amount;
    Object.keys(S.quests.active).forEach((id) => {
      const q = D.quests[id];
      const st = S.quests.active[id];
      if (!q || !st) return;
      q.objectives.forEach((o, i) => {
        if ((st.progress[i] || 0) >= (o.qty || 1)) return;
        if (o.kind !== kind) return;
        const match = (o.target === 'any' || o.target === target) && (!o.item || o.item === itemId);
        if (!match) return;
        if (st.progress[i] == null) st.progress[i] = 0;
        st.progress[i] = Math.min(o.qty || 1, st.progress[i] + n);
      });
      Q.refreshReady(id);
    });
  };

  Q.setFlag = function (name, value) {
    const S = SAN.state.S;
    S.flags[name] = value == null ? true : value;
    Q.notify('flag', name, 1);
  };

  Q.turnIn = function (id, opts) {
    const S = SAN.state.S;
    const q = D.quests[id];
    const st = S.quests.active[id];
    if (!q || !st) return false;
    if (!Q.isComplete(id)) return false;
    delete S.quests.active[id];
    S.quests.completed[id] = { day: S.time.day, season: S.time.season, year: S.time.year };
    S.stats.questsDone++;
    const r = q.rewards || {};
    if (r.money) SAN.state.earn(r.money);
    if (r.items) r.items.forEach(([iid, qty]) => SAN.state.addItem(iid, qty, { silent: true }));
    if (r.friendship) Object.keys(r.friendship).forEach((npc) => SAN.rel.add(npc, r.friendship[npc]));
    if (r.xp) Object.keys(r.xp).forEach((k) => SAN.progression.addXp(k, r.xp[k]));
    else SAN.progression.addXp('exploration', 25);
    if (r.achievement) SAN.progression.unlock(r.achievement);
    if (r.unlock === 'memory_vault') {
      S.unlocked.memory_vault = true;
      SAN.ui.toast('The Memory Vault is open. The forest stones are listening.', 'unlock');
    }
    if (r.unlock === 'greenhouse_beds') {
      S.unlocked.greenhouse_beds = true;
      SAN.ui.toast('Elowen has given you a bed in the greenhouse.', 'unlock');
    }
    if (r.unlock === 'lighthouse_key') S.unlocked.lighthouse_key = true;
    if (r.recipe) {
      const cr = D.craftRecipes.find((x) => x.id === r.recipe);
      if (cr) SAN.state.addItem(cr.out, 1, { silent: true });
    }
    SAN.audio.sfx('achieve');
    SAN.state.log('Quest complete: ' + q.title);
    SAN.ui.toast('Quest complete — ' + q.title, 'quest');
    if (q.next) {
      setTimeout(() => {
        Q.start(q.next);
        const next = D.quests[q.next];
        if (next && SAN.ui) SAN.ui.toast('Next chapter — ' + next.title, 'story');
      }, 1400);
    }
    SAN.progression.checkAchievements();
    SAN.save.autosave(true);
    return true;
  };

  Q.readyTurnInsFor = function (npcId) {
    return Q.activeList().filter((x) => x.def.giver === npcId && Q.isComplete(x.id));
  };

  Q.refreshBoard = function () {
    const S = SAN.state.S;
    if (S.quests.boardDay === S.time.day && S.quests.board.length) return;
    S.quests.boardDay = S.time.day;
    const pool = D.boardQuests.slice();
    const picks = [];
    for (let i = 0; i < 3 && pool.length; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picks.push(pool.splice(idx, 1)[0]);
    }
    S.quests.board = picks.map((b) => ({ ...b, taken: false, done: false }));
  };

  Q.acceptBoard = function (idx) {
    const S = SAN.state.S;
    const b = S.quests.board[idx];
    if (!b || b.taken) return false;
    const id = 'board_' + b.id + '_' + S.time.day;
    const need = Object.keys(b.need)[0];
    const qty = b.need[need];
    D.quests[id] = {
      id, title: b.text.slice(0, 46) + (b.text.length > 46 ? '…' : ''), giver: 'board', type: 'daily',
      desc: b.text,
      objectives: [{ kind: 'collect', target: need, qty, label: 'Deliver ' + (D.item(need).name) + ' ×' + qty }],
      rewards: { money: b.money, items: b.items || [] },
    };
    b.taken = true;
    S.quests.board[idx] = b;
    Q.start(id);
    return true;
  };

  Q.boardReady = function () {
    const S = SAN.state.S;
    return Q.activeList().filter((x) => x.def.type === 'daily' && Q.isComplete(x.id));
  };

  Q.objectiveList = function (id) {
    const q = D.quests[id];
    if (!q) return [];
    return q.objectives.map((o, i) => Q.progressOf(id, i));
  };

  Q.currentStory = function () {
    const S = SAN.state.S;
    return Q.activeList().filter((x) => x.def.type === 'story');
  };

  Q.locationHint = function (q) {
    if (!q) return '';
    const giver = D.npcs[q.giver];
    if (q.id.indexOf('board_') === 0) return 'Village bulletin board';
    if (q.id.startsWith('lh_')) return 'The Lighthouse';
    if (q.id.startsWith('gh_')) return 'The Shared Greenhouse';
    if (q.id.startsWith('wm_')) return 'The Whispering Windmill';
    if (giver) return giver.homeArea ? SAN.world.areas[giver.homeArea].name : 'Sanctuary';
    return 'Sanctuary';
  };
})();
