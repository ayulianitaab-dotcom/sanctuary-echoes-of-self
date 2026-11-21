/* Sanctuary — farming: till, plant, water, grow, harvest */
(function () {
  const F = (SAN.farming = {});
  const U = SAN.util;

  F.key = (areaId, x, y) => areaId + ':' + x + ',' + y;

  F.stateAt = function (plot) {
    const S = SAN.state.S;
    return S.farm.plots[F.key(plot.area, plot.x, plot.y)] || null;
  };

  F.canGrowIn = function (cropId, areaId, season) {
    if (areaId === 'greenhouse') return true;
    const c = SAN.data.crops[cropId];
    return c && c.seasons.indexOf(season) >= 0;
  };

  F.till = function (plot) {
    const S = SAN.state.S;
    if (!SAN.state.useEnergy(2)) { SAN.ui.toast('You are too tired to dig. Rest, or eat something.', 'warn'); return false; }
    S.farm.plots[F.key(plot.area, plot.x, plot.y)] = { tilled: true, watered: false, crop: null, stage: 0 };
    SAN.audio.sfx('plant');
    SAN.progression.addXp('farming', 2);
    return true;
  };

  F.plant = function (plot, seedId) {
    const S = SAN.state.S;
    const key = F.key(plot.area, plot.x, plot.y);
    let st = S.farm.plots[key];
    if (plot.area === 'greenhouse' && !S.unlocked.greenhouse_beds) {
      SAN.ui.toast('These beds are Elowen\'s for now. She might share them later.', 'info');
      return false;
    }
    if (!st || !st.tilled) {
      if (!F.till(plot)) return false;
      st = S.farm.plots[key];
    }
    const item = SAN.data.item(seedId);
    if (!item || !item.crop) return false;
    if (SAN.state.count(seedId) <= 0) { SAN.ui.toast('You have no ' + item.name + '.', 'warn'); return false; }
    const crop = SAN.data.crops[item.crop];
    if (!F.canGrowIn(crop.id, plot.area, S.time.season)) {
      SAN.ui.toast(crop.name + ' will not grow in ' + U.SEASONS[S.time.season] + ' here.', 'warn');
      return false;
    }
    if (!SAN.state.useEnergy(1)) { SAN.ui.toast('Too tired to plant.', 'warn'); return false; }
    SAN.state.removeItem(seedId, 1);
    st.crop = crop.id;
    st.stage = 0;
    st.watered = false;
    st.plantedDay = S.time.day;
    S.stats.cropsPlanted++;
    SAN.quests.notify('plant', 'any', 1);
    if (plot.area === 'greenhouse') SAN.quests.notify('plant_greenhouse', 'any', 1);
    SAN.progression.addXp('farming', 4);
    SAN.audio.sfx('plant');
    SAN.ui.toast('Planted ' + crop.name + '. Water it each day.', 'item');
    return true;
  };

  F.water = function (plot) {
    const S = SAN.state.S;
    const st = F.stateAt(plot);
    if (!st || !st.crop) return false;
    if (st.watered) { SAN.ui.toast('Already watered today.', 'info'); return false; }
    if (!SAN.state.useEnergy(1)) { SAN.ui.toast('Too tired to water.', 'warn'); return false; }
    st.watered = true;
    SAN.audio.sfx('water');
    SAN.quests.notify('water', 'any', 1);
    if (plot.area === 'greenhouse') SAN.quests.notify('water_greenhouse', 'any', 1);
    SAN.progression.addXp('farming', 2);
    return true;
  };

  F.harvest = function (plot) {
    const S = SAN.state.S;
    const st = F.stateAt(plot);
    if (!st || !st.crop) return false;
    const crop = SAN.data.crops[st.crop];
    if (st.stage < crop.days) { SAN.ui.toast(crop.name + ' is still growing. ' + (crop.days - st.stage) + ' more day(s).', 'info'); return false; }
    if (!SAN.state.useEnergy(1)) { SAN.ui.toast('Too tired to harvest.', 'warn'); return false; }
    const y = crop.yield || [1, 1];
    const qty = y[0] + Math.floor(Math.random() * (y[1] - y[0] + 1));
    SAN.state.addItem(crop.item, qty);
    S.stats.cropsHarvested += qty;
    SAN.quests.notify('harv', crop.id, qty);
    if (plot.area === 'greenhouse') SAN.quests.notify('harv_greenhouse', 'any', qty);
    SAN.progression.addXp('farming', crop.xp || 8);
    SAN.audio.sfx('harvest');
    st.crop = null; st.stage = 0; st.watered = false;
    if (SAN.scenes) SAN.scenes.showDaily('harvest', { caption: crop.name + ', ' + qty + ' in the basket.' });
    // occasional extra seed back
    if (Math.random() < 0.3) SAN.state.addItem(crop.seed, 1, { silent: true });
    SAN.progression.checkAchievements();
    return true;
  };

  F.growAll = function () {
    const S = SAN.state.S;
    Object.keys(S.farm.plots).forEach((key) => {
      const st = S.farm.plots[key];
      if (!st || !st.crop) return;
      const crop = SAN.data.crops[st.crop];
      const areaId = key.split(':')[0];
      if (!crop) return;
      const inSeason = F.canGrowIn(st.crop, areaId, S.time.season);
      const grew = !!(st.watered && inSeason && st.stage < crop.days);
      if (grew) st.stage += 1;
      st.watered = false;
      st.justGrew = grew;
    });
  };

  F.matureCount = function () {
    const S = SAN.state.S;
    let n = 0;
    Object.keys(S.farm.plots).forEach((k) => {
      const st = S.farm.plots[k];
      if (st.crop && st.stage >= SAN.data.crops[st.crop].days) n++;
    });
    return n;
  };

  F.describe = function (plot) {
    const st = F.stateAt(plot);
    if (!st) return 'Untilled soil. It has been waiting a while.';
    if (!st.crop) return 'Tilled soil, ready for a seed.';
    const crop = SAN.data.crops[st.crop];
    const left = Math.max(0, crop.days - st.stage);
    return crop.name + ' — ' + (left === 0 ? 'ready to harvest' : left + ' day(s) left') + (st.watered ? ' · watered' : ' · needs water');
  };
})();
