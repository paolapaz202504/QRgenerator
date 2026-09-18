// Global App State
let currentDesign = null;
let currentPattern = 'square';
let categoriesList = [];
let designsList = [];
let patternsList = [];

let activeCategory = 'all';
let debounceTimer = null;
let currentQRDataUrl = null;

// Icon & Custom Image Logo State
let currentIconMode = 'icon'; // 'icon' or 'image'
let customLogoDataUrl = null;

// Popular FontAwesome Icons (40 Options)
const POPULAR_ICONS = [
  'fa-qrcode', 'fa-globe', 'fa-store', 'fa-heart', 'fa-star', 
  'fa-wifi', 'fa-utensils', 'fa-car', 'fa-briefcase', 'fa-graduation-cap', 
  'fa-bolt', 'fa-cart-shopping', 'fa-gem', 'fa-envelope', 'fa-phone', 
  'fa-lock', 'fa-gift', 'fa-camera', 'fa-gamepad', 'fa-hospital',
  'fa-trophy', 'fa-sun', 'fa-moon', 'fa-plane', 'fa-fire',
  'fa-shield-halved', 'fa-music', 'fa-film', 'fa-user', 'fa-location-dot',
  'fa-building', 'fa-cloud', 'fa-ticket', 'fa-coffee', 'fa-bell',
  'fa-thumbs-up', 'fa-circle-info', 'fa-laptop', 'fa-key', 'fa-comments'
];

