// Copyright (c) 2026 Nagravision SARL
export const drawStroke = (
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  brushSize: number,
  color: string,
  tool: "brush" | "eraser",
  lastPos: { x: number; y: number } | null,
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let targetR = 255,
    targetG = 0,
    targetB = 0;
  const colorMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  if (colorMatch) {
    targetR = parseInt(colorMatch[1], 16);
    targetG = parseInt(colorMatch[2], 16);
    targetB = parseInt(colorMatch[3], 16);
  }


  const r = brushSize / 2;
  const rSq = r * r;
  const padding = Math.ceil(r) + 1;

  let minX = x,
    minY = y,
    maxX = x,
    maxY = y;
  if (lastPos) {
    minX = Math.min(minX, lastPos.x);
    minY = Math.min(minY, lastPos.y);
    maxX = Math.max(maxX, lastPos.x);
    maxY = Math.max(maxY, lastPos.y);
  }

  const bboxX = Math.floor(Math.max(0, minX - padding));
  const bboxY = Math.floor(Math.max(0, minY - padding));
  const bboxW = Math.ceil(Math.min(canvas.width, maxX + padding) - bboxX);
  const bboxH = Math.ceil(Math.min(canvas.height, maxY + padding) - bboxY);

  if (bboxW > 0 && bboxH > 0) {
    const imageData = ctx.getImageData(bboxX, bboxY, bboxW, bboxH);
    const data = imageData.data;

    for (let yRel = 0; yRel < bboxH; yRel++) {
      for (let xRel = 0; xRel < bboxW; xRel++) {
        const px = bboxX + xRel;
        const py = bboxY + yRel;
        let isInside = false;

        if (!lastPos) {
          if ((px - x) ** 2 + (py - y) ** 2 <= rSq) isInside = true;
        } else {
          const dx = x - lastPos.x;
          const dy = y - lastPos.y;
          const l2 = dx * dx + dy * dy;

          if (l2 === 0) {
            if ((px - x) ** 2 + (py - y) ** 2 <= rSq) isInside = true;
          } else {
            let t = ((px - lastPos.x) * dx + (py - lastPos.y) * dy) / l2;
            t = Math.max(0, Math.min(1, t));
            const projX = lastPos.x + t * dx;
            const projY = lastPos.y + t * dy;

            if ((px - projX) ** 2 + (py - projY) ** 2 <= rSq) isInside = true;
          }
        }

        if (isInside) {
          const i = (yRel * bboxW + xRel) * 4;
          if (tool === "brush") {
            data[i] = targetR;
            data[i + 1] = targetG;
            data[i + 2] = targetB;
            data[i + 3] = 255;
          } else {
            data[i + 3] = 0;
          }
        }
      }
    }
    ctx.putImageData(imageData, bboxX, bboxY);
  }
};

export const floodFill = (
  canvas: HTMLCanvasElement,
  startX: number,
  startY: number,
  targetColorHex: string,
) => {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let targetR = 255,
    targetG = 0,
    targetB = 0,
    targetA = 255;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
    targetColorHex,
  );
  if (result) {
    targetR = parseInt(result[1], 16);
    targetG = parseInt(result[2], 16);
    targetB = parseInt(result[3], 16);
  }

  const startPos = (Math.floor(startY) * width + Math.floor(startX)) * 4;
  const startR = data[startPos];
  const startG = data[startPos + 1];
  const startB = data[startPos + 2];
  const startA = data[startPos + 3];

  if (
    startR === targetR &&
    startG === targetG &&
    startB === targetB &&
    startA === targetA
  )
    return;

  const stack = [[Math.floor(startX), Math.floor(startY)]];

  while (stack.length) {
    const [x, y] = stack.pop()!;
    const pos = (y * width + x) * 4;

    if (x < 0 || x >= width || y < 0 || y >= height) continue;

    const r = data[pos];
    const g = data[pos + 1];
    const b = data[pos + 2];
    const a = data[pos + 3];

    if (r !== startR || g !== startG || b !== startB) {
      continue;
    }

    data[pos] = targetR;
    data[pos + 1] = targetG;
    data[pos + 2] = targetB;
    data[pos + 3] = targetA;

    stack.push([x + 1, y]);
    stack.push([x - 1, y]);
    stack.push([x, y + 1]);
    stack.push([x, y - 1]);
  }

  ctx.putImageData(imageData, 0, 0);
};
