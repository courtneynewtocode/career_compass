/**
 * Loading Utility Module
 * Manages loading overlays and page transitions
 */

const Loading = {
  overlay: null,

  /**
   * Initialize loading overlay
   */
  init() {
    // Create loading overlay HTML
    this.overlay = document.createElement('div');
    this.overlay.id = 'loading-overlay';
    this.overlay.className = 'loading-overlay';
    this.overlay.innerHTML = `
      <div class="loading-content">
        <div class="spinner"></div>
        <div class="loading-text">Loading...</div>
        <div class="loading-subtext"></div>
      </div>
    `;
    document.body.appendChild(this.overlay);
  },

  /**
   * Show loading overlay
   * @param {string} message - Main loading message
   * @param {string} subtext - Secondary message
   */
  show(message = 'Loading...', subtext = '') {
    if (!this.overlay) {
      this.init();
    }

    const textElement = this.overlay.querySelector('.loading-text');
    const subtextElement = this.overlay.querySelector('.loading-subtext');

    if (textElement) textElement.textContent = message;
    if (subtextElement) subtextElement.textContent = subtext;

    // Small delay to allow DOM to update
    requestAnimationFrame(() => {
      this.overlay.classList.add('active');
    });
  },

  /**
   * Hide loading overlay
   */
  hide() {
    if (this.overlay) {
      this.overlay.classList.remove('active');
    }
  },

  /**
   * Show loading for a specific duration
   * @param {number} duration - Duration in milliseconds
   * @param {string} message - Loading message
   */
  async showFor(duration, message = 'Loading...') {
    this.show(message);
    await new Promise(resolve => setTimeout(resolve, duration));
    this.hide();
  },

  /**
   * Add fade-in animation to element
   * @param {HTMLElement} element - Element to animate
   */
  fadeIn(element) {
    if (!element) return;

    element.classList.add('page-fade-enter');
    requestAnimationFrame(() => {
      element.classList.add('page-fade-enter-active');
      element.classList.remove('page-fade-enter');
    });
  },

  /**
   * Remove loading overlay from DOM
   */
  destroy() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
};
