
import { BingoCardItem, BingoCardSettings } from "@/types";

/**
 * 加載用於在畫布上渲染的圖片
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
 * 在畫布上渲染標題部分
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
  
  // 標題背景
  ctx.fillStyle = settings.title.backgroundColor || '#f0f0f0';
  ctx.fillRect(
    settings.margins.left * scale, 
    startY, 
    availableWidth, 
    titleHeight
  );
  
  // 標題文字
  ctx.fillStyle = settings.title.color;
  ctx.font = `bold ${settings.title.fontSize * scale / 2}px ${settings.title.fontFamily}`;
  
  // 應用田字對齊設定
  const alignment = settings.title.alignment;
  let titleX, titleY;
  
  // 水平對齊
  if (alignment.includes('left')) {
    ctx.textAlign = 'left';
    titleX = (settings.margins.left * scale) + (titleHeight * 0.1);
  } else if (alignment.includes('right')) {
    ctx.textAlign = 'right';
    titleX = (settings.margins.left * scale) + availableWidth - (titleHeight * 0.1);
  } else {
    // center 是預設
    ctx.textAlign = 'center';
    titleX = settings.margins.left * scale + availableWidth / 2;
  }
  
  // 垂直對齊
  if (alignment.includes('top')) {
    ctx.textBaseline = 'top';
    titleY = startY + (titleHeight * 0.1);
  } else if (alignment.includes('bottom')) {
    ctx.textBaseline = 'bottom';
    titleY = startY + titleHeight - (titleHeight * 0.1);
  } else {
    // middle 是預設
    ctx.textBaseline = 'middle';
    titleY = startY + titleHeight / 2;
  }
  
  ctx.fillText(
    settings.title.text, 
    titleX, 
    titleY
  );
  
  return startY + titleHeight + (settings.sectionSpacing * scale);
}

/**
 * 在畫布上渲染頁尾部分
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
  
  // 頁尾背景
  ctx.fillStyle = settings.footer.backgroundColor || '#f0f0f0';
  ctx.fillRect(
    settings.margins.left * scale, 
    footerY, 
    availableWidth, 
    footerHeight
  );
  
  // 頁尾文字
  ctx.fillStyle = settings.footer.color;
  ctx.font = `${settings.footer.fontSize * scale / 2}px ${settings.footer.fontFamily}`;
  
  // 應用頁尾對齊
  const alignment = settings.footer.alignment;
  let footerX, footerY;
  
  // 水平對齊
  if (alignment.includes('left')) {
    ctx.textAlign = 'left';
    footerX = (settings.margins.left * scale) + (footerHeight * 0.1);
  } else if (alignment.includes('right')) {
    ctx.textAlign = 'right';
    footerX = (settings.margins.left * scale) + availableWidth - (footerHeight * 0.1);
  } else {
    // center 是預設
    ctx.textAlign = 'center';
    footerX = settings.margins.left * scale + availableWidth / 2;
  }
  
  // 垂直對齊
  const baseY = canvasHeight - (settings.margins.bottom * scale) - footerHeight;
  if (alignment.includes('top')) {
    ctx.textBaseline = 'top';
    footerY = baseY + (footerHeight * 0.1);
  } else if (alignment.includes('bottom')) {
    ctx.textBaseline = 'bottom';
    footerY = baseY + footerHeight - (footerHeight * 0.1);
  } else {
    // middle 是預設
    ctx.textBaseline = 'middle';
    footerY = baseY + footerHeight / 2;
  }
  
  ctx.fillText(
    settings.footer.text, 
    footerX, 
    footerY
  );
  
  console.log('Footer rendered at:', footerY, 'with height:', footerHeight);
}

/**
 * 在畫布上繪製文字單元格
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
 * 在畫布上繪製單元格中的圖片
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
    // 計算保持縱橫比的比例
    const imgWidth = width - (padding * 2);
    const imgHeight = height - (padding * 2);
    
    // 計算縱橫比以保持比例
    const imgRatio = img.width / img.height;
    const cellRatio = imgWidth / imgHeight;
    
    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
    
    // 縮放以適合同時保持縱橫比
    if (imgRatio > cellRatio) {
      // 圖片比單元格比例更寬
      drawWidth = imgWidth;
      drawHeight = imgWidth / imgRatio;
      offsetY = (imgHeight - drawHeight) / 2;
    } else {
      // 圖片比單元格比例更高
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
