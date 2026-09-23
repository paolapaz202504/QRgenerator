import { ComponentLoader } from './ComponentLoader.js';
import { appState } from './state/AppState.js';
import { ApiService } from './services/ApiService.js';
import { DesignPicker } from './components/DesignPicker.js';
import { IconPicker } from './components/IconPicker.js';
import { ColorCustomizer } from './components/ColorCustomizer.js';
import { HistoryTable } from './components/HistoryTable.js';
import { UserModal } from './components/UserModal.js';
import { QRPreview } from './components/QRPreview.js';
import { PlanModal } from './components/PlanModal.js';
import { ProfileModal } from './components/ProfileModal.js';
import { HeroBanner } from './components/HeroBanner.js';
import { FaqSection } from './components/FaqSection.js';

class Application {
  async init() {
    console.log('🚀 Inicializando QRbey Frontend Architecture...');

    // 1. Load modularized HTML component partials from ./html/
    await ComponentLoader.loadComponents();

    // 2. Instantiate and mount UI Component controllers after DOM is populated
    this.heroBanner = new HeroBanner();
    this.designPicker = new DesignPicker();
    this.iconPicker = new IconPicker();
    this.colorCustomizer = new ColorCustomizer();
    this.historyTable = new HistoryTable();
    this.userModal = new UserModal();
    this.qrPreview = new QRPreview();
    this.planModal = new PlanModal();
    this.profileModal = new ProfileModal();
    this.faqSection = new FaqSection();

    // Wait for document fonts if available
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // Mount UI Components
    this.heroBanner.mount();
    this.designPicker.mount();
    this.iconPicker.mount();
    this.colorCustomizer.mount();
    this.historyTable.mount();
    this.userModal.mount();
    this.qrPreview.mount();
    this.planModal.mount();
    this.profileModal.mount();
    this.faqSection.mount();

    // Fetch initial data from backend API
    const res = await ApiService.getDesigns();
    if (res.success) {
      appState.setState({
        categories: res.categories || [],
        designs: res.designs || [],
        patterns: res.patterns || [],
        currentDesign: res.designs.length ? { ...res.designs[0] } : null
      }, 'INIT_DATA');
    }

    // Smooth Scroll for History Button
    const btnOpenHistory = document.getElementById('btn-open-history');
    if (btnOpenHistory) {
      btnOpenHistory.addEventListener('click', () => {
        const section = document.getElementById('section-history');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
        this.historyTable.fetchHistory();
      });
    }

    // Smooth Scroll for FAQ Button
    const btnOpenFaq = document.getElementById('btn-open-faq');
    if (btnOpenFaq) {
      btnOpenFaq.addEventListener('click', () => {
        const section = document.getElementById('section-faq');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Step 1 to 4 Collapsible Panel Toggles
    const stepToggles = [
      { btnId: 'toggle-step3', panelId: 'panel-step3', iconId: 'icon-toggle-step3' },
      { btnId: 'toggle-step1', panelId: 'panel-step1', iconId: 'icon-toggle-step1' },
      { btnId: 'toggle-step2', panelId: 'panel-step2', iconId: 'icon-toggle-step2' },
      { btnId: 'toggle-step4', panelId: 'panel-step4', iconId: 'icon-toggle-step4' }
    ];

    stepToggles.forEach(({ btnId, panelId, iconId }) => {
      const btn = document.getElementById(btnId);
      const panel = document.getElementById(panelId);
      const icon = document.getElementById(iconId);
      if (btn && panel) {
        btn.addEventListener('click', () => {
          panel.classList.toggle('hidden');
          if (icon) icon.classList.toggle('rotate-180');
        });
      }
    });

    // Sync persisted user stats from server on init
    const state = appState.getState();
    if (state.user && state.user.email) {
      try {
        const statsRes = await ApiService.getUserStats(state.user.email);
        if (statsRes.success && statsRes.userStats) {
          appState.setState({
            user: {
              ...state.user,
              ...statsRes.userStats
            }
          }, 'USER_LOGGED_IN');
        }
      } catch (err) {
        console.warn('Failed to sync user stats on load:', err);
      }
    }

    // Fetch initial user history
    this.historyTable.fetchHistory();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new Application();
  app.init();
});
