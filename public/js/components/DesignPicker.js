import { UIComponent } from './UIComponent.js';
import { appState } from '../state/AppState.js';
import { renderIconToDataUrl, getIconClass } from '../utils/iconRender.js';

const CATEGORY_ICONS = {
  'Institucional': 'fa-solid fa-building',
  'Compras': 'fa-solid fa-cart-shopping',
  'Entretenimiento': 'fa-solid fa-gamepad',
  'Belleza': 'fa-solid fa-gem',
  'Deportes': 'fa-solid fa-trophy',
  'Comunidad': 'fa-solid fa-users',
  'Gastronomía': 'fa-solid fa-utensils',
  'Tecnología': 'fa-solid fa-microchip',
  'Salud': 'fa-solid fa-heart-pulse',
  'Viajes': 'fa-solid fa-plane',
  'Inmobiliaria': 'fa-solid fa-house',
  'Educación': 'fa-solid fa-graduation-cap',
  'Eventos': 'fa-solid fa-calendar-check',
  'Redes Sociales': 'fa-brands fa-whatsapp',
  'Lujo': 'fa-solid fa-crown',
  'Música y Arte': 'fa-solid fa-music',
  'Mascotas': 'fa-solid fa-paw',
  'Automotriz': 'fa-solid fa-car',
  'Finanzas': 'fa-solid fa-coins',
  'Naturaleza': 'fa-solid fa-tree'
};

export class DesignPicker extends UIComponent {
  constructor() {
    super('category-tabs');
    this.designGrid = document.getElementById('design-grid');
    this.patternGrid = document.getElementById('pattern-grid');
    this.countBadge = document.getElementById('design-count-badge');
    this.densitySlider = document.getElementById('custom-qr-density');
    this.densityVal = document.getElementById('custom-qr-density-val');

    this.initialDesignApplied = false;

    appState.subscribe((state, eventKey) => {
      if (['INIT_DATA', 'CHANGE_CATEGORY', 'CHANGE_DESIGN', 'CHANGE_PATTERN'].includes(eventKey)) {
        this.render();
      }
      if (eventKey === 'INIT_DATA' && state.designs && state.designs.length && !this.initialDesignApplied) {
        this.initialDesignApplied = true;
        this.applyDesign(state.designs[0]);
      }
    });
  }

  bindEvents() {
    if (this.densitySlider) {
      this.densitySlider.addEventListener('input', () => {
        const val = parseInt(this.densitySlider.value, 10);
        if (this.densityVal) this.densityVal.textContent = `${val}%`;
        appState.setState({ qrDensity: val }, 'CHANGE_PATTERN');
      });
    }
  }

