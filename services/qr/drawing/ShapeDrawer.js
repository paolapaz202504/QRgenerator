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
      case 'rounded': {
        const pad = size * 0.06;
        const eff = size - pad * 2;
        this.roundRect(ctx, x + pad, y + pad, eff, eff, eff * 0.28);
        ctx.fill();
        break;
      }
      case 'dots': {
        ctx.arc(cx, cy, r * 0.93, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'smooth': {
        const pad = size * 0.07;
        const eff = size - pad * 2;
        this.roundRect(ctx, x + pad, y + pad, eff, eff, eff * 0.44);
        ctx.fill();
        break;
      }
      case 'diamond': {
        const pad = size * 0.06;
        const eff = size - pad * 2;
        const cut = eff * 0.38;
        ctx.moveTo(x + pad + cut, y + pad);
        ctx.lineTo(x + pad + eff - cut, y + pad);
        ctx.lineTo(x + pad + eff, y + pad + cut);
        ctx.lineTo(x + pad + eff, y + pad + eff - cut);
        ctx.lineTo(x + pad + eff - cut, y + pad + eff);
        ctx.lineTo(x + pad + cut, y + pad + eff);
        ctx.lineTo(x + pad, y + pad + eff - cut);
        ctx.lineTo(x + pad, y + pad + cut);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'star': {
        ctx.arc(cx, cy, r * 0.88, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        require('./IconDrawer').prototype.drawStarPath(ctx, cx, cy, 5, r * 0.96, r * 0.60);
        ctx.fill();
        break;
      }
      case 'sparkle': {
        ctx.arc(cx, cy, r * 0.88, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        require('./IconDrawer').prototype.drawStarPath(ctx, cx, cy, 4, r * 0.96, r * 0.58);
        ctx.fill();
        break;
      }
      case 'heart': {
        ctx.arc(cx, cy, r * 0.90, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        require('./IconDrawer').prototype.drawHeartPath(ctx, x + size * 0.01, y + size * 0.01, size * 0.98);
        ctx.fill();
        break;
      }
      case 'hexagon': {
        const hR = r * 1.02;
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const hx = cx + hR * Math.cos(angle);
          const hy = cy + hR * Math.sin(angle);
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'ring': {
        ctx.arc(cx, cy, r * 0.94, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'diamond_rounded': {
        const pad = size * 0.08;
        const eff = size - pad * 2;
        this.roundRect(ctx, x + pad, y + pad, eff, eff, eff * 0.38);
        ctx.fill();
        break;
      }
      case 'cross': {
        ctx.arc(cx, cy, r * 0.88, 0, Math.PI * 2);
        ctx.fill();
        const w = size * 0.56;
        const o = (size - w) / 2;
        ctx.beginPath();
        this.roundRect(ctx, x + o, y + 0.2, w, size - 0.4, size * 0.1);
        ctx.fill();
        ctx.beginPath();
        this.roundRect(ctx, x + 0.2, y + o, size - 0.4, w, size * 0.1);
        ctx.fill();
        break;
      }
      case 'clover': {
        ctx.arc(cx, cy, r * 0.96, 0, Math.PI * 2);
        ctx.fill();
        const cr = r * 0.42;
        ctx.beginPath();
        ctx.arc(cx, cy - r * 0.35, cr, 0, Math.PI * 2);
        ctx.arc(cx + r * 0.35, cy, cr, 0, Math.PI * 2);
        ctx.arc(cx, cy + r * 0.35, cr, 0, Math.PI * 2);
        ctx.arc(cx - r * 0.35, cy, cr, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'sunburst': {
        require('./IconDrawer').prototype.drawStarPath(ctx, cx, cy, 8, r * 0.98, r * 0.65);
        ctx.fill();
        break;
      }
      case 'leaf_dot': {
        const pad = size * 0.02;
        const eff = size - pad * 2;
        this.roundRect(ctx, x + pad, y + pad, eff, eff, { tl: eff * 0.48, tr: 0, br: eff * 0.48, bl: 0 });
        ctx.fill();
        break;
      }
      case 'halftone': {
        ctx.arc(cx, cy, r * 0.93, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'shield_dot': {
        const pad = size * 0.07;
        const eff = size - pad * 2;
        this.roundRect(ctx, x + pad, y + pad, eff, eff, { tl: 2, tr: 2, br: eff * 0.5, bl: eff * 0.5 });
        ctx.fill();
        break;
      }
      case 'flower': {
        ctx.arc(cx, cy, r * 0.92, 0, Math.PI * 2);
        ctx.fill();
        const pr = r * 0.46;
        for (let a = 0; a < 4; a++) {
          const ang = (Math.PI / 2) * a + Math.PI / 4;
          ctx.beginPath();
          ctx.arc(cx + r * 0.52 * Math.cos(ang), cy + r * 0.52 * Math.sin(ang), pr, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'diagonal_lines': {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.PI / 4);
        this.roundRect(ctx, -r * 0.94, -r * 0.62, r * 1.88, r * 1.24, r * 0.25);
        ctx.fill();
        ctx.restore();
        break;
      }
      case 'radial_drop': {
        const pad = size * 0.07;
        const eff = size - pad * 2;
        const dropR = eff * 0.48;
        this.roundRect(ctx, x + pad, y + pad, eff, eff, { tl: dropR, tr: 0, br: dropR, bl: dropR });
        ctx.fill();
        break;
      }
      case 'bubble': {
        ctx.arc(cx, cy, r * 0.93, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'pixel': {
        const pad = size * 0.06;
        this.roundRect(ctx, x + pad, y + pad, size - pad * 2, size - pad * 2, 1);
        ctx.fill();
        break;
      }
      case 'square':
      default: {
        const pad = size * 0.05;
        ctx.fillRect(x + pad, y + pad, size - pad * 2, size - pad * 2);
        break;
      }
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