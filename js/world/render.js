/* Sanctuary — pixel-art renderer: tiles, props, characters, weather, portraits */
(function () {
  const R = (SAN.render = {});
  const T = 16;

  /* ---------------- palette ---------------- */
  const C = {
    grass: '#8fbf7a', grass2: '#7fb06a', grassDark: '#6d9e5c', grassLight: '#a6cf8f',
    flowerA: '#f2d0e0', flowerB: '#f6e7b8', flowerC: '#cbc3ee',
    path: '#c9a97e', path2: '#b8976c', pathDark: '#a8865c',
    stone: '#cfc8bb', stone2: '#bdb5a6', stoneJoint: '#a49c8d',
    water: '#7fb6c9', water2: '#6aa4ba', waterLight: '#a9d6e2', waterDeep: '#5b93aa',
    sand: '#efdfb8', sand2: '#e3d0a4', sandDark: '#d3bd8f',
    wood: '#b98d62', wood2: '#a67a52', woodLine: '#8f6743', woodLight: '#cfa87b',
    glassF: '#cfe4cf', glassF2: '#bcd8bc',
    forestF: '#5c7a56', forestF2: '#526e4d', forestLeaf: '#6b8a5f',
    soil: '#8a6247', soil2: '#7a553d', soilLine: '#6b4a35',
    wallp: '#e6d3c4', wallLine: '#d3bda9',
    stoneF: '#b9b2a6', stoneF2: '#aca497', stoneFL: '#c6bfb2',
    rugC: '#b98ba0',
    bedC: '#7fa07c',
  };

  R.T = T;
  R.palette = C;

  let canvas, ctx, W = 480, H = 270;

  R.setup = function (cv) {
    canvas = cv;
    canvas.width = 480;
    canvas.height = 270;
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    W = canvas.width; H = canvas.height;
    return ctx;
  };
  R.width = () => W;
  R.height = () => H;
  R.ctx = () => ctx;

  function px(x, y, w, h, col) {
    ctx.fillStyle = col;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  function circle(x, y, r, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  function ellipse(x, y, rx, ry, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /* =========================================================
     TILES
     ========================================================= */
  R.drawTile = function (ch, sx, sy, tx, ty, t) {
    const h = SAN.util.hash(tx, ty);
    switch (ch) {
      case '.': {
        px(sx, sy, T, T, C.grass);
        if (h > 0.6) px(sx + 3 + h * 5, sy + 5, 2, 1, C.grassDark);
        if (h < 0.2) px(sx + 10, sy + 11, 2, 1, C.grassLight);
        if (h > 0.86) px(sx + 6, sy + 2, 1, 3, C.grass2);
        break;
      }
      case ',': {
        px(sx, sy, T, T, C.grass);
        px(sx + 3, sy + 4, 2, 1, C.grassDark);
        const c = h > 0.66 ? C.flowerA : h > 0.33 ? C.flowerB : C.flowerC;
        px(sx + 7, sy + 7, 2, 2, c);
        px(sx + 7, sy + 9, 1, 3, C.grassDark);
        if (h > 0.5) { px(sx + 12, sy + 11, 2, 2, C.flowerC); }
        break;
      }
      case '#': {
        px(sx, sy, T, T, C.path);
        px(sx, sy + 14, T, 2, C.path2);
        if (h > 0.7) px(sx + 3, sy + 4, 2, 2, C.pathDark);
        if (h < 0.3) px(sx + 11, sy + 9, 2, 2, C.path2);
        break;
      }
      case '=': {
        px(sx, sy, T, T, C.stone);
        px(sx, sy, T, 1, C.stone2);
        px(sx, sy, 1, T, C.stone2);
        px(sx + 7, sy, 1, T, C.stoneJoint);
        px(sx, sy + 11, T, 1, C.stoneJoint);
        break;
      }
      case '~': {
        const wob = Math.sin(t * 1.6 + tx * 0.7 + ty * 0.4) * 2;
        px(sx, sy, T, T, C.water);
        px(sx, sy + 6 + wob, T, 2, C.water2);
        px(sx + 2, sy + 12 - wob, 6, 1, C.waterLight);
        if (h > 0.8) px(sx + 10, sy + 3, 4, 1, C.waterLight);
        break;
      }
      case 's':
        px(sx, sy, T, T, C.sand);
        if (h > 0.7) px(sx + 4, sy + 6, 2, 1, C.sand2);
        if (h < 0.2) px(sx + 10, sy + 12, 3, 1, C.sandDark);
        break;
      case 'w':
        px(sx, sy, T, T, C.wood);
        px(sx, sy + 7, T, 1, C.woodLine);
        px(sx, sy + 15, T, 1, C.woodLine);
        if (h > 0.5) px(sx + 5, sy + 3, 1, 4, C.wood2);
        break;
      case 'g':
        px(sx, sy, T, T, C.glassF);
        px(sx, sy, T, 1, '#e6f2e2');
        px(sx + 7, sy, 1, T, C.glassF2);
        px(sx, sy + 7, T, 1, C.glassF2);
        break;
      case 'm':
        px(sx, sy, T, T, C.forestF);
        if (h > 0.7) px(sx + 3, sy + 4, 3, 2, C.forestLeaf);
        if (h < 0.25) px(sx + 10, sy + 10, 2, 2, '#7d6b4f');
        break;
      case 'c':
        px(sx, sy, T, T, C.soil);
        px(sx, sy + 4, T, 1, C.soilLine);
        px(sx, sy + 11, T, 1, C.soilLine);
        if (h > 0.5) px(sx + 5, sy + 7, 2, 1, C.soil2);
        break;
      case 'x':
        px(sx, sy, T, T, C.wallp);
        px(sx, sy, T, 1, '#efdfd1');
        px(sx + 6, sy + 4, 4, 4, '#dcc3b1');
        px(sx + 6, sy + 4, 4, 1, '#cbb09c');
        break;
      case 'o':
        px(sx, sy, T, T, C.stoneF);
        px(sx, sy, T, 1, C.stoneFL);
        px(sx + 8, sy, 1, T, C.stoneF2);
        px(sx, sy + 8, T, 1, C.stoneF2);
        break;
      case 'r':
        px(sx, sy, T, T, C.rugC);
        px(sx + 1, sy + 1, T - 2, T - 2, '#d0a3b6');
        px(sx + 4, sy + 4, 3, 3, '#e5c6a0');
        break;
      case '_':
        px(sx, sy, T, T, '#1b1a20');
        break;
      case 'F':
        px(sx, sy, T, T, '#93b673');
        px(sx + 2, sy + 3, 1, 6, '#c9b56a');
        px(sx + 6, sy + 2, 1, 7, '#d3bf72');
        px(sx + 10, sy + 3, 1, 6, '#c9b56a');
        px(sx + 13, sy + 4, 1, 5, '#d3bf72');
        break;
      default:
        px(sx, sy, T, T, C.grass);
    }
  };

  /* =========================================================
     PROPS
     ========================================================= */
  function drawTree(x, y, variant) {
    ellipse(x + 8, y + 15, 7, 3, 'rgba(40,50,35,0.22)');
    px(x + 6, y + 6, 4, 9, '#7a5a3e');
    px(x + 6, y + 6, 2, 9, '#8a6a4a');
    const sw = Math.sin(Date.now() / 1400 + x * 0.2) * 1.2;
    circle(x + 8 + sw * 0.4, y + 2, 7, '#4f7a4a');
    circle(x + 4 + sw * 0.5, y + 6, 5, '#5f8d54');
    circle(x + 12 + sw * 0.3, y + 6, 5, '#588449');
    circle(x + 8 + sw * 0.3, y - 1, 5, '#6c9a5e');
    px(x + 5, y + 1, 2, 2, '#7fae6c');
    if (variant === 1) px(x + 10, y + 4, 2, 2, '#8ec07a');
    if (variant === 2) { px(x + 3, y + 7, 2, 2, '#c9dfae'); }
  }
  function drawPine(x, y) {
    ellipse(x + 8, y + 15, 6, 3, 'rgba(30,45,35,0.25)');
    px(x + 7, y + 10, 2, 6, '#6a4f38');
    const sway = Math.sin(Date.now() / 1700 + x) * 1;
    ctx.fillStyle = '#3f6b4a';
    ctx.beginPath();
    ctx.moveTo(x + 8 + sway, y - 4);
    ctx.lineTo(x + 14 + sway, y + 11);
    ctx.lineTo(x + 2 + sway, y + 11);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4e7d56';
    ctx.beginPath();
    ctx.moveTo(x + 8 + sway, y - 1);
    ctx.lineTo(x + 13 + sway, y + 8);
    ctx.lineTo(x + 3 + sway, y + 8);
    ctx.closePath(); ctx.fill();
    px(x + 6, y + 2, 2, 2, '#61936a');
  }
  function drawBush(x, y, berries) {
    ellipse(x + 8, y + 14, 7, 3, 'rgba(40,55,35,0.2)');
    circle(x + 6, y + 9, 5, '#5d8a52');
    circle(x + 11, y + 9, 5, '#547f4b');
    circle(x + 8, y + 6, 5, '#67975a');
    if (berries) { px(x + 4, y + 8, 2, 2, '#c9697a'); px(x + 10, y + 6, 2, 2, '#c9697a'); px(x + 8, y + 11, 2, 2, '#b8556a'); }
  }
  function drawRock(x, y) {
    ellipse(x + 8, y + 14, 7, 3, 'rgba(40,40,40,0.2)');
    ctx.fillStyle = '#a9a496';
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 14); ctx.lineTo(x + 4, y + 7); ctx.lineTo(x + 10, y + 5);
    ctx.lineTo(x + 14, y + 10); ctx.lineTo(x + 13, y + 14); ctx.closePath(); ctx.fill();
    px(x + 5, y + 8, 4, 2, '#bdb8a9');
    px(x + 9, y + 11, 3, 1, '#928d80');
  }
  function drawBuilding(p, x, y) {
    const w = (p.w || 1) * T, h = (p.h || 1) * T;
    const style = p.style || 'cottage';
    const roofs = { home: '#a8667a', store: '#8a7aa8', bakery: '#c98a5e', library: '#6f7f9a', flower: '#b57a9a', teashop: '#8a9a6f', cottage: '#a8846a', shed: '#8a7a68', lighthouse: '#e8e4dc' };
    const walls = { home: '#f2e6d8', store: '#efe4d2', bakery: '#f6e8d2', library: '#e8e2d4', flower: '#f6e6ee', teashop: '#eef0dd', cottage: '#eddfcc', shed: '#e2d6c4', lighthouse: '#f4f2ec' };
    ellipse(x + w / 2, y + h - 3, w * 0.55, 5, 'rgba(40,40,40,0.18)');
    if (style === 'lighthouse') { drawLighthouse(x, y, w, h); return; }
    const roofH = Math.max(12, h * 0.42);
    // walls
    px(x + 2, y + roofH, w - 4, h - roofH - 2, walls[style] || '#efe2d0');
    px(x + 2, y + h - 4, w - 4, 3, '#cbb9a2');
    // roof
    ctx.fillStyle = roofs[style] || '#a8667a';
    ctx.beginPath();
    ctx.moveTo(x - 3, y + roofH + 2);
    ctx.lineTo(x + w / 2, y - 2);
    ctx.lineTo(x + w + 3, y + roofH + 2);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.beginPath();
    ctx.moveTo(x - 3, y + roofH + 2);
    ctx.lineTo(x + w / 2, y - 2);
    ctx.lineTo(x + w / 2, y + roofH + 2);
    ctx.closePath(); ctx.fill();
    px(x + 2, y + roofH, w - 4, 2, 'rgba(0,0,0,0.12)');
    // windows
    const winY = y + roofH + 8;
    for (let i = 0; i < 2; i++) {
      const wx = x + 8 + i * (w - 26);
      if (w < 50 && i === 1) continue;
      px(wx, winY, 9, 8, '#f6e6b8');
      px(wx, winY, 9, 1, '#c9b58a');
      px(wx + 4, winY, 1, 8, '#c9b58a');
    }
    // door at doorRel
    if (p.doorRel) {
      const dx = x + p.doorRel.x * T, dy = y + p.doorRel.y * T;
      px(dx + 2, dy + 2, 12, 14, '#7a5a42');
      px(dx + 3, dy + 3, 10, 12, '#8d6a4c');
      px(dx + 9, dy + 9, 2, 2, '#e6c98a');
    }
    if (p.sign) {
      px(x + w / 2 - 16, y + roofH + 1, 32, 7, '#f4e7cf');
      ctx.fillStyle = '#8a6a4a';
      ctx.font = '6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.sign, x + w / 2, y + roofH + 6.5);
      ctx.textAlign = 'left';
    }
    if (style === 'bakery') { px(x + w - 20, y + 6, 5, 9, '#8a6a4a'); px(x + w - 19, y + 3, 3, 4, 'rgba(255,255,255,0.5)'); }
    if (style === 'flower') { for (let i = 0; i < 4; i++) circle(x + 6 + i * 7, y + h - 2, 2, i % 2 ? '#e8a9c0' : '#d9b8e8'); }
  }
  function drawLighthouse(x, y, w, h) {
    const cx = x + w / 2;
    px(cx - 18, y + 10, 36, h - 12, '#f4f2ea');
    px(cx - 18, y + 10, 4, h - 12, '#e2ded2');
    for (let i = 0; i < 4; i++) px(cx - 18, y + 22 + i * 34, 36, 8, '#c96f7a');
    // lantern room
    px(cx - 12, y - 6, 24, 18, '#d9eef7');
    px(cx - 12, y - 6, 24, 3, '#a9c4d2');
    const glow = 0.4 + Math.sin(Date.now() / 700) * 0.15;
    circle(cx, y + 3, 9, `rgba(255,236,170,${glow})`);
    px(cx - 10, y - 10, 20, 5, '#7a8fa0');
    ctx.fillStyle = '#7a8fa0';
    ctx.beginPath(); ctx.moveTo(cx - 12, y - 10); ctx.lineTo(cx, y - 18); ctx.lineTo(cx + 12, y - 10); ctx.closePath(); ctx.fill();
    // door + windows
    px(cx - 6, y + h - 16, 12, 14, '#8a6a4c');
    px(cx - 5, y + h - 15, 10, 12, '#6d4f38');
    px(cx - 3, y + 30, 6, 7, '#f6e6b8');
    px(cx - 3, y + 56, 6, 7, '#f6e6b8');
    ellipse(x + w / 2, y + h - 2, w * 0.5, 4, 'rgba(40,40,40,0.18)');
  }
  function drawWindmill(x, y, w, h) {
    ellipse(x + w / 2, y + h - 2, w * 0.45, 4, 'rgba(40,40,40,0.2)');
    px(x + 14, y + 20, w - 28, h - 22, '#efe6d2');
    px(x + 14, y + 20, 5, h - 22, '#ddd3bd');
    ctx.fillStyle = '#a8766a';
    ctx.beginPath(); ctx.moveTo(x + 10, y + 22); ctx.lineTo(x + w / 2, y + 2); ctx.lineTo(x + w - 10, y + 22); ctx.closePath(); ctx.fill();
    px(x + w / 2 - 6, y + h - 18, 12, 16, '#8a6a4c');
    px(x + w / 2 - 3, y + 34, 7, 8, '#f6e6b8');
    // sails
    const ang = Date.now() / 2600;
    ctx.save();
    ctx.translate(x + w / 2, y + 26);
    ctx.rotate(ang);
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = '#f7efe0';
      ctx.fillRect(-2, -40, 4, 38);
      ctx.fillStyle = '#d8c6a8';
      ctx.fillRect(-4, -38, 8, 16);
    }
    ctx.restore();
    circle(x + w / 2, y + 26, 3, '#6d5a44');
  }
  function drawFountain(x, y, t) {
    const w = 48, h = 48;
    ellipse(x + 24, y + 44, 24, 6, 'rgba(40,40,40,0.2)');
    px(x + 2, y + 16, 44, 28, '#c9c2b4');
    px(x + 4, y + 18, 40, 24, '#a9c9d4');
    const wob = Math.sin(t * 2) * 1.5;
    px(x + 6, y + 20 + wob, 36, 2, '#c6e4ec');
    px(x + 16, y + 10, 16, 22, '#cfc8bb');
    px(x + 18, y + 12, 12, 8, '#b9d6e0');
    for (let i = 0; i < 4; i++) {
      const ph = (t * 1.5 + i * 0.9) % 4;
      circle(x + 24 + Math.sin(i * 2 + t) * 8, y + 8 - ph * 3, 1.6, `rgba(200,235,245,${0.9 - ph / 5})`);
    }
    circle(x + 24, y + 6, 3, '#dfeef5');
  }

  function drawBubble(text, cx, cy, a) {
    if (!text) return;
    ctx.font = '6px monospace';
    const maxW = 92;
    const words = String(text).split(' ');
    const lines = [];
    let cur = '';
    words.forEach((w) => {
      const test = cur ? cur + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
      else cur = test;
    });
    if (cur) lines.push(cur);
    const wpx = Math.min(maxW, Math.max.apply(null, lines.map((l) => ctx.measureText(l).width))) + 8;
    const hpx = lines.length * 8 + 5;
    const x0 = Math.round(cx - wpx / 2), y0 = Math.round(cy - hpx);
    ctx.fillStyle = 'rgba(250,246,236,' + (0.92 * a) + ')';
    ctx.fillRect(x0, y0, wpx, hpx);
    ctx.fillStyle = 'rgba(120,100,84,' + a + ')';
    ctx.fillRect(x0, y0 + hpx - 1, wpx, 1);
    ctx.fillStyle = 'rgba(60,48,40,' + a + ')';
    ctx.textAlign = 'left';
    lines.forEach((l, i) => ctx.fillText(l, x0 + 4, y0 + 8 + i * 8));
    ctx.fillStyle = 'rgba(250,246,236,' + (0.92 * a) + ')';
    ctx.beginPath();
    ctx.moveTo(cx - 3, y0 + hpx);
    ctx.lineTo(cx + 3, y0 + hpx);
    ctx.lineTo(cx, y0 + hpx + 4);
    ctx.closePath();
    ctx.fill();
    ctx.textAlign = 'left';
  }

  function drawProp(p, x, y, t) {
    const w = (p.w || 1) * T, h = (p.h || 1) * T;
    switch (p.t) {
      case 'tree': drawTree(x, y, p.variant || 0); break;
      case 'pine': drawPine(x, y); break;
      case 'bush': drawBush(x, y, false); break;
      case 'berrybush': drawBush(x, y, true); break;
      case 'rock': drawRock(x, y); break;
      case 'building': drawBuilding(p, x, y); break;
      case 'windmill': drawWindmill(x, y, w, h); break;
      case 'fountain': drawFountain(x, y, t); break;
      case 'bench':
        px(x + 1, y + 8, w - 2, 4, '#a8764f');
        px(x + 1, y + 5, w - 2, 3, '#c08a5c');
        px(x + 2, y + 12, 2, 3, '#7a5a3c');
        px(x + w - 4, y + 12, 2, 3, '#7a5a3c');
        break;
      case 'lamp': {
        px(x + 7, y + 4, 2, 11, '#6d5a44');
        px(x + 4, y + 1, 8, 6, '#7d6a50');
        circle(x + 8, y + 3, 3, `rgba(255,230,160,${0.55 + Math.sin(t * 2 + x) * 0.12})`);
        break;
      }
      case 'board':
        px(x + 1, y + 2, w - 2, 12, '#b98d62');
        px(x + 2, y + 3, w - 4, 10, '#d8b98c');
        px(x + 4, y + 5, 10, 7, '#f4ecd8');
        px(x + 16, y + 6, 8, 5, '#e6dcc0');
        px(x + 8, y + 13, 2, 3, '#8a6a4a');
        break;
      case 'well':
        px(x + 1, y + 8, w - 2, 20, '#b0a89a');
        px(x + 3, y + 10, w - 6, 16, '#40352c');
        px(x + 2, y + 6, w - 4, 4, '#c9c1b3');
        px(x + 4, y + 1, 2, 7, '#8a6a4a');
        px(x + w - 6, y + 1, 2, 7, '#8a6a4a');
        px(x + 3, y, w - 6, 3, '#a8764f');
        break;
      case 'stall':
        px(x + 1, y + 8, w - 2, 10, '#b98d62');
        px(x + 2, y + 9, w - 4, 8, '#d8b98c');
        for (let i = 0; i < 4; i++) px(x + i * 8, y, 4, 8, i % 2 ? '#e8c6d8' : '#f4ecd8');
        px(x + 2, y + 7, w - 4, 2, '#8a6a4a');
        break;
      case 'crate':
        px(x + 2, y + 4, 12, 11, '#b98d62');
        px(x + 3, y + 5, 10, 9, '#cfa87b');
        px(x + 3, y + 8, 10, 1, '#8f6743');
        break;
      case 'barrel':
        px(x + 3, y + 4, 10, 11, '#a67a52');
        px(x + 3, y + 6, 10, 2, '#7d5a3c');
        px(x + 3, y + 11, 10, 2, '#7d5a3c');
        break;
      case 'flowerpot':
        px(x + 5, y + 8, 7, 7, '#c98a6a');
        px(x + 6, y + 9, 5, 5, '#a86a4a');
        circle(x + 8, y + 6, 3, '#8fbf7a');
        circle(x + 7, y + 5, 1.4, '#e8a9c0');
        circle(x + 10, y + 5, 1.4, '#f2e0a0');
        break;
      case 'gatearch':
        px(x + 1, y + 2, 4, 14, '#a8764f');
        px(x + w - 5, y + 2, 4, 14, '#a8764f');
        px(x + 1, y, w - 2, 3, '#c08a5c');
        px(x + 1, y + 2, w - 2, 1, '#8a5a3a');
        break;
      case 'sign':
        px(x + 6, y + 8, 3, 8, '#8a6a4a');
        px(x + 1, y + 3, 14, 7, '#c9a97e');
        px(x + 2, y + 4, 12, 5, '#e0c69f');
        px(x + 4, y + 6, 8, 1, '#8a6a4a');
        break;
      case 'rune': {
        const glow = 0.35 + Math.sin(t * 2 + x) * 0.15;
        px(x + 4, y + 3, 8, 13, '#a8a496');
        px(x + 5, y + 4, 6, 11, '#c2bdac');
        px(x + 4, y + 15, 9, 2, '#8f8b7e');
        circle(x + 9, y + 9, 4, 'rgba(214,240,220,' + glow + ')');
        const sym = p.symbol || 'moth';
        if (sym === 'moth') { px(x + 7, y + 7, 1, 4, '#3f5a48'); px(x + 10, y + 7, 1, 4, '#3f5a48'); px(x + 6, y + 8, 1, 2, '#3f5a48'); px(x + 11, y + 8, 1, 2, '#3f5a48'); }
        else if (sym === 'wave') { px(x + 6, y + 8, 7, 1, '#3f5a48'); px(x + 5, y + 10, 8, 1, '#3f5a48'); px(x + 6, y + 12, 5, 1, '#3f5a48'); }
        else { px(x + 8, y + 7, 2, 6, '#3f5a48'); px(x + 6, y + 9, 2, 2, '#3f5a48'); px(x + 10, y + 9, 2, 2, '#3f5a48'); }
        break;
      }
      case 'grovegate': {
        const S = SAN.state.S;
        const open = !!(S && S.world && S.world.groveOpen);
        px(x + 1, y + 2, 4, 14, '#5f6e4c');
        px(x + w - 5, y + 2, 4, 14, '#5f6e4c');
        if (open) {
          circle(x + w / 2, y + 8, 7, 'rgba(220,240,200,0.22)');
          px(x + 4, y + 13, w - 8, 2, '#7d9a72');
          px(x + w / 2 - 1, y + 4, 2, 9, 'rgba(240,230,190,0.5)');
        } else {
          px(x + 3, y + 12, w - 6, 3, '#6f8a5c');
          px(x + 2, y + 9, w - 4, 2, '#5f7a4c');
          px(x + 4, y + 6, w - 8, 2, '#6f8a5c');
          circle(x + 6, y + 10, 1.6, '#d9a8c0');
          circle(x + w - 7, y + 8, 1.6, '#e8d8a0');
        }
        break;
      }
      case 'piano':
        px(x + 1, y + 7, w - 2, 8, '#6d4f38');
        px(x + 2, y + 8, w - 4, 6, '#8a6a4c');
        px(x + 2, y + 10, w - 4, 4, '#f4ecd8');
        for (let i = 0; i < (w - 6); i += 2) px(x + 3 + i, y + 10, 1, 3, '#3a3448');
        px(x + 2, y + 4, w - 4, 4, '#5f4338');
        px(x + 3, y + 5, w - 6, 1, '#c9a97e');
        break;
      case 'gramophone':
        px(x + 1, y + 9, w - 2, 6, '#8a6a4c');
        px(x + 2, y + 3, 3, 6, '#c9a06a');
        px(x + 4, y + 2, 8, 5, '#e0c08a');
        px(x + 11, y + 4, 3, 3, '#c9a06a');
        circle(x + 8, y + 11, 2 + Math.sin(t * 4) * 0.4, 'rgba(240,220,160,0.5)');
        break;
      case 'birdfeeder':
        px(x + 7, y + 6, 2, 9, '#8a6a4a');
        px(x + 2, y + 4, 12, 2, '#c08a5c');
        px(x + 3, y + 2, 10, 2, '#d9a878');
        circle(x + 3, y + 1, 1.4, '#8f9a8a');
        circle(x + 12, y + 1, 1.4, '#a89a8a');
        if (Math.sin(t * 1.7 + x) > 0.6) circle(x + 5 + Math.sin(t) * 3, y + 2, 1.2, '#e8e0d0');
        break;
      case 'starblanket':
        px(x + 1, y + 2, w - 2, h - 4, '#5f6e88');
        px(x + 2, y + 3, w - 4, h - 6, '#7d8ca8');
        for (let i = 0; i < 6; i++) {
          const sx2 = x + 4 + ((i * 11) % (w - 8));
          const sy2 = y + 4 + ((i * 7) % Math.max(2, h - 9));
          px(sx2, sy2, 1, 1, i % 2 ? '#f4e7b0' : '#dfe6f8');
        }
        px(x + 2, y + h - 5, w - 4, 2, '#d9c8a8');
        break;
      case 'pierend':
        px(x + 6, y + 4, 2, 10, '#7a5a3c');
        px(x + 3, y + 2, 8, 4, '#c9a97e');
        circle(x + 7, y + 3, 2.4, 'rgba(255,226,160,' + (0.5 + Math.sin(t * 2.2) * 0.12) + ')');
        break;
      case 'letterprop':
        px(x + 4, y + 9, 8, 5, '#f4ecd8');
        px(x + 4, y + 9, 8, 1, '#d8c8a8');
        px(x + 7, y + 9, 2, 5, '#c9b08a');
        circle(x + 8, y + 11, 1, '#b06a7a');
        break;
      case 'plaque':
        px(x + 3, y + 2, w - 6, 8, '#f4ecd8');
        px(x + 4, y + 3, w - 8, 6, '#e8dcc0');
        break;
      case 'door':
        px(x + 3, y + 4, 10, 12, '#7a5a42');
        px(x + 4, y + 5, 8, 10, '#e8d6b4');
        px(x + 7, y + 1, 2, 3, '#c9a97e');
        break;
      case 'window':
        px(x + 1, y + 2, w - 2, 12, '#f6e6b8');
        px(x + 1, y + 2, w - 2, 1, '#c9b58a');
        px(x + 1, y + 13, w - 2, 1, '#c9b58a');
        px(x + 1, y + 7, w - 2, 1, '#c9b58a');
        break;
      case 'bed':
        px(x + 1, y + 2, w - 2, h - 2, '#b98d62');
        px(x + 2, y + 3, w - 4, h - 4, '#e8dcc8');
        px(x + 2, y + 3, w - 4, 8, '#c9a9c0');
        px(x + 4, y + 4, 10, 6, '#f2eaf4');
        px(x + 2, y + h - 8, w - 4, 6, '#b9c9e0');
        break;
      case 'wardrobe':
        px(x + 1, y + 1, w - 2, h - 2, '#9a7150');
        px(x + 2, y + 2, w - 4, h - 4, '#b98d62');
        px(x + w / 2, y + 2, 1, h - 4, '#8a6a4a');
        px(x + 3, y + h / 2, 2, 2, '#e8c98a');
        px(x + w - 5, y + h / 2, 2, 2, '#e8c98a');
        break;
      case 'desk':
        px(x + 1, y + 3, w - 2, h - 5, '#a8764f');
        px(x + 2, y + 4, w - 4, 6, '#c9a97e');
        px(x + 4, y + 6, 12, 8, '#f6efe0');
        px(x + 5, y + 7, 10, 1, '#c9b58a');
        px(x + 5, y + 9, 8, 1, '#c9b58a');
        break;
      case 'bookshelf':
        px(x + 1, y, w - 2, h, '#9a7150');
        px(x + 2, y + 1, w - 4, h - 2, '#7a5a3c');
        for (let r = 0; r < 3; r++) {
          for (let i = 0; i < Math.floor((w - 4) / 4); i++) {
            const cols = ['#c98a8a', '#8aa9c9', '#c9c08a', '#a98ac9', '#8ac9a9'];
            px(x + 3 + i * 4, y + 3 + r * 10, 3, 8, cols[(i + r) % 5]);
          }
        }
        break;
      case 'fireplace':
        px(x + 1, y + 2, w - 2, h - 2, '#a09a90');
        px(x + 3, y + 6, w - 6, h - 8, '#3a2f28');
        px(x + 5, y + h - 8, w - 10, 5, '#6b4a35');
        for (let i = 0; i < 3; i++) {
          const f = Math.sin(t * 6 + i * 2) * 1.5;
          circle(x + 8 + i * 4, y + h - 8 + f, 2.6, i % 2 ? '#f0a24a' : '#f6c96a');
        }
        px(x + 1, y, w - 2, 3, '#8a847a');
        break;
      case 'stove':
        px(x + 1, y + 2, w - 2, h - 4, '#8a8a90');
        px(x + 3, y + 4, w - 6, 8, '#4a4a52');
        px(x + 4, y + 6, w - 8, 4, '#c96a4a');
        px(x + 2, y + h - 6, w - 4, 5, '#6a6a72');
        break;
      case 'craftbench':
        px(x + 1, y + 4, w - 2, h - 6, '#a8764f');
        px(x + 2, y + 5, w - 4, 6, '#c9a97e');
        px(x + 4, y + 7, 4, 3, '#8a8a90');
        px(x + 11, y + 7, 5, 2, '#7a5a3c');
        px(x + 3, y + h - 3, 2, 3, '#7a5a3c');
        px(x + w - 5, y + h - 3, 2, 3, '#7a5a3c');
        break;
      case 'table':
        px(x + 1, y + 4, w - 2, 6, '#b98d62');
        px(x + 2, y + 5, w - 4, 4, '#d8b98c');
        px(x + 3, y + 10, 2, 6, '#8a6a4a');
        px(x + w - 5, y + 10, 2, 6, '#8a6a4a');
        px(x + 6, y + 2, 4, 3, '#f6efe0');
        break;
      case 'chair':
        px(x + 3, y + 4, 10, 3, '#b98d62');
        px(x + 3, y + 1, 10, 3, '#c9a97e');
        px(x + 4, y + 7, 2, 7, '#8a6a4a');
        px(x + 10, y + 7, 2, 7, '#8a6a4a');
        break;
      case 'plant':
        px(x + 5, y + 9, 7, 6, '#c98a6a');
        circle(x + 8, y + 6, 4, '#6f9c62');
        circle(x + 5, y + 8, 3, '#7dad6e');
        circle(x + 11, y + 7, 3, '#7dad6e');
        break;
      case 'reeds':
        for (let i = 0; i < 4; i++) {
          const sway = Math.sin(t * 1.8 + i) * 2;
          px(x + 3 + i * 3 + sway * 0.4, y + 4, 1, 11, '#7d9a5a');
          px(x + 3 + i * 3 + sway * 0.4, y + 2, 2, 4, '#a8b87a');
        }
        break;
      case 'scarecrow':
        px(x + 7, y + 4, 2, 12, '#8a6a4a');
        px(x + 2, y + 7, 12, 2, '#8a6a4a');
        px(x + 6, y + 3, 5, 5, '#e6cf9a');
        px(x + 4, y + 1, 9, 3, '#c9a97e');
        px(x + 3, y + 11, 10, 5, '#8a9a6f');
        break;
      case 'waterbarrel':
        px(x + 2, y + 4, 12, 10, '#a67a52');
        px(x + 3, y + 5, 10, 8, '#6a9ab0');
        px(x + 2, y + 5, 12, 2, '#7d5a3c');
        break;
      case 'gate':
        for (let i = 0; i < w / 6; i++) px(x + 2 + i * 6, y + 2, 2, 12, '#a8764f');
        px(x + 1, y + 2, w - 2, 2, '#c08a5c');
        px(x + 1, y + 11, w - 2, 2, '#c08a5c');
        break;
      case 'birdbath':
        px(x + 6, y + 12, 4, 4, '#b0a89a');
        ellipse(x + 8, y + 10, 7, 3, '#c9c2b4');
        ellipse(x + 8, y + 9, 5, 2, '#a9c9d4');
        break;
      case 'flowerbed':
        px(x + 1, y + 4, w - 2, 7, '#a8764f');
        for (let i = 0; i < 5; i++) {
          const c = ['#e8a9c0', '#f0d98a', '#c3b0e8', '#f2b8a0', '#b8e0c0'][i];
          px(x + 3 + i * 6, y + 5, 3, 3, c);
          px(x + 4 + i * 6, y + 3, 1, 2, '#7dad6e');
        }
        break;
      case 'fence':
        for (let i = 0; i < w / 8; i++) {
          if (p.h > 1) px(x + 4, y + i * 8, 2, 8, '#c9a97e');
          else px(x + i * 8 + 3, y + 4, 2, 11, '#c9a97e');
        }
        if (p.h > 1) px(x + 3, y, 4, h, '#b08a63'); else px(x + 1, y + 6, w - 2, 2, '#b08a63');
        break;
      case 'glasspanel':
        px(x + 1, y + 1, w - 2, h - 2, 'rgba(200,230,205,0.55)');
        px(x + 1, y + 1, w - 2, 1, '#e8f4e4');
        px(x + 1, y + 1, 1, h - 2, '#e8f4e4');
        break;
      case 'potstack':
        for (let i = 0; i < 3; i++) {
          px(x + 3, y + 10 - i * 4, 10, 4, i % 2 ? '#c98a6a' : '#b87a5a');
        }
        break;
      case 'vine':
        for (let i = 0; i < w / 8; i++) {
          px(x + i * 8 + 3, y, 1, h, '#6f9c62');
          circle(x + i * 8 + 3, y + 4 + (i % 2) * 4, 3, '#7dad6e');
          circle(x + i * 8 + 6, y + 9, 2, '#8fbf7a');
        }
        break;
      case 'memorialPlacard':
        px(x + 2, y + 6, w - 4, 8, '#e8dcc0');
        px(x + 3, y + 7, w - 6, 6, '#f6efe0');
        px(x + w / 2 - 1, y + 2, 2, 5, '#8a6a4a');
        break;
      case 'memorystone': {
        const prog = p.progress || 0;
        ellipse(x + T, y + T + 6, 13, 5, 'rgba(40,50,40,0.25)');
        ctx.fillStyle = prog >= 4 ? '#a9c9a0' : prog >= 2 ? '#9aa89a' : '#9a9a96';
        ctx.beginPath();
        ctx.moveTo(x + 4, y + T + 4); ctx.lineTo(x + 6, y + 4); ctx.lineTo(x + 18, y + 2);
        ctx.lineTo(x + 26, y + 10); ctx.lineTo(x + 24, y + T + 4); ctx.closePath(); ctx.fill();
        px(x + 9, y + 8, 5, 2, 'rgba(255,255,255,0.35)');
        if (prog >= 1) { px(x + 20, y + T + 2, 1, 5, '#6f9c62'); px(x + 19, y + T, 3, 2, '#8fbf7a'); }
        if (prog >= 2) { circle(x + 14, y + T - 2, 3, '#8fbf7a'); circle(x + 14, y + T - 4, 2, prog >= 3 ? '#f2c9dc' : '#c3e0b0'); }
        if (prog >= 3) { circle(x + 22, y + T - 4, 2.5, '#e8a9c0'); circle(x + 7, y + T - 3, 2.5, '#f0d98a'); }
        if (prog >= 4) {
          const gl = 0.5 + Math.sin(t * 2) * 0.2;
          circle(x + T, y + T - 4, 10, `rgba(226,240,200,${gl * 0.35})`);
          for (let i = 0; i < 3; i++) circle(x + 10 + i * 8, y + 2 - i * 2 + Math.sin(t + i) * 1.5, 1.2, 'rgba(255,250,220,0.8)');
        }
        break;
      }
      case 'ringstone':
        px(x + 3, y + 9, 6, 4, '#a8a49a');
        px(x + 10, y + 11, 4, 3, '#9a968c');
        break;
      case 'lanternpost': {
        px(x + 6, y + 6, 2, 9, '#6d5a44');
        px(x + 3, y + 1, 8, 6, '#8a7a60');
        circle(x + 7, y + 3, 2.6, 'rgba(255,224,150,0.85)');
        break;
      }
      case 'chest':
        px(x + 2, y + 6, 12, 8, '#a8764f');
        px(x + 2, y + 6, 12, 3, '#c08a5c');
        px(x + 2, y + 9, 12, 1, '#7a5a3c');
        px(x + 7, y + 9, 2, 3, '#f0d98a');
        break;
      case 'mushrooms':
        for (let i = 0; i < 3; i++) {
          px(x + 3 + i * 4, y + 10, 2, 4, '#e8e0d0');
          circle(x + 4 + i * 4, y + 9, 2.6, i % 2 ? '#c97a7a' : '#d99a8a');
        }
        break;
      case 'ruin':
        px(x + 1, y + 4, w - 2, h - 4, '#9a968a');
        px(x + 2, y + 5, w - 4, 3, '#8a867a');
        for (let i = 0; i < 4; i++) px(x + 4 + i * 8, y + 8, 5, 6, '#8f8c80');
        circle(x + 6, y + 3, 3, '#6f9c62');
        break;
      case 'log':
        px(x + 1, y + 6, w - 2, 7, '#8a6a4a');
        px(x + 2, y + 7, w - 4, 5, '#a8846a');
        ellipse(x + w - 3, y + 9, 3, 4, '#c9a97e');
        break;
      case 'fireflies':
        for (let i = 0; i < 6; i++) {
          const a = t * 0.7 + i * 1.7;
          const fx = x + (Math.sin(a) * 0.5 + 0.5) * w;
          const fy = y + (Math.cos(a * 0.8) * 0.5 + 0.5) * h;
          circle(fx, fy, 1.4, `rgba(255,240,160,${0.4 + Math.sin(a * 3) * 0.3})`);
        }
        break;
      case 'butterflies':
        for (let i = 0; i < 4; i++) {
          const a = t * 1.1 + i * 2;
          const fx = x + (Math.sin(a) * 0.5 + 0.5) * w;
          const fy = y + (Math.cos(a * 0.7) * 0.5 + 0.5) * h;
          px(fx - 2, fy, 2, 2, ['#f2c9dc', '#f0d98a', '#c3b0e8', '#f4a8a0'][i]);
          px(fx + 1, fy, 2, 2, ['#f2c9dc', '#f0d98a', '#c3b0e8', '#f4a8a0'][i]);
        }
        break;
      case 'pierpost':
        px(x + 5, y + 2, 6, 12, '#8a6a4a');
        break;
      case 'pierrail':
        px(x + 5, y, 2, h, '#b08a63');
        break;
      case 'driftwood':
        px(x + 1, y + 8, w - 2, 5, '#d8cdb8');
        px(x + 3, y + 10, w - 8, 2, '#c4b8a0');
        break;
      case 'boat':
        ctx.fillStyle = '#b98d62';
        ctx.beginPath();
        ctx.moveTo(x + 1, y + 10); ctx.lineTo(x + w - 2, y + 10);
        ctx.lineTo(x + w - 8, y + 15); ctx.lineTo(x + 8, y + 15);
        ctx.closePath(); ctx.fill();
        px(x + 3, y + 9, w - 6, 2, '#d8b98c');
        break;
      case 'umbrella':
        ctx.fillStyle = '#e8a9c0';
        ctx.beginPath(); ctx.arc(x + 16, y + 12, 16, Math.PI, 0); ctx.fill();
        px(x + 15, y + 12, 2, 14, '#a8764f');
        for (let i = 0; i < 4; i++) px(x + 4 + i * 8, y + 5, 3, 7, '#f4ecd8');
        break;
      case 'bottle':
        px(x + 5, y + 8, 4, 6, 'rgba(180,220,200,0.8)');
        px(x + 6, y + 5, 2, 3, 'rgba(180,220,200,0.8)');
        px(x + 6, y + 10, 2, 3, '#f4ecd8');
        break;
      case 'bottle2':
        px(x + 5, y + 8, 4, 6, 'rgba(180,220,200,0.7)');
        px(x + 6, y + 5, 2, 3, 'rgba(180,220,200,0.7)');
        break;
      case 'sparkle': {
        const s = 1 + Math.sin(t * 3) * 0.4;
        px(x + 7, y + 6, 2, 4 * s, '#f4e0a0');
        px(x + 5, y + 8, 6, 2, '#f4e0a0');
        break;
      }
      case 'shell':
        ctx.fillStyle = '#f4e6d8';
        ctx.beginPath(); ctx.arc(x + 8, y + 10, 4, Math.PI, 0); ctx.fill();
        px(x + 5, y + 10, 6, 3, '#e8d0c0');
        break;
      case 'palm':
        px(x + 7, y + 6, 3, 10, '#a8764f');
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + Math.sin(t + x) * 0.05;
          px(x + 8 + Math.cos(a) * 6, y + 6 + Math.sin(a) * 4, 7, 2, '#5f9a5c');
        }
        circle(x + 8, y + 5, 3, '#6fac68');
        break;
      case 'lampbig':
        px(x + 12, y + 24, 24, 20, '#a8a49a');
        px(x + 14, y + 26, 20, 16, 'rgba(255,236,180,0.85)');
        px(x + 8, y + 14, 32, 12, '#8a8a90');
        px(x + 10, y + 2, 28, 14, 'rgba(255,244,200,0.9)');
        px(x + 6, y, 36, 4, '#7a8fa0');
        circle(x + 24, y + 10, 12, `rgba(255,236,170,${0.25 + Math.sin(t) * 0.06})`);
        break;
      case 'stairs':
        for (let i = 0; i < 8; i++) px(x + 2, y + h - 6 - i * 4, w - 4 - i * 2, 3, '#9a968c');
        break;
      case 'cot':
        px(x + 1, y + 5, w - 2, h - 6, '#8a7a68');
        px(x + 2, y + 6, w - 4, h - 8, '#c9c2b4');
        px(x + 3, y + 7, 10, 7, '#e8e2d4');
        break;
      case 'teatable':
        ellipse(x + w / 2, y + 8, w / 2 - 1, 5, '#b98d62');
        px(x + w / 2 - 1, y + 10, 2, 6, '#8a6a4a');
        px(x + 4, y + 5, 4, 4, '#f4ecd8');
        px(x + 11, y + 6, 4, 4, '#f4ecd8');
        break;
      case 'rug':
        px(x + 1, y + 1, w - 2, h - 2, '#c9a3b6');
        px(x + 3, y + 3, w - 6, h - 6, '#d8b8c8');
        px(x + 6, y + 6, w - 12, h - 12, '#e0c8d4');
        break;
      case 'charttable':
        px(x + 1, y + 4, w - 2, h - 6, '#a8764f');
        px(x + 2, y + 5, w - 4, h - 10, '#f4ecd8');
        px(x + 5, y + 8, 12, 1, '#a9c4d2');
        px(x + 8, y + 11, 10, 1, '#a9c4d2');
        break;
      case 'haybale':
        px(x + 1, y + 4, w - 2, 10, '#d9be7a');
        px(x + 2, y + 5, w - 4, 8, '#e8cf8a');
        px(x + 2, y + 8, w - 4, 1, '#c4a86a');
        break;
      case 'notes':
        px(x + 5, y + 9, 6, 5, '#f6efe0');
        px(x + 6, y + 10, 4, 1, '#c9b58a');
        px(x + 6, y + 12, 3, 1, '#c9b58a');
        break;
      case 'flowers':
        for (let i = 0; i < 6; i++) circle(x + 4 + i * 5, y + 6 + (i % 2) * 5, 2, ['#e8a9c0', '#f0d98a', '#c3b0e8'][i % 3]);
        break;
      case 'shrine':
        px(x + 2, y + 14, w - 4, 4, '#b0a89a');
        px(x + 6, y + 4, 4, 10, '#cfc8bb');
        px(x + 4, y + 2, 8, 5, '#dcd6c8');
        circle(x + 8, y + 22, 3, '#e8dcc0');
        px(x + 20, y + 6, 4, 10, '#cfc8bb');
        px(x + 18, y + 4, 8, 4, '#dcd6c8');
        for (let i = 0; i < 5; i++) circle(x + 8 + Math.sin(t + i) * 10, y + 10 + Math.cos(t * 0.7 + i) * 6, 1.3, 'rgba(255,250,220,0.7)');
        break;
      case 'arch':
        px(x + 2, y, 4, h, '#a8a49a');
        px(x + w - 6, y, 4, h, '#a8a49a');
        px(x + 2, y, w - 4, 4, '#b8b4aa');
        circle(x + 4, y + 6, 2, '#6f9c62');
        break;
      case 'rarebloom': {
        const sw = Math.sin(t * 1.4 + x) * 2;
        px(x + 7, y + 8, 1, 7, '#6f9c62');
        circle(x + 7 + sw * 0.3, y + 6, 3.5, '#f4e0f0');
        circle(x + 7, y + 6, 1.6, '#f0d98a');
        circle(x + 7 + sw, y + 3, 1.2, 'rgba(255,250,230,0.9)');
        break;
      }
      case 'catnip':
        for (let i = 0; i < 4; i++) {
          px(x + 2 + i * 3, y + 6, 1, 8, '#7dad6e');
          circle(x + 2 + i * 3, y + 5, 2, '#a8cf8a');
        }
        break;
      case 'glowtree':
        circle(x + 24, y + 18, 18, 'rgba(200,235,190,0.18)');
        px(x + 20, y + 14, 6, 20, '#7a5a3e');
        circle(x + 24, y + 12, 18, '#7fb07a');
        circle(x + 14, y + 16, 10, '#8fc48a');
        circle(x + 34, y + 16, 10, '#8fc48a');
        circle(x + 24, y + 6, 12, '#9fd09a');
        for (let i = 0; i < 8; i++) {
          const a = t * 0.5 + i;
          circle(x + 24 + Math.sin(a) * 16, y + 14 + Math.cos(a * 0.8) * 10, 1.2, 'rgba(255,255,210,0.8)');
        }
        break;
      case 'counter':
        px(x + 1, y + 2, w - 2, 11, '#9a7150');
        px(x + 2, y + 3, w - 4, 4, '#c9a97e');
        px(x + 2, y + 8, w - 4, 4, '#8a6a4a');
        break;
      case 'shelf':
        px(x + 1, y, w - 2, 12, '#9a7150');
        px(x + 2, y + 1, w - 4, 4, '#c9b58a');
        px(x + 2, y + 7, w - 4, 4, '#c98a8a');
        break;
      case 'oven':
        px(x + 1, y + 2, w - 2, h - 4, '#b0a89a');
        px(x + 4, y + 6, w - 8, h - 10, '#3a2f28');
        for (let i = 0; i < 3; i++) circle(x + 8 + i * 7, y + h - 8 + Math.sin(t * 5 + i) * 1, 2, '#f0a24a');
        px(x + 2, y, w - 4, 3, '#8a847a');
        break;
      case 'kettle':
        circle(x + 12, y + 12, 9, '#b98d62');
        circle(x + 12, y + 12, 6, '#c9a97e');
        px(x + 20, y + 8, 5, 2, '#b98d62');
        px(x + 10, y + 2, 4, 2, '#b98d62');
        if (Math.sin(t * 2) > 0) { circle(x + 24, y + 6, 1.4, 'rgba(255,255,255,0.5)'); circle(x + 26, y + 3, 1.2, 'rgba(255,255,255,0.35)'); }
        break;
      case 'flourbags':
        px(x + 2, y + 4, 11, 11, '#ede4d2');
        px(x + 3, y + 3, 9, 3, '#dcd0b8');
        px(x + 4, y + 8, 7, 1, '#c9b58a');
        px(x + 2, y + 9, 11, 1, '#c9b58a');
        break;
      case 'flowerbucket':
        px(x + 2, y + 8, 12, 7, '#a9b8c2');
        for (let i = 0; i < 4; i++) {
          const c = ['#e8a9c0', '#f0d98a', '#c3b0e8', '#f4a8a0'][i];
          px(x + 3 + i * 3, y + 2, 1, 6, '#6f9c62');
          circle(x + 3 + i * 3, y + 1, 2, c);
        }
        break;
      case 'ledger':
        px(x + 1, y + 3, w - 2, h - 6, '#b98d62');
        px(x + 2, y + 4, w - 4, h - 8, '#f4ecd8');
        px(x + 5, y + 7, w - 12, 1, '#c9b58a');
        px(x + 5, y + 10, w - 16, 1, '#c9b58a');
        px(x + 5, y + 13, w - 14, 1, '#c9b58a');
        break;
      default:
        px(x + 2, y + 6, 12, 9, '#b0a89a');
    }
  }
  R.drawProp = drawProp;

  /* =========================================================
     CHARACTERS
     ========================================================= */
  R.drawPlayer = function (p, sx, sy, t) {
    if (!p) return;
    const c = p.colors;
    const bob = p.moving ? Math.sin(p.walkPhase) * 1.2 : 0;
    const swing = p.moving ? Math.sin(p.walkPhase) * 2 : 0;
    ellipse(sx + 7, sy + 21, 6, 2.4, 'rgba(30,30,30,0.25)');
    const y = sy + bob;
    // legs
    if (!p.sitting) {
      px(sx + 4, y + 15 + Math.max(0, swing), 2, 6, c.skinDark || '#e0bfa8');
      px(sx + 8, y + 15 + Math.max(0, -swing), 2, 6, c.skinDark || '#e0bfa8');
      px(sx + 3, y + 20, 3, 2, '#5a4a3a');
      px(sx + 8, y + 20, 3, 2, '#5a4a3a');
    }
    // dress / body
    if (p.gender === 'masculine' || p.outfit === 'tunic') {
      px(sx + 3, y + 9, 9, 7, c.dress);
      px(sx + 4, y + 10, 7, 5, c.accent || '#f4ecd8');
    } else {
      ctx.fillStyle = c.dress;
      ctx.beginPath();
      ctx.moveTo(sx + 4, y + 8); ctx.lineTo(sx + 10, y + 8);
      ctx.lineTo(sx + 13, y + 17); ctx.lineTo(sx + 1, y + 17);
      ctx.closePath(); ctx.fill();
      px(sx + 5, y + 9, 5, 3, c.accent || '#f4ecd8');
      px(sx + 3, y + 16, 9, 1, c.trim || c.accent || '#f4ecd8');
    }
    // arms
    px(sx + 1, y + 10, 2, 5, c.skin);
    px(sx + 12, y + 10, 2, 5, c.skin);
    // head
    const hx = sx + 3, hy = y + 1;
    // hair back
    px(hx - 1, hy + 1, 11, 8, c.hairShade || c.hair);
    if (p.hair === 'long' || p.hair === 'wavy') { px(hx - 2, hy + 4, 3, 9, c.hair); px(hx + 9, hy + 4, 3, 9, c.hair); }
    if (p.hair === 'braid') { px(hx + 8, hy + 6, 3, 8, c.hair); px(hx - 1, hy + 9, 2, 5, c.hair); }
    // face
    px(hx + 1, hy + 2, 8, 7, c.skin);
    // hair front
    if (p.facing !== 'up') {
      px(hx, hy, 10, 3, c.hair);
      px(hx - 1, hy + 1, 2, 5, c.hair);
      px(hx + 9, hy + 1, 2, 5, c.hair);
      px(hx + 2, hy, 2, 2, c.hair);
      if (p.hair === 'bob') { px(hx - 1, hy + 2, 2, 4, c.hair); px(hx + 9, hy + 2, 2, 4, c.hair); }
      if (p.hair === 'bun') { circle(hx + 5, hy - 2, 3, c.hair); }
      if (p.hair === 'ponytail') { px(hx + 10, hy + 3, 3, 6, c.hair); }
      // eyes
      if (p.facing === 'down') {
        px(hx + 2, hy + 4, 2, 2, '#3a3448');
        px(hx + 6, hy + 4, 2, 2, '#3a3448');
        px(hx + 2, hy + 4, 1, 1, c.eye);
        px(hx + 6, hy + 4, 1, 1, c.eye);
        px(hx + 4, hy + 6, 2, 1, 'rgba(220,140,140,0.5)');
      } else if (p.facing === 'left') {
        px(hx + 1, hy + 4, 2, 2, '#3a3448');
      } else if (p.facing === 'right') {
        px(hx + 6, hy + 4, 2, 2, '#3a3448');
      }
      // accessory
      if (p.accessory === 'flower') { circle(hx + 1, hy + 1, 2, '#f2c9dc'); circle(hx + 1, hy + 1, 1, '#f0d98a'); }
      if (p.accessory === 'ribbon') { px(hx + 7, hy - 1, 4, 2, '#e8a9c0'); }
      if (p.accessory === 'hat') { px(hx - 2, hy - 1, 14, 3, c.trim || '#e8dcc0'); px(hx + 2, hy - 1, 6, 1, '#f4ecd8'); }
      if (p.accessory === 'halo') { ellipse(hx + 5, hy - 3, 5, 1.6, 'rgba(255,240,190,0.8)'); }
      if (p.accessory === 'scarf') px(hx, hy + 8, 10, 2, '#a8916a');
      if (p.accessory === 'glasses') { px(hx + 1, hy + 4, 4, 1, '#7a7a8a'); px(hx + 5, hy + 4, 4, 1, '#7a7a8a'); }
      if (p.accessory === 'cap') { px(hx - 1, hy - 1, 12, 3, '#5f7f78'); px(hx + 6, hy + 1, 7, 1, '#4f6f68'); }
      if (p.accessory === 'leaf') { px(hx + 1, hy, 3, 2, '#7dad6e'); }
      if (p.accessory === 'apron') px(hx + 2, hy + 8, 6, 4, '#f4ecd8');
    } else {
      px(hx + 1, hy + 2, 8, 8, c.hair);
      px(hx, hy, 10, 4, c.hair);
      if (p.accessory === 'hat' || p.accessory === 'cap') px(hx - 1, hy - 1, 12, 3, c.trim || '#e8dcc0');
      if (p.accessory === 'halo') ellipse(hx + 5, hy - 3, 5, 1.6, 'rgba(255,240,190,0.8)');
    }
    if (p.glow) circle(sx + 7, sy + 12, 12, 'rgba(230,225,255,0.12)');
  };

  R.drawNPC = function (n, sx, sy, t) {
    if (!n) return;
    const sitting = n.pose === 'sit';
    const bob = sitting ? 0 : n.moving ? Math.sin(t * 6 + n.x) * 1 : Math.sin(t * 1.5 + (n.x || 0)) * 0.4;
    R.drawPlayer({
      colors: Object.assign({ skinDark: '#e0bfa8' }, n.colors),
      hair: n.hair, accessory: n.accessory, facing: n.facing || 'down',
      moving: n.moving, walkPhase: t * 7, glow: n.colors && n.colors.glow,
      gender: n.gender, outfit: n.outfit,
    }, sx, sy + bob + (sitting ? 2.5 : 0), t);
    if (sitting) px(sx + 1, sy + 10, 12, 4, 'rgba(60,45,35,0.18)');
    if (n.act === 'baking' || n.act === 'arranging' || n.act === 'kneading') {
      circle(sx + 12, sy + 14, 2, 'rgba(255,255,255,0.25)');
    }
  };

  R.drawCat = function (cat, sx, sy, t) {
    if (!cat) return;
    const c = cat.colorHex || '#d8a878';
    ellipse(sx + 6, sy + 10, 5, 2, 'rgba(30,30,30,0.22)');
    const sleeping = cat.state === 'sleep';
    if (sleeping) {
      ellipse(sx + 6, sy + 7, 6, 4.5, c);
      ellipse(sx + 3, sy + 6, 3, 3, c);
      px(sx + 1, sy + 3, 2, 3, c);
      px(sx + 5, sy + 3, 2, 3, c);
      px(sx + 2, sy + 6, 2, 1, '#4a3a30');
      px(sx + 5, sy + 6, 2, 1, '#4a3a30');
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '7px monospace';
      ctx.fillText('z', sx + 9, sy + 2 - Math.sin(t * 2) * 2);
      return;
    }
    const wag = Math.sin(t * 3) * 2;
    px(sx + 4, sy + 7, 6, 4, c);
    px(sx + 3, sy + 5, 4, 4, c);
    px(sx + 4, sy + 3, 2, 2, c);
    px(sx + 6, sy + 3, 2, 2, c);
    px(sx + 4, sy + 4, 1, 1, '#f2a0a0');
    px(sx + 6, sy + 4, 1, 1, '#f2a0a0');
    px(sx + 5, sy + 6, 1, 1, '#3a2f28');
    px(sx + 7, sy + 6, 1, 1, '#3a2f28');
    px(sx + 2, sy + 8, 2, 1, c);
    px(sx + 10, sy + 5 + wag * 0.5, 2, 2, c);
    if (cat.accessory === 'collar') px(sx + 4, sy + 7, 6, 1, '#c9b8a0');
    if (cat.mood === 'happy') px(sx + 9, sy + 8, 1, 1, '#f0a0c0');
  };

  /* =========================================================
     WORLD FRAME
     ========================================================= */
  R.drawWorld = function (scene) {
    if (!ctx) return;
    const { area, cam, player, npcs, cat, timeSec, weather } = scene;
    ctx.fillStyle = '#2a2a30';
    ctx.fillRect(0, 0, W, H);
    const startX = Math.floor(cam.x / T) - 1;
    const startY = Math.floor(cam.y / T) - 1;
    const cols = Math.ceil(W / T) + 2;
    const rows = Math.ceil(H / T) + 2;

    for (let ty = startY; ty < startY + rows; ty++) {
      for (let tx = startX; tx < startX + cols; tx++) {
        const sx = Math.round(tx * T - cam.x), sy = Math.round(ty * T - cam.y);
        if (tx < 0 || ty < 0 || tx >= area.w || ty >= area.h) { px(sx, sy, T, T, '#2f3a2c'); continue; }
        R.drawTile(area.grid[ty][tx], sx, sy, tx, ty, timeSec);
      }
    }

    // farm plots state overlay
    if (area.plots && area.plots.length) {
      const S = SAN.state.S;
      area.plots.forEach((pl) => {
        const key = pl.area + ':' + pl.x + ',' + pl.y;
        const plot = S.farm.plots[key];
        const sx = Math.round(pl.x * T - cam.x), sy = Math.round(pl.y * T - cam.y);
        if (sx < -32 || sy < -32 || sx > W + 32 || sy > H + 32) return;
        if (plot) {
          px(sx, sy, T, T, plot.watered ? '#6b4a35' : '#8a6247');
          px(sx, sy + 13, T, 3, '#5f4330');
          if (plot.watered) px(sx + 2, sy + 2, 2, 2, 'rgba(160,210,230,0.5)');
        } else {
          px(sx, sy, T, T, '#8a6247');
          px(sx, sy + 8, T, 1, '#6b4a35');
        }
        if (plot && plot.crop) {
          const c = SAN.data.crops[plot.crop];
          const stage = plot.stage || 0;
          const ratio = Math.min(1, stage / Math.max(1, c.days));
          if (ratio >= 1) {
            circle(sx + 8, sy + 6, 5, '#6f9c62');
            const cols = { lavender: '#b9a4d8', marigold: '#e8a04a', moonpetal: '#dfe6f2', sunrose: '#f2c05a', bluebell: '#8fa8e0', starflower: '#f0e0a0', pumpkin: '#e0a04a', carrot: '#e8a06a' };
            circle(sx + 8, sy + 4, 4, cols[c.id] || '#e8a9c0');
            circle(sx + 8, sy + 4, 1.6, '#f6e6b8');
          } else if (ratio > 0.05) {
            px(sx + 7, sy + 8 - ratio * 4, 2, 6 + ratio * 4, '#6f9c62');
            px(sx + 4, sy + 7 - ratio * 3, 4, 2, '#7dad6e');
            px(sx + 9, sy + 9 - ratio * 2, 3, 2, '#7dad6e');
          } else {
            px(sx + 6, sy + 11, 4, 2, '#5f4330');
            px(sx + 7, sy + 9, 2, 2, '#7dad6e');
          }
        }
      });
    }

    const items = [];
    area.props.forEach((p) => {
      const sx = p.x * T - cam.x, sy = p.y * T - cam.y;
      const h = (p.h || 1) * T, w2 = (p.w || 1) * T;
      if (sx + w2 < -40 || sy + h < -60 || sx > W + 40 || sy > H + 60) return;
      items.push({ p, sx, sy, depth: (p.y + (p.h || 1)) * 100 + p.x * 0.01 });
    });
    // placed furniture
    if (area.id === 'home') {
      const S = SAN.state.S;
      (S.house.furniture || []).forEach((f, i) => {
        items.push({ p: { t: 'furn_' + f.id, id: f.id, x: f.x, y: f.y, w: 1, h: 1 }, sx: f.x * T - cam.x, sy: f.y * T - cam.y, depth: (f.y + 1) * 100 + f.x * 0.02 + 0.5 });
      });
    }
    // entities
    npcs.forEach((n) => items.push({ npc: n, sx: n.px - cam.x, sy: n.py - cam.y, depth: (n.py / T + 1) * 100 }));
    if (cat) items.push({ cat, sx: cat.px - cam.x, sy: cat.py - cam.y, depth: (cat.py / T + 1) * 100 + 0.2 });
    items.push({ player, sx: player.px - cam.x, sy: player.py - cam.y, depth: (player.py / T + 1) * 100 + 0.3 });
    items.sort((a, b) => a.depth - b.depth);
    items.forEach((it) => {
      if (it.p) {
        if (it.p.t && it.p.t.indexOf('furn_') === 0) drawFurniture(it.p.id, it.sx, it.sy);
        else drawProp(it.p, it.sx, it.sy, timeSec);
        if (it.p.t === 'designator') { }
      } else if (it.npc) {
        const npcDef = Object.assign({}, it.npc.def, { pose: it.npc.pose, moving: it.npc.moving, facing: it.npc.facing });
        R.drawNPC(npcDef, it.sx, it.sy, timeSec);
        if (it.npc.def.id === 'nyssa' && Math.sin(timeSec) > 0.5) {
          circle(it.sx + 7, it.sy - 2, 1.2, 'rgba(255,250,220,0.7)');
        }
        if (it.npc.bubble && it.npc.bubble.t > 0) drawBubble(it.npc.bubble.text, it.sx + 7, it.sy - 12, Math.min(1, it.npc.bubble.t));
      } else if (it.cat) {
        R.drawCat(it.cat, it.sx, it.sy, timeSec);
      } else if (it.player) {
        R.drawPlayer(it.player.sprite, it.sx, it.sy, timeSec);
      }
    });

    // interaction hint
    if (scene.hint) {
      const hx = scene.hint.px - cam.x, hy = scene.hint.py - cam.y;
      ctx.fillStyle = 'rgba(40,32,26,0.82)';
      const label = scene.hint.label || 'E';
      ctx.font = '7px monospace';
      const tw = Math.max(12, ctx.measureText(label).width + 6);
      ctx.fillRect(Math.round(hx - tw / 2), Math.round(hy - 22), tw, 10);
      ctx.fillStyle = '#f6eeda';
      ctx.textAlign = 'center';
      ctx.fillText(label, Math.round(hx), Math.round(hy - 14.5));
      ctx.textAlign = 'left';
    }
    if (scene.label) {
      ctx.font = '7px monospace';
      ctx.fillStyle = 'rgba(20,18,24,0.65)';
      const tw = ctx.measureText(scene.label).width + 10;
      ctx.fillRect(6, 6, tw, 12);
      ctx.fillStyle = '#efe6d4';
      ctx.fillText(scene.label, 11, 14.5);
    }
  };

  function drawFurniture(id, x, y) {
    switch (id) {
      case 'bed_oak': case 'bed_rose':
        px(x + 1, y + 2, 14, 13, '#b98d62');
        px(x + 2, y + 3, 12, 10, id === 'bed_rose' ? '#e8d0e0' : '#e8dcc8');
        px(x + 4, y + 5, 8, 4, '#f4ecd8');
        break;
      case 'chair_wicker': case 'chair_velvet':
        px(x + 3, y + 6, 10, 3, '#b98d62');
        px(x + 3, y + 3, 10, 3, id === 'chair_velvet' ? '#a87a9a' : '#c9a97e');
        px(x + 4, y + 9, 2, 5, '#8a6a4a'); px(x + 10, y + 9, 2, 5, '#8a6a4a');
        break;
      case 'table_round':
        ellipse(x + 8, y + 8, 7, 4, '#b98d62');
        px(x + 7, y + 11, 2, 4, '#8a6a4a');
        break;
      case 'bookshelf_tall':
        px(x + 2, y, 12, 16, '#9a7150');
        for (let r = 0; r < 3; r++) for (let i = 0; i < 3; i++) px(x + 3 + i * 4, y + 2 + r * 5, 3, 4, ['#c98a8a', '#8aa9c9', '#c9c08a'][(i + r) % 3]);
        break;
      case 'rug_rose': case 'rug_sage':
        px(x + 1, y + 3, 14, 10, id === 'rug_rose' ? '#c9a3b6' : '#a8bfa0');
        px(x + 3, y + 5, 10, 6, id === 'rug_rose' ? '#d8b8c8' : '#bdd0b4');
        break;
      case 'lamp_glow':
        px(x + 7, y + 8, 2, 7, '#6d5a44');
        circle(x + 8, y + 5, 4, 'rgba(255,236,170,0.85)');
        break;
      case 'lamp_candle':
        px(x + 5, y + 10, 2, 5, '#f4ecd8'); px(x + 9, y + 12, 2, 3, '#f4ecd8');
        circle(x + 6, y + 8, 2, 'rgba(255,220,140,0.9)');
        circle(x + 10, y + 10, 1.6, 'rgba(255,220,140,0.9)');
        break;
      case 'plant_fern': case 'plant_lavender':
        px(x + 5, y + 10, 7, 6, '#c98a6a');
        circle(x + 8, y + 7, 5, '#6f9c62');
        if (id === 'plant_lavender') for (let i = 0; i < 3; i++) px(x + 5 + i * 3, y + 2, 1, 5, '#b9a4d8');
        break;
      case 'painting_sea':
        px(x + 2, y + 2, 12, 10, '#c9a97e');
        px(x + 3, y + 3, 10, 8, '#a9d6e2');
        px(x + 3, y + 7, 10, 4, '#7fb6c9');
        circle(x + 10, y + 5, 2, '#f6e6b8');
        break;
      case 'curtain_lace':
        px(x + 1, y, 4, 16, 'rgba(250,240,230,0.85)');
        px(x + 11, y, 4, 16, 'rgba(250,240,230,0.85)');
        break;
      case 'cat_bed':
        ellipse(x + 8, y + 11, 7, 4, '#c9a3b6');
        ellipse(x + 8, y + 10, 5, 3, '#e8d8e0');
        break;
      case 'cat_tower':
        px(x + 3, y + 5, 10, 11, '#c9a97e');
        px(x + 2, y + 2, 12, 4, '#b98d62');
        px(x + 5, y + 12, 6, 4, '#a8764f');
        break;
      case 'garden_bench':
        px(x + 1, y + 8, 14, 4, '#a8764f');
        px(x + 1, y + 5, 14, 3, '#c08a5c');
        px(x + 2, y + 12, 2, 3, '#7a5a3c'); px(x + 12, y + 12, 2, 3, '#7a5a3c');
        break;
      case 'memory_lantern':
        px(x + 6, y + 3, 5, 2, '#8a7a60');
        px(x + 5, y + 5, 7, 8, 'rgba(255,230,170,0.9)');
        circle(x + 8, y + 9, 6, 'rgba(255,230,170,0.22)');
        break;
      case 'wind_chime':
        px(x + 3, y, 10, 2, '#c9b8a0');
        for (let i = 0; i < 4; i++) px(x + 4 + i * 2.6, y + 2, 1, 5 + (i % 2) * 3, '#f4ecd8');
        break;
      case 'flower_arrangement':
        px(x + 6, y + 9, 5, 6, '#c98a6a');
        circle(x + 8, y + 6, 4, '#e8a9c0');
        circle(x + 5, y + 7, 2, '#f0d98a');
        circle(x + 11, y + 7, 2, '#c3b0e8');
        break;
      case 'bird_feeder':
        px(x + 6, y + 8, 4, 8, '#a8764f');
        px(x + 3, y + 4, 10, 5, '#c9a97e');
        px(x + 4, y + 5, 8, 2, '#8a6a4a');
        break;
      default:
        px(x + 2, y + 4, 12, 10, '#b0a89a');
    }
  }

  /* =========================================================
     WEATHER + LIGHT
     ========================================================= */
  R.drawLighting = function (minutes, weather, area) {
    if (!ctx) return;
    const h = minutes / 60;
    let tint = null, alpha = 0;
    if (h >= 5 && h < 7.5) { tint = '#ffbe8a'; alpha = 0.22 * (1 - (h - 5) / 2.5); }
    else if (h >= 7.5 && h < 16.5) { tint = null; alpha = 0; }
    else if (h >= 16.5 && h < 18.5) { tint = '#ff9e5e'; alpha = 0.18 * ((h - 16.5) / 2); }
    else if (h >= 18.5 && h < 20) { tint = '#8a6aaa'; alpha = 0.28 * ((h - 18.5) / 1.5); }
    else if (h >= 20 || h < 5) { tint = '#2a3560'; alpha = area && area.safe ? 0.22 : 0.4; }
    if (weather === 'storm') alpha += 0.1;
    if (weather === 'rain') alpha += 0.05;
    if (tint && alpha > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = SAN.util.rgba(tint, Math.min(0.55, alpha));
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
    if (h >= 20 || h < 5) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const grd = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, 150);
      grd.addColorStop(0, 'rgba(255,220,150,0.10)');
      grd.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
    if (weather === 'fog') {
      ctx.fillStyle = 'rgba(220,225,235,0.28)';
      ctx.fillRect(0, 0, W, H);
    }
    if (weather === 'cloudy' || weather === 'rain' || weather === 'storm') {
      ctx.fillStyle = 'rgba(90,100,120,0.10)';
      ctx.fillRect(0, 0, W, H);
    }
  };

  R.drawWeather = function (weather, t, intensity) {
    if (!ctx) return;
    const n = intensity || 1;
    if (weather === 'rain' || weather === 'storm') {
      ctx.strokeStyle = 'rgba(190,215,235,0.5)';
      ctx.lineWidth = 1;
      const count = Math.floor(90 * n);
      for (let i = 0; i < count; i++) {
        const seed = i * 37.7;
        const x = (seed * 13 + t * 260) % (W + 40) - 20;
        const y = (seed * 29 + t * 620) % (H + 40) - 20;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2, y + 7); ctx.stroke();
      }
      if (weather === 'storm' && Math.sin(t * 0.8) > 0.995) {
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(0, 0, W, H);
      }
    } else if (weather === 'snow') {
      for (let i = 0; i < 70 * n; i++) {
        const seed = i * 53.3;
        const x = (seed * 17 + Math.sin(t * 0.6 + i) * 20 + t * 12) % W;
        const y = (seed * 31 + t * 24 + Math.cos(t * 0.4 + i) * 10) % H;
        circle(x, y, 1 + (i % 3) * 0.4, 'rgba(255,255,255,0.8)');
      }
    } else if (weather === 'cloudy') {
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(0, 0, W, H);
    }
  };

  /* =========================================================
     ITEM ICONS (canvas → dataURL, cached)
     ========================================================= */
  const iconCache = {};
  R.itemIcon = function (id, size) {
    size = size || 32;
    const key = id + '_' + size;
    if (iconCache[key]) return iconCache[key];
    const cv = document.createElement('canvas');
    cv.width = 24; cv.height = 24;
    const c2 = cv.getContext('2d');
    const it = SAN.data.item(id);
    const cat = it.cat;
    const draw = (col, shape) => {
      c2.fillStyle = col;
      if (shape === 'circle') { c2.beginPath(); c2.arc(12, 12, 8, 0, 7); c2.fill(); }
      else if (shape === 'leaf') { c2.beginPath(); c2.ellipse(12, 13, 5, 8, 0.4, 0, 7); c2.fill(); }
      else c2.fillRect(4, 6, 16, 13);
    };
    const byId = {
      wood: () => { c2.fillStyle = '#a8764f'; c2.fillRect(3, 9, 18, 7); c2.fillStyle = '#c9a97e'; c2.fillRect(5, 10, 14, 2); c2.fillStyle = '#8a6a4a'; c2.fillRect(8, 7, 3, 12); },
      stone: () => { c2.fillStyle = '#a9a496'; c2.beginPath(); c2.moveTo(4, 18); c2.lineTo(6, 8); c2.lineTo(14, 6); c2.lineTo(20, 12); c2.lineTo(18, 18); c2.closePath(); c2.fill(); c2.fillStyle = '#bdb8a9'; c2.fillRect(8, 9, 6, 3); },
      fiber: () => { c2.strokeStyle = '#a8bf8a'; c2.lineWidth = 2; for (let i = 0; i < 5; i++) { c2.beginPath(); c2.moveTo(5 + i * 3, 19); c2.quadraticCurveTo(9 + i * 2, 12, 7 + i * 3, 5); c2.stroke(); } },
      shell: () => { c2.fillStyle = '#f0dcc8'; c2.beginPath(); c2.arc(12, 14, 8, Math.PI, 0); c2.fill(); c2.strokeStyle = '#d8b8a0'; c2.lineWidth = 1; for (let i = 0; i < 4; i++) { c2.beginPath(); c2.moveTo(12, 14); c2.lineTo(6 + i * 4, 7); c2.stroke(); } },
      sea_glass: () => { c2.fillStyle = 'rgba(140,200,175,0.9)'; c2.beginPath(); c2.moveTo(6, 16); c2.lineTo(9, 7); c2.lineTo(17, 6); c2.lineTo(19, 14); c2.lineTo(12, 19); c2.closePath(); c2.fill(); },
      pearl: () => { c2.fillStyle = '#f4f0e0'; c2.beginPath(); c2.arc(12, 13, 7, 0, 7); c2.fill(); c2.fillStyle = 'rgba(255,255,255,0.9)'; c2.beginPath(); c2.arc(9, 10, 2, 0, 7); c2.fill(); },
      iron: () => { c2.fillStyle = '#7a828a'; c2.fillRect(5, 8, 14, 4); c2.fillRect(7, 12, 4, 8); },
      glow_moss: () => { c2.fillStyle = '#8fbf7a'; c2.beginPath(); c2.arc(9, 15, 5, 0, 7); c2.arc(15, 12, 5, 0, 7); c2.fill(); c2.fillStyle = 'rgba(255,255,200,0.8)'; c2.beginPath(); c2.arc(12, 10, 1.6, 0, 7); c2.fill(); },
      clay: () => { c2.fillStyle = '#c9a58a'; c2.beginPath(); c2.ellipse(12, 13, 8, 6, 0, 0, 7); c2.fill(); },
      flour: () => { c2.fillStyle = '#ede4d2'; c2.fillRect(5, 7, 14, 13); c2.fillStyle = '#dcd0b8'; c2.fillRect(7, 5, 10, 3); c2.fillStyle = '#c9b58a'; c2.fillRect(8, 12, 8, 2); },
      honey: () => { c2.fillStyle = '#e8c05a'; c2.fillRect(6, 8, 12, 11); c2.fillStyle = '#f0d98a'; c2.fillRect(8, 10, 8, 4); c2.fillStyle = '#a8764f'; c2.fillRect(8, 6, 8, 3); },
      berry: () => { c2.fillStyle = '#c9697a'; c2.beginPath(); c2.arc(9, 13, 4, 0, 7); c2.arc(15, 12, 4, 0, 7); c2.arc(12, 16, 4, 0, 7); c2.fill(); c2.fillStyle = '#6f9c62'; c2.fillRect(11, 5, 2, 4); },
      herb: () => { c2.strokeStyle = '#6f9c62'; c2.lineWidth = 2; c2.beginPath(); c2.moveTo(12, 20); c2.lineTo(12, 5); c2.stroke(); for (let i = 0; i < 3; i++) { c2.fillStyle = '#7dad6e'; c2.beginPath(); c2.ellipse(8 - i, 10 + i * 3, 4, 2, -0.5, 0, 7); c2.ellipse(16 + i, 10 + i * 3, 4, 2, 0.5, 0, 7); c2.fill(); } },
      fish: () => { c2.fillStyle = '#9fc4d4'; c2.beginPath(); c2.ellipse(12, 13, 8, 5, 0, 0, 7); c2.fill(); c2.fillStyle = '#7fb0c4'; c2.beginPath(); c2.moveTo(3, 9); c2.lineTo(3, 17); c2.lineTo(8, 13); c2.fill(); c2.fillStyle = '#3a4a52'; c2.beginPath(); c2.arc(16, 11, 1.4, 0, 7); c2.fill(); },
      seed: () => { c2.fillStyle = '#e8dcc0'; c2.fillRect(5, 6, 14, 14); c2.fillStyle = '#c9b58a'; c2.fillRect(5, 6, 14, 3); c2.fillStyle = '#7dad6e'; c2.beginPath(); c2.arc(12, 14, 3, 0, 7); c2.fill(); },
      bread: () => { c2.fillStyle = '#d8a86a'; c2.beginPath(); c2.ellipse(12, 14, 9, 6, 0, 0, 7); c2.fill(); c2.fillStyle = '#e8c090'; c2.beginPath(); c2.ellipse(11, 12, 6, 3, 0, 0, 7); c2.fill(); c2.strokeStyle = '#b98d62'; c2.beginPath(); c2.moveTo(9, 10); c2.lineTo(14, 15); c2.stroke(); },
      cake: () => { c2.fillStyle = '#f0e0c0'; c2.fillRect(5, 11, 14, 8); c2.fillStyle = '#e8c05a'; c2.fillRect(5, 9, 14, 4); c2.fillStyle = '#c9697a'; c2.beginPath(); c2.arc(12, 8, 2, 0, 7); c2.fill(); },
      tea: () => { c2.fillStyle = '#f4ecd8'; c2.beginPath(); c2.arc(11, 13, 6, 0, 7); c2.fill(); c2.fillStyle = '#b9a4d8'; c2.beginPath(); c2.arc(11, 12, 4, 0, 7); c2.fill(); c2.fillStyle = '#f4ecd8'; c2.fillRect(16, 11, 4, 4); },
      soup: () => { c2.fillStyle = '#e0a04a'; c2.beginPath(); c2.arc(12, 13, 8, 0, 7); c2.fill(); c2.fillStyle = '#f6e0b0'; c2.beginPath(); c2.arc(12, 12, 5, 0, 7); c2.fill(); },
      flower: () => { c2.fillStyle = '#6f9c62'; c2.fillRect(11, 14, 2, 6); c2.fillStyle = '#f0d98a'; c2.beginPath(); c2.arc(12, 8, 3, 0, 7); c2.fill(); for (let i = 0; i < 5; i++) { c2.fillStyle = '#e8a9c0'; c2.beginPath(); c2.arc(12 + Math.cos(i * 1.256) * 5, 8 + Math.sin(i * 1.256) * 5, 3, 0, 7); c2.fill(); } },
      furniture: () => { c2.fillStyle = '#b98d62'; c2.fillRect(5, 10, 14, 8); c2.fillStyle = '#c9a97e'; c2.fillRect(7, 7, 10, 3); },
      quest: () => { c2.fillStyle = '#f4ecd8'; c2.fillRect(5, 5, 14, 14); c2.strokeStyle = '#c9b58a'; c2.strokeRect(5.5, 5.5, 13, 13); c2.fillStyle = '#8a6a4a'; c2.fillRect(8, 9, 8, 1); c2.fillRect(8, 12, 6, 1); c2.fillRect(8, 15, 7, 1); },
      collectibles: () => { c2.fillStyle = '#c9b8a0'; c2.beginPath(); c2.arc(12, 12, 7, 0, 7); c2.fill(); c2.fillStyle = '#f4e0a0'; c2.beginPath(); c2.arc(12, 11, 3, 0, 7); c2.fill(); },
      crops: () => { c2.fillStyle = '#8fbf7a'; c2.beginPath(); c2.arc(10, 14, 6, 0, 7); c2.fill(); c2.fillStyle = '#e8a9c0'; c2.beginPath(); c2.arc(14, 9, 4, 0, 7); c2.fill(); },
    };
    (byId[id] || byId[cat] || (() => draw('#b0a89a')))();
    const url = cv.toDataURL();
    iconCache[key] = url;
    return url;
  };

  /* =========================================================
     PORTRAITS (anime fantasy SVG)
     ========================================================= */
  R.portrait = function (who, opts) {
    const o = opts || {};
    let p;
    if (who === 'player') p = o.player || (SAN.state.S && SAN.state.S.player);
    else p = (SAN.data.npcs[who] || {});
    if (!p) return '';
    const col = p.colors || {};
    const hair = p.hair || 'long';
    const acc = p.accessory || 'none';
    const skin = col.skin || '#f6dfcf';
    const hairC = col.hair || '#e8dcc6';
    const hairS = col.hairShade || SAN.util.shade(hairC, -0.18);
    const eyeC = col.eye || '#8fb3d9';
    const dress = col.dress || '#5c7599';
    const accent = col.accent || '#eef3fb';
    const ribbon = col.ribbon || SAN.util.shade(dress, 0.25);
    const uid = 'g' + (p.id || 'pc') + Math.floor(Math.random() * 9999);
    const bg1 = SAN.util.mix(dress, '#f6efe6', 0.72);
    const bg2 = SAN.util.mix(dress, '#ffffff', 0.35);
    const glow = p.glow;

    const bangs = {
      long: `<path d="M60 22 C34 22 24 40 25 58 C26 44 34 34 44 32 C48 40 46 46 40 52 C50 48 58 38 60 30 C62 38 70 48 80 52 C74 46 72 40 76 32 C86 34 94 44 95 58 C96 40 86 22 60 22Z" fill="${hairC}"/>`,
      wavy: `<path d="M60 21 C33 21 22 41 24 60 C27 46 32 37 41 33 C40 43 35 47 30 51 C40 52 47 44 50 34 C55 47 62 41 64 30 C68 44 76 50 88 50 C81 46 78 41 79 33 C88 38 93 47 96 60 C98 41 87 21 60 21Z" fill="${hairC}"/>`,
      bob: `<path d="M60 22 C36 22 25 39 26 58 C27 50 30 42 37 38 C41 44 42 50 40 56 C50 52 60 40 60 30 C60 40 70 52 80 56 C78 50 79 44 83 38 C90 42 93 50 94 58 C95 39 84 22 60 22Z" fill="${hairC}"/>`,
      short: `<path d="M60 21 C36 21 26 37 27 54 C29 44 35 36 44 34 C50 38 54 34 58 30 C64 36 74 40 82 36 C90 40 93 48 93 54 C94 37 84 21 60 21Z" fill="${hairC}"/>`,
      braid: `<path d="M60 22 C35 22 25 40 26 58 C28 46 34 36 44 33 C50 40 55 38 60 30 C65 38 72 40 80 33 C89 37 93 47 94 58 C95 40 85 22 60 22Z" fill="${hairC}"/>`,
      bun: `<path d="M60 23 C38 23 27 40 28 55 C31 44 38 36 48 34 C54 40 60 34 62 30 C66 36 74 40 82 36 C89 41 92 48 92 55 C93 40 82 23 60 23Z" fill="${hairC}"/>`,
      ponytail: `<path d="M60 21 C35 21 25 39 26 57 C29 45 36 35 46 33 C52 40 58 38 61 30 C65 39 73 41 80 35 C89 40 93 48 94 57 C95 39 85 21 60 21Z" fill="${hairC}"/>`,
    };
    const backHair = {
      long: `<path d="M22 60 C22 34 38 18 60 18 C82 18 98 34 98 60 L100 132 C90 124 84 126 78 132 L76 78 C70 96 50 96 44 78 L42 132 C34 126 28 124 20 132Z" fill="${hairS}"/>`,
      wavy: `<path d="M20 58 C20 32 38 16 60 16 C82 16 100 32 100 58 C96 76 104 92 98 112 C92 126 82 128 76 134 C80 112 78 92 76 78 C70 96 50 96 44 78 C42 92 40 112 44 134 C38 128 28 126 22 112 C16 92 24 76 20 58Z" fill="${hairS}"/>`,
      bob: `<path d="M24 60 C24 36 40 20 60 20 C80 20 96 36 96 60 L94 92 C88 96 80 94 76 88 L74 70 C66 84 54 84 46 70 L44 88 C40 94 32 96 26 92Z" fill="${hairS}"/>`,
      short: `<path d="M26 58 C26 36 42 20 60 20 C78 20 94 36 94 58 L92 74 C86 78 78 74 74 68 L46 68 C42 74 34 78 28 74Z" fill="${hairS}"/>`,
      braid: `<path d="M22 60 C22 36 38 18 60 18 C82 18 98 36 98 60 L96 86 C90 92 80 90 76 82 L74 70 C66 84 54 84 46 70 L44 82 C40 90 30 92 24 86Z" fill="${hairS}"/><path d="M86 86 C96 96 98 112 94 128 C90 116 86 104 80 96Z" fill="${hairS}"/>`,
      bun: `<path d="M26 58 C26 34 42 18 60 18 C78 18 94 34 94 58 L92 76 C86 82 78 78 74 70 L46 70 C42 78 34 82 28 76Z" fill="${hairS}"/><circle cx="76" cy="14" r="11" fill="${hairC}"/>`,
      ponytail: `<path d="M26 58 C26 36 42 20 60 20 C78 20 94 36 94 58 L92 76 C86 80 78 76 74 70 L46 70 C42 76 34 80 28 76Z" fill="${hairS}"/><path d="M90 40 C108 48 112 76 104 100 C100 82 94 66 84 56Z" fill="${hairC}"/>`,
    };
    const accSvg = {
      flower: `<g transform="translate(36,30)"><circle r="3" fill="#f4c6d8"/>${[0, 1, 2, 3, 4].map((i) => `<ellipse cx="${Math.cos(i * 1.256) * 6}" cy="${Math.sin(i * 1.256) * 6}" rx="5" ry="4" fill="#f7dbe6" transform="rotate(${i * 72})"/>`).join('')}<circle r="2.4" fill="#f0d98a"/></g>`,
      leaf: `<g transform="translate(38,32)"><path d="M0 0 C8 -8 16 -2 12 4 C6 10 0 6 0 0Z" fill="#8fbf7a"/><path d="M0 0 C6 0 10 2 12 4" stroke="#6f9c62" stroke-width="1" fill="none"/></g>`,
      clip: `<g transform="translate(82,40)"><rect x="0" y="0" width="16" height="5" rx="2" fill="#e8d0a0"/><circle cx="3" cy="2.5" r="2" fill="#f0d98a"/></g>`,
      ribbon: `<g transform="translate(78,26)"><path d="M0 6 L-10 0 L-10 12 Z" fill="${ribbon}"/><path d="M0 6 L10 0 L10 12 Z" fill="${ribbon}"/><circle r="3.4" fill="${SAN.util.shade(ribbon, -0.12)}"/></g>`,
      hat: `<g><ellipse cx="60" cy="26" rx="40" ry="8" fill="#d8c8a8"/><path d="M32 26 C32 2 88 2 88 26Z" fill="#e8dcc0"/><path d="M32 24 C40 18 80 18 88 24" stroke="${ribbon}" stroke-width="4" fill="none"/></g>`,
      glasses: `<g fill="none" stroke="#8a7d6b" stroke-width="1.6"><circle cx="47" cy="66" r="9"/><circle cx="75" cy="66" r="9"/><path d="M56 66 L66 66"/></g>`,
      apron: `<path d="M42 108 L78 108 L82 140 L38 140Z" fill="#f6f0e2"/>`,
      scarf: `<path d="M30 108 C40 118 80 118 90 108 L92 120 C78 130 42 130 28 120Z" fill="${ribbon}"/>`,
      cap: `<g><path d="M28 34 C30 12 90 12 92 34Z" fill="#5f7f78"/><path d="M88 32 L112 36 L108 42 L86 38Z" fill="#4f6f68"/></g>`,
      halo: `<g><ellipse cx="60" cy="10" rx="24" ry="5" fill="none" stroke="#ffeaa8" stroke-width="3" opacity="0.9"/><ellipse cx="60" cy="10" rx="30" ry="8" fill="#ffeaa8" opacity="0.12"/></g>`,
      bun: ``,
      none: ``,
    };

    const sparkles = who === 'nyssa' || o.sparkle ? `<g fill="#fff6d8" opacity="0.8">
      <circle cx="18" cy="40" r="1.6"/><circle cx="104" cy="54" r="1.3"/><circle cx="26" cy="96" r="1.4"/>
      <circle cx="96" cy="112" r="1.7"/><circle cx="44" cy="18" r="1.2"/></g>` : '';

    return `<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" class="portrait-svg">
  <defs>
    <radialGradient id="${uid}bg" cx="50%" cy="38%" r="75%">
      <stop offset="0%" stop-color="${bg2}"/><stop offset="70%" stop-color="${bg1}"/><stop offset="100%" stop-color="${SAN.util.mix(dress, '#2a2438', 0.25)}"/>
    </radialGradient>
    <linearGradient id="${uid}hair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${SAN.util.shade(hairC, 0.18)}"/><stop offset="60%" stop-color="${hairC}"/><stop offset="100%" stop-color="${hairS}"/>
    </linearGradient>
    <linearGradient id="${uid}eye" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${SAN.util.shade(eyeC, -0.35)}"/><stop offset="55%" stop-color="${eyeC}"/><stop offset="100%" stop-color="${SAN.util.shade(eyeC, 0.45)}"/>
    </linearGradient>
    <linearGradient id="${uid}dress" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${SAN.util.shade(dress, 0.18)}"/><stop offset="100%" stop-color="${SAN.util.shade(dress, -0.12)}"/>
    </linearGradient>
    <filter id="${uid}soft"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="120" height="150" fill="url(#${uid}bg)"/>
  <circle cx="60" cy="58" r="45" fill="#ffffff" opacity="0.10"/>
  <g opacity="0.5" filter="url(#${uid}soft)">
    <circle cx="20" cy="118" r="18" fill="${SAN.util.mix(dress, '#ffffff', 0.5)}"/>
    <circle cx="100" cy="126" r="22" fill="${SAN.util.mix(dress, '#ffffff', 0.4)}"/>
  </g>
  ${backHair[hair] || backHair.long}
  <path d="M14 150 C18 122 38 108 60 108 C82 108 102 122 106 150Z" fill="url(#${uid}dress)"/>
  <path d="M40 150 C44 128 50 116 60 108 C70 116 76 128 80 150Z" fill="${accent}" opacity="0.55"/>
  <path d="M52 96 L52 112 C52 118 68 118 68 112 L68 96Z" fill="${SAN.util.shade(skin, -0.12)}"/>
  <path d="M60 28 C86 28 96 46 96 64 C96 88 82 104 60 104 C38 104 24 88 24 64 C24 46 34 28 60 28Z" fill="${skin}"/>
  <ellipse cx="60" cy="92" rx="20" ry="12" fill="${SAN.util.rgba(skin, 0.6)}"/>
  <!-- eyes -->
  <g>
    <ellipse cx="45" cy="66" rx="9.5" ry="10" fill="#fdfaf6"/>
    <ellipse cx="75" cy="66" rx="9.5" ry="10" fill="#fdfaf6"/>
    <ellipse cx="45" cy="67" rx="7.5" ry="8.6" fill="url(#${uid}eye)"/>
    <ellipse cx="75" cy="67" rx="7.5" ry="8.6" fill="url(#${uid}eye)"/>
    <ellipse cx="45" cy="67" rx="3.4" ry="4.4" fill="#2a2338"/>
    <ellipse cx="75" cy="67" rx="3.4" ry="4.4" fill="#2a2338"/>
    <circle cx="42.5" cy="63" r="2.4" fill="#ffffff" opacity="0.95"/>
    <circle cx="72.5" cy="63" r="2.4" fill="#ffffff" opacity="0.95"/>
    <circle cx="48" cy="71" r="1.2" fill="#ffffff" opacity="0.6"/>
    <circle cx="78" cy="71" r="1.2" fill="#ffffff" opacity="0.6"/>
    <path d="M35 58 C39 54 51 54 55 58" stroke="#3a3040" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M65 58 C69 54 81 54 85 58" stroke="#3a3040" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M33 64 C35 60 39 59 41 60" stroke="#3a3040" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.8"/>
    <path d="M87 64 C85 60 81 59 79 60" stroke="#3a3040" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.8"/>
  </g>
  <ellipse cx="36" cy="82" rx="7" ry="3.4" fill="#e8a0a0" opacity="0.35"/>
  <ellipse cx="84" cy="82" rx="7" ry="3.4" fill="#e8a0a0" opacity="0.35"/>
  <path d="M57 76 C58 78 60 79 61 77" stroke="${SAN.util.shade(skin, -0.28)}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.6"/>
  <path d="M55 86 C58 88.6 62 88.6 65 86" stroke="#b5707a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  ${bangs[hair] || bangs.long}
  ${accSvg[acc] || ''}
  ${glow ? `<circle cx="60" cy="60" r="52" fill="#ffffff" opacity="0.06"/>` : ''}
  ${sparkles}
  ${o.moodRing ? `<circle cx="60" cy="60" r="56" fill="none" stroke="${o.moodRing}" stroke-width="2" opacity="0.5"/>` : ''}
</svg>`;
  };
})();
