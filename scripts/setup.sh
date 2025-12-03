#!/bin/bash

# Karsaz App Setup Script
# This script sets up the entire Karsaz application with all services

set -e

echo "🚀 Setting up Karsaz App..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Create environment files
setup_env_files() {
    print_status "Setting up environment files..."
    
    # Frontend .env
    if [ ! -f ".env.local" ]; then
        cp .env.example .env.local
        print_success "Created frontend .env.local"
    else
        print_warning "Frontend .env.local already exists"
    fi
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
        print_success "Created backend .env"
    else
        print_warning "Backend .env already exists"
    fi
    
    # Admin Panel .env
    if [ ! -f "admin-panel/.env.local" ]; then
        cp admin-panel/.env.example admin-panel/.env.local
        print_success "Created admin panel .env.local"
    else
        print_warning "Admin panel .env.local already exists"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Root dependencies
    print_status "Installing root dependencies..."
    npm install
    
    # Backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    # Admin panel dependencies
    print_status "Installing admin panel dependencies..."
    cd admin-panel
    npm install
    cd ..
    
    print_success "All dependencies installed"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Start only database services
    docker-compose up -d postgres redis minio
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    cd backend
    npx prisma generate
    
    # Run database migrations
    print_status "Running database migrations..."
    npx prisma db push
    
    # Seed database
    print_status "Seeding database..."
    npm run db:seed
    
    cd ..
    
    print_success "Database setup completed"
}

# Create Docker network
setup_docker() {
    print_status "Setting up Docker environment..."
    
    # Create necessary directories
    mkdir -p docker/nginx/conf.d
    mkdir -p docker/postgres
    mkdir -p docker/prometheus
    mkdir -p docker/grafana/provisioning
    mkdir -p docker/ssl
    
    # Create basic nginx config
    cat > docker/nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }
    
    upstream admin {
        server admin:3000;
    }
    
    upstream backend {
        server backend:3001;
    }
    
    server {
        listen 80;
        server_name localhost;
        
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        location /admin {
            proxy_pass http://admin;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF
    
    # Create postgres init script
    cat > docker/postgres/init.sql << 'EOF'
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";
CREATE EXTENSION IF NOT EXISTS "unaccent";
EOF
    
    # Create prometheus config
    cat > docker/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'karsaz-backend'
    static_configs:
      - targets: ['backend:3001']
    metrics_path: '/metrics'
    scrape_interval: 5s
EOF
    
    print_success "Docker environment setup completed"
}

# Build and start services
start_services() {
    print_status "Building and starting all services..."
    
    # Build all services
    docker-compose build
    
    # Start all services
    docker-compose up -d
    
    print_success "All services started"
}

# Display service URLs
show_urls() {
    echo ""
    echo "🎉 Karsaz App setup completed successfully!"
    echo ""
    echo "📱 Service URLs:"
    echo "   Frontend:     http://localhost:12000"
    echo "   Admin Panel:  http://localhost:12001"
    echo "   Backend API:  http://localhost:3001"
    echo ""
    echo "🔧 Development Tools:"
    echo "   MinIO Console:    http://localhost:9001"
    echo "   Grafana:          http://localhost:3000 (admin/grafana_admin_2024)"
    echo "   Prometheus:       http://localhost:9090"
    echo "   Elasticsearch:    http://localhost:9200"
    echo ""
    echo "💾 Database:"
    echo "   PostgreSQL:       localhost:5432"
    echo "   Redis:            localhost:6379"
    echo ""
    echo "📚 Useful Commands:"
    echo "   Stop all services:    docker-compose down"
    echo "   View logs:            docker-compose logs -f [service-name]"
    echo "   Restart service:      docker-compose restart [service-name]"
    echo "   Database studio:      cd backend && npm run db:studio"
    echo ""
}

# Main setup function
main() {
    echo "🚀 Karsaz App Setup"
    echo "==================="
    echo ""
    
    # Check prerequisites
    check_docker
    check_node
    
    # Setup environment
    setup_env_files
    setup_docker
    
    # Install dependencies
    install_dependencies
    
    # Setup database
    setup_database
    
    # Start services
    start_services
    
    # Wait for services to be fully ready
    print_status "Waiting for all services to be ready..."
    sleep 30
    
    # Show URLs
    show_urls
}

# Run main function
main "$@"