import { UIComponent } from './UIComponent.js';
import { appState } from '../state/AppState.js';
import { ApiService } from '../services/ApiService.js';
import { ModalService } from '../services/ModalService.js';

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

  bindEvents() {
    if (this.btnOpenPlans) {
      this.btnOpenPlans.addEventListener('click', () => {
        if (this.container) this.container.classList.remove('hidden');
        this.updateDurationAndPrices();
        this.updateActivePlanUI(appState.getState().user);
      });
    }

    if (this.btnClosePlanModal) {
      this.btnClosePlanModal.addEventListener('click', () => {
        if (this.container) this.container.classList.add('hidden');
      });
    }

    if (this.btnClosePlanFooter) {
      this.btnClosePlanFooter.addEventListener('click', () => {
        if (this.container) this.container.classList.add('hidden');
      });
    }

    if (this.btnDismissBanner) {
      this.btnDismissBanner.addEventListener('click', () => {
        if (this.notificationBanner) this.notificationBanner.classList.add('hidden');
      });
    }

    if (this.durationInput) {
      ['change', 'input'].forEach(evt => {
        this.durationInput.addEventListener(evt, () => {
          let val = parseInt(this.durationInput.value, 10);
          if (isNaN(val) || val < 1) {
            val = 1;
            this.durationInput.value = 1;
          }
          this.updateDurationAndPrices();
        });
      });
    }

    if (this.btnMonthMinus) {
      this.btnMonthMinus.addEventListener('click', () => {
        let val = parseInt(this.durationInput ? this.durationInput.value : '1', 10) || 1;
        if (val > 1) {
          val--;
          if (this.durationInput) this.durationInput.value = val;
          this.updateDurationAndPrices();
        }
      });
    }

    if (this.btnMonthPlus) {
      this.btnMonthPlus.addEventListener('click', () => {
        let val = parseInt(this.durationInput ? this.durationInput.value : '1', 10) || 1;
        val++;
        if (this.durationInput) this.durationInput.value = val;
        this.updateDurationAndPrices();
      });
    }

    if (this.btnBuyPro) {
      this.btnBuyPro.addEventListener('click', () => {
        const user = appState.getState().user;
        const userPlan = (user && user.plan) ? user.plan.toLowerCase() : 'free';
        if (userPlan === 'pro') {
          this.handleCancelPlan();
        } else {
          this.handlePurchase('pro');
        }
      });
    }

    if (this.btnBuyCorporate) {
      this.btnBuyCorporate.addEventListener('click', () => {
        const user = appState.getState().user;
        const userPlan = (user && user.plan) ? user.plan.toLowerCase() : 'free';
        if (userPlan === 'corporate') {
          this.handleCancelPlan();
        } else {
          this.handlePurchase('corporate');
        }
      });
    }

    this.updateDurationAndPrices();
  }

  updateDurationAndPrices() {
    let months = parseInt(this.durationInput ? this.durationInput.value : '1', 10);
    if (isNaN(months) || months < 1) {
      months = 1;
      if (this.durationInput) this.durationInput.value = 1;
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

    const proTotalPrice = (9.99 * months).toFixed(2);
    const corpTotalPrice = (29.99 * months).toFixed(2);

    const priceProDisplay = document.getElementById('price-pro-display');
    const priceProPeriod = document.getElementById('price-pro-period');
    const expiryProDate = document.getElementById('expiry-pro-date');

    const priceCorpDisplay = document.getElementById('price-corp-display');
    const priceCorpPeriod = document.getElementById('price-corp-period');
    const expiryCorpDate = document.getElementById('expiry-corp-date');

    const user = appState.getState().user;
    const userPlan = (user && user.plan) ? user.plan.toLowerCase() : 'free';

    if (priceProDisplay) priceProDisplay.textContent = `$${proTotalPrice}`;
    if (priceProPeriod) priceProPeriod.textContent = `/ ${months} mes${months > 1 ? 'es' : ''}`;
    if (expiryProDate && userPlan !== 'pro') expiryProDate.textContent = formattedExpiry;

    if (priceCorpDisplay) priceCorpDisplay.textContent = `$${corpTotalPrice}`;
    if (priceCorpPeriod) priceCorpPeriod.textContent = `/ ${months} mes${months > 1 ? 'es' : ''}`;
    if (expiryCorpDate && userPlan !== 'corporate') expiryCorpDate.textContent = formattedExpiry;
  }

  updateActivePlanUI(user) {
    const userPlan = (user && user.plan) ? user.plan.toLowerCase() : 'free';
    const expFormatted = (user && user.expirationDate)
      ? new Date(user.expirationDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '31/12/2026';

    // -------------------------------------------------------------
    // CARD 1: PLAN GRATUITO
    // -------------------------------------------------------------
    if (this.badgeFree) {
      if (userPlan === 'free') {
        // Regla 4: Muestra en la parte superior "plan activo" junto a un ícono
        this.badgeFree.innerHTML = `<span class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 normal-case tracking-normal whitespace-nowrap"><i class="fa-solid fa-circle-check text-emerald-400"></i> Plan activo</span>`;
      } else {
        this.badgeFree.innerHTML = ``;
      }
    }

    if (this.btnSelectFree) {
      if (userPlan === 'free') {
        this.btnSelectFree.disabled = true;
        this.btnSelectFree.className = 'w-full py-3 px-4 rounded-xl font-bold text-xs bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed text-center transition flex items-center justify-center gap-2';
        this.btnSelectFree.innerHTML = '<i class="fa-solid fa-circle-check text-emerald-400"></i> Plan Activo Actual';
      } else {
        this.btnSelectFree.disabled = true;
        this.btnSelectFree.className = 'w-full py-3 px-4 rounded-xl font-bold text-xs bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed text-center transition flex items-center justify-center gap-2';
        this.btnSelectFree.innerHTML = '<i class="fa-solid fa-box text-slate-500"></i> Plan Básico Starter';
      }
    }

    // -------------------------------------------------------------
    // CARD 2: PLAN PROFESIONAL
    // -------------------------------------------------------------
    if (this.badgePro) {
      this.badgePro.innerHTML = ``;
    }

    if (this.expiryProContainer) {
      if (userPlan === 'pro') {
        this.expiryProContainer.classList.remove('hidden');
        const expiryProDate = document.getElementById('expiry-pro-date');
        if (expiryProDate) expiryProDate.textContent = expFormatted;
      } else {
        this.expiryProContainer.classList.add('hidden');
      }
    }

    if (this.btnBuyPro) {
      if (userPlan === 'pro') {
        // Reglas 3 & 6: Cancelar plan activo Pro
        this.btnBuyPro.disabled = false;
        this.btnBuyPro.className = 'w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition transform active:scale-95 flex items-center justify-center gap-2';
        this.btnBuyPro.innerHTML = '<i class="fa-solid fa-ban text-rose-400"></i> Cancelar Plan Pro';
      } else if (userPlan === 'corporate') {
        this.btnBuyPro.disabled = true;
        this.btnBuyPro.className = 'w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed text-center transition flex items-center justify-center gap-2';
        this.btnBuyPro.innerHTML = '<i class="fa-solid fa-check text-slate-500"></i> Plan Profesional (Nivel Inferior)';
      } else {
        // Regla 1: Usuario con plan gratuito puede actualizar a Pro
        this.btnBuyPro.disabled = false;
        this.btnBuyPro.className = 'w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-500/25 transition transform active:scale-95 flex items-center justify-center gap-2';
        this.btnBuyPro.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> Comprar Plan Profesional';
      }
    }

    // -------------------------------------------------------------
    // CARD 3: PLAN CORPORATIVO (ENTERPRISE)
    // -------------------------------------------------------------
    if (this.badgeCorporate) {
      this.badgeCorporate.innerHTML = ``;
    }

    if (this.expiryCorpContainer) {
      if (userPlan === 'corporate') {
        this.expiryCorpContainer.classList.remove('hidden');
        const expiryCorpDate = document.getElementById('expiry-corp-date');
        if (expiryCorpDate) expiryCorpDate.textContent = expFormatted;
      } else {
        this.expiryCorpContainer.classList.add('hidden');
      }
    }

    if (this.btnBuyCorporate) {
      if (userPlan === 'corporate') {
        // Reglas 3 & 6: Cancelar plan activo Corporativo
        this.btnBuyCorporate.disabled = false;
        this.btnBuyCorporate.className = 'w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition transform active:scale-95 flex items-center justify-center gap-2';
        this.btnBuyCorporate.innerHTML = '<i class="fa-solid fa-ban text-rose-400"></i> Cancelar Plan Corporativo';
      } else if (userPlan === 'pro') {
        // Regla 2: Usuario con plan Pro activo puede actualizar al plan Enterprise/Corporativo
        this.btnBuyCorporate.disabled = false;
        this.btnBuyCorporate.className = 'w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25 transition transform active:scale-95 flex items-center justify-center gap-2';
        this.btnBuyCorporate.innerHTML = '<i class="fa-solid fa-arrow-up-right-dots text-amber-300"></i> Actualizar a Plan Corporativo';
      } else {
        // Regla 1: Usuario con plan gratuito puede actualizar a Enterprise
        this.btnBuyCorporate.disabled = false;
        this.btnBuyCorporate.className = 'w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25 transition transform active:scale-95 flex items-center justify-center gap-2';
        this.btnBuyCorporate.innerHTML = '<i class="fa-solid fa-crown text-amber-300"></i> Comprar Plan Corporativo';
      }
    }
  }

  async handlePurchase(targetPlan) {
    const state = appState.getState();
    if (!state.user || !state.user.email) {
      if (this.container) this.container.classList.add('hidden');
      const oauthModal = document.getElementById('oauth-modal');
      if (oauthModal) oauthModal.classList.remove('hidden');
      return;
    }

    let months = parseInt(this.durationInput ? this.durationInput.value : '1', 10);
    if (isNaN(months) || months < 1) months = 1;

    const planNames = { pro: 'Plan Profesional', corporate: 'Plan Corporativo' };
    const planName = planNames[targetPlan] || targetPlan;

    try {
      const res = await ApiService.upgradePlan(state.user.email, targetPlan, months);
      if (res.success && res.user) {
        const updatedUser = {
          ...state.user,
          ...res.user
        };
        appState.setState({ user: updatedUser }, 'PLAN_UPDATED');

        if (this.notificationBanner && this.notificationText) {
          this.notificationText.textContent = res.message || `¡Felicidades! Has actualizado con éxito al ${planName} por ${months} mes(es).`;
          this.notificationBanner.classList.remove('hidden');
        }
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

        if (this.notificationBanner && this.notificationText) {
          this.notificationText.textContent = res.message || 'Tu suscripción ha sido cancelada exitosamente. Se ha asignado automáticamente el Plan Gratuito.';
          this.notificationBanner.classList.remove('hidden');
        }
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
