/**
 * MiniEditor - Controlador para el mini-editor demostrativo en la Home.
 * Permite a cualquier usuario generar un QR de prueba sin restricciones ni registro,
 * utilizando plantillas desacopladas y persistentes extraídas de /editor,
 * y transferir los datos precargados al editor avanzado (/editor?url=...&preset=...&title=...).
 */

/**
 * Plantillas persistentes extraídas exactamente de /editor (DesignLibrary).
 * Estas plantillas permanecen inmutables y desacopladas en el mini-editor
 * aunque las plantillas de /editor cambien en el futuro.
 */
export const MINI_EDITOR_TEMPLATES = {
  // 1. Restaurante -> "Happy Hour" (Gastronomía, design-gastronomia-6)
  restaurante: {
    id: 'design-gastronomia-6',
    name: 'Happy Hour',
    category: 'Gastronomía',
    bgColor: '#f5f3ff',
    qrColor: '#4c1d95',
    qrColor2: '#7c3aed',
    gradientType: 'radial',
    silhouetteColor: '#c026d3',
    patternColor: '#4c1d95',
    frameColor: '#c026d3',
    frameShape: 'ticket',
    frameStyle: 'badge',
    textColor: '#0f172a',
    badgeBg: '#c026d3',
    badgeText: '#ffffff',
    dotStyle: 'star',
    eyeStyle: 'shield',
    eyeColor: '#c026d3',
    eyeColor2: '#7c3aed',
    eyeGradientType: 'linear',
    iconName: 'fa-martini-glass-citrus',
    iconColor: '#c026d3',
    iconBgColor: '#ffffff',
    iconBorderColor: '#c026d3',
    iconSize: 34,
    iconPosition: 'center',
    iconShow: true,
    showIcon: true,
    fontTitle: 'Montserrat',
    fontBanner: 'Montserrat',
    fontSizeTitle: 18,
    titlePosition: 'bottom',
    titleOffsetY: -22,
    bannerText: 'HAPPY HOUR',
    qrSilhouetteMode: 'none',
    qrDensity: 50,
    qrBoxRadius: 18,
    defaultTitle: 'Happy Hour',
    placeholder: 'Escribe el título (ej: Happy Hour)'
  },
  // 2. Salón -> "Spa & Relax" (Belleza, design-belleza-2)
  salon: {
    id: 'design-belleza-2',
    name: 'Spa & Relax',
    category: 'Belleza',
    bgColor: '#f0fdf4',
    qrColor: '#064e3b',
    qrColor2: '#059669',
    gradientType: 'linear',
    silhouetteColor: '#a21caf',
    patternColor: '#064e3b',
    frameColor: '#a21caf',
    frameShape: 'circle',
    frameStyle: 'badge',
    textColor: '#0f172a',
    badgeBg: '#a21caf',
    badgeText: '#ffffff',
    dotStyle: 'smooth',
    eyeStyle: 'leaf',
    eyeColor: '#a21caf',
    eyeColor2: '#059669',
    eyeGradientType: 'linear',
    iconName: 'fa-sparkles',
    iconColor: '#a21caf',
    iconBgColor: '#ffffff',
    iconBorderColor: '#a21caf',
    iconSize: 34,
    iconPosition: 'center',
    iconShow: true,
    showIcon: true,
    fontTitle: 'Great Vibes',
    fontBanner: 'Poppins',
    fontSizeTitle: 18,
    titlePosition: 'bottom',
    titleOffsetY: -22,
    bannerText: 'SPA & RELAX',
    qrSilhouetteMode: 'none',
    qrDensity: 50,
    qrBoxRadius: 18,
    defaultTitle: 'Spa & Relax',
    placeholder: 'Escribe el título (ej: Spa & Relax)'
  },
  // 3. Comercio -> "Oferta Hoy" (Compras, design-compras-7)
  comercio: {
    id: 'design-compras-7',
    name: 'Oferta Hoy',
    category: 'Compras',
    bgColor: '#fff7ed',
    qrColor: '#78350f',
    qrColor2: '#d97706',
    gradientType: 'single',
    silhouetteColor: '#f97316',
    patternColor: '#78350f',
    frameColor: '#f97316',
    frameShape: 'diamond_card',
    frameStyle: 'badge',
    textColor: '#0f172a',
    badgeBg: '#f97316',
    badgeText: '#ffffff',
    dotStyle: 'heart',
    eyeStyle: 'hexagon',
    eyeColor: '#f97316',
    eyeColor2: null,
    eyeGradientType: 'single',
    iconName: 'fa-credit-card',
    iconColor: '#f97316',
    iconBgColor: '#ffffff',
    iconBorderColor: '#f97316',
    iconSize: 34,
    iconPosition: 'center',
    iconShow: true,
    showIcon: true,
    fontTitle: 'Bebas Neue',
    fontBanner: 'Bebas Neue',
    fontSizeTitle: 18,
    titlePosition: 'bottom',
    titleOffsetY: -22,
    bannerText: 'OFERTA HOY',
    qrSilhouetteMode: 'none',
    qrDensity: 50,
    qrBoxRadius: 18,
    defaultTitle: 'Oferta Hoy',
    placeholder: 'Escribe el título (ej: Oferta Hoy)'
  },
  // 4. General -> "Arte & Diseño" (Música y Arte, design-musicayarte-10)
  generico: {
    id: 'design-musicayarte-10',
    name: 'Arte & Diseño',
    category: 'Música y Arte',
    bgColor: '#f8fafc',
    qrColor: '#111827',
    qrColor2: '#6366f1',
    gradientType: 'single',
    silhouetteColor: '#ef4444',
    patternColor: '#111827',
    frameColor: '#ef4444',
    frameShape: 'ticket',
    frameStyle: 'badge',
    textColor: '#0f172a',
    badgeBg: '#ef4444',
    badgeText: '#ffffff',
    dotStyle: 'smooth',
    eyeStyle: 'rounded',
    eyeColor: '#ef4444',
    eyeColor2: '#6366f1',
    eyeGradientType: 'linear',
    iconName: 'fa-icons',
    iconColor: '#ef4444',
    iconBgColor: '#ffffff',
    iconBorderColor: '#ef4444',
    iconSize: 34,
    iconPosition: 'center',
    iconShow: true,
    showIcon: true,
    fontTitle: 'Pacifico',
    fontBanner: 'Montserrat',
    fontSizeTitle: 18,
    titlePosition: 'bottom',
    titleOffsetY: -22,
    bannerText: 'ARTE & DISEÑO',
    qrSilhouetteMode: 'none',
    qrDensity: 50,
    qrBoxRadius: 18,
    defaultTitle: 'Arte & Diseño',
    placeholder: 'Escribe el título (ej: Arte & Diseño)'
  }
};
export class MiniEditor {
  constructor() {
    this.section = null;
    this.titleInput = null;
    this.input = null;
    this.btn = null;
    this.btnText = null;
    this.idleView = null;
    this.loadingView = null;
    this.qrImg = null;
    this.errorView = null;
    this.errorMsg = null;
    this.actions = null;
    this.btnCustomize = null;
    this.btnDownload = null;
    this.chips = [];
    
    this.currentPreset = 'restaurante';
    this.currentUrl = '';
    this.currentBlobUrl = null;
    this.isGenerating = false;
  }

