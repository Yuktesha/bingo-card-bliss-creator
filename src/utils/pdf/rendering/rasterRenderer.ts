
import { jsPDF } from 'jspdf';
import { BingoCardItem, BingoCardSettings } from '@/types';
import { renderBingoCardPreview } from '@/utils/bingo';

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
