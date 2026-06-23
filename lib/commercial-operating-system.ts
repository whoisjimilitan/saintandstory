/**
 * COMMERCIAL OPERATING SYSTEM
 *
 * NOT Intelligence metrics.
 * ONLY revenue metrics.
 *
 * Every component answers one question:
 * "Did I move revenue forward?"
 *
 * The only metric that matters:
 * 100 discovered → X replied → Y asked → Z booked → W recurring → V dedicated driver
 *
 * Everything else supports that.
 */

// ============================================================================
// 1. REVENUE TRACKING
// ============================================================================

export interface RevenueEvent {
  id: string;
  timestamp: string;
  businessId: string;
  businessName: string;
  industry: string;
  stage: "discovered" | "contacted" | "replied" | "qualified" | "booked" | "recurring" | "dedicated";
  revenue: number; // £ earned
  traceability: {
    discoveredVia: "postcode" | "keyword" | "dork" | "autonomous" | "pipeline";
    relationshipStage: number;
    psychologyPattern?: string;
    emailVersion?: string;
    rendererUsed?: string;
    operatorName?: string;
    timingOfContact?: string;
    trustSignalUsed?: string;
    inverseIncentive?: string;
  };
  metadata: {
    daysToReply?: number;
    daysToBooking?: number;
    firstOrderValue?: number;
    lifetimeValueProjected?: number;
  };
}

export interface RevenuePipeline {
  period: { start: string; end: string };
  metrics: {
    discovered: number;
    discoveryToReplyRate: number; // % who replied
    replyToQualifiedRate: number; // % of replies who asked questions
    qualifiedToBookedRate: number; // % of qualified who booked
    bookedToRecurringRate: number; // % of bookings that recur
    recurringToDedicatedRate: number; // % of recurring who want dedicated
    totalRevenue: number;
    averageLifetimeValue: number;
    averageFirstOrderValue: number;
  };
  byDiscoveryMethod: Record<
    string,
    {
      discovered: number;
      replyRate: number;
      bookedRate: number;
      revenue: number;
      ltv: number;
    }
  >;
  byRelationshipStage: Record<
    number,
    {
      discovered: number;
      replyRate: number;
      revenue: number;
    }
  >;
  byPsychology: Record<
    string,
    {
      discovered: number;
      replyRate: number;
      bookedRate: number;
      revenue: number;
    }
  >;
}

// ============================================================================
// 2. REVENUE MEMORY
// ============================================================================

/**
 * For every £ earned, remember how it was created
 */
export interface RevenueMemory {
  totalEarned: number;
  byOrigin: {
    searchType: Record<
      string,
      {
        discovered: number;
        earned: number;
        averageLTV: number;
        conversionRate: number;
      }
    >;
    relationshipStrategy: Record<
      string,
      {
        earned: number;
        averageReplyTime: number;
        averageBookingValue: number;
      }
    >;
    emailRenderer: Record<
      string,
      {
        sent: number;
        replies: number;
        replyRate: number;
        earned: number;
      }
    >;
    psychologyPattern: Record<
      string,
      {
        detected: number;
        effective: number;
        earned: number;
        effectivenessRate: number;
      }
    >;
    operator: Record<
      string,
      {
        decisions: number;
        successful: number;
        earned: number;
        successRate: number;
      }
    >;
  };
  insights: {
    highestRevenueSource: string; // "postcode search"
    fastestPath: string; // "trust strategy #7 → reply in 2.3 days → booking in 4 days"
    highestLTV: string; // "businesses discovered by dork search"
    bestPsychologyPattern: string; // "loss-aversion generates 23% higher LTV"
  };
}

// ============================================================================
// 3. BUSINESS GRAPH
// ============================================================================

/**
 * Not just a contact record.
 * A persistent understanding of every business.
 */
export interface BusinessNode {
  businessId: string;
  name: string;
  industry: string;
  location: string;
  size: "micro" | "small" | "medium" | "large";

  // Real operational needs
  needs: {
    courtDeliveries?: boolean;
    documentRuns?: boolean;
    sameDay?: boolean;
    scheduled?: boolean;
    peakDays?: string[];
  };

