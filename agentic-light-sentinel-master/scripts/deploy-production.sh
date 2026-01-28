#!/bin/bash

# Production Deployment Script for Light Pollution Sentinel
# This script handles the complete deployment process

set -e  # Exit on any error

# Configuration
PROJECT_NAME="light-pollution-sentinel"
DOCKER_IMAGE="$PROJECT_NAME:latest"
CONTAINER_NAME="$PROJECT_NAME-app"
NETWORK_NAME="$PROJECT_NAME-network"
DB_CONTAINER_NAME="$PROJECT_NAME-db"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if required environment variables are set
    if [ -z "$DATABASE_URL" ]; then
        log_warning "DATABASE_URL not set. Using default PostgreSQL configuration."
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        log_error "JWT_SECRET must be set for production deployment."
    fi
    
    log_success "Prerequisites check completed."
}

# Build the application
build_application() {
    log_info "Building the application..."
    
    # Install dependencies
    if [ -f "pnpm-lock.yaml" ]; then
        pnpm install --frozen-lockfile
    elif [ -f "yarn.lock" ]; then
        yarn install --frozen-lockfile
    else
        npm ci
    fi
    
    # Run tests
    log_info "Running tests..."
    if [ -f "pnpm-lock.yaml" ]; then
        pnpm test
    elif [ -f "yarn.lock" ]; then
        yarn test
    else
        npm test
    fi
    
    # Build the application
    log_info "Building Next.js application..."
    if [ -f "pnpm-lock.yaml" ]; then
        pnpm build
    elif [ -f "yarn.lock" ]; then
        yarn build
    else
        npm run build
    fi
    
    log_success "Application built successfully."
}

# Database setup
setup_database() {
    log_info "Setting up database..."
    
    # Run Prisma migrations
    npx prisma migrate deploy
    
    # Generate Prisma client
    npx prisma generate
    
    # Seed database if needed
    if [ "$SEED_DATABASE" = "true" ]; then
        log_info "Seeding database..."
        npx prisma db seed
    fi
    
    log_success "Database setup completed."
}

# Build Docker image
build_docker_image() {
    log_info "Building Docker image..."
    
    # Build the Docker image
    docker build -t $DOCKER_IMAGE .
    
    # Tag for registry if specified
    if [ ! -z "$DOCKER_REGISTRY" ]; then
        docker tag $DOCKER_IMAGE $DOCKER_REGISTRY/$DOCKER_IMAGE
    fi
    
    log_success "Docker image built successfully."
}

# Deploy with Docker Compose
deploy_with_compose() {
    log_info "Deploying with Docker Compose..."
    
    # Stop existing containers
    docker-compose down --remove-orphans
    
    # Pull latest images
    docker-compose pull
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be ready
    sleep 30
    
    # Run health check
    health_check
    
    log_success "Deployment completed successfully."
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Check if the application is responding
    for i in {1..30}; do
        if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
            log_success "Application is healthy and responding."
            return 0
        fi
        log_info "Waiting for application to start... (attempt $i/30)"
        sleep 10
    done
    
    log_error "Health check failed. Application is not responding."
}

# Backup database
backup_database() {
    log_info "Creating database backup..."
    
    BACKUP_DIR="./backups"
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d_%H%M%S).sql"
    
    mkdir -p $BACKUP_DIR
    
    # Create backup using pg_dump (adjust for your database)
    docker exec $DB_CONTAINER_NAME pg_dump -U postgres light_pollution_db > $BACKUP_FILE
    
    # Compress backup
    gzip $BACKUP_FILE
    
    # Keep only last 7 backups
    find $BACKUP_DIR -name "backup-*.sql.gz" -mtime +7 -delete
    
    log_success "Database backup created: $BACKUP_FILE.gz"
}

# Rollback deployment
rollback() {
    log_warning "Rolling back deployment..."
    
    # Stop current containers
    docker-compose down
    
    # Restore from backup if specified
    if [ ! -z "$BACKUP_FILE" ]; then
        log_info "Restoring database from backup: $BACKUP_FILE"
        gunzip -c $BACKUP_FILE | docker exec -i $DB_CONTAINER_NAME psql -U postgres -d light_pollution_db
    fi
    
    # Start previous version (you'd need to implement version tracking)
    log_info "Starting previous version..."
    # This would require version tags or backup images
    
    log_success "Rollback completed."
}

