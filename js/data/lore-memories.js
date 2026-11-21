/* Sanctuary — backstory memory registry.
   Each memory is a keepsake the player can be shown: a photograph, a letter,
   a page from a diary, an object. Unlocks are earned through friendship,
   romance, items found in the world, seasons, or story flags — never all at
   once. Illustrations are composed from the official character artwork over
   an existing painted plate; no new character artwork is invented here. */
(function () {
  const D = SAN.data || (SAN.data = {});
  const M = (D.loreMemories = []);
  const add = (m) => M.push(m);

  add({
    id: 'mem_lucien_photo', npc: 'lucien', kind: 'photo',
    title: 'Two People by a Lighthouse', date: 'Year -18, Autumn', place: 'Hallowmere',
    plate: 'lighthouse-night', unlock: { friend: 21 },
    summary: 'A photograph in Lucien\'s drawer: his father, young, standing beside a keeper who is not Old Bram. On the back, in his mother\'s hand: "The sea is not the only thing that keeps people apart."',
    pages: [
      { speaker: 'lucien', text: '"That is my father. He never told me he had been here. I found the charter in his desk the year after he died."' },
      { speaker: 'lucien', text: '"I think he wanted me to find it. I think he was afraid I would. Both can be true."' },
    ],
  });

  add({
    id: 'mem_lucien_letters', npc: 'lucien', kind: 'letter',
    title: 'The Drawer of Unsent Letters', date: 'Year -4 to now', place: 'The Lighthouse',
    plate: 'lighthouse-night', unlock: { friend: 41 },
    summary: 'Nine letters to Ilse, none sent, each shorter than the last. The most recent has only one line: "The chime broke. I have not replaced it."',
    pages: [
      { speaker: 'lucien', text: '"I write them so I do not say it out loud to someone who did not ask."' },
      { speaker: 'lucien', text: '"You can read one. Not the last one. The last one is still true."' },
    ],
  });

  add({
    id: 'mem_celeste_drawing', npc: 'celeste', kind: 'keepsake',
    title: 'A Drawing Turned to the Wall', date: 'Year -5, Winter', place: 'Above the Flower Shop',
    plate: 'garden', unlock: { friend: 21 },
    summary: 'A botanical study of a bluebell, accurate to the vein, with a second stem drawn badly in the margin. The bad one is the only part she has ever liked.',
    pages: [
      { speaker: 'celeste', text: '"That is the only honest thing I have drawn. The rest is practice."' },
      { speaker: 'celeste', text: '"You are looking at it too long. That is — thank you. That is all."' },
    ],
  });

  add({
    id: 'mem_celeste_letter', npc: 'celeste', kind: 'letter',
    title: 'Ilse\'s Handwriting', date: 'Year -4, Spring', place: 'The Flower Shop',
    plate: 'beach-sunset', unlock: { friend: 41 },
    summary: 'A copy of a letter Celeste never sent: she recognised Ilse\'s hand on the washed-up page and wrote to ask whether Lucien knew. She did not post it.',
    pages: [
      { speaker: 'celeste', text: '"I have carried this for four years. It is not a secret I wanted. It is one I did not know how to put down."' },
      { speaker: 'celeste', text: '"If you think he should know, I will tell him. I would rather not do it alone."' },
    ],
  });

  add({
    id: 'mem_elowen_letter', npc: 'elowen', kind: 'letter',
    title: 'The Unopened School Letter', date: 'Year -7, Spring', place: 'The Greenhouse',
    plate: 'greenhouse', unlock: { friend: 41 },
    summary: 'A seed tin holds a letter from the Meridian horticultural school, unopened for seven years. The envelope is soft from being carried.',
    pages: [
      { speaker: 'elowen', text: '"I know what it says. It says no. Or it says yes and I did not go, which is worse."' },
      { speaker: 'elowen', text: '"You can open it. I do not think I can. Not today."' },
    ],
  });

  add({
    id: 'mem_elowen_roof', npc: 'elowen', kind: 'diary',
    title: 'The Toolshed Notebook', date: 'Year -2, Winter', place: 'The Shared Greenhouse',
    plate: 'greenhouse', unlock: { friend: 21 },
    summary: 'A page of measurements, then a line in different ink: "Fixed it. Badly. Nobody has to know." The next page is a list of plants that survived.',
    pages: [
      { speaker: 'elowen', text: '"I wrote it down so it would stop being in my head."' },
      { speaker: 'elowen', text: '"The plants survived. I keep thinking about that instead of the roof."' },
    ],
  });

  add({
    id: 'mem_rowan_watch', npc: 'rowan', kind: 'keepsake',
    title: 'The Pocket Watch in the Flour Bin', date: 'Year -12, Autumn', place: 'The Windmill',
    plate: 'village-square', unlock: { friend: 21 },
    summary: 'His father\'s watch, stopped at 4:40. Rowan keeps it where the flour is cool and dry, which is the most sentimental thing he has ever done.',
    pages: [
      { speaker: 'rowan', text: '"It stopped the morning he died. I have not had it fixed. I do not want it to be right."' },
      { speaker: 'rowan', text: '"Do not tell anyone I keep it in the flour. It is practical. It is dry in there."' },
    ],
  });

  add({
    id: 'mem_rowan_invoice', npc: 'rowan', kind: 'letter',
    title: 'The Repair Invoice', date: 'Year -1, Autumn', place: 'The Windmill',
    plate: 'village-square', unlock: { friend: 41 },
    summary: 'An invoice for the main gear, unpaid, with a payment plan written in Rowan\'s hand and crossed out four times. The sums do not leave enough for food.',
    pages: [
      { speaker: 'rowan', text: '"I have it handled." A pause. "I have it handled badly. There is a difference and I know it."' },
      { speaker: 'rowan', text: '"If you offer to pay, I will say no. If you ask to help with the accounts, I might say yes. I do not know why that is different."' },
    ],
  });

  add({
    id: 'mem_mira_ring', npc: 'mira', kind: 'keepsake',
    title: 'The Ring in the Flour Jar', date: 'Year -16, Summer', place: 'The Bakery',
    plate: 'bakery', unlock: { friend: 21 },
    summary: 'An engagement ring in a jar of flour, kept for eight years. She says she does not know why. The jar is labeled, in her handwriting, "not for bread".',
    pages: [
      { speaker: 'mira', text: '"I am not waiting for him. I am waiting to understand why I stayed so long pretending."' },
      { speaker: 'mira', text: '"Do not make the face. I am allowed one dramatic jar."' },
    ],
  });

  add({
    id: 'mem_mira_father', npc: 'mira', kind: 'letter',
    title: 'A Card at New Year', date: 'Year -1, Winter', place: 'The Bakery',
    plate: 'bakery', unlock: { friend: 41 },
    summary: 'Her father\'s New Year card, kept with the address of a town she has never visited. On the back, a draft reply in her handwriting that stops after "I am".',
    pages: [
      { speaker: 'mira', text: '"I get as far as saying I am something and then I do not know what I am."' },
      { speaker: 'mira', text: '"Do not tell me to just go. I know I should. Knowing is not the hard part."' },
    ],
  });
  add({
    id: 'mem_theo_cart', npc: 'theo', kind: 'keepsake',
    title: 'The Varen Cart Plate', date: 'Year -12, Autumn', place: 'Ashford Cross',
    plate: 'village-square', unlock: { friend: 21 },
    summary: 'A brass plate from the family cart, kept in his coat. The business it belongs to no longer exists; he polishes it anyway.',
    pages: [
      { speaker: 'theo', text: '"Three generations on the same road. And then me, with a plate and no shop."' },
      { speaker: 'theo', text: '"It is not a sad story. It is a very well-travelled one. Please laugh."' },
    ],
  });

  add({
    id: 'mem_theo_winter', npc: 'theo', kind: 'letter',
    title: 'The Greyford Receipts', date: 'Year 1, Winter', place: 'Greyford',
    plate: 'teashop', unlock: { friend: 41 },
    summary: 'Receipts in his brother\'s hand, made out to "T. Varen, unpaid". He has been working the winter shop for six years without wages and telling the village he was on a road.',
    pages: [
      { speaker: 'theo', text: '"You found the boring secret. I would have preferred you found a dramatic one."' },
      { speaker: 'theo', text: '"Emil never asked me to. That is the part I cannot explain. I owe him a business I did not save."' },
    ],
  });

  add({
    id: 'mem_aria_report', npc: 'aria', kind: 'diary',
    title: 'The Faculty Report', date: 'Year -10, Spring', place: 'Meridian',
    plate: 'library', unlock: { friend: 21 },
    summary: 'Four pages, one conclusion: "insufficient evidence of intent." Her notes are in the margin, not angry, just very small and very exact.',
    pages: [
      { speaker: 'aria', text: '"I have read it perhaps two hundred times. It does not change. I keep expecting it to."' },
      { speaker: 'aria', text: '"The margin notes are the only part that is mine."' },
    ],
  });

  add({
    id: 'mem_aria_box', npc: 'aria', kind: 'letter',
    title: 'The First Line of the Box', date: 'Year -1, Winter', place: 'The Library',
    plate: 'library', unlock: { friend: 61 },
    summary: 'She read one line of one letter in Maren\'s box and stopped: "I am sorry I never told you about the ninth." The rest is still folded.',
    pages: [
      { speaker: 'aria', text: '"Maren asked me to keep a thing without owning it. I did not know she meant this."' },
      { speaker: 'aria', text: '"I think the village is allowed to know. I do not think I am allowed to decide alone."' },
    ],
  });

  add({
    id: 'mem_finn_hook', npc: 'finn', kind: 'keepsake',
    title: 'The Star Hook', date: 'Year -29, Winter', place: 'The Shore',
    plate: 'beach-sunset', unlock: { item: 'star_hook' },
    summary: 'A brass hook with a star stamped into the shank, found in the wreck years after his father drowned. Finn says it is the last thing that was "actually his".',
    pages: [
      { speaker: 'finn', text: '"It was in his pocket. The sea gave it back, which is more than it did for him."' },
      { speaker: 'finn', text: '"You can hold it. Careful. It is not fragile, I am."' },
    ],
  });

  add({
    id: 'mem_finn_jacket', npc: 'finn', kind: 'diary',
    title: 'His Father\'s Jacket', date: 'Year -29, Winter', place: 'The Boathouse',
    plate: 'beach-sunset', unlock: { friend: 41 },
    summary: 'A ruined oilskin jacket in the shed, taken out when the weather turns. He has never repaired it and never thrown it away.',
    pages: [
      { speaker: 'finn', text: '"I do not wear it. I just check it is still here."' },
      { speaker: 'finn', text: '"That is not the same as grieving. My sister says it is. My sister is usually right."' },
    ],
  });

  add({
    id: 'mem_nyssa_page', npc: 'nyssa', kind: 'keepsake',
    title: 'The Cut Page', date: 'Year -176, Autumn', place: 'The Well',
    plate: 'village-square', unlock: { friend: 41 },
    summary: 'The missing ledger page, kept inside a loose stone in the well: the ninth household, and the words Elspeth wrote before she scraped the name away.',
    pages: [
      { speaker: 'nyssa', text: '"Sable Wren. She left after a quarrel about water, which is always about something else."' },
      { speaker: 'nyssa', text: '"Her house was left empty. You are sleeping in it. I did not arrange that. I only did not stop it."' },
    ],
  });

  add({
    id: 'mem_nyssa_promise', npc: 'nyssa', kind: 'letter',
    title: 'What Was Asked of Her', date: 'Year -180, Spring', place: 'The Well',
    plate: 'village-square', unlock: { friend: 61 },
    summary: 'Not a written promise. A memory: Elspeth Wren, dying, holding the well stones and saying, "Keep them kind. Not safe. Kind." Nyssa has never been sure she understood the difference.',
    pages: [
      { speaker: 'nyssa', text: '"I have spent a hundred and eighty years keeping a village safe and calling it kindness."' },
      { speaker: 'nyssa', text: '"I would like to learn the difference while there are still people here to practise on."' },
    ],
  });

  add({
    id: 'mem_cottage_ledger', npc: 'nyssa', kind: 'diary',
    title: 'Maren\'s Last Page', date: 'Year -1, Winter', place: 'The Cottage',
    plate: 'cottage-day', unlock: { friend: 21, season: 3, npc: 'nyssa' },
    summary: 'The final page of the village ledger, found in the cottage desk: the house is left to "the one who comes asking", with a second line in a shakier hand: "They will need a place that does not require them to be anyone yet."',
    pages: [
      { speaker: 'narrator', text: 'The ink has soaked into the paper unevenly. She wrote it slowly, and she wrote it for you.' },
      { speaker: 'nyssa', text: '"She did not tell me she had done it. She knew I would have argued about the phrasing."' },
    ],
  });

  add({
    id: 'mem_grove_stones', npc: 'nyssa', kind: 'place',
    title: 'The Stones Under the Roots', date: 'Year -176, Autumn', place: 'The Hidden Grove',
    plate: 'meadow', unlock: { flag: 'grove_open' },
    summary: 'The grove\'s three stones were raised by Sable Wren, the founder erased from the charter. The order — moth, wave, leaf — is not a lock. It is a name.',
    pages: [
      { speaker: 'narrator', text: 'In the oldest carving, under moss: a moth for the one who left, a wave for the ones who stayed, a leaf for what grew over the quarrel.' },
      { speaker: 'nyssa', text: '"She was not written out because she was wicked. She was written out because it was easier than being wrong in public."' },
    ],
  });

})();
