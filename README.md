# Career Compass Assessment System

A **100% static** multi-test career assessment platform that helps students discover their interests, strengths, and potential career paths.

## Features

- **🌐 Pure Static Site**: No server-side code - just HTML, CSS, and JavaScript
- **📧 Direct Email**: Results sent from browser to mailer API with PDF attachments
- **💾 Progress Saving**: Automatic progress saving with localStorage (7-day TTL)
- **📱 Responsive Design**: Mobile-friendly interface with WCAG 2.1 Level AA compliance
- **🎯 Multi-Test Support**: Easily add new assessments via JSON configuration files
- **🔧 Debug Mode**: Built-in testing tools (Ctrl+Shift+Z)
- **🚀 Deploy Anywhere**: GitHub Pages, Netlify, Vercel, S3, any CDN, or shared hosting (PHP support)
- **⚡ Performance Optimized**: Lazy-loading, retry mechanisms, error boundaries
- **🛡️ Fraud Detection**: Automatic detection of invalid response patterns
- **📊 Analytics Dashboard**: View all results with password protection
- **🔒 Secure**: Session-based authentication, input validation, XSS protection
- **♿ Accessible**: Skip links, ARIA labels, keyboard navigation, screen reader support

## Quick Start (30 seconds)

1. **Open `test.html` in your browser** (even locally!)
2. **Press Ctrl+Shift+Z** to enable debug mode
3. **Click "Skip to Results"**
4. **Click "Submit Results"**
5. **Check email** at info@prolificdev.com

**That's it!** No installation, no configuration, no dependencies.

## Project Structure

```
career_compass/
├── index.html                  # Landing page (CGA Global branding)
├── test.html                   # Test interface
├── dashboard.html              # Admin results dashboard
├── css/                        # Stylesheets
│   ├── theme.css              # CSS custom properties & theme
│   ├── layout.css             # Layout & grid
│   ├── components.css         # Buttons, forms, cards (WCAG compliant)
│   ├── report.css             # Report styling
│   └── dashboard-modern.css   # Dashboard sidebar layout
├── js/                         # JavaScript modules
│   ├── config.js              # Configuration (mailer, storage, dashboard)
│   ├── app.js                 # Main application controller
│   ├── renderer.js            # Page rendering with accessibility
│   ├── scoring.js             # Score calculations & ranking
│   ├── validator.js           # Input validation + fraud detection
│   ├── storage.js             # localStorage & session management
│   ├── dialog.js              # Modal dialogs
│   ├── error-handler.js       # Global error handling + retry logic
│   ├── analytics.js           # Analytics tracking (file-based)
│   ├── loading.js             # Loading overlays & transitions
│   ├── pdf-loader.js          # Lazy-load html2pdf.js
│   ├── dashboard.js           # Results dashboard logic
│   └── dashboard-auth.js      # Dashboard authentication
├── api/                        # PHP API endpoints (optional)
│   └── storage.php            # Storage API for results & analytics
├── data/                       # Data directory (PHP hosting)
│   ├── results/               # Stored assessment results (JSON)
│   └── analytics/             # Analytics event logs (JSON)
├── tests/                      # Test definitions (JSON)
│   ├── index.json             # Test manifest
│   ├── career-compass.json    # Career Compass test
│   └── career-readiness.json  # Career Readiness test
├── assets/                     # Images & icons
│   ├── cga-logo.jpg
│   ├── question.png
│   ├── info.png
│   └── star.png
├── Dockerfile                  # Docker container config
├── docker-compose.yaml         # Docker compose setup
└── .env.example                # Environment variables template
```

## Deployment Options

### Option 1: Static Hosting (No Dashboard)

Deploy to any static hosting platform - results sent via email only:

**GitHub Pages / Netlify / Vercel (Free)**
```bash
# Just push your files - no configuration needed
git push origin main
```

**Configuration:**
```javascript
// js/config.js
storeResults: false  // Email only, no dashboard
```

### Option 2: PHP Hosting (With Dashboard)

Deploy to shared hosting or VPS with PHP support for full dashboard functionality:

**Requirements:**
- PHP 7.4+ with JSON extension
- Write permissions on `data/` directory

