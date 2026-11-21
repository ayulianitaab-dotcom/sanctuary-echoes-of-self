# Sanctuary: Echoes of Self — Lore Bible

The canonical background for the village, its nine residents and the main character.
Everything here is data in `js/data/lore-*.js` and read by `js/systems/lore.js`; this
document is the human-readable index, not a second source of truth.

Story clock: **Spring, Year 1** is the player's arrival. Anything earlier is written
`Year -N`. Ages are ages at Spring 1; a character with a birthday later in the year is
still one year younger than `1 - birthYear`.

New material written for this system is flagged in the data (`docs` here, `reveal`
layers there). Nothing previously established in `life.js`, `npcs.js`, quest text or the
official registry was removed; the old hints were extended into full lives.

---

## 1. Deliverables and where they live

| # | Deliverable | Where |
|---|---|---|
| 1 | Main character biography | `lore-characters.js` → `L.mc`, `L.ORIGIN_LINES`, `L.REASONS` |
| 2 | Biographies for all 9 NPCs (30 fields each) | `lore-characters.js` → `L.characters` |
| 3 | Childhood / teenage history | `childhood`, `teens`, `memories` per character |
| 4 | Family relationship maps | `family` per character; `L.history` for the village web |
| 5 | Moving-to-Sanctuary history | `arrival` per character |
| 6 | Years-in-town records | `arrival.years`, validated against the master timeline |
| 7 | Master world timeline | `lore-world.js` → `W.TIMELINE` (sorted newest first) |
| 8 | Founding history & places | `W.PLACES`, `W.HISTORICAL_EVENTS`, `W.TRADITIONS` |
| 9 | Relationship history map | `L.history` (since, how, conflict, now) |
| 10 | Main story connection map | `L.STORY_LINKS`, `W.ARC` |
| 11 | Development arcs | `arc` per character, `W.ARC.beats` |
| 12 | Backstory event list | `lore-memories.js` → 20 memories |
| 13 | Memory journal structure | `SAN.memoryBook` + `SAN.lore` (unlocked map) |

---

## 2. Who lives here, and for how long

| Character | Age | Born | Home | In Sanctuary |
|---|---|---|---|---|
| Nyssa | ageless (appears ~30) | at the well, Year -176 | the square | 176 years |
| Lucien Vey | 27 | Hallowmere, Year -27 | lighthouse | 8 years |
| Elowen Marchetti | 24 | Sanctuary, Year -24 | greenhouse | all his life |
| Rowan Ashcombe | 25 | Sanctuary, Year -25 | windmill | all his life |
| Mira Marchetti | 32 | Greyford, Year -32 | bakery | 14 years |
| Celeste Wren | 35 | Sanctuary, Year -35 | flower shop | all her life, 4 years away at school |
| Theo Varen | 30 | Ashford Cross, Year -30 | the cart | 6 years of visits, no fixed address |
| Aria Quill | 29 | Meridian, Year -29 | library | 9 years |
| Finn Callas | 41 | Sanctuary, Year -41 | the shore | all his life |

Native: Nyssa, Elowen, Rowan, Celeste, Finn. Settlers: Lucien, Mira, Aria, and Theo
(who has never quite settled).

---

## 3. The village — Sanctuary

Founded **180 years ago** by nine households displaced by a flood, around a spring that
never froze. The oldest structure is the well; the founders left the forest grove out of
the first map on purpose.

- **Lighthouse** (Year -122): raised after the wreck of the *Merrow*, funded by the
  families of the drowned. One rule has survived: the lamp goes dark for weather, never
  for a person.
- **Windmill** (Year -96): Ashcombe mill; gears cut without plans, which is why every
  repair is an argument.
- **Greenhouse** (Year -74): bought for a physician who left it to the village rather
  than a family. Worked in common ever since.
- **Bakery** (Year -61): Odile Marchetti's oven, and the unpaid page she never collected.
- **Flower shop** (Year -58): Marigold Wren's cutting garden after the influenza winter;
  the language of flowers as a way to say what cannot be said.
- **Library** (Year -49): Maren Vale's reading room and the village ledger.
- **Shore & huts** (Year -170): fishing predates building; rebuilt after the storm of
  Year -33.
- **Tea shop** (Year -44): opened by a retired keeper who could not sleep without a light.
- **Hidden grove** (older than the village): three stones; order of moth, wave, leaf.

**Traditions:** First Lantern (Spring 1), Bread for the Unpaid Page, Flowers to the
Light, the Fence Mending, Names at the Roots.

**Central mystery — The Ledger of Kept Things:** the village survives by keeping what
people ask it to forget. The founding charter names nine households; only eight are
listed in the cemetery. The missing founder, **Sable Wren**, left after a quarrel over
the well; her house is the cottage the player inherits. Nyssa keeps the cut page in the
well. Aria keeps the box of letters Maren was asked to forget. The player's arrival is
the first time in a century that anyone has come asking.

