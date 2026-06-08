import { NextRequest, NextResponse } from "next/server";

interface ConversationPhase {
  phaseNumber: number;
  phaseName: string;
  frame: string;
  content: string;
  characterCount: number;
  charLimit: number;
}

interface ValidationViolation {
  code: string;
  message: string;
}

interface ValidationResult {
  passed: boolean;
  violations: ValidationViolation[];
  violationCount: number;
}

interface ConversationResponse {
  success: boolean;
  metadata: {
    industry: string;
    company: string;
    city: string;
  };
  conversation: {
    phases: ConversationPhase[];
    totalCharacterCount: number;
  };
  validation: ValidationResult;
}

// Hard-locked conversation templates (immutable per Tier 2 Step 4)
const CONVERSATION_TEMPLATES = {
  openingContinuityAcknowledgement: (industry: string, company: string) =>
    `Thanks for connecting. I saw you received our tracking on ${industry.toLowerCase()} operations. Before we dive into how this applies to ${company}, I wanted to confirm we're looking at the same operational friction points.`,

  operationalContextConfirmation: (industry: string) =>
    `From what we've seen across similar operations, the coordination friction typically surfaces in three places: same-day delivery scheduling, manual tracking across systems, and deadline coordination overhead. That pattern consistent with what you're managing?`,

  continuityDeepening: (company: string) =>
    `When operations are owned rather than brokered, the coordination becomes a competitive asset instead of a cost center. For ${company}, that would mean structured visibility across daily coordination. Right now, that visibility lives in emails, phone calls, and manual tracking — distributed instead of consolidated.`,

  decisionFraming: () =>
    `This is the point where we'd typically outline what ownership looks like in practice. It's a straightforward operational restructure — no technology replacement, just consolidation and visibility. Sound like something worth mapping out?`,

  nextStepAlignment: (company: string) =>
    `Let's schedule a brief walkthrough of your workflow so we can map where the ownership consolidation would have the highest impact. I'll send over a simple template you can review beforehand.`,
};

// Format industry name (slug to title case)
function formatIndustryName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Generate conversation phases according to hard-locked schema
function generateConversationPhases(
  industry: string,
  company: string,
  city: string
): ConversationPhase[] {
  const industryName = formatIndustryName(industry);

  return [
    {
      phaseNumber: 1,
      phaseName: "Opening Continuity Acknowledgement",
      frame: "continuation_not_introduction",
      content: CONVERSATION_TEMPLATES.openingContinuityAcknowledgement(
        industryName,
        company
      ),
      characterCount:
        CONVERSATION_TEMPLATES.openingContinuityAcknowledgement(
          industryName,
          company
        ).length,
      charLimit: 400,
    },
    {
      phaseNumber: 2,
      phaseName: "Operational Context Confirmation",
      frame: "confirm_existing_reality",
      content: CONVERSATION_TEMPLATES.operationalContextConfirmation(
        industryName
      ),
      characterCount:
        CONVERSATION_TEMPLATES.operationalContextConfirmation(industryName)
          .length,
      charLimit: 500,
    },
    {
      phaseNumber: 3,
      phaseName: "Continuity Deepening",
      frame: "expand_known_pattern_only",
      content: CONVERSATION_TEMPLATES.continuityDeepening(company),
      characterCount: CONVERSATION_TEMPLATES.continuityDeepening(company)
        .length,
      charLimit: 600,
    },
    {
      phaseNumber: 4,
      phaseName: "Decision Framing",
      frame: "deferred_inevitability_decision",
      content: CONVERSATION_TEMPLATES.decisionFraming(),
      characterCount: CONVERSATION_TEMPLATES.decisionFraming().length,
      charLimit: 400,
    },
    {
      phaseNumber: 5,
      phaseName: "Next Step Alignment",
      frame: "single_path_forward",
      content: CONVERSATION_TEMPLATES.nextStepAlignment(company),
      characterCount: CONVERSATION_TEMPLATES.nextStepAlignment(company).length,
      charLimit: 300,
    },
  ];
}

