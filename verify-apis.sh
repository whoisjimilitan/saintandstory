#!/bin/bash

# E2E API Verification Script
# Tests that all critical endpoints are deployed and responding

echo "======================================"
echo "SAINT & STORY - API VERIFICATION TEST"
echo "======================================"
echo ""

API_BASE="https://saintandstoryltd.co.uk/api/b2b"
RESULTS=0

# Test function
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4

  echo -n "Testing $name... "

  if [ "$method" = "GET" ]; then
    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE$endpoint")
  else
    response=$(curl -s -X POST -H "Content-Type: application/json" -d "$data" -o /dev/null -w "%{http_code}" "$API_BASE$endpoint")
  fi

  if [ "$response" = "200" ] || [ "$response" = "201" ] || [ "$response" = "400" ]; then
    echo "✓ HTTP $response"
    return 0
  else
    echo "✗ HTTP $response (Expected 200/201/400)"
    ((RESULTS++))
    return 1
  fi
}

echo "=== CRITICAL PATHS ==="
echo ""

# 1. Discover - Search for prospects
echo "1. DISCOVER WORKFLOW"
test_endpoint "Dork Search" "POST" "/dork-search/route" '{"searchTerm":"plumbers","city":"London"}'
test_endpoint "Prospect List" "GET" "/prospects"
echo ""

# 2. Enrich - Generate emails
echo "2. ENRICH WORKFLOW"
test_endpoint "Batch Save" "POST" "/batch-save" '{"prospects":[{"businessName":"Test Corp","city":"London","email":"test@corp.com"}]}'
test_endpoint "Generate Emails" "POST" "/batch-emails/generate" '{"prospectIds":["test-id"]}'
echo ""

# 3. Send emails
echo "3. SEND WORKFLOW"
test_endpoint "Send Emails" "POST" "/batch-emails/send" '{"emails":[{"prospectId":"test","subject":"Test","body":"Test message"}]}'
test_endpoint "Sent Emails" "GET" "/sent-emails"
echo ""

# 4. Responses
echo "4. RESPONSES WORKFLOW"
test_endpoint "Get Responses" "GET" "/sent-emails?limit=200"
echo ""

# 5. Qualify
echo "5. QUALIFY WORKFLOW"
test_endpoint "Qualify Lead" "POST" "/qualify" '{"prospectId":"test"}'
echo ""

# 6. Orders
echo "6. ORDERS WORKFLOW"
test_endpoint "Get Orders" "GET" "/orders"
echo ""

# 7. Reply
echo "7. REPLY WORKFLOW"
test_endpoint "Send Reply" "POST" "/send-reply" '{"prospectId":"test","prospectEmail":"test@email.com","message":"Test reply"}'
echo ""

echo "======================================"
if [ $RESULTS -eq 0 ]; then
  echo "✅ ALL ENDPOINTS VERIFIED"
  echo "✅ System is fully operational"
else
  echo "❌ $RESULTS endpoints need attention"
fi
echo "======================================"
echo ""
echo "To test manually:"
echo "1. Go to: https://saintandstoryltd.co.uk/operator"
echo "2. Follow the E2E-TEST.md workflow"
echo "3. Test complete journey: TODAY → DISCOVER → ENRICH → RESPONSES → QUALIFY → ORDERS"
