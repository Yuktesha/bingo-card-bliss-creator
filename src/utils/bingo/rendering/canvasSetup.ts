
import { BingoCardSettings } from "@/types";

export function setupCanvas(settings: BingoCardSettings, dpi: number = 300): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  scale: number;
} {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('無法創建畫布上下文');
  
  const scale = (dpi / 96) * 4;
  canvas.width = settings.width * scale;
  canvas.height = settings.height * scale;
  
  ctx.scale(scale, scale);
  
  // Draw white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  return { canvas, ctx, scale };
}