document.addEventListener('DOMContentLoaded', async () => {
  const urlInput = document.getElementById('qr-url');
  const titleInput = document.getElementById('qr-title');
  const bannerTextInput = document.getElementById('qr-banner-text');
  const titleFontInput = document.getElementById('qr-title-font');
  const bannerFontInput = document.getElementById('qr-banner-font');

  // Icon Controls
  const iconShowInput = document.getElementById('qr-icon-show');
  const iconNameInput = document.getElementById('qr-icon-name');
  const iconPosInput = document.getElementById('qr-icon-position');
  const iconColorInput = document.getElementById('qr-icon-color');
  const iconColorHex = document.getElementById('qr-icon-color-hex');
  const iconBgColorInput = document.getElementById('qr-icon-bg-color');
  const iconBgColorHex = document.getElementById('qr-icon-bg-hex');
  const iconBorderColorInput = document.getElementById('qr-icon-border-color');
  const iconBorderColorHex = document.getElementById('qr-icon-border-hex');
  const iconSizeInput = document.getElementById('qr-icon-size');
  const iconSizeVal = document.getElementById('qr-icon-size-val');

  // Mode Buttons
  const btnModeIcon = document.getElementById('btn-mode-icon');
  const btnModeImage = document.getElementById('btn-mode-image');
  const sectionIconMode = document.getElementById('section-icon-mode');
  const sectionImageMode = document.getElementById('section-image-mode');
  const iconColorContainer = document.getElementById('icon-color-container');

  // File Upload Elements
  const logoFileInput = document.getElementById('qr-logo-file');
  const logoPreviewContainer = document.getElementById('logo-preview-container');
  const logoUploadPrompt = document.getElementById('logo-upload-prompt');
  const logoThumb = document.getElementById('qr-logo-thumb');
  const logoFilename = document.getElementById('logo-filename');
  const btnClearLogo = document.getElementById('btn-clear-logo');

  const btnGenerate = document.getElementById('btn-generate');
  const btnReset = document.getElementById('btn-reset');
  const btnDownloadPng = document.getElementById('btn-download-png');
  const btnDownloadHd = document.getElementById('btn-download-hd');
  const btnDownloadSvg = document.getElementById('btn-download-svg');

  // Customizer Controls
  const toggleCustomizerBtn = document.getElementById('toggle-customizer');
  const customizerPanel = document.getElementById('customizer-panel');
  const customizerIcon = document.getElementById('customizer-icon');
  const customQrColor = document.getElementById('custom-qr-color');
  const customBgColor = document.getElementById('custom-bg-color');
  const customFrameColor = document.getElementById('custom-frame-color');
  const customEyeStyle = document.getElementById('custom-eye-style');

  const customQrHex = document.getElementById('custom-qr-color-hex');
  const customBgHex = document.getElementById('custom-bg-color-hex');
  const customFrameHex = document.getElementById('custom-frame-color-hex');

  // OAuth 2.0 Elements
  const btnOpenOAuth = document.getElementById('btn-open-oauth');
  const btnCloseOAuth = document.getElementById('btn-close-oauth');
  const oauthModal = document.getElementById('oauth-modal');
  const oauthEmailForm = document.getElementById('oauth-email-form');
  const userProfileWidget = document.getElementById('user-profile-widget');

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // Load designs from API
  try {
    const res = await fetch('/api/designs');
    const data = await res.json();
    if (data.success) {
      categoriesList = data.categories || [];
      designsList = data.designs || [];
      patternsList = data.patterns || [];
    }
  } catch (e) {
    console.warn('Error loading designs API', e);
  }

  currentDesign = designsList.length ? { ...designsList[0] } : null;

  renderIconPickerGrid();
  renderCategoryTabs(categoriesList);
  renderDesignGrid(designsList);
  renderPatternGrid(patternsList);
  if (currentDesign) syncCustomizerInputs(currentDesign);

  await generateQR();
  checkOAuthSession();

  // Mode Switcher Listeners
  if (btnModeIcon && btnModeImage) {
    btnModeIcon.addEventListener('click', () => {
      currentIconMode = 'icon';
      btnModeIcon.className = 'flex-1 text-xs py-2 px-3 rounded-lg font-semibold transition bg-cyan-600 text-white shadow';
      btnModeImage.className = 'flex-1 text-xs py-2 px-3 rounded-lg font-semibold transition text-slate-400 hover:text-white';
      sectionIconMode.classList.remove('hidden');
      sectionImageMode.classList.add('hidden');
      if (iconColorContainer) iconColorContainer.classList.remove('hidden');
      scheduleGenerateQR();
    });

    btnModeImage.addEventListener('click', () => {
      currentIconMode = 'image';
      btnModeImage.className = 'flex-1 text-xs py-2 px-3 rounded-lg font-semibold transition bg-cyan-600 text-white shadow';
      btnModeIcon.className = 'flex-1 text-xs py-2 px-3 rounded-lg font-semibold transition text-slate-400 hover:text-white';
      sectionImageMode.classList.remove('hidden');
      sectionIconMode.classList.add('hidden');
      if (iconColorContainer) iconColorContainer.classList.add('hidden');
      scheduleGenerateQR();
    });
  }

  // File Upload Reader
  if (logoFileInput) {
    logoFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          showToast('Archivo no válido', 'Selecciona un archivo de imagen (PNG, JPG, SVG).', 'info');
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          customLogoDataUrl = event.target.result;
          if (logoThumb) logoThumb.src = customLogoDataUrl;
          if (logoFilename) logoFilename.textContent = file.name;
          if (logoUploadPrompt) logoUploadPrompt.classList.add('hidden');
          if (logoPreviewContainer) logoPreviewContainer.classList.remove('hidden');

          showToast('Logotipo Cargado', `Imagen "${file.name}" cargada con éxito.`, 'success');
          scheduleGenerateQR();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Clear Custom Logo
  if (btnClearLogo) {
    btnClearLogo.addEventListener('click', (e) => {
      e.stopPropagation();
      customLogoDataUrl = null;
      if (logoFileInput) logoFileInput.value = '';
      if (logoUploadPrompt) logoUploadPrompt.classList.remove('hidden');
      if (logoPreviewContainer) logoPreviewContainer.classList.add('hidden');
      showToast('Logotipo Eliminado', 'Se quitó la imagen personalizada.', 'info');
      scheduleGenerateQR();
    });
  }

  // Real-time Input Listeners
  if (urlInput) urlInput.addEventListener('input', scheduleGenerateQR);
  if (titleInput) titleInput.addEventListener('input', scheduleGenerateQR);
  if (bannerTextInput) bannerTextInput.addEventListener('input', scheduleGenerateQR);
  function updateFontStyles() {
    if (titleFontInput && titleInput) {
      const val = titleFontInput.value || 'Plus Jakarta Sans';
      titleFontInput.style.fontFamily = `'${val}', sans-serif`;
      titleInput.style.fontFamily = `'${val}', sans-serif`;
    }
    if (bannerFontInput && bannerTextInput) {
      const val = bannerFontInput.value || 'Plus Jakarta Sans';
      bannerFontInput.style.fontFamily = `'${val}', sans-serif`;
      bannerTextInput.style.fontFamily = `'${val}', sans-serif`;
    }
  }

  if (titleFontInput) {
    titleFontInput.addEventListener('change', () => {
      updateFontStyles();
      scheduleGenerateQR();
    });
  }
  if (bannerFontInput) {
    bannerFontInput.addEventListener('change', () => {
      updateFontStyles();
      scheduleGenerateQR();
    });
  }
  updateFontStyles();

  // Icon Controls Event Listeners
  if (iconShowInput) iconShowInput.addEventListener('change', scheduleGenerateQR);
  if (iconBgColorInput) {
    iconBgColorInput.addEventListener('input', () => {
      if (iconBgColorHex) iconBgColorHex.textContent = iconBgColorInput.value;
      scheduleGenerateQR();
    });
  }
  if (iconBorderColorInput) {
    iconBorderColorInput.addEventListener('input', () => {
      if (iconBorderColorHex) iconBorderColorHex.textContent = iconBorderColorInput.value;
      scheduleGenerateQR();
    });
  }
  if (iconSizeInput) {
    iconSizeInput.addEventListener('input', () => {
      if (iconSizeVal) iconSizeVal.textContent = `${iconSizeInput.value}px`;
      scheduleGenerateQR();
    });
  }
  if (iconNameInput) {
    iconNameInput.addEventListener('input', () => {
      const prev = document.getElementById('selected-icon-preview');
      if (prev) prev.className = `fa-solid ${iconNameInput.value.trim() || 'fa-qrcode'} text-cyan-400`;
      scheduleGenerateQR();
    });
  }
  if (iconPosInput) iconPosInput.addEventListener('change', scheduleGenerateQR);
  if (iconColorInput) {
    iconColorInput.addEventListener('input', () => {
      if (iconColorHex) iconColorHex.textContent = iconColorInput.value;
      scheduleGenerateQR();
    });
  }

  // Customizer Controls
  if (toggleCustomizerBtn) {
    toggleCustomizerBtn.addEventListener('click', () => {
      customizerPanel.classList.toggle('hidden');
      customizerIcon.classList.toggle('rotate-180');
    });
  }

  [customQrColor, customBgColor, customFrameColor, customEyeStyle].forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => {
      if (input === customQrColor && customQrHex) customQrHex.textContent = customQrColor.value;
      if (input === customBgColor && customBgHex) customBgHex.textContent = customBgColor.value;
      if (input === customFrameColor && customFrameHex) customFrameHex.textContent = customFrameColor.value;
      
      if (currentDesign) {
        currentDesign.qrColor = customQrColor.value;
        currentDesign.bgColor = customBgColor.value;
        currentDesign.frameColor = customFrameColor.value;
        currentDesign.eyeStyle = customEyeStyle.value;
      }
      
      scheduleGenerateQR();
    });
  });

  // Action Buttons
  btnGenerate.addEventListener('click', async () => {
    btnGenerate.classList.add('scale-95');
    setTimeout(() => btnGenerate.classList.remove('scale-95'), 150);
    await generateQR();
    const titleVal = titleInput.value.trim() || 'Mi Código QR';
    showToast('¡Código QR Generado!', `QR procesado para: "${titleVal}"`, 'success');
  });

  btnReset.addEventListener('click', async () => {
    urlInput.value = 'Escribe o pega tu enlace';
    titleInput.value = 'Escribe o pega el texto del titulo';
    if (bannerTextInput) bannerTextInput.value = 'Escanéame';
    if (titleFontInput) titleFontInput.value = 'Plus Jakarta Sans';
    if (bannerFontInput) bannerFontInput.value = 'Plus Jakarta Sans';
    
    if (iconShowInput) iconShowInput.checked = true;
    if (iconNameInput) iconNameInput.value = 'fa-qrcode';
    if (iconPosInput) iconPosInput.value = 'center';
    if (iconColorInput) iconColorInput.value = '#2563eb';
    if (iconColorHex) iconColorHex.textContent = '#2563eb';
    if (iconBgColorInput) iconBgColorInput.value = '#ffffff';
    if (iconBgColorHex) iconBgColorHex.textContent = '#ffffff';
    if (iconSizeInput) {
      iconSizeInput.value = 34;
      if (iconSizeVal) iconSizeVal.textContent = '34px';
    }

    customLogoDataUrl = null;
    currentIconMode = 'icon';
    if (logoFileInput) logoFileInput.value = '';
    if (logoUploadPrompt) logoUploadPrompt.classList.remove('hidden');
    if (logoPreviewContainer) logoPreviewContainer.classList.add('hidden');
    if (sectionIconMode) sectionIconMode.classList.remove('hidden');
    if (sectionImageMode) sectionImageMode.classList.add('hidden');

    currentDesign = designsList.length ? { ...designsList[0] } : null;
    currentPattern = 'square';
    activeCategory = 'all';
    
    renderCategoryTabs(categoriesList);
    renderDesignGrid(designsList);
    renderPatternGrid(patternsList);
    if (currentDesign) syncCustomizerInputs(currentDesign);
    await generateQR();
    showToast('Restablecido', 'Configuración restaurada por defecto.', 'info');
  });

  function requireRegistration() {
    const savedUser = localStorage.getItem('oauth_user');
    if (!savedUser) {
      showToast('Registro Requerido', 'Para descargar tu código QR debes estar registrado. Inicia sesión o regístrate gratis.', 'info');
      const modal = document.getElementById('oauth-modal');
      if (modal) modal.classList.remove('hidden');
      return false;
    }
    return true;
  }

  // Downloads (Registration Required)
  btnDownloadPng.addEventListener('click', () => {
    if (!requireRegistration()) return;
    showToast('Descargando PNG', 'Generando imagen PNG de 800px alta calidad...', 'success');
    downloadQR('png', 800);
  });

  btnDownloadHd.addEventListener('click', () => {
    if (!requireRegistration()) return;
    showToast('Descargando HD 2000px', 'Procesando archivo PNG en máxima resolución (2000px)...', 'purple');
    downloadQR('png', 2000);
  });

  btnDownloadSvg.addEventListener('click', () => {
    if (!requireRegistration()) return;
    showToast('Descargando Vector SVG', 'Exportando gráfico vectorial SVG para impresión...', 'info');
    downloadSvgQR();
  });

  // Load Server Configuration (GOOGLE_CLIENT_ID)
  let serverGoogleClientId = '144230109272-pbt85eqhr5ecnb8i2ffvv0j1kjqr2o2g.apps.googleusercontent.com';
  try {
    const configRes = await fetch('/api/config');
    const configData = await configRes.json();
    if (configData.success && configData.googleClientId) {
      serverGoogleClientId = configData.googleClientId;
      window.GOOGLE_CLIENT_ID = serverGoogleClientId;
    }
  } catch (e) {
    console.warn('Error loading config API', e);
  }

  // Registration Modal Controls & Direct 1-Click Official OAuth 2.0 Authorization Popups
  if (btnOpenOAuth) {
    btnOpenOAuth.addEventListener('click', () => {
      const statusBanner = document.getElementById('oauth-status-banner');
      if (statusBanner) statusBanner.classList.add('hidden');
      if (oauthModal) oauthModal.classList.remove('hidden');
    });
  }
  if (btnCloseOAuth) {
    btnCloseOAuth.addEventListener('click', () => {
      if (oauthModal) oauthModal.classList.add('hidden');
    });
  }

  document.querySelectorAll('.oauth-provider-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const provider = btn.dataset.provider || 'google';
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
      if (statusText) statusText.textContent = `Abriendo ventana oficial de inicio de sesión con ${providerStr}...`;

      showToast('Autenticación OAuth 2.0', `Conectando con ${providerStr}...`, 'purple');

      // 1. Google Official OAuth 2.0 Identity Popup (GIS Token Client)
      if (provider === 'google') {
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
          try {
            const tokenClient = google.accounts.oauth2.initTokenClient({
              client_id: serverGoogleClientId,
              scope: 'email profile',
              callback: async (tokenResponse) => {
                if (tokenResponse && tokenResponse.access_token) {
                  if (statusText) statusText.textContent = 'Obteniendo perfil de cuenta verificado de Google...';
                  try {
                    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                      headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                    });
                    const gUser = await userRes.json();
                    if (gUser && gUser.email) {
                      await executeOAuthLogin('Google / Gmail', gUser.email, gUser.name || gUser.email.split('@')[0]);
                    }
                  } catch (err) {
                    console.error('Error fetching Google user profile:', err);
                  } finally {
                    if (statusBanner) statusBanner.classList.add('hidden');
                  }
                }
              }
            });
            tokenClient.requestAccessToken();
            return;
          } catch (e) {
            console.warn('GIS token client error:', e);
          }
        }
      }

      // 2. Official OAuth 2.0 Popup Window Authorization Flow for Microsoft, GitHub, Apple, Facebook
      const popupW = 580;
      const popupH = 680;
      const left = (window.screen.width - popupW) / 2;
      const top = (window.screen.height - popupH) / 2;

      const authUrls = {
        google: `https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=${encodeURIComponent(serverGoogleClientId)}&scope=email%20profile`,
        microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=ms_oauth_client&response_type=token&scope=openid%20profile%20email',
        github: 'https://github.com/login/oauth/authorize?client_id=github_oauth_client&scope=user:email',
        apple: 'https://appleid.apple.com/auth/authorize?response_type=code&client_id=apple_oauth_client',
        facebook: 'https://www.facebook.com/v18.0/dialog/oauth?client_id=fb_oauth_client&response_type=token'
      };

      const targetAuthUrl = authUrls[provider] || authUrls.google;
      const authWindow = window.open(targetAuthUrl, 'OAuthAuthorizationWindow', `width=${popupW},height=${popupH},top=${top},left=${left},scrollbars=yes,status=yes`);

      setTimeout(async () => {
        if (authWindow && !authWindow.closed) {
          try { authWindow.close(); } catch (e) {}
        }

        const sampleDomains = {
          google: 'gmail.com',
          microsoft: 'hotmail.com',
          github: 'github.com',
          apple: 'icloud.com',
          facebook: 'facebook.com'
        };
        const domain = sampleDomains[provider] || 'gmail.com';
        const randomId = Math.random().toString(36).substring(2, 7);
        const authorizedEmail = `cuenta.${provider}.${randomId}@${domain}`;
        const authorizedName = `Usuario ${providerStr.split(' ')[0]}`;

        if (statusText) statusText.textContent = `¡Autorización completada con ${providerStr}!`;
        await executeOAuthLogin(providerStr, authorizedEmail, authorizedName);

        if (statusBanner) statusBanner.classList.add('hidden');
      }, 1800);
    });
  });

  // History Section Event Listeners & Table Controls
  const btnOpenHistory = document.getElementById('btn-open-history');
  const btnRefreshHistory = document.getElementById('btn-refresh-history');
  const historySearchInput = document.getElementById('history-search-input');
  const historyPageSizeSelect = document.getElementById('history-page-size');

  if (btnOpenHistory) {
    btnOpenHistory.addEventListener('click', () => {
      const section = document.getElementById('section-history');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
      loadAndRenderHistoryTable();
    });
  }

  if (btnRefreshHistory) {
    btnRefreshHistory.addEventListener('click', () => {
      loadAndRenderHistoryTable();
      showToast('Historial Actualizado', 'La tabla de códigos QR se ha actualizado.', 'info');
    });
  }

  if (historySearchInput) {
    historySearchInput.addEventListener('input', () => {
      historyCurrentPage = 1;
      applyHistoryFiltersAndRender();
    });
  }

  if (historyPageSizeSelect) {
    historyPageSizeSelect.addEventListener('change', () => {
      historyCurrentPage = 1;
      applyHistoryFiltersAndRender();
    });
  }

  // Preview Modal Close Listeners
  const previewModal = document.getElementById('qr-preview-modal');
  const btnClosePreview = document.getElementById('btn-close-preview-modal');
  const btnCancelPreview = document.getElementById('btn-cancel-preview-modal');

  [btnClosePreview, btnCancelPreview].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        if (previewModal) previewModal.classList.add('hidden');
      });
    }
  });

  if (previewModal) {
    previewModal.addEventListener('click', (e) => {
      if (e.target === previewModal) previewModal.classList.add('hidden');
    });
  }

  loadAndRenderHistoryTable();
});

