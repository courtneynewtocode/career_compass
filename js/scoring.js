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
        result.avg = answers.length > 0 ? Math.round((result.total / answers.length) * 100) / 100 : 0;
        break;

      case 'average':
        result.total = this.calculateSum(answers);
        result.count = answers.length;
        result.avg = answers.length > 0 ? Math.round((result.total / answers.length) * 100) / 100 : 0;
        break;

      case 'weighted':
        result.total = this.calculateWeightedSum(answers, scoring.weights);
        result.count = answers.length;
        result.avg = answers.length > 0 ? Math.round((result.total / answers.length) * 100) / 100 : 0;
        break;

      case 'cluster':
        result.clusters = this.calculateClusters(answers, scoring.clusterIndices);
        result.total = this.calculateSum(answers);
        result.count = answers.length;
        result.avg = answers.length > 0 ? Math.round((result.total / answers.length) * 100) / 100 : 0;
        break;

      case 'reverse':
        const reversed = answers.map(a => a ? (6 - a) : 0);
        result.total = this.calculateSum(reversed);
        result.count = reversed.length;
        result.avg = reversed.length > 0 ? Math.round((result.total / reversed.length) * 100) / 100 : 0;
        break;

      default:
        result.total = this.calculateSum(answers);
        result.count = answers.length;
        result.avg = answers.length > 0 ? Math.round((result.total / answers.length) * 100) / 100 : 0;
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
      const avg = Math.round((total / clusterAnswers.length) * 100) / 100;

      return {
        name: cluster.name,
        indices: cluster.indices,
        total: total,
        avg: avg,
        count: clusterAnswers.length
      };
    });
  },

  /**
   * Get top N items from a list of scored items
   */
  getTopN(items, n = 3) {
    return [...items].sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      const aLabel = a.name || a.title || '';
      const bLabel = b.name || b.title || '';
      return aLabel.localeCompare(bLabel);
    }).slice(0, n);
  },

  /**
   * Get bottom N items from a list of scored items
   */
  getBottomN(items, n = 3) {
    return [...items].sort((a, b) => {
      if (a.total !== b.total) return a.total - b.total;
      const aLabel = a.name || a.title || '';
      const bLabel = b.name || b.title || '';
      return aLabel.localeCompare(bLabel);
    }).slice(0, n);
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
        guidance: reportSection.guidance,
        display: reportSection.display,
        categories: categories
      };

      // Add display-specific data
      if (reportSection.display === 'top3-bottom3') {
        report.sections[reportSection.sectionId].top3 = this.getTopN(categories, 3);
        report.sections[reportSection.sectionId].bottom3 = this.getBottomN(categories, 3);
      } else if (reportSection.display === 'top3-bottom2') {
        report.sections[reportSection.sectionId].top3 = this.getTopN(categories, 3);
        report.sections[reportSection.sectionId].bottom2 = this.getBottomN(categories, 2);
      } else if (reportSection.display === 'all-ranked') {
        // For all-ranked display, show all clusters ranked from highest to lowest
        const firstCategory = categories[0];
        if (firstCategory && firstCategory.clusters) {
          // Sort clusters by total score (highest to lowest)
          const allClusters = [...firstCategory.clusters].sort((a, b) => b.total - a.total);
          report.sections[reportSection.sectionId].allClusters = allClusters;

          // Also track individual top strengths for summary
          const strengthAnswers = firstCategory.answers || [];
          const strengthQuestions = testData.sections.find(s => s.sectionId === reportSection.sectionId)?.categories[0]?.questions || [];
          const individualStrengths = strengthAnswers.map((score, idx) => ({
            text: strengthQuestions[idx] || `Strength ${idx + 1}`,
            score: score || 0,
            index: idx
          })).sort((a, b) => b.score - a.score);

          report.sections[reportSection.sectionId].topStrengths = individualStrengths.slice(0, 3);
        } else {
          // If no clusters, just rank categories
          const ranked = [...categories].sort((a, b) => b.total - a.total);
          report.sections[reportSection.sectionId].ranked = ranked;
        }
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
      } else if (reportSection.display === 'grouped-thirds') {
        // For grouped-thirds display (Section C): divide 9 items into top 3, mid 3, bottom 3
        const firstCategory = categories[0];
        if (firstCategory && firstCategory.clusters) {
          const allClusters = [...firstCategory.clusters].sort((a, b) => b.total - a.total);
          report.sections[reportSection.sectionId].topThird = allClusters.slice(0, 3);
          report.sections[reportSection.sectionId].midThird = allClusters.slice(3, 6);
          report.sections[reportSection.sectionId].bottomThird = allClusters.slice(6, 9);
        }
      } else if (reportSection.display === 'grouped-reverse') {
        // For grouped-reverse display (Section D): first 3 = high growth need (low-clusters), last 3 = neutral
        const firstCategory = categories[0];
        if (firstCategory && firstCategory.clusters) {
          const allClusters = [...firstCategory.clusters].sort((a, b) => b.total - a.total);
          report.sections[reportSection.sectionId].highGrowth = allClusters.slice(0, 3);
          report.sections[reportSection.sectionId].lowGrowth = allClusters.slice(3, 6);
        }
      } else if (reportSection.display === 'total-only') {
        const total = categories.reduce((sum, cat) => sum + cat.total, 0);
        report.sections[reportSection.sectionId].total = total;
      }
    });

    return report;
  }
};
