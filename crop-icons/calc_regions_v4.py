"""
Fix hands position — they sit at the sides of the body, arms extended.
From the reference image (683x853 display, 1024x1536 actual):

Left hand ellipse:  center ~(108, 470) in ref → scaled
Right hand ellipse: center ~(575, 470) in ref → scaled

Tummy rect: top ~455, bottom ~545 in ref
Hands are at ~430–510 in ref (alongside the tummy vertically, but on the sides)

Key fix: hands labelY should be distinct from tummy labelY.
Tummy label → 900, Hands label → 846 (hands are slightly higher than tummy center)

Also the hands hit area should only cover the side arm areas, not the full width
overlapping the torso.
"""

SX = 1024 / 683
SY = 1536 / 853

def sx(v): return round(v * SX)
def sy(v): return round(v * SY)

# Left hand: ref cx=108, cy=470, rx=40, ry=45
# Right hand: ref cx=575, cy=470, rx=40, ry=45
lh_cx, lh_cy = sx(108), sy(470)
rh_cx, rh_cy = sx(575), sy(470)
rx, ry = sx(40), sy(45)

print(f"Left hand center:  ({lh_cx}, {lh_cy}), rx={rx}, ry={ry}")
print(f"Right hand center: ({rh_cx}, {rh_cy}), rx={rx}, ry={ry}")

# Hit areas: two separate side strips, not overlapping torso center
# Left strip: x 90–240, Right strip: x 760–910, y covers hand area
lh_hit = (sx(70), sy(425), sx(175), sy(520))   # left: x0,y0,x1,y1
rh_hit = (sx(508), sy(425), sx(615), sy(520))  # right

print(f"\nLeft hit:  x={lh_hit[0]} y={lh_hit[1]} w={lh_hit[2]-lh_hit[0]} h={lh_hit[3]-lh_hit[1]}")
print(f"Right hit: x={rh_hit[0]} y={rh_hit[1]} w={rh_hit[2]-rh_hit[0]} h={rh_hit[3]-rh_hit[1]}")

# Combined hit area spanning both hands (full width, side areas only)
# Use full width but keep y tight to hand level only
hit_x = sx(70)
hit_y = sy(425)
hit_w = rh_hit[2] - sx(70)
hit_h = sy(95)
print(f"\nCombined hit: x={hit_x} y={hit_y} w={hit_w} h={hit_h}")

# Label: to the right, at hand vertical center
label_y = (lh_cy + rh_cy) // 2
print(f"Label Y: {label_y}")

# Debug image
from PIL import Image, ImageDraw

img = Image.open("../assets/transparent/body-map.png").convert("RGBA")
bg = Image.new("RGBA", img.size, (0,0,0,255))
bg.paste(img, mask=img)
draw = ImageDraw.Draw(bg, "RGBA")

# Draw existing regions
draw.rectangle([292,99,735,315], outline=(255,60,60,200), width=6)   # head
draw.rectangle([382,459,637,567], outline=(255,60,60,200), width=6)  # throat
draw.rectangle([277,567,750,819], outline=(255,60,60,200), width=6)  # chest
draw.rectangle([292,819,735,981], outline=(255,60,60,200), width=6)  # tummy
draw.rectangle([292,1116,735,1260], outline=(255,60,60,200), width=6) # knees

# Draw hands
draw.ellipse([lh_cx-rx, lh_cy-ry, lh_cx+rx, lh_cy+ry], outline=(60,255,60,200), width=6)
draw.ellipse([rh_cx-rx, rh_cy-ry, rh_cx+rx, rh_cy+ry], outline=(60,255,60,200), width=6)

# Draw label dots at x=795
for ly in [207, 513, 693, 900, label_y, 1188]:
    draw.ellipse([785,ly-12,807,ly+12], fill=(255,255,0,200))

bg.save("../assets/body_map_debug_v4.png")
print("\nDebug → assets/body_map_debug_v4.png")
