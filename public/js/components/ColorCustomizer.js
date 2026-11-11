import { UIComponent } from './UIComponent.js';
import { appState } from '../state/AppState.js';

const SILHOUETTE_DESCRIPTIONS = {
  none: '1. Ícono/Imagen: Matriz tradicional con ícono o logotipo integrado dentro del marco del póster.',
  icon_only: '2. Silueta de Ícono/Imagen: El código QR adopta la silueta de la figura/imagen con colores de silueta y patrón personalizables.',
  icon_center: '3. Silueta + Ícono/Imagen: Silueta temática de fondo con ícono central emblemático y colores de silueta y patrón personalizables.'
};

export class ColorCustomizer extends UIComponent {
  constructor() {
    super('customizer-panel');

    // Toggles de Silueta e Ícono
    this.qrSilhouetteShow = document.getElementById('qr-silhouette-show');
    this.qrIconShow = document.getElementById('qr-icon-show');
    this.customQrSilhouette = document.getElementById('custom-qr-silhouette');
    this.customQrSilhouetteDesc = document.getElementById('custom-qr-silhouette-desc');
    this.containerSilhouetteGroup = document.getElementById('container-silhouette-group') || document.getElementById('container-silhouette-color');
    this.containerSilhouetteColor = this.containerSilhouetteGroup;

    // Matriz y Degradados
    this.customQrColor = document.getElementById('custom-qr-color');
    this.customGradientType = document.getElementById('custom-gradient-type');
    this.customQrColor2 = document.getElementById('custom-qr-color2');
    this.containerQrColor2 = document.getElementById('container-qr-color2');
    this.customQrHex = document.getElementById('custom-qr-color-hex');
    this.customQrColor2Hex = document.getElementById('custom-qr-color2-hex');

    // Silueta y Patrón
    this.customSilhouetteColor = document.getElementById('custom-silhouette-color');
    this.customSilhouetteColorHex = document.getElementById('custom-silhouette-color-hex');
    this.customPatternColor = document.getElementById('custom-pattern-color');
    this.customPatternColorHex = document.getElementById('custom-pattern-color-hex');

    // Ojos de Detección (Finders)
    this.customEyeStyle = document.getElementById('custom-eye-style');
    this.customEyeColor = document.getElementById('custom-eye-color');
    this.customEyeColorHex = document.getElementById('custom-eye-color-hex');
    this.customEyeGradientType = document.getElementById('custom-eye-gradient-type');
    this.customEyeColor2 = document.getElementById('custom-eye-color2');
    this.customEyeColor2Hex = document.getElementById('custom-eye-color2-hex');
    this.containerEyeColor2 = document.getElementById('container-eye-color2');

    // Marco, Fondo y Forma
    this.customFrameShape = document.getElementById('custom-frame-shape');
    this.customBgColor = document.getElementById('custom-bg-color');
    this.customBgHex = document.getElementById('custom-bg-color-hex');
    this.customFrameColor = document.getElementById('custom-frame-color');
    this.customFrameHex = document.getElementById('custom-frame-color-hex');
    this.customQrBoxRadius = document.getElementById('custom-qr-box-radius');
    this.customQrBoxRadiusVal = document.getElementById('custom-qr-box-radius-val');

    appState.subscribe((state, eventKey) => {
      if (['CHANGE_DESIGN', 'INIT_DATA'].includes(eventKey)) {
        this.render();
      }
    });
  }

