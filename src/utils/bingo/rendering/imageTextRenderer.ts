
import { BingoCardItem } from "@/types";
import { RenderingContext } from "./types";
import { drawTextCellWithAlignment } from "./textRenderer";
import {
  renderTopPosition,
  renderBottomPosition,
  renderCenterPosition,
  renderSidePosition
} from "./positionedContent";

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
  const { x, y, width, height, padding } = options;
  
  // Fallback to text-only if no image
  if (!img) {
    drawTextCellWithAlignment(renderContext, item.text, {
      x, y, width, height,
      fontSize: 12 * renderContext.scale / 2,
      alignment: renderContext.settings.table.contentAlignment,
      padding
    });
    return;
  }

  const renderOptions = {
    x, y, width, height,
    text: item.text,
    img,
    scale: renderContext.scale,
    padding
  };

  switch (renderContext.settings.table.textImagePosition) {
    case 'top':
      renderTopPosition(renderContext, renderOptions);
      break;
    case 'bottom':
      renderBottomPosition(renderContext, renderOptions);
      break;
    case 'center':
      renderCenterPosition(renderContext, renderOptions);
      break;
    case 'left':
    case 'right':
      renderSidePosition(
        renderContext,
        renderOptions,
        renderContext.settings.table.textImagePosition === 'left'
      );
      break;
  }
}
