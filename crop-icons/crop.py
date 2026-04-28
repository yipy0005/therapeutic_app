"""
Crop individual icons from the asset sheets.
All sheets are 1448x1086 px.

Sheet mapping:
  (1) = Emotion Weather Icons  → 7 weather icons
  (2) = Body Map + Feeling Size → body map child + 5 volcano icons
  (3) = Reward Badges           → 6 badge icons
  (4) = UI Starter Components   → app logo, buttons, nav icons
  (5) = Calm Toolbox Icons      → 8 calm tool icons
"""

from PIL import Image
from pathlib import Path

SRC = Path("../assets")
OUT = Path("../feelings-explorer/src/assets")
OUT.mkdir(parents=True, exist_ok=True)

def crop(src_path: Path, out_path: Path, box: tuple[int,int,int,int], size: int = 200):
    """Crop box=(left,top,right,bottom), resize to size×size, save as PNG."""
    img = Image.open(src_path).convert("RGBA")
    cropped = img.crop(box)
    cropped = cropped.resize((size, size), Image.LANCZOS)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cropped.save(out_path, "PNG")
    print(f"  ✓ {out_path.name}")

# ─────────────────────────────────────────────
# Sheet 1: Emotion Weather Icons (1448×1086)
# Layout: 3 top row, 4 bottom row
# ─────────────────────────────────────────────
s1 = SRC / "ChatGPT Image Apr 28, 2026, 09_14_07 AM (1).png"
print("\n[Sheet 1] Weather Icons")

# Top row: Sunny, Rainy, Stormy  (y: 80–520)
crop(s1, OUT / "weather/sunny.png",        (60,  80, 500, 520))
crop(s1, OUT / "weather/rainy.png",        (490, 80, 960, 520))
crop(s1, OUT / "weather/stormy.png",       (960, 80, 1420, 520))

# Bottom row: Foggy, Windy, Sparkly, Heavy Clouds  (y: 530–980)
crop(s1, OUT / "weather/foggy.png",        (30,  530, 390, 940))
crop(s1, OUT / "weather/windy.png",        (360, 530, 730, 940))
crop(s1, OUT / "weather/sparkly.png",      (720, 530, 1090, 940))
crop(s1, OUT / "weather/heavy-clouds.png", (1070,530, 1430, 940))

# ─────────────────────────────────────────────
# Sheet 2: Body Map + Feeling Size (1448×1086)
# Left half: child body illustration
# Right half: thermometer + 5 volcano levels
# ─────────────────────────────────────────────
s2 = SRC / "ChatGPT Image Apr 28, 2026, 09_14_07 AM (2).png"
print("\n[Sheet 2] Body Map + Intensity")

# Child body illustration (left half)
crop(s2, OUT / "body-map/child-body.png",  (30, 80, 680, 1060), size=400)

# Thermometer (right half, upper)
crop(s2, OUT / "intensity/thermometer.png", (700, 80, 1000, 580), size=300)

# Volcano scale row (right half, lower) — individual volcanoes
crop(s2, OUT / "intensity/volcano-1.png",  (700, 620, 840, 1000))
crop(s2, OUT / "intensity/volcano-2.png",  (840, 600, 990, 1000))
crop(s2, OUT / "intensity/volcano-3.png",  (990, 580, 1150, 1000))
crop(s2, OUT / "intensity/volcano-4.png",  (1150,560, 1300, 1000))
crop(s2, OUT / "intensity/volcano-5.png",  (1290,530, 1440, 1000))

# ─────────────────────────────────────────────
# Sheet 3: Reward Badges (1448×1086)
# 2 rows × 3 cols
# ─────────────────────────────────────────────
s3 = SRC / "ChatGPT Image Apr 28, 2026, 09_14_09 AM (3).png"
print("\n[Sheet 3] Reward Badges")

# Top row
crop(s3, OUT / "badges/feeling-detective.png",   (60,  100, 490, 530))
crop(s3, OUT / "badges/brave-breather.png",      (490, 100, 960, 530))
crop(s3, OUT / "badges/repair-hero.png",         (960, 100, 1400, 530))

# Bottom row
crop(s3, OUT / "badges/body-signal-spotter.png", (60,  530, 490, 980))
crop(s3, OUT / "badges/kind-words-champion.png", (490, 530, 960, 980))
crop(s3, OUT / "badges/try-again-star.png",      (960, 530, 1400, 980))

# ─────────────────────────────────────────────
# Sheet 4: UI Starter Components (1448×1086)
# App logo, nav icons
# ─────────────────────────────────────────────
s4 = SRC / "ChatGPT Image Apr 28, 2026, 09_14_09 AM (4).png"
print("\n[Sheet 4] UI Components")

# App logo (top-left card)
crop(s4, OUT / "ui/app-logo.png",     (30,  80, 380, 430))

# Bottom nav icons
crop(s4, OUT / "ui/nav-home.png",     (60,  780, 280, 1020))
crop(s4, OUT / "ui/nav-toolbox.png",  (280, 780, 560, 1020))
crop(s4, OUT / "ui/nav-badges.png",   (560, 780, 840, 1020))
crop(s4, OUT / "ui/nav-parent.png",   (840, 780, 1100, 1020))

# ─────────────────────────────────────────────
# Sheet 5: Calm Toolbox Icons (1448×1086)
# 2 rows × 4 cols
# ─────────────────────────────────────────────
s5 = SRC / "ChatGPT Image Apr 28, 2026, 09_14_09 AM (5).png"
print("\n[Sheet 5] Calm Tools")

# Top row
crop(s5, OUT / "calm-tools/smell-flower.png",  (30,  80, 390, 520))
crop(s5, OUT / "calm-tools/balloon-belly.png", (380, 80, 750, 520))
crop(s5, OUT / "calm-tools/dragon-breath.png", (740, 80, 1110, 520))
crop(s5, OUT / "calm-tools/push-wall.png",     (1100,80, 1430, 520))

# Bottom row
crop(s5, OUT / "calm-tools/turtle-shell.png",  (30,  530, 390, 980))
crop(s5, OUT / "calm-tools/hug-stuffie.png",   (380, 530, 750, 980))
crop(s5, OUT / "calm-tools/ask-for-help.png",  (740, 530, 1110, 980))
crop(s5, OUT / "calm-tools/drink-water.png",   (1100,530, 1430, 980))

print("\nDone! All icons saved to feelings-explorer/src/assets/")
