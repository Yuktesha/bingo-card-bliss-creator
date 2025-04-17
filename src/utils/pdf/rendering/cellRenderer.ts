
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

// Improved text rendering with better CJK support
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
  
  // Slightly larger font size for better readability
  const fontSize = hasCJK ? 9 : 10;
  doc.setFontSize(fontSize);
  doc.setTextColor('#000000');
  
  // Set a reliable font for CJK text
  try {
    doc.setFont(hasCJK ? "sans-serif" : "helvetica");
  } catch (e) {
    console.warn('Could not set font, using default');
    doc.setFont("helvetica");
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
  
  // Draw any text with proper alignment
  if (settings.table.contentAlignment.includes('center') && !settings.table.contentAlignment.includes('top') && !settings.table.contentAlignment.includes('bottom')) {
    doc.text(displayText, x + (width / 2), textY, { align: 'center' });
  } else if (settings.table.contentAlignment.includes('right')) {
    doc.text(displayText, x + width - cellPadding, textY, { align: 'right' });
  } else {
    doc.text(displayText, x + cellPadding, textY);
  }
}

// Improved image rendering with proper aspect ratio preservation
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
  
  try {
    // Create a temporary Image object to get the aspect ratio
    const img = new Image();
    img.src = item.image;
    
    // Wait for image to load to get accurate dimensions
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      // If image is already loaded, resolve immediately
      if (img.complete) resolve(null);
    });
    
    // Calculate the available space for the image within the cell
    const availableWidth = width - (2 * padding);
    const availableHeight = height - (2 * padding);
    
    // Get image's natural aspect ratio
    const aspectRatio = img.width / img.height;
    
    // Calculate dimensions while preserving aspect ratio
    let imgWidth, imgHeight;
    
    if (aspectRatio > 1) {
      // Landscape image
      imgWidth = availableWidth;
      imgHeight = imgWidth / aspectRatio;
      
      // If calculated height exceeds available height, recalculate
      if (imgHeight > availableHeight) {
        imgHeight = availableHeight;
        imgWidth = imgHeight * aspectRatio;
      }
    } else {
      // Portrait or square image
      imgHeight = availableHeight;
      imgWidth = imgHeight * aspectRatio;
      
      // If calculated width exceeds available width, recalculate
      if (imgWidth > availableWidth) {
        imgWidth = availableWidth;
        imgHeight = imgWidth / aspectRatio;
      }
    }
    
    // Center the image in the cell
    const imgX = x + padding + (availableWidth - imgWidth) / 2;
    const imgY = y + padding + (availableHeight - imgHeight) / 2;
    
    // Add the image to the PDF
    doc.addImage(
      item.image,
      'PNG',
      imgX,
      imgY,
      imgWidth,
      imgHeight
    );
  } catch (error) {
    console.error('Error rendering image in PDF:', error);
    // In case of error, simply add a placeholder text
    doc.setFontSize(8);
    doc.text('[圖片載入失敗]', x + width/2, y + height/2, { align: 'center' });
  }
}

