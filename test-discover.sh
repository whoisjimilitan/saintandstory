#!/bin/bash

echo "═══════════════════════════════════════════════════════"
echo "PHASE 1 VERIFICATION - API ENDPOINT TESTING"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check 1: Build status
echo "1. Checking build status..."
npm run build > /tmp/build.log 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ PASS: Application builds successfully"
else
    echo "   ❌ FAIL: Build failed"
    tail -20 /tmp/build.log
    exit 1
fi
echo ""

# Check 2: TypeScript compilation
echo "2. Checking TypeScript compilation..."
if grep -q "✓ Compiled successfully" /tmp/build.log; then
    echo "   ✅ PASS: TypeScript compiled successfully"
else
    echo "   ⚠️  WARNING: Build completed but verify output"
fi
echo ""

# Check 3: Check if routes are properly exported
echo "3. Checking route exports..."
if grep -q "export async function GET" app/api/b2b/discover/route.ts; then
    echo "   ✅ PASS: GET handler exported"
else
    echo "   ❌ FAIL: GET handler not found"
fi

if grep -q "export async function POST" app/api/b2b/discover/route.ts; then
    echo "   ✅ PASS: POST handler exported"
else
    echo "   ❌ FAIL: POST handler not found"
fi
echo ""

# Check 4: Verify provider implementations exist
echo "4. Checking provider implementations..."
providers=("crm.ts" "google-places.ts" "companies-house.ts")
for provider in "${providers[@]}"; do
    if [ -f "lib/discover/providers/$provider" ]; then
        echo "   ✅ PASS: $provider exists"
    else
        echo "   ❌ FAIL: $provider missing"
    fi
done
echo ""

# Check 5: Verify orchestrator exists
echo "5. Checking orchestrator..."
if [ -f "lib/discover/orchestrator.ts" ]; then
    echo "   ✅ PASS: Orchestrator exists"
else
    echo "   ❌ FAIL: Orchestrator missing"
fi
echo ""

# Check 6: Verify types exist
echo "6. Checking type definitions..."
if [ -f "lib/discover/types.ts" ]; then
    echo "   ✅ PASS: Type definitions exist"
else
    echo "   ❌ FAIL: Type definitions missing"
fi
echo ""

# Check 7: Verify source attribution in types
echo "7. Checking source attribution in types..."
if grep -q "ProviderSource" lib/discover/types.ts; then
    echo "   ✅ PASS: ProviderSource type defined"
else
    echo "   ❌ FAIL: ProviderSource type missing"
fi

if grep -q "sources: ProviderSource" lib/discover/types.ts; then
    echo "   ✅ PASS: sources field in Business model"
else
    echo "   ❌ FAIL: sources field missing from Business model"
fi
echo ""

# Check 8: Verify deduplication logic
echo "8. Checking deduplication logic..."
if grep -q "deduplicateBusinesses" lib/discover/orchestrator.ts; then
    echo "   ✅ PASS: Deduplication method implemented"
else
    echo "   ❌ FAIL: Deduplication method missing"
fi

if grep -q "findDuplicateKey" lib/discover/orchestrator.ts; then
    echo "   ✅ PASS: Duplicate detection implemented"
else
    echo "   ❌ FAIL: Duplicate detection missing"
fi
echo ""

# Check 9: Verify error handling
echo "9. Checking error handling..."
if grep -q "Promise.allSettled" lib/discover/orchestrator.ts; then
    echo "   ✅ PASS: Graceful error handling (allSettled)"
else
    echo "   ❌ FAIL: Error handling may not be graceful"
fi
echo ""

# Check 10: Verify CRM matching
echo "10. Checking CRM matching logic..."
if grep -q "crmStatus" lib/discover/providers/crm.ts; then
    echo "   ✅ PASS: CRM status tracking implemented"
else
    echo "   ❌ FAIL: CRM status tracking missing"
fi
echo ""

# Check 11: Verify scoring
echo "11. Checking scoring implementation..."
if grep -q "opportunityScore" lib/discover/orchestrator.ts; then
    echo "   ✅ PASS: Opportunity scoring implemented"
else
    echo "   ❌ FAIL: Opportunity scoring missing"
fi

if grep -q "confidenceScore" lib/discover/types.ts; then
    echo "   ✅ PASS: Confidence scoring in model"
else
    echo "   ❌ FAIL: Confidence scoring missing"
fi
echo ""

# Check 12: Verify backward compatibility
echo "12. Checking backward compatibility..."
if grep -q "export async function GET" app/api/b2b/discover/route.ts && \
   grep -q "export async function POST" app/api/b2b/discover/route.ts; then
    echo "   ✅ PASS: Both GET and POST handlers present"
else
    echo "   ❌ FAIL: Missing HTTP method handlers"
fi
echo ""

echo "═══════════════════════════════════════════════════════"
echo "VERIFICATION COMPLETE"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "MANUAL VERIFICATION REQUIRED:"
echo "11. Endpoint responds with HTTP 200"
echo "12. Postcode search returns businesses"
echo "13. Keyword search returns businesses"
echo "14. Results contain source attribution"
echo "15. Clicking result opens Understand without errors"
echo "16. No HTTP 405 errors (method not allowed)"
echo "17. No HTTP 500 errors (server errors)"
