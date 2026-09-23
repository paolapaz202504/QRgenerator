const { createCanvas, loadImage } = require('canvas');

class SilhouetteMasker {
  createSilhouetteAlphaMask(silhouetteMode, loadedIconImg, iconName) {
    const maskW = 140;
    const maskH = 140;
    const maskCanvas = createCanvas(maskW, maskH);
    const mctx = maskCanvas.getContext('2d');
    mctx.clearRect(0, 0, maskW, maskH);
    mctx.fillStyle = '#000000';
    mctx.strokeStyle = '#000000';

    const rawName = (iconName || '').toLowerCase();
    const isHeartIcon = rawName.includes('heart');
    const isCatIcon = rawName.includes('cat');
    const isAppleIcon = rawName.includes('apple');
    const isStarIcon = rawName.includes('star');
    const isYoutubeIcon = rawName.includes('youtube') || rawName.includes('play');

    if (isYoutubeIcon || (silhouetteMode.startsWith('icon') && isYoutubeIcon)) {
      mctx.beginPath();
      require('../drawing/ShapeDrawer').prototype.roundRect(mctx, 18, 22, 104, 96, 20);
      mctx.fill();

      mctx.globalCompositeOperation = 'destination-out';
      mctx.beginPath();
      mctx.moveTo(61, 56);
      mctx.lineTo(84, 70);
      mctx.lineTo(61, 84);
      mctx.closePath();
      mctx.fill();
      mctx.globalCompositeOperation = 'source-over';
    } else if (silhouetteMode === 'heart' || (silhouetteMode.startsWith('icon') && isHeartIcon)) {
      mctx.beginPath();
      require('../drawing/IconDrawer').prototype.drawHeartPath(mctx, 18, 18, 104);
      mctx.fill();
    } else if (silhouetteMode === 'apple' || (silhouetteMode.startsWith('icon') && isAppleIcon)) {
      mctx.beginPath();
      mctx.arc(70, 72, 42, 0, Math.PI * 2);
      mctx.fill();
      mctx.beginPath();
      mctx.ellipse(70, 26, 14, 6, -Math.PI / 4, 0, Math.PI * 2);
      mctx.fill();
    } else if (silhouetteMode === 'cat' || (silhouetteMode.startsWith('icon') && isCatIcon)) {
      mctx.beginPath();
      mctx.arc(70, 74, 40, 0, Math.PI * 2);
      mctx.fill();
      mctx.beginPath();
      mctx.moveTo(45, 48); mctx.lineTo(26, 24); mctx.lineTo(60, 40);
      mctx.moveTo(95, 48); mctx.lineTo(114, 24); mctx.lineTo(80, 40);
      mctx.fill();
    } else if (silhouetteMode === 'star' || (silhouetteMode.startsWith('icon') && isStarIcon)) {
      require('../drawing/IconDrawer').prototype.drawStarPath(mctx, 70, 70, 8, 54, 42);
      mctx.fill();
    } else if (silhouetteMode === 'circle') {
      mctx.beginPath();
      mctx.arc(70, 70, 44, 0, Math.PI * 2);
      mctx.fill();
    } else if (silhouetteMode === 'shield') {
      mctx.beginPath();
      mctx.moveTo(70, 22);
      mctx.lineTo(114, 38);
      mctx.lineTo(114, 80);
      mctx.quadraticCurveTo(70, 116, 70, 116);
      mctx.quadraticCurveTo(26, 80, 26, 38);
      mctx.closePath();
      mctx.fill();
    } else if (silhouetteMode.startsWith('icon')) {
      const iconBox = 110;
      const iconOff = Math.round((maskW - iconBox) / 2);
      if (loadedIconImg) {
        mctx.drawImage(loadedIconImg, iconOff, iconOff, iconBox, iconBox);
        const iconData = mctx.getImageData(0, 0, maskW, maskH);
        const data = iconData.data;
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const isWhiteBg = (r > 235 && g > 235 && b > 235);
          if (a < 30 || isWhiteBg) {
            data[i + 3] = 0;
          } else {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 255;
          }
        }
        mctx.putImageData(iconData, 0, 0);
      } else if (iconName) {
        require('../drawing/IconDrawer').prototype.drawVectorIcon(mctx, iconName, 70, 70, iconBox, '#000000', true);
      } else {
        mctx.beginPath();
        require('../drawing/ShapeDrawer').prototype.roundRect(mctx, iconOff, iconOff, iconBox, iconBox, 14);
        mctx.fill();
      }
    }

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

    // Finder Pattern Eyes + Quiet Zone + Format Info (9x9 corner regions) MUST ALWAYS be preserved
    const isTopLeftEye = (r <= 8 && c <= 8);
    const isTopRightEye = (r <= 8 && c >= size - 9);
    const isBottomLeftEye = (r >= size - 9 && c <= 8);
    if (isTopLeftEye || isTopRightEye || isBottomLeftEye) return true;

    if (!alphaMask) return true;

    const u = (c + 0.5) / size;
    const v = (r + 0.5) / size;

    const mx = Math.max(0, Math.min(alphaMask.width - 1, Math.floor(u * alphaMask.width)));
    const my = Math.max(0, Math.min(alphaMask.height - 1, Math.floor(v * alphaMask.height)));
    const idx = (my * alphaMask.width + mx) * 4 + 3;

    return alphaMask.data[idx] > 20;
  }



}
module.exports = new SilhouetteMasker();