
import { BingoCardItem, BingoCardSettings } from "@/types";

export interface RenderingContext {
  ctx: CanvasRenderingContext2D;
  scale: number;
  settings: BingoCardSettings;
  padding?: number;
}

export interface TextRenderOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  alignment?: string;
  padding?: number;
}

export interface ImageRenderOptions extends TextRenderOptions {
  img: HTMLImageElement;
}
