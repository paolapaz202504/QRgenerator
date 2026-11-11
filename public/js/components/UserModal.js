import { UIComponent } from './UIComponent.js';
import { appState } from '../state/AppState.js';
import { ApiService } from '../services/ApiService.js';

export class UserModal extends UIComponent {
  constructor() {
    super('oauth-modal');
    this.btnOpenOAuth = document.getElementById('btn-open-oauth');
    this.btnCloseOAuth = document.getElementById('btn-close-oauth');
    this.userWidget = document.getElementById('user-profile-widget');
    this.userAvatar = document.getElementById('user-avatar');
    this.userName = document.getElementById('user-name');
    this.userDownloadCounter = document.getElementById('user-download-counter');
    this.userCreditCounter = document.getElementById('user-credit-counter');
    this.creditCounterBadge = document.getElementById('credit-counter-badge');
    this.btnLogout = document.getElementById('btn-logout');

    this.authForm = document.getElementById('auth-universal-form');
    this.emailInput = document.getElementById('auth-email-input');
    this.nameInput = document.getElementById('auth-name-input');
    this.statusBanner = document.getElementById('oauth-status-banner');
    this.statusText = document.getElementById('oauth-status-text');
    this.authAlert = document.getElementById('oauth-auth-required-alert');

    appState.subscribe((state, eventKey) => {
      if (['USER_LOGGED_IN', 'USER_LOGGED_OUT', 'DOWNLOAD_TRACKED', 'CREDIT_USED', 'PLAN_UPDATED', 'INIT_DATA'].includes(eventKey)) {
        this.updateWidget(state.user);
      }
    });
  }

