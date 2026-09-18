import { UIComponent } from './UIComponent.js';
import { appState } from '../state/AppState.js';

const POPULAR_ICONS = [
  'fa-qrcode', 'fa-globe', 'fa-store', 'fa-heart', 'fa-star', 
  'fa-wifi', 'fa-utensils', 'fa-car', 'fa-briefcase', 'fa-graduation-cap', 
  'fa-bolt', 'fa-cart-shopping', 'fa-gem', 'fa-envelope', 'fa-phone', 
  'fa-lock', 'fa-gift', 'fa-camera', 'fa-gamepad', 'fa-hospital',
  'fa-trophy', 'fa-sun', 'fa-moon', 'fa-plane', 'fa-fire',
  'fa-shield-halved', 'fa-music', 'fa-film', 'fa-user', 'fa-location-dot',
  'fa-building', 'fa-cloud', 'fa-ticket', 'fa-coffee', 'fa-bell',
  'fa-thumbs-up', 'fa-circle-info', 'fa-laptop', 'fa-key', 'fa-comments'
];

export class IconPicker extends UIComponent {
  constructor() {
    super('icon-picker-grid');
    this.btnModeIcon = document.getElementById('btn-mode-icon');
    this.btnModeImage = document.getElementById('btn-mode-image');
    this.sectionIconMode = document.getElementById('section-icon-mode');
    this.sectionImageMode = document.getElementById('section-image-mode');
    this.logoFileInput = document.getElementById('qr-logo-file');
    this.logoPreviewContainer = document.getElementById('logo-preview-container');
    this.logoUploadPrompt = document.getElementById('logo-upload-prompt');
    this.logoThumb = document.getElementById('qr-logo-thumb');
    this.logoFilename = document.getElementById('logo-filename');
    this.btnClearLogo = document.getElementById('btn-clear-logo');
    this.activeIconLabel = document.getElementById('active-icon-label');

    this.iconShowInput = document.getElementById('qr-icon-show');
    this.iconPosInput = document.getElementById('qr-icon-position');
    this.iconSizeInput = document.getElementById('qr-icon-size');
    this.iconSizeVal = document.getElementById('qr-icon-size-val');

    this.iconColorInput = document.getElementById('qr-icon-color');
    this.iconColorHex = document.getElementById('qr-icon-color-hex');
    this.iconBgColorInput = document.getElementById('qr-icon-bg-color');
    this.iconBgColorHex = document.getElementById('qr-icon-bg-hex');
    this.iconBorderColorInput = document.getElementById('qr-icon-border-color');
    this.iconBorderColorHex = document.getElementById('qr-icon-border-hex');

    appState.subscribe((state, eventKey) => {
      if (['CHANGE_ICON', 'CHANGE_ICON_MODE', 'CHANGE_DESIGN', 'INIT_DATA'].includes(eventKey)) {
        this.render();
      }
    });
  }

