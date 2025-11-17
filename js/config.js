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
   * Generate PDF attachment for email
   * - true: Mailer API will generate PDF from HTML and attach to email
   * - false: Email will only contain HTML (no PDF attachment)
   *
   * Note: PDF generation is handled by the mailer API server.
   */
  generatePdf: true
};
