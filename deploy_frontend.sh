#!/usr/bin/env bash
set -e
cd /var/www/asq-frontend
git fetch --all
git reset --hard origin/main
npm ci
npm run build
# if you need to adjust ownership:
# chown -R $USER:$USER /var/www/asq-frontend
# reload nginx if needed:
# sudo systemctl reload nginx
