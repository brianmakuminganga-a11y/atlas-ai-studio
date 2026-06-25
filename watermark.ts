// Sharp-based real image watermark for Atlas AI Studio
// Burns "ATLAS AI · FREE" into the bottom-right of free-tier images
import sharp from 'sharp';

const WATERMARK_TEXT = 'ATLAS AI · FREE';
const WATERMARK_FONT_SIZE = 32;

/**
 * Burns a watermark into the bottom-right corner of an image.
 * @param base64Image - base64-encoded PNG/JPEG (no data: prefix)
 * @returns base64-encoded watermarked PNG (no prefix)
 */
export async function applyWatermark(base64Image: string): Promise<string> {
  try {
    const imageBuffer = Buffer.from(base64Image, 'base64');
    const image = sharp(imageBuffer);
    const meta = await image.metadata();
    const width = meta.width || 1024;
    const height = meta.height || 1024;

    // Scale font relative to image size
    const fontSize = Math.max(16, Math.min(WATERMARK_FONT_SIZE, Math.floor(width / 30)));
    const padX = Math.floor(width * 0.025);
    const padY = Math.floor(height * 0.025);
    const textWidth = Math.min(width - padX * 2, WATERMARK_TEXT.length * fontSize * 0.55);
    const textHeight = Math.floor(fontSize * 1.4);
    const boxWidth = textWidth + padX;
    const boxHeight = textHeight + Math.floor(padY / 2);

    // Build SVG overlay: semi-transparent black box + amber text
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <style>
          .wm-text { fill: #F5A623; font-family: DejaVu Sans, Arial, sans-serif; font-weight: bold; font-size: ${fontSize}px; }
        </style>
        <rect x="${width - boxWidth - padX}" y="${height - boxHeight - padY}"
              width="${boxWidth}" height="${boxHeight}"
              fill="rgba(0,0,0,0.65)" rx="${Math.floor(fontSize / 4)}" />
        <text x="${width - boxWidth - padX + padX / 2}" y="${height - padY - boxHeight / 2 + fontSize / 3}"
              class="wm-text">${WATERMARK_TEXT}</text>
      </svg>
    `;

    const watermarked = await image
      .composite([{ input: Buffer.from(svg), top: 0, left: 0, blend: 'over' }])
      .png()
      .toBuffer();

    return watermarked.toString('base64');
  } catch (e: any) {
    console.error('[watermark] failed, returning original:', e.message);
    return base64Image;
  }
}

/**
 * Burns a small "ATLAS AI" logo badge into the bottom-left of any image
 * (used for paid tier too, to brand downloads).
 */
export async function applyBrandingBadge(base64Image: string): Promise<string> {
  try {
    const imageBuffer = Buffer.from(base64Image, 'base64');
    const image = sharp(imageBuffer);
    const meta = await image.metadata();
    const width = meta.width || 1024;
    const height = meta.height || 1024;

    const fontSize = Math.max(12, Math.min(20, Math.floor(width / 50)));
    const padX = Math.floor(width * 0.02);
    const padY = Math.floor(height * 0.02);
    const boxW = Math.floor(fontSize * 5);
    const boxH = Math.floor(fontSize * 1.6);

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <style>
          .brand { fill: #F5A623; font-family: DejaVu Sans, Arial, sans-serif; font-weight: bold; font-size: ${fontSize}px; letter-spacing: 1px; }
        </style>
        <rect x="${padX}" y="${height - boxH - padY}" width="${boxW}" height="${boxH}"
              fill="rgba(0,0,0,0.5)" rx="${Math.floor(fontSize / 4)}" />
        <text x="${padX + fontSize / 2}" y="${height - padY - boxH / 2 + fontSize / 3}" class="brand">ATLAS AI</text>
      </svg>
    `;

    const branded = await image
      .composite([{ input: Buffer.from(svg), top: 0, left: 0, blend: 'over' }])
      .png()
      .toBuffer();

    return branded.toString('base64');
  } catch (e: any) {
    return base64Image;
  }
}
