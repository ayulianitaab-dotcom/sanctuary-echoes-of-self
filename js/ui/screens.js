/* Sanctuary — title screen, onboarding cinematic, character creation */
(function () {
  const SC = (SAN.screens = {});
  const U = SAN.util;
  const S = () => SAN.state.S;

  SC.showTitle = function () {
    SAN.ui.titleActive = true;
    SAN.ui.closeAll();
    const hud = document.getElementById('hud');
    if (hud) hud.classList.add('hidden');
    const dock = document.getElementById('dock');
    if (dock) dock.classList.add('hidden');
    const touch = document.getElementById('touch-ui');
    if (touch) touch.classList.add('hidden');
    const el = document.getElementById('title-screen');
    el.classList.remove('hidden');
    const hasSave = SAN.save.hasAny();
    el.innerHTML = `
      <div class="title-bg">
        <div class="title-glow"></div>
        <div class="title-stars">${Array.from({ length: 26 }).map((_, i) => `<i style="left:${(i * 37) % 100}%;top:${(i * 53) % 70}%;animation-delay:${i * 0.21}s"></i>`).join('')}</div>
        <div class="title-hills"><i></i><i></i><i></i></div>
        <div class="title-house"><div class="th-roof"></div><div class="th-body"><span></span></div></div>
      </div>
      <div class="title-content">
        <div class="title-kicker">${SAN.t('title.kicker')}</div>
        <h1 class="title-logo">Sanctuary</h1>
        <div class="title-sub">Echoes of Self</div>
        <div class="title-flowers">✿ ❀ ✿</div>
        <div class="title-menu">
          <button class="title-btn primary" id="t-new">${SAN.t('title.newGame')}</button>
          <button class="title-btn" id="t-continue" ${hasSave ? '' : 'disabled'}>${SAN.t('title.continue')}</button>
          <button class="title-btn" id="t-slots" ${hasSave ? '' : 'disabled'}>${SAN.t('title.slots')}</button>
          <button class="title-btn" id="t-settings">${SAN.t('title.settings')}</button>
          <button class="title-btn" id="t-about">${SAN.t('title.about')}</button>
          <button class="title-btn ghost" id="t-quit">${SAN.t('title.quit')}</button>
        </div>
        <div class="title-foot">${SAN.t('title.foot')}</div>
      </div>`;
    SAN.audio.init();
    SAN.audio.playMusic('title');
    SAN.audio.ambient('birds');

    el.querySelector('#t-new').addEventListener('click', () => { SAN.audio.sfx('open'); SC.showCustomizer(); });
    const cont = el.querySelector('#t-continue');
    cont.addEventListener('click', () => {
      const meta = SAN.save.slotMeta().filter((m) => !m.empty).sort((a, b) => b.savedAt - a.savedAt)[0];
      if (!meta) return;
      SC.loadSlot(meta.slot);
    });
    el.querySelector('#t-slots').addEventListener('click', () => SC.showSlots());
    el.querySelector('#t-settings').addEventListener('click', () => SC.showTitleSettings());
    el.querySelector('#t-about').addEventListener('click', () => {
      SAN.ui.panelStack = [];
      SAN.ui.titleActive = false;
      SAN.ui.PANELS.about();
      SAN.ui.titleActive = true;
    });
    el.querySelector('#t-quit').addEventListener('click', () => {
      el.innerHTML = `<div class="title-quit">
        <h2>Thank you for visiting.</h2>
        <p>Sanctuary will be here whenever you come back. You can close this tab now.</p>
        <button class="title-btn" id="t-back">Stay a while longer</button>
      </div>`;
      el.querySelector('#t-back').addEventListener('click', () => SC.showTitle());
    });
  };

  SC.showSlots = function () {
    const meta = SAN.save.slotMeta();
    const el = document.getElementById('title-screen');
    el.classList.add('title-subpanel');
    const wrap = document.createElement('div');
    wrap.className = 'title-modal';
    wrap.innerHTML = `<h2>Save Slots</h2><div class="title-slots">${meta.map((m) => `
      <div class="title-slot ${m.empty ? 'empty' : ''}">
        <div class="ts-head">Slot ${m.slot}</div>
        ${m.empty ? '<div class="ts-empty">Empty — a good place for a new story.</div>' : `
          <div class="ts-name">${U.esc(m.name)}${m.catName ? ' & ' + U.esc(m.catName) : ''}</div>
          <div class="ts-meta">${U.SEASONS[m.season]} ${m.day}, Year ${m.year}</div>
          <div class="ts-meta">${m.money} coins · ${Math.floor((m.playtime || 0) / 60)} min</div>
          <div class="ts-actions">
            <button class="btn btn-small btn-primary" data-load="${m.slot}">Continue</button>
            <button class="btn btn-small btn-ghost" data-del="${m.slot}">Delete</button>
          </div>`}
      </div>`).join('')}</div>
      <button class="title-btn" id="ts-close">Back</button>`;
    el.appendChild(wrap);
    wrap.querySelector('#ts-close').addEventListener('click', () => { wrap.remove(); el.classList.remove('title-subpanel'); });
    wrap.querySelectorAll('[data-load]').forEach((b) => b.addEventListener('click', () => SC.loadSlot(parseInt(b.getAttribute('data-load'), 10))));
    wrap.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
      SAN.save.clear(parseInt(b.getAttribute('data-del'), 10));
      wrap.remove(); el.classList.remove('title-subpanel'); SC.showTitle();
    }));
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
        <p class="fineprint">You can change all of this later at the wardrobe in your cottage.</p>
      </div>
      <div class="creator-body">
        <div class="creator-preview">
          <div class="creator-portrait" id="creator-portrait"></div>
          <div class="creator-name-display" id="creator-name-display">Elara</div>
        </div>
        <div class="creator-options">
          <label class="field-label">Name</label>
          <input class="text-input" id="cr-name" maxlength="16" value="${U.esc(custom.name)}">
          <label class="field-label">Presentation</label>
          <div class="chip-row" id="cr-gender"></div>
          <label class="field-label">Hair</label>
          <div class="chip-row" id="cr-hairstyle"></div>
          <label class="field-label">Hair colour</label>
          <div class="swatch-row" id="cr-haircolor"></div>
          <label class="field-label">Eyes</label>
          <div class="swatch-row" id="cr-eyes"></div>
          <label class="field-label">Skin</label>
          <div class="swatch-row" id="cr-skin"></div>
          <label class="field-label">Outfit</label>
          <div class="chip-row" id="cr-outfit"></div>
          <label class="field-label">Accessory</label>
          <div class="chip-row" id="cr-acc"></div>
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

    function paint() {
      const full = Object.assign({}, custom, { colors: SAN.state.playerColors(custom) });
      portrait.innerHTML = SAN.render.portrait('player', { player: full });
      nameDisplay.textContent = custom.name || 'Elara';
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
    function swatches(containerId, list, key) {
      const box = wrap.querySelector(containerId);
      box.innerHTML = '';
      list.forEach((item) => {
        const b = document.createElement('button');
        b.className = 'swatch' + (custom[key] === item.hex ? ' active' : '');
        b.style.background = item.hex;
        b.title = item.name;
        b.addEventListener('click', () => { custom[key] = item.hex; swatches(containerId, list, key); paint(); });
        box.appendChild(b);
      });
    }
    chips('#cr-gender', [{ id: 'feminine', name: 'Feminine' }, { id: 'masculine', name: 'Masculine' }, { id: 'neutral', name: 'Androgynous' }], 'gender');
    chips('#cr-hairstyle', SAN.state.HAIRSTYLES, 'hair');
    swatches('#cr-haircolor', SAN.state.HAIRS, 'hairColor');
    swatches('#cr-eyes', SAN.state.EYES, 'eyeColor');
    swatches('#cr-skin', SAN.state.SKINS, 'skinColor');
    chips('#cr-outfit', SAN.state.OUTFITS, 'outfit');
    chips('#cr-acc', SAN.state.ACCESSORIES, 'accessory');

    wrap.querySelector('#cr-name').addEventListener('input', (e) => { custom.name = e.target.value; nameDisplay.textContent = custom.name || 'Elara'; });
    wrap.querySelector('#cr-random').addEventListener('click', () => {
      custom.hair = U.pick(SAN.state.HAIRSTYLES).id;
      custom.hairColor = U.pick(SAN.state.HAIRS).hex;
      custom.eyeColor = U.pick(SAN.state.EYES).hex;
      custom.skinColor = U.pick(SAN.state.SKINS).hex;
      custom.outfit = U.pick(SAN.state.OUTFITS).id;
      custom.accessory = U.pick(SAN.state.ACCESSORIES).id;
      chips('#cr-hairstyle', SAN.state.HAIRSTYLES, 'hair');
      swatches('#cr-haircolor', SAN.state.HAIRS, 'hairColor');
      swatches('#cr-eyes', SAN.state.EYES, 'eyeColor');
      swatches('#cr-skin', SAN.state.SKINS, 'skinColor');
      chips('#cr-outfit', SAN.state.OUTFITS, 'outfit');
      chips('#cr-acc', SAN.state.ACCESSORIES, 'accessory');
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
    const S_ = SAN.state.newGame({ player: custom, cat: { name: 'Mochi', color: 'cream', adopted: false }, slot: SC.pickFreeSlot() });
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
