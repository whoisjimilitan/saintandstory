import { getProblemType } from "./problems-map";
import { PsychologyAnalysis } from "./psychology-analyzer";

/**
 * Generate a brief for a prospect.
 *
 * The brief:
 * 1. Shows understanding (authority through specificity)
 * 2. Reveals the gap (inverse incentives shown through consequences)
 * 3. Shows what's possible (transformation when gap is closed)
 * 4. Is valuable on its own (gap revelation is the product)
 * 5. Embeds psychology invisibly (through framing, not words)
 *
 * INPUT: Confession + psychology analysis + contact info
 * OUTPUT: Brief HTML + metadata
 */

export interface BriefInput {
  confession_text: string;
  problem_type: string;
  contact_name?: string;
  company_name?: string;
  location?: string;
  psychology: PsychologyAnalysis;
}

export interface GeneratedBrief {
  subject: string;
  opening: string;
  gap_section: string;
  possibility_section: string;
  proof_section: string;
  cta: string;
  html: string;
  pre_populated_reply: string;
}

/**
 * Generate complete brief with psychology embedded invisibly.
 */
export function generateBrief(input: BriefInput): GeneratedBrief | null {
  const problem = getProblemType(input.problem_type);
  if (!problem) return null;

  const name = input.contact_name || "there";
  const company = input.company_name || "your company";

  // SECTION 1: OPENING — Authority + Recognition
  const opening = `Hi ${name},

A little birdie told me about ${problem.brief_opening.replace(/\.$/, "")}`;

  // SECTION 2: GAP REVELATION — Inverse Incentives + Loss Aversion
  // Shows what breaks + what they're losing WITHOUT stating it directly
  const gap_section = generateGapSection(problem.inverse_incentive, input.psychology.loss_aversion_frame, company);

  // SECTION 3: POSSIBILITY — What becomes possible when gap is closed
  const possibility_section = generatePossibilitySection(input.problem_type, company);

  // SECTION 4: PROOF — Authority demonstrated through specificity
  const proof_section = problem.authority_proof;

  // SECTION 5: CTA — Soft, frictionless ask
  const cta = "Curious what you think.";

  // Assemble subject
  const subject = `${company} – ${input.problem_type.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}`;

  // Assemble pre-populated reply
  const pre_populated_reply = problem.pre_populated_reply;

  // Generate HTML
  const html = generateBriefHTML({
    opening,
    gap_section,
    possibility_section,
    proof_section,
    cta,
    name
  });

  return {
    subject,
    opening,
    gap_section,
    possibility_section,
    proof_section,
    cta,
    html,
    pre_populated_reply
  };
}

/**
 * Generate gap section — reveals cost without stating it directly.
 *
 * Uses inverse incentives + loss aversion to make gap REAL and COSTLY.
 * Psychology is embedded in how we frame the problem.
 */
function generateGapSection(
  inverseIncentive: string,
  lossAversion: string,
  company: string
): string {
  // Format as natural insight, not list
  return `Right now, here's what's happening: ${lossAversion.toLowerCase()}.

If that pattern continues, here's what follows: ${inverseIncentive.toLowerCase()}.

That's the gap we're looking at.`;
}

/**
 * Generate possibility section — shows what becomes possible when gap closes.
 *
 * Frames as operational reality, not aspirational marketing.
 */
