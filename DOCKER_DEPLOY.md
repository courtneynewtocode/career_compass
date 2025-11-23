# Docker Deployment Guide

This guide explains how to deploy Career Compass Assessment System using Docker on your VPS.

## Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- VPS with Ubuntu 20.04+ or similar
- Domain name (optional, for HTTPS)

## Quick Start (5 Minutes)

### 1. Install Docker on VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add your user to docker group (optional)
sudo usermod -aG docker $USER
```

### 2. Clone or Upload Project

```bash
# Option A: Clone from Git
git clone https://github.com/yourusername/career_compass.git
cd career_compass

# Option B: Upload via SCP
scp -r career_compass user@your-vps-ip:/home/user/
ssh user@your-vps-ip
cd career_compass
```

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit configuration
nano .env
```

Update `.env` with your settings:
```env
APP_PORT=80
DOMAIN=assessments.yourdomain.com
```

### 4. Deploy

```bash
# Build and start the application
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 5. Access Your Application

- Local: http://localhost:8080 (or your APP_PORT)
- Production: http://your-vps-ip or http://yourdomain.com

## Directory Structure

```
career_compass/
├── data/
│   ├── results/          # Assessment results (created automatically)
│   └── analytics/        # Analytics events (created automatically)
├── Dockerfile            # Docker image configuration
├── docker-compose.yaml   # Docker Compose orchestration
└── .env                  # Environment variables
```

## Common Commands

### Start Application
```bash
docker-compose up -d
```

### Stop Application
```bash
docker-compose down
```

### Restart Application
```bash
docker-compose restart
```

### View Logs
```bash
# All logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100 -f

# Application logs only
docker-compose logs -f career-compass
```

### Update Application
```bash
# Pull latest changes (if using Git)
git pull

# Rebuild and restart
docker-compose up -d --build

# Or without downtime
docker-compose up -d --no-deps --build career-compass
```

### Access Container Shell
```bash
docker-compose exec career-compass bash
```

### Check Resource Usage
```bash
docker stats career-compass
```

## Data Management

### Backup Data

```bash
# Create backup directory
mkdir -p backups

# Backup results and analytics
tar -czf backups/data-backup-$(date +%Y%m%d-%H%M%S).tar.gz data/

# Copy backup to local machine
scp user@your-vps-ip:~/career_compass/backups/*.tar.gz ./local-backups/
```

### Restore Data

```bash
# Extract backup
tar -xzf backups/data-backup-YYYYMMDD-HHMMSS.tar.gz

# Restart application
docker-compose restart
```

### Clear Old Analytics (Optional)

```bash
# Delete analytics older than 30 days
find data/analytics/ -name "*.json" -mtime +30 -delete
```

## SSL/HTTPS Setup

### Option A: Using Let's Encrypt (Recommended)

1. Install Certbot:
```bash
sudo apt install certbot
```

2. Stop Docker temporarily:
```bash
docker-compose down
```

3. Get certificate:
```bash
sudo certbot certonly --standalone -d yourdomain.com
```

4. Update docker-compose.yaml to mount certificates:
```yaml
volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro
```

5. Configure Apache for SSL (see SSL_SETUP.md)

### Option B: Using Nginx Reverse Proxy

See the commented `nginx` service in `docker-compose.yaml`

## Performance Tuning

### Increase PHP Limits (for large PDFs)

Edit `.env`:
```env
PHP_UPLOAD_MAX_FILESIZE=50M
PHP_POST_MAX_SIZE=50M
PHP_MAX_EXECUTION_TIME=600
```

Restart:
```bash
docker-compose restart
```

### Enable GZIP Compression

Already enabled in Dockerfile's .htaccess configuration.

### Monitor Resources

```bash
# Check disk usage
du -sh data/

# Check container resources
docker stats

# Check Apache logs
docker-compose logs career-compass | grep "error"
```

## Firewall Configuration

### UFW (Ubuntu)

```bash
# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Allow SSH (if not already allowed)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Troubleshooting

### Application won't start

```bash
# Check logs
docker-compose logs

# Check container status
docker-compose ps

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

### Permission errors

```bash
# Fix data directory permissions
sudo chown -R www-data:www-data data/
sudo chmod -R 755 data/
```

### Port already in use

```bash
# Change APP_PORT in .env
echo "APP_PORT=8080" >> .env

# Restart
docker-compose down
docker-compose up -d
```

### Cannot access from browser

1. Check if container is running: `docker-compose ps`
2. Check firewall: `sudo ufw status`
3. Check logs: `docker-compose logs -f`
4. Test locally: `curl http://localhost`

## Production Checklist

- [ ] Change default access keys in `js/config.js` and `api/storage.php`
- [ ] Configure SSL/HTTPS
- [ ] Set up automated backups
- [ ] Configure firewall
- [ ] Set up monitoring (optional)
- [ ] Test email delivery
- [ ] Test from mobile devices
- [ ] Set up log rotation
- [ ] Configure domain DNS
- [ ] Test disaster recovery

## Monitoring & Maintenance

### Set up automated backups

Create `/etc/cron.daily/backup-career-compass`:
```bash
#!/bin/bash
cd /home/user/career_compass
tar -czf backups/data-backup-$(date +%Y%m%d).tar.gz data/
# Keep only last 30 days
find backups/ -name "*.tar.gz" -mtime +30 -delete
```

Make executable:
```bash
sudo chmod +x /etc/cron.daily/backup-career-compass
```

### Log Rotation

Docker handles log rotation automatically, but you can configure it:

Create `/etc/docker/daemon.json`:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:
```bash
sudo systemctl restart docker
```

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review documentation in `/docs`
3. Contact: admin@yourdomain.com

## Security Notes

- Change default API keys in production
- Keep Docker and system updated: `sudo apt update && sudo apt upgrade`
- Monitor logs for suspicious activity
- Use HTTPS in production
- Regularly backup data
- Limit access to data/ directory

---

**Version**: 1.0
**Last Updated**: November 2025
**Docker Version**: 20.10+
**Docker Compose Version**: 2.0+
