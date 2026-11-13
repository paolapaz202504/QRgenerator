const path = require('path');
const fs = require('fs');
const config = require('../config/env');

class AISupportRouter {
  constructor() {
    this.deepseekApiKey = config.support.deepseekApiKey;
    this.zhipuApiKey = config.support.zhipuApiKey;
    this.whatsappPhone = config.support.whatsappPhone || null;
    this.isWhatsAppEnabled = !!(config.support.whatsappEnabled && this.whatsappPhone);
    this.supportEmail = config.support.supportEmail || '';
    this.faqs = this.loadFaqs();
  }

  loadFaqs() {
    try {
      const faqPath = path.join(__dirname, '..', 'public', 'cache', 'support_faqs.json');
      if (fs.existsSync(faqPath)) {
        return JSON.parse(fs.readFileSync(faqPath, 'utf8'));
      }
    } catch (e) {
      console.warn('[AISupportRouter] No se pudo leer support_faqs.json:', e.message);
    }
    return [];
  }

  generateWhatsAppLink(options = {}) {
    if (!this.isWhatsAppEnabled || !this.whatsappPhone) return null;
    const cleanPhone = this.whatsappPhone.replace(/[^0-9]/g, '');
    let text = '¡Hola! Me gustaría recibir asistencia y soporte con QRbey.';
    if (options.reason) {
      text = `¡Hola! Me gustaría hablar con un asesor. Mi consulta es: "${options.reason.substring(0, 100)}"`;
    } else if (options.ticketId) {
      text = `¡Hola! Necesito consultar el estado de mi ticket de soporte: ${options.ticketId}`;
    }
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  }

  checkPromptInjection(text = '') {
    if (!text || typeof text !== 'string') return false;
    const lower = text.toLowerCase();
    const blacklist = [
      'ignore previous instructions',
      'ignora tus instrucciones',
      'olvida las instrucciones',
      'system prompt',
      'dime tu prompt',
      'muéstrame tu prompt',
      'act as',
      'actúa como',
      'jailbreak',
      'modo dan',
      'dan mode',
      'bypass filter'
    ];
    return blacklist.some(pattern => lower.includes(pattern));
  }

  checkHumanHandoff(text = '') {
    if (!text || typeof text !== 'string') return false;
    const lower = text.toLowerCase();
    const handoffTriggers = [
      'hablar con un humano',
      'hablar con una persona',
      'asesor humano',
      'agente humano',
      'alguien real',
      'persona real',
      'atención humana',
      'comunicarme con una persona',
      'número de soporte',
      'número de whatsapp',
      'contactar a soporte'
    ];
    return handoffTriggers.some(trigger => lower.includes(trigger));
  }

