
import { BingoCardItem, BingoCardSettings } from "@/types";
import { generateId } from "./fileUtils";

/**
 * Exports bingo card data to ODS format (placeholder)
 */
export function exportToODS(items: BingoCardItem[]): Blob {
  // In a real implementation, this would convert the data to ODS format
  // For this demo, we'll just create a simple blob with JSON
  const data = {
    items: items.map(item => ({
      image: item.image || "",
      text: item.text,
      selected: item.selected ? 1 : 0
    }))
  };
  
  return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
}

/**
 * Exports settings to JSON for saving/loading
 */
export function exportSettings(settings: BingoCardSettings): Blob {
  return new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
}

/**
 * Imports settings from JSON file
 */
export function importSettings(jsonBlob: Blob): Promise<BingoCardSettings> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (e.target?.result) {
          const settings = JSON.parse(e.target.result as string);
          resolve(settings);
        } else {
          reject(new Error("無法讀取設定檔"));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("讀取檔案時發生錯誤"));
    reader.readAsText(jsonBlob);
  });
}

/**
 * Prepares data for CSV export
 */
export function exportToCSV(items: BingoCardItem[]): string {
  // CSV header
  let csv = "Image,Text,Select\n";
  
  // Add each item as a row
  items.forEach(item => {
    const image = item.image || "";
    const text = item.text.replace(/,/g, "，"); // Replace commas to avoid CSV issues
    const selected = item.selected ? "1" : "0";
    
    csv += `${image},${text},${selected}\n`;
  });
  
  return csv;
}

/**
 * Imports data from CSV
 */
export function importFromCSV(csvContent: string): BingoCardItem[] {
  const lines = csvContent.split("\n");
  const items: BingoCardItem[] = [];
  
  // Check if first line is a header
  let startIndex = 0;
  if (lines[0].toLowerCase().includes("image") || 
      lines[0].toLowerCase().includes("text")) {
    startIndex = 1;
  }
  
  // Process each line
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(",");
    if (parts.length >= 2) {
      const item: BingoCardItem = {
        id: generateId(),
        image: parts[0].trim() || undefined,
        text: parts[1].trim(),
        selected: parts.length > 2 ? parts[2].trim() === "1" : true
      };
      
      items.push(item);
    }
  }
  
  return items;
}