  render() {
    const state = appState.getState();
    const { categories, designs, patterns, activeCategory, currentDesign, currentPattern, qrDensity } = state;
    if (!categories.length) return;

    if (this.densitySlider) {
      const dVal = qrDensity !== undefined ? qrDensity : 50;
      this.densitySlider.value = dVal;
      if (this.densityVal) this.densityVal.textContent = `${dVal}%`;
    }

    // 1. Render Category Tabs (Wrapped rows, slightly reduced text size text-[11px])
    if (this.container) {
      this.container.innerHTML = '';
      const allBtn = document.createElement('button');
      allBtn.type = 'button';
      allBtn.className = `px-2.5 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1 ${
        activeCategory === 'all'
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm font-bold'
          : 'bg-slate-950/80 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500'
      }`;
      allBtn.innerHTML = `<i class="fa-solid fa-star text-amber-400 text-[10px]"></i> Todos (${designs.length})`;
      allBtn.addEventListener('click', () => appState.setState({ activeCategory: 'all' }, 'CHANGE_CATEGORY'));
      this.container.appendChild(allBtn);

      categories.forEach(cat => {
        const iconClass = CATEGORY_ICONS[cat] || 'fa-solid fa-folder';
        const catBtn = document.createElement('button');
        catBtn.type = 'button';
        catBtn.className = `px-2.5 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1 ${
          activeCategory === cat
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm font-bold'
            : 'bg-slate-950/80 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500'
        }`;
        catBtn.innerHTML = `<i class="${iconClass} text-cyan-400 text-[10px]"></i> ${cat}`;
        catBtn.addEventListener('click', () => appState.setState({ activeCategory: cat }, 'CHANGE_CATEGORY'));
        this.container.appendChild(catBtn);
      });
    }

    // 2. Filter & Render Designs Grid
    const filteredDesigns = activeCategory === 'all'
      ? designs
      : designs.filter(d => d.category === activeCategory);

    if (this.countBadge) {
      this.countBadge.textContent = `${filteredDesigns.length} Diseños`;
    }

    if (this.designGrid) {
      this.designGrid.innerHTML = '';
      filteredDesigns.forEach(design => {
        const isSelected = currentDesign && currentDesign.id === design.id;
        const card = document.createElement('div');
        card.className = `design-card group relative p-3 rounded-2xl border transition-all cursor-pointer ${
          isSelected
            ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/50 shadow-lg scale-[1.02]'
            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
        }`;

        const iconClass = getIconClass(design.iconName);

        card.innerHTML = `
          <div class="h-24 rounded-xl flex flex-col items-center justify-center p-2 mb-2 relative overflow-hidden border border-white/10" style="background-color: ${design.bgColor}">
            <div class="text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 text-center truncate max-w-[90%]" style="background-color: ${design.badgeBg}; color: ${design.badgeText}">
              ${design.bannerText || 'SCAN ME'}
            </div>
            <div class="w-10 h-10 rounded flex items-center justify-center border" style="border-color: ${design.qrColor}; color: ${design.qrColor}">
              <i class="${iconClass} text-lg"></i>
            </div>
          </div>
          <span class="text-xs font-bold text-slate-200 block truncate group-hover:text-indigo-400 transition text-center">${design.name}</span>
          <span class="text-[10px] text-slate-400 block text-center truncate">${design.category}</span>
        `;

        card.addEventListener('click', async () => {
          await this.applyDesign(design);
        });
        this.designGrid.appendChild(card);
      });
    }

    // 3. Render Patterns Grid
    if (this.patternGrid && patterns.length) {
      this.patternGrid.innerHTML = '';
      patterns.forEach(pat => {
        const isSelected = currentPattern === pat.id;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
          isSelected
            ? 'border-pink-500 bg-pink-950/40 ring-2 ring-pink-500/50 text-white font-bold'
            : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:text-white'
        }`;
        btn.innerHTML = `
          <i class="fa-solid ${pat.icon} text-lg text-pink-400"></i>
          <span class="text-[11px] font-medium leading-tight">${pat.name}</span>
        `;

        btn.addEventListener('click', () => {
          appState.setState({ currentPattern: pat.id }, 'CHANGE_PATTERN');
        });
        this.patternGrid.appendChild(btn);
      });
    }
  }

  async applyDesign(design) {
    if (!design) return;

    // 1. Text Inputs & Fonts DOM syncing (Step 2)
    const titleInput = document.getElementById('qr-title');
    const bannerTextInput = document.getElementById('qr-banner-text');
    const titleFontInput = document.getElementById('qr-title-font');
    const bannerFontInput = document.getElementById('qr-banner-font');
    const titleSizeInput = document.getElementById('qr-title-size');
    const titleSizeVal = document.getElementById('qr-title-size-val');
    const titlePosInput = document.getElementById('qr-title-position');
    const titleOffsetInput = document.getElementById('qr-title-offset');
    const titleOffsetVal = document.getElementById('qr-title-offset-val');

    if (titleInput && design.name) titleInput.value = design.name;
    if (bannerTextInput && design.bannerText) bannerTextInput.value = design.bannerText;
    if (titleFontInput && design.fontTitle) {
      titleFontInput.value = design.fontTitle;
      titleFontInput.style.fontFamily = `'${design.fontTitle}', sans-serif`;
      if (titleInput) titleInput.style.fontFamily = `'${design.fontTitle}', sans-serif`;
    }
    if (bannerFontInput && design.fontBanner) {
      bannerFontInput.value = design.fontBanner;
      bannerFontInput.style.fontFamily = `'${design.fontBanner}', sans-serif`;
      if (bannerTextInput) bannerTextInput.style.fontFamily = `'${design.fontBanner}', sans-serif`;
    }
    const fontSizeTitle = design.fontSizeTitle || 24;
    if (titleSizeInput) titleSizeInput.value = fontSizeTitle;
    if (titleSizeVal) titleSizeVal.textContent = `${fontSizeTitle}px`;

    const titlePosition = design.titlePosition || 'bottom';
    if (titlePosInput) titlePosInput.value = titlePosition;
    const titleOffsetY = design.titleOffsetY !== undefined ? design.titleOffsetY : 0;
    if (titleOffsetInput) titleOffsetInput.value = titleOffsetY;
    if (titleOffsetVal) titleOffsetVal.textContent = `${titleOffsetY > 0 ? '+' : ''}${titleOffsetY}px`;

    // 2. Icon Controls (Step 3)
    const iconColorInput = document.getElementById('qr-icon-color');
    const iconColorHex = document.getElementById('qr-icon-color-hex');
    const iconBgColorInput = document.getElementById('qr-icon-bg-color') || document.getElementById('qr-icon-bgcolor');
    const iconBgColorHex = document.getElementById('qr-icon-bg-hex') || document.getElementById('qr-icon-bgcolor-hex');
    const iconBorderColorInput = document.getElementById('qr-icon-border-color') || document.getElementById('qr-icon-bordercolor');
    const iconBorderColorHex = document.getElementById('qr-icon-border-hex') || document.getElementById('qr-icon-bordercolor-hex');
    const iconSizeInput = document.getElementById('qr-icon-size');
    const iconSizeVal = document.getElementById('qr-icon-size-val');
    const iconPosInput = document.getElementById('qr-icon-position');
    const iconShowInput = document.getElementById('qr-icon-show');
    const iconControlsWrapper = document.getElementById('icon-controls-wrapper');
    const activeIconLabel = document.getElementById('active-icon-label');

    const iconColor = design.iconColor || design.qrColor || '#2563eb';
    const iconBgColor = design.iconBgColor || '#ffffff';
    const iconBorderColor = design.iconBorderColor || design.frameColor || '#2563eb';
    const iconSize = design.iconSize || 34;
    const iconPosition = design.iconPosition || 'center';
    const iconShow = design.iconShow !== undefined ? design.iconShow : (design.showIcon !== false);

    if (iconColorInput) iconColorInput.value = iconColor;
    if (iconColorHex) iconColorHex.textContent = iconColor;
    if (iconBgColorInput) iconBgColorInput.value = iconBgColor;
    if (iconBgColorHex) iconBgColorHex.textContent = iconBgColor;
    if (iconBorderColorInput) iconBorderColorInput.value = iconBorderColor;
    if (iconBorderColorHex) iconBorderColorHex.textContent = iconBorderColor;
    if (iconSizeInput) iconSizeInput.value = iconSize;
    if (iconSizeVal) iconSizeVal.textContent = `${iconSize}px`;
    if (iconPosInput) iconPosInput.value = iconPosition;
    if (iconShowInput) iconShowInput.checked = iconShow;
    if (iconControlsWrapper) {
      if (iconShow) iconControlsWrapper.classList.remove('hidden');
      else iconControlsWrapper.classList.add('hidden');
    }

    if (activeIconLabel && design.iconName) {
      const cleanName = design.iconName.replace(/^fa-brands\s+|^fa-solid\s+|^fa-|^bi\s+|^bi-|^ti\s+ti-|^ti\s+|^ti-/, '').replace(/-/g, ' ').toUpperCase();
      activeIconLabel.textContent = `Seleccionado: ${cleanName}`;
    }

    // Rasterize Vector Icon
    let dataUrl = null;
    if (design.iconName) {
      const cardIconCls = getIconClass(design.iconName);
      dataUrl = await renderIconToDataUrl(cardIconCls, iconColor);
    }

    // 3. Option 4 & Option 5 DOM Syncing
    const customQrColor = document.getElementById('custom-qr-color');
    const customQrHex = document.getElementById('custom-qr-color-hex');
    const customGradientType = document.getElementById('custom-gradient-type');
    const customQrColor2 = document.getElementById('custom-qr-color2');
    const customQrColor2Hex = document.getElementById('custom-qr-color2-hex');
    const containerQrColor2 = document.getElementById('container-qr-color2');

    const customEyeColor = document.getElementById('custom-eye-color');
    const customEyeHex = document.getElementById('custom-eye-color-hex');
    const customEyeStyle = document.getElementById('custom-eye-style');
    const customEyeGradientType = document.getElementById('custom-eye-gradient-type');
    const customEyeColor2 = document.getElementById('custom-eye-color2');
    const customEyeColor2Hex = document.getElementById('custom-eye-color2-hex');
    const containerEyeColor2 = document.getElementById('container-eye-color2');

    const customBgColor = document.getElementById('custom-bg-color');
    const customBgHex = document.getElementById('custom-bg-color-hex');
    const customFrameColor = document.getElementById('custom-frame-color');
    const customFrameHex = document.getElementById('custom-frame-color-hex');
    const customFrameShape = document.getElementById('custom-frame-shape');
    const customQrBoxRadius = document.getElementById('custom-qr-box-radius');
    const customQrBoxRadiusVal = document.getElementById('custom-qr-box-radius-val');

    const customQrSilhouette = document.getElementById('custom-qr-silhouette');
    const customQrSilhouetteDesc = document.getElementById('custom-qr-silhouette-desc');
    const containerSilhouetteColor = document.getElementById('container-silhouette-color');
    const customSilhouetteColor = document.getElementById('custom-silhouette-color');
    const customSilhouetteColorHex = document.getElementById('custom-silhouette-color-hex');

    const customQrDensity = document.getElementById('custom-qr-density');
    const customQrDensityVal = document.getElementById('custom-qr-density-val');

    const qrCol = design.qrColor || '#111827';
    const bgCol = design.bgColor || '#ffffff';
    const frameCol = design.frameColor || '#2563eb';
    const eyeCol = design.eyeColor || design.qrColor || '#111827';
    const eyeSty = design.eyeStyle || 'square';
    const frameShp = design.frameShape || 'rectangular';
    const silMode = design.qrSilhouetteMode || 'none';
    const silColor = design.silhouetteColor || qrCol;
    const boxRad = design.qrBoxRadius !== undefined ? design.qrBoxRadius : 18;
    const density = design.qrDensity !== undefined ? design.qrDensity : 50;
    const gradType = design.gradientType || 'single';
    const qrCol2 = design.qrColor2 || '#a855f7';
    const eyeGradType = design.eyeGradientType || 'single';
    const eyeCol2 = design.eyeColor2 || '#38bdf8';

    if (customQrColor) { customQrColor.value = qrCol; if (customQrHex) customQrHex.textContent = qrCol; }
    if (customBgColor) { customBgColor.value = bgCol; if (customBgHex) customBgHex.textContent = bgCol; }
    if (customFrameColor) { customFrameColor.value = frameCol; if (customFrameHex) customFrameHex.textContent = frameCol; }
    if (customEyeColor) { customEyeColor.value = eyeCol; if (customEyeHex) customEyeHex.textContent = eyeCol; }
    if (customEyeStyle) customEyeStyle.value = eyeSty;
    if (customFrameShape) customFrameShape.value = frameShp;
    if (customQrSilhouette) customQrSilhouette.value = silMode;
    if (customQrBoxRadius) { customQrBoxRadius.value = boxRad; if (customQrBoxRadiusVal) customQrBoxRadiusVal.textContent = `${boxRad}px`; }
    if (customQrDensity) { customQrDensity.value = density; if (customQrDensityVal) customQrDensityVal.textContent = `${density}%`; }
    if (this.densitySlider) { this.densitySlider.value = density; if (this.densityVal) this.densityVal.textContent = `${density}%`; }

    if (customGradientType) {
      customGradientType.value = gradType;
      if (containerQrColor2) containerQrColor2.classList.toggle('hidden', gradType === 'single');
    }
    if (customQrColor2 && qrCol2) { customQrColor2.value = qrCol2; if (customQrColor2Hex) customQrColor2Hex.textContent = qrCol2; }

    if (customEyeGradientType) {
      customEyeGradientType.value = eyeGradType;
      if (containerEyeColor2) containerEyeColor2.classList.toggle('hidden', eyeGradType === 'single');
    }
    if (customEyeColor2 && eyeCol2) { customEyeColor2.value = eyeCol2; if (customEyeColor2Hex) customEyeColor2Hex.textContent = eyeCol2; }

    const isSil = ['icon_only', 'icon_center', 'icon_pure'].includes(silMode);
    if (containerSilhouetteColor) containerSilhouetteColor.classList.toggle('hidden', !isSil);
    if (customSilhouetteColor) {
      customSilhouetteColor.value = silColor;
      if (customSilhouetteColorHex) customSilhouetteColorHex.textContent = silColor;
    }

    const SIL_MAP = {
      none: 'Matriz cuadrada tradicional de código QR dentro del marco del póster.',
      icon_only: 'El código QR adopta la forma del ícono o imagen seleccionada, ocultando la insignia central.',
      icon_center: 'Forma temática del ícono o imagen seleccionada incluyendo además la insignia central.',
      icon_pure: 'Silueta pura flotante de la figura o imagen seleccionada sin fondo blanco ni tarjeta posterior.'
    };
    if (customQrSilhouetteDesc) customQrSilhouetteDesc.textContent = SIL_MAP[silMode] || '';

    // 4. Update Central Reactive State
    appState.setState({
      currentDesign: { ...design },
      title: design.name || 'Mi Código QR',
      bannerText: design.bannerText || 'SCAN ME',
      fontTitle: design.fontTitle || 'Plus Jakarta Sans',
      fontBanner: design.fontBanner || 'Plus Jakarta Sans',
      fontSizeTitle: fontSizeTitle,
      titlePosition: titlePosition,
      titleOffsetY: titleOffsetY,

      selectedIcon: design.iconName || 'fa-qrcode',
      iconMode: 'icon',
      iconShow: iconShow,
      iconPosition: iconPosition,
      iconColor: iconColor,
      iconBgColor: iconBgColor,
      iconBorderColor: iconBorderColor,
      iconSize: iconSize,
      generatedIconDataUrl: dataUrl,

      currentPattern: design.dotStyle || 'square',
      qrDensity: density,

      qrSilhouetteMode: silMode,
      silhouetteColor: silColor,
      patternColor: silColor,

      customEyeColor: eyeCol,
      eyeStyle: eyeSty,
      eyeGradientType: eyeGradType,
      eyeColor2: eyeCol2,

      gradientType: gradType,
      qrColor2: qrCol2,

      frameShape: frameShp,
      qrBoxRadius: boxRad
    }, 'CHANGE_DESIGN');
  }
}

