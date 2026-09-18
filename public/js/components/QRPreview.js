import { UIComponent } from './UIComponent.js';
import { appState } from '../state/AppState.js';
import { ApiService } from '../services/ApiService.js';

export class QRPreview extends UIComponent {
  constructor() {
    super('qr-canvas');
    this.canvasLoader = document.getElementById('canvas-loader');
    this.btnGenerate = document.getElementById('btn-generate');
    this.btnReset = document.getElementById('btn-reset');
    this.btnDownloadPng = document.getElementById('btn-download-png');
    this.btnDownloadHd = document.getElementById('btn-download-hd');
    this.btnDownloadSvg = document.getElementById('btn-download-svg');

    this.urlInput = document.getElementById('qr-url');
    this.titleInput = document.getElementById('qr-title');
    this.bannerTextInput = document.getElementById('qr-banner-text');
    this.titleFontInput = document.getElementById('qr-title-font');
    this.bannerFontInput = document.getElementById('qr-banner-font');
    this.titleSizeInput = document.getElementById('qr-title-size');
    this.titleSizeVal = document.getElementById('qr-title-size-val');

    this.debounceTimer = null;
    this.currentBlobUrl = null;

    appState.subscribe((state, eventKey) => {
      if (['INIT_DATA', 'CHANGE_DESIGN', 'CHANGE_PATTERN', 'CHANGE_ICON', 'CHANGE_ICON_SOURCE', 'CHANGE_ICON_MODE', 'CHANGE_INPUTS'].includes(eventKey)) {
        this.scheduleGenerate();
      }
    });
  }

