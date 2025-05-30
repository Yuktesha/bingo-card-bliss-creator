
import { jsPDF } from 'jspdf';
import { BingoCardItem, BingoCardSettings } from '@/types';
import { setupPDFFonts } from '@/utils/bingo/fontUtils';
import { renderVectorCard, renderRasterCard } from '../rendering/cardRenderer';

export interface PDFGenerationOptions {
  highResolution?: boolean;
  useSystemFonts?: boolean;
  useCJKSupport?: boolean;
  preserveImageAspectRatio?: boolean;
  rasterText?: boolean; // Add rasterText option
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
  const opts = {
    highResolution: false, // Changed default to false
    useSystemFonts: false,
    useCJKSupport: true,
    preserveImageAspectRatio: true,
    rasterText: true, // Default to raster text for better CJK support
    ...options
  };

  const selectedItems = items.filter(item => item.selected);
  const cellsPerCard = settings.table.rows * settings.table.columns;
  
  if (selectedItems.length < cellsPerCard) {
    throw new Error(`需要至少 ${cellsPerCard} 個選取的項目來生成賓果卡`);
  }
  
  console.log('PDF generation options:', opts);
  
  const doc = new jsPDF({
    orientation: settings.orientation,
    unit: settings.unit === 'inch' ? 'in' : settings.unit,
    format: settings.paperSize === 'Custom' ? [settings.width, settings.height] : settings.paperSize,
    compress: true,
    putOnlyUsedFonts: true,
    floatPrecision: 16
  });

  await setupPDFFonts(doc);
  
  for (let cardIndex = 0; cardIndex < numberOfCards; cardIndex++) {
    if (cardIndex > 0) {
      doc.addPage();
    }
    
    try {
      // Use raster rendering for CJK text if requested
      if (opts.rasterText || !opts.highResolution) {
        console.log('Using raster rendering for card', cardIndex + 1);
        await renderRasterCard(doc, items, settings, cardIndex);
      } else {
        console.log('Using vector rendering for card', cardIndex + 1);
        await renderVectorCard(doc, items, settings, cardIndex);
      }
    } catch (error) {
      console.error(`Vector rendering failed for card ${cardIndex + 1}, falling back to raster...`, error);
      await renderRasterCard(doc, items, settings, cardIndex);
    }
  }

  return doc.output('blob') as unknown as Blob;
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
    highResolution: false, // Changed default to false
    useSystemFonts: false,
    useCJKSupport: true,
    preserveImageAspectRatio: true,
    rasterText: true, // Default to raster text for better CJK support
    ...options
  };
  
  console.log('PDF generation options:', opts);
  
  try {
    return await generateBingoCardPDF(items, settings, numberOfCards, {
      highResolution: opts.highResolution,
      useSystemFonts: opts.useSystemFonts,
      useCJKSupport: opts.useCJKSupport,
      preserveImageAspectRatio: opts.preserveImageAspectRatio,
      rasterText: opts.rasterText
    });
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
}
