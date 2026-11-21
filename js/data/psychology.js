/* Sanctuary — character psychology.
   Nine distinct interior lives: strengths, flaws with story context, wounds,
   attachment tendencies, emotional triggers with responses and recovery paths,
   defences, love languages, boundaries, insecurities and growth goals.

   These are narrative tendencies, never diagnoses, and never an excuse for
   manipulation or cruelty. Every flaw has a place it came from and a way it can
   soften. */
(function () {
  const D = SAN.data || (SAN.data = {});
  const P = (D.psychology = {});

  P.LOVE_LANGUAGES = {
    words: 'Words of Affirmation',
    service: 'Acts of Service',
    gifts: 'Receiving Gifts',
    time: 'Quality Time',
    touch: 'Physical Touch',
  };

  P.ATTACHMENTS = {
    secure: {
      name: 'Secure',
      blurb: 'Can ask for closeness and tolerate space without reading either as rejection.',
    },
    anxious: {
      name: 'Anxious',
      blurb: 'Reaches for reassurance quickly, and fears being too much.',
    },
    avoidant: {
      name: 'Avoidant',
      blurb: 'Protects independence by withdrawing first, then misses the company.',
    },
    fearful: {
      name: 'Fearful-avoidant',
      blurb: 'Wants closeness and distrusts it at the same time; approaches, then retreats.',
    },
  };

  P.profiles = {};

  P.profiles.nyssa = {
    positive: ['Patient beyond human years', 'Deeply attentive', 'Protective of the small'],
    negative: ['Overprotective', 'Slow to trust', 'Tends to control situations'],
    wound: 'She has watched generations arrive, love the village, and leave it. She learned to hold the whole place in her hands because letting go meant losing it.',
    attachment: 'anxious',
    triggers: [
      {
        id: 'nyssa_unneeded',
        label: 'Being treated as a monument instead of a person',
        response: 'She becomes formal and distant, answers in blessings, and stops asking questions.',
        recovery: 'Ask her opinion about something small and personal, then actually use it.',
      },
      {
        id: 'nyssa_reckless',
        label: 'Someone risking themselves needlessly',
        response: 'Her voice drops, the light dims, and she starts arranging your day for you.',
        recovery: 'Name the fear out loud and thank her for it before setting your own limit.',
      },
    ],
    defenses: ['Speaks in riddles when she is hurt', 'Takes responsibility for everything', 'Watchful silence'],
    loveLanguage: { primary: 'time', secondary: 'words' },
    boundaries: { touch: 'Only when the village is not watching', privacy: 'Her grove is hers; ask before entering', pace: 'She needs weeks, not days' },
    insecurities: ['Being replaceable', 'Being feared instead of loved', 'That her care is a burden'],
    growth: [
      'Let others carry part of the village',
      'Say "I need" instead of "you should"',
      'Allow one person to see her uncertain',
    ],
    flaws: ['Overprotective', 'Difficulty trusting others', 'Tendency to control situations'],
  };

  P.profiles.lucien = {
    positive: ['Quietly dependable', 'Mature under pressure', 'Observant of small changes'],
    negative: ['Emotionally withdrawn', 'Struggles to show vulnerability', 'Isolates when overwhelmed'],
    wound: 'His mother left in spring without a goodbye. He decided the lamp was a safer promise than a person, because ships cannot choose to leave him personally.',
    attachment: 'avoidant',
    triggers: [
      {
        id: 'lucien_ignored',
        label: 'Opening up, then being ignored',
        response: 'He goes quiet, keeps to the lamp room, and answers in practical sentences.',
        recovery: 'Come back without demanding an explanation, and give him space to choose to talk.',
      },
      {
        id: 'lucien_pity',
        label: 'Being pitied rather than respected',
        response: 'He straightens, changes the subject, and finds work that needs doing elsewhere.',
        recovery: 'Treat what he shared as information, not a wound to fix.',
      },
    ],
    defenses: ['Duty as a hiding place', 'Practical talk instead of feeling', 'Long shifts alone'],
    loveLanguage: { primary: 'service', secondary: 'time' },
    boundaries: { touch: 'Fine in private; hesitant in public', privacy: 'Do not read his letters without asking', pace: 'He needs the door left open, not pushed' },
    insecurities: ['That he is only worth the light he keeps', 'That people leave when the weather turns', 'Being a burden'],
    growth: [
      'Ask for company instead of waiting to be found',
      'Say the feeling before the practical sentence',
      'Let someone else light the lamp once',
    ],
    flaws: ['Emotionally withdrawn', 'Difficulty expressing vulnerability', 'Tendency to isolate himself'],
  };

  P.profiles.elowen = {
    positive: ['Gentle and patient', 'Notices what others miss', 'Steady in a crisis'],
    negative: ['People-pleasing', 'Cannot say no', 'Swallows disappointment'],
    wound: 'He learned that being needed was the price of being kept, so he made himself useful before he made himself known.',
    attachment: 'anxious',
    triggers: [
      {
        id: 'elowen_unappreciated',
        label: 'Effort going unnoticed',
        response: 'He says it is fine, works harder, and grows quieter with every kindness he gives away.',
        recovery: 'Name the specific thing he did and share the work instead of praising from a distance.',
      },
      {
        id: 'elowen_overruled',
        label: 'Being spoken over in his own greenhouse',
        response: 'He steps back, apologises for the mess, and lets someone else decide.',
        recovery: 'Ask what he wants for the beds, and wait for the actual answer.',
      },
    ],
    defenses: ['Apologising first', 'Offering help instead of asking', 'Keeping disappointment behind a smile'],
    loveLanguage: { primary: 'words', secondary: 'service' },
    boundaries: { touch: 'Not in public; ask first, always', privacy: 'The shed is his; knock', pace: 'He needs to be believed, not hurried' },
    insecurities: ['That he is only welcome while useful', 'Being a burden', 'That his work is ordinary'],
    growth: [
      'Say no once and survive it',
      'Let someone help before he is desperate',
      'Ask for what he wants, not what is needed',
    ],
    flaws: ['People pleasing', 'Difficulty saying no', 'Suppresses disappointment'],
  };

  P.profiles.rowan = {
    positive: ['Sincere', 'Generous with his time', 'Thinks things through'],
    negative: ['Stubborn', 'Refuses help', 'Defensive when criticised'],
    wound: 'He was the one who was always fine, so he never learned what to do when he was not. Asking for help still sounds like admitting he broke something.',
    attachment: 'fearful',
    triggers: [
      {
        id: 'rowan_criticised',
        label: 'Being told he did it wrong in front of others',
        response: 'He argues the details, then replays the conversation all night and apologises for the wrong thing.',
        recovery: 'Criticise the problem, not him, in private, and offer to do the next part together.',
      },
      {
        id: 'rowan_helped',
        label: 'Help arriving unasked',
        response: 'He insists he had it handled, even while clearly not having it handled.',
        recovery: 'Ask "would you like a hand?" and accept the first no without leaving.',
      },
    ],
    defenses: ['Explaining instead of feeling', 'Redoing things alone at night', 'Deflecting with self-deprecation'],
    loveLanguage: { primary: 'words', secondary: 'time' },
    boundaries: { touch: 'Fine with company nearby, startled by sudden contact', privacy: 'The notebook is private until he offers it', pace: 'He needs to arrive at things himself' },
    insecurities: ['Being unreliable', 'Being seen as foolish', 'That people only stay while he is useful'],
    growth: [
      'Accept help on the first offer',
      'Say "that hurt" instead of arguing the facts',
      'Let a mistake be a mistake',
    ],
    flaws: ['Stubborn', 'Difficulty accepting help', 'Defensive when criticised'],
  };

  P.profiles.mira = {
    positive: ['Warm', 'Funny', 'Fiercely loyal'],
    negative: ['Impulsive', 'Hides sadness behind humour', 'Seeks reassurance when insecure'],
    wound: 'She was the one who kept the room light when things were bad at home. Now she does not know how to be sad without apologising for it.',
    attachment: 'anxious',
    triggers: [
      {
        id: 'mira_abandoned',
        label: 'Being left alone exactly when she needs company',
        response: 'She jokes harder, bakes too much, and says she is fine in a voice that is not fine.',
        recovery: 'Stay without making it a performance, and ask twice how she actually is.',
      },
      {
        id: 'mira_toomuch',
        label: 'Feeling like her feelings are too much',
        response: 'She turns the whole thing into a joke and changes the subject to bread.',
        recovery: 'Laugh with her, then say you were listening to the part underneath.',
      },
    ],
    defenses: ['Humour as a door', 'Feeding people instead of talking', 'Busy hands'],
    loveLanguage: { primary: 'words', secondary: 'gifts' },
    boundaries: { touch: 'Warm and easy in private', privacy: 'The kitchen is hers; share it, do not take it over', pace: 'She moves fast, but asks before assuming' },
    insecurities: ['Being too much', 'Being forgettable', 'That her sadness is inconvenient'],
    growth: [
      'Say "I am not okay" without a punchline',
      'Let someone else take care of the room',
      'Ask for reassurance before it becomes a test',
    ],
    flaws: ['Impulsive', 'Hides sadness behind humor', 'Seeks reassurance when insecure'],
  };

  P.profiles.celeste = {
    positive: ['Precise', 'Generous with beauty', 'Quietly brave'],
    negative: ['Perfectionistic', 'Self-critical', 'Cannot forgive her own mistakes'],
    wound: 'She was praised only for things that were flawless, so she learned to hide the flawed parts of herself in the back of the shop.',
    attachment: 'avoidant',
    triggers: [
      {
        id: 'celeste_mistake',
        label: 'A mistake being noticed',
        response: 'She apologises too much, fixes it three times, and stops showing unfinished work.',
        recovery: 'Point out something she did well in the same breath, and let the mistake stay small.',
      },
      {
        id: 'celeste_unfinished',
        label: 'Being seen before she is ready',
        response: 'She blocks the doorway, literally or otherwise, and talks about the weather.',
        recovery: 'Wait to be invited, and do not treat the waiting as rejection.',
      },
    ],
    defenses: ['Tidying instead of feeling', 'Correcting herself out loud', 'Keeping people at the counter'],
    loveLanguage: { primary: 'words', secondary: 'time' },
    boundaries: { touch: 'Ask; she startles', privacy: 'The workroom is invitation only', pace: 'Slow, careful, then suddenly certain' },
    insecurities: ['Being a disappointment', 'Being ordinary', 'That love is conditional on output'],
    growth: [
      'Show something unfinished',
      'Accept a compliment without correcting it',
      'Let one thing be good enough',
    ],
    flaws: ['Perfectionistic', 'Self-critical', 'Difficulty accepting mistakes'],
  };

  P.profiles.theo = {
    positive: ['Perceptive', 'Resourceful', 'Kind under the patter'],
    negative: ['Avoids vulnerability', 'Uses humour defensively', 'Becomes strategic in conflict'],
    wound: 'He learned that being charming was safer than being known, because the charming version never had to be left.',
    attachment: 'avoidant',
    triggers: [
      {
        id: 'theo_pinned',
        label: 'Being cornered into a sincere answer',
        response: 'He turns it into a story, a joke, or a very good deal, and leaves before the question repeats.',
        recovery: 'Offer a smaller question, and let him answer it in his own time.',
      },
      {
        id: 'theo_outmaneuvered',
        label: 'Losing control of a negotiation',
        response: 'He gets clever and a little cold, and starts calculating instead of listening.',
        recovery: 'Say plainly that you are not trying to win, and ask what he is afraid of losing.',
      },
    ],
    defenses: ['Charm', 'Changing the subject with a story', 'Always having an exit'],
    loveLanguage: { primary: 'gifts', secondary: 'words' },
    boundaries: { touch: 'Surprisingly careful; asks first', privacy: 'His cart and his past are his to tell', pace: 'He needs to choose to stay' },
    insecurities: ['Being known and then left', 'Being ordinary', 'That he is only liked for what he brings'],
    growth: [
      'Answer one honest question without a joke',
      'Stay after the conversation gets difficult',
      'Let someone give him something he cannot repay',
    ],
    flaws: ['Avoids emotional vulnerability', 'Uses humor defensively', 'Can become overly strategic in conflict'],
  };

  P.profiles.aria = {
    positive: ['Thoughtful', 'Exact', 'Loyal in quiet ways'],
    negative: ['Overthinks', 'Withdraws under stress', 'Struggles to state emotional needs'],
    wound: 'She was the child who explained everything correctly and was still misunderstood, so she started rehearsing conversations before having them.',
    attachment: 'fearful',
    triggers: [
      {
        id: 'aria_misread',
        label: 'Being misunderstood after careful explanation',
        response: 'She goes silent, returns to the shelves, and rewrites the conversation in her head for days.',
        recovery: 'Ask what she meant, and repeat it back until she nods.',
      },
      {
        id: 'aria_crowd',
        label: 'Too many people needing answers at once',
        response: 'She excuses herself to the back room and does not come out until closing.',
        recovery: 'Make the room smaller: one question, one person, no audience.',
      },
    ],
    defenses: ['Facts instead of feelings', 'Rehearsing', 'Retreating to the stacks'],
    loveLanguage: { primary: 'time', secondary: 'words' },
    boundaries: { touch: 'Rarely, and only when she initiates', privacy: 'Her notebook is not a public record', pace: 'She needs to finish a thought' },
    insecurities: ['Being tedious', 'Being misunderstood', 'That her feelings are an inconvenience'],
    growth: [
      'Say the need before the explanation',
      'Ask for company instead of waiting to be noticed',
      'Let a sentence be imperfect',
    ],
    flaws: ['Overthinking', 'Social withdrawal under stress', 'Difficulty communicating emotional needs'],
  };

  P.profiles.finn = {
    positive: ['Easy-going', 'Practical', 'Unshakably calm in bad weather'],
    negative: ['Avoids conflict', 'Inconsistent follow-through', 'Jokes to escape discomfort'],
    wound: 'He grew up in a house where arguments were weather, so he learned to wait them out and never quite finish the difficult sentence.',
    attachment: 'avoidant',
    triggers: [
      {
        id: 'finn_confronted',
        label: 'Being confronted directly about a broken promise',
        response: 'He laughs it off, agrees to everything, and then misses the next thing too.',
        recovery: 'Make the ask small and concrete, and notice out loud when he follows through.',
      },
      {
        id: 'finn_pressure',
        label: 'Feeling trapped in a conversation',
        response: 'He suddenly remembers the tide, the nets, or the boat.',
        recovery: 'Give him an exit and a time to come back; he usually does.',
      },
    ],
    defenses: ['Jokes', 'Agreeing without committing', 'Going fishing'],
    loveLanguage: { primary: 'service', secondary: 'touch' },
    boundaries: { touch: 'Casual, but ask before anything serious', privacy: 'The boat is his quiet place', pace: 'He moves at tide speed' },
    insecurities: ['Being a disappointment', 'Being tied down', 'That he has nothing interesting to say'],
    growth: [
      'Finish one difficult sentence',
      'Show up when he said he would',
      'Let someone see him try and fail',
    ],
    flaws: ['Conflict avoidance', 'Inconsistent follow-through', 'Uses humor to escape uncomfortable conversations'],
  };
})();
