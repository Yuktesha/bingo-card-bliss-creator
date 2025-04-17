
import { BingoCardItem, BingoCardSettings } from "@/types";
import { generateBingoCards } from "../cardGenerator";
import { setupCanvas } from "./canvasSetup";
import { renderTitleSection, renderFooterSection } from "./layoutRenderer";
import { loadCardImages } from "./imageLoader";
import { renderTableSection } from "./tableRenderer";

export async function renderBingoCardPreview(
  items: BingoCardItem[],
  settings: BingoCardSettings,
  cardIndex: number = 0,
  dpi: number = 300
): Promise<HTMLCanvasElement> {
  console.log('Rendering bingo card preview with DPI:', dpi);
  
  const selectedItems = items.filter(item => item.selected);
  const cellsPerCard = settings.table.rows * settings.table.columns;
  
  if (selectedItems.length < cellsPerCard) {
    throw new Error(`需要至少 ${cellsPerCard} 個選取的項目來生成賓果卡`);
  }
  
  // Generate card content
  let cardItems: BingoCardItem[];
  try {
    if (cardIndex > 0) {
      const cards = generateBingoCards(items, settings, cardIndex + 1);
      cardItems = cards[cardIndex - 1];
    } else {
      const cards = generateBingoCards(items, settings, 1);
      cardItems = cards[0];
    }
  } catch (error) {
    console.error("Error generating bingo cards:", error);
    throw error;
  }
  
  // Setup canvas
  const { canvas, ctx, scale } = setupCanvas(settings, dpi);
  
  // Calculate dimensions
  const marginTop = settings.margins.top * scale;
  const marginRight = settings.margins.right * scale;
  const marginBottom = settings.margins.bottom * scale;
  const marginLeft = settings.margins.left * scale;
  const availableWidth = canvas.width - marginLeft - marginRight;
  
  let currentY = marginTop;
  
  // Render title section
  currentY = renderTitleSection(ctx, settings, scale, currentY, availableWidth);
  
  // Calculate table dimensions
  const footerHeight = settings.footer.show ? settings.footer.height * scale : 0;
  const footerSpacing = settings.footer.show ? settings.sectionSpacing * scale : 0;
  const tableHeight = canvas.height - currentY - marginBottom - footerHeight - footerSpacing;
  
  try {
    // Load and prepare images
    const imageMap = await loadCardImages(cardItems);
    
    // Render table section
    await renderTableSection(ctx, settings, {
      cardItems,
      imageMap,
      scale,
      x: marginLeft,
      y: currentY,
      width: availableWidth,
      height: tableHeight
    });
    
    // Render footer
    ctx.setLineDash([]);
    renderFooterSection(ctx, settings, scale, canvas.height, availableWidth);
    
    return canvas;
  } catch (error) {
    console.error('Error during canvas rendering:', error);
    throw error;
  }
}

export async function renderBingoCardPreviewAsync(
  items: BingoCardItem[],
  settings: BingoCardSettings
): Promise<string> {
  try {
    const canvas = await renderBingoCardPreview(items, settings);
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Failed to render preview:', error);
    throw error;
  }
}
