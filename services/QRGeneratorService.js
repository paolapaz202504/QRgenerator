const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const gcsService = require('./GCSService');
const userRepository = require('../repositories/UserRepository');
const historyRepository = require('../repositories/HistoryRepository');
const statsRepository = require('../repositories/StatsRepository');

class QRGeneratorService {
  constructor() {
    this.categories = [
      'Institucional', 'Compras', 'Entretenimiento', 'Belleza', 'Deportes',
      'Comunidad', 'Gastronomía', 'Tecnología', 'Salud', 'Viajes',
      'Inmobiliaria', 'Educación', 'Eventos', 'Redes Sociales', 'Lujo'
    ];

    this.patterns = [
      { id: 'square', name: 'Cuadrado Clásico', icon: 'fa-square' },
      { id: 'rounded', name: 'Módulo Redondeado', icon: 'fa-square-minus' },
      { id: 'dots', name: 'Círculos / Puntos', icon: 'fa-circle' },
      { id: 'smooth', name: 'Módulo Fluido', icon: 'fa-cubes' },
      { id: 'diamond', name: 'Diamante / Rombo', icon: 'fa-gem' },
      { id: 'star', name: 'Estrellas', icon: 'fa-star' },
      { id: 'sparkle', name: 'Destellos', icon: 'fa-wand-magic-sparkles' },
      { id: 'heart', name: 'Corazones', icon: 'fa-heart' },
      { id: 'hexagon', name: 'Hexágonos / Panal', icon: 'fa-shapes' },
      { id: 'ring', name: 'Anillos Concentricos', icon: 'fa-bullseye' }
    ];

    this.designs = this.generate150Designs();
  }

  getCategories() {
    return this.categories;
  }

  getDesigns() {
    return this.designs;
  }

  getPatterns() {
    return this.patterns;
  }

