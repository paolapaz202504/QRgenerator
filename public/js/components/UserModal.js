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

    this.stepProviders = document.getElementById('oauth-step-providers');
    this.statusBanner = document.getElementById('oauth-status-banner');
    this.statusText = document.getElementById('oauth-status-text');
    this.authAlert = document.getElementById('oauth-auth-required-alert');

    this.activeProvider = null;
    this.googleClientId = '773396023366-n7pb1c3f91pvlk8m7s175u0291ouinf3.apps.googleusercontent.com';
    this.popupPollInterval = null;

    appState.subscribe((state, eventKey) => {
      if (['USER_LOGGED_IN', 'USER_LOGGED_OUT', 'DOWNLOAD_TRACKED', 'CREDIT_USED', 'PLAN_UPDATED', 'INIT_DATA'].includes(eventKey)) {
        this.updateWidget(state.user);
      }
    });

    this.setupPopupListeners();
    this.initGoogleConfig();
  }

  async initGoogleConfig() {
    try {
      const res = await ApiService.getConfig();
      if (res && res.googleClientId) {
        this.googleClientId = res.googleClientId;
      }
    } catch (e) {}
  }

  setupPopupListeners() {
    // 1. Comunicación por mensaje entre ventanas (postMessage)
    window.addEventListener('message', async (event) => {
      if (event.data && event.data.type === 'QRBEY_OAUTH_SUCCESS') {
        if (event.data.user) {
          this.onAuthCompleted(event.data.user, event.data.provider);
        } else if (event.data.email) {
          await this.executeLogin(event.data.provider || 'OAuth 2.0', event.data.email, event.data.name);
        }
      }
    });

    // 2. Callback directo expuesto a la ventana emergente
    window.handleOAuthSuccess = async (data) => {
      if (data && data.user) {
        this.onAuthCompleted(data.user, data.provider);
      } else if (data && data.email) {
        await this.executeLogin(data.provider || 'OAuth 2.0', data.email, data.name);
      }
    };

    // 3. Fallback de sincronización vía storage (para navegadores móviles que desvinculan opener)
    window.addEventListener('storage', async (event) => {
      if (event.key === 'qrbey_pending_oauth' && event.newValue) {
        try {
          const authData = JSON.parse(event.newValue);
          localStorage.removeItem('qrbey_pending_oauth');
          if (authData && authData.user) {
            this.onAuthCompleted(authData.user, authData.provider);
          } else if (authData && authData.email) {
            await this.executeLogin(authData.provider || 'OAuth 2.0', authData.email, authData.name);
          }
        } catch (e) {}
      }
    });
  }

  onAuthCompleted(user, provider) {
    if (this.popupPollInterval) {
      clearInterval(this.popupPollInterval);
      this.popupPollInterval = null;
    }
    this.saveKnownAccount({ email: user.email, name: user.name, provider: provider || user.provider });
    appState.setState({ user }, 'USER_LOGGED_IN');
    this.closeModal();
    console.log(`✅ [OAuth 2.0] Sesión iniciada con éxito: ${user.email} (${user.plan})`);
  }

  getKnownAccounts() {
    try {
      const raw = localStorage.getItem('qrbey_known_accounts');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [
      { email: 'paolapaz202504@gmail.com', name: 'Paola Paz', provider: 'google' }
    ];
  }

  saveKnownAccount(account) {
    try {
      const accounts = this.getKnownAccounts();
      const existing = accounts.find(a => a.email.toLowerCase() === account.email.toLowerCase());
      if (!existing) {
        accounts.unshift(account);
        localStorage.setItem('qrbey_known_accounts', JSON.stringify(accounts.slice(0, 10)));
      }
    } catch (e) {}
  }

  bindEvents() {
    if (this.btnOpenOAuth) {
      this.btnOpenOAuth.addEventListener('click', () => {
        this.openModal();
      });
    }

    if (this.btnCloseOAuth) {
      this.btnCloseOAuth.addEventListener('click', () => {
        this.closeModal();
      });
    }

    if (this.btnLogout) {
      this.btnLogout.addEventListener('click', () => {
        appState.setState({ user: null }, 'USER_LOGGED_OUT');
      });
    }

    // Al seleccionar cualquiera de los tres proveedores (Gmail, Hotmail, Yahoo),
    // abre directamente la ventana oficial de dicho proveedor para seleccionar cuenta o escribir credenciales
    document.querySelectorAll('.oauth-provider-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const providerKey = btn.dataset.provider || 'google';
        const providerName = btn.dataset.name || 'Google / Gmail';
        const domain = btn.dataset.domain || 'gmail.com';
        this.openProviderWindow(providerKey, providerName, domain);
      });
    });
  }

  openModal() {
    if (this.container) {
      if (this.authAlert) this.authAlert.classList.add('hidden');
      if (this.statusBanner) this.statusBanner.classList.add('hidden');
      if (this.stepProviders) this.stepProviders.classList.remove('hidden');
      this.container.classList.remove('hidden');
    }
  }

  closeModal() {
    if (this.container) {
      this.container.classList.add('hidden');
      if (this.authAlert) this.authAlert.classList.add('hidden');
      if (this.statusBanner) this.statusBanner.classList.add('hidden');
    }
  }

  openProviderWindow(providerKey, providerName, domain) {
    this.activeProvider = { key: providerKey, name: providerName, domain };

    // Limpiar sondeos previos si los hubiera
    if (this.popupPollInterval) {
      clearInterval(this.popupPollInterval);
      this.popupPollInterval = null;
    }

    // Abre directamente la ventana oficial de autenticación del proveedor (Google / Microsoft / Yahoo)
    // con sondeo activo en segundo plano para garantizar retorno instantáneo y cierre automático
    this.openStandardOAuthPopup(providerKey, providerName);
  }

  openStandardOAuthPopup(providerKey, providerName) {
    if (this.statusBanner) this.statusBanner.classList.remove('hidden');
    if (this.statusText) this.statusText.textContent = `Conectando con ${providerName}...`;

    // Limpiar cualquier señal residual de localStorage
    localStorage.removeItem('qrbey_pending_oauth');

    const popupW = 520;
    const popupH = 650;
    const left = Math.max(0, Math.floor((window.screen.width - popupW) / 2));
    const top = Math.max(0, Math.floor((window.screen.height - popupH) / 2));
    const popupUrl = `/api/auth/${encodeURIComponent(providerKey)}`;

    const popup = window.open(
      popupUrl,
      'QRbeyOAuthLogin',
      `width=${popupW},height=${popupH},top=${top},left=${left},resizable=yes,scrollbars=yes,status=no`
    );

    if (popup && !popup.closed) {
      popup.focus();

      // Sondeo activo en segundo plano para capturar el retorno incluso si el navegador desvincula window.opener
      this.popupPollInterval = setInterval(() => {
        const rawPending = localStorage.getItem('qrbey_pending_oauth');
        if (rawPending) {
          try {
            const data = JSON.parse(rawPending);
            localStorage.removeItem('qrbey_pending_oauth');
            clearInterval(this.popupPollInterval);
            this.popupPollInterval = null;

            try { if (!popup.closed) popup.close(); } catch (e) {}

            if (data.user) {
              this.onAuthCompleted(data.user, data.provider);
            } else if (data.email) {
              this.executeLogin(data.provider || providerName, data.email, data.name);
            }
            return;
          } catch (e) {}
        }

        // Si el usuario cerró la ventana manualmente
        if (popup.closed) {
          clearInterval(this.popupPollInterval);
          this.popupPollInterval = null;
          if (this.statusBanner) this.statusBanner.classList.add('hidden');
        }
      }, 350);

    } else {
      if (this.authAlert) {
        this.authAlert.classList.remove('hidden');
        const span = this.authAlert.querySelector('span');
        if (span) span.textContent = 'Tu navegador bloqueó la ventana emergente. Por favor permite ventanas emergentes para identificarte con tu proveedor de correo.';
      }
      if (this.statusBanner) this.statusBanner.classList.add('hidden');
    }
  }

  async executeLogin(provider, email, name) {
    if (this.statusBanner) this.statusBanner.classList.remove('hidden');
    if (this.statusText) this.statusText.textContent = `Autenticando con ${email}...`;

    try {
      const res = await ApiService.oauthLogin(provider, email, name);
      if (res.success && res.user) {
        this.saveKnownAccount({ email: res.user.email, name: res.user.name, provider });
        appState.setState({ user: res.user }, 'USER_LOGGED_IN');
        this.closeModal();

        console.log(`✅ [OAuth 2.0] Sesión iniciada con éxito: ${res.user.email} (${res.user.plan})`);
      } else {
        alert(res.error || 'No se pudo iniciar sesión con el proveedor OAuth.');
        if (this.statusBanner) this.statusBanner.classList.add('hidden');
      }
    } catch (err) {
      console.error('[Auth Error]:', err);
      alert('Error de conexión al procesar el inicio de sesión OAuth.');
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
      const defaultMaxCredits = planKey === 'corporate' ? 10000 : (planKey === 'pro' ? 2000 : 50);
      const defaultMaxDownloads = planKey === 'corporate' ? 2000 : (planKey === 'pro' ? 500 : 15);

      const creditsUsed = user.creditsUsed || 0;
      const genMax = user.maxCredits || defaultMaxCredits;
      const qrUsed = user.generationsCount || 0;
      const dlMax = user.maxDownloads || defaultMaxDownloads;

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

      if (this.creditCounterBadge) {
        this.creditCounterBadge.textContent = `0/50 Créditos`;
      }
    }
  }

  render() {
    this.updateWidget(appState.getState().user);
  }
}
