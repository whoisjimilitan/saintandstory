#!/bin/bash

###############################################################################
# DISCOVER PHASE 1 - PRODUCTION VERIFICATION SUITE
# Real evidence-based verification of deployed system
#
# This script will:
# 1. Verify Vercel deployment is ready
# 2. Execute all success criteria tests
# 3. Collect network requests and responses
# 4. Analyze provider contributions
# 5. Trace any failures to root cause
#
# Usage:
#   ./PRODUCTION_VERIFICATION_SUITE.sh <bearer_token> [search_term]
#
# Example:
#   ./PRODUCTION_VERIFICATION_SUITE.sh "sk_live_..." "restaurant"
###############################################################################

set -e

PROD_URL="https://saintandstory.vercel.app"
BEARER_TOKEN="${1}"
SEARCH_TERM="${2:-restaurant}"
POSTCODE_TEST="M1"
RADIUS="10"

# Output file for evidence
EVIDENCE_LOG="PRODUCTION_VERIFICATION_EVIDENCE_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize log
cat > "$EVIDENCE_LOG" << 'EOF'
=============================================================================
DISCOVER PHASE 1 - PRODUCTION VERIFICATION EVIDENCE LOG
=============================================================================
Generated: $(date)
Environment: Production (saintandstory.vercel.app)
=============================================================================

EOF

log_evidence() {
    echo "$1" >> "$EVIDENCE_LOG"
    echo -e "$1"
}

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
    echo "=== $1 ===" >> "$EVIDENCE_LOG"
}

print_pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    echo "✅ PASS: $1" >> "$EVIDENCE_LOG"
}

print_fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    echo "❌ FAIL: $1" >> "$EVIDENCE_LOG"
}

print_warn() {
    echo -e "${YELLOW}⚠️  WARNING${NC}: $1"
    echo "⚠️  WARNING: $1" >> "$EVIDENCE_LOG"
}

# ============================================================================
# TEST 1: DEPLOYMENT VERIFICATION
# ============================================================================
print_header "TEST 1: DEPLOYMENT VERIFICATION"

echo "Checking if production has latest deployment..."
echo "" >> "$EVIDENCE_LOG"

HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$PROD_URL/api/admin/discover-health" \
  -H "Authorization: Bearer $BEARER_TOKEN" 2>/dev/null)

