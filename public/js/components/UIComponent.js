/**
 * UIComponent - Base class for all UI components.
 * Adheres to SOLID (Liskov Substitution & Single Responsibility Principles).
 */
export class UIComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  mount() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {}

  render() {}
}
