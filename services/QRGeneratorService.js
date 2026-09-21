const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const config = require('../config/env');
const gcsService = require('./GCSService');
const userRepository = require('../repositories/UserRepository');
const historyRepository = require('../repositories/HistoryRepository');
const statsRepository = require('../repositories/StatsRepository');

class QRGeneratorService {
  constructor() {
    this.categories = [
      'Institucional', 'Compras', 'Entretenimiento', 'Belleza', 'Deportes',
      'Comunidad', 'Gastronomía', 'Tecnología', 'Salud', 'Viajes',
      'Inmobiliaria', 'Educación', 'Eventos', 'Redes Sociales', 'Lujo',
      'Música y Arte', 'Mascotas', 'Automotriz', 'Finanzas', 'Naturaleza'
    ];

    this.patterns = [
      { id: 'square', name: 'Cuadrado Clásico', icon: 'fa-square' },
      { id: 'rounded', name: 'Módulo Redondeado', icon: 'fa-square-minus' },
      { id: 'dots', name: 'Círculos / Puntos', icon: 'fa-circle' },
      { id: 'connected', name: 'Líquido / Conectado', icon: 'fa-water' },
      { id: 'smooth', name: 'Módulo Fluido', icon: 'fa-cubes' },
      { id: 'diamond', name: 'Diamante / Rombo', icon: 'fa-gem' },
      { id: 'diamond_rounded', name: 'Rombo Suave', icon: 'fa-diamond' },
      { id: 'star', name: 'Estrellas', icon: 'fa-star' },
      { id: 'sparkle', name: 'Destellos', icon: 'fa-wand-magic-sparkles' },
      { id: 'heart', name: 'Corazones', icon: 'fa-heart' },
      { id: 'hexagon', name: 'Hexágonos / Panal', icon: 'fa-shapes' },
      { id: 'ring', name: 'Anillos Concéntricos', icon: 'fa-bullseye' },
      { id: 'cross', name: 'Cruz / Plus', icon: 'fa-plus' },
      { id: 'clover', name: 'Trébol / Cuatrifolio', icon: 'fa-clover' },
      { id: 'sunburst', name: 'Sol / Destello', icon: 'fa-sun' },
      { id: 'leaf_dot', name: 'Hoja / Gota', icon: 'fa-leaf' },
      { id: 'polar', name: 'Anillos Polares', icon: 'fa-arrows-to-circle' },
      { id: 'halftone', name: 'Puntillismo', icon: 'fa-ellipsis' },
      { id: 'shield_dot', name: 'Escudo Módulo', icon: 'fa-shield-halved' },
      { id: 'flower', name: 'Flor Silvestre', icon: 'fa-seedling' },
      { id: 'diagonal_lines', name: 'Malla Diagonal', icon: 'fa-lines-leaning' },
      { id: 'radial_drop', name: 'Gota Radial / Viento', icon: 'fa-droplet' }
    ];

    this.designs = this.generate600Designs();
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

  generate600Designs() {
    const designs = [];

    const frameShapes = ['rectangular', 'square', 'rounded', 'circle', 'shield', 'ticket', 'hexagonal', 'diamond_card', 'badge_star', 'wavy'];
    const eyeStyles = ['square', 'rounded', 'circle', 'leaf'];
    const dotStyles = [
      'square', 'rounded', 'dots', 'connected', 'smooth', 'diamond', 'diamond_rounded',
      'leaf_dot', 'polar', 'shield_dot', 'diagonal_lines'
    ];
    const silhouetteModes = ['none', 'none', 'icon_only', 'icon_center', 'icon_pure'];

    const categoryThemes = {
      'Institucional': {
        icons: ['fa-building', 'fa-briefcase', 'fa-shield-halved', 'fa-lock', 'fa-globe', 'fa-key', 'fa-circle-info', 'fa-user', 'fa-qrcode', 'fa-location-dot', 'fa-certificate', 'fa-scale-balanced'],
        bgColors: ['#ffffff', '#f8fafc', '#f0f9ff', '#ecfdf5', '#0f172a', '#fffbeb', '#fdf4ff', '#ecfeff', '#f7fee7'],
        qrColors: ['#1e3a8a', '#0f172a', '#0369a1', '#065f46', '#38bdf8', '#78350f', '#701a75', '#111827', '#155e75', '#365314'],
        fontsT: ['Montserrat', 'Cinzel', 'Lora', 'Plus Jakarta Sans', 'Outfit', 'Playfair Display', 'Roboto'],
        fontsB: ['Montserrat', 'Outfit', 'Plus Jakarta Sans', 'Poppins', 'Space Grotesk', 'Lora'],
        banners: ['PORTAL OFICIAL', 'INFORME 2026', 'TRANSPARENCIA', 'ACCESO SEGURO', 'RED GLOBAL', 'CERTIFICADO', 'INFO CIUDADANA', 'DIRECTORIO', 'VERSIÓN DIGITAL', 'UBICACIÓN SEDE']
      },
      'Compras': {
        icons: ['fa-tag', 'fa-cart-shopping', 'fa-gift', 'fa-bolt', 'fa-store', 'fa-gem', 'fa-ticket', 'fa-qrcode', 'fa-thumbs-up', 'fa-star', 'fa-bag-shopping', 'fa-percent'],
        bgColors: ['#ffffff', '#fff7ed', '#fdf2f8', '#18181b', '#f0fdf4', '#0f172a', '#faf5ff', '#09090b', '#fff1f2', '#eff6ff'],
        qrColors: ['#dc2626', '#ea580c', '#db2777', '#facc15', '#166534', '#fbbf24', '#7e22ce', '#06b6d4', '#e11d48', '#1d4ed8'],
        fontsT: ['Bebas Neue', 'Montserrat', 'Pacifico', 'Anton', 'Outfit', 'Cinzel', 'Righteous', 'Space Grotesk', 'Abril Fatface', 'Poppins'],
        fontsB: ['Bebas Neue', 'Poppins', 'Poppins', 'Righteous', 'Comfortaa', 'Playfair Display', 'Poppins', 'Fira Code', 'Outfit', 'Roboto'],
        banners: ['OFERTA 50% OFF', 'COMPRAR AHORA', 'REGALO ESPECIAL', 'FLASH SALE 24H', 'VER CATÁLOGO', 'COLECCIÓN LUXE', 'CUPÓN DESCUENTO', 'CYBER MONDAY', 'NUEVA COLECCIÓN', 'CANJEAR PUNTOS']
      },
      'Entretenimiento': {
        icons: ['fa-film', 'fa-gamepad', 'fa-ticket', 'fa-music', 'fa-fire', 'fa-camera', 'fa-comments', 'fa-sun', 'fa-bolt', 'fa-star', 'fa-masks-theater', 'fa-vr-cardboard'],
        bgColors: ['#09090b', '#09090b', '#2e1065', '#052e16', '#1e1b4b', '#18181b', '#fffbeb', '#0c4a6e', '#4c0519', '#1c1917'],
        qrColors: ['#e11d48', '#10b981', '#c026d3', '#22c55e', '#6366f1', '#f43f5e', '#d97706', '#38bdf8', '#fb7185', '#f97316'],
        fontsT: ['Bebas Neue', 'Press Start 2P', 'Righteous', 'Outfit', 'Anton', 'Playfair Display', 'Lobster', 'Pacifico', 'Monoton', 'Poppins'],
        fontsB: ['Bebas Neue', 'Press Start 2P', 'Bebas Neue', 'Space Grotesk', 'Righteous', 'Outfit', 'Caveat', 'Montserrat', 'Bebas Neue', 'Outfit'],
        banners: ['VER TRÁILER 4K', 'JUGAR AHORA', 'TICKET ENTRADA', 'ESCUCHAR ÁLBUM', 'EN VIVO AHORA', 'VER GALERÍA', 'RISA & SHOW', 'SUMMER FEST', 'NIGHT PARTY VIP', 'UNIRSE AL CLUB']
      },
      'Belleza': {
        icons: ['fa-gem', 'fa-sun', 'fa-sparkle', 'fa-heart', 'fa-moon', 'fa-user', 'fa-gift', 'fa-star', 'fa-ticket', 'fa-store', 'fa-wand-magic-sparkles', 'fa-pump-soap'],
        bgColors: ['#fff1f2', '#f0fdf4', '#fdf4ff', '#fff7ed', '#f0f9ff', '#faf5ff', '#f7fee7', '#ffffff', '#fff1f2', '#0f172a'],
        qrColors: ['#be123c', '#15803d', '#a21caf', '#c2410c', '#0369a1', '#6b21a8', '#4d7c0f', '#0f172a', '#9f1239', '#fef08a'],
        fontsT: ['Great Vibes', 'Lora', 'Dancing Script', 'Satisfy', 'Comfortaa', 'Playfair Display', 'Caveat', 'Montserrat', 'Pacifico', 'Cinzel'],
        fontsB: ['Satisfy', 'Comfortaa', 'Poppins', 'Outfit', 'Plus Jakarta Sans', 'Lora', 'Poppins', 'Outfit', 'Bebas Neue', 'Playfair Display'],
        banners: ['RESERVAR CITA', 'SPA & RELAX', 'MAKEUP ARTIST', 'LASHES & NAILS', 'SKINCARE PRO', 'HAIR STYLIST', '100% NATURAL', 'TRATAMIENTOS', 'DESCUENTO 30%', 'PERFUMERÍA LUXE']
      },
      'Deportes': {
        icons: ['fa-bolt', 'fa-trophy', 'fa-fire', 'fa-flag', 'fa-user', 'fa-ticket', 'fa-heart', 'fa-location-dot', 'fa-circle-info', 'fa-shield', 'fa-dumbbell', 'fa-person-running'],
        bgColors: ['#09090b', '#052e16', '#0c4a6e', '#1e3a8a', '#18181b', '#fef2f2', '#f0fdf4', '#0f172a', '#ffffff', '#451a03'],
        qrColors: ['#eab308', '#4ade80', '#38bdf8', '#ffffff', '#f97316', '#dc2626', '#166534', '#06b6d4', '#1e293b', '#f59e0b'],
        fontsT: ['Oswald', 'Anton', 'Bebas Neue', 'Montserrat', 'Space Grotesk', 'Righteous', 'Poppins', 'Outfit', 'Roboto', 'Oswald'],
        fontsB: ['Bebas Neue', 'Righteous', 'Outfit', 'Oswald', 'Poppins', 'Bebas Neue', 'Comfortaa', 'Space Grotesk', 'Plus Jakarta Sans', 'Cinzel'],
        banners: ['POWER FITNESS', 'UNIRSE AL GYM', 'DESAFÍO 10K', 'HAZTE SOCIO', 'COACH PERSONAL', 'CLASE GRATIS', 'PLAN NUTRICIÓN', 'RESERVAR CANCHA', 'VER HORARIOS', 'CAMPEONES 2026']
      },
      'Comunidad': {
        icons: ['fa-hands-holding-child', 'fa-people-roof', 'fa-comments', 'fa-book-open-reader', 'fa-hand-holding-heart', 'fa-paw', 'fa-seedling', 'fa-network-wired', 'fa-users', 'fa-handshake', 'fa-heart-circle-check', 'fa-house-heart'],
        bgColors: ['#f0fdf4', '#fff7ed', '#eff6ff', '#fdf4ff', '#fef2f2', '#f7fee7', '#ecfdf5', '#0f172a', '#ffffff', '#fffbeb'],
        qrColors: ['#15803d', '#c2410c', '#1d4ed8', '#86198f', '#b91c1c', '#3f6212', '#047857', '#38bdf8', '#334155', '#b45309'],
        fontsT: ['Montserrat', 'Outfit', 'Poppins', 'Lora', 'Righteous', 'Comfortaa', 'Plus Jakarta Sans', 'Outfit', 'Montserrat', 'Playfair Display'],
        fontsB: ['Poppins', 'Comfortaa', 'Space Grotesk', 'Cinzel', 'Outfit', 'Pacifico', 'Poppins', 'Space Grotesk', 'Plus Jakarta Sans', 'Lora'],
        banners: ['SUMATE HOY', 'TU BARRIO', 'PARTICIPA', 'CLUB LECTOR', 'DONAR AHORA', 'ADOPTA UN AMIGO', 'ECO COMUNIDAD', 'UNIDOS HOY', 'ASOCIACIÓN', 'UNETE AL FORO']
      },
      'Gastronomía': {
        icons: ['fa-utensils', 'fa-mug-hot', 'fa-pizza-slice', 'fa-burger', 'fa-fish', 'fa-wine-glass-empty', 'fa-cake-candles', 'fa-martini-glass-citrus', 'fa-plate-wheat', 'fa-truck-fast', 'fa-fire-burner', 'fa-ice-cream'],
        bgColors: ['#0f172a', '#fff7ed', '#fef2f2', '#18181b', '#09090b', '#2e1065', '#fdf4ff', '#0c4a6e', '#ffffff', '#ecfeff'],
        qrColors: ['#f59e0b', '#78350f', '#991b1b', '#eab308', '#ef4444', '#f43f5e', '#c026d3', '#38bdf8', '#111827', '#0e7490'],
        fontsT: ['Cinzel', 'Caveat', 'Bebas Neue', 'Oswald', 'Space Grotesk', 'Playfair Display', 'Pacifico', 'Righteous', 'Abril Fatface', 'Anton'],
        fontsB: ['Montserrat', 'Outfit', 'Righteous', 'Bebas Neue', 'Outfit', 'Lora', 'Comfortaa', 'Outfit', 'Montserrat', 'Poppins'],
        banners: ['VER MENÚ', 'CARTA DE CAFÉS', 'PEDIR PIZZA', 'BURGER MENU', 'SUSHI & OMAKASE', 'CARTA DE VINOS', 'DULCES & PASTEL', 'CÓCTELES VIP', 'RESERVAR MESA', 'ORDEN RÁPIDA']
      },
      'Tecnología': {
        icons: ['fa-headset', 'fa-mobile-screen-button', 'fa-cloud', 'fa-wifi', 'fa-shield-halved', 'fa-code', 'fa-microchip', 'fa-laptop', 'fa-cubes', 'fa-rocket', 'fa-robot', 'fa-server'],
        bgColors: ['#09090b', '#0f172a', '#172554', '#022c22', '#0f172a', '#18181b', '#2e1065', '#ffffff', '#09090b', '#eff6ff'],
        qrColors: ['#06b6d4', '#3b82f6', '#38bdf8', '#10b981', '#eab308', '#a855f7', '#ec4899', '#0284c7', '#f97316', '#2563eb'],
        fontsT: ['Space Grotesk', 'Outfit', 'Space Grotesk', 'Fira Code', 'Montserrat', 'Fira Code', 'Righteous', 'Outfit', 'Space Grotesk', 'Plus Jakarta Sans'],
        fontsB: ['Fira Code', 'Plus Jakarta Sans', 'Poppins', 'Space Grotesk', 'Outfit', 'Fira Code', 'Space Grotesk', 'Montserrat', 'Righteous', 'Poppins'],
        banners: ['SOPORTE 24/7', 'DESCARGAR APP', 'PRUEBA GRATIS', 'CONECTAR WIFI', 'ACCESO SEGURO', 'VER REPOSITORIO', 'DESCUBRE LA IA', 'VER GADGETS', 'CRYPTO WALLET', 'VER DEMO']
      },
      'Salud': {
        icons: ['fa-user-doctor', 'fa-pills', 'fa-tooth', 'fa-truck-medical', 'fa-microscope', 'fa-heart-pulse', 'fa-glasses', 'fa-person-walking', 'fa-brain', 'fa-heart', 'fa-stethoscope', 'fa-hospital'],
        bgColors: ['#f0f9ff', '#f0fdf4', '#ffffff', '#fef2f2', '#ecfeff', '#fdf4ff', '#f8fafc', '#f7fee7', '#faf5ff', '#fff1f2'],
        qrColors: ['#0284c7', '#166534', '#0891b2', '#dc2626', '#0f766e', '#701a75', '#334155', '#4d7c0f', '#6b21a8', '#be123c'],
        fontsT: ['Montserrat', 'Poppins', 'Outfit', 'Righteous', 'Space Grotesk', 'Comfortaa', 'Lora', 'Plus Jakarta Sans', 'Playfair Display', 'Outfit'],
        fontsB: ['Plus Jakarta Sans', 'Comfortaa', 'Poppins', 'Bebas Neue', 'Outfit', 'Poppins', 'Montserrat', 'Outfit', 'Lora', 'Poppins'],
        banners: ['AGENDAR CITA', 'PEDIR RECETA', 'CONSULTA DENTAL', 'URGENCIAS 24H', 'RESULTADOS', 'SALUD INFANTIL', 'EXAMEN VISUAL', 'FISIOTERAPIA', 'SESIÓN ONLINE', 'CARDIOLOGÍA']
      },
      'Viajes': {
        icons: ['fa-plane-departure', 'fa-hotel', 'fa-compass', 'fa-sun', 'fa-mountain', 'fa-ship', 'fa-map-location-dot', 'fa-car', 'fa-binoculars', 'fa-ticket', 'fa-globe-americas', 'fa-suitcase-rolling'],
        bgColors: ['#0f172a', '#fffbeb', '#ecfeff', '#f0f9ff', '#f7fee7', '#0c4a6e', '#ffffff', '#18181b', '#fff7ed', '#fdf4ff'],
        qrColors: ['#38bdf8', '#b45309', '#0891b2', '#0284c7', '#365314', '#00d8f6', '#1e293b', '#f97316', '#c2410c', '#a21caf'],
        fontsT: ['Outfit', 'Cinzel', 'Pacifico', 'Righteous', 'Oswald', 'Montserrat', 'Poppins', 'Bebas Neue', 'Playfair Display', 'Space Grotesk'],
        fontsB: ['Space Grotesk', 'Playfair Display', 'Montserrat', 'Comfortaa', 'Plus Jakarta Sans', 'Outfit', 'Roboto', 'Outfit', 'Lora', 'Poppins'],
        banners: ['BOARDING PASS', 'RESERVA HOTEL', 'VER TOURS', 'PACK PLAYA', 'RUTA SENDERISMO', 'CRUCERO VIP', 'GUÍA CIUDAD', 'RENT A CAR', 'SAFARI TOUR', 'CHECK-IN RÁPIDO']
      },
      'Inmobiliaria': {
        icons: ['fa-house', 'fa-building', 'fa-key', 'fa-user-tie', 'fa-vr-cardboard', 'fa-vector-square', 'fa-briefcase', 'fa-file-signature', 'fa-tree', 'fa-water', 'fa-city', 'fa-house-circle-check'],
        bgColors: ['#ffffff', '#0f172a', '#f0f9ff', '#f8fafc', '#09090b', '#f7fee7', '#1e1b4b', '#fffbeb', '#f0fdf4', '#ecfeff'],
        qrColors: ['#0f172a', '#fbbf24', '#0284c7', '#1e293b', '#06b6d4', '#365314', '#818cf8', '#78350f', '#166534', '#0891b2'],
        fontsT: ['Montserrat', 'Cinzel', 'Poppins', 'Outfit', 'Space Grotesk', 'Oswald', 'Lora', 'Cinzel', 'Pacifico', 'Righteous'],
        fontsB: ['Outfit', 'Playfair Display', 'Plus Jakarta Sans', 'Montserrat', 'Fira Code', 'Plus Jakarta Sans', 'Outfit', 'Lora', 'Comfortaa', 'Poppins'],
        banners: ['VER PROPIEDAD', 'PENTHOUSE VIP', 'VER ALQUILER', 'MI CONTACTO', 'TOUR 360°', 'VER LOTES', 'OFICINAS PRO', 'AGENDAR FIRMA', 'CASA DE CAMPO', 'DEPO PLAYA']
      },
      'Educación': {
        icons: ['fa-graduation-cap', 'fa-school', 'fa-certificate', 'fa-book', 'fa-language', 'fa-video', 'fa-user-graduate', 'fa-pen-to-square', 'fa-music', 'fa-laptop-code', 'fa-chalkboard-user', 'fa-brain'],
        bgColors: ['#0f172a', '#ffffff', '#faf5ff', '#fff7ed', '#f0f9ff', '#18181b', '#f0fdf4', '#fef2f2', '#2e1065', '#09090b'],
        qrColors: ['#38bdf8', '#1e3a8a', '#7e22ce', '#c2410c', '#0369a1', '#f43f5e', '#15803d', '#b91c1c', '#c026d3', '#10b981'],
        fontsT: ['Outfit', 'Cinzel', 'Righteous', 'Lora', 'Poppins', 'Space Grotesk', 'Comfortaa', 'Roboto', 'Pacifico', 'Fira Code'],
        fontsB: ['Plus Jakarta Sans', 'Montserrat', 'Poppins', 'Outfit', 'Comfortaa', 'Outfit', 'Plus Jakarta Sans', 'Poppins', 'Lora', 'Fira Code'],
        banners: ['AULA VIRTUAL', 'ADMISIÓN 2026', 'INSCRIBIRSE', 'VER LIBROS', 'APRENDER HOY', 'VER MASTERCLASS', 'PEDIR TUTOR', 'INICIAR TEST', 'CLASES DE MÚSICA', 'FULLSTACK 2026']
      },
      'Eventos': {
        icons: ['fa-ticket', 'fa-heart', 'fa-cake-candles', 'fa-calendar-days', 'fa-microphone', 'fa-users-between-lines', 'fa-display', 'fa-trophy', 'fa-gamepad', 'fa-utensils', 'fa-champagne-glasses', 'fa-ring'],
        bgColors: ['#09090b', '#fff1f2', '#fdf4ff', '#ffffff', '#18181b', '#0f172a', '#eff6ff', '#0f172a', '#022c22', '#fff7ed'],
        qrColors: ['#a855f7', '#be123c', '#c026d3', '#0f172a', '#f59e0b', '#38bdf8', '#1d4ed8', '#eab308', '#10b981', '#c2410c'],
        fontsT: ['Space Grotesk', 'Great Vibes', 'Pacifico', 'Montserrat', 'Righteous', 'Outfit', 'Poppins', 'Cinzel', 'Press Start 2P', 'Bebas Neue'],
        fontsB: ['Outfit', 'Satisfy', 'Poppins', 'Outfit', 'Bebas Neue', 'Space Grotesk', 'Plus Jakarta Sans', 'Playfair Display', 'Space Grotesk', 'Comfortaa'],
        banners: ['ENTRADA VIP', 'NUESTRA BODA', 'INVITACIÓN CUMPLE', 'REGISTRO EXPO', 'LINEUP & TICKETS', 'NETWORKING VIP', 'UNIRSE AL WEBINAR', 'PREMIACIÓN 2026', 'TORNEO ESPORTS', 'ENTRADAS FERIA']
      },
      'Redes Sociales': {
        icons: ['fa-brands fa-whatsapp', 'fa-brands fa-instagram', 'fa-brands fa-tiktok', 'fa-brands fa-youtube', 'fa-brands fa-facebook', 'fa-brands fa-linkedin', 'fa-brands fa-twitter', 'fa-brands fa-telegram', 'fa-brands fa-discord', 'fa-brands fa-pinterest', 'fa-brands fa-spotify', 'fa-share-nodes'],
        bgColors: ['#f0fdf4', '#fdf4ff', '#09090b', '#fef2f2', '#eff6ff', '#f8fafc', '#f0f9ff', '#e0f2fe', '#5865f2', '#fff1f2'],
        qrColors: ['#16a34a', '#e1306c', '#00f2fe', '#dc2626', '#1877f2', '#0a66c2', '#1da1f2', '#24a1de', '#ffffff', '#e60023'],
        fontsT: ['Outfit', 'Poppins', 'Space Grotesk', 'Bebas Neue', 'Montserrat', 'Outfit', 'Space Grotesk', 'Poppins', 'Righteous', 'Pacifico'],
        fontsB: ['Poppins', 'Space Grotesk', 'Righteous', 'Outfit', 'Plus Jakarta Sans', 'Roboto', 'Outfit', 'Space Grotesk', 'Fira Code', 'Comfortaa'],
        banners: ['CHAT WHATSAPP', 'SEGUIR EN IG', 'TIKTOK CHANNEL', 'SUSCRIBIRSE', 'PÁGINA FACEBOOK', 'PERFIL LINKEDIN', 'SEGUIR EN X', 'GRUPO TELEGRAM', 'UNIRSE AL DISCORD', 'VER PINBOARD']
      },
      'Lujo': {
        icons: ['fa-crown', 'fa-gem', 'fa-sparkles', 'fa-credit-card', 'fa-shirt', 'fa-clock', 'fa-car-side', 'fa-anchor', 'fa-wine-bottle', 'fa-castle', 'fa-ring', 'fa-award'],
        bgColors: ['#0f172a', '#0f172a', '#fff1f2', '#000000', '#ffffff', '#0f172a', '#450a0a', '#0c4a6e', '#1c1917', '#18181b'],
        qrColors: ['#fbbf24', '#e2e8f0', '#be123c', '#f59e0b', '#111827', '#38bdf8', '#ef4444', '#38bdf8', '#eab308', '#fbbf24'],
        fontsT: ['Cinzel', 'Cinzel', 'Great Vibes', 'Space Grotesk', 'Abril Fatface', 'Cinzel', 'Bebas Neue', 'Playfair Display', 'Cinzel', 'Cinzel'],
        fontsB: ['Playfair Display', 'Lora', 'Playfair Display', 'Outfit', 'Cinzel', 'Montserrat', 'Righteous', 'Outfit', 'Lora', 'Playfair Display'],
        banners: ['COLECCIÓN LUXE', 'RESERVA PLATINUM', 'EDICIÓN LIMITADA', 'MEMBRESÍA BLACK', 'ALTA COSTURA', 'COLECCIÓN SUIZA', 'SUPERCAR VIP', 'YACHT CLUB', 'PRIVATE CELLAR', 'MANSIÓN PRIVADA']
      },
      'Música y Arte': {
        icons: ['fa-music', 'fa-palette', 'fa-guitar', 'fa-drum', 'fa-headphones', 'fa-microphone', 'fa-icons', 'fa-brush', 'fa-image', 'fa-shapes', 'fa-record-vinyl', 'fa-radio'],
        bgColors: ['#1e1b4b', '#faf5ff', '#09090b', '#fff7ed', '#0c4a6e', '#fdf4ff', '#18181b', '#0f172a', '#fef2f2', '#f0fdf4'],
        qrColors: ['#a855f7', '#c026d3', '#38bdf8', '#f97316', '#00d8f6', '#e879f9', '#f43f5e', '#fbbf24', '#dc2626', '#10b981'],
        fontsT: ['Monoton', 'Pacifico', 'Righteous', 'Lobster', 'Space Grotesk', 'Great Vibes', 'Bebas Neue', 'Cinzel', 'Anton', 'Comfortaa'],
        fontsB: ['Righteous', 'Poppins', 'Space Grotesk', 'Caveat', 'Outfit', 'Satisfy', 'Bebas Neue', 'Playfair Display', 'Outfit', 'Comfortaa'],
        banners: ['REPRODUCTOR MP3', 'GALERÍA DE ARTE', 'ESCUCHAR ÁLBUM', 'TALLER PINTURA', 'BEATS & MIXES', 'EXPOSICIÓN VIP', 'ALBUM DROP', 'CONCIERTO LIVE', 'SONIDO 3D', 'CREATIVIDAD ECO']
      },
      'Mascotas': {
        icons: ['fa-paw', 'fa-dog', 'fa-cat', 'fa-bone', 'fa-shield-dog', 'fa-heart', 'fa-house-chimney-medical', 'fa-store', 'fa-star', 'fa-award', 'fa-scissors', 'fa-bowl-food'],
        bgColors: ['#fff7ed', '#f7fee7', '#fdf4ff', '#f0fdf4', '#f0f9ff', '#fff1f2', '#ecfeff', '#faf5ff', '#ffffff', '#18181b'],
        qrColors: ['#ea580c', '#65a30d', '#c026d3', '#166534', '#0284c7', '#be123c', '#0f766e', '#7e22ce', '#0f172a', '#f59e0b'],
        fontsT: ['Comfortaa', 'Pacifico', 'Caveat', 'Plus Jakarta Sans', 'Poppins', 'Satisfy', 'Space Grotesk', 'Righteous', 'Montserrat', 'Outfit'],
        fontsB: ['Outfit', 'Comfortaa', 'Poppins', 'Poppins', 'Plus Jakarta Sans', 'Outfit', 'Space Grotesk', 'Poppins', 'Montserrat', 'Bebas Neue'],
        banners: ['PET SHOP DISCOUNTS', 'CLÍNICA VETERINARIA', 'CAT LOUNGE VIP', 'ALIMENTO PREMIUM', 'ADOPCIÓN RESPONSABLE', 'ESTÉTICA CANINA', 'PASEO DE PERROS', 'GUARDERÍA MASCOTA', 'CLUB PET LOVERS', 'CAMPEÓN CANINO']
      },
      'Automotriz': {
        icons: ['fa-car', 'fa-car-side', 'fa-wrench', 'fa-oil-can', 'fa-gauge-high', 'fa-gas-pump', 'fa-key', 'fa-shield-halved', 'fa-truck-pickup', 'fa-motorcycle', 'fa-screwdriver-wrench', 'fa-battery-full'],
        bgColors: ['#09090b', '#18181b', '#0f172a', '#450a0a', '#172554', '#ffffff', '#fff7ed', '#f8fafc', '#022c22', '#1c1917'],
        qrColors: ['#ef4444', '#f59e0b', '#38bdf8', '#dc2626', '#3b82f6', '#0f172a', '#ea580c', '#475569', '#10b981', '#fb923c'],
        fontsT: ['Oswald', 'Bebas Neue', 'Space Grotesk', 'Anton', 'Montserrat', 'Outfit', 'Righteous', 'Roboto', 'Fira Code', 'Cinzel'],
        fontsB: ['Bebas Neue', 'Righteous', 'Fira Code', 'Oswald', 'Poppins', 'Outfit', 'Space Grotesk', 'Plus Jakarta Sans', 'Space Grotesk', 'Playfair Display'],
        banners: ['AUTOS 0KM VENTA', 'TALLER MECÁNICO', 'LAVADO DE AUTOS', 'COMPUTEST TUNING', 'REPUESTOS ORIGINALES', 'ALQUILER DE AUTOS', 'GARANTÍA OFICIAL', 'CAMBIO DE ACEITE', 'EXPRESS SERVICE', 'MOTOS & ACCESORIOS']
      },
      'Finanzas': {
        icons: ['fa-coins', 'fa-piggy-bank', 'fa-vault', 'fa-chart-line', 'fa-credit-card', 'fa-wallet', 'fa-scale-balanced', 'fa-shield-halved', 'fa-arrow-trend-up', 'fa-building-columns', 'fa-calculator', 'fa-receipt'],
        bgColors: ['#052e16', '#0f172a', '#ffffff', '#172554', '#fffbeb', '#09090b', '#f0fdf4', '#f8fafc', '#ecfeff', '#faf5ff'],
        qrColors: ['#22c55e', '#fbbf24', '#0f172a', '#38bdf8', '#b45309', '#10b981', '#15803d', '#334155', '#0891b2', '#7e22ce'],
        fontsT: ['Cinzel', 'Space Grotesk', 'Montserrat', 'Outfit', 'Lora', 'Fira Code', 'Plus Jakarta Sans', 'Roboto', 'Playfair Display', 'Poppins'],
        fontsB: ['Playfair Display', 'Fira Code', 'Outfit', 'Space Grotesk', 'Cinzel', 'Space Grotesk', 'Poppins', 'Montserrat', 'Lora', 'Plus Jakarta Sans'],
        banners: ['BANCA DIGITAL', 'INVERSIONES PRO', 'CRYPTO WALLET', 'ASESORÍA FINANCIERA', 'CONTABILIDAD Y TAX', 'CRÉDITO APROBADO', 'FONDO DE INVERSIÓN', 'SEGUROS Y MUTUAL', 'BOLSA Y TRADING', 'ESTADO DE CUENTA']
      },
      'Naturaleza': {
        icons: ['fa-tree', 'fa-seedling', 'fa-leaf', 'fa-sun', 'fa-mountain-sun', 'fa-water', 'fa-clover', 'fa-droplet', 'fa-recycle', 'fa-plant-wilt', 'fa-bug', 'fa-cloud-sun'],
        bgColors: ['#f0fdf4', '#f7fee7', '#ecfdf5', '#fff7ed', '#022c22', '#ffffff', '#f0f9ff', '#fffbeb', '#faf5ff', '#18181b'],
        qrColors: ['#166534', '#65a30d', '#047857', '#ea580c', '#34d399', '#15803d', '#0284c7', '#d97706', '#86198f', '#4ade80'],
        fontsT: ['Comfortaa', 'Pacifico', 'Plus Jakarta Sans', 'Caveat', 'Space Grotesk', 'Montserrat', 'Poppins', 'Lora', 'Righteous', 'Outfit'],
        fontsB: ['Poppins', 'Comfortaa', 'Poppins', 'Outfit', 'Space Grotesk', 'Outfit', 'Plus Jakarta Sans', 'Lora', 'Poppins', 'Space Grotesk'],
        banners: ['PARQUE ECOLÓGICO', 'JARDINERÍA BOTÁNICA', 'GRANJA ORGÁNICA', 'ENERGÍA SOLAR', 'PRODUCTO ECO', 'ECO RECYCLING', 'CUIDADO AMBIENTAL', 'TURISMO VERDE', 'TIENDA SUSTENTABLE', 'FLORA & FAUNA']
      }
    };

    const categoriesList = Object.keys(categoryThemes);

    categoriesList.forEach((cat) => {
      const theme = categoryThemes[cat];
      for (let i = 0; i < 30; i++) {
        const iconName = theme.icons[i % theme.icons.length];
        const bgColor = theme.bgColors[i % theme.bgColors.length];
        const qrColor = theme.qrColors[i % theme.qrColors.length];
        const frameColor = theme.qrColors[(i + 2) % theme.qrColors.length];
        const textColor = (bgColor === '#09090b' || bgColor === '#0f172a' || bgColor === '#18181b' || bgColor === '#022c22' || bgColor === '#1e1b4b' || bgColor === '#2e1065') ? '#f8fafc' : qrColor;
        const fontTitle = theme.fontsT[i % theme.fontsT.length];
        const fontBanner = theme.fontsB[i % theme.fontsB.length];
        const bannerText = `${theme.banners[i % theme.banners.length]}${i >= 10 ? ` #${Math.floor(i / 10) + 1}` : ''}`;
        const dotStyle = dotStyles[i % dotStyles.length];
        const eyeStyle = eyeStyles[i % eyeStyles.length];
        const frameShape = frameShapes[i % frameShapes.length];
        const silhouetteMode = silhouetteModes[i % silhouetteModes.length];
        const gradientType = (i % 3 === 1) ? 'linear' : ((i % 3 === 2) ? 'radial' : 'single');
        const eyeGradientType = (i % 4 === 1) ? 'linear' : ((i % 4 === 3) ? 'radial' : 'single');
        const qrColor2 = theme.qrColors[(i + 4) % theme.qrColors.length];
        const eyeColor2 = theme.qrColors[(i + 5) % theme.qrColors.length];
        const qrDensity = (i % 5 === 0) ? 80 : ((i % 5 === 1) ? 90 : 100);
        const qrBoxRadius = (i % 4 === 0) ? 0 : ((i % 4 === 1) ? 12 : ((i % 4 === 2) ? 18 : 28));

        designs.push({
          id: `design-${cat.toLowerCase().replace(/[^a-z0-9]/g, '')}-${i + 1}`,
          name: `${theme.banners[i % theme.banners.length]} ${i + 1}`,
          category: cat,
          bgColor,
          qrColor,
          frameColor,
          textColor,
          badgeBg: frameColor,
          badgeText: (bgColor === '#ffffff' || bgColor.startsWith('#f0') || bgColor.startsWith('#f7') || bgColor.startsWith('#fa') || bgColor.startsWith('#ec')) ? '#ffffff' : '#0f172a',
          iconColor: qrColor,
          iconBgColor: '#ffffff',
          iconBorderColor: frameColor,
          dotStyle,
          eyeStyle,
          frameStyle: 'card-header',
          frameShape,
          iconName,
          fontTitle,
          fontBanner,
          bannerText,
          qrSilhouetteMode: silhouetteMode,
          gradientType,
          qrColor2,
          eyeGradientType,
          eyeColor2,
          qrDensity,
          qrBoxRadius,
          eyeColor: qrColor
        });
      }
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
        this.drawStarPath(ctx, cx, cy, 8, r * 0.9, r * 0.5);
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
    const topCurveHeight = size * 0.22;
    ctx.moveTo(x + size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + size / 2, y - size * 0.04, x - size * 0.05, y - size * 0.04, x - size * 0.05, y + topCurveHeight);
    ctx.bezierCurveTo(x - size * 0.05, y + size * 0.75, x + size * 0.15, y + size * 1.05, x + size / 2, y + size * 1.02);
    ctx.bezierCurveTo(x + size * 0.85, y + size * 1.05, x + size * 1.05, y + size * 0.75, x + size * 1.05, y + topCurveHeight);
    ctx.bezierCurveTo(x + size * 1.05, y - size * 0.04, x + size / 2, y - size * 0.04, x + size / 2, y + topCurveHeight);
    ctx.closePath();
  }

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
      this.roundRect(mctx, 18, 22, 104, 96, 20);
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
      this.drawHeartPath(mctx, 18, 18, 104);
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
      this.drawStarPath(mctx, 70, 70, 8, 54, 42);
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
        this.drawVectorIcon(mctx, iconName, 70, 70, iconBox, '#000000', true);
      } else {
        mctx.beginPath();
        this.roundRect(mctx, iconOff, iconOff, iconBox, iconBox, 14);
        mctx.fill();
      }
    }

    const imgData = mctx.getImageData(0, 0, maskW, maskH);
    return { data: imgData.data, width: maskW, height: maskH };
  }

