/* Sanctuary — the cat companion: follows, wanders, sleeps, finds little things */
(function () {
  const C = (SAN.cat = {});
  const U = SAN.util;

  C.sprite = null;
  C.timer = 6;
  C.discoverTimer = 70;
  C.purrTimer = 0;

  C.init = function () {
    const S = SAN.state.S;
    if (!S) return;
    C.sprite = {
      px: (S.cat.x || 8) * 16, py: (S.cat.y || 9) * 16,
      x: S.cat.x || 8, y: S.cat.y || 9,
      state: S.cat.state || 'follow', mood: S.cat.mood, timer: 4,
      colorHex: S.cat.colorHex, accessory: S.cat.accessory, target: null,
    };
  };

  C.syncFromState = function () {
    const S = SAN.state.S;
    if (!S.cat.adopted) { C.sprite = null; return; }
    C.init();
    C.placeNearPlayer();
  };

  C.placeNearPlayer = function () {
    const S = SAN.state.S;
    if (!C.sprite) C.init();
    if (!C.sprite) return;
    const W = SAN.world;
    const p = W.player;
    for (let r = 1; r < 6; r++) {
      for (const [dx, dy] of [[-r, 0], [r, 0], [0, r], [0, -r], [-r, -r], [r, r]]) {
        const tx = Math.floor(p.x) + dx, ty = Math.floor(p.y) + dy;
        if (!W.isSolid(tx, ty)) {
          C.sprite.px = (tx + 0.5) * 16; C.sprite.py = (ty + 0.5) * 16;
          C.sprite.x = tx + 0.5; C.sprite.y = ty + 0.5;
          return;
        }
      }
    }
  };

  C.update = function (dt) {
    const S = SAN.state.S;
    if (!S || !S.cat.adopted) { C.sprite = null; return; }
    if (!C.sprite) C.init();
    const W = SAN.world;
    if (!W.area || S.player.area !== W.cur) return;
    const s = C.sprite;
    const p = W.player;
    // stays close when the player leaves
    if (Math.hypot(p.px - s.px, p.py - s.py) > 260) { C.placeNearPlayer(); }

    // mood / hunger drift
    S.cat.hunger = U.clamp(S.cat.hunger - dt * 0.045, 0, 100);
    if (S.cat.hunger < 25) S.cat.mood = U.clamp(S.cat.mood - dt * 0.02, 0, 100);

    C.timer -= dt;
    if (C.timer <= 0) {
      C.timer = 4 + Math.random() * 8;
      const roll = Math.random();
      if (S.player.area === 'home' && roll < 0.3) s.state = 'sleep';
      else if (roll < 0.5) s.state = 'sit';
      else if (roll < 0.55) s.state = 'play';
      else s.state = 'follow';
      if (s.state === 'sleep') SAN.audio.sfx('purr');
    }

    if (s.state === 'follow') {
      const d = Math.hypot(p.px - s.px, p.py - s.py);
      if (d > 46) {
        const sp = 92 * dt;
        const nx = s.px + ((p.px - s.px) / d) * Math.min(sp, d - 30);
        const ny = s.py + ((p.py - s.py) / d) * Math.min(sp, d - 30);
        if (!W.isSolid(Math.floor(nx / 16), Math.floor(ny / 16))) { s.px = nx; s.py = ny; }
        else C.placeNearPlayer();
      }
      if (d > 500) C.placeNearPlayer();
    } else if (s.state === 'wander') {
      if (!s.target || Math.hypot(s.target.x - s.px, s.target.y - s.py) < 4) {
        const tx = Math.floor(s.px / 16) + Math.round((Math.random() - 0.5) * 4);
        const ty = Math.floor(s.py / 16) + Math.round((Math.random() - 0.5) * 4);
        if (!W.isSolid(tx, ty)) s.target = { x: tx * 16 + 8, y: ty * 16 + 8 };
        else s.target = null;
      } else {
        const dx = s.target.x - s.px, dy = s.target.y - s.py;
        const d = Math.hypot(dx, dy);
        s.px += (dx / d) * 26 * dt;
        s.py += (dy / d) * 26 * dt;
      }
    }
    if (s.state === 'sleep' || s.state === 'sit') {
      // remain near the player
      if (Math.hypot(p.px - s.px, p.py - s.py) > 70) { s.state = 'follow'; }
    }
    s.x = s.px / 16; s.y = s.py / 16;
    S.cat.x = s.x; S.cat.y = s.y;
    S.cat.state = s.state;
    S.cat.mood = U.clamp(S.cat.mood, 0, 100);

    // small discoveries
    if (S.cat.trust > 25 && W.area && W.area.region === 'outdoor') {
      C.discoverTimer -= dt;
      if (C.discoverTimer <= 0) {
        C.discoverTimer = 90 + Math.random() * 120;
        const finds = ['shell', 'fiber', 'berry', 'stone', 'daisy'];
        const item = U.pick(finds);
        SAN.state.addItem(item, 1);
        SAN.ui.toast(S.cat.name + ' trots over with something in their mouth: ' + SAN.data.item(item).name, 'cat', SAN.render.itemIcon(item));
        SAN.audio.sfx('purr');
        S.cat.trust = U.clamp(S.cat.trust + 1, 0, 100);
      }
    }
  };

  C.onPlayerWalk = function () {
    const S = SAN.state.S;
    if (!S || !S.cat.adopted || !C.sprite) return;
    if (C.sprite.state === 'sleep') return;
    if (S.cat.mood > 50 && C.sprite.state === 'follow') { /* trots along */ }
  };

  C.pet = function () {
    const S = SAN.state.S;
    if (!S.cat.adopted) return;
    S.stats.catPets++;
    S.cat.mood = U.clamp(S.cat.mood + 8, 0, 100);
    S.cat.trust = U.clamp(S.cat.trust + 2, 0, 100);
    if (C.sprite) C.sprite.state = 'sit';
    SAN.audio.sfx('purr');
    const lines = [
      S.cat.name + ' leans into your hand and closes their eyes.',
      S.cat.name + ' purrs like a small warm engine.',
      S.cat.name + ' rolls over. This is a tremendous honour.',
      S.cat.name + ' blinks slowly at you. In cat, that is a whole declaration.',
    ];
    SAN.ui.toast(U.pick(lines), 'cat');
    SAN.progression.checkAchievements();
    SAN.save.autosave();
  };

  C.feed = function () {
    const S = SAN.state.S;
    const foods = SAN.state.inventoryList().filter((e) => e.def.energy);
    if (!foods.length) { SAN.ui.toast('You have no food to share. The bakery is south of the square.', 'info'); return; }
    const choice = foods[0];
    SAN.state.removeItem(choice.id, 1);
    S.cat.hunger = U.clamp(S.cat.hunger + 34, 0, 100);
    S.cat.mood = U.clamp(S.cat.mood + 10, 0, 100);
    S.cat.trust = U.clamp(S.cat.trust + 3, 0, 100);
    SAN.ui.toast(S.cat.name + ' eats the ' + choice.def.name + ' with enormous seriousness. Trust +3.', 'cat', SAN.render.itemIcon(choice.id));
    SAN.audio.sfx('purr');
    SAN.save.autosave();
  };

  C.play = function () {
    const S = SAN.state.S;
    const hasToy = SAN.state.count('yarn_ball') > 0;
    S.cat.mood = U.clamp(S.cat.mood + (hasToy ? 16 : 6), 0, 100);
    S.cat.trust = U.clamp(S.cat.trust + (hasToy ? 3 : 1), 0, 100);
    if (C.sprite) C.sprite.state = 'play';
    SAN.audio.sfx('purr');
    SAN.ui.toast(hasToy
      ? 'You roll the yarn across the floor. ' + S.cat.name + ' is not dignified about it.'
      : 'You dangle a ribbon. ' + S.cat.name + ' watches it with the gravity of a scholar.', 'cat');
    SAN.save.autosave();
  };

  C.newDay = function () {
    const S = SAN.state.S;
    if (!S.cat.adopted) return;
    S.cat.hunger = U.clamp(S.cat.hunger + 22, 0, 100);
    S.cat.trust = U.clamp(S.cat.trust + 0.5, 0, 100);
    S.cat.state = 'follow';
    if (C.sprite) C.sprite.state = 'follow';
    // cat leaves a gift on the doorstep sometimes
    if (S.cat.trust > 40 && Math.random() < 0.45) {
      const gifts = ['shell', 'daisy', 'fiber', 'forget_me_not', 'pearl'];
      const g = U.pick(gifts);
      SAN.state.addItem(g, 1);
      SAN.ui.toast('A small gift on the doorstep, from ' + S.cat.name + ': ' + SAN.data.item(g).name, 'cat', SAN.render.itemIcon(g));
    }
  };

  C.hungerLabel = function () {
    const S = SAN.state.S;
    if (!S.cat.adopted) return '';
    if (S.cat.hunger > 70) return 'content';
    if (S.cat.hunger > 40) return 'peckish';
    if (S.cat.hunger > 18) return 'hungry';
    return 'starving';
  };
})();
