
import { BingoCardItem, BingoCardSettings } from "@/types";
import { generateId } from "./fileUtils";

/**
 * 匯出賓果卡資料為 JSON 格式
 */
export function exportItems(items: BingoCardItem[]): Blob {
  const data = {
    items: items.map(item => ({
      id: item.id,
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
              image: item.image && item.image !== "" ? item.image : undefined,
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
        console.error("Import JSON parsing error:", error);
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