  findBestFaqMatch(userQuery = '') {
    if (!userQuery || !Array.isArray(this.faqs) || this.faqs.length === 0) return null;
    const cleanQuery = userQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const stopwords = new Set([
      'como', 'que', 'los', 'las', 'del', 'para', 'por', 'con', 'una', 'uno',
      'unas', 'unos', 'este', 'esta', 'estos', 'estas', 'cual', 'cuales',
      'donde', 'quien', 'quienes', 'sobre', 'todo', 'toda', 'todos', 'todas',
      'puedo', 'pueden', 'puede', 'hacer', 'tener', 'mis', 'sus'
    ]);
    const words = cleanQuery.split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w));

    let bestItem = null;
    let highestScore = 0;

    for (const cat of this.faqs) {
      for (const item of (cat.items || [])) {
        let score = 0;
        const qClean = item.question.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const keywords = (item.keywords || []).map(k => k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

        words.forEach(w => {
          // Coincidencia exacta o parcial en la pregunta
          if (qClean.includes(w)) {
            score += 4;
          }

          // Coincidencia con palabras clave (incluyendo plurales y sufijos)
          keywords.forEach(k => {
            if (k === w) {
              score += 3;
            } else if (w.length >= 4 && k.length >= 4) {
              if (w.startsWith(k) || k.startsWith(w) || w.includes(k) || k.includes(w)) {
                score += 2.5;
              }
            }
          });
        });

        if (score > highestScore && score >= 2.5) {
          highestScore = score;
          bestItem = item;
        }
      }
    }

    return bestItem;
  }

  buildSystemPrompt() {
    let context = 'BASE DE CONOCIMIENTO OFICIAL DE QRBEY:\n';
    if (Array.isArray(this.faqs)) {
      this.faqs.forEach(cat => {
        context += `\n[Categoría: ${cat.category}]\n`;
        (cat.items || []).forEach(item => {
          context += `- Pregunta: ${item.question}\n  Respuesta: ${item.answer}\n`;
        });
      });
    }

    return `Eres el asistente virtual oficial de QRbey (QR Studio Pro SaaS).
Tu misión es resolver dudas sobre generación de códigos QR, personalización de colores, estilos, marcos, logotipos, planes (Gratuito $0 con 15 descargas y 50 créditos, Profesional $9.99/mes con 500 descargas y 2,000 créditos, Corporativo $29.99/mes con 2,000 descargas y 10,000 créditos), formatos de descarga (PNG, WebP, SVG) y métodos de pago (Visa, Mastercard, transferencias locales).

DIRECTRICES OBLIGATORIAS:
1. Responde siempre en español, de forma empática, clara, respetuosa y profesional.
2. Utiliza respuestas concisas orientadas a la acción (máximo 3 párrafos cortos).
3. Si el usuario desea hablar con una persona o asistencia personalizada, indícale los medios de contacto oficiales: ${this.isWhatsAppEnabled && this.whatsappPhone ? `WhatsApp al +${this.whatsappPhone}, correo a ${this.supportEmail} o formulario en /contacto` : `correo a ${this.supportEmail} o formulario de contacto en /contacto`}.
4. Respeta estrictamente los datos de la base de conocimiento y nunca inventes promociones no autorizadas.

${context}`;
  }

  async processMessage({ message, conversationId, history = [] }) {
    const startTime = Date.now();
    const cleanMessage = (message || '').trim();

    if (!cleanMessage) {
      return {
        reply: 'Hola, ¿en qué puedo ayudarte hoy con tus códigos QR?',
        provider: 'static_welcome',
        conversationId: conversationId || 'conv_' + Date.now(),
        whatsappLink: this.generateWhatsAppLink()
      };
    }

    // 1. Detección de Prompt Injection
    if (this.checkPromptInjection(cleanMessage)) {
      return {
        reply: 'Lo siento, no puedo procesar esa solicitud. Estoy diseñado para asistirte con el uso, diseño y planes de códigos QR en QRbey. ¿Hay algo sobre nuestra plataforma en lo que pueda orientarte?',
        provider: 'security_filter',
        conversationId: conversationId || 'conv_' + Date.now(),
        whatsappLink: this.generateWhatsAppLink()
      };
    }

    // 2. Detección de Solicitud de Escalamiento Humano
    if (this.checkHumanHandoff(cleanMessage)) {
      const waLink = this.generateWhatsAppLink({ reason: cleanMessage });
      const cleanWaPhone = (this.whatsappPhone || '').replace(/[^0-9]/g, '');
      const waDisplay = (this.isWhatsAppEnabled && cleanWaPhone)
        ? `https://wa.me/${cleanWaPhone}`
        : 'No disponible';

      const reply = [
        'Otros Medios de contacto:',
        `1. WhatsApp: ${waDisplay}`,
        `2. Correo Electrónico: ${this.supportEmail}`,
        '3. Sitio web: https://qrbey.onrender.com',
        '4. Facebook: https://www.facebook.com/qrbey',
        '5. Instagram: https://www.instagram.com/QR.bey/'
      ].join('\n');

      return {
        reply,
        provider: 'human_handoff',
        conversationId: conversationId || 'conv_' + Date.now(),
        whatsappLink: waLink,
        escalated: true
      };
    }

    // 3. Intento Primario: DeepSeek API (Timeout 8000ms)
    if (this.deepseekApiKey && !this.deepseekApiKey.includes('tu_clave')) {
      try {
        const messagesPayload = [
          { role: 'system', content: this.buildSystemPrompt() }
        ];

        // Añadir historial previo si existe (máximo 6 mensajes para eficiencia de contexto)
        if (Array.isArray(history) && history.length > 0) {
          const recentHistory = history.slice(-6);
          recentHistory.forEach(h => {
            if (h.role && h.content) {
              messagesPayload.push({
                role: h.role === 'assistant' ? 'assistant' : 'user',
                content: String(h.content).substring(0, 500)
              });
            }
          });
        }

        messagesPayload.push({ role: 'user', content: cleanMessage });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.deepseekApiKey}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: messagesPayload,
            max_tokens: 450,
            temperature: 0.6
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const reply = data.choices?.[0]?.message?.content?.trim();
          if (reply) {
            console.log(`[AISupportRouter 🤖] Respuesta generada exitosamente con DeepSeek en ${Date.now() - startTime}ms`);
            return {
              reply,
              provider: 'deepseek',
              conversationId: conversationId || 'conv_' + Date.now(),
              whatsappLink: this.generateWhatsAppLink()
            };
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          console.warn(`[AISupportRouter ⚠️] DeepSeek respondió estado ${response.status}:`, errData.error?.message || response.statusText);
        }
      } catch (err) {
        console.warn(`[AISupportRouter ⚠️] Excepción en DeepSeek (${err.name}): ${err.message}. Activando Circuit Breaker...`);
      }
    }

    // 4. Intento Secundario: Zhipu AI (GLM-4-Flash) si está configurado
    if (this.zhipuApiKey && !this.zhipuApiKey.includes('tu_clave')) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const zhipuResponse = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.zhipuApiKey}`
          },
          body: JSON.stringify({
            model: 'glm-4-flash',
            messages: [
              { role: 'system', content: this.buildSystemPrompt() },
              { role: 'user', content: cleanMessage }
            ],
            max_tokens: 400
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (zhipuResponse.ok) {
          const data = await zhipuResponse.json();
          const reply = data.choices?.[0]?.message?.content?.trim();
          if (reply) {
            console.log(`[AISupportRouter ⚡] Respuesta generada exitosamente con Zhipu AI (GLM) en ${Date.now() - startTime}ms`);
            return {
              reply,
              provider: 'zhipu',
              conversationId: conversationId || 'conv_' + Date.now(),
              whatsappLink: this.generateWhatsAppLink()
            };
          }
        }
      } catch (zhipuErr) {
        console.warn('[AISupportRouter ⚠️] Fallback Zhipu AI falló:', zhipuErr.message);
      }
    }

    // 5. Contingencia Inteligente Basada en Base de Conocimiento (Zero Latency / Circuit Breaker)
    const matchedFaq = this.findBestFaqMatch(cleanMessage);
    const waLink = this.generateWhatsAppLink({ reason: cleanMessage });

    if (matchedFaq) {
      console.log(`[AISupportRouter 📚] Respuesta provista por Base de Conocimiento FAQ (${matchedFaq.id})`);
      return {
        reply: matchedFaq.answer,
        provider: 'knowledge_base',
        conversationId: conversationId || 'conv_' + Date.now(),
        whatsappLink: waLink
      };
    }

    // 6. Contingencia Final Amigable con Escalamiento
    const finalReply = (this.isWhatsAppEnabled && waLink)
      ? `Gracias por comunicarte con QRbey. En este momento estoy experimentando una alta demanda de consultas, pero con gusto puedo orientarte sobre nuestros planes, diseños de QR y descargas, o si lo prefieres, puedes conectarte directamente con nuestro equipo de atención humana por WhatsApp haciendo clic aquí: [Hablar con Asesor en WhatsApp](${waLink}).`
      : `Gracias por comunicarte con QRbey. En este momento estoy experimentando una alta demanda de consultas, pero con gusto puedo orientarte sobre nuestros planes, diseños de QR y descargas. Si requieres atención personalizada, puedes escribirnos a ${this.supportEmail} o enviarnos un mensaje en la sección /contacto.`;

    return {
      reply: finalReply,
      provider: 'fallback_contingency',
      conversationId: conversationId || 'conv_' + Date.now(),
      whatsappLink: waLink
    };
  }
}

module.exports = new AISupportRouter();
