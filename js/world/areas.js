/* Sanctuary — world areas. Hand-laid tile grids + props + transitions. */
(function () {
  const W = SAN.world || (SAN.world = {});
  const A = (W.areas = {});

  /* tile chars:
     . grass  , flowery grass  # dirt path  = stone  ~ water  s sand  w wood  g glass
     m forest floor  c soil  x wall  o stone floor  r rug  _ void  F flowerbed */
  const SOLID_CHARS = '~x_';

  function mk(cfg) {
    const grid = [];
    for (let y = 0; y < cfg.h; y++) {
      const row = new Array(cfg.w).fill(cfg.fill || '.');
      grid.push(row);
    }
    return {
      id: cfg.id, name: cfg.name, w: cfg.w, h: cfg.h, grid,
      props: [], exits: [], plots: [], spawn: cfg.spawn || { x: 2, y: 2 },
      region: cfg.region || 'outdoor', music: cfg.music || 'village',
      ambient: cfg.ambient || 'birds', weatherFx: cfg.weatherFx !== false,
      safe: !!cfg.safe, decorZone: cfg.decorZone || null,
      light: cfg.light || 1,
    };
  }

  function fillRect(a, x, y, w, h, ch) {
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) {
        if (yy < 0 || yy >= a.h || xx < 0 || xx >= a.w) continue;
        a.grid[yy][xx] = ch;
      }
    }
  }
  function setTile(a, x, y, ch) {
    if (x < 0 || x >= a.w || y < 0 || y >= a.h) return;
    a.grid[y][x] = ch;
  }
  function add(a, t, x, y, opts) {
    const p = Object.assign({ t, x, y, w: 1, h: 1, solid: false }, opts || {});
    if (p.w == null) p.w = 1;
    if (p.h == null) p.h = 1;
    a.props.push(p);
    return p;
  }
  function door(a, x, y, to, tx, ty, label, opts) {
    add(a, 'door', x, y, Object.assign({ solid: false, clear: true, auto: true, interact: { type: 'area', to, tx, ty } }, opts || {}));
    a.grid[y][x] = a.region === 'indoor' ? 'w' : '=';
  }
  function occupied(a, x, y) {
    return a.props.some((p) => x >= p.x && x < p.x + (p.w || 1) && y >= p.y && y < p.y + (p.h || 1));
  }
  function scatter(a, type, count, seed, opts) {
    const rng = SAN.util.rng(seed);
    let placed = 0, tries = 0;
    const o = opts || {};
    while (placed < count && tries < count * 40) {
      tries++;
      const x = 1 + Math.floor(rng() * (a.w - 2));
      const y = 1 + Math.floor(rng() * (a.h - 2));
      if (occupied(a, x, y)) continue;
      if (a.grid[y][x] !== (o.on || '.')) continue;
      if (o.avoid && o.avoid(x, y)) continue;
      if (o.noEdge && (x < 3 || y < 3 || x > a.w - 4 || y > a.h - 4)) continue;
      add(a, type, x, y, o.props ? (typeof o.props === 'function' ? o.props(x, y) : o.props) : undefined);
      placed++;
    }
    return placed;
  }
  function flowers(a, count, seed, chars) {
    const rng = SAN.util.rng(seed);
    for (let i = 0; i < count; i++) {
      const x = 1 + Math.floor(rng() * (a.w - 2));
      const y = 1 + Math.floor(rng() * (a.h - 2));
      if (a.grid[y][x] === '.') a.grid[y][x] = (chars && chars[Math.floor(rng() * chars.length)]) || ',';
    }
  }
  function doorLabel(a, x, y, text) { add(a, 'plaque', x, y, { text, solid: false }); }

  /* =====================================================================
     VILLAGE
     ===================================================================== */
  function buildVillage() {
    const a = mk({ id: 'village', name: 'Sanctuary Village', w: 64, h: 46, fill: '.', music: 'village', ambient: 'birds' });
    a.spawn = { x: 14, y: 16 };

    // roads
    fillRect(a, 2, 22, 60, 4, '#');
    fillRect(a, 30, 3, 4, 41, '#');
    // plaza
    fillRect(a, 25, 16, 14, 12, '=');
    fillRect(a, 30, 14, 4, 10, '#');

    // connecting paths
    fillRect(a, 13, 15, 3, 8, '#');
    fillRect(a, 22, 12, 3, 11, '#');
    fillRect(a, 38, 12, 3, 11, '#');
    fillRect(a, 48, 18, 3, 5, '#');
    fillRect(a, 22, 26, 3, 3, '#');
    fillRect(a, 40, 26, 3, 3, '#');

    // border trees with lanes left open
    for (let x = 0; x < a.w; x++) {
      if (x >= 29 && x <= 34) continue;
      add(a, 'tree', x, 0, { solid: true, w: 1, h: 1, variant: (x % 3) });
      add(a, 'tree', x, 1, { solid: true, w: 1, h: 1, variant: (x % 2) });
      add(a, 'tree', x, 44, { solid: true, w: 1, h: 1, variant: (x % 3) });
      add(a, 'tree', x, 45, { solid: true, w: 1, h: 1, variant: (x % 2) });
    }
    for (let y = 2; y < 44; y++) {
      if (y >= 21 && y <= 26) continue;
      add(a, 'tree', 0, y, { solid: true, variant: (y % 3) });
      add(a, 'tree', 1, y, { solid: true, variant: (y % 2) });
      add(a, 'tree', 62, y, { solid: true, variant: (y % 3) });
      add(a, 'tree', 63, y, { solid: true, variant: (y % 2) });
    }

    // buildings
    const home = add(a, 'building', 11, 10, { w: 7, h: 5, style: 'home', solid: true, doorRel: { x: 3, y: 4 } });
    door(a, 14, 14, 'home', 10, 11, 'Your Cottage');
    doorLabel(a, 13, 15, 'Home');

    add(a, 'building', 20, 6, { w: 8, h: 6, style: 'store', solid: true, doorRel: { x: 3, y: 5 }, sign: 'GENERAL' });
    door(a, 23, 11, 'store', 10, 10, 'General Store');
    add(a, 'building', 36, 6, { w: 8, h: 6, style: 'bakery', solid: true, doorRel: { x: 3, y: 5 }, sign: 'BAKERY' });
    door(a, 39, 11, 'bakery', 10, 10, 'Mira\'s Bakery');
    add(a, 'building', 46, 12, { w: 8, h: 6, style: 'library', solid: true, doorRel: { x: 3, y: 5 }, sign: 'LIBRARY' });
    door(a, 49, 17, 'library', 10, 10, 'Village Library');
    add(a, 'building', 20, 28, { w: 8, h: 6, style: 'flower', solid: true, doorRel: { x: 3, y: 5 }, sign: 'FLOWERS' });
    door(a, 23, 33, 'flower', 10, 10, 'Flower Shop');
    add(a, 'building', 38, 28, { w: 8, h: 6, style: 'teashop', solid: true, doorRel: { x: 3, y: 5 }, sign: 'TEA' });
    door(a, 41, 33, 'teashop', 10, 10, 'The Steeping Room');

    // decorative cottages
    add(a, 'building', 4, 8, { w: 5, h: 4, style: 'cottage', solid: true, doorRel: { x: 2, y: 3 } });
    add(a, 'building', 5, 30, { w: 5, h: 4, style: 'cottage', solid: true, doorRel: { x: 2, y: 3 } });
    add(a, 'building', 55, 30, { w: 5, h: 4, style: 'cottage', solid: true, doorRel: { x: 2, y: 3 } });

    // fountain plaza
    add(a, 'fountain', 27, 18, { w: 3, h: 3, solid: true, interact: { type: 'fountain' } });
    add(a, 'bench', 26, 24, { solid: true, interact: { type: 'sit', line: 'You sit on the fountain bench. Water, voices, the smell of bread.' } });
    add(a, 'bench', 35, 17, { solid: true, interact: { type: 'sit', line: 'Someone has carved a small heart into the armrest. You add nothing. You smile.' } });
    add(a, 'lamp', 25, 21, { solid: false });
    add(a, 'lamp', 38, 25, { solid: false });
    add(a, 'lamp', 29, 15, { solid: false });
    add(a, 'board', 36, 27, { solid: true, w: 2, interact: { type: 'board' } });
    add(a, 'well', 6, 20, { w: 2, h: 2, solid: true, interact: { type: 'well' } });
    add(a, 'stall', 33, 25, { w: 2, h: 2, solid: true, interact: { type: 'shop', shop: 'theo' } });
    add(a, 'crate', 27, 13, { solid: true, interact: { type: 'sign', text: 'A crate of apples, addressed to the bakery. Someone will be along.' } });
    add(a, 'crate', 28, 13, { solid: true });
    add(a, 'barrel', 30, 11, { solid: true });
    add(a, 'flowerpot', 26, 17, { solid: false });
    add(a, 'flowerpot', 37, 20, { solid: false });
    add(a, 'gatearch', 29, 2, { w: 6, solid: false });
    add(a, 'sign', 30, 41, { solid: false, text: 'SANCTUARY — south to the shore. Mind the gulls.' });
    add(a, 'sign', 2, 21, { solid: false, text: '← The Garden' });
    add(a, 'birdfeeder', 25, 19, { solid: true, interact: { type: 'birds', line: 'A wooden feeder on a post. Someone keeps it filled, even in winter.' } });
    add(a, 'lamp', 31, 23, { solid: false });
    add(a, 'notes', 26, 20, { solid: false, fid: 'wmnote_village', interact: { type: 'forage', fid: 'wmnote_village', items: ['windmill_note'], name: 'a folded page by the fountain' } });
    add(a, 'bunting', 27, 14, { w: 8, solid: false });
    add(a, 'bush', 24, 16, { solid: true });
    add(a, 'bush', 39, 16, { solid: true });
    add(a, 'flowerpot', 24, 22, { solid: false });
    add(a, 'flowerpot', 39, 21, { solid: false });
    add(a, 'flowerpot', 32, 26, { solid: false });
    add(a, 'bench', 31, 22, { solid: true, interact: { type: 'sit', line: 'You sit in the middle of the square. The village moves around you, unhurried.' } });
    add(a, 'birdfeeder', 33, 16, { solid: true });
    add(a, 'teatable', 36, 34, { w: 2, h: 2, solid: true, interact: { type: 'sit', line: 'A cafe table outside the teashop. Someone left a saucer for the birds.' } });
    add(a, 'chair', 35, 35, { solid: true });
    add(a, 'chair', 38, 35, { solid: true });
    add(a, 'teatable', 43, 34, { w: 2, h: 2, solid: true });
    add(a, 'chair', 42, 35, { solid: true });
    add(a, 'chair', 45, 35, { solid: true });
    add(a, 'crate', 45, 20, { solid: true });
    add(a, 'barrel', 44, 20, { solid: true });
    // greenery softening the plaza edges
    add(a, 'flowers', 24, 14, { solid: false });
    add(a, 'flowers', 25, 14, { solid: false });
    add(a, 'flowers', 38, 14, { solid: false });
    add(a, 'flowers', 39, 15, { solid: false });
    add(a, 'flowers', 31, 25, { solid: false });
    add(a, 'flowers', 23, 26, { solid: false });
    add(a, 'bush', 22, 17, { solid: true });
    add(a, 'bush', 42, 17, { solid: true });
    add(a, 'bush', 22, 25, { solid: true });
    add(a, 'bush', 42, 25, { solid: true });
    add(a, 'tree', 22, 13, { solid: true, variant: 1 });
    add(a, 'tree', 41, 13, { solid: true, variant: 2 });
    add(a, 'lamp', 30, 17, { solid: false });
    add(a, 'flowerpot', 26, 22, { solid: false });
    add(a, 'flowerpot', 33, 24, { solid: false });

    scatter(a, 'tree', 26, 101, { noEdge: true, avoid: (x, y) => x > 8 && x < 56 && y > 5 && y < 40 });
    scatter(a, 'bush', 14, 102, { noEdge: true });
    scatter(a, 'rock', 6, 103, { noEdge: true });
    flowers(a, 240, 104, [',', '.', ',']);

    a.exits.push({ x: 30, y: 0, w: 4, h: 2, to: 'forest', tx: 24, ty: 34, label: 'Memory Forest' });
    a.exits.push({ x: 30, y: 44, w: 4, h: 2, to: 'beach', tx: 29, ty: 2, label: 'The Shore' });
    a.exits.push({ x: 0, y: 22, w: 2, h: 4, to: 'garden', tx: 37, ty: 15, label: 'The Garden' });
    a.exits.push({ x: 62, y: 22, w: 2, h: 4, to: 'windmill', tx: 2, ty: 14, label: 'The Windmill' });
    return a;
  }

  /* =====================================================================
     HOME
     ===================================================================== */
  function buildHome() {
    const a = mk({ id: 'home', name: 'Your Cottage', w: 20, h: 14, fill: 'w', region: 'indoor', music: 'home', ambient: 'fire', weatherFx: false, safe: true, decorZone: { x1: 4, y1: 4, x2: 15, y2: 11 } });
    fillRect(a, 0, 0, 20, 2, 'x');
    fillRect(a, 0, 0, 1, 14, 'x');
    fillRect(a, 19, 0, 1, 14, 'x');
    fillRect(a, 1, 13, 8, 1, 'x');
    fillRect(a, 11, 13, 8, 1, 'x');
    for (let x = 2; x < 18; x++) setTile(a, x, 1, 'x');
    // windows
    setTile(a, 4, 1, 'w'); setTile(a, 5, 1, 'w');
    setTile(a, 14, 1, 'w'); setTile(a, 15, 1, 'w');
    add(a, 'window', 4, 1, { w: 2, solid: true });
    add(a, 'window', 14, 1, { w: 2, solid: true });
    add(a, 'window', 7, 1, { w: 2, solid: true, interact: { type: 'peek' } });
    a.spawn = { x: 10, y: 12 };
    door(a, 10, 13, 'village', 14, 16, 'Sanctuary Village');
    a.spawn = { x: 10, y: 11 };

    /* bedroom corner */
    add(a, 'bed', 2, 2, { w: 3, h: 3, solid: true, interact: { type: 'sleep' } });
    add(a, 'nightstand', 5, 2, { solid: true });
    add(a, 'wardrobe', 6, 2, { w: 2, h: 2, solid: true, interact: { type: 'customize' } });
    add(a, 'plant', 5, 5, { solid: false });

    /* living room: sofa, rug, low table, reading shelf */
    add(a, 'sofa', 7, 5, { w: 3, h: 1, solid: true });
    fillRect(a, 6, 6, 7, 4, 'r');
    add(a, 'table', 9, 7, { w: 2, h: 2, solid: true, interact: { type: 'sign', text: 'A cup of tea gone cold beside an open book. You will make another and read the same page twice.' } });
    add(a, 'chair', 8, 9, { solid: true });
    add(a, 'chair', 12, 9, { solid: true });
    add(a, 'plant', 7, 11, { solid: false });

    /* journal corner + library wall */
    add(a, 'bookshelf', 10, 2, { w: 3, h: 2, solid: true, interact: { type: 'collection' } });
    add(a, 'desk', 13, 2, { w: 2, h: 2, solid: true, interact: { type: 'journal' } });
    add(a, 'nightstand', 15, 2, { solid: true });
    add(a, 'plant', 17, 5, { solid: false });

    /* hearth + kitchen */
    add(a, 'fireplace', 16, 2, { w: 2, h: 2, solid: true, interact: { type: 'fireplace' } });
    add(a, 'stove', 16, 6, { w: 2, h: 2, solid: true, interact: { type: 'cook' } });
    add(a, 'counter', 16, 9, { w: 2, h: 1, solid: true });
    add(a, 'sink', 16, 11, { w: 2, h: 1, solid: true });

    /* workshop + cat corner */
    add(a, 'craftbench', 2, 8, { w: 2, h: 2, solid: true, interact: { type: 'craft' } });
    add(a, 'cattower', 2, 11, { h: 2, solid: true });
    add(a, 'catbed', 4, 11, { w: 2, h: 1, solid: false });
    add(a, 'catbowl', 6, 11, { solid: false });
    add(a, 'window', 2, 1, { solid: true });
    /* Victorian dressing: framed botanicals, a hallway clock, quiet comforts */
    add(a, 'painting', 9, 1, { solid: true, interact: { type: 'sign', text: 'A pressed sprig of lavender under glass, labelled in handwriting you almost recognise.' } });
    add(a, 'painting', 12, 1, { solid: true });
    add(a, 'mirror', 13, 1, { solid: true, interact: { type: 'sign', text: 'An oval mirror in a gilded frame. Your reflection arrives half a second late, then smiles.' } });
    add(a, 'clock', 18, 1, { solid: true, interact: { type: 'sign', text: 'A small oak clock, wound every Sunday. It keeps village time, which is to say: approximate.' } });
    add(a, 'vase', 8, 2, { solid: false });
    add(a, 'bookstack', 11, 10, { solid: false });
    add(a, 'cushion', 13, 10, { solid: false });
    /* Mochi's corner: a woven mat under the nest and a spare cushion */
    fillRect(a, 3, 12, 4, 1, 'r');
    add(a, 'cushion', 8, 12, { solid: false });

    add(a, 'plaque', 10, 1, { solid: false, text: 'Home' });
    return a;
  }

  /* =====================================================================
     GARDEN
     ===================================================================== */
  function buildGarden() {
    const a = mk({ id: 'garden', name: 'The Garden', w: 40, h: 30, fill: '.', music: 'village', ambient: 'birds' });
    a.spawn = { x: 34, y: 15 };

    // pond
    fillRect(a, 4, 19, 11, 8, 's');
    fillRect(a, 5, 20, 9, 6, '~');
    add(a, 'rock', 4, 19, { solid: true });
    add(a, 'rock', 14, 25, { solid: true });
    add(a, 'reeds', 5, 26, { solid: false });
    add(a, 'reeds', 13, 19, { solid: false });
    add(a, 'bench', 16, 22, { solid: true, interact: { type: 'sit', line: 'You sit by the pond. The frogs are having an extremely important meeting.' } });

    // farm beds
    fillRect(a, 15, 7, 10, 8, '#');
    a.plots = [];
    for (let yy = 8; yy <= 12; yy += 2) {
      for (let xx = 16; xx <= 22; xx += 2) {
        setTile(a, xx, yy, 'c');
        setTile(a, xx + 1, yy, 'c');
        a.plots.push({ x: xx, y: yy, area: 'garden' });
        a.plots.push({ x: xx + 1, y: yy, area: 'garden' });
      }
    }
    add(a, 'scarecrow', 23, 7, { solid: true, interact: { type: 'sign', text: 'The scarecrow is wearing a very nice hat. Nobody knows where it came from.' } });
    add(a, 'waterbarrel', 14, 6, { solid: true, interact: { type: 'sign', text: 'Rainwater, cold and clean. Watering cans live here.' } });

    // paths
    fillRect(a, 23, 13, 17, 3, '#');
    fillRect(a, 24, 2, 3, 6, '#');
    fillRect(a, 15, 14, 3, 2, '#');

    // greenhouse gate
    add(a, 'gate', 23, 1, { w: 5, solid: true, interact: { type: 'area', to: 'greenhouse', tx: 14, ty: 19 } });
    add(a, 'sign', 21, 2, { solid: false, text: '↑ The Shared Greenhouse. Door sticks — lift it.' });

    // shed + decor
    add(a, 'building', 1, 4, { w: 5, h: 4, style: 'shed', solid: true, doorRel: { x: 2, y: 3 } });
    add(a, 'flowerpot', 4, 8, { solid: true, interact: { type: 'sign', text: 'A pot of herbs labelled, in tidy handwriting: "for whoever needs them".' } });
    add(a, 'birdbath', 28, 20, { w: 2, h: 2, solid: true, interact: { type: 'birds', line: 'Birds argue at the birdbath. You could crumble some bread and make it a party.' } });
    add(a, 'bench', 26, 25, { solid: true, interact: { type: 'sit', line: 'You sit in the garden. Somewhere nearby, something is growing without your help.' } });
    add(a, 'flowerbed', 6, 12, { w: 3, h: 2, solid: false });
    add(a, 'flowerbed', 30, 6, { w: 3, h: 2, solid: false });
    add(a, 'fence', 14, 17, { w: 14, solid: true });
    add(a, 'fence', 14, 18, { w: 2, solid: true });
    add(a, 'fence', 26, 18, { w: 2, solid: true });
    add(a, 'lamp', 33, 12, {});
    scatter(a, 'tree', 12, 201, { noEdge: true, avoid: (x, y) => y > 14 && y < 26 && x < 16 });
    flowers(a, 200, 202, [',', ',', '.']);
    a.exits.push({ x: 39, y: 13, w: 1, h: 3, to: 'village', tx: 2, ty: 24, label: 'Village' });
    return a;
  }

  /* =====================================================================
     GREENHOUSE
     ===================================================================== */
  function buildGreenhouse() {
    const a = mk({ id: 'greenhouse', name: 'The Shared Greenhouse', w: 30, h: 22, fill: 'g', region: 'indoor', music: 'greenhouse', ambient: 'forest', safe: true });
    a.spawn = { x: 14, y: 16 };
    fillRect(a, 0, 0, 30, 2, 'x');
    fillRect(a, 0, 0, 2, 22, 'x');
    fillRect(a, 28, 0, 2, 22, 'x');
    fillRect(a, 0, 19, 30, 1, 'x');
    for (let x = 12; x <= 17; x++) setTile(a, x, 19, 'g');
    a.spawn = { x: 14, y: 17 };
    door(a, 14, 21, 'garden', 25, 3, 'The Garden');
    // glass walls decoration
    for (let x = 3; x < 27; x += 4) add(a, 'glasspanel', x, 1, { w: 2, solid: true });
    add(a, 'glasspanel', 1, 6, { h: 3, solid: true });
    add(a, 'glasspanel', 27, 6, { h: 3, solid: true });

    a.plots = [];
    for (let yy = 7; yy <= 11; yy += 2) {
      for (let xx = 7; xx <= 15; xx += 2) {
        setTile(a, xx, yy, 'c'); setTile(a, xx + 1, yy, 'c');
        a.plots.push({ x: xx, y: yy, area: 'greenhouse' });
        a.plots.push({ x: xx + 1, y: yy, area: 'greenhouse' });
      }
    }
    add(a, 'waterbarrel', 3, 8, { solid: true, interact: { type: 'sign', text: 'Cool rainwater, with a brass tap. Someone has tied a ribbon to it.' } });
    add(a, 'table', 3, 14, { w: 3, h: 2, solid: true, interact: { type: 'sign', text: 'Seed packets in careful rows, sorted by patience required.' } });
    add(a, 'potstack', 24, 5, { solid: true, interact: { type: 'sign', text: 'Empty pots, stacked by size. Elowen stacks them when she is thinking.' } });
    add(a, 'potstack', 25, 7, { solid: true });
    add(a, 'vine', 20, 3, { w: 5, solid: true });
    add(a, 'vine', 21, 8, { w: 3, solid: true });
    add(a, 'bench', 21, 14, { w: 3, solid: true, interact: { type: 'sit', line: 'You sit among the seedlings. It is warm and smells of wet earth.' } });
    add(a, 'plant', 5, 17, {});
    add(a, 'plant', 24, 17, {});
    add(a, 'lamp', 9, 3, {});
    add(a, 'lamp', 19, 3, {});
    add(a, 'memorialPlacard', 12, 15, { w: 2, solid: true, interact: { type: 'sign', text: '"For Elowen. Who grew this place. Who is allowed to be helped." — someone who loves her' } });
    return a;
  }

  /* =====================================================================
     FOREST
     ===================================================================== */
  function buildForest() {
    const a = mk({ id: 'forest', name: 'The Memory Forest', w: 48, h: 38, fill: 'm', music: 'forest', ambient: 'forest' });
    a.spawn = { x: 24, y: 34 };

    // paths
    fillRect(a, 22, 25, 4, 13, '#');
    fillRect(a, 10, 25, 14, 3, '#');
    fillRect(a, 10, 7, 3, 19, '#');
    fillRect(a, 10, 6, 16, 3, '#');
    fillRect(a, 22, 0, 4, 8, '#');
    fillRect(a, 30, 6, 3, 3, '#');
    fillRect(a, 33, 7, 6, 2, '#');

    // memory stones
    const stones = [[5, 16], [35, 12], [17, 31]];
    stones.forEach((s, i) => {
      fillRect(a, s[0] - 1, s[1] + 2, 4, 3, 'm');
      add(a, 'ringstone', s[0], s[1] + 2, {});
      a.props.push({ t: 'memorystone', x: s[0], y: s[1], w: 2, h: 2, solid: true, idx: i, interact: { type: 'memory', idx: i } });
      add(a, 'lanternpost', s[0] + 2, s[1] + 2, {});
    });

    // treasure
    a.props.push({ t: 'chest', x: 33, y: 29, w: 1, h: 1, solid: true, cid: 'forest_music', loot: [['music_box', 1], ['wood', 4]], interact: { type: 'chest', cid: 'forest_music', loot: [['music_box', 1], ['wood', 4]] } });
    a.props.push({ t: 'chest', x: 8, y: 33, w: 1, h: 1, solid: true, cid: 'forest_wood', loot: [['wood', 6], ['stone', 3], ['fiber', 2]], interact: { type: 'chest', cid: 'forest_wood', loot: [['wood', 6], ['stone', 3], ['fiber', 2]] } });
    a.props.push({ t: 'chest', x: 41, y: 20, w: 1, h: 1, solid: true, cid: 'forest_glass', loot: [['sea_glass', 2], ['glow_moss', 2]], interact: { type: 'chest', cid: 'forest_glass', loot: [['sea_glass', 2], ['glow_moss', 2]] } });

    // forage bushes
    [[14, 20], [19, 12], [28, 20], [36, 26], [44, 9], [12, 30], [30, 34], [40, 34]].forEach((p) => {
      a.props.push({ t: 'berrybush', x: p[0], y: p[1], solid: true, fid: 'b' + p[0] + '_' + p[1], interact: { type: 'forage', fid: 'b' + p[0] + '_' + p[1], items: ['berry', 'herb'], name: 'the berry bush' } });
    });
    // mushrooms & moss
    [[24, 22], [16, 9], [39, 24], [11, 14]].forEach((p, i) => {
      a.props.push({ t: 'mushrooms', x: p[0], y: p[1], solid: false, fid: 'm' + i, interact: { type: 'forage', fid: 'm' + i, items: ['herb', 'glow_moss'], name: 'the mushrooms' } });
    });

    // meadow gate
    add(a, 'gate', 22, 0, { w: 4, solid: true, interact: { type: 'area', to: 'meadow', tx: 16, ty: 23 }, locked: 'meadow' });
    add(a, 'sign', 20, 2, { solid: false, text: 'A narrow path north. The sign is illegible, but the flowers point one way.' });
    add(a, 'ruin', 26, 26, { w: 3, h: 2, solid: true, interact: { type: 'sign', text: 'A moss-covered stone wall. Someone carved: "I was here. That is enough." Under it, older and deeper: "Three stones keep the way. Moth, then wave, then leaf. In that order, or not at all."' } });
    add(a, 'rune', 9, 15, { solid: true, symbol: 'moth', interact: { type: 'rune', symbol: 'moth' } });
    add(a, 'rune', 13, 24, { solid: true, symbol: 'wave', interact: { type: 'rune', symbol: 'wave' } });
    add(a, 'rune', 17, 24, { solid: true, symbol: 'leaf', interact: { type: 'rune', symbol: 'leaf' } });
    add(a, 'grovegate', 9, 4, { w: 3, h: 1, solid: true, interact: { type: 'grove' } });
    add(a, 'letterprop', 7, 29, { solid: false, interact: { type: 'letter', letter: 'letter_unknown', text: 'A letter tucked under a root, wrapped in oilcloth. The wax is stamped with a leaf.' } });
    add(a, 'log', 20, 30, { w: 2, solid: true });
    add(a, 'log', 43, 15, { w: 2, solid: true });
    add(a, 'fireflies', 30, 15, { w: 6, h: 4 });

    scatter(a, 'pine', 34, 301, { noEdge: true, on: 'm', avoid: (x, y) => (x > 21 && x < 27) || (x > 8 && x < 14) });
    scatter(a, 'tree', 20, 302, { noEdge: true, on: 'm', avoid: (x, y) => (x > 21 && x < 27) || (x > 8 && x < 14) });
    scatter(a, 'rock', 8, 303, { noEdge: true, on: 'm' });
    scatteredFlowersForest(a);
    a.exits.push({ x: 22, y: 37, w: 4, h: 1, to: 'village', tx: 31, ty: 42, label: 'Village' });
    return a;
  }
  function scatteredFlowersForest(a) {
    const rng = SAN.util.rng(304);
    for (let i = 0; i < 120; i++) {
      const x = 1 + Math.floor(rng() * (a.w - 2));
      const y = 1 + Math.floor(rng() * (a.h - 2));
      if (a.grid[y][x] === 'm') a.grid[y][x] = rng() > 0.55 ? ',' : 'm';
    }
  }

  /* =====================================================================
     BEACH
     ===================================================================== */
  function buildBeach() {
    const a = mk({ id: 'beach', name: 'The Shore', w: 56, h: 30, fill: 's', music: 'beach', ambient: 'waves' });
    a.spawn = { x: 29, y: 3 };
    fillRect(a, 0, 19, 56, 11, '~');
    fillRect(a, 0, 18, 56, 1, 's');
    // pier
    fillRect(a, 25, 15, 4, 13, 'w');
    add(a, 'pierpost', 25, 28, {});
    add(a, 'pierpost', 28, 28, {});
    add(a, 'pierrail', 25, 15, { w: 1, h: 3 });
    add(a, 'sign', 25, 14, { solid: false, text: 'FISHING PIER — no running, no shouting, no catching anything bigger than your courage.' });

    // lighthouse
    add(a, 'building', 44, 4, { w: 9, h: 12, style: 'lighthouse', solid: true, doorRel: { x: 4, y: 11 } });
    door(a, 48, 15, 'lighthouse', 13, 18, 'The Lighthouse');
    add(a, 'rock', 42, 10, { solid: true });
    add(a, 'rock', 43, 14, { solid: true });
    add(a, 'driftwood', 20, 12, { w: 2, solid: true, interact: { type: 'sign', text: 'Driftwood, bleached pale. It looks like something that decided to stay.' } });
    add(a, 'driftwood', 34, 6, { w: 2, solid: true });
    add(a, 'boat', 8, 17, { w: 3, h: 1, solid: true, interact: { type: 'sign', text: 'An upturned rowboat. Someone has painted a small sun on the hull.' } });
    add(a, 'umbrella', 16, 8, { w: 2, h: 2, solid: false, interact: { type: 'sit', line: 'You sit under the striped umbrella. The shade is exactly the right temperature.' } });
    add(a, 'bench', 38, 10, { solid: true, interact: { type: 'sit', line: 'You sit on the bench and watch the horizon do very little, beautifully.' } });
    add(a, 'pierend', 26, 27, { solid: true, interact: { type: 'sunset' } });
    add(a, 'letterprop', 45, 18, { solid: false, interact: { type: 'letter', letter: 'letter_old', text: 'A sealed letter half-buried at the tide line, addressed to the lighthouse. The paper is soft with salt.' } });

    // collectibles
    a.props.push({ t: 'bottle', x: 12, y: 9, solid: false, fid: 'bottle1', interact: { type: 'forage', fid: 'bottle1', items: ['sea_letter'], name: 'the bottle' } });
    a.props.push({ t: 'sparkle', x: 26, y: 26, solid: false, fid: 'starhook', interact: { type: 'forage', fid: 'starhook', items: ['star_hook'], name: 'something glinting between the planks' } });
    a.props.push({ t: 'sparkle', x: 43, y: 11, solid: false, fid: 'photo', interact: { type: 'forage', fid: 'photo', items: ['old_photo'], name: 'something half-buried in the sand' } });
    a.props.push({ t: 'bottle2', x: 49, y: 17, solid: false, interact: { type: 'sign', text: 'A bottle, bobbing. It is tied to the pier with string, as if it keeps coming back.' } });
    for (const p of [[10, 14], [18, 4], [31, 8], [47, 17], [5, 6], [21, 16], [36, 13], [52, 8]]) {
      a.props.push({ t: 'shell', x: p[0], y: p[1], solid: false, fid: 'sh' + p[0] + p[1], interact: { type: 'forage', fid: 'sh' + p[0] + p[1], items: ['shell', 'sea_glass'], name: 'the shells' } });
    }
    scatter(a, 'palm', 0, 1, {});
    add(a, 'palm', 3, 4, { solid: true });
    add(a, 'palm', 30, 3, { solid: true });
    add(a, 'palm', 53, 12, { solid: true });
    add(a, 'rock', 2, 10, { solid: true });
    add(a, 'rock', 39, 2, { solid: true });
    add(a, 'rock', 22, 2, { solid: true });

    a.exits.push({ x: 28, y: 0, w: 3, h: 2, to: 'village', tx: 31, ty: 42, label: 'Village' });
    return a;
  }

  /* =====================================================================
     LIGHTHOUSE INTERIOR
     ===================================================================== */
  function buildLighthouse() {
    const a = mk({ id: 'lighthouse', name: 'The Lighthouse', w: 26, h: 22, fill: 'o', region: 'indoor', music: 'emotional', ambient: 'wind', weatherFx: false, safe: true });
    a.spawn = { x: 13, y: 17 };
    fillRect(a, 0, 0, 26, 2, 'x');
    fillRect(a, 0, 0, 2, 22, 'x');
    fillRect(a, 24, 0, 2, 22, 'x');
    fillRect(a, 0, 20, 26, 2, 'x');
    for (let x = 11; x <= 15; x++) setTile(a, x, 20, 'o');
    door(a, 13, 21, 'beach', 48, 16, 'The Shore');
    a.spawn = { x: 13, y: 18 };

    add(a, 'lampbig', 10, 3, { w: 6, h: 4, solid: true, interact: { type: 'lamp' } });
    add(a, 'stairs', 21, 4, { w: 2, h: 8, solid: true, interact: { type: 'sign', text: 'Iron stairs spiral up into the lamp room. They are worn smooth in the middle.' } });
    add(a, 'cot', 2, 16, { w: 3, h: 2, solid: true, interact: { type: 'sign', text: 'A narrow cot, made with military precision. A book lies face-down on the pillow.' } });
    add(a, 'bookshelf', 2, 3, { w: 2, h: 3, solid: true, interact: { type: 'sign', text: 'Tides, Lamps, and Other Things That Return. Every spine is cracked.' } });
    add(a, 'teatable', 17, 14, { w: 2, h: 2, solid: true, interact: { type: 'sign', text: 'Two cups. One is always set out. You do not ask.' } });
    add(a, 'rug', 9, 14, { w: 5, h: 3, solid: false });
    add(a, 'window', 6, 1, { w: 2, solid: true });
    add(a, 'window', 18, 1, { w: 2, solid: true });
    add(a, 'crate', 22, 17, { solid: true, interact: { type: 'sign', text: 'Lamp oil, spare wicks, and a tin of biscuits with the good kind of biscuit in it.' } });
    add(a, 'plant', 5, 12, {});
    add(a, 'charttable', 20, 10, { w: 3, h: 2, solid: true, interact: { type: 'sign', text: 'A sea chart with small pencil marks. Somebody has been keeping track of every ship that passed.' } });
    return a;
  }

  /* =====================================================================
     WINDMILL
     ===================================================================== */
  function buildWindmill() {
    const a = mk({ id: 'windmill', name: 'The Whispering Windmill', w: 36, h: 28, fill: '.', music: 'wind', ambient: 'wind' });
    a.spawn = { x: 3, y: 14 };
    fillRect(a, 0, 12, 18, 4, '#');
    fillRect(a, 15, 12, 4, 8, '#');
    add(a, 'windmill', 14, 4, { w: 9, h: 9, solid: true, interact: { type: 'sign', text: 'The windmill turns. Inside, gears grind patiently, like a thought being worked through.' } });
    add(a, 'bench', 19, 16, { w: 2, solid: true, interact: { type: 'sit', line: 'You sit on the windmill bench. The sails turn. Nothing is decided.' } });
    add(a, 'sign', 3, 11, { solid: false, text: 'THE WHISPERING WINDMILL — "If it is still loud in here, sit down. The wind will keep going. So can you."' });
    // wheat field
    fillRect(a, 22, 18, 10, 7, 'F');
    add(a, 'fence', 21, 18, { w: 1, h: 7, solid: true });
    add(a, 'fence', 32, 18, { w: 1, h: 7, solid: true });
    add(a, 'haybale', 27, 12, { w: 2, h: 1, solid: true });
    add(a, 'haybale', 30, 12, { w: 2, h: 1, solid: true });
    add(a, 'rock', 6, 22, { solid: true });
    add(a, 'rock', 9, 5, { solid: true });
    add(a, 'notes', 12, 14, { solid: false, fid: 'wmnote', interact: { type: 'forage', fid: 'wmnote', items: ['windmill_note'], name: 'a folded note' } });
    add(a, 'flowers', 4, 18, { w: 3, h: 2, solid: false });
    add(a, 'lamp', 17, 21, {});
    scatter(a, 'tree', 14, 401, { noEdge: true, avoid: (x, y) => x < 20 && y > 10 && y < 20 });
    flowers(a, 160, 402, [',', '.', ',']);
    a.exits.push({ x: 0, y: 12, w: 1, h: 4, to: 'village', tx: 61, ty: 24, label: 'Village' });
    return a;
  }

  /* =====================================================================
     MEADOW
     ===================================================================== */
  function buildMeadow() {
    const a = mk({ id: 'meadow', name: 'The Hidden Meadow', w: 32, h: 26, fill: '.', music: 'greenhouse', ambient: 'forest' });
    a.spawn = { x: 16, y: 22 };
    fillRect(a, 14, 20, 4, 6, '#');
    fillRect(a, 8, 12, 16, 3, ',');
    // pond
    fillRect(a, 20, 6, 7, 5, 's');
    fillRect(a, 21, 7, 5, 3, '~');
    // shrine
    add(a, 'shrine', 13, 5, { w: 5, h: 3, solid: true, interact: { type: 'shrine' } });
    add(a, 'arch', 8, 17, { w: 2, h: 3, solid: true });
    add(a, 'arch', 22, 17, { w: 2, h: 3, solid: true });
    // rare blooms
    [[6, 9], [26, 14], [10, 22], [24, 22], [17, 9]].forEach((p, i) => {
      a.props.push({ t: 'rarebloom', x: p[0], y: p[1], solid: false, fid: 'rb' + i, interact: { type: 'forage', fid: 'rb' + i, items: ['starflower', 'moonpetal', 'snowdrop'], name: 'a rare bloom' } });
    });
    add(a, 'butterflies', 10, 8, { w: 8, h: 6 });
    add(a, 'catnip', 5, 14, { solid: false, interact: { type: 'forage', fid: 'catnip1', items: ['herb', 'yarn_ball'], name: 'the catnip patch' } });
    add(a, 'bench', 16, 14, { solid: true, interact: { type: 'sit', line: 'You sit in the hidden meadow. The flowers here do not care who sees them.' } });
    add(a, 'starblanket', 15, 17, { w: 4, h: 3, solid: false, interact: { type: 'stargaze' } });
    add(a, 'glowtree', 27, 3, { w: 3, h: 3, solid: true });
    scatter(a, 'tree', 9, 501, { noEdge: true });
    flowers(a, 260, 502, [',', ',', '.', ',']);
    a.exits.push({ x: 14, y: 25, w: 4, h: 1, to: 'forest', tx: 24, ty: 2, label: 'Memory Forest' });
    return a;
  }

  /* =====================================================================
     THE HIDDEN GROVE (secret area)
     ===================================================================== */
  function buildGrove() {
    const a = mk({ id: 'grove', name: 'The Hidden Grove', w: 26, h: 20, fill: 'm', music: 'forest', ambient: 'forest' });
    a.spawn = { x: 13, y: 16 };
    fillRect(a, 9, 5, 10, 10, ',');
    fillRect(a, 12, 14, 3, 4, '#');
    fillRect(a, 18, 10, 6, 5, 's');
    fillRect(a, 19, 11, 4, 3, '~');
    add(a, 'shrine', 11, 4, { w: 4, h: 3, solid: true, interact: { type: 'shrine' } });
    a.props.push({ t: 'memorystone', x: 6, y: 9, w: 2, h: 2, solid: true, idx: 3, interact: { type: 'memory', idx: 3 } });
    add(a, 'ringstone', 6, 11, {});
    add(a, 'lanternpost', 8, 11, {});
    [[5, 14], [9, 3], [20, 6], [18, 16], [22, 14]].forEach((p, i) => {
      a.props.push({ t: 'rarebloom', x: p[0], y: p[1], solid: false, fid: 'g' + i, interact: { type: 'forage', fid: 'g' + i, items: ['starflower', 'snowdrop', 'moonpetal', 'glow_moss'], name: 'a rare bloom' } });
    });
    add(a, 'letterprop', 21, 5, { solid: false, interact: { type: 'letter', letter: 'letter_grove', text: 'A note in oilcloth left at the shrine: "I planted this for a feeling I could not name. It is doing well. I hope you are too."' } });
    add(a, 'fireflies', 4, 3, { w: 8, h: 6 });
    add(a, 'butterflies', 15, 8, { w: 6, h: 5 });
    add(a, 'glowtree', 21, 2, { w: 3, h: 3, solid: true });
    add(a, 'log', 5, 17, { w: 2, solid: true });
    add(a, 'bench', 16, 13, { solid: true, interact: { type: 'sit', line: 'You sit in the grove. The light comes through the leaves in small, patient handfuls.' } });
    scatter(a, 'tree', 18, 601, { noEdge: true, on: 'm', avoid: (x, y) => x > 4 && x < 24 && y > 2 && y < 18 });
    scatter(a, 'pine', 6, 603, { noEdge: true, on: 'm', avoid: (x, y) => x > 4 && x < 24 && y > 2 && y < 18 });
    flowers(a, 180, 602, [',', ',', '.']);
    a.exits.push({ x: 12, y: 19, w: 3, h: 1, to: 'forest', tx: 11, ty: 5, label: 'Memory Forest' });
    return a;
  }

  /* =====================================================================
     INTERIORS
     ===================================================================== */
  function interior(id, name, opts) {
    const a = mk({ id, name, w: 20, h: 13, fill: 'w', region: 'indoor', music: opts.music || 'village', ambient: opts.ambient || 'fire', weatherFx: false, safe: true });
    fillRect(a, 0, 0, 20, 2, 'x');
    fillRect(a, 0, 0, 1, 13, 'x');
    fillRect(a, 19, 0, 1, 13, 'x');
    fillRect(a, 0, 12, 10, 1, 'x');
    fillRect(a, 11, 12, 9, 1, 'x');
    add(a, 'window', 4, 1, { w: 2, solid: true });
    add(a, 'window', 14, 1, { w: 2, solid: true });
    door(a, 10, 12, opts.backTo, opts.bx, opts.by, opts.backLabel);
    a.spawn = { x: 10, y: 11 };
    return a;
  }

  function buildStore() {
    const a = interior('store', 'Sanctuary General Store', { backTo: 'village', bx: 23, by: 12, backLabel: 'Village' });
    add(a, 'counter', 6, 4, { w: 8, h: 1, solid: true, interact: { type: 'shop', shop: 'store' } });
    add(a, 'shelf', 2, 3, { w: 2, h: 1, solid: true });
    add(a, 'shelf', 2, 5, { w: 2, h: 1, solid: true });
    add(a, 'shelf', 2, 7, { w: 2, h: 1, solid: true });
    add(a, 'shelf', 15, 3, { w: 2, h: 1, solid: true });
    add(a, 'shelf', 15, 5, { w: 2, h: 1, solid: true });
    add(a, 'crate', 5, 8, { solid: true, interact: { type: 'sign', text: 'A crate of turnips with a label: "Not for sale. Emotional support turnips."' } });
    add(a, 'crate', 6, 8, { solid: true });
    add(a, 'barrel', 14, 9, { solid: true });
    add(a, 'plant', 17, 10, {});
    add(a, 'plaque', 10, 1, { solid: false, text: 'GENERAL STORE' });
    return a;
  }
  function buildBakery() {
    const a = interior('bakery', 'Mira\'s Bakery', { backTo: 'village', bx: 39, by: 12, backLabel: 'Village', music: 'village' });
    add(a, 'counter', 6, 4, { w: 8, h: 1, solid: true, interact: { type: 'shop', shop: 'bakery' } });
    add(a, 'oven', 2, 3, { w: 3, h: 2, solid: true, interact: { type: 'sign', text: 'The oven is enormous and warm. Mira talks to it.' } });
    add(a, 'shelf', 15, 2, { w: 2, h: 1, solid: true });
    add(a, 'table', 14, 7, { w: 3, h: 2, solid: true, interact: { type: 'sit', line: 'A small table by the window. Mira leaves a plate of offcuts on it, always.' } });
    add(a, 'chair', 13, 7, { solid: true });
    add(a, 'plant', 17, 10, {});
    add(a, 'plaque', 10, 1, { solid: false, text: 'MIRA\'S BAKERY' });
    add(a, 'flourbags', 4, 8, { w: 2, solid: true });
    return a;
  }
  function buildTeaShop() {
    const a = interior('teashop', 'The Steeping Room', { backTo: 'village', bx: 41, by: 27, backLabel: 'Village', ambient: 'fire' });
    add(a, 'counter', 6, 4, { w: 8, h: 1, solid: true, interact: { type: 'shop', shop: 'teashop' } });
    add(a, 'kettle', 3, 3, { w: 2, h: 2, solid: true, interact: { type: 'sign', text: 'A copper kettle sings to itself. Nobody is watching it. It seems fine with that.' } });
    add(a, 'teatable', 4, 8, { w: 2, h: 2, solid: true, interact: { type: 'sit', line: 'You sit at a small round table. Someone has left a paperback and a sugar cube.' } });
    add(a, 'teatable', 14, 8, { w: 2, h: 2, solid: true, interact: { type: 'sit', line: 'The window table. Best view of the square, best gossip acoustics.' } });
    add(a, 'chair', 3, 8, { solid: true });
    add(a, 'chair', 6, 8, { solid: true });
    add(a, 'chair', 13, 8, { solid: true });
    add(a, 'chair', 16, 8, { solid: true });
    add(a, 'shelf', 16, 2, { w: 2, h: 2, solid: true });
    add(a, 'gramophone', 17, 9, { solid: true, interact: { type: 'music', line: 'You wind the gramophone. It plays something crackly and slow, like a memory with dust on it.' } });
    add(a, 'plant', 2, 6, {});
    add(a, 'plaque', 10, 1, { solid: false, text: 'THE STEEPING ROOM' });
    return a;
  }
  function buildFlowerShop() {
    const a = interior('flower', 'Celeste\'s Flower Shop', { backTo: 'village', bx: 23, by: 27, backLabel: 'Village', music: 'greenhouse', ambient: 'birds' });
    add(a, 'counter', 6, 4, { w: 8, h: 1, solid: true, interact: { type: 'shop', shop: 'flower' } });
    add(a, 'flowerbucket', 2, 3, { solid: true });
    add(a, 'flowerbucket', 3, 3, { solid: true });
    add(a, 'flowerbucket', 2, 5, { solid: true });
    add(a, 'flowerbucket', 16, 3, { solid: true });
    add(a, 'flowerbucket', 17, 3, { solid: true });
    add(a, 'flowerbucket', 17, 5, { solid: true });
    add(a, 'table', 8, 8, { w: 3, h: 2, solid: true, interact: { type: 'sign', text: 'A worktable covered in cut stems, ribbon, and a very old pair of scissors.' } });
    add(a, 'plant', 14, 10, {});
    add(a, 'plant', 5, 10, {});
    add(a, 'plaque', 10, 1, { solid: false, text: 'FLOWERS — SAY IT WITH PETALS' });
    return a;
  }
  function buildLibrary() {
    const a = interior('library', 'The Village Library', { backTo: 'village', bx: 49, by: 18, backLabel: 'Village', ambient: 'fire', music: 'emotional' });
    add(a, 'bookshelf', 2, 2, { w: 5, h: 1, solid: true, interact: { type: 'collection' } });
    add(a, 'bookshelf', 13, 2, { w: 5, h: 1, solid: true, interact: { type: 'collection' } });
    add(a, 'bookshelf', 2, 5, { w: 4, h: 1, solid: true });
    add(a, 'bookshelf', 14, 5, { w: 4, h: 1, solid: true });
    add(a, 'bookshelf', 2, 8, { w: 4, h: 1, solid: true });
    add(a, 'bookshelf', 14, 8, { w: 4, h: 1, solid: true });
    add(a, 'ledger', 8, 5, { w: 3, h: 2, solid: true, interact: { type: 'collection' } });
    add(a, 'teatable', 16, 9, { w: 2, h: 2, solid: true, interact: { type: 'sit', line: 'You sit at the reading table. A bookmark says: "you are allowed to read slowly".' } });
    add(a, 'chair', 15, 9, { solid: true });
    add(a, 'lamp', 7, 3, {});
    add(a, 'notes', 6, 7, { solid: false, fid: 'wmnote_library', interact: { type: 'forage', fid: 'wmnote_library', items: ['windmill_note'], name: 'a note tucked into a returned book' } });
    add(a, 'letterprop', 11, 7, { solid: false, interact: { type: 'letter', letter: 'letter_unknown', text: 'A letter left inside a returned novel, never sent. The envelope says only: "read when you can".' } });
    add(a, 'piano', 3, 10, { w: 2, h: 1, solid: true, interact: { type: 'music', line: 'You sit at the old piano. It is slightly out of tune, in a way that feels honest.' } });
    add(a, 'bookshelf', 2, 8, { w: 4, h: 1, solid: true, interact: { type: 'read' } });
    add(a, 'plant', 11, 10, {});
    add(a, 'plaque', 10, 1, { solid: false, text: 'THE VILLAGE LEDGER' });
    return a;
  }

  /* =====================================================================
     BUILD ALL
     ===================================================================== */
  A.village = buildVillage();
  A.home = buildHome();
  A.garden = buildGarden();
  A.greenhouse = buildGreenhouse();
  A.forest = buildForest();
  A.beach = buildBeach();
  A.lighthouse = buildLighthouse();
  A.windmill = buildWindmill();
  A.meadow = buildMeadow();
  A.grove = buildGrove();
  A.store = buildStore();
  A.bakery = buildBakery();
  A.teashop = buildTeaShop();
  A.flower = buildFlowerShop();
  A.library = buildLibrary();

  W.order = ['home', 'village', 'garden', 'greenhouse', 'forest', 'beach', 'lighthouse', 'windmill', 'meadow', 'grove', 'store', 'bakery', 'teashop', 'flower', 'library'];
  W.solidChars = SOLID_CHARS;
  W.mk = mk;
  W.add = add;
  W.fillRect = fillRect;
})();