// Validate conversation phases against hard-locked schema
function validateConversationPhases(phases: ConversationPhase[]): ValidationResult {
  const violations: ValidationViolation[] = [];

  // Check phase count
  if (phases.length !== 5) {
    violations.push({
      code: "PHASE_COUNT_MISMATCH",
      message: `Expected 5 phases, got ${phases.length}`,
    });
  }

  // Validate each phase
  phases.forEach((phase) => {
    // Check character limits
    if (phase.characterCount > phase.charLimit) {
      violations.push({
        code: "PHASE_EXCEEDS_CHAR_LIMIT",
        message: `Phase ${phase.phaseNumber} (${phase.phaseName}) exceeds ${phase.charLimit} chars: ${phase.characterCount}`,
      });
    }

    // Check for rhetorical questions (except phase 2 which uses confirmation format)
    if (phase.phaseNumber !== 2 && /\?/.test(phase.content)) {
      // Phase 2 can have questions, others should not
      if (phase.phaseNumber !== 4) {
        // Phase 4 can have decision question
        violations.push({
          code: "RHETORICAL_QUESTION_DETECTED",
          message: `Phase ${phase.phaseNumber} contains rhetorical question`,
        });
      }
    }

    // Check for vendor-speak patterns
    const vendorPatterns = [
      /we help/i,
      /our solution/i,
      /sign up/i,
      /industry-leading/i,
      /cutting-edge/i,
      /proven results/i,
      /sales/i,
    ];

    vendorPatterns.forEach((pattern) => {
      if (pattern.test(phase.content)) {
        violations.push({
          code: "VENDOR_SPEAK_DETECTED",
          message: `Phase ${phase.phaseNumber} contains vendor-speak`,
        });
      }
    });

    // Check frame is locked
    const allowedFrames = [
      "continuation_not_introduction",
      "confirm_existing_reality",
      "expand_known_pattern_only",
      "deferred_inevitability_decision",
      "single_path_forward",
    ];

    if (!allowedFrames.includes(phase.frame)) {
      violations.push({
        code: "INVALID_FRAME",
        message: `Phase ${phase.phaseNumber} has invalid frame: ${phase.frame}`,
      });
    }
  });

  // Check phase order
  const expectedOrder = [
    "Opening Continuity Acknowledgement",
    "Operational Context Confirmation",
    "Continuity Deepening",
    "Decision Framing",
    "Next Step Alignment",
  ];

  phases.forEach((phase, index) => {
    if (phase.phaseName !== expectedOrder[index]) {
      violations.push({
        code: "PHASE_ORDER_VIOLATION",
        message: `Phase ${index + 1} is out of order: expected ${expectedOrder[index]}, got ${phase.phaseName}`,
      });
    }
  });

  return {
    passed: violations.length === 0,
    violations,
    violationCount: violations.length,
  };
}

// Main API handler
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const industry = searchParams.get("industry");
    const company = searchParams.get("company");
    const city = searchParams.get("city");

    // Validate required params
    if (!industry || !company || !city) {
      return NextResponse.json(
        {
          error: "Missing required parameters",
          required: ["industry", "company", "city"],
        },
        { status: 400 }
      );
    }

    // Generate conversation phases
    const phases = generateConversationPhases(
      industry.toLowerCase(),
      company,
      city
    );

    // Validate phases
    const validation = validateConversationPhases(phases);

    // If validation fails, return error
    if (!validation.passed) {
      return NextResponse.json(
        {
          error: "Conversation validation failed",
          violations: validation.violations,
          violationCount: validation.violationCount,
        },
        { status: 400 }
      );
    }

    // Calculate total character count
    const totalCharacterCount = phases.reduce(
      (sum, phase) => sum + phase.characterCount,
      0
    );

    const response: ConversationResponse = {
      success: true,
      metadata: {
        industry: industry.toLowerCase(),
        company,
        city,
      },
      conversation: {
        phases: phases.map((p) => ({
          phaseNumber: p.phaseNumber,
          phaseName: p.phaseName,
          frame: p.frame,
          content: p.content,
          characterCount: p.characterCount,
          charLimit: p.charLimit,
        })),
        totalCharacterCount,
      },
      validation: {
        passed: true,
        violations: [],
        violationCount: 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST: Validate external conversation data against schema
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phases } = body;

    if (!Array.isArray(phases)) {
      return NextResponse.json(
        { error: "Missing or invalid 'phases' array" },
        { status: 400 }
      );
    }

    const validation = validateConversationPhases(phases as ConversationPhase[]);

    return NextResponse.json({
      success: validation.passed,
      validation,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
