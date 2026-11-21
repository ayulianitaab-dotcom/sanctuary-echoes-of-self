# Official Character Registry — Sanctuary: Echoes of Self

This is the single source of identity for the game. Every system (dialogue,
schedules, romance, events, cinematic scenes, assets) reads from
`SAN.data.OFFICIAL_ROSTER` in `js/data/npcs.js`.

| NPC id | Name | Gender | Pronouns | Profession |
|---|---|---|---|---|
| `nyssa` | Nyssa | female | she/her | Village Guardian |
| `lucien` | Lucien | male | he/him | Lighthouse Keeper |
| `elowen` | Elowen | male | he/him | Greenhouse Gardener |
| `rowan` | Rowan | male | he/him | Windmill Keeper |
| `mira` | Mira | female | she/her | Village Baker |
| `celeste` | Celeste | female | she/her | Flower Shop Owner |
| `theo` | Theo | male | he/him | Traveling Merchant |
| `aria` | Aria | female | she/her | Village Librarian |
| `finn` | Finn | male | he/him | Fisherman |

Nine NPCs: five male, four female. The Main Character is a woman and her
pronouns stay a player choice (`SAN.state.PRONOUNS`); NPC gender is canonical
and never follows the player's choice. Romance remains open to every NPC.

## What changed

- **Liora → Lucien.** The lighthouse keeper slot now belongs to Lucien (male,
  dark navy hair with violet accents, grey-lavender eyes, navy/cream/antique
  gold Victorian coat, small lantern). His id is `lucien`; artwork lives in
  `assets/portraits/lucien/`. The retired `assets/portraits/liora/` folder is
  removed, and the build fails if it ever comes back.
- **Elowen is male.** Short brown hair, emerald eyes, cream shirt, sage-green
  work apron (the uploaded male design). All pronouns in his greetings,
  topics, romance lines, life milestones, quests and journal text are he/him.
- **Celeste unchanged**: female, blonde, green eyes, cream/green floral dress.
- **Registry added**: `SAN.data.OFFICIAL_ROSTER`, `SAN.data.registry(id)` and
  `SAN.data.validateRoster()` (returns a list of problems; empty means valid).
- **Save migration**: `SAN.state.migrateSnapshot()` renames the old
  `liora` / `liora_*` keys and `liora-` scene ids to `lucien`, merging
  friendship and romance progress instead of duplicating the NPC. It is
  idempotent and runs on every load.

## Asset audit

All nine folders contain a `neutral` face; eight contain a full body plus
eight expressions. Verified by loading every image in the browser.

| NPC | Files | Full body | Notes |
|---|---|---|---|
| nyssa | 10 | yes | silver-lavender, correct |
| lucien | 9 | yes | male navy/gold design, correct; no `surprised` face (falls back to neutral) |
| elowen | 9 | yes | male, short brown hair, green apron, correct; no `surprised` face |
| rowan | 10 | yes | correct |
| mira | 10 | yes | correct |
| celeste | 10 | yes | blonde, green eyes, correct |
| theo | 10 | yes | correct |
| aria | 9 | **missing** | `aria/fullbody.png` was byte-identical to Rowan's artwork |
| finn | 10 | yes | correct |

### Known gap

Aria has **no verified full-body artwork**. The file that used to sit at
`assets/portraits/aria/fullbody.png` was an exact duplicate of
`rowan/fullbody.png` (checked by hash and visually), so it was removed rather
than shown. Aria now renders from her own official `neutral.png` portrait
wherever a full body would be drawn. A correct Aria full body needs to be
supplied before that view can look complete.

Two characters (`lucien`, `elowen`) ship nine files instead of ten; their
missing `surprised` expression resolves to `neutral`, so no broken images.

## Checks

- `./build.sh` passes: nine artwork folders present, no duplicate full bodies,
  no retired `liora` folder, deploy copy staged (8.0 MB).
- In-browser: `validateRoster()` returns `[]`; all 18 full-body/neutral loads
  succeed from each NPC's own folder; Lucien appears in the title lineup and in
  cinematic scenes with his official artwork; migrated save keeps 64 friendship
  points, 71 affection, unlocked date event, scene log and memories.
- Remaining `liora` strings exist only inside the save-migration code and the
  roster validator that rejects the retired character.

## Character Visual Registry

`js/data/visual-registry.js` is the single map from a canonical character to
real artwork files. Every visual surface reads it (`SAN.visual.get(id)`,
`SAN.visual.imageFor(id, kind, mood)`), so no screen guesses a path.

Each entry carries: id, name, canonical gender, pronouns, profession, official
reference image, full body, portrait, every expression, dialogue image, scene
reference image, a `bustOnly` flag when a full body does not exist, and the
artwork version.

`SAN.visual.VERSION` (`cvr-2026-11-21-1`) is appended to every portrait, actor
and cinematic plate URL, so a replaced file is never hidden by a cached copy.
`SAN.visual.validate()` reports registry and roster problems in the browser;
`tools/validate-visuals.php` checks the files on disk.

## Visual audit (global synchronization)

| Surface | Source of character art | State |
|---|---|---|
| Title screen lineup | registry portraits | current |
| Character creation / wardrobe | official Main Character artwork (bundled) | unchanged, female |
| Village sprites | palette table in `npcs.js` | current (Lucien navy, Elowen brown/green) |
| Dialogue portraits | `render.portraitSrc` → registry | current |
| NPC profile | `npcFullBodyImg` → registry | current (Aria: portrait + pending note) |
| Relationship journal | registry portraits | current |
| Memory / scene journal | registry actors + plates | current |
| Cinematic romance, dates, daily, events | official full body composited over AI location plate | current |
| Intimate scenes | same compositor, fade-to-black | current |
| Festival / seasonal / city events | same location plates, no character art baked in | current |
| Cottage interiors | location plates, no characters | current |
| Inventory / memory icons | item icons, no character art | not affected |
| Loading screen | title background, no characters | not affected |

Counts: 96 character artwork files inspected (87 NPC portrait files + 9 Main
Character files), 96 decodable, 9 cinematic location plates and 1 title
background (no characters), 8 Mochi sprites. Near-duplicate artwork across
characters: 0. Missing official assets: 1 (Aria full body). Old character
illustrations still active: 0.

The old lineup sheet (Liora, female Elowen) was moved out of `assets/` to
`docs/reference/retired-npc-lineup.webp`, and `tools/build-npc-assets.php` now
exits with an error instead of slicing it again. Its former files were the only
artwork in the repository that depicted the retired designs.
