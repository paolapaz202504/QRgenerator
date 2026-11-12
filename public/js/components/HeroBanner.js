import { UIComponent } from './UIComponent.js';
import { appState } from '../state/AppState.js';

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
          if (this.toggleText) this.toggleText.textContent = 'Ver propuesta';
          if (this.toggleIcon) this.toggleIcon.className = 'fa-solid fa-chevron-down text-[10px]';
        } else {
          this.heroContent.classList.remove('hidden');
          if (this.toggleText) this.toggleText.textContent = 'Ocultar guía';
          if (this.toggleIcon) this.toggleIcon.className = 'fa-solid fa-chevron-up text-[10px]';
        }
      });
    }

    // Bind Vertical Category Cards (Gastronomía, Belleza, Compras)
    const caseCards = document.querySelectorAll('[data-target-category]');
    caseCards.forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.getAttribute('data-target-category');
        if (cat) {
          appState.setState({ activeCategory: cat }, 'CHANGE_CATEGORY');
          const stepSection = document.getElementById('step3-container') || document.getElementById('step1-container');
          if (stepSection) {
            stepSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // Bind "Diseñar mi QR Ahora" Button
    const btnStart = document.getElementById('hero-btn-start');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        const urlInput = document.getElementById('qr-url');
        const stepSection = document.getElementById('step1-container') || document.getElementById('step3-container');
        if (stepSection) {
          stepSection.scrollIntoView({ behavior: 'smooth' });
        }
        if (urlInput) {
          setTimeout(() => urlInput.focus(), 350);
        }
      });
    }
  }

  render() {}
}
