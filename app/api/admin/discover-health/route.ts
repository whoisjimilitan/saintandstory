/**
 * Discover System Health Dashboard
 * Admin-only endpoint for system diagnostics
 * Real-time verification of all components
 */

import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { DiscoverOrchestrator } from "@/lib/discover/orchestrator";
import { CRMProvider } from "@/lib/discover/providers/crm";
import { GooglePlacesProvider } from "@/lib/discover/providers/google-places";
import { CompaniesHouseProvider } from "@/lib/discover/providers/companies-house";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  lastCheck: Date;
  details: Record<string, any>;
}

async function checkDatabaseHealth(): Promise<HealthStatus> {
  const startTime = Date.now();
  try {
    // Test database connectivity
    const count = await prisma.b2bLead.count();
    const latency = Date.now() - startTime;

    return {
      status: "healthy",
      lastCheck: new Date(),
      details: {
        connected: true,
        latencyMs: latency,
        leadCount: count,
        message: "Database connected and responsive",
      },
    };
  } catch (error) {
    return {
      status: "unhealthy",
      lastCheck: new Date(),
      details: {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Database connection failed",
      },
    };
  }
}

async function checkCRMProvider(): Promise<HealthStatus> {
  const startTime = Date.now();
  try {
    const provider = new CRMProvider();
    const result = await provider.search({ postcode: "M1", limit: 1 });
    const latency = Date.now() - startTime;

    if (result.error) {
      return {
        status: "degraded",
        lastCheck: new Date(),
        details: {
          latencyMs: latency,
          error: result.error.message,
          message: "CRM provider returned error",
        },
      };
    }

    return {
      status: "healthy",
      lastCheck: new Date(),
      details: {
        latencyMs: latency,
        businessesFound: result.businesses.length,
        totalAvailable: result.totalAvailable,
        message: "CRM provider operational",
      },
    };
  } catch (error) {
    return {
      status: "unhealthy",
      lastCheck: new Date(),
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
        message: "CRM provider execution failed",
      },
    };
  }
}

async function checkGooglePlacesProvider(): Promise<HealthStatus> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return {
      status: "unhealthy",
      lastCheck: new Date(),
      details: {
        apiKeyPresent: false,
        message: "GOOGLE_MAPS_API_KEY not configured",
      },
    };
  }

  const startTime = Date.now();
  try {
    const provider = new GooglePlacesProvider(apiKey);
    const result = await provider.search({ keyword: "restaurant", limit: 1 });
    const latency = Date.now() - startTime;

    if (result.error) {
      return {
        status: "degraded",
        lastCheck: new Date(),
        details: {
          apiKeyPresent: true,
          latencyMs: latency,
          error: result.error.message,
          message: "Google Places API returned error",
        },
      };
    }

    return {
      status: "healthy",
      lastCheck: new Date(),
      details: {
        apiKeyPresent: true,
        latencyMs: latency,
        businessesFound: result.businesses.length,
        totalAvailable: result.totalAvailable,
        message: "Google Places provider operational",
      },
    };
  } catch (error) {
    return {
      status: "unhealthy",
      lastCheck: new Date(),
      details: {
        apiKeyPresent: true,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Google Places provider execution failed",
      },
    };
  }
}

async function checkCompaniesHouseProvider(): Promise<HealthStatus> {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;

  if (!apiKey) {
    return {
      status: "unhealthy",
      lastCheck: new Date(),
      details: {
        apiKeyPresent: false,
        message: "COMPANIES_HOUSE_API_KEY not configured",
      },
    };
  }

  const startTime = Date.now();
  try {
    const provider = new CompaniesHouseProvider(apiKey);
    const result = await provider.search({ keyword: "limited", limit: 1 });
    const latency = Date.now() - startTime;

    if (result.error) {
      return {
        status: "degraded",
        lastCheck: new Date(),
        details: {
          apiKeyPresent: true,
          latencyMs: latency,
          error: result.error.message,
          message: "Companies House API returned error",
        },
      };
    }

    return {
      status: "healthy",
      lastCheck: new Date(),
      details: {
        apiKeyPresent: true,
        latencyMs: latency,
        businessesFound: result.businesses.length,
        totalAvailable: result.totalAvailable,
        message: "Companies House provider operational",
      },
    };
  } catch (error) {
    return {
      status: "unhealthy",
      lastCheck: new Date(),
      details: {
        apiKeyPresent: true,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Companies House provider execution failed",
      },
    };
  }
}

