
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
  // Placeholder for spreadsheet parsing logic
  return Promise.resolve([]);
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