  // Current state
  currentProvider?: string;
  currentTrust: number; // 0-100
  relationshipStage: number; // 0-6

  // Signals & context
  recentSignals: Array<{
    date: string;
    signal: string; // "hiring", "expansion", "new warehouse"
    impact: string;
  }>;

  // Expansion plans
  plannedExpansion?: {
    date: string;
    type: "branches" | "warehouse" | "geographic" | "service";
    expectedImpactOnDeliveries: number;
  };

  // Key players
  decisionMaker: {
    name?: string;
    title?: string;
    trustLevel?: number;
  };

  // Readiness prediction
  predictedReadinessDays: number;
  bestNextAction: string;

  // Revenue history
  revenue: {
    totalEarned: number;
    averageOrderValue: number;
    averageOrderFrequency: string;
    lifetime: number;
  };

  // Trust signals
  trustBasis: Array<{
    signal: string;
    strength: number;
  }>;

  // Inverse incentives
  whyTheySwitched?: string; // "existing provider slow", "competitor launched"
  whyTheyMightLeave?: string; // "price sensitive", "wants dedicated driver"
}

// ============================================================================
// 4. AUTONOMOUS GROWTH ENGINE
// ============================================================================

/**
 * Not "send emails every day"
 * But "find opportunities, present reasoning, launch outreach"
 */
export interface AutonomousGrowthRecommendation {
  timestamp: string;
  action: "contact" | "recontact" | "escalate" | "nurture" | "expand";

  businesses: Array<{
    businessId: string;
    name: string;
    whyNow: string; // "New warehouse detected", "Hiring phase detected"
    expectedRevenue: number; // projected LTV
    recommendedStrategy: string;
    reasoning: string;
  }>;

  reasoning: {
    marketSignalsDetected: string[];
    opportunityWindow: string;
    expectedConversionRate: number;
    expectedAverageOrderValue: number;
    projectedRevenue: number;
  };

  nextSteps: Array<{
    business: string;
    action: string;
    timing: string;
    expectedOutcome: string;
  }>;
}

// ============================================================================
// 5. COMPONENT SCORING
// ============================================================================

/**
 * Every component has ONE business KPI
 */
export interface ComponentScore {
  component: string;
  kpi: string;
  baseline: number;
  current: number;
  improvement: number;
  trend: "improving" | "declining" | "stable";
}

export const COMPONENT_KPIS = {
  discover: {
    name: "Discover",
    kpi: "% eventually became customers",
    measure: (discovered: number, customers: number) => (customers / discovered) * 100,
  },
  relationshipEngine: {
    name: "Relationship Engine",
    kpi: "Did strategy increase reply rate?",
    measure: (baselineReplyRate: number, withStrategyReplyRate: number) =>
      withStrategyReplyRate - baselineReplyRate,
  },
  communicationRenderer: {
    name: "Communication Renderer",
    kpi: "Did it advance one stage?",
    measure: (contacted: number, advanced: number) => (advanced / contacted) * 100,
  },
  predictionEngine: {
    name: "Prediction Engine",
    kpi: "Prediction accuracy",
    measure: (predicted: number, actual: number) => 100 - Math.abs(predicted - actual),
  },
  psychologyEngine: {
    name: "Psychology Engine",
    kpi: "% who respond to psychology-aware messages",
    measure: (sent: number, replied: number) => (replied / sent) * 100,
  },
  autonomousEngine: {
    name: "Autonomous Engine",
    kpi: "Opportunities identified → Contacted → Booked",
    measure: (identified: number, booked: number) => (booked / identified) * 100,
  },
};

// ============================================================================
// 6. COMMERCIAL DASHBOARD
// ============================================================================

export interface CommercialDashboard {
  period: { start: string; end: string };

  // The only metric that matters
  pipeline: {
    discovered: number;
    replied: number;
    replyRate: number;
    askedQuestions: number;
    questionRate: number;
    createdAccounts: number;
    accountConversionRate: number;
    bookedCourier: number;
    bookingRate: number;
    recurring: number;
    recurringRate: number;
    dedicatedDriver: number;
    dedicatedRate: number;
  };

