
import { RenderingContext, TextRenderOptions } from "./types";
import { drawTextCellWithAlignment } from "./textRenderer";

interface TextBackgroundOptions extends TextRenderOptions {
  textAreaHeight?: number;
  opacity?: number;
}

export function drawTextWithBackground(
  renderContext: RenderingContext,
  text: string,
  options: TextBackgroundOptions
): void {
  const { ctx, padding } = renderContext;
  const { 
    x, 
    y, 
    width, 
    height, 
    textAreaHeight = height / 3, 
    opacity = 0.7,
    fontSize = 11 * renderContext.scale / 2
  } = options;
  
  // Draw semi-transparent background for text
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
  const textPadding = padding ? padding * 1.5 : 0;
  const textBackgroundWidth = width - (textPadding * 2);
  
  ctx.fillRect(
    x + textPadding,
    y + (height - textAreaHeight) / 2,
    textBackgroundWidth,
    textAreaHeight
  );
  
  // For CJK text, we may need smaller font size
  const isCJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(text);
  const adjustedFontSize = isCJK ? fontSize * 0.9 : fontSize;
  
  drawTextCellWithAlignment(renderContext, text, {
    ...options,
    fontSize: adjustedFontSize
  });
}
