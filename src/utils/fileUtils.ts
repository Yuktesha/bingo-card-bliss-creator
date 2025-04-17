
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
 * Parse ODS or other spreadsheet format (placeholder)
 */
export function parseSpreadsheet(file: File): Promise<any[]> {
  return new Promise((resolve) => {
    // For browser environment, simulating file reading
    const reader = new FileReader();
    reader.onload = () => {
      // In a real implementation, we would parse the file content
      // For now, we'll just return mock data based on the file name
      const mockData = [];
      for (let i = 0; i < 10; i++) {
        mockData.push({
          id: generateId(),
          text: `${file.name} - Item ${i + 1}`,
          image: i % 2 === 0 ? `https://picsum.photos/id/${i + 50}/200/200` : '',
          selected: true,
        });
      }
      resolve(mockData);
    };
    
    // Start reading the file as text
    reader.readAsText(file);
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
