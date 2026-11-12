/**
 * MiniEditor - Controlador para el mini-editor demostrativo en la Home.
 * Permite a cualquier usuario generar un QR de prueba sin restricciones ni registro,
 * y transferir los datos precargados al editor avanzado (/editor?url=...&preset=...).
 */
export class MiniEditor {
  constructor() {
    this.section = null;
    this.input = null;
    this.btn = null;
    this.btnText = null;
    this.idleView = null;
    this.loadingView = null;
    this.qrImg = null;
    this.errorView = null;
    this.errorMsg = null;
    this.actions = null;
    this.btnCustomize = null;
    this.btnDownload = null;
    this.chips = [];
    
    this.currentPreset = 'restaurante';
    this.currentUrl = '';
    this.currentBlobUrl = null;
    this.isGenerating = false;
  }

  mount() {
    this.section = document.getElementById('mini-editor');
    if (!this.section) return;

    this.input = document.getElementById('mini-qr-input');
    this.btn = document.getElementById('mini-qr-btn');
    this.btnText = document.getElementById('mini-qr-btn-text');
    this.idleView = document.getElementById('mini-idle-view');
    this.loadingView = document.getElementById('mini-loading-view');
    this.qrImg = document.getElementById('mini-qr-img');
    this.errorView = document.getElementById('mini-error-view');
    this.errorMsg = document.getElementById('mini-error-msg');
    this.actions = document.getElementById('mini-actions');
    this.btnCustomize = document.getElementById('mini-btn-customize');
    this.btnDownload = document.getElementById('mini-btn-download');
    this.chips = Array.from(this.section.querySelectorAll('.mini-preset-chip'));

    if (!this.input || !this.btn) return;

    // 1. Manejo de escritura (Typing state)
    this.input.addEventListener('input', () => {
      const val = this.input.value.trim();
      if (val.length >= 1 && !this.isGenerating) {
        this.btn.disabled = false;
      } else {
        this.btn.disabled = true;
      }
    });

    // 2. Tecla Enter ejecuta generación
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!this.btn.disabled && !this.isGenerating) {
          this.generate();
        }
      }
    });

    // 3. Clic en botón Generar
    this.btn.addEventListener('click', () => {
      if (!this.isGenerating) {
        this.generate();
      }
    });

    // 4. Selección de Presets / Sectores
    this.chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const preset = chip.dataset.preset || 'generico';
        this.setPreset(preset);
      });
    });

    // 5. Botón de Descarga PNG
    if (this.btnDownload) {
      this.btnDownload.addEventListener('click', () => {
        this.downloadPng();
      });
    }
  }

  setPreset(preset) {
    this.currentPreset = preset;

    // Actualizar estilos visuales de chips
    this.chips.forEach(c => {
      const isActive = c.dataset.preset === preset;
      if (isActive) {
        c.className = 'mini-preset-chip px-2.5 py-1 rounded-lg font-semibold text-[11px] transition cursor-pointer bg-indigo-600 text-white shadow-xs';
      } else {
        c.className = 'mini-preset-chip px-2.5 py-1 rounded-lg font-semibold text-[11px] transition cursor-pointer text-slate-300 hover:text-white hover:bg-slate-700/60';
      }
    });

    // Actualizar enlace de personalización si ya hay URL
    if (this.currentUrl) {
      this.updateCustomizeLink(this.currentUrl, this.currentPreset);
    }
  }

  normalizeUrl(raw) {
    let text = raw.trim();
    if (!text) return '';
    // Si no contiene un protocolo o esquema (http://, https://, mailto:, tel:, WIFI:), añadir https://
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(text)) {
      text = 'https://' + text;
    }
    return text;
  }

  updateCustomizeLink(url, preset) {
    if (this.btnCustomize) {
      this.btnCustomize.href = `/editor?url=${encodeURIComponent(url)}&preset=${encodeURIComponent(preset)}`;
    }
  }

  async generate() {
    const rawVal = this.input ? this.input.value.trim() : '';
    if (!rawVal) return;

    if (rawVal.length > 500) {
      this.showError('El texto no debe superar los 500 caracteres para asegurar la escaneabilidad del código.');
      return;
    }

    const normalizedUrl = this.normalizeUrl(rawVal);
    this.currentUrl = normalizedUrl;
    this.isGenerating = true;

    // Cambiar a estado Loading
    this.showLoading();

    // Controlador de timeout (5 segundos)
    const abortController = new AbortController();
    const timeoutTimer = setTimeout(() => {
      if (this.isGenerating) {
        if (this.errorMsg) {
          this.errorMsg.textContent = 'Esto está tardando más de lo normal... Inténtalo de nuevo.';
        }
      }
      abortController.abort();
    }, 5000);

    // Mapear preset a diseño predeterminado
    let designId = 'design-gastronomia-1';
    if (this.currentPreset === 'salon') designId = 'design-belleza-1';
    else if (this.currentPreset === 'comercio') designId = 'design-compras-1';
    else if (this.currentPreset === 'generico') designId = 'design-gastronomia-1';

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: normalizedUrl,
          isExplicitGenerate: false, // Vista previa gratuita sin autenticación ni consumo de cuota
          designId: designId,
          targetWidth: 500
        }),
        signal: abortController.signal
      });

      clearTimeout(timeoutTimer);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const blob = await response.blob();
      if (this.currentBlobUrl) {
        URL.revokeObjectURL(this.currentBlobUrl);
      }
      this.currentBlobUrl = URL.createObjectURL(blob);

      // Mostrar estado de éxito
      this.showSuccess(this.currentBlobUrl);
      this.updateCustomizeLink(normalizedUrl, this.currentPreset);

    } catch (err) {
      clearTimeout(timeoutTimer);
      console.warn('[MiniEditor] Error al generar código QR:', err);
      const isTimeout = err.name === 'AbortError';
      const msg = isTimeout 
        ? 'Esto está tardando más de lo normal. Por favor reintenta.' 
        : 'No pudimos generar el QR. Inténtalo de nuevo.';
      this.showError(msg);
    } finally {
      this.isGenerating = false;
    }
  }

  showLoading() {
    if (this.idleView) this.idleView.classList.add('hidden');
    if (this.qrImg) this.qrImg.classList.add('hidden');
    if (this.errorView) this.errorView.classList.add('hidden');
    if (this.actions) this.actions.classList.add('hidden');
    if (this.loadingView) {
      this.loadingView.classList.remove('hidden');
      this.loadingView.classList.add('flex');
    }

    if (this.btn) {
      this.btn.disabled = true;
      if (this.btnText) this.btnText.textContent = 'Generando...';
    }
  }

  showSuccess(blobUrl) {
    if (this.loadingView) {
      this.loadingView.classList.remove('flex');
      this.loadingView.classList.add('hidden');
    }
    if (this.idleView) this.idleView.classList.add('hidden');
    if (this.errorView) this.errorView.classList.add('hidden');

    if (this.qrImg) {
      this.qrImg.src = blobUrl;
      this.qrImg.classList.remove('hidden');
    }

    if (this.actions) {
      this.actions.classList.remove('hidden');
      this.actions.classList.add('flex');
    }

    if (this.btn) {
      this.btn.disabled = false;
      if (this.btnText) this.btnText.textContent = 'Regenerar QR';
    }
  }

  showError(message) {
    if (this.loadingView) {
      this.loadingView.classList.remove('flex');
      this.loadingView.classList.add('hidden');
    }
    if (this.idleView) this.idleView.classList.add('hidden');
    if (this.qrImg) this.qrImg.classList.add('hidden');
    if (this.actions) this.actions.classList.add('hidden');

    if (this.errorMsg) {
      this.errorMsg.textContent = message || 'No pudimos generar el QR. Inténtalo de nuevo.';
    }
    if (this.errorView) {
      this.errorView.classList.remove('hidden');
    }

    if (this.btn) {
      this.btn.disabled = false;
      if (this.btnText) this.btnText.textContent = 'Reintentar';
    }
  }

  downloadPng() {
    if (!this.currentBlobUrl) return;
    const a = document.createElement('a');
    a.href = this.currentBlobUrl;
    a.download = `qrbey-${this.currentPreset}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
