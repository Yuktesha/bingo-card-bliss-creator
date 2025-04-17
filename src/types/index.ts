
// Types for Bingo Card Generator

// Data source types
export interface BingoCardItem {
  id: string;
  image?: string; // Path to image file
  text: string;
  selected: boolean;
  fileCheck?: boolean; // For file existence check
}

// Layout settings types
export type PaperSize = 'A4' | 'A3' | 'B5' | 'Custom';
export type Orientation = 'portrait' | 'landscape';
export type Unit = 'mm' | 'cm' | 'inch';
export type Alignment = 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type ContentType = 'image-text' | 'image-only' | 'text-only';
export type TextImagePosition = 'top' | 'bottom' | 'left' | 'right' | 'center';
export type TextOrientation = 'horizontal' | 'vertical';
export type BorderStyle = 'solid' | 'dashed' | 'dotted';
export type FillType = 'none' | 'solid' | 'linear-gradient' | 'radial-gradient';

export interface BingoCardSettings {
  // Page settings
  paperSize: PaperSize;
  orientation: Orientation;
  width: number;
  height: number;
  unit: Unit;
  
  // Margins
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    linked: boolean;
  };
  
  // Title section
  title: {
    text: string;
    show: boolean;
    height: number;
    fontSize: number;
    fontFamily: string;
    color: string;
    alignment: Alignment;
    backgroundColor: string;
    backgroundImage?: string;
  };
  
  // Table section
  table: {
    rows: number;
    columns: number;
    borderWidth: number;
    borderColor: string;
    borderStyle: BorderStyle;
    fillType: FillType;
    fillColor: string;
    gradientStartColor?: string;
    gradientEndColor?: string;
    cellPadding: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    contentAlignment: Alignment;
    contentType: ContentType;
    imageScaling: 'aspect-fit' | 'fill';
    textImagePosition: TextImagePosition;
    textImageSpacing: number;
    textOrientation: TextOrientation;
    textAlignment: Alignment;
    backgroundImage?: string; // For text-only cells
  };
  
  // Footer section
  footer: {
    text: string;
    show: boolean;
    height: number;
    fontSize: number;
    fontFamily: string;
    color: string;
    alignment: Alignment;
    backgroundColor: string;
    backgroundImage?: string;
  };
  
  // Spacing between sections
  sectionSpacing: number;
  
  // PDF export
  export: {
    numberOfCards: number;
    outputPath: string;
  };
}
