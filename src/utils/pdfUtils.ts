// Utilities for PDF generation
import jsPDF from 'jspdf';
import { BingoCardItem, BingoCardSettings } from '@/types';
import { renderBingoCardPreview } from './bingo';

/**
 * Calculates dimensions in points based on unit and value
 */
export function convertToPoints(value: number, unit: 'mm' | 'cm' | 'inch'): number {
  // 1 inch = 72 points
  // 1 cm = 28.35 points
  // 1 mm = 2.835 points
  switch (unit) {
    case 'inch': return value * 72;
    case 'cm': return value * 28.35;
    case 'mm': return value * 2.835;
    default: return value;
  }
}

/**
 * Converts between units
 */
export function convertUnits(
  value: number, 
  fromUnit: 'mm' | 'cm' | 'inch',
  toUnit: 'mm' | 'cm' | 'inch'
): number {
  if (fromUnit === toUnit) return value;
  
  // Convert to mm first
  let mmValue: number;
  switch (fromUnit) {
    case 'inch': mmValue = value * 25.4; break;
    case 'cm': mmValue = value * 10; break;
    case 'mm': mmValue = value; break;
    default: mmValue = value;
  }
  
  // Convert from mm to target unit
  switch (toUnit) {
    case 'inch': return mmValue / 25.4;
    case 'cm': return mmValue / 10;
    case 'mm': return mmValue;
    default: return mmValue;
  }
}

/**
 * Gets standard paper size dimensions in mm
 */
export function getPaperSizeDimensions(
  size: string, 
  orientation: 'portrait' | 'landscape'
): { width: number, height: number } {
  const sizes: Record<string, [number, number]> = {
    'A4': [210, 297],
    'A3': [297, 420],
    'B5': [176, 250],
    'Letter': [215.9, 279.4],
    'Legal': [215.9, 355.6],
  };
  
  let [width, height] = sizes[size] || sizes['A4'];
  
  if (orientation === 'landscape') {
    [width, height] = [height, width];
  }
  
  return { width, height };
}

/**
 * Creates a PDF with bingo cards using vector graphics where possible
 */
