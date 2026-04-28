"""
Calculate SVG region coordinates based on the reference image showing correct regions.
Image is 1024x1536. The reference shows regions on a ~683x853 display.
Scale factor: 1024/683 = 1.499, 1536/853 = 1.800 — use 1024/683 ≈ 1.5

Reference region positions (measured from the reference image, 683x853):
- Head:   rounded rect, top ~55, bottom ~175, left ~195, right ~490
- Throat: rounded rect, top ~255, bottom ~315, left ~255, right ~425
- Chest:  rounded rect, top ~315, bottom ~455, left ~185, right ~500
- Tummy:  rounded rect, top ~455, bottom ~545, left ~195, right ~490
- Hands:  two ellipses — left hand ~(95,430)–(165,510), right hand ~(515,430)–(590,510)
- Knees:  rounded rect, top ~620, bottom ~700, left ~195, right ~490

Scale to 1024x1536 image coords (multiply x by 1024/683=1.499, y by 1536/853=1.800):
"""

SX = 1024 / 683
SY = 1536 / 853

def sx(v): return round(v * SX)
def sy(v): return round(v * SY)

print("// SVG viewBox: 0 0 1024 1536")
print("const REGIONS: RegionDef[] = [")

# Head: rounded rect top of head (forehead/crown area)
# ref: left=195, top=55, right=490, bottom=175
hd_l, hd_t, hd_r, hd_b = sx(195), sy(55), sx(490), sy(175)
hd_cx = (hd_l+hd_r)//2; hd_cy = (hd_t+hd_b)//2
hd_w = hd_r-hd_l; hd_h = hd_b-hd_t
print(f"  {{ id: 'head', label: 'Head', shape: 'rect',")
print(f"    shapeProps: {{ x: {hd_l}, y: {hd_t}, width: {hd_w}, height: {hd_h}, rx: 30 }},")
print(f"    hitX: {hd_l}, hitY: {hd_t}, hitW: {hd_w}, hitH: {hd_h},")
print(f"    labelX: {sx(530)}, labelY: {hd_cy},")
print(f"  }},")

# Throat: rounded rect neck
# ref: left=255, top=255, right=425, bottom=315
th_l, th_t, th_r, th_b = sx(255), sy(255), sx(425), sy(315)
th_w = th_r-th_l; th_h = th_b-th_t; th_cy = (th_t+th_b)//2
print(f"  {{ id: 'throat', label: 'Throat', shape: 'rect',")
print(f"    shapeProps: {{ x: {th_l}, y: {th_t}, width: {th_w}, height: {th_h}, rx: 20 }},")
print(f"    hitX: {th_l}, hitY: {th_t}, hitW: {th_w}, hitH: {max(th_h,88)},")
print(f"    labelX: {sx(530)}, labelY: {th_cy},")
print(f"  }},")

# Chest: rounded rect upper torso
# ref: left=185, top=315, right=500, bottom=455
ch_l, ch_t, ch_r, ch_b = sx(185), sy(315), sx(500), sy(455)
ch_w = ch_r-ch_l; ch_h = ch_b-ch_t; ch_cy = (ch_t+ch_b)//2
print(f"  {{ id: 'chest', label: 'Chest', shape: 'rect',")
print(f"    shapeProps: {{ x: {ch_l}, y: {ch_t}, width: {ch_w}, height: {ch_h}, rx: 25 }},")
print(f"    hitX: {ch_l}, hitY: {ch_t}, hitW: {ch_w}, hitH: {ch_h},")
print(f"    labelX: {sx(530)}, labelY: {ch_cy},")
print(f"  }},")

# Tummy: rounded rect lower torso
# ref: left=195, top=455, right=490, bottom=545
tm_l, tm_t, tm_r, tm_b = sx(195), sy(455), sx(490), sy(545)
tm_w = tm_r-tm_l; tm_h = tm_b-tm_t; tm_cy = (tm_t+tm_b)//2
print(f"  {{ id: 'tummy', label: 'Tummy', shape: 'rect',")
print(f"    shapeProps: {{ x: {tm_l}, y: {tm_t}, width: {tm_w}, height: {tm_h}, rx: 25 }},")
print(f"    hitX: {tm_l}, hitY: {tm_t}, hitW: {tm_w}, hitH: {tm_h},")
print(f"    labelX: {sx(530)}, labelY: {tm_cy},")
print(f"  }},")

# Hands: two ellipses
# ref left hand: cx=130, cy=470, rx=38, ry=42
# ref right hand: cx=553, cy=470, rx=38, ry=42
lh_cx, lh_cy = sx(130), sy(470)
rh_cx, rh_cy = sx(553), sy(470)
rx, ry = sx(38), sy(42)
hands_cy = (lh_cy+rh_cy)//2
print(f"  {{ id: 'hands', label: 'Hands', shape: 'ellipse',")
print(f"    shapeProps: {{ cx: {lh_cx}, cy: {lh_cy}, rx: {rx}, ry: {ry} }},")
print(f"    hitX: {sx(90)}, hitY: {sy(425)}, hitW: {sx(503)}, hitH: {sy(100)},")
print(f"    labelX: {sx(530)}, labelY: {hands_cy},")
print(f"  }},")

# Knees: rounded rect
# ref: left=195, top=620, right=490, bottom=700
kn_l, kn_t, kn_r, kn_b = sx(195), sy(620), sx(490), sy(700)
kn_w = kn_r-kn_l; kn_h = kn_b-kn_t; kn_cy = (kn_t+kn_b)//2
print(f"  {{ id: 'legs', label: 'Knees', shape: 'rect',")
print(f"    shapeProps: {{ x: {kn_l}, y: {kn_t}, width: {kn_w}, height: {kn_h}, rx: 25 }},")
print(f"    hitX: {kn_l}, hitY: {kn_t}, hitW: {kn_w}, hitH: {max(kn_h,88)},")
print(f"    labelX: {sx(530)}, labelY: {kn_cy},")
print(f"  }},")

print("];")

# ── debug image ──────────────────────────────────────────────────────────────
from PIL import Image, ImageDraw

img = Image.open("../assets/transparent/body-map.png").convert("RGBA")
# black background so we can see transparent areas
bg = Image.new("RGBA", img.size, (0,0,0,255))
bg.paste(img, mask=img)
draw = ImageDraw.Draw(bg, "RGBA")

regions_draw = [
    ("head",   "rect",    hd_l, hd_t, hd_r, hd_b),
    ("throat", "rect",    th_l, th_t, th_r, th_b),
    ("chest",  "rect",    ch_l, ch_t, ch_r, ch_b),
    ("tummy",  "rect",    tm_l, tm_t, tm_r, tm_b),
    ("lhand",  "ellipse", lh_cx-rx, lh_cy-ry, lh_cx+rx, lh_cy+ry),
    ("rhand",  "ellipse", rh_cx-rx, rh_cy-ry, rh_cx+rx, rh_cy+ry),
    ("knees",  "rect",    kn_l, kn_t, kn_r, kn_b),
]

for name, shape, x0, y0, x1, y1 in regions_draw:
    if shape == "rect":
        draw.rectangle([x0,y0,x1,y1], outline=(255,60,60,230), width=8)
    else:
        draw.ellipse([x0,y0,x1,y1], outline=(255,60,60,230), width=8)

bg.save("../assets/body_map_debug_v3.png")
print("\nDebug image → assets/body_map_debug_v3.png")
