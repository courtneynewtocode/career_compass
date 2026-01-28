# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Career Compass is a modular, multi-test career assessment platform that helps students discover their interests, strengths, and growth areas through questionnaire-based assessments. The system is fully implemented with JSON-based test configuration, email delivery, dashboard analytics, and fraud detection.

## Current Architecture

### Modular Structure
The application uses a modular architecture with separated concerns:

- **Landing Page** (`index.html`): CGA Global branded homepage featuring three assessment programs
- **Test Interface** (`test.html`): Dynamic test loader that reads JSON configurations
- **Dashboard** (`dashboard.html`): Password-protected admin panel for viewing results and analytics
- **Modular CSS**: Separate files for theme, layout, components, and reports
- **Modular JavaScript**: 12+ specialized modules handling specific functionality
- **JSON Configuration**: Test definitions, scoring rules, and metadata stored in `tests/` directory

### Key Components

**Frontend (HTML/CSS/JavaScript)**
- `test.html` - Main assessment interface with progress tracking
- `index.html` - Landing page with CGA Global branding
- `dashboard.html` - Admin results dashboard with modern sidebar layout
- `css/` - Modular stylesheets (theme, layout, components, report, dashboard)
- `js/` - 12 JavaScript modules (detailed below)

**Backend (Optional PHP)**
- `api/storage.php` - Storage API for results and analytics (PHP 7.4+)
- `data/results/` - JSON files for each assessment submission
- `data/analytics/` - Event tracking logs (test starts, completions, emails)

**Test Definitions**
- `tests/index.json` - Test manifest listing available assessments
- `tests/career-compass.json` - Career Compass test configuration
- `tests/career-readiness.json` - Career Readiness test configuration

### JavaScript Modules

1. **config.js** - Configuration (mailer API, storage, dashboard settings)
2. **app.js** - Main application controller (state management, flow control)
3. **renderer.js** - Page rendering (intro, questions, results with accessibility)
4. **scoring.js** - Score calculations and ranking algorithms
5. **validator.js** - Input validation + fraud detection (pattern analysis)
6. **storage.js** - localStorage management with TTL (7-day expiration)
7. **dialog.js** - Modal dialogs (alerts, confirms, custom dialogs)
8. **error-handler.js** - Global error boundary + retry mechanisms
9. **analytics.js** - Event tracking (file-based analytics)
10. **loading.js** - Loading overlays and page transitions
11. **pdf-loader.js** - Lazy-loading for html2canvas + jsPDF with smart canvas slicing
12. **dashboard.js** - Dashboard logic (results table, filtering, sorting)
13. **dashboard-auth.js** - Session-based authentication

### Data Flow

1. **Student takes test:**
   - Loads `test.html?test=career-compass`
   - Fetches `tests/career-compass.json`
   - Renders questions dynamically
   - Saves progress to localStorage (auto-save every change)
   - Validates answers before allowing navigation

2. **Test completion:**
   - Validates response patterns (fraud detection)
   - Calculates scores using `scoring.js`
   - Generates report HTML
   - Lazy-loads html2canvas + jsPDF and generates PDF with smart page-break slicing
   - Sends email with PDF attachment (via mailer API)
   - Stores results to `data/results/` (if enabled)
   - Tracks completion event in analytics
   - Shows results or completion message (configurable)

3. **Admin views dashboard:**
   - Visits `dashboard.html`
   - Authenticates with password (default: admin123)
   - Fetches results from `api/storage.php`
   - Views analytics stats (starts, completions, email success)
   - Filters/sorts/searches results
   - Views individual result details in modal

### Scoring Logic

**Section A: Career Clusters** (Holland's RIASEC)
- 6 categories: Realistic, Investigative, Artistic, Social, Enterprising, Conventional
- Sum answers per category, rank by total
- Display top 3 and bottom 3

**Section B: Career Drivers**
- 5 drivers: Growth, Security, Flexibility, Recognition, Innovation
- Sum answers per driver, rank by total
- Display top 3 and bottom 2

**Section C: Strengths & Skills**
- 27 individual strengths mapped to 9 clusters
- Calculate total and average per cluster
- Rank clusters, display as thirds (top 3, middle 3, bottom 3)

**Section D: Growth Areas**
- 15 growth items ranked individually
- Display highest 3 priorities and lower 3 priorities
- Total score calculated for overview

### Fraud Detection

**Pattern Validation** (validator.js):
- **Straight-lining**: All answers identical (e.g., all 3's)
- **Excessive same answer**: >95% of responses the same value
- **Repeating patterns**: 5+ pattern repetitions at 70%+ consistency

**When fraud detected:**
- Student sees: "Thank you for completing" message (no results)
- Email sent: Warning banner at top, no PDF attached
- Dashboard: Results not stored
- Graceful handling: No indication to student that fraud was detected

## Development Notes

### Configuration (js/config.js)

**Key Settings:**
- `showResultsToUser` (boolean): Show/hide results to student after completion
- `attachPdfReport` (boolean): Attach PDF to email (lazy-loaded, skipped for fraud)
- `showBackButton` (boolean): Enable/disable back navigation during test
- `storeResults` (boolean): Save results to dashboard (requires PHP backend)
- `dashboard.password` (string): Dashboard password (default: admin123 - **change in production!**)
- `dashboard.requireAuth` (boolean): Enable/disable dashboard authentication

### Validation

**Demographics:**
- Required fields: studentName, age, grade
- Email validation: RFC 5322 compliant regex
- Phone validation: South African format (+27 or 0 prefix, 9-12 digits)
- Name validation: Letters, spaces, hyphens, apostrophes only
- Age validation: 10-100 range

**Assessments:**
- All questions must be answered before proceeding
- Answer values: 1-5 scale
- Fraud detection runs on completion (see above)

### Styling Conventions

**CSS Variables (css/theme.css):**
- `--accent`: #0b8f8f (teal - CGA Global brand color)
- `--primary`: #102e7a (navy blue - CGA Global)
- `--secondary`: #1bbde4 (cyan - CGA Global)
- `--accent-yellow`: #d8f459 (lime yellow - CGA Global)
- Card-based design with border-radius: 14px
- Responsive breakpoint: 700px width

**Accessibility:**
- WCAG 2.1 Level AA compliant
- Skip links for keyboard navigation
- ARIA labels and roles
- Min touch target size: 48px (52px on mobile)
- Focus indicators: 3px solid outline

### Security Best Practices

1. **Never commit sensitive data** to version control
2. **Change default dashboard password** before deployment
3. **HTML escape all user input** when rendering (using `escapeHtml()`)
4. **Validate input** both client-side and server-side (if using PHP)
5. **Use HTTPS** for production deployment
6. **Set proper file permissions** on `data/` directory (755 or 750)

### Testing

**Debug Mode (Ctrl+Shift+Z on test.html):**
- Fill all answers with 3s
- Skip to results
- Clear session
- Export test data

**Production Checklist:**
- [ ] Change dashboard password in `js/config.js`
- [ ] Test email delivery
- [ ] Test fraud detection (fill all 3's)
- [ ] Test dashboard authentication
- [ ] Verify PHP permissions on `data/` directory
- [ ] Test on mobile devices
- [ ] Verify accessibility with screen reader
