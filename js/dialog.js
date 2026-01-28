/**
 * Modern Dialog System - Replaces browser alerts and confirms
 */

const Dialog = {
  /**
   * Show an alert dialog
   */
  showAlert(message, title = 'Notice') {
    return new Promise((resolve) => {
      this.createDialog({
        title,
        message,
        buttons: [
          {
            text: 'OK',
            primary: true,
            onClick: () => {
              this.closeDialog();
              resolve(true);
            }
          }
        ]
      });
    });
  },

  /**
   * Show a confirm dialog
   */
  showConfirm(message, title = 'Confirm', options = {}) {
    return new Promise((resolve) => {
      this.createDialog({
        title,
        message,
        buttons: [
          {
            text: options.cancelText || 'Cancel',
            primary: false,
            onClick: () => {
              this.closeDialog();
              resolve(false);
            }
          },
          {
            text: options.confirmText || 'Confirm',
            primary: true,
            onClick: () => {
              this.closeDialog();
              resolve(true);
            }
          }
        ]
      });
    });
  },

  /**
   * Create and display dialog
   */
  createDialog({ title, message, buttons }) {
    // Remove any existing dialog
    this.closeDialog();

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'dialog-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 32, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease;
    `;

    // Create dialog
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 440px;
      width: 90%;
      padding: 28px;
      animation: slideUp 0.3s ease;
    `;

    // Title
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    titleEl.style.cssText = `
      margin: 0 0 12px 0;
      font-size: 20px;
      font-weight: 600;
      color: #0f1720;
    `;

    // Message
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
      margin: 0 0 24px 0;
      font-size: 15px;
      line-height: 1.6;
      color: #374151;
      white-space: pre-wrap;
    `;

    // Handle both plain text and HTML (sanitized to safe tags only)
    if (message.includes('<')) {
      // Strip everything except safe formatting tags
      const sanitized = message.replace(/<(?!\/?(?:strong|em|br|b|i)\b)[^>]*>/gi, '');
      messageEl.innerHTML = sanitized;
    } else {
      messageEl.textContent = message;
    }

    // Buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    `;

    // Create buttons
    buttons.forEach(btnConfig => {
      const btn = document.createElement('button');
      btn.textContent = btnConfig.text;
      btn.onclick = btnConfig.onClick;

      if (btnConfig.primary) {
        btn.style.cssText = `
          background: #0b8f8f;
          color: white;
          padding: 10px 20px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(11, 143, 143, 0.15);
        `;
        btn.onmouseover = () => {
          btn.style.background = '#0a7d7d';
          btn.style.transform = 'translateY(-1px)';
        };
        btn.onmouseout = () => {
          btn.style.background = '#0b8f8f';
          btn.style.transform = 'translateY(0)';
        };
      } else {
        btn.style.cssText = `
          background: transparent;
          color: #0b8f8f;
          padding: 10px 20px;
          border-radius: 10px;
          border: 2px solid rgba(11, 143, 143, 0.2);
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
        `;
        btn.onmouseover = () => {
          btn.style.background = 'rgba(11, 143, 143, 0.05)';
          btn.style.borderColor = '#0b8f8f';
        };
        btn.onmouseout = () => {
          btn.style.background = 'transparent';
          btn.style.borderColor = 'rgba(11, 143, 143, 0.2)';
        };
      }

      buttonsContainer.appendChild(btn);
    });

    // Assemble dialog
    dialog.appendChild(titleEl);
    dialog.appendChild(messageEl);
    dialog.appendChild(buttonsContainer);
    overlay.appendChild(dialog);

    // Add animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `;
    document.head.appendChild(style);

    // Add to DOM
    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        buttons[0].onClick(); // Trigger first button (usually cancel)
      }
    });

    // Close on Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        buttons[0].onClick();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  },

  /**
   * Close the dialog
   */
  closeDialog() {
    const overlay = document.getElementById('dialog-overlay');
    if (overlay) {
      overlay.style.animation = 'fadeOut 0.2s ease';
      setTimeout(() => overlay.remove(), 200);
    }
  }
};
