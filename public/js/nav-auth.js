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
          if (window.profileModalInstance && typeof window.profileModalInstance.openModal === 'function') {
            e.preventDefault();
            window.profileModalInstance.openModal();
          } else {
            window.location.href = '/?profile=1';
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
          if (window.userModalInstance && typeof window.userModalInstance.openModal === 'function') {
            e.preventDefault();
            window.userModalInstance.openModal();
          } else {
            window.location.href = '/?login=1';
          }
        };
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncNavAuth);
  } else {
    syncNavAuth();
  }

  // Sincronización en tiempo real ante eventos de storage entre ventanas/pestañas
  window.addEventListener('storage', (e) => {
    if (e.key === 'oauth_user') {
      syncNavAuth();
    }
  });

  // Exponer para llamadas imperativas
  window.syncNavAuth = syncNavAuth;
})();
