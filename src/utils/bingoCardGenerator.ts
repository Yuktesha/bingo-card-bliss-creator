import { BingoCardItem, BingoCardSettings } from "@/types";
import { shuffleArray } from "./fileUtils";

/**
 * Generates unique bingo cards by shuffling the selected items
 */
export function generateBingoCards(
  items: BingoCardItem[],
  settings: BingoCardSettings,
  numberOfCards: number
): BingoCardItem[][] {
  // Filter selected items
  const selectedItems = items.filter(item => item.selected);
  
  // Check if we have enough items
  const cellsPerCard = settings.table.rows * settings.table.columns;
  if (selectedItems.length < cellsPerCard) {
    throw new Error(`需要至少 ${cellsPerCard} 個選取的項目來生成賓果卡`);
  }
  
  // Generate cards
  const cards: BingoCardItem[][] = [];
  
  for (let i = 0; i < numberOfCards; i++) {
    // Create a new shuffled copy of the selected items
    let cardItems = shuffleArray([...selectedItems]);
    
    // If we don't have enough items for unique cards, re-use items but ensure
    // each card has a unique arrangement
    if (selectedItems.length < cellsPerCard * numberOfCards) {
      cardItems = shuffleArray([...selectedItems]);
    }
    
    // Take only the items needed for this card
    cards.push(cardItems.slice(0, cellsPerCard));
  }
  
  return cards;
}

/**
 * Creates a visual representation of a bingo card (for preview purposes)
 */
