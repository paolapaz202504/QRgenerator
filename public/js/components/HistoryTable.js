import { UIComponent } from './UIComponent.js';
import { appState } from '../state/AppState.js';
import { ApiService } from '../services/ApiService.js';

export class HistoryTable extends UIComponent {
  constructor() {
    super('history-table-body');
    this.emptyState = document.getElementById('history-empty-state');
    this.totalBadge = document.getElementById('history-total-count');
    this.paginationInfo = document.getElementById('history-pagination-info');
    this.paginationControls = document.getElementById('history-pagination-controls');
    this.searchInput = document.getElementById('history-search-input');
    this.pageSizeSelect = document.getElementById('history-page-size');
    this.btnRefresh = document.getElementById('btn-refresh-history');

    this.previewModal = document.getElementById('qr-preview-modal');
    this.btnClosePreview = document.getElementById('btn-close-preview-modal');
    this.btnCancelPreview = document.getElementById('btn-cancel-preview-modal');

    this.currentPage = 1;
    this.pageSize = 10;
    this.rawHistory = [];
    this.filteredHistory = [];

    appState.subscribe((state, eventKey) => {
      if (['USER_LOGGED_IN', 'HISTORY_UPDATED', 'USER_LOGGED_OUT', 'INIT_DATA'].includes(eventKey)) {
        this.fetchHistory();
      }
    });
  }

