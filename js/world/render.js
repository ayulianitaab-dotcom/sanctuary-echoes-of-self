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
  let curArea = null;

  let viewH = 270, viewW = 480;

  function layout() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cw = Math.max(1, rect.width || window.innerWidth || 480);
    const ch = Math.max(1, rect.height || window.innerHeight || 270);
    const aspect = cw / ch;
    // Portrait screens get a taller, closer view so the world fills the screen;
    // desktop/landscape sees more of the surroundings.
    let targetH = 300;
    if (aspect < 0.75) targetH = 392;
    else if (aspect < 1.05) targetH = 340;
    else if (aspect >= 1.2) targetH = 340;
    else if (aspect > 2.1) targetH = 306;
    let targetW = Math.round(targetH * aspect);
    targetW = Math.max(172, Math.min(780, targetW));
    targetH = Math.round(targetW / aspect);
    if (targetW === viewW && targetH === viewH && canvas.width === targetW) return;
    viewW = targetW; viewH = targetH;
    canvas.width = viewW;
    canvas.height = viewH;
    if (ctx) ctx.imageSmoothingEnabled = false;
    W = viewW; H = viewH;
    R.view = { w: viewW, h: viewH, scale: ch / viewH };
  }

  R.resize = function () {
    layout();
  };

  R.setup = function (cv) {
    canvas = cv;
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    layout();
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
        px(sx, sy, T, T, '#8abb72');
        // soft patchwork so large lawns do not read as flat colour
        if (h > 0.5) px(sx + 2, sy + 2, 5, 4, 'rgba(94,140,76,0.26)');
        if (h < 0.3) px(sx + 9, sy + 7, 5, 5, 'rgba(184,216,138,0.26)');
        if (h > 0.24 && h < 0.42) px(sx + 8, sy + 1, 4, 6, 'rgba(84,128,68,0.18)');
        if (h > 0.62 && h < 0.72) px(sx + 1, sy + 9, 6, 3, 'rgba(170,204,126,0.22)');
        // blades and tufts, jittered per tile so lawns never form a lattice
        const bx = 1 + ((h * 13.7) % 11), by = 2 + ((h * 7.3) % 9);
        px(sx + bx, sy + by, 1, 2, C.grassDark);
        px(sx + bx + 1, sy + by - 1, 1, 3, C.grass2);
        px(sx + 13 - bx * 0.6, sy + 12 - by * 0.4, 1, 2, C.grassDark);
        if (h > 0.62) { px(sx + 2 + bx * 0.5, sy + 11, 3, 1, C.grassLight); px(sx + 4 + bx * 0.5, sy + 10, 1, 2, C.grass2); }
        if (h < 0.18) { px(sx + 1 + (h * 31 % 12), sy + 3, 2, 1, C.grassLight); px(sx + 2 + (h * 31 % 12), sy + 4, 1, 2, C.grassDark); }
        if (h > 0.975) { px(sx + 5, sy + 9, 1, 1, '#cddba6'); }
        break;
      }
      case ',': {
        px(sx, sy, T, T, C.grass);
        px(sx + 2, sy + 3, 4, 3, 'rgba(120,170,100,0.14)');
        px(sx + 3, sy + 4, 2, 1, C.grassDark);
        px(sx + 9, sy + 11, 2, 1, C.grassDark);
        const c = h > 0.66 ? C.flowerA : h > 0.33 ? C.flowerB : C.flowerC;
        // little flower with petals and stem
        px(sx + 7, sy + 8, 1, 4, '#5f8a52');
        circle(sx + 7.5, sy + 7, 1.8, c);
        px(sx + 7, sy + 7, 1, 1, h > 0.5 ? '#f6e6b8' : '#fbf4e0');
        if (h > 0.5) {
          px(sx + 12, sy + 12, 1, 3, '#5f8a52');
          circle(sx + 12.5, sy + 11, 1.4, C.flowerC);
        }
        if (h < 0.2) { px(sx + 3, sy + 11, 1, 2, C.grassDark); px(sx + 3, sy + 10, 1, 1, '#f0e0c0'); }
        break;
      }
      case '#': {
        // trodden earth: irregular patches, no repeating plank seams
        px(sx, sy, T, T, '#c39c6d');
        const patch = (cx, cy, rw, rh, col) => {
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.ellipse(sx + cx, sy + cy, rw, rh, 0, 0, Math.PI * 2);
          ctx.fill();
        };
        patch(4 + (h * 7) % 4, 5 + (h * 5) % 3, 4, 2.6, 'rgba(214,178,138,0.55)');
        patch(11, 11 + (h * 4) % 3, 3.6, 2.2, 'rgba(166,124,86,0.45)');
        patch(8, 3, 2.4, 1.6, 'rgba(150,112,78,0.3)');
        // ragged dirt edge where the path meets grass
        if (curArea) {
          const at = (dx, dy) => ((curArea.grid[ty + dy] || [])[tx + dx] || '');
          const lawn = (c) => c === '.' || c === ',' || c === 's';
          if (lawn(at(-1, 0))) {
            px(sx, sy + 0.5 + (h * 9) % 12, 3, 4, '#8fbb74');
            px(sx + 2, sy + 5 + (h * 7) % 8, 2, 2, '#7fae66');
            px(sx + 2, sy + 10 + (h * 5) % 5, 1, 3, '#6d9e5c');
          }
          if (lawn(at(1, 0))) {
            px(sx + 13, sy + 1 + (h * 11) % 11, 3, 4, '#8fbb74');
            px(sx + 13, sy + 6 + (h * 5) % 7, 2, 2, '#7fae66');
            px(sx + 13, sy + 11 + (h * 3) % 4, 1, 3, '#6d9e5c');
          }
          if (lawn(at(0, -1))) { px(sx + 1 + (h * 11) % 11, sy, 4, 3, '#8fbb74'); px(sx + 3 + (h * 5) % 9, sy + 2, 2, 1, '#7fae66'); }
          if (lawn(at(0, 1))) { px(sx + 2 + (h * 7) % 9, sy + 13, 4, 3, '#8fbb74'); px(sx + 5 + (h * 3) % 8, sy + 13, 2, 1, '#7fae66'); }
        }
        for (let i = 0; i < 5; i++) {
          const hx2 = (h * (i + 3) * 71) % 13;
          const hy2 = (h * (i + 2) * 41) % 13;
          px(sx + 1 + hx2, sy + 1 + hy2, 1, 1, i % 2 ? '#b08a60' : '#dcbd94');
        }
        if (h > 0.82) { px(sx + 2, sy + 13, 2, 1, '#a07f58'); px(sx + 12, sy + 2, 1, 2, 'rgba(118,156,96,0.5)'); }
        if (h < 0.14) px(sx + 5, sy + 7, 3, 1, 'rgba(150,112,78,0.45)');
        break;
      }
      case '=': {
        // warm cobbled plaza: small irregular setts, not a grid of slabs
        px(sx, sy, T, T, '#b0a596');
        const jx = (k) => 1 + ((h * 17.3 + k * 7.1) % 3);
        const jy = (k) => 1 + ((h * 11.9 + k * 5.3) % 3);
        const stones = [
          [0.4, 0.4, 6, 5],
          [8, 1, 6, 5],
          [2, 8, 5, 5],
          [8, 8, 7, 6],
        ];
        stones.forEach(([ox, oy, sw2, sh2], i) => {
          ox += jx(i) - 1; oy += jy(i) - 1.5;
          const c = ['#cbc1b1', '#c1b7a6', '#c6bcaa', '#bcb2a1'][(i + Math.floor(h * 4)) % 4];
          ctx.fillStyle = c;
          ctx.beginPath();
          ctx.moveTo(sx + ox + 1, sy + oy);
          ctx.quadraticCurveTo(sx + ox + sw2 / 2, sy + oy - 1, sx + ox + sw2, sy + oy + 1);
          ctx.quadraticCurveTo(sx + ox + sw2 + 1, sy + oy + sh2 / 2, sx + ox + sw2 - 1, sy + oy + sh2);
          ctx.quadraticCurveTo(sx + ox + sw2 / 2, sy + oy + sh2 + 1, sx + ox, sy + oy + sh2 - 1);
          ctx.quadraticCurveTo(sx + ox - 1, sy + oy + sh2 / 2, sx + ox + 1, sy + oy);
          ctx.closePath(); ctx.fill();
          if (i === 0) px(sx + ox + 1, sy + oy + 1, 3, 1, 'rgba(255,250,240,0.35)');
        });
        if (h > 0.8) { px(sx + 13, sy + 12, 2, 1, 'rgba(112,148,94,0.5)'); px(sx + 3, sy + 7, 1, 1, 'rgba(112,148,94,0.35)'); }
        if (h < 0.16) px(sx + 6, sy + 7, 2, 1, '#a89d8c');
        break;
      }
      case '~': {
        const wob = Math.sin(t * 1.6 + tx * 0.7 + ty * 0.4) * 2;
        px(sx, sy, T, T, C.water);
        px(sx, sy + 5, T, 6, 'rgba(150,205,220,0.18)');
        px(sx, sy + 6 + wob, T, 2, C.water2);
        px(sx + 2, sy + 12 - wob, 6, 1, C.waterLight);
        px(sx + 10, sy + 2 + wob, 4, 1, 'rgba(200,235,242,0.7)');
        if (h > 0.7) { px(sx + 4, sy + 3, 2, 1, '#d7eef4'); px(sx + 12, sy + 10, 2, 1, '#d7eef4'); }
        break;
      }
      case 's':
        px(sx, sy, T, T, C.sand);
        if (h > 0.7) px(sx + 4, sy + 6, 2, 1, C.sand2);
        if (h < 0.2) px(sx + 10, sy + 12, 3, 1, C.sandDark);
        // ripples and tiny shells
        px(sx + 2, sy + 10, 5, 1, 'rgba(210,190,150,0.5)');
        px(sx + 8, sy + 4, 4, 1, 'rgba(255,246,226,0.55)');
        if (h > 0.9) circle(sx + 12, sy + 8, 1.2, '#fbf1e2');
        if (h < 0.08) px(sx + 5, sy + 2, 1, 1, '#c9ad86');
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
    const tm = Date.now() / 1000;
    const sw = Math.sin(tm * 0.85 + x * 0.11 + y * 0.05) * 1.3;
    ellipse(x + 9, y + 17, 10, 3.4, 'rgba(30,42,28,0.26)');
    // trunk with bark and roots
    px(x + 5, y + 6, 7, 11, '#6d4e33');
    px(x + 6, y + 7, 3, 10, '#8d6b49');
    px(x + 9, y + 8, 2, 9, '#664a30');
    px(x + 3, y + 15, 4, 2, '#5d452e');
    px(x + 11, y + 16, 4, 1, '#5d452e');
    px(x + 7, y + 9, 1, 5, '#a17d55');
    if (variant === 2) {
      // blossom tree
      circle(x + 8 + sw * 0.4, y + 2, 8, '#d9a3bd');
      circle(x + 3 + sw * 0.6, y + 6, 5.5, '#cf93b0');
      circle(x + 13 + sw * 0.3, y + 5, 6, '#dba9c2');
      circle(x + 8 + sw * 0.5, y + 5, 7, '#e8bcd1');
      circle(x + 6 + sw * 0.4, y + 0.5, 4.5, '#f0cadd');
      px(x + 4, y + 3, 2, 1, '#fbe2ee');
      px(x + 10, y + 4, 2, 1, '#f7d6e6');
      if (Math.sin(tm * 0.8 + x) > 0.6) px(x + 3 + (tm * 6 % 5), y + 8, 1, 1, '#f7d6e6');
      return;
    }
    // layered canopy with a dark underside so it lifts off the grass
    circle(x + 8 + sw * 0.3, y + 2, 8, '#33553a');
    circle(x + 8 + sw * 0.3, y + 1, 7.2, '#456f43');
    circle(x + 2.5 + sw * 0.5, y + 6, 6, '#527c4a');
    circle(x + 13 + sw * 0.2, y + 5.5, 6, '#4d7647');
    circle(x + 8 + sw * 0.45, y + 4.5, 7, '#5c8651');
    circle(x + 6 + sw * 0.35, y + 0.5, 4.6, '#6f9c5e');
    // dappled light + leaves
    px(x + 4, y + 2, 2, 1, '#8dba75');
    px(x + 10, y + 3, 2, 1, '#7fae6c');
    px(x + 7, y + 7, 1, 1, '#a6cf8f');
    if (variant === 1) { px(x + 11, y + 7, 2, 2, '#f0d98a'); px(x + 5, y + 9, 1, 1, '#e8a9c0'); }
    if (Math.sin(tm * 0.6 + x) > 0.85) px(x + 2 + (tm * 5 % 6), y + 9, 1, 1, '#9dc487');
  }
  function drawPine(x, y) {
    const tm = Date.now() / 1000;
    const sway = Math.sin(tm * 0.7 + x * 0.2) * 0.9;
    ellipse(x + 8, y + 16, 7, 3, 'rgba(24,38,30,0.26)');
    px(x + 7, y + 11, 3, 5, '#604a36');
    const layer = (top, bottom, half, col) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(x + 8 + sway, y + top);
      ctx.lineTo(x + 8 + half + sway, y + bottom);
      ctx.lineTo(x + 8 - half + sway, y + bottom);
      ctx.closePath(); ctx.fill();
    };
    layer(-6, 6, 7, '#2f5740');
    layer(-3, 10, 8, '#38624a');
    layer(0, 14, 9, '#3f6d4f');
    layer(3, 17, 8, '#477a56');
    // highlights
    px(x + 6 + sway, y + 4, 1, 6, '#5c8f66');
    px(x + 10 + sway, y + 8, 1, 5, '#54865f');
    px(x + 3 + sway, y + 12, 2, 1, '#5f9269');
  }
  function drawBush(x, y, berries) {
    const sw = Math.sin(Date.now() / 1600 + x) * 0.6;
    ellipse(x + 8, y + 15, 7.5, 2.6, 'rgba(36,52,34,0.2)');
    circle(x + 5.5 + sw, y + 9, 4.8, '#4f7c48');
    circle(x + 11 + sw * 0.6, y + 9, 4.8, '#487141');
    circle(x + 8 + sw, y + 6, 5, '#5d8a52');
    circle(x + 8 + sw, y + 4.4, 3.4, '#6b9a5d');
    px(x + 6 + sw, y + 3, 2, 1, '#86b477');
    if (berries) {
      px(x + 3, y + 8, 2, 2, '#c9697a'); px(x + 10, y + 6, 2, 2, '#c9697a');
      px(x + 8, y + 11, 2, 2, '#b8556a'); px(x + 6, y + 4, 1, 1, '#d98a98');
    } else if (Math.sin(Date.now() / 2200 + x) > 0.2) {
      px(x + 4, y + 7, 1, 1, '#f0d98a'); px(x + 10, y + 5, 1, 1, '#e8c9e0');
    }
  }
  function drawRock(x, y) {
    ellipse(x + 8, y + 15, 7, 2.6, 'rgba(38,38,34,0.22)');
    ctx.fillStyle = '#9d988b';
    ctx.beginPath();
    ctx.moveTo(x + 1, y + 14); ctx.lineTo(x + 3, y + 7); ctx.lineTo(x + 7, y + 4);
    ctx.lineTo(x + 12, y + 5); ctx.lineTo(x + 15, y + 10); ctx.lineTo(x + 14, y + 14);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#b3ae9f';
    ctx.beginPath();
    ctx.moveTo(x + 3, y + 7); ctx.lineTo(x + 7, y + 4); ctx.lineTo(x + 12, y + 5); ctx.lineTo(x + 9, y + 9);
    ctx.closePath(); ctx.fill();
    px(x + 4, y + 11, 4, 1, '#8b877b');
    px(x + 9, y + 12, 3, 1, '#7f7b70');
    px(x + 5, y + 13, 2, 1, '#6f9c62');
  }
  function windowsLit() {
    const S = SAN.state && SAN.state.S;
    if (!S || !S.time) return false;
    const m = S.time.minutes;
    return m >= 17 * 60 + 20 || m < 6 * 60 + 30;
  }

  function drawBuilding(p, x, y) {
    const w = (p.w || 1) * T, h = (p.h || 1) * T;
    const style = p.style || 'cottage';
    const roofs = { home: '#a8788a', store: '#83789e', bakery: '#b8815c', library: '#66738a', flower: '#ac7c96', teashop: '#7f8f60', cottage: '#a0806a', shed: '#8a7a68', lighthouse: '#e8e4dc' };
    const walls = { home: '#f4e8d9', store: '#efe4d2', bakery: '#f8ead4', library: '#e8e2d4', flower: '#f6e6ee', teashop: '#eef0dd', cottage: '#eddfcc', shed: '#e2d6c4', lighthouse: '#f4f2ec' };
    const trims = { home: '#8e5f70', store: '#6f6290', bakery: '#9a6240', library: '#55627a', flower: '#94607e', teashop: '#687a4e', cottage: '#8a6a52', shed: '#6f6252' };
    const lit = windowsLit();
    if (style === 'lighthouse') { drawLighthouse(x, y, w, h); return; }
    const roofH = Math.max(14, h * 0.44);
    ellipse(x + w / 2, y + h - 2, w * 0.6, 4.5, 'rgba(34,30,26,0.22)');
    // stone foundation
    px(x + 2, y + h - 7, w - 4, 6, '#bcb2a2');
    for (let i = 0; i < w - 8; i += 7) {
      px(x + 3 + i, y + h - 6, 6, 2, i % 14 ? '#c8bfae' : '#aea596');
      px(x + 3 + i, y + h - 3, 5, 2, '#c2b9a9');
    }
    // plaster wall with soft vertical gradient
    const wg = ctx.createLinearGradient(0, y + roofH, 0, y + h - 4);
    wg.addColorStop(0, walls[style] || '#efe2d0');
    wg.addColorStop(1, SAN.util.shade(walls[style] || '#efe2d0', -0.08));
    ctx.fillStyle = wg;
    ctx.fillRect(x + 2, y + roofH, w - 4, h - roofH - 5);
    // timber frame
    const trim = trims[style] || '#8a6a52';
    px(x + 2, y + roofH, 3, h - roofH - 5, trim);
    px(x + w - 5, y + roofH, 3, h - roofH - 5, trim);
    px(x + 2, y + roofH, w - 4, 2, trim);
    if (w > 56) px(x + Math.round(w * 0.62), y + roofH + 6, 2, h - roofH - 12, 'rgba(120,92,70,0.35)');

    // roof with shingle rows
    const apexX = x + w / 2, apexY = y - 3, eaveY = y + roofH + 3;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x - 4, eaveY);
    ctx.lineTo(apexX, apexY);
    ctx.lineTo(x + w + 4, eaveY);
    ctx.closePath();
    ctx.clip();
    const rg = ctx.createLinearGradient(0, apexY, 0, eaveY);
    rg.addColorStop(0, SAN.util.shade(roofs[style] || '#a8667a', 0.16));
    rg.addColorStop(1, SAN.util.shade(roofs[style] || '#a8667a', -0.12));
    ctx.fillStyle = rg;
    ctx.fillRect(x - 4, apexY, w + 8, eaveY - apexY + 1);
    // lateral shading: sunlit left slope, shaded right slope
    ctx.beginPath();
    ctx.moveTo(x - 4, eaveY); ctx.lineTo(apexX, apexY); ctx.lineTo(apexX, eaveY);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,246,232,0.10)'; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + w + 4, eaveY); ctx.lineTo(apexX, apexY); ctx.lineTo(apexX, eaveY);
    ctx.closePath();
    ctx.fillStyle = 'rgba(38,20,28,0.12)'; ctx.fill();
    // shingle courses with stronger relief
    for (let ry = apexY + 3; ry < eaveY; ry += 3.2) {
      px(x - 4, ry, w + 8, 1, 'rgba(56,34,42,0.28)');
      const off = ((ry - apexY) * 2) % 7 > 3.5 ? 3 : 0;
      let k = 0;
      for (let sx2 = x - 4 + off; sx2 < x + w + 4; sx2 += 6.5) {
        px(sx2, ry - 2.4, 1, 2.4, 'rgba(255,255,255,0.14)');
        // alternating shingle tabs give the roof a layered, tiled read
        px(sx2 + 1, ry - 2.2, 5, 1.6, k % 2 ? 'rgba(255,255,255,0.07)' : 'rgba(52,30,40,0.09)');
        k++;
      }
    }
    // dark under-eave so the roof reads as a solid volume
    px(x - 4, eaveY - 4, w + 8, 4, 'rgba(52,30,40,0.22)');
    // left-light gradient
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.beginPath();
    ctx.moveTo(x - 4, eaveY); ctx.lineTo(apexX, apexY); ctx.lineTo(apexX, eaveY);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    // ridge cap + eaves
    px(apexX - 1.5, apexY + 1, 3, roofH, 'rgba(92,58,64,0.4)');
    px(apexX - 4, apexY + 1, 8, 2, trim);
    px(x - 5, eaveY, w + 10, 3, trim);
    px(x - 5, eaveY + 3, w + 10, 1.5, 'rgba(40,26,30,0.28)');
    px(x - 5, eaveY - 1, w + 10, 1, 'rgba(255,255,255,0.18)');
    circle(apexX, apexY + 1, 2, trim);
    // chimney + smoke
    if (style === 'bakery' || style === 'home' || style === 'teashop') {
      const chx = x + w - 16, chy = apexY + roofH * 0.32;
      px(chx, chy, 6, 12, '#b9a08c');
      px(chx - 1, chy, 8, 3, '#8d7a6a');
      px(chx + 1, chy - 1, 4, 2, '#d6c4b2');
      const t0 = Date.now() / 900;
      for (let i = 0; i < 3; i++) {
        const ph = (t0 + i * 0.7) % 3;
        circle(chx + 3 + Math.sin(t0 + i) * 2, chy - 4 - ph * 4, 1.6 + ph * 0.9, `rgba(244,240,232,${0.34 - ph * 0.09})`);
      }
    }
    const winY = y + roofH + 9;
    const winLit = lit ? '#ffe8a8' : '#cfe2e8';
    for (let i = 0; i < 2; i++) {
      const wx = x + 8 + i * (w - 27);
      if (w < 54 && i === 1) continue;
      // frame, glass, mullions, curtains, flower box
      px(wx - 1, winY - 1, 12, 11, trim);
      px(wx, winY, 10, 9, winLit);
      if (lit) {
        const gg = ctx.createRadialGradient(wx + 5, winY + 4, 1, wx + 5, winY + 4, 13);
        gg.addColorStop(0, 'rgba(255,226,150,0.75)');
        gg.addColorStop(1, 'rgba(255,226,150,0)');
        ctx.fillStyle = gg;
        ctx.fillRect(wx - 9, winY - 9, 28, 27);
      }
      px(wx + 4.5, winY, 1, 9, trim);
      px(wx, winY + 4, 10, 1, trim);
      px(wx + 1, winY + 1, 2, 7, 'rgba(255,255,255,0.45)');
      px(wx - 2, winY + 10, 14, 2, '#a98460');
      for (let k = 0; k < 4; k++) circle(wx - 1 + k * 3.5, winY + 9, 1.2, ['#e8a9c0', '#f0d98a', '#d9b8e8', '#c9dfae'][(k + i) % 4]);
    }
    // door with panels, handle, step
    if (p.doorRel) {
      const dx = x + p.doorRel.x * T, dy = y + p.doorRel.y * T;
      px(dx + 1, dy + 1, 14, 16, trim);
      px(dx + 2, dy + 2, 12, 14, '#7d5a40');
      px(dx + 3, dy + 3, 10, 5, '#8f6a4c');
      px(dx + 3, dy + 9, 10, 6, '#8f6a4c');
      px(dx + 10, dy + 9, 1.6, 1.6, '#e8c98a');
      px(dx + 1, dy + 15, 14, 2, '#b0a392');
      px(dx - 1, dy - 1, 16, 2, 'rgba(90,60,44,0.3)');
    }
    if (p.sign) {
      const sw2 = Math.max(38, Math.min(70, String(p.sign).length * 5.4 + 10));
      px(x + w / 2 - sw2 / 2, y + roofH + 5, sw2, 9, '#f4e7cf');
      px(x + w / 2 - sw2 / 2, y + roofH + 5, sw2, 1, '#c9b58a');
      px(x + w / 2 - sw2 / 2, y + roofH + 10, sw2, 1, '#c9b58a');
      ctx.fillStyle = '#7c5a40';
      ctx.font = '6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.sign, x + w / 2, y + roofH + 8.4);
      ctx.textAlign = 'left';
    }
    if (style === 'store') {
      // striped awning
      for (let i = 0; i < Math.floor((w - 8) / 6); i++) px(x + 4 + i * 6, winY - 4, 5, 4, i % 2 ? '#f4ecd8' : '#b9a6d8');
      px(x + 4, winY - 4, w - 8, 1, 'rgba(90,70,90,0.3)');
    }
    if (style === 'flower') {
      for (let i = 0; i < 5; i++) circle(x + 6 + i * 6, y + h - 8, 2, i % 2 ? '#e8a9c0' : '#d9b8e8');
      px(x + 3, y + h - 8, w - 6, 1, '#7f9a6a');
    }
    if (style === 'teashop') {
      px(x + 5, y + roofH + 4, 1, 6, '#6f5a44');
      px(x + 3, y + roofH + 10, 5, 6, '#e8b8a0');
      px(x + 4, y + roofH + 11, 3, 4, '#f6e6b8');
    }
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
    ellipse(x + 24, y + 45, 25, 6.5, 'rgba(30,34,34,0.26)');
    // stone coping: individual blocks, chipped corners
    px(x + 1, y + 15, 46, 30, '#b7ae9e');
    px(x + 3, y + 17, 42, 26, '#cfc6b5');
    for (let i = 0; i < 7; i++) {
      const bx = x + 3 + i * 6;
      px(bx, y + 17, 1, 26, 'rgba(126,114,96,0.35)');
      px(bx + 1, y + 17, 4, 2, 'rgba(255,250,238,0.55)');
    }
    px(x + 3, y + 41, 42, 2, 'rgba(110,98,82,0.45)');
    // water with depth and moving highlights
    px(x + 6, y + 20, 36, 22, '#7fb4c6');
    px(x + 7, y + 21, 34, 20, '#96c8d6');
    const wob = Math.sin(t * 2) * 1.4;
    px(x + 9, y + 24 + wob, 12, 1, 'rgba(224,246,250,0.7)');
    px(x + 24, y + 33 - wob, 13, 1, 'rgba(214,240,248,0.55)');
    px(x + 13, y + 37, 8, 1, 'rgba(120,168,186,0.5)');
    // pedestal and statue
    px(x + 19, y + 12, 11, 26, '#bdb3a2');
    px(x + 20, y + 13, 9, 24, '#d8cfbd');
    px(x + 20, y + 13, 3, 24, 'rgba(255,252,244,0.35)');
    px(x + 21, y + 22, 7, 3, '#b9d7e0');
    ellipse(x + 24.5, y + 10, 3.4, 2.2, '#e6ded0');
    // falling water
    for (let i = 0; i < 5; i++) {
      const ph = (t * 1.6 + i * 0.7) % 4.2;
      px(x + 20 + i * 2, y + 13 + ph * 5, 1, 2, `rgba(214,242,250,${0.75 - ph / 7})`);
    }
    circle(x + 24, y + 9, 2.6, '#f0f8fb');
    if (Math.sin(t * 0.9) > 0.6) px(x + 12, y + 29, 2, 1, 'rgba(240,252,255,0.65)');
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
        const gl = 0.5 + Math.sin(t * 2 + x) * 0.12;
        px(x + 7, y + 5, 2, 10, '#6d5a44');
        px(x + 6, y + 15, 4, 1, '#5a4a38');
        px(x + 4, y + 1, 8, 6, '#7d6a50');
        px(x + 5, y + 2, 6, 4, 'rgba(255,236,170,0.9)');
        px(x + 4, y, 8, 1, '#5f5344');
        circle(x + 8, y + 3, 3.5, `rgba(255,230,160,${gl})`);
        circle(x + 8, y + 4, 9, `rgba(255,230,160,${gl * 0.12})`);
        break;
      }
      case 'bunting': {
        const sag = Math.sin(t * 1.1) * 0.6;
        ctx.strokeStyle = '#8a7358';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x + 2, y + 4);
        ctx.quadraticCurveTo(x + w / 2, y + 9 + sag, x + w - 2, y + 4);
        ctx.stroke();
        const bcols = ['#e8c6d8', '#f4ecd8', '#c9b6e3', '#f0d98a'];
        for (let i = 0; i < 9; i++) {
          const px2 = x + 5 + i * ((w - 10) / 8);
          const py2 = y + 5 + Math.sin((i / 8) * Math.PI) * 4 + sag * 0.6;
          ctx.fillStyle = bcols[i % 4];
          ctx.beginPath();
          ctx.moveTo(px2 - 2, py2); ctx.lineTo(px2 + 2, py2); ctx.lineTo(px2, py2 + 4);
          ctx.closePath(); ctx.fill();
        }
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
      case 'window': {
        const lit = windowsLit();
        px(x + 1, y + 2, w - 2, 12, lit ? '#ffe6a4' : '#cfe2e8');
        if (lit) {
          const gg = ctx.createRadialGradient(x + w / 2, y + 8, 2, x + w / 2, y + 8, w * 0.9);
          gg.addColorStop(0, 'rgba(255,230,160,0.4)');
          gg.addColorStop(1, 'rgba(255,230,160,0)');
          ctx.fillStyle = gg;
          ctx.fillRect(x - 8, y - 4, w + 16, h + 10);
        }
        px(x + 1, y + 2, w - 2, 1, '#b9a382');
        px(x + 1, y + 13, w - 2, 1, '#b9a382');
        px(x + Math.round(w / 2), y + 2, 1, 12, '#b9a382');
        px(x + 1, y + 8, w - 2, 1, '#b9a382');
        px(x, y + 1, 1, 13, '#8f7358');
        px(x + w - 1, y + 1, 1, 13, '#8f7358');
        // lace curtains
        px(x + 1, y + 2, 2, 12, 'rgba(250,244,232,0.7)');
        px(x + w - 3, y + 2, 2, 12, 'rgba(250,244,232,0.7)');
        px(x + 2, y + 2, 1, 5, 'rgba(255,255,255,0.45)');
        break;
      }
      case 'bed':
        px(x + 1, y + 2, w - 2, h - 2, '#a8764f');
        px(x + 2, y + 3, w - 4, h - 4, '#c9a97e');
        // headboard
        px(x + 1, y, w - 2, 4, '#8f6a4a');
        px(x + 2, y + 1, w - 4, 2, '#b98d62');
        // mattress + pillows
        px(x + 2, y + 4, w - 4, h - 8, '#f3e9d4');
        px(x + 3, y + 5, w - 6, 6, '#fbf4e4');
        px(x + 4, y + 6, 8, 4, '#fdf8ee');
        px(x + 4, y + 6, 8, 1, '#e8dcc8');
        // quilt layers
        px(x + 2, y + h - 10, w - 4, 8, '#c9a9c0');
        px(x + 2, y + h - 10, w - 4, 1, '#e0c8d8');
        px(x + 3, y + h - 7, w - 6, 1, '#b997b0');
        for (let i = 0; i < 3; i++) px(x + 4 + i * 8, y + h - 6, 2, 2, '#e8d8e4');
        px(x + 2, y + h - 3, w - 4, 1, '#a8764f');
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
      case 'fireplace': {
        // stone surround
        px(x + 1, y + 2, w - 2, h - 2, '#b0a89a');
        px(x + 2, y + 3, w - 4, h - 4, '#c2bbac');
        for (let sy2 = y + 4; sy2 < y + h - 3; sy2 += 6) {
          for (let sx2 = x + 3; sx2 < x + w - 3; sx2 += 8) px(sx2, sy2, 6, 3, sy2 % 12 ? '#b8b1a2' : '#a9a294');
        }
        px(x + 3, y + 6, w - 6, h - 8, '#3a2f28');
        px(x + 4, y + h - 8, w - 8, 4, '#6b4a35');
        const fl = 0.8 + Math.sin(t * 3) * 0.2;
        circle(x + w / 2, y + h - 7, 9, `rgba(255,180,90,${0.16 * fl})`);
        for (let i = 0; i < 4; i++) {
          const f = Math.sin(t * 5.5 + i * 1.9) * 1.6;
          circle(x + w / 2 - 6 + i * 4, y + h - 7 + f, 2.6 + (i % 2), i % 2 ? '#f0a24a' : '#f6c96a');
        }
        circle(x + w / 2, y + h - 9, 2, '#fff0c0');
        // mantel + framed picture + candles
        px(x + 1, y, w - 2, 3, '#8f6a4a');
        px(x + 2, y + 1, w - 4, 1, '#b98d62');
        px(x + 4, y - 9, 10, 9, '#a8764f');
        px(x + 5, y - 8, 8, 7, '#d9e2e0');
        px(x + 5, y - 4, 8, 3, '#9db8a8');
        circle(x + 7, y - 6, 1.4, '#f0d98a');
        px(x + w - 8, y - 4, 2, 4, '#f4ecd8');
        circle(x + w - 7, y - 5, 1.4, 'rgba(255,220,140,0.9)');
        break;
      }
      case 'sofa':
        px(x + 2, y + 7, w - 4, 7, '#8f7a9c');
        px(x + 3, y + 2, w - 6, 6, '#a891b4');
        px(x + 4, y + 3, w - 8, 4, '#b9a4c6');
        px(x + 2, y + 8, w - 4, 4, '#c0aecb');
        px(x + 4, y + 8, 6, 4, '#d3c2dc');
        px(x + w - 10, y + 8, 6, 4, '#d3c2dc');
        px(x + 1, y + 7, 3, 7, '#9a86a8');
        px(x + w - 4, y + 7, 3, 7, '#9a86a8');
        px(x + 3, y + 14, 2, 2, '#7a5a3c');
        px(x + w - 5, y + 14, 2, 2, '#7a5a3c');
        // throw + cushion
        px(x + w - 14, y + 9, 8, 2, '#e8cfd0');
        circle(x + 7, y + 8, 2.4, '#f2c9dc');
        break;
      case 'nightstand':
        px(x + 1, y + 4, 14, 10, '#a8764f');
        px(x + 2, y + 5, 12, 8, '#c9a97e');
        px(x + 3, y + 9, 10, 3, '#b98d62');
        px(x + 7, y + 10, 2, 1, '#e8c98a');
        px(x + 4, y + 2, 2, 3, '#f4ecd8');
        circle(x + 5, y + 1, 1.6, 'rgba(255,226,150,0.95)');
        px(x + 9, y + 3, 4, 2, '#8f6a4a');
        break;
      case 'counter':
        px(x + 1, y + 3, w - 2, h - 4, '#9a7150');
        px(x + 2, y + 4, w - 4, 5, '#efe6d8');
        px(x + 1, y + 9, w - 2, 3, '#b98d62');
        for (let i = 0; i < Math.floor((w - 4) / 8); i++) px(x + 4 + i * 8, y + 10, 6, 3, '#c9a97e');
        break;
      case 'sink':
        px(x + 1, y + 2, w - 2, h - 3, '#c2bfb6');
        px(x + 3, y + 4, w - 6, 5, '#6f8f9a');
        px(x + 4, y + 5, w - 8, 3, '#8fb3bc');
        px(x + w / 2, y + 1, 2, 4, '#9a9a92');
        px(x + w / 2, y + 1, 5, 1, '#9a9a92');
        px(x + 2, y + 11, w - 4, 2, '#a9a69c');
        break;
      case 'catbed':
        ellipse(x + w / 2, y + 12, w * 0.42, 5, '#c9a3b6');
        ellipse(x + w / 2, y + 11, w * 0.32, 3.4, '#e8d8e0');
        px(x + 3, y + 10, 2, 2, '#f0c9d8');
        break;
      case 'catbowl':
        ellipse(x + 8, y + 12, 5, 2, '#8a7a68');
        px(x + 4, y + 9, 8, 4, '#c9b8a0');
        px(x + 5, y + 9, 6, 2, '#a8916a');
        px(x + 6, y + 9, 2, 1, '#e8c98a');
        break;
      case 'cattower':
        px(x + 5, y + 6, 6, h - 8, '#c9a97e');
        px(x + 6, y + 6, 2, h - 8, '#d8b98c');
        px(x + 2, y + h - 12, 12, 4, '#b98d62');
        px(x + 2, y + 1, 12, 4, '#b98d62');
        px(x + 3, y + 2, 10, 2, '#d8b98c');
        px(x + 4, y + 8, 8, 1, '#a8764f');
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
        px(x + 1, y + 1, w - 2, h - 2, '#c09ab0');
        px(x + 2, y + 2, w - 4, h - 4, '#d8b8c8');
        px(x + 2, y + 2, w - 4, 1, '#e8d0dc');
        px(x + 4, y + 4, w - 8, h - 8, '#e0c8d4');
        px(x + w / 2 - 3, y + h / 2 - 2, 6, 4, '#cfa9bd');
        px(x + w / 2 - 1, y + h / 2 - 1, 2, 2, '#f2e3ea');
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
  /* anime-chibi pixel sprite: 16×26, shared by player and NPCs */
  R.drawPlayer = function (p, sx, sy, t) {
    if (!p) return;
    const c = p.colors || {};
    const shade = SAN.util.shade;
    const hair = c.hair || '#e8dcc6';
    const hairDark = c.hairShade || shade(hair, -0.22);
    const hairLight = shade(hair, 0.18);
    const skin = c.skin || '#f6dfcf';
    const skinDark = c.skinDark || shade(skin, -0.14);
    const dress = c.dress || '#c9b8e0';
    const dressDark = shade(dress, -0.18);
    const accent = c.accent || '#fbf4e6';
    const eye = c.eye || '#8fb3d9';
    const bob = p.moving ? Math.sin(p.walkPhase) * 1 : Math.sin(t * 1.6 + (p.phase || 0)) * 0.4;
    const swing = p.moving ? Math.sin(p.walkPhase) : 0;
    const liftL = Math.max(0, swing) * 2;
    const liftR = Math.max(0, -swing) * 2;
    const y = sy + bob;
    const hx = sx + 3, hy = y - 1;
    ctx.save();
    ctx.shadowColor = 'rgba(38,30,44,0.28)';
    ctx.shadowBlur = 1;
    ctx.shadowOffsetY = 0.8;
    const sw = swing * 0.8;
    ellipse(sx + 8, y + 23, 6.5, 2.2, 'rgba(26,24,30,0.26)');
    if (p.glow) circle(sx + 8, sy + 12, 14, 'rgba(230,225,255,0.14)');

    // legs + shoes
    if (!p.sitting) {
      px(sx + 5, y + 18 - liftL, 2, 5, skinDark);
      px(sx + 9, y + 18 - liftR, 2, 5, skinDark);
      px(sx + 5, y + 21 - liftL, 2, 2, '#6b5442');
      px(sx + 9, y + 21 - liftR, 2, 2, '#6b5442');
      px(sx + 5, y + 22 - liftL, 2, 1, '#54402f');
      px(sx + 9, y + 22 - liftR, 2, 1, '#54402f');
    }
    // outfit
    if (p.gender === 'masculine' || p.outfit === 'tunic') {
      px(sx + 3, y + 11, 11, 7, dress);
      px(sx + 4, y + 12, 9, 5, accent);
      px(sx + 3, y + 17, 11, 1, dressDark);
      px(sx + 4, y + 15, 9, 1, dressDark);
      px(sx + 7, y + 12, 1, 5, accent);
      px(sx + 3, y + 11, 1, 6, shade(dress, 0.12));
    } else {
      // skirt with petticoat and folds
      ctx.fillStyle = dress;
      ctx.beginPath();
      ctx.moveTo(sx + 5, y + 12);
      ctx.lineTo(sx + 11, y + 12);
      ctx.lineTo(sx + 15 + sw * 0.4, y + 20);
      ctx.lineTo(sx + 1 + sw * 0.4, y + 20);
      ctx.closePath(); ctx.fill();
      px(sx + 3, y + 19, 10, 1.5, accent);
      px(sx + 3, y + 20, 10, 0.8, shade(accent, -0.16));
      px(sx + 5, y + 14, 1, 5, dressDark);
      px(sx + 8, y + 13, 1, 6, dressDark);
      px(sx + 10, y + 14, 1, 5, shade(dress, 0.1));
      // bodice
      px(sx + 5, y + 10, 6, 3, dress);
      px(sx + 5, y + 10, 6, 1, accent);
      px(sx + 7, y + 10, 1, 3, shade(accent, -0.1));
      px(sx + 8, y + 11, 1, 1, '#d9b06a');
      px(sx + 6, y + 12, 1, 1, '#d9b06a');
      px(sx + 9, y + 12, 1, 1, '#d9b06a');
    }
    // puff sleeves + arms
    const armSwing = p.moving ? Math.sin(p.walkPhase) * 2 : 0;
    circle(sx + 3, y + 12, 2.2, dress);
    circle(sx + 13, y + 12, 2.2, dress);
    px(sx + 2, y + 14 + Math.max(0, armSwing) * 0.4, 2, 4, skin);
    px(sx + 12, y + 14 + Math.max(0, -armSwing) * 0.4, 2, 4, skin);
    px(sx + 2, y + 18 + Math.max(0, armSwing) * 0.4, 2, 1, skinDark);
    px(sx + 12, y + 18 + Math.max(0, -armSwing) * 0.4, 2, 1, skinDark);
    px(sx + 6, y + 9, 4, 2, skinDark);

    // ---- head ----
    // back hair silhouette
    if (p.hair === 'long' || p.hair === 'wavy' || p.hair === 'braid') {
      px(hx - 2, hy + 3, 2, 13 + (p.hair === 'wavy' ? 2 : 0), hairDark);
      px(hx + 12, hy + 3, 2, 13 + (p.hair === 'wavy' ? 2 : 0), hairDark);
      px(hx - 1, hy + 4, 1, 10, hair);
      px(hx + 12, hy + 4, 1, 10, hair);
    }
    px(hx, hy + 1, 12, 10, hairDark);
    px(hx + 1, hy + 1, 10, 3, hair);
    // face
    px(hx + 2, hy + 4, 8, 7, skin);
    px(hx + 1, hy + 6, 1, 3, skinDark);
    px(hx + 10, hy + 6, 1, 3, skinDark);
    // bangs (layered)
    if (p.facing !== 'up') {
      px(hx + 1, hy + 1, 10, 3, hair);
      px(hx + 2, hy + 3, 2, 2, hair);
      px(hx + 8, hy + 3, 2, 2, hair);
      px(hx + 1, hy + 2, 2, 5, hair);
      px(hx + 9, hy + 2, 2, 5, hair);
      px(hx + 3, hy + 1, 4, 1, hairLight);
      if (p.hair === 'bob') { px(hx, hy + 4, 2, 4, hair); px(hx + 10, hy + 4, 2, 4, hair); }
      if (p.hair === 'bun') { circle(hx + 6, hy - 1, 3, hair); circle(hx + 6, hy - 1, 1.4, hairLight); }
      if (p.hair === 'ponytail') { px(hx + 12, hy + 3, 2, 7, hair); px(hx + 13, hy + 6, 1, 6, hairDark); }
      if (p.hair === 'braid') {
        px(hx + 11, hy + 6, 2, 3, hair); px(hx + 12, hy + 9, 2, 3, hair);
        px(hx + 12, hy + 12, 1, 2, hairDark);
        px(hx + 11, hy + 8, 1, 1, accent);
      }
      // eyes
      const ex1 = p.facing === 'left' ? hx + 2 : p.facing === 'right' ? hx + 6 : hx + 3;
      const drawEye = (ex) => {
        px(ex, hy + 6, 2, 3, '#3a3448');
        px(ex, hy + 7, 1, 1, eye);
        px(ex + 1, hy + 6, 1, 1, '#ffffff');
        px(ex - 1, hy + 5, 3, 0.8, '#4a3d50');
      };
      if (p.facing === 'down') {
        drawEye(hx + 2); drawEye(hx + 6);
        px(hx + 4, hy + 6, 1, 1, skinDark);
        px(hx + 4, hy + 9, 2, 0.8, '#c98088');
        px(hx + 1, hy + 8, 1, 1, 'rgba(232,150,160,0.45)');
        px(hx + 8, hy + 8, 1, 1, 'rgba(232,150,160,0.45)');
      } else {
        drawEye(ex1);
        const nx = p.facing === 'left' ? hx + 1 : hx + 9;
        px(nx, hy + 8, 1, 1, skinDark);
      }
      // accessories — shapes and colours come from the reference sheets
      const accC = c.accColor || '#f2c9dc';
      const accC2 = c.accColor2 || '#f0d98a';
      const drawAcc = (acc) => {
        if (acc === 'flower') {
          if (c.accRibbon) {
            px(hx + 1, hy + 4, 1, 4, c.ribbon || '#c7bdd8');
            px(hx + 2, hy + 5, 1, 3, c.ribbon || '#c7bdd8');
          }
          circle(hx + 1.5, hy + 1.5, 2.2, accC);
          circle(hx + 1.5, hy + 1.5, 1, accC2);
          px(hx + 3, hy + 2, 1, 1, '#c9dfae');
        } else if (acc === 'headband') {
          px(hx, hy, 12, 1, accC);
          px(hx + 1, hy - 1, 1, 1, accC2);
          px(hx + 5, hy - 1, 1, 1, accC2);
          px(hx + 9, hy - 1, 1, 1, accC2);
        } else if (acc === 'ribbon') {
          px(hx + 8, hy - 1, 3, 2, c.ribbon || '#e8a9c0');
          px(hx + 7, hy, 1, 2, c.ribbon || '#e8a9c0');
          px(hx + 11, hy, 1, 2, c.ribbon || '#e8a9c0');
        } else if (acc === 'hat') {
          px(hx - 2, hy - 2, 16, 3, accC);
          px(hx + 1, hy - 5, 10, 4, shade(accC, 0.1));
          px(hx + 1, hy - 3, 10, 1, c.ribbon || '#a8766a');
        } else if (acc === 'halo') {
          ellipse(hx + 6, hy - 3, 6, 1.6, 'rgba(255,240,190,0.85)');
        } else if (acc === 'scarf') {
          px(hx + 1, hy + 10, 10, 2, c.ribbon || '#a8916a');
          px(hx + 8, hy + 12, 2, 4, c.ribbon || '#a8916a');
        } else if (acc === 'glasses') {
          px(hx + 1, hy + 6, 4, 1, accC); px(hx + 7, hy + 6, 4, 1, accC);
          px(hx + 5, hy + 6, 2, 1, accC);
          px(hx + 2, hy + 7, 2, 2, 'rgba(220,235,240,0.35)'); px(hx + 8, hy + 7, 2, 2, 'rgba(220,235,240,0.35)');
        } else if (acc === 'cap') {
          px(hx - 1, hy - 2, 14, 3, accC); px(hx + 7, hy, 8, 2, shade(accC, -0.15));
        } else if (acc === 'leaf') {
          px(hx + 2, hy + 1, 3, 2, '#7dad6e'); px(hx + 3, hy, 1, 1, '#8fbf7a');
        } else if (acc === 'apron') {
          px(hx + 4, hy + 10, 7, 3, accent); px(hx + 4, hy + 9, 1, 2, accent); px(hx + 10, hy + 9, 1, 2, accent);
        } else if (acc === 'clip') {
          px(hx + 8, hy + 2, 4, 1, accC); px(hx + 9, hy + 2, 1, 1, accC2);
        } else if (acc === 'suspenders') {
          px(hx + 3, hy + 11, 1, 4, accC); px(hx + 8, hy + 11, 1, 4, accC);
          px(hx + 3, hy + 13, 1, 1, accC2); px(hx + 8, hy + 13, 1, 1, accC2);
        }
      };
      [p.accessory].concat(p.extras || []).forEach(drawAcc);
    } else {
      px(hx, hy + 1, 12, 11, hair);
      px(hx + 1, hy + 1, 10, 4, hair);
      px(hx + 2, hy + 3, 8, 1, hairLight);
      px(hx + 2, hy + 9, 8, 3, hairDark);
      if (p.accessory === 'hat' || p.accessory === 'cap') px(hx - 1, hy - 2, 14, 4, c.accColor || accent);
      if (p.accessory === 'headband') px(hx, hy + 1, 12, 2, c.accColor || '#f2c9dc');
      if (p.accessory === 'halo') ellipse(hx + 6, hy - 3, 6, 1.6, 'rgba(255,240,190,0.85)');
      if (p.accessory === 'ribbon') px(hx + 5, hy + 1, 4, 2, c.ribbon || '#e8a9c0');
    }
    // hair sway on walk
    if (p.moving && (p.hair === 'long' || p.hair === 'wavy')) {
      px(hx + (swing > 0 ? -2 : 13), hy + 9, 1, 4, hair);
    }
    ctx.restore();
  };

  R.drawNPC = function (n, sx, sy, t) {
    if (!n) return;
    const sitting = n.pose === 'sit';
    const bob = sitting ? 0 : n.moving ? Math.sin(t * 6 + n.x) * 1 : Math.sin(t * 1.5 + (n.x || 0)) * 0.4;
    R.drawPlayer({
      colors: Object.assign({ skinDark: '#e0bfa8' }, n.colors),
      hair: n.hair, accessory: n.accessory, extras: n.extras, facing: n.facing || 'down',
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
  R.drawAmbient = function (area, cam, t, weather) {
    if (!area || area.region === 'indoor' || area.weatherFx === false) return;
    const S = SAN.state && SAN.state.S;
    const mins = S ? S.time.minutes : 12 * 60;
    const night = mins >= 20 * 60 || mins < 5 * 60;
    const golden = mins >= 16 * 60 + 30 && mins < 19 * 60;
    // drifting petals / pollen
    const count = area.id === 'forest' || area.id === 'meadow' ? 26 : 14;
    for (let i = 0; i < count; i++) {
      const seed = i * 37.7;
      const speed = 7 + (i % 5) * 2.4;
      const x = ((seed * 13 + t * speed) % (W + 40)) - 20;
      const y = ((seed * 7 + Math.sin(t * 0.6 + i) * 12 + t * 4.5) % (H + 20)) - 10;
      const a = 0.22 + Math.sin(t * 1.4 + i) * 0.14;
      if (night) {
        if (i % 3 === 0) circle(x, y, 0.9, `rgba(240,248,180,${Math.max(0, a + 0.2)})`);
      } else {
        px(x, y, 1.3, 1.3, area.id === 'forest' ? `rgba(214,196,238,${a})` : `rgba(250,232,210,${a})`);
      }
    }
    // fireflies at night
    if (night) {
      for (let i = 0; i < 16; i++) {
        const fx = ((i * 53 + t * 9 + Math.sin(t * 0.7 + i) * 22) % (W + 30)) - 15;
        const fy = ((i * 31 + Math.cos(t * 0.8 + i * 2) * 16 + t * 5) % (H + 30)) - 15;
        const gl = 0.35 + Math.sin(t * 2 + i * 1.7) * 0.3;
        circle(fx, fy, 1.5, `rgba(236,246,160,${Math.max(0, gl)})`);
        circle(fx, fy, 4.5, `rgba(236,246,160,${Math.max(0, gl) * 0.12})`);
      }
    }
    // slow cloud shadows
    if (area.id !== 'library' && area.id !== 'teashop' && area.id !== 'store' && area.id !== 'bakery') {
      ctx.globalAlpha = golden ? 0.05 : 0.035;
      ctx.fillStyle = '#2f3a44';
      for (let i = 0; i < 2; i++) {
        const cx = ((t * (8 + i * 4) + i * 320) % (W + 260)) - 130;
        ctx.beginPath();
        ctx.ellipse(cx, H * (0.2 + i * 0.42), 90, 26, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // passing birds by day
    if (!night && Math.sin(t * 0.11) > 0.55) {
      const bx = ((t * 26) % (W + 120)) - 60;
      const by = 34 + Math.sin(t * 0.5) * 8;
      ctx.strokeStyle = 'rgba(70,66,78,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx - 6, by); ctx.quadraticCurveTo(bx - 3, by - 3, bx, by);
      ctx.quadraticCurveTo(bx + 3, by - 3, bx + 6, by);
      ctx.stroke();
    }
  };

  R.drawWorld = function (scene) {
    if (!ctx) return;
    const { area, cam, player, npcs, cat, timeSec, weather } = scene;
    const backdrop = ctx.createLinearGradient(0, 0, 0, H);
    backdrop.addColorStop(0, '#241d2f');
    backdrop.addColorStop(1, '#171320');
    ctx.fillStyle = backdrop;
    ctx.fillRect(0, 0, W, H);
    curArea = area;
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

    // soft grass fringe where lawn meets paths and water
    for (let ty = startY; ty < startY + rows; ty++) {
      for (let tx = startX; tx < startX + cols; tx++) {
        if (tx < 0 || ty < 0 || tx >= area.w || ty >= area.h) continue;
        const ch = area.grid[ty][tx];
        if (ch !== '.' && ch !== ',') continue;
        const sx = Math.round(tx * T - cam.x), sy = Math.round(ty * T - cam.y);
        const at = (dx, dy) => (area.grid[ty + dy] || [])[tx + dx] || '';
        const edge = '~=#s';
        if (edge.indexOf(at(0, -1)) >= 0) {
          for (let i = 0; i < 4; i++) px(sx + 1 + i * 4, sy, 1, 2 + (i % 2), 'rgba(86,128,74,0.55)');
        }
        if (edge.indexOf(at(0, 1)) >= 0) {
          for (let i = 0; i < 4; i++) px(sx + 2 + i * 4, sy + 13 - (i % 2), 1, 2, 'rgba(118,160,96,0.5)');
        }
        if (edge.indexOf(at(-1, 0)) >= 0) {
          for (let i = 0; i < 3; i++) px(sx, sy + 3 + i * 4, 2, 1, 'rgba(86,128,74,0.5)');
        }
        if (edge.indexOf(at(1, 0)) >= 0) {
          for (let i = 0; i < 3; i++) px(sx + 13, sy + 4 + i * 4, 2, 1, 'rgba(86,128,74,0.5)');
        }
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

    R.drawAmbient(area, cam, timeSec, weather);

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
    if (h >= 5 && h < 7.5) { tint = '#ffc79a'; alpha = 0.2 * (1 - (h - 5) / 2.5); }
    else if (h >= 7.5 && h < 16) { tint = null; alpha = 0; }
    else if (h >= 16 && h < 18.5) { tint = '#ffb072'; alpha = 0.16 + 0.12 * ((h - 16) / 2.5); }
    else if (h >= 18.5 && h < 20) { tint = '#a07ab8'; alpha = 0.3 * ((h - 18.5) / 1.5); }
    else if (h >= 20 || h < 5) { tint = '#33406e'; alpha = area && area.safe ? 0.2 : 0.46; }
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
      const grd = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, Math.max(150, W * 0.6));
      grd.addColorStop(0, area && area.safe ? 'rgba(255,210,140,0.16)' : 'rgba(190,205,255,0.10)');
      grd.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
    // gentle vignette frames the scene without hiding gameplay
    if (area && !area.safe) {
      const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.78);
      vg.addColorStop(0, 'rgba(24,18,30,0)');
      vg.addColorStop(1, 'rgba(24,18,30,0.22)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
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
    // ornament colours are read from the character's reference sheet, never hardcoded
    const accC = col.accColor || SAN.util.mix(dress, '#ffffff', 0.55);
    const accC2 = col.accColor2 || '#f0d98a';
    const accDark = SAN.util.shade(accC, -0.28);
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

    /* ---- expressions: the same face, different feelings ---- */
    /* ornament shapes, coloured from each character's reference palette */
    const petal = (x, y, r) => `<g transform="translate(${x},${y})">${[0, 1, 2, 3, 4].map((i) => `<ellipse cx="${Math.cos(i * 1.256) * r}" cy="${Math.sin(i * 1.256) * r}" rx="${r * 0.86}" ry="${r * 0.68}" fill="${accC}" transform="rotate(${i * 72})"/>`).join('')}<circle r="${r * 0.44}" fill="${accC2}"/></g>`;
    Object.assign(accSvg, {
      flower: `<g>${col.accRibbon ? `<path d="M35 33 L25 25 L27 39 Z" fill="${ribbon}"/><path d="M35 33 L25 41 L27 27 Z" fill="${ribbon}"/>` : ''}${petal(36, 30, 6.2)}</g>`,
      headband: `<g><path d="M29 33 C40 19 81 19 91 33" stroke="${accC}" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.95"/>${petal(33, 29, 4.4)}${petal(60, 19, 5)}${petal(87, 30, 4.2)}</g>`,
      hat: `<g><ellipse cx="60" cy="27" rx="41" ry="9" fill="${accC}"/><path d="M33 27 C33 3 87 3 87 27Z" fill="${SAN.util.shade(accC, 0.1)}"/><path d="M33 25 C41 19 79 19 87 25" stroke="${ribbon}" stroke-width="4.5" fill="none"/></g>`,
      glasses: `<g fill="none" stroke="${accDark}" stroke-width="1.6"><circle cx="47" cy="66" r="9"/><circle cx="75" cy="66" r="9"/><path d="M56 66 L66 66"/></g>`,
      apron: `<g><path d="M42 108 L78 108 L82 140 L38 140Z" fill="${accent}"/><path d="M42 108 L78 108" stroke="${SAN.util.shade(accent, -0.14)}" stroke-width="2"/></g>`,
      suspenders: `<g><path d="M45 108 L49 150" stroke="${accC}" stroke-width="4.5" fill="none"/><path d="M75 108 L71 150" stroke="${accC}" stroke-width="4.5" fill="none"/><circle cx="46" cy="120" r="2.4" fill="${accC2}"/><circle cx="74" cy="120" r="2.4" fill="${accC2}"/></g>`,
      scarf: `<path d="M30 108 C40 118 80 118 90 108 L92 120 C78 130 42 130 28 120Z" fill="${ribbon}"/>`,
      clip: `<g transform="translate(82,40)"><rect x="0" y="0" width="16" height="5" rx="2" fill="${accC}"/><circle cx="3" cy="2.5" r="2" fill="${accC2}"/></g>`,
    });

    const mood = o.mood || 'neutral';
    const lash = '#3b3148';
    const eye = (cx, rx, ry, ox, oy) => `
      <ellipse cx="${cx}" cy="67" rx="${rx}" ry="${ry}" fill="#fdfaf6"/>
      <ellipse cx="${cx}" cy="67" rx="${rx - 2}" ry="${ry - 1.4}" fill="url(#${uid}eye)"/>
      <ellipse cx="${cx + ox}" cy="67.5" rx="3.2" ry="4.2" fill="#2a2338"/>
      <circle cx="${cx + ox - 2.2}" cy="63" r="2.2" fill="#ffffff" opacity="0.95"/>
      <circle cx="${cx + ox + 2}" cy="70" r="1.1" fill="#ffffff" opacity="0.6"/>
      <path d="M${cx - rx} 61 C${cx - rx * 0.4} 56 ${cx + rx * 0.4} 56 ${cx + rx} 61" stroke="${lash}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    const happyEye = (cx) => `
      <path d="M${cx - 10} 69 Q${cx} 57 ${cx + 10} 69" stroke="${lash}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M${cx - 8} 73 Q${cx} 66 ${cx + 8} 73" stroke="${lash}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity="0.55"/>`;
    const tears = mood === 'sad' ? `<g fill="#a9d6e2" opacity="0.85"><ellipse cx="35" cy="78" rx="1.7" ry="3.4"/><ellipse cx="85" cy="81" rx="1.4" ry="2.8"/></g>` : '';
    const sweat = mood === 'embarrassed' ? `<path d="M92 52 C96 58 96 62 92 64 C88 62 88 58 92 52Z" fill="#bcdce8" opacity="0.9"/>` : '';
    let faceParts = '';
    if (mood === 'happy') {
      faceParts = `<g class="pt-eyes-happy">${happyEye(45)}${happyEye(75)}</g>
        <path d="M34 58 Q44 53 54 57" stroke="#6b5a66" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <path d="M66 57 Q76 53 86 58" stroke="#6b5a66" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <ellipse cx="36" cy="83" rx="8" ry="4" fill="#e88f9c" opacity="0.5"/>
        <ellipse cx="84" cy="83" rx="8" ry="4" fill="#e88f9c" opacity="0.5"/>
        <path d="M49 85 Q60 98 71 85 Z" fill="#b5707a"/>
        <path d="M53 90 Q60 95 67 90" stroke="#f0b8be" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    } else if (mood === 'sad') {
      faceParts = `<g class="pt-eyes">${eye(45, 9.5, 10, 0, 0.6)}${eye(75, 9.5, 10, 0, 0.6)}</g>
        <path d="M34 55 Q44 49 55 54" stroke="#6b5a66" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path d="M65 54 Q76 49 86 55" stroke="#6b5a66" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <ellipse cx="36" cy="84" rx="7" ry="3.4" fill="#e88f9c" opacity="0.3"/>
        <ellipse cx="84" cy="84" rx="7" ry="3.4" fill="#e88f9c" opacity="0.3"/>
        ${tears}
        <path d="M53 90 Q60 84 67 90" stroke="#b5707a" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    } else if (mood === 'surprised') {
      faceParts = `<g class="pt-eyes">${eye(45, 10.6, 12, 0, -0.5)}${eye(75, 10.6, 12, 0, -0.5)}</g>
        <path d="M33 52 Q44 46 55 52" stroke="#6b5a66" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path d="M65 52 Q76 46 87 52" stroke="#6b5a66" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <ellipse cx="36" cy="84" rx="7" ry="3.6" fill="#e88f9c" opacity="0.38"/>
        <ellipse cx="84" cy="84" rx="7" ry="3.6" fill="#e88f9c" opacity="0.38"/>
        <ellipse cx="60" cy="89" rx="3.6" ry="4.4" fill="#b5707a"/>`;
    } else if (mood === 'embarrassed') {
      faceParts = `<g class="pt-eyes">${eye(45, 9.5, 9, -1.4, 0.6)}${eye(75, 9.5, 9, -1.4, 0.6)}</g>
        <path d="M35 58 Q45 55 55 59" stroke="#6b5a66" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M65 59 Q75 55 85 58" stroke="#6b5a66" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <ellipse cx="35" cy="83" rx="10" ry="5" fill="#e88f9c" opacity="0.66"/>
        <ellipse cx="85" cy="83" rx="10" ry="5" fill="#e88f9c" opacity="0.66"/>
        <path d="M47 84 L53 84" stroke="#e88f9c" stroke-width="1" opacity="0.55"/>
        <path d="M67 84 L73 84" stroke="#e88f9c" stroke-width="1" opacity="0.55"/>
        ${sweat}
        <path d="M54 89 Q57 86 60 89 Q63 92 66 89" stroke="#b5707a" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
    } else if (mood === 'angry') {
      faceParts = `<g class="pt-eyes">${eye(45, 9, 8, 0.5, 0.4)}${eye(75, 9, 8, 0.5, 0.4)}</g>
        <path d="M33 56 L55 63" stroke="#5a4450" stroke-width="2" stroke-linecap="round"/>
        <path d="M87 56 L65 63" stroke="#5a4450" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="36" cy="84" rx="8" ry="3.6" fill="#e88f9c" opacity="0.5"/>
        <ellipse cx="84" cy="84" rx="8" ry="3.6" fill="#e88f9c" opacity="0.5"/>
        <path d="M52 90 L68 88" stroke="#b5707a" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    } else if (mood === 'thoughtful') {
      faceParts = `<g class="pt-eyes">${eye(45, 9.5, 10, -2.2, -1.8)}${eye(75, 9.5, 10, -2.2, -1.8)}</g>
        <path d="M34 55 Q44 51 55 55" stroke="#6b5a66" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M65 51 Q76 48 86 53" stroke="#6b5a66" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <ellipse cx="36" cy="84" rx="7" ry="3.2" fill="#e88f9c" opacity="0.3"/>
        <ellipse cx="84" cy="84" rx="7" ry="3.2" fill="#e88f9c" opacity="0.3"/>
        <path d="M55 89 Q60 87 65 89" stroke="#b5707a" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
    } else {
      faceParts = `<g class="pt-eyes">${eye(45, 9.5, 10, 0, 0)}${eye(75, 9.5, 10, 0, 0)}</g>
        <path d="M35 58 C39 54 51 54 55 58" stroke="#3a3040" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <path d="M65 58 C69 54 81 54 85 58" stroke="#3a3040" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <path d="M33 64 C35 60 39 59 41 60" stroke="#3a3040" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.8"/>
        <path d="M87 64 C85 60 81 59 79 60" stroke="#3a3040" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.8"/>
        <ellipse cx="36" cy="82" rx="7" ry="3.4" fill="#e8a0a0" opacity="0.35"/>
        <ellipse cx="84" cy="82" rx="7" ry="3.4" fill="#e8a0a0" opacity="0.35"/>
        <path d="M55 86 C58 88.6 62 88.6 65 86" stroke="#b5707a" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    }
    const hairShine = `<path d="M30 36 C46 22 76 22 90 40" stroke="rgba(255,255,255,0.38)" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;

    return `<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" class="portrait-svg mood-${mood}">
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
  <path d="M23 52 C23 26 40 12 60 12 C80 12 97 26 97 52 C93 41 87 34 79 31 C71 41 57 44 49 38 C42 33 38 29 35 27 C29 33 25 42 23 52Z" fill="${hairC}"/>
  ${faceParts}
  <path d="M57 76 C58 78 60 79 61 77" stroke="${SAN.util.shade(skin, -0.28)}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.6"/>
  ${bangs[hair] || bangs.long}
  ${hairShine}
  ${[acc].concat(p.extras || []).map((a) => accSvg[a] || '').join('')}
  ${glow ? `<circle cx="60" cy="60" r="52" fill="#ffffff" opacity="0.06"/>` : ''}
  ${sparkles}
      ${o.moodRing ? `<circle cx="60" cy="60" r="56" fill="none" stroke="${o.moodRing}" stroke-width="2" opacity="0.5"/>` : ''}
</svg>`;
  };

  /* =========================================================
     PORTRAITS (illustrated assets)
     The game ships hand-illustrated anime portraits from
     assets/portraits/<id>/<mood>.png — a full body plus nine expressions per
     character, listed in each NPC's own `art` registry (js/data/npcs.js).
     A mood the character does not ship resolves to its neutral face rather
     than an invented one. The SVG above is only the fallback when an
     illustration is missing.
     ========================================================= */
  R.PLAYER_MOODS = ['neutral', 'happy', 'sad', 'surprised', 'embarrassed', 'thinking', 'angry', 'thanking'];
  // the expression sheets uploaded for the nine NPCs
  R.NPC_MOODS = ['neutral', 'happy', 'sad', 'smile', 'serious', 'thinking', 'concerned', 'gentle', 'surprised'];
  // a mood is valid when either the player or an NPC ships it
  R.MOODS = R.PLAYER_MOODS.concat(R.NPC_MOODS.filter((m) => R.PLAYER_MOODS.indexOf(m) < 0));
  // dialogue returns 'thoughtful'; the sheets label that expression 'thinking'
  const ART_ALIAS = {
    thoughtful: 'thinking',
    // the uploads spell this "suprise"
    suprise: 'surprised',
    surprize: 'surprised',
    surprised_face: 'surprised',
    smiling: 'smile',
    content: 'smile',
    calm: 'gentle',
    tender: 'gentle',
    stern: 'serious',
    thankful: 'thanking',
    grateful: 'thanking',
    relieved: 'thanking',
    shy: 'embarrassed',
    flustered: 'embarrassed',
    annoyed: 'angry',
    irritated: 'angry',
    mad: 'angry',
    crying: 'sad',
    worried: 'sad',
    excited: 'happy',
    delighted: 'happy',
  };

  // dialogue data can name the expression it needs; anything unknown falls back
  R.resolveMood = function (mood) {
    const m = ART_ALIAS[mood] || mood || 'neutral';
    return R.MOODS.indexOf(m) >= 0 ? m : 'neutral';
  };

  // scene context → expression, so writers can tag a line instead of a face
  R.CONTEXT_MOODS = {
    greeting: 'happy',
    compliment: 'embarrassed',
    gift: 'surprised',
    giftReceived: 'surprised',
    badNews: 'sad',
    grief: 'sad',
    conflict: 'angry',
    scolding: 'angry',
    advice: 'thinking',
    memory: 'thinking',
    festival: 'happy',
    quest: 'neutral',
    responsibility: 'neutral',
    farewell: 'sad',
  };
  R.moodForContext = function (kind) {
    return R.resolveMood(R.CONTEXT_MOODS[kind] || 'neutral');
  };

  // an NPC ships only the expressions declared in its registry; the rest fall back
  R.portraitArtFor = function (who) {
    if (who === 'player') return R.PLAYER_MOODS.slice();
    const npc = SAN.data && SAN.data.npcs ? SAN.data.npcs[who] : null;
    if (npc && npc.art && npc.art.expressions) return Object.keys(npc.art.expressions);
    return npc && npc.expressions ? npc.expressions.slice() : ['neutral'];
  };

  /* The repository keeps the uploaded PNGs as the source of truth. The
     published build re-encodes that same artwork to WebP (the host allows
     far less than the 27 MB of PNGs), and index.html declares which one to
     request: "png" locally, "webp" in deploy/public. */
  R.assetExt = function () {
    const ext = typeof window !== 'undefined' ? window.SAN_ASSET_PORTRAIT_EXT : '';
    return ext === 'webp' ? 'webp' : 'png';
  };
  R.withAssetExt = function (path) {
    if (!path) return path;
    const ext = R.assetExt();
    if (ext === 'png') return path;
    return String(path).replace(/\.png$/i, '.' + ext);
  };

  // the illustrated full body registered for an NPC
  R.npcFullBodySrc = function (who) {
    const npc = SAN.data && SAN.data.npcs ? SAN.data.npcs[who] : null;
    const bundled = typeof window !== 'undefined' ? window.SAN_ASSET_PORTRAITS : null;
    if (bundled && bundled[who + '/fullbody']) return bundled[who + '/fullbody'];
    if (npc && npc.fullBody) return R.withAssetExt(npc.fullBody);
    if (!npc) return '';
    return R.withAssetExt('assets/portraits/' + who + '/fullbody.png');
  };

  R.npcFullBodyImg = function (who, opts) {
    const src = R.npcFullBodySrc(who);
    if (!src) return '';
    const o = opts || {};
    const cls = 'portrait-img fullbody-img' + (o.className ? ' ' + o.className : '');
    return `<img class="${cls}" src="${src}" alt="" draggable="false"` +
      ` data-who="${who}" data-kind="fullbody">`;
  };

  // the official Main Character artwork: one config, used by every screen
  R.mainCharacter = function () {
    return (SAN.data && SAN.data.mainCharacter) || null;
  };

  R.mainAssetSrc = function (kind, mood) {
    const mc = R.mainCharacter();
    if (!mc) return '';
    const bundled = typeof window !== 'undefined' ? window.SAN_ASSET_MAIN : null;
    if (kind === 'fullbody') return (bundled && bundled.fullbody) || mc.fullBody;
    const key = mc.expressions[R.resolveMood(mood)] ? R.resolveMood(mood) : 'neutral';
    if (bundled && bundled.expressions && bundled.expressions[key]) return bundled.expressions[key];
    return mc.expressions[key] || '';
  };

  R.fullBodyImg = function (opts) {
    const o = opts || {};
    return `<img class="portrait-img fullbody-img${o.className ? ' ' + o.className : ''}"` +
      ` src="${R.mainAssetSrc('fullbody')}" alt="" draggable="false"` +
      ` data-who="player" data-kind="fullbody">`;
  };

  R.portraitSrc = function (who, mood) {
    const id = who === 'player' ? 'player' : who;
    if (id === 'player') {
      const face = R.mainAssetSrc('face', mood);
      if (face) return face;
    }
    const list = R.portraitArtFor(id);
    let m = ART_ALIAS[mood] || mood || 'neutral';
    // anything this character does not ship shows its neutral face
    if (list.indexOf(m) < 0) m = 'neutral';
    const npc = SAN.data && SAN.data.npcs ? SAN.data.npcs[id] : null;
    // the single-file build may bundle illustrations as data URIs
    const bundled = typeof window !== 'undefined' ? window.SAN_ASSET_PORTRAITS : null;
    if (bundled && bundled[id + '/' + m]) return bundled[id + '/' + m];
    if (npc && npc.art && npc.art.expressions && npc.art.expressions[m]) {
      return R.withAssetExt(npc.art.expressions[m]);
    }
    return R.withAssetExt('assets/portraits/' + id + '/' + m + '.png');
  };

  R.portraitImg = function (who, opts) {
    const o = opts || {};
    const id = who === 'player' ? 'player' : who;
    if (id !== 'player' && !SAN.data.npcs[id]) return '';
    if (id === 'player' && o.fullBody) return R.fullBodyImg(o);
    const mood = ART_ALIAS[o.mood] || o.mood || 'neutral';
    const cls = 'portrait-img' + (o.className ? ' ' + o.className : '');
    return `<img class="${cls}" src="${R.portraitSrc(id, mood)}" alt="" draggable="false"` +
      ` data-who="${id}" data-mood="${mood}">`;
  };

  // if an illustration is ever missing, drop back to the SVG portrait
  R.swapToSvgPortrait = function (img) {
    const who = img.getAttribute('data-who') || 'player';
    const mood = img.getAttribute('data-mood') || 'neutral';
    const box = document.createElement('div');
    box.className = 'portrait-fallback';
    box.innerHTML = R.portrait(who, { mood });
    img.replaceWith(box);
  };

  if (typeof document !== 'undefined' && !R._portraitFallbackBound) {
    R._portraitFallbackBound = true;
    document.addEventListener('error', (e) => {
      const t = e.target;
      if (t && t.tagName === 'IMG' && t.classList && t.classList.contains('portrait-img')) {
        R.swapToSvgPortrait(t);
      }
    }, true);
  }

  /* text → expression: lets dialogue portraits react to what is being said */
  R.moodFor = function (text) {
    const t = String(text || '').toLowerCase();
    if (/laugh|grin|smil|beaming|giggl|delight|joy/.test(t)) return 'happy';
    if (/tear|weep|cry|sob|sorry|grief|sad|ache|miss (you|him|her)|alone/.test(t)) return 'sad';
    if (/startl|surpris|shock|gasp|wide-eyed|did not expect|really\?|!$/.test(t)) return 'surprised';
    if (/blush|embarrass|fluster|redden|shy|awkward|sputter/.test(t)) return 'embarrassed';
    if (/angry|furious|snap|glare|frown|irritat|huff/.test(t)) return 'angry';
    if (/think|wonder|perhaps|maybe|consider|remember|suppose/.test(t)) return 'thoughtful';
    return 'neutral';
  };
})();
