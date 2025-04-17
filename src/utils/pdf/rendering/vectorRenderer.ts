
import { jsPDF } from 'jspdf';
import { BingoCardItem, BingoCardSettings } from '@/types';
import { setupPDFFonts } from '@/utils/bingo/fontUtils';

/**
 * Renders a vector-based bingo card directly in the PDF
 */
export async function renderVectorCard(
  doc: jsPDF,
  items: BingoCardItem[],
  settings: BingoCardSettings,
  cardIndex: number
): Promise<void> {
  // Calculate margins and positioning
  const margin = {
    top: settings.margins.top,
    right: settings.margins.right,
    bottom: settings.margins.bottom,
    left: settings.margins.left
  };
  
  const pdfUnit = settings.unit === 'inch' ? 'in' : (settings.unit === 'cm' ? 'cm' : 'mm');
  const unitScaleFactor = pdfUnit === 'mm' ? 1 : (pdfUnit === 'cm' ? 10 : 25.4);
  
  // Calculate available space
  const availableWidth = settings.width - margin.left - margin.right;
  const availableHeight = settings.height - margin.top - margin.bottom;
  
  let currentY = await renderHeader(doc, settings, margin, availableWidth);
  currentY = await renderTable(doc, items, settings, margin, currentY, availableWidth);
  await renderFooter(doc, settings, margin, availableWidth);
}

async function renderHeader(
  doc: jsPDF, 
  settings: BingoCardSettings,
  margin: { top: number; right: number; bottom: number; left: number },
  availableWidth: number
): Promise<number> {
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
  
  return currentY;
}

async function renderTable(
  doc: jsPDF,
  items: BingoCardItem[],
  settings: BingoCardSettings,
  margin: { top: number; right: number; bottom: number; left: number },
  startY: number,
  availableWidth: number
): Promise<number> {
  let tableHeight = settings.height - startY - margin.bottom;
  if (settings.footer.show) {
    tableHeight -= (settings.footer.height + settings.sectionSpacing);
  }
  
  // Set up table properties
  doc.setDrawColor(settings.table.borderColor || '#000000');
  doc.setLineWidth(settings.table.borderWidth);
  
  const cellWidth = availableWidth / settings.table.columns;
  const cellHeight = tableHeight / settings.table.rows;
  
  // Draw table cells with content
  const selectedItems = items.filter(item => item.selected);
  let itemIndex = 0;
  
  for (let row = 0; row < settings.table.rows; row++) {
    for (let col = 0; col < settings.table.columns; col++) {
      const x = margin.left + (col * cellWidth);
      const y = startY + (row * cellHeight);
      
      if (settings.table.borderWidth > 0) {
        doc.rect(x, y, cellWidth, cellHeight, 'S');
      }
      
      if (itemIndex < selectedItems.length) {
        await renderCell(doc, selectedItems[itemIndex++], settings, x, y, cellWidth, cellHeight);
      }
    }
  }
  
  return startY + tableHeight + settings.sectionSpacing;
}

async function renderCell(
  doc: jsPDF,
  item: BingoCardItem,
  settings: BingoCardSettings,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<void> {
  const cellPadding = 2;
  const contentWidth = width - (2 * cellPadding);
  const alignment = settings.table.contentAlignment;
  
  if (settings.table.contentType === 'text-only') {
    doc.setFontSize(10);
    doc.setTextColor('#000000');
    doc.setFont('sans-serif');
    
    let textY = y + (height / 2);
    if (alignment.includes('top')) {
      textY = y + cellPadding + 3;
    } else if (alignment.includes('bottom')) {
      textY = y + height - cellPadding - 3;
    }
    
    const displayText = item.text.length > 15 ? item.text.substring(0, 15) + '...' : item.text;
    
    if (alignment.includes('center') && !alignment.includes('top') && !alignment.includes('bottom')) {
      doc.text(displayText, x + (width / 2), textY, { align: 'center' });
    } else if (alignment.includes('right')) {
      doc.text(displayText, x + width - cellPadding, textY, { align: 'right' });
    } else {
      doc.text(displayText, x + cellPadding, textY);
    }
  } else if (item.image) {
    await renderCellWithImage(doc, item, settings, x, y, width, height, cellPadding);
  }
}

async function renderCellWithImage(
  doc: jsPDF,
  item: BingoCardItem,
  settings: BingoCardSettings,
  x: number,
  y: number,
  width: number,
  height: number,
  padding: number
): Promise<void> {
  const imgX = x + padding;
  const imgY = y + padding;
  const imgWidth = width - (2 * padding);
  const imgHeight = height - (2 * padding);
  
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
    
    const textY = y + height - padding - 3;
    const displayText = item.text.length > 12 ? item.text.substring(0, 12) + '...' : item.text;
    
    if (settings.table.contentAlignment.includes('center')) {
      doc.text(displayText, x + (width / 2), textY, { align: 'center' });
    } else if (settings.table.contentAlignment.includes('right')) {
      doc.text(displayText, x + width - padding, textY, { align: 'right' });
    } else {
      doc.text(displayText, x + padding, textY);
    }
  }
}

async function renderFooter(
  doc: jsPDF,
  settings: BingoCardSettings,
  margin: { top: number; right: number; bottom: number; left: number },
  availableWidth: number
): Promise<void> {
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
