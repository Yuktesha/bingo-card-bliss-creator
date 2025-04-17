
import { BingoCardSettings } from "@/types";

export function renderTitleSection(
  ctx: CanvasRenderingContext2D,
  settings: BingoCardSettings,
  scale: number,
  startY: number,
  availableWidth: number
): number {
  if (!settings.title.show) return startY;
  
  const titleHeight = settings.title.height * scale;
  const x = (settings.margins.left * scale);
  const y = startY;
  
  // Fill title background
  ctx.fillStyle = settings.title.backgroundColor;
  ctx.fillRect(x, y, availableWidth, titleHeight);
  
  // Draw title text with CJK font support
  ctx.fillStyle = settings.title.color;
  ctx.font = `${settings.title.fontSize * scale / 2}px "Arial", "Microsoft YaHei", "微軟雅黑", "SimHei", "黑体", ${settings.title.fontFamily}`;
  
  // Determine text position based on alignment
  let textX = x;
  if (settings.title.alignment.includes('center')) {
    textX += availableWidth / 2;
    ctx.textAlign = 'center';
  } else if (settings.title.alignment.includes('right')) {
    textX += availableWidth;
    ctx.textAlign = 'right';
  } else {
    ctx.textAlign = 'left';
  }
  
  // Vertical alignment
  let textY = y;
  if (settings.title.alignment.includes('middle')) {
    textY += titleHeight / 2;
    ctx.textBaseline = 'middle';
  } else if (settings.title.alignment.includes('bottom')) {
    textY += titleHeight;
    ctx.textBaseline = 'bottom';
  } else {
    ctx.textBaseline = 'top';
  }
  
  ctx.fillText(settings.title.text, textX, textY);
  
  // Return the Y position after the title section plus spacing
  return y + titleHeight + (settings.sectionSpacing * scale);
}

export function renderFooterSection(
  ctx: CanvasRenderingContext2D,
  settings: BingoCardSettings,
  scale: number,
  canvasHeight: number,
  availableWidth: number
): void {
  if (!settings.footer.show) return;
  
  const footerHeight = settings.footer.height * scale;
  const x = (settings.margins.left * scale);
  const y = canvasHeight - (settings.margins.bottom * scale) - footerHeight;
  
  // Fill footer background
  ctx.fillStyle = settings.footer.backgroundColor;
  ctx.fillRect(x, y, availableWidth, footerHeight);
  
  // Draw footer text with CJK font support
  ctx.fillStyle = settings.footer.color;
  ctx.font = `${settings.footer.fontSize * scale / 2}px "Arial", "Microsoft YaHei", "微軟雅黑", "SimHei", "黑体", ${settings.footer.fontFamily}`;
  
  // Determine text position based on alignment
  let textX = x;
  if (settings.footer.alignment.includes('center')) {
    textX += availableWidth / 2;
    ctx.textAlign = 'center';
  } else if (settings.footer.alignment.includes('right')) {
    textX += availableWidth;
    ctx.textAlign = 'right';
  } else {
    ctx.textAlign = 'left';
  }
  
  // Vertical alignment
  let textY = y;
  if (settings.footer.alignment.includes('middle')) {
    textY += footerHeight / 2;
    ctx.textBaseline = 'middle';
  } else if (settings.footer.alignment.includes('bottom')) {
    textY += footerHeight;
    ctx.textBaseline = 'bottom';
  } else {
    ctx.textBaseline = 'top';
  }
  
  ctx.fillText(settings.footer.text, textX, textY);
}
