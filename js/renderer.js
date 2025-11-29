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
        <div class="container" style="position: relative; display: flex; align-items: end ; margin-bottom: 30px; min-height: 80px;">
            <img src="assets/cga-logo.jpg" alt="CGA Global" style="position: absolute; top: 0; right: 0; width: 180px; height: auto;" />
        </div>
        <h2>${testData.testName}</h2>
        <p>${testData.instructions.content}</p>
        <p>
          <strong>Approximate time to complete:</strong> ${testData.estimatedTime}<br>
          <strong>Format:</strong> Self-assessment questionnaire using a rating scale of 1–5
        </p>

        <div style="height:10px"></div>
        <div class="two-col" style="margin-top:12px">
          <div>
            <div class="card" style="padding:20px">
              <h3 style="margin:0 0 16px 0; color: var(--accent); font-size: 18px;">Instructions</h3>

              <div style="background: #f8feff; padding: 14px; border-radius: 10px; margin-bottom: 14px; border-left: 3px solid var(--accent);">
                <p style="margin:0 0 10px 0; font-size: 14px; color: #0f1720; font-weight: 500;">Read each statement carefully. Then rate using this scale:</p>
                <ul style="margin:0; padding-left: 20px; list-style: none;">
                  ${testData.instructions.ratingScale.map(r => `
                    <li style="margin: 6px 0; font-size: 14px; color: #374151;">
                      <span style="display: inline-block; width: 24px; height: 24px; background: var(--accent); color: white; border-radius: 50%; text-align: center; line-height: 24px; font-weight: 600; font-size: 13px; margin-right: 8px;">${r.value}</span>
                      <span>${r.label}</span>
                    </li>
                  `).join('')}
                </ul>
                <p style="margin:12px 0 0 0; font-size: 13px; color: #6b7280; font-style: italic;">💡 There are no right or wrong answers — be honest.</p>
              </div>

              <div style="display: grid; gap: 10px;">
                <div style="display: flex; align-items: start; gap: 10px; padding: 10px; background: rgba(11, 143, 143, 0.03); border-radius: 8px;">
                  <span style="font-size: 18px; flex-shrink: 0;">🧭</span>
                  <div style="font-size: 14px; color: #374151;">
                    <strong style="color: #0f1720;">Navigation:</strong> ${Config.showBackButton ? 'Use Next and Back buttons.' : 'Use the Next button to continue.'} You can't move forward without answering every question on the page.
                  </div>
                </div>
                <div style="display: flex; align-items: start; gap: 10px; padding: 10px; background: rgba(11, 143, 143, 0.03); border-radius: 8px;">
                  <span style="font-size: 18px; flex-shrink: 0;">📧</span>
                  <div style="font-size: 14px; color: #374151;">
                    <strong style="color: #0f1720;">When done:</strong> Your coach will receive your results and contact you shortly.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div class="card" style="padding:20px">
              <h3 style="margin:0 0 16px 0; color: var(--accent); font-size: 18px;">Student Details</h3>
              <div style="display:grid;gap:12px">
                ${testData.demographics.fields.map(field => {
      // Check if this field should be a select dropdown
      if (field.type === 'select' && field.options) {
        const currentValue = demographics[field.key] || '';
        return `
                      <select
                        id="demo-${field.key}"
                        ${field.required ? 'required' : ''}
                        style="width: 100%; padding: 14px 16px; border: 2px solid #e7eff0; border-radius: 12px; font-size: 15px; background-color: white; cursor: pointer; transition: all 0.2s ease;"
                      >
                        <option value="" disabled ${!currentValue ? 'selected' : ''}>${field.placeholder}</option>
                        ${field.options.map(opt => `
                          <option value="${opt.value}" ${currentValue === opt.value ? 'selected' : ''}>${opt.label}</option>
                        `).join('')}
                      </select>
                    `;
      }

      // Regular input field
      let attrs = `
                    id="demo-${field.key}"
                    type="${field.type}"
                    placeholder="${field.placeholder}"
                    value="${demographics[field.key] || (field.type === 'date' ? today : '')}"
                    ${field.required ? 'required' : ''}
                  `;

      // Add field-specific validation attributes
      if (field.key === 'studentName') {
        attrs += ` minlength="2" maxlength="100" pattern="[a-zA-Z\\s\\-']+" title="Name should contain only letters, spaces, hyphens, and apostrophes"`;
      }

      if (field.key === 'age') {
        attrs += ` min="10" max="100" title="Age should be between 10 and 100"`;
      }

      if (field.key === 'grade' && field.type === 'text') {
        attrs += ` maxlength="30" title="Enter your grade (e.g., K, R, 1-12) or year of study (e.g., 1st Year, Final Year)"`;
      }

      if (field.validation === 'email') {
        attrs += ` title="Enter a valid email address (e.g., name@example.com)"`;
      }

      if (field.validation === 'phone') {
        attrs += ` pattern="[0-9\\s\\-\\+\\(\\)]+" title="Enter a valid contact number (e.g., 0812345678 or +27812345678)"`;
      }

      return `<input ${attrs} />`;
    }).join('')}
              </div>
              <div style="height:20px"></div>
              <button class="btn" id="start-btn" style="width: 100%;">Start Assessment</button>
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
    document.getElementById('start-btn').addEventListener('click', async () => {
      const demo = {};
      testData.demographics.fields.forEach(field => {
        const value = document.getElementById(`demo-${field.key}`).value.trim();
        demo[field.key] = value;
      });

      // Automatically add current date
      demo.date = new Date().toISOString().slice(0, 10);

      const validation = Validator.validateDemographics(demo, testData.demographics.fields);
      if (!validation.valid) {
        await Dialog.showAlert(
          '<strong>Please check the following:</strong><br><br>' +
          validation.errors.map(err => `• ${err}`).join('<br>'),
          'Validation Error'
        );
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
        ${Config.showBackButton ? `
        <div>
          <button class="btn secondary" id="back-btn" ${pageIndex === 0 ? 'disabled' : ''}>Back</button>
        </div>
        ` : '<div></div>'}
        <div>
          <button class="btn" id="next-btn">${pageIndex === totalPages - 1 ? 'Submit' : 'Next'}</button>
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
    if (Config.showBackButton) {
      document.getElementById('back-btn').addEventListener('click', () => {
        callbacks.onBack();
      });
    }

    document.getElementById('next-btn').addEventListener('click', async () => {
      // Validate all questions answered
      const pageAnswers = page.questions.map((_, qIdx) => {
        const globalIdx = page.questionStartIndex + qIdx;
        return answers[page.categoryKey][globalIdx];
      });

      const missing = pageAnswers.findIndex(x => x === null || x === undefined);
      if (missing !== -1) {
        await Dialog.showAlert(
          'Please answer all questions on this page before continuing to the next section.',
          'Incomplete Page'
        );
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
      <div>
        <div class="container" style="position: relative; display: flex; align-items: center; margin-bottom: 24px; min-height: 80px;">
          <img src="assets/cga-logo.jpg" alt="CGA Global" style="position: absolute; top: 0; right: 0; width: 180px; height: auto;" />
        </div>
        <h2 style="margin: 0;">${testData.testName} : Student Report</h2>
        <p>The report below now provides you with a deeper understanding of your <em>True North</em> — the direction that aligns your unique potential and purpose.</p>
        <p>Please use this report as a <strong>guide</strong> in your career decision-making journey. Know that your interests and potential can and most likely will change, depending on what you expose yourself to.</p>
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

        ${this.renderReportSections(testData, sections)}

        ${this.renderReportSummary(sections)}

        <div style="text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e9f6f6;">
          <button class="btn" id="finish-btn">Finish</button>
        </div>
      </div>
    `;

    const app = document.getElementById('page-content');
    app.innerHTML = html;
    window.scrollTo(0, 0);

    // Event listeners (only add if elements exist)
    const finishBtn = document.getElementById('finish-btn');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        callbacks.onFinish();
      });
    }

    const restartBtn = document.getElementById('restart');
    if (restartBtn) {
      restartBtn.addEventListener('click', async () => {
        const confirmed = await Dialog.showConfirm(
          '<strong>Are you sure you want to restart?</strong><br><br>' +
          'All your current progress will be lost and you will start the assessment from the beginning.',
          'Restart Assessment',
          { confirmText: 'Restart', cancelText: 'Cancel' }
        );

        if (confirmed) {
          callbacks.onRestart();
        }
      });
    }
  },

  /**
   * Render report sections based on display type
   */
  renderReportSections(testData, sections) {
    let html = '';

    for (const [sectionId, section] of Object.entries(sections)) {
      html += `<div class="no-break">`;
      html += `<h3 style="margin-top:50px">${section.title}</h3>`;

      if (section.description) {
        // Parse description to add icons for "Why did we ask you this?"
        let description = section.description;

        // Check if description contains "Why did we ask you this?"
        if (description.includes('Why did we ask you this?')) {
          // Split on the "Why" question
          const parts = description.split('<strong>Why did we ask you this?</strong>');

          if (parts.length === 2) {
            // Further split the second part to separate the answer from the rest
            const afterWhy = parts[1];
            const answerMatch = afterWhy.match(/^(.*?)<br>/);

            if (answerMatch) {
              const answer = answerMatch[1].trim();
              const restOfDescription = afterWhy.substring(answerMatch[0].length);

              // Rebuild with icons
              description = `
                ${parts[0]}
                <div class="info-box" style="margin: 6px 0 12px 0; padding: 10px; background-color: #f8feff; border-radius: 8px;">
                  <p style="margin: 0 0 8px 0; display: flex; align-items: center; gap: 8px;">
                    <img src="assets/question.png" alt="?" style="width: 20px; height: 20px;" />
                    <strong>Why did we ask you this?</strong>
                  </p>
                  <p style="margin: 0; display: flex; align-items: flex-start; gap: 8px;">
                    <img src="assets/info.png" alt="!" style="width: 20px; height: 20px; flex-shrink: 0; margin-top: 2px;" />
                    <span>${answer}</span>
                  </p>
                </div>
                ${sectionId === 'section-a' && testData.testId === 'career-compass' ? `<div style="text-align: center; margin: 16px 0;">
                  <img src="assets/clusters.png" alt="Career Clusters Diagram" style="max-width: 100%; height: auto;" />
                </div>` : ''}
                ${restOfDescription}
              `;
            }
          }
        }

        html += `<div style="margin-bottom: 16px; line-height: 1.6;">${description}</div>`;
      }

      if (section.display === 'top3-bottom3') {
        html += `
          <div class="cluster-group" style="display:flex;gap:12px;flex-wrap:wrap">
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
      } else if (section.display === 'top3-bottom2') {
        html += `
          <div class="cluster-group" style="display:flex;gap:12px;flex-wrap:wrap">
            <div style="flex:1" class="top-clusters">
              <h4>Top 3</h4>
              <ol>
                ${section.top3.map(item => `<li>${item.title} (Total: ${item.total})</li>`).join('')}
              </ol>
            </div>
            <div style="flex:1" class="low-clusters">
              <h4>Bottom 2</h4>
              <ol>
                ${section.bottom2.map(item => `<li>${item.title} (Total: ${item.total})</li>`).join('')}
              </ol>
            </div>
          </div>
        `;
      } else if (section.display === 'all-ranked') {
        // Display all items ranked (for Section C and D)
        const allItems = section.allClusters || section.ranked || [];
        html += `
          <div style="margin-bottom:16px">
            <ol>
              ${allItems.map(item => {
          const displayText = item.name || item.title;
          const score = item.total !== undefined ? `(Total: ${item.total})` :
            item.avg !== undefined ? `(Avg: ${item.avg})` : '';
          return `<li>${displayText} ${score}</li>`;
        }).join('')}
            </ol>
          </div>
        `;
      } else if (section.display === 'clusters') {
        html += `
          <div class="cluster-group" style="display:flex;gap:12px;flex-wrap:wrap">
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
      } else if (section.display === 'grouped-thirds') {
        // Section C: Top 3 (green), Middle 3 (grey), Bottom 3 (brown)
        html += `
          <div class="cluster-group" style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">
            <div style="flex:1" class="top-clusters">
              <h4>Top 3 Strengths</h4>
              <ol>
                ${section.topThird.map(c => `<li>${c.name} <span style="font-size:0.9em;color:#6b6f76;">(Total: ${c.total})</span></li>`).join('')}
              </ol>
            </div>
            <div style="flex:1" class="neutral-clusters">
              <h4>Middle 3 Strengths</h4>
              <ol start="4">
                ${section.midThird.map(c => `<li>${c.name} <span style="font-size:0.9em;color:#6b6f76;">(Total: ${c.total})</span></li>`).join('')}
              </ol>
            </div>
            <div style="flex:1" class="low-clusters">
              <h4>Bottom 3 Strengths</h4>
              <ol start="7">
                ${section.bottomThird.map(c => `<li>${c.name} <span style="font-size:0.9em;color:#6b6f76;">(Total: ${c.total})</span></li>`).join('')}
              </ol>
            </div>
          </div>
        `;
      } else if (section.display === 'grouped-reverse') {
        // Section D: First 3 (brown - high growth need), Last 3 (grey - lower priority)
        html += `
          <div class="cluster-group" style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">
            <div style="flex:1" class="low-clusters">
              <h4>Highest Growth Areas (Priority 1-3)</h4>
              <ol>
                ${section.highGrowth.map(c => `<li>${c.name} <span style="font-size:0.9em;color:#6b6f76;">(Total: ${c.total})</span></li>`).join('')}
              </ol>
            </div>
            <div style="flex:1" class="neutral-clusters">
              <h4>Lower Growth Areas (Priority 4-6)</h4>
              <ol start="4">
                ${section.lowGrowth.map(c => `<li>${c.name} <span style="font-size:0.9em;color:#6b6f76;">(Total: ${c.total})</span></li>`).join('')}
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

      // Add guidance if available
      if (section.guidance) {
        html += `
          <div class="guidance-box" style="margin-top: 16px; display: flex; align-items: flex-start; gap: 12px; line-height: 1.6; padding: 10px; background-color: #f8feff; border-radius: 8px;">
            <img src="assets/star.png" alt="★" style="width: 35px; height: 35px; flex-shrink: 0; margin-top: 2px;" />
            <div>${section.guidance}</div>
          </div>
        `;
      }
      html += `</div>`;
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
    const sectionD = sections['section-d'];

    if (!sectionA || !sectionB) return '';

    const topCareerCluster = sectionA.top3 && sectionA.top3[0] ? sectionA.top3[0].title : 'N/A';
    const topDrivers = sectionB.top3 ? sectionB.top3.map(d => d.title).join(', ') : 'N/A';
    const topStrengths = sectionC && sectionC.topThird
      ? sectionC.topThird.map(c => c.name).join(', ')
      : 'See strength clusters above';
    const topGrowthAreas = sectionD && sectionD.highGrowth
      ? sectionD.highGrowth.map(c => c.name).join(', ')
      : 'See growth areas above';

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
          <td style="padding:8px;border-bottom:1px dashed #e9f6f6"><strong>Top 3 strengths</strong></td>
          <td style="padding:8px;border-bottom:1px dashed #e9f6f6">${this.escapeHtml(topStrengths)}</td>
        </tr>
        <tr>
          <td style="padding:8px"><strong>Top 3 growth areas</strong></td>
          <td style="padding:8px">${this.escapeHtml(topGrowthAreas)}</td>
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
