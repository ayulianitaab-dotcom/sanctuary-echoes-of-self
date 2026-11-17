/* Sanctuary — camera, photo mode, album and photo challenges. */
(function () {
  const P = (SAN.photos = {});
  const S = () => SAN.state.S;
  P.MAX = 18;
  P.mode = false;
  let el = null;
  let lastCapture = null;

  P.available = function () { return !!(S() && S().started && S().world && S().world.hasCamera !== false); };

  function frameRect() {
    const W = SAN.world;
    return { x: W.cam.x + 16, y: W.cam.y + 12, w: 448, h: 252 };
  }
  function contains(fr, px, py) {
    return px >= fr.x && px <= fr.x + fr.w && py >= fr.y && py <= fr.y + fr.h;
  }

  /* ---------------- challenges ---------------- */
  P.challengeList = function () {
    const S_ = S();
    return (SAN.data.photoChallenges || []).map((c) => Object.assign({}, c, { done: !!(S_ && S_.world.photoChallenges[c.id]) }));
  };

  P.evaluateChallenges = function () {
    const S_ = S();
    const W = SAN.world;
    if (!S_ || !W.area) return [];
    const out = [];
    const mins = S_.time.minutes;
    const area = W.cur;
    const fr = frameRect();
    if (area === 'village') {
      const hx = 14.5 * 16, hy = 13 * 16;
      if (Math.abs(W.player.px - hx) < 260 && Math.abs(W.player.py - hy) < 240) out.push('ph_home');
    }
    if ((area === 'beach' || area === 'lighthouse') && mins >= 17 * 60 && mins <= 20 * 60 + 30) out.push('ph_lighthouse');
    if (SAN.cat.sprite && contains(fr, SAN.cat.sprite.px, SAN.cat.sprite.py) && SAN.cat.sprite.state === 'sleep') out.push('ph_cat');
    if (W.npcs.filter((n) => contains(fr, n.px, n.py)).length >= 3) out.push('ph_life');
    if (S_.time.weather === 'rain' || S_.time.weather === 'storm') out.push('ph_rain');
    if (area === 'meadow' && (mins >= 21 * 60 || mins < 5 * 60)) out.push('ph_night');
    if (area === 'grove') out.push('ph_grove');
    if (S_.time.festivalToday || (S_.world.lanternNight && S_.world.lanternDay === S_.time.day)) out.push('ph_festival');
    return out;
  };

  /* ---------------- photo mode ---------------- */
  P.open = function () {
    const S_ = S();
    if (!S_ || !S_.started || P.mode) return;
    P.mode = true;
    if (SAN.ui.dialogueState) SAN.ui.closeDialogue();
    el = document.createElement('div');
    el.id = 'photo-mode';
    el.innerHTML = `
      <div class="photo-frame">
        <span class="pfc tl"></span><span class="pfc tr"></span><span class="pfc bl"></span><span class="pfc br"></span>
        <div class="photo-top">
          <span class="photo-brand">SANCTUARY CAMERA</span>
          <span class="photo-meta" id="photo-meta"></span>
        </div>
        <div class="photo-bottom">
          <input id="photo-caption" class="photo-caption" maxlength="60" placeholder="a small caption (optional)">
          <div class="photo-actions">
            <button class="btn btn-ghost" id="photo-close">Exit</button>
            <button class="btn btn-primary" id="photo-shoot">Take photo</button>
          </div>
        </div>
        <div class="photo-flash" id="photo-flash"></div>
      </div>`;
    document.getElementById('ui-root').appendChild(el);
    const meta = document.getElementById('photo-meta');
    if (meta) meta.textContent = SAN.util.SEASONS[S_.time.season] + ' ' + S_.time.day + ' · ' + SAN.time.clockLabel() + ' · ' + SAN.world.area.name;
    el.querySelector('#photo-close').addEventListener('click', () => P.close());
    el.querySelector('#photo-shoot').addEventListener('click', () => P.capture());
    SAN.audio.sfx('open');
  };

  P.close = function () {
    P.mode = false;
    if (el) { el.remove(); el = null; }
  };

  P.capture = function () {
    const S_ = S();
    const W = SAN.world;
    if (!S_ || !W.area) return null;
    const src = document.getElementById('game');
    if (!src) return null;
    const out = document.createElement('canvas');
    out.width = 336; out.height = 189;
    const ctx = out.getContext('2d');
    try { ctx.drawImage(src, 16, 12, 448, 252, 0, 0, 336, 189); } catch (e) { return null; }
    const data = out.toDataURL('image/jpeg', 0.55);
    const captionEl = document.getElementById('photo-caption');
    const photo = {
      id: 'p' + Date.now() + Math.floor(Math.random() * 999),
      data,
      area: W.cur,
      areaName: W.area.name,
      season: S_.time.season,
      day: S_.time.day,
      year: S_.time.year,
      minutes: Math.round(S_.time.minutes),
      weather: S_.time.weather,
      caption: captionEl ? captionEl.value.trim().slice(0, 60) : '',
      at: Date.now(),
    };
    S_.photos.unshift(photo);
    while (S_.photos.length > P.MAX) S_.photos.pop();

    const done = P.evaluateChallenges();
    let reward = 0;
    const names = [];
    done.forEach((id) => {
      if (S_.world.photoChallenges[id]) return;
      S_.world.photoChallenges[id] = true;
      const ch = (SAN.data.photoChallenges || []).find((c) => c.id === id);
      if (ch) { reward += ch.reward; names.push(ch.name); }
    });
    if (reward) SAN.state.earn(reward);

    const flash = document.getElementById('photo-flash');
    if (flash) {
      flash.classList.add('on');
      setTimeout(() => flash.classList.remove('on'), 220);
    }
    SAN.audio.sfx('catch');
    if (names.length) {
      SAN.ui.toast('Photo challenge — ' + names.join(', ') + (reward ? ' (+' + reward + ' coins)' : ''), 'achievement');
    } else {
      SAN.ui.toast('Photograph saved to your album.', 'info');
    }
    lastCapture = { photo, done, reward, names };
    SAN.save.autosave(true);
    return lastCapture;
  };

  P.last = function () { return lastCapture; };

  /* album helpers */
  P.remove = function (id) {
    const S_ = S();
    if (!S_) return;
    S_.photos = S_.photos.filter((p) => p.id !== id);
    SAN.save.autosave(true);
  };
  P.setCaption = function (id, caption) {
    const S_ = S();
    const p = S_ && S_.photos.find((x) => x.id === id);
    if (!p) return;
    p.caption = (caption || '').slice(0, 60);
    SAN.save.autosave();
  };
  P.timeLabel = function (p) {
    return SAN.util.SEASONS[p.season] + ' ' + p.day + ', Year ' + p.year + ' · ' + SAN.util.fmtTime(p.minutes);
  };
})();