  generate150Designs() {
    const designs = [];
    const categoryPresets = {
      'Institucional': [
        { name: 'Corporativo Cobalto', bg: '#ffffff', qr: '#1e3a8a', frame: '#1e3a8a', icon: 'fa-building', fontT: 'Montserrat', fontB: 'Montserrat', banner: 'PORTAL OFICIAL', dot: 'square', eye: 'square' },
        { name: 'Ejecutivo Slate', bg: '#f8fafc', qr: '#0f172a', frame: '#334155', icon: 'fa-briefcase', fontT: 'Cinzel', fontB: 'Outfit', banner: 'INFORME 2026', dot: 'rounded', eye: 'rounded' },
        { name: 'Gobierno & Transparencia', bg: '#f0f9ff', qr: '#0369a1', frame: '#0284c7', icon: 'fa-shield-halved', fontT: 'Lora', fontB: 'Plus Jakarta Sans', banner: 'TRANSPARENCIA', dot: 'smooth', eye: 'square' },
        { name: 'Banca Emerald', bg: '#ecfdf5', qr: '#065f46', frame: '#059669', icon: 'fa-lock', fontT: 'Plus Jakarta Sans', fontB: 'Poppins', banner: 'ACCESO SEGURO', dot: 'diamond', eye: 'circle' },
        { name: 'Sede Central Onyx', bg: '#0f172a', qr: '#38bdf8', frame: '#38bdf8', icon: 'fa-globe', fontT: 'Outfit', fontB: 'Space Grotesk', banner: 'RED GLOBAL', dot: 'dots', eye: 'circle' },
        { name: 'Garantía & Sello', bg: '#fffbebf', qr: '#78350f', frame: '#d97706', icon: 'fa-key', fontT: 'Playfair Display', fontB: 'Lora', banner: 'CERTIFICADO', dot: 'hexagon', eye: 'rounded' },
        { name: 'Atención al Ciudadano', bg: '#fdf4ff', qr: '#701a75', frame: '#c026d3', icon: 'fa-circle-info', fontT: 'Poppins', fontB: 'Comfortaa', banner: 'INFO CIUDADANA', dot: 'ring', eye: 'rounded' },
        { name: 'Directorio Empresarial', bg: '#ffffff', qr: '#111827', frame: '#4b5563', icon: 'fa-user', fontT: 'Roboto', fontB: 'Montserrat', banner: 'DIRECTORIO', dot: 'square', eye: 'square' },
        { name: 'Sello Digital', bg: '#ecfeff', qr: '#155e75', frame: '#0891b2', icon: 'fa-qrcode', fontT: 'Cinzel', fontB: 'Outfit', banner: 'VERSIÓN DIGITAL', dot: 'sparkle', eye: 'circle' },
        { name: 'Sede Regional', bg: '#f7fee7', qr: '#365314', frame: '#65a30d', icon: 'fa-location-dot', fontT: 'Montserrat', fontB: 'Plus Jakarta Sans', banner: 'UBICACIÓN SEDE', dot: 'star', eye: 'rounded' }
      ],
      'Compras': [
        { name: 'Mega Descuento 50%', bg: '#ffffff', qr: '#dc2626', frame: '#dc2626', icon: 'fa-tag', fontT: 'Bebas Neue', fontB: 'Bebas Neue', banner: 'OFERTA 50% OFF', dot: 'dots', eye: 'rounded' },
        { name: 'Boutique Online', bg: '#fff7ed', qr: '#ea580c', frame: '#f97316', icon: 'fa-cart-shopping', fontT: 'Montserrat', fontB: 'Poppins', banner: 'COMPRAR AHORA', dot: 'rounded', eye: 'rounded' },
        { name: 'Tienda Regalos', bg: '#fdf2f8', qr: '#db2777', frame: '#ec4899', icon: 'fa-gift', fontT: 'Pacifico', fontB: 'Poppins', banner: 'REGALO ESPECIAL', dot: 'heart', eye: 'circle' },
        { name: 'Super Flash Sale', bg: '#18181b', qr: '#facc15', frame: '#facc15', icon: 'fa-bolt', fontT: 'Anton', fontB: 'Righteous', banner: 'FLASH SALE 24H', dot: 'sparkle', eye: 'square' },
        { name: 'Supermercado Fresh', bg: '#f0fdf4', qr: '#166534', frame: '#22c55e', icon: 'fa-store', fontT: 'Outfit', fontB: 'Comfortaa', banner: 'VER CATÁLOGO', dot: 'smooth', eye: 'circle' },
        { name: 'Joyería Gold', bg: '#0f172a', qr: '#fbbf24', frame: '#fbbf24', icon: 'fa-gem', fontT: 'Cinzel', fontB: 'Playfair Display', banner: 'COLECCIÓN LUXE', dot: 'diamond', eye: 'square' },
        { name: 'Cupón VIP', bg: '#faf5ff', qr: '#7e22ce', frame: '#a855f7', icon: 'fa-ticket', fontT: 'Righteous', fontB: 'Poppins', banner: 'CUPÓN DESCUENTO', dot: 'hexagon', eye: 'rounded' },
        { name: 'Cyber Sale Neon', bg: '#09090b', qr: '#06b6d4', frame: '#06b6d4', icon: 'fa-qrcode', fontT: 'Space Grotesk', fontB: 'Fira Code', banner: 'CYBER MONDAY', dot: 'dots', eye: 'circle' },
        { name: 'Calzado & Moda', bg: '#fff1f2', qr: '#e11d48', frame: '#f43f5e', icon: 'fa-thumbs-up', fontT: 'Abril Fatface', fontB: 'Outfit', banner: 'NUEVA COLECCIÓN', dot: 'star', eye: 'rounded' },
        { name: 'Puntos & Rewards', bg: '#eff6ff', qr: '#1d4ed8', frame: '#3b82f6', icon: 'fa-star', fontT: 'Poppins', fontB: 'Roboto', banner: 'CANJEAR PUNTOS', dot: 'ring', eye: 'circle' }
      ],
      'Entretenimiento': [
        { name: 'Cine & Premier 4K', bg: '#09090b', qr: '#e11d48', frame: '#f43f5e', icon: 'fa-film', fontT: 'Bebas Neue', fontB: 'Bebas Neue', banner: 'VER TRÁILER 4K', dot: 'dots', eye: 'square' },
        { name: 'Gaming Arcade Pro', bg: '#09090b', qr: '#10b981', frame: '#10b981', icon: 'fa-gamepad', fontT: 'Press Start 2P', fontB: 'Press Start 2P', banner: 'JUGAR AHORA', dot: 'square', eye: 'square' },
        { name: 'Entradas Concierto', bg: '#2e1065', qr: '#c026d3', frame: '#e879f9', icon: 'fa-ticket', fontT: 'Righteous', fontB: 'Bebas Neue', banner: 'TICKET ENTRADA', dot: 'hexagon', eye: 'rounded' },
        { name: 'Música & Spotify', bg: '#052e16', qr: '#22c55e', frame: '#22c55e', icon: 'fa-music', fontT: 'Outfit', fontB: 'Space Grotesk', banner: 'ESCUCHAR ÁLBUM', dot: 'smooth', eye: 'circle' },
        { name: 'Streaming Live', bg: '#1e1b4b', qr: '#6366f1', frame: '#818cf8', icon: 'fa-fire', fontT: 'Anton', fontB: 'Righteous', banner: 'EN VIVO AHORA', dot: 'sparkle', eye: 'circle' },
        { name: 'Fotografía Studio', bg: '#18181b', qr: '#f43f5e', frame: '#ffffff', icon: 'fa-camera', fontT: 'Playfair Display', fontB: 'Outfit', banner: 'VER GALERÍA', dot: 'rounded', eye: 'rounded' },
        { name: 'Show de Comedia', bg: '#fffbebf', qr: '#d97706', frame: '#f59e0b', icon: 'fa-comments', fontT: 'Lobster', fontB: 'Caveat', banner: 'RISA & SHOW', dot: 'dots', eye: 'circle' },
        { name: 'Festival Summer', bg: '#0c4a6e', qr: '#38bdf8', frame: '#38bdf8', icon: 'fa-sun', fontT: 'Pacifico', fontB: 'Montserrat', banner: 'SUMMER FEST', dot: 'star', eye: 'rounded' },
        { name: 'Night Club Disco', bg: '#4c0519', qr: '#fb7185', frame: '#fda4af', icon: 'fa-bolt', fontT: 'Monoton', fontB: 'Bebas Neue', banner: 'NIGHT PARTY VIP', dot: 'ring', eye: 'circle' },
        { name: 'Fan Club & Estrenos', bg: '#1c1917', qr: '#f97316', frame: '#fb923c', icon: 'fa-star', fontT: 'Poppins', fontB: 'Outfit', banner: 'UNIRSE AL CLUB', dot: 'diamond', eye: 'square' }
      ],
      'Belleza': [
        { name: 'Glamour Rose Gold', bg: '#fff1f2', qr: '#be123c', frame: '#fb7185', icon: 'fa-gem', fontT: 'Great Vibes', fontB: 'Satisfy', banner: 'RESERVAR CITA', dot: 'heart', eye: 'circle' },
        { name: 'Spa & Relax Zen', bg: '#f0fdf4', qr: '#15803d', frame: '#4ade80', icon: 'fa-sun', fontT: 'Lora', fontB: 'Comfortaa', banner: 'SPA & RELAX', dot: 'smooth', eye: 'rounded' },
        { name: 'Makeup Studio VIP', bg: '#fdf4ff', qr: '#a21caf', frame: '#e879f9', icon: 'fa-sparkle', fontT: 'Dancing Script', fontB: 'Poppins', banner: 'MAKEUP ARTIST', dot: 'sparkle', eye: 'circle' },
        { name: 'Lashes & Nails', bg: '#fff7ed', qr: '#c2410c', frame: '#fb923c', icon: 'fa-heart', fontT: 'Satisfy', fontB: 'Outfit', banner: 'LASHES & NAILS', dot: 'dots', eye: 'rounded' },
        { name: 'Cuidado Facial', bg: '#f0f9ff', qr: '#0369a1', frame: '#38bdf8', icon: 'fa-moon', fontT: 'Comfortaa', fontB: 'Plus Jakarta Sans', banner: 'SKINCARE PRO', dot: 'rounded', eye: 'circle' },
        { name: 'Salón de Peinados', bg: '#faf5ff', qr: '#6b21a8', frame: '#c026d3', icon: 'fa-user', fontT: 'Playfair Display', fontB: 'Lora', banner: 'HAIR STYLIST', dot: 'ring', eye: 'rounded' },
        { name: 'Cosmética Natural', bg: '#f7fee7', qr: '#4d7c0f', frame: '#a3e635', icon: 'fa-gift', fontT: 'Caveat', fontB: 'Poppins', banner: '100% NATURAL', dot: 'hexagon', eye: 'rounded' },
        { name: 'Centro Estético', bg: '#ffffff', qr: '#0f172a', frame: '#ec4899', icon: 'fa-star', fontT: 'Montserrat', fontB: 'Outfit', banner: 'TRATAMIENTOS', dot: 'diamond', eye: 'square' },
        { name: 'Promo Belleza 30%', bg: '#fff1f2', qr: '#9f1239', frame: '#f43f5e', icon: 'fa-ticket', fontT: 'Pacifico', fontB: 'Bebas Neue', banner: 'DESCUENTO 30%', dot: 'dots', eye: 'circle' },
        { name: 'Perfumería Deluxe', bg: '#0f172a', qr: '#fef08a', frame: '#fde047', icon: 'fa-store', fontT: 'Cinzel', fontB: 'Playfair Display', banner: 'PERFUMERÍA LUXE', dot: 'star', eye: 'square' }
      ],
      'Deportes': [
        { name: 'Crossfit & Power', bg: '#09090b', qr: '#eab308', frame: '#eab308', icon: 'fa-bolt', fontT: 'Oswald', fontB: 'Bebas Neue', banner: 'POWER FITNESS', dot: 'square', eye: 'square' },
        { name: 'Gym Training Nitro', bg: '#052e16', qr: '#4ade80', frame: '#4ade80', icon: 'fa-trophy', fontT: 'Anton', fontB: 'Righteous', banner: 'UNIRSE AL GYM', dot: 'hexagon', eye: 'circle' },
        { name: 'Running & Maratón', bg: '#0c4a6e', qr: '#38bdf8', frame: '#38bdf8', icon: 'fa-fire', fontT: 'Bebas Neue', fontB: 'Outfit', banner: 'DESAFÍO 10K', dot: 'dots', eye: 'circle' },
        { name: 'Club de Fútbol', bg: '#1e3a8a', qr: '#ffffff', frame: '#facc15', icon: 'fa-flag', fontT: 'Montserrat', fontB: 'Oswald', banner: 'HAZTE SOCIO', dot: 'rounded', eye: 'square' },
        { name: 'Coach Personal', bg: '#18181b', qr: '#f97316', frame: '#f97316', icon: 'fa-user', fontT: 'Space Grotesk', fontB: 'Poppins', banner: 'COACH PERSONAL', dot: 'smooth', eye: 'rounded' },
        { name: 'Clase Gratis Pass', bg: '#fef2f2', qr: '#dc2626', frame: '#ef4444', icon: 'fa-ticket', fontT: 'Righteous', fontB: 'Bebas Neue', banner: 'CLASE GRATIS', dot: 'star', eye: 'circle' },
        { name: 'Nutrición Deportiva', bg: '#f0fdf4', qr: '#166534', frame: '#22c55e', icon: 'fa-heart', fontT: 'Poppins', fontB: 'Comfortaa', banner: 'PLAN NUTRICIÓN', dot: 'smooth', eye: 'rounded' },
        { name: 'Cancha de Pádel', bg: '#0f172a', qr: '#06b6d4', frame: '#06b6d4', icon: 'fa-location-dot', fontT: 'Outfit', fontB: 'Space Grotesk', banner: 'RESERVAR CANCHA', dot: 'diamond', eye: 'circle' },
        { name: 'Horario de Clases', bg: '#ffffff', qr: '#1e293b', frame: '#64748b', icon: 'fa-circle-info', fontT: 'Roboto', fontB: 'Plus Jakarta Sans', banner: 'VER HORARIOS', dot: 'square', eye: 'square' },
        { name: 'Shield Campeón', bg: '#451a03', qr: '#f59e0b', frame: '#f59e0b', icon: 'fa-shield', fontT: 'Oswald', fontB: 'Cinzel', banner: 'CAMPEONES 2026', dot: 'sparkle', eye: 'square' }
      ]
    };

    const frameStyles = ['top-banner', 'card-header', 'shield-badge', 'simple-border', 'pill-frame', 'gradient-border', 'neon-glow', 'ticket-dashed', 'vintage-border', 'dark-minimal'];

    this.categories.forEach(cat => {
      const list = categoryPresets[cat] || categoryPresets['Institucional'];
      list.forEach((preset, idx) => {
        const i = idx + 1;
        designs.push({
          id: `design-${cat.toLowerCase().replace(/[^a-z0-9]/g, '')}-${i}`,
          name: preset.name,
          category: cat,
          bgColor: preset.bg,
          qrColor: preset.qr,
          frameColor: preset.frame,
          textColor: preset.qr === '#ffffff' ? '#ffffff' : (preset.bg === '#09090b' || preset.bg === '#0f172a' || preset.bg === '#18181b' ? '#f8fafc' : preset.qr),
          badgeBg: preset.frame,
          badgeText: preset.bg === '#ffffff' || preset.bg === '#f8fafc' || preset.bg === '#f0f9ff' ? '#ffffff' : '#0f172a',
          iconColor: preset.qr === '#ffffff' ? preset.frame : preset.qr,
          iconBgColor: preset.bg === '#ffffff' ? '#ffffff' : (preset.bg.startsWith('#0') || preset.bg.startsWith('#1') || preset.bg.startsWith('#2') ? '#1e293b' : '#ffffff'),
          iconBorderColor: preset.frame,
          dotStyle: preset.dot,
          eyeStyle: preset.eye,
          frameStyle: frameStyles[(i - 1) % frameStyles.length],
          iconName: preset.icon,
          fontTitle: preset.fontT,
          fontBanner: preset.fontB,
          bannerText: preset.banner
        });
      });
    });

    return designs;
  }

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

