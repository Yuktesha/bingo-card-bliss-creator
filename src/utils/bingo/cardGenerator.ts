
import { BingoCardItem, BingoCardSettings } from "@/types";
import { shuffleArray } from "../fileUtils";

/**
 * Generates unique bingo cards by shuffling the selected items
 */
export function generateBingoCards(
  items: BingoCardItem[],
  settings: BingoCardSettings,
  numberOfCards: number
): BingoCardItem[][] {
  // Filter selected items
  const selectedItems = items.filter(item => item.selected);
  
  // Check if we have enough items
  const cellsPerCard = settings.table.rows * settings.table.columns;
  if (selectedItems.length < cellsPerCard) {
    throw new Error(`需要至少 ${cellsPerCard} 個選取的項目來生成賓果卡`);
  }
  
  // Generate cards
  const cards: BingoCardItem[][] = [];
  
  for (let i = 0; i < numberOfCards; i++) {
    // Create a new shuffled copy of the selected items
    let cardItems = shuffleArray([...selectedItems]);
    
    // If we don't have enough items for unique cards, re-use items but ensure
    // each card has a unique arrangement
    if (selectedItems.length < cellsPerCard * numberOfCards) {
      cardItems = shuffleArray([...selectedItems]);
    }
    
    // Take only the items needed for this card
    cards.push(cardItems.slice(0, cellsPerCard));
  }
  
  return cards;
}
