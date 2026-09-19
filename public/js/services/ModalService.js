/**
 * ModalService - Reusable custom modal dialog manager for Alerts and Confirmations.
 * Follows Single Responsibility Principle (SOLID) and replaces default browser popups.
 */
export class ModalService {
  /**
   * Display a custom confirmation modal dialog.
   * @param {Object} options
   * @param {string} options.title - Header title
   * @param {string} options.message - Message body text
   * @param {string} [options.icon] - FontAwesome icon class
   * @param {string} [options.confirmText] - Confirm button label
   * @param {string} [options.cancelText] - Cancel button label
   * @param {string} [options.type] - 'danger' | 'warning' | 'info'
   * @returns {Promise<boolean>} Resolves true if confirmed, false if cancelled.
   */
  static confirm({
    title = '¿Confirmar Acción?',
    message = '¿Estás seguro de que deseas realizar esta acción?',
    icon = 'fa-triangle-exclamation',
    confirmText = 'Sí, Confirmar',
    cancelText = 'Cancelar',
    type = 'danger'
  } = {}) {
    return new Promise((resolve) => {
      const modal = document.getElementById('confirmation-modal');
      const titleEl = document.getElementById('confirm-modal-title');
      const msgEl = document.getElementById('confirm-modal-message');
      const iconEl = document.getElementById('confirm-modal-icon');
      const btnConfirm = document.getElementById('btn-confirm-action');
      const btnCancel = document.getElementById('btn-cancel-action');
      const btnClose = document.getElementById('btn-close-confirmation-modal');

      if (!modal) {
        return resolve(window.confirm(message));
      }

      if (titleEl) titleEl.textContent = title;
      if (msgEl) msgEl.textContent = message;
      if (iconEl) iconEl.className = `fa-solid ${icon}`;

      if (btnConfirm) {
        const iconHtml = type === 'danger' ? '<i class="fa-solid fa-trash-can"></i>' : '<i class="fa-solid fa-check"></i>';
        btnConfirm.innerHTML = `${iconHtml} <span>${confirmText}</span>`;
        if (type === 'danger') {
          btnConfirm.className = 'w-full sm:flex-1 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition transform active:scale-95';
        } else {
          btnConfirm.className = 'w-full sm:flex-1 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition transform active:scale-95';
        }
      }

      if (btnCancel) {
        btnCancel.innerHTML = `<i class="fa-solid fa-xmark"></i> <span>${cancelText}</span>`;
      }

      const cleanup = () => {
        modal.classList.add('hidden');
        if (btnConfirm) btnConfirm.removeEventListener('click', onConfirm);
        if (btnCancel) btnCancel.removeEventListener('click', onCancel);
        if (btnClose) btnClose.removeEventListener('click', onCancel);
      };

      const onConfirm = () => {
        cleanup();
        resolve(true);
      };

      const onCancel = () => {
        cleanup();
        resolve(false);
      };

      if (btnConfirm) btnConfirm.addEventListener('click', onConfirm, { once: true });
      if (btnCancel) btnCancel.addEventListener('click', onCancel, { once: true });
      if (btnClose) btnClose.addEventListener('click', onCancel, { once: true });

      modal.classList.remove('hidden');
    });
  }

  /**
   * Display a custom alert modal dialog.
   * @param {Object} options
   * @param {string} options.title - Header title
   * @param {string} options.message - Message body text
   * @param {string} [options.icon] - FontAwesome icon class
   * @param {string} [options.buttonText] - Button label
   * @param {string} [options.type] - 'info' | 'success' | 'warning' | 'error'
   * @returns {Promise<void>} Resolves when user dismisses the alert.
   */
  static alert({
    title = 'Atención',
    message = '',
    icon = null,
    buttonText = 'Entendido',
    type = 'info'
  } = {}) {
    return new Promise((resolve) => {
      const modal = document.getElementById('alert-modal');
      const titleEl = document.getElementById('alert-modal-title');
      const msgEl = document.getElementById('alert-modal-message');
      const iconEl = document.getElementById('alert-modal-icon');
      const iconContainer = document.getElementById('alert-modal-icon-container');
      const btnAccept = document.getElementById('btn-alert-accept');
      const btnClose = document.getElementById('btn-close-alert-modal');

      if (!modal) {
        window.alert(message);
        return resolve();
      }

      if (titleEl) titleEl.textContent = title;
      if (msgEl) msgEl.textContent = message;

      const typeConfigs = {
        success: { icon: 'fa-circle-check', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/10' },
        warning: { icon: 'fa-triangle-exclamation', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30 shadow-amber-500/10' },
        error: { icon: 'fa-circle-xmark', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30 shadow-rose-500/10' },
        info: { icon: 'fa-circle-info', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30 shadow-indigo-500/10' }
      };

      const cfg = typeConfigs[type] || typeConfigs.info;
      const selectedIcon = icon || cfg.icon;

      if (iconEl) iconEl.className = `fa-solid ${selectedIcon} ${cfg.color}`;
      if (iconContainer) iconContainer.className = `w-16 h-16 rounded-2xl border flex items-center justify-center text-3xl mx-auto shadow-lg ${cfg.bg}`;

      if (btnAccept) {
        btnAccept.innerHTML = `<i class="fa-solid fa-check"></i> <span>${buttonText}</span>`;
      }

      const cleanup = () => {
        modal.classList.add('hidden');
        if (btnAccept) btnAccept.removeEventListener('click', onAccept);
        if (btnClose) btnClose.removeEventListener('click', onAccept);
      };

      const onAccept = () => {
        cleanup();
        resolve();
      };

      if (btnAccept) btnAccept.addEventListener('click', onAccept, { once: true });
      if (btnClose) btnClose.addEventListener('click', onAccept, { once: true });

      modal.classList.remove('hidden');
    });
  }
}
