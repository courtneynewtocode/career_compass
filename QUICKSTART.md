# Quick Start Guide

Get Career Compass up and running in **30 seconds**! Pure static site - no server required.

---

## ✅ Step 1: Email Already Configured!

The system is a **100% static site** that sends emails directly from the browser to the Prolificdev Mailer API.

Results will be emailed to: **info@prolificdev.com**

**Note:** Email recipient is configured on the API server (not in the client code).

**How it works:**
- Pure JavaScript - no server-side code
- Browser builds HTML email using `js/email-builder.js`
- Sends directly to mailer API via `fetch()`
- Optional PDF attachment (generated server-side by mailer API)
- Can be hosted anywhere (GitHub Pages, Netlify, S3, CDN, etc.)

**Configuration options in `js/config.js`:**
- `showResultsToUser: true` - Show results page to student (false = skip to thank you)
- `generatePdf: true` - Attach PDF to email (false = HTML email only)

---

## 🧪 Step 2: Test It (30 seconds)

1. Open `test.html` in your browser (even locally!)
2. Press **Ctrl+Shift+D** (enables debug mode)
3. Click **"Skip to Results"**
4. Click **"Submit Results"**
5. Check your email!

---

## 🚀 Step 3: Try a Full Test (5 minutes)

1. Open `index.html` in your browser
2. Click "Start Assessment"
3. Fill in student details (or use debug shortcuts)
4. Complete assessment (or press Ctrl+Shift+D to skip)
5. Submit and check email

---

## 🛠️ Troubleshooting

### Email not received?

1. **Check spam folder**
2. **Verify internet connection** (API requires internet)
3. **Check browser console** for error messages
4. **Try again** - temporary network issues happen

### "Failed to load test"?

- Make sure `tests/career-compass.json` exists
- Check browser console for errors
- Try clearing browser cache

### CORS errors?

- Host the files on a web server (even locally)
- Or use: `python -m http.server 8000`
- Then visit: `http://localhost:8000/test.html`

---

## 🎯 Debug Shortcuts

Press **Ctrl+Shift+D** on test page for:
- **Fill all answers** with 3s
- **Skip to results** directly
- **Clear session**
- **Export data** as JSON

Makes testing super fast! ⚡

---

## 📚 Next Steps

- **Full Setup**: Read [SETUP.md](SETUP.md)
- **Features**: See [README.md](README.md)
- **Architecture**: Review [MIGRATION.md](MIGRATION.md)

---

## 🎉 That's It!

Your Career Compass is ready to use. **100% static - zero server configuration!**

**Key Benefits:**
- ✅ **Pure static site** - no server-side code
- ✅ Email sent directly from browser to API
- ✅ No PHP, no Node.js, no backend
- ✅ No database, no server setup
- ✅ Host anywhere (GitHub Pages, Netlify, S3, etc.)
- ✅ Works offline for taking test (submits when online)
- ✅ HTML emails with inline styling
- ✅ Lightweight and blazing fast
- ✅ Debug mode for testing

**Architecture:**
- **Email**: Browser → Mailer API (direct)
- **Storage**: Email contains all results (no separate storage)
- **Deployment**: Just upload HTML/CSS/JS files - done!

**Deployment Options:**
- GitHub Pages (free)
- Netlify (free)
- Vercel (free)
- AWS S3 + CloudFront
- Any CDN or web host
- Even works from file:// protocol locally!

**Need Help?**
See [README.md](README.md) for more details
