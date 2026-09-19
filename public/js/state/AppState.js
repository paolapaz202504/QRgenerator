/**
 * AppState - Centralized Reactive Application State Manager (Observer Pattern).
 * Follows Single Responsibility and Open/Closed Principles (SOLID).
 */
export class AppState {
  constructor() {
    this.listeners = [];
    this.state = {
      user: null,
      categories: [],
      designs: [],
      patterns: [],
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
      url: 'Escribe o pega tu enlace',
      title: 'Escribe o pega el texto del titulo',
      bannerText: 'Escanéame',
      fontTitle: 'Plus Jakarta Sans',
      fontBanner: 'Plus Jakarta Sans',
      fontSizeTitle: 24,
      customEyeColor: null,
      gradientType: 'single',
      qrColor2: '#a855f7',
      frameShape: 'rectangular',
      titlePosition: 'bottom',
      titleOffsetY: 0,
      history: []
    };

    this.loadPersistedUser();
  }

  loadPersistedUser() {
    try {
      const savedUserStr = localStorage.getItem('oauth_user');
      if (savedUserStr) {
        this.state.user = JSON.parse(savedUserStr);
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
    if (partialState.user !== undefined) {
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