  bindEvents() {
    if (this.btnRefresh) {
      this.btnRefresh.addEventListener('click', () => this.fetchHistory());
    }

    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => {
        this.currentPage = 1;
        this.applyFiltersAndRender();
      });
    }

    if (this.pageSizeSelect) {
      this.pageSizeSelect.addEventListener('change', () => {
        this.pageSize = parseInt(this.pageSizeSelect.value, 10);
        this.currentPage = 1;
        this.applyFiltersAndRender();
      });
    }

    [this.btnClosePreview, this.btnCancelPreview].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          if (this.previewModal) this.previewModal.classList.add('hidden');
        });
      }
    });

    if (this.previewModal) {
      this.previewModal.addEventListener('click', (e) => {
        if (e.target === this.previewModal) this.previewModal.classList.add('hidden');
      });
    }

    if (this.container) {
      this.container.addEventListener('click', (e) => {
        const btnLogin = e.target.closest('.btn-trigger-login');
        if (btnLogin) {
          const oauthModal = document.getElementById('oauth-modal');
          if (oauthModal) oauthModal.classList.remove('hidden');
        }
      });
    }
  }

  async fetchHistory() {
    const user = appState.getState().user;
    if (!user || !user.email) {
      this.rawHistory = [];
      this.filteredHistory = [];
      this.currentPage = 1;
      this.applyFiltersAndRender();
      return;
    }

    const email = user.email;
    const res = await ApiService.getUserHistory(email);

    if (res.success && Array.isArray(res.history)) {
      this.rawHistory = res.history;
    } else {
      this.rawHistory = [];
    }

    this.currentPage = 1;
    this.applyFiltersAndRender();
  }

  formatDateWithTimezone(dateStr) {
    if (!dateStr) return 'Fecha no disponible';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      });
    } catch (e) {
      return dateStr;
    }
  }

  applyFiltersAndRender() {
    if (!this.container) return;

    const user = appState.getState().user;

    // Regla de Privacidad y Seguridad (securityAgent & filesAgent):
    // Si no hay sesión iniciada, mostrar bloqueo seguro para evitar fuga de datos
    if (!user || !user.email) {
      this.container.innerHTML = `
        <tr>
          <td colspan="5" class="py-12 text-center">
            <div class="max-w-md mx-auto space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center text-xl mx-auto shadow-2xs">
                <i class="fa-solid fa-lock"></i>
              </div>
              <h4 class="text-sm font-bold text-slate-800">Inicia sesión para ver tu historial privado</h4>
              <p class="text-xs text-slate-500">Tus códigos QR generados se almacenan de forma segura y privada en tu cuenta. Inicia sesión para consultarlos y descargarlos.</p>
              <button type="button" class="btn-trigger-login inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-xs cursor-pointer">
                <i class="fa-solid fa-user-check"></i>
                <span>Iniciar Sesión / Registrarme</span>
              </button>
            </div>
          </td>
        </tr>
      `;
      if (this.totalBadge) this.totalBadge.textContent = `0 Registros`;
      if (this.paginationInfo) this.paginationInfo.textContent = 'Inicia sesión para ver tus registros';
      if (this.paginationControls) this.paginationControls.innerHTML = '';
      return;
    }

    const query = this.searchInput ? this.searchInput.value.trim().toLowerCase() : '';
    if (query) {
      this.filteredHistory = this.rawHistory.filter(item => {
        const titleStr = (item.title || '').toLowerCase();
        const urlStr = (item.url || '').toLowerCase();
        const dateStr = this.formatDateWithTimezone(item.createdAt).toLowerCase();
        return titleStr.includes(query) || urlStr.includes(query) || dateStr.includes(query);
      });
    } else {
      this.filteredHistory = [...this.rawHistory];
    }

    const totalItems = this.filteredHistory.length;
    if (this.totalBadge) this.totalBadge.textContent = `${this.rawHistory.length} Registros`;

    if (totalItems === 0) {
      this.container.innerHTML = `
        <tr>
          <td colspan="5" class="py-10 text-center text-slate-400 text-xs">
            <div class="space-y-1">
              <i class="fa-solid fa-folder-open text-2xl text-slate-300"></i>
              <p class="font-medium text-slate-600">Aún no has generado códigos QR con tu cuenta.</p>
              <p class="text-[11px] text-slate-400">Personaliza un diseño y presiona "Generar código qr" para guardarlo en tu historial.</p>
            </div>
          </td>
        </tr>
      `;
      if (this.paginationInfo) this.paginationInfo.textContent = 'Mostrando 0 a 0 de 0 registros';
      if (this.paginationControls) this.paginationControls.innerHTML = '';
      return;
    }

    if (this.emptyState) this.emptyState.classList.add('hidden');

    const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
    if (this.currentPage > totalPages) this.currentPage = totalPages;
    if (this.currentPage < 1) this.currentPage = 1;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, totalItems);
    const pageItems = this.filteredHistory.slice(startIndex, endIndex);

    this.container.innerHTML = '';
    pageItems.forEach(item => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';

      const qrImageSrc = item.imageDataUrl || item.imagePath || ('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(item.url));
      const formattedDate = this.formatDateWithTimezone(item.createdAt);
      const cleanTitle = (item.title || 'codigo_qr').replace(/[^a-zA-Z0-9_-]/g, '_');

      tr.innerHTML = `
        <td class="py-3 px-4">
          <div class="btn-preview-qr cursor-pointer w-14 h-14 bg-white rounded-xl p-1 flex items-center justify-center border border-slate-200 shadow-xs hover:scale-105 transition transform" title="Haz clic para ver la vista ampliada">
            <img src="${qrImageSrc}" alt="QR Miniatura" class="max-h-full max-w-full object-contain rounded">
          </div>
        </td>
        <td class="py-3 px-4 font-bold text-slate-900">
          <div class="truncate max-w-[220px]" title="${item.title || 'Código QR'}">${item.title || 'Código QR'}</div>
          <span class="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 mt-1 inline-block">${(item.format || 'png').toUpperCase()} • ${item.resolution || 800}px</span>
        </td>
        <td class="py-3 px-4 text-slate-600">
          <a href="${item.url}" target="_blank" class="text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 truncate max-w-[240px]" title="${item.url}">
            <i class="fa-solid fa-link text-[10px]"></i>
            <span class="truncate">${item.url}</span>
          </a>
        </td>
        <td class="py-3 px-4 text-slate-600 font-mono text-[11px]">
          <span class="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">${formattedDate}</span>
        </td>
        <td class="py-3 px-4 text-center">
          <div class="flex items-center justify-center gap-1.5">
            <button type="button" class="btn-preview-qr bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2.5 py-1.5 rounded-xl font-semibold transition inline-flex items-center gap-1 text-[11px]" title="Ver Vista Ampliada Modal">
              <i class="fa-solid fa-expand text-indigo-600"></i>
              <span class="hidden sm:inline">Ver</span>
            </button>
            <a href="${qrImageSrc}" download="QR_${cleanTitle}.png" class="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-xl font-semibold transition inline-flex items-center gap-1 text-[11px] shadow-xs" title="Descargar nuevamente este Código QR">
              <i class="fa-solid fa-download"></i>
            </a>
          </div>
        </td>
      `;

      tr.querySelectorAll('.btn-preview-qr').forEach(el => {
        el.addEventListener('click', () => this.openPreviewModal(item));
      });

      this.container.appendChild(tr);
    });

    if (this.paginationInfo) {
      this.paginationInfo.textContent = `Mostrando ${startIndex + 1} a ${endIndex} de ${totalItems} registros (Página ${this.currentPage} de ${totalPages})`;
    }

    this.renderPaginationControls(totalPages);
  }

  renderPaginationControls(totalPages) {
    if (!this.paginationControls) return;
    this.paginationControls.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.disabled = (this.currentPage === 1);
    prevBtn.className = `px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
      this.currentPage === 1
        ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
        : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
    }`;
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left mr-1"></i> Ant';
    prevBtn.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.applyFiltersAndRender();
      }
    });
    this.paginationControls.appendChild(prevBtn);

    for (let p = 1; p <= totalPages; p++) {
      if (totalPages > 7 && Math.abs(p - this.currentPage) > 2 && p !== 1 && p !== totalPages) {
        if (p === 2 || p === totalPages - 1) {
          const dots = document.createElement('span');
          dots.className = 'px-1 text-slate-400';
          dots.textContent = '...';
          this.paginationControls.appendChild(dots);
        }
        continue;
      }

      const pBtn = document.createElement('button');
      pBtn.type = 'button';
      pBtn.className = `px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
        p === this.currentPage
          ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs font-bold'
          : 'bg-white border-slate-300 text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
      }`;
      pBtn.textContent = p;
      pBtn.addEventListener('click', () => {
        this.currentPage = p;
        this.applyFiltersAndRender();
      });
      this.paginationControls.appendChild(pBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.disabled = (this.currentPage === totalPages);
    nextBtn.className = `px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
      this.currentPage === totalPages
        ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
        : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
    }`;
    nextBtn.innerHTML = 'Sig <i class="fa-solid fa-chevron-right ml-1"></i>';
    nextBtn.addEventListener('click', () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.applyFiltersAndRender();
      }
    });
    this.paginationControls.appendChild(nextBtn);
  }

  openPreviewModal(item) {
    if (!this.previewModal) return;
    const titleEl = document.getElementById('preview-modal-title');
    const dateEl = document.getElementById('preview-modal-date');
    const imgEl = document.getElementById('preview-modal-img');
    const linkEl = document.getElementById('preview-modal-link');
    const linkTextEl = document.getElementById('preview-modal-link-text');
    const downloadBtn = document.getElementById('preview-modal-download-btn');

    const qrImageSrc = item.imageDataUrl || item.imagePath || ('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(item.url));
    const formattedDate = this.formatDateWithTimezone(item.createdAt);
    const cleanTitle = (item.title || 'codigo_qr').replace(/[^a-zA-Z0-9_-]/g, '_');

    if (titleEl) titleEl.textContent = item.title || 'Código QR';
    if (dateEl) dateEl.textContent = formattedDate;
    if (imgEl) imgEl.src = qrImageSrc;
    if (linkEl) linkEl.href = item.url || '#';
    if (linkTextEl) linkTextEl.textContent = item.url || '';
    if (downloadBtn) {
      downloadBtn.href = qrImageSrc;
      downloadBtn.download = `QR_${cleanTitle}.png`;
    }

    this.previewModal.classList.remove('hidden');
  }
}
