/**
 * Dashboard Authentication Module
 * Simple password-based authentication for dashboard access
 */

const DashboardAuth = {
  // Store in sessionStorage (cleared when browser closes)
  SESSION_KEY: 'dashboard_auth_token',

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = sessionStorage.getItem(this.SESSION_KEY);
    const password = Config.dashboard?.password || 'admin123'; // Default password

    if (!token) {
      return false;
    }

    // Simple hash check (in production, use proper JWT or server-side auth)
    const expectedToken = this.hashPassword(password);
    return token === expectedToken;
  },

  /**
   * Attempt login
   * @param {string} password - Password attempt
   * @returns {boolean} Success
   */
  login(password) {
    const correctPassword = Config.dashboard?.password || 'admin123';

    if (password === correctPassword) {
      const token = this.hashPassword(password);
      sessionStorage.setItem(this.SESSION_KEY, token);
      return true;
    }

    return false;
  },

  /**
   * Logout
   */
  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
    window.location.reload();
  },

  /**
   * Simple password hashing (for demo - use proper hashing in production)
   * @param {string} password
   * @returns {string}
   */
  hashPassword(password) {
    // Simple hash - in production use bcrypt or similar
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  },

  /**
   * Show login form
   */
  showLoginForm() {
    document.body.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f6fbfb 0%, #e7eff0 100%);">
        <div style="background: white; padding: 48px; border-radius: 16px; box-shadow: 0 8px 32px rgba(11, 143, 143, 0.15); max-width: 400px; width: 100%;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🔒</div>
            <h1 style="margin: 0 0 8px 0; color: var(--accent); font-size: 24px;">Dashboard Login</h1>
            <p style="margin: 0; color: var(--muted); font-size: 14px;">Enter password to access analytics</p>
          </div>

          <form id="login-form" onsubmit="return false;">
            <div style="margin-bottom: 24px;">
              <label for="password" style="display: block; margin-bottom: 8px; color: #0f1720; font-weight: 600; font-size: 14px;">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter dashboard password"
                style="width: 100%; padding: 14px 16px; border: 2px solid #e7eff0; border-radius: 12px; font-size: 15px; font-family: inherit; box-sizing: border-box;"
                autofocus
              />
            </div>

            <div id="error-message" style="display: none; background: #fee; border-left: 4px solid #f44; padding: 12px; border-radius: 8px; margin-bottom: 16px; color: #c33; font-size: 14px;">
              Incorrect password. Please try again.
            </div>

            <button
              type="submit"
              class="btn"
              style="width: 100%; padding: 14px; font-size: 16px; cursor: pointer; background: #0b8f8f; color: white; border: none; border-radius: 12px; font-weight: 600;"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    `;

    // Add event listener
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const password = document.getElementById('password').value;
      const errorMsg = document.getElementById('error-message');

      if (DashboardAuth.login(password)) {
        window.location.reload();
      } else {
        errorMsg.style.display = 'block';
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
      }
    });
  },

  /**
   * Require authentication
   * Call this at the start of dashboard.html
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      this.showLoginForm();
      return false;
    }
    return true;
  }
};
