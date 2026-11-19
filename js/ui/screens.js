/* Sanctuary — title screen, onboarding cinematic, character creation */
(function () {
  const SC = (SAN.screens = {});
  const U = SAN.util;
  const S = () => SAN.state.S;

  /* the nine official villagers plus the player, placed around the tea table.
     portraits come from the approved assets so identities never change. */
  SC.TITLE_CAST = [
    { id: 'nyssa', name: 'Nyssa', pos: 1 },
    { id: 'rowan', name: 'Rowan', pos: 2 },
    { id: 'celeste', name: 'Celeste', pos: 3 },
    { id: 'finn', name: 'Finn', pos: 4 },
    { id: 'theo', name: 'Theo', pos: 5 },
    { id: 'elowen', name: 'Elowen', pos: 6 },
    { id: 'liora', name: 'Liora', pos: 7 },
    { id: 'mira', name: 'Mira', pos: 8 },
    { id: 'aria', name: 'Aria', pos: 9 },
    { id: 'player', name: 'You', pos: 10, pc: true, mood: 'happy' },
  ];

  /* how each portrait comes alive on the title screen. The moods are the
     character's own uploaded expressions — never a borrowed or invented face. */
  const TITLE_LIFE = {
    nyssa: { hover: 'gentle', idle: ['gentle', 'happy'], look: true },
    rowan: { hover: 'thinking', idle: ['thinking', 'smile'], look: true },
    celeste: { hover: 'smile', idle: ['gentle'], look: true },
    finn: { hover: 'happy', idle: ['smile'], look: true },
    theo: { hover: 'thinking', idle: ['serious'], look: true },
    elowen: { hover: 'gentle', idle: ['smile'], look: true },
    liora: { hover: 'gentle', idle: ['serious', 'smile'], look: true },
    mira: { hover: 'happy', idle: ['smile'], look: true },
    aria: { hover: 'thinking', idle: ['serious', 'gentle'], look: true },
    player: { hover: 'thanking', idle: ['happy', 'thanking'], look: false },
  };

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
    // the painted village behind the scene. The local build asks for the PNG,
    // the published copy for the WebP of the same artwork.
    el.style.setProperty('--ts-bg-img', 'url("' + SAN.render.withAssetExt('assets/backgrounds/title-village.png') + '")');
    const L = (key, fallback) => { const v = SAN.t(key); return v && v !== key ? v : fallback; };

    const roleOf = (c) => (c.pc ? 'Newly arrived' : ((SAN.data.npcs[c.id] || {}).title || ''));
    const cast = SC.TITLE_CAST.map((c) => {
      const mood = c.mood || 'neutral';
      const role = roleOf(c);
      return `
      <button type="button" class="ts-char p${c.pos}${c.pc ? ' pc' : ''}" data-npc="${c.id}" data-base-mood="${mood}"
        aria-label="${U.esc(c.name)}${role ? ' — ' + U.esc(role) : ''}">
        <span class="ts-frame">
          <span class="ts-sway">
            <img class="ts-face" src="${SAN.render.portraitSrc(c.id, mood)}" alt="" draggable="false">
            <img class="ts-face ts-face-alt" alt="" aria-hidden="true" draggable="false">
          </span>
        </span>
        <span class="ts-tag" aria-hidden="true"><b>${U.esc(c.name)}</b><i>${U.esc(role)}</i></span>
      </button>`;
    }).join('');

    el.innerHTML = `
      <div class="ts-scene" aria-hidden="true">
        <div class="ts-bg"></div>
        <div class="ts-glow"></div>
        <div class="ts-haze"></div>
      </div>
      <div class="ts-petals" aria-hidden="true"></div>
      <div class="ts-motes" aria-hidden="true"></div>

      <div class="ts-cast">
        ${cast}
        <div class="ts-foreground" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="ts-table" aria-hidden="true">
          <span class="tbl-cat"><i class="ear e1"></i><i class="ear e2"></i><i class="tail"></i><i class="face"></i></span>
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
      return {
        name: 'You',
        role: 'Newly arrived',
        line: 'A traveller who came to rest. Sanctuary has been keeping a light on for you.',
      };
    }
    const n = SAN.data.npcs && SAN.data.npcs[id];
    if (!n) return null;
    const bio = String(n.bio || '');
    const stop = bio.indexOf('. ');
    return { name: n.name, role: n.title || '', line: stop > 0 ? bio.slice(0, stop + 1) : bio };
  };

  SC.stopTitleLife = function () {
    const fx = SC._titleFx;
    if (!fx) return;
    if (fx.tick) clearTimeout(fx.tick);
    if (fx.blink) clearTimeout(fx.blink);
    if (fx.cat) clearTimeout(fx.cat);
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
      fig.dataset.mood = mood;
      if (base.getAttribute('src') === src) { alt.classList.remove('on'); return; }
      if (alt.getAttribute('src') !== src) alt.setAttribute('src', src);
      alt.classList.add('on');
    };

    const look = (fig, dir) => {
      fig.classList.toggle('look-left', dir === 'left');
      fig.classList.toggle('look-right', dir === 'right');
    };

    const closeCard = () => {
      card.classList.remove('on', 'below');
      card.hidden = true;
      Array.prototype.forEach.call(el.querySelectorAll('.ts-char.card-open'), (f) => f.classList.remove('card-open'));
    };

    // a short note about the villager — never starts a dialogue
    const openCard = (fig) => {
      const info = SC.titleInfo(fig.dataset.npc);
      if (!info) return;
      Array.prototype.forEach.call(el.querySelectorAll('.ts-char.card-open'), (f) => f.classList.remove('card-open'));
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
        paint(fig, fig.dataset.baseMood || 'neutral');
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

    // the cat on the tea table: blink, tail flick, yawn
    const cat = el.querySelector('.tbl-cat');
    const scheduleCat = () => {
      fx.cat = setTimeout(() => {
        if (!el.isConnected) { fx.cat = 0; return; }
        if (cat && !reduce() && !paused() && !document.hidden) {
          const acts = ['blink', 'tail', 'yawn', 'tail', 'blink'];
          const act = acts[Math.floor(Math.random() * acts.length)];
          cat.classList.add(act);
          setTimeout(() => cat.classList.remove(act), act === 'yawn' ? 1550 : act === 'blink' ? 230 : 950);
        }
        scheduleCat();
      }, light ? 7000 + Math.random() * 6000 : 4800 + Math.random() * 5200);
    };

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
    };

    scheduleIdle();
    scheduleBlink();
    scheduleCat();
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

  /* ---------------- character creation ---------------- */
  SC.showCustomizer = function () {
    const el = document.getElementById('title-screen');
    const custom = SAN.state.defaultCustom();
    el.classList.add('title-subpanel');
    const wrap = document.createElement('div');
    wrap.className = 'title-modal wide creator';
    wrap.innerHTML = `
      <div class="creator-head">
        <h2>Who are you, when no one needs anything from you?</h2>
        <p class="fineprint">Your name and pronouns can change later at the wardrobe. What you carried and how you meet the day stay with you.</p>
      </div>
      <div class="creator-body">
        <div class="creator-preview">
          <div class="creator-portrait" id="creator-portrait"></div>
          <div class="creator-name-display" id="creator-name-display">Elara</div>
          <div class="creator-identity" id="creator-identity"></div>
        </div>
        <div class="creator-options">
          <label class="field-label">Name</label>
          <input class="text-input" id="cr-name" maxlength="16" value="${U.esc(custom.name)}">
          <label class="field-label">Pronouns</label>
          <div class="chip-row" id="cr-pronoun"></div>
          <label class="field-label">What you carried here</label>
          <div class="chip-row" id="cr-background"></div>
          <p class="fineprint" id="cr-background-note"></p>
          <label class="field-label">How you meet the day</label>
          <div class="chip-row" id="cr-temperament"></div>
          <p class="fineprint" id="cr-temperament-note"></p>
          <p class="fineprint">The portrait is the official artwork, so it stays exactly as drawn. Your name and pronouns are used in the village, and what you carried starts in your satchel.</p>
        </div>
      </div>
      <div class="creator-actions">
        <button class="btn btn-ghost" id="cr-random">Surprise me</button>
        <button class="btn btn-ghost" id="cr-back">Back</button>
        <button class="btn btn-primary" id="cr-start">Begin</button>
      </div>`;
    el.appendChild(wrap);
    const portrait = wrap.querySelector('#creator-portrait');
    const nameDisplay = wrap.querySelector('#creator-name-display');
    const identityLine = wrap.querySelector('#creator-identity');

    function carriedLabel(gift) {
      const parts = Object.keys(gift || {}).map((id) => {
        const it = SAN.data.item(id);
        return (it ? it.name : id) + (gift[id] > 1 ? ' ×' + gift[id] : '');
      });
      return parts.length ? parts.join(', ') : 'nothing extra';
    }

    function paint() {
      const pr = SAN.state.pronoun(custom.pronoun);
      const bg = SAN.state.background(custom.background);
      const temp = SAN.state.temperament(custom.temperament);
      portrait.innerHTML = SAN.render.fullBodyImg();
      nameDisplay.textContent = custom.name || 'Elara';
      identityLine.textContent = pr.name + ' · ' + bg.name + ' · ' + temp.name;
      wrap.querySelector('#cr-background-note').textContent = bg.blurb + ' You carry ' + carriedLabel(bg.carries) + '.';
      wrap.querySelector('#cr-temperament-note').textContent = temp.blurb;
    }
    function chips(containerId, list, key, labelKey) {
      const box = wrap.querySelector(containerId);
      box.innerHTML = '';
      list.forEach((item) => {
        const b = document.createElement('button');
        b.className = 'chip' + (custom[key] === item.id ? ' active' : '');
        b.textContent = item[labelKey || 'name'];
        b.addEventListener('click', () => { custom[key] = item.id; chips(containerId, list, key, labelKey); paint(); });
        box.appendChild(b);
      });
    }
    chips('#cr-pronoun', SAN.state.PRONOUNS, 'pronoun');
    chips('#cr-background', SAN.state.BACKGROUNDS, 'background');
    chips('#cr-temperament', SAN.state.TEMPERAMENTS, 'temperament');

    wrap.querySelector('#cr-name').addEventListener('input', (e) => { custom.name = e.target.value; nameDisplay.textContent = custom.name || 'Elara'; });
    wrap.querySelector('#cr-random').addEventListener('click', () => {
      custom.pronoun = U.pick(SAN.state.PRONOUNS).id;
      custom.background = U.pick(SAN.state.BACKGROUNDS).id;
      custom.temperament = U.pick(SAN.state.TEMPERAMENTS).id;
      chips('#cr-pronoun', SAN.state.PRONOUNS, 'pronoun');
      chips('#cr-background', SAN.state.BACKGROUNDS, 'background');
      chips('#cr-temperament', SAN.state.TEMPERAMENTS, 'temperament');
      paint();
    });
    wrap.querySelector('#cr-back').addEventListener('click', () => { wrap.remove(); el.classList.remove('title-subpanel'); SC.showTitle(); });
    wrap.querySelector('#cr-start').addEventListener('click', () => {
      custom.name = (wrap.querySelector('#cr-name').value || 'Elara').trim().slice(0, 16) || 'Elara';
      wrap.remove();
      el.classList.remove('title-subpanel');
      SC.beginGame(custom);
    });
    paint();
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
    const ledger = 'The village ledger writes you down as ' + (custom.name || 'Elara') + ' — ' + pr.name + '.' +
      (carried ? ' In your satchel: ' + carried + '.' : '');
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