---

## 4. Main character

The official design and the cottage are fixed. The past is chosen at creation:

- **What you carried:** Tidewatcher, Gardener, Archivist — each with its own previous
  life text, starting inventory and expectation (`L.ORIGIN_LINES`).
- **Why you came:** A fresh start · A family connection · The cottage you inherited ·
  A place to breathe · An opportunity (`L.REASONS`).

The choice is stored as `player.reason`, appears in the intro ledger line, and is read by
the codex ("You" section). Nothing about gender or pronouns changes the available past.

Great-aunt **Maren Vale** kept the ledger for forty years, left the cottage to "whoever
comes asking", and wrote: *"They will need a place that does not require them to be
anyone yet."*

---

## 5. Character reveal layers

Each person has five gated layers; the profile and codex show only what is earned.

| Depth | Unlocked by | What you learn |
|---|---|---|
| 0 | meeting | name, age, work, manner |
| 21 | friendship 21 | family, childhood, first memory |
| 41 | friendship 41 or dating | teenage years, wounds, insecurities, how they love |
| 61 | friendship 61 or committed | secrets, what they are working towards |
| 81 | friendship 81 | the deepest reframe |

Memories use the same gates and add item/flag/season conditions. Reveals happen through
conversation ("Ask about their past"), a cinematic plate, and a Memory Journal entry.
Nothing is dumped at once.

---

## 6. Relationship history map (summary)

Full text with dates in `L.history` (14 pairs). Highlights:

- **Lucien & Finn** (Year -8): knots on a wet morning; quiet friendship.
- **Lucien & Celeste** (Year -13): flowers every spring; she recognised Ilse's handwriting
  on the washed-up letter and said nothing. He knows too.
- **Lucien & Nyssa** (Year -8): she was there the night he arrived.
- **Mira & Rowan** (Year -12): bread at the mill; old friends.
- **Mira & Theo** (Year -6): unresolved, with an expiry date neither names.
- **Rowan & Aria** (Year -5): late books, friendly friction.
- **Elowen & Celeste** (Year -3): soil, cuttings, overpayment.
- **Elowen & Nyssa** (Year -24): she sat with him the week his grandmother died.
- **Aria & Celeste** (Year -9): two people guarding the same kind of thing.
- **Aria & Nyssa** (Year -9): trust, and one withheld story.
- **Theo & Finn** (Year -6): rivalry that is gratitude with nowhere to go.

---

## 7. Development arcs

Nyssa: guardian-as-wall → guardian-as-witness. · Lucien: withdrawal → trusting closeness.
· Elowen: service as self-erasure → boundaries. · Rowan: self-sufficiency → accepting
help. · Mira: cheerfulness as armour → visible sadness. · Celeste: perfectionism as
penance → accepting imperfection. · Theo: charm as escape → honest presence. · Aria:
overthinking → plain speech. · Finn: conflict avoidance → directness.

Arcs are tracked through trust/safety/resentment, not switches; see `psychology.js`.

---

## 8. Memory registry

20 entries in `lore-memories.js`: photographs, letters, keepsakes, diary pages, places.
Each has a date, place, summary, two-to-three dialogue pages, a plate, and an unlock
condition (friendship, romance stage, item, flag, season). Unlocking writes to
`SAN.memoryBook` with `kind: 'lore'` and a stable key, so it survives save/reload and
never duplicates.

Examples: *Two People by a Lighthouse* (Lucien, 21), *The Ring in the Flour Jar* (Mira,
21), *The Unopened School Letter* (Elowen, 41), *The Cut Page* (Nyssa, 41), *The Star
Hook* (Finn, needs the item), *The Stones Under the Roots* (needs `grove_open`).

---

## 9. Illustrations and honesty about them

Backstory plates are **composited at runtime** from the official character artwork over
an existing painted location plate (`SAN.scenes.build`, category `memory`). No new
character image is generated, so faces, hair, eyes, clothing and gender cannot drift.

Dedicated flashback artwork (child versions of characters) is **not generated** by this
build. The text-to-image tool available here cannot take the official references, and
using it would break the identity rule. The queue entry in
`docs/reference/VISUAL-ART-QUEUE.md` lists exactly what a reference-capable provider must
receive. Until then the composite is shown and labelled as a composed scene, not as new
artwork.

---

## 10. Checks

`SAN.lore.validate()` (browser console) verifies:

- nine characters with all required fields;
- ages consistent with birth years in the master timeline (birthday-adjusted);
- reveal depths ascending;
- every memory points at a real NPC and has a plate and dialogue;
- every relationship pair references real people;
- the timeline is sorted and every character has arrival, secrets and goals.

Current result: **ok, no problems**.