  bindEvents() {
    [this.urlInput, this.titleInput, this.bannerTextInput].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          this.syncFontStyles();
          this.scheduleGenerate();
        });
      }
    });

    [this.titleFontInput, this.bannerFontInput].forEach(select => {
      if (select) {
        select.addEventListener('change', () => {
          this.syncFontStyles();
          this.scheduleGenerate();
        });
      }
    });

    if (this.titleSizeInput) {
      this.titleSizeInput.addEventListener('input', () => {
        const val = parseInt(this.titleSizeInput.value, 10);
        if (this.titleSizeVal) this.titleSizeVal.textContent = `${val}px`;
        appState.setState({ fontSizeTitle: val }, 'CHANGE_INPUTS');
      });
    }

    if (this.btnGenerate) {
      this.btnGenerate.addEventListener('click', () => this.generateNow());
    }

    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => this.resetInputs());
    }

    if (this.btnDownloadPng) {
      this.btnDownloadPng.addEventListener('click', () => this.handleDownload('png', 800));
    }

    if (this.btnDownloadHd) {
      this.btnDownloadHd.addEventListener('click', () => this.handleDownload('png', 2000));
    }

    if (this.btnDownloadSvg) {
      this.btnDownloadSvg.addEventListener('click', () => this.handleDownload('svg', 800));
    }

    this.syncFontStyles();
  }

  syncFontStyles() {
    if (this.titleFontInput && this.titleInput) {
      const val = this.titleFontInput.value || 'Plus Jakarta Sans';
      this.titleFontInput.style.fontFamily = `'${val}', sans-serif`;
      this.titleInput.style.fontFamily = `'${val}', sans-serif`;
    }
    if (this.bannerFontInput && this.bannerTextInput) {
      const val = this.bannerFontInput.value || 'Plus Jakarta Sans';
      this.bannerFontInput.style.fontFamily = `'${val}', sans-serif`;
      this.bannerTextInput.style.fontFamily = `'${val}', sans-serif`;
    }
  }

  scheduleGenerate() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.generateNow(), 150);
  }

  getPayload(targetWidth = 600) {
    const state = appState.getState();
    const design = state.currentDesign || {};

    return {
      url: this.urlInput ? this.urlInput.value : 'https://qrfy.com',
      title: this.titleInput ? this.titleInput.value : 'Mi Código QR',
      bannerText: this.bannerTextInput ? this.bannerTextInput.value : 'ESCANÉAME',
      designId: design.id || 'design-institucional-1',
      customColors: {
        bgColor: design.bgColor,
        qrColor: design.qrColor,
        frameColor: design.frameColor,
        textColor: design.textColor,
        badgeBg: design.badgeBg,
        badgeText: design.badgeText
      },
      customDotStyle: state.currentPattern,
      customEyeStyle: design.eyeStyle || 'square',
      targetWidth,
      fontTitle: this.titleFontInput ? this.titleFontInput.value : 'Plus Jakarta Sans',
      fontBanner: this.bannerFontInput ? this.bannerFontInput.value : 'Plus Jakarta Sans',
      fontSizeTitle: state.fontSizeTitle || 24,
      showIcon: state.iconShow,
      showShield: true,
      iconMode: state.iconMode,
      iconName: state.selectedIcon,
      iconPosition: state.iconPosition,
      iconColor: state.iconColor,
      iconBgColor: state.iconBgColor,
      iconBorderColor: state.iconBorderColor,
      iconSize: parseInt(state.iconSize, 10) || 34,
      customLogoDataUrl: state.iconMode === 'image' ? state.customLogoDataUrl : (state.generatedIconDataUrl || state.customLogoDataUrl || null),
      userEmail: state.user ? state.user.email : null
    };
  }

  async generateNow() {
    if (!this.container) return;
    if (this.canvasLoader) this.canvasLoader.classList.remove('hidden');

    try {
      const payload = this.getPayload(600);
      const blob = await ApiService.generateQR(payload);
      const url = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        this.container.width = img.width;
        this.container.height = img.height;
        const ctx = this.container.getContext('2d');
        ctx.clearRect(0, 0, img.width, img.height);
        ctx.drawImage(img, 0, 0);
        if (this.canvasLoader) this.canvasLoader.classList.add('hidden');
      };
      img.src = url;
    } catch (err) {
      console.error('[QRPreview] Error generating preview:', err);
      if (this.canvasLoader) this.canvasLoader.classList.add('hidden');
    }
  }

  async handleDownload(format = 'png', resolution = 800) {
    const state = appState.getState();
    if (!state.user) {
      const modal = document.getElementById('oauth-modal');
      if (modal) modal.classList.remove('hidden');
      return;
    }

    try {
      const payload = this.getPayload(resolution);
      const canvasDataUrl = this.container ? this.container.toDataURL(`image/${format === 'svg' ? 'svg+xml' : 'png'}`) : null;

      const trackPayload = {
        userEmail: state.user.email,
        title: payload.title,
        url: payload.url,
        format,
        resolution,
        imageDataUrl: canvasDataUrl
      };

      const trackRes = await ApiService.trackDownload(trackPayload);
      if (trackRes.success) {
        if (trackRes.userStats && state.user) {
          state.user.downloadsCount = trackRes.userStats.downloadsCount;
          appState.setState({ user: state.user }, 'DOWNLOAD_TRACKED');
        }

        const link = document.createElement('a');
        const cleanTitle = (payload.title || 'codigo_qr').replace(/[^a-zA-Z0-9_-]/g, '_');
        link.download = `QR_${cleanTitle}.${format}`;
        link.href = canvasDataUrl;
        link.click();

        appState.notify('HISTORY_UPDATED');
      } else if (trackRes.message) {
        alert(trackRes.message);
      }
    } catch (err) {
      console.error('[QRPreview] Error downloading QR:', err);
    }
  }

  resetInputs() {
    if (this.urlInput) this.urlInput.value = 'Escribe o pega tu enlace';
    if (this.titleInput) this.titleInput.value = 'Escribe o pega el texto del titulo';
    if (this.bannerTextInput) this.bannerTextInput.value = 'Escanéame';
    if (this.titleFontInput) this.titleFontInput.value = 'Plus Jakarta Sans';
    if (this.bannerFontInput) this.bannerFontInput.value = 'Plus Jakarta Sans';

    const designs = appState.getState().designs;
    appState.setState({
      currentDesign: designs.length ? { ...designs[0] } : null,
      currentPattern: 'square',
      activeCategory: 'all',
      iconMode: 'icon',
      customLogoDataUrl: null,
      selectedIcon: 'fa-qrcode',
      iconPosition: 'center',
      iconSize: 34,
      iconShow: true
    }, 'CHANGE_DESIGN');
  }
}
