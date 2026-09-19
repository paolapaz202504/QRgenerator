import { UIComponent } from './UIComponent.js';

export class FaqSection extends UIComponent {
  constructor() {
    super('section-faq');
  }

  bindEvents() {
    const faqItems = document.querySelectorAll('#faq-accordion-container .faq-item');
    
    faqItems.forEach(item => {
      const btn = item.querySelector('.faq-toggle-btn');
      const content = item.querySelector('.faq-answer-content');
      const icon = item.querySelector('.faq-arrow-icon');

      if (btn && content) {
        btn.addEventListener('click', () => {
          const isCurrentlyHidden = content.classList.contains('hidden');

          // Close all other FAQ items for a clean single-open accordion feel
          faqItems.forEach(otherItem => {
            const otherContent = otherItem.querySelector('.faq-answer-content');
            const otherIcon = otherItem.querySelector('.faq-arrow-icon');
            if (otherContent && otherContent !== content) {
              otherContent.classList.add('hidden');
              if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
            }
          });

          // Toggle current
          if (isCurrentlyHidden) {
            content.classList.remove('hidden');
            if (icon) icon.style.transform = 'rotate(180deg)';
          } else {
            content.classList.add('hidden');
            if (icon) icon.style.transform = 'rotate(0deg)';
          }
        });
      }
    });
  }

  render() {}
}
