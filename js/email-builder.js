/**
 * Email Builder Module - Builds HTML email reports
 */

const EmailBuilder = {
  /**
   * Build complete HTML email report
   */
  buildEmailReport(testData, reportData, demographics) {
    const sections = reportData.sections;
    const submittedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Inline styles for email compatibility
    const styles = {
      body: 'font-family: Arial, sans-serif; line-height: 1.6; color: #0f1720; background-color: #f6fbfb; margin: 0; padding: 20px;',
      container: 'max-width: 800px; margin: 0 auto; background-color: #ffffff; border-radius: 14px; padding: 30px; box-shadow: 0 6px 20px rgba(12, 20, 24, 0.06);',
      header: 'color: #0b8f8f; margin-top: 0; margin-bottom: 10px; border-bottom: 2px solid #0b8f8f; padding-bottom: 10px;',
      h2: 'color: #0b8f8f; margin-top: 25px; margin-bottom: 12px;',
      h3: 'color: #0f1720; margin-top: 20px; margin-bottom: 10px;',
      table: 'width: 100%; border-collapse: collapse; margin: 15px 0;',
      th: 'background-color: #0b8f8f; color: white; padding: 12px; text-align: left; border: 1px solid #0b8f8f;',
      td: 'padding: 10px; border: 1px solid #ddd;',
      topCluster: 'background-color: rgba(148, 196, 148, 0.3); padding: 15px; border-radius: 10px; margin: 10px 0;',
      lowCluster: 'background-color: rgba(171, 127, 119, 0.2); padding: 15px; border-radius: 10px; margin: 10px 0;',
      footer: 'margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #6b6f76; font-size: 12px; text-align: center;'
    };

    let html = `<div style="${styles.body}">`;
    html += `<div style="${styles.container}">`;

    // Header
    html += `<h1 style="${styles.header}">Career Compass Assessment Results</h1>`;
    html += `<p style="color: #6b6f76; font-size: 14px;">Submitted: ${this.escapeHtml(submittedAt)}</p>`;

    // Student Details
    html += `<h2 style="${styles.h2}">Student Details</h2>`;
    html += `<table style="${styles.table}">`;
    html += `<tr><th style="${styles.th}">Field</th><th style="${styles.th}">Value</th></tr>`;

    // Add all demographics fields
    testData.demographics.fields.forEach(field => {
      const value = demographics[field.key] || '';
      html += `<tr><td style="${styles.td}">${this.escapeHtml(field.label)}</td><td style="${styles.td}">${this.escapeHtml(value)}</td></tr>`;
    });

    // Add date
    html += `<tr><td style="${styles.td}">Date</td><td style="${styles.td}">${this.escapeHtml(demographics.date || new Date().toISOString().slice(0, 10))}</td></tr>`;
    html += `</table>`;

    // Results Sections
    for (const [sectionId, section] of Object.entries(sections)) {
      html += `<h2 style="${styles.h2}">${this.escapeHtml(section.title)}</h2>`;

      if (section.description) {
        html += `<p style="line-height: 1.6;">${section.description}</p>`;
      }

      // Top 3 / Bottom 3 display
      if (section.display === 'top3-bottom3' && section.top3 && section.bottom3) {
        html += `<div style="display: table; width: 100%;">`;

        // Top 3
        html += `<div style="display: table-cell; width: 48%; vertical-align: top; padding-right: 2%;">`;
        html += `<div style="${styles.topCluster}">`;
        html += `<h3 style="${styles.h3}">Top 3 Results</h3>`;
        html += `<ol style="margin: 0; padding-left: 20px;">`;
        section.top3.forEach(item => {
          html += `<li style="margin: 5px 0;"><strong>${this.escapeHtml(item.title)}</strong> (Total: ${item.total})</li>`;
        });
        html += `</ol></div></div>`;

        // Bottom 3
        html += `<div style="display: table-cell; width: 48%; vertical-align: top; padding-left: 2%;">`;
        html += `<div style="${styles.lowCluster}">`;
        html += `<h3 style="${styles.h3}">Bottom 3 Results</h3>`;
        html += `<ol style="margin: 0; padding-left: 20px;">`;
        section.bottom3.forEach(item => {
          html += `<li style="margin: 5px 0;"><strong>${this.escapeHtml(item.title)}</strong> (Total: ${item.total})</li>`;
        });
        html += `</ol></div></div>`;

        html += `</div>`;
      }

      // Cluster display
      if (section.display === 'clusters' && section.topClusters && section.bottomClusters) {
        html += `<div style="display: table; width: 100%;">`;

        // Top Clusters
        html += `<div style="display: table-cell; width: 48%; vertical-align: top; padding-right: 2%;">`;
        html += `<div style="${styles.topCluster}">`;
        html += `<h3 style="${styles.h3}">Top 3 Strength Clusters</h3>`;
        html += `<ol style="margin: 0; padding-left: 20px;">`;
        section.topClusters.forEach(cluster => {
          html += `<li style="margin: 5px 0;"><strong>${this.escapeHtml(cluster.name)}</strong><br>`;
          html += `<span style="font-size: 13px; color: #6b6f76;">Total: ${cluster.total}, Average: ${cluster.avg}</span></li>`;
        });
        html += `</ol></div></div>`;

        // Bottom Clusters
        html += `<div style="display: table-cell; width: 48%; vertical-align: top; padding-left: 2%;">`;
        html += `<div style="${styles.lowCluster}">`;
        html += `<h3 style="${styles.h3}">Lowest 3 Strength Clusters</h3>`;
        html += `<ol style="margin: 0; padding-left: 20px;">`;
        section.bottomClusters.forEach(cluster => {
          html += `<li style="margin: 5px 0;"><strong>${this.escapeHtml(cluster.name)}</strong><br>`;
          html += `<span style="font-size: 13px; color: #6b6f76;">Total: ${cluster.total}, Average: ${cluster.avg}</span></li>`;
        });
        html += `</ol></div></div>`;

        html += `</div>`;
      }

      // Total only display
      if (section.display === 'total-only' && section.total !== undefined) {
        html += `<div style="background-color: #f8feff; padding: 15px; border-radius: 10px; margin: 10px 0;">`;
        html += `<p style="margin: 0;"><strong>Overall Total:</strong> ${section.total}</p>`;
        html += `</div>`;
      }
    }

    // Report Summary
    const sectionA = sections['section-a'];
    const sectionB = sections['section-b'];
    const sectionC = sections['section-c'];

    if (sectionA && sectionB) {
      const topCareerCluster = (sectionA.top3 && sectionA.top3[0]) ? sectionA.top3[0].title : 'N/A';
      const topDrivers = sectionB.top3 ? sectionB.top3.map(d => d.title).join(', ') : 'N/A';
      const topStrengths = (sectionC && sectionC.topStrengths)
        ? sectionC.topStrengths.map(s => s.text).join('; ')
        : 'See strength clusters above';

      html += `<h3 style="${styles.h3}; margin-top: 24px;">Report Summary</h3>`;
      html += `<table style="${styles.table}">`;
      html += `<tr><th style="${styles.th}">Category</th><th style="${styles.th}">Result</th></tr>`;
      html += `<tr><td style="${styles.td}"><strong>Dominant career cluster (Top 1)</strong></td><td style="${styles.td}">${this.escapeHtml(topCareerCluster)}</td></tr>`;
      html += `<tr><td style="${styles.td}"><strong>Top 3 career drivers</strong></td><td style="${styles.td}">${this.escapeHtml(topDrivers)}</td></tr>`;
      html += `<tr><td style="${styles.td}"><strong>Top strengths (sample)</strong></td><td style="${styles.td}">${this.escapeHtml(topStrengths)}</td></tr>`;
      html += `<tr><td style="${styles.td}"><strong>Top growth areas to work on</strong></td><td style="${styles.td}">See growth area scores above — focus on highest-scoring items as priority areas for development.</td></tr>`;
      html += `</table>`;
    }

    // Footer
    html += `<div style="${styles.footer}">`;
    html += `<p>This is an automated email from the Career Compass Assessment System.</p>`;
    html += `<p>Powered by CGA Global Reports</p>`;
    html += `</div>`;

    html += `</div></div>`;

    return html;
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
