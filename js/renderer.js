/**
 * Renderer Module - Handles page rendering
 */

const Renderer = {
  /**
   * Render intro/demographics page
   */
  renderIntro(testData, demographics, callbacks) {
    const today = new Date().toISOString().slice(0, 10);

    const html = `
      <div>
        <div class="page-title"><strong>${testData.testName}</strong></div>
        <h1>${testData.instructions.title}</h1>
        <p>${testData.instructions.content}</p>
        <p>
          <strong>Approximate time to complete:</strong> ${testData.estimatedTime}<br>
          <strong>Format:</strong> Self-assessment questionnaire using a rating scale of 1–5
        </p>

        <div style="height:10px"></div>
        <div class="two-col" style="margin-top:12px">
          <div>
            <div class="card" style="padding:16px">
              <h3 style="margin:0 0 6px 0">Instructions</h3>
              <div class="muted small">
                <p style="margin:0 0 6px 0;">Read each statement carefully. Then rate each statement using the following scale:</p>
                <ul style="margin:0 0 6px 18px; padding:0;">
                  ${testData.instructions.ratingScale.map(r => `<li>${r.value} = ${r.label}</li>`).join('')}
                </ul>
                <p style="margin:6px 0 0 0;">There are no right or wrong answers — be honest.</p>
              </div>
              <div style="height:12px"></div>
              <div class="muted small"><strong>Navigation</strong>: Use Next and Back. You can't move forward without answering every question on the page.</div>
              <div style="height:12px"></div>
              <div class="muted small"><strong>When done</strong>: Your coach will receive your results and contact you shortly.</div>
            </div>
          </div>
          <div>
            <div class="card" style="padding:12px">
              <h4 style="margin:0 0 6px 0">Student details</h4>
              <div style="display:grid;gap:8px">
                ${testData.demographics.fields.map(field => `
                  <input
                    id="demo-${field.key}"
                    type="${field.type}"
                    placeholder="${field.placeholder}"
                    value="${demographics[field.key] || (field.type === 'date' ? today : '')}"
                    ${field.required ? 'required' : ''}
                  />
                `).join('')}
              </div>
              <div style="height:12px"></div>
              <button class="btn" id="start-btn">Start Assessment</button>
            </div>
          </div>
        </div>
        <div style="height:12px"></div>
        <div class="muted small">Tip: Answer quickly and honestly — there are no right/wrong answers.</div>
      </div>
    `;

    const app = document.getElementById('page-content');
    app.innerHTML = html;
    window.scrollTo(0, 0);

    // Attach event listener
    document.getElementById('start-btn').addEventListener('click', () => {
      const demo = {};
      testData.demographics.fields.forEach(field => {
        const value = document.getElementById(`demo-${field.key}`).value.trim();
        demo[field.key] = value;
      });

      // Automatically add current date
      demo.date = new Date().toISOString().slice(0, 10);

      const validation = Validator.validateDemographics(demo, testData.demographics.fields);
      if (!validation.valid) {
        alert(validation.errors.join('\\n'));
        return;
      }

      callbacks.onStart(demo);
    });
  },

  /**
   * Render a question page
   */
  renderQuestionPage(testData, pageIndex, pages, answers, callbacks) {
    const page = pages[pageIndex];
    const totalPages = pages.length;
    const percent = Math.round(((pageIndex + 1) / (totalPages + 1)) * 100);

    let html = `
      <div class="page-title">${page.section.description}</div>
      <div class="muted small">${page.section.instructions}</div>
      <div class="progress" style="position: relative;">
        <i style="width:${percent}%;"></i>
        <div class="percent-text">${percent}%</div>
      </div>

      <div style="height:12px"></div>
      <div class="rating-guide">
        <strong>Rating scale:</strong>
        <ul>
          ${testData.instructions.ratingScale.map(r => `<li>${r.value} = ${r.label}</li>`).join('')}
        </ul>
        <div style="margin-top:6px">There are no right or wrong answers — be honest.</div>
      </div>

      ${page.category ? `<h3 style="margin:12px 0 8px 0">${page.category.title}</h3>` : ''}

      <div id="qs"></div>

      <div class="nav">
        <div>
          <button class="btn secondary" id="back-btn" ${pageIndex === 0 ? 'disabled' : ''}>Back</button>
        </div>
        <div>
          <button class="btn" id="next-btn">Next</button>
        </div>
      </div>
    `;

    const app = document.getElementById('page-content');
    app.innerHTML = html;
    window.scrollTo(0, 0);

    const qsDiv = document.getElementById('qs');

    // Render questions
    page.questions.forEach((question, qIdx) => {
      const globalIdx = page.questionStartIndex + qIdx;
      const currentVal = answers[page.categoryKey][globalIdx];

      const qDiv = document.createElement('div');
      qDiv.className = 'question';
      qDiv.innerHTML = `
        <div class="qtext">${globalIdx + 1}. ${question}</div>
        <div class="options" data-qindex="${globalIdx}"></div>
      `;
      qsDiv.appendChild(qDiv);

      const optionsDiv = qDiv.querySelector('.options');
      for (let val = 1; val <= 5; val++) {
        const opt = document.createElement('div');
        opt.className = 'option';
        opt.textContent = val;
        if (currentVal === val) opt.classList.add('selected');
        optionsDiv.appendChild(opt);

        opt.addEventListener('click', () => {
          optionsDiv.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
          answers[page.categoryKey][globalIdx] = val;
        });
      }
    });

    // Navigation
    document.getElementById('back-btn').addEventListener('click', () => {
      callbacks.onBack();
    });

    document.getElementById('next-btn').addEventListener('click', () => {
      // Validate all questions answered
      const pageAnswers = page.questions.map((_, qIdx) => {
        const globalIdx = page.questionStartIndex + qIdx;
        return answers[page.categoryKey][globalIdx];
      });

      const missing = pageAnswers.findIndex(x => x === null || x === undefined);
      if (missing !== -1) {
        alert('Please answer all questions on this page before continuing.');
        return;
      }

      callbacks.onNext();
    });
  },

  /**
   * Render results page
   */
  renderResults(testData, reportData, callbacks) {
    const demographics = reportData.demographics;
    const sections = reportData.sections;

    let html = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
        <div>
          <h2>${testData.testName} : Student Report</h2>
          <p>
            Congratulations on completing the Career Compass Assessment! The report below now provides you with a deeper understanding of your <em>True North</em> — the direction that aligns your unique potential and purpose. Please use this report as a <strong>guide</strong> in your career decision making journey. Know that your interests and potential can and most likely will change, depending on what you expose yourself to.
          </p>
          <div class="small-muted">Generated: ${demographics.date || new Date().toISOString().slice(0, 10)}</div>
          <div style="margin-top:8px;padding:8px 12px;background-color:#e8f5e9;border-radius:6px;font-size:14px;">
            ✓ Your results have been emailed automatically
          </div>
        </div>
        <div>
          <button class="btn" id="finish-btn">Finish</button>
          <button class="btn secondary" id="restart">Restart</button>
        </div>
      </div>

      <div class="report" id="report-area" style="margin-top:12px">
        <h3>Student details</h3>
        <div class="two-col">
          ${testData.demographics.fields.map(field => `
            <div class="metric">
              <strong>${field.label}</strong>
              <div class="small-muted">${this.escapeHtml(demographics[field.key] || '')}</div>
            </div>
          `).join('')}
          <div class="metric">
            <strong>Date</strong>
            <div class="small-muted">${demographics.date || new Date().toISOString().slice(0, 10)}</div>
          </div>
        </div>

        ${this.renderReportSections(sections)}

        ${this.renderReportSummary(sections)}

        <div class="footer-note">This report has been generated by the Career Compass Assessment System.</div>
      </div>
    `;

    const app = document.getElementById('page-content');
    app.innerHTML = html;
    window.scrollTo(0, 0);

    // Event listeners
    document.getElementById('finish-btn').addEventListener('click', () => {
      callbacks.onFinish();
    });

    document.getElementById('restart').addEventListener('click', () => {
      if (confirm('Are you sure you want to restart the assessment? All progress will be lost.')) {
        callbacks.onRestart();
      }
    });
  },

  /**
   * Render report sections based on display type
   */
  renderReportSections(sections) {
    let html = '';

    for (const [sectionId, section] of Object.entries(sections)) {
      html += `<h3 style="margin-top:16px">${section.title}</h3>`;

      if (section.description) {
        html += `<p style="margin-bottom: 16px; line-height: 1.6;">${section.description}</p>`;
      }

      if (section.display === 'top3-bottom3') {
        html += `
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <div style="flex:1" class="top-clusters">
              <h4>Top 3</h4>
              <ol>
                ${section.top3.map(item => `<li>${item.title} (Total: ${item.total})</li>`).join('')}
              </ol>
            </div>
            <div style="flex:1" class="low-clusters">
              <h4>Bottom 3</h4>
              <ol>
                ${section.bottom3.map(item => `<li>${item.title} (Total: ${item.total})</li>`).join('')}
              </ol>
            </div>
          </div>
        `;
      } else if (section.display === 'clusters') {
        html += `
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <div style="flex:1" class="top-clusters">
              <h4>Top 3 strength clusters</h4>
              <ol>
                ${section.topClusters.map(c => `<li>${c.name} — Total: ${c.total}, Avg: ${c.avg}</li>`).join('')}
              </ol>
            </div>
            <div style="flex:1" class="low-clusters">
              <h4>Lowest 3 strength clusters</h4>
              <ol>
                ${section.bottomClusters.map(c => `<li>${c.name} — Total: ${c.total}, Avg: ${c.avg}</li>`).join('')}
              </ol>
            </div>
          </div>
        `;
      } else if (section.display === 'total-only') {
        html += `
          <div style="margin-bottom:8px">
            <div class="metric">
              <strong>Overall total</strong>
              <div class="small-muted">${section.total}</div>
            </div>
          </div>
        `;
      }
    }

    return html;
  },

  /**
   * Render report summary section
   */
  renderReportSummary(sections) {
    const sectionA = sections['section-a'];
    const sectionB = sections['section-b'];
    const sectionC = sections['section-c'];

    if (!sectionA || !sectionB) return '';

    const topCareerCluster = sectionA.top3 && sectionA.top3[0] ? sectionA.top3[0].title : 'N/A';
    const topDrivers = sectionB.top3 ? sectionB.top3.map(d => d.title).join(', ') : 'N/A';
    const topStrengths = sectionC && sectionC.topStrengths
      ? sectionC.topStrengths.map(s => s.text).join('; ')
      : 'See strength clusters above';

    return `
      <h3 style="margin-top:24px">Report Summary</h3>
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:8px;border-bottom:1px dashed #e9f6f6"><strong>Dominant career cluster (Top 1)</strong></td>
          <td style="padding:8px;border-bottom:1px dashed #e9f6f6">${this.escapeHtml(topCareerCluster)}</td>
        </tr>
        <tr>
          <td style="padding:8px;border-bottom:1px dashed #e9f6f6"><strong>Top 3 career drivers</strong></td>
          <td style="padding:8px;border-bottom:1px dashed #e9f6f6">${this.escapeHtml(topDrivers)}</td>
        </tr>
        <tr>
          <td style="padding:8px;border-bottom:1px dashed #e9f6f6"><strong>Top strengths (sample)</strong></td>
          <td style="padding:8px;border-bottom:1px dashed #e9f6f6">${this.escapeHtml(topStrengths)}</td>
        </tr>
        <tr>
          <td style="padding:8px"><strong>Top growth areas to work on</strong></td>
          <td style="padding:8px">See growth area scores above — focus on highest-scoring items as priority areas for development.</td>
        </tr>
      </table>
    `;
  },

  /**
   * Render completion/thank you page
   */
  renderCompletion(testData) {
    const completion = testData.reporting.completionMessage;

    const html = `
      <div style="text-align:center;padding:60px 20px">
        <h1 style="color:var(--accent);margin-bottom:16px">${completion.title}</h1>
        <p style="font-size:18px;line-height:1.6;max-width:600px;margin:0 auto 24px auto">
          ${completion.message}
        </p>
        <div style="margin-top:40px">
          <a href="index.html" class="btn">Return to Home</a>
        </div>
      </div>
    `;

    const app = document.getElementById('page-content');
    app.innerHTML = html;
    window.scrollTo(0, 0);
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
