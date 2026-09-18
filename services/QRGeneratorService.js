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
      ],
      'Comunidad': [
        { name: 'Voluntariado Social', bg: '#f0fdf4', qr: '#15803d', frame: '#22c55e', icon: 'fa-hands-holding-child', fontT: 'Montserrat', fontB: 'Poppins', banner: 'SUMATE HOY', dot: 'smooth', eye: 'rounded' },
        { name: 'Centro Vecinal', bg: '#fff7ed', qr: '#c2410c', frame: '#ea580c', icon: 'fa-people-roof', fontT: 'Outfit', fontB: 'Comfortaa', banner: 'TU BARRIO', dot: 'rounded', eye: 'rounded' },
        { name: 'Foro & Debate', bg: '#eff6ff', qr: '#1d4ed8', frame: '#3b82f6', icon: 'fa-comments', fontT: 'Poppins', fontB: 'Space Grotesk', banner: 'PARTICIPA', dot: 'dots', eye: 'circle' },
        { name: 'Club de Lectura', bg: '#fdf4ff', qr: '#86198f', frame: '#a21caf', icon: 'fa-book-open-reader', fontT: 'Lora', fontB: 'Cinzel', banner: 'CLUB LECTOR', dot: 'hexagon', eye: 'square' },
        { name: 'Donaciones & Ayuda', bg: '#fef2f2', qr: '#b91c1c', frame: '#ef4444', icon: 'fa-hand-holding-heart', fontT: 'Righteous', fontB: 'Outfit', banner: 'DONAR AHORA', dot: 'heart', eye: 'circle' },
        { name: 'Adopción de Mascotas', bg: '#f7fee7', qr: '#3f6212', frame: '#65a30d', icon: 'fa-paw', fontT: 'Comfortaa', fontB: 'Pacifico', banner: 'ADOPTA UN AMIGO', dot: 'star', eye: 'rounded' },
        { name: 'Comunidad Eco Green', bg: '#ecfdf5', qr: '#047857', frame: '#10b981', icon: 'fa-seedling', fontT: 'Plus Jakarta Sans', fontB: 'Poppins', banner: 'ECO COMUNIDAD', dot: 'smooth', eye: 'circle' },
        { name: 'Red Solidaria', bg: '#0f172a', qr: '#38bdf8', frame: '#38bdf8', icon: 'fa-network-wired', fontT: 'Outfit', fontB: 'Space Grotesk', banner: 'UNIDOS HOY', dot: 'diamond', eye: 'square' },
        { name: 'Asociación Civil', bg: '#ffffff', qr: '#334155', frame: '#475569', icon: 'fa-users', fontT: 'Montserrat', fontB: 'Plus Jakarta Sans', banner: 'ASOCIACIÓN', dot: 'square', eye: 'square' },
        { name: 'Encuentro Vecinal', bg: '#fffbebf', qr: '#b45309', frame: '#f59e0b', icon: 'fa-handshake', fontT: 'Playfair Display', fontB: 'Lora', banner: 'UNETE AL FORO', dot: 'ring', eye: 'rounded' }
      ],
      'Gastronomía': [
        { name: 'Menú Digital QR', bg: '#0f172a', qr: '#f59e0b', frame: '#fbbf24', icon: 'fa-utensils', fontT: 'Cinzel', fontB: 'Montserrat', banner: 'VER MENÚ', dot: 'rounded', eye: 'circle' },
        { name: 'Café Specialty', bg: '#fff7ed', qr: '#78350f', frame: '#92400e', icon: 'fa-mug-hot', fontT: 'Caveat', fontB: 'Outfit', banner: 'CARTA DE CAFÉS', dot: 'smooth', eye: 'rounded' },
        { name: 'Pizzería Artesanal', bg: '#fef2f2', qr: '#991b1b', frame: '#dc2626', icon: 'fa-pizza-slice', fontT: 'Bebas Neue', fontB: 'Righteous', banner: 'PEDIR PIZZA', dot: 'dots', eye: 'square' },
        { name: 'Burger & Craft Beer', bg: '#18181b', qr: '#eab308', frame: '#eab308', icon: 'fa-burger', fontT: 'Oswald', fontB: 'Bebas Neue', banner: 'BURGER MENU', dot: 'hexagon', eye: 'square' },
        { name: 'Sushi Bar Premium', bg: '#09090b', qr: '#ef4444', frame: '#f87171', icon: 'fa-fish', fontT: 'Space Grotesk', fontB: 'Outfit', banner: 'SUSHI & OMAKASE', dot: 'diamond', eye: 'circle' },
        { name: 'Cata de Vinos', bg: '#2e1065', qr: '#f43f5e', frame: '#fb7185', icon: 'fa-wine-glass-empty', fontT: 'Playfair Display', fontB: 'Lora', banner: 'CARTA DE VINOS', dot: 'ring', eye: 'rounded' },
        { name: 'Pastelería & Bakery', bg: '#fdf4ff', qr: '#c026d3', frame: '#e879f9', icon: 'fa-cake-candles', fontT: 'Pacifico', fontB: 'Comfortaa', banner: 'DULCES & PASTEL', dot: 'heart', eye: 'circle' },
        { name: 'Cocktail & Lounge Bar', bg: '#0c4a6e', qr: '#38bdf8', frame: '#38bdf8', icon: 'fa-martini-glass-citrus', fontT: 'Righteous', fontB: 'Outfit', banner: 'CÓCTELES VIP', dot: 'sparkle', eye: 'square' },
        { name: 'Restaurante Gourmet', bg: '#ffffff', qr: '#111827', frame: '#d97706', icon: 'fa-plate-wheat', fontT: 'Abril Fatface', fontB: 'Montserrat', banner: 'RESERVAR MESA', dot: 'square', eye: 'square' },
        { name: 'Food Truck Express', bg: '#ecfeff', qr: '#0e7490', frame: '#06b6d4', icon: 'fa-truck-fast', fontT: 'Anton', fontB: 'Poppins', banner: 'ORDEN RÁPIDA', dot: 'star', eye: 'rounded' }
      ],
      'Tecnología': [
        { name: 'Soporte Técnico 24/7', bg: '#09090b', qr: '#06b6d4', frame: '#06b6d4', icon: 'fa-headset', fontT: 'Space Grotesk', fontB: 'Fira Code', banner: 'SOPORTE 24/7', dot: 'dots', eye: 'square' },
        { name: 'App iOS & Android', bg: '#0f172a', qr: '#3b82f6', frame: '#60a5fa', icon: 'fa-mobile-screen-button', fontT: 'Outfit', fontB: 'Plus Jakarta Sans', banner: 'DESCARGAR APP', dot: 'rounded', eye: 'circle' },
        { name: 'Software SaaS Cloud', bg: '#172554', qr: '#38bdf8', frame: '#38bdf8', icon: 'fa-cloud', fontT: 'Space Grotesk', fontB: 'Poppins', banner: 'PRUEBA GRATIS', dot: 'hexagon', eye: 'circle' },
        { name: 'WiFi Ultra Rápido', bg: '#022c22', qr: '#10b981', frame: '#34d399', icon: 'fa-wifi', fontT: 'Fira Code', fontB: 'Space Grotesk', banner: 'CONECTAR WIFI', dot: 'sparkle', eye: 'square' },
        { name: 'Ciberseguridad Shield', bg: '#0f172a', qr: '#eab308', frame: '#fde047', icon: 'fa-shield-halved', fontT: 'Montserrat', fontB: 'Outfit', banner: 'ACCESO SEGURO', dot: 'diamond', eye: 'square' },
        { name: 'DevOps & Code Repo', bg: '#18181b', qr: '#a855f7', frame: '#c026d3', icon: 'fa-code', fontT: 'Fira Code', fontB: 'Fira Code', banner: 'VER REPOSITORIO', dot: 'square', eye: 'square' },
        { name: 'IA & Automation Pro', bg: '#2e1065', qr: '#ec4899', frame: '#f43f5e', icon: 'fa-microchip', fontT: 'Righteous', fontB: 'Space Grotesk', banner: 'DESCUBRE LA IA', dot: 'star', eye: 'circle' },
        { name: 'Tienda Tech & Gadgets', bg: '#ffffff', qr: '#0284c7', frame: '#0369a1', icon: 'fa-laptop', fontT: 'Outfit', fontB: 'Montserrat', banner: 'VER GADGETS', dot: 'smooth', eye: 'rounded' },
        { name: 'Blockchain Crypto', bg: '#09090b', qr: '#f97316', frame: '#fb923c', icon: 'fa-cubes', fontT: 'Space Grotesk', fontB: 'Righteous', banner: 'CRYPTO WALLET', dot: 'hexagon', eye: 'square' },
        { name: 'Startup Tech Demo', bg: '#eff6ff', qr: '#2563eb', frame: '#3b82f6', icon: 'fa-rocket', fontT: 'Plus Jakarta Sans', fontB: 'Poppins', banner: 'VER DEMO', dot: 'ring', eye: 'circle' }
      ],
      'Salud': [
        { name: 'Cita Médica Online', bg: '#f0f9ff', qr: '#0284c7', frame: '#0369a1', icon: 'fa-user-doctor', fontT: 'Montserrat', fontB: 'Plus Jakarta Sans', banner: 'AGENDAR CITA', dot: 'rounded', eye: 'rounded' },
        { name: 'Farmacia & Recetas', bg: '#f0fdf4', qr: '#166534', frame: '#22c55e', icon: 'fa-pills', fontT: 'Poppins', fontB: 'Comfortaa', banner: 'PEDIR RECETA', dot: 'smooth', eye: 'circle' },
        { name: 'Clínica Dental', bg: '#ffffff', qr: '#0891b2', frame: '#06b6d4', icon: 'fa-tooth', fontT: 'Outfit', fontB: 'Poppins', banner: 'CONSULTA DENTAL', dot: 'sparkle', eye: 'circle' },
        { name: 'Urgencias 24h', bg: '#fef2f2', qr: '#dc2626', frame: '#ef4444', icon: 'fa-truck-medical', fontT: 'Righteous', fontB: 'Bebas Neue', banner: 'URGENCIAS 24H', dot: 'square', eye: 'square' },
        { name: 'Laboratorio Clínico', bg: '#ecfeff', qr: '#0f766e', frame: '#14b8a6', icon: 'fa-microscope', fontT: 'Space Grotesk', fontB: 'Outfit', banner: 'RESULTADOS', dot: 'hexagon', eye: 'rounded' },
        { name: 'Pediatría Care', bg: '#fdf4ff', qr: '#701a75', frame: '#c026d3', icon: 'fa-heart-pulse', fontT: 'Comfortaa', fontB: 'Poppins', banner: 'SALUD INFANTIL', dot: 'heart', eye: 'circle' },
        { name: 'Óptica & Visión', bg: '#f8fafc', qr: '#334155', frame: '#475569', icon: 'fa-glasses', fontT: 'Lora', fontB: 'Montserrat', banner: 'EXAMEN VISUAL', dot: 'dots', eye: 'rounded' },
        { name: 'Rehabilitación & Physio', bg: '#f7fee7', qr: '#4d7c0f', frame: '#84cc16', icon: 'fa-person-walking', fontT: 'Plus Jakarta Sans', fontB: 'Outfit', banner: 'FISIOTERAPIA', dot: 'diamond', eye: 'circle' },
        { name: 'Psicología & Wellness', bg: '#faf5ff', qr: '#6b21a8', frame: '#9333ea', icon: 'fa-brain', fontT: 'Playfair Display', fontB: 'Lora', banner: 'SESIÓN ONLINE', dot: 'ring', eye: 'rounded' },
        { name: 'Centro Cardiológico', bg: '#fff1f2', qr: '#be123c', frame: '#f43f5e', icon: 'fa-heart', fontT: 'Outfit', fontB: 'Poppins', banner: 'CARDIOLOGÍA', dot: 'star', eye: 'circle' }
      ],
      'Viajes': [
        { name: 'Pase de Abordaje VIP', bg: '#0f172a', qr: '#38bdf8', frame: '#38bdf8', icon: 'fa-plane-departure', fontT: 'Outfit', fontB: 'Space Grotesk', banner: 'BOARDING PASS', dot: 'dots', eye: 'square' },
        { name: 'Hotel & Resort Deluxe', bg: '#fffbebf', qr: '#b45309', frame: '#d97706', icon: 'fa-hotel', fontT: 'Cinzel', fontB: 'Playfair Display', banner: 'RESERVA HOTEL', dot: 'diamond', eye: 'rounded' },
        { name: 'Agencia de Tours', bg: '#ecfeff', qr: '#0891b2', frame: '#06b6d4', icon: 'fa-compass', fontT: 'Pacifico', fontB: 'Montserrat', banner: 'VER TOURS', dot: 'star', eye: 'circle' },
        { name: 'Playa & Tropico Beach', bg: '#f0f9ff', qr: '#0284c7', frame: '#38bdf8', icon: 'fa-sun', fontT: 'Righteous', fontB: 'Comfortaa', banner: 'PACK PLAYA', dot: 'smooth', eye: 'circle' },
        { name: 'Senderismo & Trekking', bg: '#f7fee7', qr: '#365314', frame: '#65a30d', icon: 'fa-mountain', fontT: 'Oswald', fontB: 'Plus Jakarta Sans', banner: 'RUTA SENDERISMO', dot: 'hexagon', eye: 'square' },
        { name: 'Cruceros & Yachtt', bg: '#0c4a6e', qr: '#00d8f6', frame: '#38bdf8', icon: 'fa-ship', fontT: 'Montserrat', fontB: 'Outfit', banner: 'CRUCERO VIP', dot: 'ring', eye: 'circle' },
        { name: 'Guía Turística QR', bg: '#ffffff', qr: '#1e293b', frame: '#ea580c', icon: 'fa-map-location-dot', fontT: 'Poppins', fontB: 'Roboto', banner: 'GUÍA CIUDAD', dot: 'rounded', eye: 'rounded' },
        { name: 'Alquiler de Autos', bg: '#18181b', qr: '#f97316', frame: '#fb923c', icon: 'fa-car', fontT: 'Bebas Neue', fontB: 'Outfit', banner: 'RENT A CAR', dot: 'square', eye: 'square' },
        { name: 'Experiencia Safari', bg: '#fff7ed', qr: '#c2410c', frame: '#f97316', icon: 'fa-binoculars', fontT: 'Playfair Display', fontB: 'Lora', banner: 'SAFARI TOUR', dot: 'sparkle', eye: 'rounded' },
        { name: 'Check-in Expres', bg: '#fdf4ff', qr: '#a21caf', frame: '#c026d3', icon: 'fa-ticket', fontT: 'Space Grotesk', fontB: 'Poppins', banner: 'CHECK-IN RÁPIDO', dot: 'heart', eye: 'circle' }
      ],
      'Inmobiliaria': [
        { name: 'Propiedad en Venta', bg: '#ffffff', qr: '#0f172a', frame: '#2563eb', icon: 'fa-house', fontT: 'Montserrat', fontB: 'Outfit', banner: 'VER PROPIEDAD', dot: 'square', eye: 'square' },
        { name: 'Penthouse de Lujo', bg: '#0f172a', qr: '#fbbf24', frame: '#fbbf24', icon: 'fa-building', fontT: 'Cinzel', fontB: 'Playfair Display', banner: 'PENTHOUSE VIP', dot: 'diamond', eye: 'square' },
        { name: 'Alquiler de Departamento', bg: '#f0f9ff', qr: '#0284c7', frame: '#0369a1', icon: 'fa-key', fontT: 'Poppins', fontB: 'Plus Jakarta Sans', banner: 'VER ALQUILER', dot: 'rounded', eye: 'rounded' },
        { name: 'Agente Inmobiliario', bg: '#f8fafc', qr: '#1e293b', frame: '#475569', icon: 'fa-user-tie', fontT: 'Outfit', fontB: 'Montserrat', banner: 'MI CONTACTO', dot: 'smooth', eye: 'rounded' },
        { name: 'Tour Virtual 360°', bg: '#09090b', qr: '#06b6d4', frame: '#06b6d4', icon: 'fa-vr-cardboard', fontT: 'Space Grotesk', fontB: 'Fira Code', banner: 'TOUR 360°', dot: 'dots', eye: 'circle' },
        { name: 'Terrenos & Lotes', bg: '#f7fee7', qr: '#365314', frame: '#65a30d', icon: 'fa-vector-square', fontT: 'Oswald', fontB: 'Plus Jakarta Sans', banner: 'VER LOTES', dot: 'hexagon', eye: 'square' },
        { name: 'Oficinas Corporativas', bg: '#1e1b4b', qr: '#818cf8', frame: '#a5b4fc', icon: 'fa-briefcase', fontT: 'Lora', fontB: 'Outfit', banner: 'OFICINAS PRO', dot: 'ring', eye: 'rounded' },
        { name: 'Firma de Contrato', bg: '#fffbebf', qr: '#78350f', frame: '#d97706', icon: 'fa-file-signature', fontT: 'Cinzel', fontB: 'Lora', banner: 'AGENDAR FIRMA', dot: 'sparkle', eye: 'rounded' },
        { name: 'Casa de Campo', bg: '#f0fdf4', qr: '#166534', frame: '#22c55e', icon: 'fa-tree', fontT: 'Pacifico', fontB: 'Comfortaa', banner: 'CASA DE CAMPO', dot: 'star', eye: 'circle' },
        { name: 'Condominio Beach', bg: '#ecfeff', qr: '#0891b2', frame: '#06b6d4', icon: 'fa-water', fontT: 'Righteous', fontB: 'Poppins', banner: 'DEPO PLAYA', dot: 'heart', eye: 'circle' }
      ],
      'Educación': [
        { name: 'Campus Virtual', bg: '#0f172a', qr: '#38bdf8', frame: '#38bdf8', icon: 'fa-graduation-cap', fontT: 'Outfit', fontB: 'Plus Jakarta Sans', banner: 'AULA VIRTUAL', dot: 'dots', eye: 'circle' },
        { name: 'Universidad Oficial', bg: '#ffffff', qr: '#1e3a8a', frame: '#1d4ed8', icon: 'fa-school', fontT: 'Cinzel', fontB: 'Montserrat', banner: 'ADMISIÓN 2026', dot: 'square', eye: 'square' },
        { name: 'Curso Online Certificado', bg: '#faf5ff', qr: '#7e22ce', frame: '#a855f7', icon: 'fa-certificate', fontT: 'Righteous', fontB: 'Poppins', banner: 'INSCRIBIRSE', dot: 'hexagon', eye: 'rounded' },
        { name: 'Biblioteca Digital', bg: '#fff7ed', qr: '#c2410c', frame: '#f97316', icon: 'fa-book', fontT: 'Lora', fontB: 'Outfit', banner: 'VER LIBROS', dot: 'rounded', eye: 'rounded' },
        { name: 'Academia de Idiomas', bg: '#f0f9ff', qr: '#0369a1', frame: '#0284c7', icon: 'fa-language', fontT: 'Poppins', fontB: 'Comfortaa', banner: 'APRENDER HOY', dot: 'smooth', eye: 'circle' },
        { name: 'Masterclass Live', bg: '#18181b', qr: '#f43f5e', frame: '#fb7185', icon: 'fa-video', fontT: 'Space Grotesk', fontB: 'Outfit', banner: 'VER MASTERCLASS', dot: 'sparkle', eye: 'circle' },
        { name: 'Tutoría Personalizada', bg: '#f0fdf4', qr: '#15803d', frame: '#4ade80', icon: 'fa-user-graduate', fontT: 'Comfortaa', fontB: 'Plus Jakarta Sans', banner: 'PEDIR TUTOR', dot: 'diamond', eye: 'rounded' },
        { name: 'Examen & Evaluación', bg: '#fef2f2', qr: '#b91c1c', frame: '#ef4444', icon: 'fa-pen-to-square', fontT: 'Roboto', fontB: 'Poppins', banner: 'INICIAR TEST', dot: 'star', eye: 'square' },
        { name: 'Escuela de Música', bg: '#2e1065', qr: '#c026d3', frame: '#e879f9', icon: 'fa-music', fontT: 'Pacifico', fontB: 'Lora', banner: 'CLASES DE MÚSICA', dot: 'ring', eye: 'circle' },
        { name: 'Bootcamp Code', bg: '#09090b', qr: '#10b981', frame: '#34d399', icon: 'fa-laptop-code', fontT: 'Fira Code', fontB: 'Fira Code', banner: 'FULLSTACK 2026', dot: 'square', eye: 'square' }
      ],
      'Eventos': [
        { name: 'Pase VIP Conferencia', bg: '#09090b', qr: '#a855f7', frame: '#c026d3', icon: 'fa-ticket', fontT: 'Space Grotesk', fontB: 'Outfit', banner: 'ENTRADA VIP', dot: 'hexagon', eye: 'square' },
        { name: 'Boda & Casamiento', bg: '#fff1f2', qr: '#be123c', frame: '#fb7185', icon: 'fa-heart', fontT: 'Great Vibes', fontB: 'Satisfy', banner: 'NUESTRA BODA', dot: 'heart', eye: 'circle' },
        { name: 'Cumpleaños Party', bg: '#fdf4ff', qr: '#c026d3', frame: '#e879f9', icon: 'fa-cake-candles', fontT: 'Pacifico', fontB: 'Poppins', banner: 'INVITACIÓN CUMPLE', dot: 'sparkle', eye: 'circle' },
        { name: 'Expo Empresarial', bg: '#ffffff', qr: '#0f172a', frame: '#2563eb', icon: 'fa-calendar-days', fontT: 'Montserrat', fontB: 'Outfit', banner: 'REGISTRO EXPO', dot: 'square', eye: 'square' },
        { name: 'Festival de Música', bg: '#18181b', qr: '#f59e0b', frame: '#fbbf24', icon: 'fa-microphone', fontT: 'Righteous', fontB: 'Bebas Neue', banner: 'LINEUP & TICKETS', dot: 'dots', eye: 'circle' },
        { name: 'Networking Night', bg: '#0f172a', qr: '#38bdf8', frame: '#38bdf8', icon: 'fa-users-between-lines', fontT: 'Outfit', fontB: 'Space Grotesk', banner: 'NETWORKING VIP', dot: 'rounded', eye: 'rounded' },
        { name: 'Seminario Web', bg: '#eff6ff', qr: '#1d4ed8', frame: '#3b82f6', icon: 'fa-display', fontT: 'Poppins', fontB: 'Plus Jakarta Sans', banner: 'UNIRSE AL WEBINAR', dot: 'smooth', eye: 'circle' },
        { name: 'Gala de Premiación', bg: '#0f172a', qr: '#eab308', frame: '#fde047', icon: 'fa-trophy', fontT: 'Cinzel', fontB: 'Playfair Display', banner: 'PREMIACIÓN 2026', dot: 'diamond', eye: 'square' },
        { name: 'Torneo eSports', bg: '#022c22', qr: '#10b981', frame: '#34d399', icon: 'fa-gamepad', fontT: 'Press Start 2P', fontB: 'Space Grotesk', banner: 'TORNEO ESPORTS', dot: 'star', eye: 'square' },
        { name: 'Feria Gastronómica', bg: '#fff7ed', qr: '#c2410c', frame: '#f97316', icon: 'fa-utensils', fontT: 'Bebas Neue', fontB: 'Comfortaa', banner: 'ENTRADAS FERIA', dot: 'ring', eye: 'rounded' }
      ],
      'Redes Sociales': [
        { name: 'WhatsApp Direct Chat', bg: '#f0fdf4', qr: '#16a34a', frame: '#22c55e', icon: 'fa-brands fa-whatsapp', fontT: 'Outfit', fontB: 'Poppins', banner: 'CHAT WHATSAPP', dot: 'smooth', eye: 'circle' },
        { name: 'Instagram Perfil Official', bg: '#fdf4ff', qr: '#e1306c', frame: '#f77737', icon: 'fa-brands fa-instagram', fontT: 'Poppins', fontB: 'Space Grotesk', banner: 'SEGUIR EN IG', dot: 'dots', eye: 'rounded' },
        { name: 'TikTok Trend Channel', bg: '#09090b', qr: '#00f2fe', frame: '#ff0050', icon: 'fa-brands fa-tiktok', fontT: 'Space Grotesk', fontB: 'Righteous', banner: 'TIKTOK CHANNEL', dot: 'sparkle', eye: 'square' },
        { name: 'Canal de YouTube', bg: '#fef2f2', qr: '#dc2626', frame: '#ef4444', icon: 'fa-brands fa-youtube', fontT: 'Bebas Neue', fontB: 'Outfit', banner: 'SUSCRIBIRSE', dot: 'square', eye: 'square' },
        { name: 'Facebook Fanpage', bg: '#eff6ff', qr: '#1877f2', frame: '#3b82f6', icon: 'fa-brands fa-facebook', fontT: 'Montserrat', fontB: 'Poppins', banner: 'SEGUIR EN FB', dot: 'rounded', eye: 'circle' },
        { name: 'LinkedIn Profesional', bg: '#f8fafc', qr: '#0a66c2', frame: '#0284c7', icon: 'fa-brands fa-linkedin', fontT: 'Outfit', fontB: 'Plus Jakarta Sans', banner: 'CONECTAR LINKEDIN', dot: 'diamond', eye: 'square' },
        { name: 'X Twitter Feed', bg: '#000000', qr: '#ffffff', frame: '#ffffff', icon: 'fa-brands fa-x-twitter', fontT: 'Space Grotesk', fontB: 'Fira Code', banner: 'SIGUENOS EN X', dot: 'dots', eye: 'square' },
        { name: 'Canal Telegram', bg: '#f0f9ff', qr: '#229ed9', frame: '#38bdf8', icon: 'fa-brands fa-telegram', fontT: 'Poppins', fontB: 'Comfortaa', banner: 'CANAL TELEGRAM', dot: 'hexagon', eye: 'circle' },
        { name: 'Servidor Discord', bg: '#1e1b4b', qr: '#5865f2', frame: '#818cf8', icon: 'fa-brands fa-discord', fontT: 'Righteous', fontB: 'Outfit', banner: 'UNIRSE A DISCORD', dot: 'star', eye: 'rounded' },
        { name: 'Spotify Playlist', bg: '#052e16', qr: '#1db954', frame: '#22c55e', icon: 'fa-brands fa-spotify', fontT: 'Outfit', fontB: 'Space Grotesk', banner: 'PLAYLIST SPOTIFY', dot: 'ring', eye: 'circle' }
      ],
      'Lujo': [
        { name: 'Onyx Gold Exclusive', bg: '#09090b', qr: '#d97706', frame: '#fbbf24', icon: 'fa-crown', fontT: 'Cinzel', fontB: 'Playfair Display', banner: 'EXCLUSIVO VIP', dot: 'diamond', eye: 'square' },
        { name: 'Platinum Reserve', bg: '#0f172a', qr: '#e2e8f0', frame: '#94a3b8', icon: 'fa-gem', fontT: 'Cinzel', fontB: 'Lora', banner: 'RESERVA PLATINUM', dot: 'dots', eye: 'circle' },
        { name: 'Rose Gold Elegance', bg: '#fff1f2', qr: '#be123c', frame: '#fda4af', icon: 'fa-sparkles', fontT: 'Great Vibes', fontB: 'Playfair Display', banner: 'EDICIÓN LIMITADA', dot: 'sparkle', eye: 'circle' },
        { name: 'Black Card VIP', bg: '#000000', qr: '#f59e0b', frame: '#eab308', icon: 'fa-credit-card', fontT: 'Space Grotesk', fontB: 'Outfit', banner: 'MEMBRESÍA BLACK', dot: 'square', eye: 'square' },
        { name: 'Alta Costura Paris', bg: '#ffffff', qr: '#111827', frame: '#d97706', icon: 'fa-shirt', fontT: 'Abril Fatface', fontB: 'Cinzel', banner: 'ALTA COSTURA', dot: 'hexagon', eye: 'rounded' },
        { name: 'Relojería Suiza', bg: '#0f172a', qr: '#38bdf8', frame: '#0284c7', icon: 'fa-clock', fontT: 'Cinzel', fontB: 'Montserrat', banner: 'COLECCIÓN SUIZA', dot: 'ring', eye: 'circle' },
        { name: 'Autos Superdeportivos', bg: '#450a0a', qr: '#ef4444', frame: '#f87171', icon: 'fa-car-side', fontT: 'Bebas Neue', fontB: 'Righteous', banner: 'SUPERCAR VIP', dot: 'star', eye: 'square' },
        { name: 'Yate & Marina Royale', bg: '#0c4a6e', qr: '#38bdf8', frame: '#7dd3fc', icon: 'fa-anchor', fontT: 'Playfair Display', fontB: 'Outfit', banner: 'YACHT CLUB', dot: 'rounded', eye: 'circle' },
        { name: 'Champagne Private Cellar', bg: '#1c1917', qr: '#eab308', frame: '#fde047', icon: 'fa-wine-bottle', fontT: 'Cinzel', fontB: 'Lora', banner: 'PRIVATE CELLAR', dot: 'smooth', eye: 'rounded' },
        { name: 'Mansión Privada Real', bg: '#18181b', qr: '#fbbf24', frame: '#ffffff', icon: 'fa-castle', fontT: 'Cinzel', fontB: 'Playfair Display', banner: 'MANSIÓN PRIVADA', dot: 'diamond', eye: 'square' }
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

    let rawName = (iconName || '').toLowerCase().trim();
    let name = rawName
      .replace(/fa-brands|fa-solid|fa-regular|bi-|\bti-\b|\bti\b|material:|ms-/g, '')
      .trim();
    name = name.replace(/^fa-|^bi-|^ti-/, '').trim();
    name = name.replace(/[^a-z0-9_-]/g, '').trim();

    const aliasMap = {
      'hospital': 'hospital', 'local_hospital': 'hospital', 'first-aid-kit': 'hospital', 'first_aid_kit': 'hospital',
      'building-store': 'store', 'storefront': 'store', 'shop': 'store', 'store': 'store',
      'building': 'building', 'domain': 'building',
      'heart-filled': 'heart', 'heart-fill': 'heart', 'favorite': 'heart', 'heart': 'heart',
      'star-filled': 'star', 'star-fill': 'star', 'star': 'star',
      'cart3': 'cart-shopping', 'shopping-cart': 'cart-shopping', 'shopping_cart': 'cart-shopping', 'cart': 'cart-shopping',
      'car-front': 'car', 'directions_car': 'car', 'car': 'car',
      'geo-alt': 'location-dot', 'location_on': 'location-dot', 'map-pin': 'location-dot', 'map-2': 'location-dot', 'pin': 'location-dot',
      'telephone': 'phone', 'call': 'phone', 'phone': 'phone',
      'messages': 'comments', 'chat-dots': 'comments', 'chat': 'comments', 'comment': 'comments',
      'school': 'graduation-cap', 'mortarboard': 'graduation-cap', 'cap': 'graduation-cap',
      'cup-hot': 'coffee', 'cup': 'coffee', 'local_cafe': 'coffee', 'coffee': 'coffee',
      'lightning-charge': 'bolt', 'bolt': 'bolt',
      'shield-check': 'shield-halved', 'shield': 'shield-halved',
      'movie': 'film', 'film': 'film',
      'photo_camera': 'camera', 'camera': 'camera',
      'device-gamepad': 'gamepad', 'controller': 'gamepad', 'sports_esports': 'gamepad', 'gamepad': 'gamepad',
      'device-laptop': 'laptop', 'computer': 'laptop', 'laptop': 'laptop',
      'thumb-up': 'thumbs-up', 'hand-thumbs-up': 'thumbs-up', 'thumbs-up': 'thumbs-up',
      'info-circle': 'circle-info', 'info': 'circle-info',
      'card_giftcard': 'gift', 'gift': 'gift',
      'beach_access': 'umbrella', 'umbrella': 'umbrella',
      'qr-code': 'qrcode', 'qr_code_2': 'qrcode', 'qrcode': 'qrcode',
      'dove': 'dove', 'bird': 'dove', 'twitter': 'dove', 'x-twitter': 'dove', 'brand-twitter': 'dove', 'crow': 'dove', 'kiwi-bird': 'dove',
      'fish': 'fish', 'fish-fins': 'fish', 'shrimp': 'fish',
      'horse': 'horse', 'frog': 'frog', 'dragon': 'dragon',
      'spider': 'spider', 'bugs': 'bug', 'bug': 'bug', 'worm': 'bug', 'locust': 'bug', 'mosquito': 'bug',
      'feather': 'feather', 'hippo': 'hippo', 'otter': 'otter', 'cow': 'cow',
      'tree': 'tree', 'trees': 'tree', 'plant': 'tree', 'seedling': 'tree', 'seeding': 'tree', 'leaf': 'tree', 'flower': 'tree', 'cactus': 'tree', 'clover': 'tree', 'spa': 'tree',
      'mountain': 'mountain', 'volcano': 'mountain',
      'water': 'water', 'ripple': 'water', 'tsunami': 'water', 'earth-oceania': 'water',
      'wind': 'wind', 'smog': 'wind', 'snowflake': 'snowflake', 'icicles': 'snowflake', 'cannabis': 'tree',
      'butterfly': 'butterfly', 'bone': 'bone', 'egg': 'egg'
    };

    if (aliasMap[name]) {
      name = aliasMap[name];
    }

    ctx.beginPath();
    switch (name) {
      case 'dove':
      case 'twitter':
      case 'x-twitter':
      case 'bird':
      case 'brand-twitter':
      case 'crow':
      case 'kiwi-bird':
        ctx.beginPath();
        // Tail bottom left
        ctx.moveTo(cx - size * 0.38, cy + size * 0.28);
        // Fan tail notch
        ctx.lineTo(cx - size * 0.26, cy + size * 0.18);
        // Underbelly to chest
        ctx.bezierCurveTo(cx - size * 0.1, cy + size * 0.24, cx + size * 0.12, cy + size * 0.18, cx + size * 0.24, cy + size * 0.04);
        // Beak lower edge and tip
        ctx.lineTo(cx + size * 0.44, cy - size * 0.08);
        // Beak upper edge to head
        ctx.lineTo(cx + size * 0.28, cy - size * 0.14);
        // Head crown curving to wing root
        ctx.bezierCurveTo(cx + size * 0.26, cy - size * 0.32, cx + size * 0.08, cy - size * 0.38, cx - size * 0.05, cy - size * 0.22);
        // Wing up to top left tip
        ctx.bezierCurveTo(cx - size * 0.14, cy - size * 0.44, cx - size * 0.28, cy - size * 0.42, cx - size * 0.22, cy - size * 0.22);
        ctx.bezierCurveTo(cx - size * 0.18, cy - size * 0.12, cx - size * 0.15, cy - size * 0.02, cx - size * 0.3, cy + size * 0.08);
        ctx.closePath();
        ctx.fill();
        // Eye detail
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx + size * 0.18, cy - size * 0.14, size * 0.04, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'fish':
        ctx.moveTo(cx + size * 0.35, cy);
        ctx.quadraticCurveTo(cx, cy - size * 0.35, cx - size * 0.2, cy);
        ctx.lineTo(cx - size * 0.4, cy - size * 0.2);
        ctx.lineTo(cx - size * 0.32, cy);
        ctx.lineTo(cx - size * 0.4, cy + size * 0.2);
        ctx.lineTo(cx - size * 0.2, cy);
        ctx.quadraticCurveTo(cx, cy + size * 0.35, cx + size * 0.35, cy);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx + size * 0.2, cy - size * 0.06, size * 0.04, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'tree':
        ctx.moveTo(cx, cy - size * 0.42);
        ctx.lineTo(cx + size * 0.35, cy + size * 0.05);
        ctx.lineTo(cx + size * 0.15, cy + size * 0.05);
        ctx.lineTo(cx + size * 0.4, cy + size * 0.25);
        ctx.lineTo(cx - size * 0.4, cy + size * 0.25);
        ctx.lineTo(cx - size * 0.15, cy + size * 0.05);
        ctx.lineTo(cx - size * 0.35, cy + size * 0.05);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(cx - size * 0.08, cy + size * 0.25, size * 0.16, size * 0.2);
        break;

      case 'feather':
        ctx.moveTo(cx - size * 0.35, cy + size * 0.4);
        ctx.lineTo(cx + size * 0.35, cy - size * 0.4);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy - size * 0.05, size * 0.25, Math.PI * 0.25, Math.PI * 1.25);
        ctx.fill();
        break;

      case 'water':
        ctx.moveTo(cx - size * 0.4, cy - size * 0.1);
        ctx.bezierCurveTo(cx - size * 0.2, cy - size * 0.3, cx, cy + size * 0.1, cx + size * 0.2, cy - size * 0.1);
        ctx.bezierCurveTo(cx + size * 0.3, cy - size * 0.2, cx + size * 0.4, cy - size * 0.1, cx + size * 0.4, cy - size * 0.1);
        ctx.lineTo(cx + size * 0.4, cy + size * 0.2);
        ctx.lineTo(cx - size * 0.4, cy + size * 0.2);
        ctx.closePath();
        ctx.fill();
        break;

      case 'mountain':
        ctx.moveTo(cx - size * 0.45, cy + size * 0.35);
        ctx.lineTo(cx - size * 0.1, cy - size * 0.35);
        ctx.lineTo(cx + size * 0.15, cy + size * 0.05);
        ctx.lineTo(cx + size * 0.45, cy + size * 0.35);
        ctx.closePath();
        ctx.fill();
        break;
      case 'whatsapp':
      case 'brand-whatsapp':
        ctx.arc(cx, cy, size * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        this.roundRect(ctx, cx - size * 0.22, cy - size * 0.22, size * 0.44, size * 0.44, size * 0.1);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.font = `bold ${Math.round(size * 0.4)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('WA', cx, cy);
        break;

      case 'instagram':
      case 'brand-instagram':
        this.roundRect(ctx, cx - size * 0.4, cy - size * 0.4, size * 0.8, size * 0.8, size * 0.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + size * 0.22, cy - size * 0.22, size * 0.05, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'tiktok':
      case 'brand-tiktok':
        ctx.moveTo(cx - size * 0.1, cy - size * 0.35);
        ctx.lineTo(cx + size * 0.05, cy - size * 0.35);
        ctx.bezierCurveTo(cx + size * 0.05, cy - size * 0.1, cx + size * 0.25, cy - size * 0.05, cx + size * 0.35, cy - size * 0.05);
        ctx.lineTo(cx + size * 0.35, cy + size * 0.1);
        ctx.bezierCurveTo(cx + size * 0.2, cy + size * 0.1, cx + size * 0.05, cy, cx + size * 0.05, cy - size * 0.1);
        ctx.lineTo(cx + size * 0.05, cy + size * 0.15);
        ctx.arc(cx - size * 0.12, cy + size * 0.15, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'facebook':
      case 'brand-facebook':
        ctx.arc(cx, cy, size * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(size * 0.6)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('f', cx + size * 0.05, cy);
        break;

      case 'youtube':
      case 'brand-youtube':
        this.roundRect(ctx, cx - size * 0.42, cy - size * 0.28, size * 0.84, size * 0.56, size * 0.12);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.1, cy - size * 0.15);
        ctx.lineTo(cx + size * 0.18, cy);
        ctx.lineTo(cx - size * 0.1, cy + size * 0.15);
        ctx.closePath();
        ctx.fill();
        break;

      case 'paw':
      case 'dog-bowl':
        ctx.arc(cx, cy + size * 0.1, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx - size * 0.25, cy - size * 0.15, size * 0.08, 0, Math.PI * 2);
        ctx.arc(cx - size * 0.1, cy - size * 0.28, size * 0.08, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.1, cy - size * 0.28, size * 0.08, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.25, cy - size * 0.15, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'dog':
      case 'cat':
        ctx.arc(cx, cy, size * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.25, cy - size * 0.15);
        ctx.lineTo(cx - size * 0.38, cy - size * 0.38);
        ctx.lineTo(cx - size * 0.1, cy - size * 0.28);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + size * 0.25, cy - size * 0.15);
        ctx.lineTo(cx + size * 0.38, cy - size * 0.38);
        ctx.lineTo(cx + size * 0.1, cy - size * 0.28);
        ctx.closePath();
        ctx.fill();
        break;

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
      case 'umbrella':
      case 'beach_access':
        // Umbrella Canopy Dome
        ctx.beginPath();
        ctx.arc(cx, cy - size * 0.05, size * 0.42, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        // Umbrella Pole & Hooked Handle
        ctx.beginPath();
        ctx.moveTo(cx, cy - size * 0.05);
        ctx.lineTo(cx, cy + size * 0.38);
        ctx.arc(cx - size * 0.08, cy + size * 0.38, size * 0.08, 0, Math.PI);
        ctx.stroke();
        break;
      case 'paper-plane':
      case 'send':
        ctx.moveTo(cx - size * 0.4, cy + size * 0.2);
        ctx.lineTo(cx + size * 0.4, cy - size * 0.4);
        ctx.lineTo(cx - size * 0.1, cy + size * 0.4);
        ctx.lineTo(cx - size * 0.1, cy + size * 0.1);
        ctx.closePath();
        ctx.fill();
        break;
      case 'trash':
      case 'delete':
        this.roundRect(ctx, cx - size * 0.35, cy - size * 0.15, size * 0.7, size * 0.55, 3);
        ctx.fill();
        ctx.fillRect(cx - size * 0.42, cy - size * 0.3, size * 0.84, size * 0.1);
        this.roundRect(ctx, cx - size * 0.15, cy - size * 0.4, size * 0.3, size * 0.1, 2);
        ctx.fill();
        break;
      case 'pen':
      case 'pencil':
      case 'edit':
        ctx.moveTo(cx - size * 0.35, cy + size * 0.35);
        ctx.lineTo(cx - size * 0.25, cy + size * 0.1);
        ctx.lineTo(cx + size * 0.2, cy - size * 0.35);
        ctx.lineTo(cx + size * 0.35, cy - size * 0.2);
        ctx.lineTo(cx - size * 0.1, cy + size * 0.25);
        ctx.closePath();
        ctx.fill();
        break;
      case 'bookmark':
        ctx.moveTo(cx - size * 0.3, cy - size * 0.45);
        ctx.lineTo(cx + size * 0.3, cy - size * 0.45);
        ctx.lineTo(cx + size * 0.3, cy + size * 0.45);
        ctx.lineTo(cx, cy + size * 0.2);
        ctx.lineTo(cx - size * 0.3, cy + size * 0.45);
        ctx.closePath();
        ctx.fill();
        break;
      case 'eye':
      case 'visibility':
        ctx.moveTo(cx - size * 0.45, cy);
        ctx.quadraticCurveTo(cx, cy - size * 0.38, cx + size * 0.45, cy);
        ctx.quadraticCurveTo(cx, cy + size * 0.38, cx - size * 0.45, cy);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'lightbulb':
        ctx.arc(cx, cy - size * 0.1, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx - size * 0.15, cy + size * 0.15, size * 0.3, size * 0.2);
        break;
      case 'search':
      case 'magnifying-glass':
        ctx.arc(cx - size * 0.1, cy - size * 0.1, size * 0.28, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + size * 0.1, cy + size * 0.1);
        ctx.lineTo(cx + size * 0.38, cy + size * 0.38);
        ctx.stroke();
        break;
      case 'house':
      case 'home':
        ctx.moveTo(cx, cy - size * 0.45);
        ctx.lineTo(cx + size * 0.42, cy - size * 0.05);
        ctx.lineTo(cx + size * 0.32, cy - size * 0.05);
        ctx.lineTo(cx + size * 0.32, cy + size * 0.4);
        ctx.lineTo(cx - size * 0.32, cy + size * 0.4);
        ctx.lineTo(cx - size * 0.32, cy - size * 0.05);
        ctx.lineTo(cx - size * 0.42, cy - size * 0.05);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - size * 0.1, cy + size * 0.1, size * 0.2, size * 0.3);
        break;
      case 'check':
      case 'check-square':
      case 'verified':
        ctx.moveTo(cx - size * 0.35, cy);
        ctx.lineTo(cx - size * 0.1, cy + size * 0.25);
        ctx.lineTo(cx + size * 0.38, cy - size * 0.3);
        ctx.stroke();
        break;
      case 'qrcode':
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
      default:
        // Universal emblem fallback for any other custom icon symbol
        this.roundRect(ctx, cx - size * 0.38, cy - size * 0.38, size * 0.76, size * 0.76, size * 0.2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(size * 0.45)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const symbolChar = (name.replace(/[^a-z0-9]/gi, '')[0] || 'Q').toUpperCase();
        ctx.fillText(symbolChar, cx, cy);
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

    let loadedIconImg = null;
    if (customLogoDataUrl) {
      try {
        loadedIconImg = await loadImage(customLogoDataUrl);
      } catch (err) {
        console.warn('[QRGeneratorService] customLogoDataUrl loadImage fallback:', err.message);
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
      customLogoDataUrl,
      loadedIconImg
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

      if (loadedIconImg) {
        const imgSize = centerBoxSize * 0.75;
        ctx.drawImage(loadedIconImg, centerBoxX + (centerBoxSize - imgSize) / 2, centerBoxY + (centerBoxSize - imgSize) / 2, imgSize, imgSize);
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
