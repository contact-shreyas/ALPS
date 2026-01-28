#!/bin/bash

# Production deployment script for Agentic Light Pollution Sentinel

set -e

echo "🚀 Starting deployment process..."

# Configuration
APP_NAME="light-sentinel"
BACKUP_DIR="/var/backups/$APP_NAME"
LOG_FILE="/var/log/$APP_NAME/deploy.log"

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$BACKUP_DIR"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
handle_error() {
    log "❌ Error occurred during deployment. Rolling back..."
    # Add rollback logic here
    exit 1
}

trap 'handle_error' ERR

log "📦 Starting deployment of $APP_NAME"

# 1. Pre-deployment checks
log "🔍 Running pre-deployment checks..."

# Check if required environment variables are set
required_vars=("DATABASE_URL" "SMTP_HOST" "SMTP_USER" "SMTP_PASS")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        log "❌ Required environment variable $var is not set"
        exit 1
    fi
done

# Check disk space
available_space=$(df / | awk 'NR==2 {print $4}')
required_space=1000000  # 1GB in KB
if [ "$available_space" -lt "$required_space" ]; then
    log "❌ Insufficient disk space. Available: ${available_space}KB, Required: ${required_space}KB"
    exit 1
fi

log "✅ Pre-deployment checks passed"

# 2. Create database backup
log "💾 Creating database backup..."
backup_file="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
pg_dump "$DATABASE_URL" > "$backup_file"
log "✅ Database backup created: $backup_file"

# 3. Build and deploy
log "🏗️  Building application..."

# Pull latest changes
git pull origin main

# Install dependencies
pnpm install --frozen-lockfile

# Generate Prisma client
pnpm prisma generate

# Run database migrations
log "🗄️  Running database migrations..."
pnpm prisma migrate deploy

# Build application
pnpm build

log "✅ Application built successfully"

# 4. Health check
log "🏥 Running health check..."
if pnpm health; then
    log "✅ Health check passed"
else
    log "❌ Health check failed"
    exit 1
fi

# 5. Start/restart services
log "🔄 Restarting services..."

if command -v systemctl &> /dev/null; then
    systemctl restart "$APP_NAME"
    systemctl status "$APP_NAME"
elif command -v docker-compose &> /dev/null; then
    docker-compose down
    docker-compose up -d --build
    docker-compose ps
else
    log "⚠️  No service manager found. Please restart manually."
fi

# 6. Post-deployment verification
log "✅ Running post-deployment verification..."

# Wait for service to start
sleep 10

# Check if application is responding
if curl -f -s http://localhost:3000/api/health > /dev/null; then
    log "✅ Application is responding"
else
    log "❌ Application is not responding"
    exit 1
fi

# 7. Cleanup old backups (keep last 10)
log "🧹 Cleaning up old backups..."
cd "$BACKUP_DIR"
ls -t backup_*.sql | tail -n +11 | xargs -r rm
log "✅ Cleanup completed"

# 8. Send notification
log "📧 Sending deployment notification..."
if command -v curl &> /dev/null && [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚀 $APP_NAME deployed successfully at $(date)\"}" \
        "$SLACK_WEBHOOK_URL"
fi

log "🎉 Deployment completed successfully!"

# Display deployment summary
cat << EOF

📊 Deployment Summary:
========================
Application: $APP_NAME
Timestamp: $(date)
Backup: $backup_file
Log: $LOG_FILE

✅ Deployment completed successfully!

EOF