/* Sanctuary: Echoes of Self — core utilities */
window.SAN = window.SAN || {};
(function () {
  const U = (SAN.util = {});

  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.approach = (cur, target, step) =>
    cur < target ? Math.min(cur + step, target) : Math.max(cur - step, target);

  U.esc = (s) =>
    String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));

  // deterministic 2d hash -> [0,1)
  U.hash = (x, y, s) => {
    let h = (x * 374761393 + y * 668265263 + (s || 0) * 1274126177) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h = h ^ (h >>> 16);
    return (h >>> 0) / 4294967296;
  };

  U.rng = (seed) => {
    let s = (seed | 0) || 1337;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  };

  U.uid = () => 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  U.pick = (arr, r) => arr[Math.floor((r ? r() : Math.random()) * arr.length)];
  U.shuffle = (arr, r) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor((r ? r() : Math.random()) * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  U.fmtTime = (mins) => {
    let h = Math.floor(mins / 60) % 24;
    let m = Math.floor(mins % 60);
    const ap = h >= 12 ? 'PM' : 'AM';
    let hh = h % 12; if (hh === 0) hh = 12;
    return hh + ':' + String(m).padStart(2, '0') + ' ' + ap;
  };
  U.fmtClock = (mins) => {
    const h = Math.floor(mins / 60) % 24, m = Math.floor(mins % 60);
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  };

  U.SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
  U.DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  U.phase = (mins) => {
    const h = Math.floor(mins / 60) % 24;
    if (h >= 6 && h < 12) return 'morning';
    if (h >= 12 && h < 17) return 'afternoon';
    if (h >= 17 && h < 21) return 'evening';
    return 'night';
  };

  U.el = (sel, root) => (root || document).querySelector(sel);
  U.els = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  U.dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

  U.hexToRgb = (hex) => {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  };
  U.rgba = (hex, a) => {
    const c = U.hexToRgb(hex);
    return `rgba(${c.r},${c.g},${c.b},${a})`;
  };
  U.mix = (a, b, t) => {
    const A = U.hexToRgb(a), B = U.hexToRgb(b);
    const r = Math.round(U.lerp(A.r, B.r, t));
    const g = Math.round(U.lerp(A.g, B.g, t));
    const bl = Math.round(U.lerp(A.b, B.b, t));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
  };
  U.shade = (hex, amt) => (amt >= 0 ? U.mix(hex, '#ffffff', amt) : U.mix(hex, '#000000', -amt));

  U.clone = (o) => JSON.parse(JSON.stringify(o));
  U.uid_ = U.uid;

  U.pad2 = (n) => String(n).padStart(2, '0');

  U.dateLabel = (t) =>
    `${U.SEASONS[t.season]} ${t.day}, Year ${t.year}`;
})();
