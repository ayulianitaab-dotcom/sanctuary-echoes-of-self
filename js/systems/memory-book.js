/* Sanctuary — the Memory Journal.
   A quiet record of things that actually happened: first meetings, first
   confessions, festivals, reconciliations, ordinary afternoons worth keeping.
   Entries store the scene illustration id so the journal can show it again
   without generating anything new. */
(function () {
  const MB = (SAN.memoryBook = {});
  const S = () => SAN.state.S;

  MB.ensure = function () {
    const s = S();
    if (!s) return null;
    if (!Array.isArray(s.memoryBook)) s.memoryBook = [];
    return s.memoryBook;
  };

  MB.add = function (entry) {
    const list = MB.ensure();
    if (!list || !entry) return null;
    const st = S().time;
    const row = {
      key: entry.key || (entry.kind + ':' + (entry.npc || '') + ':' + (entry.title || '')),
      kind: entry.kind || 'moment',
      title: entry.title || 'A moment',
      text: entry.text || '',
      npc: entry.npc || null,
      npcs: entry.npcs || null,
      scene: entry.scene || null,
      area: entry.area || (S().player ? S().player.area : null),
      day: entry.day || st.day,
      season: entry.season == null ? st.season : entry.season,
      year: st.year,
      stage: entry.stage || null,
      once: !!entry.once,
    };
    if (row.once) {
      const seen = list.some((m) => m.key === row.key);
      if (seen) return null;
    }
    list.unshift(row);
    if (list.length > 200) list.length = 200;
    return row;
  };

  MB.has = function (key) {
    const list = MB.ensure();
    return !!list && list.some((m) => m.key === key);
  };

  MB.list = function (filter) {
    const list = (MB.ensure() || []).slice();
    const f = filter || {};
    return list.filter((m) => {
      if (f.kind && m.kind !== f.kind) return false;
      if (f.npc && m.npc !== f.npc && !(m.npcs || []).includes(f.npc)) return false;
      return true;
    });
  };

  MB.forNpc = function (id) {
    return MB.list({ npc: id });
  };

  MB.count = function () {
    return (MB.ensure() || []).length;
  };

  MB.label = function (m) {
    const seasons = (SAN.util && SAN.util.SEASONS) || ['Spring', 'Summer', 'Autumn', 'Winter'];
    const s = m.season == null ? 0 : m.season;
    return seasons[s] + ' ' + m.day + ', Year ' + (m.year || 1);
  };
})();
