
import { RenderingContext, TextRenderOptions } from "./types";

export function drawTextCellWithAlignment(
  { ctx }: RenderingContext,
  text: string,
  { x, y, width, height, fontSize = 12, alignment = 'middle-center', padding = 0 }: TextRenderOptions
): void {
  ctx.fillStyle = '#000000';
  // Use a font stack that includes CJK support
  ctx.font = `${fontSize}px "Arial", "Microsoft YaHei", "微軟雅黑", "SimHei", "黑体", sans-serif`;
  
  // Handle horizontal alignment
  if (alignment.includes('left')) {
    ctx.textAlign = 'left';
    x += padding;
  } else if (alignment.includes('right')) {
    ctx.textAlign = 'right';
    x += width - padding;
  } else {
    ctx.textAlign = 'center';
    x += width / 2;
  }
  
  // Handle vertical alignment
  if (alignment.includes('top')) {
    ctx.textBaseline = 'top';
    y += padding;
  } else if (alignment.includes('bottom')) {
    ctx.textBaseline = 'bottom';
    y += height - padding;
  } else {
    ctx.textBaseline = 'middle';
    y += height / 2;
  }
  
  // For CJK text, we don't want to truncate as aggressively
  // Each CJK character is meaningful, and 6-8 chars can express a complete thought
  const isCJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(text);
  const maxLength = isCJK ? 8 : 15;
  const displayText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  
  ctx.fillText(displayText, x, y);
}

export function drawVerticalText(
  { ctx }: RenderingContext,
  text: string,
  { x, y, width, height, fontSize = 12, padding = 0 }: TextRenderOptions
): void {
  ctx.fillStyle = '#000000';
  // Use a font stack that includes CJK support
  ctx.font = `${fontSize}px "Arial", "Microsoft YaHei", "微軟雅黑", "SimHei", "黑体", sans-serif`;
  
  const chars = text.split('');
  // For CJK text, we don't want to truncate as aggressively
  const isCJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(text);
  const maxLength = isCJK ? 6 : 10;
  const displayChars = chars.length > maxLength ? chars.slice(0, maxLength).concat(['...']) : chars;
  const displayCount = displayChars.length;
  
  const centerX = x + width / 2;
  const lineHeight = Math.min((height - padding * 2) / displayCount, fontSize * 1.5);
  let startY = y + padding + (height - padding * 2 - lineHeight * displayCount) / 2;
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  displayChars.forEach((char, index) => {
    const charY = startY + lineHeight * index + lineHeight / 2;
    ctx.fillText(char, centerX, charY);
  });
}
