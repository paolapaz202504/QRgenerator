class DesignLibrary {
  constructor() {
    this.categories = [
      'Institucional', 'Salud', 'Viajes', 'Inmobiliaria', 'Educación', 
      'Eventos', 'Redes Sociales', 'Lujo', 'Música y Arte', 'Mascotas', 
      'Automotriz', 'Finanzas', 'Naturaleza'
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



}
module.exports = new DesignLibrary();