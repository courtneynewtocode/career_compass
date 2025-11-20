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

### `storeResults`

**Type:** Boolean
**Default:** `false`

Controls whether results are stored locally for dashboard viewing.

```javascript
storeResults: true   // Save results to local storage API
storeResults: false  // Only send email (no storage)
```

**When `true`:**
- Results saved to `data/results/` directory
- Accessible via `dashboard.html`
- Stored as JSON files

**When `false`:**
- Results only sent via email
- No local storage
- Dashboard will be empty

**Use cases:**
- `true` - When you want to view all results in a dashboard
- `false` - When email delivery is sufficient (default)

---

## Configuration Examples

### Example 1: Show Results + PDF (Default)
```javascript
const Config = {
  mailer: { /* ... */ },
  showResultsToUser: true,
  attachPdfReport: true,
  storeResults: false
};
```

**Behavior:**
- Student sees results ✓
- Email sent with PDF attachment ✓
- No local storage
- Best for formative assessments

---

### Example 2: Hide Results + PDF Only
```javascript
const Config = {
  mailer: { /* ... */ },
  showResultsToUser: false,
  attachPdfReport: true,
  storeResults: false
};
```

**Behavior:**
- Student does NOT see results
- Email sent with PDF to admin only
- No local storage
- Best for summative/confidential assessments

---

### Example 3: Show Results + Store Locally
```javascript
const Config = {
  mailer: { /* ... */ },
  showResultsToUser: true,
  attachPdfReport: true,
  storeResults: true
};
```

**Behavior:**
- Student sees results ✓
- Email sent with PDF ✓
- Results saved to dashboard ✓
- Best when you want both email and dashboard access

---

### Example 4: Email Only (No PDF, No Storage)
```javascript
const Config = {
  mailer: { /* ... */ },
  showResultsToUser: false,
  attachPdfReport: false,
  storeResults: false
};
```

**Behavior:**
- Student does NOT see results
- Simple email sent (no PDF)
- No local storage
- Fastest processing, minimal footprint

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
   - Generated in browser using html2pdf.js library
   - Attached to email via FormData/multipart upload
   - Takes a few seconds to generate
   - No server-side processing needed

3. **Configuration changes require re-deployment**
   - Edit `js/config.js`
   - Upload to server or redeploy
   - Clear browser cache if testing locally

4. **All flags are independent**
   - You can enable/disable them separately
   - Choose any combination based on your needs

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