  /**
   * Build a native canvas clip path that matches the silhouette shape.
   * This is used in Phase B of the new architecture: ctx.clip() restricts drawing
   * to only the silhouette region, then ctx.drawImage(offCanvas) composites the
   * full-density QR data through that clip.
   *
   * For arbitrary icon shapes (loaded images / vector icons), we fall back to
   * pixel-walking the alpha mask to build a rough convex-hull set of rects,
   * or we use a simpler bbox + round-rect approach with the mask as a stencil
   * via globalCompositeOperation.
   */
  buildSilhouetteClipPath(ctx, silhouetteMode, loadedIconImg, iconName, qrX, qrY, qrAreaSize, alphaMask, size, cellSize) {
    const rawName = (iconName || '').toLowerCase();
    const isHeartIcon    = rawName.includes('heart');
    const isCatIcon      = rawName.includes('cat');
    const isAppleIcon    = rawName.includes('apple');
    const isStarIcon     = rawName.includes('star');
    const isYoutubeIcon  = rawName.includes('youtube') || rawName.includes('play');

    // User requirement: Reduce silhouette size by 30% (occupies 70% of qrAreaSize, centered)
    // Leaves clean margins around the 3 finder patterns in corners
    const silScale = 0.70;
    const sw = qrAreaSize * silScale;
    const sh = qrAreaSize * silScale;
    const sx = qrX + (qrAreaSize - sw) / 2;
    const sy = qrY + (qrAreaSize - sh) / 2;
    const cx = sx + sw / 2;
    const cy = sy + sh / 2;

    const isBrandIcon = isYoutubeIcon || rawName.includes('whatsapp') || rawName.includes('instagram') || rawName.includes('tiktok') || rawName.includes('facebook') || rawName.includes('twitter') || rawName.includes('linkedin');

    if (isBrandIcon || (silhouetteMode.startsWith('icon') && isBrandIcon)) {
      // Rounded rectangle badge for brands
      const rx = sw * 0.20;
      this.roundRect(ctx, sx, sy, sw, sh, rx);

    } else if (silhouetteMode === 'heart' || (silhouetteMode.startsWith('icon') && isHeartIcon)) {
      // Natural, symmetric Heart silhouette (30% reduced, centered)
      const hs = sw;
      const topCurve = hs * 0.28;
      ctx.moveTo(cx, sy + topCurve);
      ctx.bezierCurveTo(cx, sy - hs * 0.05, sx - hs * 0.05, sy - hs * 0.05, sx - hs * 0.05, sy + topCurve);
      ctx.bezierCurveTo(sx - hs * 0.05, sy + hs * 0.75, cx - hs * 0.15, sy + hs * 1.05, cx, sy + hs * 1.02);
      ctx.bezierCurveTo(cx + hs * 0.15, sy + hs * 1.05, sx + hs * 1.05, sy + hs * 0.75, sx + hs * 1.05, sy + topCurve);
      ctx.bezierCurveTo(sx + hs * 1.05, sy - hs * 0.05, cx, sy - hs * 0.05, cx, sy + topCurve);
      ctx.closePath();

    } else if (silhouetteMode === 'circle') {
      ctx.arc(cx, cy, sw * 0.50, 0, Math.PI * 2);
      ctx.closePath();

    } else if (silhouetteMode === 'star' || (silhouetteMode.startsWith('icon') && isStarIcon)) {
      this.drawStarPath(ctx, cx, cy, 8, sw * 0.54, sw * 0.44);
      ctx.closePath();

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
      ctx.closePath();

    } else if (silhouetteMode === 'apple' || (silhouetteMode.startsWith('icon') && isAppleIcon)) {
      ctx.arc(cx, cy + sh * 0.05, sw * 0.46, 0, Math.PI * 2);
      ctx.closePath();

    } else if (silhouetteMode === 'cat' || (silhouetteMode.startsWith('icon') && isCatIcon)) {
      ctx.arc(cx, cy + sh * 0.05, sw * 0.46, 0, Math.PI * 2);
      ctx.closePath();

    } else if (silhouetteMode.startsWith('icon')) {
      // Branded rounded badge (matching qr_backgrounds.jpg)
      const rx = sw * 0.20;
      this.roundRect(ctx, sx, sy, sw, sh, rx);
    } else {
      ctx.rect(qrX, qrY, qrAreaSize, qrAreaSize);
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

  drawVectorIcon(ctx, iconName, cx, cy, size, color, isSilhouetteMask = false) {
    ctx.save();

    if (isSilhouetteMask) {
      color = '#000000';
    }

    const innerWhite = isSilhouetteMask ? color : '#ffffff';
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = isSilhouetteMask ? Math.max(14, Math.round(size / 9)) : Math.max(2, size / 10);
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
        ctx.fillStyle = innerWhite;
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
        ctx.fillStyle = innerWhite;
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
        if (!isSilhouetteMask) {
          ctx.fillStyle = innerWhite;
          ctx.beginPath();
          this.roundRect(ctx, cx - size * 0.22, cy - size * 0.22, size * 0.44, size * 0.44, size * 0.1);
          ctx.fill();
          ctx.fillStyle = color;
          ctx.font = `bold ${Math.round(size * 0.4)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('WA', cx, cy);
        }
        break;

      case 'instagram':
      case 'brand-instagram':
        this.roundRect(ctx, cx - size * 0.4, cy - size * 0.4, size * 0.8, size * 0.8, size * 0.2);
        ctx.fill();
        if (!isSilhouetteMask) {
          ctx.strokeStyle = innerWhite;
          ctx.beginPath();
          ctx.arc(cx, cy, size * 0.2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx + size * 0.22, cy - size * 0.22, size * 0.05, 0, Math.PI * 2);
          ctx.fill();
        }
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
        if (!isSilhouetteMask) {
          ctx.fillStyle = innerWhite;
          ctx.font = `bold ${Math.round(size * 0.6)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('f', cx + size * 0.05, cy);
        }
        break;

      case 'youtube':
      case 'brand-youtube':
        this.roundRect(ctx, cx - size * 0.42, cy - size * 0.28, size * 0.84, size * 0.56, size * 0.12);
        ctx.fill();
        ctx.fillStyle = innerWhite;
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
        ctx.fill();
        if (!isSilhouetteMask) {
          ctx.strokeStyle = innerWhite;
          ctx.beginPath();
          ctx.moveTo(cx - size * 0.4, cy - size * 0.28);
          ctx.lineTo(cx, cy + size * 0.02);
          ctx.lineTo(cx + size * 0.4, cy - size * 0.28);
          ctx.stroke();
        }
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
        ctx.fill();
        if (!isSilhouetteMask) {
          ctx.strokeStyle = innerWhite;
          ctx.beginPath();
          ctx.moveTo(cx - size * 0.42, cy);
          ctx.lineTo(cx + size * 0.42, cy);
          ctx.moveTo(cx, cy - size * 0.42);
          ctx.lineTo(cx, cy + size * 0.42);
          ctx.stroke();
        }
        break;
      case 'store':
        if (isSilhouetteMask) {
          this.roundRect(ctx, cx - size * 0.42, cy - size * 0.42, size * 0.84, size * 0.84, 8);
          ctx.fill();
        } else {
          ctx.moveTo(cx - size * 0.45, cy - size * 0.15);
          ctx.lineTo(cx, cy - size * 0.4);
          ctx.lineTo(cx + size * 0.45, cy - size * 0.15);
          ctx.stroke();
          this.roundRect(ctx, cx - size * 0.38, cy - size * 0.15, size * 0.76, size * 0.55, 4);
          ctx.stroke();
        }
        break;
      case 'wifi':
        if (isSilhouetteMask) {
          ctx.arc(cx, cy, size * 0.44, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.arc(cx, cy + size * 0.3, size * 0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx, cy + size * 0.3, size * 0.3, Math.PI * 1.25, Math.PI * 1.75);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx, cy + size * 0.3, size * 0.5, Math.PI * 1.25, Math.PI * 1.75);
          ctx.stroke();
        }
        break;
      case 'utensils':
        if (isSilhouetteMask) {
          this.roundRect(ctx, cx - size * 0.42, cy - size * 0.42, size * 0.84, size * 0.84, 8);
          ctx.fill();
        } else {
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
        }
        break;
      case 'car':
        this.roundRect(ctx, cx - size * 0.4, cy - size * 0.1, size * 0.8, size * 0.3, 4);
        ctx.fill();
        this.roundRect(ctx, cx - size * 0.25, cy - size * 0.3, size * 0.5, size * 0.22, 3);
        ctx.fill();
        ctx.fillStyle = innerWhite;
        ctx.beginPath();
        ctx.arc(cx - size * 0.22, cy + size * 0.2, size * 0.1, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.22, cy + size * 0.2, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'briefcase':
        this.roundRect(ctx, cx - size * 0.42, cy - size * 0.28, size * 0.84, size * 0.64, 6);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy - size * 0.28, size * 0.18, Math.PI, 0);
        if (isSilhouetteMask) {
          ctx.fill();
        } else {
          ctx.stroke();
        }
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
        if (isSilhouetteMask) {
          this.roundRect(ctx, cx - size * 0.42, cy - size * 0.42, size * 0.84, size * 0.84, 8);
          ctx.fill();
        } else {
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
        }
        break;
      case 'phone':
        this.roundRect(ctx, cx - size * 0.28, cy - size * 0.42, size * 0.56, size * 0.84, size * 0.08);
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
        ctx.fillStyle = innerWhite;
        ctx.beginPath();
        ctx.arc(cx, cy + size * 0.12, size * 0.16, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'gamepad':
        this.roundRect(ctx, cx - size * 0.42, cy - size * 0.22, size * 0.84, size * 0.44, size * 0.18);
        ctx.fill();
        ctx.fillStyle = innerWhite;
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
        ctx.fillStyle = innerWhite;
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
        ctx.moveTo(cx - size * 0.42, cy - size * 0.42);
        ctx.lineTo(cx + size * 0.42, cy - size * 0.42);
        ctx.lineTo(cx + size * 0.42, cy + size * 0.05);
        ctx.quadraticCurveTo(cx + size * 0.42, cy + size * 0.44, cx, cy + size * 0.45);
        ctx.quadraticCurveTo(cx - size * 0.42, cy + size * 0.44, cx - size * 0.42, cy + size * 0.05);
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
        ctx.fillStyle = innerWhite;
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
        ctx.fillStyle = innerWhite;
        ctx.beginPath();
        ctx.arc(cx, cy - size * 0.12, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'building':
        this.roundRect(ctx, cx - size * 0.32, cy - size * 0.42, size * 0.64, size * 0.84, 2);
        ctx.fill();
        ctx.fillStyle = innerWhite;
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
        ctx.fillStyle = innerWhite;
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
        ctx.fill();
        if (!isSilhouetteMask) {
          ctx.fillStyle = innerWhite;
          ctx.beginPath();
          ctx.arc(cx, cy - size * 0.18, size * 0.06, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(cx - size * 0.05, cy - size * 0.05, size * 0.1, size * 0.28);
        }
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
        ctx.fillStyle = innerWhite;
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
        ctx.fillStyle = innerWhite;
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
        ctx.fillStyle = innerWhite;
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
        ctx.fillStyle = innerWhite;
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
        this.drawStarPath(ctx, cx, cy, 8, r, r * 0.55);
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
          this.roundRect(ctx, cardX, cardY, cardW, cardH, 12 * scale);
          ctx.stroke();
          break;
        case 'rounded':
          this.roundRect(ctx, cardX, cardY, cardW, cardH, 48 * scale);
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
          this.roundRect(ctx, cardX + 8 * scale, cardY + 8 * scale, cardW - 16 * scale, cardH - 16 * scale, 18 * scale);
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
          this.roundRect(ctx, cardX, cardY, cardW, cardH, 24 * scale);
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

        ctx.fillStyle = colors.badgeBg || colors.frameColor || '#2563eb';
        this.roundRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2);
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
      let subY = 635 * scale;
      if (titlePos === 'bottom') {
        const titleBottomY = startY + (lines.length * lineHeight) + (10 * scale);
        if (titleBottomY > 600 * scale) {
          subY = Math.min(695 * scale, titleBottomY + (10 * scale));
        }
      }

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
      userEmail = null,
      isExplicitGenerate = false
    } = params;

    if (userEmail && isExplicitGenerate) {
      const emailKey = userEmail.toLowerCase().trim();
      let user = userRepository.findByEmail(emailKey);
      const planConfig = config.getPlanConfig(user ? user.plan : 'free');
      const maxCredits = user ? (user.maxCredits || planConfig.maxCredits) : planConfig.maxCredits;
      const currentGen = user ? (user.generationsCount || 0) : 0;

      if (currentGen >= maxCredits) {
        return {
          success: false,
          limitReached: true,
          message: `Has alcanzado el límite de ${maxCredits} créditos de generación del Plan Gratuito.`
        };
      }

      if (user) {
        user.generationsCount = currentGen + 1;
        await userRepository.saveUser(user);
      }
    }

    if (isExplicitGenerate) {
      await statsRepository.incrementGenerations();
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
    const bgColor = params.bgColor || customColors.bgColor || design.bgColor;
    const qrSilhouetteMode = params.qrSilhouetteMode || customColors.qrSilhouetteMode || 'none';
    const skipWhiteCard = (qrSilhouetteMode === 'icon_pure');

    let primaryQrColor = params.qrColor || customColors.qrColor || design.qrColor;
    if (!skipWhiteCard && !this.isDarkColor(primaryQrColor)) {
      primaryQrColor = this.isDarkColor(bgColor) ? bgColor : '#0f172a';
    }
    let activeQrColor = primaryQrColor;

    const activeEyeColor = params.eyeColor || customColors.eyeColor || params.customEyeColor || primaryQrColor;
    const activeGradientType = params.gradientType || customColors.gradientType || 'single';
    const activeQrColor2 = params.qrColor2 || customColors.qrColor2 || null;
    const frameColor = params.frameColor || customColors.frameColor || design.frameColor;
    const textColor = params.textColor || customColors.textColor || design.textColor;
    const badgeBg = params.badgeBg || customColors.badgeBg || design.badgeBg;
    const badgeText = params.badgeText || customColors.badgeText || design.badgeText;

    const activeBannerText = (bannerText !== undefined && bannerText !== null && bannerText !== '') 
      ? String(bannerText) 
      : (design.bannerText || 'SCAN ME');

    const dotStyle = customDotStyle || design.dotStyle || 'square';
    const eyeStyle = customEyeStyle || design.eyeStyle || 'square';

    const qrOpts = { errorCorrectionLevel: 'H' };
    const densityVal = (params.qrDensity !== undefined && params.qrDensity !== null) ? parseInt(params.qrDensity, 10) : 50;
    // Map density (1% - 100%) to version (Version 3: 29x29 to Version 7: 45x45)
    // Default at 50% density is Version 5 (37x37 modules)
    const targetVersion = Math.max(3, Math.min(7, Math.round(2 + (densityVal / 100) * 5)));
    qrOpts.version = targetVersion;

    const qrData = QRCode.create(url, qrOpts);
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

    const isDarkBg = this.isDarkColor(bgColor);
    const microRatio = isDarkBg ? 0.78 : 0.76;

    const frameShape = params.frameShape || customColors.frameShape || 'rectangular';

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
      loadedIconImg,
      frameShape,
      skipBorder: (qrSilhouetteMode !== 'none'),
      titlePosition: params.titlePosition || 'bottom',
      titleOffsetY: parseInt(params.titleOffsetY, 10) || 0
    });

    const rawQrAreaSize = (qrSilhouetteMode !== 'none') ? (440 * scale) : (340 * scale);
    const cellSize = Math.max(2, Math.floor(rawQrAreaSize / size));
    const qrAreaSize = cellSize * size;
    const qrX = Math.round((canvasWidth - qrAreaSize) / 2);
    const qrY = Math.round(155 * scale);

    const activeEyeColor1 = customColors.eyeColor || params.customEyeColor || activeQrColor;
    const eyeGradType = customColors.eyeGradientType || params.eyeGradientType || 'single';
    const activeEyeColor2 = customColors.eyeColor2 || params.eyeColor2 || null;

    let finalEyeFill = activeEyeColor1;
    if (eyeGradType !== 'single' && activeEyeColor2) {
      const isEye1Dark = this.isDarkColor(activeEyeColor1);
      const isEye2Dark = this.isDarkColor(activeEyeColor2);
      if (isDarkBg ? (!isEye1Dark && !isEye2Dark) : (isEye1Dark && isEye2Dark)) {
        let eGrad;
        if (eyeGradType === 'linear') {
          eGrad = ctx.createLinearGradient(qrX, qrY, qrX + qrAreaSize, qrY + qrAreaSize);
        } else {
          eGrad = ctx.createRadialGradient(
            qrX + qrAreaSize / 2, qrY + qrAreaSize / 2, 0,
            qrX + qrAreaSize / 2, qrY + qrAreaSize / 2, qrAreaSize / 1.3
          );
        }
        eGrad.addColorStop(0, activeEyeColor1);
        eGrad.addColorStop(1, activeEyeColor2);
        finalEyeFill = eGrad;
      }
    }

    if (!skipWhiteCard) {
      const boxRadiusVal = (params.qrBoxRadius !== undefined ? parseInt(params.qrBoxRadius, 10) : (customColors.qrBoxRadius !== undefined ? parseInt(customColors.qrBoxRadius, 10) : 18)) * scale;
      const cardPad = Math.max(26 * scale, Math.round(3 * cellSize));
      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, qrX - cardPad, qrY - cardPad, qrAreaSize + cardPad * 2, qrAreaSize + cardPad * 2, boxRadiusVal);
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 1.5 * scale;
      this.roundRect(ctx, qrX - cardPad, qrY - cardPad, qrAreaSize + cardPad * 2, qrAreaSize + cardPad * 2, boxRadiusVal);
      ctx.stroke();
    }
    let alphaMask = null;
    if (qrSilhouetteMode !== 'none') {
      alphaMask = this.createSilhouetteAlphaMask(qrSilhouetteMode, loadedIconImg, iconName);
    }

    let activeDotStyle = dotStyle || 'rounded';
    let effectiveGradientType = activeGradientType;

    if (qrSilhouetteMode !== 'none') {
      effectiveGradientType = 'single';
    }

    if (effectiveGradientType !== 'single' && activeQrColor2) {
      const isQr1Dark = this.isDarkColor(activeQrColor);
      const isQr2Dark = this.isDarkColor(activeQrColor2);
      if (isDarkBg ? (!isQr1Dark && !isQr2Dark) : (isQr1Dark && isQr2Dark)) {
        let grad;
        if (effectiveGradientType === 'linear') {
          grad = ctx.createLinearGradient(qrX, qrY, qrX + qrAreaSize, qrY + qrAreaSize);
        } else {
          grad = ctx.createRadialGradient(
            qrX + qrAreaSize / 2, qrY + qrAreaSize / 2, 0,
            qrX + qrAreaSize / 2, qrY + qrAreaSize / 2, qrAreaSize / 1.3
          );
        }
        grad.addColorStop(0, activeQrColor);
        grad.addColorStop(1, activeQrColor2);
        activeQrColor = grad;
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

    const safeEyeStyle = ['square', 'rounded', 'circle', 'leaf'].includes(eyeStyle) ? eyeStyle : 'rounded';
    const effectiveEyeStyle = (qrSilhouetteMode !== 'none') ? 'rounded' : safeEyeStyle;

    // Helper: draw the 3 finder-pattern eyes on a given context (no clip restrictions)
    const drawFinderEyes = (targetCtx, eyeFill) => {
      eyes.forEach(eye => {
        targetCtx.fillStyle = skipWhiteCard ? bgColor : '#ffffff';
        targetCtx.fillRect(eye.x - cellSize, eye.y - cellSize, 9 * cellSize, 9 * cellSize);
        this.drawEye(targetCtx, eye.x, eye.y, outerRadius, effectiveEyeStyle, eyeFill);
        targetCtx.fillStyle = skipWhiteCard ? bgColor : '#ffffff';
        if (effectiveEyeStyle === 'circle') {
          targetCtx.beginPath();
          targetCtx.arc(eye.x + outerRadius / 2, eye.y + outerRadius / 2, (outerRadius - 2 * cellSize) / 2, 0, Math.PI * 2);
          targetCtx.fill();
        } else if (effectiveEyeStyle === 'rounded') {
          this.roundRect(targetCtx, eye.x + cellSize, eye.y + cellSize, outerRadius - 2 * cellSize, outerRadius - 2 * cellSize, (outerRadius - 2 * cellSize) * 0.15);
          targetCtx.fill();
        } else if (effectiveEyeStyle === 'leaf') {
          this.roundRect(targetCtx, eye.x + cellSize, eye.y + cellSize, outerRadius - 2 * cellSize, outerRadius - 2 * cellSize, { tl: (outerRadius - 2 * cellSize) * 0.22, tr: 0, br: (outerRadius - 2 * cellSize) * 0.22, bl: 0 });
          targetCtx.fill();
        } else {
          targetCtx.fillRect(eye.x + cellSize, eye.y + cellSize, outerRadius - 2 * cellSize, outerRadius - 2 * cellSize);
        }
        this.drawEye(targetCtx, eye.x + innerOffset, eye.y + innerOffset, innerSize, effectiveEyeStyle, eyeFill);
      });
    };

    if (qrSilhouetteMode === 'none') {
      // ── Standard QR (no silhouette) ──────────────────────────────────────────
      drawFinderEyes(ctx, finalEyeFill);

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const isDataModule = modules.get(r, c);
          const isEye = (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
          if (isEye) continue;

          const cellX = qrX + c * cellSize;
          const cellY = qrY + r * cellSize;
          const isHorizontalTiming = (r === 6 && c >= 7 && c < size - 7);
          const isVerticalTiming   = (c === 6 && r >= 7 && r < size - 7);
          const isCornerFormatInfo = (r <= 8 && c <= 8) || (r <= 8 && c >= size - 9) || (r >= size - 9 && c <= 8);

          if (isCornerFormatInfo || isHorizontalTiming || isVerticalTiming) {
            if (isDataModule) { ctx.fillStyle = primaryQrColor; ctx.fillRect(cellX, cellY, cellSize + 0.1, cellSize + 0.1); }
          } else if (isDataModule) {
            if (activeDotStyle === 'connected') {
              const getMod = (row, col) => (row >= 0 && row < size && col >= 0 && col < size) ? modules.get(row, col) : false;
              const top = getMod(r - 1, c); const bottom = getMod(r + 1, c);
              const left = getMod(r, c - 1); const right = getMod(r, c + 1);
              const radiusVal = cellSize * 0.45;
              const radii = { tl: (top || left) ? 0 : radiusVal, tr: (top || right) ? 0 : radiusVal, br: (bottom || right) ? 0 : radiusVal, bl: (bottom || left) ? 0 : radiusVal };
              ctx.fillStyle = activeQrColor;
              this.roundRect(ctx, cellX + 0.3, cellY + 0.3, cellSize - 0.6, cellSize - 0.6, radii);
              ctx.fill();
            } else {
              this.drawDotPattern(ctx, cellX, cellY, cellSize, activeDotStyle, activeQrColor);
            }
          }
        }
      }
    } else {
      // ── Silhouette QR — DUAL-CONTRAST ARCHITECTURE ──────────────────────────
      //
      // 1. Draw subtle background data dots on the main canvas
      //    Guarantees 100% camera decodability (ZXing, Google Lens, iOS Camera)
      //    even when the central silhouette is reduced by at least 30%.
      const { r: cr_, g: cg_, b: cb_ } = this.hexToRgb(primaryQrColor);
      const outsideColor = isDarkBg 
        ? 'rgba(255, 255, 255, 0.50)' 
        : `rgba(${cr_}, ${cg_}, ${cb_}, 0.50)`;

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const isDataModule = modules.get(r, c);
          if (!isDataModule) continue;

          const isEye = (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
          if (isEye) continue;

          const cellX = qrX + c * cellSize;
          const cellY = qrY + r * cellSize;
          const isHorizontalTiming = (r === 6 && c >= 7 && c < size - 7);
          const isVerticalTiming   = (c === 6 && r >= 7 && r < size - 7);
          const isCornerFormatInfo = (r <= 8 && c <= 8) || (r <= 8 && c >= size - 9) || (r >= size - 9 && c <= 8);

          if (isCornerFormatInfo || isHorizontalTiming || isVerticalTiming) {
            ctx.fillStyle = primaryQrColor;
            ctx.fillRect(cellX, cellY, cellSize + 0.1, cellSize + 0.1);
          } else {
            ctx.fillStyle = outsideColor;
            ctx.beginPath();
            ctx.arc(cellX + cellSize / 2, cellY + cellSize / 2, cellSize * 0.48, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 2. Offscreen canvas: full-density silhouette interior using the selected dot pattern
      const offCanvas = createCanvas(canvasWidth, canvasHeight);
      const offCtx = offCanvas.getContext('2d');
      offCtx.clearRect(0, 0, canvasWidth, canvasHeight);

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const isDataModule = modules.get(r, c);
          if (!isDataModule) continue;

          const isEye = (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
          if (isEye) continue;

          const cellX = qrX + c * cellSize;
          const cellY = qrY + r * cellSize;
          const isHorizontalTiming = (r === 6 && c >= 7 && c < size - 7);
          const isVerticalTiming   = (c === 6 && r >= 7 && r < size - 7);
          const isCornerFormatInfo = (r <= 8 && c <= 8) || (r <= 8 && c >= size - 9) || (r >= size - 9 && c <= 8);

          if (isCornerFormatInfo || isHorizontalTiming || isVerticalTiming) {
            offCtx.fillStyle = primaryQrColor;
            offCtx.fillRect(cellX, cellY, cellSize + 0.1, cellSize + 0.1);
          } else if (activeDotStyle === 'connected') {
            const getMod = (row, col) => (row >= 0 && row < size && col >= 0 && col < size) ? modules.get(row, col) : false;
            const top = getMod(r - 1, c); const bottom = getMod(r + 1, c);
            const left = getMod(r, c - 1); const right = getMod(r, c + 1);
            const radiusVal = cellSize * 0.45;
            const radii = { tl: (top || left) ? 0 : radiusVal, tr: (top || right) ? 0 : radiusVal, br: (bottom || right) ? 0 : radiusVal, bl: (bottom || left) ? 0 : radiusVal };
            offCtx.fillStyle = primaryQrColor;
            this.roundRect(offCtx, cellX + 0.3, cellY + 0.3, cellSize - 0.6, cellSize - 0.6, radii);
            offCtx.fill();
          } else {
            this.drawDotPattern(offCtx, cellX, cellY, cellSize, activeDotStyle, primaryQrColor);
          }
        }
      }

      // 3. Clip to silhouette shape (reduced 30%), clear interior with clean card background, stamp offscreen
      ctx.save();
      ctx.beginPath();
      this.buildSilhouetteClipPath(ctx, qrSilhouetteMode, loadedIconImg, iconName, qrX, qrY, qrAreaSize, alphaMask, size, cellSize);
      ctx.clip();
      ctx.fillStyle = skipWhiteCard ? bgColor : '#ffffff';
      ctx.fillRect(qrX, qrY, qrAreaSize, qrAreaSize);
      ctx.drawImage(offCanvas, 0, 0);
      ctx.restore();

      // 4. Finder pattern eyes — drawn on top without clip, always fully visible
      drawFinderEyes(ctx, finalEyeFill);

      // 5. Ensure format information and timing modules are 100% crisp and intact on top
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const isEye = (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
          if (isEye) continue;
          const isHorizontalTiming = (r === 6 && c >= 7 && c < size - 7);
          const isVerticalTiming   = (c === 6 && r >= 7 && r < size - 7);
          const isCornerFormatInfo = (r <= 8 && c <= 8) || (r <= 8 && c >= size - 9) || (r >= size - 9 && c <= 8);
          if (isCornerFormatInfo || isHorizontalTiming || isVerticalTiming) {
            const cellX = qrX + c * cellSize;
            const cellY = qrY + r * cellSize;
            if (modules.get(r, c)) {
              ctx.fillStyle = primaryQrColor;
              ctx.fillRect(cellX, cellY, cellSize + 0.1, cellSize + 0.1);
            } else {
              ctx.fillStyle = skipWhiteCard ? bgColor : '#ffffff';
              ctx.fillRect(cellX, cellY, cellSize + 0.1, cellSize + 0.1);
            }
          }
        }
      }
    }

    const shouldDrawCenterBadge = (showIcon !== false) && (qrSilhouetteMode === 'none' || qrSilhouetteMode === 'icon_center');
    if (shouldDrawCenterBadge && iconPosition === 'center') {
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
