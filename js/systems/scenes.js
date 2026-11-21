/* Sanctuary — cinematic scenes.
   A scene is a composed frame: an illustrated location plate (generated once at
   build time, cached on disk) plus the official character artwork on top. No
   character is ever redrawn, and nothing is requested from an API while playing. */
(function () {
  const SM = (SAN.scenes = {});
  const D = () => SAN.data.scenes;
  const S = () => SAN.state.S;

  SM.active = false;
  SM.current = null;
  let layer = null;
  let closeCb = null;

  function state() {
    const s = S();
    if (!s) return null;
    if (!s.scenes) s.scenes = { seen: {}, log: [] };
    if (!s.scenes.seen) s.scenes.seen = {};
    if (!s.scenes.log) s.scenes.log = [];
    return s.scenes;
  }

  SM.ext = function () {
    const e = typeof window !== 'undefined' ? window.SAN_SCENE_EXT : '';
    return e === 'webp' ? 'webp' : 'jpg';
  };
  SM.backdropSrc = function (key) {
    const path = D().backdropPath(key, SM.ext());
    // versioned so a regenerated plate is never masked by the browser cache
    return SAN.visual && SAN.visual.url ? SAN.visual.url(path) : path;
  };

  function safeImg(src) {
    return src ? String(src).replace(/"/g, '&quot;') : '';
  }

  function playerArt() {
    if (SAN.render && SAN.render.mainAssetSrc) return SAN.render.mainAssetSrc('fullbody');
    return '';
  }
  function npcArt(id) {
    if (SAN.render && SAN.render.npcFullBodySrc) return SAN.render.npcFullBodySrc(id);
    return '';
  }
  function catArt() {
    const ext = SAN.render.assetExt ? SAN.render.assetExt() : 'png';
    return 'assets/companions/mochi/poses/idle.' + ext;
  }

  /* ---------------- building a scene from game context ---------------- */
  SM.build = function (opts) {
    const o = opts || {};
    const s = S();
    const minutes = s ? s.time.minutes : 12 * 60;
    const weather = s ? s.time.weather : 'sunny';
    const area = o.area || (s ? s.player.area : 'village');
    const cat = o.cat || 'daily';
    const frame = o.frame || {};
    const npcId = o.npc || null;
    const tint = o.tint || D().tintFor(minutes, weather);
    const backdrop = o.backdrop || D().backdropFor(area, minutes, weather, null);
    const id = o.id || D().sceneId(cat.replace(/-/g, ''), npcId, o.key || cat);
    const npc = npcId && SAN.data.npcs[npcId] ? SAN.data.npcs[npcId] : null;
    const cast = [];
    if (!o.noPlayer) cast.push({ who: 'player', side: 'left', src: playerArt(), label: (s && s.player.name) || 'You', mood: o.playerMood || 'neutral' });
    if (npc) cast.push({ who: npcId, side: 'right', src: npcArt(npcId), label: npc.name, mood: o.npcMood || 'gentle', bust: !!npc.fullBodyMissing });
    if (o.withCat) cast.push({ who: 'mochi', side: 'right', src: catArt(), label: s && s.cat ? s.cat.name : 'Mochi', mood: 'happy', small: true });
    return {
      id,
      cat,
      key: o.key || cat,
      title: o.title || frame.title || D().CATEGORIES[cat] || 'A Moment',
      caption: o.caption || frame.frame || '',
      backdrop,
      tint,
      actors: cast,
      illustrated: (D().ILLUSTRATED || {})[id] || null,
      location: (D().BACKDROPS[backdrop] || {}).name || '',
      npc: npcId,
      day: s ? s.time.day : 1,
      season: s ? s.time.season : 0,
      year: s ? s.time.year : 1,
      at: Date.now(),
    };
  };

  /* ---------------- public triggers ---------------- */
  SM.activity = function (npcId, actId) {
    const frame = D().ACTIVITY_FRAMES[actId] || { cat: 'daily', title: 'Together', frame: '' };
    const npc = SAN.data.npcs[npcId] || {};
    let caption = frame.frame;
    if (SAN.romance) {
      const line = SAN.romance.npcLine(npcId, actId);
      if (line) caption = line;
    }
    return SM.build({
      cat: frame.cat, title: frame.title, caption, npc: npcId,
      key: actId, npcMood: actId === 'kiss' || actId === 'cuddle' ? 'gentle' : 'happy',
      backdrop: actId === 'stargaze' ? 'beach_sunset' : undefined,
      tint: actId === 'stargaze' ? 'night' : undefined,
      area: npc.homeArea && (actId === 'walk' || actId === 'stargaze') ? npc.homeArea : undefined,
    });
  };

  SM.event = function (npcId, kind) {
    const frame = D().EVENT_FRAMES[kind] || { cat: 'conversations', title: 'A Moment', frame: '' };
    let caption = frame.frame;
    if (SAN.romance) {
      const lines = SAN.romance.eventLines(npcId, kind);
      if (lines && lines.length) caption = lines[0];
    }
    const npc = SAN.data.npcs[npcId] || {};
    return SM.build({
      cat: frame.cat, title: frame.title, caption, npc: npcId, key: kind,
      npcMood: kind === 'story' ? 'serious' : kind === 'anniversary' ? 'happy' : 'gentle',
      noPlayer: kind === 'night',
    });
  };

  SM.chat = function (npcId, kind) {
    const frame = D().CHAT_FRAMES[kind] || D().CHAT_FRAMES.first;
    return SM.build({ cat: frame.cat, title: frame.title, caption: frame.frame, npc: npcId, key: 'chat-' + kind });
  };

  SM.daily = function (key, opts) {
    const frame = D().DAILY_SCENES[key] || { cat: 'daily', title: 'A Quiet Moment', frame: '' };
    const o = opts || {};
    return SM.build({
      cat: frame.cat, title: o.title || frame.title, caption: o.caption || frame.frame,
      key: 'daily-' + key, npc: o.npc || null, noPlayer: !!o.noPlayer, withCat: !!o.mochi, tint: o.tint,
    });
  };

  /* ---------------- rendering ---------------- */
  function ensureLayer() {
    if (layer && document.body.contains(layer)) return layer;
    layer = document.createElement('div');
    layer.id = 'scene-layer';
    layer.className = 'scene-layer hidden';
    layer.innerHTML = `
      <div class="scene-frame">
        <img class="scene-bg" id="scene-bg" alt="" draggable="false">
        <div class="scene-grade" id="scene-grade"></div>
        <div class="scene-vignette"></div>
        <div class="scene-cast" id="scene-cast"></div>
        <div class="scene-plate">
          <div class="scene-kicker" id="scene-kicker"></div>
          <h3 class="scene-title" id="scene-title"></h3>
          <p class="scene-caption" id="scene-caption"></p>
        </div>
        <div class="scene-controls">
          <button class="scene-btn" id="scene-replay">Replay</button>
          <button class="scene-btn" id="scene-journal">Save to journal</button>
          <button class="scene-btn primary" id="scene-skip">Skip</button>
          <button class="scene-btn primary" id="scene-next">Continue</button>
        </div>
      </div>`;
    document.body.appendChild(layer);
    layer.querySelector('#scene-skip').addEventListener('click', () => SM.close());
    layer.querySelector('#scene-next').addEventListener('click', () => SM.close());
    layer.querySelector('#scene-replay').addEventListener('click', () => { if (SM.current) SM.render(SM.current, true); });
    layer.querySelector('#scene-journal').addEventListener('click', () => SM.saveToJournal());
    return layer;
  }

  SM.render = function (spec, replay) {
    const el = ensureLayer();
    const bg = el.querySelector('#scene-bg');
    const grade = el.querySelector('#scene-grade');
    const cast = el.querySelector('#scene-cast');
    el.querySelector('#scene-kicker').textContent = (D().CATEGORIES[spec.cat] || 'Scene') + (spec.location ? ' · ' + spec.location : '');
    el.querySelector('#scene-title').textContent = spec.title;
    el.querySelector('#scene-caption').textContent = spec.caption || '';

    const full = spec.illustrated;
    bg.src = full || SM.backdropSrc(spec.backdrop);
    bg.onerror = function () { bg.classList.add('scene-bg-missing'); };
    grade.className = 'scene-grade ' + (D().TIME_TINT[spec.tint] || 'scene-tint-day') + (full ? ' scene-grade-soft' : '');

    cast.innerHTML = '';
    if (!full) {
      spec.actors.forEach((a) => {
        if (!a.src) return;
        const img = document.createElement('img');
        img.className = 'scene-actor ' + (a.side === 'left' ? 'left' : 'right') + (a.small ? ' small' : '') + (a.bust ? ' bust' : '');
        img.src = a.src;
        img.alt = a.label || '';
        img.draggable = false;
        img.onerror = function () { img.remove(); };
        cast.appendChild(img);
      });
    }
    layer.classList.remove('hidden');
    // force a reflow so the fade always starts, even when requestAnimationFrame
    // is throttled in a background window
    layer.classList.remove('open');
    void layer.offsetWidth;
    layer.classList.add('open');
    SM.active = true;
    if (!replay) {
      const st = state();
      if (st) {
        st.seen[spec.id] = st.seen[spec.id] || (S().time.season * 28 + S().time.day);
        st.log.push({ id: spec.id, cat: spec.cat, title: spec.title, caption: spec.caption, backdrop: spec.backdrop, npc: spec.npc, day: spec.day, season: spec.season, year: spec.year });
        if (st.log.length > 120) st.log.shift();
      }
    }
    SAN.audio && SAN.audio.sfx('open');
  };

  SM.show = function (spec, cb) {
    if (!spec) { if (cb) cb(); return false; }
    SM.current = spec;
    closeCb = cb || null;
    SM.render(spec, false);
    return true;
  };

  SM.showActivity = function (npcId, actId, cb) { return SM.show(SM.activity(npcId, actId), cb); };
  SM.showEvent = function (npcId, kind, cb) { return SM.show(SM.event(npcId, kind), cb); };
  SM.showChat = function (npcId, kind, cb) { return SM.show(SM.chat(npcId, kind), cb); };
  SM.showDaily = function (key, opts, cb) { return SM.show(SM.daily(key, opts), cb); };

  SM.close = function () {
    if (!layer) return;
    layer.classList.remove('open');
    SM.active = false;
    const cb = closeCb;
    closeCb = null;
    setTimeout(() => {
      if (!SM.active && layer) layer.classList.add('hidden');
      if (cb) { try { cb(); } catch (e) { console.error(e); } }
    }, 260);
  };

  /* ---------------- memory journal ---------------- */
  SM.saveToJournal = function () {
    const spec = SM.current;
    if (!spec) return;
    const s = S();
    if (s && SAN.memory && SAN.memory.add) {
      SAN.memory.add({ kind: 'scene', text: spec.title + (spec.caption ? ' — ' + spec.caption : ''), scene: spec.id });
    } else if (s) {
      s.memories = s.memories || [];
      s.memories.push({ kind: 'scene', text: spec.title, scene: spec.id, day: s.time.day });
    }
    SAN.ui && SAN.ui.toast('Saved to your memory journal.', 'save');
  };

  SM.history = function () {
    const st = state();
    return st ? st.log.slice().reverse() : [];
  };

  /* the scene gallery: one entry per logged scene, newest first */
  SM.gallery = function () {
    const seen = {};
    return SM.history().filter((e) => {
      if (seen[e.id]) return false;
      seen[e.id] = true;
      return true;
    });
  };

  /* rebuild a logged scene for replay, using current art and the saved context */
  SM.replay = function (id) {
    const entry = SM.history().find((e) => e.id === id);
    if (!entry) return false;
    const spec = SM.build({
      id: entry.id,
      cat: entry.cat,
      title: entry.title,
      caption: entry.caption,
      backdrop: entry.backdrop,
      npc: entry.npc,
    });
    return SM.show(spec);
  };
})();
