
import { BingoCardItem, BingoCardSettings } from "@/types";
import { drawTextCellWithAlignment } from "./textRenderer";
import { drawImageCellWithAlignment } from "./imageRenderer";
import { RenderingContext } from "./types";
import { renderImageTextCell } from "./imageTextRenderer";

export interface CellRenderOptions {
  item: BingoCardItem;
  img?: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  padding: number;
}

export function renderCell(
  ctx: CanvasRenderingContext2D,
  settings: BingoCardSettings,
  options: CellRenderOptions
): void {
  const { item, img, x, y, width, height, scale, padding } = options;
  
  const renderContext = { ctx, scale, settings, padding };
  const renderOptions = { 
    x, y, width, height,
    fontSize: 12 * scale / 2,
    alignment: settings.table.contentAlignment,
    padding
  };
  
  switch (settings.table.contentType) {
    case 'text-only':
      drawTextCellWithAlignment(renderContext, item.text, renderOptions);
      break;
      
    case 'image-only':
      if (img) {
        drawImageCellWithAlignment(renderContext, { ...renderOptions, img });
      } else {
        drawTextCellWithAlignment(renderContext, item.text, renderOptions);
      }
      break;
      
    case 'image-text':
      renderImageTextCell(renderContext, item, img, renderOptions);
      break;
  }
}
