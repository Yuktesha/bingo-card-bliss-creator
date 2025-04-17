
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
  const { x, y, width, height, textAreaHeight = height / 3, opacity = 0.7 } = options;
  
  // Draw semi-transparent background for text
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
  const textPadding = padding * 1.5;
  const textBackgroundWidth = width - (textPadding * 2);
  
  ctx.fillRect(
    x + textPadding,
    y + (height - textAreaHeight) / 2,
    textBackgroundWidth,
    textAreaHeight
  );
  
  drawTextCellWithAlignment(renderContext, text, options);
}
