/**
 * PDF Loader Module
 * Lazy-loads html2canvas and jsPDF for smart canvas-sliced PDF generation
 */

const PdfLoader = {
  loaded: false,
  loading: false,
  loadPromise: null,

  /**
   * Load html2canvas + jsPDF libraries dynamically
   * @returns {Promise<void>}
   */
  async load() {
    if (this.loaded) {
      return Promise.resolve();
    }

    if (this.loading) {
      return this.loadPromise;
    }

    this.loading = true;
    this.loadPromise = Promise.all([
      this._loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
      this._loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
    ]).then(() => {
      this.loaded = true;
      this.loading = false;
      console.log('✅ html2canvas + jsPDF loaded successfully');
    }).catch((err) => {
      this.loading = false;
      console.error('❌ Failed to load PDF libraries');
      throw err;
    });

    return this.loadPromise;
  },

  /**
   * Load a single script by URL
   * @param {string} src
   * @returns {Promise<void>}
   */
  _loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  },

  /**
   * Generate PDF blob using smart canvas slicing
   * @param {HTMLElement} element - Element to convert to PDF
   * @param {Object} options - { h2cOptions, filename }
   * @returns {Promise<Blob>}
   */
  async generatePdf(element, options = {}) {
    await this.load();

    if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
      throw new Error('PDF libraries not loaded');
    }

    const h2cOptions = options.h2cOptions || {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
      windowHeight: 4000,
      width: 800
    };

    // Render full content as one canvas
    const canvas = await html2canvas(element, h2cOptions);
    const canvasW = canvas.width;
    const canvasH = canvas.height;

    // A4 content area: 200mm x 287mm (5mm margins)
    const contentWidthMM = 200;
    const contentHeightMM = 287;
    const pxPerMM = canvasW / contentWidthMM;
    const pageHeightPx = contentHeightMM * pxPerMM;

    // Collect protected element boundaries in canvas pixel space
    const wrapperRect = element.parentElement
      ? element.parentElement.getBoundingClientRect()
      : element.getBoundingClientRect();
    const domScale = canvasH / element.getBoundingClientRect().height;
    const elRect = element.getBoundingClientRect();
    const PADDING = 8;
    const H3_KEEP_WITH_NEXT = 120;
    const protectedRanges = [];

    element.querySelectorAll('.guidance-box, .info-box, .cluster-group, .two-col, h3, table').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.height === 0) return;
      const top = (rect.top - elRect.top) * domScale - PADDING;
      const extraBottom = el.tagName === 'H3' ? H3_KEEP_WITH_NEXT : PADDING;
      const bottom = (rect.top - elRect.top + rect.height) * domScale + extraBottom;
      protectedRanges.push({ top: Math.max(0, top), bottom: Math.min(canvasH, bottom) });
    });

    // Find safe cut positions
    const cuts = [0];
    let nextBoundary = pageHeightPx;

    while (nextBoundary < canvasH - 50) {
      const straddling = protectedRanges.filter(r => r.top < nextBoundary && r.bottom > nextBoundary);

      let cutAt;
      if (straddling.length === 0) {
        cutAt = nextBoundary;
      } else {
        cutAt = Math.min(...straddling.map(r => r.top));
        const minCut = cuts[cuts.length - 1] + pageHeightPx * 0.33;
        if (cutAt < minCut) {
          cutAt = nextBoundary;
        }
      }

      cuts.push(cutAt);
      nextBoundary = cutAt + pageHeightPx;
    }
    cuts.push(canvasH);

    // Create PDF with jsPDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });

    for (let i = 0; i < cuts.length - 1; i++) {
      const y0 = cuts[i];
      const y1 = cuts[i + 1];
      const sliceH = y1 - y0;
      if (sliceH <= 0) continue;

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvasW;
      sliceCanvas.height = Math.ceil(sliceH);
      sliceCanvas.getContext('2d').drawImage(
        canvas, 0, y0, canvasW, sliceH, 0, 0, canvasW, Math.ceil(sliceH)
      );

      if (i > 0) pdf.addPage();

      const imgData = sliceCanvas.toDataURL('image/jpeg', 0.95);
      const imgHeightMM = sliceH / pxPerMM;
      pdf.addImage(imgData, 'JPEG', 5, 5, contentWidthMM, imgHeightMM);
    }

    // Return as blob
    return pdf.output('blob');
  }
};