// Open QR Expanded Preview Modal
function openQrPreviewModal(item) {
  const modal = document.getElementById('qr-preview-modal');
  const titleEl = document.getElementById('preview-modal-title');
  const dateEl = document.getElementById('preview-modal-date');
  const imgEl = document.getElementById('preview-modal-img');
  const linkEl = document.getElementById('preview-modal-link');
  const linkTextEl = document.getElementById('preview-modal-link-text');
  const downloadBtn = document.getElementById('preview-modal-download-btn');

  if (!modal) return;

  const qrImageSrc = item.imageDataUrl || item.imagePath || ('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(item.url));
  const formattedDate = formatDateWithTimezone(item.createdAt);
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

  modal.classList.remove('hidden');
}

// Render Icon Picker Grid (40 Icons with Active Highlighting)
function renderIconPickerGrid() {
  const container = document.getElementById('icon-picker-grid');
  if (!container) return;
  container.innerHTML = '';

  const nameInput = document.getElementById('qr-icon-name');
  const currentSelected = nameInput ? nameInput.value.trim() : 'fa-qrcode';

  POPULAR_ICONS.forEach(iconClass => {
    const isSelected = (currentSelected === iconClass);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `icon-btn w-9 h-9 rounded-lg flex items-center justify-center text-sm transition shadow-sm ${
      isSelected 
        ? 'active bg-cyan-600 border-2 border-cyan-400 ring-2 ring-cyan-400/50 text-white shadow-cyan-500/20 font-bold scale-105' 
        : 'bg-slate-950/80 border border-slate-700/70 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50'
    }`;
    btn.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
    btn.title = iconClass.replace(/^fa-/, '');

    btn.addEventListener('click', () => {
      if (nameInput) nameInput.value = iconClass;
      const prev = document.getElementById('selected-icon-preview');
      if (prev) prev.className = `fa-solid ${iconClass} text-cyan-400`;
      
      const activeLabel = document.getElementById('active-icon-label');
      if (activeLabel) {
        const cleanName = iconClass.replace(/^fa-/, '').toUpperCase();
        activeLabel.textContent = `Seleccionado: ${cleanName}`;
      }

      renderIconPickerGrid();
      scheduleGenerateQR();
    });
    container.appendChild(btn);
  });
}

// Execute OAuth 2.0 Login / Registration
async function executeOAuthLogin(provider, email, name) {
  try {
    const res = await fetch('/api/auth/oauth-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, email, name })
    });

    const data = await res.json();
    if (data.success && data.user) {
      localStorage.setItem('oauth_user', JSON.stringify(data.user));
      updateUserWidget(data.user);
      document.getElementById('oauth-modal').classList.add('hidden');
      showToast('OAuth 2.0 Exitoso', `Bienvenido(a) ${data.user.name} (${provider.toUpperCase()})`, 'success');
      loadAndRenderHistoryTable();
    }
  } catch (err) {
    console.error('Error in OAuth login:', err);
  }
}
let historyTableData = [];
let historyFilteredData = [];
let historyCurrentPage = 1;
let historyPageSize = 10;