export async function generateBingoCardPDF(
  items: BingoCardItem[],
  settings: BingoCardSettings,
  numberOfCards: number
): Promise<Blob> {
  // Filter selected items
  const selectedItems = items.filter(item => item.selected);
  const cellsPerCard = settings.table.rows * settings.table.columns;
  
  if (selectedItems.length < cellsPerCard) {
    throw new Error(`需要至少 ${cellsPerCard} 個選取的項目來生成賓果卡`);
  }
  
  console.log('PDF Generation - Settings:', settings);
  console.log('PDF Generation - Items count:', selectedItems.length);
  console.log('PDF Generation - Cards to generate:', numberOfCards);
  
  // Convert unit for jsPDF compatibility
  const pdfUnit = settings.unit === 'inch' ? 'in' : settings.unit;
  
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: settings.orientation,
    unit: pdfUnit,
    format: settings.paperSize === 'Custom' ? [settings.width, settings.height] : settings.paperSize
  });
  
  // Define margins
  const margin = {
    top: settings.margins.top,
    right: settings.margins.right,
    bottom: settings.margins.bottom,
    left: settings.margins.left
  };
  
  console.log('PDF Generation - Margins:', margin);
  console.log('PDF Generation - Unit:', pdfUnit);
  
  // Calculate scale factor for vector drawing
  const unitScaleFactor = pdfUnit === 'mm' ? 1 : (pdfUnit === 'cm' ? 10 : 25.4); // convert to mm
  
  // Generate multiple cards
  for (let cardIndex = 0; cardIndex < numberOfCards; cardIndex++) {
    if (cardIndex > 0) {
      // Add a new page for each additional card
      doc.addPage();
    }
    
    try {
      console.log(`Generating vector-based card ${cardIndex + 1}...`);
      
      // Calculate card dimensions
      const availableWidth = settings.width - margin.left - margin.right;
      const availableHeight = settings.height - margin.top - margin.bottom;
      
      // 1. Draw title section if enabled
      let currentY = margin.top;
      if (settings.title.show) {
        const titleHeight = settings.title.height;
        
        // Title background
        if (settings.title.backgroundColor) {
          doc.setFillColor(settings.title.backgroundColor);
          doc.rect(margin.left, currentY, availableWidth, titleHeight, 'F');
        }
        
        // Title text
        doc.setTextColor(settings.title.color || '#000000');
        doc.setFontSize(settings.title.fontSize);
        
        // Text alignment
        let titleX = margin.left;
        if (settings.title.alignment.includes('center')) {
          titleX = margin.left + (availableWidth / 2);
          doc.setTextAlign('center');
        } else if (settings.title.alignment.includes('right')) {
          titleX = margin.left + availableWidth;
          doc.setTextAlign('right');
        } else {
          doc.setTextAlign('left');
        }
        
        // Calculate y position for text
        const textY = currentY + (titleHeight / 2);
        doc.text(settings.title.text, titleX, textY);
        
        currentY += titleHeight + settings.sectionSpacing;
      }
      
      // 2. Draw table
      const tableHeight = settings.height - currentY - margin.bottom;
      if (settings.footer.show) {
        tableHeight -= (settings.footer.height + settings.sectionSpacing);
      }
      
      const cellWidth = availableWidth / settings.table.columns;
      const cellHeight = tableHeight / settings.table.rows;
      
      // Generate the card's content
      const cards = generateBingoCards(selectedItems, settings, 1, cardIndex);
      const cardItems = cards[0];
      
      // Set up for table drawing
      doc.setDrawColor(settings.table.borderColor || '#000000');
      doc.setLineWidth(settings.table.borderWidth);
      
      // Draw all cells with borders and content
      let itemIndex = 0;
      for (let row = 0; row < settings.table.rows; row++) {
        for (let col = 0; col < settings.table.columns; col++) {
          const x = margin.left + (col * cellWidth);
          const y = currentY + (row * cellHeight);
          
          // Draw cell border
          if (settings.table.borderWidth > 0) {
            // Apply border style
            if (settings.table.borderStyle === 'dashed') {
              doc.setLineDash([3, 2]);
            } else if (settings.table.borderStyle === 'dotted') {
              doc.setLineDash([1, 1]);
            } else {
              doc.setLineDash([]);
            }
            
            doc.rect(x, y, cellWidth, cellHeight, 'S');
          }
          
          if (itemIndex < cardItems.length) {
            const item = cardItems[itemIndex++];
            const cellPadding = 2; // padding inside cells in mm
            
            // Calculate content position based on alignment
            const alignment = settings.table.contentAlignment;
            let contentX = x + cellPadding;
            let contentWidth = cellWidth - (2 * cellPadding);
            
            if (alignment.includes('center') && !alignment.includes('top') && !alignment.includes('bottom')) {
              contentX = x + (cellWidth / 2);
              doc.setTextAlign('center');
            } else if (alignment.includes('right')) {
              contentX = x + cellWidth - cellPadding;
              doc.setTextAlign('right');
            } else {
              doc.setTextAlign('left');
            }
            
            // Different content rendering based on settings
            if (settings.table.contentType === 'text-only') {
              // Text only
              doc.setFontSize(10);
              doc.setTextColor('#000000');
              
              // Calculate text position
              let textY = y + (cellHeight / 2);
              if (alignment.includes('top')) {
                textY = y + cellPadding + 3; // add a bit of space from the top
              } else if (alignment.includes('bottom')) {
                textY = y + cellHeight - cellPadding - 3; // space from bottom
              }
              
              // Truncate text if too long
              const displayText = item.text.length > 15 ? item.text.substring(0, 15) + '...' : item.text;
              doc.text(displayText, contentX, textY);
            }
            else if (settings.table.contentType === 'image-only' || settings.table.contentType === 'image-text') {
              // For image content, we need to use the canvas rendering and crop just that cell
              // This is a hybrid approach - vector for borders and text where possible, raster for images
              if (item.image) {
                // We still need to use the canvas for image rendering
                // Calculate the position where the image should be rendered
                const imgX = x + cellPadding;
                const imgY = y + cellPadding;
                const imgWidth = cellWidth - (2 * cellPadding);
                const imgHeight = cellHeight - (2 * cellPadding);
                
                // Load the image for direct embedding
                const img = new Image();
                await new Promise((resolve, reject) => {
                  img.onload = resolve;
                  img.onerror = reject;
                  img.src = item.image as string;
                });
                
                // Calculate image dimensions to maintain aspect ratio
                const imgRatio = img.width / img.height;
                const cellRatio = imgWidth / imgHeight;
                
                let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
                
                if (imgRatio > cellRatio) {
                  drawWidth = imgWidth;
                  drawHeight = imgWidth / imgRatio;
                  offsetY = (imgHeight - drawHeight) / 2;
                } else {
                  drawHeight = imgHeight;
                  drawWidth = imgHeight * imgRatio;
                  offsetX = (imgWidth - drawWidth) / 2;
                }
                
                // Add the image to the PDF
                doc.addImage(
                  item.image as string,
                  'PNG',
                  imgX + offsetX,
                  imgY + offsetY,
                  drawWidth,
                  drawHeight
                );
                
                // For image-text, add text
                if (settings.table.contentType === 'image-text') {
                  doc.setFontSize(8);
                  doc.setTextColor('#000000');
                  
                  // Position text based on image position
                  let textX = contentX;
                  let textY;
                  
                  if (settings.table.textImagePosition === 'top') {
                    textY = y + cellPadding + 3;
                  } else if (settings.table.textImagePosition === 'bottom') {
                    textY = y + cellHeight - cellPadding - 3;
                  } else if (settings.table.textImagePosition === 'center') {
                    // For center, we'll overlay text on the image with a semi-transparent background
                    const textBgHeight = cellHeight / 4;
                    textY = y + (cellHeight / 2);
                    
                    // Add semi-transparent background for text
                    doc.setFillColor(255, 255, 255, 0.7);
                    doc.rect(
                      x + cellPadding,
                      textY - (textBgHeight / 2),
                      cellWidth - (2 * cellPadding),
                      textBgHeight,
                      'F'
                    );
                  } else if (settings.table.textImagePosition === 'left' || 
                             settings.table.textImagePosition === 'right') {
                    // Text on side - simplified for PDF
                    textY = y + (cellHeight / 2);
                  }
                  
                  // Truncate text if needed
                  const displayText = item.text.length > 12 ? item.text.substring(0, 12) + '...' : item.text;
                  doc.text(displayText, textX, textY);
                }
              } else {
                // Fallback to text if no image
                doc.setFontSize(10);
                doc.setTextColor('#000000');
                const textY = y + (cellHeight / 2);
                doc.text(item.text, contentX, textY);
              }
            }
          }
        }
      }
      
      // Reset dash pattern
      doc.setLineDash([]);
      
      // 3. Draw footer if enabled
      if (settings.footer.show) {
        const footerHeight = settings.footer.height;
        const footerY = settings.height - margin.bottom - footerHeight;
        
        // Footer background
        if (settings.footer.backgroundColor) {
          doc.setFillColor(settings.footer.backgroundColor);
          doc.rect(margin.left, footerY, availableWidth, footerHeight, 'F');
        }
        
        // Footer text
        doc.setTextColor(settings.footer.color || '#000000');
        doc.setFontSize(settings.footer.fontSize);
        
        // Text alignment
        let footerX = margin.left;
        if (settings.footer.alignment.includes('center')) {
          footerX = margin.left + (availableWidth / 2);
          doc.setTextAlign('center');
        } else if (settings.footer.alignment.includes('right')) {
          footerX = margin.left + availableWidth;
          doc.setTextAlign('right');
        } else {
          doc.setTextAlign('left');
        }
        
        // Calculate y position for text
        const textY = footerY + (footerHeight / 2);
        doc.text(settings.footer.text, footerX, textY);
      }
      
      console.log(`Card ${cardIndex + 1} generated successfully with vector graphics`);
      
    } catch (error) {
      console.error(`Failed to render card ${cardIndex + 1}:`, error);
      
      // Fallback to raster method if vector method fails
      console.log(`Falling back to raster method for card ${cardIndex + 1}`);
      try {
        // Render the bingo card as raster image (fallback)
        const canvas = await renderBingoCardPreview(selectedItems, settings, cardIndex);
        
        // High-resolution factor for the image
        const dpi = 300; // dots per inch
        const imgQuality = 0.95; // high quality
        
        // Convert canvas to an image with high resolution
        const imgData = canvas.toDataURL('image/jpeg', imgQuality);
        
        // Calculate the printable area
        const printableWidth = settings.width - margin.left - margin.right;
        const printableHeight = settings.height - margin.top - margin.bottom;
        
        // Add the image to the PDF
        doc.addImage(
          imgData, 
          'JPEG', 
          margin.left, 
          margin.top, 
          printableWidth, 
          printableHeight
        );
        
        console.log(`Card ${cardIndex + 1} generated with raster fallback at ${dpi} DPI`);
      } catch (fallbackError) {
        console.error(`Even fallback failed for card ${cardIndex + 1}:`, fallbackError);
        // Add error text instead of image
        doc.setFontSize(12);
        doc.text(`Failed to render card ${cardIndex + 1}. Error: ${error.message}`, margin.left, margin.top + 10);
      }
    }
  }
  
  // Return the PDF as a blob
  return doc.output('blob');
}

/**
 * Creates a PDF with bingo cards, with additional options for advanced customization
 */
export async function generateBingoCardPDFAsync(
  items: BingoCardItem[],
  settings: BingoCardSettings,
  numberOfCards: number,
  options?: {
    onProgress?: (current: number, total: number) => void;
    cardsPerPage?: number;
    includeInstructions?: boolean;
    highResolution?: boolean;
  }
): Promise<Blob> {
  // Default options
  const opts = {
    onProgress: (current: number, total: number) => {},
    cardsPerPage: 1,
    includeInstructions: false,
    highResolution: true,
    ...options
  };
  
  try {
    // For debugging PDF generation
    console.log('PDF Generation settings:', {
      items: items.length,
      selectedItems: items.filter(item => item.selected).length,
      settings,
      numberOfCards,
      unit: settings.unit,
      highResolution: opts.highResolution
    });
    
    return await generateBingoCardPDF(items, settings, numberOfCards);
  } catch (error) {
    console.log('PDF generation failed:', error);
    throw error;
  }
}
