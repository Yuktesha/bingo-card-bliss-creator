
import { BingoCardItem, BingoCardSettings } from "@/types";
import { generateBingoCards } from "./cardGenerator";
import { drawTextCellWithAlignment, drawVerticalText } from "./rendering/textRenderer";
import { drawImageCellWithAlignment } from "./rendering/imageRenderer";
import { setupCanvas } from "./rendering/canvasSetup";
import { RenderingContext } from "./rendering/types";

// Function to load images for the bingo card
async function loadCardImages(items: BingoCardItem[]): Promise<Map<string, HTMLImageElement>> {
  const imageMap = new Map<string, HTMLImageElement>();
  const imagePromises: Promise<void>[] = [];

  items.forEach(item => {
    if (item.image) {
      const promise = new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          imageMap.set(item.id, img);
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load image for item: ${item.text}`);
          resolve(); // Resolve anyway to continue processing
        };
        img.src = item.image;
      });
      imagePromises.push(promise);
    }
  });

  await Promise.all(imagePromises);
  return imageMap;
}

// Function to render the title section of the bingo card
function renderTitleSection(
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
  
  // Draw title text
  ctx.fillStyle = settings.title.color;
  ctx.font = `${settings.title.fontSize * scale / 2}px ${settings.title.fontFamily}`;
  
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

// Function to render the footer section of the bingo card
function renderFooterSection(
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
  
  // Draw footer text
  ctx.fillStyle = settings.footer.color;
  ctx.font = `${settings.footer.fontSize * scale / 2}px ${settings.footer.fontFamily}`;
  
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

export async function renderBingoCardPreview(
  items: BingoCardItem[],
  settings: BingoCardSettings,
  cardIndex: number = 0,
  dpi: number = 300
): Promise<HTMLCanvasElement> {
  console.log('Rendering bingo card preview with DPI:', dpi);
  
  const selectedItems = items.filter(item => item.selected);
  const cellsPerCard = settings.table.rows * settings.table.columns;
  
  if (selectedItems.length < cellsPerCard) {
    throw new Error(`需要至少 ${cellsPerCard} 個選取的項目來生成賓果卡`);
  }
  
  // Generate card items based on index
  let cardItems: BingoCardItem[];
  if (cardIndex > 0) {
    const cards = generateBingoCards(items, settings, cardIndex + 1);
    cardItems = cards[cardIndex - 1];
  } else {
    const cards = generateBingoCards(items, settings, 1);
    cardItems = cards[0];
  }
  
  // Setup canvas with proper DPI
  const { canvas, ctx, scale } = setupCanvas(settings, dpi);
  
  // Calculate margins and dimensions
  const marginTop = settings.margins.top * scale;
  const marginRight = settings.margins.right * scale;
  const marginBottom = settings.margins.bottom * scale;
  const marginLeft = settings.margins.left * scale;
  const availableWidth = canvas.width - marginLeft - marginRight;
  
  // Start drawing from top margin
  let currentY = marginTop;
  
  // Render title if enabled
  currentY = renderTitleSection(ctx, settings, scale, currentY, availableWidth);
  
  // Calculate table dimensions
  const footerHeight = settings.footer.show ? settings.footer.height * scale : 0;
  const footerSpacing = settings.footer.show ? settings.sectionSpacing * scale : 0;
  const tableHeight = canvas.height - currentY - marginBottom - footerHeight - footerSpacing;
  
  const cellWidth = availableWidth / settings.table.columns;
  const cellHeight = tableHeight / settings.table.rows;
  
  // Setup table border style
  ctx.strokeStyle = settings.table.borderColor;
  ctx.lineWidth = settings.table.borderWidth * scale;
  
  if (settings.table.borderStyle === 'dashed') {
    ctx.setLineDash([10 * scale / 2, 5 * scale / 2]);
  } else if (settings.table.borderStyle === 'dotted') {
    ctx.setLineDash([2 * scale / 2, 3 * scale / 2]);
  } else {
    ctx.setLineDash([]);
  }
  
  try {
    const imageMap = await loadCardImages(cardItems);
    let itemIndex = 0;
    
    // Draw all cells with borders
    for (let row = 0; row < settings.table.rows; row++) {
      for (let col = 0; col < settings.table.columns; col++) {
        const x = marginLeft + (col * cellWidth);
        const y = currentY + (row * cellHeight);
        
        ctx.strokeRect(x, y, cellWidth, cellHeight);
        
        if (itemIndex < cardItems.length) {
          const item = cardItems[itemIndex++];
          const img = imageMap.get(item.id);
          const padding = 5 * scale;
          
          const renderContext = { ctx, scale, settings, padding };
          const renderOptions = { 
            x, y, width: cellWidth, height: cellHeight,
            fontSize: 12 * scale / 2,
            alignment: settings.table.contentAlignment,
            padding
          };
          
          if (settings.table.contentType === 'text-only') {
            drawTextCellWithAlignment(renderContext, item.text, renderOptions);
          } 
          else if (settings.table.contentType === 'image-only') {
            if (img) {
              drawImageCellWithAlignment(renderContext, { ...renderOptions, img });
            } else {
              drawTextCellWithAlignment(renderContext, item.text, renderOptions);
            }
          }
          else if (settings.table.contentType === 'image-text') {
            if (img) {
              const imgHeight = cellHeight * 0.6;
              const textHeight = cellHeight * 0.4;
              
              if (settings.table.textImagePosition === 'top') {
                drawImageCellWithAlignment(renderContext, { 
                  ...renderOptions, 
                  y: y + textHeight,
                  height: imgHeight,
                  img 
                });
                drawTextCellWithAlignment(renderContext, item.text, {
                  ...renderOptions,
                  height: textHeight,
                  fontSize: 10 * scale / 2
                });
              }
              else if (settings.table.textImagePosition === 'center') {
                drawImageCellWithAlignment(renderContext, { ...renderOptions, img });
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                const textPadding = padding * 1.5;
                const textWidth = cellWidth - (textPadding * 2);
                const textAreaHeight = cellHeight / 3;
                
                ctx.fillRect(
                  x + textPadding,
                  y + (cellHeight - textAreaHeight) / 2,
                  textWidth,
                  textAreaHeight
                );
                
                drawTextCellWithAlignment(renderContext, item.text, {
                  ...renderOptions,
                  fontSize: 11 * scale / 2
                });
              }
              else if (settings.table.textImagePosition === 'bottom') {
                drawImageCellWithAlignment(renderContext, {
                  ...renderOptions,
                  height: imgHeight,
                  img
                });
                drawTextCellWithAlignment(renderContext, item.text, {
                  ...renderOptions,
                  y: y + imgHeight,
                  height: textHeight,
                  fontSize: 10 * scale / 2
                });
              }
              else if (settings.table.textImagePosition === 'left' || settings.table.textImagePosition === 'right') {
                const imgWidth = cellWidth * 0.6;
                const textWidth = cellWidth * 0.4;
                const isLeft = settings.table.textImagePosition === 'left';
                
                if (isLeft) {
                  drawVerticalText(renderContext, item.text, {
                    ...renderOptions,
                    width: textWidth,
                    fontSize: 10 * scale / 2
                  });
                  drawImageCellWithAlignment(renderContext, {
                    ...renderOptions,
                    x: x + textWidth,
                    width: imgWidth,
                    img
                  });
                } else {
                  drawImageCellWithAlignment(renderContext, {
                    ...renderOptions,
                    width: imgWidth,
                    img
                  });
                  drawVerticalText(renderContext, item.text, {
                    ...renderOptions,
                    x: x + imgWidth,
                    width: textWidth,
                    fontSize: 10 * scale / 2
                  });
                }
              }
            } else {
              drawTextCellWithAlignment(renderContext, item.text, renderOptions);
            }
          }
        }
      }
    }
    
    ctx.setLineDash([]);
    renderFooterSection(ctx, settings, scale, canvas.height, availableWidth);
    
    return canvas;
  } catch (error) {
    console.error('Error during canvas rendering:', error);
    return canvas;
  }
}

export async function renderBingoCardPreviewAsync(
  items: BingoCardItem[],
  settings: BingoCardSettings
): Promise<string> {
  try {
    const canvas = await renderBingoCardPreview(items, settings);
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Failed to render preview:', error);
    throw error;
  }
}
