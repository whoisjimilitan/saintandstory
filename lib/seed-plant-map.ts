/**
 * SEED PLANT MAP - PROBLEM-BASED
 *
 * Seeds prospect's mind with FUNCTIONAL PROBLEMS they face, not category labels.
 * Focus: The actual need/constraint, not the business type
 * Psychology: "I see your real problem" not "I see you're a [category]"
 *
 * Used in Email Engine v5 to generate recognition moment.
 * More specific, more visceral, more pass-able across roles.
 */

export const SEED_PLANT_MAP: Record<string, (city: string) => string> = {
  // ═══════════════════════════════════════════════════════════════════
  // TIER 1: ULTRA MOTIVATED (Legal/Compliance/Health)
  // ═══════════════════════════════════════════════════════════════════

  solicitor: (city: string) =>
    `I've noticed something with legal document shipments that can't be late. When that brief misses its deadline, the case gets dismissed.`,

  lawyer: (city: string) =>
    `I've noticed something with court filings that have hard deadlines. Miss the window by an hour and the motion gets rejected.`,

  attorney: (city: string) =>
    `I've noticed something with legal service documents that determine case outcomes. If it doesn't arrive on time, the case falls apart.`,

  legal: (city: string) =>
    `I've noticed something with documents that clients are waiting for. When they arrive late, clients lose trust fast.`,

  court: (city: string) =>
    `I've noticed something with legal filings that have court dates. There are no second chances with court deadlines.`,

  bailiff: (city: string) =>
    `I've noticed something with service documents that have court deadlines. If the summons doesn't reach the defendant on time, the case stalls.`,

  process_server: (city: string) =>
    `I've noticed something with papers that need to reach defendants by a certain date. Miss that window and the case never moves forward.`,

  hospital: (city: string) =>
    `I've noticed something with surgical supplies that need to arrive before the operating theatre starts. Delays cascade into cancelled surgeries.`,

  surgical_supplies: (city: string) =>
    `I've noticed something with sterile equipment that needs to be there before the first surgery. If it's not, the OR sits empty.`,

  clinic: (city: string) =>
    `I've noticed something with urgent medical deliveries that patients need today. When they're late, patients suffer.`,

  pharmacy: (city: string) =>
    `I've noticed something with prescriptions that patients need immediately. When those arrive late, people wait in pain.`,

  medical_devices: (city: string) =>
    `I've noticed something with equipment for procedures scheduled tomorrow. If it doesn't arrive on time, the surgery gets postponed.`,

  insurance_company: (city: string) =>
    `I've noticed something with compliance filings that have regulatory deadlines. Miss those and fines follow.`,

  insurance_broker: (city: string) =>
    `I've noticed something with policy documents that clients need before they close. When those are late, deals fall apart.`,

  // ═══════════════════════════════════════════════════════════════════
  // TIER 2: HIGHLY MOTIVATED (Premium/High-Value)
  // ═══════════════════════════════════════════════════════════════════

  film_production: (city: string) =>
    `I've noticed something with camera packages that need to arrive before tomorrow's shoot. If they're late, the production shuts down.`,

  tv_production: (city: string) =>
    `I've noticed something with equipment that has to be there with no time to spare. Late arrivals mean reshoots and wasted crew days.`,

  university_research: (city: string) =>
    `I've noticed something with research samples that can't be repeated. If they arrive damaged or late, months of work gets lost.`,

  auction_house: (city: string) =>
    `I've noticed something with high-value lots that need to arrive before bidding starts. If they miss that window, the auction is compromised.`,

  jewelry_store: (city: string) =>
    `I've noticed something with pieces that need secure, on-time arrival. Late deliveries mean customers walk away angry.`,

  luxury_goods: (city: string) =>
    `I've noticed something with premium items for VIP customers. When those arrive late, you lose the client.`,

  fashion_design: (city: string) =>
    `I've noticed something with pitch samples for buyer meetings. If they don't arrive on time, the order never happens.`,

  // ═══════════════════════════════════════════════════════════════════
  // TIER 3: MOTIVATED (Operational)
  // ═══════════════════════════════════════════════════════════════════

  estate_agent: (city: string) =>
    `I've noticed something with completion documents that close deals. When those arrive late, the sale collapses.`,

  realtor: (city: string) =>
    `I've noticed something with closing documents that have hard deadlines. Miss those and the deal dies.`,

  lettings: (city: string) =>
    `I've noticed something with tenancy documents that need signatures on time. Delays mean the letting stalls.`,

  accounting_firm: (city: string) =>
    `I've noticed something with tax season documents that have April 15 stamped on them. Late submissions mean penalties.`,

  tax_service: (city: string) =>
    `I've noticed something with returns that need to file by the tax deadline. Miss that and your clients get audited.`,

  architecture_firm: (city: string) =>
    `I've noticed something with project plans that keep construction on schedule. If those arrive late, crews sit idle.`,

  construction_company: (city: string) =>
    `I've noticed something with materials that crews are waiting for. Late arrivals cost thousands in crew downtime.`,

  florist: (city: string) =>
    `I've noticed something with wedding flowers that have a 4-hour window. If they arrive outside that window, the wedding looks wrong.`,

  event_planning: (city: string) =>
    `I've noticed something with decorations that arrive before event setup. Late deliveries mean frantic last-minute scrambling.`,

  retail: (city: string) =>
    `I've noticed something with seasonal inventory before the holiday rush. If it's late, you lose the season.`,

  hospitality: (city: string) =>
    `I've noticed something with supplies that arrive before Friday dinner service. Late deliveries mean empty tables.`,

  restaurant: (city: string) =>
    `I've noticed something with ingredients that arrive before service starts. If they're late, you can't open for dinner.`,

  cafe: (city: string) =>
    `I've noticed something with morning deliveries before opening. Late arrivals mean you open late and lose customers.`,

  // Fallback for unknown categories
  default: (city: string) =>
    `I've noticed something with time-sensitive deliveries that matter to your operation. When those arrive late, everything stops.`,
};

export function getSeedPlant(businessType: string, city: string): string {
  const seedPlantFn = SEED_PLANT_MAP[businessType.toLowerCase()] || SEED_PLANT_MAP.default;
  return seedPlantFn(city);
}
