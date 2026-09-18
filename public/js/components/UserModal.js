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
    this.googleClientId = '144230109272-pbt85eqhr5ecnb8i2ffvv0j1kjqr2o2g.apps.googleusercontent.com';

    appState.subscribe((state, eventKey) => {
      if (['USER_LOGGED_IN', 'USER_LOGGED_OUT', 'DOWNLOAD_TRACKED', 'CREDIT_USED', 'INIT_DATA'].includes(eventKey)) {
        this.updateWidget(state.user);
      }
    });

    this.initGoogleClientId();
  }

  async initGoogleClientId() {
    const res = await ApiService.getConfig();
    if (res.success && res.googleClientId) {
      this.googleClientId = res.googleClientId;
    }
  }

  bindEvents() {
    if (this.btnOpenOAuth) {
      this.btnOpenOAuth.addEventListener('click', () => {
        if (this.container) this.container.classList.remove('hidden');
      });
    }

    if (this.btnCloseOAuth) {
      this.btnCloseOAuth.addEventListener('click', () => {
        if (this.container) this.container.classList.add('hidden');
      });
    }

    if (this.btnLogout) {
      this.btnLogout.addEventListener('click', () => {
        appState.setState({ user: null }, 'USER_LOGGED_OUT');
      });
    }

    document.querySelectorAll('.oauth-provider-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const provider = btn.dataset.provider || 'google';
        this.handleOAuthLogin(provider);
      });
    });
  }

  async handleOAuthLogin(provider) {
    const statusBanner = document.getElementById('oauth-status-banner');
    const statusText = document.getElementById('oauth-status-text');

    const providerNames = {
      google: 'Google / Gmail',
      microsoft: 'Microsoft / Hotmail',
      github: 'GitHub',
      apple: 'Apple ID',
      facebook: 'Facebook / Meta'
    };
    const providerStr = providerNames[provider] || provider;

    if (statusBanner) statusBanner.classList.remove('hidden');
    if (statusText) statusText.textContent = `Abriendo inicio de sesión con ${providerStr}...`;

    if (provider === 'google' && window.google && window.google.accounts && window.google.accounts.oauth2) {
      try {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: this.googleClientId,
          scope: 'email profile',
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const gUser = await userRes.json();
              if (gUser && gUser.email) {
                await this.executeLogin('Google / Gmail', gUser.email, gUser.name || gUser.email.split('@')[0]);
              }
              if (statusBanner) statusBanner.classList.add('hidden');
            }
          }
        });
        tokenClient.requestAccessToken();
        return;
      } catch (e) {
        console.warn('GIS error:', e);
      }
    }

    // Default OAuth popup simulation
    const popupW = 580;
    const popupH = 680;
    const left = (window.screen.width - popupW) / 2;
    const top = (window.screen.height - popupH) / 2;
    const authWindow = window.open('about:blank', 'OAuthAuthWindow', `width=${popupW},height=${popupH},top=${top},left=${left}`);

    setTimeout(async () => {
      if (authWindow && !authWindow.closed) {
        try { authWindow.close(); } catch (e) {}
      }
      const domainMap = { google: 'gmail.com', microsoft: 'hotmail.com', github: 'github.com', apple: 'icloud.com', facebook: 'facebook.com' };
      const domain = domainMap[provider] || 'gmail.com';
      const randomId = Math.random().toString(36).substring(2, 7);
      const authorizedEmail = `cuenta.${provider}.${randomId}@${domain}`;
      const authorizedName = `Usuario ${providerStr.split(' ')[0]}`;

      await this.executeLogin(providerStr, authorizedEmail, authorizedName);
      if (statusBanner) statusBanner.classList.add('hidden');
    }, 1500);
  }

  async executeLogin(provider, email, name) {
    const res = await ApiService.oauthLogin(provider, email, name);
    if (res.success && res.user) {
      appState.setState({ user: res.user }, 'USER_LOGGED_IN');
      if (this.container) this.container.classList.add('hidden');
    }
  }

  updateWidget(user) {
    if (!this.userWidget) return;
    if (user) {
      this.userWidget.classList.remove('hidden');
      if (this.btnOpenOAuth) this.btnOpenOAuth.classList.add('hidden');
      if (this.userName) this.userName.textContent = user.name || user.email.split('@')[0];
      if (this.userAvatar) this.userAvatar.src = user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`;
      
      const genUsed = user.generationsCount || user.creditsUsed || 0;
      const genMax = user.maxCredits || 200;
      const dlUsed = user.downloadsCount || 0;
      const dlMax = user.maxDownloads || 20;

      if (this.userCreditCounter) {
        this.userCreditCounter.textContent = `${genUsed}/${genMax} Créditos`;
      }
      if (this.userDownloadCounter) {
        this.userDownloadCounter.textContent = `${dlUsed}/${dlMax} QRs`;
      }
      if (this.creditCounterBadge) {
        this.creditCounterBadge.textContent = `${genUsed}/${genMax} Créditos`;
      }
    } else {
      this.userWidget.classList.add('hidden');
      if (this.btnOpenOAuth) this.btnOpenOAuth.classList.remove('hidden');

      // Update standalone credit counter badge for guest user
      if (this.creditCounterBadge) {
        this.creditCounterBadge.textContent = `0/200 Créditos`;
      }
    }
  }

  render() {
    this.updateWidget(appState.getState().user);
  }
}
