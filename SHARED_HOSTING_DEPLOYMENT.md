# Deploying Career Compass on Linux Shared Hosting

This guide provides step-by-step instructions for deploying the Career Compass application on a Linux shared hosting environment.

---

## Prerequisites

Before you begin, ensure you have:

- ✅ Access to your shared hosting account (cPanel, DirectAdmin, or similar)
- ✅ FTP/SFTP credentials (host, username, password, port)
- ✅ An FTP client installed (FileZilla, WinSCP, or similar)
- ✅ Your domain name pointed to the hosting server

---

## What You Need to Upload

Career Compass is a **100% static website** - it consists only of HTML, CSS, and JavaScript files. There is:

- ❌ No database to configure
- ❌ No server-side code (PHP, Node.js, etc.)
- ❌ No special permissions or modules needed
- ✅ Just upload files and it works!

---

## Step 1: Prepare Your Files

1. **Download/Locate Your Project Files**
   - Ensure you have the complete project folder on your local computer
   - Location: `c:\Users\loukot\LouisWork\Projects\career_compass`

2. **Files and Folders to Upload**
   - `index.html` (main entry point)
   - `dashboard.html`
   - `test.html`
   - `test-pdf.html`
   - `css/` folder (contains all stylesheets)
   - `js/` folder (contains all JavaScript files)
   - `assets/` folder (contains images and other media)
   - `tests/` folder (contains test data)
   - `api/` folder (if present)
   - `data/` folder (if present)

3. **Files You DON'T Need to Upload** (optional to exclude):
   - `.git/` folder
   - `.idea/` folder
   - `.claude/` folder
   - `.env.example`
   - `README.md` (and other markdown documentation files)
   - `Dockerfile`
   - `docker-compose.yaml`
   - `DEPLOYMENT.md`, `QUICKSTART.md`, etc. (unless you want them accessible)

---

## Step 2: Connect to Your Hosting via FTP

### Using FileZilla (Recommended)

