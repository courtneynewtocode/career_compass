/**
 * Main Application Controller
 */

class CareerCompassApp {
  constructor() {
    this.testData = null;
    this.testId = null;
    this.currentPage = -1;
    this.pages = [];
    this.answers = {};
    this.demographics = {};
    this.startedAt = null;

    // Debug mode - press Ctrl+Shift+D to enable
    this.debugMode = false;
    this.setupDebugMode();
  }

  /**
   * Initialize the application
   */
  async init(testId) {
    this.testId = testId;

    try {
      // Load test definition
      this.testData = await this.loadTest(testId);

      // Validate test schema
      const validation = Validator.validateTestSchema(this.testData);
      if (!validation.valid) {
        console.error('Test validation errors:', validation.errors);
        alert('Error: Invalid test configuration. Please contact support.');
        return;
      }

      // Initialize answers structure
      this.initializeAnswers();

      // Build page structure
      this.buildPages();

      // Check for existing session
      const session = Storage.loadSession(testId);
      if (session) {
        this.showResumeDialog(session);
      } else {
        this.startFresh();
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      alert('Error loading test. Please try again.');
    }
  }

  /**
   * Load test definition from JSON
   */
  async loadTest(testId) {
    const response = await fetch(`tests/${testId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load test: ${testId}`);
    }
    return await response.json();
  }

  /**
   * Initialize answers structure for all categories
   */
  initializeAnswers() {
    this.testData.sections.forEach(section => {
      section.categories.forEach(category => {
        this.answers[category.key] = new Array(category.questions.length).fill(null);
      });
    });
  }

