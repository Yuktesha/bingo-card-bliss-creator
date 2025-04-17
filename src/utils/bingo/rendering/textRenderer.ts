
import { RenderingContext, TextRenderOptions } from "./types";

export function drawTextCellWithAlignment(
  { ctx }: RenderingContext,
  text: string,
  { x, y, width, height, fontSize = 12, alignment = 'middle-center', padding = 0 }: TextRenderOptions
): void {
  ctx.fillStyle = '#000000';
  ctx.font = `${fontSize}px Arial`;
  
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
  
  const displayText = text.length > 15 ? text.substring(0, 15) + '...' : text;
  ctx.fillText(displayText, x, y);
}

export function drawVerticalText(
  { ctx }: RenderingContext,
  text: string,
  { x, y, width, height, fontSize = 12, padding = 0 }: TextRenderOptions
): void {
  ctx.fillStyle = '#000000';
  ctx.font = `${fontSize}px Arial`;
  
  const chars = text.split('');
  const displayChars = chars.length > 10 ? chars.slice(0, 10).concat(['...']) : chars;
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
