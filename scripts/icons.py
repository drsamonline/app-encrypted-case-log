#!/usr/bin/env python3
"""Generate every icon this app ships, locally, from the two SVGs beside it.

  python3 scripts/icons.py

Renders with the headless Chromium that is already on the machine (no icon
service, no image dependency at runtime), writes the PWA set into
docs/play/icons/, refreshes docs/icon.png for the social card, and builds a
multi-size favicon.ico with Pillow.

The app itself loads none of this: the manifest points at the PNGs and the page
at the SVG. Icons are a build-time artefact, never a runtime dependency.
"""
import os
import shutil
import subprocess
import tempfile

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLAY = os.path.join(ROOT, "docs", "play")
OUT = os.path.join(PLAY, "icons")
CHROME = shutil.which("chromium") or shutil.which("chromium-browser") or shutil.which("google-chrome")

TARGETS = [
    ("icon.svg", 192, "icon-192.png"),
    ("icon.svg", 512, "icon-512.png"),
    ("icon-maskable.svg", 512, "icon-maskable-512.png"),
    ("icon.svg", 180, "apple-touch-icon.png"),
    ("icon.svg", 32, "favicon-32.png"),
]


def render(svg_name, size, out_name):
    svg = open(os.path.join(PLAY, svg_name), encoding="utf-8").read()
    html = (
        "<!doctype html><meta charset=utf-8>"
        '<body style="margin:0;background:transparent">'
        + svg.replace("<svg ", '<svg width="%d" height="%d" ' % (size, size), 1)
        + "</body>"
    )
    with tempfile.TemporaryDirectory() as tmp:
        page = os.path.join(tmp, "i.html")
        with open(page, "w", encoding="utf-8") as fh:
            fh.write(html)
        out = os.path.join(OUT, out_name)
        subprocess.run(
            [CHROME, "--headless", "--no-sandbox", "--disable-gpu",
             "--hide-scrollbars", "--default-background-color=00000000",
             "--window-size=%d,%d" % (size, size),
             "--screenshot=" + out, "file://" + page],
            check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        # Chromium pads to the window; crop to the icon itself.
        im = Image.open(out)
        if im.size != (size, size):
            im = im.crop((0, 0, size, size))
            im.save(out)
    print("wrote", os.path.relpath(out, ROOT), Image.open(out).size)


def main():
    os.makedirs(OUT, exist_ok=True)
    for svg, size, name in TARGETS:
        render(svg, size, name)

    # multi-size .ico from the 512 (Pillow downsamples better than up)
    big = Image.open(os.path.join(OUT, "icon-512.png")).convert("RGBA")
    ico = os.path.join(OUT, "favicon.ico")
    big.save(ico, sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print("wrote", os.path.relpath(ico, ROOT))

    # the social card / release icon: the same 512, at the repo's docs root
    for dest in (os.path.join(ROOT, "docs", "icon.png"),):
        shutil.copyfile(os.path.join(OUT, "icon-512.png"), dest)
        print("wrote", os.path.relpath(dest, ROOT))


if __name__ == "__main__":
    main()
