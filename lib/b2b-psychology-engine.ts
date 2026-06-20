import { getPressureEmailContext, mapCategoryToPressureType } from "./b2b-pressure-type-mapper";

/**
 * PSYCHOLOGY ENGINE - Wave 1
 *
 * Takes enriched lead data and generates RRAT-compliant emails.
 * Uses pressure type mapping to generate specific recognition + relief + trust + action.
 *
 * This ENHANCES the existing email generation, not replaces it.
 * Psychology engine output feeds into existing validator + rewriter pipeline.
 *
 * Input: Lead with intelligence (observations, pain_point_review, category, location)
 * Output: { recognition, relief, trust, action, validation_ready }
 */

export interface PsychologyEmailOutput {
  recognition: string;
  relief: string;
  trust: string;
  action: string;
  email_body: string;
  pressure_type: string;
}

export async function generatePsychologyEmail(lead: {
  name: string;
  category: string;
  location: string | null;
  observations?: string;
  pain_point_review?: string;
  business_pattern?: string;
  weekly_jobs?: number;
}): Promise<PsychologyEmailOutput> {
  const pressureType = mapCategoryToPressureType(lead.category);
  const pressureContext = getPressureEmailContext(pressureType, lead.category, lead.location);
  const weeklyJobs = lead.weekly_jobs || 0;

  // STAGE 1: RECOGNITION
  // Specific observation they'd recognize, not generic analysis
  const recognition = generateRecognition({
    name: lead.name,
    category: lead.category,
    observations: lead.observations,
    pressureContext,
  });

  // STAGE 2: RELIEF
  // Name their specific burden, not just the problem
  const relief = generateRelief({
    name: lead.name,
    painPoint: lead.pain_point_review,
    businessPattern: lead.business_pattern,
    pressureContext,
  });

  // STAGE 3: TRUST
  // Show proof or methodology specific to their pressure type
  const trust = generateTrust({
    category: lead.category,
    pressureType,
    weeklyJobs,
  });

  // STAGE 4: ACTION
  // Validation question, not generic CTA
  const action = generateAction({
    name: lead.name,
    pressureContext,
  });

  const email_body = [recognition, relief, trust, action].filter(Boolean).join("\n\n");

  return {
    recognition,
    relief,
    trust,
    action,
    email_body,
    pressure_type: pressureType,
  };
}

function generateRecognition(ctx: {
  name: string;
  category: string;
  observations?: string;
  pressureContext: any;
}): string {
  // If we have specific observations, use them
  if (ctx.observations) {
    return `One thing that stood out about ${ctx.name}: ${ctx.observations}`;
  }

  // Fall back to pressure-type-specific recognition
  const pressureContext = ctx.pressureContext;
  const situation = pressureContext.situation || "";

  return `I noticed something about ${ctx.name}. ${situation.charAt(0).toLowerCase()}${situation.slice(1)}.`;
}

function generateRelief(ctx: {
  name: string;
  painPoint?: string;
  businessPattern?: string;
  pressureContext: any;
}): string {
  // If we have specific pain point, use it to acknowledge burden
  if (ctx.painPoint) {
    const burden = ctx.painPoint.toLowerCase();
    return `This probably sounds familiar: you're spending time managing ${burden} when you should be focusing on growth.`;
  }

  // Use pressure context to generate relief
  const coping = ctx.pressureContext.coping || "";
  const timeframe = ctx.pressureContext.timeframe || "week";

  return `Here's what probably happens: ${coping}. That's personal time you didn't plan for, every ${timeframe}.`;
}

function generateTrust(ctx: {
  category: string;
  pressureType: string;
  weeklyJobs: number;
}): string {
  // Provide methodology-specific proof based on pressure type
  if (ctx.weeklyJobs > 0) {
    return `We've built our process around removing that burden. Last week alone, we handled ${ctx.weeklyJobs} similar situations for ${ctx.category} businesses.`;
  }

  return `We've built our process specifically around removing that burden for businesses like yours.`;
}

function generateAction(ctx: {
  name: string;
  pressureContext: any;
}): string {
  // Validation question specific to their situation
  const variability = ctx.pressureContext.variability || "";

  return `Quick question: ${variability.charAt(0).toLowerCase()}${variability.slice(1).replace(/\.$/, "")}? Does that match your experience?`;
}
