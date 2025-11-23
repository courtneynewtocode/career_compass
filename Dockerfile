# Career Compass Assessment System - Dockerfile
# Multi-stage build for optimized production image

FROM php:8.2-apache AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions (if needed in future)
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Enable Apache modules
RUN a2enmod rewrite headers expires deflate

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . /var/www/html/

# Create necessary directories with proper permissions
RUN mkdir -p /var/www/html/data/results \
    && mkdir -p /var/www/html/data/analytics \
    && chown -R www-data:www-data /var/www/html/data \
    && chmod -R 755 /var/www/html/data

# Configure Apache
RUN echo '<VirtualHost *:80>\n\
    ServerAdmin webmaster@localhost\n\
    ServerName localhost\n\
    DocumentRoot /var/www/html\n\
\n\
    <Directory /var/www/html>\n\
        Options -Indexes +FollowSymLinks\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
\n\
    # Security headers\n\
    Header set X-Content-Type-Options "nosniff"\n\
    Header set X-Frame-Options "SAMEORIGIN"\n\
    Header set X-XSS-Protection "1; mode=block"\n\
    Header set Referrer-Policy "strict-origin-when-cross-origin"\n\
\n\
    # Cache control for static assets\n\
    <FilesMatch "\\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$">\n\
        Header set Cache-Control "max-age=31536000, public"\n\
    </FilesMatch>\n\
\n\
    # Disable caching for HTML and PHP\n\
    <FilesMatch "\\.(html|htm|php)$">\n\
        Header set Cache-Control "no-cache, no-store, must-revalidate"\n\
        Header set Pragma "no-cache"\n\
        Header set Expires "0"\n\
    </FilesMatch>\n\
\n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

# Create .htaccess for additional security and routing
RUN echo '# Enable rewrite engine\n\
RewriteEngine On\n\
\n\
# Force HTTPS (if SSL is configured)\n\
# RewriteCond %{HTTPS} off\n\
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]\n\
\n\
# Prevent directory listing\n\
Options -Indexes\n\
\n\
# Protect sensitive files\n\
<FilesMatch "^\\.">\\n\
    Order allow,deny\n\
    Deny from all\n\
</FilesMatch>\n\
\n\
# Protect JSON test files from direct access (optional)\n\
# <FilesMatch "\\.json$">\n\
#     Order allow,deny\n\
#     Deny from all\n\
# </FilesMatch>\n\
\n\
# GZIP Compression\n\
<IfModule mod_deflate.c>\n\
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json\n\
</IfModule>' > /var/www/html/.htaccess

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start Apache
CMD ["apache2-foreground"]