**Quick Setup:**
```bash
# Upload all files via FTP/SFTP
# Set permissions: chmod 755 data/
# Visit dashboard.html (default password: admin123)
```

**Configuration:**
```javascript
// js/config.js
storeResults: true  // Enable dashboard
dashboard: {
  password: 'your-strong-password',
  requireAuth: true
}
```

See **[SHARED_HOSTING_DEPLOYMENT.md](SHARED_HOSTING_DEPLOYMENT.md)** for detailed instructions.

### Option 3: Docker (Production)

Deploy using Docker for VPS/cloud hosting:

```bash
# Build and run
docker-compose up -d

# Access at http://your-domain.com
```

See **[DOCKER_DEPLOY.md](DOCKER_DEPLOY.md)** for detailed instructions (if available).

## Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 30 seconds
- **[USER_GUIDE.md](USER_GUIDE.md)** - Simple guide for adding/editing tests (non-technical)
- **[CONFIGURATION.md](CONFIGURATION.md)** - Configuration reference
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical implementation details
- **[CLAUDE.md](CLAUDE.md)** - Codebase overview for AI assistants

## Testing & Debugging

### Debug Mode

Press **Ctrl+Shift+Z** on the test page to access:
- Fill all answers with 3s (for quick testing)
- Skip directly to results
- Clear session
- Export test data as JSON

### Test Complete Flow

1. Visit `index.html`
2. Click "Start Assessment"
3. Fill in student details
4. Use debug mode to skip questions (Ctrl+Shift+Z → Skip to Results)
5. Verify email is received at admin address

## Adding New Tests

1. Create a new JSON file in `tests/` (e.g., `tests/leadership.json`)
2. Follow the schema documented in the existing `career-compass.json`
3. Add a card to `index.html` linking to `test.html?test=leadership`
4. Test thoroughly before production use

Example:
```html
<a href="test.html?test=leadership" class="btn">
  Start Leadership Assessment
</a>
```

## Configuration

Edit `js/config.js` to customize behavior:

```javascript
const Config = {
  // Show results to user after completion
  showResultsToUser: true,

  // Attach PDF to email (generated client-side)
  attachPdfReport: true,

  // Enable back button during assessment
  showBackButton: false,

  // Store results for dashboard viewing
  storeResults: true,

  // Dashboard password protection
  dashboard: {
    password: 'admin123',  // CHANGE THIS!
    requireAuth: true
  }
};
```

**See [CONFIGURATION.md](CONFIGURATION.md) for detailed documentation and examples.**

## Security Features

- **Fraud Detection**: Automatic detection of invalid response patterns (all 3's, straight-lining, repeating patterns)
- **Dashboard Authentication**: Password-protected results dashboard with session management
- **Input Validation**: Comprehensive validation with XSS protection and HTML escaping
- **Error Handling**: Global error boundary with retry mechanisms and graceful degradation
- **WCAG Compliance**: Level AA accessibility with ARIA labels and keyboard navigation
- **Secure API**: Mailer API handles authentication server-side
- **localStorage TTL**: Automatic cleanup of expired progress data (7 days)
- **No PII Exposure**: Sensitive data never logged or exposed in client code

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions (requires web server for fetch API)
- Mobile browsers: iOS Safari, Chrome Mobile

## Requirements

**Zero requirements!** Just a web browser.

- No server-side code needed
- No database required
- No dependencies to install
- Works offline (can complete test offline, submits when online)

## Troubleshooting

### Email Not Received
- Check spam folder
- Verify internet connection
- Check browser console for errors
- Try submitting again

### Test Won't Load
- Ensure `tests/career-compass.json` exists
- Check browser console for errors
- Try clearing browser cache
- For local file:// access, use a local web server

### Session Not Resuming
- Ensure localStorage is not blocked
- Check browser console for errors
- Clear browser cache if needed

See [QUICKSTART.md](QUICKSTART.md) for more tips.

## License

Proprietary - Client Project

## Support

For technical support, refer to the documentation:
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Technical details

---

**Version**: 3.0 (Pure Static)
**Last Updated**: November 2025
**Architecture**: 100% Static - Zero Server Configuration Required
