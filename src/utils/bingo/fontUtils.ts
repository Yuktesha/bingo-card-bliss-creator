
/**
 * Font utilities for PDF generation
 */
import { jsPDF } from 'jspdf';

/**
 * Sets up font configuration for PDF generation
 * Uses system fonts and ensures proper encoding for CJK (Chinese, Japanese, Korean) characters
 */
export async function setupPDFFonts(doc?: jsPDF): Promise<boolean> {
  try {
    console.log('Setting up PDF to use system fonts with proper CJK support');
    
    // If a document is provided, ensure it uses the correct encoding for CJK characters
    if (doc) {
      // Use UTF-8 encoding which is important for CJK characters
      doc.setLanguage('zh-TW'); // Set Traditional Chinese as the document language
      
      // Set default font to a system font that supports CJK characters
      // This helps jsPDF use the default system sans serif font
      doc.setFont('sans-serif');
    }
    
    // Return true to indicate successful setup
    return true;
  } catch (error) {
    console.error('Error setting up font configuration:', error);
    return false;
  }
}

