/* Sanctuary — world runtime: area loading, collision, camera, NPC schedules, interaction discovery */
(function () {
  const W = SAN.world;
  const T = 16;
  const U = SAN.util;

  W.T = T;
  W.area = null;
  W.cur = null;
  W.cam = { x: 0, y: 0 };
  W.npcs = [];
  W.player = { px: 0, py: 0, x: 0, y: 0, facing: 'down', moving: false, walkPhase: 0, sprite: null };
  W.hint = null;
  W.fade = 0;
  W.transitionCooldown = 0;
  W.walked = 0;
  W.lastStep = 0;

  function solidChars() { return '~x_'; }

  W.buildSolids = function (a) {
    if (a._solids) return a._solids;
    const s = new Uint8Array(a.w * a.h);
    for (let y = 0; y < a.h; y++) {
      for (let x = 0; x < a.w; x++) {
        const ch = a.grid[y][x];
        if (solidChars().indexOf(ch) >= 0) s[y * a.w + x] = 1;
      }
    }
    a.props.forEach((p) => {
      if (!p.solid) return;
      for (let y = p.y; y < p.y + (p.h || 1); y++) {
        for (let x = p.x; x < p.x + (p.w || 1); x++) {
          if (x >= 0 && y >= 0 && x < a.w && y < a.h) s[y * a.w + x] = 1;
        }
      }
    });
    a.props.forEach((p) => {
      if (!p.clear) return;
      for (let y = p.y; y < p.y + (p.h || 1); y++) {
        for (let x = p.x; x < p.x + (p.w || 1); x++) {
          if (x >= 0 && y >= 0 && x < a.w && y < a.h) s[y * a.w + x] = 0;
        }
      }
    });
    a._solids = s;
    return s;
  };

  W.isSolid = function (tx, ty) {
    const a = W.area;
    if (!a) return true;
    if (tx < 0 || ty < 0 || tx >= a.w || ty >= a.h) return true;
    const s = W.buildSolids(a);
    return !!s[ty * a.w + tx];
  };

  W.locked = function (key) {
    const S = SAN.state.S;
    if (!S) return true;
    if (key === 'meadow') return !S.unlocked.meadow;
    return false;
  };

  /* ---------------- area loading ---------------- */
  W.load = function (id, tx, ty, opts) {
    const a = W.areas[id];
    if (!a) { console.warn('Unknown area', id); return; }
    const S = SAN.state.S;
    W.buildSolids(a);
    W.cur = id;
    W.area = a;
    W.npcs = [];
    let px = tx != null ? tx : a.spawn.x;
    let py = ty != null ? ty : a.spawn.y;
    // nudge off solid tiles
    if (W.isSolid(Math.floor(px), Math.floor(py))) {
      const spot = W.findWalkable(Math.floor(px), Math.floor(py));
      if (spot) { px = spot.x + 0.5; py = spot.y + 0.5; }
    }
    S.player.area = id;
    S.player.x = px;
    S.player.y = py;
    W.player.x = px; W.player.y = py;
    W.player.px = px * T; W.player.py = py * T;
    W.player.facing = opts && opts.facing ? opts.facing : W.player.facing;
    const camX = W.player.px - SAN.render.width() / 2 + 8;
    const camY = W.player.py - SAN.render.height() / 2 + 10;
    W.cam.x = camX; W.cam.y = camY;
    W.clampCam();
    W.spawnNPCs(true);
    W.transitionCooldown = 0.5;
    if (S) {
      if (!S.discovered[id]) {
        S.discovered[id] = true;
        if (SAN.progression) SAN.progression.onDiscover(id);
      }
      S.player.discoveredCount = Object.keys(S.discovered).length;
    }
    if (SAN.living) SAN.living.onEnter(id);
    if (SAN.audio) {
      SAN.audio.playMusic(a.music);
      if (a.region === 'indoor') SAN.audio.ambient(a.ambient);
      else if (S.time.weather === 'rain' || S.time.weather === 'storm') SAN.audio.ambient(S.time.weather);
      else SAN.audio.ambient(a.ambient);
    }
    if (SAN.quests && S) SAN.quests.notify('visit', id, 1);
    if (SAN.ui) SAN.ui.refreshHUD();
  };

  W.findWalkable = function (tx, ty) {
    const a = W.area;
    for (let r = 0; r < 12; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const x = tx + dx, y = ty + dy;
          if (x < 0 || y < 0 || x >= a.w || y >= a.h) continue;
          if (!W.isSolid(x, y)) return { x, y };
        }
      }
    }
    return null;
  };

  W.clampCam = function () {
    const a = W.area;
    if (!a) return;
    const vw = SAN.render.width(), vh = SAN.render.height();
    const wpx = a.w * T, hpx = a.h * T;
    if (wpx <= vw) W.cam.x = (wpx - vw) / 2;
    else W.cam.x = U.clamp(W.cam.x, 0, wpx - vw);
    if (hpx <= vh) W.cam.y = (hpx - vh) / 2;
    else W.cam.y = U.clamp(W.cam.y, 0, hpx - vh - 8);
  };

  /* ---------------- NPC scheduling ---------------- */
  W.npcScheduleEntry = function (def) {
    const S = SAN.state.S;
    const mins = S.time.minutes;
    const hour = Math.floor(mins / 60) % 24;
    if (def.always) return def.schedule[0];
    const rainy = S.time.weather === 'rain' || S.time.weather === 'storm';
    if (rainy && def.ifRain) return Object.assign({ from: 0, to: 24 }, def.ifRain);
    for (const e of def.schedule) {
      if (hour >= e.from && hour < e.to) return e;
    }
    return null;
  };

  W.spawnNPCs = function (instant) {
    const S = SAN.state.S;
    const defs = SAN.data.npcOrder;
    W.npcs = [];
    defs.forEach((id) => {
      const def = SAN.data.npcs[id];
      const entry = W.npcScheduleEntry(def);
      if (!entry || entry.area !== W.cur) return;
      let ex = entry.x, ey = entry.y;
      if (W.isSolid(ex, ey)) {
        const spot = W.findWalkable(ex, ey);
        if (spot) { ex = spot.x; ey = spot.y; }
      }
      const prev = W.npcs.find((n) => n.def.id === id);
      W.npcs.push({
        def, x: ex + 0.5, y: ey + 0.5, px: (prev ? prev.px : (ex + 0.5) * T), py: (prev ? prev.py : (ey + 0.5) * T),
        facing: 'down', moving: false, think: 1 + Math.random() * 3,
        anchor: { x: ex + 0.5, y: ey + 0.5 }, target: { x: ex + 0.5, y: ey + 0.5 },
        act: entry.act, pose: 'stand', bubble: null, chatTimer: 0, chatting: false,
      });
    });
  };

  W.refreshNPCsIfNeeded = function () {
    const S = SAN.state.S;
    const hour = Math.floor(S.time.minutes / 60);
    if (hour === W.lastHour) return;
    W.lastHour = hour;
    W.spawnNPCs();
  };

  /* ---------------- player ---------------- */
  const FOOT_W = 9, FOOT_H = 6;

  function blockedAt(px, py, area) {
    const x1 = Math.floor((px - FOOT_W / 2) / T), x2 = Math.floor((px + FOOT_W / 2 - 0.01) / T);
    const y1 = Math.floor((py - FOOT_H) / T), y2 = Math.floor((py - 0.01) / T);
    if (x1 < 0 || y1 < 0 || x2 >= area.w || y2 >= area.h) return true;
    for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) if (W.isSolid(x, y)) return true;
    return false;
  }

  W.movePlayer = function (dx, dy, dt, running) {
    const S = SAN.state.S;
    const a = W.area;
    if (!a) return;
    let speed = running ? 108 : 62;
    if (S.player.energy <= 0) speed *= 0.65;
    const p = W.player;
    const len = Math.hypot(dx, dy);
    if (len < 0.01) { p.moving = false; return; }
    dx /= len; dy /= len;
    p.moving = true;
    if (Math.abs(dx) > Math.abs(dy)) p.facing = dx < 0 ? 'left' : 'right';
    else p.facing = dy < 0 ? 'up' : 'down';

    const nx = p.px + dx * speed * dt;
    const ny = p.py + dy * speed * dt;
    if (!blockedAt(nx, p.py, a)) p.px = nx;
    if (!blockedAt(p.px, ny, a)) p.py = ny;

    p.x = p.px / T; p.y = p.py / T;
    S.player.x = p.x; S.player.y = p.y; S.player.facing = p.facing;
    p.walkPhase += dt * (running ? 14 : 9);
    W.walked += speed * dt;
    if (W.walked - W.lastStep > 34) {
      W.lastStep = W.walked;
      const ch = a.grid[Math.floor(p.y)] && a.grid[Math.floor(p.y)][Math.floor(p.x)];
      if (ch === 'w' || ch === '=' || ch === 'o' || ch === 's') SAN.audio.sfx('step');
      else SAN.audio.sfx('grass');
      SAN.cat && SAN.cat.onPlayerWalk && SAN.cat.onPlayerWalk();
      if (S.player.energy > 0 && running) S.player.energy = Math.max(0, S.player.energy - dt * 0.35);
    }
    W.updateCamera(dt);
    W.checkExits();
    W.checkDoors();
  };

  W.updateCamera = function (dt) {
    const p = W.player;
    const tx = p.px - SAN.render.width() / 2 + 8;
    const ty = p.py - SAN.render.height() / 2 + 10;
    const k = Math.min(1, dt * 8);
    W.cam.x = U.lerp(W.cam.x, tx, k);
    W.cam.y = U.lerp(W.cam.y, ty, k);
    W.clampCam();
  };

  W.checkExits = function () {
    if (W.transitionCooldown > 0) return;
    const a = W.area;
    const p = W.player;
    const tx = Math.floor(p.x), ty = Math.floor(p.y);
    for (const ex of a.exits) {
      if (tx >= ex.x && tx < ex.x + ex.w && ty >= ex.y && ty < ex.y + ex.h) {
        SAN.actions.transition(ex);
        return;
      }
    }
  };

  W.checkDoors = function () {
    if (W.transitionCooldown > 0) return;
    const a = W.area;
    const p = W.player;
    for (const pr of a.props) {
      if (!pr.auto) continue;
      const cxp = (pr.x + (pr.w || 1) / 2) * T;
      const cyp = (pr.y + (pr.h || 1) / 2) * T;
      if (Math.abs(p.px - cxp) < 11 && Math.abs(p.py - cyp) < 14) {
        const it = pr.interact;
        if (it && it.type === 'area') {
          const key = it.to === 'meadow' ? 'meadow' : null;
          if (key && W.locked(key)) { SAN.ui.toast('This path is still hidden from you.'); return; }
          W.load(it.to, it.tx, it.ty);
          SAN.audio.sfx('door');
        }
      }
    }
  };

  /* ---------------- NPC + cat update ---------------- */
  W.pickNpcBehaviour = function (n, rain, night) {
    if (n.huddle && n.target) return;
    const base = n.anchor;
    if (rain) { n.target = { x: base.x, y: base.y + 0.35 }; n.pose = 'hurry'; return; }
    const sitSpot = W.area.props.find((p) => {
      if (!(p.t === 'bench' || p.t === 'chair' || p.t === 'teatable')) return false;
      const cx = p.x + (p.w || 1) / 2;
      return Math.abs(cx - base.x) < 2.4 && Math.abs(p.y + (p.h || 1) / 2 - base.y) < 2.2;
    });
    if (sitSpot && Math.random() < 0.4) { n.pose = 'sit'; n.target = { x: base.x, y: base.y }; return; }
    if (Math.random() < 0.3) { n.pose = 'stand'; n.target = { x: base.x, y: base.y }; return; }
    const r = night ? 1.8 : 3.6;
    for (let tries = 0; tries < 9; tries++) {
      const nx = base.x + (Math.random() - 0.5) * r * 2;
      const ny = base.y + (Math.random() - 0.5) * r * 2;
      if (nx < 1 || ny < 1 || nx > W.area.w - 1 || ny > W.area.h - 1) continue;
      if (!W.isSolid(Math.floor(nx), Math.floor(ny))) { n.target = { x: nx, y: ny }; n.pose = 'walk'; return; }
    }
    n.target = { x: base.x, y: base.y };
    n.pose = 'stand';
  };

  W.updateNPCs = function (dt) {
    const S = SAN.state.S;
    const rain = S.time.weather === 'rain' || S.time.weather === 'storm';
    const night = S.time.minutes >= 21 * 60 || S.time.minutes < 6 * 60;
    W.npcs.forEach((n) => {
      if (n.chatTimer > 0) {
        n.chatTimer -= dt;
        n.moving = false;
        if (n.chatTimer <= 0) n.chatting = false;
      } else {
        n.think -= dt;
        if (n.think <= 0) {
          n.think = 2.5 + Math.random() * 5.5;
          W.pickNpcBehaviour(n, rain, night);
        }
        const tx = n.target.x * T, ty = n.target.y * T;
        const d = Math.hypot(n.px - tx, n.py - ty);
        if (d > 1.5) {
          const speed = (rain ? 40 : n.pose === 'hurry' ? 34 : 24) * dt;
          const step = Math.min(speed, d);
          const beforeX = n.px, beforeY = n.py;
          n.px += ((tx - n.px) / d) * step;
          n.py += ((ty - n.py) / d) * step;
          n.moving = true;
          if (n.pose !== 'hurry') n.pose = 'walk';
          n.facing = Math.abs(n.px - beforeX) > Math.abs(n.py - beforeY) ? (n.px < beforeX ? 'left' : 'right') : (n.py < beforeY ? 'up' : 'down');
        } else {
          n.moving = false;
          n.huddle = false;
          if (n.pose === 'walk' || n.pose === 'hurry') n.pose = 'stand';
        }
      }
      const p = W.player;
      if (Math.hypot(p.px - n.px, p.py - n.py) < 42) {
        n.facing = Math.abs(p.px - n.px) > Math.abs(p.py - n.py) ? (p.px < n.px ? 'left' : 'right') : (p.py < n.py ? 'up' : 'down');
        n.near = true;
      } else n.near = false;
    });
  };

  /* ---------------- interaction discovery ---------------- */
  function distToProp(p, ppx, ppy) {
    const x1 = p.x * T, y1 = p.y * T;
    const x2 = x1 + (p.w || 1) * T, y2 = y1 + (p.h || 1) * T;
    const cx = U.clamp(ppx, x1, x2), cy = U.clamp(ppy, y1, y2);
    return Math.hypot(ppx - cx, ppy - cy);
  }

  W.facingTile = function () {
    const p = W.player;
    let x = Math.floor(p.x), y = Math.floor(p.y);
    if (p.facing === 'left') x--;
    if (p.facing === 'right') x++;
    if (p.facing === 'up') y--;
    if (p.facing === 'down') y++;
    return { x, y };
  };

  W.plotAt = function (tx, ty) {
    const a = W.area;
    if (!a.plots) return null;
    return a.plots.find((pl) => pl.x === tx && pl.y === ty) || null;
  };

  W.computeHint = function () {
    const S = SAN.state.S;
    const p = W.player;
    const ppx = p.px, ppy = p.py - 6;
    let best = null;

    // NPCs
    W.npcs.forEach((n) => {
      const d = Math.hypot(n.px - ppx, n.py - ppy);
      if (d < 34 && (!best || d < best.d)) best = { d, kind: 'npc', npc: n, label: 'Talk', px: n.px, py: n.py };
    });
    // cat
    if (SAN.cat && SAN.cat.sprite) {
      const c = SAN.cat.sprite;
      const d = Math.hypot(c.px - ppx, c.py - ppy);
      if (d < 30 && (!best || d < best.d)) best = { d, kind: 'cat', label: 'Pet', px: c.px, py: c.py };
    }
    // props
    W.area.props.forEach((pr) => {
      if (!pr.interact) return;
      const d = distToProp(pr, ppx, ppy);
      const reach = pr.t === 'building' ? 26 : 22;
      if (d < reach && (!best || d < best.d)) {
        best = { d, kind: 'prop', prop: pr, label: 'E', px: (pr.x + (pr.w || 1) / 2) * T, py: pr.y * T + 2 };
      }
    });
    // farm plot in front
    const ft = W.facingTile();
    const plot = W.plotAt(ft.x, ft.y);
    if (plot) {
      const key = plot.area + ':' + plot.x + ',' + plot.y;
      const state = S.farm.plots[key];
      let label = 'Till';
      if (state) {
        if (!state.crop) label = state.tilled ? 'Plant' : 'Till';
        else if (state.stage >= SAN.data.crops[state.crop].days) label = 'Harvest';
        else if (!state.watered) label = 'Water';
        else label = 'Inspect';
      }
      const d = 4;
      if (!best || best.d > 10) best = { d, kind: 'plot', plot, label, px: (ft.x + 0.5) * T, py: (ft.y + 0.4) * T };
    }
    // water for fishing
    const fch = W.area.grid[ft.y] && W.area.grid[ft.y][ft.x];
    if (fch === '~') {
      best = { d: 2, kind: 'water', label: 'Fish', px: (ft.x + 0.5) * T, py: (ft.y + 0.5) * T };
    }
    W.hint = best;
    return best;
  };

  W.update = function (dt, input) {
    if (W.transitionCooldown > 0) W.transitionCooldown -= dt;
    const mv = input ? input : { x: 0, y: 0, mag: 0 };
    if (mv.mag > 0.05) W.movePlayer(mv.x, mv.y, dt, SAN.input.running());
    else { W.player.moving = false; W.updateCamera(dt); W.checkExits(); W.checkDoors(); }
    W.updateNPCs(dt);
    W.refreshNPCsIfNeeded();
    W.computeHint();
  };

  W.npcById = function (id) { return W.npcs.find((n) => n.def.id === id); };

  W.playerSprite = function () {
    const S = SAN.state.S;
    const p = S.player;
    return {
      colors: p.colors, hair: p.hair, accessory: p.accessory, facing: W.player.facing,
      moving: W.player.moving, walkPhase: W.player.walkPhase,
      gender: p.gender, outfit: p.outfit,
    };
  };
})();
