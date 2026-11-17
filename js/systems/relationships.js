/* Sanctuary — friendship: talking, gifts, tiers. No decay, ever. */
(function () {
  const R = (SAN.rel = {});

  R.get = function (id) {
    const S = SAN.state.S;
    if (!S.friendship[id]) S.friendship[id] = { pts: 0, talkedDay: 0, giftsToday: 0, met: false };
    return S.friendship[id];
  };
  R.pts = (id) => R.get(id).pts;
  R.tier = (id) => SAN.data.friendTier(R.get(id).pts);

  R.add = function (id, pts, silent) {
    const S = SAN.state.S;
    const f = R.get(id);
    const before = SAN.data.friendTier(f.pts).name;
    f.pts = Math.max(0, Math.min(100, f.pts + pts));
    const after = SAN.data.friendTier(f.pts).name;
    if (before !== after && !silent) {
      const npc = SAN.data.npcs[id];
      SAN.ui.toast(f.pts >= 21 ? (npc ? npc.name : id) + ' now sees you as: ' + after : after, 'friend');
      SAN.audio.sfx('sparkle');
      SAN.progression.checkAchievements();
    }
    return f.pts;
  };

  R.talk = function (id) {
    const S = SAN.state.S;
    const f = R.get(id);
    if (f.talkedDay === S.time.day) return 0;
    f.talkedDay = S.time.day;
    let gain = 2;
    if (SAN.time.isFestival('tea_gathering') && S.time.minutes >= 17 * 60) gain *= 2;
    if (SAN.time.isFestival('flower_festival')) gain *= 2;
    R.add(id, gain);
    f.met = true;
    SAN.progression.addXp('exploration', 2);
    return gain;
  };

  R.gift = function (id, itemId) {
    const S = SAN.state.S;
    const npc = SAN.data.npcs[id];
    const f = R.get(id);
    if (!npc) return { pts: 0, reaction: 'neutral' };
    if (f.giftsToday >= 2) return { tooMany: true, pts: 0, reaction: 'neutral' };
    const item = SAN.data.item(itemId);
    let reaction = 'neutral', pts = 2;
    if ((npc.loves || []).includes(itemId)) { reaction = 'love'; pts = 9; }
    else if ((npc.likes || []).includes(itemId)) { reaction = 'like'; pts = 6; }
    else if ((npc.dislikes || []).includes(itemId)) { reaction = 'dislike'; pts = -1; }
    else if (item.cat === 'fish' || item.rarity === 'rare') { reaction = 'like'; pts = 5; }
    else if (item.cat === 'food') { reaction = 'like'; pts = 4; }
    else if (item.cat === 'flowers') { reaction = 'like'; pts = 4; }
    if (SAN.time.isFestival('flower_festival')) pts = Math.round(pts * 2);
    f.giftsToday++;
    f.giftCount = (f.giftCount || 0) + 1;
    R.add(id, pts);
    S.stats.giftsGiven++;
    SAN.quests.notify('gift', id, 1);
    return { reaction, pts, line: (npc.gift || {})[reaction] };
  };

  R.reactionLine = function (id, reaction) {
    const npc = SAN.data.npcs[id];
    if (!npc) return '';
    return (npc.gift || {})[reaction] || '';
  };

  R.metCount = function () {
    const S = SAN.state.S;
    return Object.keys(S.friendship).filter((k) => S.friendship[k].met).length;
  };

  R.allTiers = function () { return SAN.data.FRIEND_TIERS; };
})();
