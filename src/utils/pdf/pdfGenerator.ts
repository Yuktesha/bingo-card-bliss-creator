import { jsPDF } from 'jspdf';
import { BingoCardItem, BingoCardSettings } from '@/types';
import { renderBingoCardPreview } from '../bingo';
import { setupPDFFonts } from '../bingo/fontUtils';
import { generateBingoCards } from '../bingo/cardGenerator';

interface PDFGenerationOptions {
  highResolution?: boolean;
  useSystemFonts?: boolean;
  useCJKSupport?: boolean;
}

/**
 * Creates a PDF containing bingo cards, attempting vector graphics first
 */
export async function generateBingoCardPDF(
  items: BingoCardItem[],
  settings: BingoCardSettings,
  numberOfCards: number,
  options?: PDFGenerationOptions
): Promise<Blob> {
  // Default options
  const opts = {
    highResolution: true,
    useSystemFonts: true,
    useCJKSupport: true,
    ...options
  };

  // Filter selected items
  const selectedItems = items.filter(item => item.selected);
  const cellsPerCard = settings.table.rows * settings.table.columns;
  
  if (selectedItems.length < cellsPerCard) {
    throw new Error(`需要至少 ${cellsPerCard} 個選取的項目來生成賓果卡`);
  }
  
  // Create new PDF document
  const pdfUnit = settings.unit === 'inch' ? 'in' : settings.unit;
  const doc = new jsPDF({
    orientation: settings.orientation,
    unit: pdfUnit,
    format: settings.paperSize === 'Custom' ? [settings.width, settings.height] : settings.paperSize,
    compress: true
  });

  // Setup font support for CJK characters
  await setupPDFFonts(doc);
  
  // Generate cards
  for (let cardIndex = 0; cardIndex < numberOfCards; cardIndex++) {
    if (cardIndex > 0) {
      doc.addPage();
    }
    
    try {
      // Attempt vector-based rendering first
      await renderVectorCard(doc, items, settings, cardIndex);
    } catch (error) {
      console.error(`Vector rendering failed for card ${cardIndex + 1}, falling back to raster...`);
      await renderRasterCard(doc, items, settings, cardIndex);
    }
  }

  // Return compressed PDF blob
  return doc.output('blob') as unknown as Blob;
}

