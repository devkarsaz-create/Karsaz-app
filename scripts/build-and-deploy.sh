#!/bin/bash

# Karsaz App Production Build and Deploy Script
# This script builds the official Docker image and deploys the complete application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="karsaz/karsaz-app"
IMAGE_TAG="latest"
REGISTRY_URL="docker.io"  # Change to your registry

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        exit 1
    fi
    
    print_success "All prerequisites met"
}

# Function to build the production image
build_image() {
    print_status "Building production Docker image..."
    
    # Build the image
    docker build \
        -f Dockerfile.production \
        -t "${IMAGE_NAME}:${IMAGE_TAG}" \
        -t "${IMAGE_NAME}:$(date +%Y%m%d-%H%M%S)" \
        .
    
    print_success "Docker image built successfully"
    
    # Show image info
    docker images "${IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
}

# Function to test the image
test_image() {
    print_status "Testing the Docker image..."
    
    # Create a test environment file
    cat > .env.test << EOF
POSTGRES_DB=karsaz_test
POSTGRES_USER=karsaz_test
POSTGRES_PASSWORD=test_password_123
REDIS_PASSWORD=test_redis_123
JWT_SECRET=test_jwt_secret_very_long_and_secure_key_for_testing_only
JWT_REFRESH_SECRET=test_refresh_secret_very_long_and_secure_key_for_testing_only
MINIO_ROOT_USER=test_minio
MINIO_ROOT_PASSWORD=test_minio_password_123
SEED_DATABASE=true
EOF
    
    # Start test environment
    print_status "Starting test environment..."
    docker-compose -f docker-compose.production.yml --env-file .env.test up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 60
    
    # Test health endpoints
    print_status "Testing health endpoints..."
    
    # Test backend health
    if curl -f http://localhost:3001/health &> /dev/null; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed"
        docker-compose -f docker-compose.production.yml --env-file .env.test logs karsaz-app
        cleanup_test
        exit 1
    fi
    
    # Test frontend
    if curl -f http://localhost:3000 &> /dev/null; then
        print_success "Frontend health check passed"
    else
        print_error "Frontend health check failed"
        cleanup_test
        exit 1
    fi
    
    # Test admin panel
    if curl -f http://localhost:3002 &> /dev/null; then
        print_success "Admin panel health check passed"
    else
        print_error "Admin panel health check failed"
        cleanup_test
        exit 1
    fi
    
    print_success "All health checks passed"
    
    # Cleanup test environment
    cleanup_test
}

# Function to cleanup test environment
cleanup_test() {
    print_status "Cleaning up test environment..."
    docker-compose -f docker-compose.production.yml --env-file .env.test down -v
    rm -f .env.test
    print_success "Test environment cleaned up"
}

# Function to push image to registry
push_image() {
    if [ "$PUSH_TO_REGISTRY" = "true" ]; then
        print_status "Pushing image to registry..."
        
        # Tag for registry
        docker tag "${IMAGE_NAME}:${IMAGE_TAG}" "${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG}"
        docker tag "${IMAGE_NAME}:${IMAGE_TAG}" "${REGISTRY_URL}/${IMAGE_NAME}:$(date +%Y%m%d-%H%M%S)"
        
        # Push to registry
        docker push "${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG}"
        docker push "${REGISTRY_URL}/${IMAGE_NAME}:$(date +%Y%m%d-%H%M%S)"
        
        print_success "Image pushed to registry"
    else
        print_warning "Skipping registry push (set PUSH_TO_REGISTRY=true to enable)"
    fi
}

# Function to deploy to production
deploy_production() {
    if [ "$DEPLOY_TO_PRODUCTION" = "true" ]; then
        print_status "Deploying to production..."
        
        # Check if production environment file exists
        if [ ! -f ".env.production" ]; then
            print_error "Production environment file (.env.production) not found"
            print_status "Please copy .env.production.example to .env.production and configure it"
            exit 1
        fi
        
        # Deploy with production configuration
        docker-compose -f docker-compose.production.yml --env-file .env.production up -d
        
        # Wait for deployment
        print_status "Waiting for production deployment..."
        sleep 60
        
        # Verify deployment
        if curl -f http://localhost:3001/health &> /dev/null; then
            print_success "Production deployment successful"
        else
            print_error "Production deployment failed"
            docker-compose -f docker-compose.production.yml --env-file .env.production logs
            exit 1
        fi
        
    else
        print_warning "Skipping production deployment (set DEPLOY_TO_PRODUCTION=true to enable)"
    fi
}

