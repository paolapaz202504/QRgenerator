/**
 * nav-auth.js - DevTeam frontAgent & securityAgent
 * Sincronización universal del estado de autenticación en la barra de navegación (Header)
 * Garantiza que en todas las páginas (Inicio, Editor, Contacto, Nosotros, Soluciones)
 * se muestre siempre de forma consistente el perfil registrado o el botón "Registrar / Iniciar".
 */
(function () {
  function syncNavAuth() {
    const userWidget = document.getElementById('user-profile-widget');
    const btnOpenOAuth = document.getElementById('btn-open-oauth');
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');

    if (!userWidget && !btnOpenOAuth) return;

    let user = null;
    try {
      const saved = localStorage.getItem('oauth_user');
      if (saved) {
        user = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('[nav-auth] Error parsing oauth_user:', e);
    }

    if (user && (user.email || user.name)) {
      if (userWidget) {
        userWidget.classList.remove('hidden');
        userWidget.classList.add('flex');
        userWidget.onclick = (e) => {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          if (window.profileModalInstance && typeof window.profileModalInstance.openModal === 'function') {
            window.profileModalInstance.openModal();
          } else {
            const isSpa = window.location.pathname === '/' || 
                          window.location.pathname === '' || 
                          window.location.pathname.endsWith('index.html') ||
                          window.location.pathname.endsWith('editor.html') ||
                          window.location.pathname === '/editor';
            if (isSpa) {
              let attempts = 0;
              const interval = setInterval(() => {
                attempts++;
                if (window.profileModalInstance && typeof window.profileModalInstance.openModal === 'function') {
                  clearInterval(interval);
                  window.profileModalInstance.openModal();
                } else if (attempts > 20) {
                  clearInterval(interval);
                  console.warn('[nav-auth] profileModalInstance initialization timeout');
                }
              }, 100);
            } else {
              window.location.href = '/?profile=1';
            }
          }
        };
      }
      if (btnOpenOAuth) {
        btnOpenOAuth.classList.add('hidden');
      }
      if (userName) {
        userName.textContent = user.name || (user.email ? user.email.split('@')[0] : 'Usuario');
      }
      if (userAvatar) {
        userAvatar.src = user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email || 'user')}`;
      }
    } else {
      if (userWidget) {
        userWidget.classList.add('hidden');
        userWidget.classList.remove('flex');
      }
      if (btnOpenOAuth) {
        btnOpenOAuth.classList.remove('hidden');
        btnOpenOAuth.onclick = (e) => {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          if (window.userModalInstance && typeof window.userModalInstance.openModal === 'function') {
            window.userModalInstance.openModal();
          } else {
            const isSpa = window.location.pathname === '/' || 
                          window.location.pathname === '' || 
                          window.location.pathname.endsWith('index.html') ||
                          window.location.pathname.endsWith('editor.html') ||
                          window.location.pathname === '/editor';
            if (isSpa) {
              let attempts = 0;
              const interval = setInterval(() => {
                attempts++;
                if (window.userModalInstance && typeof window.userModalInstance.openModal === 'function') {
                  clearInterval(interval);
                  window.userModalInstance.openModal();
                } else if (attempts > 20) {
                  clearInterval(interval);
                  console.warn('[nav-auth] userModalInstance initialization timeout');
                }
              }, 100);
            } else {
              window.location.href = '/?login=1';
            }
          }
        };
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      syncNavAuth();
      setupChangelogButton();
    });
  } else {
    syncNavAuth();
    setupChangelogButton();
  }

  function setupChangelogButton() {
    const btnChangelog = document.getElementById('btn-open-changelog');
    if (btnChangelog && !btnChangelog._hasNavListener) {
      btnChangelog._hasNavListener = true;
      btnChangelog.addEventListener('click', (e) => {
        const isSpa = window.location.pathname === '/' || 
                      window.location.pathname === '' || 
                      window.location.pathname.endsWith('index.html');
        if (!isSpa) {
          e.preventDefault();
          window.location.href = '/?changelog=1';
        }
      });
    }
  }

  // Sincronización en tiempo real ante eventos de storage entre ventanas/pestañas
  window.addEventListener('storage', (e) => {
    if (e.key === 'oauth_user') {
      syncNavAuth();
    }
  });

  // Exponer para llamadas imperativas
  window.syncNavAuth = syncNavAuth;

  // Carga universal del Widget de Soporte y Chat con IA 24/7 (supportAgent)
  function injectChatWidget() {
    if (document.getElementById('qrbey-chat-script') || window.LiveAIChatWidgetLoaded) return;
    const script = document.createElement('script');
    script.id = 'qrbey-chat-script';
    script.src = '/js/components/LiveAIChatWidget.js?v=1.11.0';
    script.defer = true;
    document.body.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectChatWidget);
  } else {
    injectChatWidget();
  }
})();