export function renderBingoCardPreview(
  items: BingoCardItem[],
  settings: BingoCardSettings
): HTMLCanvasElement {
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
  
  // Draw title section if shown
  const marginTop = settings.margins.top * scale;
  const marginRight = settings.margins.right * scale;
  const marginBottom = settings.margins.bottom * scale;
  const marginLeft = settings.margins.left * scale;
  
  let currentY = marginTop;
  
  if (settings.title.show) {
    const titleHeight = settings.title.height * scale;
    
    // Title background
    ctx.fillStyle = settings.title.backgroundColor || '#f0f0f0';
    ctx.fillRect(
      marginLeft, 
      currentY, 
      canvas.width - marginLeft - marginRight, 
      titleHeight
    );
    
    // Title text
    ctx.fillStyle = settings.title.color;
    ctx.font = `bold ${settings.title.fontSize * scale / 2}px ${settings.title.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillText(
      settings.title.text, 
      canvas.width / 2, 
      currentY + titleHeight / 2
    );
    
    currentY += titleHeight + (settings.sectionSpacing * scale);
  }
  
  // Calculate table dimensions
  const tableWidth = canvas.width - marginLeft - marginRight;
  
  const footerHeight = settings.footer.show ? settings.footer.height * scale : 0;
  const footerSpacing = settings.footer.show ? settings.sectionSpacing * scale : 0;
  
  const tableHeight = canvas.height - currentY - marginBottom - footerHeight - footerSpacing;
  
  const cellWidth = tableWidth / settings.table.columns;
  const cellHeight = tableHeight / settings.table.rows;
  
  // Draw table cells
  ctx.strokeStyle = settings.table.borderColor;
  ctx.lineWidth = settings.table.borderWidth * scale;
  
  const selectedItems = items.filter(item => item.selected);
  let itemIndex = 0;
  
  // Preload images to ensure they're available when drawing
  const loadImages = async () => {
    const imagePromises = selectedItems
      .filter(item => item.image)
      .map(item => {
        return new Promise<{id: string, img: HTMLImageElement}>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({id: item.id, img});
          img.onerror = () => {
            console.error(`Failed to load image for item: ${item.text}`);
            resolve({id: item.id, img: null});
          };
          img.src = item.image;
        });
      });
    
    return Promise.all(imagePromises);
  };
  
  // Render the bingo card with images
  const renderWithImages = async () => {
    const loadedImages = await loadImages();
    const imageMap = new Map(loadedImages.map(item => [item.id, item.img]));
    
    // Reset itemIndex for rendering
    itemIndex = 0;
    
    // Draw cells with loaded images
    for (let row = 0; row < settings.table.rows; row++) {
      for (let col = 0; col < settings.table.columns; col++) {
        // Calculate cell position
        const x = marginLeft + (col * cellWidth);
        const y = currentY + (row * cellHeight);
        
        // Draw cell border
        ctx.strokeStyle = settings.table.borderColor;
        ctx.lineWidth = settings.table.borderWidth * scale;
        ctx.strokeRect(x, y, cellWidth, cellHeight);
        
        // Fill cell background
        if (settings.table.fillType !== 'none') {
          ctx.fillStyle = settings.table.fillColor;
          ctx.fillRect(x, y, cellWidth, cellHeight);
        }
        
        // Draw cell content if we have enough items
        if (itemIndex < selectedItems.length) {
          const item = selectedItems[itemIndex++];
          
          const contentPadding = {
            top: settings.table.cellPadding.top * scale,
            right: settings.table.cellPadding.right * scale,
            bottom: settings.table.cellPadding.bottom * scale,
            left: settings.table.cellPadding.left * scale
          };
          
          const contentX = x + contentPadding.left;
          const contentY = y + contentPadding.top;
          const contentWidth = cellWidth - contentPadding.left - contentPadding.right;
          const contentHeight = cellHeight - contentPadding.top - contentPadding.bottom;
          
          // Draw image if available and content type requires it
          if ((settings.table.contentType === 'image-only' || settings.table.contentType === 'image-text') && item.image) {
            const img = imageMap.get(item.id);
            
            if (img) {
              let imgX = contentX;
              let imgY = contentY;
              let imgWidth = contentWidth;
              let imgHeight = contentHeight;
              
              // Adjust position and size based on text-image layout
              if (settings.table.contentType === 'image-text') {
                switch (settings.table.textImagePosition) {
                  case 'top':
                    imgY = contentY + contentHeight * 0.4;
                    imgHeight = contentHeight * 0.6;
                    break;
                  case 'bottom':
                    imgHeight = contentHeight * 0.6;
                    break;
                  case 'left':
                    imgWidth = contentWidth * 0.6;
                    break;
                  case 'right':
                    imgX = contentX + contentWidth * 0.4;
                    imgWidth = contentWidth * 0.6;
                    break;
                  case 'center':
                    imgX = contentX + contentWidth * 0.1;
                    imgY = contentY + contentHeight * 0.1;
                    imgWidth = contentWidth * 0.8;
                    imgHeight = contentHeight * 0.8;
                    break;
                }
              }
              
              try {
                // Calculate aspect ratio to maintain proportions
                const imgRatio = img.width / img.height;
                const cellRatio = imgWidth / imgHeight;
                
                let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
                
                // Scale to fit while maintaining aspect ratio
                if (imgRatio > cellRatio) {
                  // Image is wider than cell proportionally
                  drawWidth = imgWidth;
                  drawHeight = imgWidth / imgRatio;
                  offsetY = (imgHeight - drawHeight) / 2;
                } else {
                  // Image is taller than cell proportionally
                  drawHeight = imgHeight;
                  drawWidth = imgHeight * imgRatio;
                  offsetX = (imgWidth - drawWidth) / 2;
                }
                
                // Draw the image
                ctx.drawImage(img, imgX + offsetX, imgY + offsetY, drawWidth, drawHeight);
              } catch (err) {
                console.error('Error drawing image:', err);
                // If image fails to draw, fill with placeholder color
                ctx.fillStyle = '#e0e0e0';
                ctx.fillRect(imgX, imgY, imgWidth, imgHeight);
              }
            } else {
              // Placeholder for missing images
              ctx.fillStyle = '#e0e0e0';
              ctx.fillRect(imgX, imgY, imgWidth, imgHeight);
            }
          } else if (settings.table.contentType !== 'image-only') {
            // If no image available or not needed, draw placeholder
            if (settings.table.contentType === 'image-text' && !item.image) {
              // Draw placeholder for missing image in image-text mode
              ctx.fillStyle = '#e0e0e0';
              
              switch (settings.table.textImagePosition) {
                case 'top':
                  ctx.fillRect(contentX, contentY + contentHeight * 0.4, contentWidth, contentHeight * 0.6);
                  break;
                case 'bottom':
                  ctx.fillRect(contentX, contentY, contentWidth, contentHeight * 0.6);
                  break;
                case 'left':
                  ctx.fillRect(contentX, contentY, contentWidth * 0.6, contentHeight);
                  break;
                case 'right':
                  ctx.fillRect(contentX + contentWidth * 0.4, contentY, contentWidth * 0.6, contentHeight);
                  break;
                case 'center':
                  ctx.fillRect(contentX + contentWidth * 0.1, contentY + contentHeight * 0.1, 
                              contentWidth * 0.8, contentHeight * 0.8);
                  break;
              }
            }
          }
          
          // Draw text
          if (settings.table.contentType !== 'image-only') {
            ctx.fillStyle = '#000000';
            ctx.font = `${12 * scale / 2}px ${settings.title.fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            let textX = x + (cellWidth / 2);
            let textY = y + (cellHeight / 2);
            
            // Adjust position based on text-image layout
            if (settings.table.contentType === 'image-text') {
              switch (settings.table.textImagePosition) {
                case 'top':
                  textY = y + (cellHeight * 0.2);
                  break;
                case 'bottom':
                  textY = y + (cellHeight * 0.8);
                  break;
                case 'left':
                  textX = x + (cellWidth * 0.2);
                  break;
                case 'right':
                  textX = x + (cellWidth * 0.8);
                  break;
                // For center, we'll draw text on top of the image
                case 'center':
                  // Keep default position
                  break;
              }
            }
            
            ctx.fillText(
              item.text.length > 10 ? item.text.substring(0, 10) + '...' : item.text,
              textX,
              textY
            );
          }
        }
      }
    }
    
    // Draw footer if shown
    if (settings.footer.show) {
      const footerY = canvas.height - marginBottom - footerHeight;
      
      // Footer background
      ctx.fillStyle = settings.footer.backgroundColor || '#f0f0f0';
      ctx.fillRect(
        marginLeft, 
        footerY, 
        canvas.width - marginLeft - marginRight, 
        footerHeight
      );
      
      // Footer text
      ctx.fillStyle = settings.footer.color;
      ctx.font = `${settings.footer.fontSize * scale / 2}px ${settings.footer.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.fillText(
        settings.footer.text, 
        canvas.width / 2, 
        footerY + footerHeight / 2
      );
    }
  };
  
  // Start the rendering process
  renderWithImages();
  
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
      const canvas = renderBingoCardPreview(items, settings);
      
      // Wait a bit to ensure images have loaded
      setTimeout(() => {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        } catch (error) {
          console.error('Failed to convert canvas to data URL:', error);
          reject(error);
        }
      }, 100);
    } catch (error) {
      console.error('Failed to render preview:', error);
      reject(error);
    }
  });
}
