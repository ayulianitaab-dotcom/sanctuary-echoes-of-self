/* Sanctuary — UI core: HUD, dialogue, toasts, panels, pause, transitions */
(function () {
  const UI = (SAN.ui = {});
  const U = SAN.util;
  const S = () => SAN.state.S;

  const CHOICE_ICONS = ['✦', '❁', '❦', '✧', '❧', '✿'];
  UI.panelStack = [];
  UI.dialogueState = null;
  UI.titleActive = true;
  UI.transitioning = false;
  UI.history = [];
  let dayCardTimer = 0;

  /* ---------------- init ---------------- */
  UI.init = function () {
    UI.root = document.getElementById('ui-root');
    UI.panelLayer = document.getElementById('panel-layer');
    UI.toastLayer = document.getElementById('toasts');
    UI.dialogueLayer = document.getElementById('dialogue-layer');
    UI.fadeEl = document.getElementById('fade');
    UI.hud = document.getElementById('hud');

    document.querySelectorAll('[data-panel]').forEach((btn) => {
      btn.addEventListener('click', () => {
        SAN.audio.init(); SAN.audio.sfx('click');
        const p = btn.getAttribute('data-panel');
        if (p === 'pause') UI.togglePause();
        else UI.openPanel(p);
      });
    });
    const pauseBtn = document.getElementById('btn-pause');
    if (pauseBtn) pauseBtn.addEventListener('click', () => { SAN.audio.sfx('click'); UI.togglePause(); });
    const camBtn = document.getElementById('hud-camera');
    if (camBtn) camBtn.addEventListener('click', () => { SAN.audio.init(); SAN.audio.sfx('click'); SAN.photos.open(); });
    const collapse = document.getElementById('rail-collapse');
    if (collapse) collapse.addEventListener('click', () => { SAN.audio.sfx('click'); document.body.classList.add('rail-collapsed'); document.body.classList.remove('rail-peek'); });
    const reopen = document.getElementById('rail-open');
    if (reopen) reopen.addEventListener('click', () => {
      SAN.audio.sfx('click');
      document.body.classList.remove('rail-collapsed');
      if (window.innerWidth < 1280) document.body.classList.add('rail-peek');
    });
    const bell = document.getElementById('tb-bell');
    if (bell) bell.addEventListener('click', () => { SAN.audio.sfx('click'); UI.openPanel('quests'); });
    document.querySelectorAll('[data-mm]').forEach((btn) => {
      btn.addEventListener('click', () => {
        SAN.audio.sfx('click');
        UI.mmZoom = Math.max(1, Math.min(3, UI.mmZoom + (btn.getAttribute('data-mm') === 'in' ? 0.5 : -0.5)));
        UI._mmKey = '';
        UI.drawMinimap();
      });
    });

    document.getElementById('dialogue-layer').addEventListener('click', (e) => {
      if (e.target.closest('.dlg-choice') || e.target.closest('.dlg-btn')) return;
      UI.advanceDialogue();
    });
    UI.applySettings();
    UI.refreshHUD();
  };

  UI.applySettings = function () {
    const s = S() ? S().settings : (SAN.save.loadSettings() || {});
    if (!s) return;
    SAN.audio.applySettings(s);
    document.documentElement.style.setProperty('--text-speed', s.textSpeed || 1);
    document.body.classList.toggle('reduce-motion', !!s.reduceMotion);
    document.body.classList.toggle('hide-hints', s.showHints === false);
    if (SAN.i18n) SAN.i18n.set(s.lang || 'en');
    const tc = document.getElementById('touch-ui');
    if (tc) tc.classList.toggle('force-show', !!s.alwaysShowTouch);
  };

  UI.isPaused = function () {
    return UI.panelStack.length > 0 || !!UI.dialogueState || UI.titleActive || UI.transitioning || !!(SAN.photos && SAN.photos.mode);
  };

  /* ---------------- toasts ---------------- */
  UI.toast = function (text, kind, iconUrl) {
    if (!UI.toastLayer) return;
    const el = document.createElement('div');
    el.className = 'toast toast-' + (kind || 'info');
    el.innerHTML = (iconUrl ? `<img src="${iconUrl}" alt="">` : '') + `<span>${U.esc(text)}</span>`;
    UI.toastLayer.appendChild(el);
    setTimeout(() => el.classList.add('in'), 10);
    setTimeout(() => {
      el.classList.remove('in');
      setTimeout(() => el.remove(), 450);
    }, kind === 'achievement' || kind === 'quest' ? 4600 : 3200);
    while (UI.toastLayer.children.length > 4) UI.toastLayer.firstChild.remove();
  };

  /* ---------------- fade transitions ---------------- */
  UI.fadeTo = function (cb, dur) {
    if (UI.transitioning) { cb && cb(); return; }
    UI.transitioning = true;
    if (UI.fadeEl) UI.fadeEl.classList.add('on');
    setTimeout(() => {
      try { cb && cb(); } catch (e) { console.error(e); }
      setTimeout(() => {
        if (UI.fadeEl) UI.fadeEl.classList.remove('on');
        UI.transitioning = false;
      }, 90);
    }, dur || 320);
  };

  /* ---------------- day card ---------------- */
  UI.dayCard = function () {
    const S_ = S();
    if (!S_) return;
    const el = document.getElementById('day-card');
    if (!el) return;
    const ev = SAN.time.todayEvent();
    const weatherIcons = { sunny: '☀', cloudy: '☁', rain: '🌧', storm: '⛈', fog: '🌫', snow: '❄' };
    el.innerHTML = `
      <div class="day-card-inner">
        <div class="day-season">${U.seasonName(S_.time.season)}</div>
        <div class="day-num">${SAN.t('day.day')} ${S_.time.day}</div>
        <div class="day-year">${SAN.t('day.year')} ${S_.time.year}</div>
        <div class="day-weather">${weatherIcons[S_.time.weather] || '☀'} ${SAN.t('weather.' + S_.time.weather, S_.time.weather)}</div>
        ${ev ? `<div class="day-event">${U.esc(ev.name)}</div>` : ''}
      </div>`;
    el.classList.add('show');
    dayCardTimer = 3.2;
  };

  /* ---------------- HUD ---------------- */
  UI.refreshHUD = function () {
    const S_ = S();
    if (!S_ || !UI.hud) return;
    const weatherIcons = { sunny: '☀', cloudy: '☁', rain: '🌧', storm: '⛈', fog: '🌫', snow: '❄' };
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    set('hud-date', U.seasonName(S_.time.season) + ' ' + S_.time.day);
    set('hud-time', U.fmtClock(S_.time.minutes));
    set('hud-weather-icon', weatherIcons[S_.time.weather] || '☀');
    set('hud-weather-label', SAN.t('weather.' + S_.time.weather, S_.time.weather));
    set('hud-money', S_.money.toLocaleString());
    set('hud-energy-text', Math.round(S_.energy) + '/' + S_.maxEnergy);
    set('hud-location', SAN.world.area ? SAN.world.area.name : '');
    const phase = U.phase(S_.time.minutes);
    set('hud-phase', SAN.t('phase.' + phase, phase));
    const fill = document.getElementById('hud-energy-fill');
    if (fill) {
      const pct = Math.max(0, Math.min(100, (S_.energy / S_.maxEnergy) * 100));
      fill.style.width = pct + '%';
      fill.className = 'energy-fill' + (pct < 20 ? ' low' : pct < 45 ? ' mid' : '');
    }
    const questEl = document.getElementById('hud-quest');
    if (questEl) {
      const active = SAN.quests.activeList();
      const tracked = active.filter((q) => q.def.type !== 'daily').slice(0, 1)[0] || active[0];
      if (tracked) {
        const objs = SAN.quests.objectiveList(tracked.id);
        const cur = objs.find((o) => !o.done) || objs[0];
        questEl.innerHTML = `<div class="hq-title">${U.esc(tracked.def.title)}</div>
          <div class="hq-obj">${cur ? (cur.done ? 'Ready to turn in' : U.esc(cur.label) + ' ' + cur.cur + '/' + cur.need) : ''}</div>`;
        questEl.classList.remove('empty');
      } else {
        questEl.innerHTML = '<div class="hq-title quiet">No quests right now</div><div class="hq-obj">Talk to people. Things happen.</div>';
        questEl.classList.add('empty');
      }
    }
    const catEl = document.getElementById('hud-cat');
    if (catEl) {
      if (S_.cat.adopted) {
        catEl.style.display = '';
        catEl.querySelector('.cat-label').textContent = S_.cat.name + ' · ' + SAN.cat.hungerLabel();
      } else catEl.style.display = 'none';
    }
    const badge = document.getElementById('hud-quest-badge');
    if (badge) badge.style.display = active.length ? '' : 'none';
    const live = document.getElementById('hud-live');
    if (live) {
      const ev = SAN.time.todayEvent();
      live.textContent = ev ? ev.name : '';
      live.style.display = ev ? '' : 'none';
    }
    UI.refreshDesktop(S_);
  };

  /* ---------------- dialogue ---------------- */
  UI.dialogue = function (opts) {
    const o = Object.assign({ pages: [], choices: [], onClose: null }, opts || {});
    UI.dialogueState = {
      pages: o.pages.length ? o.pages : [{ speaker: 'narrator', text: '...' }],
      choices: o.choices || [],
      onClose: o.onClose,
      idx: 0, charIdx: 0, typing: true, acc: 0, chosen: false,
      auto: false, skip: false, wait: 0,
    };
    UI.dialogueLayer.classList.remove('hidden');
    UI.dialogueLayer.innerHTML = `<div class="dlg-box">
      <div class="dlg-bust">
        <div class="dlg-portrait" id="dlg-portrait"></div>
      </div>
      <div class="dlg-main">
        <div class="dlg-topline">
          <div class="dlg-nameplate" id="dlg-nameplate"><span class="dlg-name" id="dlg-name"></span></div>
          <div class="dlg-controls">
            <button class="dlg-ctl" id="dlg-history" title="${SAN.t('panel.history')}"><span class="ctl-ico">🕘</span><span class="ctl-lbl">${SAN.t('dialogue.history')}</span></button>
            <button class="dlg-ctl" id="dlg-auto"><span class="ctl-ico">▷</span><span class="ctl-lbl">${SAN.t('dialogue.auto')}</span></button>
            <button class="dlg-ctl" id="dlg-skip"><span class="ctl-ico">»</span><span class="ctl-lbl">${SAN.t('dialogue.skip')}</span></button>
          </div>
        </div>
        <div class="dlg-panel">
          <div class="dlg-text" id="dlg-text"></div>
          <div class="dlg-footline">
            <span class="dlg-hint" id="dlg-hint">${SAN.t('dialogue.hint')}</span>
            <span class="dlg-next" id="dlg-next">▼</span>
          </div>
        </div>
      </div>
      <div class="dlg-side" id="dlg-choices"></div>
    </div>`;
    document.getElementById('dlg-history').addEventListener('click', (e) => {
      e.stopPropagation();
      UI.openPanel('history');
    });
    document.getElementById('dlg-auto').addEventListener('click', (e) => { e.stopPropagation(); UI.toggleDialogueAuto(); });
    document.getElementById('dlg-skip').addEventListener('click', (e) => { e.stopPropagation(); UI.toggleDialogueSkip(); });
    SAN.audio.sfx('open');
    UI.renderDialoguePage();
  };

  UI.syncDialogueControls = function () {
    const d = UI.dialogueState;
    if (!d) return;
    const auto = document.getElementById('dlg-auto');
    const skip = document.getElementById('dlg-skip');
    if (auto) auto.classList.toggle('on', !!d.auto);
    if (skip) skip.classList.toggle('on', !!d.skip);
  };

  UI.toggleDialogueAuto = function () {
    const d = UI.dialogueState;
    if (!d) return;
    d.auto = !d.auto;
    d.wait = 0;
    if (d.auto) d.skip = false;
    UI.syncDialogueControls();
    SAN.audio.sfx('click');
  };

  UI.toggleDialogueSkip = function () {
    const d = UI.dialogueState;
    if (!d) return;
    d.skip = !d.skip;
    d.wait = 0;
    if (d.skip) {
      d.auto = false;
      d.typing = false;
      const page = d.pages[d.idx];
      d.charIdx = page ? page.text.length : 0;
      const el = document.getElementById('dlg-text');
      if (el && page) el.textContent = page.text;
      UI.showChoicesIfNeeded();
    }
    UI.syncDialogueControls();
    SAN.audio.sfx('click');
  };

  // the portrait is swapped underneath a crossfade so expressions never pop
  UI.setDialoguePortrait = function (who, mood, narr) {
    const el = document.getElementById('dlg-portrait');
    if (!el) return;
    el.querySelectorAll('img').forEach((img) => {
      img.classList.remove('in');
      setTimeout(() => img.remove(), 420);
    });
    if (narr || !who) return;
    const src = SAN.render.portraitSrc(who, mood);
    if (!src) return;
    const img = document.createElement('img');
    img.className = 'portrait-img';
    img.src = src;
    img.alt = '';
    img.draggable = false;
    img.setAttribute('data-who', who);
    img.setAttribute('data-mood', mood);
    el.appendChild(img);
    void img.offsetWidth;
    img.classList.add('in');
  };

  // an entry may name its expression (mood/expr) or tag a scene (context)
  UI.pageMood = function (page) {
    if (!page) return 'neutral';
    const explicit = page.mood || page.expr || page.expression;
    if (explicit) return SAN.render.resolveMood(explicit);
    if (page.context) return SAN.render.moodForContext(page.context);
    return SAN.render.moodFor(page.text);
  };

  UI.dialogueSpeaker = function (speakerId) {
    if (!speakerId) return { name: 'Sanctuary', portrait: '', narr: true };
    if (speakerId === 'narrator') return { name: '', portrait: '', narr: true };
    if (speakerId === 'player') {
      const S_ = S();
      return { name: S_.player.name, portrait: SAN.render.portrait('player'), narr: false, accent: S_.player.colors.dress };
    }
    const npc = SAN.data.npcs[speakerId];
    if (!npc) return { name: speakerId, portrait: '', narr: true };
    return { name: npc.name, portrait: SAN.render.portrait(speakerId), narr: false, accent: npc.colors.dress, title: npc.title };
  };

  UI.renderDialoguePage = function () {
    const d = UI.dialogueState;
    if (!d) return;
    const page = d.pages[d.idx];
    const sp = UI.dialogueSpeaker(page.speaker);
    const box = UI.dialogueLayer.querySelector('.dlg-box');
    if (box) box.classList.toggle('narration', sp.narr);
    const who = page.speaker === 'player' ? 'player' : page.speaker;
    const mood = sp.narr ? 'neutral' : UI.pageMood(page);
    UI.setDialoguePortrait(who, mood, sp.narr);
    const plate = document.getElementById('dlg-nameplate');
    const nameEl = document.getElementById('dlg-name');
    if (nameEl) {
      nameEl.innerHTML = sp.narr ? '' : U.esc(sp.name) + (sp.title ? `<span class="dlg-role">${U.esc(sp.title)}</span>` : '');
      nameEl.style.color = sp.accent || '';
    }
    if (plate) {
      plate.classList.toggle('hidden', !!sp.narr);
      plate.style.borderColor = sp.accent ? U.rgba(sp.accent, 0.6) : '';
    }
    d.typing = true; d.charIdx = 0; d.acc = 0; d.wait = 0;
    const textEl = document.getElementById('dlg-text');
    if (textEl) { textEl.textContent = ''; textEl.scrollTop = 0; }
    const hint = document.getElementById('dlg-hint');
    if (hint) hint.textContent = SAN.t('dialogue.hint');
    const next = document.getElementById('dlg-next');
    if (next) next.classList.add('off');
    const ch = document.getElementById('dlg-choices');
    if (ch) ch.innerHTML = '';
    if (page.speaker !== 'narrator') {
      UI.history.unshift({ name: sp.name, text: page.text });
      if (UI.history.length > 120) UI.history.pop();
    }
    UI.syncDialogueControls();
  };

  UI.advanceDialogue = function () {
    const d = UI.dialogueState;
    if (!d) return;
    const page = d.pages[d.idx];
    if (d.typing) {
      d.charIdx = page.text.length;
      d.typing = false;
      d.wait = 0;
      const el = document.getElementById('dlg-text');
      if (el) el.textContent = page.text;
      const next = document.getElementById('dlg-next');
      if (next && d.idx >= d.pages.length - 1 && !d.choices.length) next.classList.remove('off');
      UI.showChoicesIfNeeded();
      return;
    }
    if (d.idx < d.pages.length - 1) {
      d.idx++;
      d.wait = 0;
      UI.renderDialoguePage();
      SAN.audio.sfx('page');
      return;
    }
    if (d.choices.length && !d.chosen) { UI.showChoicesIfNeeded(true); return; }
    UI.closeDialogue();
  };

  UI.showChoicesIfNeeded = function (force) {
    const d = UI.dialogueState;
    if (!d) return;
    if (d.idx < d.pages.length - 1 && !force) return;
    if (!d.choices.length) return;
    const el = document.getElementById('dlg-choices');
    if (!el || el.children.length) return;
    d.choices.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'dlg-choice';
      b.setAttribute('data-choice', String(i));
      b.innerHTML = `<span class="dlg-choice-ico">${c.icon || CHOICE_ICONS[i % CHOICE_ICONS.length]}</span>` +
        `<span class="dlg-choice-label">${U.esc(c.label)}</span>`;
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        b.classList.add('chosen');
        UI.chooseDialogue(i);
      });
      el.appendChild(b);
    });
    const next = document.getElementById('dlg-next');
    if (next) next.classList.add('off');
  };

  UI.chooseDialogue = function (i) {
    const d = UI.dialogueState;
    if (!d || !d.choices[i]) return;
    const c = d.choices[i];
    d.chosen = true;
    SAN.audio.sfx('click');
    const onClose = d.onClose;
    UI.dialogueState = null;
    UI.dialogueLayer.classList.add('hidden');
    UI.dialogueLayer.innerHTML = '';
    if (onClose) onClose();
    if (c.cb) setTimeout(() => { try { c.cb(); } catch (e) { console.error(e); } }, 30);
  };

  UI.closeDialogue = function () {
    const d = UI.dialogueState;
    if (!d) return;
    const onClose = d.onClose;
    UI.dialogueState = null;
    UI.dialogueLayer.classList.add('hidden');
    UI.dialogueLayer.innerHTML = '';
    if (onClose) onClose();
  };

  UI.updateDialogue = function (dt) {
    const d = UI.dialogueState;
    if (!d) return;
    const page = d.pages[d.idx];
    if (d.typing) {
      const speed = 26 * ((S() && S().settings.textSpeed) || 1) * (d.skip ? 7 : 1);
      d.acc += dt * speed;
      const target = Math.min(page.text.length, Math.floor(d.acc));
      if (target !== d.charIdx) {
        d.charIdx = target;
        const el = document.getElementById('dlg-text');
        if (el) el.textContent = page.text.slice(0, d.charIdx);
        if (d.charIdx % 3 === 0) SAN.audio.sfx('click');
      }
      if (d.charIdx >= page.text.length) {
        d.typing = false;
        d.wait = 0;
        const next = document.getElementById('dlg-next');
        if (next && d.idx >= d.pages.length - 1 && !d.choices.length) next.classList.remove('off');
        UI.showChoicesIfNeeded();
      }
      return;
    }
    // auto and skip never run past a set of choices: the reader still picks one
    if (d.choices.length && d.idx >= d.pages.length - 1) return;
    if (d.skip) {
      d.wait += dt;
      if (d.wait > 0.16) { d.wait = 0; UI.advanceDialogue(); }
      return;
    }
    if (d.auto) {
      d.wait += dt;
      if (d.wait > 1.1 + page.text.length * 0.018) { d.wait = 0; UI.advanceDialogue(); }
    }
  };

  /* ---------------- panels ---------------- */
  UI.panel = function (name, title, bodyHTML, opts) {
    const o = opts || {};
    const el = document.createElement('div');
    el.className = 'panel-wrap';
    el.dataset.panel = name;
    const heading = SAN.i18n ? SAN.i18n.t('panel.' + name, title) : title;
    el.innerHTML = `
      <div class="panel-card ${o.wide ? 'wide' : ''} ${o.className || ''}">
        <div class="panel-head">
          <div class="panel-title">${U.esc(heading)}</div>
          ${o.noClose ? '' : '<button class="panel-close" aria-label="Close">✕</button>'}
        </div>
        <div class="panel-body">${bodyHTML}</div>
        ${o.footer ? `<div class="panel-foot">${o.footer}</div>` : ''}
      </div>`;
    const closeBtn = el.querySelector('.panel-close');
    if (closeBtn) closeBtn.addEventListener('click', () => UI.closeTop());
    if (!o.noClose) el.addEventListener('mousedown', (e) => { if (e.target === el) UI.closeTop(); });
    UI.panelLayer.appendChild(el);
    UI.panelStack.push({ name, el });
    UI.panelLayer.classList.remove('hidden');
    SAN.audio.sfx('open');
    return el;
  };

  UI.closeTop = function () {
    const top = UI.panelStack.pop();
    if (top) { top.el.remove(); SAN.audio.sfx('close'); }
    if (!UI.panelStack.length) { UI.panelLayer.classList.add('hidden'); UI.panelLayer.classList.remove('above-title'); }
    else UI.panelLayer.classList.remove('hidden');
  };

  UI.closePanel = function (name) {
    for (let i = UI.panelStack.length - 1; i >= 0; i--) {
      if (UI.panelStack[i].name === name) {
        UI.panelStack[i].el.remove();
        UI.panelStack.splice(i, 1);
      }
    }
    if (!UI.panelStack.length) { UI.panelLayer.classList.add('hidden'); UI.panelLayer.classList.remove('above-title'); }
  };

  UI.closeAll = function () {
    UI.panelStack.forEach((p) => p.el.remove());
    UI.panelStack = [];
    UI.panelLayer.classList.add('hidden');
    UI.panelLayer.classList.remove('above-title');
    UI.closeDialogue();
  };

  UI.topPanel = () => (UI.panelStack.length ? UI.panelStack[UI.panelStack.length - 1].name : null);

  UI.openPanel = function (name, data) {
    if (UI.titleActive) return;
    const builder = UI.PANELS[name];
    if (!builder) { console.warn('No panel', name); return; }
    if (UI.panelStack.some((p) => p.name === name)) { UI.closePanel(name); return; }
    builder(data || {});
  };

  UI.refreshPanel = function (name, data) {
    UI.closePanel(name);
    UI.openPanel(name, data);
  };

  UI.confirm = function (title, body, onYes, onNo) {
    const el = UI.panel('confirm', title,
      `<p class="confirm-body">${U.esc(body)}</p>
       <div class="confirm-actions">
         <button class="btn btn-primary" id="cf-yes">${SAN.t('confirm.yes')}</button>
         <button class="btn btn-ghost" id="cf-no">${SAN.t('confirm.no')}</button>
       </div>`, { className: 'small-panel' });
    el.querySelector('#cf-yes').addEventListener('click', () => {
      UI.closePanel('confirm');
      onYes && onYes();
    });
    el.querySelector('#cf-no').addEventListener('click', () => {
      UI.closePanel('confirm');
      onNo && onNo();
    });
  };

  /* ---------------- pause ---------------- */
  UI.togglePause = function () {
    if (UI.titleActive) return;
    if (UI.topPanel() === 'pause') { UI.closePanel('pause'); return; }
    if (UI.panelStack.length) { UI.closeAll(); return; }
    if (UI.dialogueState) { UI.advanceDialogue(); return; }
    UI.openPanel('pause');
  };

  /* ---------------- keyboard ---------------- */
  UI.handleKey = function (k) {
    if (UI.titleActive) return true;
    if (SAN.photos && SAN.photos.mode) {
      if (k === 'Escape' || k === 'p' || k === 'P') { SAN.photos.close(); return true; }
      if (k === 'c' || k === 'C' || k === 'Enter' || k === ' ') { SAN.photos.capture(); return true; }
      return true;
    }
    if (UI.dialogueState) {
      if (k === 'Escape') { UI.closeDialogue(); return true; }
      if (k === ' ' || k === 'e' || k === 'E' || k === 'Enter') { UI.advanceDialogue(); return true; }
      if (/^[1-6]$/.test(k)) { UI.chooseDialogue(parseInt(k, 10) - 1); return true; }
      return true;
    }
    if (UI.panelStack.length) {
      if (k === 'Escape') { UI.closeTop(); return true; }
      if (k === 'i' || k === 'I') { UI.openPanel('inventory'); return true; }
      if (k === 'j' || k === 'J') { UI.openPanel('journal'); return true; }
      if (k === 'm' || k === 'M') { UI.openPanel('map'); return true; }
      if (k === 'q' || k === 'Q') { UI.openPanel('quests'); return true; }
      return false;
    }
    if (k === 'Escape') { UI.togglePause(); return true; }
    if (k === 'i' || k === 'I') { UI.openPanel('inventory'); return true; }
    if (k === 'j' || k === 'J') { UI.openPanel('journal'); return true; }
    if (k === 'm' || k === 'M') { UI.openPanel('map'); return true; }
    if (k === 'q' || k === 'Q') { UI.openPanel('quests'); return true; }
    if (k === 'v' || k === 'V') { UI.openPanel('memories'); return true; }
    if (k === 'r' || k === 'R') { UI.openPanel('relations'); return true; }
    if (k === 'c' || k === 'C') { UI.openPanel('collection'); return true; }
    if (k === 'p' || k === 'P') { SAN.photos.open(); return true; }
    return false;
  };

  UI.update = function (dt) {
    UI.updateDialogue(dt);
    if (dayCardTimer > 0) {
      dayCardTimer -= dt;
      if (dayCardTimer <= 0) {
        const el = document.getElementById('day-card');
        if (el) el.classList.remove('show');
      }
    }
  };

  UI.button = function (label, cls, onClick, attrs) {
    const b = document.createElement('button');
    b.className = 'btn ' + (cls || '');
    b.innerHTML = label;
    if (attrs) Object.keys(attrs).forEach((k) => b.setAttribute(k, attrs[k]));
    b.addEventListener('click', (e) => { e.stopPropagation(); SAN.audio.sfx('click'); onClick(b); });
    return b;
  };

  /* ---------------- desktop shell ---------------- */
  const AREA_DESC = {
    village: 'A peaceful village where nature, people, and stories grow together.',
    home: 'Your cottage: dust, rain, and the quiet work of starting again.',
    garden: 'Rows of green, turned earth, and the smell of growing things.',
    greenhouse: 'Warm glass and shared seedlings. Someone else\'s patience, borrowed.',
    forest: 'Old trees that keep whatever you tell them.',
    beach: 'Salt, long light, and the sound of something patient.',
    lighthouse: 'A promise you make to strangers, kept every night.',
    windmill: 'Gears turning slowly, like a thought being worked through.',
    meadow: 'A secret the village keeps for itself.',
  };
  const MM_COLORS = {
    '.': '#7fae66', ',': '#8dbd70', '#': '#c9a678', '=': '#b7ada0', '~': '#79b6cc',
    's': '#e8d6ab', 'w': '#a87d52', 'g': '#bcd6c8', 'm': '#557048', 'c': '#8a6247',
    'x': '#e3cfbe', 'o': '#cfc6b5', 'r': '#b98ba0', '_': '#241d2f', 'F': '#a0805a',
  };
  UI.mmZoom = 1;
  UI._mmKey = '';

  UI.drawMinimap = function () {
    const cv = document.getElementById('minimap');
    const W = SAN.world;
    if (!cv || !W.area || !W.player) return;
    const p = W.player, a = W.area, size = cv.width;
    const key = a.id + ':' + Math.floor(p.x) + ',' + Math.floor(p.y) + ':' + UI.mmZoom;
    if (key === UI._mmKey) return;
    UI._mmKey = key;
    const g = cv.getContext('2d');
    g.fillStyle = '#241d2f';
    g.fillRect(0, 0, size, size);
    const s = Math.max(1.5, Math.min(size / a.w, size / a.h) * UI.mmZoom);
    const viewTiles = size / s;
    const camX = Math.max(0, Math.min(a.w - viewTiles, p.x - viewTiles / 2));
    const camY = Math.max(0, Math.min(a.h - viewTiles, p.y - viewTiles / 2));
    const ox = (size - viewTiles * s) / 2, oy = (size - viewTiles * s) / 2;
    for (let y = 0; y < a.h; y++) {
      for (let x = 0; x < a.w; x++) {
        const sx = ox + (x - camX) * s, sy = oy + (y - camY) * s;
        if (sx < -s || sy < -s || sx > size || sy > size) continue;
        g.fillStyle = MM_COLORS[a.grid[y][x]] || '#6f8a5e';
        g.fillRect(Math.floor(sx), Math.floor(sy), Math.ceil(s), Math.ceil(s));
      }
    }
    W.npcs.forEach((n) => {
      const sx = ox + (n.px / 16 - camX) * s, sy = oy + (n.py / 16 - camY) * s;
      g.fillStyle = '#8a6a92';
      g.beginPath(); g.arc(sx + s / 2, sy + s / 2, Math.max(2, s * 0.4), 0, Math.PI * 2); g.fill();
    });
    const mx = ox + (p.px / 16 - camX) * s, my = oy + (p.py / 16 - camY) * s;
    g.beginPath(); g.arc(mx + s / 2, my + s / 2, Math.max(3, s * 0.62), 0, Math.PI * 2);
    g.fillStyle = '#f4d07a'; g.fill();
    g.lineWidth = 1.5; g.strokeStyle = '#4a3524'; g.stroke();
  };

  UI.refreshDesktop = function (S_) {
    if (!S_) return;
    document.body.classList.toggle('playing', !!S_.started && !UI.titleActive);
    if (!S_.started || UI.titleActive) return;
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    const W = SAN.world, area = W.area;
    const weatherIcons = { sunny: '☀', cloudy: '☁', rain: '🌧', storm: '⛈', fog: '🌫', snow: '❄' };
    const phase = U.phase(S_.time.minutes);
    set('tb-date', U.seasonName(S_.time.season) + ' · ' + SAN.t('day.day') + ' ' + S_.time.day);
    set('tb-time', U.fmtClock(S_.time.minutes));
    set('tb-weather-icon', weatherIcons[S_.time.weather] || '☀');
    set('tb-weather', SAN.t('weather.' + S_.time.weather, S_.time.weather));
    set('tb-money', S_.money.toLocaleString());
    set('tb-name', S_.player.name || 'Elara');
    set('tb-status', SAN.t('phase.' + phase, phase));
    set('rail-name', S_.player.name || 'Elara');
    set('rail-status', phase === 'morning' ? 'Feeling rested' : phase === 'night' ? 'Ready to rest' : 'Feeling steady');
    const pct = Math.max(0, Math.min(100, (S_.energy / S_.maxEnergy) * 100));
    const fill = document.getElementById('rail-energy-fill');
    if (fill) { fill.style.width = pct + '%'; fill.className = 'energy-fill' + (pct < 20 ? ' low' : pct < 45 ? ' mid' : ''); }
    set('rail-energy-text', Math.round(S_.energy) + '/' + S_.maxEnergy);
    const filled = Math.round(pct / 20);
    set('rail-hearts', '♥'.repeat(filled) + '♡'.repeat(5 - filled));
    if (S_.cat.adopted) set('rail-cat', S_.cat.name + ' · ' + SAN.cat.hungerLabel());

    const src = SAN.render.portraitSrc('player', 'neutral');
    const railP = document.getElementById('rail-portrait');
    if (railP && railP.getAttribute('data-src') !== src) {
      railP.setAttribute('data-src', src);
      railP.innerHTML = `<img src="${src}" alt="">`;
    }
    const avatar = document.getElementById('tb-avatar');
    if (avatar && avatar.getAttribute('data-src') !== src) {
      avatar.setAttribute('data-src', src);
      avatar.innerHTML = `<img src="${src}" alt="">`;
    }

    if (area) {
      set('rail-loc-name', area.name);
      set('rail-loc-desc', AREA_DESC[area.id] || 'Somewhere between who you were and who you are becoming.');
    }

    const near = W.npcs.map((n) => ({ n, d: Math.hypot(n.px - W.player.px, n.py - W.player.py) }))
      .sort((a, b) => a.d - b.d).slice(0, 4);
    const npcEl = document.getElementById('rail-npcs');
    if (npcEl) {
      npcEl.innerHTML = near.length
        ? near.map(({ n, d }) => `<li><span class="rail-npc-face"><img src="${SAN.render.portraitSrc(n.def.id, 'neutral')}" alt=""></span>
            <span class="rail-npc-meta"><b>${U.esc(n.def.name)}</b><span>${U.esc(n.def.title || '')} · ${Math.max(1, Math.round(d / 16))} tiles</span></span></li>`).join('')
        : '<li class="empty">No one nearby.</li>';
    }

    const active = SAN.quests.activeList();
    const tracked = active.filter((q) => q.def.type !== 'daily')[0] || active[0];
    const todoEl = document.getElementById('rail-todo');
    if (todoEl) {
      const objs = tracked ? SAN.quests.objectiveList(tracked.id) : [];
      todoEl.innerHTML = objs.length
        ? objs.slice(0, 5).map((o) => `<li class="${o.done ? 'done' : ''}"><span class="tick">${o.done ? '✓' : ''}</span><span>${U.esc(o.label)}${o.need > 1 ? ' (' + o.cur + '/' + o.need + ')' : ''}</span></li>`).join('')
        : '<li class="empty">Nothing pressing. Wander a little.</li>';
    }
    const qEl = document.getElementById('rail-quests');
    if (qEl) {
      qEl.innerHTML = active.length
        ? active.slice(0, 3).map((q) => {
          const objs = SAN.quests.objectiveList(q.id);
          const cur = objs.find((o) => !o.done) || objs[0];
          return `<div class="rail-quest"><b>${U.esc(q.def.title)}</b><span>${cur ? U.esc(cur.label) : 'Complete'}</span></div>`;
        }).join('')
        : '<div class="rail-quest empty">No quests right now. Talk to people.</div>';
    }
    const dot = document.getElementById('tb-dot');
    if (dot) dot.hidden = active.length === 0;
    UI.drawMinimap();
  };
})();
