
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

  itemsWithImages.forEach(item => {
    if (!item.image) return;
    
    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        imageMap.set(item.id, img);
        console.log(`Successfully loaded image for item: ${item.id}`);
        resolve();
      };
      
      img.onerror = (e) => {
        console.warn(`Failed to load image for item: ${item.text}`, e);
        resolve(); // 解決以繼續處理
      };
      
      // 增加跨域支持
      img.crossOrigin = 'anonymous';
      img.src = item.image;
    });
    
    imagePromises.push(promise);
  });

  await Promise.all(imagePromises);
  console.log(`Successfully loaded ${imageMap.size} of ${itemsWithImages.length} images`);
  return imageMap;
}
