const path = require('path');
const fs = require('fs');
const aiSupportRouter = require('../services/AISupportRouter');
const config = require('../config/env');

class SupportController {
  constructor() {
    this.storageFile = path.join(__dirname, '..', 'storage', 'support_conversations.json');
  }

  saveMessageToStorage(conversationId, userMsg, botReply, provider) {
    try {
      const storageDir = path.dirname(this.storageFile);
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }

      let data = {};
      if (fs.existsSync(this.storageFile)) {
        data = JSON.parse(fs.readFileSync(this.storageFile, 'utf8') || '{}');
      }

      if (!data[conversationId]) {
        data[conversationId] = {
          id: conversationId,
          startedAt: new Date().toISOString(),
          messages: []
        };
      }

      data[conversationId].messages.push({
        sender: 'user',
        text: userMsg,
        timestamp: new Date().toISOString()
      });

      data[conversationId].messages.push({
        sender: 'bot',
        text: botReply,
        provider: provider,
        timestamp: new Date().toISOString()
      });

      data[conversationId].updatedAt = new Date().toISOString();

      fs.writeFileSync(this.storageFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.warn('[SupportController] No se pudo guardar conversación:', e.message);
    }
  }

  async chat(req, res) {
    try {
      const { message, conversationId, history } = req.body || {};

      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({
          success: false,
          error: 'El mensaje no puede estar vacío.'
        });
      }

      const convId = conversationId || 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

      const result = await aiSupportRouter.processMessage({
        message: message.trim(),
        conversationId: convId,
        history: Array.isArray(history) ? history : []
      });

      // Guardar en bitácora
      this.saveMessageToStorage(convId, message.trim(), result.reply, result.provider);

      return res.json({
        success: true,
        reply: result.reply,
        provider: result.provider,
        conversationId: convId,
        whatsappLink: result.whatsappLink,
        escalated: !!result.escalated
      });
    } catch (err) {
      console.error('[SupportController Error ❌]:', err);
      return res.status(500).json({
        success: false,
        error: 'Ocurrió un error al procesar el mensaje.',
        whatsappLink: aiSupportRouter.generateWhatsAppLink()
      });
    }
  }

  getFaqs(req, res) {
    try {
      const faqs = aiSupportRouter.faqs;
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.json({ success: true, faqs });
    } catch (e) {
      return res.status(500).json({ success: false, error: 'Error al obtener FAQs' });
    }
  }

  getConfig(req, res) {
    try {
      const isEnabled = !!(config.support.whatsappEnabled && config.support.whatsappPhone);
      return res.json({
        success: true,
        whatsappEnabled: isEnabled,
        whatsappPhone: isEnabled ? config.support.whatsappPhone : null,
        whatsappFormatted: isEnabled ? `+${config.support.whatsappPhone}` : null,
        whatsappLink: isEnabled ? aiSupportRouter.generateWhatsAppLink() : null,
        supportEmail: config.support.supportEmail
      });
    } catch (e) {
      return res.status(500).json({ success: false, error: 'Error al obtener configuración de soporte' });
    }
  }

  /**
   * GET /api/webhooks/meta o /api/support/webhook/meta
   * Verificación del Handshake del Webhook de Meta (Messenger / Instagram)
   */
  verifyMetaWebhook(req, res) {
    try {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      const expectedToken = config.support.metaVerifyToken;

      if (mode && token) {
        if (mode === 'subscribe' && token === expectedToken) {
          console.log('✅ [Meta Webhook] Handshake verificado exitosamente por Meta.');
          return res.status(200).send(challenge);
        } else {
          console.warn(`⚠️ [Meta Webhook] Token de verificación inválido. Recibido: ${token}, Esperado: ${expectedToken}`);
          return res.sendStatus(403);
        }
      }
      return res.sendStatus(400);
    } catch (err) {
      console.error('❌ [Meta Webhook Error en Verificación]:', err.message);
      return res.sendStatus(500);
    }
  }

  /**
   * POST /api/webhooks/meta o /api/support/webhook/meta
   * Recepción de mensajes entrantes de Facebook Messenger / Instagram Direct
   */
  async handleMetaWebhook(req, res) {
    try {
      const body = req.body;

      if (body.object === 'page') {
        // Responder 200 OK inmediatamente a Meta para evitar reintentos y timeouts
        res.status(200).send('EVENT_RECEIVED');

        const entries = body.entry || [];
        for (const entry of entries) {
          const webhookEvents = entry.messaging || [];
          for (const event of webhookEvents) {
            const senderPsid = event.sender && event.sender.id;
            
            // Verificar si es un mensaje de texto de usuario (no un echo de la propia página)
            if (event.message && event.message.text && !event.message.is_echo) {
              const incomingText = event.message.text;
              console.log(`📩 [Messenger Recibido] De: ${senderPsid} | Texto: "${incomingText}"`);

              // Procesar a través de AISupportRouter (DeepSeek / Base de conocimiento)
              const aiResult = await aiSupportRouter.processMessage({
                message: incomingText,
                conversationId: `meta_${senderPsid}`,
                history: []
              });

              // Guardar en bitácora local
              this.saveMessageToStorage(`meta_${senderPsid}`, incomingText, aiResult.reply, aiResult.provider);

              // Responder a través de Meta Graph API
              await this.sendMetaMessage(senderPsid, aiResult.reply);
            }
          }
        }
        return;
      }

      return res.sendStatus(404);
    } catch (err) {
      console.error('❌ [Meta Webhook Error en Evento]:', err.message);
      if (!res.headersSent) {
        return res.sendStatus(500);
      }
    }
  }

  /**
   * Envía mensaje de respuesta al usuario en Facebook Messenger
   */
  async sendMetaMessage(recipientPsid, textReply) {
    const pageAccessToken = config.support.pageAccessToken;
    if (!pageAccessToken) {
      console.warn('⚠️ [Meta Webhook] PAGE_ACCESS_TOKEN no configurado en .env. El mensaje fue procesado por IA pero no se pudo enviar a Messenger.');
      return false;
    }

    try {
      const payload = {
        recipient: { id: recipientPsid },
        message: { text: textReply }
      };

      const response = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${encodeURIComponent(pageAccessToken)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('❌ [Meta Graph API Error]:', data);
        return false;
      }
      console.log(`📤 [Messenger Enviado] Respuesta entregada a ${recipientPsid} con éxito.`);
      return true;
    } catch (error) {
      console.error('❌ [Meta Send Error]:', error.message);
      return false;
    }
  }
}

module.exports = new SupportController();
