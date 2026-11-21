/* Sanctuary — fishing minigame with casting, bite timing and a reel-in bar */
(function () {
  const F = (SAN.fishing = {});
  const U = SAN.util;

  F.active = false;
  F.phase = 'idle';
  F.fish = null;
  F.timer = 0;
  F.catchTop = 0.5;
  F.catchH = 0.24;
  F.fishPos = 0.5;
  F.fishVel = 0;
  F.progress = 0.4;
  F.hold = false;
  F.result = null;
  F.overlay = null;
  F.lastTs = 0;

  const PHASE_LABEL = {
    cast: 'Casting the line…',
    wait: 'Waiting. Nothing to do but watch the water.',
    bite: 'A bite! Press E now!',
    reel: 'Hold E to lift the line — keep the fish in the glow.',
    win: 'Caught!',
    lose: 'It slipped away…',
    notify: 'Catch!',
  };

  function ensureOverlay() {
    if (F.overlay) return F.overlay;
    const el = document.createElement('div');
    el.id = 'fishing-overlay';
    el.className = 'fishing-overlay hidden';
    el.innerHTML = `
      <div class="fishing-card">
        <div class="fishing-header">
          <span class="fishing-title">Fishing</span>
          <span class="fishing-sub" id="fishing-sub"></span>
        </div>
        <div class="fishing-body">
          <div class="fishing-track" id="fishing-track">
            <div class="fishing-water"></div>
            <div class="catch-zone" id="catch-zone"></div>
            <div class="fish-marker" id="fish-marker">🐟</div>
          </div>
          <div class="fishing-side">
            <div class="tension-wrap"><div class="tension-bar" id="tension-bar"><i></i></div></div>
            <div class="fishing-meter-label">Line</div>
            <div class="fishing-dots" id="fishing-dots"></div>
          </div>
        </div>
        <div class="fishing-hint" id="fishing-hint">Press E to cast</div>
        <div class="fishing-actions">
          <button class="btn btn-ghost" id="fishing-cancel">Stop fishing</button>
        </div>
      </div>`;
    document.getElementById('ui-root').appendChild(el);
    el.querySelector('#fishing-cancel').addEventListener('click', () => F.stop(true));
    F.overlay = el;
    return el;
  }

  F.chooseFish = function () {
    const S = SAN.state.S;
    const areaId = S.player.area;
    const hour = Math.floor(S.time.minutes / 60) % 24;
    const phase = U.phase(S.time.minutes);
    const weather = S.time.weather;
    const lvl = S.levels.fishing.lvl;
    const clear = weather === 'sunny' || weather === 'cloudy';
    const rainy = weather === 'rain' || weather === 'storm';
    const pool = Object.values(SAN.data.fish).filter((f) => {
      if (!f.areas.includes(areaId)) return false;
      if (f.minLevel > lvl) return false;
      if (f.time === 'night' && phase !== 'night') return false;
      if (f.time === 'morning' && phase !== 'morning') return false;
      if (f.weather === 'clear' && !clear) return false;
      if (f.weather === 'rain' && !rainy) return false;
      if (f.weather === 'fog' && weather !== 'fog') return false;
      return true;
    });
    if (!pool.length) return SAN.data.fish.minnow;
    const celebrate = SAN.time.todayEvent() && SAN.time.todayEvent().id === 'moonlight_fishing';
    let total = 0;
    const weights = pool.map((f) => {
      let w = 1 / (f.diff + 0.25);
      if (celebrate) w *= 1.5;
      total += w;
      return w;
    });
    let r = Math.random() * total;
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) return pool[i];
    }
    return pool[0];
  };

  F.start = function () {
    const S = SAN.state.S;
    if (F.active) return;
    F.active = true;
    F.phase = 'cast';
    F.timer = 0.9;
    F.catchTop = 0.5;
    F.progress = 0.4;
    F.hold = false;
    F.result = null;
    F.fish = F.chooseFish();
    F.catchH = Math.max(0.15, 0.30 - (F.fish.diff * 0.12) - S.levels.fishing.lvl * 0.008);
    F.fishPos = 0.5;
    F.fishVel = 0;
    ensureOverlay().classList.remove('hidden');
    SAN.audio.sfx('water');
    SAN.audio.ambient('waves');
    F.updateUI();
    if (SAN.state.S.energy <= 0) {
      SAN.ui.toast('You are exhausted. Fishing would just be staring at water.', 'warn');
    }
  };

  F.stop = function (cancelled) {
    F.active = false;
    F.phase = 'idle';
    F.hold = false;
    if (F.overlay) F.overlay.classList.add('hidden');
    if (SAN.audio) SAN.audio.ambient(SAN.world.area ? SAN.world.area.ambient : 'birds');
    if (cancelled) SAN.ui.toast('You reel in an empty line.', 'info');
  };

  F.update = function (dt, pressed, held) {
    if (!F.active) return;
    const S = SAN.state.S;
    F.hold = !!held;
    if (F.phase === 'cast') {
      F.timer -= dt;
      if (F.timer <= 0) { F.phase = 'wait'; F.timer = 1.4 + Math.random() * 2.6; }
    } else if (F.phase === 'wait') {
      F.timer -= dt;
      if (Math.random() < dt * 0.7) SAN.audio.sfx('water');
      if (F.timer <= 0) {
        F.phase = 'bite';
        F.timer = 1.35;
        SAN.audio.sfx('waterup');
        SAN.ui.toast('Something is pulling the line!', 'info');
      }
    } else if (F.phase === 'bite') {
      F.timer -= dt;
      if (pressed) { F.phase = 'reel'; F.progress = 0.45; }
      else if (F.timer <= 0) { F.fail('It let go. Too slow.'); }
    } else if (F.phase === 'reel') {
      const diff = F.fish.diff;
      const speed = F.fish.speed;
      // fish wander
      if (Math.random() < dt * 3.2) F.fishVel += (Math.random() - 0.5) * speed * 1.5;
      F.fishVel += (0.5 - F.fishPos) * dt * 1.4;
      F.fishVel *= 0.96;
      F.fishPos += F.fishVel * dt;
      if (F.fishPos < 0) { F.fishPos = 0; F.fishVel = Math.abs(F.fishVel) * 0.6; }
      if (F.fishPos > 1) { F.fishPos = 1; F.fishVel = -Math.abs(F.fishVel) * 0.6; }
      // catch zone
      const lift = 0.62 - diff * 0.18;
      F.catchTop += (F.hold ? -lift : lift * 0.85) * dt;
      F.catchTop = U.clamp(F.catchTop, 0, 1 - F.catchH);
      const inside = F.fishPos >= F.catchTop && F.fishPos <= F.catchTop + F.catchH;
      F.progress += (inside ? 0.26 : -0.20) * dt;
      if (inside && Math.random() < dt * 2) SAN.audio.sfx('click');
      if (F.progress >= 1) F.win();
      else if (F.progress <= 0) F.fail('The line went slack. It got away.');
    } else if (F.phase === 'win' || F.phase === 'lose') {
      F.timer -= dt;
      if (F.timer <= 0 || pressed) F.stop(false);
    }
    F.updateUI();
  };

  F.win = function () {
    const S = SAN.state.S;
    F.phase = 'win';
    F.timer = 2.4;
    const fish = F.fish;
    SAN.state.addItem(fish.id, 1);
    S.stats.fishCaught++;
    SAN.quests.notify('catch', fish.id, 1);
    SAN.progression.addXp('fishing', Math.round(8 + fish.diff * 22));
    SAN.audio.sfx('catch');
    F.result = fish;
    if (SAN.scenes) SAN.scenes.showDaily('fish', { caption: 'A ' + fish.name + ', still silver in the light.' });
    const rarity = fish.rarity || 'common';
    SAN.ui.toast('Caught a ' + fish.name + ' (' + rarity + ')!', 'fish', SAN.render.itemIcon(fish.id));
    if (rarity === 'rare' || rarity === 'legendary') {
      SAN.progression.checkAchievements();
      SAN.ui.toast('Rare waters remember you.', 'unlock');
    }
    if (fish.id === 'memoryfish') {
      S.flags.caughtMemoryfish = true;
      SAN.ui.toast('The Memoryfish looks at you for a long moment, then returns to the dark.', 'story');
    }
    SAN.save.autosave();
  };

  F.fail = function (msg) {
    F.phase = 'lose';
    F.timer = 1.8;
    F.result = null;
    SAN.ui.toast(msg, 'info');
  };

  F.updateUI = function () {
    if (!F.overlay) return;
    const sub = F.overlay.querySelector('#fishing-sub');
    const hint = F.overlay.querySelector('#fishing-hint');
    const track = F.overlay.querySelector('#fishing-track');
    const zone = F.overlay.querySelector('#catch-zone');
    const marker = F.overlay.querySelector('#fish-marker');
    const tension = F.overlay.querySelector('#tension-bar i');
    const trackH = track.clientHeight || 180;
    sub.textContent = F.phase === 'reel' ? 'Something is fighting' : F.phase === 'wait' ? 'Waiting' : '';
    hint.textContent = PHASE_LABEL[F.phase] || '';
    if (F.phase === 'reel' || F.phase === 'win' || F.phase === 'lose') {
      zone.style.display = 'block';
      zone.style.top = (F.catchTop * 100) + '%';
      zone.style.height = (F.catchH * 100) + '%';
      marker.style.display = 'block';
      marker.style.top = (F.fishPos * 100) + '%';
    } else {
      zone.style.display = 'none';
      marker.style.display = 'none';
    }
    tension.style.height = Math.max(0, Math.min(100, F.progress * 100)) + '%';
    tension.style.background = F.progress > 0.6 ? '#9fc48a' : F.progress > 0.3 ? '#e0c47a' : '#d08a7a';
    if (F.phase === 'win' && F.result) {
      hint.textContent = 'You caught a ' + F.result.name + '!';
    }
  };

  F.hintText = function () {
    if (!F.active) return '';
    return PHASE_LABEL[F.phase] || '';
  };
})();