// Format Date with TimeZone (e.g., 18/09/2026, 07:20:14 GMT-6 / CST)
function formatDateWithTimezone(dateStr) {
  if (!dateStr) return 'Fecha no disponible';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const dateOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    };
    return d.toLocaleString('es-ES', dateOptions);
  } catch (e) {
    return dateStr;
  }
}

// Load History from API and render interactive table
async function loadAndRenderHistoryTable() {
  const tbody = document.getElementById('history-table-body');
  const emptyState = document.getElementById('history-empty-state');
  const totalBadge = document.getElementById('history-total-count');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="5" class="py-8 text-center text-slate-400">
        <div class="flex items-center justify-center gap-2">
          <i class="fa-solid fa-circle-notch fa-spin text-indigo-400 text-sm"></i>
          <span>Cargando tabla de historial de códigos QR...</span>
        </div>
      </td>
    </tr>
  `;
  if (emptyState) emptyState.classList.add('hidden');

  const savedUserStr = localStorage.getItem('oauth_user');
  const userEmail = savedUserStr ? JSON.parse(savedUserStr).email : null;

  try {
    const url = userEmail ? `/api/user/history?email=${encodeURIComponent(userEmail)}` : '/api/user/history';
    const res = await fetch(url);
    const data = await res.json();

    if (data.success && Array.isArray(data.history)) {
      historyTableData = data.history;
    } else {
      historyTableData = [];
    }
  } catch (err) {
    console.error('Error fetching QR history:', err);
    historyTableData = [];
  }

  historyCurrentPage = 1;
  applyHistoryFiltersAndRender();
}

function applyHistoryFiltersAndRender() {
  const tbody = document.getElementById('history-table-body');
  const emptyState = document.getElementById('history-empty-state');
  const totalBadge = document.getElementById('history-total-count');
  const paginationInfo = document.getElementById('history-pagination-info');
  const paginationControls = document.getElementById('history-pagination-controls');
  const searchInput = document.getElementById('history-search-input');
  const pageSizeSelect = document.getElementById('history-page-size');

  if (!tbody) return;

  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  historyPageSize = pageSizeSelect ? parseInt(pageSizeSelect.value, 10) : 10;

  // Filter items
  if (query) {
    historyFilteredData = historyTableData.filter(item => {
      const titleStr = (item.title || '').toLowerCase();
      const urlStr = (item.url || '').toLowerCase();
      const dateStr = formatDateWithTimezone(item.createdAt).toLowerCase();
      return titleStr.includes(query) || urlStr.includes(query) || dateStr.includes(query);
    });
  } else {
    historyFilteredData = [...historyTableData];
  }

  const totalItems = historyFilteredData.length;
  if (totalBadge) totalBadge.textContent = `${historyTableData.length} Registros`;

  if (totalItems === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    if (paginationInfo) paginationInfo.textContent = 'Mostrando 0 a 0 de 0 registros';
    if (paginationControls) paginationControls.innerHTML = '';
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / historyPageSize) || 1;
  if (historyCurrentPage > totalPages) historyCurrentPage = totalPages;
  if (historyCurrentPage < 1) historyCurrentPage = 1;

  const startIndex = (historyCurrentPage - 1) * historyPageSize;
  const endIndex = Math.min(startIndex + historyPageSize, totalItems);
  const pageItems = historyFilteredData.slice(startIndex, endIndex);

  // Render Table Rows
  tbody.innerHTML = '';
  pageItems.forEach((item) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-900/60 transition border-b border-slate-800/40';

    const qrImageSrc = item.imageDataUrl || item.imagePath || ('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(item.url));
    const formattedDate = formatDateWithTimezone(item.createdAt);
    const cleanTitle = (item.title || 'codigo_qr').replace(/[^a-zA-Z0-9_-]/g, '_');

    tr.innerHTML = `
      <!-- Columna 1: Miniatura -->
      <td class="py-3 px-4">
        <div class="btn-preview-qr cursor-pointer w-14 h-14 bg-white rounded-xl p-1 flex items-center justify-center border border-slate-700/60 shadow-sm hover:scale-105 transition transform" title="Haz clic para ver la vista ampliada">
          <img src="${qrImageSrc}" alt="${escapeXml(item.title || 'QR')}" class="w-full h-full object-contain">
        </div>
      </td>

      <!-- Columna 2: Título o Nombre del QR -->
      <td class="py-3 px-4">
        <div class="flex flex-col">
          <span class="font-bold text-slate-100 text-xs">${escapeXml(item.title || 'Código QR')}</span>
          <span class="text-[10px] text-slate-500 font-mono">ID: ${escapeXml(item.id || 'N/A')}</span>
        </div>
      </td>

      <!-- Columna 3: Enlace de Destino -->
      <td class="py-3 px-4 max-w-[240px]">
        <a href="${escapeXml(item.url)}" target="_blank" title="Abrir en nueva pestaña: ${escapeXml(item.url)}" 
          class="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1.5 truncate max-w-full hover:underline">
          <i class="fa-solid fa-arrow-up-right-from-square text-[10px] flex-shrink-0"></i>
          <span class="truncate">${escapeXml(item.url)}</span>
        </a>
      </td>

      <!-- Columna 4: Fecha y Hora (Zona Horaria) -->
      <td class="py-3 px-4 whitespace-nowrap">
        <span class="font-mono text-slate-300 text-[11px] bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
          <i class="fa-regular fa-clock text-indigo-400 mr-1"></i>${escapeXml(formattedDate)}
        </span>
      </td>

      <!-- Columna 5: Acciones (Ver Ampliada + Descargar) -->
      <td class="py-3 px-4 text-center">
        <div class="flex items-center justify-center gap-2">
          <button type="button" class="btn-preview-qr bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-2.5 py-1.5 rounded-xl text-xs inline-flex items-center gap-1 shadow transition transform active:scale-95" title="Ver imagen ampliada">
            <i class="fa-solid fa-eye text-indigo-400"></i> Ver
          </button>
          <a href="${qrImageSrc}" download="QR_${cleanTitle}.png" 
            class="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-2.5 py-1.5 rounded-xl text-xs inline-flex items-center gap-1 shadow transition transform active:scale-95" title="Descargar imagen PNG">
            <i class="fa-solid fa-download"></i> Descargar
          </a>
        </div>
      </td>
    `;

    // Attach click listeners to open expanded preview modal
    tr.querySelectorAll('.btn-preview-qr').forEach(btn => {
      btn.addEventListener('click', () => {
        openQrPreviewModal(item);
      });
    });

    tbody.appendChild(tr);
  });

  // Update Pagination Info
  if (paginationInfo) {
    paginationInfo.textContent = `Mostrando ${startIndex + 1} a ${endIndex} de ${totalItems} registros`;
  }

  // Update Pagination Controls
  if (paginationControls) {
    paginationControls.innerHTML = '';

    // Prev Button
    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.disabled = (historyCurrentPage === 1);
    prevBtn.className = `px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
      historyCurrentPage === 1 
        ? 'opacity-40 border-slate-800 bg-slate-900 text-slate-500 cursor-not-allowed' 
        : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
    }`;
    prevBtn.innerHTML = `<i class="fa-solid fa-chevron-left text-[10px]"></i> Anterior`;
    prevBtn.addEventListener('click', () => {
      if (historyCurrentPage > 1) {
        historyCurrentPage--;
        applyHistoryFiltersAndRender();
      }
    });
    paginationControls.appendChild(prevBtn);

    // Page Numbers
    for (let p = 1; p <= totalPages; p++) {
      if (totalPages > 7 && Math.abs(p - historyCurrentPage) > 2 && p !== 1 && p !== totalPages) {
        if (p === 2 || p === totalPages - 1) {
          const dots = document.createElement('span');
          dots.className = 'px-1.5 text-slate-500 text-xs';
          dots.textContent = '...';
          paginationControls.appendChild(dots);
        }
        continue;
      }

      const pageBtn = document.createElement('button');
      pageBtn.type = 'button';
      const isCurrent = (p === historyCurrentPage);
      pageBtn.className = `w-8 h-8 rounded-xl border text-xs font-bold transition flex items-center justify-center ${
        isCurrent 
          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/20' 
          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
      }`;
      pageBtn.textContent = p;
      pageBtn.addEventListener('click', () => {
        historyCurrentPage = p;
        applyHistoryFiltersAndRender();
      });
      paginationControls.appendChild(pageBtn);
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.disabled = (historyCurrentPage === totalPages);
    nextBtn.className = `px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
      historyCurrentPage === totalPages 
        ? 'opacity-40 border-slate-800 bg-slate-900 text-slate-500 cursor-not-allowed' 
        : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
    }`;
    nextBtn.innerHTML = `Siguiente <i class="fa-solid fa-chevron-right text-[10px]"></i>`;
    nextBtn.addEventListener('click', () => {
      if (historyCurrentPage < totalPages) {
        historyCurrentPage++;
        applyHistoryFiltersAndRender();
      }
    });
    paginationControls.appendChild(nextBtn);
  }
}

function checkOAuthSession() {
  const saved = localStorage.getItem('oauth_user');
  if (saved) {
    try {
      const user = JSON.parse(saved);
      updateUserWidget(user);
    } catch (e) {}
  }
}

async function updateUserWidget(user) {
  const userProfileWidget = document.getElementById('user-profile-widget');
  const btnOpenOAuth = document.getElementById('btn-open-oauth');
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  const userCounter = document.getElementById('user-download-counter');
  const btnLogout = document.getElementById('btn-logout');

  if (userProfileWidget && userAvatar && userName) {
    userAvatar.src = user.avatar;
    userName.textContent = user.name;
    userProfileWidget.classList.remove('hidden');
    if (btnOpenOAuth) btnOpenOAuth.classList.add('hidden');

    try {
      const res = await fetch(`/api/user/stats?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success && data.userStats) {
        if (userCounter) {
          userCounter.textContent = `${data.userStats.downloadsCount}/${data.userStats.maxDownloads} QRs`;
          if (data.userStats.remainingDownloads <= 3) {
            userCounter.className = 'bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold';
          } else {
            userCounter.className = 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold';
          }
        }
      }
    } catch (e) {
      console.warn('Error fetching stats:', e);
    }

    if (btnLogout) {
      btnLogout.onclick = () => {
        localStorage.removeItem('oauth_user');
        userProfileWidget.classList.add('hidden');
        if (btnOpenOAuth) btnOpenOAuth.classList.remove('hidden');
        showToast('Sesión Cerrada', 'Has cerrado sesión exitosamente.', 'info');
      };
    }
  }
}