  bindEvents() {
    if (this.btnModeIcon && this.btnModeImage) {
      this.btnModeIcon.addEventListener('click', () => {
        appState.setState({ iconMode: 'icon' }, 'CHANGE_ICON_MODE');
      });
      this.btnModeImage.addEventListener('click', () => {
        appState.setState({ iconMode: 'image' }, 'CHANGE_ICON_MODE');
      });
    }

    if (this.logoFileInput) {
      this.logoFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            appState.setState({ customLogoDataUrl: event.target.result }, 'CHANGE_ICON');
            if (this.logoThumb) this.logoThumb.src = event.target.result;
            if (this.logoFilename) this.logoFilename.textContent = file.name;
            if (this.logoUploadPrompt) this.logoUploadPrompt.classList.add('hidden');
            if (this.logoPreviewContainer) this.logoPreviewContainer.classList.remove('hidden');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (this.btnClearLogo) {
      this.btnClearLogo.addEventListener('click', (e) => {
        e.stopPropagation();
        appState.setState({ customLogoDataUrl: null }, 'CHANGE_ICON');
        if (this.logoFileInput) this.logoFileInput.value = '';
        if (this.logoUploadPrompt) this.logoUploadPrompt.classList.remove('hidden');
        if (this.logoPreviewContainer) this.logoPreviewContainer.classList.add('hidden');
      });
    }

    if (this.iconShowInput) {
      this.iconShowInput.addEventListener('change', () => {
        appState.setState({ iconShow: this.iconShowInput.checked }, 'CHANGE_ICON');
      });
    }

    if (this.iconPosInput) {
      this.iconPosInput.addEventListener('change', () => {
        appState.setState({ iconPosition: this.iconPosInput.value }, 'CHANGE_ICON');
      });
    }

    if (this.iconSizeInput) {
      this.iconSizeInput.addEventListener('input', () => {
        const val = parseInt(this.iconSizeInput.value, 10);
        if (this.iconSizeVal) this.iconSizeVal.textContent = `${val}px`;
        appState.setState({ iconSize: val }, 'CHANGE_ICON');
      });
    }

    if (this.iconColorInput) {
      this.iconColorInput.addEventListener('input', () => {
        if (this.iconColorHex) this.iconColorHex.textContent = this.iconColorInput.value;
        appState.setState({ iconColor: this.iconColorInput.value }, 'CHANGE_ICON');
      });
    }

    if (this.iconBgColorInput) {
      this.iconBgColorInput.addEventListener('input', () => {
        if (this.iconBgColorHex) this.iconBgColorHex.textContent = this.iconBgColorInput.value;
        appState.setState({ iconBgColor: this.iconBgColorInput.value }, 'CHANGE_ICON');
      });
    }

    if (this.iconBorderColorInput) {
      this.iconBorderColorInput.addEventListener('input', () => {
        if (this.iconBorderColorHex) this.iconBorderColorHex.textContent = this.iconBorderColorInput.value;
        appState.setState({ iconBorderColor: this.iconBorderColorInput.value }, 'CHANGE_ICON');
      });
    }
  }

  render() {
    const { iconMode, selectedIcon, iconColor, iconBgColor, iconBorderColor } = appState.getState();

    if (this.iconColorInput && iconColor) {
      this.iconColorInput.value = iconColor;
      if (this.iconColorHex) this.iconColorHex.textContent = iconColor;
    }
    if (this.iconBgColorInput && iconBgColor) {
      this.iconBgColorInput.value = iconBgColor;
      if (this.iconBgColorHex) this.iconBgColorHex.textContent = iconBgColor;
    }
    if (this.iconBorderColorInput && iconBorderColor) {
      this.iconBorderColorInput.value = iconBorderColor;
      if (this.iconBorderColorHex) this.iconBorderColorHex.textContent = iconBorderColor;
    }
    if (this.activeIconLabel) {
      this.activeIconLabel.textContent = `Seleccionado: ${(selectedIcon || 'fa-qrcode').replace(/^fa-/, '').toUpperCase()}`;
    }

    // Mode Switch styling
    if (this.btnModeIcon && this.btnModeImage) {
      if (iconMode === 'icon') {
        this.btnModeIcon.className = 'flex-1 text-xs py-2 px-3 rounded-lg font-semibold transition bg-cyan-600 text-white shadow';
        this.btnModeImage.className = 'flex-1 text-xs py-2 px-3 rounded-lg font-semibold transition text-slate-400 hover:text-white';
        if (this.sectionIconMode) this.sectionIconMode.classList.remove('hidden');
        if (this.sectionImageMode) this.sectionImageMode.classList.add('hidden');
      } else {
        this.btnModeImage.className = 'flex-1 text-xs py-2 px-3 rounded-lg font-semibold transition bg-cyan-600 text-white shadow';
        this.btnModeIcon.className = 'flex-1 text-xs py-2 px-3 rounded-lg font-semibold transition text-slate-400 hover:text-white';
        if (this.sectionImageMode) this.sectionImageMode.classList.remove('hidden');
        if (this.sectionIconMode) this.sectionIconMode.classList.add('hidden');
      }
    }

    // Grid rendering
    if (this.container) {
      this.container.innerHTML = '';
      POPULAR_ICONS.forEach(iconClass => {
        const isSelected = (selectedIcon === iconClass);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `icon-btn w-9 h-9 rounded-lg flex items-center justify-center text-sm transition shadow-sm ${
          isSelected 
            ? 'active bg-cyan-600 border-2 border-cyan-400 ring-2 ring-cyan-400/50 text-white font-bold scale-105' 
            : 'bg-slate-950/80 border border-slate-700/70 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50'
        }`;
        btn.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
        btn.title = iconClass.replace(/^fa-/, '');

        btn.addEventListener('click', () => {
          appState.setState({ selectedIcon: iconClass }, 'CHANGE_ICON');
          if (this.activeIconLabel) {
            this.activeIconLabel.textContent = `Seleccionado: ${iconClass.replace(/^fa-/, '').toUpperCase()}`;
          }
        });
        this.container.appendChild(btn);
      });
    }
  }
}
