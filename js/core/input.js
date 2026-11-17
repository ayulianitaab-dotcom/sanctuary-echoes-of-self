/* Sanctuary — input: keyboard, mouse, mobile joystick + action buttons */
(function () {
  const I = (SAN.input = {});
  const down = {};
  const pressedNow = {};
  const handlers = [];
  I.joy = { x: 0, y: 0, active: false };
  I.touchActionHeld = false;
  I.touchActionPressed = false;
  I.pointer = { x: 0, y: 0, worldX: 0, worldY: 0 };
  I.mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  const MAP = {
    up: ['ArrowUp', 'w', 'W'],
    down: ['ArrowDown', 's', 'S'],
    left: ['ArrowLeft', 'a', 'A'],
    right: ['ArrowRight', 'd', 'D'],
    run: ['Shift'],
    interact: ['e', 'E', ' '],
  };

  I.bind = function () {
    window.addEventListener('keydown', (e) => {
      const k = e.key;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(k)) e.preventDefault();
      if (!down[k]) pressedNow[k] = true;
      down[k] = true;
      for (const h of handlers) {
        try { if (h(k, e) === true) { e.preventDefault(); break; } } catch (err) { console.error(err); }
      }
    });
    window.addEventListener('keyup', (e) => { down[e.key] = false; });
    window.addEventListener('blur', () => { for (const k in down) down[k] = false; I.joy.active = false; I.joy.x = I.joy.y = 0; });

    // first touch anywhere reveals the on-screen controls
    window.addEventListener('touchstart', () => document.body.classList.add('touch'), { passive: true });

    // mobile joystick
    const joyEl = document.getElementById('joystick');
    const knob = document.getElementById('joystick-knob');
    if (joyEl) {
      let id = null, cx = 0, cy = 0, R = 42;
      const start = (e) => {
        const t = e.changedTouches ? e.changedTouches[0] : e;
        const r = joyEl.getBoundingClientRect();
        cx = r.left + r.width / 2; cy = r.top + r.height / 2; R = r.width / 2;
        if (R <= 0) return;
        id = t.identifier != null ? t.identifier : 'mouse';
        I.joy.active = true;
        move(e);
        if (e.preventDefault) e.preventDefault();
      };
      const move = (e) => {
        if (!I.joy.active) return;
        let t = e;
        if (e.changedTouches) {
          t = Array.from(e.changedTouches).find((x) => (x.identifier != null ? x.identifier : 'mouse') === id);
          if (!t) return;
        }
        let dx = t.clientX - cx, dy = t.clientY - cy;
        const len = Math.hypot(dx, dy) || 1;
        const cl = Math.min(len, R);
        const nx = (dx / len) * (cl / R), ny = (dy / len) * (cl / R);
        I.joy.x = Math.abs(nx) < 0.18 ? 0 : nx;
        I.joy.y = Math.abs(ny) < 0.18 ? 0 : ny;
        if (knob) knob.style.transform = `translate(${nx * R * 0.6}px, ${ny * R * 0.6}px)`;
        e.preventDefault();
      };
      const end = (e) => {
        I.joy.active = false; I.joy.x = 0; I.joy.y = 0;
        if (knob) knob.style.transform = 'translate(0,0)';
      };
      joyEl.addEventListener('touchstart', start, { passive: false });
      joyEl.addEventListener('touchmove', move, { passive: false });
      joyEl.addEventListener('touchend', end);
      joyEl.addEventListener('mousedown', start);
      window.addEventListener('mousemove', (e) => { if (I.joy.active) move(e); });
      window.addEventListener('mouseup', end);
    }

    const bindBtn = (el, onDown, onUp) => {
      if (!el) return;
      const s = (e) => { e.preventDefault(); onDown(); };
      const u = (e) => { e.preventDefault(); if (onUp) onUp(); };
      el.addEventListener('touchstart', s, { passive: false });
      el.addEventListener('touchend', u, { passive: false });
      el.addEventListener('mousedown', s);
      el.addEventListener('mouseup', u);
      el.addEventListener('mouseleave', u);
    };
    bindBtn(document.getElementById('btn-action'), () => { I.touchActionPressed = true; I.touchActionHeld = true; }, () => { I.touchActionHeld = false; });
    bindBtn(document.getElementById('btn-run'), () => { I.touchRun = true; }, () => { I.touchRun = false; });
    bindBtn(document.getElementById('btn-menu'), () => { SAN.ui && SAN.ui.togglePause(); });
  };

  I.onKey = (fn) => handlers.push(fn);

  I.is = (action) => (MAP[action] || []).some((k) => down[k]);
  I.wasPressed = (action) => (MAP[action] || []).some((k) => pressedNow[k]);
  I.rawDown = (k) => !!down[k];

  I.moveVector = () => {
    let x = 0, y = 0;
    if (I.is('left')) x -= 1;
    if (I.is('right')) x += 1;
    if (I.is('up')) y -= 1;
    if (I.is('down')) y += 1;
    if (I.joy.x || I.joy.y) { x = I.joy.x; y = I.joy.y; }
    const m = Math.hypot(x, y);
    if (m > 1) { x /= m; y /= m; }
    return { x, y, mag: Math.min(1, m) };
  };

  I.running = () => I.is('run') || !!I.touchRun;
  I.consumeInteract = () => {
    const p = I.wasPressed('interact') || I.touchActionPressed;
    I.touchActionPressed = false;
    return p;
  };
  I.clearFrame = () => {
    for (const k in pressedNow) delete pressedNow[k];
    I.touchActionPressed = false;
  };
})();
