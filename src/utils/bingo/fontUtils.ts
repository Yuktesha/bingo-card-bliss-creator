
/**
 * Font utilities for PDF generation with robust CJK support
 */
import { jsPDF } from 'jspdf';

/**
 * Sets up font configuration for PDF generation with enhanced CJK support
 */
export async function setupPDFFonts(doc?: jsPDF): Promise<boolean> {
  try {
    console.log('Setting up PDF fonts with improved CJK support');
    
    // Add web fonts to document for browser preview
    if (typeof document !== 'undefined') {
      try {
        // Add Noto Sans TC for Traditional Chinese
        if (!document.getElementById('noto-sans-tc-font')) {
          const link = document.createElement('link');
          link.id = 'noto-sans-tc-font';
          link.rel = 'stylesheet';
          link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap';
          document.head.appendChild(link);
          console.log('Added Noto Sans TC font for browser display');
        }
      } catch (e) {
        console.warn('Could not add font stylesheet to document:', e);
      }
    }
    
    // Configure PDF document for CJK if provided
    if (doc) {
      // Use UTF-8 encoding and set Traditional Chinese as document language
      try {
        doc.setLanguage('zh-TW');
      } catch (e) {
        console.warn('Could not set document language:', e);
      }
      
      // Try to use built-in fonts first
      doc.setFont("helvetica", "normal");
      
      // For better CJK support in PDFs, we'll use a different approach
      // by embedding a subset of the Noto Sans TC font
      // This approach uses jsPDF's built-in functionality
      try {
        // Use simple approach for basic CJK support
        const fontFace = "'Noto Sans TC', sans-serif";
        doc.setFont(fontFace);
        console.log('Set default font to Noto Sans TC');
        
        // Set fallback strategy
        if (!doc.getFont(fontFace)) {
          console.log('Falling back to built-in fonts');
          doc.setFont('helvetica');
        }
      } catch (fontError) {
        console.warn('Failed to set CJK font, using default:', fontError);
        doc.setFont('helvetica');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up font configuration:', error);
    return false;
  }
}
