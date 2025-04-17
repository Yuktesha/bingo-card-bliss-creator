
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
    // Use a more reliable CDN for Noto Sans CJK font
    // Google Fonts CDN for Noto Sans TC (Traditional Chinese)
    const fontUrl = 'https://fonts.gstatic.com/s/notosanstc/v26/XLYgIZAzeuabf6qtPgLUX9vxAHys.otf';
    
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
      console.log('Adding NotoSansTC font to jsPDF...');
      this.addFileToVFS('NotoSansTC-Regular.otf', fontBuffer);
      this.addFont('NotoSansTC-Regular.otf', 'NotoSansTC', 'normal');
      
      // Make NotoSansTC the default font
      this.setFont('NotoSansTC');
    }]);
    
    console.log('Asian font loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading Asian font:', error);
    return false;
  }
}
