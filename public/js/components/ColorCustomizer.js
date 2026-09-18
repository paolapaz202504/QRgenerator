import { UIComponent } from './UIComponent.js';
import { appState } from '../state/AppState.js';

export class ColorCustomizer extends UIComponent {
  constructor() {
    super('customizer-panel');
    this.toggleBtn = document.getElementById('toggle-customizer');
    this.customizerIcon = document.getElementById('customizer-icon');
    
    this.customQrColor = document.getElementById('custom-qr-color');
    this.customBgColor = document.getElementById('custom-bg-color');
    this.customFrameColor = document.getElementById('custom-frame-color');
    this.customEyeStyle = document.getElementById('custom-eye-style');

    this.customQrHex = document.getElementById('custom-qr-color-hex');
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

    [this.customQrColor, this.customBgColor, this.customFrameColor, this.customEyeStyle].forEach(input => {
      if (!input) return;
      input.addEventListener('input', () => {
        if (input === this.customQrColor && this.customQrHex) this.customQrHex.textContent = this.customQrColor.value;
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

        appState.setState({ currentDesign: updatedDesign }, 'CHANGE_INPUTS');
      });
    });
  }

  render() {
    const currentDesign = appState.getState().currentDesign;
    if (!currentDesign) return;

    if (this.customQrColor && currentDesign.qrColor) {
      this.customQrColor.value = currentDesign.qrColor;
      if (this.customQrHex) this.customQrHex.textContent = currentDesign.qrColor;
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
  }
}
