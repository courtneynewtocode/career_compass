/**
 * Scoring Module - Handles test scoring calculations
 */

const Scoring = {
  /**
   * Calculate scores for all sections
   */
  calculateScores(testData, answers) {
    const scores = {};

    testData.sections.forEach(section => {
      scores[section.sectionId] = this.calculateSectionScores(section, answers);
    });

    return scores;
  },

  /**
   * Calculate scores for a specific section
   */
  calculateSectionScores(section, answers) {
    const sectionScores = {
      categories: {}
    };

    section.categories.forEach(category => {
      const categoryAnswers = answers[category.key] || [];
      const scoring = category.scoring || { method: 'sum' };

      sectionScores.categories[category.key] = this.scoreCategory(
        category,
        categoryAnswers,
        scoring
      );
    });

    return sectionScores;
  },

  /**
   * Score a single category based on its scoring method
   */
  scoreCategory(category, answers, scoring) {
    const method = scoring.method || 'sum';
    const result = {
      title: category.title,
      key: category.key,
      method: method,
      answers: answers
    };

    switch (method) {
      case 'sum':
        result.total = this.calculateSum(answers);
        result.count = answers.length;
        result.avg = answers.length > 0 ? (result.total / answers.length).toFixed(2) : 0;
        break;

      case 'average':
        result.total = this.calculateSum(answers);
        result.count = answers.length;
        result.avg = answers.length > 0 ? (result.total / answers.length).toFixed(2) : 0;
        break;

      case 'weighted':
        result.total = this.calculateWeightedSum(answers, scoring.weights);
        result.count = answers.length;
        result.avg = answers.length > 0 ? (result.total / answers.length).toFixed(2) : 0;
        break;

      case 'cluster':
        result.clusters = this.calculateClusters(answers, scoring.clusterIndices);
        result.total = this.calculateSum(answers);
        result.count = answers.length;
        result.avg = answers.length > 0 ? (result.total / answers.length).toFixed(2) : 0;
        break;

      case 'reverse':
        const reversed = answers.map(a => a ? (6 - a) : 0);
        result.total = this.calculateSum(reversed);
        result.count = reversed.length;
        result.avg = reversed.length > 0 ? (result.total / reversed.length).toFixed(2) : 0;
        break;

      default:
        result.total = this.calculateSum(answers);
        result.count = answers.length;
        result.avg = answers.length > 0 ? (result.total / answers.length).toFixed(2) : 0;
    }

    return result;
  },

  /**
   * Calculate simple sum
   */
  calculateSum(answers) {
    return answers.reduce((sum, val) => sum + (val || 0), 0);
  },

  /**
   * Calculate weighted sum
   */
  calculateWeightedSum(answers, weights) {
    return answers.reduce((sum, val, idx) => {
      const weight = weights[idx] || 1;
      return sum + ((val || 0) * weight);
    }, 0);
  },

  /**
   * Calculate cluster scores
   */
  calculateClusters(answers, clusterIndices) {
    return clusterIndices.map(cluster => {
      const clusterAnswers = cluster.indices.map(idx => answers[idx] || 0);
      const total = this.calculateSum(clusterAnswers);
      const avg = (total / clusterAnswers.length).toFixed(2);

      return {
        name: cluster.name,
        indices: cluster.indices,
        total: total,
        avg: parseFloat(avg),
        count: clusterAnswers.length
      };
    });
  },

  /**
   * Get top N items from a list of scored items
   */
  getTopN(items, n = 3) {
    return [...items].sort((a, b) => b.total - a.total).slice(0, n);
  },

  /**
   * Get bottom N items from a list of scored items
   */
  getBottomN(items, n = 3) {
    return [...items].sort((a, b) => a.total - b.total).slice(0, n);
  },

  /**
   * Prepare report data from scores
   */
  prepareReportData(testData, scores, demographics) {
    const report = {
      demographics: demographics,
      sections: {}
    };

    testData.reporting.sections.forEach(reportSection => {
      const sectionScores = scores[reportSection.sectionId];
      if (!sectionScores) return;

      const categories = Object.values(sectionScores.categories);

      report.sections[reportSection.sectionId] = {
        title: reportSection.title,
        description: reportSection.description,
        display: reportSection.display,
        categories: categories
      };

      // Add display-specific data
      if (reportSection.display === 'top3-bottom3') {
        report.sections[reportSection.sectionId].top3 = this.getTopN(categories, 3);
        report.sections[reportSection.sectionId].bottom3 = this.getBottomN(categories, 3);
      } else if (reportSection.display === 'clusters') {
        // For cluster display, get clusters from first category
        const firstCategory = categories[0];
        if (firstCategory && firstCategory.clusters) {
          const clusters = firstCategory.clusters;
          report.sections[reportSection.sectionId].topClusters = this.getTopN(clusters, 3);
          report.sections[reportSection.sectionId].bottomClusters = this.getBottomN(clusters, 3);

          // Also rank individual strength items
          const strengthAnswers = firstCategory.answers || [];
          const strengthQuestions = testData.sections.find(s => s.sectionId === reportSection.sectionId)?.categories[0]?.questions || [];
          const individualStrengths = strengthAnswers.map((score, idx) => ({
            text: strengthQuestions[idx] || `Strength ${idx + 1}`,
            score: score || 0,
            index: idx
          })).sort((a, b) => b.score - a.score);

          report.sections[reportSection.sectionId].topStrengths = individualStrengths.slice(0, 3);
        }
      } else if (reportSection.display === 'total-only') {
        const total = categories.reduce((sum, cat) => sum + cat.total, 0);
        report.sections[reportSection.sectionId].total = total;
      }
    });

    return report;
  }
};
