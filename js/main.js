/* Sanctuary — boot + main loop */
(function () {
  const U = SAN.util;
  let last = 0, hudTimer = 0, achTimer = 0, timeSec = 0, running = false;
  const particles = [];
  let petalCooldown = 0;

  function boot() {
    const canvas = document.getElementById('game');
    SAN.render.setup(canvas);
    SAN.ui.init();
    SAN.input.bind();

    // fishing has priority over the pause menu for Escape
    SAN.input.onKey(function (k) {
      if (SAN.fishing.active) {
        if (k === 'Escape') { SAN.fishing.stop(true); return true; }
        if (k === ' ' || k === 'e' || k === 'E') { /* handled by polling */ }
        return true;
      }
      return false;
    });
    SAN.input.onKey(function (k) { return SAN.ui.handleKey(k); });

    canvas.addEventListener('click', onCanvasClick);
    // Web layout: follow the page viewport, not a fixed device frame.
    const relayout = function () {
      const beforeW = SAN.render.width(), beforeH = SAN.render.height();
      SAN.render.resize();
      const W = SAN.world;
      if (!W.area) return;
      if (SAN.render.width() !== beforeW || SAN.render.height() !== beforeH) {
        // keep the player framed instead of leaving them off-screen after a resized view
        W.cam.x = W.player.px - SAN.render.width() / 2 + 8;
        W.cam.y = W.player.py - SAN.render.height() / 2 + 10;
      }
      W.clampCam();
    };
    let resizeTimer = 0;
    function scheduleLayout() {
      // a timer, not rAF: sizing must still update when the tab is backgrounded
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(relayout, 60);
    }
    window.addEventListener('resize', scheduleLayout);
    window.addEventListener('orientationchange', function () { setTimeout(relayout, 220); });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', scheduleLayout);
    window.addEventListener('pageshow', scheduleLayout);
    // container changes (dock breakpoints, panels, browser chrome) do not always fire window.resize
    if (window.ResizeObserver) {
      new ResizeObserver(scheduleLayout).observe(document.getElementById('canvas-wrap'));
    }
    SAN.relayout = scheduleLayout;
    // safety net: observers can be deferred while the tab is occluded, so also
    // reconcile the canvas size cheaply (layout() no-ops when nothing changed)
    setInterval(relayout, 500);
    const resumeAudio = () => { SAN.audio.init(); };
    document.addEventListener('pointerdown', resumeAudio);
    document.addEventListener('keydown', resumeAudio);
    window.addEventListener('beforeunload', function () {
      if (SAN.state.S && SAN.state.S.started) SAN.save.autosave(true);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && SAN.state.S && SAN.state.S.started) SAN.save.autosave();
    });

    SAN.screens.showTitle();
    running = true;
    requestAnimationFrame(loop);
  }

  function onCanvasClick(e) {
    if (!SAN.state.S || !SAN.state.S.started || SAN.ui.isPaused()) return;
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const sx = (e.clientX - rect.left) / rect.width * SAN.render.width() + SAN.world.cam.x;
    const sy = (e.clientY - rect.top) / rect.height * SAN.render.height() + SAN.world.cam.y;
    const W = SAN.world;
    const p = W.player;
    if (SAN.cat.sprite) {
      const c = SAN.cat.sprite;
      if (Math.abs(c.px - sx) < 14 && Math.abs(c.py - sy + 6) < 14 && U.dist(c.px, c.py, p.px, p.py) < 90) {
        SAN.cat.pet();
        return;
      }
    }
    for (const n of W.npcs) {
      if (Math.abs(n.px - sx) < 14 && Math.abs(n.py - sy + 8) < 16 && U.dist(n.px, n.py, p.px, p.py) < 80) {
        SAN.actions.talkTo(n);
        return;
      }
    }
  }

  function spawnPetal(x, y) {
    particles.push({
      x, y, vx: (Math.random() - 0.5) * 22, vy: -12 - Math.random() * 14,
      life: 1, color: U.pick(['#f2c9dc', '#f6e0b8', '#d8c8ee']), size: 1.5 + Math.random(),
    });
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 34 * dt;
      p.life -= dt * 1.4;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles() {
    const ctx = SAN.render.ctx();
    const cam = SAN.world.cam;
    particles.forEach((p) => {
      ctx.fillStyle = U.rgba(p.color, Math.max(0, p.life));
      ctx.fillRect(Math.round(p.x - cam.x), Math.round(p.y - cam.y), p.size, p.size + 1);
    });
  }

  function loop(ts) {
    if (!running) return;
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
    last = ts;
    timeSec += dt;

    const S = SAN.state.S;
    SAN.ui.update(dt);

    if (!S) { return; }

    const modal = SAN.ui.isPaused();
    if (!modal) {
      SAN.time.tick(dt);
      if (!SAN.fishing.active) {
        const mv = SAN.input.moveVector();
        SAN.world.update(dt, mv);
        SAN.living.update(dt);
        const ch = SAN.world.area && SAN.world.area.grid[Math.floor(SAN.world.player.y)] && SAN.world.area.grid[Math.floor(SAN.world.player.y)][Math.floor(SAN.world.player.x)];
        petalCooldown -= dt;
        if (ch === ',' && petalCooldown <= 0 && SAN.world.player.moving) {
          petalCooldown = 0.34;
          spawnPetal(SAN.world.player.px + (Math.random() - 0.5) * 10, SAN.world.player.py - 2);
        }
        SAN.cat.update(dt);
      }
      const pressed = SAN.input.consumeInteract();
      const held = SAN.input.is('interact') || SAN.input.touchActionHeld;
      if (SAN.fishing.active) {
        SAN.fishing.update(dt, pressed, held);
      } else if (pressed && !SAN.ui.dialogueState) {
        SAN.actions.interact();
      }
      updateParticles(dt);
    }

    // render
    if (S.started && SAN.world.area && !SAN.ui.titleActive) {
      drawFrame(S);
    }
    SAN.input.clearFrame();

    hudTimer += dt;
    if (hudTimer > 0.25) {
      hudTimer = 0;
      SAN.ui.refreshHUD();
    }
    achTimer += dt;
    if (achTimer > 3) {
      achTimer = 0;
      SAN.progression.checkAchievements();
    }
    if (S.started && !modal) SAN.save.autosave();
  }

  function drawFrame(S) {
    const R = SAN.render;
    const W = SAN.world;
    const area = W.area;
    const scene = {
      area,
      cam: W.cam,
      player: { px: W.player.px, py: W.player.py, sprite: W.playerSprite() },
      npcs: W.npcs.map((n) => ({
        px: n.px, py: n.py, x: n.x, def: Object.assign({}, n.def, { moving: n.moving }), facing: n.facing, moving: n.moving, act: n.act,
        pose: n.pose, bubble: n.bubble,
      })),
      cat: SAN.cat.sprite,
      timeSec,
      weather: S.time.weather,
      hint: (S.settings.showHints !== false && !SAN.fishing.active && !SAN.ui.isPaused()) ? W.hint : null,
      label: area.name,
    };
    R.drawWorld(scene);
    drawParticles();
    if (area.weatherFx) {
      R.drawWeather(S.time.weather, timeSec, 1);
    }
    R.drawLighting(S.time.minutes, area.weatherFx ? S.time.weather : 'clear', area);
    const ctx = R.ctx();
    if (area.id === 'home') {
      // soft vignette for interiors
      const g = ctx.createRadialGradient(R.width() / 2, R.height() / 2, 40, R.width() / 2, R.height() / 2, 230);
      g.addColorStop(0, 'rgba(40,28,22,0)');
      g.addColorStop(1, 'rgba(40,28,22,0.28)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, R.width(), R.height());
    }
    if (S.time.weather === 'fog' && area.weatherFx) {
      // handled in drawLighting
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else boot();
})();
