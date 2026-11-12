import { UIComponent } from './UIComponent.js';
import { appState } from '../state/AppState.js';
import { ApiService } from '../services/ApiService.js';
import { ModalService } from '../services/ModalService.js';
import { AnalyticsService } from '../services/AnalyticsService.js';

export class PlanModal extends UIComponent {
  constructor() {
    super('plan-modal');
    this.btnOpenPlans = document.getElementById('btn-open-plans');
    this.btnClosePlanModal = document.getElementById('btn-close-plan-modal');
    this.btnClosePlanFooter = document.getElementById('btn-close-plan-footer');

    this.btnSelectFree = document.getElementById('btn-select-free');
    this.btnBuyPro = document.getElementById('btn-buy-pro');
    this.btnBuyCorporate = document.getElementById('btn-buy-corporate');

    this.badgeFree = document.getElementById('badge-status-free');
    this.badgePro = document.getElementById('badge-status-pro');
    this.badgeCorporate = document.getElementById('badge-status-corporate');

    this.cardFree = document.getElementById('card-plan-free');
    this.cardPro = document.getElementById('card-plan-pro');
    this.cardCorporate = document.getElementById('card-plan-corporate');

    this.notificationBanner = document.getElementById('plan-notification-banner');
    this.notificationText = document.getElementById('plan-notification-text');
    this.btnDismissBanner = document.getElementById('btn-dismiss-plan-banner');

    this.durationInput = document.getElementById('plan-duration-months');
    this.btnMonthMinus = document.getElementById('btn-month-minus');
    this.btnMonthPlus = document.getElementById('btn-month-plus');

    this.expiryProContainer = document.getElementById('expiry-pro-container');
    this.expiryCorpContainer = document.getElementById('expiry-corp-container');

    appState.subscribe((state, eventKey) => {
      if (['USER_LOGGED_IN', 'USER_LOGGED_OUT', 'PLAN_UPDATED', 'INIT_DATA'].includes(eventKey)) {
        this.updateActivePlanUI(state.user);
      }
    });
  }

  async openModal() {
    if (!this.container) this.container = document.getElementById('plan-modal');
    const state = appState.getState();
    if (state.user && state.user.email) {
      try {
        const res = await ApiService.getUserStats(state.user.email);
        if (res.success && res.userStats) {
          appState.setState({ user: { ...state.user, ...res.userStats } }, 'PLAN_UPDATED');
        }
      } catch (e) {
        console.warn('Error refrescando stats al abrir planes:', e);
      }
    }
    if (this.container) this.container.classList.remove('hidden');
    AnalyticsService.trackPlanView('all');
    this.updateDurationAndPrices();
    this.updateActivePlanUI(appState.getState().user);
  }

  closeModal() {
    if (!this.container) this.container = document.getElementById('plan-modal');
    if (this.container) this.container.classList.add('hidden');
  }

