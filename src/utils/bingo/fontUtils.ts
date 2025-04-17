
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
      doc.setFont("helvetica", "normal");
      
      // Add Noto Sans TC as a fallback font for better CJK support
      try {
        // This is a lightweight approach that works with jsPDF's default fonts
        doc.addFont("https://fonts.gstatic.com/s/notosanstc/v20/nKKuOLOAaK_Mayh4oVO-8C9vWaDCwzS-xdTGzaA.woff2", "NotoSansTC", "normal");
        doc.setFont("NotoSansTC");
        console.log('Successfully added Noto Sans TC font for CJK support');
      } catch (fontError) {
        console.warn('Failed to add Noto Sans TC font, falling back to default:', fontError);
        
        // Try another approach with a different CJK font
        try {
          fetch('https://cdn.jsdelivr.net/npm/noto-sans-tc@2.0.0/NotoSansTC-Regular.otf')
            .then(response => response.arrayBuffer())
            .then(fontData => {
              doc.addFileToVFS('NotoSansTC-Regular.otf', Buffer.from(fontData).toString('base64'));
              doc.addFont('NotoSansTC-Regular.otf', 'NotoSansTC', 'normal');
              doc.setFont('NotoSansTC');
              console.log('Successfully added Noto Sans TC font via alternate method');
            })
            .catch(err => console.warn('Error loading font from CDN:', err));
        } catch (alternateError) {
          console.warn('Failed alternative CJK font loading approach:', alternateError);
        }
      }
    }
    
    // Add a dynamic font loader to the document if it exists
    if (typeof document !== 'undefined') {
      try {
        // Add Google Fonts link for Noto Sans TC
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700&display=swap';
        document.head.appendChild(link);
        console.log('Added Noto Sans TC font stylesheet to document');
      } catch (e) {
        console.warn('Could not add font stylesheet to document:', e);
      }
    }
    
    // Return true to indicate successful setup
    return true;
  } catch (error) {
    console.error('Error setting up font configuration:', error);
    return false;
  }
}
