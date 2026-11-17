/* Sanctuary — save system: 3 slots, autosave, export/import, corruption guards */
(function () {
  const KEY = 'sanctuary_saves_v1';
  const SETTINGS_KEY = 'sanctuary_settings_v1';
  const S = (SAN.save = {});
  S.autosaveEnabled = true;
  let lastAutosave = 0;

  function readAll() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { slots: {} };
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || !data.slots) return { slots: {} };
      return data;
    } catch (e) {
      console.warn('Save data unreadable; keeping a backup.', e);
      try { localStorage.setItem(KEY + '_corrupt_' + Date.now(), localStorage.getItem(KEY) || ''); } catch (err) { }
      return { slots: {} };
    }
  }

  function writeAll(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Save failed', e);
      return false;
    }
  }

  S.slotMeta = function () {
    const all = readAll();
    const out = [];
    for (let i = 1; i <= 3; i++) {
      const s = all.slots[i];
      out.push(s ? {
        slot: i,
        name: s.player ? s.player.name : 'Wanderer',
        day: s.time ? s.time.day : 1,
        season: s.time ? s.time.season : 0,
        year: s.time ? s.time.year : 1,
        money: s.money || 0,
        savedAt: s.savedAt || 0,
        playtime: s.playtime || 0,
        catName: s.cat && s.cat.name,
        area: s.player && s.player.area,
      } : { slot: i, empty: true });
    }
    return out;
  };

  S.hasAny = () => S.slotMeta().some((s) => !s.empty);

  S.write = function (slot, opts) {
    const state = SAN.state && SAN.state.S;
    if (!state) return false;
    const all = readAll();
    const snap = SAN.state.serialize();
    snap.savedAt = Date.now();
    snap.slot = slot;
    all.slots[slot] = snap;
    const ok = writeAll(all);
    if (ok && !(opts && opts.silent)) {
      SAN.ui && SAN.ui.toast('Saved to slot ' + slot, 'save');
    }
    return ok;
  };

  S.read = function (slot) {
    const all = readAll();
    const snap = all.slots[slot];
    if (!snap) return null;
    return snap;
  };

  S.clear = function (slot) {
    const all = readAll();
    delete all.slots[slot];
    writeAll(all);
  };

  S.autosave = function (force) {
    if (!S.autosaveEnabled) return;
    const now = Date.now();
    if (!force && now - lastAutosave < 45000) return;
    lastAutosave = now;
    const state = SAN.state && SAN.state.S;
    if (!state || !state.started) return;
    const all = readAll();
    const snap = SAN.state.serialize();
    snap.savedAt = now;
    snap.slot = snap.slot || 1;
    all.slots[snap.slot] = snap;
    if (writeAll(all)) {
      const el = document.getElementById('autosave-indicator');
      if (el) {
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 1800);
      }
    }
  };

  S.exportData = function () {
    const snap = SAN.state.serialize();
    return JSON.stringify({ game: 'sanctuary', version: 1, exportedAt: new Date().toISOString(), save: snap }, null, 2);
  };

  S.importData = function (text) {
    let obj;
    try { obj = JSON.parse(text); } catch (e) { return { ok: false, error: 'That is not valid save data (JSON parse failed).' }; }
    const snap = obj && obj.save ? obj.save : obj;
    if (!snap || !snap.player || !snap.time) return { ok: false, error: 'Save data is missing required fields.' };
    const all = readAll();
    const slot = snap.slot || 1;
    all.slots[slot] = snap;
    if (!writeAll(all)) return { ok: false, error: 'Could not write to storage.' };
    return { ok: true, slot, snap };
  };

  // settings persist separately so volume is honoured on the title screen
  S.loadSettings = function () {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return null;
  };
  S.saveSettings = function (settings) {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) { }
  };
})();
