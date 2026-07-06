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
 * Generate PROPHETIC email body - THE FINAL BREAKTHROUGH.
 *
 * PERFECT STRUCTURE (psychologically complete + authentically human):
 * 1. Greeting
 * 2. Apology + Discovery (merged for natural flow)
 * 3. Teaching + Reason (connected with "that's why I'm emailing")
 * 4. Personalization (specific to THEM)
 * 5. Credibility/Proof (why we built this)
 * 6. Engagement question (soft CTA)
 * 7. Signature
 * 8. Reply button (in HTML)
 *
 * Psychology: Permission → Recognition → Authority + Reason → Insight → Personalization → Proof → Engagement
 * Authenticity: One person's flowing thought, not a template structure
 */
export function generateEmailBody(brief: GeneratedBrief, input?: BriefInput): string {
  const name = input?.contact_name || "there";
  const company = input?.company_name || "your company";
  const problemType = input?.problem_type || "";
  const problem = getProblemType(problemType);

  if (!problem) {
    return "Brief generation failed.";
  }

  // ============ BUILD THE FINAL BREAKTHROUGH EMAIL ============

  // SECTION 1: GREETING
  const section1 = `Hi ${name},`;

  // SECTION 2: APOLOGY + DISCOVERY (merged for natural flow)
  // "Apologies. I know it's unusual emailing you out of the blue. It's ONLY because a little birdie told me that you handle..."
  const discoveryPhrase = getDiscoveryPhrase(problemType);
  const section2 = `Apologies. I know it's unusual emailing you out of the blue. It's only because ${discoveryPhrase}`;

  // SECTION 3: TEACHING MOMENT (clean, no redundant reason statement)
  // "Working with [INDUSTRY] has taught me one thing. [The real insight]"
  const industryPhrase = getIndustryPhrase(problemType);
  const realInsight = getTeachingMoment(problemType);
  const section3 = `${industryPhrase} has taught me one thing. ${realInsight}`;

  // SECTION 4: PERSONALIZATION (specific to their situation, using company name once)
  const personalizationLine = getPersonalizationLine(problemType, company);
  const section4 = personalizationLine;

  // SECTION 5: CREDIBILITY/PROOF (why we built this)
  const credibilityLine = getCredibilityStatement(problemType);
  const section5 = credibilityLine;

  // SECTION 6: ENGAGEMENT QUESTION (soft CTA)
  const engagementQuestion = getEngagementQuestion(problemType);
  const section6 = engagementQuestion;

  // SECTION 7: SIGNATURE
  const section7 = `James\nCo-Founder at Saint & Story`;

  // ASSEMBLE: Merge sections with blank lines for readability
  return [section1, section2, section3, section4, section5, section6, section7].join("\n\n");
}

/**
 * Discovery phrase: Uses "you handle" instead of company name for personal touch
 * Makes it feel like we're talking TO them, not ABOUT them
 */
function getDiscoveryPhrase(problemType: string): string {
  const discoveries: Record<string, string> = {
    court_deadline_delivery: `a little birdie told me that you handle critical court deadlines.`,
    legal_document_delivery: `a little birdie told me that you need documents at court on time.`,
    hospital_supply_delivery: `a little birdie told me that you manage urgent patient care supply chains.`,
    pharmacy_prescription_delivery: `a little birdie told me that you deliver prescriptions daily.`,
    construction_material_delivery: `a little birdie told me that you coordinate site material deliveries.`,
    estate_agent_document_delivery: `a little birdie told me that you close property deals regularly.`,
    restaurant_supply_delivery: `a little birdie told me that you depend on reliable supplier collections.`,
    accounting_file_delivery: `a little birdie told me that you manage tax deadline documents.`,
    architecture_drawing_delivery: `a little birdie told me that you send plans to construction sites.`,
    veterinary_supply_delivery: `a little birdie told me that you coordinate urgent medication deliveries.`,
    dental_supply_delivery: `a little birdie told me that you rely on lab and supply timing.`,
    retail_stock_delivery: `a little birdie told me that you need early morning stock delivery.`,
    beauty_supply_delivery: `a little birdie told me that you depend on product availability.`,
    art_gallery_artwork_delivery: `a little birdie told me that you coordinate exhibition openings.`,
    catering_supply_delivery: `a little birdie told me that you source supplies for events.`,
    manufacturing_part_delivery: `a little birdie told me that you coordinate parts delivery for production.`,
    film_production_equipment: `a little birdie told me that you need equipment on location fast.`,
    office_supply_delivery: `a little birdie told me that you need supplies to stay productive.`
  };

  return discoveries[problemType] || `a little birdie told me about what you do.`;
}

/**
 * Teaching moment: "Working with [INDUSTRY] has taught me one thing. [The real gap]"
 */
