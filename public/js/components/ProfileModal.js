import { UIComponent } from './UIComponent.js';
import { appState } from '../state/AppState.js';

export class ProfileModal extends UIComponent {
  constructor() {
    super('user-profile-modal');

    this.btnOpenProfile = document.getElementById('btn-open-profile');
    this.userAvatarHeader = document.getElementById('user-avatar');
    this.userNameHeader = document.getElementById('user-name');

    this.btnCloseProfile = document.getElementById('btn-close-profile-modal');
    this.btnProfileChangePlan = document.getElementById('btn-profile-change-plan');
    this.btnProfileLogout = document.getElementById('btn-profile-logout');

    this.profileAvatar = document.getElementById('profile-modal-avatar');
    this.profileName = document.getElementById('profile-modal-name');
    this.profileEmail = document.getElementById('profile-modal-email');
    this.profilePlan = document.getElementById('profile-modal-plan');
    this.profileExpiration = document.getElementById('profile-modal-expiration');
    this.profileCredits = document.getElementById('profile-modal-credits');
    this.profileDownloads = document.getElementById('profile-modal-downloads');
    this.profileProvider = document.getElementById('profile-modal-provider');

    appState.subscribe((state, eventKey) => {
      if (['USER_LOGGED_IN', 'USER_LOGGED_OUT', 'PLAN_UPDATED', 'DOWNLOAD_TRACKED', 'CREDIT_USED', 'INIT_DATA'].includes(eventKey)) {
        this.renderProfile(state.user);
      }
    });
  }

  bindEvents() {
    [this.btnOpenProfile, this.userAvatarHeader, this.userNameHeader].forEach(el => {
      if (el) {
        el.addEventListener('click', () => {
          const user = appState.getState().user;
          if (user && user.email) {
            this.renderProfile(user);
            if (this.container) this.container.classList.remove('hidden');
          } else {
            const oauthModal = document.getElementById('oauth-modal');
            if (oauthModal) oauthModal.classList.remove('hidden');
          }
        });
      }
    });

    if (this.btnCloseProfile) {
      this.btnCloseProfile.addEventListener('click', () => {
        if (this.container) this.container.classList.add('hidden');
      });
    }

    if (this.btnProfileChangePlan) {
      this.btnProfileChangePlan.addEventListener('click', () => {
        if (this.container) this.container.classList.add('hidden');
        const planModal = document.getElementById('plan-modal');
        if (planModal) planModal.classList.remove('hidden');
      });
    }

    if (this.btnProfileLogout) {
      this.btnProfileLogout.addEventListener('click', () => {
        if (this.container) this.container.classList.add('hidden');
        appState.setState({ user: null }, 'USER_LOGGED_OUT');
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
      if (planKey === 'free' || !user.expirationDate) {
        this.profileExpiration.textContent = 'Sin vencimiento (Permanente)';
        this.profileExpiration.className = 'text-xs font-mono font-bold text-emerald-400';
      } else {
        const expDate = new Date(user.expirationDate);
        const formattedDate = expDate.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
        this.profileExpiration.textContent = `${formattedDate} (${user.planDurationMonths || 1} mes/es)`;
        this.profileExpiration.className = 'text-xs font-mono font-bold text-cyan-300';
      }
    }

    // Credits & Downloads
    const genUsed = user.generationsCount || user.creditsUsed || 0;
    const genMax = (user.maxCredits >= 999999 || planKey === 'pro' || planKey === 'corporate') ? '∞' : (user.maxCredits || 200);
    const dlUsed = user.downloadsCount || 0;
    const dlMax = (user.maxDownloads >= 999999 || planKey === 'corporate') ? '∞' : (user.maxDownloads || 20);

    if (this.profileCredits) {
      this.profileCredits.textContent = `${genUsed} / ${genMax} Créditos`;
    }
    if (this.profileDownloads) {
      this.profileDownloads.textContent = `${dlUsed} / ${dlMax} QRs`;
    }
    if (this.profileProvider) {
      this.profileProvider.textContent = user.provider || 'Google OAuth 2.0';
    }
  }

  render() {
    this.renderProfile(appState.getState().user);
  }
}