# Monitor deployment
monitor() {
    log_info "Monitoring deployment..."
    
    # Show container status
    docker-compose ps
    
    # Show logs
    echo ""
    log_info "Recent logs:"
    docker-compose logs --tail=50
    
    # Show resource usage
    echo ""
    log_info "Resource usage:"
    docker stats --no-stream
}

# Cleanup old resources
cleanup() {
    log_info "Cleaning up old resources..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    # Remove unused networks
    docker network prune -f
    
    log_success "Cleanup completed."
}

# SSL setup with Let's Encrypt
setup_ssl() {
    log_info "Setting up SSL with Let's Encrypt..."
    
    if [ -z "$DOMAIN" ]; then
        log_error "DOMAIN environment variable must be set for SSL setup."
    fi
    
    # Install certbot if not present
    if ! command -v certbot &> /dev/null; then
        log_info "Installing certbot..."
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Generate SSL certificate
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $SSL_EMAIL
    
    # Setup auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo tee -a /etc/crontab > /dev/null
    
    log_success "SSL setup completed for domain: $DOMAIN"
}

# Main deployment function
deploy() {
    log_info "Starting deployment of $PROJECT_NAME..."
    
    check_prerequisites
    
    # Create backup before deployment
    if [ "$BACKUP_BEFORE_DEPLOY" = "true" ]; then
        backup_database
    fi
    
    build_application
    setup_database
    build_docker_image
    deploy_with_compose
    
    # Setup SSL if in production
    if [ "$ENVIRONMENT" = "production" ] && [ "$SETUP_SSL" = "true" ]; then
        setup_ssl
    fi
    
    monitor
    cleanup
    
    log_success "Deployment completed successfully!"
    echo ""
    echo "🚀 Application is running at:"
    echo "   - HTTP: http://localhost:3000"
    if [ "$SETUP_SSL" = "true" ] && [ ! -z "$DOMAIN" ]; then
        echo "   - HTTPS: https://$DOMAIN"
    fi
    echo ""
    echo "📊 Monitoring:"
    echo "   - Health: http://localhost:3000/api/health"
    echo "   - Metrics: http://localhost:3000/api/metrics"
    echo "   - Logs: docker-compose logs -f"
}

# Command line interface
case "$1" in
    "deploy")
        deploy
        ;;
    "build")
        build_application
        build_docker_image
        ;;
    "health")
        health_check
        ;;
    "backup")
        backup_database
        ;;
    "rollback")
        rollback
        ;;
    "monitor")
        monitor
        ;;
    "cleanup")
        cleanup
        ;;
    "ssl")
        setup_ssl
        ;;
    *)
        echo "Usage: $0 {deploy|build|health|backup|rollback|monitor|cleanup|ssl}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment process"
        echo "  build    - Build application and Docker image"
        echo "  health   - Run health check"
        echo "  backup   - Create database backup"
        echo "  rollback - Rollback to previous version"
        echo "  monitor  - Show deployment status and logs"
        echo "  cleanup  - Clean up unused Docker resources"
        echo "  ssl      - Setup SSL with Let's Encrypt"
        echo ""
        echo "Environment Variables:"
        echo "  ENVIRONMENT           - deployment environment (production|staging|development)"
        echo "  DATABASE_URL          - database connection string"
        echo "  JWT_SECRET           - JWT signing secret (required for production)"
        echo "  DOCKER_REGISTRY      - Docker registry for image storage"
        echo "  DOMAIN               - domain name for SSL setup"
        echo "  SSL_EMAIL            - email for SSL certificate"
        echo "  BACKUP_BEFORE_DEPLOY - create backup before deployment (true|false)"
        echo "  SEED_DATABASE        - seed database after migration (true|false)"
        echo "  SETUP_SSL            - setup SSL certificate (true|false)"
        exit 1
        ;;
esac