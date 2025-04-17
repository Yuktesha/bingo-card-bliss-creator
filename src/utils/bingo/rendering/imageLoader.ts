
import { BingoCardItem } from "@/types";

export async function loadCardImages(items: BingoCardItem[]): Promise<Map<string, HTMLImageElement>> {
  const imageMap = new Map<string, HTMLImageElement>();
  const imagePromises: Promise<void>[] = [];

  // 只處理有圖像的項目
  const itemsWithImages = items.filter(item => item.image);
  
  if (itemsWithImages.length === 0) {
    console.log('No images to load in the selected items');
    return imageMap;
  }
  
  console.log(`Loading ${itemsWithImages.length} images for bingo card`);

  for (const item of itemsWithImages) {
    if (!item.image) continue;
    
    const promise = new Promise<void>((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        imageMap.set(item.id, img);
        console.log(`Successfully loaded image for item: ${item.id}`);
        resolve();
      };
      
      img.onerror = (error) => {
        console.warn(`Failed to load image for item: ${item.text}`, error);
        resolve(); // Resolve anyway to continue processing
      };
      
      // Add cross-origin support
      img.crossOrigin = 'anonymous';
      img.src = item.image;
    });
    
    imagePromises.push(promise);
  }

  try {
    await Promise.all(imagePromises);
    console.log(`Successfully loaded ${imageMap.size} of ${itemsWithImages.length} images`);
    return imageMap;
  } catch (error) {
    console.error('Error loading images:', error);
    return imageMap; // Return what we've got even if there was an error
  }
}
