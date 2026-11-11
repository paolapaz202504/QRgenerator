class ShapeDrawer {
  roundRect(ctx, x, y, width, height, radius) {
    if (typeof radius === 'number') {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
      const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
      for (const side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
  }

  isDarkColor(hex) {
    if (!hex || typeof hex !== 'string') return false;
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    if (isNaN(num)) return false;
    const r = (num >> 16) & 0xff;
    const g = (num >> 8) & 0xff;
    const b = num & 0xff;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance < 140;
  }

  hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return { r: 100, g: 116, b: 139 };
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    if (isNaN(num)) return { r: 100, g: 116, b: 139 };
    return { r: (num >> 16) & 0xff, g: (num >> 8) & 0xff, b: num & 0xff };
  }

  drawDotPattern(ctx, x, y, size, style, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size / 2;

    ctx.beginPath();
    switch (style) {
      case 'rounded':
        this.roundRect(ctx, x + 0.2, y + 0.2, size - 0.4, size - 0.4, size * 0.25);
        ctx.fill();
        break;
      case 'dots':
        ctx.arc(cx, cy, r * 0.98, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'smooth':
        this.roundRect(ctx, x + 0.4, y + 0.4, size - 0.8, size - 0.8, size * 0.42);
        ctx.fill();
        break;
      case 'diamond':
        const cut = size * 0.28;
        ctx.moveTo(x + cut, y);
        ctx.lineTo(x + size - cut, y);
        ctx.lineTo(x + size, y + cut);
        ctx.lineTo(x + size, y + size - cut);
        ctx.lineTo(x + size - cut, y + size);
        ctx.lineTo(x + cut, y + size);
        ctx.lineTo(x, y + size - cut);
        ctx.lineTo(x, y + cut);
        ctx.closePath();
        ctx.fill();
        break;
      case 'star':
        ctx.arc(cx, cy, r * 0.88, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        require('./IconDrawer').prototype.drawStarPath(ctx, cx, cy, 5, r * 1.12, r * 0.72);
        ctx.fill();
        break;
      case 'sparkle':
        ctx.arc(cx, cy, r * 0.98, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        require('./IconDrawer').prototype.drawStarPath(ctx, cx, cy, 4, r * 1.08, r * 0.65);
        ctx.fill();
        break;
      case 'heart':
        require('./IconDrawer').prototype.drawHeartPath(ctx, x - size * 0.05, y - size * 0.05, size * 1.1);
        ctx.fill();
        break;
      case 'hexagon':
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const hx = cx + r * 1.06 * Math.cos(angle);
          const hy = cy + r * 1.06 * Math.sin(angle);
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fill();
        break;
      case 'ring':
        // Modern bullseye/halo ring with solid scannable core
        ctx.arc(cx, cy, r * 1.02, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'diamond_rounded':
        this.roundRect(ctx, x + 0.3, y + 0.3, size - 0.6, size - 0.6, size * 0.35);
        ctx.fill();
        break;
      case 'cross':
        const w = size * 0.52;
        const o = (size - w) / 2;
        this.roundRect(ctx, x + o, y, w, size, size * 0.1);
        ctx.fill();
        ctx.beginPath();
        this.roundRect(ctx, x, y + o, size, w, size * 0.1);
        ctx.fill();
        break;
      case 'clover':
        ctx.arc(cx, cy, r * 0.98, 0, Math.PI * 2);
        ctx.fill();
        const cr = r * 0.44;
        ctx.beginPath();
        ctx.arc(cx, cy - r * 0.36, cr, 0, Math.PI * 2);
        ctx.arc(cx + r * 0.36, cy, cr, 0, Math.PI * 2);
        ctx.arc(cx, cy + r * 0.36, cr, 0, Math.PI * 2);
        ctx.arc(cx - r * 0.36, cy, cr, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'sunburst':
        require('./IconDrawer').prototype.drawStarPath(ctx, cx, cy, 8, r * 0.98, r * 0.65);
        ctx.fill();
        break;
      case 'leaf_dot':
        this.roundRect(ctx, x, y, size, size, { tl: size * 0.5, tr: 0, br: size * 0.5, bl: 0 });
        ctx.fill();
        break;
      case 'halftone':
        ctx.arc(cx, cy, r * 0.98, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'shield_dot':
        this.roundRect(ctx, x + 0.4, y + 0.4, size - 0.8, size - 0.8, { tl: 1, tr: 1, br: size * 0.45, bl: size * 0.45 });
        ctx.fill();
        break;
      case 'flower':
        ctx.arc(cx, cy, r * 0.92, 0, Math.PI * 2);
        ctx.fill();
        const pr = r * 0.5;
        for (let a = 0; a < 4; a++) {
          const ang = (Math.PI / 2) * a + Math.PI / 4;
          ctx.beginPath();
          ctx.arc(cx + r * 0.65 * Math.cos(ang), cy + r * 0.65 * Math.sin(ang), pr, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case 'diagonal_lines':
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.PI / 4);
        this.roundRect(ctx, -r * 0.95, -r * 0.65, r * 1.9, r * 1.3, r * 0.25);
        ctx.fill();
        ctx.restore();
        break;
      case 'radial_drop':
        const dropR = size * 0.45;
        this.roundRect(ctx, x + 0.4, y + 0.4, size - 0.8, size - 0.8, { tl: dropR, tr: 0, br: dropR, bl: dropR });
        ctx.fill();
        break;
      case 'bubble':
        ctx.arc(cx, cy, r * 0.96, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'pixel':
        this.roundRect(ctx, x + 0.3, y + 0.3, size - 0.6, size - 0.6, 1);
        ctx.fill();
        break;
      case 'square':
      default:
        ctx.fillRect(x, y, size, size);
        break;
    }
  }

  drawEye(ctx, x, y, size, style, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size / 2;

    ctx.beginPath();
    switch (style) {
      case 'circle':
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'rounded':
        this.roundRect(ctx, x, y, size, size, size * 0.14);
        ctx.fill();
        break;
      case 'diamond':
        ctx.moveTo(cx, y);
        ctx.lineTo(x + size, cy);
        ctx.lineTo(cx, y + size);
        ctx.lineTo(x, cy);
        ctx.closePath();
        ctx.fill();
        break;
      case 'hexagon':
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const hx = cx + r * 1.06 * Math.cos(angle);
          const hy = cy + r * 1.06 * Math.sin(angle);
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fill();
        break;
      case 'leaf':
        this.roundRect(ctx, x, y, size, size, { tl: size * 0.45, tr: 0, br: size * 0.45, bl: 0 });
        ctx.fill();
        break;
      case 'star':
        require('./IconDrawer').prototype.drawStarPath(ctx, cx, cy, 8, r, r * 0.82);
        ctx.fill();
        break;
      case 'shield':
        ctx.moveTo(cx, y);
        ctx.lineTo(x + size, y + size * 0.3);
        ctx.lineTo(x + size, y + size * 0.7);
        ctx.quadraticCurveTo(cx, y + size, cx, y + size);
        ctx.quadraticCurveTo(x, y + size * 0.7, x, y + size * 0.3);
        ctx.closePath();
        ctx.fill();
        break;
      case 'square':
      default:
        ctx.fillRect(x, y, size, size);
        break;
    }
  }

}
module.exports = ShapeDrawer;