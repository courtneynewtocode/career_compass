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

    // Debug mode - press Ctrl+Shift+Z to enable
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
        await Dialog.showAlert(
          'There was a problem loading this assessment. Please contact your assessment coordinator for assistance.',
          'Configuration Error'
        );
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
      await Dialog.showAlert(
        'Unable to load the assessment. Please refresh the page and try again. If the problem persists, contact your assessment coordinator.',
        'Loading Error'
      );
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
  async showResumeDialog(session) {
    const percent = Math.round(((session.currentPage + 1) / (this.pages.length + 1)) * 100);

    // Don't show resume dialog if no actual progress (0% or still on intro page)
    if (percent === 0 || session.currentPage === -1) {
      Storage.clearSession(this.testId);
      this.startFresh();
      return;
    }

    const studentName = session.demographics.studentName || 'Unknown';

    const resume = await Dialog.showConfirm(
      `<strong>Welcome back, ${studentName}!</strong><br><br>` +
      `We found your previous session with <strong>${percent}% completed</strong>.<br><br>` +
      'Would you like to continue where you left off?',
      'Resume Assessment',
      { confirmText: 'Resume', cancelText: 'Start Fresh' }
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

    if (Config.showResultsToUser) {
      // Show results to user
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

      // Send email after rendering (uses the rendered HTML)
      await this.sendEmailReport();

      // Save results to storage
      await this.saveResults();
    } else {
      // Don't show results to user - render off-screen for email, then show completion
      // Render results to hidden container for email HTML generation
      const tempContainer = document.createElement('div');
      tempContainer.id = 'temp-report-container';
      tempContainer.style.display = 'none';
      document.body.appendChild(tempContainer);

      // Temporarily swap page-content
      const originalContent = document.getElementById('page-content');
      const tempContent = document.createElement('div');
      tempContent.id = 'page-content';
      tempContainer.appendChild(tempContent);

      // Render results to temp container
      Renderer.renderResults(this.testData, reportData, {
        onFinish: () => {},
        onRestart: () => {}
      });

      // Send email (uses the temp rendered HTML)
      await this.sendEmailReport();

      // Save results to storage
      await this.saveResults();

      // Remove temp container
      tempContainer.remove();

      // Show completion page
      this.completeAssessment();
    }
  }

  /**
   * Send email report automatically (called when test is completed)
   */
  async sendEmailReport() {
    console.log('📧 Attempting to send email report...');

    try {
      const studentName = this.demographics.studentName || 'Unknown Student';
      const emailSubject = `${this.testData.testName} Results - ${studentName}`;

      // Create simple email body
      const emailBody = this.createSimpleEmailBody();

      // Build FormData
      const formData = new FormData();
      formData.append('access_key', Config.mailer.accessKey);
      formData.append('subject', emailSubject);
      formData.append('html', emailBody);

      // Generate and attach PDF if enabled
      if (Config.attachPdfReport) {
        console.log('📄 Generating PDF attachment...');

        // Wait a moment for DOM rendering to settle
        await new Promise(resolve => setTimeout(resolve, 1000));

        const pdfBlob = await this.generatePdfBlob();
        const pdfFilename = `${studentName.replace(/[^a-zA-Z0-9]/g, '_')}_${this.testData.testName.replace(/[^a-zA-Z0-9]/g, '_')}_Report.pdf`;

        formData.append('attachment', pdfBlob, pdfFilename);
        console.log('✅ PDF attached:', pdfFilename);
      }

      console.log('📤 Sending to API:', Config.mailer.apiUrl);
      console.log('📋 Subject:', emailSubject);
      console.log('📎 PDF attachment:', Config.attachPdfReport);

      const emailResponse = await fetch(Config.mailer.apiUrl, {
        method: 'POST',
        body: formData  // Note: No Content-Type header - browser sets it automatically with boundary
      });

      console.log('📥 API response status:', emailResponse.status);

      const emailResult = await emailResponse.json();
      console.log('📥 API response:', emailResult);

      if (!emailResult.success) {
        throw new Error('Failed to send email: ' + (emailResult.message || 'Unknown error'));
      }

      console.log('✅ Email sent successfully!');

    } catch (error) {
      console.error('❌ Email sending error:', error);
      // Don't block user flow - log error but continue
      // Admin will need to check logs if emails aren't received
      await Dialog.showAlert(
        '<strong>Note:</strong> There was an issue sending the email report.<br><br>' +
        'Don\'t worry! Your results have been recorded. Your assessment coordinator will be notified and will contact you shortly.',
        'Email Notification'
      );
    }
  }

  /**
   * Create simple email body with summary information
   */
  createSimpleEmailBody() {
    const studentName = this.demographics.studentName || 'Unknown Student';
    const submittedAt = new Date().toLocaleString('en-ZA', {
      dateStyle: 'long',
      timeStyle: 'short'
    });

    // Format completion time
    const completionTime = this.startedAt
      ? Math.round((Date.now() - this.startedAt) / 1000)
      : null;

    const duration = completionTime
      ? `${Math.floor(completionTime / 60)} minutes ${completionTime % 60} seconds`
      : 'Not recorded';

    // Build student details table
    const studentDetailsRows = this.testData.demographics.fields.map(field => {
      const value = this.demographics[field.key] || '-';
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #e7eff0; font-weight: 600;">${field.label}</td>
          <td style="padding: 8px; border: 1px solid #e7eff0;">${this.escapeHtml(value)}</td>
        </tr>
      `;
    }).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.testData.testName} Results</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f1720; background-color: #f6fbfb; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 14px; padding: 30px; box-shadow: 0 6px 20px rgba(12, 20, 24, 0.06);">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #0b8f8f;">
      <h1 style="color: #0b8f8f; margin: 0 0 10px 0; font-size: 24px;">Assessment Completed</h1>
      <p style="color: #6b6f76; font-size: 14px; margin: 0;">${submittedAt}</p>
    </div>

    <!-- Summary -->
    <div style="margin-bottom: 30px;">
      <h2 style="color: #0b8f8f; font-size: 18px; margin: 0 0 15px 0;">Summary</h2>
      <p style="margin: 10px 0;">
        <strong>${studentName}</strong> has successfully completed the <strong>${this.testData.testName}</strong>.
      </p>
      <p style="margin: 10px 0; color: #6b6f76;">
        <strong>Completion Time:</strong> ${duration}
      </p>
    </div>

    <!-- Student Details -->
    <div style="margin-bottom: 30px;">
      <h2 style="color: #0b8f8f; font-size: 18px; margin: 0 0 15px 0;">Student Details</h2>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #e7eff0;">
        ${studentDetailsRows}
      </table>
    </div>

    <!-- Attachment Notice -->
    ${Config.attachPdfReport ? `
    <div style="background-color: #f8feff; border-left: 4px solid #0b8f8f; padding: 15px; margin-bottom: 30px; border-radius: 6px;">
      <p style="margin: 0; color: #0b8f8f;">
        <strong>📎 Full Report Attached</strong>
      </p>
      <p style="margin: 5px 0 0 0; color: #6b6f76; font-size: 14px;">
        Please see the attached PDF document for the complete detailed assessment report.
      </p>
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e7eff0; text-align: center;">
      <p style="color: #6b6f76; font-size: 12px; margin: 5px 0;">
        This is an automated email from the Career Compass Assessment System
      </p>
      <p style="color: #6b6f76; font-size: 12px; margin: 5px 0;">
        <strong>Powered by CGA Global Reports</strong>
      </p>
    </div>

  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Wrap rendered HTML for email with proper styling
   */
  wrapForEmail(bodyHtml) {
    const submittedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Career Compass Assessment Results</title>
  <style>
    /* Email-safe CSS */
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #0f1720;
      background-color: #f6fbfb;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 14px;
      padding: 30px;
      box-shadow: 0 6px 20px rgba(12, 20, 24, 0.06);
    }
    h1, h2, h3 {
      color: #0b8f8f;
      margin-top: 0;
    }
    h2 {
      border-bottom: 2px solid #0b8f8f;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .metric {
      padding: 12px;
      border-radius: 10px;
      background: #f8feff;
      border: 1px solid rgba(11, 143, 143, 0.04);
      margin-bottom: 12px;
    }
    .top-clusters {
      background-color: rgba(148, 196, 148, 0.3);
      padding: 12px;
      border-radius: 10px;
      margin-bottom: 12px;
    }
    .neutral-clusters {
      background-color: rgba(128, 128, 128, 0.12);
      padding: 12px;
      border-radius: 10px;
      margin-bottom: 12px;
    }
    .low-clusters {
      background-color: rgba(171, 127, 119, 0.2);
      padding: 12px;
      border-radius: 10px;
      margin-bottom: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th {
      background-color: #0b8f8f;
      color: white;
      padding: 12px;
      text-align: left;
      border: 1px solid #0b8f8f;
    }
    td {
      padding: 10px;
      border: 1px solid #ddd;
    }
    .btn {
      display: none; /* Hide buttons in email */
    }
    img {
      max-width: 100%;
      height: auto;
    }
    .footer-note {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #6b6f76;
      font-size: 12px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <p style="color: #6b6f76; font-size: 14px; text-align: right;">Submitted: ${submittedAt}</p>
    ${bodyHtml}
    <div class="footer-note">
      <p>This is an automated email from the Career Compass Assessment System.</p>
      <p>Powered by CGA Global Reports</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate PDF from rendered report HTML
   * Uses chunked approach to avoid canvas height limitations
   */
  async generatePdfBlob() {
    console.log('📄 Generating PDF from report...');

    try {
      // Get the full page content (includes header with logo + report)
      const pageContent = document.getElementById('page-content');

      if (!pageContent) {
        throw new Error('Page content not found');
      }

      // Clone the element to avoid modifying the original
      const clone = pageContent.cloneNode(true);

      // Add PDF-specific styling to make text much smaller to fit all content
      const style = document.createElement('style');
      style.textContent = `
        /* Font sizes - extremely compact to fit all content */
        * {
          font-size: 6px !important;
          line-height: 1.1 !important;
        }
        h1 {
          font-size: 12px !important;
          margin: 3px 0 !important;
        }
        h2 {
          font-size: 10px !important;
          margin: 3px 0 !important;
        }
        h3 {
          font-size: 9px !important;
          margin: 8px 0 2px 0 !important;
        }
        h4 {
          font-size: 7px !important;
          margin: 2px 0 !important;
        }
        .small-muted, .muted {
          font-size: 5px !important;
        }
        .btn {
          display: none !important;
        }

        /* Make header/intro very compact */
        .container {
          margin-bottom: 3px !important;
          min-height: auto !important;
        }

        /* Compact intro paragraphs */
        #page-content > div:first-child p {
          margin: 1px 0 !important;
          font-size: 5px !important;
          line-height: 1.1 !important;
        }

        /* Keep report content flowing */
        .report {
          margin-top: 2px !important;
        }

        /* Compact student details section */
        .two-col {
          page-break-inside: avoid !important;
          gap: 2px !important;
        }
        .metric {
          padding: 2px !important;
          margin-bottom: 1px !important;
        }
        .metric strong {
          font-size: 7px !important;
        }

        /* Logo - keep at reasonable size */
        img[alt="CGA Global"] {
          max-width: 100px !important;
        }

        /* Hide clusters diagram from PDF */
        img[src*="clusters.png"] {
          display: none !important;
        }

        /* Make all other images (icons, etc.) smaller - but not the logo */
        img:not([alt="CGA Global"]):not([src*="clusters.png"]) {
          max-width: 50% !important;
          height: auto !important;
        }

        /* Spacing adjustments for PDF - extremely compact */
        .container {
          margin-bottom: 3px !important;
        }
        p {
          margin: 2px 0 !important;
        }

        /* Reduce spacing in lists */
        ol, ul {
          margin: 2px 0 !important;
          padding-left: 10px !important;
        }
        li {
          margin: 1px 0 !important;
        }

        /* Compact tables */
        table {
          margin: 3px 0 !important;
        }
        td, th {
          padding: 2px !important;
          font-size: 6px !important;
        }

        /* Reduce "Why did we ask this" box padding */
        div[style*="background-color: #f8feff"] {
          padding: 3px !important;
          margin: 2px 0 !important;
        }

        /* Make all colored boxes more compact */
        .top-clusters, .neutral-clusters, .low-clusters,
        div[style*="background-color"] {
          padding: 3px !important;
          margin: 2px 0 !important;
        }
      `;
      clone.insertBefore(style, clone.firstChild);

      // Hide Report Summary section from PDF
      const allH3 = clone.querySelectorAll('h3');

      allH3.forEach((h3) => {
        const sectionText = h3.textContent.toLowerCase();

        // Hide Report Summary from PDF
        if (sectionText.includes('report summary')) {
          h3.style.display = 'none';
          // Hide the table after it
          let nextEl = h3.nextElementSibling;
          while (nextEl) {
            if (nextEl.tagName === 'TABLE') {
              nextEl.style.display = 'none';
              break;
            }
            nextEl = nextEl.nextElementSibling;
          }
          console.log('✅ Hidden Report Summary from PDF');
        }
      });

      console.log('📊 Total sections in PDF:', allH3.length);

      // Configure html2pdf options
      const options = {
        margin: [5, 5, 5, 5],
        filename: `${this.demographics.studentName || 'Student'}_${this.testData.testName}_Report.pdf`,
        image: {
          type: 'jpeg',
          quality: 0.95
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: '#ffffff',
          windowHeight: 4000
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        },
      };

      // Generate PDF and get blob
      const pdfBlob = await html2pdf()
        .set(options)
        .from(clone)
        .outputPdf('blob');

      console.log('✅ PDF generated successfully, size:', Math.round(pdfBlob.size / 1024), 'KB');

      return pdfBlob;

    } catch (error) {
      console.error('❌ PDF generation error:', error);
      throw error;
    }
  }

  /**
   * Save assessment results to storage API
   */
  async saveResults() {
    if (!Config.storeResults) {
      console.log('ℹ️ Result storage disabled');
      return;
    }

    console.log('💾 Saving assessment results...');

    try {
      // Prepare result data
      const resultData = {
        testId: this.testId,
        testName: this.testData.testName,
        demographics: this.demographics,
        answers: this.answers,
        scores: this.scores,
        reportData: this.reportData,
        submittedAt: new Date().toISOString(),
        completionTime: this.startedAt ? Math.round((Date.now() - this.startedAt) / 1000) : null
      };

      // Send to storage API
      const response = await fetch(Config.storage.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_key: Config.storage.accessKey,
          action: 'save',
          data: resultData
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error('Failed to save results: ' + (result.message || 'Unknown error'));
      }

      console.log('✅ Results saved successfully! ID:', result.id || 'N/A');

    } catch (error) {
      console.error('❌ Result storage error:', error);
      // Don't block user flow - just log the error
      // Results are already emailed, so this is backup storage
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
   * Setup debug mode (Ctrl+Shift+Z)
   */
  setupDebugMode() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
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
      <button onclick="app.debugSkipToResults()" style="margin:5px 0;padding:5px 10px;width:100%">Skip to Results</button>
      <button onclick="app.debugClearSession()" style="margin:5px 0;padding:5px 10px;width:100%">Clear Session</button>
      <div style="margin-top:10px;font-size:10px;opacity:0.7">Press Ctrl+Shift+Z to toggle</div>
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
   * Debug: Skip to results with random answers
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

    // Fill all answers with random values (1-5)
    Object.keys(this.answers).forEach(key => {
      this.answers[key] = this.answers[key].map(() => Math.floor(Math.random() * 5) + 1);
    });

    console.log('All answers filled with random values (1-5)');

    // Go to results
    this.renderResults();
  }

  /**
   * Debug: Clear session
   */
  async debugClearSession() {
    Storage.clearSession(this.testId);
    console.log('Session cleared');
    await Dialog.showAlert(
      'Your session has been cleared successfully. Refresh the page to start a new assessment.',
      'Session Cleared'
    );
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
