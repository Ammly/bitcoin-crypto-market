#!/bin/bash

# Cryptocurrency Market Analysis Platform - Setup Script

echo "🚀 Starting Cryptocurrency Market Analysis Platform Setup..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the crypto-analysis directory."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✓ Docker is running"
echo ""

# Start PostgreSQL
echo "📦 Starting PostgreSQL database..."
cd ..
docker-compose up -d postgres
cd crypto-analysis

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if database is accessible
until docker exec crypto_analysis_db pg_isready -U crypto_user -d crypto_db > /dev/null 2>&1; do
    echo "   Still waiting..."
    sleep 2
done

echo "✓ PostgreSQL is ready"
echo ""

# Push database schema
echo "🗄️  Initializing database schema..."
npm run db:push

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Start the development server: npm run dev"
echo "   2. Visit http://localhost:3000/admin to import data"
echo "   3. Visit http://localhost:3000/dashboard to view analysis"
echo ""
echo "📚 For more information, see README.md"