function getTeachingMoment(problemType: string): string {
  const teachings: Record<string, string> = {
    court_deadline_delivery: "Filing deadlines aren't missed because of the law. They're missed because of dependencies that are out of your control.",
    legal_document_delivery: "Legal deadlines fail not because of the law, but because of dependencies that are out of your control.",
    hospital_supply_delivery: "Care delays aren't caused by medical skill. They're caused by dependencies that are out of your control.",
    pharmacy_prescription_delivery: "Patient delays aren't caused by the medication. They're caused by dependencies that are out of your control.",
    construction_material_delivery: "Project delays aren't caused by planning. They're caused by dependencies that are out of your control.",
    estate_agent_document_delivery: "Deals don't fail because of negotiation. They fail because of dependencies that are out of your control.",
    restaurant_supply_delivery: "Revenue loss isn't caused by your cooking. It's caused by dependencies that are out of your control.",
    accounting_file_delivery: "Tax compliance isn't about calculations. It's about dependencies that are out of your control.",
    architecture_drawing_delivery: "Building delays aren't about design. They're caused by dependencies that are out of your control.",
    veterinary_supply_delivery: "Animal care doesn't fail from medical skill. It fails because of dependencies that are out of your control.",
    dental_supply_delivery: "Dental delays don't come from treatment. They come from dependencies that are out of your control.",
    retail_stock_delivery: "Store success isn't about your products. It's about dependencies that are out of your control.",
    beauty_supply_delivery: "Client satisfaction doesn't depend on your service. It depends on dependencies that are out of your control.",
    art_gallery_artwork_delivery: "Exhibition success isn't about the art. It's about dependencies that are out of your control.",
    catering_supply_delivery: "Event success isn't about food quality. It's about dependencies that are out of your control.",
    manufacturing_part_delivery: "Production targets miss not because of skill. They miss because of dependencies that are out of your control.",
    film_production_equipment: "Films get made or delayed not because of talent. They depend on things out of your control.",
    office_supply_delivery: "Productivity doesn't fail from work ethic. It fails because of dependencies that are out of your control."
  };

  return teachings[problemType] || "Success always depends on one thing: dependencies you can't control.";
}

/**
 * Personalization: ALWAYS "For [COMPANY], that dependency is delivery."
 * This reveals the core insight: their dependency is always delivery.
 */
function getPersonalizationLine(problemType: string, company: string): string {
  return `For ${company}, that dependency is delivery.`;
}

/**
 * Credibility statement: Bold promise + assurance
 * "Delivery won't fail with us. If a delivery ever fails with us, we'll take responsibility..."
 */
function getCredibilityStatement(problemType: string): string {
  const statements: Record<string, string> = {
    court_deadline_delivery: "That's why we built Saint & Story. Delivery won't fail with us. If a delivery ever fails, we take responsibility and cover the re-delivery at no cost.",
    legal_document_delivery: "That's why we built Saint & Story around court deadline reliability. Delivery won't fail with us. Every delivery is backed by our commitment to get it right.",
    hospital_supply_delivery: "That's why we built Saint & Story with medical delivery as the core. Delivery won't fail with us. We understand that patient care depends on us.",
    pharmacy_prescription_delivery: "That's why we built Saint & Story around prescription reliability. Delivery won't fail with us. Patient health depends on timing.",
    construction_material_delivery: "That's why we built Saint & Story around construction timelines. Delivery won't fail with us. We don't just move materials. We move projects forward.",
    estate_agent_document_delivery: "That's why we built Saint & Story around completion day reliability. Delivery won't fail with us. We know deals close when documents arrive on time.",
    restaurant_supply_delivery: "That's why we built Saint & Story around supply reliability. Delivery won't fail with us. Your menu depends on us.",
    accounting_file_delivery: "That's why we built Saint & Story around tax deadline certainty. Delivery won't fail with us. Compliance isn't optional.",
    architecture_drawing_delivery: "That's why we built Saint & Story around construction timelines. Delivery won't fail with us. Your plans matter.",
    veterinary_supply_delivery: "That's why we built Saint & Story around animal care. Delivery won't fail with us. Supply reliability means patient care happens on schedule.",
    dental_supply_delivery: "That's why we built Saint & Story around appointment scheduling. Delivery won't fail with us. Your patients depend on us.",
    retail_stock_delivery: "That's why we built Saint & Story around store readiness. Delivery won't fail with us. First customers deserve full shelves.",
    beauty_supply_delivery: "That's why we built Saint & Story around client bookings. Delivery won't fail with us. Product availability keeps revenue flowing.",
    art_gallery_artwork_delivery: "That's why we built Saint & Story around exhibition timing. Delivery won't fail with us. Openings don't get rescheduled.",
    catering_supply_delivery: "That's why we built Saint & Story around event success. Delivery won't fail with us. Your reputation depends on us.",
    manufacturing_part_delivery: "That's why we built Saint & Story around production schedules. Delivery won't fail with us. Quotas depend on us.",
    film_production_equipment: "That's why we built Saint & Story around production timelines. Delivery won't fail with us. Shoots don't wait.",
    office_supply_delivery: "That's why we built Saint & Story around operational continuity. Delivery won't fail with us. Your team's productivity matters."
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