// Improved rendering for cells with both image and text
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
    const textHeight = height * 0.25;
    const imageHeight = height - textHeight;
    
    if (item.image) {
      try {
        // Create a temporary Image object to get the aspect ratio
        const img = new Image();
        img.src = item.image;
        
        // Wait for image to load to get accurate dimensions
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          // If image is already loaded, resolve immediately
          if (img.complete) resolve(null);
        });
        
        // Calculate dimensions for the image portion
        const availableWidth = width - (2 * padding);
        const availableHeight = imageHeight - (2 * padding);
        
        // Get image's natural aspect ratio
        const aspectRatio = img.width / img.height;
        
        // Calculate dimensions while preserving aspect ratio
        let imgWidth, imgHeight;
        
        if (aspectRatio > 1) {
          // Landscape image
          imgWidth = availableWidth;
          imgHeight = imgWidth / aspectRatio;
          
          // If calculated height exceeds available height, recalculate
          if (imgHeight > availableHeight) {
            imgHeight = availableHeight;
            imgWidth = imgHeight * aspectRatio;
          }
        } else {
          // Portrait or square image
          imgHeight = availableHeight;
          imgWidth = imgHeight * aspectRatio;
          
          // If calculated width exceeds available width, recalculate
          if (imgWidth > availableWidth) {
            imgWidth = availableWidth;
            imgHeight = imgWidth / aspectRatio;
          }
        }
        
        // Center the image in its portion of the cell
        const imgX = x + padding + (availableWidth - imgWidth) / 2;
        const imgY = y + padding + (availableHeight - imgHeight) / 2;
        
        // Add the image to the PDF
        doc.addImage(
          item.image,
          'PNG',
          imgX,
          imgY,
          imgWidth,
          imgHeight
        );
      } catch (error) {
        console.error('Error rendering image part in image-text cell:', error);
      }
    }
    
    // Render the text portion
    const textY = y + imageHeight + 2;
    
    // Detect CJK text
    const hasCJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(item.text);
    const fontSize = hasCJK ? 7 : 8;
    doc.setFontSize(fontSize);
    doc.setTextColor('#000000');
    
    try {
      doc.setFont(hasCJK ? "sans-serif" : "helvetica");
    } catch (e) {
      doc.setFont("helvetica");
    }
    
    const maxLength = hasCJK ? 5 : 12;
    const displayText = item.text.length > maxLength ? item.text.substring(0, maxLength) + '...' : item.text;
    
    doc.text(displayText, x + (width / 2), textY + padding, { align: 'center' });
  } else if (position === 'top') {
    // Text on top, image on bottom
    const textHeight = height * 0.25;
    const imageHeight = height - textHeight;
    
    // Render text first
    const hasCJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(item.text);
    const fontSize = hasCJK ? 7 : 8;
    doc.setFontSize(fontSize);
    doc.setTextColor('#000000');
    
    try {
      doc.setFont(hasCJK ? "sans-serif" : "helvetica");
    } catch (e) {
      doc.setFont("helvetica");
    }
    
    const maxLength = hasCJK ? 5 : 12;
    const displayText = item.text.length > maxLength ? item.text.substring(0, maxLength) + '...' : item.text;
    const textY = y + padding + 5;
    
    doc.text(displayText, x + (width / 2), textY, { align: 'center' });
    
    // Then render image if available
    if (item.image) {
      try {
        // Create a temporary Image object to get the aspect ratio
        const img = new Image();
        img.src = item.image;
        
        // Wait for image to load to get accurate dimensions
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          // If image is already loaded, resolve immediately
          if (img.complete) resolve(null);
        });
        
        // Calculate dimensions for the image portion
        const availableWidth = width - (2 * padding);
        const availableHeight = imageHeight - (2 * padding);
        
        // Get image's natural aspect ratio
        const aspectRatio = img.width / img.height;
        
        // Calculate dimensions while preserving aspect ratio
        let imgWidth, imgHeight;
        
        if (aspectRatio > 1) {
          // Landscape image
          imgWidth = availableWidth;
          imgHeight = imgWidth / aspectRatio;
          
          // If calculated height exceeds available height, recalculate
          if (imgHeight > availableHeight) {
            imgHeight = availableHeight;
            imgWidth = imgHeight * aspectRatio;
          }
        } else {
          // Portrait or square image
          imgHeight = availableHeight;
          imgWidth = imgHeight * aspectRatio;
          
          // If calculated width exceeds available width, recalculate
          if (imgWidth > availableWidth) {
            imgWidth = availableWidth;
            imgHeight = imgWidth / aspectRatio;
          }
        }
        
        // Center the image in its portion of the cell
        const imgX = x + padding + (availableWidth - imgWidth) / 2;
        const imgY = y + textHeight + padding + (availableHeight - imgHeight) / 2;
        
        // Add the image to the PDF
        doc.addImage(
          item.image,
          'PNG',
          imgX,
          imgY,
          imgWidth,
          imgHeight
        );
      } catch (error) {
        console.error('Error rendering image part in image-text cell:', error);
      }
    }
  } else {
    // Default center overlay
    if (item.image) {
      await renderImageCell(doc, item, settings, x, y, width, height, padding);
    }
    
    // Add a semi-transparent background for better text visibility
    doc.setFillColor(255, 255, 255, 0.7);
    doc.rect(x + padding, y + (height/2) - 8, width - (2 * padding), 16, 'F');
    
    // Render text on top with improved CJK support
    const hasCJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(item.text);
    const fontSize = hasCJK ? 7 : 8;
    doc.setFontSize(fontSize);
    doc.setTextColor('#000000');
    
    try {
      doc.setFont(hasCJK ? "sans-serif" : "helvetica");
    } catch (e) {
      doc.setFont("helvetica");
    }
    
    const maxLength = hasCJK ? 5 : 12;
    const displayText = item.text.length > maxLength ? item.text.substring(0, maxLength) + '...' : item.text;
    const textY = y + (height / 2);
    
    doc.text(displayText, x + (width / 2), textY, { align: 'center' });
  }
}
