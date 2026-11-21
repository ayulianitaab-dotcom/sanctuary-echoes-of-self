/* Sanctuary — title screen, onboarding cinematic, character creation */
(function () {
  const SC = (SAN.screens = {});
  const U = SAN.util;
  const S = () => SAN.state.S;

  /* the nine official villagers plus the player, framed in arches around the
     centre of the scene. Names and roles come from the NPC registry, so this
     list only decides where each portrait stands and never duplicates data. */
  SC.TITLE_CAST = [
    { id: 'nyssa', wing: 'l' },
    { id: 'lucien', wing: 'l' },
    { id: 'elowen', wing: 'l' },
    { id: 'rowan', wing: 'l' },
    { id: 'mira', wing: 'r' },
    { id: 'celeste', wing: 'r' },
    { id: 'theo', wing: 'r' },
    { id: 'aria', wing: 'r' },
    { id: 'finn', wing: 'r' },
    { id: 'player', pc: true, mood: 'happy' },
  ];

  /* one answer for every label on the title screen: the arch, the note card
     and the aria-label all read their wording from here */
  SC.castInfo = function (id) {
    if (id === 'player') return { name: 'You', role: 'Newly arrived' };
    const n = SAN.data.npcs && SAN.data.npcs[id];
    if (!n) return { name: id, role: '' };
    return { name: n.name || id, role: n.title || '' };
  };

  /* how each portrait comes alive on the title screen. The moods are the
     character's own uploaded expressions — never a borrowed or invented face. */
  const TITLE_LIFE = {
    nyssa: { hover: 'gentle', idle: ['gentle', 'happy'], look: true },
    rowan: { hover: 'thinking', idle: ['thinking', 'smile'], look: true },
    celeste: { hover: 'smile', idle: ['gentle'], look: true },
    finn: { hover: 'happy', idle: ['smile'], look: true },
    theo: { hover: 'thinking', idle: ['serious'], look: true },
    elowen: { hover: 'gentle', idle: ['smile'], look: true },
    lucien: { hover: 'gentle', idle: ['serious', 'smile'], look: true },
    mira: { hover: 'happy', idle: ['smile'], look: true },
    aria: { hover: 'thinking', idle: ['serious', 'gentle'], look: true },
    player: { hover: 'thanking', idle: ['happy', 'thanking'], look: false },
  };

  /* ---------------------------------------------------------
     MOCHI — the official companion
     Every frame below is one of the uploaded full-body PNGs. Nothing
     is cut from a sheet, redrawn, recoloured or replaced with an
     emoji: the controller only ever swaps between those files.
     --------------------------------------------------------- */
  const MOCHI_ART = {
    dir: 'assets/companions/mochi/',
    expressions: {
      neutral: 'expressions/neutral.png',
      happy: 'expressions/happy.png',
      curious: 'expressions/curious.png',
      blinking: 'expressions/blinking.png',
    },
    poses: {
      idle: 'poses/idle.png',
      sleeping: 'poses/sleeping.png',
      stretching: 'poses/stretching.png',
    },
  };
  SC.mochiSrc = function (file) { return SAN.render.withAssetExt(MOCHI_ART.dir + file); };

  // keep the title light on small screens and modest devices: fewer motes and
  // petals, and less frequent idle changes, without touching the composition
  SC.titleLightMode = function () {
    const small = window.innerWidth <= 760;
    const weak = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
      (navigator.deviceMemory && navigator.deviceMemory <= 4);
    return !!(small || weak);
  };

  SC.showTitle = function () {
    SC.stopTitleLife();
    SAN.ui.titleActive = true;
    SAN.ui.closeAll();
    const hud = document.getElementById('hud');
    if (hud) hud.classList.add('hidden');
    const dock = document.getElementById('dock');
    if (dock) dock.classList.add('hidden');
    const touch = document.getElementById('touch-ui');
    if (touch) touch.classList.add('hidden');
    const el = document.getElementById('title-screen');
    el.className = '';
    el.scrollTop = 0; // character creation locks the scene scroll; start fresh
    // the painted village behind the scene. The local build asks for the PNG,
    // the published copy for the WebP of the same artwork.
    el.style.setProperty('--ts-bg-img', 'url("' + SAN.render.withAssetExt('assets/backgrounds/title-village.png') + '")');
    const L = (key, fallback) => { const v = SAN.t(key); return v && v !== key ? v : fallback; };

    const castFig = (c) => {
      const mood = c.mood || 'neutral';
      const info = SC.castInfo(c.id);
      return `
      <button type="button" class="ts-char${c.pc ? ' pc' : ''}" data-npc="${c.id}" data-base-mood="${mood}"
        aria-label="${U.esc(info.name)}${info.role ? ' — ' + U.esc(info.role) : ''}">
        <span class="ts-frame">
          <span class="ts-orn${c.pc ? ' ts-orn-pc' : ''}" aria-hidden="true">❀</span>
          <span class="ts-sway">
            <img class="ts-face" src="${SAN.render.portraitSrc(c.id, mood)}" alt="" draggable="false">
            <img class="ts-face ts-face-alt" alt="" aria-hidden="true" draggable="false">
          </span>
        </span>
        <span class="ts-tag" aria-hidden="true"><b>${U.esc(info.name)}</b><i>${U.esc(info.role)}</i></span>
      </button>`;
    };
    let wingL = '';
    let wingR = '';
    let pcFig = '';
    SC.TITLE_CAST.forEach((c) => {
      const fig = castFig(c);
      if (c.pc) pcFig = fig;
      else if (c.wing === 'l') wingL += fig;
      else wingR += fig;
    });

    el.innerHTML = `
      <div class="ts-scene" aria-hidden="true">
        <div class="ts-bg"></div>
        <div class="ts-glow"></div>
        <div class="ts-haze"></div>
      </div>
      <div class="ts-petals" aria-hidden="true"></div>
      <div class="ts-motes" aria-hidden="true"></div>

      <div class="ts-cast">
        <div class="ts-wing ts-wing-l">${wingL}</div>
        <div class="ts-pc-slot">${pcFig}</div>
        <div class="ts-wing ts-wing-r">${wingR}</div>
        <div class="ts-foreground" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="ts-table">
          <button type="button" class="mochi" id="ts-mochi" aria-label="Mochi, your companion. Pet Mochi.">
            <span class="mochi-glow" aria-hidden="true"></span>
            <span class="mochi-body" aria-hidden="true">
              <img class="mochi-sprite on" src="${SC.mochiSrc(MOCHI_ART.poses.idle)}" alt="" draggable="false">
              <img class="mochi-sprite alt" alt="" draggable="false">
            </span>
            <span class="mochi-tag" aria-hidden="true"><b>Mochi</b><i>Companion</i></span>
            <span class="mochi-spark" aria-hidden="true">✦</span>
          </button>
        </div>
      </div>

      <div class="ts-card" id="ts-card" role="dialog" aria-label="Villager" hidden>
        <button type="button" class="ts-card-close" id="ts-card-close" aria-label="Close">✕</button>
        <div class="ts-card-crest" aria-hidden="true">❀</div>
        <div class="ts-card-name"></div>
        <div class="ts-card-role"></div>
        <p class="ts-card-line"></p>
      </div>

      <div class="ts-panel">
        <div class="ts-crest" aria-hidden="true">✦ ❀ ✦</div>
        <h1 class="ts-logo" aria-label="Sanctuary: Echoes of Self">
          <span>Sanctuary:</span>
          <em>Echoes of Self</em>
        </h1>
        <p class="ts-tagline">“A little world where your heart can rest.”</p>
        <div class="ts-rule" aria-hidden="true"><i></i><b>❀</b><i></i></div>
        <nav class="ts-menu" aria-label="Main menu">
          <button type="button" class="ts-btn" id="t-new">
            <span class="ts-btn-glyph" aria-hidden="true">✿</span><span class="ts-btn-label">${L('title.newGame', 'New Game')}</span>
          </button>
          <button type="button" class="ts-btn" id="t-continue">
            <span class="ts-btn-glyph" aria-hidden="true">❧</span><span class="ts-btn-label">${L('title.continue', 'Continue')}</span>
          </button>
          <button type="button" class="ts-btn" id="t-settings">
            <span class="ts-btn-glyph" aria-hidden="true">✾</span><span class="ts-btn-label">${L('title.settings', 'Settings')}</span>
          </button>
          <button type="button" class="ts-btn" id="t-credits">
            <span class="ts-btn-glyph" aria-hidden="true">❦</span><span class="ts-btn-label">${L('title.credits', 'Credits')}</span>
          </button>
        </nav>
        <div class="ts-foot">${L('title.foot', 'WASD move · E interact · ESC pause · plays fully offline')}</div>
      </div>`;

    const light = SC.titleLightMode();
    el.classList.toggle('life-light', light);

    // ambient petal layer: decorative only, identities and layout untouched
    const petalLayer = el.querySelector('.ts-petals');
    const petalCount = light ? 10 : 18;
    for (let i = 0; i < petalCount; i++) {
      const petal = document.createElement('i');
      petal.className = 'ts-petal';
      petal.style.setProperty('--x', ((i * 37) % 100) + '%');
      petal.style.setProperty('--d', (11 + (i % 7) * 2.3).toFixed(1) + 's');
      petal.style.setProperty('--delay', (-(i * 1.7) % 17).toFixed(1) + 's');
      petal.style.setProperty('--s', (7 + (i % 4) * 2) + 'px');
      petalLayer.appendChild(petal);
    }

    // floating motes of light: pure CSS dots, no extra artwork
    const moteLayer = el.querySelector('.ts-motes');
    const moteCount = light ? 7 : 16;
    for (let i = 0; i < moteCount; i++) {
      const mote = document.createElement('i');
      mote.className = 'ts-mote';
      mote.style.setProperty('--x', (6 + (i * 61) % 88) + '%');
      mote.style.setProperty('--s', (4 + (i % 3) * 2) + 'px');
      mote.style.setProperty('--d', (12 + (i % 5) * 3.4).toFixed(1) + 's');
      mote.style.setProperty('--delay', (-(i * 2.3) % 18).toFixed(1) + 's');
      mote.style.setProperty('--dx', ((i % 2 ? 1 : -1) * (12 + (i % 4) * 9)) + 'px');
      moteLayer.appendChild(mote);
    }

    SAN.audio.init();
    SAN.audio.playMusic('title');
    SAN.audio.ambient('birds');

    el.querySelector('#t-new').addEventListener('click', () => { SAN.audio.sfx('open'); SC.showCustomizer(); });

    el.querySelector('#t-continue').addEventListener('click', () => {
      const meta = SAN.save.slotMeta().filter((m) => !m.empty).sort((a, b) => b.savedAt - a.savedAt)[0];
      if (!meta) {
        SAN.audio.sfx('close');
        SAN.ui.toast('No saved journey yet — start a new one.', 'info');
        const fresh = el.querySelector('#t-new');
        fresh.classList.remove('nudge');
        void fresh.offsetWidth;
        fresh.classList.add('nudge');
        return;
      }
      SC.loadSlot(meta.slot);
    });

    el.querySelector('#t-settings').addEventListener('click', () => { SAN.audio.sfx('click'); SC.showTitleSettings(); });

    SC.initTitleLife(el);

    // Credits reuses the existing About screen and its return behaviour
    el.querySelector('#t-credits').addEventListener('click', () => {
      SAN.audio.sfx('open');
      SAN.ui.panelStack = [];
      SAN.ui.titleActive = false;
      SAN.ui.PANELS.about();
      SAN.ui.titleActive = true;
      // the title overlay sits above the normal panel layer; credits must stay readable
      SAN.ui.panelLayer.classList.add('above-title');
    });
  };

  /* ---------------------------------------------------------
     LIVING TITLE SCREEN
     The uploaded artwork is never redrawn or replaced: life is
     added around each official portrait — a slow breath, a head
     sway, a breath of light over the hair, a simulated blink,
     expression swaps using that character's own moods, and a
     small turn toward a neighbour. Everything stops under
     prefers-reduced-motion or the in-game Reduce Motion setting.
     --------------------------------------------------------- */
  SC.titleInfo = function (id) {
    if (id === 'player') {
      const me = SC.castInfo('player');
      return {
        name: me.name,
        role: me.role,
        line: 'A traveller who came to rest. Sanctuary has been keeping a light on for you.',
      };
    }
    const n = SAN.data.npcs && SAN.data.npcs[id];
    if (!n) return null;
    const info = SC.castInfo(id);
    const bio = String(n.bio || '');
    const stop = bio.indexOf('. ');
    return { name: info.name, role: info.role, line: stop > 0 ? bio.slice(0, stop + 1) : bio };
  };

  SC.stopTitleLife = function () {
    const fx = SC._titleFx;
    if (!fx) return;
    if (fx.tick) clearTimeout(fx.tick);
    if (fx.blink) clearTimeout(fx.blink);
    if (fx.raf) cancelAnimationFrame(fx.raf);
    if (fx.detach) fx.detach();
    SC._titleFx = null;
  };

  SC.initTitleLife = function (el) {
    const fx = (SC._titleFx = {});
    const reduce = () => (
      document.body.classList.contains('reduce-motion') ||
      (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    );
    const figs = Array.prototype.slice.call(el.querySelectorAll('.ts-char[data-npc]'));
    const card = el.querySelector('#ts-card');
    if (!card) return;
    const light = SC.titleLightMode();

    // Settings and Character Creation cover the scene: hold the idle life and
    // its timers until the modal is gone, then carry on where it left off.
    const paused = () => !!el.querySelector('.title-modal') || el.classList.contains('title-subpanel');
    const syncPause = () => el.classList.toggle('life-paused', paused());
    const observer = new MutationObserver((records) => {
      for (let i = 0; i < records.length; i++) {
        if (records[i].type === 'childList' || records[i].target === el) { syncPause(); return; }
      }
    });
    observer.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    syncPause();

    // swap between the two stacked faces so expressions cross-fade
    const paint = (fig, mood) => {
      const id = fig.dataset.npc;
      const base = fig.querySelector('.ts-face');
      const alt = fig.querySelector('.ts-face-alt');
      if (!id || !mood || !base || !alt) return;
      const src = SAN.render.portraitSrc(id, mood);
      if (!src) return;
      if (base.getAttribute('src') === src) { alt.classList.remove('on'); return; }
      if (alt.getAttribute('src') !== src) alt.setAttribute('src', src);
      alt.classList.add('on');
    };

    const look = (fig, dir) => {
      fig.classList.toggle('look-left', dir === 'left');
      fig.classList.toggle('look-right', dir === 'right');
    };

    const clearOpen = () => Array.prototype.forEach.call(
      el.querySelectorAll('.ts-char.card-open'), (f) => f.classList.remove('card-open')
    );
    const closeCard = () => {
      card.classList.remove('on', 'below');
      card.hidden = true;
      clearOpen();
    };

    // a short note about the villager — never starts a dialogue
    const openCard = (fig) => {
      const info = SC.titleInfo(fig.dataset.npc);
      if (!info) return;
      clearOpen();
      fig.classList.add('card-open');
      card.querySelector('.ts-card-name').textContent = info.name;
      card.querySelector('.ts-card-role').textContent = info.role;
      card.querySelector('.ts-card-line').textContent = info.line;
      card.hidden = false;
      const r = fig.getBoundingClientRect();
      const half = Math.min(300, window.innerWidth * 0.82) / 2;
      const x = Math.max(half + 12, Math.min(window.innerWidth - half - 12, r.left + r.width / 2));
      const above = r.top > 220;
      card.classList.toggle('below', !above);
      card.style.left = Math.round(x) + 'px';
      card.style.top = Math.round(above ? r.top - 10 : r.bottom + 10) + 'px';
      card.classList.add('on');
      SAN.audio.sfx('click');
    };

    figs.forEach((fig) => {
      const life = TITLE_LIFE[fig.dataset.npc] || {};
      const base = fig.dataset.baseMood || 'neutral';
      const enter = () => {
        fig.classList.add('lit');
        paint(fig, life.hover || base);
      };
      const leave = () => {
        fig.classList.remove('lit');
        paint(fig, base);
      };
      fig.addEventListener('mouseenter', enter);
      fig.addEventListener('focus', enter);
      fig.addEventListener('mouseleave', leave);
      fig.addEventListener('blur', leave);
      fig.addEventListener('click', () => openCard(fig));
    });

    const closeBtn = card.querySelector('.ts-card-close');
    closeBtn.addEventListener('click', closeCard);
    const onKey = (e) => { if (e.key === 'Escape') closeCard(); };
    const onDocClick = (e) => {
      if (!card.classList.contains('on')) return;
      const t = e.target;
      if (t && t.closest && (t.closest('.ts-card') || t.closest('.ts-char'))) return;
      closeCard();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onDocClick);

    // occasional expression changes and a glance toward a neighbour
    const scheduleIdle = () => {
      fx.tick = setTimeout(() => {
        if (!el.isConnected) { fx.tick = 0; return; }
        if (!reduce() && !paused() && !document.hidden && SAN.ui.titleActive) {
          const free = figs.filter((f) => !f.classList.contains('lit'));
          const fig = free.length ? free[Math.floor(Math.random() * free.length)] : null;
          if (fig) {
            const life = TITLE_LIFE[fig.dataset.npc] || {};
            const moods = life.idle || [];
            if (moods.length) {
              paint(fig, moods[Math.floor(Math.random() * moods.length)]);
              setTimeout(() => {
                if (fig.isConnected && !fig.classList.contains('lit')) paint(fig, fig.dataset.baseMood || 'neutral');
              }, 1900 + Math.random() * 1700);
            }
            // turn toward whichever neighbour is actually closest
            if (life.look && Math.random() < 0.55) {
              const here = fig.getBoundingClientRect();
              let nearest = null;
              let best = Infinity;
              figs.forEach((other) => {
                if (other === fig) return;
                const q = other.getBoundingClientRect();
                const d = Math.abs(q.left - here.left) + Math.abs(q.top - here.top);
                if (d < best) { best = d; nearest = q; }
              });
              const dir = nearest && nearest.left + nearest.width / 2 < here.left + here.width / 2 ? 'left' : 'right';
              look(fig, dir);
              setTimeout(() => { if (fig.isConnected) look(fig, 'none'); }, 1300 + Math.random() * 1000);
            }
          }
        }
        scheduleIdle();
      }, light ? 2600 + Math.random() * 2800 : 1500 + Math.random() * 2200);
    };

    // the still busts blink through a very short, very small squash
    const scheduleBlink = () => {
      fx.blink = setTimeout(() => {
        if (!el.isConnected) { fx.blink = 0; return; }
        if (!reduce() && !paused() && !document.hidden) {
          const fig = figs[Math.floor(Math.random() * figs.length)];
          const sway = fig && fig.querySelector('.ts-sway');
          if (sway) {
            sway.classList.add('blink');
            setTimeout(() => sway.classList.remove('blink'), 250);
          }
        }
        scheduleBlink();
      }, light ? 3200 + Math.random() * 4200 : 1500 + Math.random() * 2600);
    };

    // Mochi keeps the table corner: expressions, poses and a small hello
    const mochi = SC.initMochi(el, { paused: paused, reduceMotion: reduce });

    // very subtle parallax: the scene drifts against the pointer
    let px = 0;
    let py = 0;
    let queued = false;
    const applyParallax = () => {
      queued = false;
      el.style.setProperty('--px', px.toFixed(3));
      el.style.setProperty('--py', py.toFixed(3));
    };
    const onMove = (e) => {
      if (reduce() || paused()) return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      px = U.clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1);
      py = U.clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1);
      mochi.proximity(e.clientX, e.clientY);
      mochi.touch();
      if (!queued) { queued = true; fx.raf = requestAnimationFrame(applyParallax); }
    };
    const onLeaveScene = () => { px = 0; py = 0; applyParallax(); };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeaveScene);

    fx.detach = () => {
      observer.disconnect();
      closeBtn.removeEventListener('click', closeCard);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onDocClick);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeaveScene);
      mochi.dispose();
    };

    scheduleIdle();
    scheduleBlink();
  };

  /* ---------------------------------------------------------
     Mochi's behaviour: sits and breathes, blinks now and then,
     stretches after a while, dozes when nothing happens, grows
     curious when the pointer comes near, and is happy when petted.
     One action at a time, and every timer lives here so leaving the
     title screen leaves nothing running behind.
     --------------------------------------------------------- */
  SC.initMochi = function (el, opts) {
    const root = el.querySelector('#ts-mochi');
    const sprites = root ? Array.prototype.slice.call(root.querySelectorAll('.mochi-sprite')) : [];
    if (!root || sprites.length < 2) {
      return { proximity: function () {}, touch: function () {}, dispose: function () {} };
    }
    const o = opts || {};
    const paused = o.paused || function () { return false; };
    const reduce = o.reduceMotion || function () {
      return document.body.classList.contains('reduce-motion') ||
        (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };

    const SRC = {};
    Object.keys(MOCHI_ART.expressions).forEach((k) => { SRC[k] = SC.mochiSrc(MOCHI_ART.expressions[k]); });
    Object.keys(MOCHI_ART.poses).forEach((k) => { SRC[k] = SC.mochiSrc(MOCHI_ART.poses[k]); });
    // decode each file once so a swap cross-fades instead of flashing
    Object.keys(SRC).forEach((key) => { const img = new Image(); img.decoding = 'async'; img.src = SRC[key]; });

    let front = 0;
    let pose = 'idle';
    let expr = 'neutral';
    let near = false;
    let petting = false;
    let lastPet = 0;
    let lastTouch = Date.now();
    let beatT = 0;
    let busyT = 0;

    // two stacked sprites: the dormant one takes the new frame, then fades in
    const paint = (src) => {
      const cur = sprites[front];
      const next = sprites[1 - front];
      if (cur.getAttribute('src') === src && cur.classList.contains('on')) return;
      if (next.getAttribute('src') !== src) next.setAttribute('src', src);
      next.classList.add('on');
      cur.classList.remove('on');
      front = 1 - front;
    };

    const show = () => {
      root.classList.toggle('sleeping', pose === 'sleeping');
      if (pose === 'sleeping') paint(SRC.sleeping);
      else if (pose === 'stretching') paint(SRC.stretching);
      else paint(SRC[expr] || SRC.neutral);
    };

    const wake = () => {
      lastTouch = Date.now();
      if (pose === 'sleeping') { pose = 'idle'; expr = near ? 'curious' : 'neutral'; show(); }
    };

    const settle = () => {
      petting = false;
      pose = 'idle';
      expr = near ? 'curious' : 'neutral';
      show();
    };

    const blink = () => {
      if (pose !== 'idle' || petting || near) return;
      expr = 'blinking';
      show();
      busyT = setTimeout(() => {
        if (pose === 'idle' && !petting) { expr = near ? 'curious' : 'neutral'; show(); }
      }, 160);
    };

    const stretch = () => {
      if (pose !== 'idle' || petting || near) return;
      pose = 'stretching';
      show();
      busyT = setTimeout(() => { if (pose === 'stretching') settle(); }, 2400);
    };

    const beat = () => {
      if (!el.isConnected) { beatT = 0; return; }
      if (!paused() && !document.hidden && !reduce()) {
        const quiet = Date.now() - lastTouch;
        if (pose === 'idle' && !petting && !near && quiet > 26000) {
          pose = 'sleeping';
          show();
        } else if (pose === 'idle' && !petting) {
          if (quiet > 9000 && Math.random() < 0.16) stretch();
          else if (Math.random() < 0.5) blink();
        }
      }
      beatT = setTimeout(beat, 3200 + Math.random() * 2600);
    };

    const pet = () => {
      const now = Date.now();
      wake();
      if (now - lastPet < 1400) return; // a small pause between greetings
      lastPet = now;
      petting = true;
      clearTimeout(busyT);
      pose = 'idle';
      expr = 'happy';
      show();
      root.classList.remove('pet');
      void root.offsetWidth;
      root.classList.add('pet');
      if (SAN.audio && SAN.audio.sfx) { try { SAN.audio.sfx('purr'); } catch (err) { } }
      busyT = setTimeout(() => { root.classList.remove('pet'); settle(); }, 1600);
    };

    const onFocus = () => {
      near = true;
      wake();
      if (pose === 'idle' && !petting) { expr = 'curious'; show(); }
    };
    const onBlur = () => {
      near = false;
      if (pose === 'idle' && !petting) { expr = 'neutral'; show(); }
    };

    root.addEventListener('click', pet);
    root.addEventListener('focus', onFocus);
    root.addEventListener('blur', onBlur);
    show();
    beat();

    return {
      // the pointer is near enough to notice Mochi
      proximity: (x, y) => {
        const r = root.getBoundingClientRect();
        if (!r.width) return;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height * 0.62;
        const close = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) < r.width * 1.25;
        if (close === near) return;
        near = close;
        if (close) {
          wake();
          if (!petting && pose === 'idle') { expr = 'curious'; show(); }
        } else if (!petting && pose === 'idle') {
          expr = 'neutral';
          show();
        }
      },
      // any movement over the title screen keeps Mochi awake
      touch: () => { lastTouch = Date.now(); },
      dispose: () => {
        clearTimeout(beatT);
        clearTimeout(busyT);
        root.removeEventListener('click', pet);
        root.removeEventListener('focus', onFocus);
        root.removeEventListener('blur', onBlur);
        root.classList.remove('pet', 'sleeping');
      },
    };
  };

  SC.showTitleSettings = function () {
    const st = SAN.save.loadSettings() || { musicVol: 0.5, sfxVol: 0.7, ambVol: 0.5, textSpeed: 1, showHints: true, reduceMotion: false, autosave: true, useAI: false };
    const el = document.getElementById('title-screen');
    const wrap = document.createElement('div');
    wrap.className = 'title-modal';
    wrap.innerHTML = `<h2>${SAN.t('title.settings')}</h2>
      <label class="select-row"><span>${SAN.t('lang.label')}</span><select id="ts-lang">
        ${SAN.i18n.LANGS.map((l) => `<option value="${l.id}" ${l.id === (st.lang || 'en') ? 'selected' : ''}>${U.esc(l.name)}</option>`).join('')}
      </select></label>
      <label class="slider-row"><span>${SAN.t('settings.music')}</span><input type="range" id="ts-music" min="0" max="1" step="0.05" value="${st.musicVol}"><b>${Math.round(st.musicVol * 100)}%</b></label>
      <label class="slider-row"><span>${SAN.t('settings.effects')}</span><input type="range" id="ts-sfx" min="0" max="1" step="0.05" value="${st.sfxVol}"><b>${Math.round(st.sfxVol * 100)}%</b></label>
      <label class="slider-row"><span>${SAN.t('settings.ambience')}</span><input type="range" id="ts-amb" min="0" max="1" step="0.05" value="${st.ambVol}"><b>${Math.round(st.ambVol * 100)}%</b></label>
      <label class="slider-row"><span>${SAN.t('settings.textSpeed')}</span><input type="range" id="ts-speed" min="0.5" max="2.5" step="0.25" value="${st.textSpeed}"><b>${st.textSpeed}×</b></label>
      <label class="toggle-row"><span>${SAN.t('settings.reduceMotion')}</span><input type="checkbox" id="ts-motion" ${st.reduceMotion ? 'checked' : ''}></label>
      <p class="fineprint">All audio is generated in the browser. No files are downloaded.</p>
      <button class="title-btn" id="ts-close">Back</button>`;
    el.appendChild(wrap);
    const save = () => { SAN.save.saveSettings(st); SAN.audio.applySettings(st); document.body.classList.toggle('reduce-motion', !!st.reduceMotion); };
    const bind = (id, key, cb) => {
      const input = wrap.querySelector('#' + id);
      input.addEventListener('input', () => {
        st[key] = input.type === 'checkbox' ? input.checked : parseFloat(input.value);
        if (input.type === 'range') input.parentElement.querySelector('b').textContent = (key === 'textSpeed' ? st[key] + '×' : Math.round(st[key] * 100) + '%');
        save();
      });
    };
    bind('ts-music', 'musicVol'); bind('ts-sfx', 'sfxVol'); bind('ts-amb', 'ambVol'); bind('ts-speed', 'textSpeed'); bind('ts-motion', 'reduceMotion');
    const langSel = wrap.querySelector('#ts-lang');
    if (langSel) langSel.addEventListener('change', () => {
      st.lang = SAN.i18n.set(langSel.value);
      save();
      wrap.remove();
      el.classList.remove('title-subpanel');
      SC.showTitle();
      SC.showTitleSettings();
    });
    wrap.querySelector('#ts-close').addEventListener('click', () => { wrap.remove(); });
  };

  /* ---------------- character creation ----------------
     The official Main Character artwork is never redrawn or re-coloured:
     the left column only frames it. Everything the player picks is written
     into the same `custom` object SAN.state.newGame() already consumes, so
     inventory, energy, money, save slots and the intro are untouched. */

  // small line-drawn emblems for the choices — no artwork files, no emoji
  const CC_ICONS = {
    tide: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.6 14.4c2.1-2.1 4.2-2.1 6.3 0s4.2 2.1 6.3 0 4.2-2.1 6.2-.8"/><path d="M2.6 18.4c2.1-2.1 4.2-2.1 6.3 0s4.2 2.1 6.3 0 4.2-2.1 6.2-.8"/><path d="M12 3.1c2.4 2.3 3.6 4.2 3.6 5.8a3.6 3.6 0 0 1-7.2 0c0-1.6 1.2-3.5 3.6-5.8z"/></svg>',
    garden: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21v-8.4"/><path d="M12 12.6C8.7 12.6 6.4 10.8 6.4 7.8c3.4 0 5.6 1.9 5.6 4.8z"/><path d="M12 12.6c3.3 0 5.6-1.8 5.6-4.8-3.4 0-5.6 1.9-5.6 4.8z"/><path d="M8.2 21h7.6"/></svg>',
    archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.6h5.9A2.9 2.9 0 0 1 12.8 8.5v10.4a2.4 2.4 0 0 0-2.4-2H4z"/><path d="M20 5.6h-5.9a2.9 2.9 0 0 0-2.9 2.9v10.4a2.4 2.4 0 0 1 2.4-2H20z"/></svg>',
    gentle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.2s-7.1-4.2-7.1-9.1A3.8 3.8 0 0 1 12 8.3a3.8 3.8 0 0 1 7.1 2.8c0 4.9-7.1 9.1-7.1 9.1z"/></svg>',
    curious: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.4l2.2 5.3 5.6.5-4.3 3.8 1.3 5.6L12 15.7l-4.8 2.9 1.3-5.6-4.3-3.8 5.6-.5z"/></svg>',
    steady: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.4l7 2.6v5.5c0 4.5-3.4 7.7-7 8.9-3.6-1.2-7-4.4-7-8.9V6z"/><path d="M9 11.9l2.2 2.2 4-4.2"/></svg>',
  };

  const CC_FLOURISH = '<svg class="cc-flourish" viewBox="0 0 180 14" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">' +
    '<path d="M2 7h58"/><path d="M120 7h58"/>' +
    '<path d="M66 7c5-4 10-4 14 0-4 4-9 4-14 0z"/><path d="M114 7c-5-4-10-4-14 0 4 4 9 4 14 0z"/>' +
    '<path d="M90 2.4l1.9 3.2 3.3 1.4-3.3 1.8L90 11.9l-1.9-3.1-3.3-1.8 3.3-1.4z"/></svg>';

  SC.showCustomizer = function () {
    const el = document.getElementById('title-screen');
    const custom = SAN.state.defaultCustom();
    el.classList.add('title-subpanel', 'cc-open');
    el.scrollTop = 0;

    const wrap = document.createElement('div');
    wrap.className = 'cc-scene';
    wrap.innerHTML = `
      <div class="cc-veil" aria-hidden="true"></div>
      <div class="cc-panel" role="dialog" aria-modal="true" aria-labelledby="cc-heading">
        <header class="cc-head">
          <p class="cc-kicker">Sanctuary &middot; Echoes of Self</p>
          <h2 class="cc-title" id="cc-heading">Who are you, when no one needs anything from you?</h2>
          <p class="cc-sub">Your name and pronouns can change later at the wardrobe. What you carried and how you meet the day stay with you.</p>
          ${CC_FLOURISH}
        </header>
        <div class="cc-body">
          <aside class="cc-preview" aria-label="Your character">
            <div class="cc-frame">
              <span class="cc-orn a" aria-hidden="true">❀</span>
              <span class="cc-orn b" aria-hidden="true">❀</span>
              <div class="cc-portrait" id="creator-portrait"></div>
              <div class="cc-plate">
                <div class="cc-name" id="creator-name-display">Elara</div>
                <div class="cc-role" id="creator-identity"></div>
              </div>
            </div>
            <div class="cc-side">
              <div class="cc-summary" aria-live="polite">
                <span class="cc-sum"><i>Pronouns</i><b id="cc-sum-pronoun"></b></span>
                <span class="cc-sum"><i>Carried</i><b id="cc-sum-background"></b></span>
                <span class="cc-sum"><i>Temperament</i><b id="cc-sum-temperament"></b></span>
                <span class="cc-sum"><i>Why you came</i><b id="cc-sum-reason"></b></span>
              </div>
              <p class="cc-carried" id="cc-carried"></p>
            </div>
          </aside>
          <div class="cc-form">
            <section class="cc-section" aria-labelledby="cc-sec-identity">
              <div class="cc-sec-head">
                <span class="cc-sec-num" aria-hidden="true">I</span>
                <h3 id="cc-sec-identity">Your Identity</h3>
                <span class="cc-sec-rule" aria-hidden="true"></span>
              </div>
              <label class="cc-label" for="cr-name">Character name</label>
              <input class="cc-input" id="cr-name" maxlength="16" autocomplete="off" spellcheck="false" value="${U.esc(custom.name)}">
              <p class="cc-error" id="cc-name-error" role="alert" hidden>Please give your character a name.</p>
              <div class="cc-label-row">
                <span class="cc-label">Pronouns</span>
                <span class="cc-label-note">how the village will speak of you</span>
              </div>
              <div class="cc-pills" id="cr-pronoun" role="group" aria-label="Pronouns"></div>
            </section>
            <section class="cc-section" aria-labelledby="cc-sec-background">
              <div class="cc-sec-head">
                <span class="cc-sec-num" aria-hidden="true">II</span>
                <h3 id="cc-sec-background">What You Carried Here</h3>
                <span class="cc-sec-rule" aria-hidden="true"></span>
              </div>
              <div class="cc-cards" id="cr-background" role="group" aria-label="What you carried here"></div>
            </section>
            <section class="cc-section" aria-labelledby="cc-sec-temperament">
              <div class="cc-sec-head">
                <span class="cc-sec-num" aria-hidden="true">III</span>
                <h3 id="cc-sec-temperament">How You Meet the Day</h3>
                <span class="cc-sec-rule" aria-hidden="true"></span>
              </div>
              <div class="cc-cards" id="cr-temperament" role="group" aria-label="How you meet the day"></div>
            </section>
            <section class="cc-section" aria-labelledby="cc-sec-reason">
              <div class="cc-sec-head">
                <span class="cc-sec-num" aria-hidden="true">IV</span>
                <h3 id="cc-sec-reason">Why You Came</h3>
                <span class="cc-sec-rule" aria-hidden="true"></span>
              </div>
              <p class="cc-sub">The village will not ask you to justify it. It will notice, later, in how you talk about home.</p>
              <div class="cc-cards" id="cr-reason" role="group" aria-label="Why you came"></div>
            </section>
          </div>
        </div>
        <footer class="cc-actions">
          <button type="button" class="cc-btn cc-btn-ghost" id="cr-random">Surprise Me</button>
          <div class="cc-actions-right">
            <button type="button" class="cc-btn cc-btn-ghost" id="cr-back">Back</button>
            <button type="button" class="cc-btn cc-begin" id="cr-start">Begin</button>
          </div>
        </footer>
      </div>`;
    el.appendChild(wrap);

    const portrait = wrap.querySelector('#creator-portrait');
    const nameDisplay = wrap.querySelector('#creator-name-display');
    const identityLine = wrap.querySelector('#creator-identity');
    const nameInput = wrap.querySelector('#cr-name');
    const nameError = wrap.querySelector('#cc-name-error');
    const carriedEl = wrap.querySelector('#cc-carried');
    const sumPronoun = wrap.querySelector('#cc-sum-pronoun');
    const sumBackground = wrap.querySelector('#cc-sum-background');
    const sumTemperament = wrap.querySelector('#cc-sum-temperament');
    const sumReason = wrap.querySelector('#cc-sum-reason');

    // the official reference artwork, framed exactly as drawn
    portrait.innerHTML = SAN.render.fullBodyImg();
    const mcImg = portrait.querySelector('img');
    if (mcImg) mcImg.alt = 'The Main Character';

    const itemName = function (id) {
      const it = SAN.data.item(id);
      return it ? it.name : id;
    };
    function carriedLabel(id, count) {
      return itemName(id) + ' ×' + count;
    }
    function carriedList(gift) {
      return Object.keys(gift || {}).map(function (id) {
        return carriedLabel(id, gift[id]);
      });
    }
    function carriedPhrase(gift) {
      const parts = carriedList(gift);
      if (!parts.length) return 'nothing extra';
      if (parts.length === 1) return parts[0];
      return parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1];
    }
    // the real starting inventory of each choice, read from SAN.state
    function backgroundText(bg) {
      return bg.blurb + ' You carry ' + carriedPhrase(bg.carries) + '.';
    }

    function chipMarkup(item, key, icon) {
      const active = custom[key] === item.id ? ' active' : '';
      const desc = key === 'background' ? backgroundText(item) : item.blurb;
      return '<button type="button" class="cc-opt' + active + '" data-id="' + item.id + '"' +
        ' aria-pressed="' + (custom[key] === item.id ? 'true' : 'false') + '">' +
        '<span class="cc-opt-mark" aria-hidden="true"></span>' +
        '<span class="cc-opt-head"><span class="cc-opt-icon" aria-hidden="true">' + (CC_ICONS[icon] || '') + '</span>' +
        '<span class="cc-opt-name">' + U.esc(item.name) + '</span></span>' +
        '<span class="cc-opt-desc">' + U.esc(desc) + '</span></button>';
    }

    function renderChoices() {
      wrap.querySelector('#cr-pronoun').innerHTML = SAN.state.PRONOUNS.map(function (p) {
        return '<button type="button" class="cc-pill' + (custom.pronoun === p.id ? ' active' : '') + '"' +
          ' data-id="' + p.id + '" aria-pressed="' + (custom.pronoun === p.id ? 'true' : 'false') + '">' +
          U.esc(p.name) + '</button>';
      }).join('');
      wrap.querySelector('#cr-background').innerHTML = SAN.state.BACKGROUNDS.map(function (b) {
        return chipMarkup(b, 'background', b.id);
      }).join('');
      wrap.querySelector('#cr-temperament').innerHTML = SAN.state.TEMPERAMENTS.map(function (t) {
        return chipMarkup(t, 'temperament', t.id);
      }).join('');
      const reasons = ((SAN.data.lore || {}).REASONS || []);
      wrap.querySelector('#cr-reason').innerHTML = reasons.map(function (r) {
        return chipMarkup(r, 'reason', 'garden');
      }).join('');
    }

    function paint() {
      const pr = SAN.state.pronoun(custom.pronoun);
      const bg = SAN.state.background(custom.background);
      const temp = SAN.state.temperament(custom.temperament);
      nameDisplay.textContent = (custom.name || 'Elara').trim() || 'Elara';
      identityLine.textContent = pr.name + ' · ' + bg.name + ' · ' + temp.name;
      sumPronoun.textContent = pr.name;
      sumBackground.textContent = bg.name;
      sumTemperament.textContent = temp.name;
      const reasonList = ((SAN.data.lore || {}).REASONS || []);
      const reason = reasonList.find(function (r) { return r.id === custom.reason; }) || reasonList[0];
      if (sumReason) sumReason.textContent = reason ? reason.name : 'A fresh start';
      const all = SAN.state.carriedItems({ background: bg.id, temperament: temp.id });
      carriedEl.textContent = all.length
        ? 'In your satchel: ' + all.map(function (g) { return carriedLabel(g.id, g.count); }).join(', ') + '.'
        : 'Your satchel starts as it is.';
    }

    function chooseFrom(containerId, key) {
      wrap.querySelector(containerId).addEventListener('click', function (e) {
        const btn = e.target.closest ? e.target.closest('[data-id]') : null;
        if (!btn) return;
        if (custom[key] === btn.dataset.id) return;
        custom[key] = btn.dataset.id;
        renderChoices();
        paint();
        // the list is redrawn, so keep keyboard focus on the chosen option
        const again = wrap.querySelector(containerId + ' [data-id="' + btn.dataset.id + '"]');
        if (again) again.focus({ preventScroll: true });
        if (SAN.audio && SAN.audio.sfx) SAN.audio.sfx('click');
      });
    }
    chooseFrom('#cr-pronoun', 'pronoun');
    chooseFrom('#cr-background', 'background');
    chooseFrom('#cr-temperament', 'temperament');
    chooseFrom('#cr-reason', 'reason');

    nameInput.addEventListener('input', function () {
      custom.name = nameInput.value;
      // the preview tidies spacing exactly like Begin does, so they always agree
      nameDisplay.textContent = nameInput.value.replace(/\s+/g, ' ').trim() || 'Elara';
      if (!nameError.hidden) {
        nameError.hidden = true;
        nameInput.classList.remove('invalid');
      }
    });

    function close() {
      document.removeEventListener('keydown', onKey);
      wrap.remove();
      el.classList.remove('title-subpanel', 'cc-open');
    }
    function goBack() {
      close();
      SC.showTitle();
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.stopPropagation(); goBack(); }
    }
    document.addEventListener('keydown', onKey);

    wrap.querySelector('#cr-random').addEventListener('click', function () {
      // always lands on a different combination, name left as the player typed it
      const other = function (list, current) {
        const pool = list.filter(function (i) { return i.id !== current; });
        return U.pick(pool.length ? pool : list).id;
      };
      custom.pronoun = other(SAN.state.PRONOUNS, custom.pronoun);
      custom.background = other(SAN.state.BACKGROUNDS, custom.background);
      custom.temperament = other(SAN.state.TEMPERAMENTS, custom.temperament);
      const reasons = ((SAN.data.lore || {}).REASONS || []);
      if (reasons.length) custom.reason = other(reasons, custom.reason);
      renderChoices();
      paint();
      if (SAN.audio && SAN.audio.sfx) SAN.audio.sfx('open');
    });

    wrap.querySelector('#cr-back').addEventListener('click', goBack);

    wrap.querySelector('#cr-start').addEventListener('click', function () {
      const name = (nameInput.value || '').replace(/\s+/g, ' ').trim().slice(0, 16);
      if (!name) {
        nameError.hidden = false;
        nameInput.classList.add('invalid');
        nameInput.focus();
        if (SAN.audio && SAN.audio.sfx) SAN.audio.sfx('close');
        return;
      }
      custom.name = name;
      // the same normalisation the state layer expects
      custom.pronoun = SAN.state.pronoun(custom.pronoun).id;
      custom.background = SAN.state.background(custom.background).id;
      custom.temperament = SAN.state.temperament(custom.temperament).id;
      const reasonIds = ((SAN.data.lore || {}).REASONS || []).map(function (r) { return r.id; });
      if (reasonIds.length && reasonIds.indexOf(custom.reason) < 0) custom.reason = reasonIds[0];
      close();
      SC.beginGame(custom);
    });

    renderChoices();
    paint();
    if (window.innerWidth > 900) {
      setTimeout(function () { if (nameInput.isConnected) nameInput.focus(); }, 80);
    }
  };

  /* ---------------- new game / intro ---------------- */
  SC.beginGame = function (custom) {
    SC.stopTitleLife();
    const S_ = SAN.state.newGame({ player: custom, cat: { name: 'Mochi', color: 'cream', adopted: false }, slot: SC.pickFreeSlot() });
    const bg = SAN.state.background(custom.background);
    const pr = SAN.state.pronoun(custom.pronoun);
    const carried = SAN.state.carriedItems(custom).map((g) => {
      const it = SAN.data.item(g.id);
      return (it ? it.name : g.id) + (g.count > 1 ? ' ×' + g.count : '');
    }).join(', ');
    const reason = (SAN.data.lore && SAN.data.lore.REASONS || []).find((r) => r.id === custom.reason);
    const ledger = 'The village ledger writes you down as ' + (custom.name || 'Elara') + ' — ' + pr.name + '.' +
      (carried ? ' In your satchel: ' + carried + '.' : '') +
      (reason ? ' Why you came: ' + reason.name.toLowerCase() + '.' : '');
    S_.started = true;
    SAN.ui.titleActive = true;
    document.getElementById('title-screen').classList.add('hidden');
    SAN.audio.playMusic('emotional');
    SC.playIntro(function () {
      SAN.ui.titleActive = false;
      document.getElementById('hud').classList.remove('hidden');
      document.getElementById('dock').classList.remove('hidden');
      document.getElementById('touch-ui').classList.remove('hidden');
      SAN.world.load('home', 10, 11);
      SAN.cat.syncFromState();
      SAN.ui.refreshHUD();
      SAN.quests.start('main_arrive', true);
      SAN.audio.sfx('open');
      setTimeout(() => {
        SAN.ui.dialogue({
          pages: [
            { speaker: 'narrator', text: bg.intro },
            { speaker: 'narrator', text: ledger },
            { speaker: 'narrator', text: 'Your cottage smells of dust and rain and something older: possibility.' },
            { speaker: 'narrator', text: 'There is a key on the table with your name on it. There is a notebook on the desk. There is a village outside.' },
            { speaker: 'narrator', text: 'Nothing here is urgent. Use WASD or the arrow keys to move. Press E to interact. The village can wait.' },
          ],
          choices: [
            { label: 'Look around the cottage', cb: function () { } },
            { label: 'Step outside', cb: function () { SAN.actions.enterArea('village', 14, 16); } },
          ],
          onClose: function () {
            setTimeout(() => SAN.actions.catAdoptScene(), 900);
          },
        });
      }, 500);
      SAN.save.autosave(true);
    });
  };

  SC.pickFreeSlot = function () {
    const meta = SAN.save.slotMeta();
    const empty = meta.find((m) => m.empty);
    return empty ? empty.slot : 1;
  };

  SC.playIntro = function (done) {
    const el = document.getElementById('title-screen');
    el.classList.remove('hidden');
    el.className = 'intro-screen';
    const pages = [
      { t: 'There is a place where the road simply stops being in a hurry.', s: '' },
      { t: 'People here keep small lights on for each other. They plant things and then wait, which is the whole philosophy.', s: '' },
      { t: 'You have come with a suitcase of things you have not said out loud.', s: '' },
      { t: 'The village is called Sanctuary. It is not a cure. It is somewhere to put your bags down.', s: '' },
    ];
    let i = 0;
    el.innerHTML = `<div class="intro-vignette">
      <div class="intro-veil"></div>
      <div class="intro-text" id="intro-text"></div>
      <button class="intro-skip" id="intro-skip">Skip intro</button>
      <div class="intro-progress" id="intro-progress">${pages.map(() => '<i></i>').join('')}</div>
    </div>`;
    const textEl = el.querySelector('#intro-text');
    const prog = el.querySelector('#intro-progress');
    const advance = (force) => {
      if (i >= pages.length) return finish();
      const p = pages[i];
      textEl.classList.remove('in');
      setTimeout(() => {
        textEl.textContent = p.t;
        textEl.classList.add('in');
        Array.from(prog.children).forEach((c, idx) => c.classList.toggle('on', idx <= i));
        i++;
      }, 260);
    };
    function finish() {
      clearInterval(timer);
      el.className = 'hidden';
      el.innerHTML = '';
      done();
    }
    let timer = setInterval(() => {
      if (i > pages.length) return finish();
      advance();
    }, 3600);
    advance();
    el.querySelector('#intro-skip').addEventListener('click', finish);
  };

  SC.loadSlot = function (slot) {
    SC.stopTitleLife();
    const snap = SAN.save.read(slot);
    if (!snap) { SAN.ui.toast('That slot is empty.', 'warn'); return; }
    SAN.state.apply(snap);
    const S_ = S();
    S_.started = true;
    SAN.ui.titleActive = false;
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('title-screen').innerHTML = '';
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('dock').classList.remove('hidden');
    document.getElementById('touch-ui').classList.remove('hidden');
    SAN.world.load(S_.player.area || 'home', S_.player.x, S_.player.y);
    SAN.cat.syncFromState();
    SAN.save.autosaveEnabled = S_.settings.autosave;
    SAN.ui.applySettings();
    SAN.ui.refreshHUD();
    SAN.quests.refreshBoard();
    SAN.ui.toast('Welcome back, ' + S_.player.name + '.', 'save');
    if (S_.time.festivalToday) {
      const ev = SAN.data.events.find((e) => e.id === S_.time.festivalToday);
      if (ev) SAN.ui.toast('Today: ' + ev.name, 'festival');
    }
  };
})();
