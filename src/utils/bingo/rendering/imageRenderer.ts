
import { RenderingContext, ImageRenderOptions } from "./types";

export function drawImageCellWithAlignment(
  { ctx }: RenderingContext,
  { img, x, y, width, height, alignment = 'middle-center', padding = 0 }: ImageRenderOptions
): void {
  try {
    // Calculate available space for image
    const imgMaxWidth = width - (padding * 2);
    const imgMaxHeight = height - (padding * 2);
    
    // Calculate dimensions while preserving aspect ratio
    const imgRatio = img.width / img.height;
    let drawWidth, drawHeight;
    
    if (imgRatio > 1) {
      // Landscape image
      drawWidth = Math.min(imgMaxWidth, img.width);
      drawHeight = drawWidth / imgRatio;
      
      // If height exceeds available space, recalculate
      if (drawHeight > imgMaxHeight) {
        drawHeight = imgMaxHeight;
        drawWidth = drawHeight * imgRatio;
      }
    } else {
      // Portrait or square image
      drawHeight = Math.min(imgMaxHeight, img.height);
      drawWidth = drawHeight * imgRatio;
      
      // If width exceeds available space, recalculate
      if (drawWidth > imgMaxWidth) {
        drawWidth = imgMaxWidth;
        drawHeight = drawWidth / imgRatio;
      }
    }
    
    // Determine position based on alignment
    let drawX = x + padding;
    let drawY = y + padding;
    
    // Horizontal alignment
    if (alignment.includes('center') && !alignment.includes('left') && !alignment.includes('right')) {
      drawX += (imgMaxWidth - drawWidth) / 2;
    } else if (alignment.includes('right')) {
      drawX += imgMaxWidth - drawWidth;
    }
    
    // Vertical alignment
    if (alignment.includes('middle') && !alignment.includes('top') && !alignment.includes('bottom')) {
      drawY += (imgMaxHeight - drawHeight) / 2;
    } else if (alignment.includes('bottom')) {
      drawY += imgMaxHeight - drawHeight;
    }
    
    // Draw the image
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  } catch (err) {
    console.error('Error drawing image:', err);
  }
}