function generatePossibilitySection(problemType: string, company: string): string {
  const possibilities: Record<string, string> = {
    court_deadline_delivery:
      "When your deadlines become reliable, your team stops managing logistics and starts managing cases. Filing doesn't feel fragile anymore.",

    hospital_supply_delivery:
      "When supplies arrive predictably, surgeries don't slip. Care pathways stay on schedule. Patient outcomes improve.",

    pharmacy_prescription_delivery:
      "When prescriptions deliver consistently, patients trust you. No more apology phone calls. Your reputation strengthens.",

    construction_material_delivery:
      "When materials show up on time, crews stay productive. Projects finish on schedule. Site costs don't inflate.",

    restaurant_supply_delivery:
      "When stock is reliable, your menu is reliable. Customers order confidently. Revenue becomes predictable.",

    estate_agent_document_delivery:
      "When documents reach solicitors on time, completions happen. Buyers get keys. Deals close.",

    architecture_drawing_delivery:
      "When plans arrive on schedule, builders move forward. Projects stay on time. Amendments don't cascade.",

    film_production_equipment:
      "When equipment is where it needs to be, you film. No delays, no waiting. Production timelines compress.",

    accounting_file_delivery:
      "When documents arrive at the filing deadline, compliance happens. Tax season becomes routine instead of chaos.",

    retail_stock_delivery:
      "When stock arrives early, shelves are ready. Store opens strong. First customers see a full offering.",

    beauty_supply_delivery:
      "When products arrive consistently, clients get their bookings. No cancellations. Revenue stays predictable.",

    veterinary_supply_delivery:
      "When medications and supplies arrive on schedule, animals get care without delay. Procedures stay booked.",

    dental_supply_delivery:
      "When supplies arrive predictably, appointments run on time. Patients keep booking. Practice grows steadily.",

    legal_document_delivery:
      "When court deadlines are met reliably, cases don't get dismissed. Clients trust you. Your practice reputation grows.",

    office_supply_delivery:
      "When supplies are always in stock, teams stay productive. No interruptions. Operations run smoothly.",

    art_gallery_artwork_delivery:
      "When artwork arrives on time, exhibitions open as planned. Opening events happen. Collections display as designed.",

    catering_supply_delivery:
      "When ingredients arrive fresh and on time, events succeed. Guests remember meals. Reputation spreads.",

    manufacturing_part_delivery:
      "When parts arrive on schedule, production flows. Quotas are met. Customer deadlines stay secure."
  };

  return possibilities[problemType] || `When this becomes reliable, ${company} operates without friction.`;
}

/**
 * Generate brief HTML for email delivery.
 */
function generateBriefHTML(input: {
  opening: string;
  gap_section: string;
  possibility_section: string;
  proof_section: string;
  cta: string;
  name: string;
}): string {
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
  <div style="padding: 40px 0;">
    <p style="margin: 0 0 24px 0; font-size: 14px;">${input.opening}</p>

    <div style="background: #f9f9f9; padding: 24px; border-left: 3px solid #0d0d0d; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; color: #666;">${input.gap_section}</p>
    </div>

    <p style="margin: 24px 0; font-size: 14px; color: #666;">${input.possibility_section}</p>

    <p style="margin: 24px 0; font-size: 13px; color: #888; font-style: italic;">${input.proof_section}</p>

    <p style="margin: 24px 0; font-size: 14px;">${input.cta}</p>

    <p style="margin: 24px 0 0 0; font-size: 14px;">James</p>
  </div>
</div>
  `.trim();
}

/**
 * Generate PROPHETIC email body using the complete psychological structure.
 *
 * PROPHECY STRUCTURE (6 lines, psychologically complete):
 * 1. Apology/Disarming (permission to listen)
 * 2. Teaching moment (humble authority)
 * 3. The gap insight (revelation)
 * 4. Personalization (specific to THEM)
 * 5. Engagement question (soft CTA)
 * 6. Signature
 *
 * + Reply button (in HTML, not in text)
 *
 * This is the COMPLETE engine.
 */
export function generateEmailBody(brief: GeneratedBrief, input?: BriefInput): string {
  const name = input?.contact_name || "there";
  const company = input?.company_name || "your company";
  const problemType = input?.problem_type || "";
  const problem = getProblemType(problemType);

  if (!problem) {
    return "Brief generation failed.";
  }

  // ============ BUILD THE PROPHETIC EMAIL ============

  // Line 1: APOLOGY/DISARMING
  const line1 = `Hi ${name},\n\nApologies for reaching out of the blue. I have a specific reason.`;

  // Line 2: TEACHING MOMENT (Humble Authority)
  // Extract industry from problem type: "court_deadline_delivery" → "Working with legal firms"
  const industryPhrase = getIndustryPhrase(problemType);
  const line2 = `\n\n${industryPhrase} has taught me one thing.`;

  // Line 3: THE GAP INSIGHT (Revelation)
  // This is the real insight that reveals what they're dealing with
  const gapInsight = problem.loss_aversion_daily;
  const line3 = `\n\n${gapInsight.charAt(0).toUpperCase() + gapInsight.slice(1)}`;

  // Line 4: PERSONALIZATION (Specific to them)
  // Bridge to their specific situation
  const personalization = `For ${company}, that's a real problem.`;
  const line4 = `\n\n${personalization}`;

  // Line 5: ENGAGEMENT QUESTION (Soft CTA)
  // Problem-specific question
  const engagementQuestion = getEngagementQuestion(problemType);
  const line5 = `\n\n${engagementQuestion}`;

  // Line 6: SIGNATURE
  const line6 = `\n\nJames\nSaint & Story`;

  return line1 + line2 + line3 + line4 + line5 + line6;
}

