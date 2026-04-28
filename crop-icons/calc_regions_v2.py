"""
Calculate corrected SVG region coordinates based on visual inspection of body-map.png.
Image: 1024 x 1536, content bbox: (136, 101) to (889, 1393)

From the screenshot we can see:
- Head (including hair): roughly y 101–370, centered at x 512
- Throat/neck: roughly y 370–460
- Chest (shirt area): roughly y 460–750
- Tummy (lower shirt/shorts waist): roughly y 750–920
- Hands: at the ends of the arms, roughly x 136–260 and x 760–889, y 620–820
- Legs: roughly y 920–1393

Labels should appear OUTSIDE / to the right of the body, not overlapping.
We'll put labels to the right side at the midpoint of each region.
"""

IMG_W, IMG_H = 1024, 1536

# Pixel coordinates based on visual inspection of the 1024x1536 image
regions = [
    # name, shape, shape_args, hitX, hitY, hitW, hitH, labelX, labelY
    # Head: ellipse centered on head including hair
    ("head",   "ellipse", dict(cx=512, cy=230, rx=155, ry=165),
     357, 65, 310, 330,   780, 230),

    # Throat: narrow rect for neck
    ("throat", "rect",    dict(x=440, y=395, w=144, h=100, rx=20),
     357, 395, 310, 100,  780, 445),

    # Chest: torso upper half
    ("chest",  "rect",    dict(x=310, y=495, w=404, h=255, rx=20),
     310, 495, 404, 255,  780, 622),

    # Tummy: torso lower half
    ("tummy",  "rect",    dict(x=330, y=750, w=364, h=200, rx=20),
     330, 750, 364, 200,  780, 850),

    # Hands: two ellipses at wrist/hand area on each arm
    ("hands",  "ellipse", dict(cx=512, cy=720, rx=60, ry=60),
     136, 600, 753, 260,  780, 730),

    # Legs: lower body
    ("legs",   "rect",    dict(x=330, y=950, w=364, h=443, rx=20),
     330, 950, 364, 443,  780, 1172),
]

MIN_HIT_H = 88

print("const REGIONS: RegionDef[] = [")
for name, shape, args, hx, hy, hw, hh, lx, ly in regions:
    hh = max(hh, MIN_HIT_H)
    if shape == "ellipse":
        sp = f"{{ cx: {args['cx']}, cy: {args['cy']}, rx: {args['rx']}, ry: {args['ry']} }}"
    else:
        sp = f"{{ x: {args['x']}, y: {args['y']}, width: {args['w']}, height: {args['h']}, rx: {args['rx']} }}"

    print(f"  {{")
    print(f"    id: '{name}',")
    print(f"    label: '{name.capitalize()}',")
    print(f"    shape: '{shape}',")
    print(f"    shapeProps: {sp},")
    print(f"    hitX: {hx}, hitY: {hy}, hitW: {hw}, hitH: {hh},")
    print(f"    labelX: {lx}, labelY: {ly},")
    print(f"  }},")
print("];")

# Also generate a debug image showing the regions
from PIL import Image, ImageDraw, ImageFont

img = Image.open("../assets/transparent/body-map.png").convert("RGBA")
draw = ImageDraw.Draw(img, "RGBA")

colors = {
    "head":   (120, 80, 255, 80),
    "throat": (80, 200, 255, 80),
    "chest":  (255, 100, 100, 80),
    "tummy":  (255, 200, 80, 80),
    "hands":  (80, 255, 150, 80),
    "legs":   (200, 80, 255, 80),
}

for name, shape, args, hx, hy, hw, hh, lx, ly in regions:
    c = colors[name]
    # Draw hit area
    draw.rectangle([hx, hy, hx+hw, hy+hh], outline=(100,100,255,200), width=4)
    # Draw shape
    if shape == "ellipse":
        cx, cy, rx, ry = args['cx'], args['cy'], args['rx'], args['ry']
        draw.ellipse([cx-rx, cy-ry, cx+rx, cy+ry], fill=c, outline=(80,80,200,200), width=3)
    else:
        x, y, w, h = args['x'], args['y'], args['w'], args['h']
        draw.rectangle([x, y, x+w, y+h], fill=c, outline=(80,80,200,200), width=3)
    # Draw label position dot
    draw.ellipse([lx-10, ly-10, lx+10, ly+10], fill=(255,0,0,200))

out = "../assets/body_map_debug.png"
img.save(out)
print(f"\nDebug image saved to {out}")
