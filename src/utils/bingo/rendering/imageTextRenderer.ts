
import { BingoCardItem } from "@/types";
import { RenderingContext } from "./types";
import { drawTextCellWithAlignment, drawVerticalText } from "./textRenderer";
import { drawImageCellWithAlignment } from "./imageRenderer";

interface ImageTextRenderOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  padding: number;
}

export function renderImageTextCell(
  renderContext: RenderingContext,
  item: BingoCardItem,
  img: HTMLImageElement | undefined,
  options: ImageTextRenderOptions
): void {
  const { ctx, settings, padding } = renderContext;
  const { x, y, width, height } = options;

  if (!img) {
    drawTextCellWithAlignment(renderContext, item.text, {
      ...options,
      fontSize: 12 * renderContext.scale / 2,
      alignment: settings.table.contentAlignment
    });
    return;
  }

  const imgHeight = height * 0.6;
  const textHeight = height * 0.4;

  switch (settings.table.textImagePosition) {
    case 'top':
      drawImageCellWithAlignment(renderContext, {
        x, y: y + textHeight, width, height: imgHeight,
        img, padding
      });
      drawTextCellWithAlignment(renderContext, item.text, {
        x, y, width, height: textHeight,
        fontSize: 10 * renderContext.scale / 2,
        padding
      });
      break;

    case 'bottom':
      drawImageCellWithAlignment(renderContext, {
        x, y, width, height: imgHeight,
        img, padding
      });
      drawTextCellWithAlignment(renderContext, item.text, {
        x, y: y + imgHeight, width, height: textHeight,
        fontSize: 10 * renderContext.scale / 2,
        padding
      });
      break;

    case 'center': {
      drawImageCellWithAlignment(renderContext, { x, y, width, height, img, padding });
      
      // Draw semi-transparent background for text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      const textPadding = padding * 1.5;
      const textBackgroundWidth = width - (textPadding * 2);
      const textAreaHeight = height / 3;
      
      ctx.fillRect(
        x + textPadding,
        y + (height - textAreaHeight) / 2,
        textBackgroundWidth,
        textAreaHeight
      );
      
      drawTextCellWithAlignment(renderContext, item.text, {
        x, y, width, height,
        fontSize: 11 * renderContext.scale / 2,
        padding
      });
      break;
    }

    case 'left':
    case 'right': {
      const imgWidth = width * 0.6;
      const textWidth = width * 0.4;
      const isLeft = settings.table.textImagePosition === 'left';

      if (isLeft) {
        drawVerticalText(renderContext, item.text, {
          x, y, width: textWidth, height,
          fontSize: 10 * renderContext.scale / 2,
          padding
        });
        drawImageCellWithAlignment(renderContext, {
          x: x + textWidth, y, width: imgWidth, height,
          img, padding
        });
      } else {
        drawImageCellWithAlignment(renderContext, {
          x, y, width: imgWidth, height,
          img, padding
        });
        drawVerticalText(renderContext, item.text, {
          x: x + imgWidth, y, width: textWidth, height,
          fontSize: 10 * renderContext.scale / 2,
          padding
        });
      }
      break;
    }
  }
}