  bindEvents() {
    if (this.btnOpenPlans) {
      this.btnOpenPlans.addEventListener('click', (e) => {
        if (e) e.preventDefault();
        this.openModal();
      });
    }

    if (this.btnClosePlanModal) {
      this.btnClosePlanModal.addEventListener('click', (e) => {
        if (e) e.preventDefault();
        this.closeModal();
      });
    }

    if (this.btnClosePlanFooter) {
      this.btnClosePlanFooter.addEventListener('click', (e) => {
        if (e) e.preventDefault();
        this.closeModal();
      });
    }

    document.querySelectorAll('#btn-dismiss-plan-banner, .btn-dismiss-plan-banner').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#plan-notification-banner, .plan-notification-banner').forEach(b => b.classList.add('hidden'));
      });
    });

    // Sincronización bidireccional de selector de duración (Meses)
    const syncDuration = (val) => {
      let months = parseInt(val, 10);
      if (isNaN(months) || months < 1) months = 1;
      if (months > 60) months = 60;
      document.querySelectorAll('#plan-duration-months, .plan-duration-input').forEach(input => {
        input.value = months;
      });
      this.updateDurationAndPrices(months);
    };

    document.querySelectorAll('#plan-duration-months, .plan-duration-input').forEach(input => {
      ['change', 'input'].forEach(evt => {
        input.addEventListener(evt, (e) => {
          syncDuration(e.target.value);
        });
      });
    });

    document.querySelectorAll('#btn-month-minus, .btn-month-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.querySelector('#plan-duration-months, .plan-duration-input');
        let current = parseInt(input ? input.value : '1', 10) || 1;
        if (current > 1) {
          syncDuration(current - 1);
        }
      });
    });

    document.querySelectorAll('#btn-month-plus, .btn-month-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.querySelector('#plan-duration-months, .plan-duration-input');
        let current = parseInt(input ? input.value : '1', 10) || 1;
        syncDuration(current + 1);
      });
    });

    // Botones de Selección Plan Gratuito (Permite regresar a Free si se tiene Pro o Corp)
    document.querySelectorAll('#btn-select-free, .btn-select-free-plan').forEach(btn => {
      btn.addEventListener('click', () => {
        const user = appState.getState().user;
        const userPlan = (user && user.plan) ? user.plan.toLowerCase() : 'free';
        if (userPlan !== 'free') {
          this.handleCancelPlan();
        }
      });
    });

    // Botones de Compra / Selección Plan Pro (tanto en Modal como en Sección In-Page)
    document.querySelectorAll('#btn-buy-pro, .btn-select-pro-plan').forEach(btn => {
      btn.addEventListener('click', () => {
        const user = appState.getState().user;
        const userPlan = (user && user.plan) ? user.plan.toLowerCase() : 'free';
        if (userPlan === 'pro') {
          this.handleCancelPlan();
        } else {
          this.handlePurchase('pro');
        }
      });
    });

    // Botones de Compra / Selección Plan Corporativo (tanto en Modal como en Sección In-Page)
    document.querySelectorAll('#btn-buy-corporate, .btn-select-corp-plan').forEach(btn => {
      btn.addEventListener('click', () => {
        const user = appState.getState().user;
        const userPlan = (user && user.plan) ? user.plan.toLowerCase() : 'free';
        if (userPlan === 'corporate') {
          this.handleCancelPlan();
        } else {
          this.handlePurchase('corporate');
        }
      });
    });

    this.updateDurationAndPrices();
  }

  updateDurationAndPrices(forcedMonths) {
    const input = document.querySelector('#plan-duration-months, .plan-duration-input');
    let months = forcedMonths !== undefined ? forcedMonths : parseInt(input ? input.value : '1', 10);
    if (isNaN(months) || months < 1) {
      months = 1;
      document.querySelectorAll('#plan-duration-months, .plan-duration-input').forEach(el => el.value = 1);
    }

    // Calculate expiration date: Today + N months
    const today = new Date();
    const expiryDate = new Date(today);
    expiryDate.setMonth(expiryDate.getMonth() + months);

    const formattedExpiry = expiryDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const proPlan = appState.getPlanConfig('pro');
    const corpPlan = appState.getPlanConfig('corporate');

    const proMonthly = (proPlan && proPlan.priceMonthly !== undefined) ? proPlan.priceMonthly : 9.99;
    const corpMonthly = (corpPlan && corpPlan.priceMonthly !== undefined) ? corpPlan.priceMonthly : 29.99;

    const proTotalPrice = (proMonthly * months).toFixed(2);
    const corpTotalPrice = (corpMonthly * months).toFixed(2);

    const user = appState.getState().user;
    const userPlan = (user && user.plan) ? user.plan.toLowerCase() : 'free';

    document.querySelectorAll('#price-pro-display, .price-pro-display').forEach(el => {
      el.textContent = `$${proTotalPrice}`;
    });
    document.querySelectorAll('#price-pro-period, .price-pro-period').forEach(el => {
      el.textContent = `/ ${months} mes${months > 1 ? 'es' : ''}`;
    });
    if (userPlan !== 'pro') {
      document.querySelectorAll('#expiry-pro-date, .expiry-pro-date').forEach(el => {
        el.textContent = formattedExpiry;
      });
    }

    document.querySelectorAll('#price-corp-display, .price-corp-display').forEach(el => {
      el.textContent = `$${corpTotalPrice}`;
    });
    document.querySelectorAll('#price-corp-period, .price-corp-period').forEach(el => {
      el.textContent = `/ ${months} mes${months > 1 ? 'es' : ''}`;
    });
    if (userPlan !== 'corporate') {
      document.querySelectorAll('#expiry-corp-date, .expiry-corp-date').forEach(el => {
        el.textContent = formattedExpiry;
      });
    }
  }

  updateActivePlanUI(user) {
    const userPlan = (user && user.plan) ? user.plan.toLowerCase() : 'free';
    
    // Cálculo dinámico y preciso de fecha de vencimiento a partir de hoy o fecha activa
    let expFormatted = '';
    const now = new Date();

    if (user && user.expirationDate) {
      const d = new Date(user.expirationDate);
      if (!isNaN(d.getTime()) && d > now) {
        expFormatted = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    }

    if (!expFormatted && userPlan !== 'free') {
      const months = (user && user.planDurationMonths) ? parseInt(user.planDurationMonths, 10) : 1;
      const validMonths = isNaN(months) || months < 1 ? 1 : months;
      // La base para calcular vencimiento siempre es a partir de HOY, nunca createdAt histórico
      const autoExp = new Date(now);
      autoExp.setMonth(autoExp.getMonth() + validMonths);
      expFormatted = autoExp.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    // -------------------------------------------------------------
    // CARD 1: PLAN GRATUITO
    // -------------------------------------------------------------
    document.querySelectorAll('#badge-status-free, .badge-status-free').forEach(el => {
      if (userPlan === 'free') {
        el.innerHTML = `<span class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 normal-case tracking-normal whitespace-nowrap"><i class="fa-solid fa-circle-check text-emerald-400"></i> Plan activo</span>`;
      } else {
        el.innerHTML = ``;
      }
    });

    document.querySelectorAll('#btn-select-free, .btn-select-free-plan').forEach(btn => {
      if (userPlan === 'free') {
        btn.disabled = true;
        btn.className = 'w-full py-3 px-4 rounded-xl font-bold text-xs bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed text-center transition flex items-center justify-center gap-2';
        btn.innerHTML = '<i class="fa-solid fa-circle-check text-emerald-400"></i> Plan Activo Actual';
      } else {
        btn.disabled = false;
        btn.className = 'w-full py-3 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition transform active:scale-95 text-center flex items-center justify-center gap-2 cursor-pointer';
        btn.innerHTML = '<i class="fa-solid fa-arrow-down text-slate-300"></i> Cambiar a Plan Gratuito';
      }
    });

    // -------------------------------------------------------------
    // CARD 2: PLAN PROFESIONAL
    // -------------------------------------------------------------
    document.querySelectorAll('#badge-status-pro, .badge-status-pro').forEach(el => {
      if (userPlan === 'pro') {
        el.innerHTML = `<span class="bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 normal-case tracking-normal whitespace-nowrap"><i class="fa-solid fa-circle-check text-indigo-400"></i> Plan activo</span>`;
      } else {
        el.innerHTML = ``;
      }
    });

    document.querySelectorAll('#expiry-pro-container, .expiry-pro-container').forEach(container => {
      if (userPlan === 'pro') {
        container.classList.remove('hidden');
      } else {
        container.classList.add('hidden');
      }
    });
    if (userPlan === 'pro') {
      document.querySelectorAll('#expiry-pro-date, .expiry-pro-date').forEach(el => el.textContent = expFormatted);
    }

    document.querySelectorAll('#btn-buy-pro, .btn-select-pro-plan').forEach(btn => {
      if (userPlan === 'pro') {
        btn.disabled = false;
        btn.className = 'w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer';
        btn.innerHTML = '<i class="fa-solid fa-ban text-rose-400"></i> Cancelar Plan Pro';
      } else if (userPlan === 'corporate') {
        btn.disabled = false;
        btn.className = 'w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer';
        btn.innerHTML = '<i class="fa-solid fa-arrow-down text-indigo-300"></i> Cambiar a Plan Pro (Pagar)';
      } else {
        btn.disabled = false;
        btn.className = 'w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer';
        btn.innerHTML = '<i class="fa-solid fa-credit-card"></i> Pagar';
      }
    });

    // -------------------------------------------------------------
    // CARD 3: PLAN CORPORATIVO (ENTERPRISE)
    // -------------------------------------------------------------
    document.querySelectorAll('#badge-status-corporate, .badge-status-corporate').forEach(el => {
      if (userPlan === 'corporate') {
        el.innerHTML = `<span class="bg-purple-500/20 text-purple-400 border border-purple-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 normal-case tracking-normal whitespace-nowrap"><i class="fa-solid fa-circle-check text-purple-400"></i> Plan activo</span>`;
      } else {
        el.innerHTML = ``;
      }
    });

    document.querySelectorAll('#expiry-corp-container, .expiry-corp-container').forEach(container => {
      if (userPlan === 'corporate') {
        container.classList.remove('hidden');
      } else {
        container.classList.add('hidden');
      }
    });
    if (userPlan === 'corporate') {
      document.querySelectorAll('#expiry-corp-date, .expiry-corp-date').forEach(el => el.textContent = expFormatted);
    }

    document.querySelectorAll('#btn-buy-corporate, .btn-select-corp-plan').forEach(btn => {
      if (userPlan === 'corporate') {
        btn.disabled = false;
        btn.className = 'w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer';
        btn.innerHTML = '<i class="fa-solid fa-ban text-rose-400"></i> Cancelar Plan Corporativo';
      } else if (userPlan === 'pro') {
        btn.disabled = false;
        btn.className = 'w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-md transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer';
        btn.innerHTML = '<i class="fa-solid fa-arrow-up-right-dots text-amber-300"></i> Actualizar a Plan Corporativo (Pagar)';
      } else {
        btn.disabled = false;
        btn.className = 'w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-md transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer';
        btn.innerHTML = '<i class="fa-solid fa-crown text-amber-400"></i> Pagar';
      }
    });
  }

  async handlePurchase(targetPlan) {
    const state = appState.getState();
    if (!state.user || !state.user.email) {
      if (this.container) this.container.classList.add('hidden');
      const oauthModal = document.getElementById('oauth-modal');
      if (oauthModal) oauthModal.classList.remove('hidden');
      return;
    }

    const durInput = document.querySelector('#plan-duration-months, .plan-duration-input');
    let months = parseInt(durInput ? durInput.value : '1', 10);
    if (isNaN(months) || months < 1) months = 1;

    const planNames = { pro: 'Plan Profesional', corporate: 'Plan Corporativo' };
    const planName = planNames[targetPlan] || targetPlan;

    try {
      // Pasarela de Pagos Recurrente (recurrente.com)
      const checkoutRes = await ApiService.createCheckout(state.user.email, targetPlan, months, window.location.origin);
      if (checkoutRes.success && checkoutRes.checkoutUrl) {
        // Modo Sandbox / Demo: Confirmación interactiva inmediata
        if (checkoutRes.checkoutUrl.includes('checkout_txn=')) {
          const confirmRes = await ApiService.confirmTransaction(checkoutRes.transactionId);
          if (confirmRes.success && confirmRes.user) {
            const updatedUser = {
              ...state.user,
              ...confirmRes.user
            };
            appState.setState({ user: updatedUser }, 'PLAN_UPDATED');

            const successMsg = confirmRes.message || `¡Felicidades! Has actualizado con éxito al ${planName} por ${months} mes(es).`;
            document.querySelectorAll('#plan-notification-text, .plan-notification-text').forEach(el => el.textContent = successMsg);
            document.querySelectorAll('#plan-notification-banner, .plan-notification-banner').forEach(el => el.classList.remove('hidden'));

            await ModalService.alert({
              title: '¡Suscripción Activada!',
              message: `Tu pago de $${checkoutRes.amount} ${checkoutRes.currency || 'USD'} por ${months} mes(es) del ${planName} se ha procesado correctamente con Recurrente (${checkoutRes.environment || 'Sandbox'}).`,
              type: 'success'
            });
            return;
          }
        } else {
          // Redirección hacia el checkout oficial de Recurrente
          window.location.href = checkoutRes.checkoutUrl;
          return;
        }
      }

      // Fallback estándar
      const res = await ApiService.upgradePlan(state.user.email, targetPlan, months);
      if (res.success && res.user) {
        const updatedUser = {
          ...state.user,
          ...res.user
        };
        appState.setState({ user: updatedUser }, 'PLAN_UPDATED');

        const successMsg = res.message || `¡Felicidades! Has actualizado con éxito al ${planName} por ${months} mes(es).`;
        document.querySelectorAll('#plan-notification-text, .plan-notification-text').forEach(el => el.textContent = successMsg);
        document.querySelectorAll('#plan-notification-banner, .plan-notification-banner').forEach(el => el.classList.remove('hidden'));
      } else {
        await ModalService.alert({
          title: 'Error de Suscripción',
          message: res.error || 'No se pudo procesar la actualización de plan.',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('[PlanModal] Error purchasing plan:', err);
      await ModalService.alert({
        title: 'Error de Conexión',
        message: 'Error de conexión al procesar la compra del plan.',
        type: 'error'
      });
    }
  }

  async handleCancelPlan() {
    const state = appState.getState();
    if (!state.user || !state.user.email) return;

    const confirmed = await ModalService.confirm({
      title: 'Cancelar Suscripción',
      message: '¿Estás seguro de que deseas cancelar tu suscripción actual? Se asignará automáticamente el Plan Gratuito.',
      icon: 'fa-ban',
      confirmText: 'Sí, Cancelar Plan',
      cancelText: 'No, Mantener Plan',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      const res = await ApiService.cancelPlan(state.user.email);
      if (res.success && res.user) {
        const updatedUser = {
          ...state.user,
          ...res.user
        };
        appState.setState({ user: updatedUser }, 'PLAN_UPDATED');

        const cancelMsg = res.message || 'Tu suscripción ha sido cancelada exitosamente. Se ha asignado automáticamente el Plan Gratuito.';
        document.querySelectorAll('#plan-notification-text, .plan-notification-text').forEach(el => el.textContent = cancelMsg);
        document.querySelectorAll('#plan-notification-banner, .plan-notification-banner').forEach(el => el.classList.remove('hidden'));
      } else {
        await ModalService.alert({
          title: 'Error al Cancelar',
          message: res.error || 'No se pudo cancelar el plan.',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('[PlanModal] Error canceling plan:', err);
      await ModalService.alert({
        title: 'Error de Conexión',
        message: 'Error al procesar la cancelación del plan.',
        type: 'error'
      });
    }
  }

  render() {
    this.updateDurationAndPrices();
    this.updateActivePlanUI(appState.getState().user);
  }
}