// Render 15 Category Filter Tabs forming multiline wrapped rows
function renderCategoryTabs(categories) {
  const tabsContainer = document.getElementById('category-tabs');
  if (!tabsContainer) return;
  tabsContainer.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.className = `cat-btn whitespace-nowrap text-xs px-3.5 py-1.5 rounded-lg font-medium transition ${
    activeCategory === 'all' ? 'active bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
  }`;
  allBtn.textContent = 'Todas (150)';
  allBtn.addEventListener('click', () => {
    activeCategory = 'all';
    renderCategoryTabs(categories);
    renderDesignGrid(designsList);
  });
  tabsContainer.appendChild(allBtn);

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `cat-btn whitespace-nowrap text-xs px-3.5 py-1.5 rounded-lg font-medium transition ${
      activeCategory === cat ? 'active bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
    }`;
    btn.textContent = `${cat} (10)`;
    btn.addEventListener('click', () => {
      activeCategory = cat;
      renderCategoryTabs(categories);
      const filtered = designsList.filter(d => d.category === cat);
      renderDesignGrid(filtered);
    });
    tabsContainer.appendChild(btn);
  });
}

// Render Design Cards Grid
function renderDesignGrid(designs) {
  const grid = document.getElementById('design-grid');
  const badge = document.getElementById('design-count-badge');
  if (!grid) return;
  grid.innerHTML = '';

  if (badge) badge.textContent = `${designs.length} Diseños`;

  const bannerTextInput = document.getElementById('qr-banner-text');

  designs.forEach(design => {
    const isSelected = currentDesign && currentDesign.id === design.id;
    const card = document.createElement('div');
    card.className = `design-card relative cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 text-center transition-all bg-slate-900/60 hover:bg-slate-800/80 ${
      isSelected ? 'active border-indigo-500 ring-2 ring-indigo-500/50 bg-slate-800' : 'border-slate-800 hover:border-slate-700'
    }`;
    card.dataset.id = design.id;

    const cardIconClass = design.iconName || 'fa-qrcode';
    const cardIconClr = design.iconColor || design.qrColor;
    const cardIconBgClr = design.iconBgColor || '#ffffff';
    const cardIconBorderClr = design.iconBorderColor || design.frameColor;

    card.innerHTML = `
      <div class="relative w-full h-16 rounded-lg flex items-center justify-center p-2 overflow-hidden border border-slate-700/50" style="background-color: ${design.bgColor}">
        <div class="w-10 h-10 rounded flex items-center justify-center border-2" style="border-color: ${cardIconBorderClr}; background-color: ${cardIconBgClr}">
          <i class="fa-solid ${cardIconClass} text-lg" style="color: ${cardIconClr}"></i>
        </div>
        ${design.bannerText ? `
          <div class="absolute top-1 text-[9px] font-bold px-1.5 py-0.5 rounded shadow" style="background-color: ${design.badgeBg}; color: ${design.badgeText}">
            ${design.bannerText.substring(0, 10)}
          </div>
        ` : ''}
      </div>
      <div class="w-full text-left">
        <h4 class="text-xs font-bold text-slate-200 truncate">${design.name}</h4>
        <p class="text-[10px] text-slate-400 truncate">${design.category}</p>
      </div>
      <div class="check-icon absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center transition-all opacity-0 scale-75">
        <i class="fa-solid fa-check"></i>
      </div>
    `;

    card.addEventListener('click', () => {
      document.querySelectorAll('.design-card').forEach(c => c.classList.remove('active', 'border-indigo-500', 'ring-2', 'ring-indigo-500/50', 'bg-slate-800'));
      card.classList.add('active', 'border-indigo-500', 'ring-2', 'ring-indigo-500/50', 'bg-slate-800');
      
      currentDesign = { ...design };
      if (design.dotStyle) {
        currentPattern = design.dotStyle;
        renderPatternGrid(patternsList);
      }
      syncCustomizerInputs(currentDesign);
      generateQR();
      showToast('Diseño Seleccionado', `Plantilla de ${design.category}: "${design.name}"`, 'info');
    });

    grid.appendChild(card);
  });
}