  mount() {
    this.section = document.getElementById('mini-editor');
    if (!this.section) return;

    this.titleInput = document.getElementById('mini-qr-title');
    this.input = document.getElementById('mini-qr-input');
    this.btn = document.getElementById('mini-qr-btn');
    this.btnText = document.getElementById('mini-qr-btn-text');
    this.idleView = document.getElementById('mini-idle-view');
    this.loadingView = document.getElementById('mini-loading-view');
    this.qrImg = document.getElementById('mini-qr-img');
    this.errorView = document.getElementById('mini-error-view');
    this.errorMsg = document.getElementById('mini-error-msg');
    this.actions = document.getElementById('mini-actions');
    this.btnCustomize = document.getElementById('mini-btn-customize');
    this.btnDownload = document.getElementById('mini-btn-download');
    this.chips = Array.from(this.section.querySelectorAll('.mini-preset-chip'));

    if (!this.input || !this.btn) return;

    // 1. Manejo de escritura (Typing state)
    this.input.addEventListener('input', () => {
      const val = this.input.value.trim();
      if (val.length >= 1 && !this.isGenerating) {
        this.btn.disabled = false;
      } else {
        this.btn.disabled = true;
      }
    });

    // 2. Tecla Enter ejecuta generación desde URL o Título
    [this.input, this.titleInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (!this.btn.disabled && !this.isGenerating) {
              this.generate();
            }
          }
        });
      }
    });

    // 3. Clic en botón Generar
    this.btn.addEventListener('click', () => {
      if (!this.isGenerating) {
        this.generate();
      }
    });

    // 4. Selección de Presets / Sectores
    this.chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const preset = chip.dataset.preset || 'generico';
        this.setPreset(preset);
      });
    });

    // 5. Botón de Descarga PNG
    if (this.btnDownload) {
      this.btnDownload.addEventListener('click', () => {
        this.downloadPng();
      });
    }
  }

  setPreset(preset) {
    this.currentPreset = preset;

    // Actualizar estilos visuales de chips
    this.chips.forEach(c => {
      const isActive = c.dataset.preset === preset;
      if (isActive) {
        c.className = 'mini-preset-chip px-2.5 py-1 rounded-lg font-semibold text-[11px] transition cursor-pointer bg-indigo-600 text-white shadow-xs';
      } else {
        c.className = 'mini-preset-chip px-2.5 py-1 rounded-lg font-semibold text-[11px] transition cursor-pointer text-slate-300 hover:text-white hover:bg-slate-700/60';
      }
    });

    const template = MINI_EDITOR_TEMPLATES[preset] || MINI_EDITOR_TEMPLATES.generico;

    // Asignar plantilla y título sugerido según sector
    if (this.titleInput) {
      this.titleInput.value = template.defaultTitle;
      this.titleInput.placeholder = template.placeholder;
    }

    // Actualizar enlace de personalización si ya hay URL
    if (this.currentUrl) {
      const titleVal = this.titleInput ? this.titleInput.value.trim() : template.defaultTitle;
      this.updateCustomizeLink(this.currentUrl, this.currentPreset, titleVal);
    }
  }

  normalizeUrl(raw) {
    let text = raw.trim();
    if (!text) return '';
    // Si no contiene un protocolo o esquema (http://, https://, mailto:, tel:, WIFI:), añadir https://
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(text)) {
      text = 'https://' + text;
    }
    return text;
  }

  updateCustomizeLink(url, preset, title = '') {
    if (this.btnCustomize) {
      const template = MINI_EDITOR_TEMPLATES[preset] || MINI_EDITOR_TEMPLATES.generico;
      const finalTitle = title ? title.trim() : template.defaultTitle;
      const titleParam = `&title=${encodeURIComponent(finalTitle)}`;
      const designParam = `&designId=${encodeURIComponent(template.id)}`;
      this.btnCustomize.href = `/editor?url=${encodeURIComponent(url)}&preset=${encodeURIComponent(preset)}${designParam}${titleParam}`;
    }
  }

  async generate() {
    const rawVal = this.input ? this.input.value.trim() : '';
    if (!rawVal) return;

    if (rawVal.length > 500) {
      this.showError('El texto no debe superar los 500 caracteres para asegurar la escaneabilidad del código.');
      return;
    }

    const template = MINI_EDITOR_TEMPLATES[this.currentPreset] || MINI_EDITOR_TEMPLATES.generico;

    const titleVal = (this.titleInput && this.titleInput.value.trim()) 
      ? this.titleInput.value.trim() 
      : template.defaultTitle;

    const normalizedUrl = this.normalizeUrl(rawVal);
    this.currentUrl = normalizedUrl;
    this.isGenerating = true;

    // Cambiar a estado Loading
    this.showLoading();

    // Controlador de timeout (5 segundos)
    const abortController = new AbortController();
    const timeoutTimer = setTimeout(() => {
      if (this.isGenerating) {
        if (this.errorMsg) {
          this.errorMsg.textContent = 'Esto está tardando más de lo normal... Inténtalo de nuevo.';
        }
      }
      abortController.abort();
    }, 5000);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: normalizedUrl,
          title: titleVal,
          bannerText: template.bannerText,
          isExplicitGenerate: false, // Vista previa gratuita sin autenticación ni consumo de cuota
          designId: template.id,
          targetWidth: 500,
          // Propiedades persistentes desacopladas de la plantilla
          bgColor: template.bgColor,
          qrColor: template.qrColor,
          qrColor2: template.qrColor2,
          gradientType: template.gradientType,
          silhouetteColor: template.silhouetteColor,
          patternColor: template.patternColor,
          frameColor: template.frameColor,
          frameShape: template.frameShape,
          frameStyle: template.frameStyle,
          textColor: template.textColor,
          badgeBg: template.badgeBg,
          badgeText: template.badgeText,
          dotStyle: template.dotStyle,
          eyeStyle: template.eyeStyle,
          eyeColor: template.eyeColor,
          eyeColor2: template.eyeColor2,
          eyeGradientType: template.eyeGradientType,
          iconName: template.iconName,
          iconColor: template.iconColor,
          iconBgColor: template.iconBgColor,
          iconBorderColor: template.iconBorderColor,
          iconSize: template.iconSize,
          iconPosition: template.iconPosition,
          iconShow: template.iconShow,
          showIcon: template.showIcon,
          fontTitle: template.fontTitle,
          fontBanner: template.fontBanner,
          fontSizeTitle: template.fontSizeTitle,
          titlePosition: template.titlePosition,
          titleOffsetY: template.titleOffsetY,
          qrSilhouetteMode: template.qrSilhouetteMode,
          qrDensity: template.qrDensity,
          qrBoxRadius: template.qrBoxRadius
        }),
        signal: abortController.signal
      });

      clearTimeout(timeoutTimer);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const blob = await response.blob();
      if (this.currentBlobUrl) {
        URL.revokeObjectURL(this.currentBlobUrl);
      }
      this.currentBlobUrl = URL.createObjectURL(blob);

      // Mostrar estado de éxito
      this.showSuccess(this.currentBlobUrl);
      this.updateCustomizeLink(normalizedUrl, this.currentPreset, titleVal);

    } catch (err) {
      clearTimeout(timeoutTimer);
      console.warn('[MiniEditor] Error al generar código QR:', err);
      const isTimeout = err.name === 'AbortError';
      const msg = isTimeout 
        ? 'Esto está tardando más de lo normal. Por favor reintenta.' 
        : 'No pudimos generar el QR. Inténtalo de nuevo.';
      this.showError(msg);
    } finally {
      this.isGenerating = false;
    }
  }

  showLoading() {
    if (this.idleView) this.idleView.classList.add('hidden');
    if (this.qrImg) this.qrImg.classList.add('hidden');
    if (this.errorView) this.errorView.classList.add('hidden');
    if (this.actions) this.actions.classList.add('hidden');
    if (this.loadingView) {
      this.loadingView.classList.remove('hidden');
      this.loadingView.classList.add('flex');
    }

    if (this.btn) {
      this.btn.disabled = true;
      if (this.btnText) this.btnText.textContent = 'Generando...';
    }
  }

  showSuccess(blobUrl) {
    if (this.loadingView) {
      this.loadingView.classList.remove('flex');
      this.loadingView.classList.add('hidden');
    }
    if (this.idleView) this.idleView.classList.add('hidden');
    if (this.errorView) this.errorView.classList.add('hidden');

    if (this.qrImg) {
      this.qrImg.src = blobUrl;
      this.qrImg.classList.remove('hidden');
    }

    if (this.actions) {
      this.actions.classList.remove('hidden');
      this.actions.classList.add('flex');
    }

    if (this.btn) {
      this.btn.disabled = false;
      if (this.btnText) this.btnText.textContent = 'Regenerar QR';
    }
  }

  showError(message) {
    if (this.loadingView) {
      this.loadingView.classList.remove('flex');
      this.loadingView.classList.add('hidden');
    }
    if (this.idleView) this.idleView.classList.add('hidden');
    if (this.qrImg) this.qrImg.classList.add('hidden');
    if (this.actions) this.actions.classList.add('hidden');

    if (this.errorMsg) {
      this.errorMsg.textContent = message || 'No pudimos generar el QR. Inténtalo de nuevo.';
    }
    if (this.errorView) {
      this.errorView.classList.remove('hidden');
    }

    if (this.btn) {
      this.btn.disabled = false;
      if (this.btnText) this.btnText.textContent = 'Reintentar';
    }
  }

  downloadPng() {
    if (!this.currentBlobUrl) return;
    const a = document.createElement('a');
    a.href = this.currentBlobUrl;
    a.download = `qrbey-${this.currentPreset}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
