#!/bin/bash

# Import cryptocurrency data via API
echo "Starting data import..."

response=$(curl -s -X POST http://localhost:3000/api/admin/import \
  -H "Content-Type: application/json" \
  -d '{"action":"import"}')

echo "$response" | jq '.' 2>/dev/null || echo "$response"

echo ""
echo "Import complete! Visit http://localhost:3000/dashboard to view the data."