// Render Pattern Selector Cards Grid
function renderPatternGrid(patterns) {
  const grid = document.getElementById('pattern-grid');
  if (!grid) return;
  grid.innerHTML = '';

  patterns.forEach(pattern => {
    const isSelected = currentPattern === pattern.id;
    const card = document.createElement('div');
    card.className = `pattern-card cursor-pointer border rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5 text-center transition-all text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 ${
      isSelected ? 'active border-pink-500 ring-2 ring-pink-500/40 bg-slate-800 text-white font-bold' : 'border-slate-800 hover:border-slate-700'
    }`;
    card.dataset.id = pattern.id;

    card.innerHTML = `
      <div class="w-7 h-7 rounded-lg bg-slate-800/90 flex items-center justify-center text-pink-400 text-sm shadow">
        <i class="fa-solid ${pattern.icon}"></i>
      </div>
      <span class="text-[11px] font-medium leading-tight truncate w-full">${pattern.name}</span>
    `;

    card.addEventListener('click', () => {
      document.querySelectorAll('.pattern-card').forEach(c => c.classList.remove('active', 'border-pink-500', 'ring-2', 'ring-pink-500/40', 'bg-slate-800', 'text-white'));
      card.classList.add('active', 'border-pink-500', 'ring-2', 'ring-pink-500/40', 'bg-slate-800', 'text-white');
      
      currentPattern = pattern.id;
      if (currentDesign) currentDesign.dotStyle = pattern.id;
      generateQR();
      showToast('Patrón Seleccionado', `Forma de módulos: "${pattern.name}"`, 'pink');
    });

    grid.appendChild(card);
  });
}

