
import { BingoCardItem } from "@/types";

export async function loadCardImages(items: BingoCardItem[]): Promise<Map<string, HTMLImageElement>> {
  const imageMap = new Map<string, HTMLImageElement>();
  const imagePromises: Promise<void>[] = [];

  items.forEach(item => {
    if (item.image) {
      const promise = new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          imageMap.set(item.id, img);
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load image for item: ${item.text}`);
          resolve(); // Resolve anyway to continue processing
        };
        img.src = item.image;
      });
      imagePromises.push(promise);
    }
  });

  await Promise.all(imagePromises);
  return imageMap;
}
