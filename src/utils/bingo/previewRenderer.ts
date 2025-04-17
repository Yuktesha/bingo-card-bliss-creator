
import { BingoCardItem, BingoCardSettings } from "@/types";
import { generateBingoCards } from "./cardGenerator";
import { drawTextCellWithAlignment, drawVerticalText } from "./rendering/textRenderer";
import { drawImageCellWithAlignment } from "./rendering/imageRenderer";
import { setupCanvas } from "./rendering/canvasSetup";
import { renderTitleSection, renderFooterSection } from "./rendering/layoutRenderer";
import { loadCardImages } from "./rendering/imageLoader";

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
  
  // 生成賓果卡內容
  let cardItems: BingoCardItem[];
  try {
    if (cardIndex > 0) {
      const cards = generateBingoCards(items, settings, cardIndex + 1);
      cardItems = cards[cardIndex - 1];
    } else {
      const cards = generateBingoCards(items, settings, 1);
      cardItems = cards[0];
    }
  } catch (error) {
    console.error("Error generating bingo cards:", error);
    throw error;
  }
  
  // 設置畫布
  const { canvas, ctx, scale } = setupCanvas(settings, dpi);
  
  const marginTop = settings.margins.top * scale;
  const marginRight = settings.margins.right * scale;
  const marginBottom = settings.margins.bottom * scale;
  const marginLeft = settings.margins.left * scale;
  const availableWidth = canvas.width - marginLeft - marginRight;
  
  let currentY = marginTop;
  
  // 渲染標題部分
  currentY = renderTitleSection(ctx, settings, scale, currentY, availableWidth);
  
  // 計算表格高度
  const footerHeight = settings.footer.show ? settings.footer.height * scale : 0;
  const footerSpacing = settings.footer.show ? settings.sectionSpacing * scale : 0;
  const tableHeight = canvas.height - currentY - marginBottom - footerHeight - footerSpacing;
  
  const cellWidth = availableWidth / settings.table.columns;
  const cellHeight = tableHeight / settings.table.rows;
  
  // 設置表格樣式
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
    // 加載所有單元格圖像
    const imageMap = await loadCardImages(cardItems);
    let itemIndex = 0;
    
    // 渲染所有單元格
    for (let row = 0; row < settings.table.rows; row++) {
      for (let col = 0; col < settings.table.columns; col++) {
        const x = marginLeft + (col * cellWidth);
        const y = currentY + (row * cellHeight);
        
        // 繪製單元格邊框
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
          
          // 根據內容類型渲染單元格
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
    
    // 渲染頁腳
    ctx.setLineDash([]);
    renderFooterSection(ctx, settings, scale, canvas.height, availableWidth);
    
    return canvas;
  } catch (error) {
    console.error('Error during canvas rendering:', error);
    throw error;
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