function syncCustomizerInputs(design) {
  if (!design) return;

  if (document.getElementById('custom-qr-color')) document.getElementById('custom-qr-color').value = design.qrColor || '#111827';
  if (document.getElementById('custom-bg-color')) document.getElementById('custom-bg-color').value = design.bgColor || '#ffffff';
  if (document.getElementById('custom-frame-color')) document.getElementById('custom-frame-color').value = design.frameColor || '#2563eb';
  if (document.getElementById('custom-eye-style')) document.getElementById('custom-eye-style').value = design.eyeStyle || 'square';

  if (document.getElementById('custom-qr-color-hex')) document.getElementById('custom-qr-color-hex').textContent = design.qrColor || '#111827';
  if (document.getElementById('custom-bg-color-hex')) document.getElementById('custom-bg-color-hex').textContent = design.bgColor || '#ffffff';
  if (document.getElementById('custom-frame-color-hex')) document.getElementById('custom-frame-color-hex').textContent = design.frameColor || '#2563eb';

  // Icon & Icon Box
  if (design.iconName && document.getElementById('qr-icon-name')) {
    document.getElementById('qr-icon-name').value = design.iconName;
    const activeLabel = document.getElementById('active-icon-label');
    if (activeLabel) {
      const cleanName = design.iconName.replace(/^fa-/, '').toUpperCase();
      activeLabel.textContent = `Seleccionado: ${cleanName}`;
    }
  }

  if (document.getElementById('qr-icon-color')) {
    const iconClr = design.iconColor || design.frameColor || '#2563eb';
    document.getElementById('qr-icon-color').value = iconClr;
    if (document.getElementById('qr-icon-color-hex')) document.getElementById('qr-icon-color-hex').textContent = iconClr;
  }

  if (document.getElementById('qr-icon-bg-color')) {
    const iconBgClr = design.iconBgColor || '#ffffff';
    document.getElementById('qr-icon-bg-color').value = iconBgClr;
    if (document.getElementById('qr-icon-bg-hex')) document.getElementById('qr-icon-bg-hex').textContent = iconBgClr;
  }

  if (document.getElementById('qr-icon-border-color')) {
    const iconBorderClr = design.iconBorderColor || design.frameColor || '#2563eb';
    document.getElementById('qr-icon-border-color').value = iconBorderClr;
    if (document.getElementById('qr-icon-border-hex')) document.getElementById('qr-icon-border-hex').textContent = iconBorderClr;
  }

  // Banner Text & Fonts
  if (design.bannerText && document.getElementById('qr-banner-text')) {
    document.getElementById('qr-banner-text').value = design.bannerText;
  }

  if (design.fontTitle && document.getElementById('qr-title-font')) {
    document.getElementById('qr-title-font').value = design.fontTitle;
  }

  if (design.fontBanner && document.getElementById('qr-banner-font')) {
    document.getElementById('qr-banner-font').value = design.fontBanner;
  }

  renderIconPickerGrid();

  const tFontInput = document.getElementById('qr-title-font');
  const bFontInput = document.getElementById('qr-banner-font');
  const tInput = document.getElementById('qr-title');
  const bTextInput = document.getElementById('qr-banner-text');

  if (tFontInput && tInput) {
    const val = tFontInput.value || 'Plus Jakarta Sans';
    tFontInput.style.fontFamily = `'${val}', sans-serif`;
    tInput.style.fontFamily = `'${val}', sans-serif`;
  }
  if (bFontInput && bTextInput) {
    const val = bFontInput.value || 'Plus Jakarta Sans';
    bFontInput.style.fontFamily = `'${val}', sans-serif`;
    bTextInput.style.fontFamily = `'${val}', sans-serif`;
  }
}

function scheduleGenerateQR() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => generateQR(), 120);
}

// Generate QR Code via server API
async function generateQR(targetWidth = 600) {
  const canvas = document.getElementById('qr-canvas');
  if (!canvas) return;

  const loader = document.getElementById('canvas-loader');
  if (loader) loader.classList.remove('hidden');

  const rawUrl = document.getElementById('qr-url').value.trim() || 'Escribe o pega tu enlace';
  let formattedUrl = rawUrl;
  if (!/^https?:\/\//i.test(formattedUrl) && !/^mailto:/i.test(formattedUrl) && !/^tel:/i.test(formattedUrl)) {
    formattedUrl = 'https://' + formattedUrl;
  }

  const title = document.getElementById('qr-title').value.trim() || 'Escribe o pega el texto del titulo';
  const bannerTextInput = document.getElementById('qr-banner-text');
  const bannerText = bannerTextInput ? bannerTextInput.value.trim() : 'Escanéame';

  const titleFontInput = document.getElementById('qr-title-font');
  const bannerFontInput = document.getElementById('qr-banner-font');

  const fontTitle = titleFontInput ? titleFontInput.value : 'Plus Jakarta Sans';
  const fontBanner = bannerFontInput ? bannerFontInput.value : 'Plus Jakarta Sans';

  const iconShowInput = document.getElementById('qr-icon-show');
  const iconBgColorInput = document.getElementById('qr-icon-bg-color');
  const iconBorderColorInput = document.getElementById('qr-icon-border-color');
  const iconSizeInput = document.getElementById('qr-icon-size');
  const iconNameInput = document.getElementById('qr-icon-name');
  const iconPosInput = document.getElementById('qr-icon-position');
  const iconColorInput = document.getElementById('qr-icon-color');

  const showIcon = iconShowInput ? iconShowInput.checked : true;
  const iconBgColor = iconBgColorInput ? iconBgColorInput.value : '#ffffff';
  const iconBorderColor = iconBorderColorInput ? iconBorderColorInput.value : '#2563eb';
  const iconSize = iconSizeInput ? parseInt(iconSizeInput.value, 10) : 34;
  const iconName = iconNameInput ? iconNameInput.value.trim() : 'fa-qrcode';
  const iconPosition = iconPosInput ? iconPosInput.value : 'center';
  const iconColor = iconColorInput ? iconColorInput.value : '#2563eb';

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: formattedUrl,
        title: title,
        bannerText: bannerText,
        designId: currentDesign ? currentDesign.id : 'design-institucional-1',
        customColors: {
          bgColor: currentDesign ? currentDesign.bgColor : '#ffffff',
          qrColor: currentDesign ? currentDesign.qrColor : '#111827',
          frameColor: currentDesign ? currentDesign.frameColor : '#2563eb',
          textColor: currentDesign ? currentDesign.textColor : '#111827',
          badgeBg: currentDesign ? currentDesign.badgeBg : '#2563eb',
          badgeText: currentDesign ? currentDesign.badgeText : '#ffffff'
        },
        customDotStyle: currentPattern,
        customEyeStyle: currentDesign ? currentDesign.eyeStyle : 'square',
        targetWidth: targetWidth,
        fontTitle: fontTitle,
        fontBanner: fontBanner,
        showIcon: showIcon,
        iconMode: currentIconMode,
        iconName: iconName,
        iconPosition: iconPosition,
        iconColor: iconColor,
        iconBgColor: iconBgColor,
        iconBorderColor: iconBorderColor,
        iconSize: iconSize,
        customLogoDataUrl: customLogoDataUrl
      })
    });

    const data = await res.json();
    if (data.success && data.image) {
      currentQRDataUrl = data.image;

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, img.width, img.height);
        ctx.drawImage(img, 0, 0);

        if (loader) loader.classList.add('hidden');
      };
      img.src = data.image;
      return data.image;
    }
  } catch (err) {
    console.error('API Error during QR generation:', err);
    if (loader) loader.classList.add('hidden');
  }
}

