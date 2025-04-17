
import { BingoCardItem, BingoCardSettings } from "@/types";
import { generateId } from "./fileUtils";
import { useToast } from "@/hooks/use-toast";

/**
 * 匯出賓果卡資料為 ODS 格式（目前為 JSON 格式）
 */
export function exportItems(items: BingoCardItem[]): Blob {
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
 * 匯入賓果卡資料（JSON 格式）
 */
export function importItems(jsonBlob: Blob): Promise<BingoCardItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (e.target?.result) {
          const data = JSON.parse(e.target.result as string);
          if (data.items && Array.isArray(data.items)) {
            const items: BingoCardItem[] = data.items.map((item: any) => ({
              id: generateId(),
              image: item.image || undefined,
              text: item.text || "",
              selected: item.selected === 1 || item.selected === true
            }));
            resolve(items);
          } else {
            reject(new Error("檔案格式不正確"));
          }
        } else {
          reject(new Error("無法讀取檔案"));
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
 * 匯出設定至 JSON 以便儲存/載入
 */
export function exportSettings(settings: BingoCardSettings): Blob {
  return new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
}

/**
 * 從 JSON 檔案匯入設定
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
 * 準備 CSV 匯出資料
 */
export function exportToCSV(items: BingoCardItem[]): string {
  // CSV 標頭
  let csv = "Image,Text,Select\n";
  
  // 將每個項目加為一行
  items.forEach(item => {
    const image = item.image || "";
    const text = item.text.replace(/,/g, "，"); // 替換逗號以避免 CSV 問題
    const selected = item.selected ? "1" : "0";
    
    csv += `${image},${text},${selected}\n`;
  });
  
  return csv;
}

/**
 * 從 CSV 匯入資料
 */
export function importFromCSV(csvContent: string): BingoCardItem[] {
  const lines = csvContent.split("\n");
  const items: BingoCardItem[] = [];
  
  // 檢查第一行是否為標頭
  let startIndex = 0;
  if (lines[0].toLowerCase().includes("image") || 
      lines[0].toLowerCase().includes("text")) {
    startIndex = 1;
  }
  
  // 處理每一行
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
