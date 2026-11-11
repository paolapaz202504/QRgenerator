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
    const r = (size / 2) * 0.90;
    const pad = size * 0.08;
    const eff = size - pad * 2;

    ctx.beginPath();
    switch (style) {
      case 'dots':
      case 'halftone':
      case 'bubble':
      case 'ring': {
        ctx.arc(cx, cy, (size / 2) * 0.92, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'rounded': {
        this.roundRect(ctx, x + pad, y + pad, eff, eff, eff * 0.28);
        ctx.fill();
        break;
      }
      case 'smooth': {
        this.roundRect(ctx, x + pad, y + pad, eff, eff, eff * 0.44);
        ctx.fill();
        break;
      }
      case 'square':
      case 'pixel': {
        ctx.fillRect(x + pad, y + pad, eff, eff);
        break;
      }
      case 'diamond': {
        const cut = eff * 0.24;
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
      case 'diamond_rounded': {
        this.roundRect(ctx, x + pad, y + pad, eff, eff, eff * 0.36);
        ctx.fill();
        break;
      }
      case 'star': {
        ctx.arc(cx, cy, (size / 2) * 0.86, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        require('./IconDrawer').prototype.drawStarPath(ctx, cx, cy, 8, (size / 2) * 0.95, (size / 2) * 0.65);
        ctx.fill();
        break;
      }
      case 'sparkle': {
        ctx.arc(cx, cy, (size / 2) * 0.88, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        require('./IconDrawer').prototype.drawStarPath(ctx, cx, cy, 4, (size / 2) * 0.96, (size / 2) * 0.60);
        ctx.fill();
        break;
      }
      case 'heart': {
        ctx.arc(cx, cy, (size / 2) * 0.89, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        require('./IconDrawer').prototype.drawHeartPath(ctx, x + pad, y + pad, eff);
        ctx.fill();
        break;
      }
      case 'hexagon': {
        ctx.arc(cx, cy, (size / 2) * 0.88, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        const hR = (size / 2) * 0.93;
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
      case 'cross': {
        ctx.arc(cx, cy, (size / 2) * 0.88, 0, Math.PI * 2);
        ctx.fill();
        const barW = eff * 0.64;
        const barO = (size - barW) / 2;
        ctx.beginPath();
        this.roundRect(ctx, x + barO, y + pad, barW, eff, barW * 0.20);
        ctx.fill();
        ctx.beginPath();
        this.roundRect(ctx, x + pad, y + barO, eff, barW, barW * 0.20);
        ctx.fill();
        break;
      }
      case 'clover': {
        ctx.arc(cx, cy, (size / 2) * 0.88, 0, Math.PI * 2);
        ctx.fill();
        const cr = (size / 2) * 0.44;
        const cDist = (size / 2) * 0.38;
        ctx.beginPath();
        ctx.arc(cx, cy - cDist, cr, 0, Math.PI * 2);
        ctx.arc(cx + cDist, cy, cr, 0, Math.PI * 2);
        ctx.arc(cx, cy + cDist, cr, 0, Math.PI * 2);
        ctx.arc(cx - cDist, cy, cr, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'sunburst': {
        ctx.arc(cx, cy, (size / 2) * 0.86, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        require('./IconDrawer').prototype.drawStarPath(ctx, cx, cy, 8, (size / 2) * 0.95, (size / 2) * 0.65);
        ctx.fill();
        break;
      }
      case 'leaf_dot': {
        this.roundRect(ctx, x + pad, y + pad, eff, eff, { tl: eff * 0.45, tr: eff * 0.15, br: eff * 0.45, bl: eff * 0.15 });
        ctx.fill();
        break;
      }
      case 'shield_dot': {
        this.roundRect(ctx, x + pad, y + pad, eff, eff, { tl: eff * 0.20, tr: eff * 0.20, br: eff * 0.45, bl: eff * 0.45 });
        ctx.fill();
        break;
      }
      case 'flower': {
        ctx.arc(cx, cy, (size / 2) * 0.86, 0, Math.PI * 2);
        ctx.fill();
        const fr = (size / 2) * 0.44;
        const fDist = (size / 2) * 0.38;
        for (let a = 0; a < 4; a++) {
          const ang = (Math.PI / 2) * a + Math.PI / 4;
          ctx.beginPath();
          ctx.arc(cx + fDist * Math.cos(ang), cy + fDist * Math.sin(ang), fr, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'radial_drop': {
        const dropR = eff * 0.45;
        this.roundRect(ctx, x + pad, y + pad, eff, eff, { tl: dropR, tr: eff * 0.15, br: dropR, bl: dropR });
        ctx.fill();
        break;
      }
      case 'diagonal_lines': {
        ctx.arc(cx, cy, (size / 2) * 0.88, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.PI / 4);
        this.roundRect(ctx, -r * 0.75, -r * 0.50, r * 1.50, r * 1.0, r * 0.25);
        ctx.fill();
        ctx.restore();
        break;
      }
      case 'square':
      default: {
        ctx.fillRect(x + pad, y + pad, eff, eff);
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