async function checkOrchestratorPipeline(): Promise<HealthStatus> {
  const startTime = Date.now();
  try {
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    const companiesHouseKey = process.env.COMPANIES_HOUSE_API_KEY;

    const providers = [
      new CRMProvider(),
      ...(googleApiKey ? [new GooglePlacesProvider(googleApiKey)] : []),
      ...(companiesHouseKey ? [new CompaniesHouseProvider(companiesHouseKey)] : []),
    ];

    const orchestrator = new DiscoverOrchestrator(providers);
    const result = await orchestrator.search({
      keyword: "restaurant",
      limit: 10,
    });

    const latency = Date.now() - startTime;

    // Check deduplication
    const businessNames = result.businesses.map((b) => b.businessName);
    const uniqueNames = new Set(businessNames);
    const duplicates = businessNames.length - uniqueNames.size;

    // Check source attribution
    const allBusinessesHaveSources = result.businesses.every(
      (b) => b.sources && b.sources.length > 0
    );

    return {
      status:
        result.errors.length > 0 ? "degraded" : "healthy",
      lastCheck: new Date(),
      details: {
        latencyMs: latency,
        totalBusinesses: result.businesses.length,
        duplicatesRemoved: duplicates,
        allHaveSourceAttribution: allBusinessesHaveSources,
        providerContributions: result.sources,
        errors: result.errors.length > 0 ? result.errors : [],
        message:
          result.errors.length > 0
            ? `Orchestrator working with ${result.errors.length} provider errors`
            : "Orchestrator pipeline healthy",
      },
    };
  } catch (error) {
    return {
      status: "unhealthy",
      lastCheck: new Date(),
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Orchestrator pipeline failed",
      },
    };
  }
}

async function checkEnvironmentVariables(): Promise<HealthStatus> {
  const missingVars = [];
  const presentVars = [];

  const requiredVars = [
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
  ];
  const optionalVars = ["GOOGLE_MAPS_API_KEY", "COMPANIES_HOUSE_API_KEY"];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    } else {
      presentVars.push(varName);
    }
  }

  for (const varName of optionalVars) {
    if (process.env[varName]) {
      presentVars.push(varName);
    }
  }

  const status = missingVars.length > 0 ? "unhealthy" : "healthy";

  return {
    status: status as "healthy" | "unhealthy",
    lastCheck: new Date(),
    details: {
      missingRequired: missingVars,
      presentVars,
      googlePlacesConfigured: !!process.env.GOOGLE_MAPS_API_KEY,
      companiesHouseConfigured: !!process.env.COMPANIES_HOUSE_API_KEY,
    },
  };
}

export async function GET(request: Request) {
  try {
    // Auth check
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !ADMIN_EMAILS.includes(user?.emailAddresses[0]?.emailAddress ?? "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[DISCOVER-HEALTH] Running system health check");

    // Run all checks in parallel
    const [
      databaseHealth,
      crmHealth,
      googleHealth,
      companiesHouseHealth,
      orchestratorHealth,
      envHealth,
    ] = await Promise.all([
      checkDatabaseHealth(),
      checkCRMProvider(),
      checkGooglePlacesProvider(),
      checkCompaniesHouseProvider(),
      checkOrchestratorPipeline(),
      checkEnvironmentVariables(),
    ]);

    // Determine overall status
    const allStatuses = [
      databaseHealth.status,
      crmHealth.status,
      orchestratorHealth.status,
      envHealth.status,
    ];
    const overallStatus = allStatuses.includes("unhealthy")
      ? "unhealthy"
      : allStatuses.includes("degraded")
        ? "degraded"
        : "healthy";

    const report = {
      overallStatus,
      timestamp: new Date(),
      components: {
        database: databaseHealth,
        crm: crmHealth,
        googlePlaces: googleHealth,
        companiesHouse: companiesHouseHealth,
        orchestrator: orchestratorHealth,
        environment: envHealth,
      },
      summary: {
        timestamp: new Date().toISOString(),
        status: overallStatus,
        message:
          overallStatus === "healthy"
            ? "All systems operational"
            : overallStatus === "degraded"
              ? "System operational with degraded providers"
              : "Critical system issues detected",
      },
    };

    console.log("[DISCOVER-HEALTH] Health check complete:", overallStatus);

    return NextResponse.json(report);
  } catch (error) {
    console.error("[DISCOVER-HEALTH] Health check failed:", error);
    return NextResponse.json(
      {
        overallStatus: "unhealthy",
        timestamp: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Health check execution failed",
      },
      { status: 500 }
    );
  }
}
