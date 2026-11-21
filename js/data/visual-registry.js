/* Sanctuary — Character Visual Registry (CVR)
   One authoritative map from a canonical character to the exact artwork
   files that exist in this repository. Every screen — title lineup,
   creation, dialogue, profile, relationship journal, cinematic scenes,
   memory journal — asks this registry instead of guessing a path.

   Rules:
   • a character never uses another character's body or face;
   • when a required file is missing the entry says so (bustOnly) and the
     view falls back to that character's own portrait;
   • VERSION is appended to every portrait URL so a replaced file shows up
     immediately instead of an old cached copy.
*/
(function () {
  const V = (SAN.visual = {});

  // bump whenever official artwork files change
  V.VERSION = 'cvr-2026-11-21-1';
  V.PORTRAIT_ROOT = 'assets/portraits/';
  V.MOODS = ['neutral', 'happy', 'sad', 'smile', 'serious', 'thinking', 'concerned', 'gentle', 'surprised'];

  /* a versioned URL for a local asset (data: URIs are left alone) */
  V.url = function (path) {
    if (!path) return '';
    let out = path;
    if (SAN.render && SAN.render.withAssetExt) out = SAN.render.withAssetExt(path);
    if (!/^assets\//.test(out)) return out;
    return out + (out.indexOf('?') >= 0 ? '&' : '?') + 'v=' + V.VERSION;
  };

  V.build = function () {
    const data = SAN.data || {};
    const npcs = data.npcs || {};
    const order = data.npcOrder || [];
    const official = data.OFFICIAL_ROSTER || {};
    const roster = {};

    order.forEach((id) => {
      const npc = npcs[id];
      if (!npc) return;
      const canon = official[id] || {};
      const root = V.PORTRAIT_ROOT + id + '/';
      const moods = V.MOODS.filter((m) => (npc.expressions || []).indexOf(m) >= 0);
      const expressions = {};
      moods.forEach((m) => { expressions[m] = root + m + '.png'; });
      const portrait = root + 'neutral.png';
      const fullBody = npc.fullBodyMissing ? null : root + 'fullbody.png';

      roster[id] = {
        id,
        name: npc.name,
        gender: canon.gender || npc.gender || 'unspecified',
        pronoun: canon.pronoun || npc.pronoun || 'they',
        profession: canon.profession || npc.title,
        // the official artwork this character is drawn from
        officialReference: fullBody || portrait,
        fullBody,
        portrait,
        expressions,
        dialogue: portrait,
        sceneReference: fullBody || portrait,
        bustOnly: !fullBody,
        artVersion: V.VERSION,
      };
    });

    V.roster = roster;
    return roster;
  };

  V.get = function (id) {
    if (!V.roster) V.build();
    return V.roster[id] || null;
  };

  V.all = function () {
    if (!V.roster) V.build();
    return Object.keys(V.roster).map((id) => V.roster[id]);
  };

  /* the image a view should use, already versioned */
  V.imageFor = function (id, kind, mood) {
    const e = V.get(id);
    if (!e) return '';
    const m = mood && e.expressions[mood] ? e.expressions[mood] : e.portrait;
    if (kind === 'fullbody') return V.url(e.fullBody || e.portrait);
    if (kind === 'scene') return V.url(e.sceneReference);
    if (kind === 'dialogue') return V.url(m);
    return V.url(m);
  };

  /* problems this registry can see without touching the disk */
  V.validate = function () {
    let problems = [];
    const list = V.all();
    if (list.length !== 9) problems.push('visual registry has ' + list.length + ' characters, expected 9');
    list.forEach((e) => {
      if (!e.portrait) problems.push(e.id + ': no portrait asset');
      if (!Object.keys(e.expressions).length) problems.push(e.id + ': no expression assets');
      if (e.bustOnly) problems.push(e.id + ': official full-body artwork is missing (bust fallback active)');
      if (e.gender !== 'male' && e.gender !== 'female') problems.push(e.id + ': canonical gender missing');
    });
    if (SAN.data.validateRoster) problems = problems.concat(SAN.data.validateRoster());
    return problems;
  };
})();
