/**
 * Error Handler Module
 * Provides global error handling, API retry logic, and user-friendly error messages
 */

const ErrorHandler = {
  /**
   * Initialize global error handling
   */
  init() {
    // Catch unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('Global error caught:', event.error);
      this.showErrorBoundary(event.error);
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.showErrorBoundary(event.reason);
    });

    console.log('✅ Error handler initialized');
  },

  /**
   * Show error boundary fallback UI
   * @param {Error} error - The error that occurred
   */
  showErrorBoundary(error) {
    const container = document.getElementById('page-content');
    if (!container) return;

    const errorMessage = error?.message || 'An unexpected error occurred';
    const errorStack = error?.stack || '';

    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; max-width: 600px; margin: 0 auto;">
        <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
        <h2 style="color: #d32f2f; margin-bottom: 16px;">Something Went Wrong</h2>
        <p style="color: var(--muted); margin-bottom: 24px; line-height: 1.6;">
          We encountered an unexpected error. Don't worry - your progress has been saved automatically.
        </p>
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin-bottom: 24px; text-align: left; border-radius: 8px;">
          <strong style="color: #856404;">Error Details:</strong>
          <p style="color: #856404; margin: 8px 0 0 0; font-family: monospace; font-size: 13px; word-break: break-word;">
            ${this.escapeHtml(errorMessage)}
          </p>
        </div>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button onclick="location.reload()" class="btn" style="min-width: 140px;">
            🔄 Reload Page
          </button>
          <button onclick="ErrorHandler.clearAndRestart()" class="btn secondary" style="min-width: 140px;">
            ↺ Start Fresh
          </button>
        </div>
        <details style="margin-top: 32px; text-align: left; opacity: 0.6;">
          <summary style="cursor: pointer; font-size: 12px; color: var(--muted);">
            Technical Details (for developers)
          </summary>
          <pre style="margin-top: 12px; padding: 12px; background: #f5f5f5; border-radius: 6px; font-size: 11px; overflow-x: auto; max-height: 200px; overflow-y: auto;">${this.escapeHtml(errorStack)}</pre>
        </details>
      </div>
    `;
  },

  /**
   * Clear session and restart
   */
  clearAndRestart() {
    localStorage.clear();
    location.href = 'index.html';
  },

  /**
   * Retry API call with exponential backoff
   * @param {Function} apiCall - Function that returns a Promise
   * @param {Object} options - Retry options
   * @returns {Promise}
   */
  async retryApiCall(apiCall, options = {}) {
    const {
      maxRetries = 3,
      initialDelay = 1000,
      maxDelay = 10000,
      backoffMultiplier = 2,
      onRetry = null
    } = options;

    let lastError;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          console.error(`❌ API call failed after ${maxRetries} attempts:`, error);
          throw error;
        }

        console.warn(`⚠️ API call failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`);

        if (onRetry) {
          onRetry(attempt, maxRetries, delay);
        }

        // Wait before retrying
        await this.sleep(delay);

        // Exponential backoff
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }
    }

    throw lastError;
  },

  /**
   * Check if localStorage is available and has space
   * @returns {Object} { available: boolean, error: string|null }
   */
  checkLocalStorage() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return { available: true, error: null };
    } catch (error) {
      let errorMessage = 'localStorage is not available';

      if (error.name === 'QuotaExceededError') {
        errorMessage = 'localStorage is full. Please clear some browser data.';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'localStorage is disabled in your browser settings.';
      }

      return { available: false, error: errorMessage };
    }
  },

  /**
   * Show user-friendly error dialog
   * @param {string} message - Error message
   * @param {string} title - Dialog title
   */
  async showError(message, title = 'Error') {
    if (typeof Dialog !== 'undefined') {
      await Dialog.showAlert(message, title);
    } else {
      alert(`${title}\n\n${message}`);
    }
  },

  /**
   * Show retry dialog for failed operations
   * @param {string} operation - Name of failed operation
   * @param {Function} retryFn - Function to retry
   */
  async showRetryDialog(operation, retryFn) {
    const retry = await Dialog.showConfirm(
      `<strong>${operation} failed.</strong><br><br>` +
      'Would you like to try again?',
      'Connection Error',
      { confirmText: 'Retry', cancelText: 'Cancel' }
    );

    if (retry && retryFn) {
      return await retryFn();
    }

    return null;
  },

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string}
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// Initialize error handler when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ErrorHandler.init());
} else {
  ErrorHandler.init();
}
