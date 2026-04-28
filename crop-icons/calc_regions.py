"""
Calculate SVG region coordinates that align with body-map.png.
SVG viewBox will be 0 0 1024 1536 (matches image exactly).
"""

IMG_W, IMG_H = 1024, 1536

# Content bounding box from inspect
BBOX = (136, 101, 889, 1393)
cx_left, cy_top, cx_right, cy_bottom = BBOX
cx_center = (cx_left + cx_right) // 2  # 512

# Region Y boundaries as fractions of content height
ch = cy_bottom - cy_top  # 1292
cw = cx_right - cx_left  # 753

def y(frac): return cy_top + frac * ch
def x_center(): return cx_center

# Region definitions: (top_frac, bottom_frac)
# Based on typical child body proportions
regions = [
    ("head",   0.00, 0.17),
    ("throat", 0.17, 0.24),
    ("chest",  0.24, 0.46),
    ("tummy",  0.46, 0.62),
    ("hands",  0.44, 0.65),  # arms/hands alongside torso
    ("legs",   0.62, 1.00),
]

MIN_HIT = 88  # minimum hit area height

print("SVG viewBox: 0 0 1024 1536\n")
print("const REGIONS: RegionDef[] = [")
for name, t, b in regions:
    yt = y(t)
    yb = y(b)
    mid_y = (yt + yb) / 2
    h_region = yb - yt
    hit_h = max(h_region, MIN_HIT)

    # Shape props
    if name == "head":
        rx = cw * 0.18
        ry = h_region * 0.5
        shape = "ellipse"
        shape_props = f"{{ cx: {cx_center}, cy: {mid_y:.0f}, rx: {rx:.0f}, ry: {ry:.0f} }}"
    elif name == "throat":
        tw = cw * 0.18
        shape = "rect"
        shape_props = f"{{ x: {cx_center - tw/2:.0f}, y: {yt:.0f}, width: {tw:.0f}, height: {h_region:.0f}, rx: 20 }}"
    elif name in ("chest", "tummy", "legs"):
        tw = cw * 0.55 if name != "legs" else cw * 0.50
        shape = "rect"
        shape_props = f"{{ x: {cx_center - tw/2:.0f}, y: {yt:.0f}, width: {tw:.0f}, height: {h_region:.0f}, rx: 20 }}"
    else:  # hands
        shape = "ellipse"
        shape_props = f"{{ cx: {cx_center}, cy: {mid_y:.0f}, rx: 14, ry: 14 }}"

    hit_x = cx_left + cw * 0.1
    hit_w = cw * 0.8
    label_y = yb + 30

    print(f"  {{")
    print(f"    id: '{name}',")
    print(f"    label: '{name.capitalize()}',")
    print(f"    shape: '{shape}',")
    print(f"    shapeProps: {shape_props},")
    print(f"    hitX: {hit_x:.0f}, hitY: {yt:.0f}, hitW: {hit_w:.0f}, hitH: {hit_h:.0f},")
    print(f"    labelX: {cx_center}, labelY: {label_y:.0f},")
    print(f"  }},")

print("];")
print(f"\n// Also update SVG viewBox to: 0 0 {IMG_W} {IMG_H}")
print(f"// regionLabel font-size should be ~28px for this viewBox")
