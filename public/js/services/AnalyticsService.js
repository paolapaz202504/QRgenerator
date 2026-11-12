/**
 * AnalyticsService — Servicio de Telemetría para Google Analytics 4 (GA4 / GTM)
 * Proporciona registro de eventos desacoplado y seguro ante adblockers o navegación privada.
 */
export class AnalyticsService {
  /**
   * Enviar un evento personalizado a Google Analytics 4
   * @param {string} eventName - Nombre del evento (ej. 'qr_generated', 'qr_downloaded', 'plan_view')
   * @param {Object} [params={}] - Parámetros del evento
   */
  static logEvent(eventName, params = {}) {
    try {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', eventName, {
          timestamp: new Date().toISOString(),
          ...params
        });
      }
    } catch (err) {
      console.warn('[AnalyticsService] No se pudo enviar el evento a GA4:', err.message);
    }
  }

  /**
   * Registrar evento de generación de código QR
   * @param {string} format - Formato ('png' | 'svg')
   * @param {string} [plan='free'] - Plan del usuario
   */
  static trackQrGeneration(format = 'png', plan = 'free') {
    this.logEvent('qr_generate', {
      event_category: 'Engagement',
      format,
      plan,
      value: 1
    });
  }

  /**
   * Registrar evento de descarga de código QR
   * @param {string} format - Formato descargado
   */
  static trackQrDownload(format = 'png') {
    this.logEvent('qr_download', {
      event_category: 'Conversion',
      format,
      value: 1
    });
  }

  /**
   * Registrar evento de vista o clic en modal de planes
   * @param {string} targetPlan - 'pro' | 'corporate'
   */
  static trackPlanView(targetPlan = 'pro') {
    this.logEvent('plan_view', {
      event_category: 'Monetization',
      target_plan: targetPlan
    });
  }
}
