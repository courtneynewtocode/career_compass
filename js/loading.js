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
   * Transition between pages with slide animation
   * @param {HTMLElement} element - Element to transition
   * @param {Function} callback - Function to run during transition
   */
  async transition(element, callback) {
    if (!element) {
      if (callback) callback();
      return;
    }

    // Fade out current content
    element.classList.add('page-fade-exit');
    element.classList.add('page-fade-exit-active');

    // Wait for exit animation
    await new Promise(resolve => setTimeout(resolve, 250));

    // Update content
    if (callback) callback();

    // Remove exit classes
    element.classList.remove('page-fade-exit');
    element.classList.remove('page-fade-exit-active');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Fade in new content
    element.classList.add('page-fade-enter');
    requestAnimationFrame(() => {
      element.classList.add('page-fade-enter-active');

      // Clean up after animation
      setTimeout(() => {
        element.classList.remove('page-fade-enter');
        element.classList.remove('page-fade-enter-active');
      }, 300);
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