  drawDotPattern(ctx, x, y, size, style, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size / 2;

    ctx.beginPath();
    switch (style) {
      case 'rounded':
        this.roundRect(ctx, x + 0.5, y + 0.5, size - 1, size - 1, size * 0.3);
        ctx.fill();
        break;
      case 'dots':
        ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'smooth':
        this.roundRect(ctx, x + 0.5, y + 0.5, size - 1, size - 1, size * 0.45);
        ctx.fill();
        break;
      case 'diamond':
        ctx.moveTo(cx, y + 1);
        ctx.lineTo(x + size - 1, cy);
        ctx.lineTo(cx, y + size - 1);
        ctx.lineTo(x + 1, cy);
        ctx.closePath();
        ctx.fill();
        break;
      case 'star':
        this.drawStarPath(ctx, cx, cy, 5, r * 0.9, r * 0.45);
        ctx.fill();
        break;
      case 'sparkle':
        this.drawStarPath(ctx, cx, cy, 4, r * 0.9, r * 0.3);
        ctx.fill();
        break;
      case 'heart':
        this.drawHeartPath(ctx, x + size * 0.1, y + size * 0.1, size * 0.8);
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
        break;
      case 'square':
      default:
        ctx.fillRect(x, y, size, size);
        break;
    }
  }

