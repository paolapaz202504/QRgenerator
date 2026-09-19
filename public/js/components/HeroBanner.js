import { UIComponent } from './UIComponent.js';

export class HeroBanner extends UIComponent {
  constructor() {
    super('section-hero-banner');
    this.btnToggle = document.getElementById('btn-toggle-hero-banner');
    this.heroContent = document.getElementById('hero-banner-content');
    this.toggleText = document.getElementById('hero-banner-toggle-text');
    this.toggleIcon = document.getElementById('hero-banner-toggle-icon');
    this.isCollapsed = false;
  }

  bindEvents() {
    if (this.btnToggle && this.heroContent) {
      this.btnToggle.addEventListener('click', () => {
        this.isCollapsed = !this.isCollapsed;
        if (this.isCollapsed) {
          this.heroContent.classList.add('hidden');
          if (this.toggleText) this.toggleText.textContent = 'Ver guía';
          if (this.toggleIcon) this.toggleIcon.className = 'fa-solid fa-chevron-down text-[10px]';
        } else {
          this.heroContent.classList.remove('hidden');
          if (this.toggleText) this.toggleText.textContent = 'Ocultar guía';
          if (this.toggleIcon) this.toggleIcon.className = 'fa-solid fa-chevron-up text-[10px]';
        }
      });
    }
  }

  render() {}
}
