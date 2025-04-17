
import { jsPDF } from 'jspdf';
import { BingoCardItem, BingoCardSettings } from '@/types';
import { setupPDFFonts } from '@/utils/bingo/fontUtils';
import { generateBingoCards } from '@/utils/bingo/cardGenerator';
import { renderBingoCardPreview } from '@/utils/bingo';

/**
 * Renders a vector-based bingo card directly in the PDF
 */
export async function renderVectorCard(
  doc: jsPDF,
  items: BingoCardItem[],
  settings: BingoCardSettings,
  cardIndex: number
): Promise<void> {
  // Define margins
  const margin = {
    top: settings.margins.top,
    right: settings.margins.right,
    bottom: settings.margins.bottom,
    left: settings.margins.left
  };
  
  // Calculate unit scale factor for vector drawing
  const pdfUnit = settings.unit === 'inch' ? 'in' : (settings.unit === 'cm' ? 'cm' : 'mm');
  const unitScaleFactor = pdfUnit === 'mm' ? 1 : (pdfUnit === 'cm' ? 10 : 25.4);
  
  // Calculate card dimensions
  const availableWidth = settings.width - margin.left - margin.right;
  const availableHeight = settings.height - margin.top - margin.bottom;
  
  // Draw title section if enabled
  let currentY = margin.top;
  if (settings.title.show) {
    const titleHeight = settings.title.height;
    
    if (settings.title.backgroundColor) {
      doc.setFillColor(settings.title.backgroundColor);
      doc.rect(margin.left, currentY, availableWidth, titleHeight, 'F');
    }
    
    doc.setTextColor(settings.title.color || '#000000');
    doc.setFontSize(settings.title.fontSize);
    doc.setFont('sans-serif');
    
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
  
  // Calculate table dimensions
  let tableHeight = settings.height - currentY - margin.bottom;
  if (settings.footer.show) {
    tableHeight -= (settings.footer.height + settings.sectionSpacing);
  }
  
  // Generate card content
  const cards = generateBingoCards(items, settings, 1);
  const cardItems = cards[0];
  
  // Set up table drawing
  doc.setDrawColor(settings.table.borderColor || '#000000');
  doc.setLineWidth(settings.table.borderWidth);
  
  // Draw cells
  const cellWidth = availableWidth / settings.table.columns;
  const cellHeight = tableHeight / settings.table.rows;
  
  // Draw table cells with content
  let itemIndex = 0;
  for (let row = 0; row < settings.table.rows; row++) {
    for (let col = 0; col < settings.table.columns; col++) {
      const x = margin.left + (col * cellWidth);
      const y = currentY + (row * cellHeight);
      
      if (settings.table.borderWidth > 0) {
        doc.rect(x, y, cellWidth, cellHeight, 'S');
      }
      
      if (itemIndex < cardItems.length) {
        const item = cardItems[itemIndex++];
        const cellPadding = 2;
        
        const alignment = settings.table.contentAlignment;
        let contentX = x + cellPadding;
        let contentWidth = cellWidth - (2 * cellPadding);
        
        if (settings.table.contentType === 'text-only') {
          doc.setFontSize(10);
          doc.setTextColor('#000000');
          doc.setFont('sans-serif');
          
          let textY = y + (cellHeight / 2);
          if (alignment.includes('top')) {
            textY = y + cellPadding + 3;
          } else if (alignment.includes('bottom')) {
            textY = y + cellHeight - cellPadding - 3;
          }
          
          const displayText = item.text.length > 15 ? item.text.substring(0, 15) + '...' : item.text;
          
          if (alignment.includes('center') && !alignment.includes('top') && !alignment.includes('bottom')) {
            doc.text(displayText, x + (cellWidth / 2), textY, { align: 'center' });
          } else if (alignment.includes('right')) {
            doc.text(displayText, x + cellWidth - cellPadding, textY, { align: 'right' });
          } else {
            doc.text(displayText, contentX, textY);
          }
        } else if (item.image) {
          const imgX = x + cellPadding;
          const imgY = y + cellPadding;
          const imgWidth = cellWidth - (2 * cellPadding);
          const imgHeight = cellHeight - (2 * cellPadding);
          
          doc.addImage(
            item.image,
            'PNG',
            imgX,
            imgY,
            imgWidth,
            imgHeight
          );
          
          if (settings.table.contentType === 'image-text') {
            doc.setFontSize(8);
            doc.setTextColor('#000000');
            
            const textY = y + cellHeight - cellPadding - 3;
            const displayText = item.text.length > 12 ? item.text.substring(0, 12) + '...' : item.text;
            
            if (alignment.includes('center')) {
              doc.text(displayText, x + (cellWidth / 2), textY, { align: 'center' });
            } else if (alignment.includes('right')) {
              doc.text(displayText, x + cellWidth - cellPadding, textY, { align: 'right' });
            } else {
              doc.text(displayText, x + cellPadding, textY);
            }
          }
        }
      }
    }
  }
  
  // Draw footer if enabled
  if (settings.footer.show) {
    const footerHeight = settings.footer.height;
    const footerY = settings.height - margin.bottom - footerHeight;
    
    if (settings.footer.backgroundColor) {
      doc.setFillColor(settings.footer.backgroundColor);
      doc.rect(margin.left, footerY, availableWidth, footerHeight, 'F');
    }
    
    doc.setTextColor(settings.footer.color || '#000000');
    doc.setFontSize(settings.footer.fontSize);
    doc.setFont('sans-serif');
    
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

/**
 * Renders a raster-based bingo card using the canvas renderer
 */
export async function renderRasterCard(
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