  bindEvents() {
    if (this.btnOpenOAuth) {
      this.btnOpenOAuth.addEventListener('click', () => {
        if (this.container) {
          if (this.authAlert) this.authAlert.classList.add('hidden');
          if (this.statusBanner) this.statusBanner.classList.add('hidden');
          this.container.classList.remove('hidden');
          if (this.emailInput) setTimeout(() => this.emailInput.focus(), 100);
        }
      });
    }

    if (this.btnCloseOAuth) {
      this.btnCloseOAuth.addEventListener('click', () => {
        if (this.container) this.container.classList.add('hidden');
        if (this.authAlert) this.authAlert.classList.add('hidden');
        if (this.statusBanner) this.statusBanner.classList.add('hidden');
      });
    }

    if (this.btnLogout) {
      this.btnLogout.addEventListener('click', () => {
        appState.setState({ user: null }, 'USER_LOGGED_OUT');
      });
    }

    // Manejo del formulario universal de correo electrónico (Gmail, Hotmail, Yahoo, etc.)
    if (this.authForm) {
      this.authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rawEmail = this.emailInput ? this.emailInput.value.trim() : '';
        const rawName = this.nameInput ? this.nameInput.value.trim() : '';

        if (!rawEmail || !rawEmail.includes('@') || !rawEmail.includes('.')) {
          alert('Por favor, ingresa un correo electrónico válido (ej: tu-nombre@gmail.com, hotmail.com, yahoo.com).');
          if (this.emailInput) this.emailInput.focus();
          return;
        }

        const domain = rawEmail.split('@')[1].toLowerCase();
        let provider = 'Correo / Registro';
        if (domain.includes('gmail')) provider = 'Google / Gmail';
        else if (domain.includes('hotmail') || domain.includes('outlook') || domain.includes('live')) provider = 'Microsoft / Hotmail';
        else if (domain.includes('yahoo')) provider = 'Yahoo Mail';

        await this.executeLogin(provider, rawEmail, rawName);
      });
    }

    // Botones rápidos por proveedor (Gmail, Hotmail, Yahoo)
    document.querySelectorAll('.quick-provider-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const domain = btn.dataset.domain || 'gmail.com';
        const providerName = btn.title || btn.dataset.provider;

        let currentVal = this.emailInput ? this.emailInput.value.trim() : '';
        if (currentVal && !currentVal.includes('@')) {
          this.emailInput.value = `${currentVal}@${domain}`;
          currentVal = this.emailInput.value;
        }

        if (currentVal && currentVal.includes('@')) {
          const rawName = this.nameInput ? this.nameInput.value.trim() : '';
          await this.executeLogin(providerName, currentVal, rawName);
        } else {
          if (this.emailInput) {
            this.emailInput.placeholder = `Escribe tu usuario@${domain}`;
            this.emailInput.focus();
          }
        }
      });
    });
  }

  async executeLogin(provider, email, name) {
    if (this.statusBanner) this.statusBanner.classList.remove('hidden');
    if (this.statusText) this.statusText.textContent = `Iniciando sesión con ${email}...`;

    try {
      const res = await ApiService.oauthLogin(provider, email, name);
      if (res.success && res.user) {
        appState.setState({ user: res.user }, 'USER_LOGGED_IN');
        if (this.container) this.container.classList.add('hidden');
        if (this.authAlert) this.authAlert.classList.add('hidden');
        if (this.statusBanner) this.statusBanner.classList.add('hidden');

        // Notificación de éxito
        console.log(`[Auth] Sesión iniciada con éxito para ${res.user.email} (${res.user.plan})`);
      } else {
        alert(res.error || 'No se pudo iniciar sesión con las credenciales provistas.');
        if (this.statusBanner) this.statusBanner.classList.add('hidden');
      }
    } catch (err) {
      console.error('[Auth Error]:', err);
      alert('Error de conexión al procesar el inicio de sesión.');
      if (this.statusBanner) this.statusBanner.classList.add('hidden');
    }
  }

  updateWidget(user) {
    if (!this.userWidget) return;
    if (user) {
      this.userWidget.classList.remove('hidden');
      if (this.btnOpenOAuth) this.btnOpenOAuth.classList.add('hidden');
      if (this.userName) this.userName.textContent = user.name || user.email.split('@')[0];
      if (this.userAvatar) this.userAvatar.src = user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`;
      
      const planKey = user.plan || 'free';
      const defaultMaxCredits = planKey === 'corporate' ? 999999 : (planKey === 'pro' ? 2000 : 50);
      const defaultMaxDownloads = planKey === 'corporate' ? 999999 : (planKey === 'pro' ? 500 : 15);

      const creditsUsed = user.creditsUsed || 0;
      const genMax = (user.maxCredits >= 999999 || planKey === 'corporate') ? '∞' : (user.maxCredits || defaultMaxCredits);
      const qrUsed = user.generationsCount || 0;
      const dlMax = (user.maxDownloads >= 999999 || planKey === 'corporate') ? '∞' : (user.maxDownloads || defaultMaxDownloads);

      const planBadge = document.getElementById('user-plan-badge');
      if (planBadge) {
        if (planKey === 'corporate') {
          planBadge.textContent = 'Corporativo';
          planBadge.className = 'bg-purple-100 text-purple-800 border border-purple-300 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider';
        } else if (planKey === 'pro') {
          planBadge.textContent = 'Pro / Creadores';
          planBadge.className = 'bg-indigo-100 text-indigo-800 border border-indigo-300 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider';
        } else {
          planBadge.textContent = 'Gratuito';
          planBadge.className = 'bg-slate-200 text-slate-700 border border-slate-300 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider';
        }
      }

      if (this.userCreditCounter) {
        this.userCreditCounter.textContent = `${creditsUsed}/${genMax} Créditos`;
      }
      if (this.userDownloadCounter) {
        this.userDownloadCounter.textContent = `${qrUsed}/${dlMax} QRs`;
      }
      if (this.creditCounterBadge) {
        this.creditCounterBadge.textContent = `${creditsUsed}/${genMax} Créditos`;
      }
    } else {
      this.userWidget.classList.add('hidden');
      if (this.btnOpenOAuth) this.btnOpenOAuth.classList.remove('hidden');

      // Update standalone credit counter badge for guest user
      if (this.creditCounterBadge) {
        this.creditCounterBadge.textContent = `0/50 Créditos`;
      }
    }
  }

  render() {
    this.updateWidget(appState.getState().user);
  }
}