  bindEvents() {
    // Toggle Silueta Temática (#qr-silhouette-show)
    if (this.qrSilhouetteShow) {
      this.qrSilhouetteShow.addEventListener('change', () => {
        const isSilActive = this.qrSilhouetteShow.checked;
        const silContainer = this.containerSilhouetteGroup || this.containerSilhouetteColor;
        if (silContainer) {
          silContainer.classList.toggle('hidden', !isSilActive);
        }

        const iconShowEl = document.getElementById('qr-icon-show');
        const isIconActive = iconShowEl ? iconShowEl.checked : (appState.getState().iconShow !== false);

        let mode = 'none';
        if (isSilActive && isIconActive) mode = 'icon_center';
        else if (isSilActive && !isIconActive) mode = 'icon_only';
        else mode = 'none';

        if (this.customQrSilhouette) this.customQrSilhouette.value = mode;
        if (this.customQrSilhouetteDesc) {
          this.customQrSilhouetteDesc.textContent = SILHOUETTE_DESCRIPTIONS[mode] || '';
        }

        appState.setState({
          silhouetteShow: isSilActive,
          qrSilhouetteMode: mode
        }, 'CHANGE_INPUTS');
      });
    }

    // Toggle Ícono/Imagen (#qr-icon-show) para sincronizar modo si silueta está activa
    if (this.qrIconShow) {
      this.qrIconShow.addEventListener('change', () => {
        const isIconActive = this.qrIconShow.checked;
        const silShowEl = document.getElementById('qr-silhouette-show');
        const isSilActive = silShowEl ? silShowEl.checked : (appState.getState().silhouetteShow === true);

        let mode = 'none';
        if (isSilActive && isIconActive) mode = 'icon_center';
        else if (isSilActive && !isIconActive) mode = 'icon_only';
        else mode = 'none';

        if (this.customQrSilhouette) this.customQrSilhouette.value = mode;
        if (this.customQrSilhouetteDesc) {
          this.customQrSilhouetteDesc.textContent = SILHOUETTE_DESCRIPTIONS[mode] || '';
        }

        appState.setState({
          iconShow: isIconActive,
          qrSilhouetteMode: mode
        }, 'CHANGE_INPUTS');
      });
    }

    // Muestras Visuales de Ojos de Detección (.eye-style-card)
    const eyeCards = document.querySelectorAll('.eye-style-card');
    eyeCards.forEach(card => {
      card.addEventListener('click', () => {
        const eyeVal = card.dataset.eye;
        eyeCards.forEach(c => {
          c.classList.remove('active', 'border-cyan-500', 'bg-white', 'ring-2', 'ring-cyan-400');
          c.classList.add('border-slate-200', 'bg-slate-50');
        });
        card.classList.add('active', 'border-cyan-500', 'bg-white', 'ring-2', 'ring-cyan-400');
        card.classList.remove('border-slate-200', 'bg-slate-50');

        if (this.customEyeStyle) {
          this.customEyeStyle.value = eyeVal;
          this.customEyeStyle.dispatchEvent(new Event('change'));
        }
      });
    });

    // Muestras Visuales de Formas de Marco (.frame-shape-card)
    const frameCards = document.querySelectorAll('.frame-shape-card');
    frameCards.forEach(card => {
      card.addEventListener('click', () => {
        const shapeVal = card.dataset.shape;
        frameCards.forEach(c => {
          c.classList.remove('active', 'border-amber-500', 'bg-white', 'ring-2', 'ring-amber-400');
          c.classList.add('border-slate-200', 'bg-slate-50');
        });
        card.classList.add('active', 'border-amber-500', 'bg-white', 'ring-2', 'ring-amber-400');
        card.classList.remove('border-slate-200', 'bg-slate-50');

        if (this.customFrameShape) {
          this.customFrameShape.value = shapeVal;
          this.customFrameShape.dispatchEvent(new Event('change'));
        }
      });
    });

    // Degradado de Matriz QR
    if (this.customGradientType) {
      this.customGradientType.addEventListener('change', () => {
        const type = this.customGradientType.value;
        if (this.containerQrColor2) {
          this.containerQrColor2.classList.toggle('hidden', type === 'single');
        }
        appState.setState({
          gradientType: type
        }, 'CHANGE_INPUTS');
      });
    }

    // Degradado de Ojos (Finders)
    if (this.customEyeGradientType) {
      this.customEyeGradientType.addEventListener('change', () => {
        const type = this.customEyeGradientType.value;
        if (this.containerEyeColor2) {
          this.containerEyeColor2.classList.toggle('hidden', type === 'single');
        }
        appState.setState({
          eyeGradientType: type
        }, 'CHANGE_INPUTS');
      });
    }

    // Curvatura de Tarjeta Blanca QR
    if (this.customQrBoxRadius) {
      this.customQrBoxRadius.addEventListener('input', () => {
        const val = parseInt(this.customQrBoxRadius.value, 10);
        if (this.customQrBoxRadiusVal) this.customQrBoxRadiusVal.textContent = `${val}px`;
        appState.setState({
          qrBoxRadius: val
        }, 'CHANGE_INPUTS');
      });
    }

    // Color de Silueta Temática
    if (this.customSilhouetteColor) {
      const handleSilhouetteColor = () => {
        const val = this.customSilhouetteColor.value;
        if (this.customSilhouetteColorHex) this.customSilhouetteColorHex.textContent = val;
        appState.setState({ silhouetteColor: val }, 'CHANGE_INPUTS');
      };
      this.customSilhouetteColor.addEventListener('input', handleSilhouetteColor);
      this.customSilhouetteColor.addEventListener('change', handleSilhouetteColor);
    }

    // Color del Patrón de Silueta
    if (this.customPatternColor) {
      const handlePatternColor = () => {
        const val = this.customPatternColor.value;
        if (this.customPatternColorHex) this.customPatternColorHex.textContent = val;
        appState.setState({ patternColor: val }, 'CHANGE_INPUTS');
      };
      this.customPatternColor.addEventListener('input', handlePatternColor);
      this.customPatternColor.addEventListener('change', handlePatternColor);
    }

    // Color Pickers y Selects
    [this.customQrColor, this.customQrColor2, this.customEyeColor, this.customEyeColor2, this.customBgColor, this.customFrameColor, this.customEyeStyle, this.customFrameShape, this.customQrSilhouette].forEach(input => {
      if (!input) return;
      const handler = () => {
        if (input === this.customQrColor && this.customQrHex) this.customQrHex.textContent = this.customQrColor.value;
        if (input === this.customQrColor2 && this.customQrColor2Hex) this.customQrColor2Hex.textContent = this.customQrColor2.value;
        if (input === this.customEyeColor && this.customEyeColorHex) this.customEyeColorHex.textContent = this.customEyeColor.value;
        if (input === this.customEyeColor2 && this.customEyeColor2Hex) this.customEyeColor2Hex.textContent = this.customEyeColor2.value;
        if (input === this.customBgColor && this.customBgHex) this.customBgHex.textContent = this.customBgColor.value;
        if (input === this.customFrameColor && this.customFrameHex) this.customFrameHex.textContent = this.customFrameColor.value;
        if (this.customQrSilhouetteDesc && this.customQrSilhouette) {
          this.customQrSilhouetteDesc.textContent = SILHOUETTE_DESCRIPTIONS[this.customQrSilhouette.value] || '';
        }
        if (input === this.customQrSilhouette) {
          const silContainer = this.containerSilhouetteGroup || this.containerSilhouetteColor;
          if (silContainer) {
            const isSilhouette = (this.customQrSilhouette.value === 'icon_only' || this.customQrSilhouette.value === 'icon_center');
            silContainer.classList.toggle('hidden', !isSilhouette);
          }
        }

        const currentDesign = appState.getState().currentDesign || {};
        const updatedDesign = {
          ...currentDesign,
          qrColor: this.customQrColor ? this.customQrColor.value : (currentDesign.qrColor || '#111827'),
          bgColor: this.customBgColor ? this.customBgColor.value : (currentDesign.bgColor || '#ffffff'),
          frameColor: this.customFrameColor ? this.customFrameColor.value : (currentDesign.frameColor || '#2563eb'),
          eyeStyle: this.customEyeStyle ? this.customEyeStyle.value : (currentDesign.eyeStyle || 'square')
        };

        appState.setState({
          currentDesign: updatedDesign,
          customEyeColor: this.customEyeColor ? this.customEyeColor.value : null,
          customEyeStyle: this.customEyeStyle ? this.customEyeStyle.value : 'square',
          gradientType: this.customGradientType ? this.customGradientType.value : 'single',
          qrColor2: this.customQrColor2 ? this.customQrColor2.value : null,
          eyeGradientType: this.customEyeGradientType ? this.customEyeGradientType.value : 'single',
          eyeColor2: this.customEyeColor2 ? this.customEyeColor2.value : null,
          frameShape: this.customFrameShape ? this.customFrameShape.value : 'rectangular',
          qrSilhouetteMode: this.customQrSilhouette ? this.customQrSilhouette.value : 'none',
          qrBoxRadius: this.customQrBoxRadius ? parseInt(this.customQrBoxRadius.value, 10) : 18
        }, 'CHANGE_INPUTS');
      };

      input.addEventListener('input', handler);
      if (input.tagName === 'SELECT') {
        input.addEventListener('change', handler);
      }
    });
  }

