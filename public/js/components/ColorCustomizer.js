import { UIComponent } from './UIComponent.js';
import { appState } from '../state/AppState.js';

export class ColorCustomizer extends UIComponent {
  constructor() {
    super('customizer-panel');
    this.toggleBtn = document.getElementById('toggle-customizer');
    this.customizerIcon = document.getElementById('customizer-icon');
    
    this.customQrColor = document.getElementById('custom-qr-color');
    this.customGradientType = document.getElementById('custom-gradient-type');
    this.customQrColor2 = document.getElementById('custom-qr-color2');
    this.containerQrColor2 = document.getElementById('container-qr-color2');
    this.customEyeColor = document.getElementById('custom-eye-color');
    this.customBgColor = document.getElementById('custom-bg-color');
    this.customFrameColor = document.getElementById('custom-frame-color');
    this.customEyeStyle = document.getElementById('custom-eye-style');
    this.customFrameShape = document.getElementById('custom-frame-shape');

    this.customQrHex = document.getElementById('custom-qr-color-hex');
    this.customQrColor2Hex = document.getElementById('custom-qr-color2-hex');
    this.customEyeColorHex = document.getElementById('custom-eye-color-hex');
    this.customBgHex = document.getElementById('custom-bg-color-hex');
    this.customFrameHex = document.getElementById('custom-frame-color-hex');

    appState.subscribe((state, eventKey) => {
      if (['CHANGE_DESIGN', 'INIT_DATA'].includes(eventKey)) {
        this.render();
      }
    });
  }

  bindEvents() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => {
        if (this.container) {
          this.container.classList.toggle('hidden');
        }
        if (this.customizerIcon) {
          this.customizerIcon.classList.toggle('rotate-180');
        }
      });
    }

    if (this.customGradientType) {
      this.customGradientType.addEventListener('change', () => {
        const type = this.customGradientType.value;
        if (this.containerQrColor2) {
          if (type === 'single') {
            this.containerQrColor2.classList.add('hidden');
          } else {
            this.containerQrColor2.classList.remove('hidden');
          }
        }
        appState.setState({
          gradientType: type
        }, 'CHANGE_INPUTS');
      });
    }

    [this.customQrColor, this.customQrColor2, this.customEyeColor, this.customBgColor, this.customFrameColor, this.customEyeStyle, this.customFrameShape].forEach(input => {
      if (!input) return;
      const handler = () => {
        if (input === this.customQrColor && this.customQrHex) this.customQrHex.textContent = this.customQrColor.value;
        if (input === this.customQrColor2 && this.customQrColor2Hex) this.customQrColor2Hex.textContent = this.customQrColor2.value;
        if (input === this.customEyeColor && this.customEyeColorHex) this.customEyeColorHex.textContent = this.customEyeColor.value;
        if (input === this.customBgColor && this.customBgHex) this.customBgHex.textContent = this.customBgColor.value;
        if (input === this.customFrameColor && this.customFrameHex) this.customFrameHex.textContent = this.customFrameColor.value;

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
          gradientType: this.customGradientType ? this.customGradientType.value : 'single',
          qrColor2: this.customQrColor2 ? this.customQrColor2.value : null,
          frameShape: this.customFrameShape ? this.customFrameShape.value : 'rectangular'
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
    if (this.customEyeStyle && currentDesign.eyeStyle) {
      this.customEyeStyle.value = currentDesign.eyeStyle;
    }
    if (this.customFrameShape) {
      this.customFrameShape.value = state.frameShape || 'rectangular';
    }
    if (this.customGradientType) {
      this.customGradientType.value = state.gradientType || 'single';
      if (this.containerQrColor2) {
        if (state.gradientType && state.gradientType !== 'single') {
          this.containerQrColor2.classList.remove('hidden');
        } else {
          this.containerQrColor2.classList.add('hidden');
        }
      }
    }
    if (this.customQrColor2 && state.qrColor2) {
      this.customQrColor2.value = state.qrColor2;
      if (this.customQrColor2Hex) this.customQrColor2Hex.textContent = state.qrColor2;
    }
  }
}
