
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
export function renderBingoCardPreview(
  items: BingoCardItem[],
  settings: BingoCardSettings,
  cardIndex: number = 0
): HTMLCanvasElement {
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
  
  // Create a promise to handle image loading and then return the canvas
  return new Promise<HTMLCanvasElement>((resolve) => {
    // Load images first
    loadCardImages(cardItems).then(imageMap => {
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
            
            // Draw cell content based on content type
            if (settings.table.contentType === 'text-only') {
              // Text only
              drawTextCell(ctx, item.text, x, y, cellWidth, cellHeight, 12 * scale / 2);
            } 
            else if (settings.table.contentType === 'image-only') {
              // Image only if available
              if (img) {
                drawImageCell(ctx, img, x, y, cellWidth, cellHeight, 5 * scale);
              } else {
                // Fallback to text if no image
                drawTextCell(ctx, item.text, x, y, cellWidth, cellHeight, 12 * scale / 2);
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
                
                // Draw image in appropriate position
                drawImageCell(ctx, img, x, imgY, cellWidth, imgHeight, 5 * scale);
                
                // Draw text in appropriate position
                drawTextCell(ctx, item.text, x, textY, cellWidth, textHeight, 10 * scale / 2);
              } else {
                // Fallback to text only if no image
                drawTextCell(ctx, item.text, x, y, cellWidth, cellHeight, 12 * scale / 2);
              }
            }
          }
        }
      }
      
      // Draw footer
      renderFooterSection(ctx, settings, scale, canvas.height, availableWidth);
      
      console.log('Canvas dimensions:', { width: canvas.width, height: canvas.height });
      resolve(canvas);
    }).catch(error => {
      console.error('Error loading images:', error);
      // Still return the canvas even if image loading fails
      resolve(canvas);
    });
  });
  
  // Early return a placeholder canvas while images load
  return canvas;
}

/**
 * Helper function to asynchronously render and get the preview image
 */
export async function renderBingoCardPreviewAsync(
  items: BingoCardItem[],
  settings: BingoCardSettings
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvasPromise = renderBingoCardPreview(items, settings);
      
      // Handle both cases: if the function returns a Promise or directly a canvas
      Promise.resolve(canvasPromise).then((canvas) => {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        } catch (error) {
          console.error('Failed to convert canvas to data URL:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('Failed to render preview:', error);
      reject(error);
    }
  });
}
