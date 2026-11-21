/* Sanctuary — central game state, inventory, customization definitions */
(function () {
  const St = (SAN.state = {});
  St.S = null;

  /* the official portrait is fixed, so the outfit table only feeds the small
     code-drawn world sprite, not a player-facing choice */
  St.OUTFITS = [
    { id: 'lavender_dress', name: 'Lavender Victorian Dress', dress: '#b8a6d4', accent: '#f7efe2', trim: '#8f7bb0' },
    { id: 'cream_dress', name: 'Cream Tea Dress', dress: '#efe4d4', accent: '#d9c8ae', trim: '#c0ad92' },
    { id: 'sage_dress', name: 'Sage Garden Dress', dress: '#9db894', accent: '#f4efe0', trim: '#7d9874' },
    { id: 'rose_dress', name: 'Dusty Rose Gown', dress: '#d9a8b8', accent: '#fbf0f4', trim: '#b8829a' },
    { id: 'midnight_dress', name: 'Midnight Blue Gown', dress: '#6f7ba8', accent: '#e8ecf8', trim: '#4f5b88' },
    { id: 'traveler_tunic', name: 'Traveler\'s Tunic', dress: '#8a7a5a', accent: '#d8c8a8', trim: '#6a5a40' },
    { id: 'sailor_blouse', name: 'Sailor Blouse', dress: '#8fb3c9', accent: '#f6f4ee', trim: '#6f93a9' },
  ];
  St.CAT_COLORS = [
    { id: 'cream', name: 'Cream', hex: '#f0dcc0' },
    { id: 'ginger', name: 'Ginger', hex: '#d99a5c' },
    { id: 'grey', name: 'Grey', hex: '#9a9aa8' },
    { id: 'charcoal', name: 'Charcoal', hex: '#4a4450' },
    { id: 'white', name: 'Snow', hex: '#f6f2ea' },
    { id: 'lilac', name: 'Lilac Grey', hex: '#b0a8c9' },
    { id: 'calico', name: 'Calico', hex: '#e8d4b8' },
  ];

  /* The official portrait is fixed artwork, so character creation asks who the
     player is instead of offering looks that would no longer change the art. */
  St.PRONOUNS = [
    { id: 'she', name: 'she / her', subject: 'she', object: 'her', possessive: 'her' },
    { id: 'he', name: 'he / him', subject: 'he', object: 'him', possessive: 'his' },
    { id: 'they', name: 'they / them', subject: 'they', object: 'them', possessive: 'their' },
  ];
  St.BACKGROUNDS = [
    {
      id: 'tide', name: 'Tidewatcher',
      blurb: 'You read the weather before you read a room.',
      carries: { sea_glass: 2 },
      intro: 'You kept a pocket of sea glass the whole way here. It is not worth much. It is worth carrying.',
    },
    {
      id: 'garden', name: 'Gardener',
      blurb: 'You have always trusted things that grow slowly.',
      carries: { seed_starflower: 2, seed_lavender: 2 },
      intro: 'There are seeds in your bag, wrapped in paper. You have not decided where they will go yet.',
    },
    {
      id: 'archive', name: 'Archivist',
      blurb: 'You keep the things other people forget to keep.',
      carries: { old_photo: 1, memory_shard: 1 },
      intro: 'You brought one photograph and one shard of something bright. You are not sure which one you came for.',
    },
  ];
  St.TEMPERAMENTS = [
    {
      id: 'gentle', name: 'Gentle',
      blurb: 'You meet the day softly. +15 maximum energy.',
      maxEnergy: 15, carries: {},
    },
    {
      id: 'curious', name: 'Curious',
      blurb: 'You arrive with questions — and a moon cookie for the road.',
      carries: { moon_cookie: 1 },
    },
    {
      id: 'steady', name: 'Steady',
      blurb: 'You came prepared. +80 coins.',
      money: 80, carries: {},
    },
  ];
  St.pronoun = function (id) {
    return St.PRONOUNS.find((p) => p.id === id) || St.PRONOUNS[0];
  };
  St.background = function (id) {
    return St.BACKGROUNDS.find((b) => b.id === id) || St.BACKGROUNDS[0];
  };
  St.temperament = function (id) {
    return St.TEMPERAMENTS.find((t) => t.id === id) || St.TEMPERAMENTS[0];
  };
  /* everything the background and temperament put in the satchel */
  St.carriedItems = function (player) {
    const totals = {};
    const add = (gift) => Object.keys(gift || {}).forEach((id) => {
      totals[id] = (totals[id] || 0) + gift[id];
    });
    add(St.background(player && player.background).carries);
    add(St.temperament(player && player.temperament).carries);
    return Object.keys(totals).map((id) => ({ id, count: totals[id] }));
  };
  St.identityLine = function (player) {
    const p = player || {};
    return [St.pronoun(p.pronoun).name, St.background(p.background).name, St.temperament(p.temperament).name].join(' · ');
  };

  St.defaultCustom = function () {
    return {
      name: 'Elara',
      gender: 'feminine',
      pronoun: 'she',
      background: 'tide',
      reason: 'fresh_start',
      temperament: 'gentle',
      hair: 'wavy',
      hairColor: '#dcc9a8',
      eyeColor: '#a58fd0',
      skinColor: '#f7e3d4',
      outfit: 'lavender_dress',
      accessory: 'flower',
    };
  };

  St.playerColors = function (c) {
    const outfit = St.OUTFITS.find((o) => o.id === c.outfit) || St.OUTFITS[0];
    return {
      hair: c.hairColor,
      hairShade: SAN.util.shade(c.hairColor, -0.2),
      skin: c.skinColor,
      skinDark: SAN.util.shade(c.skinColor, -0.15),
      eye: c.eyeColor,
      dress: outfit.dress,
      accent: outfit.accent,
      trim: outfit.trim,
      ribbon: SAN.util.mix(outfit.dress, '#ffffff', 0.45),
      accColor: SAN.util.mix(outfit.trim, '#ffffff', 0.3),
      accColor2: '#f0d98a',
      // the main character reference pairs her flower cluster with a ribbon bow
      accRibbon: true,
    };
  };

  St.newGame = function (opts) {
    const custom = Object.assign(St.defaultCustom(), (opts && opts.player) || {});
    const catOpts = Object.assign({ name: 'Mochi', color: 'cream' }, (opts && opts.cat) || {});
    const catColor = St.CAT_COLORS.find((c) => c.id === catOpts.color) || St.CAT_COLORS[0];
    const background = St.background(custom.background);
    const temperament = St.temperament(custom.temperament);
    const inventory = { camera: 1, seed_lavender: 4, seed_marigold: 2, fiber: 2, bread: 1, daisy: 1 };
    St.carriedItems({ background: background.id, temperament: temperament.id }).forEach((g) => {
      inventory[g.id] = (inventory[g.id] || 0) + g.count;
    });

    const defaultSettings = {
      musicVol: 0.5, sfxVol: 0.7, ambVol: 0.5, textSpeed: 1,
      showHints: true, reduceMotion: false, autosave: true,
      privacyConsent: false, useAI: false, lang: 'en',
    };
    const savedSettings = SAN.save.loadSettings();
    const settings = Object.assign(defaultSettings, savedSettings || {}, (opts && opts.settings) || {});

    const S = {
      version: 1,
      started: false,
      slot: (opts && opts.slot) || 1,
      savedAt: 0,
      playtime: 0,
      player: {
        name: custom.name,
        gender: custom.gender,
        pronoun: St.pronoun(custom.pronoun).id,
        background: background.id,
        reason: custom.reason || 'fresh_start',
        temperament: temperament.id,
        hair: custom.hair,
        hairColor: custom.hairColor,
        eyeColor: custom.eyeColor,
        skinColor: custom.skinColor,
        outfit: custom.outfit,
        accessory: custom.accessory,
        colors: St.playerColors(custom),
        x: 10, y: 11, area: 'home', facing: 'down',
        discoveredCount: 1,
      },
      cat: {
        adopted: !!(opts && opts.cat && opts.cat.adopted !== false),
        name: catOpts.name,
        color: catColor.id,
        colorHex: catColor.hex,
        accessory: 'none',
        hunger: 80, mood: 70, trust: 10,
        state: 'follow', toy: null,
        x: 8, y: 9, area: 'home',
      },
      time: { day: 1, season: 0, year: 1, minutes: 8 * 60, weather: 'sunny', forecast: 'sunny', festivalToday: null },
      money: 320 + (temperament.money || 0),
      energy: 100 + (temperament.maxEnergy || 0),
      maxEnergy: 100 + (temperament.maxEnergy || 0),
      inventory,
      farm: { plots: {} },
      levels: {
        farming: { lvl: 1, xp: 0 },
        fishing: { lvl: 1, xp: 0 },
        crafting: { lvl: 1, xp: 0 },
        exploration: { lvl: 1, xp: 0 },
      },
      friendship: {},
      romance: {},
      scenes: { seen: {}, log: [] },
      psychology: {},
      lore: { unlocked: {}, seen: {}, flags: {}, offers: {} },
      city: { day: 0, seen: {}, cooldowns: {}, eventsToday: 0, lastMinute: -999, bonds: {}, witnessed: [] },
      memoryBook: [],
      quests: { active: {}, completed: {}, board: [], boardDay: 0, offered: {} },
      journal: [],
      memories: [],
      house: { furniture: [] },
      achievements: {},
      discovered: { home: true },
      unlocked: { meadow: false, memory_vault: false, lighthouse_key: false, greenhouse_beds: false },
      flags: {},
      settings,
      stats: {
        daysPlayed: 1, fishCaught: 0, cropsHarvested: 0, giftsGiven: 0,
        memoriesCared: 0, itemsCollected: 0, steps: 0, journalEntries: 0,
        cropsPlanted: 0, cooked: 0, crafted: 0, questsDone: 0, catPets: 0,
      },
      forage: {},
      chests: {},
      dialogueSeen: {},
      tutorial: { moved: false, interacted: false, journaled: false },
      log: [],
      catFound: [],
      photos: [],
      discoveries: {},
      world: {
        runes: [], groveOpen: false, lampLit: false,
        gifts: {}, giftDay: {}, favorDay: {}, activities: {},
        seen: {}, eventDay: 0, eventsToday: 0, lastEventMinute: -999,
        lanternNight: false, lanternDay: 0, photoChallenges: {},
      },
    };
    SAN.data.npcOrder.forEach((id) => {
      S.friendship[id] = { pts: 0, talkedDay: 0, giftsToday: 0, met: false };
    });
    St.S = S;
    return S;
  };

  St.serialize = function () {
    const S = St.S;
    const copy = JSON.parse(JSON.stringify(S));
    copy.settings = Object.assign({}, S.settings);
    return copy;
  };

  /* Saves written before the official registry can hold the old lighthouse
     keeper. Rename the key once, keep every point, memory and unlocked event,
     and never create a second NPC. Safe to run on every load. */
  St.migrateSnapshot = function (snap) {
    if (!snap || typeof snap !== 'object') return snap;
    const out = Array.isArray(snap) ? [] : {};
    Object.keys(snap).forEach((key) => {
      let value = snap[key];
      let next = key;
      if (key === 'liora') next = 'lucien';
      else if (/^liora[_-]/.test(key)) next = 'lucien' + key.slice(5);
      if (typeof value === 'string') {
        value = value.replace(/\bLiora\b/g, 'Lucien').replace(/\bliora-/g, 'lucien-');
      } else if (value && typeof value === 'object') {
        value = St.migrateSnapshot(value);
      }
      if (Object.prototype.hasOwnProperty.call(out, next)) {
        const a = out[next];
        if (typeof a === 'number' && typeof value === 'number') out[next] = Math.max(a, value);
        else if (a && value && typeof a === 'object' && typeof value === 'object') out[next] = Object.assign({}, a, value);
      } else {
        out[next] = value;
      }
    });
    return out;
  };

  St.apply = function (snap) {
    if (!snap) return null;
    snap = St.migrateSnapshot(snap);    const base = St.newGame({ player: snap.player, cat: snap.cat, settings: snap.settings, slot: snap.slot });
    const merged = Object.assign({}, base, snap);
    // deep-ish repairs
    merged.player = Object.assign({}, base.player, snap.player || {});
    // saves from before identity existed fall back to the defaults
    merged.player.pronoun = St.pronoun(merged.player.pronoun).id;
    merged.player.background = St.background(merged.player.background).id;
    merged.player.reason = merged.player.reason || 'fresh_start';
    merged.player.temperament = St.temperament(merged.player.temperament).id;
    merged.player.colors = Object.assign({}, St.playerColors(merged.player), (snap.player && snap.player.colors) || {});
    merged.time = Object.assign({}, base.time, snap.time || {});
    merged.levels = Object.assign({}, base.levels, snap.levels || {});
    merged.stats = Object.assign({}, base.stats, snap.stats || {});
    merged.unlocked = Object.assign({}, base.unlocked, snap.unlocked || {});
    merged.settings = Object.assign({}, base.settings, snap.settings || {});
    merged.farm = Object.assign({ plots: {} }, snap.farm || {});
    merged.psychology = Object.assign({}, snap.psychology || {});
    merged.city = Object.assign({ day: 0, seen: {}, cooldowns: {}, eventsToday: 0, lastMinute: -999, bonds: {}, witnessed: [] }, snap.city || {});
    merged.memoryBook = Array.isArray(snap.memoryBook) ? snap.memoryBook : [];
    merged.lore = Object.assign({ unlocked: {}, seen: {}, flags: {}, offers: {} }, snap.lore || {});
    merged.quests = Object.assign({ active: {}, completed: {}, board: [], boardDay: 0, offered: {} }, snap.quests || {});
    merged.house = Object.assign({ furniture: [] }, snap.house || {});
    merged.cat = Object.assign({}, base.cat, snap.cat || {});
    merged.cat.colorHex = merged.cat.colorHex || base.cat.colorHex;
    merged.inventory = Object.assign({}, snap.inventory || {});
    if (!merged.inventory.camera) merged.inventory.camera = 1;
    merged.discovered = Object.assign({ home: true }, snap.discovered || {});
    merged.friendship = Object.assign({}, base.friendship, snap.friendship || {});
    merged.romance = Object.assign({}, base.romance, snap.romance || {});
    merged.scenes = Object.assign({ seen: {}, log: [] }, snap.scenes || {});
    merged.journal = snap.journal || [];
    merged.memories = snap.memories || [];
    merged.achievements = snap.achievements || {};
    merged.flags = snap.flags || {};
    merged.photos = snap.photos || [];
    merged.discoveries = snap.discoveries || {};
    merged.world = Object.assign({
      runes: [], groveOpen: false, lampLit: false,
      gifts: {}, giftDay: {}, favorDay: {}, activities: {},
      seen: {}, eventDay: 0, eventsToday: 0, lastEventMinute: -999,
      lanternNight: false, lanternDay: 0, photoChallenges: {},
    }, snap.world || {});
    merged.started = true;
    merged.money = snap.money != null ? snap.money : base.money;
    merged.energy = snap.energy != null ? snap.energy : 100;
    merged.maxEnergy = snap.maxEnergy || 100;
    St.S = merged;
    return merged;
  };

  /* ---------------- inventory ---------------- */
  St.addItem = function (id, qty, opts) {
    const S = St.S;
    if (!S) return;
    if (id === 'fertilizer_note') { return; } // legacy placeholder, ignore quietly
    const n = qty || 1;
    S.inventory[id] = (S.inventory[id] || 0) + n;
    S.stats.itemsCollected += n;
    if (SAN.quests) SAN.quests.notify('collect', id, n);
    if (!(opts && opts.silent) && SAN.ui) {
      const it = SAN.data.item(id);
      SAN.ui.toast('+' + n + ' ' + it.name, 'item', SAN.render.itemIcon(id));
    }
  };
  St.count = function (id) { return (St.S && St.S.inventory[id]) || 0; };
  St.removeItem = function (id, qty) {
    const S = St.S;
    const n = qty || 1;
    if (!S.inventory[id]) return false;
    S.inventory[id] -= n;
    if (S.inventory[id] <= 0) delete S.inventory[id];
    return true;
  };
  St.hasAll = function (req) {
    return Object.keys(req || {}).every((k) => St.count(k) >= req[k]);
  };
  St.spendItems = function (req) {
    if (!St.hasAll(req)) return false;
    Object.keys(req).forEach((k) => St.removeItem(k, req[k]));
    return true;
  };
  St.earn = function (amount) {
    St.S.money += amount;
    if (SAN.audio) SAN.audio.sfx('coin');
  };
  St.spend = function (amount) {
    if (St.S.money < amount) return false;
    St.S.money -= amount;
    return true;
  };
  St.useEnergy = function (n) {
    const S = St.S;
    if (S.energy < n) return false;
    S.energy = Math.max(0, S.energy - n);
    return true;
  };
  St.restoreEnergy = function (n) {
    const S = St.S;
    S.energy = Math.min(S.maxEnergy, S.energy + n);
  };
  St.inventoryList = function () {
    const S = St.S;
    return Object.keys(S.inventory).filter((k) => S.inventory[k] > 0).map((id) => ({ id, qty: S.inventory[id], def: SAN.data.item(id) }));
  };
  St.itemsByCategory = function (cat) {
    return St.inventoryList().filter((e) => e.def.cat === cat);
  };

  St.log = function (text) {
    const S = St.S;
    S.log.unshift({ text, day: S.time.day, season: S.time.season, minutes: S.time.minutes });
    if (S.log.length > 80) S.log.pop();
  };
})();
