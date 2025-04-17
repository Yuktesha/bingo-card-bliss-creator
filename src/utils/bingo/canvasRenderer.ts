
import { BingoCardItem, BingoCardSettings } from "@/types";

/**
 * Loads images for rendering on canvas
 */
export async function loadCardImages(cardItems: BingoCardItem[]): Promise<Map<string, HTMLImageElement>> {
  const imageMap = new Map<string, HTMLImageElement>();
  
  const imagePromises = cardItems
    .filter(item => item.image)
    .map(item => {
      return new Promise<{id: string, img: HTMLImageElement | null}>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({id: item.id, img});
        img.onerror = () => {
          console.error(`Failed to load image for item: ${item.text}`);
          resolve({id: item.id, img: null});
        };
        img.src = item.image as string;
      });
    });
  
  const loadedImages = await Promise.all(imagePromises);
  
  loadedImages.forEach(({id, img}) => {
    if (img) {
      imageMap.set(id, img);
    }
  });
  
  return imageMap;
}

/**
 * Renders title section on canvas
 */
export function renderTitleSection(
  ctx: CanvasRenderingContext2D,
  settings: BingoCardSettings,
  scale: number,
  startY: number,
  availableWidth: number
): number {
  if (!settings.title.show) {
    return startY;
  }
  
  const titleHeight = settings.title.height * scale;
  
  // Title background
  ctx.fillStyle = settings.title.backgroundColor || '#f0f0f0';
  ctx.fillRect(
    settings.margins.left * scale, 
    startY, 
    availableWidth, 
    titleHeight
  );
  
  // Title text
  ctx.fillStyle = settings.title.color;
  ctx.font = `bold ${settings.title.fontSize * scale / 2}px ${settings.title.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  ctx.fillText(
    settings.title.text, 
    settings.margins.left * scale + availableWidth / 2, 
    startY + titleHeight / 2
  );
  
  return startY + titleHeight + (settings.sectionSpacing * scale);
}

/**
 * Renders footer section on canvas
 */
export function renderFooterSection(
  ctx: CanvasRenderingContext2D,
  settings: BingoCardSettings,
  scale: number,
  canvasHeight: number,
  availableWidth: number
): void {
  if (!settings.footer.show) {
    return;
  }
  
  const footerHeight = settings.footer.height * scale;
  const footerY = canvasHeight - (settings.margins.bottom * scale) - footerHeight;
  
  // Footer background
  ctx.fillStyle = settings.footer.backgroundColor || '#f0f0f0';
  ctx.fillRect(
    settings.margins.left * scale, 
    footerY, 
    availableWidth, 
    footerHeight
  );
  
  // Footer text
  ctx.fillStyle = settings.footer.color;
  ctx.font = `${settings.footer.fontSize * scale / 2}px ${settings.footer.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  ctx.fillText(
    settings.footer.text, 
    settings.margins.left * scale + availableWidth / 2, 
    footerY + footerHeight / 2
  );
  
  console.log('Footer rendered at:', footerY, 'with height:', footerHeight);
}

/**
 * Draws a text cell on canvas
 */
export function drawTextCell(
  ctx: CanvasRenderingContext2D, 
  text: string,
  x: number, 
  y: number, 
  width: number, 
  height: number,
  fontSize: number = 12
): void {
  ctx.fillStyle = '#000000';
  ctx.font = `${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  ctx.fillText(
    text.length > 15 ? text.substring(0, 15) + '...' : text,
    x + (width / 2),
    y + (height / 2)
  );
}

/**
 * Draws an image in a cell on canvas
 */
export function drawImageCell(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  padding: number
): void {
  try {
    // Calculate proportions that maintain aspect ratio
    const imgWidth = width - (padding * 2);
    const imgHeight = height - (padding * 2);
    
    // Calculate aspect ratio to maintain proportions
    const imgRatio = img.width / img.height;
    const cellRatio = imgWidth / imgHeight;
    
    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
    
    // Scale to fit while maintaining aspect ratio
    if (imgRatio > cellRatio) {
      // Image is wider than cell proportionally
      drawWidth = imgWidth;
      drawHeight = imgWidth / imgRatio;
      offsetY = (imgHeight - drawHeight) / 2;
    } else {
      // Image is taller than cell proportionally
      drawHeight = imgHeight;
      drawWidth = imgHeight * imgRatio;
      offsetX = (imgWidth - drawWidth) / 2;
    }
    
    ctx.drawImage(
      img, 
      x + padding + offsetX, 
      y + padding + offsetY, 
      drawWidth, 
      drawHeight
    );
  } catch (err) {
    console.error('Error drawing image:', err);
  }
}
