#!/usr/bin/env python3
"""Draw this repository's badges as local SVG files.

An offline-first app should not need an image service to describe itself: a badge
that points at shields.io makes the landing page fetch the network on its first
screen, which is the exact promise the app breaks. These are drawn here, committed,
and referenced by relative path — they render on Pages, in the README, and from
`file://` with no connection at all.

  python3 scripts/badges.py

Keep the CLAIMS true: the test count is what `node tests/self-tests.js` prints, the
licence is what LICENSE says, and the dependency count is what package.json has.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "docs", "assets")

INK = "#17130e"          # the label half
CREAM = "#f7f2e6"        # the text on both halves
BLUE = "#1d3a5f"
GREEN = "#2e6b45"
BRASS = "#8a6b22"
PLUM = "#4a2f45"

BADGES = [
    ("live", "live", "online", BLUE),
    ("crypto", "crypto", "AES-256-GCM", INK),
    ("offline", "offline", "no network", INK),
    ("tests", "tests", "15 passing", GREEN),
    ("deps", "deps", "0 runtime", PLUM),
    ("licence", "licence", "PolyForm NC 1.0.0", BRASS),
]

CH = 6.7  # approximate advance width of one character at 11px


def badge(label, value, colour):
    lw = int(len(label) * CH) + 16
    vw = int(len(value) * CH) + 16
    total = lw + vw
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="22" role="img" '
        'aria-label="%s: %s">'
        "<title>%s: %s</title>"
        '<linearGradient id="s" x2="0" y2="100%%">'
        '<stop offset="0" stop-color="#fff" stop-opacity=".10"/>'
        '<stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>'
        '<clipPath id="r"><rect width="%d" height="22" rx="3" fill="#fff"/></clipPath>'
        '<g clip-path="url(#r)">'
        '<rect width="%d" height="22" fill="%s"/>'
        '<rect x="%d" width="%d" height="22" fill="%s"/>'
        '<rect width="%d" height="22" fill="url(#s)"/>'
        "</g>"
        '<g fill="%s" font-family="ui-sans-serif,Segoe UI,Helvetica,Arial,sans-serif" '
        'font-size="11" text-anchor="middle">'
        '<text x="%d" y="15">%s</text>'
        '<text x="%d" y="15">%s</text>'
        "</g></svg>"
    ) % (total, label, value, label, value, total, lw, INK, lw, vw, colour, total,
         CREAM, lw // 2, label, lw + vw // 2, value)


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, label, value, colour in BADGES:
        path = os.path.join(OUT, "badge-%s.svg" % name)
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(badge(label, value, colour))
        print("wrote", os.path.relpath(path, ROOT))


if __name__ == "__main__":
    main()
