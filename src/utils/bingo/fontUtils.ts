
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
    // We're using the Noto Sans CJK font which has good support for Chinese, Japanese, and Korean
    const fontUrl = 'https://cdn.jsdelivr.net/npm/@compactd/noto-sans-cjk-tc@0.2.0/fonts/NotoSansCJKtc-Regular.ttf';
    
    console.log('Loading Asian font for PDF...');
    
    // Fetch the font
    const response = await fetch(fontUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.statusText}`);
    }
    
    // Convert to array buffer
    const fontBuffer = await response.arrayBuffer();
    
    // Add the font to jsPDF
    jsPDF.API.events.push(['addFonts', function() {
      console.log('Adding NotoSansCJK font to jsPDF...');
      this.addFileToVFS('NotoSansCJKtc-Regular.ttf', fontBuffer);
      this.addFont('NotoSansCJKtc-Regular.ttf', 'NotoSansCJK', 'normal');
      
      // Make NotoSansCJK the default font
      this.setFont('NotoSansCJK');
    }]);
    
    console.log('Asian font loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading Asian font:', error);
    return false;
  }
}
