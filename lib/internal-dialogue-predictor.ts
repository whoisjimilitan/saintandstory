/**
 * INTERNAL DIALOGUE PREDICTOR
 *
 * Predicts the reader's silent thought sequence BEFORE email generation.
 *
 * This is the blueprint. The email is merely the manifestation of correct prediction.
 *
 * STAGE 1 (Cold):
 * Reader arrives defensive. Assumes sales pitch.
 * Permission line disarms. Creates curiosity.
 * Recognition moment builds trust.
 * They self-diagnose the problem.
 * They're ready to respond.
 *
 * STAGE 2+ (Warm):
 * Reader already chose to engage.
 * No Permission needed.
 * Conversation deepens from established connection.
 * Movement toward action/decision.
 */

export interface InternalThought {
  moment: string; // "before-open" | "first-line" | "recognition" | "trust-building" | etc.
  thinking: string; // What they're actually thinking
  emotion: string; // The feeling accompanying this thought
  psychologicalFunction: string; // What this moment accomplishes
}

export interface InternalDialogue {
  stage: 1 | 2 | 3 | 4 | 5 | 6;
  industry: string;
  location: string;
  thoughts: InternalThought[];
  objective: string; // What should happen by end of email
  successCondition: string; // How we know this worked
}

/**
 * STAGE 1: COLD PROSPECT
 *
 * Task: Remove defensiveness, build trust, create self-diagnosis, earn micro commitment
 */
function predictStage1Dialogue(
  industry: string,
  location: string,
  permissionLine: string
): InternalThought[] {
  const dialogueBase: InternalThought[] = [
    {
      moment: "inbox-arrives",
      thinking: "Another vendor email. Probably here to tell me why I need their service.",
      emotion: "skepticism, mild annoyance",
      psychologicalFunction: "Reader defaults to sales defensiveness",
    },
    {
      moment: "subject-preview",
      thinking: "Will this waste my time or solve something?",
      emotion: "guarded curiosity",
      psychologicalFunction: "Subject line must create enough relevance to justify opening",
    },
    {
      moment: "permission-line-lands",
      thinking: "Wait... they're telling me to ignore this? That's different.",
      emotion: "intrigue, curiosity, slight relief",
      psychologicalFunction:
        "Permission disarms defensiveness. Removes sales pressure. Creates openness.",
    },
    {
      moment: "recognition-signal",
      thinking: "That... that actually happened to us.",
      emotion: "recognition, vulnerability",
      psychologicalFunction:
        "Reader realizes sender understands their specific situation, not generic pain",
    },
    {
      moment: "trust-moment",
      thinking: "How would they know that? Someone's actually been watching how we operate.",
      emotion: "respect, validation",
      psychologicalFunction: "Trust builds through observation, not claims",
    },
    {
      moment: "self-diagnosis",
      thinking: "Yeah... we ARE experiencing that. Maybe more than I realized.",
      emotion: "honest acknowledgment",
      psychologicalFunction: "Reader arrives at own conclusion without being told",
    },
    {
      moment: "micro-commitment-appears",
      thinking: "They want me to just say yes or no. That's... fair. I can handle that.",
      emotion: "relief, agency",
      psychologicalFunction: "Smallest ask possible. Reader feels in control.",
    },
  ];

  // Adjust specific thoughts based on industry/location patterns
  if (industry.toLowerCase().includes("restaurant") || industry.toLowerCase().includes("bakery")) {
    dialogueBase[4].thinking = "How would they know we scramble on Friday nights?";
  }

  if (location.toLowerCase().includes("london")) {
    dialogueBase[5].thinking = "Someone's actually watched London logistics... or our location specifically.";
  }

  return dialogueBase;
}

/**
 * STAGE 2: WARM PROSPECT (They replied)
 *
 * Task: Deepen understanding of their situation, surface real blockers, build toward action
 */
