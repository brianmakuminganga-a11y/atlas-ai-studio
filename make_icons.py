"""Generate Atlas AI Studio PWA icons — gold 'A' monogram."""
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = '/home/z/my-project/public'
SIZES = [192, 512, 64]

def make_icon(size: int) -> Image.Image:
    img = Image.new('RGB', (size, size), (11, 11, 15))
    draw = ImageDraw.Draw(img)
    # Top gold → bottom deep amber gradient
    top_color = (245, 166, 35)     # #F5A623
    bottom_color = (180, 83, 9)    # deep amber
    for y in range(size):
        t = y / size
        r = int(top_color[0] * (1 - t) + bottom_color[0] * t)
        g = int(top_color[1] * (1 - t) + bottom_color[1] * t)
        b = int(top_color[2] * (1 - t) + bottom_color[2] * t)
        draw.line([(0, y), (size, y)], fill=(r, g, b))

    try:
        font_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
        font_size = int(size * 0.72)
        font = ImageFont.truetype(font_path, font_size)
    except Exception:
        font = ImageFont.load_default()

    text = 'A'
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        tx = (size - tw) // 2 - bbox[0]
        ty = (size - th) // 2 - bbox[1]
    except Exception:
        tw, th = (size // 2, size // 2)
        tx = (size - tw) // 2
        ty = (size - th) // 2

    # Shadow
    shadow_offset = max(2, size // 64)
    draw.text((tx + shadow_offset, ty + shadow_offset), text, font=font, fill=(0, 0, 0))
    # Main letter (dark, contrasts with gold)
    draw.text((tx, ty), text, font=font, fill=(11, 11, 15))

    # Subtle bottom border accent
    draw.line([(0, size - 1), (size, size - 1)], fill=(245, 166, 35))

    return img

for s in SIZES:
    img = make_icon(s)
    if s == 64:
        out = f'{OUTPUT_DIR}/favicon.png'
    else:
        out = f'{OUTPUT_DIR}/icon-{s}.png'
    img.save(out, 'PNG')
    print(f'Wrote {out}')
