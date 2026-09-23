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
        const rPad = Math.max(0.8, size * 0.08);
        this.roundRect(ctx, x + rPad, y + rPad, size - rPad * 2, size - rPad * 2, size * 0.35);
        ctx.fill();
        break;
      case 'dots':
        ctx.arc(cx, cy, r * 0.98, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'smooth':
        this.roundRect(ctx, x + 0.5, y + 0.5, size - 1, size - 1, size * 0.45);
        ctx.fill();
        break;
      case 'diamond':
        const d = (size * 1.16) / 2;
        ctx.moveTo(cx, cy - d);
        ctx.lineTo(cx + d, cy);
        ctx.lineTo(cx, cy + d);
        ctx.lineTo(cx - d, cy);
        ctx.closePath();
        ctx.fill();
        break;
      case 'star':
        require('./IconDrawer').prototype.drawStarPath(ctx, cx, cy, 5, r * 0.9, r * 0.45);
        ctx.fill();
        break;
      case 'sparkle':
        require('./IconDrawer').prototype.drawStarPath(ctx, cx, cy, 4, r * 0.9, r * 0.3);
        ctx.fill();
        break;
      case 'heart':
        require('./IconDrawer').prototype.drawHeartPath(ctx, x + size * 0.1, y + size * 0.1, size * 0.8);
        ctx.fill();
        break;
      case 'hexagon':
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const hx = cx + r * 0.85 * Math.cos(angle);
          const hy = cy + r * 0.85 * Math.sin(angle);
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fill();
        break;
      case 'ring':
        ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        break;
      case 'diamond_rounded':
        const p = size * 0.15;
        ctx.moveTo(cx, y + p);
        ctx.quadraticCurveTo(x + size - p, y + p, x + size - p, cy);
        ctx.quadraticCurveTo(x + size - p, y + size - p, cx, y + size - p);
        ctx.quadraticCurveTo(x + p, y + size - p, x + p, cy);
        ctx.quadraticCurveTo(x + p, y + p, cx, y + p);
        ctx.closePath();
        ctx.fill();
        break;
      case 'cross':
        const w = size * 0.36;
        const o = (size - w) / 2;
        this.roundRect(ctx, x + o, y + 1, w, size - 2, size * 0.1);
        ctx.fill();
        ctx.beginPath();
        this.roundRect(ctx, x + 1, y + o, size - 2, w, size * 0.1);
        ctx.fill();
        break;
      case 'clover':
        const cr = r * 0.48;
        ctx.arc(cx - cr * 0.5, cy - cr * 0.5, cr, 0, Math.PI * 2);
        ctx.arc(cx + cr * 0.5, cy - cr * 0.5, cr, 0, Math.PI * 2);
        ctx.arc(cx - cr * 0.5, cy + cr * 0.5, cr, 0, Math.PI * 2);
        ctx.arc(cx + cr * 0.5, cy + cr * 0.5, cr, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'sunburst':
        require('./IconDrawer').prototype.drawStarPath(ctx, cx, cy, 8, r * 0.9, r * 0.5);
        ctx.fill();
        break;
      case 'leaf_dot':
        this.roundRect(ctx, x + 0.5, y + 0.5, size - 1, size - 1, { tl: size * 0.45, tr: 0, br: size * 0.45, bl: 0 });
        ctx.fill();
        break;
      case 'halftone':
        const hStep = size / 3;
        for (let dx = 0; dx < 3; dx++) {
          for (let dy = 0; dy < 3; dy++) {
            if ((dx + dy) % 2 === 0) {
              ctx.beginPath();
              ctx.arc(x + hStep * (dx + 0.5), y + hStep * (dy + 0.5), hStep * 0.42, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
        break;
      case 'shield_dot':
        this.roundRect(ctx, x + 0.5, y + 0.5, size - 1, size - 1, { tl: 1, tr: 1, br: size * 0.45, bl: size * 0.45 });
        ctx.fill();
        break;
      case 'flower':
        const petalR = r * 0.45;
        for (let a = 0; a < 4; a++) {
          const ang = (Math.PI / 2) * a;
          const px = cx + petalR * Math.cos(ang);
          const py = cy + petalR * Math.sin(ang);
          ctx.beginPath();
          ctx.arc(px, py, petalR * 0.85, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case 'diagonal_lines':
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.PI / 4);
        this.roundRect(ctx, -r * 0.75, -r * 0.35, r * 1.5, r * 0.7, r * 0.3);
        ctx.fill();
        ctx.restore();
        break;
      case 'radial_drop':
        const dropR = size * 0.45;
        this.roundRect(ctx, x + 0.5, y + 0.5, size - 1, size - 1, { tl: dropR, tr: 0, br: dropR, bl: dropR });
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
        this.roundRect(ctx, x, y, size, size, size * 0.3);
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
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const hx = cx + r * Math.cos(angle);
          const hy = cy + r * Math.sin(angle);
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
        require('./IconDrawer').prototype.drawStarPath(ctx, cx, cy, 8, r, r * 0.55);
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