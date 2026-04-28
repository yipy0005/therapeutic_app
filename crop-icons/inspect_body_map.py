"""
Inspect the body-map.png to get its dimensions and help calibrate
the SVG overlay region coordinates.
"""
from PIL import Image
from pathlib import Path

img_path = Path("../assets/transparent/body-map.png")
img = Image.open(img_path)
w, h = img.size
print(f"body-map.png size: {w} x {h}")
print(f"Aspect ratio: {w/h:.4f}  (h/w = {h/w:.4f})")

# Find the bounding box of non-transparent pixels
bbox = img.getbbox()
print(f"Content bounding box (left, top, right, bottom): {bbox}")
if bbox:
    cw = bbox[2] - bbox[0]
    ch = bbox[3] - bbox[1]
    print(f"Content size: {cw} x {ch}")
    print(f"Content center x: {(bbox[0]+bbox[2])//2}  y: {(bbox[1]+bbox[3])//2}")

    # Estimate body region positions as fractions of content height
    # so we can map them to SVG viewBox coordinates
    print("\n--- Estimated region Y positions (as % of content height) ---")
    regions = {
        "head":   (0.00, 0.18),
        "throat": (0.18, 0.26),
        "chest":  (0.26, 0.46),
        "tummy":  (0.46, 0.62),
        "hands":  (0.46, 0.62),  # arms alongside torso
        "legs":   (0.62, 1.00),
    }
    for name, (y0, y1) in regions.items():
        print(f"  {name:8s}: y {y0*ch+bbox[1]:.0f} – {y1*ch+bbox[1]:.0f}  (px)")
