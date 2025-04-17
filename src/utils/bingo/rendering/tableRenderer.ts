
import { BingoCardItem, BingoCardSettings } from "@/types";
import { renderCell, CellRenderOptions } from "./cellRenderer";

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
          scale,
          padding: 5 * scale
        });
      }
    }
  }
}