/**
 * Extract industry phrase from problem type for "teaching moment" line
 */
function getIndustryPhrase(problemType: string): string {
  const phrases: Record<string, string> = {
    court_deadline_delivery: "Working with solicitors",
    legal_document_delivery: "Working with legal firms",
    hospital_supply_delivery: "Working with hospitals",
    pharmacy_prescription_delivery: "Working with pharmacies",
    construction_material_delivery: "Working with construction firms",
    estate_agent_document_delivery: "Working with estate agents",
    restaurant_supply_delivery: "Working with restaurants",
    accounting_file_delivery: "Working with accountants",
    architecture_drawing_delivery: "Working with architects",
    veterinary_supply_delivery: "Working with veterinary clinics",
    dental_supply_delivery: "Working with dental practices",
    retail_stock_delivery: "Working with retail businesses",
    beauty_supply_delivery: "Working with salons",
    art_gallery_artwork_delivery: "Working with galleries",
    catering_supply_delivery: "Working with caterers",
    manufacturing_part_delivery: "Working with manufacturers",
    film_production_equipment: "Working with film production",
    office_supply_delivery: "Working with offices"
  };

  return phrases[problemType] || "Working with businesses";
}

/**
 * Generate engagement question from problem type
 */
function getEngagementQuestion(problemType: string): string {
  const questions: Record<string, string> = {
    court_deadline_delivery: "When deadlines get tight, does your team ever need a same-day backup courier?",
    legal_document_delivery: "When documents are critical, does reliable delivery become essential?",
    hospital_supply_delivery: "When urgent supplies are needed, do you currently have a reliable option?",
    pharmacy_prescription_delivery: "Does your team ever struggle with urgent prescription deliveries?",
    construction_material_delivery: "When materials don't arrive on time, how does that affect your schedule?",
    estate_agent_document_delivery: "On completion day, do documents always reach solicitors on time?",
    restaurant_supply_delivery: "Does your team ever need urgent supplier collections during service?",
    accounting_file_delivery: "During tax season, do document deadlines ever create stress?",
    architecture_drawing_delivery: "When amendments come through, can builders wait for plans?",
    veterinary_supply_delivery: "Does urgent medication delivery ever impact your schedule?",
    dental_supply_delivery: "Do supply delays ever affect your appointment schedule?",
    retail_stock_delivery: "Does early morning stock delivery affect your store readiness?",
    beauty_supply_delivery: "Does product availability ever affect your client bookings?",
    art_gallery_artwork_delivery: "When exhibitions need to open on time, is reliable transport critical?",
    catering_supply_delivery: "Do event deadlines ever create supply chain stress?",
    manufacturing_part_delivery: "When parts don't arrive on schedule, how does that impact production?",
    film_production_equipment: "When equipment is needed on location, do delays halt production?",
    office_supply_delivery: "Does running out of essentials ever create workflow disruption?"
  };

  return questions[problemType] || "Can we help with your delivery challenges?";
}
