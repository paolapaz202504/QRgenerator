import { ComponentLoader } from './ComponentLoader.js';
import { appState } from './state/AppState.js';
import { ApiService } from './services/ApiService.js';
import { DesignPicker } from './components/DesignPicker.js';
import { IconPicker } from './components/IconPicker.js';
import { ColorCustomizer } from './components/ColorCustomizer.js';
import { HistoryTable } from './components/HistoryTable.js';
import { UserModal } from './components/UserModal.js';
import { QRPreview } from './components/QRPreview.js';

class Application {
  async init() {
    console.log('🚀 Inicializando QR Studio Pro Frontend Architecture...');

    // 1. Load modularized HTML component partials from ./html/
    await ComponentLoader.loadComponents();

    // 2. Instantiate and mount UI Component controllers after DOM is populated
    this.designPicker = new DesignPicker();
    this.iconPicker = new IconPicker();
    this.colorCustomizer = new ColorCustomizer();
    this.historyTable = new HistoryTable();
    this.userModal = new UserModal();
    this.qrPreview = new QRPreview();

    // Wait for document fonts if available
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // Mount UI Components
    this.designPicker.mount();
    this.iconPicker.mount();
    this.colorCustomizer.mount();
    this.historyTable.mount();
    this.userModal.mount();
    this.qrPreview.mount();

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

    // Fetch initial user history
    this.historyTable.fetchHistory();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new Application();
  app.init();
});
