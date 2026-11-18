/* Main Character — single source of truth for the official reference artwork.
   Every screen reads from here; nothing draws a second, generic version. */
(function () {
  window.SAN = window.SAN || {};
  SAN.data = SAN.data || {};

  SAN.data.mainCharacter = {
    id: 'main_character',
    name: 'Elara',
    // full body: character creation, wardrobe, profile, any full-figure scene
    fullBody: 'assets/characters/main/fullbody.png',
    // face: dialogue, NPC interaction, reactions, story scenes
    expressions: {
      neutral: 'assets/characters/main/expressions/neutral.png',
      happy: 'assets/characters/main/expressions/happy.png',
      sad: 'assets/characters/main/expressions/sad.png',
      surprised: 'assets/characters/main/expressions/surprised.png',
      embarrassed: 'assets/characters/main/expressions/embarrassed.png',
      thinking: 'assets/characters/main/expressions/thinking.png',
      angry: 'assets/characters/main/expressions/angry.png',
      thanking: 'assets/characters/main/expressions/thanking.png',
    },
  };
})();
