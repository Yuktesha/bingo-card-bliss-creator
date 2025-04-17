
// Utilities for file handling

/**
 * Parses a file path to extract the file name without extension
 */
export function getFileNameFromPath(path: string): string {
  // Remove directory path
  const fileName = path.split('/').pop() || path.split('\\').pop() || path;
  
  // Remove file extension
  return fileName.replace(/\.[^/.]+$/, "");
}

/**
 * Checks if a file exists (would be implemented with actual file system APIs)
 * Note: In browser environment, this is typically handled differently
 */
export function checkFileExists(path: string): boolean {
  // Placeholder implementation
  // In a real app, this would use file system APIs or server-side validation
  return true;
}

/**
 * Generates a unique ID for items
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Parse CSV or JSON data from file
 */
export function parseSpreadsheet(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let items: BingoCardItem[] = [];
        
        if (file.name.endsWith('.json')) {
          // Parse JSON file
          const jsonData = JSON.parse(content);
          items = Array.isArray(jsonData) ? jsonData.map(item => ({
            id: generateId(),
            text: item.text || item.name || item.title || `項目 ${items.length + 1}`,
            image: item.image || '',
            selected: true
          })) : [];
        } else {
          // Parse CSV/TSV file
          const lines = content.split(/\r\n|\n/);
          const headers = lines[0].split(/,|\t/);
          
          const textIndex = headers.findIndex(h => 
            h.toLowerCase().includes('text') || 
            h.toLowerCase().includes('名稱') || 
            h.toLowerCase().includes('內容')
          );
          
          const imageIndex = headers.findIndex(h => 
            h.toLowerCase().includes('image') || 
            h.toLowerCase().includes('圖片') || 
            h.toLowerCase().includes('圖像')
          );
          
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = lines[i].split(/,|\t/);
            if (values.length) {
              items.push({
                id: generateId(),
                text: textIndex >= 0 && textIndex < values.length 
                  ? values[textIndex].trim() 
                  : `項目 ${i}`,
                image: imageIndex >= 0 && imageIndex < values.length 
                  ? values[imageIndex].trim() 
                  : '',
                selected: true
              });
            }
          }
        }
        
        resolve(items);
      } catch (error) {
        console.error('Error parsing file:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    if (file.name.endsWith('.json') || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      reject(new Error('不支援的檔案格式'));
    }
  });
}

/**
 * Process files from a folder selection
 */
export function processFiles(files: FileList): any[] {
  const result = [];
  const supportedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (supportedImageTypes.includes(file.type)) {
      const imageUrl = URL.createObjectURL(file);
      result.push({
        id: generateId(),
        text: getFileNameFromPath(file.name),
        image: imageUrl,
        selected: true,
        fileCheck: true,
      });
    }
  }
  
  return result;
}

/**
 * Shuffle array randomly
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
