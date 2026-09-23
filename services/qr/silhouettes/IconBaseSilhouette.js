const SilhouetteStrategy = require('./SilhouetteStrategy');

class IconBaseSilhouette extends SilhouetteStrategy {
  draw(params) {
    const {
      ctx, size, cellSize, qrX, qrY, modules, finalEyeFill,
      activeDotStyle, activeQrColor, primaryQrColor, isDarkBg, bgColor,
      canvasWidth, canvasHeight, loadedIconImg, iconName,
      alphaMask, qrSilhouetteMode, qrAreaSize, service
    } = params;

    // Contrast safeguard: if the selected color is too light on a white card (luminance >= 140),
    // adjust it so camera optical sensors can detect modules and finder eyes with high contrast
    let effectiveQrColor = activeQrColor;
    let effectiveEyeFill = finalEyeFill;
    if (!isDarkBg && !service.isDarkColor(activeQrColor)) {
      const rgb = service.hexToRgb(activeQrColor);
      const darkRgb = `rgb(${Math.round(rgb.r * 0.65)}, ${Math.round(rgb.g * 0.65)}, ${Math.round(rgb.b * 0.65)})`;
      effectiveQrColor = darkRgb;
      effectiveEyeFill = darkRgb;
    }

    // 1. Silhouette mask tint color ("Color de la silueta")
    const rawSilhouetteColor = params.silhouetteColor || '#2563eb';
    let effectiveSilhouetteColor = rawSilhouetteColor;
    if (!isDarkBg && !service.isDarkColor(rawSilhouetteColor)) {
      const rgb = service.hexToRgb(rawSilhouetteColor);
      effectiveSilhouetteColor = `rgb(${Math.round(rgb.r * 0.65)}, ${Math.round(rgb.g * 0.65)}, ${Math.round(rgb.b * 0.65)})`;
    }

    // 2. Pattern color for QR dots/modules inside the silhouette ("Color del patrón de la silueta")
    const rawPatternColor = params.patternColor || rawSilhouetteColor;
    let effectivePatternColor = rawPatternColor;
    if (!isDarkBg && !service.isDarkColor(rawPatternColor)) {
      const rgb = service.hexToRgb(rawPatternColor);
      effectivePatternColor = `rgb(${Math.round(rgb.r * 0.65)}, ${Math.round(rgb.g * 0.65)}, ${Math.round(rgb.b * 0.65)})`;
    }

    // 1. Draw the tinted silhouette shape background (color sólido con 40% transparencia)
    // Over the clean white card that CanvasGenerator already drew:
    ctx.save();
    ctx.globalAlpha = 0.40; // 40% opacidad / transparencia suave para contraste
    ctx.fillStyle = effectiveSilhouetteColor;
    service.drawSilhouetteMask(ctx, qrSilhouetteMode, loadedIconImg, iconName, qrX, qrY, qrAreaSize);
    ctx.restore();

    // 2. Base QR matrix points (outside the silhouette) are painted in effectiveQrColor
    const outsideColor = effectiveQrColor;

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

        // Check if this module is inside the silhouette or outside
        const isInside = service.isCellInsideSilhouette(r, c, size, cellX, cellY, cellSize, qrX, qrY, qrAreaSize, qrSilhouetteMode, alphaMask);

        // Modules inside the silhouette are drawn in effectivePatternColor ("Color del patrón de la silueta").
        // Modules outside the silhouette are drawn in effectiveQrColor ("Color de matriz y puntos qr").
        const modColor = isInside ? effectivePatternColor : effectiveQrColor;

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
    params.drawFinderEyes(ctx, effectiveEyeFill);
  }
}

module.exports = IconBaseSilhouette;
