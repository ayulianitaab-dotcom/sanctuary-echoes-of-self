/* Sanctuary — all interactive panels */
(function () {
  const UI = SAN.ui;
  const U = SAN.util;
  const S = () => SAN.state.S;
  const P = (UI.PANELS = {});

  const catNames = { seeds: 'Seeds', crops: 'Crops', fish: 'Fish', flowers: 'Flowers', food: 'Food', materials: 'Materials', tools: 'Tools', quest: 'Quest Items', furniture: 'Furniture', collectibles: 'Collectibles' };
  const catOrder = ['seeds', 'crops', 'flowers', 'fish', 'food', 'materials', 'tools', 'furniture', 'collectibles', 'quest'];

  function icon(id, size) {
    return `<img class="item-icon" src="${SAN.render.itemIcon(id)}" alt="" style="width:${size || 32}px;height:${size || 32}px">`;
  }
  function bar(pct, cls) {
    return `<div class="bar ${cls || ''}"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></div>`;
  }
  function moodDot(moodId) {
    const m = SAN.journal.moodDef(moodId);
    return `<span class="mood-dot" style="background:${m.color}" title="${m.label}"></span>`;
  }

  /* =========================================================
     INVENTORY
     ========================================================= */
  P.inventory = function (data) {
    let activeCat = data.cat || 'all';
    const el = UI.panel('inventory', 'Satchel', `
      <div class="inv-top">
        <div class="inv-money">${icon('stone', 18)} <b>${S().money}</b> coins</div>
        <div class="inv-cat-tabs" id="inv-tabs"></div>
      </div>
      <div class="inv-grid" id="inv-grid"></div>
      <div class="inv-empty" id="inv-empty" style="display:none">Nothing here yet. The world is generous, if you look.</div>`,
      { wide: true });

    function render() {
      const tabs = el.querySelector('#inv-tabs');
      tabs.innerHTML = '';
      ['all'].concat(catOrder).forEach((cat) => {
        const b = UI.button(cat === 'all' ? 'All' : catNames[cat], 'chip ' + (activeCat === cat ? 'active' : ''), () => {
          activeCat = cat; render();
        });
        tabs.appendChild(b);
      });
      const grid = el.querySelector('#inv-grid');
      grid.innerHTML = '';
      const list = SAN.state.inventoryList().filter((e) => activeCat === 'all' || e.def.cat === activeCat);
      list.sort((a, b) => catOrder.indexOf(a.def.cat) - catOrder.indexOf(b.def.cat));
      el.querySelector('#inv-empty').style.display = list.length ? 'none' : '';
      list.forEach((entry) => {
        const card = document.createElement('button');
        card.className = 'inv-card rarity-' + (entry.def.rarity || 'common');
        card.innerHTML = `${icon(entry.id)}<span class="inv-name">${U.esc(entry.def.name)}</span><span class="inv-qty">×${entry.qty}</span>`;
        card.addEventListener('click', () => { SAN.audio.sfx('click'); itemDetail(entry.id); });
        grid.appendChild(card);
      });
      if (!list.length) {
        grid.innerHTML = `<div class="empty-note">No ${activeCat === 'all' ? 'items' : catNames[activeCat] || 'items'} yet.</div>`;
      }
    }
    function itemDetail(id) {
      const def = SAN.data.item(id);
      const qty = SAN.state.count(id);
      const canEat = !!def.energy;
      const canPlace = !!def.placeable;
      const canSell = def.sell > 0;
      const body = `
        <div class="item-detail">
          <div class="item-detail-art">${icon(id, 72)}</div>
          <div class="item-detail-info">
            <div class="item-detail-name">${U.esc(def.name)}</div>
            <div class="item-detail-meta">${catNames[def.cat] || def.cat} · <span class="rarity-${def.rarity}">${def.rarity}</span> · ×${qty}</div>
            <p class="item-detail-desc">${U.esc(def.desc)}</p>
            ${def.energy ? `<div class="tagline">Restores ${def.energy} energy</div>` : ''}
            ${canSell ? `<div class="tagline">Sells for ${def.sell} coins</div>` : ''}
          </div>
        </div>
        <div class="item-actions">
          ${canEat ? `<button class="btn btn-primary" id="it-eat">Eat</button>` : ''}
          ${canPlace ? `<button class="btn" id="it-place">Decorate with this</button>` : ''}
          ${canSell ? `<button class="btn" id="it-sell">Sell 1 (${def.sell})</button>` : ''}
          ${canSell && qty > 1 ? `<button class="btn btn-ghost" id="it-sellall">Sell all (${def.sell * qty})</button>` : ''}
        </div>
        <p class="fineprint">Gifts can be given while talking to someone.</p>`;
      const d = UI.panel('itemdetail', def.name, body, { className: 'small-panel' });
      const eat = d.querySelector('#it-eat');
      if (eat) eat.addEventListener('click', () => { SAN.craft.eat(id); UI.closePanel('itemdetail'); render(); UI.refreshHUD(); });
      const sell = d.querySelector('#it-sell');
      if (sell) sell.addEventListener('click', () => {
        SAN.state.removeItem(id, 1); SAN.state.earn(def.sell);
        UI.closePanel('itemdetail'); render(); UI.refreshHUD();
      });
      const sellAll = d.querySelector('#it-sellall');
      if (sellAll) sellAll.addEventListener('click', () => {
        const n = SAN.state.count(id);
        SAN.state.removeItem(id, n); SAN.state.earn(def.sell * n);
        UI.closePanel('itemdetail'); render(); UI.refreshHUD();
      });
      const place = d.querySelector('#it-place');
      if (place) place.addEventListener('click', () => {
        UI.closePanel('itemdetail'); UI.closePanel('inventory');
        if (S().player.area !== 'home') { UI.toast('You can only place furniture inside your cottage.', 'info'); return; }
        P.decorate({ select: id });
      });
    }
    render();
  };

  /* =========================================================
     SHOP
     ========================================================= */
  P.shop = function (data) {
    const shopId = data.shopId || 'store';
    const shop = SAN.data.shops[shopId];
    if (!shop) return;
    let tab = 'buy';
    const lvl = S().levels.farming.lvl;
    const extra = [];
    if (shopId === 'store' && lvl >= 3) extra.push('seed_starflower');
    if (shopId === 'flower' && S().levels.exploration.lvl >= 4) extra.push('snowdrop');
    const stock = shop.stock.filter((id) => SAN.data.items[id] || id === 'plant_lavender').concat(extra);
    const el = UI.panel('shop', shop.name, `
      <p class="shop-line">${U.esc(shop.line || '')}</p>
      <div class="shop-tabs">
        <button class="chip active" data-tab="buy">Buy</button>
        <button class="chip" data-tab="sell">Sell</button>
        <span class="shop-money">${icon('stone', 16)} <b>${S().money}</b></span>
      </div>
      <div id="shop-body" class="shop-body"></div>`, { wide: true });

    function renderBuy() {
      const body = el.querySelector('#shop-body');
      body.innerHTML = `<div class="shop-grid"></div>`;
      const grid = body.querySelector('.shop-grid');
      stock.forEach((id) => {
        const def = SAN.data.item(id);
        if (!def || !def.buy) return;
        const card = document.createElement('div');
        card.className = 'shop-card';
        card.innerHTML = `${icon(id, 34)}<div class="shop-card-info"><div class="shop-card-name">${U.esc(def.name)}</div>
          <div class="shop-card-desc">${U.esc(def.desc.slice(0, 58))}${def.desc.length > 58 ? '…' : ''}</div></div>
          <div class="shop-card-buy">
            <span class="price">${def.buy}</span>
            <button class="btn btn-small" data-buy="1">Buy</button>
            <button class="btn btn-small btn-ghost" data-buy="5">×5</button>
          </div>`;
        card.querySelectorAll('[data-buy]').forEach((b) => {
          b.addEventListener('click', () => {
            const n = parseInt(b.getAttribute('data-buy'), 10);
            const cost = def.buy * n;
            if (S().money < cost) { UI.toast('Not enough coins.', 'warn'); SAN.audio.sfx('error'); return; }
            SAN.state.spend(cost);
            SAN.state.addItem(id, n);
            SAN.audio.sfx('coin');
            UI.refreshHUD();
            el.querySelector('.shop-money b').textContent = S().money;
          });
        });
        grid.appendChild(card);
      });
      if (!grid.children.length) grid.innerHTML = '<div class="empty-note">The shelves are empty today.</div>';
    }
    function renderSell() {
      const body = el.querySelector('#shop-body');
      const list = SAN.state.inventoryList().filter((e) => e.def.sell > 0);
      body.innerHTML = `<div class="shop-grid"></div>`;
      const grid = body.querySelector('.shop-grid');
      list.forEach((e) => {
        const card = document.createElement('div');
        card.className = 'shop-card';
        card.innerHTML = `${icon(e.id, 34)}<div class="shop-card-info"><div class="shop-card-name">${U.esc(e.def.name)} ×${e.qty}</div>
          <div class="shop-card-desc">Sells for ${e.def.sell}</div></div>
          <div class="shop-card-buy"><button class="btn btn-small">Sell 1</button></div>`;
        card.querySelector('button').addEventListener('click', () => {
          SAN.state.removeItem(e.id, 1); SAN.state.earn(e.def.sell);
          UI.refreshHUD(); renderSell();
        });
        grid.appendChild(card);
      });
      if (!list.length) grid.innerHTML = '<div class="empty-note">Nothing to sell. Everything you own is either precious or a memory.</div>';
    }
    el.querySelectorAll('[data-tab]').forEach((b) => {
      b.addEventListener('click', () => {
        tab = b.getAttribute('data-tab');
        el.querySelectorAll('[data-tab]').forEach((x) => x.classList.toggle('active', x === b));
        if (tab === 'buy') renderBuy(); else renderSell();
      });
    });
    renderBuy();
  };

  /* =========================================================
     JOURNAL
     ========================================================= */
  P.journal = function (data) {
    const el = UI.panel('journal', 'Journal', `
      <div class="journal-tabs">
        <button class="chip active" data-j="write">Write</button>
        <button class="chip" data-j="entries">Entries (${S().journal.length})</button>
        <button class="chip" data-j="about">Privacy</button>
      </div>
      <div id="journal-body"></div>`, { wide: true });
    const body = el.querySelector('#journal-body');

    function writeView(prefill) {
      body.innerHTML = `
        <div class="journal-paper">
          <div class="journal-date">${U.SEASONS[S().time.season]} ${S().time.day} · Year ${S().time.year} · ${U.fmtTime(S().time.minutes)}</div>
          <textarea id="j-text" class="journal-textarea" placeholder="Write whatever is actually true. No one else will read this.">${U.esc((prefill && prefill.text) || '')}</textarea>
          <div class="journal-section-label">How does today feel?</div>
          <div class="mood-row" id="mood-row">${SAN.data.moods.map((m) => `<button class="mood-chip" data-mood="${m.id}" style="--mood:${m.color}"><span class="mood-orb"></span>${m.label}</button>`).join('')}</div>
          <div class="journal-section-label">Tags (optional)</div>
          <div class="tag-row" id="tag-row">${SAN.data.journalTags.map((t) => `<button class="tag-chip" data-tag="${U.esc(t)}">${U.esc(t)}</button>`).join('')}</div>
          <div class="journal-actions">
            <button class="btn btn-primary" id="j-save">Save entry</button>
            <span class="fineprint">Private by design. Stored on this device only.</span>
          </div>
        </div>`;
      let mood = 'calm';
      const tags = new Set();
      body.querySelectorAll('[data-mood]').forEach((b) => {
        b.addEventListener('click', () => {
          mood = b.getAttribute('data-mood');
          body.querySelectorAll('[data-mood]').forEach((x) => x.classList.toggle('active', x === b));
        });
      });
      body.querySelectorAll('[data-tag]').forEach((b) => {
        b.addEventListener('click', () => {
          const t = b.getAttribute('data-tag');
          if (tags.has(t)) { tags.delete(t); b.classList.remove('active'); } else { tags.add(t); b.classList.add('active'); }
        });
      });
      body.querySelector('#j-save').addEventListener('click', () => {
        const text = body.querySelector('#j-text').value.trim();
        if (text.length < 2) { UI.toast('Write at least a few words. Even one sentence is enough.', 'warn'); return; }
        const rec = SAN.journal.save({ text, mood, tags: Array.from(tags) });
        SAN.audio.sfx('page');
        reflectionView(rec);
      });
    }

    function reflectionView(rec) {
      const r = rec.reflection;
      const m = SAN.journal.moodDef(rec.mood);
      body.innerHTML = `
        <div class="reflection">
          <div class="reflection-head">
            <span class="mood-orb big" style="background:${m.color}"></span>
            <div>
              <div class="reflection-title">A gentle thought</div>
              <div class="fineprint">${m.label} · saved privately</div>
            </div>
          </div>
          <div class="reflection-text">${U.esc(r.text).replace(/\n\n/g, '</p><p>')}</div>
          <div class="reflection-prompt">
            <div class="prompt-label">A question, if you want one</div>
            <div class="prompt-text">${U.esc(r.prompt)}</div>
          </div>
          <div class="reflection-choices">
            <button class="btn" id="r-reflect">Reflect on this feeling</button>
            ${r.activity ? `<button class="btn" id="r-activity">${U.esc(r.activity.label)}</button>` : ''}
            <button class="btn btn-primary" id="r-rest">Save this entry and rest</button>
          </div>
          <p class="fineprint disclaimer">Sanctuary is a game, not therapy. It cannot diagnose anything and does not replace professional care. You can close this at any time.</p>
        </div>`;
      body.querySelector('#r-reflect').addEventListener('click', () => {
        body.querySelector('.reflection-prompt').classList.add('pulse');
        UI.toast('Sit with the question. You do not have to answer it today.', 'info');
      });
      const act = body.querySelector('#r-activity');
      if (act) act.addEventListener('click', () => {
        const a = r.activity;
        if (a.type === 'sleep') { UI.closeAll(); SAN.actions.sleepConfirm(); return; }
        UI.closeAll();
        if (a.type === 'visit' && SAN.world.areas[a.area]) {
          UI.confirm('Go there now?', a.line, () => {
            const ar = SAN.world.areas[a.area];
            SAN.actions.enterArea(a.area, ar.spawn.x, ar.spawn.y);
          });
        }
      });
      body.querySelector('#r-rest').addEventListener('click', () => {
        UI.closeAll();
        UI.toast('Entry saved. It is yours. Nobody else has it.', 'info');
      });
    }

    function entriesView() {
      let q = '', moodFilter = '';
      const draw = () => {
        const list = SAN.journal.list({ q, mood: moodFilter });
        body.innerHTML = `
          <div class="journal-tools">
            <input id="j-search" class="text-input" placeholder="Search your entries…" value="${U.esc(q)}">
            <select id="j-mood-filter" class="text-input select">
              <option value="">All moods</option>
              ${SAN.data.moods.map((m) => `<option value="${m.id}" ${moodFilter === m.id ? 'selected' : ''}>${m.label}</option>`).join('')}
            </select>
            <button class="btn btn-small" id="j-export">Export</button>
          </div>
          <div class="entry-list">${list.length ? '' : '<div class="empty-note">No entries match. Your words are still there.</div>'}</div>`;
        const listEl = body.querySelector('.entry-list');
        list.forEach((e) => {
          const item = document.createElement('button');
          item.className = 'entry-card';
          item.innerHTML = `<div class="entry-top">${moodDot(e.mood)}<span class="entry-date">${U.SEASONS[e.season]} ${e.day}, Year ${e.year}</span>
            <span class="entry-mood">${SAN.journal.moodLabel(e.mood)}</span></div>
            <div class="entry-snippet">${U.esc(e.text.slice(0, 170))}${e.text.length > 170 ? '…' : ''}</div>
            <div class="entry-tags">${(e.tags || []).map((t) => `<span class="tag-pill">${U.esc(t)}</span>`).join('')}</div>`;
          item.addEventListener('click', () => entryDetail(e));
          listEl.appendChild(item);
        });
        body.querySelector('#j-search').addEventListener('input', (ev) => { q = ev.target.value; draw(); });
        body.querySelector('#j-mood-filter').addEventListener('change', (ev) => { moodFilter = ev.target.value; draw(); });
        body.querySelector('#j-export').addEventListener('click', exportJournal);
      };
      draw();
    }

    function entryDetail(e) {
      const r = e.reflection || {};
      const d = UI.panel('journalentry', U.SEASONS[e.season] + ' ' + e.day + ', Year ' + e.year, `
        <div class="entry-full">${U.esc(e.text).replace(/\n/g, '<br>')}</div>
        <div class="entry-meta-row">${moodDot(e.mood)} ${SAN.journal.moodLabel(e.mood)} · ${U.fmtTime(e.minutes)}
          ${(e.tags || []).map((t) => `<span class="tag-pill">${U.esc(t)}</span>`).join('')}</div>
        ${r.text ? `<div class="entry-reflection"><div class="prompt-label">What Sanctuary said</div><p>${U.esc(r.text).replace(/\n\n/g, '</p><p>')}</p>
          <div class="prompt-label">Prompt</div><p class="prompt-text">${U.esc(r.prompt || '')}</p></div>` : ''}
        <div class="item-actions">
          <button class="btn btn-ghost" id="j-del">Delete this entry</button>
        </div>`, { className: 'medium-panel' });
      d.querySelector('#j-del').addEventListener('click', () => {
        UI.confirm('Delete this entry?', 'This removes it from this device permanently. You cannot undo it.', () => {
          SAN.journal.remove(e.id);
          UI.closePanel('journalentry');
          UI.refreshPanel('journal');
        });
      });
    }

    function exportJournal() {
      const text = SAN.journal.exportData();
      try {
        const blob = new Blob([text], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'sanctuary-journal.json';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        UI.toast('Journal exported to a file on your device.', 'save');
      } catch (err) {
        UI.toast('Export failed in this browser.', 'warn');
      }
    }

    function aboutView() {
      body.innerHTML = `
        <div class="journal-paper">
          <h3 class="paper-title">Your private pages</h3>
          <p>Journal entries and Memory Vault notes are stored only in this browser's local storage. They are never uploaded, sent to a server, or included in save exports unless you use the journal export button.</p>
          <p>Sanctuary uses a local, rule-based reflection engine. No AI service receives your writing. There is an optional setting for AI-assisted reflections, and it is off by default — even when enabled, nothing is sent unless you explicitly consent per entry.</p>
          <p>You can delete any entry or memory at any time. You can export everything and keep your own copy.</p>
          <p class="soft">Sanctuary is a game. It is not a therapist, a diagnosis, or a treatment. If you are struggling, please talk to a real person — a friend, a counsellor, or a local crisis line. You deserve support that can actually hold you.</p>
          <div class="journal-actions">
            <button class="btn btn-ghost" id="j-export2">Export journal + memories</button>
            <button class="btn btn-ghost" id="j-delall">Delete all entries</button>
          </div>
        </div>`;
      body.querySelector('#j-export2').addEventListener('click', exportJournal);
      body.querySelector('#j-delall').addEventListener('click', () => {
        UI.confirm('Delete every journal entry?', 'All ' + S().journal.length + ' entries will be removed from this device.', () => {
          S().journal = [];
          UI.refreshPanel('journal');
        });
      });
    }

    el.querySelectorAll('[data-j]').forEach((b) => {
      b.addEventListener('click', () => {
        el.querySelectorAll('[data-j]').forEach((x) => x.classList.toggle('active', x === b));
        const t = b.getAttribute('data-j');
        if (t === 'write') writeView();
        else if (t === 'entries') entriesView();
        else aboutView();
      });
    });

    if (data.entryId) entriesView(); else writeView();
  };

  /* =========================================================
     MEMORY VAULT
     ========================================================= */
  P.memories = function (data) {
    const el = UI.panel('memories', 'The Memory Vault', `
      <p class="vault-intro">Some things cannot be carried in your hands. Here they can be set down, watered, or left entirely alone. Nothing in this room is compulsory.</p>
      <div class="vault-tabs">
        <button class="chip active" data-v="garden">Memory garden</button>
        <button class="chip" data-v="new">Set down a new memory</button>
      </div>
      <div id="vault-body"></div>`, { wide: true });
    const body = el.querySelector('#vault-body');

    function gardenView() {
      const list = S().memories;
      if (!list.length) {
        body.innerHTML = `<div class="vault-empty">
          <div class="vault-stone-art">🪨</div>
          <p>The garden is quiet. There are no stones here yet.</p>
          <p class="fineprint">You can add a memory whenever you want. You never have to.</p>
          <button class="btn btn-primary" id="v-add">Set down a memory</button>
        </div>`;
        body.querySelector('#v-add').addEventListener('click', () => createView());
        return;
      }
      body.innerHTML = `<div class="memory-grid">${list.map((m) => {
        const p = m.progress;
        const stage = SAN.memory.stageName(p);
        return `<button class="memory-card" data-mem="${m.id}">
          <div class="memory-art stage-${p}">
            <span class="mem-stone">${p === 0 ? '🪨' : p === 1 ? '🌱' : p === 2 ? '🌿' : p === 3 ? '🌷' : p === 4 ? '🌸' : '✨'}</span>
            ${p >= 3 ? '<span class="mem-bloom b1">✿</span><span class="mem-bloom b2">✿</span>' : ''}
          </div>
          <div class="memory-title">${U.esc(m.title)}</div>
          <div class="memory-emotion">${U.esc(m.emotion)}</div>
          <div class="memory-stage">${U.esc(stage)}</div>
          <div class="memory-bar">${bar(p * 20)}</div>
        </button>`;
      }).join('')}</div>`;
      body.querySelectorAll('[data-mem]').forEach((b) => {
        b.addEventListener('click', () => detailView(SAN.memory.get(b.getAttribute('data-mem'))));
      });
    }

    function createView() {
      body.innerHTML = `
        <div class="journal-paper">
          <h3 class="paper-title">A symbolic stone</h3>
          <p class="fineprint">Give it a name only you need to understand. You can delete it later, or never look at it again.</p>
          <label class="field-label">A title</label>
          <input class="text-input" id="m-title" maxlength="60" placeholder="e.g. The year I could not ask for help">
          <label class="field-label">A few words, if you want</label>
          <textarea class="journal-textarea small" id="m-desc" maxlength="700" placeholder="You do not have to explain it. Symbols count."></textarea>
          <label class="field-label">What does it feel like?</label>
          <div class="tag-row" id="m-emotions">${SAN.data.memoryEmotions.map((e, i) => `<button class="tag-chip ${i === 0 ? 'active' : ''}" data-emo="${e}">${e}</button>`).join('')}</div>
          <label class="field-label">What shape does it take?</label>
          <div class="tag-row" id="m-objects">${SAN.data.memoryObjects.map((o, i) => `<button class="tag-chip ${i === 0 ? 'active' : ''}" data-obj="${o.id}">${o.name}</button>`).join('')}</div>
          <div class="journal-actions">
            <button class="btn btn-primary" id="m-create">Set it down</button>
            <button class="btn btn-ghost" id="m-cancel">Not now</button>
          </div>
        </div>`;
      let emo = SAN.data.memoryEmotions[0], obj = SAN.data.memoryObjects[0].id;
      body.querySelectorAll('[data-emo]').forEach((b) => b.addEventListener('click', () => {
        emo = b.getAttribute('data-emo');
        body.querySelectorAll('[data-emo]').forEach((x) => x.classList.toggle('active', x === b));
      }));
      body.querySelectorAll('[data-obj]').forEach((b) => b.addEventListener('click', () => {
        obj = b.getAttribute('data-obj');
        body.querySelectorAll('[data-obj]').forEach((x) => x.classList.toggle('active', x === b));
      }));
      body.querySelector('#m-cancel').addEventListener('click', gardenView);
      body.querySelector('#m-create').addEventListener('click', () => {
        const title = body.querySelector('#m-title').value.trim();
        if (!title) { UI.toast('It needs a name, even a small one.', 'warn'); return; }
        SAN.memory.create({ title, desc: body.querySelector('#m-desc').value.trim(), emotion: emo, object: obj });
        UI.toast('The stone is here now. It can stay as it is.', 'memory');
        gardenView();
      });
    }

    function detailView(m) {
      if (!m) return;
      const actions = SAN.data.memoryCare;
      const canCare = m.lastCareDay !== S().time.day;
      const d = UI.panel('memorydetail', m.title, `
        <div class="memory-detail-art stage-${m.progress}">
          <span>${m.progress === 0 ? '🪨' : m.progress === 1 ? '🌱' : m.progress === 2 ? '🌿' : m.progress === 3 ? '🌷' : m.progress === 4 ? '🌸' : '✨'}</span>
        </div>
        <div class="memory-detail-meta">${U.esc(m.emotion)} · ${U.esc(SAN.memory.stageName(m.progress))}</div>
        <p class="memory-desc">${U.esc(m.desc || 'You did not write anything. That is allowed.')}</p>
        <p class="memory-stage-desc">${SAN.memory.stageDesc(m.progress)}</p>
        <div class="memory-prompt">
          <div class="prompt-label">A question you may ignore</div>
          <div class="prompt-text">${U.esc(SAN.data.reflectPrompts[m.progress % SAN.data.reflectPrompts.length])}</div>
        </div>
        <div class="journal-section-label">${canCare ? 'You can spend a moment here' : 'You have already visited this today'}</div>
        <div class="care-grid">
          ${actions.map((a) => `<button class="btn btn-ghost care-btn" data-care="${a.id}" ${canCare ? '' : 'disabled'}>${a.label}</button>`).join('')}
        </div>
        <div class="item-actions">
          <button class="btn btn-ghost" id="mem-del">Let this stone go</button>
          <button class="btn" id="mem-close">Close</button>
        </div>
        <p class="fineprint">You can skip, pause, or close this at any time. You never have to revisit anything.</p>`,
        { className: 'medium-panel' });
      d.querySelectorAll('[data-care]').forEach((b) => {
        b.addEventListener('click', () => {
          const res = SAN.memory.care(m.id, b.getAttribute('data-care'));
          if (!res.ok) { UI.toast(res.msg, 'info'); return; }
          SAN.ui.closePanel('memorydetail');
          UI.dialogue({
            pages: [
              { speaker: 'narrator', text: res.line },
              { speaker: 'narrator', text: res.stage + '. ' + SAN.memory.stageDesc(res.progress) },
            ],
            choices: [{ label: 'Sit a moment longer', cb: () => detailView(m) }, { label: 'Return to the garden', cb: () => {} }],
          });
        });
      });
      const del = d.querySelector('#mem-del');
      del.addEventListener('click', () => {
        UI.confirm('Let this stone go?', 'It will be removed from your garden on this device. This cannot be undone.', () => {
          SAN.memory.delete(m.id);
          UI.closePanel('memorydetail');
          UI.refreshPanel('memories');
          UI.toast('The stone is gone. The garden is still yours.', 'info');
        });
      });
      d.querySelector('#mem-close').addEventListener('click', () => UI.closePanel('memorydetail'));
    }

    el.querySelectorAll('[data-v]').forEach((b) => {
      b.addEventListener('click', () => {
        el.querySelectorAll('[data-v]').forEach((x) => x.classList.toggle('active', x === b));
        if (b.getAttribute('data-v') === 'new') createView(); else gardenView();
      });
    });
    gardenView();
  };

  /* =========================================================
     RELATIONSHIPS
     ========================================================= */
  P.relations = function () {
    const el = UI.panel('relations', 'People of Sanctuary', `
      <p class="panel-intro">Friendship here only grows. Missing a day costs you nothing.</p>
      <div class="rel-grid"></div>`, { wide: true });
    const grid = el.querySelector('.rel-grid');
    SAN.data.npcOrder.forEach((id) => {
      const npc = SAN.data.npcs[id];
      const f = SAN.rel.get(id);
      const tier = SAN.data.friendTier(f.pts);
      const card = document.createElement('button');
      card.className = 'rel-card';
      const rstage = SAN.romance && SAN.romance.romanceable(id) ? SAN.romance.stage(id) : null;
      const raff = SAN.romance ? SAN.romance.affection(id) : 0;
      const romantic = rstage && ['interest', 'dating', 'committed', 'partner'].indexOf(rstage.id) >= 0;
      card.innerHTML = `
        <div class="rel-portrait">${SAN.render.portraitImg(id)}</div>
        <div class="rel-info">
          <div class="rel-name">${U.esc(npc.name)}</div>
          <div class="rel-title">${U.esc(npc.title)}</div>
          <div class="rel-tier">${f.met ? tier.name : 'Not yet met'}${romantic ? ' · ' + rstage.name : ''}</div>
          <div class="rel-bar">${bar(f.pts)}</div>
          <div class="rel-pts">${f.pts} / 100 friendship</div>
          ${romantic ? `<div class="rel-pts rom-aff">${raff} / 100 affection</div>` : ''}
        </div>`;
      card.addEventListener('click', () => relDetail(id));
      grid.appendChild(card);
    });
  };

  function relDetail(id) {
    const npc = SAN.data.npcs[id];
    const f = SAN.rel.get(id);
    const tier = SAN.data.friendTier(f.pts);
    const knowsTastes = f.pts >= 21;
    const S_ = SAN.state.S;
    const nearby = (SAN.world.npcs || []).find((n) => n.def.id === id);
    const here = nearby ? SAN.world.area.name : (SAN.world.areas[npc.homeArea] || {}).name || 'Somewhere in Sanctuary';
    const doing = nearby ? (nearby.act || 'going about their day') : 'away from the path';
    const milestones = ((SAN.data.npcLife[id] || {}).milestones) || {};
    const reached = Object.keys(milestones).map(Number).filter((n) => f.pts >= n).sort((a, b) => a - b);
    const next = Object.keys(milestones).map(Number).filter((n) => f.pts < n).sort((a, b) => a - b)[0];
    const d = UI.panel('reldetail', npc.name, `
      <div class="rel-detail-head">
        <div class="rel-detail-portrait">${SAN.render.npcFullBodyImg(id)}</div>
        <div class="rel-detail-text">
          <div class="rel-name big">${U.esc(npc.name)}</div>
          <div class="rel-title">${U.esc(npc.title)}${npc.age ? ' · ' + npc.age : ''}</div>
          <div class="rel-tier">${tier.name} · ${f.pts}/100</div>
          ${bar(f.pts)}
        </div>
      </div>
      <p class="rel-bio">${U.esc(npc.bio)}</p>
      <p class="rel-personality">${U.esc(npc.personality)}</p>
      <div class="rel-where">
        <span class="rel-where-dot"></span>
        <span><b>${U.esc(here)}</b> · ${U.esc(doing)}</span>
      </div>
      <div class="rel-milestones">
        <div class="prompt-label">Moments you have shared</div>
        <div class="ms-track">${Object.keys(milestones).map((k) => `<span class="ms-pip ${f.pts >= Number(k) ? 'on' : ''}" title="${Number(k)} friendship">${f.pts >= Number(k) ? '✦' : '·'}</span>`).join('')}</div>
        <div class="fineprint">${reached.length ? reached.length + ' of ' + Object.keys(milestones).length + ' milestone scenes unlocked' : 'No milestone scenes yet'}${next ? ' · next at ' + next + ' friendship' : ''}</div>
      </div>
      <div class="likes-box">
        <div class="prompt-label">${knowsTastes ? 'Loves' : 'You do not know their tastes yet'}</div>
        <div class="likes-list">${knowsTastes ? (npc.loves || []).map((i) => `<span class="tag-pill">${U.esc(SAN.data.item(i).name)}</span>`).join('') : '<span class="fineprint">Talk with them more. People reveal themselves slowly.</span>'}</div>
      </div>
      ${romanceDetailHTML(id)}
      <div class="fineprint">Friendship never decays — the village is not keeping score. Gifts: ${f.giftsToday || 0}/2 today.</div>`,
      { className: 'medium-panel' });
    attachRomanceButtons(d, id);
  }

  function romanceDetailHTML(id) {
    if (!SAN.romance || !SAN.romance.romanceable(id)) return '';
    const npc = SAN.data.npcs[id];
    const def = SAN.romance.def(id);
    const st = SAN.romance.state(id);
    const stage = SAN.romance.stage(id);
    const aff = SAN.romance.affection(id);
    const memories = (st.memories || []).slice(-5).reverse();
    const unlocked = Object.keys(st.events || {}).filter((k) => st.events[k] && k.indexOf('anniversary') < 0);
    const out = [];
    out.push('<div class="prompt-label">Relationship</div>');
    out.push(`<div class="rom-head"><span class="rom-stage">${stage.name}</span><span class="rom-aff-num">affection ${aff} / 100</span></div>`);
    out.push(bar(aff, 'rom'));
    out.push(`<div class="fineprint">${U.esc(SAN.romance.nextStep(id))}</div>`);
    if (def && def.boundaries && def.boundaries.note && SAN.romance.stageIndex(id) >= 3) {
      out.push(`<div class="rom-boundary"><b>Their boundary</b> · ${U.esc(def.boundaries.note)}</div>`);
    }
    out.push('<div class="rom-actions"></div>');
    out.push('<div class="prompt-label">Memories</div>');
    out.push(memories.length
      ? '<div class="rom-memories">' + memories.map((m) => `<div class="rom-memory"><span class="rom-memory-day">Day ${m.day}</span> ${U.esc(m.text)}</div>`).join('') + '</div>'
      : '<div class="fineprint">Nothing shared yet. Start with a walk.</div>');
    const hist = (st.history || []).slice(-3).reverse();
    if (hist.length) {
      out.push('<div class="prompt-label">History</div>');
      out.push('<div class="rom-memories">' + hist.map((m) => `<div class="rom-memory"><span class="rom-memory-day">Day ${m.day}</span> ${U.esc(m.text)}</div>`).join('') + '</div>');
    }
    out.push('<div class="prompt-label">Events</div><div class="rom-events">' +
      ['friend', 'story', 'date', 'commit', 'anniversary'].map((k) => {
        const on = unlocked.indexOf(k) >= 0 || (k === 'anniversary' && st.accepted);
        return `<span class="tag-pill ${on ? 'on' : ''}">${k}</span>`;
      }).join('') + '</div>');
    return out.join('');
  }

  function attachRomanceButtons(el, id) {
    const host = el.querySelector('.rom-actions');
    if (!host) return;
    const mk = (label, cb) => {
      const b = document.createElement('button');
      b.className = 'btn small';
      b.textContent = label;
      b.addEventListener('click', cb);
      host.appendChild(b);
    };
    const nearby = (SAN.world.npcs || []).some((n) => n.def.id === id);
    if (nearby) mk('Spend time together', () => { UI.closeAll(); UI.openPanel('romance', { npcId: id }); });
    if (SAN.romance.canConfess(id)) mk('Tell them how you feel', () => { UI.closeAll(); SAN.romance.confess(id); });
    if (SAN.romance.canCommit(id)) mk('Ask them to commit', () => { UI.closeAll(); SAN.romance.commit(id); });
    if (SAN.romance.canPartner(id)) mk('Ask them to share your life', () => { UI.closeAll(); SAN.romance.propose(id); });
    if (!host.children.length) {
      const note = document.createElement('div');
      note.className = 'fineprint';
      note.textContent = 'Find them in Sanctuary to spend time together.';
      host.appendChild(note);
    }
  }

  P.romance = function (data) {
    const npc = SAN.data.npcs[data.npcId];
    if (!npc) return;
    const def = SAN.romance.def(npc.id);
    const st = SAN.romance.state(npc.id);
    const stage = SAN.romance.stage(npc.id);
    const aff = SAN.romance.affection(npc.id);
    const acts = SAN.romance.activities(npc.id);
    const el = UI.panel('romance', 'Time with ' + npc.name, `
      <div class="rom-panel-head">
        <div class="rom-panel-portrait">${SAN.render.portraitImg(npc.id)}</div>
        <div class="rom-panel-meta">
          <div class="rel-name">${U.esc(npc.name)}</div>
          <div class="rel-title">${U.esc(npc.title)}</div>
          <div class="rom-head"><span class="rom-stage">${stage.name}</span><span class="rom-aff-num">affection ${aff} / 100</span></div>
          ${bar(aff, 'rom')}
          <div class="fineprint">${U.esc(SAN.romance.nextStep(npc.id))}</div>
        </div>
      </div>
      <p class="panel-intro">Everything here is a question. If they say no, nothing is lost — not a point, not a day, not the friendship.</p>
      <div class="rom-act-list"></div>
      ${def && def.boundaries && def.boundaries.note ? `<div class="rom-boundary"><b>Their boundary</b> · ${U.esc(def.boundaries.note)}</div>` : ''}
      ${(st.memories || []).length ? `<div class="prompt-label">Recent memories</div><div class="rom-memories">${(st.memories || []).slice(-4).reverse().map((m) => `<div class="rom-memory"><span class="rom-memory-day">Day ${m.day}</span> ${U.esc(m.text)}</div>`).join('')}</div>` : ''}
    `, { className: 'medium-panel' });
    const list = el.querySelector('.rom-act-list');
    acts.forEach((a) => {
      const b = document.createElement('button');
      b.className = 'rom-act' + (a.ok ? '' : ' off');
      b.innerHTML = `<span class="rom-act-ico">${a.icon}</span>
        <span class="rom-act-text"><b>${U.esc(a.label)}</b><small>${U.esc(a.ok ? a.blurb : a.why)}</small></span>
        <span class="rom-act-gain">${a.ok ? '+' + a.computedGain : ''}</span>`;
      b.addEventListener('click', () => {
        if (!a.ok) { SAN.romance.refuse(npc.id, a.why); return; }
        UI.closePanel('romance');
        SAN.romance.perform(npc.id, a.id);
      });
      list.appendChild(b);
    });
    const giftId = SAN.romance.romanticGiftId();
    if (giftId) {
      const g = document.createElement('div');
      g.className = 'fineprint';
      g.textContent = 'Romantic gifts in your satchel: ' + SAN.data.item(giftId).name;
      el.querySelector('.panel-body').appendChild(g);
    }
  };
  /* =========================================================
     MAP
     ========================================================= */
  P.map = function () {
    const NODES = {
      meadow: { x: 50, y: 8, label: 'Hidden Meadow' },
      forest: { x: 50, y: 26, label: 'Memory Forest' },
      greenhouse: { x: 18, y: 20, label: 'Greenhouse' },
      garden: { x: 18, y: 40, label: 'The Garden' },
      village: { x: 50, y: 46, label: 'Village' },
      windmill: { x: 80, y: 38, label: 'Windmill' },
      beach: { x: 49, y: 68, label: 'The Shore' },
      lighthouse: { x: 78, y: 74, label: 'Lighthouse' },
      home: { x: 33, y: 58, label: 'Your Cottage' },
    };
    const S_ = S();
    const groveOpen = !!(S_.world && S_.world.groveOpen);
    if (groveOpen) NODES.grove = { x: 36, y: 12, label: 'Hidden Grove' };
    const LINKS = [['village', 'forest'], ['village', 'garden'], ['village', 'windmill'], ['village', 'beach'], ['beach', 'lighthouse'], ['garden', 'greenhouse'], ['forest', 'meadow'], ['home', 'village']];
    if (groveOpen) LINKS.push(['forest', 'grove']);
    let html = '<div class="map-canvas">';
    html += '<svg class="map-lines" viewBox="0 0 100 100" preserveAspectRatio="none">' +
      LINKS
        .map(([a, b]) => `<line x1="${NODES[a].x}" y1="${NODES[a].y}" x2="${NODES[b].x}" y2="${NODES[b].y}" />`).join('') +
      '</svg>';
    Object.keys(NODES).forEach((id) => {
      const n = NODES[id];
      const areaId = id === 'home' ? 'home' : id;
      const found = !!S_.discovered[areaId];
      const locked = id === 'meadow' && !S_.unlocked.meadow;
      const questHere = SAN.quests.activeList().some((q) => SAN.quests.locationHint(q.def).toLowerCase().includes((SAN.world.areas[areaId] || {}).name ? SAN.world.areas[areaId].name.toLowerCase() : '§'));
      const inArea = SAN.world.cur === areaId;
      html += `<button class="map-node ${found ? 'found' : 'unknown'} ${locked ? 'locked' : ''} ${inArea ? 'current' : ''}"
        style="left:${n.x}%;top:${n.y}%" data-area="${areaId}" ${found && !locked ? '' : 'disabled'}>
        <span class="map-node-icon">${locked ? '🔒' : found ? (inArea ? '◉' : '◈') : '?'}</span>
        <span class="map-node-label">${found ? U.esc(SAN.world.areas[areaId].name) : 'Undiscovered'}</span>
        ${questHere ? '<span class="map-quest">!</span>' : ''}
      </button>`;
    });
    html += '</div>';
    html += `<p class="fineprint map-hint">Click a discovered place to walk there. ${S_.unlocked.meadow ? '' : 'The meadow is hidden until you have explored more of Sanctuary.'}</p>`;
    const el = UI.panel('map', 'Map of Sanctuary', html, { wide: true, className: 'map-panel' });
    el.querySelectorAll('[data-area]').forEach((b) => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-area');
        if (id === 'meadow' && !S_.unlocked.meadow) return;
        const a = SAN.world.areas[id];
        UI.closeAll();
        SAN.actions.enterArea(id, a.spawn.x, a.spawn.y);
      });
    });
  };

  /* =========================================================
     QUESTS
     ========================================================= */
  P.quests = function () {
    const active = SAN.quests.activeList();
    const story = active.filter((q) => q.def.type === 'story' || q.def.type === 'main');
    const side = active.filter((q) => q.def.type === 'side');
    const daily = active.filter((q) => q.def.type === 'daily');
    const done = Object.keys(S().quests.completed).length;

    const questCard = (q) => {
      const objs = SAN.quests.objectiveList(q.id);
      return `<div class="quest-card ${SAN.quests.isComplete(q.id) ? 'ready' : ''}">
        <div class="quest-head">
          <div class="quest-title">${U.esc(q.def.title)}</div>
          <div class="quest-where">${U.esc(SAN.quests.locationHint(q.def))}</div>
        </div>
        <p class="quest-desc">${U.esc(q.def.desc)}</p>
        <div class="quest-objs">${objs.map((o) => `<div class="quest-obj ${o.done ? 'done' : ''}">
          <span class="q-check">${o.done ? '✓' : '○'}</span>${U.esc(o.label)} <span class="q-count">${o.cur}/${o.need}</span></div>`).join('')}</div>
        ${SAN.quests.isComplete(q.id) ? `<div class="quest-ready">Ready — talk to ${q.def.giver === 'board' ? 'the bulletin board' : U.esc((SAN.data.npcs[q.def.giver] || {}).name || 'them')}.</div>` : ''}
      </div>`;
    };

    UI.panel('quests', 'Quests', `
      <div class="quest-summary">${done} completed · ${active.length} open</div>
      ${story.length ? `<div class="quest-section-title">Story</div>${story.map(questCard).join('')}` : ''}
      ${side.length ? `<div class="quest-section-title">Personal & side</div>${side.map(questCard).join('')}` : ''}
      ${daily.length ? `<div class="quest-section-title">Village board</div>${daily.map(questCard).join('')}` : ''}
      ${!active.length ? '<div class="empty-note">Nothing pressing. That is allowed. Wander, plant, talk to someone.</div>' : ''}
    `, { wide: true });
  };

  P.board = function () {
    SAN.quests.refreshBoard();
    const S_ = S();
    const el = UI.panel('board', 'Village Bulletin Board', `
      <p class="panel-intro">Handwritten notes, pinned at helpful angles. Take what you can carry. Nobody is keeping score.</p>
      <div class="board-list"></div>
      <div class="quest-section-title">Ready to hand in</div>
      <div class="board-ready"></div>`, { wide: true });
    const list = el.querySelector('.board-list');
    S_.quests.board.forEach((b, i) => {
      const card = document.createElement('div');
      card.className = 'board-card' + (b.taken ? ' taken' : '');
      const need = Object.keys(b.need)[0];
      card.innerHTML = `<div class="board-note">
        <div class="board-text">${U.esc(b.text)}</div>
        <div class="board-req">Needs: ${U.esc(SAN.data.item(need).name)} ×${b.need[need]} · Pays ${b.money} coins</div>
      </div>
      <button class="btn btn-small" ${b.taken ? 'disabled' : ''}>${b.taken ? 'Taken' : 'Accept'}</button>`;
      if (!b.taken) card.querySelector('button').addEventListener('click', () => { SAN.quests.acceptBoard(i); P.board(); });
      list.appendChild(card);
    });
    const ready = el.querySelector('.board-ready');
    const rl = SAN.quests.boardReady();
    if (!rl.length) ready.innerHTML = '<div class="fineprint">Nothing to hand in yet.</div>';
    rl.forEach((q) => {
      const row = document.createElement('div');
      row.className = 'board-card';
      row.innerHTML = `<div class="board-note"><div class="board-text">${U.esc(q.def.title)}</div>
        <div class="board-req">Ready — ${q.def.rewards.money} coins</div></div>
        <button class="btn btn-small btn-primary">Hand in</button>`;
      row.querySelector('button').addEventListener('click', () => {
        SAN.quests.turnIn(q.id);
        P.board();
      });
      ready.appendChild(row);
    });
  };

  /* =========================================================
     COLLECTION / ACHIEVEMENTS
     ========================================================= */
  P.collection = function () {
    const el = UI.panel('collection', 'Collections', `
      <div class="collection-tabs">
        <button class="chip active" data-c="fish">Fish</button>
        <button class="chip" data-c="flowers">Flowers & crops</button>
        <button class="chip" data-c="items">Everything</button>
        <button class="chip" data-c="achievements">Achievements</button>
        <button class="chip" data-c="discoveries">Discoveries</button>
      </div>
      <div id="coll-body"></div>`, { wide: true });
    const body = el.querySelector('#coll-body');
    function render(tab) {
      const S_ = S();
      if (tab === 'fish') {
        const all = Object.values(SAN.data.fish);
        body.innerHTML = `<p class="panel-intro">You have caught ${S_.stats.fishCaught} fish. Rare waters remember patience.</p>
        <div class="coll-grid">${all.map((f) => `<div class="coll-card ${S_.flags['seen_' + f.id] ? '' : ''}">
          ${icon(f.id, 30)}<div class="coll-name">${U.esc(f.name)}</div>
          <div class="coll-meta">${f.size} · difficulty ${Math.round(f.diff * 100)}</div>
          <div class="coll-meta">${f.areas.map((a) => (SAN.world.areas[a] || {}).name || a).join(', ')}</div>
          <div class="coll-meta">${f.time === 'any' ? 'any time' : f.time} · ${f.weather === 'any' ? 'any weather' : f.weather}</div>
        </div>`).join('')}</div>`;
      } else if (tab === 'flowers') {
        const list = ['lavender', 'marigold', 'moonpetal', 'sunrose', 'bluebell', 'starflower', 'pumpkin', 'carrot', 'daisy', 'forget_me_not', 'wild_lavender', 'wild_rose', 'snowdrop'];
        body.innerHTML = `<p class="panel-intro">Crops harvested: ${S_.stats.cropsHarvested}. The garden keeps its own records.</p>
        <div class="coll-grid">${list.map((id) => `<div class="coll-card">${icon(id, 30)}<div class="coll-name">${U.esc(SAN.data.item(id).name)}</div>
          <div class="coll-meta">${SAN.data.item(id).cat}</div></div>`).join('')}</div>`;
      } else if (tab === 'items') {
        const list = SAN.data.itemList.filter((id) => SAN.data.item(id).cat !== 'quest');
        body.innerHTML = `<div class="coll-grid">${list.map((id) => `<div class="coll-card">${icon(id, 30)}<div class="coll-name">${U.esc(SAN.data.item(id).name)}</div>
          <div class="coll-meta">${SAN.data.item(id).cat}</div></div>`).join('')}</div>`;
      } else if (tab === 'discoveries') {
        const found = Object.keys(S_.discoveries || {});
        const all = Object.keys(SAN.data.secrets || {});
        body.innerHTML = `<p class="panel-intro">${found.length} of ${all.length} discoveries. Sanctuary keeps its quiet things in plain sight.</p>
        <div class="discovery-list">${all.map((id) => {
          const sec = SAN.data.secrets[id];
          const got = S_.discoveries && S_.discoveries[id];
          return `<div class="discovery-card ${got ? 'found' : 'unknown'}">
            <div class="discovery-mark">${got ? '✿' : '·'}</div>
            <div class="discovery-body"><div class="discovery-name">${got ? U.esc(sec.name) : 'Undiscovered'}</div>
            <div class="discovery-text">${got ? U.esc(sec.text) : 'Somewhere in Sanctuary, waiting to be noticed.'}</div>
            ${got ? `<div class="discovery-date">${U.SEASONS[got.season]} ${got.day}, Year ${got.year}</div>` : ''}</div>
          </div>`;
        }).join('')}</div>`;
      } else {
        body.innerHTML = `<div class="ach-grid">${SAN.data.achievements.map((a) => {
          const got = S_.achievements[a.id];
          return `<div class="ach-card ${got ? 'earned' : ''}">
            <div class="ach-icon">${got ? '✿' : '·'}</div>
            <div class="ach-name">${U.esc(a.name)}</div>
            <div class="ach-desc">${U.esc(a.desc)}</div>
            ${got ? `<div class="ach-date">${U.SEASONS[got.season]} ${got.day}, Year ${got.year}</div>` : ''}
          </div>`;
        }).join('')}</div>`;
      }
    }
    el.querySelectorAll('[data-c]').forEach((b) => {
      b.addEventListener('click', () => {
        el.querySelectorAll('[data-c]').forEach((x) => x.classList.toggle('active', x === b));
        render(b.getAttribute('data-c'));
      });
    });
    render('fish');
  };

  /* =========================================================
     PHOTO ALBUM
     ========================================================= */
  P.photos = function (data) {
    const S_ = S();
    const tab = data.tab || 'photos';
    const el = UI.panel('photos', 'Photo Album', `
      <div class="collection-tabs">
        <button class="chip ${tab === 'photos' ? 'active' : ''}" data-ph="photos">Photographs (${S_.photos.length})</button>
        <button class="chip ${tab === 'challenges' ? 'active' : ''}" data-ph="challenges">Challenges</button>
        <button class="chip" data-ph="camera">Open camera</button>
      </div>
      <div id="ph-body"></div>`, { wide: true });
    const body = el.querySelector('#ph-body');
    function render(which) {
      if (which === 'challenges') {
        const list = SAN.photos.challengeList();
        const done = list.filter((c) => c.done).length;
        body.innerHTML = `<p class="panel-intro">${done} of ${list.length} photographs found. The camera is in your satchel; press P anywhere in the world.</p>
          <div class="challenge-list">${list.map((c) => `<div class="challenge-card ${c.done ? 'done' : ''}">
            <div class="challenge-mark">${c.done ? '✓' : '○'}</div>
            <div><div class="challenge-name">${U.esc(c.name)}</div>
            <div class="challenge-desc">${U.esc(c.desc)}</div></div>
            <div class="challenge-reward">${c.reward} ◈</div>
          </div>`).join('')}</div>`;
        return;
      }
      if (!S_.photos.length) {
        body.innerHTML = `<div class="empty-note">No photographs yet. Open the camera with P, or from the menu, and keep the things you want to remember.</div>`;
        return;
      }
      body.innerHTML = `<div class="photo-grid">${S_.photos.map((p) => `
        <button class="photo-thumb" data-photo="${p.id}">
          <img src="${p.data}" alt="">
          <span class="photo-thumb-meta">${U.esc(p.areaName)} · Day ${p.day}</span>
          ${p.caption ? `<span class="photo-thumb-cap">${U.esc(p.caption)}</span>` : ''}
        </button>`).join('')}</div>`;
      body.querySelectorAll('[data-photo]').forEach((b) => {
        b.addEventListener('click', () => P.photoView(b.getAttribute('data-photo')));
      });
    }
    el.querySelectorAll('[data-ph]').forEach((b) => {
      b.addEventListener('click', () => {
        const which = b.getAttribute('data-ph');
        if (which === 'camera') { UI.closeAll(); SAN.photos.open(); return; }
        el.querySelectorAll('[data-ph]').forEach((x) => x.classList.toggle('active', x === b));
        render(which);
      });
    });
    render(tab);
  };

  P.photoView = function (id) {
    const S_ = S();
    const photo = S_.photos.find((p) => p.id === id);
    if (!photo) return;
    const el = UI.panel('photoview', 'Photograph', `
      <div class="photo-view">
        <img src="${photo.data}" alt="">
        <div class="photo-view-meta">${U.esc(photo.areaName)} · ${SAN.photos.timeLabel(photo)} · ${U.esc(photo.weather)}</div>
        <input class="photo-caption" id="pv-caption" maxlength="60" value="${U.esc(photo.caption || '')}" placeholder="caption this moment">
        <div class="photo-view-actions">
          <button class="btn btn-small" id="pv-save">Save caption</button>
          <button class="btn btn-small btn-ghost" id="pv-del">Delete</button>
          <button class="btn btn-small btn-ghost" id="pv-close">Close</button>
        </div>
      </div>`, { className: 'photo-panel' });
    el.querySelector('#pv-save').addEventListener('click', () => {
      SAN.photos.setCaption(photo.id, el.querySelector('#pv-caption').value);
      UI.toast('Caption saved.', 'save');
    });
    el.querySelector('#pv-del').addEventListener('click', () => {
      UI.confirm('Delete this photograph?', 'It will be gone from your album permanently.', () => {
        SAN.photos.remove(photo.id);
        UI.closePanel('photoview');
        UI.refreshPanel('photos');
      });
    });
    el.querySelector('#pv-close').addEventListener('click', () => UI.closePanel('photoview'));
  };

  /* =========================================================
     COOKING
     ========================================================= */
  P.cook = function () {
    const el = UI.panel('cook', 'Kitchen', `
      <p class="panel-intro">Cooking costs a little energy and gives back more. Food can also be given as a gift.</p>
      <div class="recipe-grid"></div>`, { wide: true });
    const grid = el.querySelector('.recipe-grid');
    SAN.data.cookRecipes.forEach((r) => {
      const can = SAN.state.hasAll(r.need);
      const card = document.createElement('div');
      card.className = 'recipe-card' + (can ? ' can' : '');
      card.innerHTML = `<div class="recipe-head">${icon(r.out, 34)}<div><div class="recipe-name">${U.esc(r.name)}</div>
        <div class="recipe-desc">${U.esc(r.desc)}</div></div></div>
        <div class="recipe-need">${Object.keys(r.need).map((k) => `<span class="need-pill ${SAN.state.count(k) >= r.need[k] ? 'have' : 'miss'}">${U.esc(SAN.data.item(k).name)} ${SAN.state.count(k)}/${r.need[k]}</span>`).join('')}</div>
        <div class="recipe-foot"><span class="fineprint">+${r.energy} energy</span><button class="btn btn-small ${can ? 'btn-primary' : ''}" ${can ? '' : 'disabled'}>Cook</button></div>`;
      if (can) card.querySelector('button').addEventListener('click', () => { SAN.craft.cook(r.id); P.cook(); });
      grid.appendChild(card);
    });
  };

  P.craft = function () {
    const el = UI.panel('craft', 'Crafting Bench', `
      <p class="panel-intro">Crafting level ${S().levels.crafting.lvl} · ${S().levels.crafting.xp} XP. New recipes open as your hands learn.</p>
      <div class="recipe-grid"></div>`, { wide: true });
    const grid = el.querySelector('.recipe-grid');
    SAN.data.craftRecipes.forEach((r) => {
      const lvlOk = S().levels.crafting.lvl >= (r.level || 0);
      const can = lvlOk && SAN.state.hasAll(r.need);
      const card = document.createElement('div');
      card.className = 'recipe-card' + (can ? ' can' : '') + (lvlOk ? '' : ' locked');
      card.innerHTML = `<div class="recipe-head">${icon(r.out, 34)}<div><div class="recipe-name">${U.esc(r.name)}</div>
        <div class="recipe-desc">${lvlOk ? 'Furniture and decorations for your home.' : 'Unlocks at Crafting level ' + r.level}</div></div></div>
        <div class="recipe-need">${Object.keys(r.need).map((k) => `<span class="need-pill ${SAN.state.count(k) >= r.need[k] ? 'have' : 'miss'}">${U.esc(SAN.data.item(k).name)} ${SAN.state.count(k)}/${r.need[k]}</span>`).join('')}</div>
        <div class="recipe-foot"><span class="fineprint">${r.level ? 'Lv.' + r.level : 'Any level'}</span><button class="btn btn-small ${can ? 'btn-primary' : ''}" ${can ? '' : 'disabled'}>Craft</button></div>`;
      if (can) card.querySelector('button').addEventListener('click', () => { SAN.craft.craft(r.id); P.craft(); });
      grid.appendChild(card);
    });
  };

  /* =========================================================
     SEEDS (planting)
     ========================================================= */
  P.seeds = function (data) {
    const plot = data.plot;
    if (!plot) return;
    const seeds = SAN.state.inventoryList().filter((e) => e.def.cat === 'seeds' && e.def.crop);
    const el = UI.panel('seeds', 'Plant a seed',
      `<p class="panel-intro">${U.esc(SAN.farming.describe(plot))}</p>
       <div class="seed-list"></div>
       <p class="fineprint">Some flowers prefer certain seasons. The greenhouse ignores the seasons entirely.</p>`,
      { className: 'small-panel' });
    const list = el.querySelector('.seed-list');
    if (!seeds.length) {
      list.innerHTML = '<div class="empty-note">You have no seeds. The General Store sells them, and Celeste has rarer ones.</div>';
      return;
    }
    seeds.forEach((e) => {
      const crop = SAN.data.crops[e.def.crop];
      const seasonOk = SAN.farming.canGrowIn(crop.id, plot.area, S().time.season);
      const card = document.createElement('button');
      card.className = 'seed-card' + (seasonOk ? '' : ' out-of-season');
      card.innerHTML = `${icon(e.id)}<div><div class="seed-name">${U.esc(e.def.name)} ×${e.qty}</div>
        <div class="seed-meta">${U.esc(crop.name)} · ${crop.days} days · sells ${SAN.data.item(crop.item).sell}${seasonOk ? '' : ' · wrong season here'}</div></div>`;
      card.addEventListener('click', () => {
        if (SAN.farming.plant(plot, e.id)) { UI.closePanel('seeds'); UI.refreshHUD(); }
      });
      list.appendChild(card);
    });
  };

  /* =========================================================
     GIFT
     ========================================================= */
  P.gift = function (data) {
    const npc = SAN.data.npcs[data.npcId];
    if (!npc) return;
    const items = SAN.state.inventoryList().filter((e) => e.def.cat !== 'quest' && e.def.cat !== 'furniture' && e.def.cat !== 'tools');
    const el = UI.panel('gift', 'Give a gift to ' + npc.name,
      `<p class="panel-intro">They will remember this. Not in a scoring way. In a person way.</p>
       <div class="gift-grid"></div>`, { className: 'medium-panel' });
    const grid = el.querySelector('.gift-grid');
    if (!items.length) { grid.innerHTML = '<div class="empty-note">You have nothing to give right now.</div>'; return; }
    items.forEach((e) => {
      const card = document.createElement('button');
      card.className = 'inv-card';
      card.innerHTML = `${icon(e.id)}<span class="inv-name">${U.esc(e.def.name)}</span><span class="inv-qty">×${e.qty}</span>`;
      card.addEventListener('click', () => {
        UI.closePanel('gift');
        SAN.actions.giveGift(data.npcId, e.id);
      });
      grid.appendChild(card);
    });
  };

  /* =========================================================
     DECORATION
     ========================================================= */
  P.decorate = function (data) {
    const S_ = S();
    if (S_.player.area !== 'home') {
      UI.toast('You can decorate only inside your cottage.', 'info');
      return;
    }
    const zone = SAN.world.areas.home.decorZone;
    const cols = zone.x2 - zone.x1 + 1, rows = zone.y2 - zone.y1 + 1;
    let selected = (data && data.select) || null;
    let movingIndex = -1;
    const homeSolids = SAN.world.buildSolids(SAN.world.areas.home);

    const owned = SAN.state.inventoryList().filter((e) => e.def.placeable);
    const el = UI.panel('decorate', 'Decorate your home', `
      <div class="decor-layout">
        <div class="decor-grid-wrap">
          <div class="decor-grid" id="decor-grid" style="grid-template-columns:repeat(${cols},1fr)"></div>
          <p class="fineprint">Click a piece in your satchel, then click a floor tile. Click placed furniture to pick it up.</p>
        </div>
        <div class="decor-side">
          <div class="decor-side-title">Your furniture</div>
          <div class="decor-owned" id="decor-owned"></div>
          <div class="decor-actions">
            <button class="btn btn-small btn-ghost" id="decor-remove">Remove selected</button>
            <button class="btn btn-small" id="decor-done">Done</button>
          </div>
          <p class="fineprint">Placed: ${S_.house.furniture.length}</p>
        </div>
      </div>`, { wide: true });

    function renderGrid() {
      const grid = el.querySelector('#decor-grid');
      grid.innerHTML = '';
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const tx = zone.x1 + c, ty = zone.y1 + r;
          const cell = document.createElement('button');
          const placedIdx = S_.house.furniture.findIndex((f) => f.x === tx && f.y === ty);
          const isSolid = homeSolids[ty * SAN.world.areas.home.w + tx];
          cell.className = 'decor-cell' + (isSolid ? ' blocked' : '');
          if (placedIdx >= 0) {
            const f = S_.house.furniture[placedIdx];
            cell.classList.add('filled');
            cell.innerHTML = `<img src="${SAN.render.itemIcon(f.id)}" alt="">`;
            cell.addEventListener('click', () => {
              movingIndex = placedIdx;
              selected = null;
              el.querySelector('#decor-remove').disabled = false;
              UI.toast('Selected ' + SAN.data.item(f.id).name + '. Click an empty tile to move it.', 'info');
              highlight();
            });
          } else {
            cell.addEventListener('click', () => {
              if (isSolid) { UI.toast('Something is in the way there.', 'warn'); return; }
              if (movingIndex >= 0) {
                const f = S_.house.furniture[movingIndex];
                f.x = tx; f.y = ty;
                movingIndex = -1;
                SAN.audio.sfx('click');
                renderGrid(); renderOwned();
                return;
              }
              if (!selected) { UI.toast('Choose a piece of furniture first.', 'info'); return; }
              if (SAN.state.count(selected) <= 0) { selected = null; renderOwned(); return; }
              S_.house.furniture.push({ id: selected, x: tx, y: ty });
              SAN.state.removeItem(selected, 1);
              SAN.audio.sfx('click');
              SAN.quests.notify('decorate', selected, 1);
              SAN.progression.checkAchievements();
              renderGrid(); renderOwned();
            });
          }
          grid.appendChild(cell);
        }
      }
    }
    function highlight() {
      el.querySelectorAll('.decor-cell').forEach((c) => c.classList.remove('sel'));
    }
    function renderOwned() {
      const box = el.querySelector('#decor-owned');
      box.innerHTML = '';
      if (!owned.length) {
        box.innerHTML = '<div class="fineprint">Nothing placeable yet. Craft at your bench, or buy from the shops.</div>';
        return;
      }
      owned.forEach((e) => {
        const b = document.createElement('button');
        b.className = 'decor-owned-item' + (selected === e.id ? ' active' : '');
        b.innerHTML = `<img src="${SAN.render.itemIcon(e.id)}" alt=""><span>${U.esc(e.def.name)} ×${e.qty}</span>`;
        b.addEventListener('click', () => {
          selected = e.id; movingIndex = -1;
          renderOwned(); highlight();
          UI.toast('Click a floor tile to place ' + e.def.name + '.', 'info');
        });
        box.appendChild(b);
      });
    }
    el.querySelector('#decor-remove').disabled = true;
    el.querySelector('#decor-remove').addEventListener('click', () => {
      if (movingIndex < 0) return;
      const f = S_.house.furniture[movingIndex];
      if (!f) return;
      SAN.state.addItem(f.id, 1, { silent: true });
      S_.house.furniture.splice(movingIndex, 1);
      movingIndex = -1;
      renderGrid(); renderOwned();
      UI.toast('Returned to your satchel.', 'info');
    });
    el.querySelector('#decor-done').addEventListener('click', () => UI.closePanel('decorate'));
    renderGrid();
    renderOwned();
  };

  /* =========================================================
     SETTINGS
     ========================================================= */
  P.settings = function () {
    const S_ = S();
    const st = S_.settings;
    const el = UI.panel('settings', 'Settings', `
      <div class="settings-grid">
        <div class="settings-group">
          <div class="settings-title">${SAN.t('lang.label')}</div>
          <label class="select-row"><select id="set-lang" aria-label="${SAN.t('lang.label')}">
            ${SAN.i18n.LANGS.map((l) => `<option value="${l.id}" ${l.id === SAN.i18n.get() ? 'selected' : ''}>${U.esc(l.name)}</option>`).join('')}
          </select></label>
          <p class="fineprint">${SAN.t('lang.note')}</p>
        </div>
        <div class="settings-group">
          <div class="settings-title">${SAN.t('settings.audio')}</div>
          <label class="slider-row"><span>${SAN.t('settings.music')}</span><input type="range" id="set-music" min="0" max="1" step="0.05" value="${st.musicVol}"><b>${Math.round(st.musicVol * 100)}%</b></label>
          <label class="slider-row"><span>${SAN.t('settings.effects')}</span><input type="range" id="set-sfx" min="0" max="1" step="0.05" value="${st.sfxVol}"><b>${Math.round(st.sfxVol * 100)}%</b></label>
          <label class="slider-row"><span>${SAN.t('settings.ambience')}</span><input type="range" id="set-amb" min="0" max="1" step="0.05" value="${st.ambVol}"><b>${Math.round(st.ambVol * 100)}%</b></label>
        </div>
        <div class="settings-group">
          <div class="settings-title">${SAN.t('settings.textDisplay')}</div>
          <label class="slider-row"><span>${SAN.t('settings.textSpeed')}</span><input type="range" id="set-speed" min="0.5" max="2.5" step="0.25" value="${st.textSpeed}"><b>${st.textSpeed}×</b></label>
          <label class="toggle-row"><span>${SAN.t('settings.hints')}</span><input type="checkbox" id="set-hints" ${st.showHints ? 'checked' : ''}></label>
          <label class="toggle-row"><span>${SAN.t('settings.reduceMotion')}</span><input type="checkbox" id="set-motion" ${st.reduceMotion ? 'checked' : ''}></label>
          <label class="toggle-row"><span>${SAN.t('settings.touch')}</span><input type="checkbox" id="set-touch" ${st.alwaysShowTouch ? 'checked' : ''}></label>
          <label class="toggle-row"><span>${SAN.t('settings.autosave')}</span><input type="checkbox" id="set-auto" ${st.autosave ? 'checked' : ''}></label>
        </div>
        <div class="settings-group">
          <div class="settings-title">${SAN.t('settings.privacy')}</div>
          <p class="fineprint">${SAN.t('settings.privacyNote')}</p>
          <label class="toggle-row"><span>${SAN.t('settings.ai')}</span><input type="checkbox" id="set-ai" ${st.useAI ? 'checked' : ''}></label>
          <p class="fineprint">${SAN.t('settings.aiNote')}</p>
          <div class="settings-actions">
            <button class="btn btn-small btn-ghost" id="set-export">${SAN.t('settings.export')}</button>
            <button class="btn btn-small btn-ghost" id="set-import">${SAN.t('settings.import')}</button>
          </div>
        </div>
        <div class="settings-group">
          <div class="settings-title">${SAN.t('settings.controls')}</div>
          <div class="controls-list">
            <div><kbd>WASD</kbd> / <kbd>Arrows</kbd> ${SAN.t('settings.controlMove')}</div>
            <div><kbd>Shift</kbd> ${SAN.t('settings.controlRun')}</div>
            <div><kbd>E</kbd> / <kbd>Space</kbd> ${SAN.t('settings.controlInteract')}</div>
            <div><kbd>Esc</kbd> ${SAN.t('settings.controlPause')}</div>
            <div><kbd>I</kbd> inventory · <kbd>J</kbd> journal · <kbd>M</kbd> map</div>
            <div><kbd>Q</kbd> quests · <kbd>V</kbd> memories · <kbd>R</kbd> relationships</div>
            <div>${SAN.t('settings.controlTouch')}</div>
          </div>
        </div>
      </div>
      <div class="settings-footer">
        <button class="btn" id="set-save">${SAN.t('settings.saveSlots')}</button>
        <button class="btn btn-ghost" id="set-title">${SAN.t('settings.returnTitle')}</button>
      </div>`, { wide: true });

    const bindRange = (id, key, cb) => {
      const input = el.querySelector('#' + id);
      input.addEventListener('input', () => {
        st[key] = parseFloat(input.value);
        input.parentElement.querySelector('b').textContent = Math.round(st[key] * 100) + '%';
        SAN.save.saveSettings(st);
        UI.applySettings();
        cb && cb();
      });
    };
    bindRange('set-music', 'musicVol');
    bindRange('set-sfx', 'sfxVol');
    bindRange('set-amb', 'ambVol');
    const speed = el.querySelector('#set-speed');
    speed.addEventListener('input', () => {
      st.textSpeed = parseFloat(speed.value);
      speed.parentElement.querySelector('b').textContent = st.textSpeed + '×';
      SAN.save.saveSettings(st);
    });
    const bindToggle = (id, key, cb) => {
      const input = el.querySelector('#' + id);
      input.addEventListener('change', () => {
        st[key] = input.checked;
        SAN.save.saveSettings(st);
        UI.applySettings();
        cb && cb();
      });
    };
    bindToggle('set-hints', 'showHints');
    bindToggle('set-motion', 'reduceMotion');
    bindToggle('set-touch', 'alwaysShowTouch');
    bindToggle('set-auto', 'autosave', () => { SAN.save.autosaveEnabled = st.autosave; });
    bindToggle('set-ai', 'useAI', () => {
      if (st.useAI) UI.toast('AI reflections are opt-in per entry. Your journal remains on this device.', 'info');
    });
    const langSel = el.querySelector('#set-lang');
    if (langSel) {
      langSel.addEventListener('change', () => {
        st.lang = SAN.i18n.set(langSel.value);
        SAN.save.saveSettings(st);
        UI.refreshHUD();
        UI.refreshPanel('settings');
      });
    }
    el.querySelector('#set-export').addEventListener('click', () => {
      const data = SAN.save.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'sanctuary-save.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      UI.toast('Save exported.', 'save');
    });
    el.querySelector('#set-import').addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.addEventListener('change', () => {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const res = SAN.save.importData(String(reader.result));
          if (!res.ok) { UI.toast(res.error, 'warn'); return; }
          UI.closeAll();
          SAN.state.apply(res.snap);
          SUN();
          UI.toast('Save imported and loaded.', 'save');
        };
        reader.readAsText(file);
      });
      input.click();
    });
    el.querySelector('#set-save').addEventListener('click', () => { UI.closePanel('settings'); UI.openPanel('saves'); });
    el.querySelector('#set-title').addEventListener('click', () => {
      UI.confirm('Return to the title screen?', 'Your progress is saved in the slot you loaded.', () => {
        SAN.save.autosave(true);
        UI.closeAll();
        SUN();
        SAN.screens.showTitle();
      });
    });
  };

  /* =========================================================
     SAVE SLOTS
     ========================================================= */
  P.saves = function () {
    const meta = SAN.save.slotMeta();
    const el = UI.panel('saves', 'Save Slots',
      `<div class="save-slots">${meta.map((m) => `<div class="save-slot" data-slot="${m.slot}">
        <div class="save-slot-head">Slot ${m.slot}</div>
        ${m.empty ? '<div class="save-slot-empty">Empty</div>' : `<div class="save-slot-name">${U.esc(m.name)}</div>
          <div class="save-slot-meta">${U.SEASONS[m.season]} ${m.day}, Year ${m.year} · ${m.money} coins</div>
          <div class="save-slot-meta">${m.playtime ? Math.round(m.playtime / 60) + ' min played' : ''}</div>`}
        <div class="save-slot-actions">
          <button class="btn btn-small btn-primary" data-act="save">Save here</button>
          ${!m.empty ? '<button class="btn btn-small" data-act="load">Load</button>' : ''}
          ${!m.empty ? '<button class="btn btn-small btn-ghost" data-act="del">Delete</button>' : ''}
        </div>
      </div>`).join('')}</div>
      <p class="fineprint">Saving overwrites the slot. The game also autosaves regularly.</p>`,
      { className: 'medium-panel' });
    el.querySelectorAll('.save-slot').forEach((card) => {
      const slot = parseInt(card.getAttribute('data-slot'), 10);
      card.querySelectorAll('[data-act]').forEach((b) => {
        b.addEventListener('click', () => {
          const act = b.getAttribute('data-act');
          if (act === 'save') {
            SAN.save.write(slot);
            UI.refreshPanel('saves');
          } else if (act === 'load') {
            const snap = SAN.save.read(slot);
            if (!snap) return;
            UI.closeAll();
            SAN.state.apply(snap);
            SUN();
            UI.toast('Loaded slot ' + slot + '.', 'save');
          } else if (act === 'del') {
            UI.confirm('Delete slot ' + slot + '?', 'This removes that save permanently.', () => {
              SAN.save.clear(slot); UI.refreshPanel('saves');
            });
          }
        });
      });
    });
  };

  function SUN() {
    const S_ = S();
    SAN.ui.initHUDForState && SAN.ui.initHUDForState();
    SAN.world.load(S_.player.area, S_.player.x, S_.player.y);
    SAN.cat.syncFromState();
    SAN.ui.refreshHUD();
    SAN.audio.playMusic(SAN.world.area ? SAN.world.area.music : 'village');
    SAN.progression.checkUnlocks();
  }

  /* =========================================================
     PAUSE
     ========================================================= */
  P.pause = function () {
    const el = UI.panel('pause', 'Sanctuary', `
      <div class="pause-menu">
        <p class="pause-sub">${SAN.time.dateLabel()} · ${U.fmtTime(S().time.minutes)} · ${SAN.world.area ? SAN.world.area.name : ''}</p>
        <div class="pause-grid">
          <button class="btn btn-primary" data-p="resume">${SAN.t('pause.resume')}</button>
          <button class="btn" data-p="journal">${SAN.t('pause.journal')}</button>
          <button class="btn" data-p="inventory">${SAN.t('pause.inventory')}</button>
          <button class="btn" data-p="quests">${SAN.t('pause.quests')}</button>
          <button class="btn" data-p="map">${SAN.t('pause.map')}</button>
          <button class="btn" data-p="relations">${SAN.t('pause.relations')}</button>
          <button class="btn" data-p="memories">${SAN.t('pause.memories')}</button>
          <button class="btn" data-p="collection">${SAN.t('pause.collection')}</button>
          <button class="btn" data-p="photos">${SAN.t('pause.photos')}</button>
          <button class="btn" data-p="decorate">${SAN.t('pause.decorate')}</button>
          <button class="btn" data-p="saves">${SAN.t('pause.saves')}</button>
          <button class="btn" data-p="settings">${SAN.t('pause.settings')}</button>
          <button class="btn btn-ghost" data-p="title">${SAN.t('pause.quit')}</button>
        </div>
        <p class="fineprint">${SAN.t('pause.footnote')}</p>
      </div>`, { className: 'pause-panel' });
    el.querySelectorAll('[data-p]').forEach((b) => {
      b.addEventListener('click', () => {
        const p = b.getAttribute('data-p');
        if (p === 'resume') { UI.closeAll(); return; }
        if (p === 'title') {
          UI.confirm('Return to the title screen?', 'Your current progress stays in its slot.', () => {
            SAN.save.autosave(true);
            UI.closeAll();
            SAN.screens.showTitle();
          });
          return;
        }
        UI.closePanel('pause');
        UI.openPanel(p);
      });
    });
  };

  /* =========================================================
     HISTORY
     ========================================================= */
  P.history = function () {
    const el = UI.panel('history', 'Dialogue History',
      `<div class="history-list">${UI.history.length ? UI.history.slice(0, 60).map((h) => `<div class="history-row">
        <div class="history-name">${U.esc(h.name)}</div><div class="history-text">${U.esc(h.text)}</div></div>`).join('') : '<div class="empty-note">Nothing said yet.</div>'}</div>`,
      { className: 'medium-panel' });
  };

  /* =========================================================
     CAT ADOPTION
     ========================================================= */
  P.catadopt = function () {
    let color = SAN.state.CAT_COLORS[0].id;
    const el = UI.panel('catadopt', 'A Small Warm Thing', `
      <p class="panel-intro">The cat sits down and looks at you. It has already decided something.</p>
      <div class="cat-adopt-preview" id="cat-preview">🐈</div>
      <label class="field-label">Their name</label>
      <input class="text-input" id="cat-name" maxlength="16" value="Mochi">
      <label class="field-label">Their coat</label>
      <div class="cat-color-row" id="cat-colors">${SAN.state.CAT_COLORS.map((c, i) => `<button class="cat-swatch ${i === 0 ? 'active' : ''}" data-color="${c.id}" style="--c:${c.hex}" title="${c.name}"></button>`).join('')}</div>
      <div class="journal-actions">
        <button class="btn btn-primary" id="cat-adopt">Adopt them</button>
      </div>
      <p class="fineprint">They will follow you, sleep in sunbeams, and occasionally bring you something mildly disgusting and very precious.</p>`,
      { className: 'small-panel', noClose: true });
    const preview = el.querySelector('#cat-preview');
    function paint() {
      const c = SAN.state.CAT_COLORS.find((x) => x.id === color);
      preview.style.color = c.hex;
      preview.textContent = '🐈';
    }
    el.querySelectorAll('[data-color]').forEach((b) => {
      b.addEventListener('click', () => {
        color = b.getAttribute('data-color');
        el.querySelectorAll('[data-color]').forEach((x) => x.classList.toggle('active', x === b));
        paint();
      });
    });
    el.querySelector('#cat-adopt').addEventListener('click', () => {
      const name = el.querySelector('#cat-name').value.trim() || 'Mochi';
      const c = SAN.state.CAT_COLORS.find((x) => x.id === color);
      const S_ = S();
      S_.cat.adopted = true;
      S_.cat.name = name;
      S_.cat.color = c.id;
      S_.cat.colorHex = c.hex;
      S_.cat.trust = 12;
      SAN.cat.syncFromState();
      SAN.audio.sfx('purr');
      UI.closePanel('catadopt');
      UI.dialogue({
        pages: [
          { speaker: 'narrator', text: name + ' walks into your cottage like they have been paying rent all along.' },
          { speaker: 'narrator', text: 'You have a cat now. This is a fact about your life.' },
        ],
      });
      UI.refreshHUD();
    });
    paint();
  };

  /* =========================================================
     WARDROBE / CUSTOMISATION
     ========================================================= */
  P.customize = function () {
    const p = S().player;
    // saves made before identity existed fall back to the defaults
    p.pronoun = SAN.state.pronoun(p.pronoun).id;
    p.background = SAN.state.background(p.background).id;
    p.temperament = SAN.state.temperament(p.temperament).id;
    const bg = SAN.state.background(p.background);
    const temp = SAN.state.temperament(p.temperament);
    const el = UI.panel('customize', 'Wardrobe', `
      <div class="creator-body">
        <div class="creator-preview">
          <div class="creator-portrait" id="wd-portrait"></div>
          <div class="creator-name-display" id="wd-name">${U.esc(p.name)}</div>
          <div class="creator-identity" id="wd-identity">${U.esc(SAN.state.identityLine(p))}</div>
        </div>
        <div class="creator-options">
          <label class="field-label">Name</label>
          <input class="text-input" id="wd-input-name" maxlength="16" value="${U.esc(p.name)}">
          <label class="field-label">Pronouns</label>
          <div class="chip-row" id="wd-pronoun"></div>
          <label class="field-label">What you carried here</label>
          <p class="fineprint"><b>${U.esc(bg.name)}</b> — ${U.esc(bg.blurb)} It came with you, and it is part of your story now.</p>
          <label class="field-label">How you meet the day</label>
          <p class="fineprint"><b>${U.esc(temp.name)}</b> — ${U.esc(temp.blurb)}</p>
          <p class="fineprint">The official portrait, hair and outfit are fixed artwork, so the wardrobe keeps how the village knows you — your name and pronouns — up to date instead of redrawing her.</p>
        </div>
      </div>`,
      { wide: true });

    const portrait = el.querySelector('#wd-portrait');
    function apply() {
      p.colors = SAN.state.playerColors(p);
      portrait.innerHTML = SAN.render.fullBodyImg();
      el.querySelector('#wd-name').textContent = p.name;
      el.querySelector('#wd-input-name').value = p.name;
      el.querySelector('#wd-identity').textContent = SAN.state.identityLine(p);
      SAN.save.write(SAN.state.S.slot, { silent: true });
    }
    const box = el.querySelector('#wd-pronoun');
    SAN.state.PRONOUNS.forEach((item) => {
      const b = document.createElement('button');
      b.className = 'chip' + (p.pronoun === item.id ? ' active' : '');
      b.textContent = item.name;
      b.addEventListener('click', () => {
        p.pronoun = item.id;
        box.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === b));
        apply();
      });
      box.appendChild(b);
    });
    el.querySelector('#wd-input-name').addEventListener('input', (e) => {
      p.name = (e.target.value || 'Elara').slice(0, 16);
      el.querySelector('#wd-name').textContent = p.name;
      SAN.save.write(SAN.state.S.slot, { silent: true });
    });
    apply();
  };

  P.about = function () {
    UI.panel('about', 'About Sanctuary', `
      <p><b>Sanctuary: Echoes of Self</b> is a cozy RPG about a village where time moves gently.</p>
      <p>Everything you see is drawn and generated in code — no image files, no network calls, no accounts. It runs entirely offline once loaded.</p>
      <p>Journal reflections are produced by a small local engine that looks for themes and offers gentle suggestions. It is not therapy and never diagnoses anything.</p>
      <p class="fineprint">Built with vanilla JavaScript, Canvas 2D and WebAudio.</p>`,
      { className: 'small-panel' });
  };
})();