# Function to generate deployment documentation
generate_docs() {
    print_status "Generating deployment documentation..."
    
    cat > DEPLOYMENT.md << 'EOF'
# Karsaz App Deployment Guide

## Quick Start

### 1. Production Deployment
```bash
# Copy and configure environment
cp .env.production.example .env.production
# Edit .env.production with your values

# Deploy with Docker Compose
docker-compose -f docker-compose.production.yml --env-file .env.production up -d
```

### 2. Using Pre-built Image
```bash
# Pull the official image
docker pull karsaz/karsaz-app:latest

# Run with your configuration
docker run -d \
  --name karsaz-app \
  -p 3000:3000 \
  -p 3001:3001 \
  -p 3002:3002 \
  --env-file .env.production \
  karsaz/karsaz-app:latest
```

## Service URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Admin Panel**: http://localhost:3002
- **Grafana**: http://localhost:3003
- **Prometheus**: http://localhost:9090

## Health Checks

- Backend: `curl http://localhost:3001/health`
- Frontend: `curl http://localhost:3000`
- Admin: `curl http://localhost:3002`

## Monitoring

- **Grafana Dashboard**: http://localhost:3003 (admin/your_password)
- **Prometheus Metrics**: http://localhost:9090

## Backup

```bash
# Database backup
docker exec karsaz-postgres-prod pg_dump -U karsaz karsaz > backup.sql

# MinIO backup
docker exec karsaz-minio-prod mc mirror /data /backup
```

## Scaling

```bash
# Scale the main application
docker-compose -f docker-compose.production.yml --env-file .env.production up -d --scale karsaz-app=3
```

## Troubleshooting

```bash
# View logs
docker-compose -f docker-compose.production.yml logs -f karsaz-app

# Check service status
docker-compose -f docker-compose.production.yml ps

# Restart services
docker-compose -f docker-compose.production.yml restart
```
EOF
    
    print_success "Deployment documentation generated: DEPLOYMENT.md"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --build-only          Build image only, skip testing and deployment"
    echo "  --test-only           Test existing image only"
    echo "  --push                Push image to registry"
    echo "  --deploy              Deploy to production"
    echo "  --registry URL        Set registry URL (default: docker.io)"
    echo "  --tag TAG             Set image tag (default: latest)"
    echo "  --help                Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  PUSH_TO_REGISTRY=true     Enable pushing to registry"
    echo "  DEPLOY_TO_PRODUCTION=true Enable production deployment"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Build and test"
    echo "  $0 --push --deploy                   # Build, test, push, and deploy"
    echo "  PUSH_TO_REGISTRY=true $0             # Build, test, and push"
    echo "  DEPLOY_TO_PRODUCTION=true $0         # Build, test, and deploy"
}

# Parse command line arguments
BUILD_ONLY=false
TEST_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        --test-only)
            TEST_ONLY=true
            shift
            ;;
        --push)
            PUSH_TO_REGISTRY=true
            shift
            ;;
        --deploy)
            DEPLOY_TO_PRODUCTION=true
            shift
            ;;
        --registry)
            REGISTRY_URL="$2"
            shift 2
            ;;
        --tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    echo "🚀 Karsaz App Production Build & Deploy"
    echo "======================================="
    echo ""
    
    check_prerequisites
    
    if [ "$TEST_ONLY" = "true" ]; then
        test_image
    elif [ "$BUILD_ONLY" = "true" ]; then
        build_image
    else
        build_image
        test_image
        push_image
        deploy_production
        generate_docs
    fi
    
    echo ""
    echo "🎉 Build and deployment process completed!"
    echo ""
    echo "📊 Image Information:"
    docker images "${IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" | head -3
    echo ""
    echo "📚 Next Steps:"
    echo "1. Configure your production environment in .env.production"
    echo "2. Set up your domain and SSL certificates"
    echo "3. Configure monitoring and alerting"
    echo "4. Set up automated backups"
    echo "5. Review security settings"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed deployment instructions"
}

# Run main function
main "$@"