const SilhouetteStrategy = require('./SilhouetteStrategy');

class StandardSquareSilhouette extends SilhouetteStrategy {
  draw(params) {
    const { ctx, size, cellSize, qrX, qrY, modules, finalEyeFill, activeDotStyle, activeQrColor, primaryQrColor } = params;
    // ── Standard QR (no silhouette) ──────────────────────────────────────────
    params.drawFinderEyes(ctx, finalEyeFill);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isDataModule = modules.get(r, c);
        const isEye = (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
        if (isEye) continue;

        const cellX = qrX + c * cellSize;
        const cellY = qrY + r * cellSize;
        const isHorizontalTiming = (r === 6 && c >= 7 && c < size - 7);
        const isVerticalTiming   = (c === 6 && r >= 7 && r < size - 7);
        const isCornerFormatInfo = (r <= 8 && c <= 8) || (r <= 8 && c >= size - 9) || (r >= size - 9 && c <= 8);

        if (isCornerFormatInfo || isHorizontalTiming || isVerticalTiming) {
          if (isDataModule) { ctx.fillStyle = primaryQrColor; ctx.fillRect(cellX, cellY, cellSize + 0.1, cellSize + 0.1); }
        } else if (isDataModule) {
          if (activeDotStyle === 'connected') {
            const getMod = (row, col) => (row >= 0 && row < size && col >= 0 && col < size) ? modules.get(row, col) : false;
            const top = getMod(r - 1, c); const bottom = getMod(r + 1, c);
            const left = getMod(r, c - 1); const right = getMod(r, c + 1);
            const radiusVal = cellSize * 0.45;
            const radii = { tl: (top || left) ? 0 : radiusVal, tr: (top || right) ? 0 : radiusVal, br: (bottom || right) ? 0 : radiusVal, bl: (bottom || left) ? 0 : radiusVal };
            ctx.fillStyle = activeQrColor;
            params.service.roundRect(ctx, cellX + 0.3, cellY + 0.3, cellSize - 0.6, cellSize - 0.6, radii);
            ctx.fill();
          } else {
            params.service.drawDotPattern(ctx, cellX, cellY, cellSize, activeDotStyle, activeQrColor);
          }
        }
      }
    }
  }
}
module.exports = StandardSquareSilhouette;