# Career Compass Assessment System

A **100% static** multi-test career assessment platform that helps students discover their interests, strengths, and potential career paths.

## Features

- **🌐 Pure Static Site**: No server-side code - just HTML, CSS, and JavaScript
- **📧 Direct Email**: Results sent from browser to mailer API
- **💾 Progress Saving**: Automatic progress saving with localStorage (7-day TTL)
- **📱 Responsive Design**: Mobile-friendly interface
- **🎯 Multi-Test Support**: Easily add new assessments via JSON configuration files
- **🔧 Debug Mode**: Built-in testing tools (Ctrl+Shift+Z)
- **🚀 Deploy Anywhere**: GitHub Pages, Netlify, Vercel, S3, any CDN
- **⚡ Zero Configuration**: Works out of the box - no setup required

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
├── index.html                  # Landing page
├── test.html                   # Test interface
├── css/                        # Stylesheets
│   ├── variables.css          # CSS custom properties
│   ├── layout.css             # Layout & grid
│   ├── components.css         # Buttons, forms, etc.
│   └── report.css             # Report styling
├── js/                         # JavaScript modules
│   ├── config.js              # Client-side config (mailer API)
│   ├── app.js                 # Main application controller
│   ├── renderer.js            # Page rendering
│   ├── scoring.js             # Score calculations
│   ├── validator.js           # Input validation
│   ├── storage.js             # localStorage & session management
│   ├── dialog.js              # Modal dialogs
│   └── dashboard.js           # Results dashboard
└── tests/                      # Test definitions (JSON)
    ├── career-compass.json
    └── career-readiness.json
```

**That's all!** Pure static files - no backend required.

## Deployment

Deploy to any static hosting platform:

### GitHub Pages (Free)
```bash
# Push to GitHub, then enable Pages in repo settings
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### Netlify (Free)
- Drag and drop the folder to netlify.com/drop
- Or connect your GitHub repo

### Vercel (Free)
```bash
vercel deploy
```

### Any Web Host
Just upload the files via FTP/SFTP. No special configuration needed!

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

**Zero configuration required!** The system works completely out of the box.

### Optional Settings

Edit `js/config.js` to customize behavior:

```javascript
// Show results to user after completion (true) or skip to thank you (false)
showResultsToUser: true

// Attach PDF to email (generated client-side using html2pdf.js)
attachPdfReport: true

// Store results locally for dashboard viewing
storeResults: false
```

**Default behavior:**
- Results shown to user before completion
- Email sent automatically with PDF attachment (generated client-side)
- Recipient configured on API server (info@prolificdev.com)
- Results not stored locally (email only)

## Security Features

- **Input Validation**: Client-side validation with XSS protection
- **Secure API**: Mailer API handles authentication securely
- **No Secrets Exposed**: API key is designed for client-side use
- **localStorage Only**: No sensitive data stored server-side

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
**Last Updated**: November 2024
**Architecture**: 100% Static - Zero Server Configuration Required