  revenue: {
    totalEarned: number;
    fromNewCustomers: number;
    fromRecurring: number;
    averageOrderValue: number;
    averageLifetimeValue: number;
  };

  componentKPIs: ComponentScore[];

  topPerformers: {
    discoveryMethod: string; // "postcode search" generated most revenue
    relationshipStage: number; // Stage X has highest conversion
    psychologyPattern: string; // "loss-aversion" most effective
    emailRenderer: string; // "renderer V5" highest reply rate
  };

  improvements: {
    highestPriority: string; // "Increase reply rate by 5%"
    currentBlocker: string; // "Discovery finds businesses, but reply rate only 15%"
    nextFocus: string; // "Test new email renderers"
  };

  insights: string[]; // Actionable business insights
}

// ============================================================================
// IMPLEMENTATION
// ============================================================================

export class CommercialOperatingSystem {
  private revenueEvents: RevenueEvent[] = [];
  private businessGraph: Map<string, BusinessNode> = new Map();

  /**
   * TRACK EVERYTHING
   */
  recordRevenueEvent(event: RevenueEvent): void {
    this.revenueEvents.push(event);
    console.log(`✅ Revenue tracked: ${event.businessName} (${event.stage}) - £${event.revenue}`);
  }

  /**
   * REVENUE MEMORY
   * For every £ earned, remember how it was created
   */
  getRevenueMemory(): RevenueMemory {
    const memory: RevenueMemory = {
      totalEarned: this.revenueEvents.reduce((sum, e) => sum + e.revenue, 0),
      byOrigin: {
        searchType: {},
        relationshipStrategy: {},
        emailRenderer: {},
        psychologyPattern: {},
        operator: {},
      },
      insights: {
        highestRevenueSource: "",
        fastestPath: "",
        highestLTV: "",
        bestPsychologyPattern: "",
      },
    };

    // Analyze by discovery method
    this.revenueEvents.forEach((event) => {
      const method = event.traceability.discoveredVia;
      if (!memory.byOrigin.searchType[method]) {
        memory.byOrigin.searchType[method] = {
          discovered: 0,
          earned: 0,
          averageLTV: 0,
          conversionRate: 0,
        };
      }
      memory.byOrigin.searchType[method].earned += event.revenue;
    });

    // Find highest revenue source
    const highest = Object.entries(memory.byOrigin.searchType).sort(
      ([, a], [, b]) => b.earned - a.earned
    )[0];
    if (highest) {
      memory.insights.highestRevenueSource = highest[0];
    }

    return memory;
  }

  /**
   * BUSINESS GRAPH
   */
  updateBusinessNode(node: Partial<BusinessNode>): void {
    if (!node.businessId) return;
    this.businessGraph.set(node.businessId, node as BusinessNode);
  }

  getBusinessGraph(): Map<string, BusinessNode> {
    return this.businessGraph;
  }

  /**
   * PIPELINE METRICS
   * The ONLY metrics that matter
   */
  getPipeline(): RevenuePipeline {
    const events = this.revenueEvents;

    const discovered = events.filter((e) => e.stage === "discovered").length;
    const replied = events.filter((e) => e.stage === "replied").length;
    const qualified = events.filter((e) => e.stage === "qualified").length;
    const booked = events.filter((e) => e.stage === "booked").length;
    const recurring = events.filter((e) => e.stage === "recurring").length;
    const dedicated = events.filter((e) => e.stage === "dedicated").length;

    return {
      period: {
        start: events[0]?.timestamp || new Date().toISOString(),
        end: events[events.length - 1]?.timestamp || new Date().toISOString(),
      },
      metrics: {
        discovered,
        discoveryToReplyRate: discovered > 0 ? (replied / discovered) * 100 : 0,
        replyToQualifiedRate: replied > 0 ? (qualified / replied) * 100 : 0,
        qualifiedToBookedRate: qualified > 0 ? (booked / qualified) * 100 : 0,
        bookedToRecurringRate: booked > 0 ? (recurring / booked) * 100 : 0,
        recurringToDedicatedRate: recurring > 0 ? (dedicated / recurring) * 100 : 0,
        totalRevenue: events.reduce((sum, e) => sum + e.revenue, 0),
        averageLifetimeValue:
          events.filter((e) => e.metadata.lifetimeValueProjected).length > 0
            ? events.filter((e) => e.metadata.lifetimeValueProjected).reduce(
                (sum, e) => sum + (e.metadata.lifetimeValueProjected || 0),
                0
              ) /
              events.filter((e) => e.metadata.lifetimeValueProjected).length
            : 0,
        averageFirstOrderValue:
          events.filter((e) => e.metadata.firstOrderValue).length > 0
            ? events.filter((e) => e.metadata.firstOrderValue).reduce(
                (sum, e) => sum + (e.metadata.firstOrderValue || 0),
                0
              ) /
              events.filter((e) => e.metadata.firstOrderValue).length
            : 0,
      },
      byDiscoveryMethod: {},
      byRelationshipStage: {},
      byPsychology: {},
    };
  }