1. **Download FileZilla** (if you don't have it)
   - Visit: https://filezilla-project.org/download.php
   - Download the free FileZilla Client

2. **Open FileZilla** and enter your connection details:
   - **Host:** `ftp.yourdomain.com` or your server IP address
   - **Username:** Your FTP username
   - **Password:** Your FTP password
   - **Port:** 21 (FTP) or 22 (SFTP - recommended for security)

3. **Click "Quickconnect"**
   - Wait for the connection to establish
   - You should see your local files on the left, server files on the right

### Using WinSCP (Alternative for Windows)

1. **Download WinSCP**
   - Visit: https://winscp.net/eng/download.php

2. **Create New Session**
   - File protocol: FTP or SFTP
   - Host name: Your FTP host
   - Port: 21 (FTP) or 22 (SFTP)
   - Username and Password: Your credentials

3. **Login** and you'll see a dual-pane interface

---

## Step 3: Locate Your Web Root Directory

Your web root directory is where your website files should be placed. Common names include:

- `public_html/`
- `www/`
- `htdocs/`
- `public/`
- `html/`
- Your domain name folder (e.g., `yourdomain.com/`)

**How to find it:**
1. Once connected via FTP, look for one of the above folder names
2. This is where visitors will access your site from
3. Files placed here will be accessible at `http://yourdomain.com/`

---

## Step 4: Upload Your Files to the Root Directory

### Option A: Upload to Domain Root (Recommended)

This makes your site accessible at: `http://yourdomain.com/`

1. **Navigate to your web root** (e.g., `public_html/`)

2. **In FileZilla:**
   - Left pane: Navigate to `c:\Users\loukot\LouisWork\Projects\career_compass`
   - Right pane: Navigate to your web root (e.g., `public_html/`)
   - Select ALL project files and folders (except the ones to exclude)
   - Right-click → Upload (or drag and drop)

3. **Wait for Upload to Complete**
   - This may take a few minutes depending on file size and internet speed
   - FileZilla will show progress in the bottom panel

4. **Verify Upload**
   - After upload completes, check that all folders exist on the server:
     - `public_html/index.html`
     - `public_html/css/`
     - `public_html/js/`
     - `public_html/assets/`
     - `public_html/tests/`
     - etc.

### Option B: Upload to a Subdirectory (Alternative)

This makes your site accessible at: `http://yourdomain.com/career-compass/`

1. **Create a subdirectory:**
   - Navigate to your web root (e.g., `public_html/`)
   - Right-click → Create directory
   - Name it `career-compass` (or any name you prefer)

2. **Upload files into this subdirectory:**
   - Navigate into the newly created folder
   - Upload all project files here
   - Site will be accessible at `http://yourdomain.com/career-compass/`

---

## Step 5: Set Correct File Permissions (Important!)

Most shared hosting sets correct permissions automatically, but verify:

### Recommended Permissions:

- **Folders:** 755 (rwxr-xr-x)
- **Files:** 644 (rw-r--r--)

### In FileZilla:

1. Right-click on a file or folder
2. Select "File permissions..."
3. Set numeric value to:
   - Folders: 755
   - Files: 644
4. For folders: Check "Recurse into subdirectories"
5. Click OK

---

## Step 6: Test Your Deployment

1. **Open Your Browser**

2. **Visit Your Website:**
   - If uploaded to root: `http://yourdomain.com/`
   - If in subdirectory: `http://yourdomain.com/career-compass/`

3. **Test the Application:**
   - Open `http://yourdomain.com/test.html`
   - Press **Ctrl+Shift+Z** to enable debug mode
   - Click "Skip to Results"
   - Click "Submit Results"
   - Check your email (info@prolificdev.com) for the test results

4. **Full Test:**
   - Open `http://yourdomain.com/index.html` (or just the domain root)
   - Click "Start Assessment"
   - Complete a few questions or use debug mode
   - Submit and verify email delivery

---

## Troubleshooting

### Site shows "404 Not Found"

**Solution:**
- Ensure `index.html` is in the correct web root directory
- Check that you uploaded to `public_html/` (not just your home directory)
- Verify the file name is exactly `index.html` (case-sensitive on Linux)

### CSS/JS not loading (site looks broken)

**Solution:**
- Check that `css/` and `js/` folders were uploaded
- Verify folder structure is intact
- Check browser console (F12) for 404 errors
- Ensure file paths are correct (relative paths should work)

### Email submission fails

**Solution:**
- Open browser console (F12) for error messages
- Verify you have internet connection
- Check that `js/config.js` has correct API settings
- Ensure the hosting allows outbound HTTPS requests

### "Access Denied" or Permission Errors

**Solution:**
- Set folder permissions to 755
- Set file permissions to 644
- Some hosts require 750 for folders and 640 for files

### MIME Type Errors

**Solution:**
- Most shared hosting handles this automatically
- If CSS/JS shows as wrong type, add to `.htaccess`:
  ```apache
  AddType text/css .css
  AddType application/javascript .js
  ```

---

## Optional: Create .htaccess for Pretty URLs

If you want cleaner URLs, create a `.htaccess` file in your web root:

```apache
# Enable rewrite engine
RewriteEngine On

# Remove .html extension
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}\.html -f
RewriteRule ^(.*)$ $1.html [L]

# Redirect to HTTPS (optional but recommended)
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

This allows accessing pages as:
- `http://yourdomain.com/test` instead of `http://yourdomain.com/test.html`

---

## Optional: Enable HTTPS/SSL

For security and professionalism:

1. **Check if your host provides free SSL** (many do via Let's Encrypt)
2. **In cPanel:**
   - Go to "SSL/TLS Status"
   - Click "Run AutoSSL"
   - Wait for certificate to be issued
3. **Access your site via HTTPS:**
   - `https://yourdomain.com/`

---

## Maintenance and Updates

When you need to update the site:

1. **Make changes** to your local files
2. **Connect via FTP** to your hosting
3. **Upload only the changed files** (no need to re-upload everything)
4. **Test** the changes on your live site

**Tip:** Keep your local files as the "master copy" and sync changes to the server.

---

## Summary

✅ **Step 1:** Prepare files (use files from `career_compass` folder)  
✅ **Step 2:** Connect via FTP (FileZilla or WinSCP)  
✅ **Step 3:** Find web root directory (usually `public_html/`)  
✅ **Step 4:** Upload all files to root directory  
✅ **Step 5:** Set permissions (755 for folders, 644 for files)  
✅ **Step 6:** Test at `http://yourdomain.com/`  

**That's it!** Your Career Compass application is now live on shared hosting.

---

## Need Help?

- See [QUICKSTART.md](QUICKSTART.md) for application usage
- See [DEPLOYMENT.md](DEPLOYMENT.md) for other deployment options
- See [README.md](README.md) for full documentation
