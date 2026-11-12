import { UIComponent } from './UIComponent.js';
import { appState } from '../state/AppState.js';

export class ProfileModal extends UIComponent {
  constructor() {
    super('user-profile-modal');
    this.initElements();

    appState.subscribe((state, eventKey) => {
      if (['USER_LOGGED_IN', 'USER_LOGGED_OUT', 'PLAN_UPDATED', 'DOWNLOAD_TRACKED', 'CREDIT_USED', 'INIT_DATA'].includes(eventKey)) {
        this.renderProfile(state.user);
      }
    });
  }

  initElements() {
    if (!this.container) this.container = document.getElementById('user-profile-modal');
    if (!this.btnOpenProfile) this.btnOpenProfile = document.getElementById('btn-open-profile');
    if (!this.userProfileWidget) this.userProfileWidget = document.getElementById('user-profile-widget');
    if (!this.userAvatarHeader) this.userAvatarHeader = document.getElementById('user-avatar');
    if (!this.userNameHeader) this.userNameHeader = document.getElementById('user-name');

    if (!this.btnCloseProfile) this.btnCloseProfile = document.getElementById('btn-close-profile-modal');
    if (!this.btnProfileChangePlan) this.btnProfileChangePlan = document.getElementById('btn-profile-change-plan');
    if (!this.btnProfileLogout) this.btnProfileLogout = document.getElementById('btn-profile-logout');

    if (!this.profileAvatar) this.profileAvatar = document.getElementById('profile-modal-avatar');
    if (!this.profileName) this.profileName = document.getElementById('profile-modal-name');
    if (!this.profileEmail) this.profileEmail = document.getElementById('profile-modal-email');
    if (!this.profilePlan) this.profilePlan = document.getElementById('profile-modal-plan');
    if (!this.profileExpiration) this.profileExpiration = document.getElementById('profile-modal-expiration');
    if (!this.profileCredits) this.profileCredits = document.getElementById('profile-modal-credits');
    if (!this.profileDownloads) this.profileDownloads = document.getElementById('profile-modal-downloads');
    if (!this.profileProvider) this.profileProvider = document.getElementById('profile-modal-provider');
  }

  async openModal() {
    this.initElements();
    const state = appState.getState();
    const currentUser = state.user || (() => {
      try {
        const saved = localStorage.getItem('oauth_user');
        return saved ? JSON.parse(saved) : null;
      } catch (e) {
        return null;
      }
    })();

    if (currentUser && (currentUser.email || currentUser.name)) {
      if (currentUser.email) {
        try {
          const { ApiService } = await import('../services/ApiService.js');
          const res = await ApiService.getUserStats(currentUser.email);
          if (res && res.success && res.userStats) {
            const updated = { ...currentUser, ...res.userStats };
            appState.setState({ user: updated }, 'PLAN_UPDATED');
            try {
              localStorage.setItem('oauth_user', JSON.stringify(updated));
            } catch (e) {}
          }
        } catch (e) {
          console.warn('[ProfileModal] Error refrescando perfil desde servidor:', e);
        }
      }
      this.renderProfile(appState.getState().user || currentUser);
      if (this.container) {
        this.container.classList.remove('hidden');
      }
    } else {
      const oauthModal = document.getElementById('oauth-modal');
      if (oauthModal) {
        oauthModal.classList.remove('hidden');
      } else if (window.userModalInstance && typeof window.userModalInstance.openModal === 'function') {
        window.userModalInstance.openModal();
      }
    }
  }

  closeModal() {
    this.initElements();
    if (this.container) {
      this.container.classList.add('hidden');
    }
  }