  /**
   * Build page structure from test definition
   */
  buildPages() {
    this.pages = [];

    this.testData.sections.forEach(section => {
      section.categories.forEach(category => {
        const pagination = section.pagination || { type: 'category' };

        if (pagination.type === 'category') {
          // One page per category
          this.pages.push({
            section: section,
            category: category,
            categoryKey: category.key,
            questions: category.questions,
            questionStartIndex: 0
          });
        } else if (pagination.type === 'chunk') {
          // Split questions into chunks
          const chunkSize = pagination.chunkSize || 9;
          const chunks = Math.ceil(category.questions.length / chunkSize);

          for (let i = 0; i < chunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, category.questions.length);
            const questions = category.questions.slice(start, end);

            this.pages.push({
              section: section,
              category: chunks > 1 ? { ...category, title: `${category.title} — Part ${i + 1}` } : category,
              categoryKey: category.key,
              questions: questions,
              questionStartIndex: start
            });
          }
        } else if (pagination.type === 'all') {
          // All questions on one page (combine all categories)
          const allQuestions = section.categories.flatMap(cat => cat.questions);
          this.pages.push({
            section: section,
            category: null,
            categoryKey: section.categories[0].key, // Use first category key
            questions: allQuestions,
            questionStartIndex: 0
          });
        }
      });
    });
  }

  /**
   * Show dialog to resume or start fresh
   */
  showResumeDialog(session) {
    const percent = Math.round(((session.currentPage + 1) / (this.pages.length + 1)) * 100);
    const studentName = session.demographics.studentName || 'Unknown';

    const resume = confirm(
      `Found previous session for ${studentName}\\n` +
      `Progress: ${percent}%\\n\\n` +
      `Would you like to resume where you left off?\\n` +
      `Click OK to resume, or Cancel to start fresh.`
    );

    if (resume) {
      this.loadSession(session);
    } else {
      Storage.clearSession(this.testId);
      this.startFresh();
    }
  }

  /**
   * Load session data
   */
  loadSession(session) {
    this.demographics = session.demographics;
    this.answers = session.answers;
    this.currentPage = session.currentPage;
    this.startedAt = session.startedAt;

    if (this.currentPage === -1) {
      this.renderIntro();
    } else if (this.currentPage >= this.pages.length) {
      this.renderResults();
    } else {
      this.renderPage(this.currentPage);
    }
  }

  /**
   * Start fresh assessment
   */
  startFresh() {
    this.currentPage = -1;
    this.demographics = {};
    this.startedAt = Date.now();
    this.renderIntro();
  }

  /**
   * Save current state to localStorage
   */
  saveState() {
    Storage.saveSession(this.testId, {
      demographics: this.demographics,
      answers: this.answers,
      currentPage: this.currentPage,
      startedAt: this.startedAt
    });
  }

  /**
   * Render intro page
   */
  renderIntro() {
    this.currentPage = -1;
    Renderer.renderIntro(this.testData, this.demographics, {
      onStart: (demo) => {
        this.demographics = demo;
        this.saveState();
        this.renderPage(0);
      }
    });
  }

  /**
   * Render a question page
   */
  renderPage(index) {
    this.currentPage = index;
    this.saveState();

    Renderer.renderQuestionPage(
      this.testData,
      index,
      this.pages,
      this.answers,
      {
        onNext: () => {
          if (index + 1 < this.pages.length) {
            this.renderPage(index + 1);
          } else {
            this.renderResults();
          }
        },
        onBack: () => {
          if (index === 0) {
            this.renderIntro();
          } else {
            this.renderPage(index - 1);
          }
        }
      }
    );
  }

  /**
   * Render results page
   */
  async renderResults() {
    this.currentPage = this.pages.length;

    // Calculate scores
    const scores = Scoring.calculateScores(this.testData, this.answers);

    // Prepare report data
    const reportData = Scoring.prepareReportData(this.testData, scores, this.demographics);

    // Store for submission
    this.reportData = reportData;
    this.scores = scores;

    // Automatically send email (don't wait for user to click Submit)
    await this.sendEmailReport();

    // Check if we should show results to user
    if (Config.showResultsToUser) {
      // Show results page with "Finish" button
      Renderer.renderResults(this.testData, reportData, {
        onFinish: () => {
          this.completeAssessment();
        },
        onRestart: () => {
          Storage.clearSession(this.testId);
          this.initializeAnswers();
          this.startFresh();
        }
      });
    } else {
      // Skip results, go directly to completion
      this.completeAssessment();
    }
  }

  /**
   * Send email report automatically (called when test is completed)
   */
  async sendEmailReport() {
    try {
      // Build HTML email
      const emailHtml = EmailBuilder.buildEmailReport(
        this.testData,
        this.reportData,
        this.demographics
      );

      // Send email directly to mailer API
      const studentName = this.demographics.studentName || 'Unknown Student';
      const emailSubject = `Career Compass Assessment Results - ${studentName}`;

      // Build API payload
      const payload = {
        access_key: Config.mailer.accessKey,
        subject: emailSubject,
        html: emailHtml
      };

      // Add PDF generation if enabled
      if (Config.generatePdf) {
        payload.generate_pdf = 'true';
      }

      const emailResponse = await fetch(Config.mailer.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const emailResult = await emailResponse.json();

      if (!emailResult.success) {
        throw new Error('Failed to send email: ' + (emailResult.message || 'Unknown error'));
      }

      console.log('✓ Email sent successfully');

    } catch (error) {
      console.error('Email sending error:', error);
      // Don't block user flow - log error but continue
      // Admin will need to check logs if emails aren't received
      alert('Note: There was an issue sending the email report.\nYour results have been recorded.\n\nError: ' + error.message);
    }
  }

  /**
   * Complete assessment - Clear session and show thank you page
   */
  completeAssessment() {
    // Clear session
    Storage.clearSession(this.testId);

    // Show completion page
    Renderer.renderCompletion(this.testData);
  }

  /**
   * Setup debug mode (Ctrl+Shift+D)
   */
  setupDebugMode() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        this.debugMode = !this.debugMode;
        console.log(`Debug mode: ${this.debugMode ? 'ON' : 'OFF'}`);

        if (this.debugMode) {
          this.showDebugPanel();
        } else {
          this.hideDebugPanel();
        }
      }
    });
  }

  /**
   * Show debug panel
   */
  showDebugPanel() {
    if (document.getElementById('debug-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px;
      border-radius: 8px;
      z-index: 10000;
      font-family: monospace;
      font-size: 12px;
      max-width: 300px;
    `;

    panel.innerHTML = `
      <div style="margin-bottom:10px;font-weight:bold">Debug Panel</div>
      <button onclick="app.debugFillAnswers()" style="margin:5px 0;padding:5px 10px;width:100%">Fill All Answers (3s)</button>
      <button onclick="app.debugSkipToResults()" style="margin:5px 0;padding:5px 10px;width:100%">Skip to Results</button>
      <button onclick="app.debugClearSession()" style="margin:5px 0;padding:5px 10px;width:100%">Clear Session</button>
      <button onclick="app.debugExportData()" style="margin:5px 0;padding:5px 10px;width:100%">Export Data (JSON)</button>
      <div style="margin-top:10px;font-size:10px;opacity:0.7">Press Ctrl+Shift+D to toggle</div>
    `;

    document.body.appendChild(panel);
  }

  /**
   * Hide debug panel
   */
  hideDebugPanel() {
    const panel = document.getElementById('debug-panel');
    if (panel) panel.remove();
  }

  /**
   * Debug: Fill all answers with 3s
   */
  debugFillAnswers() {
    Object.keys(this.answers).forEach(key => {
      this.answers[key] = this.answers[key].map(() => 3);
    });
    console.log('All answers filled with 3s');
    alert('All answers filled with 3s. Click Next to proceed.');
  }

  /**
   * Debug: Skip to results
   */
  debugSkipToResults() {
    // Fill demographics if empty
    if (!this.demographics.studentName) {
      this.demographics = {
        studentName: 'Test Student',
        age: '16',
        grade: '10',
        email: 'test@example.com',
        contact: '0821234567',
        date: new Date().toISOString().slice(0, 10)
      };
    }

    // Fill all answers with 3s
    this.debugFillAnswers();

    // Go to results
    this.renderResults();
  }

  /**
   * Debug: Clear session
   */
  debugClearSession() {
    Storage.clearSession(this.testId);
    console.log('Session cleared');
    alert('Session cleared. Refresh to start fresh.');
  }

  /**
   * Debug: Export data as JSON
   */
  debugExportData() {
    const data = {
      testId: this.testId,
      demographics: this.demographics,
      answers: this.answers,
      currentPage: this.currentPage
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-${this.testId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('Data exported');
  }
}

// Global app instance
let app;

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  // Get test ID from URL parameter or default to 'career-compass'
  const urlParams = new URLSearchParams(window.location.search);
  const testId = urlParams.get('test') || 'career-compass';

  app = new CareerCompassApp();
  app.init(testId);
});
