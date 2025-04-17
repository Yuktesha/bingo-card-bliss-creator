
import { jsPDF } from 'jspdf';
import { BingoCardItem, BingoCardSettings } from '@/types';

export async function renderCell(
  doc: jsPDF,
  item: BingoCardItem,
  settings: BingoCardSettings,
  x: number,
  y: number,
  width: number,
  height: number,
  cellPadding: number
): Promise<void> {
  if (settings.table.contentType === 'text-only') {
    await renderTextCell(doc, item.text, settings, x, y, width, height, cellPadding);
  } else if (settings.table.contentType === 'image-only' && item.image) {
    await renderImageCell(doc, item, settings, x, y, width, height, cellPadding);
  } else if (settings.table.contentType === 'image-text') {
    await renderImageTextCell(doc, item, settings, x, y, width, height, cellPadding);
  }
}

async function renderTextCell(
  doc: jsPDF,
  text: string,
  settings: BingoCardSettings,
  x: number,
  y: number,
  width: number,
  height: number,
  cellPadding: number
): Promise<void> {
  doc.setFontSize(10);
  doc.setTextColor('#000000');
  doc.setFont('sans-serif');
  
  let textY = y + (height / 2);
  if (settings.table.contentAlignment.includes('top')) {
    textY = y + cellPadding + 3;
  } else if (settings.table.contentAlignment.includes('bottom')) {
    textY = y + height - cellPadding - 3;
  }
  
  const displayText = text.length > 15 ? text.substring(0, 15) + '...' : text;
  
  if (settings.table.contentAlignment.includes('center') && !settings.table.contentAlignment.includes('top') && !settings.table.contentAlignment.includes('bottom')) {
    doc.text(displayText, x + (width / 2), textY, { align: 'center' });
  } else if (settings.table.contentAlignment.includes('right')) {
    doc.text(displayText, x + width - cellPadding, textY, { align: 'right' });
  } else {
    doc.text(displayText, x + cellPadding, textY);
  }
}

async function renderImageCell(
  doc: jsPDF,
  item: BingoCardItem,
  settings: BingoCardSettings,
  x: number,
  y: number,
  width: number,
  height: number,
  padding: number
): Promise<void> {
  if (!item.image) return;
  
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
}

async function renderImageTextCell(
  doc: jsPDF,
  item: BingoCardItem,
  settings: BingoCardSettings,
  x: number,
  y: number,
  width: number,
  height: number,
  padding: number
): Promise<void> {
  if (item.image) {
    await renderImageCell(doc, item, settings, x, y, width, height * 0.7, padding);
  }
  
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
