# Deployment Guide - Career Compass

This is a **100% static site** with zero server requirements. Deploy anywhere!

## Option 1: GitHub Pages (Free & Easy)

1. **Create a GitHub repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/career-compass.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from branch
   - Branch: main
   - Folder: / (root)
   - Save

3. **Access your site**
   - URL: `https://yourusername.github.io/career-compass/`
   - Or use custom domain

## Option 2: Netlify (Fastest)

### Drag & Drop
1. Go to https://app.netlify.com/drop
2. Drag the entire project folder
3. Done! Your site is live.

### From Git
1. Connect your GitHub/GitLab repo
2. Build settings: Leave blank (no build needed)
3. Deploy

## Option 3: Vercel

```bash
npm i -g vercel
cd career-compass
vercel
```

Follow the prompts - done!

## Option 4: Any Web Host

Just upload via FTP/SFTP:
- Upload all files to public_html or www folder
- Access via your domain

**No configuration needed!**

## Option 5: AWS S3 + CloudFront

1. Create S3 bucket
2. Enable static website hosting
3. Upload all files
4. (Optional) Add CloudFront for CDN

## Configuration After Deployment

**No configuration needed!** The system works immediately after deployment.

- Email recipient is configured on the API server (info@prolificdev.com)
- All settings are pre-configured
- Just deploy and it works

## Testing After Deployment

1. Visit your deployed URL
2. Open `test.html`
3. Press Ctrl+Shift+D (debug mode)
4. Click "Skip to Results"
5. Click "Submit Results"
6. Check your email!

## Troubleshooting

### CORS Errors
- Make sure you're accessing via HTTP/HTTPS (not file://)
- Most hosts automatically handle this

### Email Not Sending
- Check browser console for errors
- Verify internet connection
- Check spam folder

### Test Won't Load
- Ensure all files were uploaded
- Check that `tests/career-compass.json` exists
- Clear browser cache

## Performance Tips

- Use a CDN (Netlify/Vercel provide this automatically)
- Enable gzip compression on your host
- Add caching headers for CSS/JS files

## Security

The mailer API key in `js/config.js` is **safe to expose client-side** - it's designed for browser use and is rate-limited on the API side.

---

**Need Help?** See [QUICKSTART.md](QUICKSTART.md) or [README.md](README.md)
