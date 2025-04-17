
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
 * Creates a visual representation of a bingo card (for preview purposes)
 * @param items Array of bingo card items
 * @param settings Bingo card settings
 * @param cardIndex Optional index to generate a specific card (for PDF generation)
 */
export async function renderBingoCardPreview(
  items: BingoCardItem[],
  settings: BingoCardSettings,
  cardIndex: number = 0
): Promise<HTMLCanvasElement> {
  console.log('Rendering bingo card preview for card index:', cardIndex);
  console.log('Settings:', settings);
  
  // Filter selected items
  const selectedItems = items.filter(item => item.selected);
  
  // Check if we have enough items
  const cellsPerCard = settings.table.rows * settings.table.columns;
  if (selectedItems.length < cellsPerCard) {
    throw new Error(`需要至少 ${cellsPerCard} 個選取的項目來生成賓果卡`);
  }
  
  // Generate a specific card based on cardIndex
  let cardItems: BingoCardItem[];
  
  // If we're generating multiple cards, shuffle items differently for each card
  if (cardIndex > 0) {
    // Generate all cards and take the one at cardIndex
    const cards = generateBingoCards(items, settings, cardIndex + 1);
    cardItems = cards[cardIndex - 1]; // Fix: Adjust the index to match the array (0-based)
  } else {
    // For the preview, just take the first N items
    const cards = generateBingoCards(items, settings, 1);
    cardItems = cards[0];
  }
  
  // Create a canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('無法創建畫布上下文');
  
  // Set canvas size based on settings (use millimeters as base unit)
  const scale = 4; // Scale up for better quality
  canvas.width = settings.width * scale;
  canvas.height = settings.height * scale;
  
  // Draw white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Define margins
  const marginTop = settings.margins.top * scale;
  const marginRight = settings.margins.right * scale;
  const marginBottom = settings.margins.bottom * scale;
  const marginLeft = settings.margins.left * scale;
  
  // Calculate available width
  const availableWidth = canvas.width - marginLeft - marginRight;
  
  // Start drawing from top margin
  let currentY = marginTop;
  
  // Draw title section if shown
  currentY = renderTitleSection(ctx, settings, scale, currentY, availableWidth);
  
  // Calculate table dimensions
  const footerHeight = settings.footer.show ? settings.footer.height * scale : 0;
  const footerSpacing = settings.footer.show ? settings.sectionSpacing * scale : 0;
  
  const tableHeight = canvas.height - currentY - marginBottom - footerHeight - footerSpacing;
  
  const cellWidth = availableWidth / settings.table.columns;
  const cellHeight = tableHeight / settings.table.rows;
  
  // Draw table cells
  ctx.strokeStyle = settings.table.borderColor;
  ctx.lineWidth = settings.table.borderWidth * scale;
  
  // Setup border style based on settings
  if (settings.table.borderStyle === 'dashed') {
    ctx.setLineDash([10 * scale / 2, 5 * scale / 2]);
  } else if (settings.table.borderStyle === 'dotted') {
    ctx.setLineDash([2 * scale / 2, 3 * scale / 2]);
  } else {
    // solid is default
    ctx.setLineDash([]);
  }
  
  try {
    // Load images first
    const imageMap = await loadCardImages(cardItems);
    let itemIndex = 0;
    
    // Draw all cells with borders
    for (let row = 0; row < settings.table.rows; row++) {
      for (let col = 0; col < settings.table.columns; col++) {
        const x = marginLeft + (col * cellWidth);
        const y = currentY + (row * cellHeight);
        
        // Draw cell border
        ctx.strokeRect(x, y, cellWidth, cellHeight);
        
        if (itemIndex < cardItems.length) {
          const item = cardItems[itemIndex++];
          const img = imageMap.get(item.id);
          
          // Define content position based on alignment
          const alignment = settings.table.contentAlignment;
          let contentX = x;
          let contentY = y;
          let contentWidth = cellWidth;
          let contentHeight = cellHeight;
          
          // Apply padding
          const padding = 5 * scale;
          
          // Draw cell content based on content type
          if (settings.table.contentType === 'text-only') {
            // Text only with alignment
            drawTextCellWithAlignment(ctx, item.text, x, y, cellWidth, cellHeight, 12 * scale / 2, alignment, padding);
          } 
          else if (settings.table.contentType === 'image-only') {
            // Image only if available
            if (img) {
              drawImageCellWithAlignment(ctx, img, x, y, cellWidth, cellHeight, alignment, padding);
            } else {
              // Fallback to text if no image
              drawTextCellWithAlignment(ctx, item.text, x, y, cellWidth, cellHeight, 12 * scale / 2, alignment, padding);
            }
          }
          else if (settings.table.contentType === 'image-text') {
            // Both image and text
            if (img) {
              // Calculate space for text based on position
              let imgHeight = cellHeight * 0.6;
              let textHeight = cellHeight * 0.4;
              let imgY = y;
              let textY = y + imgHeight;
              
              if (settings.table.textImagePosition === 'top') {
                imgY = y + textHeight;
                textY = y;
              }
              else if (settings.table.textImagePosition === 'bottom') {
                // Default arrangement (text at bottom)
              }
              else if (settings.table.textImagePosition === 'left') {
                // Horizontal arrangement
                let imgWidth = cellWidth * 0.6;
                let textWidth = cellWidth * 0.4;
                let imgX = x;
                let textX = x + imgWidth;
                
                drawImageCellWithAlignment(ctx, img, imgX, y, imgWidth, cellHeight, alignment, padding);
                drawTextCellWithAlignment(ctx, item.text, textX, y, textWidth, cellHeight, 10 * scale / 2, alignment, padding);
                continue; // Skip the default drawing
              }
              else if (settings.table.textImagePosition === 'right') {
                // Horizontal arrangement
                let imgWidth = cellWidth * 0.6;
                let textWidth = cellWidth * 0.4;
                let textX = x;
                let imgX = x + textWidth;
                
                drawTextCellWithAlignment(ctx, item.text, textX, y, textWidth, cellHeight, 10 * scale / 2, alignment, padding);
                drawImageCellWithAlignment(ctx, img, imgX, y, imgWidth, cellHeight, alignment, padding);
                continue; // Skip the default drawing
              }
              
              // Draw image in appropriate position
              drawImageCellWithAlignment(ctx, img, x, imgY, cellWidth, imgHeight, alignment, padding);
              
              // Draw text in appropriate position
              drawTextCellWithAlignment(ctx, item.text, x, textY, cellWidth, textHeight, 10 * scale / 2, alignment, padding);
            } else {
              // Fallback to text only if no image
              drawTextCellWithAlignment(ctx, item.text, x, y, cellWidth, cellHeight, 12 * scale / 2, alignment, padding);
            }
          }
        }
      }
    }
    
    // Reset line dash to solid for other elements
    ctx.setLineDash([]);
    
    // Draw footer
    renderFooterSection(ctx, settings, scale, canvas.height, availableWidth);
    
    console.log('Canvas dimensions:', { width: canvas.width, height: canvas.height });
    return canvas;
  } catch (error) {
    console.error('Error during canvas rendering:', error);
    // Still return the canvas even if there's an error, just without the content
    return canvas;
  }
}

