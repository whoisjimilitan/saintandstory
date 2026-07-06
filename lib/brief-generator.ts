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
 * Generate PROPHETIC email body - THE BREAKTHROUGH.
 *
 * PERFECT STRUCTURE (psychologically complete + discovery-first):
 * 1. Greeting
 * 2. Apologies (permission to listen)
 * 3. Discovery ("A little birdie told me...")
 * 4. Teaching moment (humble authority + the real insight)
 * 5. Personalization (specific to THEM)
 * 6. Credibility/Proof (why we built this)
 * 7. Engagement question (soft CTA)
 * 8. Signature
 * 9. Reply button (in HTML)
 *
 * Psychology: Permission → Recognition → Authority → Insight → Personalization → Proof → Engagement
 */
export function generateEmailBody(brief: GeneratedBrief, input?: BriefInput): string {
  const name = input?.contact_name || "there";
  const company = input?.company_name || "your company";
  const problemType = input?.problem_type || "";
  const problem = getProblemType(problemType);

  if (!problem) {
    return "Brief generation failed.";
  }

  // ============ BUILD THE BREAKTHROUGH EMAIL ============

  // Line 1: GREETING
  const line1 = `Hi ${name},`;

  // Line 2: APOLOGIES (Permission to listen)
  const line2 = `\nApologies. I know it's unusual emailing you out of the blue.`;

  // Line 3: DISCOVERY ("A little birdie told me...")
  // What we discovered specifically about them
  const discoveryPhrase = getDiscoveryPhrase(problemType, company);
  const line3 = `\n${discoveryPhrase}`;

  // Line 4: TEACHING MOMENT (Humble Authority + Real Insight)
  // "Working with [INDUSTRY] has taught me one thing. [The real gap]"
  const industryPhrase = getIndustryPhrase(problemType);
  const realInsight = getTeachingMoment(problemType);
  const line4 = `\n${industryPhrase} has taught me one thing. ${realInsight}`;

  // Line 5: PERSONALIZATION (Specific to their situation)
  const personalizationLine = getPersonalizationLine(problemType, company);
  const line5 = `\n${personalizationLine}`;

  // Line 6: CREDIBILITY/PROOF (Why we built this)
  const credibilityLine = getCredibilityStatement(problemType);
  const line6 = `\n${credibilityLine}`;

  // Line 7: ENGAGEMENT QUESTION (Soft CTA)
  const engagementQuestion = getEngagementQuestion(problemType);
  const line7 = `\n${engagementQuestion}`;

  // Line 8: SIGNATURE
  const line8 = `\nJames\nCo-Founder at Saint & Story`;

  return line1 + line2 + line3 + line4 + line5 + line6 + line7 + line8;
}

/**
 * Discovery phrase: "A little birdie told me about..."
 * What we discovered about THEM specifically
 */
function getDiscoveryPhrase(problemType: string, company: string): string {
  const discoveries: Record<string, string> = {
    court_deadline_delivery: `A little birdie told me that ${company} handles critical court deadlines.`,
    legal_document_delivery: `A little birdie told me that ${company} needs documents at court on time.`,
    hospital_supply_delivery: `A little birdie told me that ${company} manages urgent patient care supply chains.`,
    pharmacy_prescription_delivery: `A little birdie told me that ${company} delivers prescriptions daily.`,
    construction_material_delivery: `A little birdie told me that ${company} coordinates site material deliveries.`,
    estate_agent_document_delivery: `A little birdie told me that ${company} closes property deals daily.`,
    restaurant_supply_delivery: `A little birdie told me that ${company} depends on reliable supplier collections.`,
    accounting_file_delivery: `A little birdie told me that ${company} manages tax deadline documents.`,
    architecture_drawing_delivery: `A little birdie told me that ${company} sends plans to construction sites.`,
    veterinary_supply_delivery: `A little birdie told me that ${company} coordinates urgent medication deliveries.`,
    dental_supply_delivery: `A little birdie told me that ${company} relies on lab and supply timing.`,
    retail_stock_delivery: `A little birdie told me that ${company} needs early morning stock delivery.`,
    beauty_supply_delivery: `A little birdie told me that ${company} depends on product availability.`,
    art_gallery_artwork_delivery: `A little birdie told me that ${company} coordinates exhibition openings.`,
    catering_supply_delivery: `A little birdie told me that ${company} sources supplies for events.`,
    manufacturing_part_delivery: `A little birdie told me that ${company} coordinates parts delivery for production.`,
    film_production_equipment: `A little birdie told me that ${company} needs equipment on location fast.`,
    office_supply_delivery: `A little birdie told me that ${company} needs supplies to stay productive.`
  };

  return discoveries[problemType] || `A little birdie told me about ${company}.`;
}

/**
 * Teaching moment: "Working with [INDUSTRY] has taught me one thing. [The real gap]"
 */