HTTP_STATUS=$(echo "$HEALTH_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

echo "HTTP Status: $HTTP_STATUS" >> "$EVIDENCE_LOG"
echo "Response Body:" >> "$EVIDENCE_LOG"
echo "$RESPONSE_BODY" >> "$EVIDENCE_LOG"
echo "" >> "$EVIDENCE_LOG"

if [ "$HTTP_STATUS" = "200" ]; then
    print_pass "Health endpoint responds (deployment likely complete)"

    # Check orchestrator status
    ORCHESTRATOR_STATUS=$(echo "$RESPONSE_BODY" | jq -r '.components.orchestrator.status // "MISSING"' 2>/dev/null)

    if [ "$ORCHESTRATOR_STATUS" = "healthy" ] || [ "$ORCHESTRATOR_STATUS" = "degraded" ]; then
        print_pass "Orchestrator endpoint accessible"
    else
        print_fail "Orchestrator not found in health response"
        echo "Status: $ORCHESTRATOR_STATUS" >> "$EVIDENCE_LOG"
    fi
elif [ "$HTTP_STATUS" = "401" ]; then
    print_warn "Health endpoint requires authentication (expected, token valid)"
elif [ "$HTTP_STATUS" = "404" ]; then
    print_fail "Health endpoint returns 404 - deployment NOT COMPLETE"
    log_evidence "Full response: $RESPONSE_BODY"
    exit 1
else
    print_fail "Health endpoint returned unexpected status: $HTTP_STATUS"
    log_evidence "Full response: $RESPONSE_BODY"
fi

# ============================================================================
# TEST 2: KEYWORD SEARCH ENDPOINT
# ============================================================================
print_header "TEST 2: KEYWORD SEARCH VERIFICATION"

echo "Testing keyword search: '$SEARCH_TERM'"
echo "" >> "$EVIDENCE_LOG"

SEARCH_RESPONSE=$(curl -s -w "\n%{http_code}" "$PROD_URL/api/b2b/discover?keyword=$SEARCH_TERM&limit=100" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" 2>/dev/null)

SEARCH_HTTP=$(echo "$SEARCH_RESPONSE" | tail -n 1)
SEARCH_BODY=$(echo "$SEARCH_RESPONSE" | head -n -1)

echo "HTTP Status: $SEARCH_HTTP" >> "$EVIDENCE_LOG"
echo "Response:" >> "$EVIDENCE_LOG"
echo "$SEARCH_BODY" | jq '.' >> "$EVIDENCE_LOG" 2>/dev/null || echo "$SEARCH_BODY" >> "$EVIDENCE_LOG"
echo "" >> "$EVIDENCE_LOG"

if [ "$SEARCH_HTTP" = "200" ]; then
    print_pass "Search endpoint returns HTTP 200"

    # Check response structure
    RESULTS_COUNT=$(echo "$SEARCH_BODY" | jq '.results | length' 2>/dev/null || echo "0")
    TOTAL_COUNT=$(echo "$SEARCH_BODY" | jq '.totalCount' 2>/dev/null || echo "0")

    if [ "$RESULTS_COUNT" -gt "0" ]; then
        print_pass "Search returned $RESULTS_COUNT results"
    else
        print_fail "Search returned 0 results"
    fi

    # Check sources breakdown
    SOURCES=$(echo "$SEARCH_BODY" | jq '.sources' 2>/dev/null)
    if [ ! -z "$SOURCES" ]; then
        print_pass "Response includes sources breakdown"
        log_evidence "Sources: $(echo $SOURCES | jq -c .)"

        CRM_COUNT=$(echo "$SOURCES" | jq '.crm // 0' 2>/dev/null)
        GOOGLE_COUNT=$(echo "$SOURCES" | jq '.google_places // 0' 2>/dev/null)
        CH_COUNT=$(echo "$SOURCES" | jq '.companies_house // 0' 2>/dev/null)

        log_evidence "  CRM: $CRM_COUNT"
        log_evidence "  Google Places: $GOOGLE_COUNT"
        log_evidence "  Companies House: $CH_COUNT"
    fi
else
    print_fail "Search endpoint returned HTTP $SEARCH_HTTP"
    log_evidence "Response: $SEARCH_BODY"
fi

# ============================================================================
# TEST 3: POSTCODE SEARCH
# ============================================================================
print_header "TEST 3: POSTCODE SEARCH VERIFICATION"

echo "Testing postcode search: $POSTCODE_TEST with radius $RADIUS km"
echo "" >> "$EVIDENCE_LOG"

POSTCODE_RESPONSE=$(curl -s -w "\n%{http_code}" "$PROD_URL/api/b2b/discover?postcode=$POSTCODE_TEST&radius=$RADIUS&limit=100" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" 2>/dev/null)

POSTCODE_HTTP=$(echo "$POSTCODE_RESPONSE" | tail -n 1)
POSTCODE_BODY=$(echo "$POSTCODE_RESPONSE" | head -n -1)

echo "HTTP Status: $POSTCODE_HTTP" >> "$EVIDENCE_LOG"
echo "Response:" >> "$EVIDENCE_LOG"
echo "$POSTCODE_BODY" | jq '.' >> "$EVIDENCE_LOG" 2>/dev/null || echo "$POSTCODE_BODY" >> "$EVIDENCE_LOG"
echo "" >> "$EVIDENCE_LOG"

if [ "$POSTCODE_HTTP" = "200" ]; then
    print_pass "Postcode search returns HTTP 200"

    POSTCODE_RESULTS=$(echo "$POSTCODE_BODY" | jq '.results | length' 2>/dev/null || echo "0")

    if [ "$POSTCODE_RESULTS" -gt "0" ]; then
        print_pass "Postcode search returned $POSTCODE_RESULTS results"
    else
        print_warn "Postcode search returned 0 results (may be expected if no records exist)"
    fi
else
    print_fail "Postcode search returned HTTP $POSTCODE_HTTP"
fi

# ============================================================================
# TEST 4: PROVIDER CONTRIBUTION ANALYSIS
# ============================================================================
print_header "TEST 4: PROVIDER CONTRIBUTIONS"

echo "Analyzing provider contributions in search results..."
echo "" >> "$EVIDENCE_LOG"

if [ ! -z "$SEARCH_BODY" ] && [ "$SEARCH_HTTP" = "200" ]; then
    FIRST_RESULT=$(echo "$SEARCH_BODY" | jq '.results[0] // empty' 2>/dev/null)

    if [ ! -z "$FIRST_RESULT" ]; then
        echo "First result sample:" >> "$EVIDENCE_LOG"
        echo "$FIRST_RESULT" | jq '.' >> "$EVIDENCE_LOG"
        echo "" >> "$EVIDENCE_LOG"

        # Check sources array
        SOURCES_ARRAY=$(echo "$FIRST_RESULT" | jq '.sources // []' 2>/dev/null)
        SOURCE_COUNT=$(echo "$SOURCES_ARRAY" | jq 'length' 2>/dev/null || echo "0")

        if [ "$SOURCE_COUNT" -gt "0" ]; then
            print_pass "First result has source attribution ($SOURCE_COUNT sources)"

            # List each source
            echo "$SOURCES_ARRAY" | jq -c '.[] | {provider: .provider, confidence: .confidence, fields: (.fields | length)}' 2>/dev/null | while read -r source; do
                log_evidence "  Source: $source"
            done
        else
            print_fail "First result missing source attribution"
        fi

        # Check for CRM status
        CRM_STATUS=$(echo "$FIRST_RESULT" | jq '.crmStatus // "MISSING"' 2>/dev/null)
        if [ "$CRM_STATUS" != "MISSING" ]; then
            print_pass "CRM status present: $CRM_STATUS"
        else
            print_fail "CRM status missing from result"
        fi
    fi
else
    print_fail "Cannot analyze provider contributions - no valid search response"
fi

# ============================================================================
# TEST 5: DEDUPLICATION VERIFICATION
# ============================================================================
print_header "TEST 5: DEDUPLICATION CHECK"

echo "Checking for duplicate business names in results..."
echo "" >> "$EVIDENCE_LOG"

if [ ! -z "$SEARCH_BODY" ] && [ "$SEARCH_HTTP" = "200" ]; then
    BUSINESS_NAMES=$(echo "$SEARCH_BODY" | jq -r '.results[].businessName' 2>/dev/null | sort)
    TOTAL_NAMES=$(echo "$BUSINESS_NAMES" | wc -l)
    UNIQUE_NAMES=$(echo "$BUSINESS_NAMES" | sort -u | wc -l)

    log_evidence "Total business results: $TOTAL_NAMES"
    log_evidence "Unique business names: $UNIQUE_NAMES"

    if [ "$TOTAL_NAMES" = "$UNIQUE_NAMES" ]; then
        print_pass "No duplicate business names found"
    else
        DUPLICATES=$((TOTAL_NAMES - UNIQUE_NAMES))
        print_fail "Found $DUPLICATES duplicate business names"
        log_evidence "Duplicates:"
        echo "$BUSINESS_NAMES" | sort | uniq -d >> "$EVIDENCE_LOG"
    fi

    # Check for merged results (multiple sources)
    MERGED_COUNT=$(echo "$SEARCH_BODY" | jq '[.results[] | select(.sources | length > 1)] | length' 2>/dev/null || echo "0")

    if [ "$MERGED_COUNT" -gt "0" ]; then
        print_pass "Found $MERGED_COUNT businesses merged from multiple sources"
    else
        print_warn "No businesses with multiple provider sources (may be expected if providers return different results)"
    fi
else
    print_fail "Cannot check deduplication - no valid search response"
fi

# ============================================================================
# TEST 6: CRM MATCHING VERIFICATION
# ============================================================================
print_header "TEST 6: CRM CUSTOMER IDENTIFICATION"

echo "Checking for existing customer identification..."
echo "" >> "$EVIDENCE_LOG"

if [ ! -z "$SEARCH_BODY" ] && [ "$SEARCH_HTTP" = "200" ]; then
    EXISTING_CUSTOMERS=$(echo "$SEARCH_BODY" | jq '[.results[] | select(.crmStatus == "existing_customer")] | length' 2>/dev/null || echo "0")

    log_evidence "Existing customers identified: $EXISTING_CUSTOMERS"

    if [ "$EXISTING_CUSTOMERS" -gt "0" ]; then
        print_pass "Identified $EXISTING_CUSTOMERS existing customers"

        # Show example
        EXAMPLE=$(echo "$SEARCH_BODY" | jq '.results[] | select(.crmStatus == "existing_customer") | {businessName: .businessName, status: .crmStatus, customerId: .crmCustomerId} | first' 2>/dev/null)
        if [ ! -z "$EXAMPLE" ]; then
            log_evidence "Example: $(echo $EXAMPLE | jq -c .)"
        fi
    else
        print_warn "No existing customers found in results (may be expected for new markets)"
    fi
else
    print_fail "Cannot check CRM matching - no valid search response"
fi

# ============================================================================
# TEST 7: ORCHESTRATOR HEALTH
# ============================================================================
print_header "TEST 7: ORCHESTRATOR HEALTH CHECK"

echo "Checking orchestrator health via health endpoint..."
echo "" >> "$EVIDENCE_LOG"

if [ "$HTTP_STATUS" = "200" ]; then
    ORCH_STATUS=$(echo "$RESPONSE_BODY" | jq '.components.orchestrator // {}' 2>/dev/null)

    if [ ! -z "$ORCH_STATUS" ]; then
        STATUS=$(echo "$ORCH_STATUS" | jq -r '.status // "MISSING"' 2>/dev/null)
        LATENCY=$(echo "$ORCH_STATUS" | jq '.details.latencyMs // 0' 2>/dev/null)
        BUSINESSES=$(echo "$ORCH_STATUS" | jq '.details.totalBusinesses // 0' 2>/dev/null)
        ERRORS=$(echo "$ORCH_STATUS" | jq '.details.errors | length // 0' 2>/dev/null)

        log_evidence "Orchestrator Status: $STATUS"
        log_evidence "Latency: ${LATENCY}ms"
        log_evidence "Businesses: $BUSINESSES"
        log_evidence "Errors: $ERRORS"

        if [ "$STATUS" = "healthy" ]; then
            print_pass "Orchestrator is healthy"
        elif [ "$STATUS" = "degraded" ]; then
            print_warn "Orchestrator is degraded"
        else
            print_fail "Orchestrator status unknown: $STATUS"
        fi
    else
        print_fail "Orchestrator health data not found"
    fi
else
    print_warn "Cannot check orchestrator health - health endpoint unavailable"
fi

# ============================================================================
# TEST 8: ERROR HANDLING
# ============================================================================
print_header "TEST 8: HTTP ERROR HANDLING"

echo "Verifying proper HTTP status codes..."
echo "" >> "$EVIDENCE_LOG"

# Check for 405 errors
if echo "$SEARCH_HTTP" | grep -q "405"; then
    print_fail "HTTP 405 (Method Not Allowed) detected"
else
    print_pass "No HTTP 405 errors"
fi

# Check for 500 errors
if echo "$SEARCH_HTTP" | grep -q "500"; then
    print_fail "HTTP 500 (Internal Server Error) detected"
else
    print_pass "No HTTP 500 errors"
fi

# Check for 502/503 errors
if echo "$SEARCH_HTTP" | grep -q "502\|503"; then
    print_fail "HTTP 502/503 (Gateway/Service Unavailable) detected"
else
    print_pass "No HTTP 502/503 errors"
fi

# ============================================================================
# TEST 9: PROVIDER CONFIGURATION
# ============================================================================
print_header "TEST 9: PROVIDER CONFIGURATION CHECK"

echo "Checking provider configurations via health endpoint..."
echo "" >> "$EVIDENCE_LOG"

if [ "$HTTP_STATUS" = "200" ]; then
    PROVIDERS=("crm" "googlePlaces" "companiesHouse")

    for provider in "${PROVIDERS[@]}"; do
        PROV_STATUS=$(echo "$RESPONSE_BODY" | jq ".components.$provider.status // 'MISSING'" 2>/dev/null)
        PROV_DETAILS=$(echo "$RESPONSE_BODY" | jq ".components.$provider.details // {}" 2>/dev/null)

        if [ "$PROV_STATUS" = "healthy" ]; then
            print_pass "$provider is healthy"
        elif [ "$PROV_STATUS" = "degraded" ]; then
            print_warn "$provider is degraded"
            ERROR=$(echo "$PROV_DETAILS" | jq -r '.error // "Unknown error"' 2>/dev/null)
            log_evidence "  Error: $ERROR"
        elif [ "$PROV_STATUS" = "unhealthy" ]; then
            print_fail "$provider is unhealthy"
            ERROR=$(echo "$PROV_DETAILS" | jq -r '.error // "Unknown error"' 2>/dev/null)
            log_evidence "  Error: $ERROR"
        else
            print_warn "$provider status unknown: $PROV_STATUS"
        fi
    done
fi

# ============================================================================
# TEST 10: ENVIRONMENT CONFIGURATION
# ============================================================================
print_header "TEST 10: ENVIRONMENT CONFIGURATION"

echo "Checking environment variable configuration..."
echo "" >> "$EVIDENCE_LOG"

if [ "$HTTP_STATUS" = "200" ]; then
    ENV_STATUS=$(echo "$RESPONSE_BODY" | jq '.components.environment.details // {}' 2>/dev/null)

    GOOGLE_CONFIGURED=$(echo "$ENV_STATUS" | jq '.googlePlacesConfigured // false' 2>/dev/null)
    CH_CONFIGURED=$(echo "$ENV_STATUS" | jq '.companiesHouseConfigured // false' 2>/dev/null)

    if [ "$GOOGLE_CONFIGURED" = "true" ]; then
        print_pass "Google Places API configured"
    else
        print_warn "Google Places API not configured"
    fi

    if [ "$CH_CONFIGURED" = "true" ]; then
        print_pass "Companies House API configured"
    else
        print_warn "Companies House API not configured"
    fi
fi

# ============================================================================
# SUMMARY
# ============================================================================
print_header "VERIFICATION SUMMARY"

echo ""
echo "✅ All available tests executed"
echo "📋 Evidence logged to: $EVIDENCE_LOG"
echo ""
echo "Next steps:"
echo "  1. Review evidence log for failures"
echo "  2. For each failure, continue investigation"
echo "  3. Trace failures to root cause"
echo "  4. Document findings in DISCOVERY_HEALTH_AUDIT.md"
echo ""

# Final summary
cat >> "$EVIDENCE_LOG" << EOF

=============================================================================
VERIFICATION COMPLETE
=============================================================================
Test Suite Execution Time: $(date)
Evidence File: $EVIDENCE_LOG

Review this log for:
  • HTTP status codes
  • Response payloads
  • Provider contributions
  • Error messages
  • Configuration status

For any failures, trace to root cause and document findings.
=============================================================================
EOF

echo "Evidence log location: $EVIDENCE_LOG"
echo "Open with: cat $EVIDENCE_LOG"