function predictStage2Dialogue(industry: string, location: string): InternalThought[] {
  return [
    {
      moment: "email-arrives-warm",
      thinking: "They're following up. I replied to them, so they're worth listening to now.",
      emotion: "openness, qualification already achieved",
      psychologicalFunction: "Reader has self-qualified by replying. No Permission needed.",
    },
    {
      moment: "specific-question",
      thinking: "They're asking something specific, not generic. They're treating my situation as unique.",
      emotion: "respect, engagement",
      psychologicalFunction: "Specific questions show genuine interest, not template outreach",
    },
    {
      moment: "operational-insight",
      thinking: "They understand how we actually work. Not how they think we should work.",
      emotion: "validation, connection",
      psychologicalFunction: "Reader feels understood at operational level",
    },
    {
      moment: "blocker-surfacing",
      thinking: "Okay, they're asking what would actually make this work for us.",
      emotion: "thoughtfulness, partnership",
      psychologicalFunction: "Conversation shifts from sales to collaborative problem-solving",
    },
    {
      moment: "natural-next-step",
      thinking: "I can see where this is going. It makes sense as a next step for us.",
      emotion: "clarity, readiness",
      psychologicalFunction: "Reader agrees with progression logic, not because sold to, but because follows naturally",
    },
  ];
}

/**
 * STAGE 3+: CUSTOMER/DEEP ENGAGEMENT
 *
 * Task: Deepen partnership, surface expansion opportunities, maintain relationship
 */
function predictStage3PlusDialogue(stage: number, industry: string): InternalThought[] {
  const baseDialogue: InternalThought[] = [
    {
      moment: "relationship-exists",
      thinking: "We're already working together. This is about what comes next.",
      emotion: "partnership, mutual interest",
      psychologicalFunction: "Conversation assumes relationship foundation",
    },
    {
      moment: "expanded-opportunity",
      thinking: "They're seeing opportunities we haven't considered yet.",
      emotion: "interest, respect",
      psychologicalFunction: "Sender acts as strategic advisor, not vendor",
    },
    {
      moment: "trust-deepens",
      thinking: "They're thinking about our business holistically, not just their service.",
      emotion: "validation, partnership",
      psychologicalFunction: "Trust is now earned through demonstrated understanding",
    },
  ];

  if (stage === 4 || stage === 5) {
    baseDialogue.push({
      moment: "growth-conversation",
      thinking: "They're thinking about how we scale, not just transactional service.",
      emotion: "strategic alignment",
      psychologicalFunction: "Shifts from vendor relationship to strategic partnership",
    });
  }

  return baseDialogue;
}

/**
 * Main predictor function
 */
export function predictInternalDialogue(
  stage: 1 | 2 | 3 | 4 | 5 | 6,
  industry: string,
  location: string,
  permissionLine?: string
): InternalDialogue {
  let thoughts: InternalThought[] = [];
  let objective = "";
  let successCondition = "";

  switch (stage) {
    case 1:
      thoughts = predictStage1Dialogue(industry, location, permissionLine || "");
      objective = "Remove defensiveness, build trust, create self-diagnosis, earn reply";
      successCondition = "Reader replies with Yes, Maybe, or No";
      break;

    case 2:
      thoughts = predictStage2Dialogue(industry, location);
      objective = "Deepen understanding, surface real blockers, progress toward action";
      successCondition = "Reader commits to next step or specifies conditions";
      break;

    case 3:
    case 4:
    case 5:
    case 6:
      thoughts = predictStage3PlusDialogue(stage, industry);
      objective = "Deepen partnership, surface expansion, maintain strategic alignment";
      successCondition = "Reader engages with new opportunity or confirms satisfaction";
      break;
  }

  return {
    stage,
    industry,
    location,
    thoughts,
    objective,
    successCondition,
  };
}

/**
 * Format internal dialogue for operator visibility (optional)
 * Shows what reader is thinking at each moment
 */
export function formatInternalDialogueForOperator(dialogue: InternalDialogue): string {
  const header = `\n=== PREDICTED INTERNAL DIALOGUE (Stage ${dialogue.stage}) ===\n`;
  const objective = `Objective: ${dialogue.objective}\n`;
  const successCond = `Success: ${dialogue.successCondition}\n\n`;

  const thoughts = dialogue.thoughts
    .map(
      (t) =>
        `📍 ${t.moment.toUpperCase()}\n   Thinking: "${t.thinking}"\n   Feeling: ${t.emotion}\n   Function: ${t.psychologicalFunction}\n`
    )
    .join("\n");

  return header + objective + successCond + thoughts;
}
