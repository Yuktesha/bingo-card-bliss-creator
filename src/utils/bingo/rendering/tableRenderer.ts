
import { BingoCardItem, BingoCardSettings } from "@/types";
import { drawTextCellWithAlignment, drawVerticalText } from "./textRenderer";
import { drawImageCellWithAlignment } from "./imageRenderer";

interface TableRenderOptions {
  cardItems: BingoCardItem[];
  imageMap: Map<string, HTMLImageElement>;
  scale: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function renderTableSection(
  ctx: CanvasRenderingContext2D,
  settings: BingoCardSettings,
  options: TableRenderOptions
): void {
  const { cardItems, imageMap, scale, x, y, width, height } = options;
  
  const cellWidth = width / settings.table.columns;
  const cellHeight = height / settings.table.rows;
  
  // Setup table style
  ctx.strokeStyle = settings.table.borderColor;
  ctx.lineWidth = settings.table.borderWidth * scale;
  
  if (settings.table.borderStyle === 'dashed') {
    ctx.setLineDash([10 * scale / 2, 5 * scale / 2]);
  } else if (settings.table.borderStyle === 'dotted') {
    ctx.setLineDash([2 * scale / 2, 3 * scale / 2]);
  } else {
    ctx.setLineDash([]);
  }
  
  let itemIndex = 0;
  
  // Render all cells
  for (let row = 0; row < settings.table.rows; row++) {
    for (let col = 0; col < settings.table.columns; col++) {
      const cellX = x + (col * cellWidth);
      const cellY = y + (row * cellHeight);
      
      // Draw cell border
      ctx.strokeRect(cellX, cellY, cellWidth, cellHeight);
      
      if (itemIndex < cardItems.length) {
        renderCell(ctx, settings, {
          item: cardItems[itemIndex++],
          img: imageMap.get(cardItems[itemIndex - 1].id),
          x: cellX,
          y: cellY,
          width: cellWidth,
          height: cellHeight,
          scale
        });
      }
    }
  }
}

interface CellRenderOptions {
  item: BingoCardItem;
  img?: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

function renderCell(
  ctx: CanvasRenderingContext2D,
  settings: BingoCardSettings,
  options: CellRenderOptions
): void {
  const { item, img, x, y, width, height, scale } = options;
  const padding = 5 * scale;
  
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
      renderImageTextCell(ctx, settings, { ...options, padding });
      break;
  }
}

function renderImageTextCell(
  ctx: CanvasRenderingContext2D,
  settings: BingoCardSettings,
  options: CellRenderOptions
): void {
  const { item, img, x, y, width, height, scale, padding } = options;
  if (!img) {
    drawTextCellWithAlignment({ ctx, scale, settings, padding }, item.text, {
      x, y, width, height,
      fontSize: 12 * scale / 2,
      alignment: settings.table.contentAlignment,
      padding
    });
    return;
  }
  
  const renderContext = { ctx, scale, settings, padding };
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
        fontSize: 10 * scale / 2,
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
        fontSize: 10 * scale / 2,
        padding
      });
      break;
      
    case 'center':
      drawImageCellWithAlignment(renderContext, { x, y, width, height, img, padding });
      
      // Draw semi-transparent background for text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      const textPadding = padding * 1.5;
      const textWidth = width - (textPadding * 2);
      const textAreaHeight = height / 3;
      
      ctx.fillRect(
        x + textPadding,
        y + (height - textAreaHeight) / 2,
        textWidth,
        textAreaHeight
      );
      
      drawTextCellWithAlignment(renderContext, item.text, {
        x, y, width, height,
        fontSize: 11 * scale / 2,
        padding
      });
      break;
      
    case 'left':
    case 'right':
      const imgWidth = width * 0.6;
      const textWidth = width * 0.4;
      const isLeft = settings.table.textImagePosition === 'left';
      
      if (isLeft) {
        drawVerticalText(renderContext, item.text, {
          x, y, width: textWidth, height,
          fontSize: 10 * scale / 2,
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
          fontSize: 10 * scale / 2,
          padding
        });
      }
      break;
  }
}
