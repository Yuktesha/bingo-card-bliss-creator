import { BingoCardItem, BingoCardSettings } from "@/types";
import { generateBingoCards } from "./cardGenerator";
import { 
  loadCardImages, 
  renderTitleSection, 
  renderFooterSection,
  drawTextCell,
  drawImageCell
} from "./canvasRenderer";

/**
 * 創建賓果卡的視覺表示（用於預覽目的）
 * @param items 賓果卡項目數組
 * @param settings 賓果卡設定
 * @param cardIndex 可選索引以生成特定卡片（用於PDF生成）
 * @param dpi 高DPI參數
 */
export async function renderBingoCardPreview(
  items: BingoCardItem[],
  settings: BingoCardSettings,
  cardIndex: number = 0,
  dpi: number = 300
): Promise<HTMLCanvasElement> {
  console.log('Rendering bingo card preview with DPI:', dpi);
  console.log('Settings:', settings);
  
  // 過濾選定的項目
  const selectedItems = items.filter(item => item.selected);
  
  // 檢查我們是否有足夠的項目
  const cellsPerCard = settings.table.rows * settings.table.columns;
  if (selectedItems.length < cellsPerCard) {
    throw new Error(`需要至少 ${cellsPerCard} 個選取的項目來生成賓果卡`);
  }
  
  // 根據cardIndex生成特定卡片
  let cardItems: BingoCardItem[];
  
  // 如果我們正在生成多個卡片，為每張卡片以不同方式洗牌
  if (cardIndex > 0) {
    // 生成所有卡片並獲取cardIndex的卡片
    const cards = generateBingoCards(items, settings, cardIndex + 1);
    cardItems = cards[cardIndex - 1];
  } else {
    // 對於預覽，只取前N個項目
    const cards = generateBingoCards(items, settings, 1);
    cardItems = cards[0];
  }
  
  // 創建畫布元素並設置高DPI
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('無法創建畫布上下文');
  
  // 使用DPI計算縮放因子
  const scale = (dpi / 96) * 4; // 96 is default screen DPI, multiply by 4 for better quality
  canvas.width = settings.width * scale;
  canvas.height = settings.height * scale;
  
  // 為高DPI渲染設置比例
  ctx.scale(scale, scale);
  
  // 繪製白色背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 定義邊距
  const marginTop = settings.margins.top * scale;
  const marginRight = settings.margins.right * scale;
  const marginBottom = settings.margins.bottom * scale;
  const marginLeft = settings.margins.left * scale;
  
  // 計算可用寬度
  const availableWidth = canvas.width - marginLeft - marginRight;
  
  // 從頂部邊距開始繪製
  let currentY = marginTop;
  
  // 如果顯示，則繪製標題部分
  currentY = renderTitleSection(ctx, settings, scale, currentY, availableWidth);
  
  // 計算表格尺寸
  const footerHeight = settings.footer.show ? settings.footer.height * scale : 0;
  const footerSpacing = settings.footer.show ? settings.sectionSpacing * scale : 0;
  
  const tableHeight = canvas.height - currentY - marginBottom - footerHeight - footerSpacing;
  
  const cellWidth = availableWidth / settings.table.columns;
  const cellHeight = tableHeight / settings.table.rows;
  
  // 繪製表格單元格
  ctx.strokeStyle = settings.table.borderColor;
  ctx.lineWidth = settings.table.borderWidth * scale;
  
  // 根據設定設置邊框樣式
  if (settings.table.borderStyle === 'dashed') {
    ctx.setLineDash([10 * scale / 2, 5 * scale / 2]);
  } else if (settings.table.borderStyle === 'dotted') {
    ctx.setLineDash([2 * scale / 2, 3 * scale / 2]);
  } else {
    // solid是預設值
    ctx.setLineDash([]);
  }
  
  try {
    // 首先加載圖片
    const imageMap = await loadCardImages(cardItems);
    let itemIndex = 0;
    
    // 繪製所有帶邊框的單元格
    for (let row = 0; row < settings.table.rows; row++) {
      for (let col = 0; col < settings.table.columns; col++) {
        const x = marginLeft + (col * cellWidth);
        const y = currentY + (row * cellHeight);
        
        // 繪製單元格邊框
        ctx.strokeRect(x, y, cellWidth, cellHeight);
        
        if (itemIndex < cardItems.length) {
          const item = cardItems[itemIndex++];
          const img = imageMap.get(item.id);
          
          // 根據對齊方式確定內容位置
          const alignment = settings.table.contentAlignment;
          let contentX = x;
          let contentY = y;
          let contentWidth = cellWidth;
          let contentHeight = cellHeight;
          
          // 應用填充
          const padding = 5 * scale;
          
          // 根據內容類型繪製單元格內容
          if (settings.table.contentType === 'text-only') {
            // 僅文字與對齊
            drawTextCellWithAlignment(ctx, item.text, x, y, cellWidth, cellHeight, 12 * scale / 2, alignment, padding);
          } 
          else if (settings.table.contentType === 'image-only') {
            // 僅圖片（如果可用）
            if (img) {
              drawImageCellWithAlignment(ctx, img, x, y, cellWidth, cellHeight, alignment, padding);
            } else {
              // 如果沒有圖片，回退到文字
              drawTextCellWithAlignment(ctx, item.text, x, y, cellWidth, cellHeight, 12 * scale / 2, alignment, padding);
            }
          }
          else if (settings.table.contentType === 'image-text') {
            // 圖片和文字都有
            if (img) {
              // 根據位置計算文字空間
              let imgHeight = cellHeight * 0.6;
              let textHeight = cellHeight * 0.4;
              let imgY = y;
              let textY = y + imgHeight;
              
              // 處理不同文字位置
              if (settings.table.textImagePosition === 'top') {
                // 文字在上方
                imgY = y + textHeight;
                textY = y;
                
                // 繪製圖片
                drawImageCellWithAlignment(ctx, img, x, imgY, cellWidth, imgHeight, alignment, padding);
                
                // 繪製文字
                drawTextCellWithAlignment(ctx, item.text, x, textY, cellWidth, textHeight, 10 * scale / 2, alignment, padding);
              }
              else if (settings.table.textImagePosition === 'center') {
                // 改成適當處理中心文字 - 將文字置於圖片上方
                drawImageCellWithAlignment(ctx, img, x, y, cellWidth, cellHeight, alignment, padding);
                
                // 在圖片上方中央繪製文字
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // 半透明白色背景
                const textPadding = padding * 1.5;
                const textWidth = cellWidth - (textPadding * 2);
                const textAreaHeight = cellHeight / 3;
                
                // 繪製文字背景
                ctx.fillRect(
                  x + textPadding, 
                  y + (cellHeight - textAreaHeight) / 2,
                  textWidth,
                  textAreaHeight
                );
                
                // 繪製文字
                ctx.fillStyle = '#000000';
                ctx.font = `bold ${11 * scale / 2}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                ctx.fillText(
                  item.text.length > 15 ? item.text.substring(0, 15) + '...' : item.text,
                  x + cellWidth / 2,
                  y + cellHeight / 2
                );
              }
              else if (settings.table.textImagePosition === 'bottom') {
                // 預設排列（文字在底部）
                drawImageCellWithAlignment(ctx, img, x, imgY, cellWidth, imgHeight, alignment, padding);
                drawTextCellWithAlignment(ctx, item.text, x, textY, cellWidth, textHeight, 10 * scale / 2, alignment, padding);
              }
              else if (settings.table.textImagePosition === 'left') {
                // 水平排列 - 左側文字（直排）
                let imgWidth = cellWidth * 0.6;
                let textWidth = cellWidth * 0.4;
                let textX = x;
                let imgX = x + textWidth;
                
                // 繪製圖片
                drawImageCellWithAlignment(ctx, img, imgX, y, imgWidth, cellHeight, alignment, padding);
                
                // 繪製直排文字
                drawVerticalText(ctx, item.text, textX, y, textWidth, cellHeight, 10 * scale / 2, padding);
              }
              else if (settings.table.textImagePosition === 'right') {
                // 水平排列 - 右側文字（直排）
                let imgWidth = cellWidth * 0.6;
                let textWidth = cellWidth * 0.4;
                let imgX = x;
                let textX = x + imgWidth;
                
                // 繪製圖片
                drawImageCellWithAlignment(ctx, img, imgX, y, imgWidth, cellHeight, alignment, padding);
                
                // 繪製直排文字
                drawVerticalText(ctx, item.text, textX, y, textWidth, cellHeight, 10 * scale / 2, padding);
              }
            } else {
              // 如果沒有圖片，回退到僅文字
              drawTextCellWithAlignment(ctx, item.text, x, y, cellWidth, cellHeight, 12 * scale / 2, alignment, padding);
            }
          }
        }
      }
    }
    
    // 重置虛線為實線用於其他元素
    ctx.setLineDash([]);
    
    // 繪製頁尾
    renderFooterSection(ctx, settings, scale, canvas.height, availableWidth);
    
    console.log('Canvas dimensions:', { width: canvas.width, height: canvas.height });
    return canvas;
  } catch (error) {
    console.error('Error during canvas rendering:', error);
    // 即使發生錯誤，仍然返回畫布，只是沒有內容
    return canvas;
  }
}

/**
 * 繪製具有適當對齊的文字
 */
function drawTextCellWithAlignment(
  ctx: CanvasRenderingContext2D, 
  text: string,
  x: number, 
  y: number, 
  width: number, 
  height: number,
  fontSize: number = 12,
  alignment: string = 'middle-center',
  padding: number = 0
): void {
  ctx.fillStyle = '#000000';
  ctx.font = `${fontSize}px Arial`;
  
  // 根據對齊的水平部分設置文字對齊
  if (alignment.includes('left')) {
    ctx.textAlign = 'left';
    x += padding;
  } else if (alignment.includes('right')) {
    ctx.textAlign = 'right';
    x += width - padding;
  } else {
    // center是預設值
    ctx.textAlign = 'center';
    x += width / 2;
  }
  
  // 根據對齊的垂直部分設置文字基線
  if (alignment.includes('top')) {
    ctx.textBaseline = 'top';
    y += padding;
  } else if (alignment.includes('bottom')) {
    ctx.textBaseline = 'bottom';
    y += height - padding;
  } else {
    // middle是預設值
    ctx.textBaseline = 'middle';
    y += height / 2;
  }
  
  // 如果文字太長則截斷
  const displayText = text.length > 15 ? text.substring(0, 15) + '...' : text;
  
  ctx.fillText(displayText, x, y);
}

/**
 * 繪製直排文字
 */
function drawVerticalText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fontSize: number = 12,
  padding: number = 0
): void {
  ctx.fillStyle = '#000000';
  ctx.font = `${fontSize}px Arial`;
  
  // 計算每個字符的垂直位置
  const chars = text.split('');
  const charCount = chars.length;
  
  // 確保不超過合理的字數
  const displayChars = charCount > 10 ? chars.slice(0, 10).concat(['...']) : chars;
  const displayCount = displayChars.length;
  
  // 計算字符之間的垂直間距
  const centerX = x + width / 2;
  const lineHeight = Math.min((height - padding * 2) / displayCount, fontSize * 1.5);
  let startY = y + padding + (height - padding * 2 - lineHeight * displayCount) / 2;
  
  // 逐個繪製字符
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  displayChars.forEach((char, index) => {
    const charY = startY + lineHeight * index + lineHeight / 2;
    ctx.fillText(char, centerX, charY);
  });
}

/**
 * 繪製具有適當對齊的圖片
 */
function drawImageCellWithAlignment(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  alignment: string = 'middle-center',
  padding: number = 0
): void {
  try {
    // 計算保持縱橫比的比例
    const imgWidth = width - (padding * 2);
    const imgHeight = height - (padding * 2);
    
    // 計算縱橫比以保持比例
    const imgRatio = img.width / img.height;
    const cellRatio = imgWidth / imgHeight;
    
    let drawWidth, drawHeight;
    
    // 縮放以適合同時保持縱橫比
    if (imgRatio > cellRatio) {
      // 圖片比單元格比例更寬
      drawWidth = imgWidth;
      drawHeight = imgWidth / imgRatio;
    } else {
      // 圖片比單元格比例更高
      drawHeight = imgHeight;
      drawWidth = imgHeight * imgRatio;
    }
    
    // 根據對齊計算位置
    let drawX = x + padding;
    let drawY = y + padding;
    
    // 水平對齊
    if (alignment.includes('center') && !alignment.includes('top') && !alignment.includes('bottom')) {
      drawX = x + (width - drawWidth) / 2;
    } else if (alignment.includes('right')) {
      drawX = x + width - drawWidth - padding;
    }
    
    // 垂直對齊
    if (alignment.includes('middle')) {
      drawY = y + (height - drawHeight) / 2;
    } else if (alignment.includes('bottom')) {
      drawY = y + height - drawHeight - padding;
    }
    
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  } catch (err) {
    console.error('Error drawing image:', err);
  }
}

/**
 * 幫助函數以非同步渲染並獲取預覽圖片
 */
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
