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
    // More comprehensive email validation
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email.trim());
  },

  /**
   * Validate phone number (South African format)
   */
  validatePhone(phone) {
    // Remove spaces and other non-digit characters except +
    const cleaned = phone.replace(/[\s\-()]/g, '');

    // Accepts:
    // - +27 followed by 9 digits (e.g., +27812345678)
    // - 0 followed by 9 digits (e.g., 0812345678)
    // - 10 digits starting with 0 (e.g., 0123456789)
    const re = /^(\+27|0)[0-9]{9}$/;
    return re.test(cleaned);
  },

  /**
   * Validate student name
   */
  validateName(name) {
    const trimmed = name.trim();

    // Must be at least 2 characters
    if (trimmed.length < 2) {
      return { valid: false, error: 'Name must be at least 2 characters long' };
    }

    // Should contain only letters, spaces, hyphens, and apostrophes
    const re = /^[a-zA-Z\s'-]+$/;
    if (!re.test(trimmed)) {
      return { valid: false, error: 'Name should contain only letters, spaces, hyphens, and apostrophes' };
    }

    // Should have at least one letter
    if (!/[a-zA-Z]/.test(trimmed)) {
      return { valid: false, error: 'Name must contain at least one letter' };
    }

    return { valid: true };
  },

  /**
   * Validate age
   */
  validateAge(age) {
    const numAge = parseInt(age, 10);

    // Must be a valid number
    if (isNaN(numAge)) {
      return { valid: false, error: 'Age must be a valid number' };
    }

    // Reasonable age range for students (typically 10-25 for school/college)
    if (numAge < 10 || numAge > 100) {
      return { valid: false, error: 'Please enter a valid age (10-100)' };
    }

    return { valid: true };
  },

  /**
   * Validate grade/year
   */
  validateGrade(grade) {
    const trimmed = grade.trim().toUpperCase();

    if (trimmed.length === 0) {
      return { valid: false, error: 'Grade/Year is required' };
    }

    // Accept school grades: K, R, Pre-K, 1-12, Grade 10, 10th, etc.
    const schoolGrades = /^(K|R|PRE-?K|[1-9]|1[0-2])(TH|ST|ND|RD)?$|^GRADE\s*[1-9]|GRADE\s*1[0-2]$/i;

    // Accept university years: 1st Year, 2nd Year, 3rd Year, 4th Year, Final Year, First Year, etc.
    const universityYears = /^([1-4](ST|ND|RD|TH)?\s*YEAR|FINAL\s*YEAR|FIRST\s*YEAR|SECOND\s*YEAR|THIRD\s*YEAR|FOURTH\s*YEAR|YEAR\s*[1-4])$/i;

    if (!schoolGrades.test(trimmed) && !universityYears.test(trimmed)) {
      return { valid: false, error: 'Please enter a valid grade (e.g., K, R, 1-12) or year of study (e.g., 1st Year, Final Year)' };
    }

    return { valid: true };
  },

  /**
   * Validate demographics data
   */
  validateDemographics(demographics, fields) {
    const errors = [];

    fields.forEach(field => {
      const value = demographics[field.key];

      // Check required fields
      if (field.required && (!value || value.trim() === '')) {
        errors.push(`${field.label} is required`);
        return; // Skip further validation for empty required fields
      }

      // Skip validation for empty optional fields
      if (!value || value.trim() === '') {
        return;
      }

      // Field-specific validation
      if (field.key === 'studentName') {
        const nameValidation = this.validateName(value);
        if (!nameValidation.valid) {
          errors.push(nameValidation.error);
        }
      }

      if (field.key === 'age') {
        const ageValidation = this.validateAge(value);
        if (!ageValidation.valid) {
          errors.push(ageValidation.error);
        }
      }

      if (field.key === 'grade') {
        const gradeValidation = this.validateGrade(value);
        if (!gradeValidation.valid) {
          errors.push(gradeValidation.error);
        }
      }

      // Validation type-based checks
      if (field.validation === 'email' && !this.validateEmail(value)) {
        errors.push(`Please enter a valid email address (e.g., name@example.com)`);
      }

      if (field.validation === 'phone' && !this.validatePhone(value)) {
        errors.push(`Please enter a valid contact number (e.g., 0812345678 or +27812345678)`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
};