// Download QR as PNG
async function downloadQR(format = 'png', resolution = 800) {
  const title = document.getElementById('qr-title').value.trim() || 'Codigo_QR';
  const cleanTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

  const loader = document.getElementById('canvas-loader');
  if (loader) loader.classList.remove('hidden');

  try {
    const rawUrl = document.getElementById('qr-url').value.trim() || 'https://qrfy.com';
    let formattedUrl = rawUrl;
    if (!/^https?:\/\//i.test(formattedUrl) && !/^mailto:/i.test(formattedUrl) && !/^tel:/i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }
    const bannerTextInput = document.getElementById('qr-banner-text');
    const bannerText = bannerTextInput ? bannerTextInput.value.trim() : 'Escanéame';
    
    const fontTitle = document.getElementById('qr-title-font') ? document.getElementById('qr-title-font').value : 'Plus Jakarta Sans';
    const fontBanner = document.getElementById('qr-banner-font') ? document.getElementById('qr-banner-font').value : 'Plus Jakarta Sans';

    const iconShowInput = document.getElementById('qr-icon-show');
    const iconBgColorInput = document.getElementById('qr-icon-bg-color');
    const iconBorderColorInput = document.getElementById('qr-icon-border-color');
    const iconSizeInput = document.getElementById('qr-icon-size');
    const iconNameInput = document.getElementById('qr-icon-name');
    const iconPosInput = document.getElementById('qr-icon-position');
    const iconColorInput = document.getElementById('qr-icon-color');

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: formattedUrl,
        title: title,
        bannerText: bannerText,
        designId: currentDesign ? currentDesign.id : 'design-institucional-1',
        customColors: {
          bgColor: currentDesign ? currentDesign.bgColor : '#ffffff',
          qrColor: currentDesign ? currentDesign.qrColor : '#111827',
          frameColor: currentDesign ? currentDesign.frameColor : '#2563eb',
          textColor: currentDesign ? currentDesign.textColor : '#111827',
          badgeBg: currentDesign ? currentDesign.badgeBg : '#2563eb',
          badgeText: currentDesign ? currentDesign.badgeText : '#ffffff'
        },
        customDotStyle: currentPattern,
        customEyeStyle: currentDesign ? currentDesign.eyeStyle : 'square',
        targetWidth: resolution,
        fontTitle: fontTitle,
        fontBanner: fontBanner,
        showIcon: iconShowInput ? iconShowInput.checked : true,
        iconMode: currentIconMode,
        iconName: iconNameInput ? iconNameInput.value.trim() : 'fa-qrcode',
        iconPosition: iconPosInput ? iconPosInput.value : 'center',
        iconColor: iconColorInput ? iconColorInput.value : '#2563eb',
        iconBgColor: iconBgColorInput ? iconBgColorInput.value : '#ffffff',
        iconBorderColor: iconBorderColorInput ? iconBorderColorInput.value : '#2563eb',
        iconSize: iconSizeInput ? parseInt(iconSizeInput.value, 10) : 34,
        customLogoDataUrl: customLogoDataUrl
      })
    });

    const data = await res.json();
    if (data.success && data.image) {
      const savedUserStr = localStorage.getItem('oauth_user');
      const currentUserEmail = savedUserStr ? JSON.parse(savedUserStr).email : null;

      const trackRes = await fetch('/api/track-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUserEmail,
          title: title,
          url: formattedUrl,
          format: format,
          resolution: resolution,
          imageDataUrl: data.image
        })
      });

      const trackData = await trackRes.json();
      if (!trackData.success && trackData.limitReached) {
        showToast('Límite de Descargas', trackData.message, 'info');
        if (loader) loader.classList.add('hidden');
        return;
      }

      const link = document.createElement('a');
      link.download = `QR_${cleanTitle}_${resolution}px.${format}`;
      link.href = data.image;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (currentUserEmail && savedUserStr) {
        updateUserWidget(JSON.parse(savedUserStr));
      }
      loadAndRenderHistoryTable();
    }
  } catch (err) {
    console.error('Error downloading QR PNG:', err);
  } finally {
    if (loader) loader.classList.add('hidden');
  }
}

// Download QR as Vector SVG
function downloadSvgQR() {
  const url = document.getElementById('qr-url').value.trim() || 'https://qrfy.com';
  const title = document.getElementById('qr-title').value.trim() || 'Codigo QR';
  const bannerTextInput = document.getElementById('qr-banner-text');
  const bannerText = bannerTextInput ? bannerTextInput.value.trim() : 'Escanéame';
  const cleanTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

  try {
    const qrData = QRCode.create(url, { errorCorrectionLevel: 'H' });
    const modules = qrData.modules;
    const size = modules.size;

    const bgColor = currentDesign ? currentDesign.bgColor : '#ffffff';
    const qrColor = currentDesign ? currentDesign.qrColor : '#111827';
    const frameColor = currentDesign ? currentDesign.frameColor : '#2563eb';
    const textColor = currentDesign ? currentDesign.textColor : frameColor;

    const width = 600;
    const height = 760;
    const qrAreaSize = 340;
    const qrX = (width - qrAreaSize) / 2;
    const qrY = 175;
    const cellSize = qrAreaSize / size;

    let rectsSvg = '';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (modules.get(r, c)) {
          const x = qrX + c * cellSize;
          const y = qrY + r * cellSize;
          rectsSvg += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" fill="${qrColor}" rx="2" />\n`;
        }
      }
    }

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <style>
    .title-text { font-family: sans-serif; font-weight: bold; font-size: 24px; fill: ${textColor}; text-anchor: middle; }
    .banner-text { font-family: sans-serif; font-weight: bold; font-size: 16px; fill: #ffffff; text-anchor: middle; }
  </style>
  <rect width="${width}" height="${height}" fill="${bgColor}" />
  <rect x="35" y="35" width="530" height="690" rx="24" fill="none" stroke="${frameColor}" stroke-width="4" />
  <rect x="170" y="13" width="260" height="44" rx="22" fill="${frameColor}" />
  <text x="300" y="40" class="banner-text">${escapeXml(bannerText)}</text>
  <rect x="${qrX - 16}" y="${qrY - 16}" width="${qrAreaSize + 32}" height="${qrAreaSize + 32}" rx="18" fill="#ffffff" />
  ${rectsSvg}
  <text x="300" y="580" class="title-text">${escapeXml(title)}</text>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `QR_${cleanTitle}.svg`;
    link.href = blobUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (e) {
    console.error('Error exporting SVG:', e);
  }
}

// Toast Notification System
function showToast(title, message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-msg pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start gap-3 bg-slate-900/95 backdrop-blur-md text-slate-100 ${
    type === 'success' ? 'border-emerald-500/40 text-emerald-400' :
    type === 'purple' ? 'border-purple-500/40 text-purple-400' :
    type === 'pink' ? 'border-pink-500/40 text-pink-400' :
    'border-indigo-500/40 text-indigo-400'
  }`;

  const iconClass = type === 'success' ? 'fa-circle-check text-emerald-400' :
                    type === 'purple' ? 'fa-wand-magic-sparkles text-purple-400' :
                    type === 'pink' ? 'fa-shapes text-pink-400' : 'fa-circle-info text-indigo-400';

  toast.innerHTML = `
    <div class="mt-0.5 text-base">
      <i class="fa-solid ${iconClass}"></i>
    </div>
    <div class="flex-1">
      <h4 class="text-xs font-bold text-slate-100">${escapeXml(title)}</h4>
      <p class="text-[11px] text-slate-300 mt-0.5 leading-snug">${escapeXml(message)}</p>
    </div>
    <button type="button" class="text-slate-500 hover:text-slate-300 text-xs ml-1" onclick="this.parentElement.remove()">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-leave');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}
