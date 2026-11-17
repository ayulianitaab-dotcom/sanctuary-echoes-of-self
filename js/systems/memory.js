/* Sanctuary — the Memory Vault: symbolic stones, optional care, gentle growth.
   Nothing here is compulsory; any activity can be skipped or closed at any time. */
(function () {
  const M = (SAN.memory = {});
  const U = SAN.util;

  M.create = function (data) {
    const S = SAN.state.S;
    const rec = {
      id: U.uid(),
      title: (data.title || 'An unnamed thing').slice(0, 80),
      desc: (data.desc || '').slice(0, 800),
      emotion: data.emotion || 'longing',
      object: data.object || 'stone',
      progress: 0,
      cares: {},
      createdDay: S.time.day,
      createdSeason: S.time.season,
      lastCareDay: 0,
    };
    S.memories.unshift(rec);
    SAN.audio.sfx('sparkle');
    return rec;
  };

  M.get = function (id) { return SAN.state.S.memories.find((m) => m.id === id); };

  M.care = function (id, actionId) {
    const S = SAN.state.S;
    const m = M.get(id);
    if (!m) return { ok: false, msg: 'That memory is not here.' };
    if (m.lastCareDay === S.time.day) {
      return { ok: false, msg: 'You have already spent a moment here today. That is enough.' };
    }
    const action = SAN.data.memoryCare.find((a) => a.id === actionId);
    if (!action) return { ok: false, msg: '' };
    m.lastCareDay = S.time.day;
    m.cares[actionId] = (m.cares[actionId] || 0) + 1;
    m.progress = Math.min(5, m.progress + 1);
    S.stats.memoriesCared++;
    if (m.progress === 3 && !m.shardGiven) {
      m.shardGiven = true;
      SAN.state.addItem('memory_shard', 1);
    }
    SAN.quests.notify('memory', 'any', 1);
    SAN.progression.addXp('exploration', 5);
    SAN.progression.checkAchievements();
    SAN.audio.sfx('sparkle');
    SAN.save.autosave();
    const stage = M.stageName(m.progress);
    return { ok: true, line: action.line, stage, progress: m.progress };
  };

  M.stageName = function (p) {
    if (p >= 5) return 'A glowing memory garden';
    if (p >= 4) return 'In full bloom';
    if (p >= 3) return 'Flowers around the stone';
    if (p >= 2) return 'A small green sprout';
    if (p >= 1) return 'A little softer, a little lighter';
    return 'A grey stone, held';
  };

  M.stageDesc = function (p) {
    const names = [
      'It is here. That is all it has to do right now.',
      'Something small has started to grow beside it.',
      'You put something living next to it. It did not have to be permanent.',
      'Flowers. Small, bright, and entirely yours.',
      'The whole little garden is glowing. It is still your memory. It is just not the only thing.',
    ];
    return names[Math.min(5, Math.max(0, p))];
  };

  M.careActionsToday = function (id) {
    const S = SAN.state.S;
    const m = M.get(id);
    if (!m) return [];
    return SAN.data.memoryCare.filter((a) => m.lastCareDay !== S.time.day);
  };

  M.delete = function (id) {
    const S = SAN.state.S;
    const i = S.memories.findIndex((m) => m.id === id);
    if (i >= 0) { S.memories.splice(i, 1); return true; }
    return false;
  };

  M.byStone = function (idx) {
    return SAN.state.S.memories[idx] || null;
  };

  M.forestProgress = function () {
    const S = SAN.state.S;
    return [0, 1, 2].map((i) => (S.memories[i] ? S.memories[i].progress : 0));
  };
})();
