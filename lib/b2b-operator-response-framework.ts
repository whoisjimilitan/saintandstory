/**
 * OPERATOR RESPONSE FRAMEWORK GENERATOR
 *
 * Takes prospect reply and generates operator context brief
 * Framework guides operator to respond with RRAT principles (not templates)
 * Operator fills in details; framework prevents templating
 */

export interface OperatorBriefInput {
  prospect_id: string;
  prospect_name: string;
  prospect_reply: string;
  original_recognition: string; // From Wave 1 email
  pressure_type: string;
  observations: string;
}

export interface OperatorBriefOutput {
  prospect_name: string;
  pressure_type: string;
  original_recognition: string;
  their_question: string;
  engagement_signal: {
    intent_level: 'high' | 'medium' | 'low';
    stage: 'curious' | 'skeptical' | 'ready';
  };
  framework: {
    step_1_start: string;
    step_2_acknowledge: string;
    step_3_explain: string;
    step_4_proof: string;
    step_5_their_reality: string;
    step_6_validation: string;
  };
  do_not_do: string[];
  tone_guidance: string;
}

/**
 * Generate operator brief from prospect reply
 * Returns framework structure for operator to fill in
 */
export async function generateOperatorBrief(
  input: OperatorBriefInput
): Promise<OperatorBriefOutput> {
  // Extract intent from prospect reply
  const reply_lower = input.prospect_reply.toLowerCase();

  let intent_level: 'high' | 'medium' | 'low' = 'medium';
  let stage: 'curious' | 'skeptical' | 'ready' = 'curious';

  // High intent signals
  if (
    reply_lower.includes('how') ||
    reply_lower.includes('when') ||
    reply_lower.includes('cost') ||
    reply_lower.includes('start') ||
    reply_lower.includes('work')
  ) {
    intent_level = 'high';
    stage = 'ready';
  }

  // Skeptical signals
  if (
    reply_lower.includes('already tried') ||
    reply_lower.includes('doubt') ||
    reply_lower.includes('not sure')
  ) {
    stage = 'skeptical';
  }

  // Generate framework specific to pressure type and stage
  let framework: OperatorBriefOutput['framework'];

  if (stage === 'skeptical') {
    framework = {
      step_1_start: `You mentioned [their concern]. That's a fair point. Let me explain how we're different.`,
      step_2_acknowledge: `I understand why you're hesitant. You've probably tried [similar solution] before. Here's why ours is different:`,
      step_3_explain: `[Your actual process/methodology - not claims, actual steps]`,
      step_4_proof: `We worked with [similar company] who had [same concern]. What changed: [specific outcome]`,
      step_5_their_reality: `For your specific situation (${input.pressure_type}), here's how it would work: [concrete next steps]`,
      step_6_validation: `Does that address your concern? What's the one thing that would make you feel confident enough to try?`,
    };
  } else if (stage === 'ready') {
    framework = {
      step_1_start: `You asked [their specific question]. Great question. Here's how it works:`,
      step_2_acknowledge: `I can tell you're ready to move forward, so let me be specific about the process.`,
      step_3_explain: `Here's our methodology: [Your actual process steps - how you solve their specific problem]`,
      step_4_proof: `Similar situation: [Company name] had [same challenge]. They saw [specific outcome].`,
      step_5_their_reality: `For your [X locations/size/situation], here's exactly what happens: [detailed walkthrough]`,
      step_6_validation: `When would you want to get started? [Specific timeline option or call to action]`,
    };
  } else {
    // Curious (default)
    framework = {
      step_1_start: `You asked [their specific question]. Let me walk you through it.`,
      step_2_acknowledge: `The challenge you're facing ([their pressure]) is exactly what we solve.`,
      step_3_explain: `Here's how we approach it: [Your actual methodology - not generic, specific]`,
      step_4_proof: `We've done this for [similar company count] in your sector. One example: [Company], [their situation], [outcome].`,
      step_5_their_reality: `For your situation specifically: [Your observations about them], here's how it would work: [concrete steps]`,
      step_6_validation: `Does that make sense? Would it be worth a [quick call/demo] to explore further?`,
    };
  }

  return {
    prospect_name: input.prospect_name,
    pressure_type: input.pressure_type,
    original_recognition: input.original_recognition,
    their_question: input.prospect_reply.substring(0, 100) + '...',
    engagement_signal: {
      intent_level,
      stage,
    },
    framework,
    do_not_do: [
      '❌ Don\'t use templates',
      '❌ Don\'t repeat their pressure from email (you already named it)',
      '❌ Don\'t make generic claims ("we can help")',
      '❌ Don\'t ignore their specific question',
      '❌ Don\'t try to close (just build trust)',
    ],
    tone_guidance: 'Conversational, specific to THEIR situation, methodical (show HOW not WHAT), honest',
  };
}
