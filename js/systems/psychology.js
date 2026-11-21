/* Sanctuary — emotional state and trigger engine.
   Psychology profiles are data; this system keeps what has actually happened
   to each person: trust, emotional safety, unspoken resentment, openness, how
   their attachment currently leans, and which triggers have been touched.

   Rules that keep it humane:
   • one action never decides the relationship;
   • resentment decays and can always be repaired;
   • consent and boundaries are respected, never punished as rejection;
   • recovery is offered in every profile. */
(function () {
  const PS = (SAN.psychology = {});
  const S = () => SAN.state.S;
  const D = () => SAN.data.psychology;

  PS.profile = (id) => (D().profiles || {})[id] || null;

  PS.ensure = function (id) {
    const s = S();
    if (!s) return null;
    if (!s.psychology) s.psychology = {};
    if (!s.psychology[id]) {
      const p = PS.profile(id);
      s.psychology[id] = {
        trust: 0,
        safety: 0,
        resentment: 0,
        openness: 0,
        attachment: (p && p.attachment) || 'secure',
        triggers: {},
        apologies: 0,
        growth: {},
        lastEventDay: 0,
        history: [],
      };
    }
    return s.psychology[id];
  };

  PS.state = function (id) { return PS.ensure(id); };

  /* attachment is a tendency that moves with what has happened, not a label */
  PS.attachmentOf = function (id) {
    const st = PS.ensure(id);
    const p = PS.profile(id);
    if (!st || !p) return null;
    if (st.trust >= 60 && st.safety >= 55 && st.resentment < 15) return 'secure';
    if (st.resentment >= 40) return p.attachment === 'secure' ? 'anxious' : p.attachment;
    if (st.safety < 15 && st.trust < 20) return p.attachment;
    return p.attachment;
  };

  PS.attachmentLabel = function (id) {
    const key = PS.attachmentOf(id);
    const info = (D().ATTACHMENTS || {})[key];
    return info ? info.name : 'Unread';
  };

  PS.trigger = function (id, triggerId) {
    const st = PS.ensure(id);
    const p = PS.profile(id);
    if (!st || !p) return null;
    const t = (p.triggers || []).find((x) => x.id === triggerId);
    if (!t) return null;
    st.triggers[triggerId] = (st.triggers[triggerId] || 0) + 1;
    st.resentment = Math.min(100, st.resentment + 9);
    st.openness = Math.max(0, st.openness - 5);
    st.lastEventDay = S() ? S().time.day : 0;
    return t;
  };

  PS.loveBoost = function (id, kind) {
    const p = PS.profile(id);
    if (!p || !p.loveLanguage) return 1;
    if (p.loveLanguage.primary === kind) return 1.35;
    if (p.loveLanguage.secondary === kind) return 1.15;
    return 0.9;
  };

  /* the single consequence router. kind describes what the player did. */
  PS.onEvent = function (id, kind, opts) {
    const st = PS.ensure(id);
    const p = PS.profile(id);
    if (!st || !p) return null;
    const o = opts || {};
    let d = { trust: 0, safety: 0, resentment: 0, openness: 0 };
    let trigger = null;
    switch (kind) {
      case 'listened':
        d = { trust: 4, safety: 3, openness: 4 };
        break;
      case 'remembered_date':
        d = { trust: 5, safety: 4, resentment: -4 };
        break;
      case 'kept_promise':
        d = { trust: 5, safety: 3, resentment: -5 };
        break;
      case 'broken_promise':
        d = { trust: -5, safety: -5, resentment: 11 };
        trigger = (p.triggers || [])[0];
        break;
      case 'boundary_respected':
        d = { safety: 5, trust: 2 };
        break;
      case 'boundary_crossed':
        d = { safety: -10, trust: -3, resentment: 13 };
        trigger = (p.triggers || [])[1] || (p.triggers || [])[0];
        break;
      case 'honest_talk':
        d = { trust: 3, safety: 3, resentment: -16, openness: 6 };
        break;
      case 'space_given':
        d = { safety: 4, resentment: -7 };
        break;
      case 'acts_of_service':
      case 'service':
        d = { trust: 3, safety: 2, resentment: -3 };
        break;
      case 'gift':
        d = { trust: 2, resentment: -2 };
        break;
      case 'quality_time':
      case 'affection':
        d = { trust: 2, safety: 2, openness: 2, resentment: -2 };
        break;
      case 'apology':
        d = { trust: 3, safety: 4, resentment: -22 };
        st.apologies += 1;
        break;
      case 'declined_invite':
        d = { resentment: 1, trust: -1 };
        break;
      case 'breakup':
        d = { trust: -8, safety: -10, resentment: 12 };
        break;
      default:
        return null;
    }
    st.trust = Math.max(0, Math.min(100, st.trust + (d.trust || 0)));
    st.safety = Math.max(0, Math.min(100, st.safety + (d.safety || 0)));
    st.resentment = Math.max(0, Math.min(100, st.resentment + (d.resentment || 0)));
    st.openness = Math.max(0, Math.min(100, st.openness + (d.openness || 0)));
    if (trigger) PS.trigger(id, trigger.id);
    if (st.history) {
      st.history.push({ kind, day: S() ? S().time.day : 0, d });
      if (st.history.length > 30) st.history.shift();
    }
    return { delta: d, trigger };
  };

  /* a trigger for a specific, contextual moment (used by romance & city life) */
  PS.moment = function (id, triggerId) {
    const t = PS.trigger(id, triggerId);
    if (!t) return null;
    return { label: t.label, response: t.response, recovery: t.recovery };
  };

  PS.apologize = function (id) {
    const st = PS.ensure(id);
    const p = PS.profile(id);
    if (!st || !p || st.resentment < 8) return { ok: false, line: null };
    PS.onEvent(id, 'apology');
    st.resentment = Math.max(0, st.resentment - 6);
    const who = (SAN.data.npcs[id] && SAN.data.npcs[id].name) || 'They';
    const line = who + ' is quiet for a moment. \"Thank you. I needed to hear that. I am still a little sore, but I am here.\"';
    return { ok: true, line };
  };

  PS.summary = function (id) {
    const p = PS.profile(id);
    const st = PS.ensure(id);
    if (!p || !st) return null;
    const att = (D().ATTACHMENTS || {})[PS.attachmentOf(id)] || {};
    const lang = (D().LOVE_LANGUAGES || {})[p.loveLanguage.primary] || '';
    const second = (D().LOVE_LANGUAGES || {})[p.loveLanguage.secondary] || '';
    return {
      positive: p.positive,
      negative: p.negative,
      attachment: att.name || 'Unread',
      attachmentBlurb: att.blurb || '',
      loveLanguage: lang + (second ? ' · ' + second : ''),
      insecurity: (p.insecurities || [])[0] || '',
      growth: (p.growth || [])[0] || '',
      trust: st.trust,
      safety: st.safety,
      resentment: st.resentment,
      needsRepair: st.resentment >= 15,
      trigger: (p.triggers || [])[0] || null,
    };
  };

  /* resentment cools with ordinary time; nothing is permanent */
  PS.tickDay = function () {
    const s = S();
    if (!s || !s.psychology) return;
    Object.keys(s.psychology).forEach((id) => {
      const st = s.psychology[id];
      st.resentment = Math.max(0, st.resentment - 2);
    });
  };
})();
