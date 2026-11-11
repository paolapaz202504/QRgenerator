import { UIComponent } from './UIComponent.js';
import { appState } from '../state/AppState.js';
import { ApiService } from '../services/ApiService.js';
import { ModalService } from '../services/ModalService.js';
import { renderIconToDataUrl, getIconClass } from '../utils/iconRender.js';

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
    this.titlePosInput = document.getElementById('qr-title-position');
    this.titleOffsetInput = document.getElementById('qr-title-offset');
    this.titleOffsetVal = document.getElementById('qr-title-offset-val');

    this.debounceTimer = null;
    this.creditDebounceTimer = null;
    this.currentBlobUrl = null;

    appState.subscribe((state, eventKey) => {
      // Regla 1: Selección de plantilla o inicialización -> Muestra inmediatamente la vista previa sin costo de créditos ni códigos QR
      const templateEvents = [
        'INIT_DATA',
        'CHANGE_DESIGN',
        'PLAN_UPDATED'
      ];

      // Regla 2: Modificación de configuraciones -> NO muestra vista previa, pero incrementa créditos del plan
      const configChangeEvents = [
        'CHANGE_INPUTS',
        'CHANGE_PATTERN',
        'CHANGE_ICON',
        'CHANGE_ICON_MODE',
        'CHANGE_ICON_SOURCE'
      ];

      if (eventKey && templateEvents.includes(eventKey)) {
        this.scheduleGenerate();
      } else if (eventKey && configChangeEvents.includes(eventKey)) {
        this.scheduleConsumeCredit();
      }
    });
  }

  scheduleConsumeCredit() {
    clearTimeout(this.creditDebounceTimer);
    this.creditDebounceTimer = setTimeout(async () => {
      const state = appState.getState();
      if (!state.user || !state.user.email) return;

      try {
        const res = await ApiService.consumeCredit(state.user.email);
        if (res && res.success && res.creditsUsed !== undefined) {
          appState.setState({
            user: {
              ...state.user,
              creditsUsed: res.creditsUsed
            }
          }, 'CREDIT_CONSUMED');
        } else if (res && res.limitReached) {
          await ModalService.alert({
            title: 'Límite de Créditos Alcanzado',
            message: res.message || 'Has alcanzado el límite de créditos de configuración de tu plan.',
            type: 'warning'
          });
        }
      } catch (err) {
        console.warn('[QRPreview] Error al consumir crédito de configuración:', err);
      }
    }, 350);
  }

  bindEvents() {
    [this.urlInput, this.titleInput, this.bannerTextInput].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          this.syncFontStyles();
          appState.setState({}, 'CHANGE_INPUTS');
        });
      }
    });

    [this.titleFontInput, this.bannerFontInput].forEach(select => {
      if (select) {
        select.addEventListener('change', () => {
          this.syncFontStyles();
          appState.setState({}, 'CHANGE_INPUTS');
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

    if (this.titlePosInput) {
      this.titlePosInput.addEventListener('change', () => {
        appState.setState({ titlePosition: this.titlePosInput.value }, 'CHANGE_INPUTS');
      });
    }

    if (this.titleOffsetInput) {
      this.titleOffsetInput.addEventListener('input', () => {
        const val = parseInt(this.titleOffsetInput.value, 10);
        if (this.titleOffsetVal) this.titleOffsetVal.textContent = `${val > 0 ? '+' : ''}${val}px`;
        appState.setState({ titleOffsetY: val }, 'CHANGE_INPUTS');
      });
    }

    if (this.btnGenerate) {
      this.btnGenerate.addEventListener('click', () => this.generateNow(true));
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

    const btnToggleScannability = document.getElementById('btn-toggle-scannability-info');
    if (btnToggleScannability) {
      btnToggleScannability.addEventListener('click', (e) => {
        e.preventDefault();
        const details = document.getElementById('scannability-warn-details');
        const chevron = document.getElementById('icon-scannability-chevron');
        const label = document.getElementById('scannability-toggle-label');
        if (details) {
          const isHidden = details.classList.contains('hidden');
          details.classList.toggle('hidden', !isHidden);
          if (chevron) chevron.classList.toggle('rotate-180', isHidden);
          if (label) label.textContent = isHidden ? 'Ocultar' : 'Ver detalles';
        }
      });
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
    this.debounceTimer = setTimeout(() => this.generateNow(false), 150);
  }

  getPayload(targetWidth = 600, isExplicit = false) {
    const state = appState.getState();
    const design = state.currentDesign || {};

    const eyeColorVal = (document.getElementById('custom-eye-color')?.value) || state.customEyeColor || design.eyeColor || design.qrColor || '#111827';
    const eyeStyleVal = (document.getElementById('custom-eye-style')?.value) || state.customEyeStyle || design.eyeStyle || 'square';
    const eyeGradTypeVal = (document.getElementById('custom-eye-gradient-type')?.value) || state.eyeGradientType || 'single';
    const eyeColor2Val = (document.getElementById('custom-eye-color2')?.value) || state.eyeColor2 || null;

    const qrColorVal = (document.getElementById('custom-qr-color')?.value) || design.qrColor || '#111827';
    const qrGradTypeVal = (document.getElementById('custom-gradient-type')?.value) || state.gradientType || 'single';
    const qrColor2Val = (document.getElementById('custom-qr-color2')?.value) || state.qrColor2 || null;

    const bgColorVal = (document.getElementById('custom-bg-color')?.value) || design.bgColor || '#ffffff';
    const frameColorVal = (document.getElementById('custom-frame-color')?.value) || design.frameColor || '#2563eb';
    const frameShapeVal = (document.getElementById('custom-frame-shape')?.value) || state.frameShape || design.frameShape || 'rectangular';

    const iconShowEl = document.getElementById('qr-icon-show');
    const silShowEl = document.getElementById('qr-silhouette-show');
    const isIconChecked = iconShowEl ? iconShowEl.checked : (state.iconShow !== false);
    const isSilChecked = silShowEl ? silShowEl.checked : (state.silhouetteShow === true || state.qrSilhouetteMode === 'icon_center' || state.qrSilhouetteMode === 'icon_only');

    let silModeVal = 'none';
    if (isSilChecked && isIconChecked) {
      silModeVal = 'icon_center';
    } else if (isSilChecked && !isIconChecked) {
      silModeVal = 'icon_only';
    } else {
      silModeVal = 'none';
    }

    const silColorVal = (document.getElementById('custom-silhouette-color')?.value) || state.silhouetteColor || design.silhouetteColor || '#2563eb';
    const patColorVal = (document.getElementById('custom-pattern-color')?.value) || state.patternColor || design.patternColor || '#475569';

    const densityVal = (document.getElementById('custom-qr-density') ? parseInt(document.getElementById('custom-qr-density').value, 10) : (state.qrDensity !== undefined ? state.qrDensity : 50));
    const boxRadiusVal = (document.getElementById('custom-qr-box-radius') ? parseInt(document.getElementById('custom-qr-box-radius').value, 10) : (state.qrBoxRadius !== undefined ? state.qrBoxRadius : 18));

    return {
      url: this.urlInput ? this.urlInput.value : 'QRbey',
      title: this.titleInput ? this.titleInput.value : 'QRbery',
      bannerText: this.bannerTextInput ? this.bannerTextInput.value : 'ESCANÉAME',
      designId: design.id || 'design-institucional-1',
      bgColor: bgColorVal,
      qrColor: qrColorVal,
      frameColor: frameColorVal,
      eyeColor: eyeColorVal,
      eyeStyle: eyeStyleVal,
      customColors: {
        bgColor: bgColorVal,
        qrColor: qrColorVal,
        frameColor: frameColorVal,
        textColor: design.textColor,
        badgeBg: design.badgeBg,
        badgeText: design.badgeText,
        eyeColor: eyeColorVal,
        gradientType: qrGradTypeVal,
        qrColor2: qrColor2Val,
        eyeGradientType: eyeGradTypeVal,
        eyeColor2: eyeColor2Val,
        silhouetteColor: silColorVal,
        patternColor: patColorVal
      },
      customDotStyle: state.currentPattern || (document.getElementById('pattern-grid')?.querySelector('.active-pattern')?.dataset?.patternId) || 'square',
      customEyeStyle: eyeStyleVal,
      customEyeColor: eyeColorVal,
      eyeGradientType: eyeGradTypeVal,
      eyeColor2: eyeColor2Val,
      qrBoxRadius: boxRadiusVal,
      qrSilhouetteMode: silModeVal,
      qrDensity: densityVal,
      gradientType: qrGradTypeVal,
      qrColor2: qrColor2Val,
      silhouetteColor: silColorVal,
      patternColor: patColorVal,
      frameShape: frameShapeVal,
      titlePosition: state.titlePosition || (this.titlePosInput ? this.titlePosInput.value : 'bottom'),
      titleOffsetY: state.titleOffsetY !== undefined ? state.titleOffsetY : (this.titleOffsetInput ? parseInt(this.titleOffsetInput.value, 10) : 0),
      targetWidth,
      fontTitle: this.titleFontInput ? this.titleFontInput.value : 'Plus Jakarta Sans',
      fontBanner: this.bannerFontInput ? this.bannerFontInput.value : 'Plus Jakarta Sans',
      fontSizeTitle: state.fontSizeTitle || 24,
      showIcon: isIconChecked,
      showShield: true,
      iconMode: state.iconMode,
      iconName: state.selectedIcon,
      iconPosition: state.iconPosition,
      iconColor: state.iconColor,
      iconBgColor: state.iconBgColor,
      iconBorderColor: state.iconBorderColor,
      iconSize: parseInt(state.iconSize, 10) || 34,
      customLogoDataUrl: state.iconMode === 'image' ? state.customLogoDataUrl : (state.generatedIconDataUrl || state.customLogoDataUrl || null),
      userEmail: state.user ? state.user.email : null,
      isExplicitGenerate: isExplicit
    };
  }

  async generateNow(isExplicit = false) {
    if (!this.container) return;

    // Regla de Negocio y Seguridad Estricta:
    // Si el usuario presiona explícitamente "Generar código qr", debe haber iniciado sesión obligatoriamente.
    const state = appState.getState();
    const user = state.user;

    if (isExplicit && (!user || !user.email)) {
      if (this.canvasLoader) this.canvasLoader.classList.add('hidden');
      const oauthModal = document.getElementById('oauth-modal');
      if (oauthModal) {
        oauthModal.classList.remove('hidden');
        const alertBox = document.getElementById('oauth-auth-required-alert');
        if (alertBox) alertBox.classList.remove('hidden');
        const emailInput = document.getElementById('auth-email-input');
        if (emailInput) {
          emailInput.focus();
        }
      }
      return;
    }

    if (this.canvasLoader) this.canvasLoader.classList.remove('hidden');

    try {
      if (state.iconMode !== 'image' && !state.generatedIconDataUrl && state.selectedIcon) {
        try {
          const iconCls = getIconClass(state.selectedIcon);
          const iconColor = state.iconColor || '#2563eb';
          const dataUrl = await renderIconToDataUrl(iconCls, iconColor);
          if (dataUrl) {
            appState.setState({ generatedIconDataUrl: dataUrl }, 'CHANGE_ICON');
          }
        } catch (err) {
          console.warn('[QRPreview] Pre-rendering icon fallback error:', err);
        }
      }

      const payload = this.getPayload(600, isExplicit);
      
      const payloadForHash = { ...payload };
      delete payloadForHash.isExplicitGenerate;
      const payloadHash = JSON.stringify(payloadForHash);
      
      // Regla de Oro: Solo se consume crédito cuando el usuario presiona explícitamente "Generar código qr".
      // El cambio de plantilla (isExplicit = false) no consume créditos.
      const shouldConsumeCredit = isExplicit;
      payload.isExplicitGenerate = shouldConsumeCredit;

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

        // Verificación óptica de legibilidad y escaneabilidad en tiempo real
        this.checkScannability(ctx, img.width, img.height, payload);
      };
      img.src = url;

      // Regla 3: Al hacer clic en "Generar código QR" (isExplicit = true), incrementar contador de códigos QR del plan
      if (shouldConsumeCredit) {
        const state = appState.getState();
        if (state.user) {
          const updatedUser = {
            ...state.user,
            generationsCount: (state.user.generationsCount || 0) + 1
          };
          appState.setState({ user: updatedUser }, 'QR_GENERATED');
        }
      }
    } catch (err) {
      console.error('[QRPreview] Error generating preview:', err);
      if (this.canvasLoader) this.canvasLoader.classList.add('hidden');
      if (err.data && err.data.limitReached) {
        const state = appState.getState();
        const userPlan = (state.user && state.user.plan) ? state.user.plan : 'free';
        const fallbackMsg = userPlan === 'pro' 
          ? 'Has alcanzado el límite de 500 códigos QR generados de tu Plan Profesional.' 
          : 'Has alcanzado el límite de 15 códigos QR generados de tu Plan Gratuito.';
        await ModalService.alert({
          title: 'Límite de Códigos QR Alcanzado',
          message: err.data.message || fallbackMsg,
          type: 'warning'
        });
      }
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
      if (state.iconMode !== 'image' && !state.generatedIconDataUrl && state.selectedIcon) {
        try {
          const iconCls = getIconClass(state.selectedIcon);
          const iconColor = state.iconColor || '#2563eb';
          const dataUrl = await renderIconToDataUrl(iconCls, iconColor);
          if (dataUrl) {
            appState.setState({ generatedIconDataUrl: dataUrl }, 'CHANGE_ICON');
          }
        } catch (err) {
          console.warn('[QRPreview] Pre-rendering icon download fallback error:', err);
        }
      }

      const payload = this.getPayload(resolution);
      payload.format = format;

      // Generar el archivo en alta fidelidad (SVG vectorial o PNG 800/2000px) desde el backend
      const blob = await ApiService.generateQR(payload);
      const downloadBlobUrl = URL.createObjectURL(blob);
      const canvasDataUrl = this.container ? this.container.toDataURL('image/png') : null;

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
        link.href = downloadBlobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(downloadBlobUrl), 5000);

        appState.notify('HISTORY_UPDATED');
      } else if (trackRes.message) {
        await ModalService.alert({
          title: 'Límite de Descargas',
          message: trackRes.message,
          type: 'warning'
        });
      }
    } catch (err) {
      console.error('[QRPreview] Error downloading QR:', err);
    }
  }

  checkScannability(ctx, width, height, payload) {
    const badgeOk = document.getElementById('scannability-badge-ok');
    const badgeWarn = document.getElementById('scannability-badge-warn');
    if (!badgeOk || !badgeWarn) return;

    let isReadable = false;

    // 1. Verificación Óptica mediante jsQR en el cliente
    if (typeof window.jsQR === 'function') {
      try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const code = window.jsQR(imgData.data, width, height, {
          inversionAttempts: 'dontInvert'
        });
        if (code && code.data) {
          isReadable = true;
        }
      } catch (err) {
        console.warn('[QRPreview] Error en decodificación óptica jsQR:', err);
      }
    }

    // 2. Verificación de Contraste Cromático Heurístico (WCAG Ratio)
    const qrColor = payload.qrColor || '#111827';
    const bgColor = payload.bgColor || '#ffffff';
    const contrastRatio = this.calculateContrastRatio(qrColor, bgColor);
    if (contrastRatio < 2.0) {
      isReadable = false;
    }

    // 3. Actualizar UI reactiva
    if (isReadable) {
      badgeOk.classList.remove('hidden');
      badgeWarn.classList.add('hidden');
    } else {
      badgeOk.classList.add('hidden');
      badgeWarn.classList.remove('hidden');
      // En caso de baja legibilidad, dejar visible solo el tag 'Precaución' con detalles colapsados
      const details = document.getElementById('scannability-warn-details');
      const chevron = document.getElementById('icon-scannability-chevron');
      const label = document.getElementById('scannability-toggle-label');
      if (details) details.classList.add('hidden');
      if (chevron) chevron.classList.remove('rotate-180');
      if (label) label.textContent = 'Ver detalles';
    }
  }

  calculateContrastRatio(hex1, hex2) {
    const lum1 = this.getLuminance(hex1);
    const lum2 = this.getLuminance(hex2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  getLuminance(hex) {
    let clean = (hex || '#000000').replace('#', '');
    if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    const a = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  resetInputs() {
    if (this.urlInput) this.urlInput.value = 'QRbey';
    if (this.titleInput) this.titleInput.value = 'QRbery';
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
