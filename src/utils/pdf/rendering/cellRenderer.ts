
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
  // Detect if text contains CJK characters
  const hasCJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(text);
  
  // Adjust font size for CJK text
  const fontSize = hasCJK ? 8 : 10;
  doc.setFontSize(fontSize);
  doc.setTextColor('#000000');
  
  // Use a different font stack for CJK content
  if (hasCJK) {
    try {
      // Try to use a font with CJK support
      doc.setFont('sans-serif');
    } catch (e) {
      console.warn('Failed to set CJK font, using default font instead');
      doc.setFont('helvetica');
    }
  } else {
    doc.setFont('helvetica');
  }
  
  let textY = y + (height / 2);
  if (settings.table.contentAlignment.includes('top')) {
    textY = y + cellPadding + 3;
  } else if (settings.table.contentAlignment.includes('bottom')) {
    textY = y + height - cellPadding - 3;
  }
  
  // CJK text should have more characters displayed before truncation
  const maxLength = hasCJK ? 6 : 15;
  const displayText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  
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
  
  // Calculate the image dimensions while maintaining aspect ratio
  const imgX = x + padding;
  const imgY = y + padding;
  const imgMaxWidth = width - (2 * padding);
  const imgMaxHeight = height - (2 * padding);
  
  try {
    // Create an Image object to get the aspect ratio
    const img = new Image();
    img.src = item.image;
    
    // Calculate dimensions while preserving aspect ratio
    let imgWidth, imgHeight;
    const aspectRatio = img.width / img.height;
    
    if (aspectRatio > 1) {
      // Landscape image
      imgWidth = imgMaxWidth;
      imgHeight = imgMaxWidth / aspectRatio;
      
      // If height is too large, recalculate
      if (imgHeight > imgMaxHeight) {
        imgHeight = imgMaxHeight;
        imgWidth = imgHeight * aspectRatio;
      }
    } else {
      // Portrait image
      imgHeight = imgMaxHeight;
      imgWidth = imgMaxHeight * aspectRatio;
      
      // If width is too large, recalculate
      if (imgWidth > imgMaxWidth) {
        imgWidth = imgMaxWidth;
        imgHeight = imgWidth / aspectRatio;
      }
    }
    
    // Center the image in the cell
    const offsetX = (imgMaxWidth - imgWidth) / 2;
    const offsetY = (imgMaxHeight - imgHeight) / 2;
    
    doc.addImage(
      item.image,
      'PNG',
      imgX + offsetX,
      imgY + offsetY,
      imgWidth,
      imgHeight
    );
  } catch (error) {
    console.error('Error rendering image in PDF:', error);
    // Fallback to original method if the calculation fails
    doc.addImage(
      item.image,
      'PNG',
      imgX,
      imgY,
      imgMaxWidth,
      imgMaxHeight
    );
  }
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
  // Different layouts based on textImagePosition setting
  const position = settings.table.textImagePosition || 'bottom';
  
  if (position === 'bottom') {
    // Image on top, text on bottom
    const imageHeight = height * 0.7;
    if (item.image) {
      await renderImageCell(doc, item, settings, x, y, width, imageHeight, padding);
    }
    
    // Detect if text contains CJK characters
    const hasCJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(item.text);
    
    // Adjust font size for CJK text
    const fontSize = hasCJK ? 6 : 8;
    doc.setFontSize(fontSize);
    doc.setTextColor('#000000');
    
    if (hasCJK) {
      try {
        doc.setFont('sans-serif');
      } catch (e) {
        doc.setFont('helvetica');
      }
    } else {
      doc.setFont('helvetica');
    }
    
    const textY = y + imageHeight + padding + 5;
    const maxLength = hasCJK ? 5 : 12;
    const displayText = item.text.length > maxLength ? item.text.substring(0, maxLength) + '...' : item.text;
    
    if (settings.table.contentAlignment.includes('center')) {
      doc.text(displayText, x + (width / 2), textY, { align: 'center' });
    } else if (settings.table.contentAlignment.includes('right')) {
      doc.text(displayText, x + width - padding, textY, { align: 'right' });
    } else {
      doc.text(displayText, x + padding, textY);
    }
  } else if (position === 'top') {
    // Text on top, image on bottom
    const textHeight = height * 0.3;
    
    // Detect if text contains CJK characters and render text
    const hasCJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(item.text);
    const fontSize = hasCJK ? 6 : 8;
    doc.setFontSize(fontSize);
    doc.setTextColor('#000000');
    
    if (hasCJK) {
      try {
        doc.setFont('sans-serif');
      } catch (e) {
        doc.setFont('helvetica');
      }
    } else {
      doc.setFont('helvetica');
    }
    
    const textY = y + padding + 5;
    const maxLength = hasCJK ? 5 : 12;
    const displayText = item.text.length > maxLength ? item.text.substring(0, maxLength) + '...' : item.text;
    
    if (settings.table.contentAlignment.includes('center')) {
      doc.text(displayText, x + (width / 2), textY, { align: 'center' });
    } else if (settings.table.contentAlignment.includes('right')) {
      doc.text(displayText, x + width - padding, textY, { align: 'right' });
    } else {
      doc.text(displayText, x + padding, textY);
    }
    
    // Render image
    if (item.image) {
      await renderImageCell(doc, item, settings, x, y + textHeight, width, height - textHeight, padding);
    }
  } else {
    // Default center overlay
    if (item.image) {
      await renderImageCell(doc, item, settings, x, y, width, height, padding);
    }
    
    // Add a semi-transparent background for text
    doc.setFillColor(255, 255, 255, 0.7);
    doc.rect(x + padding, y + (height/2) - 8, width - (2 * padding), 16, 'F');
    
    // Render text
    const hasCJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(item.text);
    const fontSize = hasCJK ? 6 : 8;
    doc.setFontSize(fontSize);
    doc.setTextColor('#000000');
    
    if (hasCJK) {
      try {
        doc.setFont('sans-serif');
      } catch (e) {
        doc.setFont('helvetica');
      }
    } else {
      doc.setFont('helvetica');
    }
    
    const textY = y + (height / 2);
    const maxLength = hasCJK ? 5 : 12;
    const displayText = item.text.length > maxLength ? item.text.substring(0, maxLength) + '...' : item.text;
    
    doc.text(displayText, x + (width / 2), textY, { align: 'center' });
  }
}
