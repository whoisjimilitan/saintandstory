#!/bin/bash

###############################################################################
# VERCEL DEPLOYMENT MONITOR
# Monitors for production deployment completion
# Once complete, triggers production verification
###############################################################################

PROD_URL="https://saintandstory.vercel.app"
MAX_ATTEMPTS=60  # Check for 30 minutes (60 * 30 seconds)
ATTEMPT=0
DEPLOYED=false

echo "====================================================================="
echo "VERCEL DEPLOYMENT MONITOR"
echo "====================================================================="
echo "Monitoring: $PROD_URL"
echo "Max wait time: $(( MAX_ATTEMPTS * 30 / 60 )) minutes"
echo "====================================================================="
echo ""

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))
    CURRENT_TIME=$(date '+%Y-%m-%d %H:%M:%S')

    # Test if health endpoint exists (200 status means deployment complete)
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/api/admin/discover-health" 2>/dev/null)

    echo "[$CURRENT_TIME] Attempt $ATTEMPT/$MAX_ATTEMPTS - Health endpoint: HTTP $HTTP_STATUS"

    if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "401" ]; then
        # 200 = authenticated
        # 401 = unauthenticated but endpoint exists
        # Either means deployment is complete
        echo ""
        echo "✅ DEPLOYMENT DETECTED!"
        echo "Production now has latest code"
        echo ""
        DEPLOYED=true
        break
    elif [ "$HTTP_STATUS" = "404" ]; then
        # 404 means health endpoint doesn't exist yet
        # Deployment in progress
        :
    else
        echo "  (Unexpected status, retrying...)"
    fi

    # Wait 30 seconds before next check
    if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
        sleep 30
    fi
done

echo ""
if [ "$DEPLOYED" = true ]; then
    echo "====================================================================="
    echo "✅ DEPLOYMENT COMPLETE - READY FOR VERIFICATION"
    echo "====================================================================="
    echo ""
    echo "Next step: Run production verification"
    echo ""
    echo "  ./PRODUCTION_VERIFICATION_SUITE.sh <bearer_token> [search_term]"
    echo ""
    echo "Example:"
    echo "  export CLERK_TOKEN=\"your_clerk_bearer_token\""
    echo "  ./PRODUCTION_VERIFICATION_SUITE.sh \$CLERK_TOKEN restaurant"
    echo ""
else
    echo "====================================================================="
    echo "❌ DEPLOYMENT TIMEOUT"
    echo "====================================================================="
    echo ""
    echo "Deployment did not complete within $(( MAX_ATTEMPTS * 30 / 60 )) minutes"
    echo "Check Vercel dashboard for status:"
    echo "  https://vercel.com/whoisjimilitan/saintandstory/deployments"
    echo ""
fi
