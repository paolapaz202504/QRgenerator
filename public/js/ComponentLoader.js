export class ComponentLoader {
  /**
   * Dynamically fetches HTML component partials from ./html/ and injects them into placeholder containers.
   */
  static async loadComponents() {
    const components = [
      { id: 'header-container', file: './html/header.html' },
      { id: 'step3-container', file: './html/step3-design.html' },
      { id: 'step1-container', file: './html/step1-info.html' },
      { id: 'step2-container', file: './html/step2-icon.html' },
      { id: 'step4-container', file: './html/step4-patterns.html' },
      { id: 'color-customizer-container', file: './html/color-customizer.html' },
      { id: 'action-buttons-container', file: './html/action-buttons.html' },
      { id: 'preview-download-container', file: './html/preview-download.html' },
      { id: 'history-container', file: './html/history-section.html' },
      { id: 'modals-container', file: './html/modals.html' },
      { id: 'footer-container', file: './html/footer.html' }
    ];

    await Promise.all(
      components.map(async ({ id, file }) => {
        const container = document.getElementById(id);
        if (!container) return;
        try {
          const res = await fetch(file);
          if (res.ok) {
            const html = await res.text();
            container.outerHTML = html;
          } else {
            console.warn(`Failed to fetch component file: ${file}`);
          }
        } catch (e) {
          console.error(`Error loading component ${file}:`, e);
        }
      })
    );
  }
}
