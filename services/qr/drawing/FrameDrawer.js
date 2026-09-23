class FrameDrawer {
  getFontStack(fontName) {
    const name = (fontName || '').trim();
    switch (name) {
      case 'Outfit':
        return "'Outfit', 'Century Gothic', 'Segoe UI', sans-serif";
      case 'Playfair Display':
        return "'Playfair Display', 'Georgia', 'Palatino Linotype', serif";
      case 'Space Grotesk':
        return "'Space Grotesk', 'Consolas', 'Trebuchet MS', sans-serif";
      case 'Montserrat':
        return "'Montserrat', 'Segoe UI', 'Arial', sans-serif";
      case 'Pacifico':
        return "'Pacifico', 'Brush Script MT', 'Lucida Handwriting', cursive";
      case 'Oswald':
        return "'Oswald', 'Arial Narrow', 'Impact', sans-serif";
      case 'Bebas Neue':
        return "'Bebas Neue', 'Impact', 'Arial Narrow', sans-serif";
      case 'Cinzel':
        return "'Cinzel', 'Palatino Linotype', 'Georgia', serif";
      case 'Poppins':
        return "'Poppins', 'Century Gothic', 'Trebuchet MS', sans-serif";
      case 'Lobster':
        return "'Lobster', 'Impact', 'Comic Sans MS', cursive";
      case 'Dancing Script':
        return "'Dancing Script', 'Brush Script MT', cursive";
      case 'Roboto':
        return "'Roboto', 'Arial', 'Segoe UI', sans-serif";
      case 'Lora':
        return "'Lora', 'Georgia', 'Palatino Linotype', serif";
      case 'Anton':
        return "'Anton', 'Impact', 'Arial Black', sans-serif";
      case 'Great Vibes':
        return "'Great Vibes', 'Brush Script MT', 'Lucida Calligraphy', cursive";
      case 'Fira Code':
        return "'Fira Code', 'Consolas', 'Courier New', monospace";
      case 'Caveat':
        return "'Caveat', 'Segoe Print', 'Comic Sans MS', cursive";
      case 'Righteous':
        return "'Righteous', 'Arial Black', 'Trebuchet MS', sans-serif";
      case 'Abril Fatface':
        return "'Abril Fatface', 'Georgia', 'Times New Roman', serif";
      case 'Comfortaa':
        return "'Comfortaa', 'Segoe UI', 'Trebuchet MS', cursive";
      case 'Permanent Marker':
        return "'Permanent Marker', 'Impact', 'Comic Sans MS', cursive";
      case 'Monoton':
        return "'Monoton', 'Impact', 'Trebuchet MS', cursive";
      case 'Press Start 2P':
        return "'Press Start 2P', 'Consolas', 'Courier New', monospace";
      case 'Satisfy':
        return "'Satisfy', 'Brush Script MT', cursive";
      case 'Plus Jakarta Sans':
      default:
        return "'Plus Jakarta Sans', 'Segoe UI', 'Helvetica Neue', sans-serif";
    }
  }

  wrapText(ctx, text, maxWidth) {
    if (!text) return [];
    const words = String(text).trim().split(/\s+/);
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && i > 0) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  drawFrame(ctx, style, w, h, title, bannerText, colors, scale = 1, fontTitle = 'sans-serif', fontBanner = 'sans-serif', iconOpts = {}) {
    ctx.save();

    const cardMargin = 35 * scale;
    const cardX = cardMargin;
    const cardY = cardMargin;
    const cardW = w - cardMargin * 2;
    const cardH = h - cardMargin * 2;

    const outerShape = iconOpts.frameShape || 'rectangular';
    if (!iconOpts.skipBorder) {
      ctx.lineWidth = 4 * scale;
      ctx.strokeStyle = colors.frameColor;
      ctx.beginPath();

      switch (outerShape) {
        case 'square':
          require('./ShapeDrawer').prototype.roundRect(ctx, cardX, cardY, cardW, cardH, 12 * scale);
          ctx.stroke();
          break;
        case 'rounded':
          require('./ShapeDrawer').prototype.roundRect(ctx, cardX, cardY, cardW, cardH, 48 * scale);
          ctx.stroke();
          break;
        case 'circle':
          const circCenterY = cardY + cardH * 0.46;
          const circR = 286 * scale;
          ctx.arc(w / 2, circCenterY, circR, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case 'shield':
          ctx.moveTo(cardX + 24 * scale, cardY);
          ctx.lineTo(cardX + cardW - 24 * scale, cardY);
          ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + 24 * scale);
          ctx.lineTo(cardX + cardW, cardY + cardH * 0.72);
          ctx.quadraticCurveTo(w / 2, cardY + cardH + 10 * scale, cardX, cardY + cardH * 0.72);
          ctx.lineTo(cardX, cardY + 24 * scale);
          ctx.quadraticCurveTo(cardX, cardY, cardX + 24 * scale, cardY);
          ctx.closePath();
          ctx.stroke();
          break;
        case 'ticket':
          ctx.moveTo(cardX + 20 * scale, cardY);
          ctx.lineTo(cardX + cardW - 20 * scale, cardY);
          ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + 20 * scale);
          ctx.lineTo(cardX + cardW, cardY + cardH * 0.46);
          ctx.arc(cardX + cardW, cardY + cardH * 0.5, 16 * scale, Math.PI * 1.5, Math.PI * 0.5, true);
          ctx.lineTo(cardX + cardW, cardY + cardH - 20 * scale);
          ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - 20 * scale, cardY + cardH);
          ctx.lineTo(cardX + 20 * scale, cardY + cardH);
          ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - 20 * scale);
          ctx.lineTo(cardX, cardY + cardH * 0.54);
          ctx.arc(cardX, cardY + cardH * 0.5, 16 * scale, Math.PI * 0.5, Math.PI * 1.5, true);
          ctx.lineTo(cardX, cardY + 20 * scale);
          ctx.quadraticCurveTo(cardX, cardY, cardX + 20 * scale, cardY);
          ctx.closePath();
          ctx.stroke();
          break;
        case 'hexagonal':
          const hxPad = 12 * scale;
          ctx.moveTo(cardX + cardW / 2, cardY);
          ctx.lineTo(cardX + cardW - hxPad, cardY + cardH * 0.16);
          ctx.lineTo(cardX + cardW - hxPad, cardY + cardH * 0.84);
          ctx.lineTo(cardX + cardW / 2, cardY + cardH);
          ctx.lineTo(cardX + hxPad, cardY + cardH * 0.84);
          ctx.lineTo(cardX + hxPad, cardY + cardH * 0.16);
          ctx.closePath();
          ctx.stroke();
          break;
        case 'diamond_card':
          const dCut = 32 * scale;
          ctx.moveTo(cardX + dCut, cardY);
          ctx.lineTo(cardX + cardW - dCut, cardY);
          ctx.lineTo(cardX + cardW, cardY + dCut);
          ctx.lineTo(cardX + cardW, cardY + cardH - dCut);
          ctx.lineTo(cardX + cardW - dCut, cardY + cardH);
          ctx.lineTo(cardX + dCut, cardY + cardH);
          ctx.lineTo(cardX, cardY + cardH - dCut);
          ctx.lineTo(cardX, cardY + dCut);
          ctx.closePath();
          ctx.stroke();
          break;
        case 'badge_star':
          const bCut = 36 * scale;
          ctx.moveTo(cardX + bCut, cardY);
          ctx.lineTo(cardX + cardW - bCut, cardY);
          ctx.lineTo(cardX + cardW, cardY + bCut);
          ctx.lineTo(cardX + cardW, cardY + cardH - bCut);
          ctx.lineTo(cardX + bCut, cardY + cardH);
          ctx.lineTo(cardX + bCut, cardY + cardH);
          ctx.lineTo(cardX, cardY + cardH - bCut);
          ctx.lineTo(cardX, cardY + bCut);
          ctx.closePath();
          ctx.stroke();
          ctx.lineWidth = 2 * scale;
          require('./ShapeDrawer').prototype.roundRect(ctx, cardX + 8 * scale, cardY + 8 * scale, cardW - 16 * scale, cardH - 16 * scale, 18 * scale);
          ctx.stroke();
          ctx.lineWidth = 4 * scale;
          break;
        case 'wavy':
          const cRadius = 20 * scale;
          ctx.moveTo(cardX + cRadius, cardY);
          ctx.lineTo(cardX + cardW - cRadius, cardY);
          ctx.arc(cardX + cardW, cardY, cRadius, Math.PI, Math.PI * 0.5, true);
          ctx.lineTo(cardX + cardW, cardY + cardH - cRadius);
          ctx.arc(cardX + cardW, cardY + cardH, cRadius, Math.PI * 1.5, Math.PI, true);
          ctx.lineTo(cardX + cRadius, cardY + cardH);
          ctx.arc(cardX, cardY + cardH, cRadius, 0, Math.PI * 1.5, true);
          ctx.lineTo(cardX, cardY + cRadius);
          ctx.arc(cardX, cardY, cRadius, Math.PI * 0.5, 0, true);
          ctx.closePath();
          ctx.stroke();
          break;
        case 'rectangular':
        default:
          require('./ShapeDrawer').prototype.roundRect(ctx, cardX, cardY, cardW, cardH, 24 * scale);
          ctx.stroke();
          break;
      }
    }

    const titlePos = iconOpts.titlePosition || 'bottom';
    if (titlePos === 'hidden') {
      ctx.restore();
      return;
    }

    const displayBannerText = bannerText || 'SCAN ME';
    const isHeaderStyle = (style === 'top-banner' || style === 'shield-badge' || style === 'card-header') || (bannerText !== undefined && bannerText !== null && bannerText !== '');
    const titleFontStack = this.getFontStack(fontTitle);
    const bannerFontStack = this.getFontStack(fontBanner);

    if (isHeaderStyle) {
      if (style === 'card-header' && !iconOpts.skipBorder) {
        ctx.fillStyle = colors.frameColor;
        require('./ShapeDrawer').prototype.roundRect(ctx, cardX, cardY, cardW, 85 * scale, { tl: 24 * scale, tr: 24 * scale, br: 0, bl: 0 });
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(20 * scale)}px ${bannerFontStack}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayBannerText, w / 2, cardY + (42.5 * scale));
      } else {
        ctx.font = `bold ${Math.round(16 * scale)}px ${bannerFontStack}`;
        const badgeW = Math.max(220 * scale, ctx.measureText(displayBannerText).width + 40 * scale);
        const badgeH = 44 * scale;
        const badgeX = (w - badgeW) / 2;
        const badgeY = cardY - (badgeH / 2);

        ctx.fillStyle = colors.badgeBg || colors.frameColor || '#2563eb';
        require('./ShapeDrawer').prototype.roundRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2);
        ctx.fill();

        ctx.fillStyle = colors.badgeText || '#ffffff';
        ctx.font = `bold ${Math.round(16 * scale)}px ${bannerFontStack}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayBannerText, w / 2, badgeY + badgeH / 2 + (1 * scale));
      }
    }

    const baseFontSize = iconOpts.fontSizeTitle || 24;
    const fontPx = Math.round(baseFontSize * scale);
    ctx.fillStyle = colors.textColor;
    ctx.font = `bold ${fontPx}px ${titleFontStack}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const titleX = w / 2;
    const maxTitleW = cardW - (48 * scale);
    const titleText = title || 'Escanea el código QR';
    const lines = this.wrapText(ctx, titleText, maxTitleW);

    const lineHeight = fontPx * 1.25;
    const titleUserOffset = (iconOpts.titleOffsetY || 0) * scale;
    const defaultY = (titlePos === 'top') ? 120 : (iconOpts.skipBorder ? 665 : 625);
    const baseTitleY = (defaultY * scale) + titleUserOffset;
    const startY = baseTitleY - ((lines.length - 1) * lineHeight) / 2;

    const iconSizeCalc = (iconOpts.iconSize || 34) * scale;

    if (iconOpts.showIcon && iconOpts.iconPosition && iconOpts.iconPosition !== 'center') {
      const iconColor = iconOpts.iconColor || colors.textColor;
      const renderTitleIcon = (cx, cy, sz) => {
        if (iconOpts.loadedIconImg) {
          ctx.drawImage(iconOpts.loadedIconImg, cx - sz / 2, cy - sz / 2, sz, sz);
        } else {
          require('./IconDrawer').prototype.drawVectorIcon(ctx, iconOpts.iconName, cx, cy, sz, iconColor);
        }
      };

      if (iconOpts.iconPosition === 'left') {
        let maxLineW = 0;
        lines.forEach(line => {
          const lw = ctx.measureText(line).width;
          if (lw > maxLineW) maxLineW = lw;
        });
        renderTitleIcon((w - maxLineW) / 2 - (28 * scale), baseTitleY, iconSizeCalc * 0.8);
        lines.forEach((line, idx) => {
          const lineY = startY + idx * lineHeight;
          ctx.fillText(line, titleX + (14 * scale), lineY);
        });
      } else if (iconOpts.iconPosition === 'right') {
        let maxLineW = 0;
        lines.forEach(line => {
          const lw = ctx.measureText(line).width;
          if (lw > maxLineW) maxLineW = lw;
        });
        renderTitleIcon((w + maxLineW) / 2 + (28 * scale), baseTitleY, iconSizeCalc * 0.8);
        lines.forEach((line, idx) => {
          const lineY = startY + idx * lineHeight;
          ctx.fillText(line, titleX - (14 * scale), lineY);
        });
      } else if (iconOpts.iconPosition === 'above') {
        renderTitleIcon(w / 2, startY - (30 * scale), iconSizeCalc * 0.85);
        lines.forEach((line, idx) => {
          const lineY = startY + (12 * scale) + idx * lineHeight;
          ctx.fillText(line, titleX, lineY);
        });
      } else if (iconOpts.iconPosition === 'below') {
        lines.forEach((line, idx) => {
          const lineY = startY - (10 * scale) + idx * lineHeight;
          ctx.fillText(line, titleX, lineY);
        });
        const lastLineY = startY - (10 * scale) + (lines.length - 1) * lineHeight;
        renderTitleIcon(w / 2, lastLineY + (28 * scale), iconSizeCalc * 0.85);
      }
    } else {
      lines.forEach((line, idx) => {
        const lineY = startY + idx * lineHeight;
        ctx.fillText(line, titleX, lineY);
      });
    }

    if (!isHeaderStyle && displayBannerText) {
      ctx.font = `bold ${Math.round(16 * scale)}px ${bannerFontStack}`;
      const textWidth = ctx.measureText(displayBannerText).width;
      const subW = Math.max(180 * scale, Math.min(420 * scale, textWidth + 40 * scale));
      const subH = 40 * scale;
      const subX = (w - subW) / 2;
      let subY = 635 * scale;
      if (titlePos === 'bottom') {
        const titleBottomY = startY + (lines.length * lineHeight) + (10 * scale);
        if (titleBottomY > 600 * scale) {
          subY = Math.min(695 * scale, titleBottomY + (10 * scale));
        }
      }

      ctx.fillStyle = colors.badgeBg;
      require('./ShapeDrawer').prototype.roundRect(ctx, subX, subY, subW, subH, 20 * scale);
      ctx.fill();

      ctx.fillStyle = colors.badgeText;
      ctx.font = `bold ${Math.round(16 * scale)}px ${bannerFontStack}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayBannerText, w / 2, subY + subH / 2 + (1 * scale));
    }

    ctx.restore();
  }

}
module.exports = FrameDrawer;