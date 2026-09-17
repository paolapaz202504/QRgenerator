const express = require('express');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const gcsService = require('./gcsService');

const app = express();
const PORT = process.env.PORT || 3030;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// JSON Document Database Directories and Subfolders (usuario, history, downloaded)
const DATA_DIR = path.join(__dirname, 'data');
const USUARIO_DIR = path.join(DATA_DIR, 'usuario');
const HISTORY_DIR = path.join(DATA_DIR, 'history');
const DOWNLOADED_DIR = path.join(DATA_DIR, 'downloaded');

const USERS_FILE = path.join(USUARIO_DIR, 'users.json');
const HISTORY_FILE = path.join(HISTORY_DIR, 'qr_history.json');
const STATS_FILE = path.join(HISTORY_DIR, 'stats.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USUARIO_DIR)) fs.mkdirSync(USUARIO_DIR, { recursive: true });
if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR, { recursive: true });
if (!fs.existsSync(DOWNLOADED_DIR)) fs.mkdirSync(DOWNLOADED_DIR, { recursive: true });

async function initCloudSync() {
  if (gcsService.isConfigured()) {
    console.log(`[GCS Cloud Sync] Sincronizando datos iniciales desde Google Cloud Storage (${gcsService.getEnv().toUpperCase()})...`);
    await gcsService.downloadFromCloud('usuario/users.json', USERS_FILE);
    await gcsService.downloadFromCloud('history/qr_history.json', HISTORY_FILE);
    await gcsService.downloadFromCloud('history/stats.json', STATS_FILE);
  }
}
initCloudSync();

