/**
 * PDF Loader Module
 * Lazy-loads html2pdf.js only when needed (saves ~200KB on initial page load)
 */

const PdfLoader = {
  loaded: false,
  loading: false,
  loadPromise: null,

  /**
   * Load html2pdf.js library dynamically
   * @returns {Promise<void>}
   */
  async load() {
    // If already loaded, return immediately
    if (this.loaded) {
      return Promise.resolve();
    }

    // If currently loading, return the existing promise
    if (this.loading) {
      return this.loadPromise;
    }

    // Start loading
    this.loading = true;
    this.loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        this.loaded = true;
        this.loading = false;
        console.log('✅ html2pdf.js loaded successfully');
        resolve();
      };
      script.onerror = () => {
        this.loading = false;
        console.error('❌ Failed to load html2pdf.js');
        reject(new Error('Failed to load PDF library'));
      };
      document.head.appendChild(script);
    });

    return this.loadPromise;
  },

  /**
   * Generate PDF from HTML element
   * @param {HTMLElement} element - Element to convert to PDF
   * @param {Object} options - html2pdf options
   * @returns {Promise<Blob>}
   */
  async generatePdf(element, options = {}) {
    try {
      // Ensure library is loaded
      await this.load();

      // Check if html2pdf is available
      if (typeof html2pdf === 'undefined') {
        throw new Error('html2pdf library not loaded');
      }

      // Generate PDF
      const pdfBlob = await html2pdf()
        .set(options)
        .from(element)
        .outputPdf('blob');

      return pdfBlob;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  }
};
