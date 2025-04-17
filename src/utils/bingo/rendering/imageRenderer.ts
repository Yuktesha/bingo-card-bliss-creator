
import { RenderingContext, ImageRenderOptions } from "./types";

export function drawImageCellWithAlignment(
  { ctx }: RenderingContext,
  { img, x, y, width, height, alignment = 'middle-center', padding = 0 }: ImageRenderOptions
): void {
  try {
    const imgWidth = width - (padding * 2);
    const imgHeight = height - (padding * 2);
    
    const imgRatio = img.width / img.height;
    const cellRatio = imgWidth / imgHeight;
    
    let drawWidth, drawHeight;
    if (imgRatio > cellRatio) {
      drawWidth = imgWidth;
      drawHeight = imgWidth / imgRatio;
    } else {
      drawHeight = imgHeight;
      drawWidth = imgHeight * imgRatio;
    }
    
    let drawX = x + padding;
    let drawY = y + padding;
    
    if (alignment.includes('center') && !alignment.includes('top') && !alignment.includes('bottom')) {
      drawX = x + (width - drawWidth) / 2;
    } else if (alignment.includes('right')) {
      drawX = x + width - drawWidth - padding;
    }
    
    if (alignment.includes('middle')) {
      drawY = y + (height - drawHeight) / 2;
    } else if (alignment.includes('bottom')) {
      drawY = y + height - drawHeight - padding;
    }
    
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  } catch (err) {
    console.error('Error drawing image:', err);
  }
}
