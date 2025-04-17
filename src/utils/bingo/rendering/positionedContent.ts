
import { RenderingContext } from "./types";
import { drawTextCellWithAlignment, drawVerticalText } from "./textRenderer";
import { drawImageCellWithAlignment } from "./imageRenderer";
import { drawTextWithBackground } from "./textWithBackground";

interface PositionedRenderOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  img: HTMLImageElement;
  scale: number;
  padding: number;
}

export function renderTopPosition(
  renderContext: RenderingContext,
  options: PositionedRenderOptions
): void {
  const { x, y, width, height, text, img, scale, padding } = options;
  const imgHeight = height * 0.6;
  const textHeight = height * 0.4;

  drawImageCellWithAlignment(renderContext, { 
    x, y: y + textHeight, width, height: imgHeight,
    img, padding 
  });
  drawTextCellWithAlignment(renderContext, text, {
    x, y, width, height: textHeight,
    fontSize: 10 * scale / 2,
    padding
  });
}

export function renderBottomPosition(
  renderContext: RenderingContext,
  options: PositionedRenderOptions
): void {
  const { x, y, width, height, text, img, scale, padding } = options;
  const imgHeight = height * 0.6;
  const textHeight = height * 0.4;

  drawImageCellWithAlignment(renderContext, {
    x, y, width, height: imgHeight,
    img, padding
  });
  drawTextCellWithAlignment(renderContext, text, {
    x, y: y + imgHeight, width, height: textHeight,
    fontSize: 10 * scale / 2,
    padding
  });
}

export function renderCenterPosition(
  renderContext: RenderingContext,
  options: PositionedRenderOptions
): void {
  const { x, y, width, height, text, img, scale, padding } = options;
  
  drawImageCellWithAlignment(renderContext, { x, y, width, height, img, padding });
  drawTextWithBackground(renderContext, text, {
    x, y, width, height,
    fontSize: 11 * scale / 2,
    padding
  });
}

export function renderSidePosition(
  renderContext: RenderingContext,
  options: PositionedRenderOptions,
  isLeft: boolean
): void {
  const { x, y, width, height, text, img, scale, padding } = options;
  const imgWidth = width * 0.6;
  const textSectionWidth = width * 0.4;
  
  if (isLeft) {
    drawVerticalText(renderContext, text, {
      x, y, width: textSectionWidth, height,
      fontSize: 10 * scale / 2,
      padding
    });
    drawImageCellWithAlignment(renderContext, {
      x: x + textSectionWidth, y, width: imgWidth, height,
      img, padding
    });
  } else {
    drawImageCellWithAlignment(renderContext, {
      x, y, width: imgWidth, height,
      img, padding
    });
    drawVerticalText(renderContext, text, {
      x: x + imgWidth, y, width: textSectionWidth, height,
      fontSize: 10 * scale / 2,
      padding
    });
  }
}
