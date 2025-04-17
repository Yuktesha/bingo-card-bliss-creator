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
    cardItems = cards[cardIndex];
  } else {
    // For the preview, just take the first N items
    cardItems = shuffleArray([...selectedItems]).slice(0, cellsPerCard);
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
  
  let itemIndex = 0;
  
  // Preload images to ensure they're available when drawing
  const loadImages = async () => {
    const imagePromises = cardItems
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
  
  // Draw cells
  for (let row = 0; row < settings.table.rows; row++) {
    for (let col = 0; col < settings.table.columns; col++) {
      // Calculate cell position
      const x = marginLeft + (col * cellWidth);
      const y = currentY + (row * cellHeight);
      
      // Draw cell border
      ctx.strokeRect(x, y, cellWidth, cellHeight);
      
      // Draw cell content if we have enough items
      if (itemIndex < cardItems.length) {
        const item = cardItems[itemIndex++];
        
        // Display text in the cell
        ctx.fillStyle = '#000000';
        ctx.font = `${12 * scale / 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillText(
          item.text.length > 15 ? item.text.substring(0, 15) + '...' : item.text,
          x + (cellWidth / 2),
          y + (cellHeight / 2)
        );
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
    
    console.log('Footer rendered at:', footerY, 'with height:', footerHeight);
  }
  
  // Load and render images asynchronously
  loadImages().then(loadedImages => {
    const imageMap = new Map(loadedImages.map(item => [item.id, item.img]));
    
    // Reset itemIndex for rendering with images
    itemIndex = 0;
    
    // Redraw cells with loaded images
    for (let row = 0; row < settings.table.rows; row++) {
      for (let col = 0; col < settings.table.columns; col++) {
        if (itemIndex < cardItems.length) {
          const item = cardItems[itemIndex++];
          const img = imageMap.get(item.id);
          
          if (img && (settings.table.contentType === 'image-only' || settings.table.contentType === 'image-text')) {
            const x = marginLeft + (col * cellWidth);
            const y = currentY + (row * cellHeight);
            
            try {
              // Draw the image at the appropriate position based on settings
              const padding = 5 * scale;
              const imgWidth = cellWidth - (padding * 2);
              const imgHeight = cellHeight - (padding * 2);
              
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
              
              ctx.drawImage(img, x + padding + offsetX, y + padding + offsetY, drawWidth, drawHeight);
            } catch (err) {
              console.error('Error drawing image:', err);
            }
          }
        }
      }
    }
  }).catch(error => {
    console.error('Error loading images:', error);
  });
  
  console.log('Canvas dimensions:', { width: canvas.width, height: canvas.height });
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
