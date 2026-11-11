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
    this.stepAccount = document.getElementById('oauth-step-account');
    this.btnBackProviders = document.getElementById('btn-back-to-providers');
    this.activeBadge = document.getElementById('active-provider-badge');
    this.accountTitle = document.getElementById('account-selection-title');
    this.accountsList = document.getElementById('oauth-accounts-list');
    this.btnTriggerOfficial = document.getElementById('btn-trigger-official-oauth');
    this.officialIcon = document.getElementById('official-oauth-icon');
    this.officialLabel = document.getElementById('official-oauth-label');

    this.statusBanner = document.getElementById('oauth-status-banner');
    this.statusText = document.getElementById('oauth-status-text');
    this.authAlert = document.getElementById('oauth-auth-required-alert');

    this.activeProvider = null;
    this.googleClientId = '';

    appState.subscribe((state, eventKey) => {
      if (['USER_LOGGED_IN', 'USER_LOGGED_OUT', 'DOWNLOAD_TRACKED', 'CREDIT_USED', 'PLAN_UPDATED', 'INIT_DATA'].includes(eventKey)) {
        this.updateWidget(state.user);
      }
    });

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

  getKnownAccounts() {
    try {
      const raw = localStorage.getItem('qrbey_known_accounts');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    // Cuentas predeterminadas / conocidas para agilizar pruebas
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

    // Botones de Proveedores (Gmail, Hotmail, Yahoo)
    document.querySelectorAll('.oauth-provider-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const providerKey = btn.dataset.provider;
        const providerName = btn.dataset.name || 'Google / Gmail';
        const domain = btn.dataset.domain || 'gmail.com';
        this.selectProvider(providerKey, providerName, domain);
      });
    });

    // Volver a elegir proveedor
    if (this.btnBackProviders) {
      this.btnBackProviders.addEventListener('click', () => {
        this.showStepProviders();
      });
    }

    // Botón oficial OAuth 2.0 (Google GIS / Popup oficial)
    if (this.btnTriggerOfficial) {
      this.btnTriggerOfficial.addEventListener('click', () => {
        this.triggerOfficialOAuthFlow();
      });
    }
  }

  openModal() {
    if (this.container) {
      if (this.authAlert) this.authAlert.classList.add('hidden');
      if (this.statusBanner) this.statusBanner.classList.add('hidden');
      this.showStepProviders();
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

  showStepProviders() {
    if (this.stepProviders) this.stepProviders.classList.remove('hidden');
    if (this.stepAccount) this.stepAccount.classList.add('hidden');
    this.activeProvider = null;
  }

  selectProvider(providerKey, providerName, domain) {
    this.activeProvider = { key: providerKey, name: providerName, domain };

    if (this.stepProviders) this.stepProviders.classList.add('hidden');
    if (this.stepAccount) this.stepAccount.classList.remove('hidden');

    if (this.activeBadge) this.activeBadge.textContent = providerName.split(' / ')[0];

    // Icono y texto del botón oficial
    if (this.officialIcon && this.officialLabel) {
      if (providerKey === 'google') {
        this.officialIcon.className = 'fa-brands fa-google text-red-500 text-base';
        this.officialLabel.textContent = 'Abrir selector de cuenta de Google';
      } else if (providerKey === 'microsoft') {
        this.officialIcon.className = 'fa-brands fa-microsoft text-blue-500 text-base';
        this.officialLabel.textContent = 'Abrir inicio de sesión de Microsoft';
      } else if (providerKey === 'yahoo') {
        this.officialIcon.className = 'fa-brands fa-yahoo text-purple-600 text-base';
        this.officialLabel.textContent = 'Abrir inicio de sesión de Yahoo';
      }
    }

    // Renderizar cuentas disponibles para este proveedor
    this.renderProviderAccounts(domain, providerKey);

    // Si es Google y GIS está cargado, intentar lanzar el selector nativo
    if (providerKey === 'google') {
      setTimeout(() => {
        this.triggerGoogleGIS(false);
      }, 250);
    }
  }

  renderProviderAccounts(domain, providerKey) {
    if (!this.accountsList) return;
    this.accountsList.innerHTML = '';

    const known = this.getKnownAccounts().filter(a => {
      const email = (a.email || '').toLowerCase();
      if (domain === 'gmail.com') return email.includes('@gmail.com');
      if (domain === 'hotmail.com') return email.includes('@hotmail.com') || email.includes('@outlook.com');
      if (domain === 'yahoo.com') return email.includes('@yahoo.com');
      return false;
    });

    if (known.length > 0) {
      const label = document.createElement('p');
      label.className = 'text-[11px] font-semibold text-slate-600 mb-1';
      label.textContent = 'Cuentas detectadas en este equipo:';
      this.accountsList.appendChild(label);

      known.forEach(account => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-xl transition cursor-pointer text-left group shadow-2xs';
        item.innerHTML = `
          <div class="flex items-center gap-2.5 min-w-0">
            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(account.email)}" alt="Avatar" class="w-7 h-7 rounded-full bg-slate-200 shrink-0">
            <div class="truncate">
              <span class="block font-bold text-xs text-slate-800 group-hover:text-indigo-700 truncate">${account.name || account.email.split('@')[0]}</span>
              <span class="block text-[11px] text-slate-500 font-mono truncate">${account.email}</span>
            </div>
          </div>
          <span class="text-[11px] font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 shrink-0">
            <span>Acceder</span>
            <i class="fa-solid fa-arrow-right text-[9px]"></i>
          </span>
        `;

        item.addEventListener('click', async () => {
          await this.executeLogin(this.activeProvider.name, account.email, account.name);
        });

        this.accountsList.appendChild(item);
      });
    }
  }

  triggerOfficialOAuthFlow() {
    if (!this.activeProvider) return;

    if (this.activeProvider.key === 'google') {
      this.triggerGoogleGIS(true);
    } else if (this.activeProvider.key === 'microsoft') {
      this.triggerMicrosoftOAuth();
    } else if (this.activeProvider.key === 'yahoo') {
      this.triggerYahooOAuth();
    }
  }

  triggerGoogleGIS(showAlertOnError = true) {
    if (window.google && window.google.accounts && window.google.accounts.oauth2 && this.googleClientId) {
      try {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: this.googleClientId,
          scope: 'email profile',
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              if (this.statusBanner) this.statusBanner.classList.remove('hidden');
              if (this.statusText) this.statusText.textContent = 'Obteniendo cuenta verificada de Google...';

              try {
                const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const gUser = await userRes.json();
                if (gUser && gUser.email) {
                  this.saveKnownAccount({ email: gUser.email, name: gUser.name, provider: 'google' });
                  await this.executeLogin('Google / Gmail', gUser.email, gUser.name);
                }
              } catch (fetchErr) {
                console.error('[Google Userinfo Error]:', fetchErr);
              }
            }
          }
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('[Google GIS initTokenClient Error]:', err.message);
      }
    }

    if (showAlertOnError) {
      // Si el SDK no abre el popup (por ejemplo en orígenes no registrados en Google Console)
      const popupW = 520;
      const popupH = 640;
      const left = (window.screen.width - popupW) / 2;
      const top = (window.screen.height - popupH) / 2;
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(this.googleClientId || '')}&response_type=token&scope=email%20profile&redirect_uri=${encodeURIComponent(window.location.origin)}`;
      window.open(authUrl, 'GoogleOAuthPopup', `width=${popupW},height=${popupH},top=${top},left=${left}`);
    }
  }

  triggerMicrosoftOAuth() {
    const popupW = 520;
    const popupH = 640;
    const left = (window.screen.width - popupW) / 2;
    const top = (window.screen.height - popupH) / 2;
    const authUrl = `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?client_id=common&response_type=token&scope=User.Read&redirect_uri=${encodeURIComponent(window.location.origin)}`;
    window.open(authUrl, 'MicrosoftOAuthPopup', `width=${popupW},height=${popupH},top=${top},left=${left}`);
  }

  triggerYahooOAuth() {
    const popupW = 520;
    const popupH = 640;
    const left = (window.screen.width - popupW) / 2;
    const top = (window.screen.height - popupH) / 2;
    const authUrl = `https://api.login.yahoo.com/oauth2/request_auth?client_id=dj0yJmk9&response_type=token&redirect_uri=${encodeURIComponent(window.location.origin)}`;
    window.open(authUrl, 'YahooOAuthPopup', `width=${popupW},height=${popupH},top=${top},left=${left}`);
  }

  async executeLogin(provider, email, name) {
    if (this.statusBanner) this.statusBanner.classList.remove('hidden');
    if (this.statusText) this.statusText.textContent = `Autenticando con ${email}...`;

    try {
      const res = await ApiService.oauthLogin(provider, email, name);
      if (res.success && res.user) {
        this.saveKnownAccount({ email: res.user.email, name: res.user.name, provider: (this.activeProvider ? this.activeProvider.key : 'google') });
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
