# Visual Art Queue

Artwork that must exist for the registry to be complete. Nothing here is
generated automatically at runtime, and nothing here is faked with a
placeholder: until a file exists, the game shows the character's own official
portrait and labels the view as pending.

## Why some replacements are not generated yet

The built-in image generator available to this workspace accepts **text only**.
It cannot take the official character reference as input, so any character it
draws would be a new design — exactly what the registry forbids. The project
already ships `tools/scene-generate.php`, which sends the official reference
files to a reference-capable provider (OpenAI `images/edits` or Gemini image).
Run it with a key to produce identity-accurate art:

```
SCENE_PROVIDER=openai OPENAI_API_KEY=... php tools/scene-generate.php --scene ...
```

## Pending

### 1. Aria — full body — DONE (2026-11-21)
- **Status:** supplied and validated; the bust fallback was removed and the
  visual registry version bumped. Kept here as history only.
- **Target:** `assets/portraits/aria/fullbody.png`
- **Why:** the file in the repository was byte-identical to `rowan/fullbody.png`
  (a male body), so it was removed rather than displayed.
- **References (must be sent with the request):**
  - `assets/portraits/aria/neutral.png` (face, glasses, navy hair, blue flower)
  - `assets/portraits/aria/fullbody.png` — missing, do not use Rowan's
  - `assets/portraits/aria/happy.png` (expression consistency)
- **Prompt:** full-body anime visual-novel artwork of the same woman as the
  reference: dark navy hair with a blue flower, round glasses, violet eyes,
  navy-and-lavender Victorian dress with cream lace, same proportions and
  palette, neutral standing pose, transparent background.
- **After the file lands:** remove `N.aria.fullBodyMissing` in
  `js/data/npcs.js`, bump `SAN.visual.VERSION`, run `./build.sh` and
  `php tools/validate-visuals.php`.
- **Until then:** the registry reports `bustOnly`, scenes draw her portrait as
  a framed card, and her profile shows "Official full-body artwork pending".

### 2. Lucien — `surprised` expression
- **Target:** `assets/portraits/lucien/surprised.png`
- **Why:** the official set ships nine files (no surprised face).
- **Reference:** `assets/portraits/lucien/neutral.png`,
  `assets/portraits/lucien/smile.png` (same face, eyes widened, mouth open).
- **Until then:** the expression resolves to `neutral`; no broken image.

### 3. Elowen — `surprised` expression
- **Target:** `assets/portraits/elowen/surprised.png`
- **Reference:** `assets/portraits/elowen/neutral.png`,
  `assets/portraits/elowen/smile.png`.
- **Until then:** resolves to `neutral`.

## Retired, not deleted

`docs/reference/retired-npc-lineup.webp` — the old NPC Lineup Reference. It
shows Liora and the female, pink-haired Elowen, so it must never be sliced
again; `tools/build-npc-assets.php` now refuses to run. Kept only as history.

### 3. Flashback illustrations (childhood / memory scenes)
- **Status:** queued. Not generated. The available text-to-image tool cannot accept the
  official character references, so using it would risk changing faces, hair, eyes,
  clothing or apparent age.
- **Targets:** `assets/scenes/memories/<memory-id>.webp`
- **Memory ids:** see `js/data/lore-memories.js` (20 entries; each has `plate` as the
  interim composed plate).
- **Reference set per request:** the NPC's `neutral.png`, `fullbody.png`, and, for child
  scenes, a reference sheet at the intended age; plus the location plate named in the
  entry. The request must state the age of the character in the scene.
- **Until a reference-capable provider is connected:** the game composes the official
  artwork over the plate and labels the scene as composed. No flashback art is claimed.