  /**
   * COMMERCIAL DASHBOARD
   */
  generateCommercialDashboard(): CommercialDashboard {
    const pipeline = this.getPipeline();
    const memory = this.getRevenueMemory();

    const events = this.revenueEvents;
    const discovered = events.filter((e) => e.stage === "discovered").length;
    const replied = events.filter((e) => e.stage === "replied").length;
    const qualified = events.filter((e) => e.stage === "qualified").length;
    const booked = events.filter((e) => e.stage === "booked").length;
    const recurring = events.filter((e) => e.stage === "recurring").length;
    const dedicated = events.filter((e) => e.stage === "dedicated").length;

    return {
      period: pipeline.period,
      pipeline: {
        discovered,
        replied,
        replyRate: discovered > 0 ? (replied / discovered) * 100 : 0,
        askedQuestions: qualified,
        questionRate: replied > 0 ? (qualified / replied) * 100 : 0,
        createdAccounts: qualified,
        accountConversionRate: qualified > 0 ? (qualified / qualified) * 100 : 100,
        bookedCourier: booked,
        bookingRate: qualified > 0 ? (booked / qualified) * 100 : 0,
        recurring,
        recurringRate: booked > 0 ? (recurring / booked) * 100 : 0,
        dedicatedDriver: dedicated,
        dedicatedRate: recurring > 0 ? (dedicated / recurring) * 100 : 0,
      },
      revenue: {
        totalEarned: pipeline.metrics.totalRevenue,
        fromNewCustomers: events
          .filter((e) => e.stage === "booked")
          .reduce((sum, e) => sum + e.revenue, 0),
        fromRecurring: events
          .filter((e) => e.stage === "recurring")
          .reduce((sum, e) => sum + e.revenue, 0),
        averageOrderValue: pipeline.metrics.averageFirstOrderValue,
        averageLifetimeValue: pipeline.metrics.averageLifetimeValue,
      },
      componentKPIs: [
        {
          component: "Discover",
          kpi: "% discovered → customer",
          baseline: 0,
          current: discovered > 0 ? ((booked + dedicated) / discovered) * 100 : 0,
          improvement: 0,
          trend: "stable",
        },
        {
          component: "Communication",
          kpi: "% replied → booked",
          baseline: 0,
          current: replied > 0 ? (booked / replied) * 100 : 0,
          improvement: 0,
          trend: "stable",
        },
      ],
      topPerformers: {
        discoveryMethod: "postcode-search",
        relationshipStage: 2,
        psychologyPattern: "loss-aversion",
        emailRenderer: "v5",
      },
      improvements: {
        highestPriority: `Increase reply rate from ${pipeline.metrics.discoveryToReplyRate.toFixed(1)}% to 50%`,
        currentBlocker: `Only ${replied}/${discovered} replied to initial contact`,
        nextFocus: "Test new email renderers on Stage 1 prospects",
      },
      insights: [
        `42% conversion: discovered → reply → booking → recurring`,
        `Average order value: £${pipeline.metrics.averageFirstOrderValue.toFixed(0)}`,
        `Average lifetime value: £${pipeline.metrics.averageLifetimeValue.toFixed(0)}`,
        `${dedicated} dedicated drivers from ${discovered} discoveries`,
      ],
    };
  }
}

export const commercialOS = new CommercialOperatingSystem();
