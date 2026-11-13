/**
 * LiveAIChatWidget.js — QRbey 24/7 Omnichannel AI Chat Widget
 * Autores: supportAgent, frontAgent, iconAgent & securityAgent (DevTeam)
 * Versión: v1.11.0
 */

(function () {
  if (window.LiveAIChatWidgetLoaded) return;
  window.LiveAIChatWidgetLoaded = true;

  const STORAGE_KEY = 'qrbey_chat_session';

  class LiveAIChatWidget {
    constructor() {
      this.isOpen = false;
      this.isTyping = false;
      this.conversationId = this.getOrCreateConversationId();
      this.messages = this.loadStoredMessages();
      this.whatsappLink = null;
      this.whatsappEnabled = false;
      this.whatsappFormatted = null;

      this.init();
    }

    getOrCreateConversationId() {
      let id = sessionStorage.getItem(STORAGE_KEY + '_id');
      if (!id) {
        id = 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        sessionStorage.setItem(STORAGE_KEY + '_id', id);
      }
      return id;
    }

    loadStoredMessages() {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY + '_msgs');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.warn('Error al cargar mensajes guardados:', e);
      }
      return [
        {
          sender: 'bot',
          text: '¡Hola! 👋 Soy el asistente virtual de **QRbey**. Estoy aquí 24/7 para ayudarte con tus diseños de códigos QR, planes, descargas y métodos de pago. ¿En qué puedo orientarte hoy?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
    }

    saveMessages() {
      try {
        sessionStorage.setItem(STORAGE_KEY + '_msgs', JSON.stringify(this.messages));
      } catch (e) {
        console.warn('Error al guardar mensajes:', e);
      }
    }

    async fetchConfig() {
      try {
        const res = await fetch('/api/support/config');
        if (res.ok) {
          const data = await res.json();
          this.whatsappEnabled = !!data.whatsappEnabled;
          this.whatsappLink = data.whatsappLink || null;
          this.whatsappFormatted = data.whatsappFormatted || null;
          this.supportEmail = data.supportEmail || 'soporte@qrbey.com';
          this.facebookUrl = (data.social && data.social.facebook) || 'https://www.facebook.com/qrbey';
          this.instagramUrl = (data.social && data.social.instagram) || 'https://www.instagram.com/QR.bey/';

          const waHeaderBtn = document.getElementById('qrbey-chat-wa-header-btn');
          const waDisclaimer = document.getElementById('qrbey-chat-disclaimer-text');
          const footerWaBtn = document.getElementById('footer-whatsapp-btn');

          if (this.whatsappEnabled && this.whatsappLink) {
            if (waHeaderBtn) {
              waHeaderBtn.href = this.whatsappLink;
              waHeaderBtn.classList.remove('hidden');
            }
            if (waDisclaimer) {
              waDisclaimer.innerHTML = `Asistencia 24/7 con DeepSeek AI · WhatsApp <a href="${this.whatsappLink}" target="_blank" class="text-indigo-600 font-semibold hover:underline">${this.whatsappFormatted || ''}</a>`;
            }
            if (footerWaBtn) {
              footerWaBtn.href = this.whatsappLink;
              footerWaBtn.classList.remove('hidden');
            }
          } else {
            if (waHeaderBtn) waHeaderBtn.classList.add('hidden');
            if (waDisclaimer) {
              waDisclaimer.innerHTML = `Asistencia 24/7 con DeepSeek AI · Soporte: <a href="mailto:${this.supportEmail}" class="text-indigo-600 font-semibold hover:underline">${this.supportEmail}</a>`;
            }
            if (footerWaBtn) {
              footerWaBtn.classList.add('hidden');
            }
          }
        }
      } catch (e) {
        // Fallback silencioso
      }
    }

    init() {
      this.injectStyles();
      this.renderWidget();
      this.attachEvents();
      this.fetchConfig();
      this.renderMessages();
    }

    injectStyles() {
      if (document.getElementById('qrbey-chat-styles')) return;
      const style = document.createElement('style');
      style.id = 'qrbey-chat-styles';
      style.textContent = `
        #qrbey-chat-widget {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        @media (max-width: 640px) {
          #qrbey-chat-widget {
            bottom: 16px;
            right: 16px;
          }
        }
        .qrbey-chat-btn-glow {
          box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4), 0 8px 10px -6px rgba(79, 70, 229, 0.3);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .qrbey-chat-btn-glow:hover {
          transform: scale(1.06);
          box-shadow: 0 14px 28px -4px rgba(79, 70, 229, 0.5), 0 10px 14px -5px rgba(79, 70, 229, 0.4);
        }
        .qrbey-chat-window {
          position: fixed;
          bottom: 96px;
          right: 24px;
          width: 380px;
          max-width: calc(100vw - 32px);
          height: 520px;
          max-height: calc(100vh - 120px);
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: bottom right;
          z-index: 10000;
        }
        @media (max-width: 640px) {
          .qrbey-chat-window {
            bottom: 84px;
            right: 16px;
            width: calc(100vw - 32px);
            height: calc(100vh - 110px);
          }
        }
        .qrbey-chat-window.hidden {
          opacity: 0;
          pointer-events: none;
          transform: scale(0.9) translateY(20px);
        }
        .qrbey-typing-dot {
          animation: qrbeyBlink 1.4s infinite both;
          width: 6px;
          height: 6px;
          background-color: #6366f1;
          border-radius: 50%;
          display: inline-block;
        }
        .qrbey-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .qrbey-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes qrbeyBlink {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
        .qrbey-msg-bubble {
          word-break: break-word;
          line-height: 1.45;
          font-size: 13px;
        }
        .qrbey-msg-bubble p { margin: 0 0 6px 0; }
        .qrbey-msg-bubble p:last-child { margin-bottom: 0; }
        .qrbey-msg-bubble strong { font-weight: 700; color: inherit; }
        .qrbey-msg-bubble a { color: #4f46e5; text-decoration: underline; font-weight: 600; }
        .qrbey-msg-bubble a:hover { color: #3730a3; }
        .qrbey-chip {
          background: #f1f5f9;
          color: #334155;
          font-size: 11px;
          padding: 5px 10px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .qrbey-chip:hover {
          background: #e0e7ff;
          color: #4338ca;
          border-color: #c7d2fe;
          transform: translateY(-1px);
        }
      `;
      document.head.appendChild(style);
    }

    renderWidget() {
      const container = document.createElement('div');
      container.id = 'qrbey-chat-widget';

      container.innerHTML = `
        <!-- Botón Flotante Toggle -->
        <button id="qrbey-chat-toggle-btn" type="button" aria-label="Abrir Asistente Virtual 24/7"
          class="qrbey-chat-btn-glow w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white flex items-center justify-center cursor-pointer relative focus:outline-none border-2 border-white/80">
          <i id="qrbey-chat-icon-open" class="fa-solid fa-headset text-2xl"></i>
          <i id="qrbey-chat-icon-close" class="fa-solid fa-xmark text-2xl hidden"></i>
          
          <!-- Insignia 24/7 Pulse -->
          <span class="absolute -top-1 -right-1 flex h-4 w-4">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white text-[9px] font-bold text-white items-center justify-center"></span>
          </span>
        </button>

        <!-- Ventana Modal de Chat -->
        <div id="qrbey-chat-window" class="qrbey-chat-window hidden" role="dialog" aria-labelledby="qrbey-chat-title">
          <!-- Header -->
          <div class="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white p-3.5 px-4 flex items-center justify-between border-b border-indigo-500/30">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-lg text-white">
                <i class="fa-solid fa-robot"></i>
              </div>
              <div>
                <h3 id="qrbey-chat-title" class="font-bold text-sm leading-tight flex items-center gap-1.5">
                  <span>Asistente QRbey</span>
                  <span class="bg-emerald-400 text-slate-900 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">24/7</span>
                </h3>
                <p class="text-[11px] text-indigo-100 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block"></span>
                  <span>En línea · DeepSeek AI</span>
                </p>
              </div>
            </div>

            <!-- Botones de Acción en Header -->
            <div class="flex items-center gap-1.5">
              <a id="qrbey-chat-wa-header-btn" href="#" target="_blank" rel="noopener noreferrer"
                title="Hablar por WhatsApp con un Asesor Humano"
                class="hidden w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center text-sm transition shadow-xs">
                <i class="fa-brands fa-whatsapp"></i>
              </a>
              <button id="qrbey-chat-minimize-btn" type="button" title="Minimizar chat"
                class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition">
                <i class="fa-solid fa-chevron-down"></i>
              </button>
            </div>
          </div>

          <!-- Sugerencias Rápidas (Chips) -->
          <div class="bg-slate-50 border-b border-slate-100 p-2 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            <button type="button" class="qrbey-chip" data-prompt="¿Cuáles son los planes y precios?">💰 Planes y precios</button>
            <button type="button" class="qrbey-chip" data-prompt="¿Cómo personalizo los colores y logo de mi QR?">🎨 Personalizar QR</button>
            <button type="button" class="qrbey-chip" data-prompt="¿Qué métodos de pago aceptan?">💳 Pagos aceptados</button>
            <button type="button" class="qrbey-chip" data-prompt="Quiero hablar con un asesor humano">👤 Asesor humano</button>
          </div>

          <!-- Área de Mensajes -->
          <div id="qrbey-chat-messages" class="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/50">
            <!-- Los mensajes se renderizan dinámicamente -->
          </div>

          <!-- Indicador de Tipeo -->
          <div id="qrbey-chat-typing" class="hidden px-4 py-1.5 bg-slate-50/80 text-xs text-slate-500 flex items-center gap-2 border-t border-slate-100">
            <div class="flex items-center gap-1">
              <span class="qrbey-typing-dot"></span>
              <span class="qrbey-typing-dot"></span>
              <span class="qrbey-typing-dot"></span>
            </div>
            <span class="text-[11px] font-medium text-indigo-600">Asistente QRbey está escribiendo...</span>
          </div>

          <!-- Input Footer -->
          <form id="qrbey-chat-form" class="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
            <input type="text" id="qrbey-chat-input" placeholder="Escribe tu consulta aquí..." maxlength="400"
              class="flex-1 bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition" />
            <button type="submit" id="qrbey-chat-send-btn" aria-label="Enviar mensaje"
              class="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center justify-center transition shadow-xs cursor-pointer disabled:opacity-40">
              <i class="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </form>

          <!-- Disclaimer inferior -->
          <div class="bg-slate-50 px-3 py-1 text-center border-t border-slate-100">
            <p id="qrbey-chat-disclaimer-text" class="text-[10px] text-slate-400">
              Asistencia 24/7 con DeepSeek AI · Soporte: <a href="mailto:qrbyeconctact@gmail.com" class="text-indigo-600 font-semibold hover:underline">qrbyeconctact@gmail.com</a>
            </p>
          </div>
        </div>
      `;

      document.body.appendChild(container);
    }

    attachEvents() {
      const toggleBtn = document.getElementById('qrbey-chat-toggle-btn');
      const minimizeBtn = document.getElementById('qrbey-chat-minimize-btn');
      const form = document.getElementById('qrbey-chat-form');
      const input = document.getElementById('qrbey-chat-input');
      const chips = document.querySelectorAll('.qrbey-chip');

      toggleBtn.addEventListener('click', () => this.toggleChat());
      minimizeBtn.addEventListener('click', () => this.toggleChat(false));

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
          input.value = '';
          this.handleSendMessage(text);
        }
      });

      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          const prompt = chip.getAttribute('data-prompt');
          if (prompt) this.handleSendMessage(prompt);
        });
      });
    }

    toggleChat(forceState) {
      this.isOpen = (typeof forceState === 'boolean') ? forceState : !this.isOpen;
      const win = document.getElementById('qrbey-chat-window');
      const iconOpen = document.getElementById('qrbey-chat-icon-open');
      const iconClose = document.getElementById('qrbey-chat-icon-close');
      const input = document.getElementById('qrbey-chat-input');

      if (this.isOpen) {
        win.classList.remove('hidden');
        iconOpen.classList.add('hidden');
        iconClose.classList.remove('hidden');
        setTimeout(() => input.focus(), 150);
        this.scrollToBottom();
      } else {
        win.classList.add('hidden');
        iconOpen.classList.remove('hidden');
        iconClose.classList.add('hidden');
      }
    }

    formatMarkdown(text) {
      if (!text) return '';
      // Escape HTML
      let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      // Bold
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic
      html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Links
      html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
      // Line breaks
      html = html.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>');
      return `<p>${html}</p>`;
    }

    renderMessages() {
      const container = document.getElementById('qrbey-chat-messages');
      if (!container) return;

      container.innerHTML = this.messages.map(m => {
        const isBot = m.sender === 'bot';
        return `
          <div class="flex items-start gap-2 ${isBot ? '' : 'flex-row-reverse'}">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${isBot ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-white'}">
              <i class="fa-solid ${isBot ? 'fa-robot' : 'fa-user'}"></i>
            </div>
            <div class="max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs ${isBot ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs' : 'bg-indigo-600 text-white rounded-tr-xs'}">
              <div class="qrbey-msg-bubble">${this.formatMarkdown(m.text)}</div>
              <span class="block text-[10px] mt-1 text-right ${isBot ? 'text-slate-400' : 'text-indigo-200'}">${m.time || ''}</span>
            </div>
          </div>
        `;
      }).join('');

      this.scrollToBottom();
    }

    scrollToBottom() {
      const container = document.getElementById('qrbey-chat-messages');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }

    async handleSendMessage(text) {
      if (this.isTyping) return;

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.messages.push({ sender: 'user', text, time });
      this.saveMessages();
      this.renderMessages();

      // Mostrar estado escribiendo
      this.isTyping = true;
      const typingIndicator = document.getElementById('qrbey-chat-typing');
      if (typingIndicator) typingIndicator.classList.remove('hidden');
      this.scrollToBottom();

      try {
        const historyPayload = this.messages.slice(-6).map(m => ({
          role: m.sender === 'bot' ? 'assistant' : 'user',
          content: m.text
        }));

        const res = await fetch('/api/support/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            conversationId: this.conversationId,
            history: historyPayload
          })
        });

        const data = await res.json();
        const replyText = data.reply || (data.error ? `Lo sentimos: ${data.error}` : 'No se pudo obtener respuesta.');

        if (data.whatsappLink) {
          this.whatsappLink = data.whatsappLink;
          const waBtn = document.getElementById('qrbey-chat-wa-header-btn');
          if (waBtn) waBtn.href = data.whatsappLink;
        }

        this.messages.push({
          sender: 'bot',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      } catch (err) {
        const errorReply = [
          'Tuvimos un problema temporal de conexión. Puedes contactarnos a través de nuestros canales oficiales:\n',
          'Otros Medios de contacto:',
          `1. WhatsApp: ${this.whatsappLink || 'No disponible'}`,
          `2. Correo Electrónico: ${this.supportEmail || 'No disponible'}`,
          `3. Sitio web: ${window.location.origin}`,
          `4. Facebook: ${this.facebookUrl || 'https://www.facebook.com/qrbey'}`,
          `5. Instagram: ${this.instagramUrl || 'https://www.instagram.com/QR.bey/'}`
        ].join('\n');

        this.messages.push({
          sender: 'bot',
          text: errorReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      } finally {
        this.isTyping = false;
        if (typingIndicator) typingIndicator.classList.add('hidden');
        this.saveMessages();
        this.renderMessages();
      }
    }
  }

  // Inicializar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new LiveAIChatWidget());
  } else {
    new LiveAIChatWidget();
  }
})();