  bindEvents() {
    this.initElements();

    [this.btnOpenProfile, this.userProfileWidget, this.userAvatarHeader, this.userNameHeader].forEach(el => {
      if (el) {
        el.addEventListener('click', async (e) => {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          await this.openModal();
        });
      }
    });

    if (this.btnCloseProfile) {
      this.btnCloseProfile.addEventListener('click', (e) => {
        if (e) e.preventDefault();
        this.closeModal();
      });
    }

    if (this.container) {
      this.container.addEventListener('click', (e) => {
        if (e.target === this.container) {
          this.closeModal();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.container && !this.container.classList.contains('hidden')) {
        this.closeModal();
      }
    });

    if (this.btnProfileChangePlan) {
      this.btnProfileChangePlan.addEventListener('click', (e) => {
        if (e) e.preventDefault();
        this.closeModal();
        if (window.planModalInstance && typeof window.planModalInstance.openModal === 'function') {
          window.planModalInstance.openModal();
        } else {
          const planModal = document.getElementById('plan-modal');
          if (planModal) planModal.classList.remove('hidden');
        }
      });
    }

    if (this.btnProfileLogout) {
      this.btnProfileLogout.addEventListener('click', async (e) => {
        if (e) e.preventDefault();
        const { ModalService } = await import('../services/ModalService.js');
        const confirmed = await ModalService.confirm({
          title: '¿Cerrar Sesión?',
          message: '¿Estás seguro de que deseas cerrar tu sesión en QRbey?',
          icon: 'fa-right-from-bracket',
          confirmText: 'Sí, Cerrar Sesión',
          cancelText: 'Cancelar',
          type: 'danger'
        });
        if (confirmed) {
          this.closeModal();
          appState.setState({ user: null }, 'USER_LOGGED_OUT');
        }
      });
    }
  }

  renderProfile(user) {
    if (!user) return;

    if (this.profileAvatar) {
      this.profileAvatar.src = user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`;
    }
    if (this.profileName) {
      this.profileName.textContent = user.name || user.email.split('@')[0];
    }
    if (this.profileEmail) {
      this.profileEmail.textContent = user.email;
    }

    // Plan styling and text
    const planKey = (user.plan || 'free').toLowerCase();
    const planNames = { free: 'Plan Gratuito', pro: 'Plan Profesional', corporate: 'Plan Corporativo' };
    const planClasses = {
      free: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      pro: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
      corporate: 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
    };

    if (this.profilePlan) {
      this.profilePlan.textContent = planNames[planKey] || planKey.toUpperCase();
      this.profilePlan.className = `text-xs font-bold font-mono px-2.5 py-0.5 rounded-full ${planClasses[planKey] || planClasses.free}`;
    }

    // Expiration date
    if (this.profileExpiration) {
      if (planKey === 'free') {
        this.profileExpiration.textContent = 'Sin vencimiento (Permanente)';
        this.profileExpiration.className = 'text-xs font-mono font-bold text-emerald-600';
      } else {
        const now = new Date();
        let expDate = user.expirationDate ? new Date(user.expirationDate) : null;
        if (!expDate || isNaN(expDate.getTime()) || expDate <= now) {
          const months = parseInt(user.planDurationMonths || 1, 10);
          expDate = new Date(now);
          expDate.setMonth(expDate.getMonth() + (isNaN(months) || months < 1 ? 1 : months));
        }

        const formattedDate = expDate.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
        this.profileExpiration.textContent = `${formattedDate} (${user.planDurationMonths || 1} mes/es)`;
        this.profileExpiration.className = 'text-xs font-mono font-bold text-indigo-700';
      }
    }

    // Credits & Downloads from .env via AppState Single Source of Truth
    const planConfig = appState.getPlanConfig(planKey);
    const maxCredits = user.maxCredits || planConfig.maxCredits;
    const maxDownloads = user.maxDownloads || planConfig.maxDownloads;

    const creditsUsed = user.creditsUsed || 0;
    const qrUsed = user.generationsCount || 0;

    if (this.profileCredits) {
      this.profileCredits.textContent = `${creditsUsed} / ${maxCredits} Créditos`;
    }
    if (this.profileDownloads) {
      this.profileDownloads.textContent = `${qrUsed} / ${maxDownloads} QRs`;
    }
    if (this.profileProvider) {
      this.profileProvider.textContent = user.provider || 'Google OAuth 2.0';
    }
  }

  render() {
    this.renderProfile(appState.getState().user);
  }
}
