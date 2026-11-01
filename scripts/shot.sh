#!/usr/bin/env bash
# Screenshot the landing page or the app with headless Chromium.
#
#   scripts/shot.sh app             -> docs/assets/app-desktop.png + app-mobile.png
#   scripts/shot.sh landing         -> docs/assets/landing-desktop.png + landing-mobile.png
#   scripts/shot.sh app note        -> the app on a given demo route (#note)
#   scripts/shot.sh poster patients -> the frame's poster (sized to one screenful)
#
# The app is shot with ?demo=1, i.e. the sample vault — a screenshot of an empty
# search box sells nothing. --virtual-time-budget is what lets the vault derive its
# key (600k PBKDF2 rounds) before the shutter. Look at the result before committing.
set -euo pipefail

KIND="${1:-app}"
ROUTE="${2:-note}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CHROME="$(command -v chromium || command -v chromium-browser || command -v google-chrome)"

if [ "$KIND" = "landing" ]; then PAGE="file://$ROOT/docs/index.html"; NAME="landing";
else PAGE="file://$ROOT/docs/play/index.html?demo=1#${ROUTE}"; NAME="app"; fi

mkdir -p "$ROOT/docs/assets"

shot () { # width, height, outfile
  "$CHROME" --headless --no-sandbox --disable-gpu --hide-scrollbars \
    --window-size="$1,$2" --virtual-time-budget=9000 --screenshot="$3" "$PAGE" >/dev/null 2>&1
  echo "wrote $3 ($(stat -c%s "$3") bytes)"
}

if [ "$KIND" = "poster" ]; then
  mkdir -p "$ROOT/docs/assets"
  shot 1280 900 "$ROOT/docs/assets/poster.png"
  exit 0
fi

if [ "$NAME" = "landing" ]; then
  shot 1280 4600 "$ROOT/docs/assets/landing-desktop.png"
  shot 430  6200 "$ROOT/docs/assets/landing-mobile.png"
else
  shot 1280 1500 "$ROOT/docs/assets/app-desktop.png"
  shot 430  1180 "$ROOT/docs/assets/app-mobile.png"
fi