/**
 * Draw text with proper alignment
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
  
  // Set text alignment based on the horizontal part of alignment
  if (alignment.includes('left')) {
    ctx.textAlign = 'left';
    x += padding;
  } else if (alignment.includes('right')) {
    ctx.textAlign = 'right';
    x += width - padding;
  } else {
    // center is default
    ctx.textAlign = 'center';
    x += width / 2;
  }
  
  // Set text baseline based on the vertical part of alignment
  if (alignment.includes('top')) {
    ctx.textBaseline = 'top';
    y += padding;
  } else if (alignment.includes('bottom')) {
    ctx.textBaseline = 'bottom';
    y += height - padding;
  } else {
    // middle is default
    ctx.textBaseline = 'middle';
    y += height / 2;
  }
  
  // Truncate text if too long
  const displayText = text.length > 15 ? text.substring(0, 15) + '...' : text;
  
  ctx.fillText(displayText, x, y);
}

/**
 * Draw image with proper alignment
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
    // Calculate proportions that maintain aspect ratio
    const imgWidth = width - (padding * 2);
    const imgHeight = height - (padding * 2);
    
    // Calculate aspect ratio to maintain proportions
    const imgRatio = img.width / img.height;
    const cellRatio = imgWidth / imgHeight;
    
    let drawWidth, drawHeight;
    
    // Scale to fit while maintaining aspect ratio
    if (imgRatio > cellRatio) {
      // Image is wider than cell proportionally
      drawWidth = imgWidth;
      drawHeight = imgWidth / imgRatio;
    } else {
      // Image is taller than cell proportionally
      drawHeight = imgHeight;
      drawWidth = imgHeight * imgRatio;
    }
    
    // Calculate position based on alignment
    let drawX = x + padding;
    let drawY = y + padding;
    
    // Horizontal alignment
    if (alignment.includes('center') && !alignment.includes('top') && !alignment.includes('bottom')) {
      drawX = x + (width - drawWidth) / 2;
    } else if (alignment.includes('right')) {
      drawX = x + width - drawWidth - padding;
    }
    
    // Vertical alignment
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
 * Helper function to asynchronously render and get the preview image
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
