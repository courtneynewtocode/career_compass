/**
 * Dashboard Module - View and manage assessment results
 */

const Dashboard = {
  allResults: [],
  filteredResults: [],
  currentResult: null,

  /**
   * Initialize dashboard
   */
  async init() {
    console.log('🚀 Initializing dashboard...');

    // Load analytics and results in parallel
    await Promise.all([
      this.loadAnalytics(),
      this.loadResults()
    ]);

    // Setup event listeners
    this.setupEventListeners();

    // Initial render
    this.renderAnalyticsStats();
    this.renderStats();
    this.renderResults();
  },

  /**
   * Setup event listeners for filters
   */
  setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const testFilter = document.getElementById('test-filter');
    const sortFilter = document.getElementById('sort-filter');

    searchInput.addEventListener('input', () => this.applyFilters());
    testFilter.addEventListener('change', () => this.applyFilters());
    sortFilter.addEventListener('change', () => this.applyFilters());
  },

  /**
   * Load results from storage API
   */
  async loadResults() {
    try {
      console.log('📥 Fetching results from storage API...');

      const response = await fetch(Config.storage.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_key: Config.storage.accessKey,
          action: 'list'
        })
      });

      // Check if response is OK
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('STORAGE_NOT_FOUND');
        } else if (response.status === 502 || response.status === 503) {
          throw new Error('SERVER_UNAVAILABLE');
        } else if (response.status >= 500) {
          throw new Error('SERVER_ERROR');
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('ACCESS_DENIED');
        } else {
          throw new Error('NETWORK_ERROR');
        }
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error('INVALID_RESPONSE');
      }

      if (!result.success) {
        throw new Error(result.message || 'Unknown error');
      }

      this.allResults = result.data || [];
      this.filteredResults = [...this.allResults];

      console.log(`✅ Loaded ${this.allResults.length} results`);

      // Hide loading, show content
      document.getElementById('loading').style.display = 'none';

      if (this.allResults.length === 0) {
        document.getElementById('empty-state').style.display = 'block';
      } else {
        document.getElementById('results-table').style.display = 'table';
      }

    } catch (error) {
      console.error('❌ Error loading results:', error);

      // Determine user-friendly message based on error type
      let errorTitle = '⚠️ Unable to Load Results';
      let errorMessage = '';
      let showRetry = true;

      if (error.message === 'STORAGE_NOT_FOUND') {
        errorTitle = '🔧 Setup Required';
        errorMessage = 'The storage API endpoint is not configured or cannot be found. Please check your configuration in <code>js/config.js</code>.';
      } else if (error.message === 'SERVER_UNAVAILABLE') {
        errorTitle = '🌐 Server Temporarily Unavailable';
        errorMessage = 'The storage server is currently unavailable. This might be due to maintenance or high traffic. Please try again in a few moments.';
      } else if (error.message === 'SERVER_ERROR') {
        errorTitle = '⚠️ Server Error';
        errorMessage = 'The storage server encountered an error. Please try again later or contact your administrator.';
      } else if (error.message === 'ACCESS_DENIED') {
        errorTitle = '🔒 Access Denied';
        errorMessage = 'Your access key may be invalid or you don\'t have permission to view results. Please check your credentials.';
        showRetry = false;
      } else if (error.message === 'INVALID_RESPONSE') {
        errorTitle = '⚠️ Invalid Server Response';
        errorMessage = 'The server returned an invalid response. This usually means the API endpoint is not properly configured or is returning HTML instead of JSON data.';
      } else if (error.message === 'NETWORK_ERROR' || error.message.includes('fetch')) {
        errorTitle = '🌐 Connection Error';
        errorMessage = 'Unable to connect to the storage server. Please check your internet connection and try again.';
      } else if (error.message.includes('Failed to load')) {
        errorMessage = error.message;
      } else {
        errorMessage = `An unexpected error occurred: ${error.message}`;
      }

      document.getElementById('loading').innerHTML = `
        <div style="max-width: 600px; margin: 0 auto; text-align: center;">
          <p style="color: #ef4444; font-size: 18px; font-weight: 600; margin-bottom: 12px;">${errorTitle}</p>
          <p style="font-size: 15px; color: #6b7280; line-height: 1.6; margin-bottom: 24px;">${errorMessage}</p>
          ${showRetry ? `
            <button class="btn" onclick="Dashboard.refreshData()" style="background: #0b8f8f; color: white; border: none; border-radius: 12px; padding: 12px 24px; font-weight: 600; cursor: pointer; margin-right: 12px;">
              🔄 Try Again
            </button>
          ` : ''}
          <a href="index.html" class="btn secondary" style="display: inline-block; text-decoration: none; padding: 12px 24px; border-radius: 12px;">
            ← Back to Home
          </a>
        </div>
      `;
    }
  },

  /**
   * Load analytics from storage API
   */
  async loadAnalytics() {
    try {
      console.log('📊 Fetching analytics from storage API...');

      const response = await fetch(Config.storage.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_key: Config.storage.accessKey,
          action: 'get_analytics'
        })
      });

      // Check if response is OK
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('JSON Parse Error in analytics:', parseError);
        // If analytics fails to parse, we'll just use default values
        throw new Error('INVALID_RESPONSE');
      }

      if (!result.success) {
        throw new Error('Failed to load analytics: ' + (result.message || 'Unknown error'));
      }

      this.analytics = result.stats || {};
      console.log('✅ Analytics loaded successfully');

    } catch (error) {
      console.error('❌ Error loading analytics:', error);
      // Fallback to zero values on error so the dashboard doesn't look broken
      this.analytics = {
        test_started: 0,
        test_completed: 0,
        completion_rate: 0,
        email_sent_success: 0,
        email_sent_failure: 0
      };

      // We don't show a UI error for analytics to avoid cluttering the dashboard,
      // as the main results table error is sufficient feedback for the user.
    }
  },

  /**
   * Render analytics stats cards
   */
  renderAnalyticsStats() {
    if (!this.analytics) return;

    const started = this.analytics.test_started || 0;
    const completed = this.analytics.test_completed || 0;
    const completionRate = this.analytics.completion_rate || 0;
    const emailSuccess = this.analytics.email_sent_success || 0;
    const emailTotal = emailSuccess + (this.analytics.email_sent_failure || 0);
    const emailRate = emailTotal > 0 ? Math.round((emailSuccess / emailTotal) * 100) : 0;

    document.getElementById('analytics-started').textContent = started;
    document.getElementById('analytics-completed').textContent = completed;
    document.getElementById('analytics-completion-rate').textContent = `${completionRate}%`;
    document.getElementById('analytics-email-success').textContent = `${emailRate}%`;

    // Color code completion rate
    const rateElement = document.getElementById('analytics-completion-rate');
    if (completionRate >= 80) {
      rateElement.style.color = '#16a34a'; // Green
    } else if (completionRate >= 50) {
      rateElement.style.color = '#f59e0b'; // Orange
    } else {
      rateElement.style.color = '#ef4444'; // Red
    }

    // Color code email success rate
    const emailElement = document.getElementById('analytics-email-success');
    if (emailRate >= 95) {
      emailElement.style.color = '#16a34a'; // Green
    } else if (emailRate >= 80) {
      emailElement.style.color = '#f59e0b'; // Orange
    } else {
      emailElement.style.color = '#ef4444'; // Red
    }
  },

  /**
   * Refresh data
   */
  async refreshData() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results-table').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';

    await Promise.all([
      this.loadAnalytics(),
      this.loadResults()
    ]);

    this.renderAnalyticsStats();
    this.renderStats();
    this.renderResults();
  },

  /**
   * Apply search and filter
   */
  applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const testFilter = document.getElementById('test-filter').value;
    const sortFilter = document.getElementById('sort-filter').value;

    // Filter results
    this.filteredResults = this.allResults.filter(result => {
      // Search filter
      if (searchTerm) {
        const searchableText = [
          result.demographics?.studentName || '',
          result.demographics?.email || '',
          result.demographics?.grade || ''
        ].join(' ').toLowerCase();

        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Test type filter
      if (testFilter && result.testId !== testFilter) {
        return false;
      }

      return true;
    });

    // Sort results
    this.filteredResults.sort((a, b) => {
      switch (sortFilter) {
        case 'date-desc':
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        case 'date-asc':
          return new Date(a.submittedAt) - new Date(b.submittedAt);
        case 'name-asc':
          return (a.demographics?.studentName || '').localeCompare(b.demographics?.studentName || '');
        case 'name-desc':
          return (b.demographics?.studentName || '').localeCompare(a.demographics?.studentName || '');
        default:
          return 0;
      }
    });

    this.renderResults();
  },

  /**
   * Render statistics
   */
  renderStats() {
    const total = this.allResults.length;
    const compassCount = this.allResults.filter(r => r.testId === 'career-compass').length;

    // Count results from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCount = this.allResults.filter(r => new Date(r.submittedAt) >= sevenDaysAgo).length;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-compass').textContent = compassCount;
    document.getElementById('stat-recent').textContent = recentCount;
  },

  /**
   * Render results table
   */
  renderResults() {
    const tbody = document.getElementById('results-tbody');

    if (this.filteredResults.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: var(--muted);">
            No results match your filters.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.filteredResults.map((result, index) => {
      const date = new Date(result.submittedAt);
      const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const name = result.demographics?.studentName || 'Unknown';
      const email = result.demographics?.email || '-';
      const grade = result.demographics?.grade || '-';

      const testBadge = result.testId === 'career-compass'
        ? '<span class="badge badge-primary">Career Compass</span>'
        : '<span class="badge badge-secondary">Career Readiness</span>';

      const duration = result.completionTime
        ? this.formatDuration(result.completionTime)
        : '-';

      return `
        <tr>
          <td style="white-space: nowrap;">${dateStr}</td>
          <td><strong>${this.escapeHtml(name)}</strong></td>
          <td>${testBadge}</td>
          <td>${this.escapeHtml(grade)}</td>
          <td>${this.escapeHtml(email)}</td>
          <td>${duration}</td>
          <td>
            <button class="view-btn" onclick="Dashboard.viewResult(${index})" style="background: #0b8f8f; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; margin-right: 8px;">View</button>
            <button class="view-btn" onclick="Dashboard.exportResultPdf(${index})" style="background: #102e7a; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;">📄 PDF</button>
          </td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Format duration in seconds to readable format
   */
  formatDuration(seconds) {
    if (!seconds) return '-';

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (minutes === 0) {
      return `${secs}s`;
    }

    return `${minutes}m ${secs}s`;
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * View individual result
   */
  async viewResult(index) {
    const result = this.filteredResults[index];

    if (!result) {
      await Dialog.showAlert('Result not found.', 'Error');
      return;
    }

    this.currentResult = result;

    // Load the test definition to render properly
    try {
      const testResponse = await fetch(`tests/${result.testId}.json`);
      const testData = await testResponse.json();

      // Render the result in modal using Renderer
      const modalBody = document.getElementById('modal-body');
      modalBody.innerHTML = '';

      // Create a temporary container for rendering
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.renderResultDetail(testData, result);
      modalBody.appendChild(tempDiv);

      // Show modal
      document.getElementById('result-modal').classList.add('active');

    } catch (error) {
      console.error('Error loading result:', error);
      await Dialog.showAlert('Failed to load result details.', 'Error');
    }
  },

  /**
   * Export result as PDF
   */
  async exportResultPdf(index) {
    const result = this.filteredResults[index];

    if (!result) {
      await Dialog.showAlert('Result not found.', 'Error');
      return;
    }

    try {
      // Load PDF library
      Loading.show('Generating PDF...', 'Please wait');
      await PdfLoader.load();

      // Load the test definition
      const testResponse = await fetch(`tests/${result.testId}.json`);
      const testData = await testResponse.json();

      // Create a container with the result content
      const container = document.createElement('div');
      container.style.cssText = `
        width: 800px;
        position: absolute;
        left: -9999px;
        top: 0;
        background: white;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      // Render the result detail
      container.innerHTML = this.renderResultDetail(testData, result);
      document.body.appendChild(container);

      // Add PDF-specific styling
      const style = document.createElement('style');
      style.textContent = `
        h3 {
          margin-top: 20px !important;
          padding-top: 10px !important;
          color: #0b8f8f !important;
        }
        .metric {
          padding: 8px;
          background: #f8feff;
          border-radius: 8px;
          margin-bottom: 8px;
        }
        .top-clusters {
          background-color: rgba(148, 196, 148, 0.3);
          padding: 12px;
          border-radius: 10px;
        }
        .neutral-clusters {
          background-color: rgba(128, 128, 128, 0.12);
          padding: 12px;
          border-radius: 10px;
        }
        .low-clusters {
          background-color: rgba(171, 127, 119, 0.2);
          padding: 12px;
          border-radius: 10px;
        }
      `;
      container.insertBefore(style, container.firstChild);

      // Configure PDF options
      const studentName = result.demographics?.studentName || 'Student';
      const options = {
        margin: [10, 10, 10, 10],
        filename: `${studentName.replace(/[^a-zA-Z0-9]/g, '_')}_${testData.testName.replace(/[^a-zA-Z0-9]/g, '_')}_Report.pdf`,
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
          windowHeight: 4000,
          width: 800
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        },
        pagebreak: {
          mode: ['css', 'legacy']
        }
      };

      // Generate and download PDF
      await PdfLoader.generatePdf(container, options, true); // true = download directly

      // Clean up
      document.body.removeChild(container);
      Loading.hide();

      console.log('✅ PDF exported successfully');

    } catch (error) {
      console.error('❌ PDF export error:', error);
      Loading.hide();
      await Dialog.showAlert('Failed to export PDF. Please try again.', 'Error');
    }
  },

  /**
   * Render result detail (similar to report page)
   */
  renderResultDetail(testData, result) {
    const demographics = result.demographics || {};
    const sections = result.reportData?.sections || {};

    let html = `
      <div style="margin-bottom: 30px;">
        <h2 style="color: var(--accent); margin-bottom: 10px;">${testData.testName} - Results</h2>
        <p style="color: var(--muted); font-size: 14px;">
          Submitted: ${new Date(result.submittedAt).toLocaleString()}
        </p>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="color: var(--accent); margin-bottom: 16px;">Student Details</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
          ${testData.demographics?.fields?.map(field => `
            <div class="metric">
              <strong>${field.label}</strong>
              <div class="small-muted">${this.escapeHtml(demographics[field.key] || '-')}</div>
            </div>
          `).join('') || '<div class="metric"><strong>No demographic fields defined</strong></div>'}
          <div class="metric">
            <strong>Completion Time</strong>
            <div class="small-muted">${this.formatDuration(result.completionTime)}</div>
          </div>
        </div>
      </div>
    `;

    // Render sections
    for (const [sectionId, section] of Object.entries(sections)) {
      html += `<h3 style="margin-top: 40px; color: var(--accent);">${section.title}</h3>`;

      if (section.description) {
        html += `<div style="margin-bottom: 16px; line-height: 1.6;">${section.description}</div>`;
      }

      // Render based on display type
      if (section.display === 'top3-bottom3' || section.display === 'top3-bottom2') {
        const bottomKey = section.bottom3 ? 'bottom3' : 'bottom2';
        html += `
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <div style="flex:1" class="top-clusters">
              <h4>Top 3</h4>
              <ol>
                ${section.top3?.map(item => `<li>${item.title} (Total: ${item.total})</li>`).join('') || '<li>No data available</li>'}
              </ol>
            </div>
            <div style="flex:1" class="low-clusters">
              <h4>${section.bottom3 ? 'Bottom 3' : 'Bottom 2'}</h4>
              <ol>
                ${section[bottomKey]?.map(item => `<li>${item.title} (Total: ${item.total})</li>`).join('') || '<li>No data available</li>'}
              </ol>
            </div>
          </div>
        `;
      } else if (section.display === 'grouped-thirds') {
        html += `
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">
            <div style="flex:1" class="top-clusters">
              <h4>Top 3 Strengths</h4>
              <ol>${section.topThird?.map(c => `<li>${c.name} (Total: ${c.total})</li>`).join('') || '<li>No data available</li>'}</ol>
            </div>
            <div style="flex:1" class="neutral-clusters">
              <h4>Middle 3 Strengths</h4>
              <ol start="4">${section.midThird?.map(c => `<li>${c.name} (Total: ${c.total})</li>`).join('') || '<li>No data available</li>'}</ol>
            </div>
            <div style="flex:1" class="low-clusters">
              <h4>Bottom 3 Strengths</h4>
              <ol start="7">${section.bottomThird?.map(c => `<li>${c.name} (Total: ${c.total})</li>`).join('') || '<li>No data available</li>'}</ol>
            </div>
          </div>
        `;
      } else if (section.display === 'grouped-reverse') {
        html += `
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">
            <div style="flex:1" class="low-clusters">
              <h4>Areas to Prioritize</h4>
              <ol>${section.topThird?.map(c => `<li>${c.name} (Total: ${c.total})</li>`).join('') || '<li>No data available</li>'}</ol>
            </div>
            <div style="flex:1" class="neutral-clusters">
              <h4>Developing Areas</h4>
              <ol start="4">${section.midThird?.map(c => `<li>${c.name} (Total: ${c.total})</li>`).join('') || '<li>No data available</li>'}</ol>
            </div>
          </div>
        `;
      } else if (section.display === 'total-only') {
        html += `
          <div class="metric" style="max-width: 300px;">
            <strong>Overall Score</strong>
            <div style="font-size: 32px; font-weight: 700; color: var(--accent); margin-top: 8px;">
              ${section.grandTotal}
            </div>
          </div>
        `;
      }

      if (section.guidance) {
        html += `<div style="margin-top: 16px; padding: 16px; background: rgba(11, 143, 143, 0.05); border-radius: 10px; line-height: 1.6;">${section.guidance}</div>`;
      }
    }

    return html;
  },

  /**
   * Close modal
   */
  closeModal() {
    document.getElementById('result-modal').classList.remove('active');
    this.currentResult = null;
  }
};

// Initialize dashboard when DOM is loaded (only if authenticated)
window.addEventListener('DOMContentLoaded', () => {
  if (typeof DashboardAuth !== 'undefined' && Config.dashboard?.requireAuth && !DashboardAuth.isAuthenticated()) {
    return; // Auth module will show login form; skip dashboard init
  }
  Dashboard.init();
});

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  const modal = document.getElementById('result-modal');
  if (e.target === modal) {
    Dashboard.closeModal();
  }
});

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    Dashboard.closeModal();
  }
});
