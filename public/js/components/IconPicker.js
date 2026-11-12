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
      'fa-brands fa-facebook-f', 'fa-brands fa-facebook-messenger', 'fa-brands fa-youtube', 'fa-brands fa-x-twitter', 
      'fa-brands fa-twitter', 'fa-brands fa-linkedin', 'fa-brands fa-linkedin-in', 'fa-brands fa-telegram', 
      'fa-brands fa-discord', 'fa-brands fa-spotify', 'fa-brands fa-pinterest', 'fa-brands fa-pinterest-p', 
      'fa-brands fa-snapchat', 'fa-brands fa-reddit', 'fa-brands fa-reddit-alien', 'fa-brands fa-twitch', 
      'fa-brands fa-github', 'fa-brands fa-paypal', 'fa-brands fa-google-pay', 'fa-brands fa-apple-pay', 
      'fa-brands fa-stripe', 'fa-brands fa-stripe-s', 'fa-brands fa-shopify', 'fa-brands fa-amazon', 
      'fa-brands fa-amazon-pay', 'fa-brands fa-airbnb', 'fa-brands fa-uber', 'fa-brands fa-wordpress', 
      'fa-brands fa-wordpress-simple', 'fa-brands fa-wix', 'fa-brands fa-figma', 'fa-brands fa-slack', 
      'fa-brands fa-trello', 'fa-brands fa-google', 'fa-brands fa-google-play', 'fa-brands fa-google-drive', 
      'fa-brands fa-apple', 'fa-brands fa-app-store', 'fa-brands fa-app-store-ios', 'fa-brands fa-microsoft', 
      'fa-brands fa-android', 'fa-brands fa-windows', 'fa-brands fa-steam', 'fa-brands fa-playstation', 
      'fa-brands fa-xbox', 'fa-brands fa-behance', 'fa-brands fa-dribbble', 'fa-brands fa-vimeo', 
      'fa-brands fa-vimeo-v', 'fa-brands fa-medium', 'fa-brands fa-mastodon', 'fa-brands fa-threads', 
      'fa-brands fa-kickstarter', 'fa-brands fa-kickstarter-k', 'fa-brands fa-patreon', 'fa-brands fa-soundcloud', 
      'fa-brands fa-deezer', 'fa-brands fa-dropbox', 'fa-brands fa-square-whatsapp', 'fa-brands fa-square-facebook', 
      'fa-brands fa-square-instagram', 'fa-brands fa-square-youtube', 'fa-brands fa-square-x-twitter', 'fa-brands fa-square-twitter', 
      'fa-brands fa-square-github', 'fa-brands fa-square-pinterest', 'fa-brands fa-square-reddit', 'fa-brands fa-square-snapchat', 
      'fa-brands fa-square-gitlab', 'fa-brands fa-square-behance', 'fa-brands fa-square-dribbble', 'fa-brands fa-square-steam', 
      'fa-brands fa-cc-visa', 'fa-brands fa-cc-mastercard', 'fa-brands fa-cc-amex', 'fa-brands fa-cc-paypal', 
      'fa-brands fa-cc-discover', 'fa-brands fa-cc-diners-club', 'fa-brands fa-cc-jcb', 'fa-brands fa-cc-apple-pay', 
      'fa-brands fa-cc-stripe', 'fa-brands fa-bitcoin', 'fa-brands fa-btc', 'fa-brands fa-ethereum', 
      'fa-brands fa-docker', 'fa-brands fa-git-alt', 'fa-brands fa-git', 'fa-brands fa-npm', 
      'fa-brands fa-node', 'fa-brands fa-node-js', 'fa-brands fa-python', 'fa-brands fa-js', 
      'fa-brands fa-react', 'fa-brands fa-vuejs', 'fa-brands fa-angular', 'fa-brands fa-php', 
      'fa-brands fa-java', 'fa-brands fa-html5', 'fa-brands fa-css3-alt', 'fa-brands fa-sass', 
      'fa-brands fa-bootstrap', 'fa-brands fa-linux', 'fa-brands fa-ubuntu', 'fa-brands fa-chrome', 
      'fa-brands fa-firefox', 'fa-brands fa-safari', 'fa-brands fa-edge', 'fa-brands fa-opera', 
      'fa-brands fa-wechat', 'fa-brands fa-weixin', 'fa-brands fa-line', 'fa-brands fa-viber', 
      'fa-brands fa-skype', 'fa-brands fa-tumblr', 'fa-brands fa-etsy', 'fa-brands fa-ebay', 
      'fa-brands fa-yelp', 'fa-brands fa-tripadvisor', 'fa-brands fa-strava', 'fa-brands fa-goodreads', 
      'fa-brands fa-quora', 'fa-brands fa-stack-overflow', 'fa-brands fa-bitbucket', 'fa-brands fa-gitlab', 
      'fa-brands fa-alipay', 'fa-brands fa-intercom', 'fa-brands fa-mailchimp', 'fa-brands fa-hubspot', 
      'fa-brands fa-salesforce', 'fa-brands fa-jira', 'fa-brands fa-confluence', 'fa-brands fa-cloudflare', 
      'fa-brands fa-digital-ocean', 'fa-brands fa-aws', 'fa-brands fa-rust', 'fa-brands fa-golang', 
      'fa-brands fa-swift', 'fa-brands fa-unity', 'fa-brands fa-itch-io', 'fa-brands fa-waze', 
      'fa-brands fa-meetup', 'fa-brands fa-flickr', 'fa-brands fa-500px', 'fa-brands fa-dailymotion'
    ]
  },
  animals: {
    name: 'Naturaleza & Mascotas',
    popular: [
      'fa-solid fa-paw', 'fa-solid fa-dog', 'fa-solid fa-cat', 'fa-solid fa-fish', 
      'fa-solid fa-horse', 'fa-solid fa-crow', 'fa-solid fa-dove', 'fa-solid fa-frog', 
      'fa-solid fa-dragon', 'fa-solid fa-spider', 'fa-solid fa-bugs', 'fa-solid fa-feather', 
      'fa-solid fa-shield-cat', 'fa-solid fa-shield-dog', 'fa-solid fa-hippo', 'fa-solid fa-otter', 
      'fa-solid fa-kiwi-bird', 'fa-solid fa-tree', 'fa-solid fa-seedling', 'fa-solid fa-spa', 
      'fa-solid fa-leaf', 'fa-solid fa-clover', 'fa-solid fa-mountain', 'fa-solid fa-volcano', 
      'fa-solid fa-water', 'fa-solid fa-wind', 'fa-solid fa-sun', 'fa-solid fa-moon', 
      'fa-solid fa-cloud-sun', 'fa-solid fa-snowflake', 'fa-solid fa-cannabis', 'ti ti-dog-bowl', 
      'ti ti-cat', 'ti ti-fish', 'ti ti-butterfly', 'ti ti-horse', 
      'ti ti-bone', 'ti ti-egg', 'ti ti-plant', 'ti ti-seeding'
    ],
    full: [
      'fa-solid fa-paw', 'fa-solid fa-dog', 'fa-solid fa-cat', 'fa-solid fa-fish', 
      'fa-solid fa-horse', 'fa-solid fa-crow', 'fa-solid fa-dove', 'fa-solid fa-frog', 
      'fa-solid fa-dragon', 'fa-solid fa-spider', 'fa-solid fa-bugs', 'fa-solid fa-feather', 
      'fa-solid fa-shield-cat', 'fa-solid fa-shield-dog', 'fa-solid fa-hippo', 'fa-solid fa-otter', 
      'fa-solid fa-kiwi-bird', 'fa-solid fa-cow', 'fa-solid fa-locust', 'fa-solid fa-mosquito', 
      'fa-solid fa-mosquito-net', 'fa-solid fa-worm', 'fa-solid fa-fish-fins', 'fa-solid fa-shrimp', 
      'fa-solid fa-tree', 'fa-solid fa-seedling', 'fa-solid fa-spa', 'fa-solid fa-leaf', 
      'fa-solid fa-clover', 'fa-solid fa-mountain', 'fa-solid fa-mountain-sun', 'fa-solid fa-volcano', 
      'fa-solid fa-water', 'fa-solid fa-wind', 'fa-solid fa-sun', 'fa-solid fa-moon', 
      'fa-solid fa-cloud-sun', 'fa-solid fa-cloud-moon', 'fa-solid fa-cloud-rain', 'fa-solid fa-cloud-showers-heavy', 
      'fa-solid fa-cloud-bolt', 'fa-solid fa-snowflake', 'fa-solid fa-cannabis', 'fa-solid fa-rainbow', 
      'fa-solid fa-smog', 'fa-solid fa-temperature-high', 'fa-solid fa-temperature-low', 'fa-solid fa-umbrella', 
      'fa-solid fa-icicles', 'fa-solid fa-meteor', 'fa-solid fa-earth-americas', 'fa-solid fa-earth-europe', 
      'fa-solid fa-earth-asia', 'fa-solid fa-earth-africa', 'fa-solid fa-earth-oceania', 'fa-solid fa-compass', 
      'fa-solid fa-fire', 'fa-solid fa-fire-flame-curved', 'fa-solid fa-droplet', 'fa-solid fa-wheat-awn', 
      'fa-solid fa-plant-wilt', 'fa-solid fa-carrot', 'fa-solid fa-apple-whole', 'fa-solid fa-lemon', 
      'fa-solid fa-bone', 'fa-solid fa-feather-pointed', 'fa-solid fa-campground', 'fa-solid fa-tent',
      'ti ti-dog-bowl', 'ti ti-cat', 'ti ti-fish', 'ti ti-fish-bone', 
      'ti ti-butterfly', 'ti ti-horse', 'ti ti-bone', 'ti ti-egg', 
      'ti ti-feather', 'ti ti-plant', 'ti ti-plant-2', 'ti ti-seeding', 
      'ti ti-leaf', 'ti ti-flower', 'ti ti-tree', 'ti ti-trees', 
      'ti ti-cactus', 'ti ti-sun', 'ti ti-sun-high', 'ti ti-moon-stars', 
      'ti ti-moon', 'ti ti-cloud-rain', 'ti ti-cloud-storm', 'ti ti-cloud-snow', 
      'ti ti-cloud-fog', 'ti ti-snowflake', 'ti ti-wind', 'ti ti-flame', 
      'ti ti-ripple', 'ti ti-mountain', 'ti ti-droplet', 'ti ti-rainbow', 
      'ti ti-temperature', 'ti ti-umbrella', 'ti ti-mushroom', 'ti ti-clover', 
      'ti ti-beach', 'ti ti-scuba-mask', 'ti ti-speedboat', 'ti ti-tent', 
      'ti ti-paw', 'ti ti-comet', 'ti ti-planet', 'ti ti-current-location'
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
      'ti ti-rocket', 'ti ti-cpu', 'ti ti-database', 'ti ti-server', 'ti ti-code', 
      'ti ti-terminal-2', 'ti ti-folder', 'ti ti-file-text', 'ti ti-file-code', 'ti ti-clipboard-check', 
      'ti ti-chart-pie', 'ti ti-chart-line', 'ti ti-trending-up', 'ti ti-cash', 'ti ti-coins', 
      'ti ti-currency-dollar', 'ti ti-currency-euro', 'ti ti-shield-lock', 'ti ti-lock-open', 'ti ti-key-round', 
      'ti ti-bell-ringing', 'ti ti-clock', 'ti ti-calendar', 'ti ti-calendar-event', 'ti ti-alarm', 
      'ti ti-navigation', 'ti ti-pin', 'ti ti-flag', 'ti ti-discount-2', 'ti ti-percentage', 
      'ti ti-package', 'ti ti-truck-delivery', 'ti ti-building-bank', 'ti ti-building-warehouse', 'ti ti-home', 
      'ti ti-smart-home', 'ti ti-device-mobile', 'ti ti-device-tablet', 'ti ti-device-tv', 'ti ti-device-watch', 
      'ti ti-headphones', 'ti ti-microphone', 'ti ti-volume', 'ti ti-player-play', 'ti ti-video', 
      'ti ti-sparkles', 'ti ti-crown', 'ti ti-mood-smile', 'ti ti-shield', 'ti ti-users', 
      'ti ti-user-check', 'ti ti-check', 'ti ti-x', 'ti ti-plus', 'ti ti-zoom-in', 
      'ti ti-share', 'ti ti-download', 'ti ti-upload', 'ti ti-link', 'ti ti-refresh', 
      'ti ti-brand-whatsapp', 'ti ti-brand-instagram', 'ti ti-brand-facebook', 'ti ti-brand-tiktok', 
      'ti ti-brand-youtube', 'ti ti-brand-twitter', 'ti ti-brand-linkedin', 'ti ti-brand-discord', 
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
      'fa-solid fa-bag-shopping', 'fa-solid fa-cake-candles', 'fa-solid fa-pizza-slice', 'fa-solid fa-burger', 'fa-solid fa-mug-hot', 
      'fa-solid fa-martini-glass', 'fa-solid fa-wine-glass', 'fa-solid fa-beer-mug-empty', 'fa-solid fa-ice-cream', 'fa-solid fa-cookie', 
      'fa-solid fa-dumbbell', 'fa-solid fa-person-running', 'fa-solid fa-bicycle', 'fa-solid fa-bus', 'fa-solid fa-truck', 
      'fa-solid fa-train', 'fa-solid fa-ship', 'fa-solid fa-anchor', 'fa-solid fa-compass', 'fa-solid fa-umbrella', 
      'fa-solid fa-tree', 'fa-solid fa-seedling', 'fa-solid fa-spa', 'fa-solid fa-feather', 'fa-solid fa-crown', 
      'fa-solid fa-palette', 'fa-solid fa-masks-theater', 'fa-solid fa-wand-magic-sparkles', 'fa-solid fa-headset', 'fa-solid fa-bullhorn', 
      'fa-solid fa-chart-line', 'fa-solid fa-chart-pie', 'fa-solid fa-chart-simple', 'fa-solid fa-calculator', 'fa-solid fa-gear', 
      'fa-solid fa-gears', 'fa-solid fa-sliders', 'fa-solid fa-fingerprint', 'fa-solid fa-award', 'fa-solid fa-medal', 
      'fa-solid fa-shapes', 'fa-solid fa-cubes', 'fa-solid fa-bullseye', 'fa-solid fa-circle-dollar-to-slot', 'fa-solid fa-file-invoice', 
      'fa-solid fa-file-invoice-dollar', 'fa-solid fa-receipt', 'fa-solid fa-stethoscope', 'fa-solid fa-syringe', 'fa-solid fa-pills', 
      'fa-solid fa-kit-medical', 'fa-solid fa-book', 'fa-solid fa-book-open', 'fa-solid fa-newspaper', 'fa-solid fa-landmark', 
      'fa-solid fa-hotel', 'fa-solid fa-bell-concierge', 'fa-solid fa-screwdriver-wrench', 'fa-solid fa-wrench', 'fa-solid fa-hammer', 
      'fa-solid fa-scissors', 'fa-solid fa-spray-can-sparkles', 'fa-solid fa-paintbrush', 'fa-solid fa-circle-check', 'fa-solid fa-circle-xmark', 
      'fa-solid fa-triangle-exclamation', 'fa-solid fa-shield-cat', 'fa-solid fa-paw', 'fa-solid fa-handshake', 'fa-solid fa-users', 
      'fa-solid fa-user-group', 'fa-solid fa-address-book', 'fa-solid fa-id-card', 'fa-solid fa-passport',
      'fa-solid fa-clock', 'fa-solid fa-hourglass', 'fa-solid fa-shield', 'fa-solid fa-circle-question', 'fa-solid fa-circle-exclamation',
      'fa-solid fa-bell-slash', 'fa-solid fa-share-nodes', 'fa-solid fa-link', 'fa-solid fa-paperclip', 'fa-solid fa-magnifying-glass-plus',
      'fa-solid fa-magnifying-glass-minus', 'fa-solid fa-crosshairs', 'fa-solid fa-signal', 'fa-solid fa-battery-full', 'fa-solid fa-power-off',
      'fa-solid fa-plug', 'fa-solid fa-bolt-lightning', 'fa-solid fa-glasses', 'fa-solid fa-cart-plus', 'fa-solid fa-basket-shopping'
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
    this.galleryBtnSourceName = document.getElementById('gallery-btn-source-name');
    this.galleryBtnCount = document.getElementById('gallery-btn-count');
    this.btnOpenIconGallery = document.getElementById('btn-open-icon-gallery');

    this.iconGalleryModal = document.getElementById('icon-gallery-modal');
    this.btnCloseIconGallery = document.getElementById('btn-close-icon-gallery');
    this.btnCloseGalleryFooter = document.getElementById('btn-close-gallery-footer');
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
    this.iconCenterCustomization = document.getElementById('icon-center-customization') || document.getElementById('icon-controls-wrapper');

    appState.subscribe((state, eventKey) => {
      if (['CHANGE_ICON', 'CHANGE_ICON_SOURCE', 'CHANGE_ICON_MODE', 'CHANGE_DESIGN', 'INIT_DATA', 'RESET_STATE'].includes(eventKey)) {
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
        if (this.iconCenterCustomization) {
          this.iconCenterCustomization.classList.toggle('hidden', !isChecked);
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

    const openGallery = () => {
      const modal = document.getElementById('icon-gallery-modal') || this.iconGalleryModal;
      if (modal) {
        this.iconGalleryModal = modal;
        modal.classList.remove('hidden');
        this.renderModalGallery();
      }
    };

    const closeGallery = () => {
      const modal = document.getElementById('icon-gallery-modal') || this.iconGalleryModal;
      if (modal) {
        modal.classList.add('hidden');
      }
    };

    if (this.btnOpenIconGallery) {
      this.btnOpenIconGallery.addEventListener('click', openGallery);
    }

    if (this.btnCloseIconGallery) {
      this.btnCloseIconGallery.addEventListener('click', closeGallery);
    }

    if (this.btnCloseGalleryFooter) {
      this.btnCloseGalleryFooter.addEventListener('click', closeGallery);
    }

    // Document-level event delegation ensuring both close buttons always trigger reliably
    document.addEventListener('click', (e) => {
      if (e.target.closest('#btn-close-icon-gallery') || e.target.closest('#btn-close-gallery-footer')) {
        e.preventDefault();
        closeGallery();
      } else if (e.target.closest('#btn-open-icon-gallery')) {
        e.preventDefault();
        openGallery();
      }
    });

    // Close on backdrop click
    document.addEventListener('click', (e) => {
      const modal = document.getElementById('icon-gallery-modal');
      if (modal && !modal.classList.contains('hidden') && e.target === modal) {
        closeGallery();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('icon-gallery-modal');
        if (modal && !modal.classList.contains('hidden')) {
          closeGallery();
        }
      }
    });

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
      btn.className = `icon-btn p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition shadow-2xs ${
        isSelected 
          ? 'active bg-cyan-600 border-2 border-cyan-400 ring-2 ring-cyan-400/50 text-white font-bold scale-105' 
          : 'bg-white border border-slate-200 text-slate-700 hover:text-cyan-700 hover:border-cyan-400 hover:bg-cyan-50/50'
      }`;
      btn.title = iconName;
      btn.innerHTML = `${this.renderIconHTML(iconName)}<span class="text-[9px] font-mono truncate max-w-[55px] opacity-70">${this.getCleanName(iconName)}</span>`;

      btn.addEventListener('click', () => {
        this.selectIcon(iconName);
        if (this.iconGalleryModal) this.iconGalleryModal.classList.add('hidden');
      });
      this.iconGalleryGrid.appendChild(btn);
    });

    // Update modal source tabs styling (Light SaaS Theme - No white text on hover)
    document.querySelectorAll('#modal-icon-source-tabs .modal-source-tab').forEach(btn => {
      if (btn.dataset.source === iconSource) {
        btn.className = 'modal-source-tab py-1.5 px-3 rounded-lg text-xs font-semibold transition bg-cyan-600 text-white shadow-xs';
      } else {
        btn.className = 'modal-source-tab py-1.5 px-3 rounded-lg text-xs font-semibold transition text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 bg-white';
      }
    });
  }

  render() {
    const { iconMode, iconSource = 'brands', selectedIcon, iconColor, iconBgColor, iconBorderColor, iconSize, iconShow = true } = appState.getState();
    const sourceData = ICON_SOURCES[iconSource] || ICON_SOURCES.brands;

    if (this.iconShowInput) {
      this.iconShowInput.checked = iconShow;
    }
    if (this.iconCenterCustomization) {
      this.iconCenterCustomization.classList.toggle('hidden', !iconShow);
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
    if (this.galleryBtnCount) this.galleryBtnCount.textContent = `${sourceData.full.length}+`;
    if (this.activeIconLabel) {
      this.activeIconLabel.textContent = `Seleccionado: ${this.getCleanName(selectedIcon || 'fa-brands fa-whatsapp')}`;
    }

    // Source tab button active states (Light SaaS Theme - No white text on hover)
    document.querySelectorAll('#icon-source-tabs .icon-source-tab').forEach(btn => {
      if (btn.dataset.source === iconSource) {
        btn.className = 'icon-source-tab flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition bg-indigo-600 text-white shadow-xs';
      } else {
        btn.className = 'icon-source-tab flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 bg-white';
      }
    });

    // Mode Switch styling (Light SaaS Theme - No white text on hover)
    if (this.btnModeIcon && this.btnModeImage) {
      if (iconMode === 'icon') {
        this.btnModeIcon.className = 'flex-1 text-xs py-2 px-3 rounded-lg font-semibold transition bg-cyan-600 text-white shadow-xs';
        this.btnModeImage.className = 'flex-1 text-xs py-2 px-3 rounded-lg font-semibold transition text-slate-700 hover:text-slate-900 hover:bg-slate-100';
        if (this.sectionIconMode) this.sectionIconMode.classList.remove('hidden');
        if (this.sectionImageMode) this.sectionImageMode.classList.add('hidden');
      } else {
        this.btnModeImage.className = 'flex-1 text-xs py-2 px-3 rounded-lg font-semibold transition bg-cyan-600 text-white shadow-xs';
        this.btnModeIcon.className = 'flex-1 text-xs py-2 px-3 rounded-lg font-semibold transition text-slate-700 hover:text-slate-900 hover:bg-slate-100';
        if (this.sectionImageMode) this.sectionImageMode.classList.remove('hidden');
        if (this.sectionIconMode) this.sectionIconMode.classList.add('hidden');
      }
    }

    // Top 40 Popular Icons Grid rendering (Light SaaS Theme)
    if (this.container) {
      this.container.innerHTML = '';
      sourceData.popular.forEach(iconName => {
        const isSelected = (selectedIcon === iconName);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `icon-btn w-9 h-9 rounded-lg flex items-center justify-center text-sm transition shadow-2xs ${
          isSelected 
            ? 'active bg-cyan-600 border-2 border-cyan-400 ring-2 ring-cyan-400/50 text-white font-bold scale-105' 
            : 'bg-white border border-slate-200 text-slate-700 hover:text-cyan-700 hover:border-cyan-400 hover:bg-cyan-50/50'
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

