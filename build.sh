#!/usr/bin/env bash
# Builds the single-file, offline-playable index.html from the modular sources.
set -euo pipefail
cd "$(dirname "$0")"

FILES=(
  js/core/util.js
  js/core/i18n.js
  js/core/audio.js
  js/core/input.js
  js/core/save.js
  js/data/items.js
  js/data/npcs.js
  js/data/visual-registry.js
  js/data/psychology.js
  js/data/social.js
  js/data/lore-world.js
  js/data/lore-characters.js
  js/data/lore-memories.js
  js/data/romance.js
  js/data/scenes-illustrated.js
  js/data/scenes.js
  js/data/character.js
  js/data/quests.js
  js/data/life.js
  js/world/areas.js
  js/world/render.js
  js/world/world.js
  js/systems/state.js
  js/systems/time.js
  js/systems/progression.js
  js/systems/farming.js
  js/systems/fishing.js
  js/systems/crafting.js
  js/systems/journal.js
  js/systems/memory.js
  js/systems/relationships.js
  js/systems/romance.js
  js/systems/scenes.js
  js/systems/quests.js
  js/systems/cat.js
  js/systems/living.js
  js/systems/psychology.js
  js/systems/city-life.js
  js/systems/memory-book.js
  js/systems/lore.js
  js/systems/photos.js
  js/systems/actions.js
  js/ui/ui.js
  js/ui/panels.js
  js/ui/screens.js
  js/main.js
)

# guard: inline scripts must not contain a closing script tag
for f in "${FILES[@]}"; do
  if grep -qi '</script' "$f"; then
    echo "ERROR: $f contains a literal </script> and cannot be inlined." >&2
    exit 1
  fi
  if [ ! -f "$f" ]; then
    echo "ERROR: missing $f" >&2
    exit 1
  fi
done

# portraits: the uploaded artwork for the nine NPCs is 27 MB of PNGs, so it is
# served as real files next to index.html (relative paths work both over http
# and when index.html is opened straight from disk) instead of being base64
# inlined, which would triple it and make the page unloadable.
if [ ! -f assets/portraits/nyssa/fullbody.png ]; then
  echo "ERROR: no portrait artwork found in assets/portraits" >&2
  exit 1
fi
for id in nyssa lucien elowen rowan mira celeste theo aria finn; do
  if [ ! -f "assets/portraits/$id/neutral.png" ]; then
    echo "ERROR: missing official artwork for $id" >&2
    exit 1
  fi
  if [ ! -f "assets/portraits/$id/fullbody.png" ]; then
    echo "ERROR: missing official full body for $id" >&2
    exit 1
  fi
done
DUPES=$(find assets/portraits -name fullbody.png -exec md5sum {} + | sort | awk "{print \$1}" | uniq -d | wc -l)
if [ "$DUPES" -gt 0 ]; then
  echo "ERROR: two NPCs share the same full-body artwork" >&2
  exit 1
fi
if [ -d assets/portraits/liora ]; then
  echo "ERROR: the retired character folder assets/portraits/liora is still present" >&2
  exit 1
fi
PORTRAIT_COUNT=$(find assets/portraits -type f -name '*.png' | wc -l)
if [ "$PORTRAIT_COUNT" -lt 80 ]; then
  echo "ERROR: expected at least 81 portrait files, found $PORTRAIT_COUNT" >&2
  exit 1
fi
echo "Serving $PORTRAIT_COUNT portrait illustrations from assets/portraits" >&2

# main character: the reference-derived full body and expressions, inlined
# (2.5 MB) so the official artwork is always present
MAIN_JS=$(mktemp)
{
  echo '<script>'
  echo 'window.SAN_ASSET_MAIN={'
  echo 'fullbody:"data:image/png;base64,'"$(base64 -w 0 assets/characters/main/fullbody.png)"'",'
  echo 'expressions:{'
  mc_sep=''
  for mood in neutral happy sad surprised embarrassed thinking angry thanking; do
    art="assets/characters/main/expressions/$mood.png"
    if [ ! -f "$art" ]; then
      echo "ERROR: missing main character expression $art" >&2
      exit 1
    fi
    printf '%s"%s":"data:image/png;base64,%s"' "$mc_sep" "$mood" "$(base64 -w 0 "$art")"
    mc_sep=$',\n'
  done
  echo
  echo '}};'
  echo '</script>'
} > "$MAIN_JS"

TMP=$(mktemp)
trap 'rm -f "$TMP" "$MAIN_JS"' EXIT

awk '
/<!-- CSS_HERE -->/ {
  print "<style>"
  while ((getline line < "css/style.css") > 0) print line
  close("css/style.css")
  print "</style>"
  next
}
{ print }
' index.src.html > "$TMP"

{
  cat "$TMP" | sed '/<!-- JS_HERE -->/q' | sed '$d'
  cat "$MAIN_JS"
  for f in "${FILES[@]}"; do
    echo "<script>"
    cat "$f"
    echo "</script>"
  done
  echo "</body>"
  echo "</html>"
} > index.html

echo "Built index.html ($(wc -c < index.html) bytes)"

# deploy/ holds the Worker + static assets used when publishing to the web.
# The repository keeps the uploaded PNGs; the published copy re-encodes that
# same artwork to WebP so it fits the host's per-deployment allowance.
mkdir -p deploy/public
cp index.html deploy/public/index.html
rm -rf deploy/public/assets
if ! php tools/build-deploy-assets.php; then
  echo "ERROR: could not package the deploy assets" >&2
  exit 1
fi
# index.html keeps .png for local play; the published copy asks for .webp
sed -i 's/window.SAN_ASSET_PORTRAIT_EXT = "png"/window.SAN_ASSET_PORTRAIT_EXT = "webp"/' deploy/public/index.html
sed -i 's/window.SAN_SCENE_EXT = "jpg"/window.SAN_SCENE_EXT = "webp"/' deploy/public/index.html
if ! grep -q 'SAN_ASSET_PORTRAIT_EXT = "webp"' deploy/public/index.html; then
  echo "ERROR: could not point the deploy build at the WebP assets" >&2
  exit 1
fi
echo "Staged deploy/public ($(du -sh deploy/public | cut -f1))"
