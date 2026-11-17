#!/usr/bin/env bash
# Builds the single-file, offline-playable index.html from the modular sources.
set -euo pipefail
cd "$(dirname "$0")"

FILES=(
  js/core/util.js
  js/core/audio.js
  js/core/input.js
  js/core/save.js
  js/data/items.js
  js/data/npcs.js
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
  js/systems/quests.js
  js/systems/cat.js
  js/systems/living.js
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

TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

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
  for f in "${FILES[@]}"; do
    echo "<script>"
    cat "$f"
    echo "</script>"
  done
  echo "</body>"
  echo "</html>"
} > index.html

echo "Built index.html ($(wc -c < index.html) bytes)"