  drawStarPath(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }

  drawHeartPath(ctx, x, y, size) {
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x + size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + size, x + size / 2, y + size);
    ctx.bezierCurveTo(x + size / 2, y + size, x + size, y + (size + topCurveHeight) / 2, x + size, y + topCurveHeight);
    ctx.bezierCurveTo(x + size, y, x + size / 2, y, x + size / 2, y + topCurveHeight);
    ctx.closePath();
  }

  drawVectorIcon(ctx, iconName, cx, cy, size, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1.2, 1.0);
    ctx.translate(-cx, -cy);

    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, size / 10);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const name = (iconName || '').replace(/^fa-solid\s+|^fa-brands\s+|^fa-/, '').toLowerCase();

    ctx.beginPath();
    switch (name) {
      case 'heart':
        this.drawHeartPath(ctx, cx - size / 2, cy - size / 2, size);
        ctx.fill();
        break;
      case 'star':
        this.drawStarPath(ctx, cx, cy, 5, size / 2, size / 4);
        ctx.fill();
        break;
      case 'bolt':
        ctx.moveTo(cx + size * 0.1, cy - size * 0.45);
        ctx.lineTo(cx - size * 0.3, cy + size * 0.05);
        ctx.lineTo(cx - size * 0.05, cy + size * 0.05);
        ctx.lineTo(cx - size * 0.15, cy + size * 0.45);
        ctx.lineTo(cx + size * 0.3, cy - size * 0.05);
        ctx.lineTo(cx + size * 0.05, cy - size * 0.05);
        ctx.closePath();
        ctx.fill();
        break;
      case 'gem':
        ctx.moveTo(cx, cy - size * 0.45);
        ctx.lineTo(cx + size * 0.45, cy - size * 0.15);
        ctx.lineTo(cx, cy + size * 0.45);
        ctx.lineTo(cx - size * 0.45, cy - size * 0.15);
        ctx.closePath();
        ctx.fill();
        break;
      case 'lock':
        this.roundRect(ctx, cx - size * 0.35, cy - size * 0.1, size * 0.7, size * 0.55, size * 0.1);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy - size * 0.1, size * 0.22, Math.PI, 0);
        ctx.stroke();
        break;
      case 'envelope':
        this.roundRect(ctx, cx - size * 0.4, cy - size * 0.28, size * 0.8, size * 0.56, size * 0.08);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.4, cy - size * 0.28);
        ctx.lineTo(cx, cy + size * 0.02);
        ctx.lineTo(cx + size * 0.4, cy - size * 0.28);
        ctx.stroke();
        break;
      case 'user':
        ctx.arc(cx, cy - size * 0.18, size * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy + size * 0.4, size * 0.35, Math.PI, 0);
        ctx.fill();
        break;
      case 'globe':
        ctx.arc(cx, cy, size * 0.42, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.42, cy);
        ctx.lineTo(cx + size * 0.42, cy);
        ctx.moveTo(cx, cy - size * 0.42);
        ctx.lineTo(cx, cy + size * 0.42);
        ctx.stroke();
        break;
      case 'store':
        ctx.moveTo(cx - size * 0.45, cy - size * 0.15);
        ctx.lineTo(cx, cy - size * 0.4);
        ctx.lineTo(cx + size * 0.45, cy - size * 0.15);
        ctx.stroke();
        this.roundRect(ctx, cx - size * 0.38, cy - size * 0.15, size * 0.76, size * 0.55, 4);
        ctx.stroke();
        break;
      case 'wifi':
        ctx.arc(cx, cy + size * 0.3, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy + size * 0.3, size * 0.3, Math.PI * 1.25, Math.PI * 1.75);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy + size * 0.3, size * 0.5, Math.PI * 1.25, Math.PI * 1.75);
        ctx.stroke();
        break;
      case 'utensils':
        ctx.moveTo(cx - size * 0.2, cy - size * 0.4);
        ctx.lineTo(cx - size * 0.2, cy + size * 0.4);
        ctx.moveTo(cx - size * 0.3, cy - size * 0.4);
        ctx.lineTo(cx - size * 0.3, cy - size * 0.1);
        ctx.moveTo(cx - size * 0.1, cy - size * 0.4);
        ctx.lineTo(cx - size * 0.1, cy - size * 0.1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + size * 0.2, cy + size * 0.4);
        ctx.lineTo(cx + size * 0.2, cy - size * 0.4);
        ctx.quadraticCurveTo(cx + size * 0.4, cy - size * 0.2, cx + size * 0.2, cy - size * 0.05);
        ctx.fill();
        break;
      case 'car':
        this.roundRect(ctx, cx - size * 0.4, cy - size * 0.1, size * 0.8, size * 0.3, 4);
        ctx.fill();
        this.roundRect(ctx, cx - size * 0.25, cy - size * 0.3, size * 0.5, size * 0.22, 3);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - size * 0.22, cy + size * 0.2, size * 0.1, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.22, cy + size * 0.2, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'briefcase':
        this.roundRect(ctx, cx - size * 0.4, cy - size * 0.15, size * 0.8, size * 0.55, 4);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy - size * 0.15, size * 0.18, Math.PI, 0);
        ctx.stroke();
        break;
      case 'graduation-cap':
      case 'cap':
        ctx.moveTo(cx, cy - size * 0.4);
        ctx.lineTo(cx + size * 0.45, cy - size * 0.1);
        ctx.lineTo(cx, cy + size * 0.15);
        ctx.lineTo(cx - size * 0.45, cy - size * 0.1);
        ctx.closePath();
        ctx.fill();
        this.roundRect(ctx, cx - size * 0.2, cy + size * 0.1, size * 0.4, size * 0.25, 2);
        ctx.fill();
        break;
      case 'cart-shopping':
      case 'cart':
        ctx.moveTo(cx - size * 0.4, cy - size * 0.3);
        ctx.lineTo(cx - size * 0.25, cy - size * 0.3);
        ctx.lineTo(cx - size * 0.1, cy + size * 0.15);
        ctx.lineTo(cx + size * 0.35, cy + size * 0.15);
        ctx.lineTo(cx + size * 0.4, cy - size * 0.2);
        ctx.lineTo(cx - size * 0.2, cy - size * 0.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx - size * 0.05, cy + size * 0.32, size * 0.08, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.28, cy + size * 0.32, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'phone':
        this.roundRect(ctx, cx - size * 0.25, cy - size * 0.42, size * 0.5, size * 0.84, size * 0.08);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy + size * 0.3, size * 0.05, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'gift':
        this.roundRect(ctx, cx - size * 0.38, cy - size * 0.1, size * 0.76, size * 0.5, 3);
        ctx.fill();
        this.roundRect(ctx, cx - size * 0.42, cy - size * 0.25, size * 0.84, size * 0.16, 2);
        ctx.fill();
        ctx.strokeRect(cx - size * 0.06, cy - size * 0.25, size * 0.12, size * 0.65);
        break;
      case 'camera':
        this.roundRect(ctx, cx - size * 0.4, cy - size * 0.15, size * 0.8, size * 0.55, 5);
        ctx.fill();
        this.roundRect(ctx, cx - size * 0.18, cy - size * 0.32, size * 0.36, size * 0.18, 3);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy + size * 0.12, size * 0.16, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'gamepad':
        this.roundRect(ctx, cx - size * 0.42, cy - size * 0.22, size * 0.84, size * 0.44, size * 0.18);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - size * 0.28, cy - size * 0.06, size * 0.14, size * 0.12);
        ctx.fillRect(cx - size * 0.23, cy - size * 0.12, size * 0.06, size * 0.24);
        ctx.beginPath();
        ctx.arc(cx + size * 0.25, cy - size * 0.05, size * 0.05, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.15, cy + size * 0.02, size * 0.05, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'hospital':
        this.roundRect(ctx, cx - size * 0.35, cy - size * 0.4, size * 0.7, size * 0.8, 4);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - size * 0.18, cy - size * 0.08, size * 0.36, size * 0.1);
        ctx.fillRect(cx - size * 0.05, cy - size * 0.21, size * 0.1, size * 0.36);
        break;
      case 'trophy':
        ctx.moveTo(cx - size * 0.3, cy - size * 0.4);
        ctx.lineTo(cx + size * 0.3, cy - size * 0.4);
        ctx.lineTo(cx + size * 0.2, cy + size * 0.1);
        ctx.lineTo(cx - size * 0.2, cy + size * 0.1);
        ctx.closePath();
        ctx.fill();
        this.roundRect(ctx, cx - size * 0.25, cy + size * 0.25, size * 0.5, size * 0.15, 3);
        ctx.fill();
        break;
      case 'sun':
        ctx.arc(cx, cy, size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 8; i++) {
          const ang = (Math.PI / 4) * i;
          ctx.beginPath();
          ctx.moveTo(cx + size * 0.32 * Math.cos(ang), cy + size * 0.32 * Math.sin(ang));
          ctx.lineTo(cx + size * 0.46 * Math.cos(ang), cy + size * 0.46 * Math.sin(ang));
          ctx.stroke();
        }
        break;
      case 'moon':
        ctx.arc(cx, cy, size * 0.4, Math.PI * 0.3, Math.PI * 1.7);
        ctx.fill();
        break;
      case 'plane':
        ctx.moveTo(cx, cy - size * 0.45);
        ctx.lineTo(cx + size * 0.45, cy + size * 0.2);
        ctx.lineTo(cx + size * 0.1, cy + size * 0.1);
        ctx.lineTo(cx, cy + size * 0.45);
        ctx.lineTo(cx - size * 0.1, cy + size * 0.1);
        ctx.lineTo(cx - size * 0.45, cy + size * 0.2);
        ctx.closePath();
        ctx.fill();
        break;
      case 'fire':
        ctx.moveTo(cx, cy - size * 0.45);
        ctx.bezierCurveTo(cx + size * 0.4, cy - size * 0.1, cx + size * 0.4, cy + size * 0.4, cx, cy + size * 0.45);
        ctx.bezierCurveTo(cx - size * 0.4, cy + size * 0.4, cx - size * 0.4, cy - size * 0.1, cx, cy - size * 0.45);
        ctx.fill();
        break;
      case 'shield-halved':
      case 'shield':
        ctx.moveTo(cx, cy - size * 0.45);
        ctx.lineTo(cx + size * 0.4, cy - size * 0.3);
        ctx.lineTo(cx + size * 0.4, cy + size * 0.1);
        ctx.bezierCurveTo(cx + size * 0.4, cy + size * 0.4, cx, cy + size * 0.5, cx, cy + size * 0.5);
        ctx.bezierCurveTo(cx, cy + size * 0.5, cx - size * 0.4, cy + size * 0.4, cx - size * 0.4, cy + size * 0.1);
        ctx.lineTo(cx - size * 0.4, cy - size * 0.3);
        ctx.closePath();
        ctx.fill();
        break;
      case 'music':
        ctx.arc(cx - size * 0.2, cy + size * 0.2, size * 0.12, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.2, cy + size * 0.1, size * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.08, cy + size * 0.2);
        ctx.lineTo(cx - size * 0.08, cy - size * 0.3);
        ctx.lineTo(cx + size * 0.32, cy - size * 0.4);
        ctx.lineTo(cx + size * 0.32, cy + size * 0.1);
        ctx.stroke();
        break;
      case 'film':
        this.roundRect(ctx, cx - size * 0.4, cy - size * 0.3, size * 0.8, size * 0.6, 4);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - size * 0.35, cy - size * 0.22, size * 0.1, size * 0.1);
        ctx.fillRect(cx - size * 0.35, cy + size * 0.12, size * 0.1, size * 0.1);
        ctx.fillRect(cx + size * 0.25, cy - size * 0.22, size * 0.1, size * 0.1);
        ctx.fillRect(cx + size * 0.25, cy + size * 0.12, size * 0.1, size * 0.1);
        break;
      case 'location-dot':
      case 'location':
      case 'pin':
        ctx.arc(cx, cy - size * 0.12, size * 0.3, Math.PI * 0.85, Math.PI * 0.15);
        ctx.lineTo(cx, cy + size * 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy - size * 0.12, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'building':
        this.roundRect(ctx, cx - size * 0.32, cy - size * 0.42, size * 0.64, size * 0.84, 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        for (let r = -3; r <= 1; r++) {
          ctx.fillRect(cx - size * 0.2, cy + r * size * 0.12, size * 0.1, size * 0.08);
          ctx.fillRect(cx + size * 0.1, cy + r * size * 0.12, size * 0.1, size * 0.08);
        }
        break;
      case 'cloud':
        ctx.arc(cx - size * 0.15, cy, size * 0.22, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.12, cy - size * 0.05, size * 0.26, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.28, cy + size * 0.1, size * 0.16, 0, Math.PI * 2);
        ctx.fill();
        this.roundRect(ctx, cx - size * 0.35, cy, size * 0.7, size * 0.22, 4);
        ctx.fill();
        break;
      case 'ticket':
        this.roundRect(ctx, cx - size * 0.42, cy - size * 0.25, size * 0.84, size * 0.5, 4);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - size * 0.42, cy, size * 0.1, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.42, cy, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'coffee':
        this.roundRect(ctx, cx - size * 0.3, cy - size * 0.15, size * 0.6, size * 0.5, 4);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + size * 0.3, cy + size * 0.05, size * 0.16, Math.PI * 1.5, Math.PI * 0.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.15, cy - size * 0.25);
        ctx.lineTo(cx - size * 0.15, cy - size * 0.38);
        ctx.moveTo(cx + size * 0.05, cy - size * 0.25);
        ctx.lineTo(cx + size * 0.05, cy - size * 0.38);
        ctx.stroke();
        break;
      case 'bell':
        ctx.arc(cx, cy - size * 0.05, size * 0.3, Math.PI, 0);
        ctx.lineTo(cx + size * 0.38, cy + size * 0.2);
        ctx.lineTo(cx - size * 0.38, cy + size * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy + size * 0.28, size * 0.09, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'thumbs-up':
        this.roundRect(ctx, cx - size * 0.38, cy - size * 0.05, size * 0.18, size * 0.45, 3);
        ctx.fill();
        this.roundRect(ctx, cx - size * 0.15, cy - size * 0.05, size * 0.5, size * 0.45, 4);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.12, cy - size * 0.05);
        ctx.lineTo(cx + size * 0.05, cy - size * 0.4);
        ctx.lineTo(cx + size * 0.18, cy - size * 0.4);
        ctx.lineTo(cx + size * 0.12, cy - size * 0.05);
        ctx.closePath();
        ctx.fill();
        break;
      case 'circle-info':
      case 'info':
        ctx.arc(cx, cy, size * 0.42, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy - size * 0.18, size * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx - size * 0.05, cy - size * 0.05, size * 0.1, size * 0.28);
        break;
      case 'laptop':
        this.roundRect(ctx, cx - size * 0.32, cy - size * 0.32, size * 0.64, size * 0.44, 4);
        ctx.fill();
        this.roundRect(ctx, cx - size * 0.44, cy + size * 0.15, size * 0.88, size * 0.1, 3);
        ctx.fill();
        break;
      case 'key':
        ctx.arc(cx - size * 0.18, cy - size * 0.15, size * 0.18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.02, cy - size * 0.02);
        ctx.lineTo(cx + size * 0.35, cy + size * 0.35);
        ctx.lineTo(cx + size * 0.25, cy + size * 0.42);
        ctx.stroke();
        break;
      case 'comments':
      case 'comment':
        this.roundRect(ctx, cx - size * 0.38, cy - size * 0.35, size * 0.76, size * 0.5, 6);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.15, cy + size * 0.15);
        ctx.lineTo(cx - size * 0.3, cy + size * 0.38);
        ctx.lineTo(cx - size * 0.05, cy + size * 0.15);
        ctx.closePath();
        ctx.fill();
        break;
      case 'tag':
        ctx.moveTo(cx - size * 0.35, cy - size * 0.1);
        ctx.lineTo(cx, cy - size * 0.45);
        ctx.lineTo(cx + size * 0.4, cy - size * 0.05);
        ctx.lineTo(cx + size * 0.05, cy + size * 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx + size * 0.15, cy - size * 0.2, size * 0.06, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'qrcode':
      default:
        this.roundRect(ctx, cx - size * 0.35, cy - size * 0.35, size * 0.3, size * 0.3, 3);
        ctx.fill();
        this.roundRect(ctx, cx + size * 0.05, cy - size * 0.35, size * 0.3, size * 0.3, 3);
        ctx.fill();
        this.roundRect(ctx, cx - size * 0.35, cy + size * 0.05, size * 0.3, size * 0.3, 3);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + size * 0.2, cy + size * 0.2, size * 0.12, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
    ctx.restore();
  }

  drawEye(ctx, x, y, size, style, color) {
    ctx.fillStyle = color;
    if (style === 'circle') {
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === 'rounded') {
      this.roundRect(ctx, x, y, size, size, size * 0.3);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, size, size);
    }
  }

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

    ctx.lineWidth = 4 * scale;
    ctx.strokeStyle = colors.frameColor;
    this.roundRect(ctx, cardX, cardY, cardW, cardH, 24 * scale);
    ctx.stroke();

    const displayBannerText = bannerText || 'SCAN ME';
    const isHeaderStyle = (style === 'top-banner' || style === 'shield-badge' || style === 'card-header');
    const titleFontStack = this.getFontStack(fontTitle);
    const bannerFontStack = this.getFontStack(fontBanner);

    if (isHeaderStyle) {
      if (style === 'card-header') {
        ctx.fillStyle = colors.frameColor;
        this.roundRect(ctx, cardX, cardY, cardW, 85 * scale, { tl: 24 * scale, tr: 24 * scale, br: 0, bl: 0 });
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

        ctx.fillStyle = colors.badgeBg;
        this.roundRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2);
        ctx.fill();

        ctx.fillStyle = colors.badgeText;
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
    const baseTitleY = 575 * scale;
    const startY = baseTitleY - ((lines.length - 1) * lineHeight) / 2;

    const iconSizeCalc = (iconOpts.iconSize || 34) * scale;

    if (iconOpts.showIcon && iconOpts.iconPosition && iconOpts.iconPosition !== 'center') {
      const iconColor = iconOpts.iconColor || colors.textColor;

      if (iconOpts.iconPosition === 'left') {
        let maxLineW = 0;
        lines.forEach(line => {
          const lw = ctx.measureText(line).width;
          if (lw > maxLineW) maxLineW = lw;
        });
        this.drawVectorIcon(ctx, iconOpts.iconName, (w - maxLineW) / 2 - (28 * scale), baseTitleY, iconSizeCalc * 0.8, iconColor);
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
        this.drawVectorIcon(ctx, iconOpts.iconName, (w + maxLineW) / 2 + (28 * scale), baseTitleY, iconSizeCalc * 0.8, iconColor);
        lines.forEach((line, idx) => {
          const lineY = startY + idx * lineHeight;
          ctx.fillText(line, titleX - (14 * scale), lineY);
        });
      } else if (iconOpts.iconPosition === 'above') {
        this.drawVectorIcon(ctx, iconOpts.iconName, w / 2, startY - (30 * scale), iconSizeCalc * 0.85, iconColor);
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
        this.drawVectorIcon(ctx, iconOpts.iconName, w / 2, lastLineY + (28 * scale), iconSizeCalc * 0.85, iconColor);
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
      const subY = 635 * scale;

      ctx.fillStyle = colors.badgeBg;
      this.roundRect(ctx, subX, subY, subW, subH, 20 * scale);
      ctx.fill();

      ctx.fillStyle = colors.badgeText;
      ctx.font = `bold ${Math.round(16 * scale)}px ${bannerFontStack}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayBannerText, w / 2, subY + subH / 2 + (1 * scale));
    }

    ctx.restore();
  }

  async generateCanvas(params) {
    const {
      url = 'https://qrfy.com',
      title = 'Mi Código QR',
      bannerText = 'ESCANÉAME',
      designId = 'design-institucional-1',
      customColors = {},
      customDotStyle,
      customEyeStyle,
      targetWidth = 600,
      fontTitle = 'sans-serif',
      fontBanner = 'sans-serif',
      fontSizeTitle = 24,
      showIcon = true,
      showShield = true,
      iconMode = 'icon',
      iconName = 'fa-qrcode',
      iconPosition = 'center',
      iconColor = '#2563eb',
      iconBgColor = '#ffffff',
      iconBorderColor = '#2563eb',
      iconSize = 34,
      customLogoDataUrl = null,
      userEmail = null
    } = params;

    await statsRepository.incrementGenerations();

    if (userEmail) {
      const emailKey = userEmail.toLowerCase().trim();
      const user = userRepository.findByEmail(emailKey);
      if (user) {
        user.generationsCount = (user.generationsCount || 0) + 1;
        await userRepository.saveUser(user);
      }
    }

    const design = this.designs.find(d => d.id === designId) || this.designs[0];

    const bgColor = customColors.bgColor || design.bgColor;
    const qrColor = customColors.qrColor || design.qrColor;
    const frameColor = customColors.frameColor || design.frameColor;
    const textColor = customColors.textColor || design.textColor;
    const badgeBg = customColors.badgeBg || design.badgeBg;
    const badgeText = customColors.badgeText || design.badgeText;

    const activeBannerText = (bannerText !== undefined && bannerText !== null && bannerText !== '') 
      ? String(bannerText) 
      : (design.bannerText || 'SCAN ME');

    const dotStyle = customDotStyle || design.dotStyle || 'square';
    const eyeStyle = customEyeStyle || design.eyeStyle || 'square';

    const qrData = QRCode.create(url, { errorCorrectionLevel: 'H' });
    const modules = qrData.modules;
    const size = modules.size;

    const baseW = 600;
    const baseH = 760;
    const scale = targetWidth / baseW;

    const canvasWidth = targetWidth;
    const canvasHeight = Math.round(baseH * scale);
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    this.drawFrame(ctx, design.frameStyle, canvasWidth, canvasHeight, title, activeBannerText, {
      frameColor,
      textColor,
      badgeBg,
      badgeText,
      bgColor
    }, scale, fontTitle, fontBanner, {
      fontSizeTitle,
      showIcon,
      iconMode,
      iconName,
      iconPosition,
      iconColor,
      iconSize,
      customLogoDataUrl
    });

    const qrAreaSize = 340 * scale;
    const qrX = (canvasWidth - qrAreaSize) / 2;
    const qrY = 175 * scale;

    ctx.fillStyle = '#ffffff';
    this.roundRect(ctx, qrX - (16 * scale), qrY - (16 * scale), qrAreaSize + (32 * scale), qrAreaSize + (32 * scale), 18 * scale);
    ctx.fill();

    const cellSize = qrAreaSize / size;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (modules.get(r, c)) {
          const isTopLeftEye = (r < 7 && c < 7);
          const isTopRightEye = (r < 7 && c >= size - 7);
          const isBottomLeftEye = (r >= size - 7 && c < 7);

          if (isTopLeftEye || isTopRightEye || isBottomLeftEye) {
            continue;
          }

          const cellX = qrX + c * cellSize;
          const cellY = qrY + r * cellSize;
          this.drawDotPattern(ctx, cellX, cellY, cellSize, dotStyle, qrColor);
        }
      }
    }

    const eyeSize = 7 * cellSize;
    const outerRadius = eyeSize;
    const innerSize = 3 * cellSize;
    const innerOffset = 2 * cellSize;

    const eyes = [
      { x: qrX, y: qrY },
      { x: qrX + (size - 7) * cellSize, y: qrY },
      { x: qrX, y: qrY + (size - 7) * cellSize }
    ];

    eyes.forEach(eye => {
      this.drawEye(ctx, eye.x, eye.y, outerRadius, eyeStyle, qrColor);
      ctx.fillStyle = '#ffffff';
      if (eyeStyle === 'circle') {
        ctx.beginPath();
        ctx.arc(eye.x + outerRadius / 2, eye.y + outerRadius / 2, (outerRadius - 2 * cellSize) / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (eyeStyle === 'rounded') {
        this.roundRect(ctx, eye.x + cellSize, eye.y + cellSize, outerRadius - 2 * cellSize, outerRadius - 2 * cellSize, (outerRadius - 2 * cellSize) * 0.25);
        ctx.fill();
      } else {
        ctx.fillRect(eye.x + cellSize, eye.y + cellSize, outerRadius - 2 * cellSize, outerRadius - 2 * cellSize);
      }
      this.drawEye(ctx, eye.x + innerOffset, eye.y + innerOffset, innerSize, eyeStyle, qrColor);
    });

    if (showIcon && iconPosition === 'center') {
      const centerBoxSize = (iconSize || 34) * 2.2 * scale;
      const centerBoxX = qrX + (qrAreaSize - centerBoxSize) / 2;
      const centerBoxY = qrY + (qrAreaSize - centerBoxSize) / 2;

      ctx.fillStyle = iconBgColor || '#ffffff';
      this.roundRect(ctx, centerBoxX, centerBoxY, centerBoxSize, centerBoxSize, 12 * scale);
      ctx.fill();

      if (showShield) {
        ctx.strokeStyle = iconBorderColor || qrColor;
        ctx.lineWidth = 3 * scale;
        this.roundRect(ctx, centerBoxX, centerBoxY, centerBoxSize, centerBoxSize, 12 * scale);
        ctx.stroke();
      }

      if (iconMode === 'image' && customLogoDataUrl) {
        try {
          const img = await loadImage(customLogoDataUrl);
          const imgSize = centerBoxSize * 0.75;
          ctx.drawImage(img, centerBoxX + (centerBoxSize - imgSize) / 2, centerBoxY + (centerBoxSize - imgSize) / 2, imgSize, imgSize);
        } catch (err) {
          this.drawVectorIcon(ctx, iconName, centerBoxX + centerBoxSize / 2, centerBoxY + centerBoxSize / 2, centerBoxSize * 0.55, iconColor || qrColor);
        }
      } else {
        this.drawVectorIcon(ctx, iconName, centerBoxX + centerBoxSize / 2, centerBoxY + centerBoxSize / 2, centerBoxSize * 0.55, iconColor || qrColor);
      }
    }

    return canvas.toBuffer('image/png');
  }

  async trackDownload(params) {
    const { userEmail, title, url, format = 'png', resolution = 800, imageDataUrl } = params;

    if (!userEmail || userEmail.trim() === '' || userEmail.toLowerCase().includes('invitado@anonimo')) {
      return {
        success: false,
        authRequired: true,
        message: 'Para descargar tu código QR debes estar registrado.'
      };
    }

    const emailKey = userEmail.toLowerCase().trim();
    let user = userRepository.findByEmail(emailKey);

    if (!user) {
      user = {
        id: 'user_' + Date.now(),
        name: emailKey.split('@')[0],
        email: emailKey,
        provider: 'Registered',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(emailKey)}`,
        plan: 'free',
        maxDownloads: 20,
        generationsCount: 1,
        downloadsCount: 0,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      await userRepository.saveUser(user);
    }

    const maxLimit = user.maxDownloads || 20;
    const currentDownloads = user.downloadsCount || 0;

    if (user.plan === 'free' && currentDownloads >= maxLimit) {
      return {
        success: false,
        limitReached: true,
        message: `Has alcanzado el límite gratuito de ${maxLimit} descargas. ¡Apoya con una donación o pasa a Pro para descargas ilimitadas!`
      };
    }

    let savedImagePath = null;
    const qrId = 'qr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    if (imageDataUrl && imageDataUrl.startsWith('data:image')) {
      const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `${qrId}.${format === 'svg' ? 'svg' : 'png'}`;
      const contentType = format === 'svg' ? 'image/svg+xml' : 'image/png';
      
      savedImagePath = await gcsService.saveBufferToCloud(`Downloaded/${emailKey}/${fileName}`, buffer, contentType);
    }

    const historyEntry = {
      id: qrId,
      userEmail: emailKey,
      title: title || 'Código QR',
      url: url || 'https://qrfy.com',
      format,
      resolution,
      imagePath: savedImagePath,
      imageDataUrl: imageDataUrl,
      createdAt: new Date().toISOString()
    };

    await historyRepository.addHistoryEntry(emailKey, historyEntry);
    await statsRepository.incrementDownloads();

    user.downloadsCount = (user.downloadsCount || 0) + 1;
    await userRepository.saveUser(user);

    return {
      success: true,
      message: 'Descarga registrada y guardada exitosamente en la nube.',
      savedQr: historyEntry,
      userStats: {
        downloadsCount: user.downloadsCount,
        generationsCount: user.generationsCount || 1,
        maxDownloads: user.maxDownloads || 20,
        remainingDownloads: Math.max(0, (user.maxDownloads || 20) - user.downloadsCount),
        plan: user.plan || 'free'
      }
    };
  }
}

module.exports = new QRGeneratorService();
