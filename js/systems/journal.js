/* Sanctuary — journal + local rule-based emotional reflection engine.
   Privacy: entries never leave this device and are never sent anywhere. */
(function () {
  const J = (SAN.journal = {});
  const U = SAN.util;

  const THEMES = [
    {
      id: 'loneliness',
      keys: ['lonely', 'alone', 'left', 'leaving', 'leaves', 'abandon', 'nobody', 'no one', 'ignored', 'empty house', 'miss them', 'miss you', 'ghosted'],
      feel: 'Sometimes uncertainty makes the world feel very quiet, and being left with your own thoughts can be heavier than being alone.',
      support: 'Feeling alone does not mean something is wrong with you. It usually means you are someone who wants to be close to people — which is not a flaw.',
      prompts: ['Who is one person you feel safe being quiet with?', 'What would you want someone to say to you right now?'],
      activity: { label: 'Spend quiet time at the lighthouse', type: 'visit', area: 'lighthouse', line: 'Lucien keeps a light on for ships he will never meet. You could sit with him for a while.' },
    },
    {
      id: 'anxiety',
      keys: ['anxious', 'anxiety', 'worry', 'worried', 'overthink', 'overthinking', 'panic', 'scared', 'afraid', 'fear', 'nervous', 'what if', 'spiral', 'stress', 'stressed'],
      feel: 'Your mind is trying to protect you by rehearsing every possible future at once. That is exhausting, and it is not a character flaw.',
      support: 'You do not have to solve the whole thing tonight. One small, real thing is enough — a glass of water, a window opened, one slow breath.',
      prompts: ['What is one thing that is actually within your control today?', 'What would you tell a friend who was thinking this?'],
      activity: { label: 'Walk to the Whispering Windmill', type: 'visit', area: 'windmill', line: 'Rowan knows exactly what a loud head sounds like. The windmill will keep turning whether or not you have figured anything out.' },
    },
    {
      id: 'sadness',
      keys: ['sad', 'cry', 'crying', 'tears', 'grief', 'loss', 'lost', 'hurt', 'heartbroken', 'heavy', 'numb', 'hopeless', 'dark'],
      feel: 'Sadness is not a problem to be fixed quickly. It is often the shape of something that mattered to you.',
      support: 'You are allowed to feel this without performing recovery. Being gentle with yourself today counts as doing something.',
      prompts: ['What is one small comfort you can give yourself in the next ten minutes?', 'What do you need that you have not asked for?'],
      activity: { label: 'Visit the Memory Forest', type: 'visit', area: 'forest', line: 'There are stones there that hold what people could not carry. You do not have to add anything. You can just look.' },
    },
    {
      id: 'anger',
      keys: ['angry', 'anger', 'mad', 'furious', 'unfair', 'frustrated', 'annoyed', 'resent', 'hate', 'rage', 'irritated'],
      feel: 'Anger usually shows up when something important to you was crossed. It is information, not a failure.',
      support: 'You can be angry and still be kind to yourself. You do not have to swallow it or aim it at anyone — it can just be here while you decide what you need.',
      prompts: ['What boundary was crossed, and what would protecting it look like?', 'What would you want to say if nothing could go wrong?'],
      activity: { label: 'Work it out in the garden', type: 'visit', area: 'garden', line: 'Digging, watering, pulling weeds. The garden does not ask you to explain yourself.' },
    },
    {
      id: 'exhaustion',
      keys: ['tired', 'exhausted', 'drained', 'burnout', 'burnt out', 'no energy', 'cannot sleep', 'cant sleep', 'insomnia', 'sleepy', 'worn out'],
      feel: 'Tiredness like this is not laziness. It is usually a bill that has been quietly adding up.',
      support: 'Rest is not a reward you earn. It is something your body needs, the same way the garden needs rain.',
      prompts: ['What is one thing you are allowed to stop doing today?', 'What would "enough" look like tonight?'],
      activity: { label: 'Go home and rest', type: 'sleep', line: 'The cottage is warm and nothing in it is urgent.' },
    },
    {
      id: 'selfcriticism',
      keys: ['stupid', 'failure', 'useless', 'hate myself', 'not good enough', 'worthless', 'burden', 'annoying', 'disappointment', 'useless', 'ashamed', 'shame', 'my fault'],
      feel: 'That voice is very convincing, and it is not a fair judge. You would not say those words to someone you love.',
      support: 'You are allowed to be a work in progress without it meaning anything terrible about your worth. Nothing you do in this village has to be earned.',
      prompts: ['What would you say to a friend who said this about themselves?', 'What is one thing you did today that took effort nobody saw?'],
      activity: { label: 'Visit the Shared Greenhouse', type: 'visit', area: 'greenhouse', line: 'Elowen is learning that things can grow even when they are not perfect. He is not very good at asking for help yet either.' },
    },
    {
      id: 'overwhelm',
      keys: ['overwhelmed', 'too much', 'cannot cope', 'cant cope', 'falling apart', 'everything at once', 'breaking', 'stuck', 'trapped'],
      feel: 'When everything arrives at once, the brain stops being able to sort it. That is not weakness — it is load.',
      support: 'You do not have to hold all of it at the same time. Pick one thing, or none. Both are legitimate.',
      prompts: ['What is the smallest next step available to you?', 'What could you put down for today, even temporarily?'],
      activity: { label: 'Sit by the lighthouse water', type: 'visit', area: 'beach', line: 'The sea is bigger than today. That can be a comfort.' },
    },
    {
      id: 'gratitude',
      keys: ['grateful', 'thankful', 'happy', 'good day', 'proud', 'glad', 'warm', 'safe', 'peaceful', 'calm', 'hopeful', 'better'],
      feel: 'You noticed something good today. That is not naive — it is a skill.',
      support: 'It is worth letting this land without immediately preparing for it to end. Good things are allowed to just be good.',
      prompts: ['What made this possible, and who helped?', 'How would you like to remember today?'],
      activity: { label: 'Share it with someone in the village', type: 'visit', area: 'village', line: 'Tell someone. Joy gets bigger when it is handed over.' },
    },
    {
      id: 'confusion',
      keys: ['confused', 'lost', 'dont know', 'do not know', 'unsure', 'uncertain', 'stuck', 'why', 'nothing makes sense'],
      feel: 'Not knowing is uncomfortable, and it is also honest. Clarity usually arrives after movement, not before.',
      support: 'You do not need the whole map. You only need the next few steps to be walkable.',
      prompts: ['What is one thing you do know, even if it is small?', 'What would you do if you trusted yourself a little more?'],
      activity: { label: 'Visit the library', type: 'visit', area: 'library', line: 'Aria keeps records of people who were also unsure. They all turned out to be in the middle of something.' },
    },
  ];

  const CRISIS = ['kill myself', 'suicide', 'suicidal', 'end my life', 'want to die', 'self harm', 'self-harm', 'hurt myself', 'no reason to live'];
  const SUPPORT_LINE = 'If you are in danger or thinking about harming yourself, please reach out to a local crisis line or emergency service, or a person you trust. This game can be a quiet place to breathe, but it cannot keep you safe — you deserve real support from a human being.';

  J.analyze = function (text, moodId) {
    const t = (text || '').toLowerCase();
    if (CRISIS.some((k) => t.includes(k))) {
      return {
        theme: 'care',
        text: SUPPORT_LINE,
        prompt: 'Can you reach out to one person or service right now? Even a message counts.',
        activity: null,
        choices: ['Save this entry', 'Sit quietly in Sanctuary for a moment'],
        crisis: true,
      };
    }
    let best = null, bestScore = 0;
    THEMES.forEach((th) => {
      let score = 0;
      th.keys.forEach((k) => { if (t.includes(k)) score += k.length > 6 ? 2 : 1.5; });
      if (score > bestScore) { bestScore = score; best = th; }
    });
    const moodThemes = { anxious: 'anxiety', sad: 'sadness', lonely: 'loneliness', angry: 'anger', tired: 'exhaustion', hopeful: 'gratitude', grateful: 'gratitude', calm: 'gratitude', confused: 'confusion', happy: 'gratitude' };
    if ((!best || bestScore < 2) && moodThemes[moodId]) best = THEMES.find((x) => x.id === moodThemes[moodId]);
    if (!best) best = THEMES.find((x) => x.id === (moodId === 'anxious' ? 'anxiety' : 'confusion'));

    const prompt = Math.random() < 0.5 ? U.pick(best.prompts) : U.pick(SAN.data.reflectPrompts);
    const closing = [
      'Take this at whatever pace you need. You can close this page at any time.',
      'Nothing here is a test. You can skip any part of this.',
      'You do not have to feel differently after writing. Writing is enough on its own.',
      'There is no right way to be a person. There is only the next kind thing.',
    ];
    const response = `${best.feel}\n\n${best.support}\n\n${U.pick(closing)}`;
    return {
      theme: best.id,
      text: response,
      prompt,
      activity: best.activity,
      choices: ['Reflect on this feeling', best.activity ? best.activity.label : 'Take a slow breath', 'Save this entry and rest'],
      crisis: false,
    };
  };

  J.save = function (entry) {
    const S = SAN.state.S;
    const now = new Date();
    const reflection = entry.reflection || J.analyze(entry.text, entry.mood);
    const record = {
      id: U.uid(),
      text: entry.text,
      mood: entry.mood || 'calm',
      tags: entry.tags || [],
      day: S.time.day, season: S.time.season, year: S.time.year, minutes: S.time.minutes,
      createdAt: now.getTime(),
      reflection,
    };
    S.journal.unshift(record);
    S.stats.journalEntries = S.journal.length;
    SAN.quests.notify('journal', 'any', 1);
    SAN.progression.addXp('exploration', 6);
    SAN.progression.checkAchievements();
    SAN.audio.sfx('page');
    S.tutorial.journaled = true;
    SAN.save.autosave();
    return record;
  };

  J.remove = function (id) {
    const S = SAN.state.S;
    const i = S.journal.findIndex((e) => e.id === id);
    if (i >= 0) { S.journal.splice(i, 1); return true; }
    return false;
  };

  J.list = function (filter) {
    const S = SAN.state.S;
    const f = filter || {};
    let list = S.journal.slice();
    if (f.mood) list = list.filter((e) => e.mood === f.mood);
    if (f.tag) list = list.filter((e) => (e.tags || []).includes(f.tag));
    if (f.q) {
      const q = f.q.toLowerCase();
      list = list.filter((e) => e.text.toLowerCase().includes(q) || (e.tags || []).join(' ').toLowerCase().includes(q));
    }
    return list;
  };

  J.exportData = function () {
    const S = SAN.state.S;
    return JSON.stringify({
      game: 'Sanctuary: Echoes of Self',
      exported: new Date().toISOString(),
      note: 'Private journal export. Only you have this file.',
      entries: S.journal,
      memories: S.memories,
    }, null, 2);
  };

  J.moodDef = (id) => SAN.data.moods.find((m) => m.id === id) || SAN.data.moods[8];
  J.moodLabel = (id) => (J.moodDef(id) || {}).label || id;
})();
