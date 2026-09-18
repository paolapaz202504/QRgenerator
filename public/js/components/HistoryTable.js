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
      if (eventKey === 'USER_LOGGED_IN' || eventKey === 'HISTORY_UPDATED') {
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
  }

  async fetchHistory() {
    const user = appState.getState().user;
    const email = user ? user.email : null;
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
      this.container.innerHTML = '';
      if (this.emptyState) this.emptyState.classList.remove('hidden');
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
      tr.className = 'hover:bg-slate-900/60 transition border-b border-slate-800/40';

      const qrImageSrc = item.imageDataUrl || item.imagePath || ('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(item.url));
      const formattedDate = this.formatDateWithTimezone(item.createdAt);
      const cleanTitle = (item.title || 'codigo_qr').replace(/[^a-zA-Z0-9_-]/g, '_');

      tr.innerHTML = `
        <td class="py-3 px-4">
          <div class="btn-preview-qr cursor-pointer w-14 h-14 bg-white rounded-xl p-1 flex items-center justify-center border border-slate-700/60 shadow-sm hover:scale-105 transition transform" title="Haz clic para ver la vista ampliada">
            <img src="${qrImageSrc}" alt="QR Miniatura" class="max-h-full max-w-full object-contain rounded">
          </div>
        </td>
        <td class="py-3 px-4 font-semibold text-slate-100">
          <div class="truncate max-w-[220px]" title="${item.title || 'Código QR'}">${item.title || 'Código QR'}</div>
          <span class="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 mt-1 inline-block">${(item.format || 'png').toUpperCase()} • ${item.resolution || 800}px</span>
        </td>
        <td class="py-3 px-4 text-slate-300">
          <a href="${item.url}" target="_blank" class="text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-1 truncate max-w-[240px]" title="${item.url}">
            <i class="fa-solid fa-link text-[10px]"></i>
            <span class="truncate">${item.url}</span>
          </a>
        </td>
        <td class="py-3 px-4 text-slate-400 font-mono text-[11px]">
          ${formattedDate}
        </td>
        <td class="py-3 px-4 text-center">
          <div class="flex items-center justify-center gap-1.5">
            <button type="button" class="btn-preview-qr bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 hover:border-indigo-500 px-2.5 py-1.5 rounded-xl font-semibold transition inline-flex items-center gap-1 text-[11px]" title="Ver Vista Ampliada Modal">
              <i class="fa-solid fa-expand"></i>
              <span class="hidden sm:inline">Ver</span>
            </button>
            <a href="${qrImageSrc}" download="QR_${cleanTitle}.png" class="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-500 px-2.5 py-1.5 rounded-xl font-semibold transition inline-flex items-center gap-1 text-[11px]" title="Descargar nuevamente este Código QR">
              <i class="fa-solid fa-download text-emerald-400"></i>
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
        ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500'
        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
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
          dots.className = 'px-1 text-slate-500';
          dots.textContent = '...';
          this.paginationControls.appendChild(dots);
        }
        continue;
      }

      const pBtn = document.createElement('button');
      pBtn.type = 'button';
      pBtn.className = `px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
        p === this.currentPage
          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md font-bold'
          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
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
        ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500'
        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
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