function getTeachingMoment(problemType: string): string {
  const teachings: Record<string, string> = {
    court_deadline_delivery: "Filing deadlines are rarely missed because of the legal work itself. They're usually missed when one small dependency becomes the biggest risk.",
    legal_document_delivery: "Legal deadlines fail not because of the law, but because of logistics.",
    hospital_supply_delivery: "Care delays aren't caused by medical complexity. They're caused by supply chain failures.",
    pharmacy_prescription_delivery: "Patient trust isn't lost over medication. It's lost over late delivery.",
    construction_material_delivery: "Projects slip not because of planning. They slip because materials arrive late.",
    estate_agent_document_delivery: "Deals close not because of negotiation. They close because documents arrive on time.",
    restaurant_supply_delivery: "Revenue loss isn't caused by cooking. It's caused by missing ingredients.",
    accounting_file_delivery: "Tax compliance isn't about calculations. It's about delivering documents on deadline.",
    architecture_drawing_delivery: "Building delays aren't about design. They're about getting plans to site on time.",
    veterinary_supply_delivery: "Animal care doesn't fail from medical decisions. It fails from supply delays.",
    dental_supply_delivery: "Dental delays don't come from treatment. They come from missing lab work.",
    retail_stock_delivery: "Store success isn't about products. It's about stock arriving before opening.",
    beauty_supply_delivery: "Client satisfaction doesn't depend on the service. It depends on having the products.",
    art_gallery_artwork_delivery: "Exhibitions succeed or fail based on one thing: whether artwork arrives on time.",
    catering_supply_delivery: "Event success isn't about food quality. It's about ingredients arriving when you need them.",
    manufacturing_part_delivery: "Production targets miss not because of skill. They miss because parts arrive late.",
    film_production_equipment: "Films get made or delayed based on one thing: whether equipment is where it needs to be.",
    office_supply_delivery: "Productivity doesn't fail from work ethic. It fails from running out of essentials."
  };

  return teachings[problemType] || "One thing determines success: reliability.";
}

/**
 * Personalization: "For many firms, that dependency is..."
 */
function getPersonalizationLine(problemType: string, company: string): string {
  const personalizations: Record<string, string> = {
    court_deadline_delivery: `For ${company}, that dependency is the delivery.`,
    legal_document_delivery: `For ${company}, that's document courier reliability.`,
    hospital_supply_delivery: `For ${company}, that's urgent supply delivery.`,
    pharmacy_prescription_delivery: `For ${company}, that's reliable prescription logistics.`,
    construction_material_delivery: `For ${company}, that's on-time material delivery.`,
    estate_agent_document_delivery: `For ${company}, that's completion day document delivery.`,
    restaurant_supply_delivery: `For ${company}, that's same-day supplier collections.`,
    accounting_file_delivery: `For ${company}, that's deadline-day document delivery.`,
    architecture_drawing_delivery: `For ${company}, that's plan delivery to site.`,
    veterinary_supply_delivery: `For ${company}, that's urgent medication delivery.`,
    dental_supply_delivery: `For ${company}, that's lab work and supply timing.`,
    retail_stock_delivery: `For ${company}, that's early morning stock arrival.`,
    beauty_supply_delivery: `For ${company}, that's product availability.`,
    art_gallery_artwork_delivery: `For ${company}, that's secure artwork delivery.`,
    catering_supply_delivery: `For ${company}, that's ingredient sourcing on time.`,
    manufacturing_part_delivery: `For ${company}, that's parts delivery to production.`,
    film_production_equipment: `For ${company}, that's equipment on location fast.`,
    office_supply_delivery: `For ${company}, that's supply delivery when needed.`
  };

  return personalizations[problemType] || `For ${company}, that's reliable delivery.`;
}

/**
 * Credibility statement: "That's why we built Saint & Story..."
 */
function getCredibilityStatement(problemType: string): string {
  const statements: Record<string, string> = {
    court_deadline_delivery: "That's why we built Saint & Story the way we did. If a delivery ever fails with us, we'll take responsibility and cover the re-delivery at no cost to you.",
    legal_document_delivery: "That's why we built Saint & Story around court deadline reliability. Every delivery is backed by our commitment to get it right.",
    hospital_supply_delivery: "That's why we built Saint & Story with medical delivery as the core. We understand that patient care depends on us.",
    pharmacy_prescription_delivery: "That's why we built Saint & Story around prescription reliability. Patient health depends on timing.",
    construction_material_delivery: "That's why we built Saint & Story around construction timelines. We don't just move materials. We move projects forward.",
    estate_agent_document_delivery: "That's why we built Saint & Story around completion day reliability. We know deals close when documents arrive on time.",
    restaurant_supply_delivery: "That's why we built Saint & Story around supply reliability. Your menu depends on us.",
    accounting_file_delivery: "That's why we built Saint & Story around tax deadline certainty. Compliance isn't optional.",
    architecture_drawing_delivery: "That's why we built Saint & Story around construction timelines. Your plans matter.",
    veterinary_supply_delivery: "That's why we built Saint & Story around animal care. Supply reliability means patient care happens on schedule.",
    dental_supply_delivery: "That's why we built Saint & Story around appointment scheduling. Your patients depend on us.",
    retail_stock_delivery: "That's why we built Saint & Story around store readiness. First customers deserve full shelves.",
    beauty_supply_delivery: "That's why we built Saint & Story around client bookings. Product availability keeps revenue flowing.",
    art_gallery_artwork_delivery: "That's why we built Saint & Story around exhibition timing. Openings don't get rescheduled.",
    catering_supply_delivery: "That's why we built Saint & Story around event success. Your reputation depends on us.",
    manufacturing_part_delivery: "That's why we built Saint & Story around production schedules. Quotas depend on us.",
    film_production_equipment: "That's why we built Saint & Story around production timelines. Shoots don't wait.",
    office_supply_delivery: "That's why we built Saint & Story around operational continuity. Your team's productivity matters."
  };

  return statements[problemType] || "That's why we built Saint & Story. Reliability is everything.";
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
