import { jsPDF } from 'jspdf';
import { BingoCardItem, BingoCardSettings } from '@/types';
import { setupPDFFonts } from '@/utils/bingo/fontUtils';
import { renderCell } from './cellRenderer';

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
        await renderCell(
          doc,
          selectedItems[itemIndex++],
          settings,
          x,
          y,
          cellWidth,
          cellHeight,
          2
        );
      }
    }
  }
  
  return startY + tableHeight + settings.sectionSpacing;
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
