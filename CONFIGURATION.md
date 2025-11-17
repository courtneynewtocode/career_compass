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

### `generatePdf`

**Type:** Boolean
**Default:** `true`

Controls whether a PDF is attached to the email.

```javascript
generatePdf: true   // Email includes HTML + PDF attachment
generatePdf: false  // Email includes HTML only (no PDF)
```

**When `true`:**
- Mailer API generates PDF from HTML report
- PDF attached to email automatically
- Recipient gets both HTML email and PDF file

**When `false`:**
- Email contains HTML report only
- No PDF generation
- Faster email delivery

**Use cases:**
- `true` - When recipient needs downloadable/printable PDF
- `false` - When HTML email is sufficient (saves processing time)

---

## Configuration Examples

### Example 1: Show Results + PDF (Default)
```javascript
const Config = {
  mailer: { /* ... */ },
  showResultsToUser: true,
  generatePdf: true
};
```

**Behavior:**
- Student sees results ✓
- Email sent with PDF ✓
- Best for formative assessments

---

### Example 2: Hide Results + PDF Only
```javascript
const Config = {
  mailer: { /* ... */ },
  showResultsToUser: false,
  generatePdf: true
};
```

**Behavior:**
- Student does NOT see results
- Email sent with PDF to admin only
- Best for summative/confidential assessments

---

### Example 3: Show Results + No PDF
```javascript
const Config = {
  mailer: { /* ... */ },
  showResultsToUser: true,
  generatePdf: false
};
```

**Behavior:**
- Student sees results ✓
- Email sent as HTML only (no PDF)
- Faster processing, good for quick feedback

---

### Example 4: Hide Results + No PDF
```javascript
const Config = {
  mailer: { /* ... */ },
  showResultsToUser: false,
  generatePdf: false
};
```

**Behavior:**
- Student does NOT see results
- Email sent as HTML only
- Fastest processing, minimal student visibility

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

2. **PDF generation happens server-side**
   - Handled by mailer API
   - No client-side PDF library needed
   - Uses the same HTML that's sent in email

3. **Configuration changes require re-deployment**
   - Edit `js/config.js`
   - Upload to server or redeploy
   - No cache clearing needed (new sessions get new config)

4. **Both flags are independent**
   - You can enable/disable them separately
   - Choose any combination based on your needs

---

## Testing Your Configuration

1. Set your desired configuration in `js/config.js`
2. Open `test.html` in browser
3. Press `Ctrl+Shift+D` (debug mode)
4. Click "Skip to Results"
5. Observe behavior based on your settings
6. Check email to verify PDF attachment (if enabled)

---

## Need Help?

- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [README.md](README.md) - Full documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment instructions
