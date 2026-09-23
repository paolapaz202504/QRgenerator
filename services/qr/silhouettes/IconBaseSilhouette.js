const SilhouetteStrategy = require('./SilhouetteStrategy');

class IconBaseSilhouette extends SilhouetteStrategy {
  draw(params) {
    const {
      ctx, size, cellSize, qrX, qrY, modules, finalEyeFill,
      activeDotStyle, activeQrColor, primaryQrColor, isDarkBg, bgColor,
      canvasWidth, canvasHeight, loadedIconImg, iconName,
      alphaMask, qrSilhouetteMode, qrAreaSize, service
    } = params;

    // 1. Draw the tinted silhouette shape background (color sólido con 40% transparencia)
    // Over the clean white card that CanvasGenerator already drew:
    ctx.save();
    ctx.globalAlpha = 0.40; // 40% opacidad / transparencia suave para contraste
    ctx.fillStyle = activeQrColor;
    service.drawSilhouetteMask(ctx, qrSilhouetteMode, loadedIconImg, iconName, qrX, qrY, qrAreaSize);
    ctx.restore();

    // 2. Complementary dots color: soft neutral grey
    const outsideColor = 'rgba(148, 163, 184, 0.65)'; // #94a3b8

    // Helper for connected modules
    const getMod = (row, col) => (row >= 0 && row < size && col >= 0 && col < size) ? modules.get(row, col) : false;

    // 3. Draw QR data modules
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isDataModule = modules.get(r, c);
        if (!isDataModule) continue;

        // Skip finder eyes (they are drawn separately)
        const isEye = (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
        if (isEye) continue;

        const cellX = qrX + c * cellSize;
        const cellY = qrY + r * cellSize;

        // Format info and timing patterns near eyes MUST be solid QR color for scan reliability
        const isHorizontalTiming = (r === 6 && c >= 7 && c < size - 7);
        const isVerticalTiming   = (c === 6 && r >= 7 && r < size - 7);
        const isCornerFormatInfo = (r <= 8 && c <= 8) || (r <= 8 && c >= size - 9) || (r >= size - 9 && c <= 8);

        if (isCornerFormatInfo || isHorizontalTiming || isVerticalTiming) {
          ctx.fillStyle = activeQrColor;
          ctx.fillRect(cellX, cellY, cellSize + 0.1, cellSize + 0.1);
          continue;
        }

        // Check if this module is inside the silhouette or outside
        const isInside = service.isCellInsideSilhouette(r, c, size, cellX, cellY, cellSize, qrX, qrY, qrAreaSize, qrSilhouetteMode, alphaMask);

        // Modules inside the silhouette have 0% transparency (solid user color).
        // Modules outside the silhouette are drawn in grey to complement the QR.
        const modColor = isInside ? activeQrColor : outsideColor;

        if (activeDotStyle === 'connected') {
          const top = getMod(r - 1, c);
          const bottom = getMod(r + 1, c);
          const left = getMod(r, c - 1);
          const right = getMod(r, c + 1);
          const radiusVal = cellSize * 0.45;
          const radii = {
            tl: (top || left) ? 0 : radiusVal,
            tr: (top || right) ? 0 : radiusVal,
            br: (bottom || right) ? 0 : radiusVal,
            bl: (bottom || left) ? 0 : radiusVal
          };
          ctx.fillStyle = modColor;
          service.roundRect(ctx, cellX + 0.3, cellY + 0.3, cellSize - 0.6, cellSize - 0.6, radii);
          ctx.fill();
        } else {
          service.drawDotPattern(ctx, cellX, cellY, cellSize, activeDotStyle, modColor);
        }
      }
    }

    // 4. Draw the finder pattern eyes cleanly
    params.drawFinderEyes(ctx, finalEyeFill);
  }
}

module.exports = IconBaseSilhouette;
