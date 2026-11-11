const SilhouetteStrategy = require('./SilhouetteStrategy');

class IconOnlySilhouette extends SilhouetteStrategy {
  draw(params) {
    const {
      ctx, size, cellSize, qrX, qrY, modules, finalEyeFill,
      activeDotStyle, activeQrColor, primaryQrColor, isDarkBg, bgColor,
      canvasWidth, canvasHeight, loadedIconImg, iconName,
      alphaMask, qrSilhouetteMode, qrAreaSize, service
    } = params;

    // Regla de Oro / Especificación de Calidad:
    // En la opción "2. Silueta de Ícono/Imagen":
    // - NO se dibuja silueta tintada de fondo (esa es exclusiva de la opción 3).
    // - Los módulos del código QR se controlan 100% por el Grupo 2 ("2. COLOR DE MATRIZ Y PUNTOS QR") usando activeQrColor.
    // - Los ojos (finders) se controlan 100% por el Grupo 4 ("4. Estilo y Color de Ojos") usando finalEyeFill.

    let effectiveQrColor = activeQrColor;
    if (!isDarkBg && typeof activeQrColor === 'string' && !service.isDarkColor(activeQrColor)) {
      const rgb = service.hexToRgb(activeQrColor);
      effectiveQrColor = `rgb(${Math.round(rgb.r * 0.65)}, ${Math.round(rgb.g * 0.65)}, ${Math.round(rgb.b * 0.65)})`;
    }

    const getMod = (row, col) => (row >= 0 && row < size && col >= 0 && col < size) ? modules.get(row, col) : false;

    // 1. Dibujar ojos del QR (Finders) con el relleno de ojos configurado en el Grupo 4
    params.drawFinderEyes(ctx, finalEyeFill);

    // 2. Dibujar módulos de datos
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isDataModule = modules.get(r, c);
        if (!isDataModule) continue;

        // Omitir ojos (finders)
        const isEye = (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
        if (isEye) continue;

        const cellX = qrX + c * cellSize;
        const cellY = qrY + r * cellSize;

        const modColor = effectiveQrColor;

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
  }
}

module.exports = IconOnlySilhouette;
