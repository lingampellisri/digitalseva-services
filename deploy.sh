#!/bin/bash
# ─── Digital Seva Deployment Script ──────────────────────────────────────────
# Usage: bash deploy.sh
# Run this on your EC2 server after pushing changes to GitHub

set -e  # Stop on any error

APP_DIR="/var/www/digitalseva"
FRONTEND_BUILD="/var/www/html/digitalseva"

echo "🚀 Starting Digital Seva deployment..."
echo "📅 $(date)"
echo "────────────────────────────────────────"

# 1. Pull latest code from GitHub
echo "📥 Pulling latest code from GitHub..."
cd "$APP_DIR"
git pull origin main

# 2. Update backend
echo "📦 Updating backend dependencies..."
cd "$APP_DIR/backend"
npm install --production

# 3. Restart backend
echo "🔄 Restarting backend API..."
pm2 restart digitalseva-api

# 4. Build frontend
echo "🏗️  Building frontend..."
cd "$APP_DIR/frontend"
npm install
npm run build

# 5. Deploy frontend to Nginx
echo "📂 Deploying frontend build..."
sudo rm -rf "$FRONTEND_BUILD"/*
sudo cp -r dist/* "$FRONTEND_BUILD"/

# 6. Reload Nginx
echo "🔃 Reloading Nginx..."
sudo systemctl reload nginx

echo "────────────────────────────────────────"
echo "✅ Deployment complete!"
echo "🌐 Visit: https://digitalsevaaa.com"
echo "📅 $(date)"
