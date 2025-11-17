/**
 * Validator Module - Validates test schema and user input
 */

const Validator = {
  /**
   * Validate test schema structure
   */
  validateTestSchema(testData) {
    const errors = [];

    // Required fields
    if (!testData.testId) errors.push('testId is required');
    if (!testData.testName) errors.push('testName is required');
    if (!testData.sections || !Array.isArray(testData.sections)) {
      errors.push('sections array is required');
    }

    // Validate sections
    testData.sections?.forEach((section, idx) => {
      if (!section.sectionId) {
        errors.push(`Section ${idx}: sectionId is required`);
      }
      if (!section.categories || !Array.isArray(section.categories)) {
        errors.push(`Section ${idx}: categories array is required`);
      }

      // Validate categories
      section.categories?.forEach((cat, catIdx) => {
        if (!cat.key) {
          errors.push(`Section ${idx}, Category ${catIdx}: key is required`);
        }
        if (!cat.questions || !Array.isArray(cat.questions)) {
          errors.push(`Section ${idx}, Category ${catIdx}: questions array is required`);
        }

        // Validate scoring
        if (cat.scoring) {
          const method = cat.scoring.method;
          const validMethods = ['sum', 'average', 'weighted', 'cluster', 'reverse'];

          if (method && !validMethods.includes(method)) {
            errors.push(`Invalid scoring method: ${method}`);
          }

          if (method === 'weighted' && !cat.scoring.weights) {
            errors.push(`Weighted scoring requires weights array`);
          }

          if (method === 'weighted' && cat.scoring.weights.length !== cat.questions.length) {
            errors.push(`Weights array must match questions length`);
          }

          if (method === 'cluster' && !cat.scoring.clusterIndices) {
            errors.push(`Cluster scoring requires clusterIndices`);
          }
        }
      });
    });

    // Validate reporting
    if (!testData.reporting) {
      errors.push('reporting configuration is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate email format
   */
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  /**
   * Validate phone number (South African format)
   */
  validatePhone(phone) {
    // Accepts digits, optional +27 or 0 prefix, length 10-12
    const re = /^(\+?\d{1,3})?0?\d{9,11}$/;
    return re.test(phone.replace(/\s/g, ''));
  },

  /**
   * Validate demographics data
   */
  validateDemographics(demographics, fields) {
    const errors = [];

    fields.forEach(field => {
      const value = demographics[field.key];

      if (field.required && (!value || value.trim() === '')) {
        errors.push(`${field.label} is required`);
      }

      if (value && field.validation === 'email' && !this.validateEmail(value)) {
        errors.push(`Please enter a valid email address`);
      }

      if (value && field.validation === 'phone' && !this.validatePhone(value)) {
        errors.push(`Please enter a valid contact number`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
};
