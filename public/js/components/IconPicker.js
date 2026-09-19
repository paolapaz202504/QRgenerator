import { UIComponent } from './UIComponent.js';
import { appState } from '../state/AppState.js';
import { renderIconToDataUrl, getIconClass } from '../utils/iconRender.js';
import { ModalService } from '../services/ModalService.js';

export const ICON_SOURCES = {
  brands: {
    name: 'Redes Sociales & Marcas',
    popular: [
      'fa-brands fa-whatsapp', 'fa-brands fa-instagram', 'fa-brands fa-tiktok', 'fa-brands fa-facebook', 
      'fa-brands fa-youtube', 'fa-brands fa-x-twitter', 'fa-brands fa-linkedin', 'fa-brands fa-telegram', 
      'fa-brands fa-discord', 'fa-brands fa-spotify', 'fa-brands fa-pinterest', 'fa-brands fa-snapchat', 
      'fa-brands fa-reddit', 'fa-brands fa-twitch', 'fa-brands fa-github', 'fa-brands fa-paypal', 
      'fa-brands fa-google-pay', 'fa-brands fa-apple-pay', 'fa-brands fa-stripe', 'fa-brands fa-shopify', 
      'fa-brands fa-amazon', 'fa-brands fa-airbnb', 'fa-brands fa-uber', 'fa-brands fa-wordpress', 
      'fa-brands fa-wix', 'fa-brands fa-figma', 'fa-brands fa-slack', 'fa-brands fa-trello', 
      'fa-brands fa-google', 'fa-brands fa-apple', 'fa-brands fa-microsoft', 'fa-brands fa-android', 
      'fa-brands fa-windows', 'fa-brands fa-steam', 'fa-brands fa-playstation', 'fa-brands fa-xbox', 
      'fa-brands fa-behance', 'fa-brands fa-dribbble', 'fa-brands fa-vimeo', 'fa-brands fa-medium'
    ],
    full: [
      'fa-brands fa-whatsapp', 'fa-brands fa-instagram', 'fa-brands fa-tiktok', 'fa-brands fa-facebook', 
      'fa-brands fa-youtube', 'fa-brands fa-x-twitter', 'fa-brands fa-linkedin', 'fa-brands fa-telegram', 
      'fa-brands fa-discord', 'fa-brands fa-spotify', 'fa-brands fa-pinterest', 'fa-brands fa-snapchat', 
      'fa-brands fa-reddit', 'fa-brands fa-twitch', 'fa-brands fa-github', 'fa-brands fa-paypal', 
      'fa-brands fa-google-pay', 'fa-brands fa-apple-pay', 'fa-brands fa-stripe', 'fa-brands fa-shopify', 
      'fa-brands fa-amazon', 'fa-brands fa-airbnb', 'fa-brands fa-uber', 'fa-brands fa-wordpress', 
      'fa-brands fa-wix', 'fa-brands fa-figma', 'fa-brands fa-slack', 'fa-brands fa-trello', 
      'fa-brands fa-google', 'fa-brands fa-apple', 'fa-brands fa-microsoft', 'fa-brands fa-android', 
      'fa-brands fa-windows', 'fa-brands fa-steam', 'fa-brands fa-playstation', 'fa-brands fa-xbox', 
      'fa-brands fa-behance', 'fa-brands fa-dribbble', 'fa-brands fa-vimeo', 'fa-brands fa-medium',
      'fa-brands fa-mastodon', 'fa-brands fa-threads', 'fa-brands fa-kickstarter', 'fa-brands fa-patreon', 
      'fa-brands fa-soundcloud', 'fa-brands fa-deezer', 'fa-brands fa-shazam', 'fa-brands fa-google-drive', 
      'fa-brands fa-dropbox', 'fa-brands fa-square-whatsapp', 'fa-brands fa-square-facebook', 'fa-brands fa-square-instagram', 
      'fa-brands fa-square-youtube', 'fa-brands fa-square-twitter', 'fa-brands fa-square-github', 'fa-brands fa-square-pinterest', 
      'fa-brands fa-cc-visa', 'fa-brands fa-cc-mastercard', 'fa-brands fa-cc-amex', 'fa-brands fa-cc-paypal', 
      'fa-brands fa-bitcoin', 'fa-brands fa-ethereum', 'fa-brands fa-docker', 'fa-brands fa-git-alt', 
      'fa-brands fa-npm', 'fa-brands fa-python', 'fa-brands fa-js', 'fa-brands fa-react', 
      'fa-brands fa-vuejs', 'fa-brands fa-angular', 'fa-brands fa-node-js', 'fa-brands fa-php', 
      'fa-brands fa-java', 'fa-brands fa-html5', 'fa-brands fa-css3-alt', 'fa-brands fa-sass', 
      'fa-brands fa-bootstrap', 'fa-brands fa-linux', 'fa-brands fa-ubuntu', 'fa-brands fa-chrome', 
      'fa-brands fa-firefox', 'fa-brands fa-safari', 'fa-brands fa-edge', 'fa-brands fa-opera'
    ]
  },
  animals: {
    name: 'Naturaleza',
    popular: [
      'fa-solid fa-paw', 'fa-solid fa-dog', 'fa-solid fa-cat', 'fa-solid fa-fish', 
      'fa-solid fa-horse', 'fa-solid fa-crow', 'fa-solid fa-dove', 'fa-solid fa-frog', 
      'fa-solid fa-dragon', 'fa-solid fa-spider', 'fa-solid fa-bugs', 'fa-solid fa-feather', 
      'fa-solid fa-shield-cat', 'fa-solid fa-hippo', 'fa-solid fa-otter', 'fa-solid fa-kiwi-bird', 
      'fa-solid fa-tree', 'fa-solid fa-seedling', 'fa-solid fa-spa', 'fa-solid fa-leaf', 
      'fa-solid fa-clover', 'fa-solid fa-mountain', 'fa-solid fa-volcano', 'fa-solid fa-water', 
      'fa-solid fa-wind', 'fa-solid fa-sun', 'fa-solid fa-moon', 'fa-solid fa-cloud-sun', 
      'fa-solid fa-snowflake', 'fa-solid fa-cannabis', 'ti ti-dog-bowl', 'ti ti-cat', 
      'ti ti-fish', 'ti ti-butterfly', 'ti ti-horse', 'ti ti-bone', 
      'ti ti-egg', 'ti ti-feather', 'ti ti-plant', 'ti ti-seeding'
    ],
    full: [
      'fa-solid fa-paw', 'fa-solid fa-dog', 'fa-solid fa-cat', 'fa-solid fa-fish', 
      'fa-solid fa-horse', 'fa-solid fa-crow', 'fa-solid fa-dove', 'fa-solid fa-frog', 
      'fa-solid fa-dragon', 'fa-solid fa-spider', 'fa-solid fa-bugs', 'fa-solid fa-feather', 
      'fa-solid fa-shield-cat', 'fa-solid fa-hippo', 'fa-solid fa-otter', 'fa-solid fa-kiwi-bird', 
      'fa-solid fa-tree', 'fa-solid fa-seedling', 'fa-solid fa-spa', 'fa-solid fa-leaf', 
      'fa-solid fa-clover', 'fa-solid fa-mountain', 'fa-solid fa-volcano', 'fa-solid fa-water', 
      'fa-solid fa-wind', 'fa-solid fa-sun', 'fa-solid fa-moon', 'fa-solid fa-cloud-sun', 
      'fa-solid fa-snowflake', 'fa-solid fa-cannabis', 'ti ti-dog-bowl', 'ti ti-cat', 
      'ti ti-fish', 'ti ti-butterfly', 'ti ti-horse', 'ti ti-bone', 
      'ti ti-egg', 'ti ti-feather', 'ti ti-plant', 'ti ti-seeding',
      'ti ti-leaf', 'ti ti-flower', 'ti ti-tree', 'ti ti-trees', 
      'ti ti-cactus', 'ti ti-sun', 'ti ti-moon-stars', 'ti ti-cloud-rain', 
      'ti ti-cloud-storm', 'ti ti-snowflake', 'ti ti-wind', 'ti ti-flame', 
      'ti ti-ripple', 'ti ti-mountain', 'ti ti-current-location', 'fa-solid fa-cow', 
      'fa-solid fa-locust', 'fa-solid fa-mosquito', 'fa-solid fa-mosquito-net', 'fa-solid fa-worm', 
      'fa-solid fa-fish-fins', 'fa-solid fa-shrimp', 'fa-solid fa-cloud-rain', 'fa-solid fa-cloud-showers-heavy', 
      'fa-solid fa-cloud-bolt', 'fa-solid fa-poo-storm', 'fa-solid fa-rainbow', 'fa-solid fa-smog', 
      'fa-solid fa-temperature-high', 'fa-solid fa-temperature-low', 'fa-solid fa-umbrella', 'fa-solid fa-icicles', 
      'fa-solid fa-meteor', 'fa-solid fa-earth-americas', 'fa-solid fa-earth-europe', 'fa-solid fa-earth-asia', 
      'fa-solid fa-earth-oceania', 'fa-solid fa-compass', 'fa-solid fa-fire'
    ]
  },
  bootstrap: {
    name: 'Bootstrap Icons',
    popular: [
      'bi bi-qr-code', 'bi bi-globe', 'bi bi-shop', 'bi bi-heart-fill', 'bi bi-star-fill', 
      'bi bi-wifi', 'bi bi-cup-hot', 'bi bi-car-front', 'bi bi-briefcase', 'bi bi-mortarboard', 
      'bi bi-lightning-charge', 'bi bi-cart3', 'bi bi-gem', 'bi bi-envelope', 'bi bi-telephone', 
      'bi bi-lock', 'bi bi-gift', 'bi bi-camera', 'bi bi-controller', 'bi bi-hospital',
      'bi bi-trophy', 'bi bi-sun', 'bi bi-moon', 'bi bi-airplane', 'bi bi-fire',
      'bi bi-shield-check', 'bi bi-music-note', 'bi bi-film', 'bi bi-person', 'bi bi-geo-alt',
      'bi bi-building', 'bi bi-cloud', 'bi bi-ticket-perforated', 'bi bi-cup-straw', 'bi bi-bell',
      'bi bi-hand-thumbs-up', 'bi bi-info-circle', 'bi bi-laptop', 'bi bi-key', 'bi bi-chat-dots'
    ],
    full: [
      'bi bi-qr-code', 'bi bi-globe', 'bi bi-shop', 'bi bi-heart-fill', 'bi bi-star-fill', 
      'bi bi-wifi', 'bi bi-cup-hot', 'bi bi-car-front', 'bi bi-briefcase', 'bi bi-mortarboard', 
      'bi bi-lightning-charge', 'bi bi-cart3', 'bi bi-gem', 'bi bi-envelope', 'bi bi-telephone', 
      'bi bi-lock', 'bi bi-gift', 'bi bi-camera', 'bi bi-controller', 'bi bi-hospital',
      'bi bi-trophy', 'bi bi-sun', 'bi bi-moon', 'bi bi-airplane', 'bi bi-fire',
      'bi bi-shield-check', 'bi bi-music-note', 'bi bi-film', 'bi bi-person', 'bi bi-geo-alt',
      'bi bi-building', 'bi bi-cloud', 'bi bi-ticket-perforated', 'bi bi-cup-straw', 'bi bi-bell',
      'bi bi-hand-thumbs-up', 'bi bi-info-circle', 'bi bi-laptop', 'bi bi-key', 'bi bi-chat-dots',
      'bi bi-send', 'bi bi-trash', 'bi bi-pencil', 'bi bi-tag', 'bi bi-bookmark', 
      'bi bi-eye', 'bi bi-lightbulb', 'bi bi-search', 'bi bi-credit-card', 'bi bi-wallet2', 
      'bi bi-bag', 'bi bi-cake2', 'bi bi-pass', 'bi bi-activity', 'bi bi-bicycle', 
      'bi bi-bus-front', 'bi bi-truck', 'bi bi-compass', 'bi bi-umbrella', 'bi bi-tree', 
      'bi bi-palette', 'bi bi-magic', 'bi bi-headset', 'bi bi-megaphone', 'bi bi-graph-up-arrow', 
      'bi bi-calculator', 'bi bi-gear', 'bi bi-sliders', 'bi bi-fingerprint', 'bi bi-award', 
      'bi bi-patch-check', 'bi bi-grid', 'bi bi-boxes', 'bi bi-bullseye', 'bi bi-cash-coin', 
      'bi bi-receipt', 'bi bi-printer', 'bi bi-upc-scan', 'bi bi-map', 'bi bi-rocket', 
      'bi bi-cpu', 'bi bi-braces', 'bi bi-bandaid', 'bi bi-capsule', 'bi bi-droplet', 
      'bi bi-tsunami', 'bi bi-house', 'bi bi-bank', 'bi bi-layers', 'bi bi-check-square', 
      'bi bi-patch-check-fill', 'bi bi-speedometer', 'bi bi-pie-chart', 'bi bi-people', 'bi bi-handshake', 
      'bi bi-calendar-event', 'bi bi-badge-ad', 'bi bi-credit-card-2-front', 'bi bi-piggy-bank', 'bi bi-box-seam', 
      'bi bi-tags', 'bi bi-diagram-3', 'bi bi-shield-lock', 'bi bi-file-earmark-code', 'bi bi-code-slash', 
      'bi bi-terminal', 'bi bi-database', 'bi bi-hdd-network', 'bi bi-router', 'bi bi-sim', 
      'bi bi-phone', 'bi bi-smartwatch', 'bi bi-headphones', 'bi bi-mic', 'bi bi-speaker', 
      'bi bi-broadcast', 'bi bi-reception-4', 'bi bi-sd-card', 'bi bi-usb-drive'
    ]
  },
  tabler: {
    name: 'Tabler Icons (5,000+ Vector Set)',
    popular: [
      'ti ti-qrcode', 'ti ti-world', 'ti ti-building-store', 'ti ti-heart-filled', 'ti ti-star-filled', 
      'ti ti-wifi', 'ti ti-cup', 'ti ti-car', 'ti ti-briefcase', 'ti ti-school', 
      'ti ti-bolt', 'ti ti-shopping-cart', 'ti ti-diamond', 'ti ti-mail', 'ti ti-phone', 
      'ti ti-lock', 'ti ti-gift', 'ti ti-camera', 'ti ti-device-gamepad', 'ti ti-first-aid-kit',
      'ti ti-trophy', 'ti ti-sun', 'ti ti-moon', 'ti ti-plane', 'ti ti-flame',
      'ti ti-shield-check', 'ti ti-music', 'ti ti-movie', 'ti ti-user', 'ti ti-map-pin',
      'ti ti-building', 'ti ti-cloud', 'ti ti-ticket', 'ti ti-coffee', 'ti ti-bell',
      'ti ti-thumb-up', 'ti ti-info-circle', 'ti ti-device-laptop', 'ti ti-key', 'ti ti-messages'
    ],
    full: [
      'ti ti-qrcode', 'ti ti-world', 'ti ti-building-store', 'ti ti-heart-filled', 'ti ti-star-filled', 
      'ti ti-wifi', 'ti ti-cup', 'ti ti-car', 'ti ti-briefcase', 'ti ti-school', 
      'ti ti-bolt', 'ti ti-shopping-cart', 'ti ti-diamond', 'ti ti-mail', 'ti ti-phone', 
      'ti ti-lock', 'ti ti-gift', 'ti ti-camera', 'ti ti-device-gamepad', 'ti ti-first-aid-kit',
      'ti ti-trophy', 'ti ti-sun', 'ti ti-moon', 'ti ti-plane', 'ti ti-flame',
      'ti ti-shield-check', 'ti ti-music', 'ti ti-movie', 'ti ti-user', 'ti ti-map-pin',
      'ti ti-building', 'ti ti-cloud', 'ti ti-ticket', 'ti ti-coffee', 'ti ti-bell',
      'ti ti-thumb-up', 'ti ti-info-circle', 'ti ti-device-laptop', 'ti ti-key', 'ti ti-messages',
      'ti ti-send', 'ti ti-trash', 'ti ti-pencil', 'ti ti-tag', 'ti ti-bookmark', 
      'ti ti-eye', 'ti ti-bulb', 'ti ti-search', 'ti ti-credit-card', 'ti ti-wallet', 
      'ti ti-shopping-bag', 'ti ti-cake', 'ti ti-activity', 'ti ti-bike', 'ti ti-bus', 
      'ti ti-truck', 'ti ti-compass', 'ti ti-umbrella', 'ti ti-palette', 'ti ti-wand', 
      'ti ti-headset', 'ti ti-speakerphone', 'ti ti-chart-bar', 'ti ti-calculator', 'ti ti-settings', 
      'ti ti-adjustments', 'ti ti-fingerprint', 'ti ti-award', 'ti ti-medal', 'ti ti-grid', 
      'ti ti-box', 'ti ti-receipt', 'ti ti-printer', 'ti ti-barcode', 'ti ti-map-2', 
      'ti ti-rocket', 'ti ti-cpu', 'ti ti-brand-whatsapp', 'ti ti-brand-instagram', 'ti ti-brand-facebook', 
      'ti ti-brand-tiktok', 'ti ti-brand-youtube', 'ti ti-brand-twitter', 'ti ti-brand-linkedin', 'ti ti-brand-discord', 
      'ti ti-brand-spotify', 'ti ti-brand-telegram', 'ti ti-brand-github'
    ]
  },
  fontawesome: {
    name: 'FontAwesome Símbolos',
    popular: [
      'fa-solid fa-qrcode', 'fa-solid fa-globe', 'fa-solid fa-store', 'fa-solid fa-heart', 'fa-solid fa-star', 
      'fa-solid fa-wifi', 'fa-solid fa-utensils', 'fa-solid fa-car', 'fa-solid fa-briefcase', 'fa-solid fa-graduation-cap', 
      'fa-solid fa-bolt', 'fa-solid fa-cart-shopping', 'fa-solid fa-gem', 'fa-solid fa-envelope', 'fa-solid fa-phone', 
      'fa-solid fa-lock', 'fa-solid fa-gift', 'fa-solid fa-camera', 'fa-solid fa-gamepad', 'fa-solid fa-hospital',
      'fa-solid fa-trophy', 'fa-solid fa-sun', 'fa-solid fa-moon', 'fa-solid fa-plane', 'fa-solid fa-fire',
      'fa-solid fa-shield-halved', 'fa-solid fa-music', 'fa-solid fa-film', 'fa-solid fa-user', 'fa-solid fa-location-dot',
      'fa-solid fa-building', 'fa-solid fa-cloud', 'fa-solid fa-ticket', 'fa-solid fa-coffee', 'fa-solid fa-bell',
      'fa-solid fa-thumbs-up', 'fa-solid fa-circle-info', 'fa-solid fa-laptop', 'fa-solid fa-key', 'fa-solid fa-comments'
    ],
    full: [
      'fa-solid fa-qrcode', 'fa-solid fa-globe', 'fa-solid fa-store', 'fa-solid fa-heart', 'fa-solid fa-star', 
      'fa-solid fa-wifi', 'fa-solid fa-utensils', 'fa-solid fa-car', 'fa-solid fa-briefcase', 'fa-solid fa-graduation-cap', 
      'fa-solid fa-bolt', 'fa-solid fa-cart-shopping', 'fa-solid fa-gem', 'fa-solid fa-envelope', 'fa-solid fa-phone', 
      'fa-solid fa-lock', 'fa-solid fa-gift', 'fa-solid fa-camera', 'fa-solid fa-gamepad', 'fa-solid fa-hospital',
      'fa-solid fa-trophy', 'fa-solid fa-sun', 'fa-solid fa-moon', 'fa-solid fa-plane', 'fa-solid fa-fire',
      'fa-solid fa-shield-halved', 'fa-solid fa-music', 'fa-solid fa-film', 'fa-solid fa-user', 'fa-solid fa-location-dot',
      'fa-solid fa-building', 'fa-solid fa-cloud', 'fa-solid fa-ticket', 'fa-solid fa-coffee', 'fa-solid fa-bell',
      'fa-solid fa-thumbs-up', 'fa-solid fa-circle-info', 'fa-solid fa-laptop', 'fa-solid fa-key', 'fa-solid fa-comments',
      'fa-solid fa-paper-plane', 'fa-solid fa-trash', 'fa-solid fa-pen', 'fa-solid fa-tag', 'fa-solid fa-bookmark', 
      'fa-solid fa-eye', 'fa-solid fa-lightbulb', 'fa-solid fa-magnifying-glass', 'fa-solid fa-credit-card', 'fa-solid fa-wallet', 
      'fa-solid fa-bag-shopping', 'fa-solid fa-cake-candles', 'fa-solid fa-pizza-slice', 'fa-solid fa-mug-hot', 'fa-solid fa-martini-glass', 
      'fa-solid fa-dumbbell', 'fa-solid fa-bicycle', 'fa-solid fa-bus', 'fa-solid fa-truck', 'fa-solid fa-anchor', 
      'fa-solid fa-compass', 'fa-solid fa-umbrella', 'fa-solid fa-tree', 'fa-solid fa-seedling', 'fa-solid fa-spa', 
      'fa-solid fa-feather', 'fa-solid fa-crown', 'fa-solid fa-palette', 'fa-solid fa-masks-theater', 'fa-solid fa-wand-magic-sparkles', 
      'fa-solid fa-headset', 'fa-solid fa-bullhorn', 'fa-solid fa-chart-line', 'fa-solid fa-calculator', 'fa-solid fa-gear', 
      'fa-solid fa-sliders', 'fa-solid fa-fingerprint', 'fa-solid fa-award', 'fa-solid fa-medal', 'fa-solid fa-shapes', 
      'fa-solid fa-cubes', 'fa-solid fa-bullseye', 'fa-solid fa-circle-dollar-to-slot', 'fa-solid fa-file-invoice', 'fa-solid fa-receipt'
    ]
  }
};

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
    this.activeSourceName = document.getElementById('active-source-name');
    this.btnOpenIconGallery = document.getElementById('btn-open-icon-gallery');

    this.iconGalleryModal = document.getElementById('icon-gallery-modal');
    this.btnCloseIconGallery = document.getElementById('btn-close-icon-gallery');
    this.iconGalleryGrid = document.getElementById('icon-gallery-grid');
    this.iconGallerySearch = document.getElementById('icon-gallery-search');
    this.modalActiveSourceText = document.getElementById('modal-active-source-text');
    this.modalIconCountBadge = document.getElementById('modal-icon-count-badge');

    this.iconColorInput = document.getElementById('qr-icon-color');
    this.iconColorHex = document.getElementById('qr-icon-color-hex');
    this.iconBgColorInput = document.getElementById('qr-icon-bg-color') || document.getElementById('qr-icon-bgcolor');
    this.iconBgColorHex = document.getElementById('qr-icon-bg-hex') || document.getElementById('qr-icon-bgcolor-hex');
    this.iconBorderColorInput = document.getElementById('qr-icon-border-color') || document.getElementById('qr-icon-bordercolor');
    this.iconBorderColorHex = document.getElementById('qr-icon-border-hex') || document.getElementById('qr-icon-bordercolor-hex');

    this.iconSizeInput = document.getElementById('qr-icon-size');
    this.iconSizeVal = document.getElementById('qr-icon-size-val');
    this.iconPositionSelect = document.getElementById('qr-icon-position');

    this.iconShowInput = document.getElementById('qr-icon-show');
    this.iconControlsWrapper = document.getElementById('icon-controls-wrapper');

    appState.subscribe((state, eventKey) => {
      if (['CHANGE_ICON', 'CHANGE_ICON_SOURCE', 'CHANGE_ICON_MODE', 'CHANGE_DESIGN', 'INIT_DATA'].includes(eventKey)) {
        this.render();
        this.renderModalGallery();
      }
    });

    // Pre-render current icon on init
    setTimeout(() => {
      const state = appState.getState();
      if (state.selectedIcon) {
        this.selectIcon(state.selectedIcon);
      }
    }, 200);
  }

  getIconClass(iconName) {
    return getIconClass(iconName);
  }

  async selectIcon(iconName, customIconColor = null) {
    const targetIcon = iconName || appState.getState().selectedIcon || 'fa-qrcode';
    const inputColor = this.iconColorInput ? this.iconColorInput.value : null;
    const stateColor = appState.getState().iconColor;
    const iconColor = customIconColor || inputColor || stateColor || '#2563eb';
    const iconClass = getIconClass(targetIcon);
    const dataUrl = await renderIconToDataUrl(iconClass, iconColor);
    appState.setState({ selectedIcon: targetIcon, iconColor, generatedIconDataUrl: dataUrl }, 'CHANGE_ICON');
  }

  bindEvents() {
    if (this.iconShowInput) {
      this.iconShowInput.addEventListener('change', () => {
        const isChecked = this.iconShowInput.checked;
        if (this.iconControlsWrapper) {
          if (isChecked) {
            this.iconControlsWrapper.classList.remove('hidden');
          } else {
            this.iconControlsWrapper.classList.add('hidden');
          }
        }
        appState.setState({ iconShow: isChecked }, 'CHANGE_ICON');
      });
    }

    if (this.btnModeIcon) {
      this.btnModeIcon.addEventListener('click', () => {
        appState.setState({ iconMode: 'icon' }, 'CHANGE_ICON_MODE');
      });
    }

    if (this.btnModeImage) {
      this.btnModeImage.addEventListener('click', () => {
        appState.setState({ iconMode: 'image' }, 'CHANGE_ICON_MODE');
      });
    }

    if (this.logoFileInput) {
      this.logoFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
          ModalService.alert({
            title: 'Imagen demasiado grande',
            message: 'La imagen seleccionada supera el límite máximo permitido de 5MB.',
            type: 'warning'
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
          const dataUrl = evt.target.result;
          appState.setState({ customLogoDataUrl: dataUrl, iconMode: 'image' }, 'CHANGE_ICON_MODE');
          if (this.logoThumb) this.logoThumb.src = dataUrl;
          if (this.logoFilename) this.logoFilename.textContent = file.name;
          if (this.logoPreviewContainer) this.logoPreviewContainer.classList.remove('hidden');
          if (this.logoUploadPrompt) this.logoUploadPrompt.classList.add('hidden');
        };
        reader.readAsDataURL(file);
      });
    }

    if (this.btnClearLogo) {
      this.btnClearLogo.addEventListener('click', () => {
        appState.setState({ customLogoDataUrl: null, iconMode: 'icon' }, 'CHANGE_ICON_MODE');
        if (this.logoFileInput) this.logoFileInput.value = '';
        if (this.logoPreviewContainer) this.logoPreviewContainer.classList.add('hidden');
        if (this.logoUploadPrompt) this.logoUploadPrompt.classList.remove('hidden');
        if (this.logoUploadPrompt) this.logoUploadPrompt.classList.remove('hidden');
      });
    }

    // Source tabs in main step
    document.querySelectorAll('#icon-source-tabs .icon-source-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const source = btn.dataset.source;
        appState.setState({ iconSource: source }, 'CHANGE_ICON_SOURCE');
      });
    });

    // Source tabs in gallery modal
    document.querySelectorAll('#modal-icon-source-tabs .modal-source-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const source = btn.dataset.source;
        appState.setState({ iconSource: source }, 'CHANGE_ICON_SOURCE');
        this.renderModalGallery();
      });
    });

    if (this.btnOpenIconGallery) {
      this.btnOpenIconGallery.addEventListener('click', () => {
        if (this.iconGalleryModal) {
          this.iconGalleryModal.classList.remove('hidden');
          this.renderModalGallery();
        }
      });
    }

    if (this.btnCloseIconGallery) {
      this.btnCloseIconGallery.addEventListener('click', () => {
        if (this.iconGalleryModal) this.iconGalleryModal.classList.add('hidden');
      });
    }

    if (this.iconGallerySearch) {
      this.iconGallerySearch.addEventListener('input', () => {
        this.renderModalGallery();
      });
    }

    if (this.iconPositionSelect) {
      this.iconPositionSelect.addEventListener('change', () => {
        appState.setState({ iconPosition: this.iconPositionSelect.value }, 'CHANGE_ICON');
      });
    }

    if (this.iconSizeInput) {
      const handleSize = () => {
        const val = parseInt(this.iconSizeInput.value, 10);
        if (this.iconSizeVal) this.iconSizeVal.textContent = `${val}px`;
        appState.setState({ iconSize: val }, 'CHANGE_ICON');
      };
      this.iconSizeInput.addEventListener('input', handleSize);
      this.iconSizeInput.addEventListener('change', handleSize);
    }

    if (this.iconColorInput) {
      const handleColor = async () => {
        const color = this.iconColorInput.value;
        if (this.iconColorHex) this.iconColorHex.textContent = color;
        const { selectedIcon } = appState.getState();
        await this.selectIcon(selectedIcon, color);
      };
      this.iconColorInput.addEventListener('input', handleColor);
      this.iconColorInput.addEventListener('change', handleColor);
    }

    if (this.iconBgColorInput) {
      const handleBg = () => {
        const color = this.iconBgColorInput.value;
        if (this.iconBgColorHex) this.iconBgColorHex.textContent = color;
        appState.setState({ iconBgColor: color }, 'CHANGE_ICON');
      };
      this.iconBgColorInput.addEventListener('input', handleBg);
      this.iconBgColorInput.addEventListener('change', handleBg);
    }

    if (this.iconBorderColorInput) {
      const handleBorder = () => {
        const color = this.iconBorderColorInput.value;
        if (this.iconBorderColorHex) this.iconBorderColorHex.textContent = color;
        appState.setState({ iconBorderColor: color }, 'CHANGE_ICON');
      };
      this.iconBorderColorInput.addEventListener('input', handleBorder);
      this.iconBorderColorInput.addEventListener('change', handleBorder);
    }
  }

  renderIconHTML(iconName) {
    if (!iconName || typeof iconName !== 'string') return `<i class="fa-solid fa-qrcode"></i>`;
    
    if (iconName.startsWith('ti ') || iconName.startsWith('ti-')) {
      let cls = iconName.startsWith('ti ') ? iconName : `ti ${iconName}`;
      if (iconName.includes('-filled') && !cls.includes('ti-filled')) {
        cls += ' ti-filled';
      }
      return `<i class="${cls} text-lg leading-none"></i>`;
    } 
    if (iconName.startsWith('bi ') || iconName.startsWith('bi-')) {
      const cls = iconName.startsWith('bi ') ? iconName : `bi ${iconName}`;
      return `<i class="${cls} text-base"></i>`;
    } 
    if (iconName.startsWith('fa-') || iconName.startsWith('fa ')) {
      return `<i class="${iconName} text-base"></i>`;
    } 
    if (iconName.startsWith('material:') || iconName.startsWith('ms-')) {
      const name = iconName.replace(/^material:|^ms-/, '');
      return `<span class="material-symbols-outlined text-lg leading-none">${name}</span>`;
    }
    
    return `<i class="fa-solid ${iconName}"></i>`;
  }

  getCleanName(iconName) {
    if (!iconName || typeof iconName !== 'string') return 'QR';
    return iconName
      .replace(/^fa-brands\s+|^fa-solid\s+|^fa-|^bi\s+|^bi-|^ti\s+ti-|^ti\s+|^ti-|^material:|^ms-/, '')
      .replace(/-/g, ' ')
      .toUpperCase();
  }

  renderModalGallery() {
    if (!this.iconGalleryGrid) return;
    const { iconSource = 'brands', selectedIcon } = appState.getState();
    const sourceData = ICON_SOURCES[iconSource] || ICON_SOURCES.brands;
    const search = (this.iconGallerySearch ? this.iconGallerySearch.value : '').toLowerCase().trim();

    if (this.modalActiveSourceText) this.modalActiveSourceText.textContent = sourceData.name;

    // Filter icons by search query
    const filteredIcons = sourceData.full.filter(icon => icon.toLowerCase().includes(search));
    if (this.modalIconCountBadge) this.modalIconCountBadge.textContent = `${filteredIcons.length} Íconos`;

    this.iconGalleryGrid.innerHTML = '';
    filteredIcons.forEach(iconName => {
      const isSelected = (selectedIcon === iconName);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `icon-btn p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition shadow-sm ${
        isSelected 
          ? 'active bg-cyan-600 border-2 border-cyan-400 ring-2 ring-cyan-400/50 text-white font-bold scale-105' 
          : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-slate-800'
      }`;
      btn.title = iconName;
      btn.innerHTML = `${this.renderIconHTML(iconName)}<span class="text-[9px] font-mono truncate max-w-[55px] opacity-70">${this.getCleanName(iconName)}</span>`;

      btn.addEventListener('click', () => {
        this.selectIcon(iconName);
        if (this.iconGalleryModal) this.iconGalleryModal.classList.add('hidden');
      });
      this.iconGalleryGrid.appendChild(btn);
    });

    // Update modal source tabs styling
    document.querySelectorAll('#modal-icon-source-tabs .modal-source-tab').forEach(btn => {
      if (btn.dataset.source === iconSource) {
        btn.className = 'modal-source-tab py-1.5 px-3 rounded-lg text-xs font-semibold transition bg-cyan-600 text-white shadow';
      } else {
        btn.className = 'modal-source-tab py-1.5 px-3 rounded-lg text-xs font-semibold transition text-slate-400 hover:text-white';
      }
    });
  }

  render() {
    const { iconMode, iconSource = 'brands', selectedIcon, iconColor, iconBgColor, iconBorderColor, iconSize, iconShow = true } = appState.getState();
    const sourceData = ICON_SOURCES[iconSource] || ICON_SOURCES.brands;

    if (this.iconShowInput) {
      this.iconShowInput.checked = iconShow;
      if (this.iconControlsWrapper) {
        if (iconShow) {
          this.iconControlsWrapper.classList.remove('hidden');
        } else {
          this.iconControlsWrapper.classList.add('hidden');
        }
      }
    }

    if (this.iconSizeInput && iconSize) {
      this.iconSizeInput.value = iconSize;
      if (this.iconSizeVal) this.iconSizeVal.textContent = `${iconSize}px`;
    }
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

    if (this.activeSourceName) this.activeSourceName.textContent = sourceData.name;
    if (this.galleryBtnSourceName) this.galleryBtnSourceName.textContent = sourceData.name;
    if (this.activeIconLabel) {
      this.activeIconLabel.textContent = `Seleccionado: ${this.getCleanName(selectedIcon || 'fa-brands fa-whatsapp')}`;
    }

    // Source tab button active states
    document.querySelectorAll('#icon-source-tabs .icon-source-tab').forEach(btn => {
      if (btn.dataset.source === iconSource) {
        btn.className = 'icon-source-tab flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition bg-indigo-600 text-white shadow';
      } else {
        btn.className = 'icon-source-tab flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition text-slate-400 hover:text-white hover:bg-slate-800';
      }
    });

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

    // Top 40 Popular Icons Grid rendering
    if (this.container) {
      this.container.innerHTML = '';
      sourceData.popular.forEach(iconName => {
        const isSelected = (selectedIcon === iconName);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `icon-btn w-9 h-9 rounded-lg flex items-center justify-center text-sm transition shadow-sm ${
          isSelected 
            ? 'active bg-cyan-600 border-2 border-cyan-400 ring-2 ring-cyan-400/50 text-white font-bold scale-105' 
            : 'bg-slate-950/80 border border-slate-700/70 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50'
        }`;
        btn.innerHTML = this.renderIconHTML(iconName);
        btn.title = this.getCleanName(iconName);

        btn.addEventListener('click', () => {
          this.selectIcon(iconName);
          if (this.activeIconLabel) {
            this.activeIconLabel.textContent = `Seleccionado: ${this.getCleanName(iconName)}`;
          }
        });
        this.container.appendChild(btn);
      });
    }
  }
}

