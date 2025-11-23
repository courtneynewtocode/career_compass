/**
 * Analytics Module
 * File-based analytics tracking for assessment completion and user behavior
 */

const Analytics = {
  sessionId: null,
  testId: null,
  startTime: null,
  events: [],

  /**
   * Initialize analytics tracking
   * @param {string} testId - The test ID
   */
  init(testId) {
    this.testId = testId;
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();

    console.log('📊 Analytics initialized:', this.sessionId);

    // Track test start
    this.trackEvent('test_started', {
      testId: testId,
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language
    });
  },

  /**
   * Generate unique session ID
   * @returns {string}
   */
  generateSessionId() {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  },

  /**
   * Track an event
   * @param {string} eventName - Name of the event
   * @param {Object} data - Event data
   */
  trackEvent(eventName, data = {}) {
    const event = {
      sessionId: this.sessionId,
      testId: this.testId,
      eventName: eventName,
      timestamp: new Date().toISOString(),
      data: data
    };

    this.events.push(event);
    console.log(`📊 Event tracked: ${eventName}`, data);

    // Send to analytics API (non-blocking)
    this.sendEvent(event).catch(error => {
      console.warn('⚠️ Failed to send analytics event:', error);
      // Don't block user flow if analytics fails
    });
  },

  /**
   * Send event to analytics API
   * @param {Object} event - Event to send
   * @returns {Promise}
   */
  async sendEvent(event) {
    if (!Config.storeResults) {
      // Analytics disabled if storage is disabled
      return;
    }

    try {
      const response = await fetch(Config.storage.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_key: Config.storage.accessKey,
          action: 'track_event',
          event: event
        })
      });

      if (!response.ok) {
        throw new Error(`Analytics API returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Silently fail - don't block user experience
      console.debug('Analytics event failed (non-critical):', error);
    }
  },

  /**
   * Track page view
   * @param {number} pageIndex - Page index
   * @param {string} pageType - Type of page (intro, question, results)
   */
  trackPageView(pageIndex, pageType) {
    this.trackEvent('page_view', {
      pageIndex: pageIndex,
      pageType: pageType,
      timeOnPreviousPage: this.getTimeSinceLastEvent()
    });
  },

  /**
   * Track question answered
   * @param {string} sectionId - Section ID
   * @param {number} questionIndex - Question index
   */
  trackQuestionAnswered(sectionId, questionIndex) {
    this.trackEvent('question_answered', {
      sectionId: sectionId,
      questionIndex: questionIndex
    });
  },

  /**
   * Track test completion
   * @param {Object} demographics - Student demographics
   * @param {Object} scores - Test scores
   */
  trackTestCompleted(demographics, scores) {
    const completionTime = Date.now() - this.startTime;

    this.trackEvent('test_completed', {
      completionTimeMs: completionTime,
      completionTimeSec: Math.round(completionTime / 1000),
      studentGrade: demographics.grade || 'unknown',
      eventCount: this.events.length
    });
  },

  /**
   * Track test abandoned
   * @param {number} pageIndex - Page where abandoned
   * @param {number} totalPages - Total pages in test
   */
  trackTestAbandoned(pageIndex, totalPages) {
    const progressPercent = Math.round(((pageIndex + 1) / totalPages) * 100);

    this.trackEvent('test_abandoned', {
      pageIndex: pageIndex,
      totalPages: totalPages,
      progressPercent: progressPercent,
      timeSpentMs: Date.now() - this.startTime
    });
  },

  /**
   * Track email sent
   * @param {boolean} success - Whether email was sent successfully
   * @param {string} error - Error message if failed
   */
  trackEmailSent(success, error = null) {
    this.trackEvent('email_sent', {
      success: success,
      error: error,
      hasPdfAttachment: Config.attachPdfReport
    });
  },

  /**
   * Track error
   * @param {string} errorType - Type of error
   * @param {string} errorMessage - Error message
   * @param {Object} context - Additional context
   */
  trackError(errorType, errorMessage, context = {}) {
    this.trackEvent('error', {
      errorType: errorType,
      errorMessage: errorMessage,
      ...context
    });
  },

  /**
   * Get time since last event
   * @returns {number} Milliseconds since last event
   */
  getTimeSinceLastEvent() {
    if (this.events.length === 0) {
      return 0;
    }

    const lastEvent = this.events[this.events.length - 1];
    const lastEventTime = new Date(lastEvent.timestamp).getTime();
    return Date.now() - lastEventTime;
  },

  /**
   * Get session summary
   * @returns {Object}
   */
  getSessionSummary() {
    return {
      sessionId: this.sessionId,
      testId: this.testId,
      startTime: new Date(this.startTime).toISOString(),
      durationMs: Date.now() - this.startTime,
      eventCount: this.events.length,
      events: this.events
    };
  }
};
