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
  'Lujo': 'fa-solid fa-crown'
};

export class DesignPicker extends UIComponent {
  constructor() {
    super('category-tabs');
    this.designGrid = document.getElementById('design-grid');
    this.patternGrid = document.getElementById('pattern-grid');
    this.countBadge = document.getElementById('design-count-badge');

    appState.subscribe((state, eventKey) => {
      if (['INIT_DATA', 'CHANGE_CATEGORY', 'CHANGE_DESIGN', 'CHANGE_PATTERN'].includes(eventKey)) {
        this.render();
      }
    });
  }

  bindEvents() {}

  render() {
    const { categories, designs, patterns, activeCategory, currentDesign, currentPattern } = appState.getState();
    if (!categories.length) return;

    // 1. Render Category Tabs (Wrapped rows)
    if (this.container) {
      this.container.innerHTML = '';
      const allBtn = document.createElement('button');
      allBtn.type = 'button';
      allBtn.className = `px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
        activeCategory === 'all'
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md font-bold'
          : 'bg-slate-950/80 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500'
      }`;
      allBtn.innerHTML = `<i class="fa-solid fa-star text-amber-400"></i> Todos (${designs.length})`;
      allBtn.addEventListener('click', () => appState.setState({ activeCategory: 'all' }, 'CHANGE_CATEGORY'));
      this.container.appendChild(allBtn);

      categories.forEach(cat => {
        const iconClass = CATEGORY_ICONS[cat] || 'fa-solid fa-folder';
        const catBtn = document.createElement('button');
        catBtn.type = 'button';
        catBtn.className = `px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
          activeCategory === cat
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md font-bold'
            : 'bg-slate-950/80 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500'
        }`;
        catBtn.innerHTML = `<i class="${iconClass} text-cyan-400"></i> ${cat}`;
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
          // 1. Text Inputs & Fonts DOM syncing
          const titleInput = document.getElementById('qr-title');
          const bannerTextInput = document.getElementById('qr-banner-text');
          const titleFontInput = document.getElementById('qr-title-font');
          const bannerFontInput = document.getElementById('qr-banner-font');
          const titleSizeInput = document.getElementById('qr-title-size');
          const titleSizeVal = document.getElementById('qr-title-size-val');

          if (titleInput && design.name) {
            titleInput.value = design.name;
          }
          if (bannerTextInput && design.bannerText) {
            bannerTextInput.value = design.bannerText;
          }
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

          // 2. Icon Controls (Colors, Hex Badges, Size, Active Label)
          const iconColorInput = document.getElementById('qr-icon-color');
          const iconColorHex = document.getElementById('qr-icon-color-hex');
          const iconBgColorInput = document.getElementById('qr-icon-bg-color') || document.getElementById('qr-icon-bgcolor');
          const iconBgColorHex = document.getElementById('qr-icon-bg-hex') || document.getElementById('qr-icon-bgcolor-hex');
          const iconBorderColorInput = document.getElementById('qr-icon-border-color') || document.getElementById('qr-icon-bordercolor');
          const iconBorderColorHex = document.getElementById('qr-icon-border-hex') || document.getElementById('qr-icon-bordercolor-hex');
          const iconSizeInput = document.getElementById('qr-icon-size');
          const iconSizeVal = document.getElementById('qr-icon-size-val');
          const activeIconLabel = document.getElementById('active-icon-label');

          const iconColor = design.iconColor || design.qrColor || '#2563eb';
          const iconBgColor = design.iconBgColor || '#ffffff';
          const iconBorderColor = design.iconBorderColor || design.frameColor || '#2563eb';
          const iconSize = design.iconSize || 34;

          if (iconColorInput) iconColorInput.value = iconColor;
          if (iconColorHex) iconColorHex.textContent = iconColor;

          if (iconBgColorInput) iconBgColorInput.value = iconBgColor;
          if (iconBgColorHex) iconBgColorHex.textContent = iconBgColor;

          if (iconBorderColorInput) iconBorderColorInput.value = iconBorderColor;
          if (iconBorderColorHex) iconBorderColorHex.textContent = iconBorderColor;

          if (iconSizeInput) iconSizeInput.value = iconSize;
          if (iconSizeVal) iconSizeVal.textContent = `${iconSize}px`;

          if (activeIconLabel && design.iconName) {
            const cleanName = design.iconName.replace(/^fa-brands\s+|^fa-solid\s+|^fa-|^bi\s+|^bi-|^ti\s+ti-|^ti\s+|^ti-/, '').replace(/-/g, ' ').toUpperCase();
            activeIconLabel.textContent = `Seleccionado: ${cleanName}`;
          }

          // 3. Rasterize Vector Icon
          let dataUrl = null;
          if (design.iconName) {
            const cardIconCls = getIconClass(design.iconName);
            dataUrl = await renderIconToDataUrl(cardIconCls, iconColor);
          }

          // 4. Update Central Reactive State
          appState.setState({
            currentDesign: { ...design },
            title: design.name || 'Mi Código QR',
            currentPattern: design.dotStyle || 'square',
            selectedIcon: design.iconName || 'fa-qrcode',
            generatedIconDataUrl: dataUrl,
            iconColor: iconColor,
            iconBgColor: iconBgColor,
            iconBorderColor: iconBorderColor,
            iconSize: iconSize,
            bannerText: design.bannerText || 'SCAN ME',
            fontTitle: design.fontTitle || 'Plus Jakarta Sans',
            fontBanner: design.fontBanner || 'Plus Jakarta Sans',
            fontSizeTitle: fontSizeTitle,
            iconMode: 'icon'
          }, 'CHANGE_DESIGN');
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
}
