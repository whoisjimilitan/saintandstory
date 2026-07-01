/**
 * SEED PLANT MAP - FUNCTIONAL PROBLEMS
 *
 * Recognition moment: "I see your real operational problem"
 * Not category labels. Not industry speak. Functional consequences.
 *
 * Psychology: Prospect sees themselves BEFORE the email mentions what we do.
 * Structure: "I've noticed something with [functional constraint]"
 *
 * Used in EMAIL ENGINE V5:
 * Seeds prospect's mind → Pain consequence → Our promise → Boldness frame
 */

export const SEED_PLANT_MAP: Record<string, (city: string) => string> = {
  // ═══════════════════════════════════════════════════════════════════
  // TIER 1: CASE/OUTCOME DEPENDENT
  // (One late delivery = case dismissed, patient suffers, fine imposed)
  // ═══════════════════════════════════════════════════════════════════

  solicitor: (city: string) =>
    `legal documents that have court deadlines.`,

  lawyer: (city: string) =>
    `court filings that determine case outcomes.`,

  attorney: (city: string) =>
    `briefs that can't miss their filing deadline.`,

  legal: (city: string) =>
    `documents where one late delivery collapses the case.`,

  court: (city: string) =>
    `service documents that have no second chances.`,

  bailiff: (city: string) =>
    `summons that must reach defendants on time.`,

  process_server: (city: string) =>
    `papers where the deadline decides if a case moves forward.`,

  hospital: (city: string) =>
    `surgical supplies that can't be delayed.`,

  surgical_supplies: (city: string) =>
    `sterile equipment that must arrive before surgery starts.`,

  clinic: (city: string) =>
    `urgent medical deliveries where timing is life-critical.`,

  pharmacy: (city: string) =>
    `prescriptions where delays mean patients wait in pain.`,

  medical_devices: (city: string) =>
    `equipment where one late arrival means postponed procedures.`,

  insurance_company: (city: string) =>
    `compliance filings that have regulatory deadlines.`,

  insurance_broker: (city: string) =>
    `policy documents where delays kill deals.`,

  // ═══════════════════════════════════════════════════════════════════
  // TIER 2: HIGH-VALUE FINANCIAL IMPACT
  // (One late delivery = lost client, production shutdown, significant loss)
  // ═══════════════════════════════════════════════════════════════════

  film_production: (city: string) =>
    `camera equipment where one day late shuts down a shoot.`,

  tv_production: (city: string) =>
    `production gear where delays mean thousands in wasted crew costs.`,

  university_research: (city: string) =>
    `research samples where damage or delay means months of work lost.`,

  auction_house: (city: string) =>
    `high-value lots where timing directly impacts the sale.`,

  jewelry_store: (city: string) =>
    `pieces where late arrival means losing customers.`,

  luxury_goods: (city: string) =>
    `premium items where delays cost you VIP clients.`,

  fashion_design: (city: string) =>
    `samples where one late pitch means the order never happens.`,

  // ═══════════════════════════════════════════════════════════════════
  // TIER 3: DEAL-DEPENDENT
  // (One late delivery = deal collapses, relationship fractures)
  // ═══════════════════════════════════════════════════════════════════

  estate_agent: (city: string) =>
    `completion documents where delays kill sales.`,

  realtor: (city: string) =>
    `closing papers where one day late can collapse a deal.`,

  lettings: (city: string) =>
    `tenancy documents where timing delays the entire letting.`,

  accounting_firm: (city: string) =>
    `tax filings where one late submission means penalties for clients.`,

  tax_service: (city: string) =>
    `returns where missing the deadline means audits.`,

  architecture_firm: (city: string) =>
    `project plans where late deliveries halt construction.`,

  construction_company: (city: string) =>
    `materials where delays cost thousands in crew idle time.`,

  // ═══════════════════════════════════════════════════════════════════
  // TIER 4: TIME-WINDOW DEPENDENT
  // (One late delivery = event ruined, service disrupted, revenue lost)
  // ═══════════════════════════════════════════════════════════════════

  florist: (city: string) =>
    `wedding flowers where the delivery window is exactly 4 hours.`,

  event_planning: (city: string) =>
    `decorations where late arrival means last-minute scrambling.`,

  retail: (city: string) =>
    `seasonal stock where late arrivals lose you the entire season.`,

  hospitality: (city: string) =>
    `supplies where delays mean Friday dinner service gets disrupted.`,

  restaurant: (city: string) =>
    `ingredients where one late delivery means you can't open for service.`,

  cafe: (city: string) =>
    `morning stock where delays mean you open late and lose customers.`,

  // Fallback
  default: (city: string) =>
    `deliveries that directly impact your operation's timeline.`,
};

export function getSeedPlant(businessName: string, city: string): string {
  // Normalize the business name
  let cleanName = businessName
    .toLowerCase()
    // Remove UK postcodes (e.g., EC4Y 0HA)
    .replace(/\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/gi, "")
    // Remove US zipcode (e.g., 12345)
    .replace(/\b\d{5}(?:-\d{4})?\b/g, "")
    // Remove line breaks and extra spaces
    .replace(/\s+/g, " ")
    .trim();

  // Exact matches first
  for (const [key, seedPlantFn] of Object.entries(SEED_PLANT_MAP)) {
    if (key === "default") continue;
    if (cleanName.includes(key.replace(/_/g, " "))) {
      return seedPlantFn(city);
    }
  }

  // Partial matches as fallback
  for (const [key, seedPlantFn] of Object.entries(SEED_PLANT_MAP)) {
    if (key === "default") continue;
    const keywords = key.split("_");
    if (keywords.some((kw) => cleanName.includes(kw))) {
      return seedPlantFn(city);
    }
  }

  // Default fallback
  return SEED_PLANT_MAP.default(city);
}
