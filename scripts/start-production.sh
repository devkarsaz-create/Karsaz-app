#!/bin/sh

# Production startup script for Karsaz App
# Starts all services in a single container

set -e

echo "🚀 Starting Karsaz App in production mode..."

# Function to start a service in background
start_service() {
    local name=$1
    local command=$2
    local port=$3
    
    echo "Starting $name on port $port..."
    $command &
    local pid=$!
    echo "$pid" > "/tmp/$name.pid"
    echo "✅ $name started with PID $pid"
}

# Function to check if service is healthy
check_health() {
    local name=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    echo "Checking $name health..."
    while [ $attempt -le $max_attempts ]; do
        if curl -f "http://localhost:$port/health" >/dev/null 2>&1; then
            echo "✅ $name is healthy"
            return 0
        fi
        echo "⏳ Waiting for $name... ($attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $name failed to start"
    return 1
}

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down services..."
    
    # Kill all background processes
    for pidfile in /tmp/*.pid; do
        if [ -f "$pidfile" ]; then
            pid=$(cat "$pidfile")
            service_name=$(basename "$pidfile" .pid)
            echo "Stopping $service_name (PID: $pid)..."
            kill "$pid" 2>/dev/null || true
            rm -f "$pidfile"
        fi
    done
    
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Wait for database connection
echo "⏳ Waiting for database connection..."
cd backend
timeout=60
while [ $timeout -gt 0 ]; do
    if npx prisma db push --accept-data-loss >/dev/null 2>&1; then
        echo "✅ Database connected and schema updated"
        break
    fi
    echo "⏳ Database not ready, waiting... ($timeout seconds left)"
    sleep 2
    timeout=$((timeout - 2))
done

if [ $timeout -le 0 ]; then
    echo "❌ Database connection timeout"
    exit 1
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma db push --accept-data-loss

# Seed database if needed
if [ "$SEED_DATABASE" = "true" ]; then
    echo "🌱 Seeding database..."
    npm run db:seed || echo "⚠️ Database seeding failed or already seeded"
fi

cd ..

# Start Backend API
start_service "backend" "node backend/dist/server.js" "3001"

# Wait for backend to be healthy
check_health "backend" "3001" || exit 1

# Start Frontend
start_service "frontend" "node frontend/server.js" "3000"

# Start Admin Panel
start_service "admin" "node admin/server.js" "3002"

# Wait for all services to be healthy
check_health "frontend" "3000" || exit 1
check_health "admin" "3002" || exit 1

echo ""
echo "🎉 All services started successfully!"
echo ""
echo "📱 Service URLs:"
echo "   Frontend:    http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   Admin Panel: http://localhost:3002"
echo ""
echo "📊 Health Checks:"
echo "   Backend:     http://localhost:3001/health"
echo "   Frontend:    http://localhost:3000/health"
echo "   Admin:       http://localhost:3002/health"
echo ""

# Keep the script running and monitor services
while true; do
    # Check if all services are still running
    for pidfile in /tmp/*.pid; do
        if [ -f "$pidfile" ]; then
            pid=$(cat "$pidfile")
            service_name=$(basename "$pidfile" .pid)
            
            if ! kill -0 "$pid" 2>/dev/null; then
                echo "❌ $service_name (PID: $pid) has stopped unexpectedly"
                cleanup
                exit 1
            fi
        fi
    done
    
    sleep 10
done