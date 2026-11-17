/* Sanctuary — levels, unlocks, achievements */
(function () {
  const P = (SAN.progression = {});
  const THRESHOLDS = [0, 60, 170, 330, 560, 880, 1300, 1850, 2500, 3300, 4300];

  P.levelFromXp = function (xp) {
    let lvl = 1;
    for (let i = 1; i < THRESHOLDS.length; i++) if (xp >= THRESHOLDS[i]) lvl = i + 1;
    return Math.min(10, lvl);
  };
  P.xpForNext = function (xp) {
    for (let i = 0; i < THRESHOLDS.length; i++) if (xp < THRESHOLDS[i]) return THRESHOLDS[i];
    return THRESHOLDS[THRESHOLDS.length - 1];
  };

  P.addXp = function (kind, amount) {
    const S = SAN.state.S;
    if (!S) return;
    const rec = S.levels[kind];
    if (!rec) return;
    const before = P.levelFromXp(rec.xp);
    rec.xp += amount;
    const after = P.levelFromXp(rec.xp);
    rec.lvl = after;
    if (after > before) {
      SAN.audio.sfx('achieve');
      const names = { farming: 'Farming', fishing: 'Fishing', crafting: 'Crafting', exploration: 'Exploration' };
      SAN.ui.toast(names[kind] + ' reached level ' + after + '!', 'level');
      P.checkUnlocks(kind, after);
    }
  };

  P.checkUnlocks = function (kind, lvl) {
    const S = SAN.state.S;
    if (!S) return;
    if (kind === 'exploration' && lvl >= 3 && !S.unlocked.meadow) {
      S.unlocked.meadow = true;
      SAN.ui.toast('The path to the Hidden Meadow has opened in the Memory Forest.', 'unlock');
      S.log.push({ text: 'Unlocked the Hidden Meadow.', day: S.time.day, season: S.time.season, minutes: S.time.minutes });
    }
    if (kind === 'crafting' && lvl >= 2) {
      // recipes are gated by level in the crafting UI
    }
    if (kind === 'farming' && lvl >= 2) {
      S.flags.betterSeeds = true;
    }
    if (kind === 'fishing' && lvl >= 3) {
      S.flags.deepFishing = true;
    }
  };

  P.onDiscover = function (area) {
    const S = SAN.state.S;
    const a = SAN.world.areas[area];
    P.addXp('exploration', 18);
    SAN.ui.toast('Discovered: ' + (a ? a.name : area), 'discover');
    S.stats.itemsCollected += 0;
  };

  P.ACHIEVEMENT_CHECKERS = {
    first_sunrise: () => SAN.state.S.stats.daysPlayed >= 2,
    garden_own: () => SAN.state.S.stats.cropsHarvested >= 10,
    friend_sanctuary: () => Object.values(SAN.state.S.friendship).some((f) => f.pts >= 41),
    letters_never_sent: () => !!SAN.state.S.quests.completed.lh_2,
    little_things: () => SAN.state.S.stats.memoriesCared >= 3,
    lighthouse_keeper: () => !!SAN.state.S.quests.completed.lh_3,
    trusted_hands: () => !!SAN.state.S.quests.completed.gh_3,
    quiet_mind: () => !!SAN.state.S.quests.completed.wm_3,
    angler: () => SAN.state.S.stats.fishCaught >= 15,
    decorator: () => SAN.state.S.house.furniture.length >= 8,
    archivist: () => SAN.state.S.journal.length >= 10,
    wanderer: () => ['village', 'garden', 'greenhouse', 'forest', 'beach', 'lighthouse', 'windmill', 'meadow'].every((a) => SAN.state.S.discovered[a]),
    cat_friend: () => SAN.state.S.cat.trust >= 60,
    memory_garden: () => SAN.state.S.memories.some((m) => m.progress >= 4),
  };

  P.checkAchievements = function () {
    const S = SAN.state.S;
    if (!S) return;
    SAN.data.achievements.forEach((a) => {
      if (S.achievements[a.id]) return;
      const fn = P.ACHIEVEMENT_CHECKERS[a.id];
      if (fn && fn()) P.unlock(a.id);
    });
  };

  P.unlock = function (id) {
    const S = SAN.state.S;
    if (S.achievements[id]) return;
    S.achievements[id] = { day: S.time.day, season: S.time.season, year: S.time.year };
    const a = SAN.data.achievements.find((x) => x.id === id);
    if (a) {
      SAN.ui.toast('Achievement — ' + a.name, 'achievement');
      SAN.audio.sfx('achieve');
    }
  };

  P.stats = function () {
    const S = SAN.state.S;
    return {
      exploration: { lvl: S.levels.exploration.lvl, xp: S.levels.exploration.xp, unlocked: ['The Garden', S.unlocked.meadow ? 'The Hidden Meadow' : 'Hidden meadow (locked)'] },
    };
  };
})();
