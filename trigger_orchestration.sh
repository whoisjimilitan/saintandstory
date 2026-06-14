#!/bin/bash

# Determine production URL
# Default to saintandstory.com if it exists, otherwise use vercel
PROD_URL="https://saintandstory.com"

# Try POST to orchestration endpoint
echo "Triggering B2B orchestration..."
echo "Target: $PROD_URL/api/orchestrate/b2b-daily"
echo ""

RESPONSE=$(curl -s -X POST \
  "$PROD_URL/api/orchestrate/b2b-daily" \
  -H "Content-Type: application/json" \
  -w "\n%{http_code}")

# Extract status code
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "HTTP Status: $HTTP_CODE"
echo ""
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
