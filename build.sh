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

# portraits: inlined as data URIs so index.html stays self-contained and the
# illustrations still show when the file is opened without a local server
PORTRAITS_JS=$(mktemp)
{
  echo '<script>'
  echo 'window.SAN_ASSET_PORTRAITS={'
  sep=''
  count=0
  while IFS= read -r art; do
    rel=${art#assets/portraits/}
    id=${rel%%/*}
    base=$(basename "$art")
    mood=${base%.*}
    ext=${base##*.}
    case "$ext" in
      webp) mime=image/webp ;;
      png)  mime=image/png ;;
      jpg|jpeg) mime=image/jpeg ;;
      *) echo "ERROR: unsupported portrait format: $art" >&2; exit 1 ;;
    esac
    printf '%s"%s/%s":"data:%s;base64,%s"' "$sep" "$id" "$mood" "$mime" "$(base64 -w 0 "$art")"
    sep=$',\n'
    count=$((count + 1))
  done < <(find assets/portraits -type f \( -name '*.webp' -o -name '*.png' \) | LC_ALL=C sort)
  echo
  echo '};'
  echo '</script>'
  if [ "$count" -eq 0 ]; then
    echo "ERROR: no portrait illustrations found in assets/portraits" >&2
    exit 1
  fi
  echo "Embedded $count portrait illustrations" >&2
} > "$PORTRAITS_JS"

# main character: the reference-derived full body and expressions, inlined the
# same way so the single-file build shows the official artwork
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
trap 'rm -f "$TMP" "$PORTRAITS_JS" "$MAIN_JS"' EXIT

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
  cat "$PORTRAITS_JS"
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

# deploy/ holds the Worker + static assets used when publishing to the web
mkdir -p deploy/public
cp index.html deploy/public/index.html
echo "Staged deploy/public/index.html"
