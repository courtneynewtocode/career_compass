/**
 * Client-side Configuration
 *
 * Note: This file contains the mailer API access key which is safe to expose client-side
 * as it's designed for form submissions from browsers.
 *
 * Email recipient is configured server-side on the mailer API (not here).
 */

const Config = {
  mailer: {
    apiUrl: 'https://mailer.prolificdev.co.za/api/form',
    accessKey: 'ae138a37c51dd863e0de53e8c15a0912b1025e9ae0e302aed233c4abfc289e64',
    fromName: 'CGA Global Reports'
  },

  storage: {
    apiUrl: 'api/storage.php',
    accessKey: 'ae138a37c51dd863e0de53e8c15a0912b1025e9ae0e302aed233c4abfc289e64'
  },

  /**
   * Show results to user after test completion
   * - true: Show results page with report before completion
   * - false: Skip results page, go directly to thank you message
   *
   * Note: Email is ALWAYS sent automatically when test is completed,
   * regardless of this setting.
   */
  showResultsToUser: true,

  /**
   * Attach PDF report to email
   * - true: Generate PDF client-side and attach to email
   * - false: Send simple email without PDF attachment
   *
   * Note: PDF is generated in the browser using html2pdf.js
   */
  attachPdfReport: true,

  /**
   * Show back button during assessment
   * - true: Allow students to go back to previous questions
   * - false: Hide back button (students can only move forward)
   *
   * Note: Hiding the back button prevents students from changing answers
   * after viewing later questions.
   */
  showBackButton: false,

  /**
   * Store assessment results to file-based storage
   * - true: Save results to storage API for dashboard viewing
   * - false: Don't store results (only send email)
   */
  storeResults: true,

  /**
   * Dashboard Configuration
   */
  dashboard: {
    /**
     * Dashboard password
     * Change this to a secure password for production!
     */
    password: 'admin123',

    /**
     * Enable authentication
     * Set to false to disable password protection (not recommended)
     */
    requireAuth: true
  }
};
