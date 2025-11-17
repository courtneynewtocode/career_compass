/**
 * Storage Module - Handles localStorage with TTL
 */

const Storage = {
  TTL: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds

  /**
   * Save session to localStorage
   */
  saveSession(testId, data) {
    const session = {
      testId,
      demographics: data.demographics || {},
      answers: data.answers || {},
      currentPage: data.currentPage || -1,
      lastUpdated: Date.now(),
      startedAt: data.startedAt || Date.now()
    };

    localStorage.setItem(`career_compass_session_${testId}`, JSON.stringify(session));
  },

  /**
   * Load session from localStorage
   */
  loadSession(testId) {
    const key = `career_compass_session_${testId}`;
    const data = localStorage.getItem(key);

    if (!data) return null;

    try {
      const session = JSON.parse(data);

      // Check TTL
      if (Date.now() - session.lastUpdated > this.TTL) {
        this.clearSession(testId);
        return null;
      }

      return session;
    } catch (e) {
      console.error('Error loading session:', e);
      return null;
    }
  },

  /**
   * Clear specific session
   */
  clearSession(testId) {
    localStorage.removeItem(`career_compass_session_${testId}`);
  },

  /**
   * Clear all expired sessions
   */
  cleanupExpiredSessions() {
    const keys = Object.keys(localStorage);
    const prefix = 'career_compass_session_';

    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (Date.now() - data.lastUpdated > this.TTL) {
            localStorage.removeItem(key);
            console.log(`Cleaned up expired session: ${key}`);
          }
        } catch (e) {
          // Invalid data, remove it
          localStorage.removeItem(key);
        }
      }
    });
  },

  /**
   * Check if session exists
   */
  hasSession(testId) {
    return this.loadSession(testId) !== null;
  }
};

// Cleanup on load
Storage.cleanupExpiredSessions();
