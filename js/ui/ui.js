/* Sanctuary — UI core: HUD, dialogue, toasts, panels, pause, transitions */
(function () {
  const UI = (SAN.ui = {});
  const U = SAN.util;
  const S = () => SAN.state.S;

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
        <div class="day-season">${U.SEASONS[S_.time.season]}</div>
        <div class="day-num">Day ${S_.time.day}</div>
        <div class="day-year">Year ${S_.time.year}</div>
        <div class="day-weather">${weatherIcons[S_.time.weather] || '☀'} ${S_.time.weather}</div>
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
    set('hud-date', U.SEASONS[S_.time.season] + ' ' + S_.time.day);
    set('hud-time', U.fmtClock(S_.time.minutes));
    set('hud-weather-icon', weatherIcons[S_.time.weather] || '☀');
    set('hud-weather-label', S_.time.weather);
    set('hud-money', S_.money.toLocaleString());
    set('hud-energy-text', Math.round(S_.energy) + '/' + S_.maxEnergy);
    set('hud-location', SAN.world.area ? SAN.world.area.name : '');
    set('hud-phase', U.phase(S_.time.minutes));
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
  };

  /* ---------------- dialogue ---------------- */
  UI.dialogue = function (opts) {
    const o = Object.assign({ pages: [], choices: [], onClose: null }, opts || {});
    UI.dialogueState = {
      pages: o.pages.length ? o.pages : [{ speaker: 'narrator', text: '...' }],
      choices: o.choices || [],
      onClose: o.onClose,
      idx: 0, charIdx: 0, typing: true, acc: 0, chosen: false,
    };
    UI.dialogueLayer.classList.remove('hidden');
    UI.dialogueLayer.innerHTML = `<div class="dlg-box">
      <div class="dlg-portrait" id="dlg-portrait"></div>
      <div class="dlg-main">
        <div class="dlg-name" id="dlg-name"></div>
        <div class="dlg-text" id="dlg-text"></div>
        <div class="dlg-footer">
          <span class="dlg-hint" id="dlg-hint">click / E to continue</span>
          <button class="dlg-btn dlg-history" id="dlg-history" title="Dialogue history">History</button>
        </div>
        <div class="dlg-choices" id="dlg-choices"></div>
      </div>
    </div>`;
    document.getElementById('dlg-history').addEventListener('click', (e) => {
      e.stopPropagation();
      UI.openPanel('history');
    });
    SAN.audio.sfx('open');
    UI.renderDialoguePage();
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
    const portraitEl = document.getElementById('dlg-portrait');
    if (portraitEl) {
      const who = page.speaker === 'player' ? 'player' : page.speaker;
      const mood = SAN.render.moodFor(page.text);
      portraitEl.innerHTML = sp.narr ? '' : SAN.render.portrait(who, { mood });
      portraitEl.style.borderColor = sp.accent ? U.rgba(sp.accent, 0.7) : '';
      portraitEl.classList.remove('expr-in');
      void portraitEl.offsetWidth;
      portraitEl.classList.add('expr-in');
      portraitEl.dataset.mood = mood;
    }
    const nameEl = document.getElementById('dlg-name');
    if (nameEl) {
      nameEl.innerHTML = sp.narr ? '' : U.esc(sp.name) + (sp.title ? `<span class="dlg-role">${U.esc(sp.title)}</span>` : '');
      nameEl.style.color = sp.accent || '';
    }
    d.typing = true; d.charIdx = 0; d.acc = 0;
    const textEl = document.getElementById('dlg-text');
    if (textEl) textEl.textContent = '';
    const hint = document.getElementById('dlg-hint');
    if (hint) hint.textContent = 'click / E to continue';
    const ch = document.getElementById('dlg-choices');
    if (ch) ch.innerHTML = '';
    if (page.speaker !== 'narrator') {
      UI.history.unshift({ name: sp.name, text: page.text });
      if (UI.history.length > 120) UI.history.pop();
    }
  };

  UI.advanceDialogue = function () {
    const d = UI.dialogueState;
    if (!d) return;
    const page = d.pages[d.idx];
    if (d.typing) {
      d.charIdx = page.text.length;
      d.typing = false;
      const el = document.getElementById('dlg-text');
      if (el) el.textContent = page.text;
      UI.showChoicesIfNeeded();
      return;
    }
    if (d.idx < d.pages.length - 1) {
      d.idx++;
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
      b.innerHTML = `<span class="dlg-num">${i + 1}</span>${U.esc(c.label)}`;
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        UI.chooseDialogue(i);
      });
      el.appendChild(b);
    });
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
    if (!d || !d.typing) return;
    const page = d.pages[d.idx];
    const speed = 26 * ((S() && S().settings.textSpeed) || 1);
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
      UI.showChoicesIfNeeded();
    }
  };

  /* ---------------- panels ---------------- */
  UI.panel = function (name, title, bodyHTML, opts) {
    const o = opts || {};
    const el = document.createElement('div');
    el.className = 'panel-wrap';
    el.dataset.panel = name;
    el.innerHTML = `
      <div class="panel-card ${o.wide ? 'wide' : ''} ${o.className || ''}">
        <div class="panel-head">
          <div class="panel-title">${U.esc(title)}</div>
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
    if (!UI.panelStack.length) UI.panelLayer.classList.add('hidden');
    else UI.panelLayer.classList.remove('hidden');
  };

  UI.closePanel = function (name) {
    for (let i = UI.panelStack.length - 1; i >= 0; i--) {
      if (UI.panelStack[i].name === name) {
        UI.panelStack[i].el.remove();
        UI.panelStack.splice(i, 1);
      }
    }
    if (!UI.panelStack.length) UI.panelLayer.classList.add('hidden');
  };

  UI.closeAll = function () {
    UI.panelStack.forEach((p) => p.el.remove());
    UI.panelStack = [];
    UI.panelLayer.classList.add('hidden');
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
         <button class="btn btn-primary" id="cf-yes">Yes</button>
         <button class="btn btn-ghost" id="cf-no">Not now</button>
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
})();