async function renderVectorCard(
  doc: jsPDF,
  items: BingoCardItem[],
  settings: BingoCardSettings,
  cardIndex: number
): Promise<void> {
  // 定義邊距
  const margin = {
    top: settings.margins.top,
    right: settings.margins.right,
    bottom: settings.margins.bottom,
    left: settings.margins.left
  };
  
  // 計算縮放因子用於向量繪圖
  const pdfUnit = settings.unit === 'inch' ? 'in' : (settings.unit === 'cm' ? 'cm' : 'mm');
  const unitScaleFactor = pdfUnit === 'mm' ? 1 : (pdfUnit === 'cm' ? 10 : 25.4); // 轉換為毫米
  
  // 計算卡片尺寸
  const availableWidth = settings.width - margin.left - margin.right;
  const availableHeight = settings.height - margin.top - margin.bottom;
  
  // 1. 如果啟用，則繪製標題部分
  let currentY = margin.top;
  if (settings.title.show) {
    const titleHeight = settings.title.height;
    
    // 標題背景
    if (settings.title.backgroundColor) {
      doc.setFillColor(settings.title.backgroundColor);
      doc.rect(margin.left, currentY, availableWidth, titleHeight, 'F');
    }
    
    // 標題文本 - 使用系統字體
    doc.setTextColor(settings.title.color || '#000000');
    doc.setFontSize(settings.title.fontSize);
    doc.setFont('sans-serif');
    
    // 文本對齊
    let titleX = margin.left;
    if (settings.title.alignment.includes('center')) {
      titleX = margin.left + (availableWidth / 2);
      doc.text(settings.title.text, titleX, currentY + (titleHeight / 2), { align: 'center' });
    } else if (settings.title.alignment.includes('right')) {
      titleX = margin.left + availableWidth;
      doc.text(settings.title.text, titleX, currentY + (titleHeight / 2), { align: 'right' });
    } else {
      doc.text(settings.title.text, titleX, currentY + (titleHeight / 2));
    }
    
    currentY += titleHeight + settings.sectionSpacing;
  }
  
  // 2. Draw table
  let tableHeight = settings.height - currentY - margin.bottom;
  if (settings.footer.show) {
    tableHeight -= (settings.footer.height + settings.sectionSpacing);
  }
  
  const cellWidth = availableWidth / settings.table.columns;
  const cellHeight = tableHeight / settings.table.rows;
  
  // Generate the card's content
  const cards = generateBingoCards(items, settings, 1);
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
        doc.rect(x, y, cellWidth, cellHeight, 'S');
      }
      
      if (itemIndex < cardItems.length) {
        const item = cardItems[itemIndex++];
        const cellPadding = 2; // inside cells in mm
        
        // Calculate content position based on alignment
        const alignment = settings.table.contentAlignment;
        let contentX = x + cellPadding;
        let contentWidth = cellWidth - (2 * cellPadding);
        
        // Different content rendering based on settings
        if (settings.table.contentType === 'text-only') {
          // 文字模式 - 每次繪製前重新設定字體確保正確使用字體
          doc.setFontSize(10);
          doc.setTextColor('#000000');
          doc.setFont('sans-serif');
          
          // Calculate text position
          let textY = y + (cellHeight / 2);
          if (alignment.includes('top')) {
            textY = y + cellPadding + 3; // add a bit of space from the top
          } else if (alignment.includes('bottom')) {
            textY = y + cellHeight - cellPadding - 3; // space from bottom
          }
          
          // Truncate text if too long
          const displayText = item.text.length > 15 ? item.text.substring(0, 15) + '...' : item.text;
          
          if (alignment.includes('center') && !alignment.includes('top') && !alignment.includes('bottom')) {
            doc.text(displayText, x + (cellWidth / 2), textY, { align: 'center' });
          } else if (alignment.includes('right')) {
            doc.text(displayText, x + cellWidth - cellPadding, textY, { align: 'right' });
          } else {
            doc.text(displayText, contentX, textY);
          }
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
              
              if (alignment.includes('center') && !alignment.includes('top') && !alignment.includes('bottom')) {
                doc.text(displayText, x + (cellWidth / 2), textY, { align: 'center' });
              } else if (alignment.includes('right')) {
                doc.text(displayText, x + cellWidth - cellPadding, textY, { align: 'right' });
              } else {
                doc.text(displayText, textX, textY);
              }
            }
          } else {
            // Fallback to text if no image
            doc.setFontSize(10);
            doc.setTextColor('#000000');
            const textY = y + (cellHeight / 2);
            
            if (alignment.includes('center') && !alignment.includes('top') && !alignment.includes('bottom')) {
              doc.text(item.text, x + (cellWidth / 2), textY, { align: 'center' });
            } else if (alignment.includes('right')) {
              doc.text(item.text, x + cellWidth - cellPadding, textY, { align: 'right' });
            } else {
              doc.text(item.text, contentX, textY);
            }
          }
        }
      }
    }
  }
  
  // 3. 如果啟用，則繪製頁腳
  if (settings.footer.show) {
    const footerHeight = settings.footer.height;
    const footerY = settings.height - margin.bottom - footerHeight;
    
    // 頁腳背景
    if (settings.footer.backgroundColor) {
      doc.setFillColor(settings.footer.backgroundColor);
      doc.rect(margin.left, footerY, availableWidth, footerHeight, 'F');
    }
    
    // 頁腳文本 - 確保字體設置
    doc.setTextColor(settings.footer.color || '#000000');
    doc.setFontSize(settings.footer.fontSize);
    doc.setFont('sans-serif');
    
    // Text alignment
    let footerX = margin.left;
    if (settings.footer.alignment.includes('center')) {
      footerX = margin.left + (availableWidth / 2);
      doc.text(settings.footer.text, footerX, footerY + (footerHeight / 2), { align: 'center' });
    } else if (settings.footer.alignment.includes('right')) {
      footerX = margin.left + availableWidth;
      doc.text(settings.footer.text, footerX, footerY + (footerHeight / 2), { align: 'right' });
    } else {
      doc.text(settings.footer.text, footerX, footerY + (footerHeight / 2));
    }
  }
}

async function renderRasterCard(
  doc: jsPDF,
  items: BingoCardItem[],
  settings: BingoCardSettings,
  cardIndex: number
): Promise<void> {
  const canvas = await renderBingoCardPreview(items, settings, cardIndex, 300);
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  
  const margin = settings.margins;
  const printableWidth = settings.width - margin.left - margin.right;
  const printableHeight = settings.height - margin.top - margin.bottom;
  
  doc.addImage(
    imgData,
    'JPEG',
    margin.left,
    margin.top,
    printableWidth,
    printableHeight,
    undefined,
    'MEDIUM'
  );
}

/**
 * Creates a PDF containing bingo cards with additional customization options
 */
export async function generateBingoCardPDFAsync(
  items: BingoCardItem[],
  settings: BingoCardSettings,
  numberOfCards: number,
  options?: PDFGenerationOptions & {
    onProgress?: (current: number, total: number) => void;
    cardsPerPage?: number;
    includeInstructions?: boolean;
  }
): Promise<Blob> {
  const opts = {
    onProgress: (current: number, total: number) => {},
    cardsPerPage: 1,
    includeInstructions: false,
    highResolution: true,
    useSystemFonts: true,
    useCJKSupport: true,
    ...options
  };
  
  try {
    return await generateBingoCardPDF(items, settings, numberOfCards, {
      highResolution: opts.highResolution,
      useSystemFonts: opts.useSystemFonts,
      useCJKSupport: opts.useCJKSupport
    });
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
}
