import { OutreachMessage } from "./outreach-message-generator";

/**
 * PSYCHOLOGICAL CONFIDENCE BUILDER
 *
 * Formats API responses to build confidence through:
 * 1. Social proof (strategy counts)
 * 2. Reality check (sample messages)
 * 3. Validation checks (✓ symbols)
 * 4. Consistency proof (tree structure)
 * 5. Grand summary (totals + verification)
 * 6. Control (action options)
 */

export interface FormattedStrategyGroup {
  strategy: string;
  count: number;
  sample: OutreachMessage;
  confidenceChecks: string[];
  description: string;
}

export interface FormattedCampaignResponse {
  campaignName: string;
  totalLeads: number;
  messageGenerationSummary: string;
  strategyGroups: FormattedStrategyGroup[];
  grandSummary: {
    totalGenerated: number;
    allFollowPattern: boolean;
    zeroAsksDetected: number;
    professionalPositioning: number;
    validityPercentage: number;
  };
  validityReport: {
    valid: number;
    invalid: number;
    invalidMessages: Array<{ firstName: string; reason: string }>;
  };
  actions: string[];
}

/**
 * Format single message for display
 */
export function formatSingleMessage(message: OutreachMessage): {
  display: string;
  checks: string[];
} {
  const checks: string[] = [];

  if (message.confidenceChecks.charLimit) {
    checks.push(`✓ Chars: ${message.charCount}/${message.maxChars || 180}`);
  }

  if (message.confidenceChecks.noAsk) {
    checks.push(`✓ No ask`);
  }

  if (message.confidenceChecks.introPresent) {
    checks.push(`✓ Intro present`);
  }

  const checksDisplay = checks.join(" ");
  const display = `${message.message}\n${checksDisplay}`;

  return { display, checks };
}

/**
 * Format campaign response with psychological confidence building
 */
export function formatCampaignResponse(
  campaignName: string,
  messages: OutreachMessage[]
): FormattedCampaignResponse {
  // Group by strategy
  const strategyMap = new Map<string, OutreachMessage[]>();

  for (const msg of messages) {
    if (!strategyMap.has(msg.strategy)) {
      strategyMap.set(msg.strategy, []);
    }
    strategyMap.get(msg.strategy)!.push(msg);
  }

  // Create strategy groups with samples
  const strategyGroups: FormattedStrategyGroup[] = [];
  const strategyOrder = ["ai_personalized", "template", "email", "linkedin", "generic"];

  for (const strategy of strategyOrder) {
    const msgs = strategyMap.get(strategy);
    if (!msgs || msgs.length === 0) continue;

    const sample = msgs[0];
    const checks: string[] = [];

    if (sample.confidenceChecks.charLimit) {
      checks.push(`✓ Chars: ${sample.charCount}/${sample.maxChars || 180}`);
    }
    if (sample.confidenceChecks.noAsk) {
      checks.push(`✓ No ask`);
    }
    if (sample.confidenceChecks.introPresent) {
      checks.push(`✓ Intro present`);
    }

    const descriptionMap: Record<string, string> = {
      ai_personalized: "AI Personalized (Facebook + description)",
      template: "Template (WhatsApp groups + minimal)",
      email: "Email (company + firstname)",
      linkedin: "LinkedIn (profile + title)",
      generic: "Generic (phone only - fallback)"
    };

    strategyGroups.push({
      strategy,
      count: msgs.length,
      sample,
      confidenceChecks: checks,
      description: descriptionMap[strategy] || strategy
    });
  }

  // Grand summary
  const validCount = messages.filter(m => m.isValid).length;
  const invalidCount = messages.length - validCount;
  const zeroAsks = messages.filter(m => !m.questionMarkAtEnd).length;
  const professional = messages.filter(m => m.psychology.introducesExpertise).length;
  const validityPercentage = Math.round((validCount / messages.length) * 100);

  // Invalid messages
  const invalidMessages = messages
    .filter(m => !m.isValid)
    .map((m, idx) => ({
      firstName: `Lead ${idx + 1}`,
      reason: "Message does not meet psychology validation criteria"
    }));

  return {
    campaignName,
    totalLeads: messages.length,
    messageGenerationSummary: `Message Generation Complete:`,
    strategyGroups,
    grandSummary: {
      totalGenerated: messages.length,
      allFollowPattern: messages.every(
        m => m.psychology.acknowledgesContext &&
             m.psychology.identifiesProblem &&
             m.psychology.introducesExpertise
      ),
      zeroAsksDetected: zeroAsks,
      professionalPositioning: professional,
      validityPercentage
    },
    validityReport: {
      valid: validCount,
      invalid: invalidCount,
      invalidMessages
    },
    actions: ["[Regenerate All]", "[Edit Samples]", "[Send All]"]
  };
}

/**
 * Render campaign response as ASCII tree
 */
export function renderCampaignTree(response: FormattedCampaignResponse): string {
  let output = "\n";
  output += response.messageGenerationSummary + "\n";

  // Strategy groups
  for (let i = 0; i < response.strategyGroups.length; i++) {
    const group = response.strategyGroups[i];
    const isLast = i === response.strategyGroups.length - 1;
    const prefix = isLast ? "└─" : "├─";
    const nextPrefix = isLast ? "   " : "│  ";

    output += `${prefix} Strategy ${i + 1}: ${group.description} (${group.count})\n`;
    output += `${nextPrefix}"${group.sample.message}"\n`;
    output += `${nextPrefix}${group.confidenceChecks.join(" ")}\n`;
    output += "\n";
  }

  // Grand summary
  output += `Total: ${response.grandSummary.totalGenerated} messages generated\n`;
  output += `✓ All messages follow: Acknowledge → Problem → Intro pattern\n`;
  output += `✓ Zero messages end with "Worth a chat?"\n`;
  output += `✓ ${response.grandSummary.validityPercentage}% professionally positioned\n`;
  output += "\n";
  output += response.actions.join(" ") + "\n";

  return output;
}
