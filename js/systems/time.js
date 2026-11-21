/* Sanctuary — clock, day cycle, weather, festivals, sleep */
(function () {
  const TM = (SAN.time = {});
  const U = SAN.util;
  const MINUTES_PER_SECOND = 1.4;

  TM.MINUTES_PER_SECOND = MINUTES_PER_SECOND;

  TM.tick = function (dt) {
    const S = SAN.state.S;
    if (!S || SAN.ui.isPaused()) return;
    S.time.minutes += dt * MINUTES_PER_SECOND;
    S.playtime = (S.playtime || 0) + dt;
    if (S.time.minutes >= 26 * 60) {
      // 2 AM — you fall asleep where you stand
      TM.collapse();
    }
  };

  TM.phase = () => U.phase(SAN.state.S.time.minutes);

  TM.weatherRoll = function (season, day) {
    const r = Math.random();
    const tables = [
      [['sunny', 0.42], ['cloudy', 0.24], ['rain', 0.24], ['fog', 0.06], ['storm', 0.04]],
      [['sunny', 0.55], ['cloudy', 0.2], ['rain', 0.15], ['fog', 0.05], ['storm', 0.05]],
      [['sunny', 0.35], ['cloudy', 0.25], ['rain', 0.2], ['fog', 0.15], ['storm', 0.05]],
      [['cloudy', 0.3], ['snow', 0.45], ['sunny', 0.15], ['fog', 0.1]],
    ];
    const table = tables[season] || tables[0];
    let acc = 0;
    for (const [w, p] of table) { acc += p; if (r <= acc) return w; }
    return 'sunny';
  };

  TM.advanceDay = function (opts) {
    const S = SAN.state.S;
    const o = opts || {};
    S.time.day += 1;
    S.stats.daysPlayed = (S.stats.daysPlayed || 0) + 1;
    if (S.time.day > 28) {
      S.time.day = 1;
      S.time.season = (S.time.season + 1) % 4;
      if (S.time.season === 0) S.time.year += 1;
      if (SAN.ui) SAN.ui.toast('A new season settles over Sanctuary: ' + U.SEASONS[S.time.season], 'season');
    }
    S.time.minutes = 6 * 60;
    S.energy = S.maxEnergy;
    S.forage = {};
    S.chests = S.chests || {};
    S.time.weather = TM.weatherRoll(S.time.season, S.time.day);
    S.time.forecast = TM.weatherRoll(S.time.season, S.time.day);
    S.cat.giftsToday = 0;
    Object.keys(S.friendship).forEach((id) => { S.friendship[id].giftsToday = 0; });
    SAN.farming.growAll();
    SAN.quests.refreshBoard();
    if (SAN.cityLife) SAN.cityLife.tickDay();
    SAN.cat.newDay();
    S.house.fireplace = false;
    const fest = SAN.data.eventOn(S.time.season, S.time.day);
    S.time.festivalToday = fest.length ? fest[0].id : null;
    if (fest.length && SAN.ui) {
      SAN.ui.toast('Today: ' + fest[0].name + ' — ' + fest[0].bonus, 'festival');
      SAN.audio.sfx('bell');
    }
    if (SAN.progression) {
      SAN.progression.checkUnlocks();
      SAN.progression.checkAchievements();
    }
    S.tutorial.journaled = S.journal.length > 0;
    SAN.save.autosave(true);
    S.log.push({ text: 'A new day.', day: S.time.day, season: S.time.season, minutes: 360 });
    if (o.silent !== true && SAN.ui) SAN.ui.dayCard();
  };

  TM.sleep = function (silent) {
    const S = SAN.state.S;
    if (!S) return;
    SAN.audio.sfx('sleep');
    SAN.ui.fadeTo(function () {
      S.energy = S.maxEnergy;
      S.time.minutes = 6 * 60;
      SAN.time.advanceDay({ silent: true });
      S.player.area = 'home';
      S.player.x = 10; S.player.y = 11;
      SAN.world.load('home', 10, 11);
      SAN.ui.closeAll();
      SAN.ui.dayCard();
      SAN.save.autosave(true);
    });
  };

  TM.collapse = function () {
    const S = SAN.state.S;
    if (S.flags.collapsing) return;
    S.flags.collapsing = true;
    SAN.ui.toast('You fell asleep where you stood. The village carried you home.', 'info');
    SAN.ui.fadeTo(function () {
      S.energy = Math.round(S.maxEnergy * 0.7);
      S.time.minutes = 6 * 60;
      TM.advanceDay({ silent: true });
      S.player.area = 'home'; S.player.x = 10; S.player.y = 11;
      SAN.world.load('home', 10, 11);
      SAN.ui.closeAll();
      SAN.ui.dayCard();
      S.flags.collapsing = false;
    });
  };

  TM.isFestival = function (id) {
    const S = SAN.state.S;
    return S.time.festivalToday === id;
  };
  TM.todayEvent = function () {
    const S = SAN.state.S;
    return SAN.data.events.find((e) => e.id === S.time.festivalToday) || null;
  };

  TM.clockLabel = function () {
    const S = SAN.state.S;
    return U.fmtTime(S.time.minutes);
  };
  TM.dateLabel = function () {
    const S = SAN.state.S;
    return `${U.SEASONS[S.time.season]} ${S.time.day} · Year ${S.time.year}`;
  };
})();
