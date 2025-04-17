
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
 * Creates a PDF with bingo cards
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
  
  // Generate multiple cards
  for (let cardIndex = 0; cardIndex < numberOfCards; cardIndex++) {
    if (cardIndex > 0) {
      // Add a new page for each additional card
      doc.addPage();
    }
    
    try {
      console.log(`Generating card ${cardIndex + 1}...`);
      // Render the bingo card
      const canvas = await renderBingoCardPreview(selectedItems, settings, cardIndex);
      
      // Convert canvas to an image
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate the printable area
      const printableWidth = settings.width - margin.left - margin.right;
      const printableHeight = settings.height - margin.top - margin.bottom;
      
      console.log('PDF Generation - Printable area:', { width: printableWidth, height: printableHeight });
      
      // Add the image to the PDF
      doc.addImage(
        imgData, 
        'PNG', 
        margin.left, 
        margin.top, 
        printableWidth, 
        printableHeight
      );
      
      console.log(`Card ${cardIndex + 1} generated successfully`);
      
    } catch (error) {
      console.error(`Failed to render card ${cardIndex + 1}:`, error);
      // Add error text instead of image
      doc.setFontSize(12);
      doc.text(`Failed to render card ${cardIndex + 1}. Error: ${error.message}`, margin.left, margin.top + 10);
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
  }
): Promise<Blob> {
  // Default options
  const opts = {
    onProgress: (current: number, total: number) => {},
    cardsPerPage: 1,
    includeInstructions: false,
    ...options
  };
  
  try {
    // For debugging PDF generation
    console.log('PDF Generation settings:', {
      items: items.length,
      selectedItems: items.filter(item => item.selected).length,
      settings,
      numberOfCards,
      unit: settings.unit
    });
    
    return await generateBingoCardPDF(items, settings, numberOfCards);
  } catch (error) {
    console.log('PDF generation failed:', error);
    throw error;
  }
}
