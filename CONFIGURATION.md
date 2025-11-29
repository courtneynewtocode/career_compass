# Configuration Reference

All configuration is in `js/config.js`. No server-side configuration needed!

## Available Settings

### `showResultsToUser`

**Type:** Boolean
**Default:** `true`

Controls whether the student sees their assessment results.

```javascript
showResultsToUser: true   // Show results page before completion
showResultsToUser: false  // Skip directly to thank you page
```

**When `true`:**
- Student completes test
- Email sent automatically
- Results page displayed
- Student clicks "Finish" button
- Thank you page shown

**When `false`:**
- Student completes test
- Email sent automatically
- Thank you page shown immediately (results skipped)

**Use cases:**
- `true` - Formative assessments where students benefit from seeing results
- `false` - High-stakes assessments where results should only go to admin

---

### `attachPdfReport`

**Type:** Boolean
**Default:** `true`

Controls whether a PDF is attached to the email.

```javascript
attachPdfReport: true   // Email includes PDF attachment (generated client-side)
attachPdfReport: false  // Email includes simple HTML only (no PDF)
```

**When `true`:**
- PDF generated client-side in browser using html2pdf.js
- PDF attached to email automatically via FormData
- Recipient gets simple HTML email + PDF attachment
- Takes a few seconds to generate

**When `false`:**
- Email contains simple HTML summary only
- No PDF generation
- Faster email delivery

**Use cases:**
- `true` - When recipient needs downloadable/printable PDF report (recommended)
- `false` - When simple email notification is sufficient

---

### `showBackButton`

**Type:** Boolean
**Default:** `false`

Controls whether the back button is visible during the assessment.

```javascript
showBackButton: true   // Allow students to go back to previous questions
showBackButton: false  // Hide back button (forward-only navigation)
```

**When `true`:**
- Back button is visible on all question pages
- Students can navigate backwards to change answers
- First page has disabled back button

**When `false`:**
- Back button is hidden
- Students can only move forward through the assessment
- Prevents changing answers after viewing later questions

**Use cases:**
- `true` - Formative assessments where review is encouraged
- `false` - High-stakes assessments to prevent pattern gaming (recommended)

---

### `storeResults`

**Type:** Boolean
**Default:** `true`

Controls whether results are stored locally for dashboard viewing.

```javascript
storeResults: true   // Save results to local storage API
storeResults: false  // Only send email (no storage)
```

**When `true`:**
- Results saved to `data/results/` directory
- Accessible via `dashboard.html`
- Stored as JSON files
- Analytics tracking enabled

**When `false`:**
- Results only sent via email
- No local storage
- Dashboard will be empty

**Use cases:**
- `true` - When you want to view all results in a dashboard (recommended)
- `false` - When email delivery is sufficient

---

### `dashboard`

**Type:** Object
**Default:** `{ password: 'admin123', requireAuth: true }`

Controls dashboard authentication settings.

```javascript
dashboard: {
  password: 'admin123',      // Dashboard password
  requireAuth: true          // Enable/disable password protection
}
```

**Properties:**
- `password` - Password required to access dashboard
- `requireAuth` - Set to `false` to disable authentication (not recommended)

**Security Notes:**
- **IMPORTANT:** Change the default password before deployment!
- Password is stored client-side (suitable for basic protection only)
- For production use, consider server-side authentication

**Use cases:**
- Change password to a strong, unique value for production
- Set `requireAuth: false` only for trusted/local environments

---

## Configuration Examples

### Example 1: Production Setup (Recommended)
```javascript
const Config = {
  mailer: { /* ... */ },
  showResultsToUser: true,
  attachPdfReport: true,
  showBackButton: false,
  storeResults: true,
  dashboard: {
    password: 'your-strong-password-here',
    requireAuth: true
  }
};
```

**Behavior:**
- Student sees results ✓
- Email sent with PDF attachment ✓
- No back button (prevents gaming) ✓
- Results saved to dashboard ✓
- Dashboard protected by password ✓
- **Best for production use**

---

### Example 2: High-Stakes Assessment
```javascript
const Config = {
  mailer: { /* ... */ },
  showResultsToUser: false,
  attachPdfReport: true,
  showBackButton: false,
  storeResults: true,
  dashboard: {
    password: 'your-strong-password-here',
    requireAuth: true
  }
};
```

**Behavior:**
- Student does NOT see results
- Email sent with PDF to admin only
- Forward-only navigation ✓
- Results saved to dashboard ✓
- **Best for summative/confidential assessments**

---

### Example 3: Formative Assessment
```javascript
const Config = {
  mailer: { /* ... */ },
  showResultsToUser: true,
  attachPdfReport: true,
  showBackButton: true,
  storeResults: true,
  dashboard: {
    password: 'admin123',
    requireAuth: true
  }
};
```

**Behavior:**
- Student sees results ✓
- Email sent with PDF ✓
- Back button enabled (allows review) ✓
- Results saved to dashboard ✓
- **Best for formative/practice assessments**

---

### Example 4: Email Only (Minimal)
```javascript
const Config = {
  mailer: { /* ... */ },
  showResultsToUser: false,
  attachPdfReport: false,
  showBackButton: false,
  storeResults: false,
  dashboard: {
    password: 'admin123',
    requireAuth: false
  }
};
```

**Behavior:**
- Student does NOT see results
- Simple email sent (no PDF)
- No back button
- No local storage
- **Fastest processing, minimal footprint**

---

## Mailer API Configuration

The mailer API settings are also in `js/config.js`:

```javascript
mailer: {
  apiUrl: 'https://mailer.prolificdev.co.za/api/form',
  accessKey: 'your-access-key-here',
  fromName: 'CGA Global Reports'
}
```

**Notes:**
- API URL and access key are provided by the mailer service
- `fromName` appears as sender name in emails
- Email recipient is configured server-side (not in client code)
- Access key is safe to expose client-side (designed for browser use)

---

## Important Notes

1. **Email is ALWAYS sent automatically** when test completes
   - Does not require user to click any button
   - Happens before showing results or completion page

2. **PDF generation happens client-side**
   - Generated in browser using html2pdf.js library (lazy-loaded)
   - Attached to email via FormData/multipart upload
   - Takes a few seconds to generate
   - No server-side processing needed
   - **Skipped automatically for invalid responses** (fraud detection)

3. **Fraud Detection**
   - Invalid response patterns are automatically detected:
     - All same answers (e.g., all 3's)
     - Excessive same answer (>95%)
     - Repeating patterns (5+ times at 70%+ consistency)
   - When detected:
     - Student sees friendly completion message (no results shown)
     - Email sent to admin with warning banner
     - **No PDF generated or attached**
     - Results NOT saved to dashboard

4. **Configuration changes require re-deployment**
   - Edit `js/config.js`
   - Upload to server or redeploy
   - Clear browser cache if testing locally

5. **All flags are independent**
   - You can enable/disable them separately
   - Choose any combination based on your needs

6. **Dashboard Features**
   - Password protection (change default password!)
   - Session-based authentication using sessionStorage
   - Analytics tracking (test starts, completions, email success)
   - Modern sidebar layout with stats
   - Error handling with user-friendly messages
   - Export/view individual results

---

## Testing Your Configuration

1. Set your desired configuration in `js/config.js`
2. Open `test.html` in browser
3. Press `Ctrl+Shift+Z` (debug mode)
4. Click "Skip to Results"
5. Observe behavior based on your settings
6. Check email to verify PDF attachment (if enabled)

---

## Need Help?

- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [README.md](README.md) - Full documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment instructions