  render() {
    const state = appState.getState();
    const currentDesign = state.currentDesign;
    if (!currentDesign) return;

    // Sincronización de Silueta e Ícono
    let mode = state.qrSilhouetteMode || 'none';
    if (mode === 'icon_pure') mode = 'icon_only';
    const isSilActive = (mode === 'icon_only' || mode === 'icon_center' || state.silhouetteShow === true);
    
    if (this.qrSilhouetteShow) {
      this.qrSilhouetteShow.checked = isSilActive;
    }

    const silContainer = this.containerSilhouetteGroup || this.containerSilhouetteColor;
    if (silContainer) {
      silContainer.classList.toggle('hidden', !isSilActive);
    }

    if (this.customQrSilhouette) {
      this.customQrSilhouette.value = mode;
      if (this.customQrSilhouetteDesc) {
        this.customQrSilhouetteDesc.textContent = SILHOUETTE_DESCRIPTIONS[mode] || '';
      }
    }

    // Sincronización Visual de Tarjetas de Ojos (Finders)
    const currentEye = state.customEyeStyle || currentDesign.eyeStyle || 'square';
    document.querySelectorAll('.eye-style-card').forEach(card => {
      const isMatch = card.dataset.eye === currentEye;
      card.classList.toggle('active', isMatch);
      card.classList.toggle('border-cyan-500', isMatch);
      card.classList.toggle('bg-white', isMatch);
      card.classList.toggle('ring-2', isMatch);
      card.classList.toggle('ring-cyan-400', isMatch);
      card.classList.toggle('border-slate-200', !isMatch);
      card.classList.toggle('bg-slate-50', !isMatch);
    });

    // Sincronización Visual de Tarjetas de Marco y Forma
    const currentShape = state.frameShape || currentDesign.frameShape || 'rectangular';
    document.querySelectorAll('.frame-shape-card').forEach(card => {
      const isMatch = card.dataset.shape === currentShape;
      card.classList.toggle('active', isMatch);
      card.classList.toggle('border-amber-500', isMatch);
      card.classList.toggle('bg-white', isMatch);
      card.classList.toggle('ring-2', isMatch);
      card.classList.toggle('ring-amber-400', isMatch);
      card.classList.toggle('border-slate-200', !isMatch);
      card.classList.toggle('bg-slate-50', !isMatch);
    });

    // Colores y Degradados
    if (this.customQrColor && currentDesign.qrColor) {
      this.customQrColor.value = currentDesign.qrColor;
      if (this.customQrHex) this.customQrHex.textContent = currentDesign.qrColor;
    }
    if (this.customEyeColor) {
      const eyeCol = state.customEyeColor || currentDesign.qrColor || '#111827';
      this.customEyeColor.value = eyeCol;
      if (this.customEyeColorHex) this.customEyeColorHex.textContent = eyeCol;
    }
    if (this.customBgColor && currentDesign.bgColor) {
      this.customBgColor.value = currentDesign.bgColor;
      if (this.customBgHex) this.customBgHex.textContent = currentDesign.bgColor;
    }
    if (this.customFrameColor && currentDesign.frameColor) {
      this.customFrameColor.value = currentDesign.frameColor;
      if (this.customFrameHex) this.customFrameHex.textContent = currentDesign.frameColor;
    }
    if (this.customEyeStyle) {
      this.customEyeStyle.value = currentEye;
    }
    if (this.customFrameShape) {
      this.customFrameShape.value = currentShape;
    }
    if (this.customGradientType) {
      this.customGradientType.value = state.gradientType || 'single';
      if (this.containerQrColor2) {
        this.containerQrColor2.classList.toggle('hidden', state.gradientType === 'single');
      }
    }
    if (this.customEyeGradientType) {
      this.customEyeGradientType.value = state.eyeGradientType || 'single';
      if (this.containerEyeColor2) {
        this.containerEyeColor2.classList.toggle('hidden', state.eyeGradientType === 'single');
      }
    }
    if (this.customQrColor2 && state.qrColor2) {
      this.customQrColor2.value = state.qrColor2;
      if (this.customQrColor2Hex) this.customQrColor2Hex.textContent = state.qrColor2;
    }
    if (this.customEyeColor2 && state.eyeColor2) {
      this.customEyeColor2.value = state.eyeColor2;
      if (this.customEyeColor2Hex) this.customEyeColor2Hex.textContent = state.eyeColor2;
    }
    if (this.customQrBoxRadius) {
      const r = state.qrBoxRadius !== undefined ? state.qrBoxRadius : 18;
      this.customQrBoxRadius.value = r;
      if (this.customQrBoxRadiusVal) this.customQrBoxRadiusVal.textContent = `${r}px`;
    }
    if (this.customSilhouetteColor) {
      const sColor = state.silhouetteColor || '#2563eb';
      this.customSilhouetteColor.value = sColor;
      if (this.customSilhouetteColorHex) this.customSilhouetteColorHex.textContent = sColor;
    }
    if (this.customPatternColor) {
      const pColor = state.patternColor || '#475569';
      this.customPatternColor.value = pColor;
      if (this.customPatternColorHex) this.customPatternColorHex.textContent = pColor;
    }
  }
}
