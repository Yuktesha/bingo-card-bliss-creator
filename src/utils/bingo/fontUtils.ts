
/**
 * Font utilities for PDF generation
 */
import { jsPDF } from 'jspdf';

/**
 * Loads NotoSansCJK font for Asian characters support
 * Adds font to the global jsPDF object for use in PDF generation
 */
export async function loadPDFFonts(): Promise<boolean> {
  try {
    // Use a more reliable font file from Google Fonts
    const fontUrl = 'https://fonts.gstatic.com/s/notosanstc/v26/XLYgIZAzeuabf6qtPgLUX9vxAHys.otf';
    
    console.log('Loading Asian font for PDF from:', fontUrl);
    
    // Fetch the font
    const response = await fetch(fontUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.statusText}`);
    }
    
    // Convert to array buffer
    const fontBuffer = await response.arrayBuffer();
    
    // Register the font properly in jsPDF
    jsPDF.API.addFileToVFS('NotoSansTC-Regular.ttf', arrayBufferToBase64(fontBuffer));
    jsPDF.API.addFont('NotoSansTC-Regular.ttf', 'NotoSansTC', 'normal');
    
    console.log('Asian font loaded and registered successfully');
    return true;
  } catch (error) {
    console.error('Error loading Asian font:', error);
    return false;
  }
}

/**
 * Helper function to convert ArrayBuffer to base64 string
 * This is required for jsPDF's addFileToVFS function
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return btoa(binary);
}
