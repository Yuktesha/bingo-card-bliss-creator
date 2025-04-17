
/**
 * Utility functions for PDF dimension calculations
 */

/**
 * Calculates dimensions in points based on unit and value
 */
export function convertToPoints(value: number, unit: 'mm' | 'cm' | 'inch'): number {
  switch (unit) {
    case 'inch': return value * 72;
    case 'cm': return value * 28.35;
    case 'mm': return value * 2.835;
    default: return value;
  }
}

/**
 * Converts between units
 */
export function convertUnits(
  value: number, 
  fromUnit: 'mm' | 'cm' | 'inch',
  toUnit: 'mm' | 'cm' | 'inch'
): number {
  if (fromUnit === toUnit) return value;
  
  // Convert to mm first
  let mmValue: number;
  switch (fromUnit) {
    case 'inch': mmValue = value * 25.4; break;
    case 'cm': mmValue = value * 10; break;
    case 'mm': mmValue = value; break;
    default: mmValue = value;
  }
  
  // Convert from mm to target unit
  switch (toUnit) {
    case 'inch': return mmValue / 25.4;
    case 'cm': return mmValue / 10;
    case 'mm': return mmValue;
    default: return mmValue;
  }
}

/**
 * Gets standard paper size dimensions in millimeters
 */
export function getPaperSizeDimensions(
  size: string, 
  orientation: 'portrait' | 'landscape'
): { width: number, height: number } {
  const sizes: Record<string, [number, number]> = {
    'A4': [210, 297],
    'A3': [297, 420],
    'B5': [176, 250],
    'Letter': [215.9, 279.4],
    'Legal': [215.9, 355.6],
  };
  
  let [width, height] = sizes[size] || sizes['A4'];
  
  if (orientation === 'landscape') {
    [width, height] = [height, width];
  }
  
  return { width, height };
}
