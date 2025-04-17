
import { BingoCardItem } from "@/types";
import { generateId } from "./fileUtils";

// Mock data for demonstration purposes
export const generateMockBingoItems = (count: number = 35): BingoCardItem[] => {
  const categories = [
    "自然風景", "動物", "食物", "建築", "交通工具", 
    "季節", "天氣", "職業", "運動", "音樂"
  ];
  
  const items: BingoCardItem[] = [];
  
  // Generate items for each category
  categories.forEach((category, categoryIndex) => {
    const itemsInCategory = Math.ceil(count / categories.length);
    
    for (let i = 0; i < itemsInCategory && items.length < count; i++) {
      items.push({
        id: generateId(),
        text: `${category} ${i + 1}`,
        selected: true,
        image: i % 3 === 0 ? `/mock-images/${categoryIndex + 1}_${i + 1}.jpg` : undefined
      });
    }
  });
  
  return items;
};

// Mock folder selection result
export const simulateFolderSelection = (): BingoCardItem[] => {
  return [
    {
      id: generateId(),
      text: "森林",
      image: "/mock-images/forest.jpg",
      selected: true
    },
    {
      id: generateId(),
      text: "山脈",
      image: "/mock-images/mountain.jpg",
      selected: true
    },
    {
      id: generateId(),
      text: "海灘",
      image: "/mock-images/beach.jpg",
      selected: true
    },
    {
      id: generateId(),
      text: "城市",
      image: "/mock-images/city.jpg",
      selected: true
    },
    {
      id: generateId(),
      text: "湖泊",
      image: "/mock-images/lake.jpg",
      selected: true
    },
  ];
};

// Mock spreadsheet import result
export const simulateSpreadsheetImport = (): BingoCardItem[] => {
  return [
    { id: generateId(), text: "蘋果", image: undefined, selected: true },
    { id: generateId(), text: "香蕉", image: undefined, selected: true },
    { id: generateId(), text: "橙子", image: undefined, selected: true },
    { id: generateId(), text: "葡萄", image: undefined, selected: true },
    { id: generateId(), text: "西瓜", image: undefined, selected: true },
    { id: generateId(), text: "草莓", image: undefined, selected: true },
    { id: generateId(), text: "藍莓", image: undefined, selected: true },
    { id: generateId(), text: "菠蘿", image: undefined, selected: true },
    { id: generateId(), text: "芒果", image: undefined, selected: true },
    { id: generateId(), text: "奇異果", image: undefined, selected: true },
  ];
};
