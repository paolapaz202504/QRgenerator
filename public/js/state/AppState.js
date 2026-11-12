/**
 * AppState - Centralized Reactive Application State Manager (Observer Pattern).
 * Follows Single Responsibility and Open/Closed Principles (SOLID).
 */
export const DEFAULT_PATTERNS = [
  { id: 'square', name: 'Cuadrado Clásico', icon: 'fa-square' },
  { id: 'rounded', name: 'Módulo Redondeado', icon: 'fa-square-minus' },
  { id: 'dots', name: 'Círculos / Puntos', icon: 'fa-circle' },
  { id: 'smooth', name: 'Módulo Fluido', icon: 'fa-cubes' },
  { id: 'diamond', name: 'Diamante / Rombo', icon: 'fa-gem' },
  { id: 'star', name: 'Estrellas 5 Puntas', icon: 'fa-star' },
  { id: 'sparkle', name: 'Destellos 4 Puntas', icon: 'fa-certificate' },
  { id: 'heart', name: 'Corazones', icon: 'fa-heart' },
  { id: 'hexagon', name: 'Hexágonos Tech', icon: 'fa-cube' },
  { id: 'ring', name: 'Anillos Concéntricos', icon: 'fa-circle-dot' },
  { id: 'diamond_rounded', name: 'Rombo Suave', icon: 'fa-diamond' },
  { id: 'cross', name: 'Cruces Modernas', icon: 'fa-plus' },
  { id: 'clover', name: 'Trébol 4 Hojas', icon: 'fa-clover' },
  { id: 'sunburst', name: 'Sol / Rayos', icon: 'fa-sun' },
  { id: 'leaf_dot', name: 'Hojas Naturales', icon: 'fa-leaf' },
  { id: 'halftone', name: 'Semitono Gráfico', icon: 'fa-braille' },
  { id: 'shield_dot', name: 'Escudo Insignia', icon: 'fa-shield' },
  { id: 'flower', name: 'Flores 4 Pétalos', icon: 'fa-fan' },
  { id: 'diagonal_lines', name: 'Líneas Diagonales', icon: 'fa-barcode' },
  { id: 'radial_drop', name: 'Gota Radial', icon: 'fa-droplet' },
  { id: 'bubble', name: 'Burbujas Flotantes', icon: 'fa-circle-notch' },
  { id: 'pixel', name: 'Píxel 8-Bit Retro', icon: 'fa-border-all' }
];

export class AppState {
  constructor() {
    this.listeners = [];
    this.state = {
      user: null,
      categories: [],
      designs: [],
      patterns: [...DEFAULT_PATTERNS],
      activeCategory: 'all',
      currentDesign: null,
      currentPattern: 'square',
      iconMode: 'icon', // 'icon' or 'image'
      customLogoDataUrl: null,
      selectedIcon: 'fa-qrcode',
      iconPosition: 'center',
      iconSize: 34,
      iconShow: true,
      iconColor: '#2563eb',
      iconBgColor: '#ffffff',
      iconBorderColor: '#2563eb',
      url: 'QRbey',
      title: 'QRbery',
      bannerText: 'Escanéame',
      fontTitle: 'Plus Jakarta Sans',
      fontBanner: 'Plus Jakarta Sans',
      fontSizeTitle: 24,
      customEyeColor: null,
      eyeGradientType: 'single',
      eyeColor2: '#38bdf8',
      qrBoxRadius: 18,
      qrSilhouetteMode: 'none',
      silhouetteShow: false,
      qrDensity: 50,
      gradientType: 'single',
      qrColor2: '#a855f7',
      frameShape: 'rectangular',
      silhouetteColor: '#2563eb',
      patternColor: '#475569',
      titlePosition: 'bottom',
      titleOffsetY: 0,
      history: [],
      // Centralized plans configuration (Single Source of Truth initialized with .env defaults)
      plans: {
        free: { id: 'free', name: 'Plan Gratuito', priceMonthly: 0, maxDownloads: 15, maxCredits: 50, isMonthly: false },
        pro: { id: 'pro', name: 'Plan Profesional', priceMonthly: 9.99, maxDownloads: 500, maxCredits: 2000, isMonthly: true },
        corporate: { id: 'corporate', name: 'Plan Corporativo', priceMonthly: 29.99, maxDownloads: 2000, maxCredits: 10000, isMonthly: true }
      }
    };

    this.loadPersistedUser();
  }

  /**
   * Helper to obtain plan limits and pricing directly from centralized config (.env source of truth)
   */
  getPlanConfig(planId = 'free') {
    let key = (planId || 'free').toLowerCase();
    if (key === 'enterprise') key = 'corporate';
    if (this.state.plans && this.state.plans[key]) {
      return this.state.plans[key];
    }
    const defaultPlans = {
      free: { id: 'free', name: 'Plan Gratuito', priceMonthly: 0, maxDownloads: 15, maxCredits: 50, isMonthly: false },
      pro: { id: 'pro', name: 'Plan Profesional', priceMonthly: 9.99, maxDownloads: 500, maxCredits: 2000, isMonthly: true },
      corporate: { id: 'corporate', name: 'Plan Corporativo', priceMonthly: 29.99, maxDownloads: 2000, maxCredits: 10000, isMonthly: true }
    };
    return defaultPlans[key] || defaultPlans.free;
  }

  loadPersistedUser() {
    if (typeof localStorage === 'undefined') return;
    try {
      const savedUserStr = localStorage.getItem('oauth_user');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        if (u) {
          const planKey = (u.plan || 'free').toLowerCase();
          const planConfig = this.getPlanConfig(planKey);
          u.maxCredits = planConfig.maxCredits;
          u.maxDownloads = planConfig.maxDownloads;
          this.state.user = u;
          localStorage.setItem('oauth_user', JSON.stringify(u));
        }
      }
    } catch (e) {
      console.warn('[AppState] Failed to parse stored user:', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(eventKey = null) {
    this.listeners.forEach(listener => listener(this.state, eventKey));
  }

  setState(partialState, eventKey = null) {
    this.state = { ...this.state, ...partialState };
    if (partialState.user !== undefined && typeof localStorage !== 'undefined') {
      if (this.state.user) {
        localStorage.setItem('oauth_user', JSON.stringify(this.state.user));
      } else {
        localStorage.removeItem('oauth_user');
      }
    }
    this.notify(eventKey);
  }

  getState() {
    return this.state;
  }
}

export const appState = new AppState();
