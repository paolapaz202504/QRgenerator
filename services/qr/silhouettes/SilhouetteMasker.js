const { createCanvas, loadImage } = require('canvas');

class SilhouetteMasker {
  createSilhouetteAlphaMask(silhouetteMode, loadedIconImg, iconName) {
    const maskW = 300;
    const maskH = 300;
    const maskCanvas = createCanvas(maskW, maskH);
    const mctx = maskCanvas.getContext('2d');
    mctx.clearRect(0, 0, maskW, maskH);
    mctx.fillStyle = '#000000';
    mctx.strokeStyle = '#000000';

    this.drawSilhouetteMask(mctx, silhouetteMode, loadedIconImg, iconName, 0, 0, maskW);

    const imgData = mctx.getImageData(0, 0, maskW, maskH);
    return { data: imgData.data, width: maskW, height: maskH };
  }

  drawSilhouetteMask(ctx, silhouetteMode, loadedIconImg, iconName, qrX, qrY, qrAreaSize) {
    const rawName = (iconName || '').toLowerCase();
    const isHeartIcon    = rawName.includes('heart');
    const isCatIcon      = rawName.includes('cat');
    const isAppleIcon    = rawName.includes('apple');
    const isStarIcon     = rawName.includes('star');
    const isYoutubeIcon  = rawName.includes('youtube') || rawName.includes('play');

    const isBrandIcon = isYoutubeIcon || rawName.includes('whatsapp') || rawName.includes('instagram') || rawName.includes('tiktok') || rawName.includes('facebook') || rawName.includes('twitter') || rawName.includes('linkedin');

    // Per-shape silScale
    let baseSilScale;
    if (silhouetteMode === 'star' || (silhouetteMode.startsWith('icon') && isStarIcon)) {
      baseSilScale = 0.64;
    } else if (silhouetteMode === 'shield' || (silhouetteMode.startsWith('icon') && rawName.includes('shield'))) {
      baseSilScale = 0.65;
    } else if (isBrandIcon || (silhouetteMode.startsWith('icon') && isBrandIcon)) {
      baseSilScale = 0.70;
    } else {
      baseSilScale = 0.68;
    }

    const sw = qrAreaSize * baseSilScale;
    const sh = qrAreaSize * baseSilScale;
    const sx = qrX + (qrAreaSize - sw) / 2;
    const sy = qrY + (qrAreaSize - sh) / 2;
    const cx = sx + sw / 2;
    const cy = sy + sh / 2;

    ctx.beginPath();
    
    if (loadedIconImg && silhouetteMode.startsWith('icon')) {
      const tintW = Math.max(1, Math.round(sw));
      const tintH = Math.max(1, Math.round(sh));
      const tintCanvas = createCanvas(tintW, tintH);
      const tctx = tintCanvas.getContext('2d');
      tctx.drawImage(loadedIconImg, 0, 0, tintW, tintH);
      const iconData = tctx.getImageData(0, 0, tintW, tintH);
      const data = iconData.data;
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (a < 30 || (r > 235 && g > 235 && b > 235)) {
          data[i + 3] = 0;
        }
      }
      tctx.putImageData(iconData, 0, 0);
      tctx.globalCompositeOperation = 'source-in';
      tctx.fillStyle = ctx.fillStyle;
      tctx.fillRect(0, 0, tintW, tintH);
      ctx.drawImage(tintCanvas, sx, sy);
    } else if (isBrandIcon || (silhouetteMode.startsWith('icon') && isBrandIcon)) {
      const rx = sw * 0.20;
      require('../drawing/ShapeDrawer').prototype.roundRect(ctx, sx, sy, sw, sh, rx);
      ctx.fill();
    } else if (silhouetteMode === 'heart' || (silhouetteMode.startsWith('icon') && isHeartIcon)) {
      require('../drawing/IconDrawer').prototype.drawHeartPath(ctx, sx, sy, sw);
      ctx.fill();
    } else if (silhouetteMode === 'circle') {
      ctx.arc(cx, cy, sw * 0.50, 0, Math.PI * 2);
      ctx.fill();
    } else if (silhouetteMode === 'star' || (silhouetteMode.startsWith('icon') && isStarIcon)) {
      require('../drawing/IconDrawer').prototype.drawStarPath(ctx, cx, cy, 8, sw * 0.54, sw * 0.44);
      ctx.fill();
    } else if (silhouetteMode === 'shield' || (silhouetteMode.startsWith('icon') && rawName.includes('shield'))) {
      const r = sw * 0.15;
      ctx.moveTo(sx + r, sy);
      ctx.lineTo(sx + sw - r, sy);
      ctx.quadraticCurveTo(sx + sw, sy, sx + sw, sy + r);
      ctx.lineTo(sx + sw, sy + sh * 0.70);
      ctx.quadraticCurveTo(sx + sw, sy + sh, cx, sy + sh * 1.04);
      ctx.quadraticCurveTo(sx, sy + sh, sx, sy + sh * 0.70);
      ctx.lineTo(sx, sy + r);
      ctx.quadraticCurveTo(sx, sy, sx + r, sy);
      ctx.fill();
    } else if (silhouetteMode === 'apple' || (silhouetteMode.startsWith('icon') && isAppleIcon)) {
      ctx.arc(cx, cy + sh * 0.05, sw * 0.46, 0, Math.PI * 2);
      ctx.fill();
    } else if (silhouetteMode === 'cat' || (silhouetteMode.startsWith('icon') && isCatIcon)) {
      ctx.arc(cx, cy + sh * 0.05, sw * 0.46, 0, Math.PI * 2);
      ctx.fill();
    } else if (silhouetteMode.startsWith('icon')) {
      if (iconName) {
        require('../drawing/IconDrawer').prototype.drawVectorIcon(ctx, iconName, cx, cy, sw, ctx.fillStyle, true);
      } else {
        const rx = sw * 0.20;
        require('../drawing/ShapeDrawer').prototype.roundRect(ctx, sx, sy, sw, sh, rx);
        ctx.fill();
      }
    } else {
      ctx.fillRect(qrX, qrY, qrAreaSize, qrAreaSize);
    }
  }

  isCellInsideSilhouette(r, c, size, cellX, cellY, cellSize, qrX, qrY, qrAreaSize, silhouetteMode, alphaMask) {
    if (!silhouetteMode || silhouetteMode === 'none') return true;
    if (!alphaMask) return true;

    const sample = (u, v) => {
      const mx = Math.max(0, Math.min(alphaMask.width - 1, Math.floor(u * alphaMask.width)));
      const my = Math.max(0, Math.min(alphaMask.height - 1, Math.floor(v * alphaMask.height)));
      return alphaMask.data[(my * alphaMask.width + mx) * 4 + 3] > 40;
    };

    // Strict containment: verify center and inset corners of the cell so
    // pattern points are completely contained inside the silhouette shape
    const m = 0.22;
    const pts = [
      [(c + 0.5) / size, (r + 0.5) / size],
      [(c + m) / size, (r + m) / size],
      [(c + 1 - m) / size, (r + m) / size],
      [(c + m) / size, (r + 1 - m) / size],
      [(c + 1 - m) / size, (r + 1 - m) / size]
    ];
    return pts.every(([u, v]) => sample(u, v));
  }
}

module.exports = new SilhouetteMasker();