function readJsonFile(filePath, defaultValue) {
  try {
    if (!fs.existsSync(filePath)) {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

function writeJsonFile(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    const relativePath = path.relative(DATA_DIR, filePath).replace(/\\/g, '/');
    gcsService.uploadToCloud(filePath, relativePath);
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

app.use('/downloaded', express.static(DOWNLOADED_DIR));

// 15 Categories definition
const CATEGORIES = [
  'Institucional', 'Compras', 'Entretenimiento', 'Belleza', 'Deportes',
  'Comunidad', 'Gastronomía', 'Tecnología', 'Salud', 'Viajes',
  'Inmobiliaria', 'Educación', 'Eventos', 'Redes Sociales', 'Lujo'
];

const CATEGORY_PALETTES = {
  'Institucional': [
    { bg: '#ffffff', qr: '#1e3a8a', frame: '#1e3a8a', text: '#1e3a8a', badgeBg: '#1e3a8a', badgeText: '#ffffff' },
    { bg: '#f8fafc', qr: '#0f172a', frame: '#334155', text: '#0f172a', badgeBg: '#0f172a', badgeText: '#ffffff' },
    { bg: '#f0f9ff', qr: '#0369a1', frame: '#0284c7', text: '#0369a1', badgeBg: '#0284c7', badgeText: '#ffffff' }
  ],
  'Compras': [
    { bg: '#ffffff', qr: '#dc2626', frame: '#dc2626', text: '#991b1b', badgeBg: '#dc2626', badgeText: '#ffffff' },
    { bg: '#fff7ed', qr: '#ea580c', frame: '#f97316', text: '#9a3412', badgeBg: '#ea580c', badgeText: '#ffffff' }
  ]
};

function generate150Designs() {
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
    ],
    'Comunidad': [
      { name: 'Vecinos Unidos', bg: '#ffffff', qr: '#0284c7', frame: '#0284c7', icon: 'fa-building', fontT: 'Comfortaa', fontB: 'Plus Jakarta Sans', banner: 'FORO VECINAL', dot: 'rounded', eye: 'rounded' },
      { name: 'Voluntariado Social', bg: '#fdf2f8', qr: '#db2777', frame: '#ec4899', icon: 'fa-heart', fontT: 'Poppins', fontB: 'Caveat', banner: 'SUMATE HOY', dot: 'heart', eye: 'circle' },
      { name: 'Grupo Chat WhatsApp', bg: '#f0fdf4', qr: '#15803d', frame: '#22c55e', icon: 'fa-comments', fontT: 'Outfit', fontB: 'Poppins', banner: 'GRUPO DE CHAT', dot: 'dots', eye: 'circle' },
      { name: 'Asamblea & Votación', bg: '#f8fafc', qr: '#0f172a', frame: '#334155', icon: 'fa-user', fontT: 'Roboto', fontB: 'Montserrat', banner: 'PARTICIPA Y VOTA', dot: 'square', eye: 'square' },
      { name: 'Red Solidaria', bg: '#fff7ed', qr: '#ea580c', frame: '#f97316', icon: 'fa-globe', fontT: 'Caveat', fontB: 'Comfortaa', banner: 'AYUDA MUTUA', dot: 'smooth', eye: 'circle' },
      { name: 'Café Comunitario', bg: '#fffbebf', qr: '#78350f', frame: '#b45309', icon: 'fa-coffee', fontT: 'Pacifico', fontB: 'Lora', banner: 'REUNIÓN EN CAFÉ', dot: 'rounded', eye: 'rounded' },
      { name: 'Avisos & Alertas', bg: '#fef2f2', qr: '#b91c1c', frame: '#ef4444', icon: 'fa-bell', fontT: 'Righteous', fontB: 'Outfit', banner: 'AVISO IMPORTANTE', dot: 'hexagon', eye: 'square' },
      { name: 'Huerto Urbano', bg: '#f7fee7', qr: '#3f6212', frame: '#65a30d', icon: 'fa-thumbs-up', fontT: 'Poppins', fontB: 'Comfortaa', banner: 'HUERTO ECOLÓGICO', dot: 'sparkle', eye: 'circle' },
      { name: 'Centro Cultural', bg: '#faf5ff', qr: '#6b21a8', frame: '#a855f7', icon: 'fa-qrcode', fontT: 'Playfair Display', fontB: 'Outfit', banner: 'TALLERES GRATIS', dot: 'star', eye: 'rounded' },
      { name: 'Mapa de Seguridad', bg: '#0f172a', qr: '#38bdf8', frame: '#38bdf8', icon: 'fa-location-dot', fontT: 'Space Grotesk', fontB: 'Fira Code', banner: 'MAPA SEGURO', dot: 'diamond', eye: 'square' }
    ],
    'Gastronomía': [
      { name: 'Menú Digital Gourmet', bg: '#0f172a', qr: '#f59e0b', frame: '#f59e0b', icon: 'fa-utensils', fontT: 'Playfair Display', fontB: 'Playfair Display', banner: 'MENÚ DIGITAL', dot: 'dots', eye: 'circle' },
      { name: 'Coffee Roast & Bistro', bg: '#fffbebf', qr: '#78350f', frame: '#92400e', icon: 'fa-coffee', fontT: 'Lobster', fontB: 'Lora', banner: 'CAFÉ & REPOSTERÍA', dot: 'rounded', eye: 'rounded' },
      { name: 'Reserva de Mesa', bg: '#450a0a', qr: '#f87171', frame: '#ef4444', icon: 'fa-clock', fontT: 'Abril Fatface', fontB: 'Poppins', banner: 'RESERVAR MESA', dot: 'diamond', eye: 'square' },
      { name: 'Pizzería & Grill Fire', bg: '#18181b', qr: '#f97316', frame: '#f97316', icon: 'fa-fire', fontT: 'Anton', fontB: 'Righteous', banner: 'PEDIR AHORA', dot: 'hexagon', eye: 'square' },
      { name: 'Carta de Vinos VIP', bg: '#2e1065', qr: '#e879f9', frame: '#e879f9', icon: 'fa-star', fontT: 'Cinzel', fontB: 'Playfair Display', banner: 'CATA DE VINOS', dot: 'sparkle', eye: 'circle' },
      { name: 'Delivery Express', bg: '#fef2f2', qr: '#dc2626', frame: '#dc2626', icon: 'fa-store', fontT: 'Bebas Neue', fontB: 'Outfit', banner: 'DELIVERY FAST', dot: 'square', eye: 'rounded' },
      { name: 'Burger & Craft Beer', bg: '#1c1917', qr: '#eab308', frame: '#eab308', icon: 'fa-thumbs-up', fontT: 'Righteous', fontB: 'Oswald', banner: 'HAPPY HOUR 2x1', dot: 'dots', eye: 'circle' },
      { name: 'Sushi Bar Experience', bg: '#042f2e', qr: '#2dd4bf', frame: '#2dd4bf', icon: 'fa-heart', fontT: 'Outfit', fontB: 'Space Grotesk', banner: 'SUSHI & OMAKASE', dot: 'smooth', eye: 'circle' },
      { name: 'Ubicación Restaurante', bg: '#ffffff', qr: '#0f172a', frame: '#0f172a', icon: 'fa-location-dot', fontT: 'Montserrat', fontB: 'Plus Jakarta Sans', banner: '¿CÓMO LLEGAR?', dot: 'square', eye: 'square' },
      { name: 'Cupón Gastronómico', bg: '#fff7ed', qr: '#c2410c', frame: '#ea580c', icon: 'fa-ticket', fontT: 'Pacifico', fontB: 'Poppins', banner: 'PROMO 20% OFF', dot: 'ring', eye: 'rounded' }
    ],
    'Tecnología': [
      { name: 'Cyberpunk Tech', bg: '#09090b', qr: '#22c55e', frame: '#22c55e', icon: 'fa-laptop', fontT: 'Fira Code', fontB: 'Fira Code', banner: 'SYSTEM ONLINE', dot: 'square', eye: 'square' },
      { name: 'Acceso WiFi Rápido', bg: '#0c4a6e', qr: '#38bdf8', frame: '#38bdf8', icon: 'fa-wifi', fontT: 'Space Grotesk', fontB: 'Outfit', banner: 'CONECTAR WIFI', dot: 'smooth', eye: 'circle' },
      { name: 'Seguridad Cloud', bg: '#0f172a', qr: '#6366f1', frame: '#818cf8', icon: 'fa-lock', fontT: 'Outfit', fontB: 'Space Grotesk', banner: 'SECURITY LOCK', dot: 'diamond', eye: 'square' },
      { name: 'App Mobile Download', bg: '#18181b', qr: '#a855f7', frame: '#c026d3', icon: 'fa-qrcode', fontT: 'Righteous', fontB: 'Poppins', banner: 'DESCARGAR APP', dot: 'dots', eye: 'rounded' },
      { name: 'Soporte Técnico 24H', bg: '#f0f9ff', qr: '#0284c7', frame: '#0284c7', icon: 'fa-comments', fontT: 'Poppins', fontB: 'Roboto', banner: 'SOPORTE 24/7', dot: 'rounded', eye: 'circle' },
      { name: 'IA & Algoritmos', bg: '#030712', qr: '#ec4899', frame: '#ec4899', icon: 'fa-bolt', fontT: 'Press Start 2P', fontB: 'Fira Code', banner: 'AI GENERATIVE', dot: 'sparkle', eye: 'square' },
      { name: 'Dev API Docs', bg: '#18181b', qr: '#f59e0b', frame: '#f59e0b', icon: 'fa-key', fontT: 'Fira Code', fontB: 'Space Grotesk', banner: 'API DOCUMENTATION', dot: 'hexagon', eye: 'square' },
      { name: 'Cloud Server Portal', bg: '#0284c7', qr: '#ffffff', frame: '#ffffff', icon: 'fa-cloud', fontT: 'Montserrat', fontB: 'Outfit', banner: 'CLOUD ACCESS', dot: 'dots', eye: 'circle' },
      { name: 'Software Enterprise', bg: '#ffffff', qr: '#0f172a', frame: '#3b82f6', icon: 'fa-globe', fontT: 'Montserrat', fontB: 'Roboto', banner: 'ENTERPRISE PRO', dot: 'square', eye: 'square' },
      { name: 'Beta Tester Pass', bg: '#312e81', qr: '#818cf8', frame: '#c7d2fe', icon: 'fa-ticket', fontT: 'Bebas Neue', fontB: 'Space Grotesk', banner: 'ACCESO BETA', dot: 'ring', eye: 'rounded' }
    ],
    'Salud': [
      { name: 'Centro Médico Hospital', bg: '#ffffff', qr: '#0284c7', frame: '#0284c7', icon: 'fa-hospital', fontT: 'Plus Jakarta Sans', fontB: 'Poppins', banner: 'PORTAL PACIENTE', dot: 'rounded', eye: 'rounded' },
      { name: 'Citas Médicas 24/7', bg: '#f0fdf4', qr: '#166534', frame: '#22c55e', icon: 'fa-heart', fontT: 'Outfit', fontB: 'Plus Jakarta Sans', banner: 'CITAS ONLINE', dot: 'smooth', eye: 'circle' },
      { name: 'Urgencias & Emergencia', bg: '#fef2f2', qr: '#dc2626', frame: '#ef4444', icon: 'fa-phone', fontT: 'Righteous', fontB: 'Oswald', banner: 'URGENCIAS 24H', dot: 'square', eye: 'square' },
      { name: 'Resultados de Laboratorio', bg: '#f0f9ff', qr: '#0369a1', frame: '#0284c7', icon: 'fa-shield-halved', fontT: 'Lora', fontB: 'Roboto', banner: 'RESULTADOS LAB', dot: 'dots', eye: 'circle' },
      { name: 'Telemedicina Online', bg: '#faf5ff', qr: '#7e22ce', frame: '#a855f7', icon: 'fa-user', fontT: 'Poppins', fontB: 'Comfortaa', banner: 'TELEMEDICINA VIP', dot: 'diamond', eye: 'rounded' },
      { name: 'Farmacia & Receta', bg: '#ecfeff', qr: '#0891b2', frame: '#06b6d4', icon: 'fa-store', fontT: 'Outfit', fontB: 'Poppins', banner: 'FARMACIA ONLINE', dot: 'rounded', eye: 'circle' },
      { name: 'Notificación & Alertas', bg: '#fff7ed', qr: '#c2410c', frame: '#f97316', icon: 'fa-bell', fontT: 'Plus Jakarta Sans', fontB: 'Roboto', banner: 'RECORDATORIO', dot: 'sparkle', eye: 'circle' },
      { name: 'Sede Clínica Ubicación', bg: '#ffffff', qr: '#0f172a', frame: '#3b82f6', icon: 'fa-location-dot', fontT: 'Montserrat', fontB: 'Plus Jakarta Sans', banner: 'UBICACIÓN CLÍNICA', dot: 'square', eye: 'square' },
      { name: 'Carnet de Vacunación', bg: '#f8fafc', qr: '#334155', frame: '#475569', icon: 'fa-qrcode', fontT: 'Space Grotesk', fontB: 'Outfit', banner: 'PASE SANITARIO', dot: 'hexagon', eye: 'square' },
      { name: 'Bienestar & Skincare', bg: '#fdf2f8', qr: '#db2777', frame: '#f43f5e', icon: 'fa-sun', fontT: 'Comfortaa', fontB: 'Caveat', banner: 'WELLNESS PRO', dot: 'ring', eye: 'circle' }
    ],
    'Viajes': [
      { name: 'Vuelos & Check-in', bg: '#0f172a', qr: '#38bdf8', frame: '#38bdf8', icon: 'fa-plane', fontT: 'Montserrat', fontB: 'Bebas Neue', banner: 'CHECK-IN VUELO', dot: 'smooth', eye: 'circle' },
      { name: 'Guía Turística World', bg: '#f0f9ff', qr: '#0284c7', frame: '#0284c7', icon: 'fa-globe', fontT: 'Pacifico', fontB: 'Poppins', banner: 'GUÍA DE VIAJE', dot: 'dots', eye: 'rounded' },
      { name: 'Hotel & Resort VIP', bg: '#fffbebf', qr: '#b45309', frame: '#f59e0b', icon: 'fa-building', fontT: 'Playfair Display', fontB: 'Lora', banner: 'RESERVA HOTEL', dot: 'diamond', eye: 'square' },
      { name: 'Mapa de Destinos', bg: '#f0fdf4', qr: '#15803d', frame: '#22c55e', icon: 'fa-location-dot', fontT: 'Outfit', fontB: 'Space Grotesk', banner: 'VER MAPA TOURS', dot: 'hexagon', eye: 'circle' },
      { name: 'Ticket Pasaje Travel', bg: '#fef2f2', qr: '#e11d48', frame: '#f43f5e', icon: 'fa-ticket', fontT: 'Bebas Neue', fontB: 'Righteous', banner: 'PASAJE DIGITAL', dot: 'star', eye: 'rounded' },
      { name: 'Renta de Autos', bg: '#18181b', qr: '#eab308', frame: '#eab308', icon: 'fa-car', fontT: 'Oswald', fontB: 'Bebas Neue', banner: 'RENT A CAR', dot: 'square', eye: 'square' },
      { name: 'Fotos & Recuerdos', bg: '#fdf4ff', qr: '#a21caf', frame: '#c026d3', icon: 'fa-camera', fontT: 'Dancing Script', fontB: 'Satisfy', banner: 'GALERÍA DE VIAJE', dot: 'heart', eye: 'circle' },
      { name: 'Cruceros All-Inclusive', bg: '#030712', qr: '#06b6d4', frame: '#06b6d4', icon: 'fa-sun', fontT: 'Cinzel', fontB: 'Outfit', banner: 'CRUCEROS VIP', dot: 'ring', eye: 'circle' },
      { name: 'Asistencia al Viajero', bg: '#ffffff', qr: '#1e3a8a', frame: '#2563eb', icon: 'fa-shield-halved', fontT: 'Montserrat', fontB: 'Roboto', banner: 'SEGURO DE VIAJE', dot: 'rounded', eye: 'square' },
      { name: 'Pasaporte & Visas', bg: '#451a03', qr: '#f59e0b', frame: '#f59e0b', icon: 'fa-star', fontT: 'Cinzel', fontB: 'Playfair Display', banner: 'PASAPORTE GOLD', dot: 'sparkle', eye: 'square' }
    ],
    'Inmobiliaria': [
      { name: 'Residencial Gold', bg: '#0f172a', qr: '#f59e0b', frame: '#f59e0b', icon: 'fa-building', fontT: 'Cinzel', fontB: 'Playfair Display', banner: 'PROPIEDAD EN VENTA', dot: 'diamond', eye: 'square' },
      { name: 'Tour Virtual 360', bg: '#ffffff', qr: '#2563eb', frame: '#2563eb', icon: 'fa-camera', fontT: 'Outfit', fontB: 'Space Grotesk', banner: 'TOUR VIRTUAL 360°', dot: 'dots', eye: 'circle' },
      { name: 'Llave de Apartamento', bg: '#f8fafc', qr: '#0f172a', frame: '#334155', icon: 'fa-key', fontT: 'Montserrat', fontB: 'Poppins', banner: 'DEPARTAMENTOS', dot: 'square', eye: 'square' },
      { name: 'Agendar Visita House', bg: '#f0fdf4', qr: '#166534', frame: '#22c55e', icon: 'fa-location-dot', fontT: 'Poppins', fontB: 'Plus Jakarta Sans', banner: 'AGENDAR VISITA', dot: 'smooth', eye: 'rounded' },
      { name: 'Ubicación Terrenos', bg: '#fff7ed', qr: '#c2410c', frame: '#ea580c', icon: 'fa-globe', fontT: 'Oswald', fontB: 'Outfit', banner: 'VER TERRENOS', dot: 'hexagon', eye: 'square' },
      { name: 'Inmobiliaria VIP', bg: '#18181b', qr: '#38bdf8', frame: '#38bdf8', icon: 'fa-briefcase', fontT: 'Space Grotesk', fontB: 'Fira Code', banner: 'BROCHURE PRO', dot: 'sparkle', eye: 'circle' },
      { name: 'Cálculo Hipoteca', bg: '#faf5ff', qr: '#7e22ce', frame: '#a855f7', icon: 'fa-store', fontT: 'Roboto', fontB: 'Poppins', banner: 'CRÉDITO HIPOTECA', dot: 'rounded', eye: 'circle' },
      { name: 'Contacto Agente', bg: '#fef2f2', qr: '#dc2626', frame: '#dc2626', icon: 'fa-phone', fontT: 'Montserrat', fontB: 'Outfit', banner: 'CONTACTAR AGENTE', dot: 'rounded', eye: 'square' },
      { name: 'Proyecto Lanzamiento', bg: '#09090b', qr: '#e11d48', frame: '#e11d48', icon: 'fa-star', fontT: 'Bebas Neue', fontB: 'Righteous', banner: 'PREVENTA EXCLUSIVA', dot: 'ring', eye: 'circle' },
      { name: 'Garantía Inmobiliaria', bg: '#ecfeff', qr: '#0891b2', frame: '#06b6d4', icon: 'fa-shield-halved', fontT: 'Lora', fontB: 'Plus Jakarta Sans', banner: 'GARANTÍA DE AVAL', dot: 'star', eye: 'square' }
    ],
    'Educación': [
      { name: 'Campus Universitario', bg: '#1e3a8a', qr: '#ffffff', frame: '#facc15', icon: 'fa-graduation-cap', fontT: 'Lora', fontB: 'Montserrat', banner: 'MATRÍCULA 2026', dot: 'square', eye: 'square' },
      { name: 'Aula Virtual Student', bg: '#f0f9ff', qr: '#0284c7', frame: '#0284c7', icon: 'fa-laptop', fontT: 'Space Grotesk', fontB: 'Fira Code', banner: 'AULA VIRTUAL', dot: 'dots', eye: 'circle' },
      { name: 'Curso Online Master', bg: '#fdf2f8', qr: '#db2777', frame: '#ec4899', icon: 'fa-globe', fontT: 'Outfit', fontB: 'Poppins', banner: 'CURSO CERTIFICADO', dot: 'smooth', eye: 'rounded' },
      { name: 'Beca 100% Talent', bg: '#fffbebf', qr: '#b45309', frame: '#f59e0b', icon: 'fa-trophy', fontT: 'Cinzel', fontB: 'Outfit', banner: 'POSTULAR A BECA', dot: 'star', eye: 'circle' },
      { name: 'Biblioteca Digital', bg: '#f8fafc', qr: '#0f172a', frame: '#334155', icon: 'fa-building', fontT: 'Playfair Display', fontB: 'Lora', banner: 'BIBLIOTECA WEB', dot: 'rounded', eye: 'square' },
      { name: 'Foro Estudiantil', bg: '#f0fdf4', qr: '#15803d', frame: '#22c55e', icon: 'fa-comments', fontT: 'Comfortaa', fontB: 'Poppins', banner: 'COMUNIDAD ALUMNOS', dot: 'dots', eye: 'rounded' },
      { name: 'Certificado QR', bg: '#ffffff', qr: '#111827', frame: '#4b5563', icon: 'fa-qrcode', fontT: 'Cinzel', fontB: 'Roboto', banner: 'VALIDAR TÍTULO', dot: 'diamond', eye: 'square' },
      { name: 'Temario y Syllabus', bg: '#faf5ff', qr: '#6b21a8', frame: '#a855f7', icon: 'fa-briefcase', fontT: 'Poppins', fontB: 'Outfit', banner: 'DESCARGAR PLAN', dot: 'hexagon', eye: 'circle' },
      { name: 'Examen de Admisión', bg: '#fef2f2', qr: '#b91c1c', frame: '#ef4444', icon: 'fa-user', fontT: 'Oswald', fontB: 'Bebas Neue', banner: 'ADMISIÓN ABIERTA', dot: 'ring', eye: 'square' },
      { name: 'Code Academy Tech', bg: '#09090b', qr: '#10b981', frame: '#10b981', icon: 'fa-laptop', fontT: 'Fira Code', fontB: 'Fira Code', banner: 'BOOTCAMP BOOT', dot: 'square', eye: 'square' }
    ],
    'Eventos': [
      { name: 'Concierto VIP Live', bg: '#09090b', qr: '#ec4899', frame: '#ec4899', icon: 'fa-music', fontT: 'Righteous', fontB: 'Bebas Neue', banner: 'ENTRADAS CONCIERTO', dot: 'dots', eye: 'circle' },
      { name: 'Invitación Bodas', bg: '#fff1f2', qr: '#be123c', frame: '#fb7185', icon: 'fa-heart', fontT: 'Great Vibes', fontB: 'Satisfy', banner: 'CONFIRMAR ASISTENCIA', dot: 'heart', eye: 'circle' },
      { name: 'Festival Lineup 2026', bg: '#1e1b4b', qr: '#818cf8', frame: '#818cf8', icon: 'fa-ticket', fontT: 'Bebas Neue', fontB: 'Outfit', banner: 'LINEUP FESTIVAL', dot: 'hexagon', eye: 'rounded' },
      { name: 'Gala & Red Carpet', bg: '#0f172a', qr: '#fde047', frame: '#fde047', icon: 'fa-star', fontT: 'Cinzel', fontB: 'Playfair Display', banner: 'GALA EXCLUSIVA', dot: 'sparkle', eye: 'square' },
      { name: 'Cumpleaños Party', bg: '#fdf4ff', qr: '#c026d3', frame: '#e879f9', icon: 'fa-gift', fontT: 'Lobster', fontB: 'Caveat', banner: 'CUMPLE 30 AÑOS', dot: 'rounded', eye: 'circle' },
      { name: 'Conferencia Summit', bg: '#ffffff', qr: '#0284c7', frame: '#0284c7', icon: 'fa-calendar', fontT: 'Montserrat', fontB: 'Outfit', banner: 'AGENDA SUMMIT', dot: 'square', eye: 'square' },
      { name: 'Ubicación Show', bg: '#fff7ed', qr: '#ea580c', frame: '#f97316', icon: 'fa-location-dot', fontT: 'Outfit', fontB: 'Poppins', banner: 'UBICACIÓN STAGE', dot: 'smooth', eye: 'rounded' },
      { name: 'After Party Neon', bg: '#052e16', qr: '#22c55e', frame: '#22c55e', icon: 'fa-fire', fontT: 'Anton', fontB: 'Righteous', banner: 'AFTER PARTY VIP', dot: 'ring', eye: 'circle' },
      { name: 'Prensa & Acceso Media', bg: '#18181b', qr: '#ffffff', frame: '#ffffff', icon: 'fa-camera', fontT: 'Space Grotesk', fontB: 'Fira Code', banner: 'PRENSA ACCESO', dot: 'diamond', eye: 'square' },
      { name: 'Notificación Evento', bg: '#eff6ff', qr: '#1d4ed8', frame: '#3b82f6', icon: 'fa-bell', fontT: 'Poppins', fontB: 'Roboto', banner: 'RECORDATORIO SHOW', dot: 'dots', eye: 'circle' }
    ],
    'Redes Sociales': [
      { name: 'Instagram & TikTok Feed', bg: '#831843', qr: '#f472b6', frame: '#f472b6', icon: 'fa-camera', fontT: 'Poppins', fontB: 'Outfit', banner: '¡SÍGUENOS EN IG!', dot: 'dots', eye: 'circle' },
      { name: 'Canal de YouTube', bg: '#fef2f2', qr: '#dc2626', frame: '#ef4444', icon: 'fa-film', fontT: 'Bebas Neue', fontB: 'Righteous', banner: 'SUSCRÍBETE AHORA', dot: 'rounded', eye: 'square' },
      { name: 'Linktree / Link Bio', bg: '#0f172a', qr: '#38bdf8', frame: '#38bdf8', icon: 'fa-globe', fontT: 'Comfortaa', fontB: 'Space Grotesk', banner: 'TODOS MIS LINKS', dot: 'smooth', eye: 'circle' },
      { name: 'Twitch Streamer Live', bg: '#2e1065', qr: '#a855f7', frame: '#c026d3', icon: 'fa-fire', fontT: 'Righteous', fontB: 'Press Start 2P', banner: 'STREAM EN VIVO', dot: 'sparkle', eye: 'square' },
      { name: 'Discord Community', bg: '#1e1b4b', qr: '#6366f1', frame: '#818cf8', icon: 'fa-comments', fontT: 'Outfit', fontB: 'Fira Code', banner: 'UNIRSE AL DISCORD', dot: 'hexagon', eye: 'rounded' },
      { name: 'Perfil Profesional LinkedIn', bg: '#ffffff', qr: '#0284c7', frame: '#0284c7', icon: 'fa-user', fontT: 'Montserrat', fontB: 'Roboto', banner: 'PERFIL FESIONAL', dot: 'square', eye: 'square' },
      { name: 'Dale Like & Comparte', bg: '#fdf2f8', qr: '#db2777', frame: '#ec4899', icon: 'fa-thumbs-up', fontT: 'Caveat', fontB: 'Poppins', banner: 'DALE LIKE Y COMPARTE', dot: 'heart', eye: 'circle' },
      { name: 'Alerta de Contenido', bg: '#fff7ed', qr: '#ea580c', frame: '#f97316', icon: 'fa-bell', fontT: 'Space Grotesk', fontB: 'Outfit', banner: 'ACTIVA CAMPANITA', dot: 'star', eye: 'circle' },
      { name: 'Fan Base Gold', bg: '#09090b', qr: '#facc15', frame: '#facc15', icon: 'fa-star', fontT: 'Anton', fontB: 'Bebas Neue', banner: 'CLUB DE FANS', dot: 'diamond', eye: 'square' },
      { name: 'Red Social Privada', bg: '#0284c7', qr: '#ffffff', frame: '#ffffff', icon: 'fa-qrcode', fontT: 'Poppins', fontB: 'Comfortaa', banner: 'AGREGAR CONTACTO', dot: 'ring', eye: 'circle' }
    ],
    'Lujo': [
      { name: 'Imperial Black & Gold', bg: '#09090b', qr: '#f59e0b', frame: '#f59e0b', icon: 'fa-gem', fontT: 'Cinzel', fontB: 'Cinzel', banner: 'EDICIÓN EXCLUSIVA', dot: 'diamond', eye: 'square' },
      { name: 'Royal Diamond Silver', bg: '#0f172a', qr: '#e2e8f0', frame: '#cbd5e1', icon: 'fa-star', fontT: 'Playfair Display', fontB: 'Playfair Display', banner: 'CLUB PRIVADO', dot: 'sparkle', eye: 'circle' },
      { name: 'Velvet Rose Gold', bg: '#27005d', qr: '#f472b6', frame: '#f472b6', icon: 'fa-heart', fontT: 'Abril Fatface', fontB: 'Satisfy', banner: 'COLECCIÓN ROYAL', dot: 'heart', eye: 'circle' },
      { name: 'Champagne Ivory', bg: '#fffbeb', qr: '#b45309', frame: '#d97706', icon: 'fa-key', fontT: 'Lora', fontB: 'Great Vibes', banner: 'VIP CONCIERGE', dot: 'rounded', eye: 'rounded' },
      { name: 'Obsidian Platinum', bg: '#020617', qr: '#38bdf8', frame: '#38bdf8', icon: 'fa-shield-halved', fontT: 'Cinzel', fontB: 'Montserrat', banner: 'ACCESO RESTRINGIDO', dot: 'hexagon', eye: 'square' },
      { name: 'Sapphire Deluxe', bg: '#1e3a8a', qr: '#ffffff', frame: '#93c5fd', icon: 'fa-trophy', fontT: 'Playfair Display', fontB: 'Cinzel', banner: 'SAPPHIRE MEMBER', dot: 'dots', eye: 'circle' },
      { name: 'Boutique Private', bg: '#ffffff', qr: '#0f172a', frame: '#d97706', icon: 'fa-building', fontT: 'Montserrat', fontB: 'Playfair Display', banner: 'BOUTIQUE PRIVATE', dot: 'square', eye: 'square' },
      { name: 'Concierge 24/7', bg: '#18181b', qr: '#fbbf24', frame: '#fbbf24', icon: 'fa-user', fontT: 'Outfit', fontB: 'Cinzel', banner: 'CONCIERGE 24/7', dot: 'smooth', eye: 'rounded' },
      { name: 'Reserva Private Jet', bg: '#0c4a6e', qr: '#e0f2fe', frame: '#7dd3fc', icon: 'fa-plane', fontT: 'Bebas Neue', fontB: 'Outfit', banner: 'PRIVATE JET CHARTER', dot: 'star', eye: 'circle' },
      { name: 'Residencia Deluxe', bg: '#451a03', qr: '#fde047', frame: '#fde047', icon: 'fa-location-dot', fontT: 'Cinzel', fontB: 'Lora', banner: 'RESIDENCIA LUXE', dot: 'ring', eye: 'square' }
    ]
  };

  const frameStyles = ['top-banner', 'card-header', 'shield-badge', 'simple-border', 'pill-frame', 'gradient-border', 'neon-glow', 'ticket-dashed', 'vintage-border', 'dark-minimal'];

  CATEGORIES.forEach(cat => {
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

function getCategoryBanner(cat, index) {
  const banners = {
    'Institucional': ['SITIO OFICIAL', 'VER PORTAL', 'INFO OFICIAL', 'ACCESO WEB', 'TRANSPARENCIA'],
    'Compras': ['OFERTA 50%', 'VER CATÁLOGO', 'ESCANEA Y GANA', 'TIENDA ONLINE', 'CUPÓN OFF'],
    'Entretenimiento': ['REPRODUCIR', 'VER TRÁILER', 'ENTRADAS VIP', 'ESCUCHAR MÚSICA', 'STREAMING'],
    'Belleza': ['RESERVAR CITA', 'VER CATÁLOGO', 'SALÓN & SPA', 'PROMO BELLEZA', 'MAKEUP STUDIO'],
    'Deportes': ['UNIRSE AL GYM', 'CLASE GRATIS', 'VER HORARIOS', 'FITNESS CHALLENGE', 'ENTRENAMIENTO']
  };
  const list = banners[cat] || ['ESCANÉAME', 'SCAN ME'];
  return list[(index - 1) % list.length];
}

const DESIGNS_150 = generate150Designs();
const PATTERNS = [
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

const oauthSessions = new Map();

app.get('/api/designs', (req, res) => {
  res.json({
    success: true,
    categories: CATEGORIES,
    designs: DESIGNS_150,
    patterns: PATTERNS
  });
});

app.post('/api/auth/oauth-login', (req, res) => {
  const { provider, email, name } = req.body;
  if (!email || !provider) {
    return res.status(400).json({ success: false, error: 'Faltan parámetros OAuth 2.0' });
  }

  const users = readJsonFile(USERS_FILE, {});
  const userKey = email.toLowerCase().trim();
  const token = 'oauth2_token_' + Math.random().toString(36).substring(2, 15);

  let existingUser = users[userKey];
  if (!existingUser) {
    existingUser = {
      id: 'user_' + Date.now(),
      name: name || email.split('@')[0],
      email: userKey,
      provider: provider,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userKey)}`,
      plan: 'free',
      maxDownloads: 20,
      generationsCount: 0,
      downloadsCount: 0,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
  } else {
    existingUser.lastActive = new Date().toISOString();
    if (name) existingUser.name = name;
    if (provider) existingUser.provider = provider;
  }

  users[userKey] = existingUser;
  writeJsonFile(USERS_FILE, users);

  oauthSessions.set(token, existingUser);
  res.json({ success: true, token, user: existingUser });
});

// Track QR Download, save metadata & image, enforce free tier limit
app.post('/api/track-download', async (req, res) => {
  try {
    const { userEmail, title, url, format = 'png', resolution = 800, imageDataUrl } = req.body;

    if (!userEmail || userEmail.trim() === '' || userEmail.toLowerCase().includes('invitado@anonimo')) {
      return res.status(401).json({
        success: false,
        authRequired: true,
        message: 'Para descargar tu código QR debes estar registrado.'
      });
    }

    const emailKey = userEmail.toLowerCase().trim();
    const users = readJsonFile(USERS_FILE, {});
    let user = users[emailKey];

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
      users[emailKey] = user;
    }

    const maxLimit = user.maxDownloads || 20;
    const currentDownloads = user.downloadsCount || 0;

    if (user.plan === 'free' && currentDownloads >= maxLimit) {
      return res.status(403).json({
        success: false,
        limitReached: true,
        message: `Has alcanzado el límite gratuito de ${maxLimit} descargas. ¡Apoya con una donación o pasa a Pro para descargas ilimitadas!`
      });
    }

    let savedImagePath = null;
    const qrId = 'qr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    
    if (imageDataUrl && imageDataUrl.startsWith('data:image')) {
      const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
      const fileName = `${qrId}.${format === 'svg' ? 'svg' : 'png'}`;
      const filePath = path.join(DOWNLOADED_DIR, fileName);
      fs.writeFileSync(filePath, base64Data, 'base64');
      savedImagePath = `/downloaded/${fileName}`;
      gcsService.uploadToCloud(filePath, `downloaded/${fileName}`);
    }

    const history = readJsonFile(HISTORY_FILE, []);
    const historyEntry = {
      id: qrId,
      userEmail: emailKey,
      title: title || 'Código QR',
      url: url || 'https://qrfy.com',
      format,
      resolution,
      imagePath: savedImagePath,
      createdAt: new Date().toISOString()
    };
    history.unshift(historyEntry);
    writeJsonFile(HISTORY_FILE, history);

    const stats = readJsonFile(STATS_FILE, { totalGenerations: 0, totalDownloads: 0 });
    stats.totalDownloads = (stats.totalDownloads || 0) + 1;
    writeJsonFile(STATS_FILE, stats);

    if (user) {
      user.downloadsCount = (user.downloadsCount || 0) + 1;
      users[emailKey] = user;
      writeJsonFile(USERS_FILE, users);
    }

    const activeUserObj = user || {
      email: 'invitado@anonimo.com',
      plan: 'free',
      maxDownloads: 20,
      downloadsCount: currentDownloads + 1,
      generationsCount: 1
    };

    res.json({
      success: true,
      message: 'Descarga registrada y guardada exitosamente.',
      savedQr: historyEntry,
      userStats: {
        downloadsCount: activeUserObj.downloadsCount,
        generationsCount: activeUserObj.generationsCount || 1,
        maxDownloads: activeUserObj.maxDownloads || 20,
        remainingDownloads: Math.max(0, (activeUserObj.maxDownloads || 20) - activeUserObj.downloadsCount),
        plan: activeUserObj.plan || 'free'
      }
    });
  } catch (err) {
    console.error('Error tracking download:', err);
    res.status(500).json({ success: false, error: 'Error interno al guardar descarga' });
  }
});

// User Stats & Recent QR History API
app.get('/api/user/stats', (req, res) => {
  const userEmail = req.query.email ? req.query.email.toLowerCase().trim() : null;
  const users = readJsonFile(USERS_FILE, {});
  const globalStats = readJsonFile(STATS_FILE, { totalGenerations: 0, totalDownloads: 0 });

  if (userEmail && users[userEmail]) {
    const user = users[userEmail];
    const history = readJsonFile(HISTORY_FILE, []);
    const userHistory = history.filter(h => h.userEmail === userEmail).slice(0, 10);

    return res.json({
      success: true,
      userStats: {
        email: user.email,
        name: user.name,
        plan: user.plan || 'free',
        maxDownloads: user.maxDownloads || 20,
        downloadsCount: user.downloadsCount || 0,
        generationsCount: user.generationsCount || 0,
        remainingDownloads: Math.max(0, (user.maxDownloads || 20) - (user.downloadsCount || 0))
      },
      history: userHistory,
      globalStats
    });
  }

  res.json({
    success: true,
    userStats: null,
    globalStats
  });
});

app.post('/api/generate', async (req, res) => {
  try {
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
      showIcon = true,
      showShield = true,
      iconMode = 'icon', // 'icon' or 'image'
      iconName = 'fa-qrcode',
      iconPosition = 'center', // 'center', 'above', 'below', 'left', 'right'
      iconColor = '#2563eb',
      iconBgColor = '#ffffff',
      iconBorderColor = '#2563eb',
      iconSize = 34,
      customLogoDataUrl = null
    } = req.body;

    // Increment generation stats
    const stats = readJsonFile(STATS_FILE, { totalGenerations: 0, totalDownloads: 0 });
    stats.totalGenerations = (stats.totalGenerations || 0) + 1;
    writeJsonFile(STATS_FILE, stats);

    if (req.body.userEmail) {
      const uEmailKey = req.body.userEmail.toLowerCase().trim();
      const users = readJsonFile(USERS_FILE, {});
      if (users[uEmailKey]) {
        users[uEmailKey].generationsCount = (users[uEmailKey].generationsCount || 0) + 1;
        writeJsonFile(USERS_FILE, users);
      }
    }

    const design = DESIGNS_150.find(d => d.id === designId) || DESIGNS_150[0];

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

    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw frame decoration, title, and banner
    drawFrame(ctx, design.frameStyle, canvasWidth, canvasHeight, title, activeBannerText, {
      frameColor,
      textColor,
      badgeBg,
      badgeText,
      bgColor
    }, scale, fontTitle, fontBanner, {
      showIcon,
      iconMode,
      iconName,
      iconPosition,
      iconColor,
      iconSize,
      customLogoDataUrl
    });

    // Position of QR Matrix inside card
    const qrAreaSize = 340 * scale;
    const qrX = (canvasWidth - qrAreaSize) / 2;
    const qrY = 175 * scale;

    // Draw QR White Background Box
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, qrX - (16 * scale), qrY - (16 * scale), qrAreaSize + (32 * scale), qrAreaSize + (32 * scale), 18 * scale);
    ctx.fill();

    // Draw QR Modules
    const cellSize = qrAreaSize / size;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (modules.get(r, c)) {
          const x = qrX + c * cellSize;
          const y = qrY + r * cellSize;
          const isEye = (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);

          if (isEye) {
            drawEye(ctx, x, y, cellSize, eyeStyle, qrColor);
          } else {
            drawDotPattern(ctx, x, y, cellSize, dotStyle, qrColor);
          }
        }
      }
    }

    // If icon/logo position is CENTER, render center overlay
    if (showIcon && iconPosition === 'center') {
      const cx = qrX + qrAreaSize / 2;
      const cy = qrY + qrAreaSize / 2;
      const calcSize = (iconSize || 34) * scale;
      const badgeRadiusY = Math.max(calcSize * 0.85, 28 * scale);
      const badgeRadiusX = badgeRadiusY * 1.2; // 20% wider shield box

      // Draw background shield with customizable iconBgColor (default #ffffff)
      ctx.fillStyle = iconBgColor || '#ffffff';
      roundRect(ctx, cx - badgeRadiusX, cy - badgeRadiusY, badgeRadiusX * 2, badgeRadiusY * 2, 14 * scale);
      ctx.fill();

      ctx.lineWidth = 3 * scale;
      ctx.strokeStyle = iconBorderColor || iconColor || '#2563eb';
      roundRect(ctx, cx - badgeRadiusX + 2, cy - badgeRadiusY + 2, (badgeRadiusX - 2) * 2, (badgeRadiusY - 2) * 2, 12 * scale);
      ctx.stroke();

      if (iconMode === 'image' && customLogoDataUrl) {
        try {
          const logoImg = await loadImage(customLogoDataUrl);
          // Increased inner margin padding so image logo stands out cleanly with breathing room
          const maxDimY = badgeRadiusY * 1.35;
          const maxDimX = maxDimY * 1.2; // 20% wider image logo
          ctx.drawImage(logoImg, cx - maxDimX / 2, cy - maxDimY / 2, maxDimX, maxDimY);
        } catch (e) {
          console.error('Error loading custom logo image:', e);
        }
      } else {
        drawVectorIcon(ctx, iconName, cx, cy, calcSize, iconColor);
      }
    }

    const dataUrl = canvas.toDataURL('image/png');
    res.json({ success: true, image: dataUrl });
  } catch (err) {
    console.error('Error generating QR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use(express.static(path.join(__dirname, 'public')));

function roundRect(ctx, x, y, width, height, radius) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    return;
  }
  let r = radius;
  if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + width - r.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr);
  ctx.lineTo(x + width, y + height - r.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
  ctx.lineTo(x + r.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
}

function drawDotPattern(ctx, x, y, size, style, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2;

  ctx.beginPath();

  switch (style) {
    case 'rounded':
      roundRect(ctx, x + 0.5, y + 0.5, size - 1, size - 1, size * 0.3);
      ctx.fill();
      break;
    case 'dots':
      ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'smooth':
      roundRect(ctx, x + 0.5, y + 0.5, size - 1, size - 1, size * 0.45);
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
      drawStarPath(ctx, cx, cy, 5, r * 0.9, r * 0.45);
      ctx.fill();
      break;
    case 'sparkle':
      drawStarPath(ctx, cx, cy, 4, r * 0.9, r * 0.3);
      ctx.fill();
      break;
    case 'heart':
      drawHeartPath(ctx, x + size * 0.1, y + size * 0.1, size * 0.8);
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

function drawStarPath(ctx, cx, cy, spikes, outerRadius, innerRadius) {
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

function drawHeartPath(ctx, x, y, size) {
  const topCurveHeight = size * 0.3;
  ctx.moveTo(x + size / 2, y + topCurveHeight);
  ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
  ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + size, x + size / 2, y + size);
  ctx.bezierCurveTo(x + size / 2, y + size, x + size, y + (size + topCurveHeight) / 2, x + size, y + topCurveHeight);
  ctx.bezierCurveTo(x + size, y, x + size / 2, y, x + size / 2, y + topCurveHeight);
  ctx.closePath();
}

// Vector Icon Renderer supporting all 40 icons with +20% width aspect ratio adjustment
function drawVectorIcon(ctx, iconName, cx, cy, size, color) {
  ctx.save();
  // Increase width by 20% relative to center (cx, cy) while maintaining height dimension
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
      drawHeartPath(ctx, cx - size / 2, cy - size / 2, size);
      ctx.fill();
      break;
    case 'star':
      drawStarPath(ctx, cx, cy, 5, size / 2, size / 4);
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
      roundRect(ctx, cx - size * 0.35, cy - size * 0.1, size * 0.7, size * 0.55, size * 0.1);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy - size * 0.1, size * 0.22, Math.PI, 0);
      ctx.stroke();
      break;
    case 'envelope':
      roundRect(ctx, cx - size * 0.4, cy - size * 0.28, size * 0.8, size * 0.56, size * 0.08);
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
      roundRect(ctx, cx - size * 0.38, cy - size * 0.15, size * 0.76, size * 0.55, 4);
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
      roundRect(ctx, cx - size * 0.4, cy - size * 0.1, size * 0.8, size * 0.3, 4);
      ctx.fill();
      roundRect(ctx, cx - size * 0.25, cy - size * 0.3, size * 0.5, size * 0.22, 3);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - size * 0.22, cy + size * 0.2, size * 0.1, 0, Math.PI * 2);
      ctx.arc(cx + size * 0.22, cy + size * 0.2, size * 0.1, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'briefcase':
      roundRect(ctx, cx - size * 0.4, cy - size * 0.15, size * 0.8, size * 0.55, 4);
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
      roundRect(ctx, cx - size * 0.2, cy + size * 0.1, size * 0.4, size * 0.25, 2);
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
      roundRect(ctx, cx - size * 0.25, cy - size * 0.42, size * 0.5, size * 0.84, size * 0.08);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + size * 0.3, size * 0.05, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'gift':
      roundRect(ctx, cx - size * 0.38, cy - size * 0.1, size * 0.76, size * 0.5, 3);
      ctx.fill();
      roundRect(ctx, cx - size * 0.42, cy - size * 0.25, size * 0.84, size * 0.16, 2);
      ctx.fill();
      ctx.strokeRect(cx - size * 0.06, cy - size * 0.25, size * 0.12, size * 0.65);
      break;
    case 'camera':
      roundRect(ctx, cx - size * 0.4, cy - size * 0.15, size * 0.8, size * 0.55, 5);
      ctx.fill();
      roundRect(ctx, cx - size * 0.18, cy - size * 0.32, size * 0.36, size * 0.18, 3);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy + size * 0.12, size * 0.16, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'gamepad':
      roundRect(ctx, cx - size * 0.42, cy - size * 0.22, size * 0.84, size * 0.44, size * 0.18);
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
      roundRect(ctx, cx - size * 0.35, cy - size * 0.4, size * 0.7, size * 0.8, 4);
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
      roundRect(ctx, cx - size * 0.25, cy + size * 0.25, size * 0.5, size * 0.15, 3);
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
      roundRect(ctx, cx - size * 0.4, cy - size * 0.3, size * 0.8, size * 0.6, 4);
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
      roundRect(ctx, cx - size * 0.32, cy - size * 0.42, size * 0.64, size * 0.84, 2);
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
      roundRect(ctx, cx - size * 0.35, cy, size * 0.7, size * 0.22, 4);
      ctx.fill();
      break;
    case 'ticket':
      roundRect(ctx, cx - size * 0.42, cy - size * 0.25, size * 0.84, size * 0.5, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - size * 0.42, cy, size * 0.1, 0, Math.PI * 2);
      ctx.arc(cx + size * 0.42, cy, size * 0.1, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'coffee':
      roundRect(ctx, cx - size * 0.3, cy - size * 0.15, size * 0.6, size * 0.5, 4);
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
      roundRect(ctx, cx - size * 0.38, cy - size * 0.05, size * 0.18, size * 0.45, 3);
      ctx.fill();
      roundRect(ctx, cx - size * 0.15, cy - size * 0.05, size * 0.5, size * 0.45, 4);
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
      roundRect(ctx, cx - size * 0.32, cy - size * 0.32, size * 0.64, size * 0.44, 4);
      ctx.fill();
      roundRect(ctx, cx - size * 0.44, cy + size * 0.15, size * 0.88, size * 0.1, 3);
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
      roundRect(ctx, cx - size * 0.38, cy - size * 0.35, size * 0.76, size * 0.5, 6);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - size * 0.15, cy + size * 0.15);
      ctx.lineTo(cx - size * 0.3, cy + size * 0.38);
      ctx.lineTo(cx - size * 0.05, cy + size * 0.15);
      ctx.closePath();
      ctx.fill();
      break;
    case 'qrcode':
    default:
      roundRect(ctx, cx - size * 0.35, cy - size * 0.35, size * 0.3, size * 0.3, 3);
      ctx.fill();
      roundRect(ctx, cx + size * 0.05, cy - size * 0.35, size * 0.3, size * 0.3, 3);
      ctx.fill();
      roundRect(ctx, cx - size * 0.35, cy + size * 0.05, size * 0.3, size * 0.3, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + size * 0.2, cy + size * 0.2, size * 0.12, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
  ctx.restore();
}

function drawEye(ctx, x, y, size, style, color) {
  ctx.fillStyle = color;
  if (style === 'circle') {
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === 'rounded') {
    roundRect(ctx, x, y, size, size, size * 0.3);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, size, size);
  }
}

function getFontStack(fontName) {
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

function drawFrame(ctx, style, w, h, title, bannerText, colors, scale = 1, fontTitle = 'sans-serif', fontBanner = 'sans-serif', iconOpts = {}) {
  ctx.save();

  const cardMargin = 35 * scale;
  const cardX = cardMargin;
  const cardY = cardMargin;
  const cardW = w - cardMargin * 2;
  const cardH = h - cardMargin * 2;

  ctx.lineWidth = 4 * scale;
  ctx.strokeStyle = colors.frameColor;
  roundRect(ctx, cardX, cardY, cardW, cardH, 24 * scale);
  ctx.stroke();

  const displayBannerText = bannerText || 'SCAN ME';
  const isHeaderStyle = (style === 'top-banner' || style === 'shield-badge' || style === 'card-header');
  const titleFontStack = getFontStack(fontTitle);
  const bannerFontStack = getFontStack(fontBanner);

  if (isHeaderStyle) {
    if (style === 'card-header') {
      ctx.fillStyle = colors.frameColor;
      roundRect(ctx, cardX, cardY, cardW, 85 * scale, { tl: 24 * scale, tr: 24 * scale, br: 0, bl: 0 });
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
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2);
      ctx.fill();

      ctx.fillStyle = colors.badgeText;
      ctx.font = `bold ${Math.round(16 * scale)}px ${bannerFontStack}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayBannerText, w / 2, badgeY + badgeH / 2 + (1 * scale));
    }
  }

  // Title rendering
  ctx.fillStyle = colors.textColor;
  ctx.font = `bold ${Math.round(24 * scale)}px ${titleFontStack}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const titleY = 580 * scale;

  let titleX = w / 2;
  const titleText = title || 'Escanea el código QR';
  const iconSizeCalc = (iconOpts.iconSize || 34) * scale;

  // Render Vector Icon relative to Title if position is above, below, left, right
  if (iconOpts.showIcon && iconOpts.iconPosition && iconOpts.iconPosition !== 'center') {
    const iconColor = iconOpts.iconColor || colors.textColor;

    if (iconOpts.iconPosition === 'left') {
      const titleW = ctx.measureText(titleText).width;
      drawVectorIcon(ctx, iconOpts.iconName, (w - titleW) / 2 - (28 * scale), titleY, iconSizeCalc * 0.8, iconColor);
      ctx.fillStyle = colors.textColor;
      ctx.font = `bold ${Math.round(24 * scale)}px ${titleFontStack}`;
      ctx.fillText(titleText, titleX + (14 * scale), titleY);
    } else if (iconOpts.iconPosition === 'right') {
      const titleW = ctx.measureText(titleText).width;
      drawVectorIcon(ctx, iconOpts.iconName, (w + titleW) / 2 + (28 * scale), titleY, iconSizeCalc * 0.8, iconColor);
      ctx.fillStyle = colors.textColor;
      ctx.font = `bold ${Math.round(24 * scale)}px ${titleFontStack}`;
      ctx.fillText(titleText, titleX - (14 * scale), titleY);
    } else if (iconOpts.iconPosition === 'above') {
      drawVectorIcon(ctx, iconOpts.iconName, w / 2, titleY - (32 * scale), iconSizeCalc * 0.85, iconColor);
      ctx.fillStyle = colors.textColor;
      ctx.font = `bold ${Math.round(24 * scale)}px ${titleFontStack}`;
      ctx.fillText(titleText, titleX, titleY + (10 * scale));
    } else if (iconOpts.iconPosition === 'below') {
      ctx.fillStyle = colors.textColor;
      ctx.font = `bold ${Math.round(24 * scale)}px ${titleFontStack}`;
      ctx.fillText(titleText, titleX, titleY - (10 * scale));
      drawVectorIcon(ctx, iconOpts.iconName, w / 2, titleY + (28 * scale), iconSizeCalc * 0.85, iconColor);
    }
  } else {
    ctx.fillText(titleText, titleX, titleY);
  }

  // Subtitle / Banner Text pill tag
  if (!isHeaderStyle && displayBannerText) {
    ctx.font = `bold ${Math.round(16 * scale)}px ${bannerFontStack}`;
    const textWidth = ctx.measureText(displayBannerText).width;
    const subW = Math.max(180 * scale, Math.min(420 * scale, textWidth + 40 * scale));
    const subH = 40 * scale;
    const subX = (w - subW) / 2;
    const subY = 635 * scale;

    ctx.fillStyle = colors.badgeBg;
    roundRect(ctx, subX, subY, subW, subH, 20 * scale);
    ctx.fill();

    ctx.fillStyle = colors.badgeText;
    ctx.font = `bold ${Math.round(16 * scale)}px ${bannerFontStack}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayBannerText, w / 2, subY + subH / 2 + (1 * scale));
  }

  ctx.restore();
}

app.listen(PORT, () => {
  console.log(`Servidor QR Generator corriendo en http://localhost:${PORT}`);
});
