/**
 * SEED PLANT MAP
 *
 * Seeds prospect's mind with their specific fears/concerns BEFORE stating pain.
 * Pattern: routine_concern → real_concern → specific_example_1 → specific_example_2
 * Voice: Observational, conversational, not prescriptive
 *
 * Used in Email Engine v4 to generate the first layer of psychological presupposition.
 * Plants the idea in prospect's mind, then pain statement lands harder.
 */

export const SEED_PLANT_MAP: Record<string, (city: string) => string> = {
  // ═══════════════════════════════════════════════════════════════════
  // TIER 1: ULTRA MOTIVATED (Legal/Compliance/Health)
  // ═══════════════════════════════════════════════════════════════════

  solicitor: (city: string) =>
    `I've noticed something with solicitors in ${city}: You're not worried about routine deliveries. You're worried about deadlines that'll close a deal or lose a case. The document that needs to land by 4pm Friday. The filing that has a court date.`,

  lawyer: (city: string) =>
    `I've noticed something with lawyers in ${city}: You're not worried about regular mail runs. You're worried about filings that can't be late. The brief that's due at court. The motion that has a deadline.`,

  attorney: (city: string) =>
    `I've noticed something with attorneys in ${city}: You're not worried about routine shipments. You're worried about deadlines that'll lose a case or dismiss litigation. The filing packet that needs to land by Friday. The evidence that has a court date.`,

  legal: (city: string) =>
    `I've noticed something with legal firms in ${city}: You're not worried about standard mail. You're worried about deadline deliveries. The documents that clients are waiting for. The filings that have court dates.`,

  court: (city: string) =>
    `I've noticed something with court services in ${city}: You're not worried about standard deliveries. You're worried about legal documents that can't be late. The service that needs to happen by a certain date. The court filing that has no second chances.`,

  bailiff: (city: string) =>
    `I've noticed something with bailiff services in ${city}: You're not worried about regular pickups. You're worried about service deliveries that have court deadlines. The notice that needs to be served by Friday. The summons that the defendant can't escape.`,

  process_server: (city: string) =>
    `I've noticed something with process servers in ${city}: You're not worried about routine deliveries. You're worried about service documents that have legal deadlines. The papers that need to reach the defendant by a certain date. The evidence that determines if a case moves forward.`,

  hospital: (city: string) =>
    `I've noticed something with hospitals in ${city}: You're not worried about regular supply runs. You're worried about surgical supplies that can't be delayed. The operating theatre equipment that needs to arrive before surgery. The patient care materials that have zero margin for error.`,

  surgical_supplies: (city: string) =>
    `I've noticed something with surgical supply companies in ${city}: You're not worried about routine deliveries. You're worried about supplies for tomorrow's operation. The sterile equipment that needs to arrive before the first case. The implants that have a scheduled time.`,

  clinic: (city: string) =>
    `I've noticed something with clinics in ${city}: You're not worried about standard supply runs. You're worried about urgent medical deliveries. The prescription that needs to reach a patient today. The urgent care supplies that have no time buffer.`,

  pharmacy: (city: string) =>
    `I've noticed something with pharmacies in ${city}: You're not worried about regular stock deliveries. You're worried about urgent prescriptions that can't wait. The medication that a patient needs today. The prescription that a patient's family is calling about.`,

  medical_devices: (city: string) =>
    `I've noticed something with medical device companies in ${city}: You're not worried about routine deliveries. You're worried about devices for urgent procedures. The equipment that a hospital needs for tomorrow's surgery. The device that will be used in a patient's care.`,

  insurance_company: (city: string) =>
    `I've noticed something with insurance companies in ${city}: You're not worried about regular mail. You're worried about audit deliveries and compliance filings. The regulatory documentation that has a deadline. The audit materials that regulators are waiting for.`,

  insurance_broker: (city: string) =>
    `I've noticed something with insurance brokers in ${city}: You're not worried about routine documents. You're worried about policy deliveries that clients need urgently. The coverage documents that a client needs before they close. The compliance filing that has a regulatory deadline.`,

  // ═══════════════════════════════════════════════════════════════════
  // TIER 2: HIGHLY MOTIVATED (Premium/High-Value)
  // ═══════════════════════════════════════════════════════════════════

  film_production: (city: string) =>
    `I've noticed something with film production in ${city}: You're not worried about routine equipment. You're worried about that one delivery that can't be late—the camera package for tomorrow's shoot. The lighting rig for the big day. The equipment that makes or breaks the production.`,

  tv_production: (city: string) =>
    `I've noticed something with TV production in ${city}: You're not worried about regular equipment runs. You're worried about set pieces and equipment for shoot day. The props that arrive with no time to spare. The production gear that's needed before cameras roll.`,

  university_research: (city: string) =>
    `I've noticed something with university research teams in ${city}: You're not worried about regular shipments. You're worried about research samples that can't be repeated. The experiment materials for tomorrow's test. The grant-dependent samples that have a critical window.`,

  auction_house: (city: string) =>
    `I've noticed something with auction houses in ${city}: You're not worried about standard deliveries. You're worried about high-value items on auction day. The lot that needs to arrive before bidding starts. The pieces that have buyers waiting.`,

  jewelry_store: (city: string) =>
    `I've noticed something with jewelry stores in ${city}: You're not worried about routine stock. You're worried about high-value deliveries and security. The pieces that customers have paid for. The inventory that needs secure, on-time arrival.`,

  luxury_goods: (city: string) =>
    `I've noticed something with luxury retailers in ${city}: You're not worried about regular shipments. You're worried about premium items for VIP clients. The luxury goods that a customer has already bought. The delivery that determines if they come back.`,

  fashion_design: (city: string) =>
    `I've noticed something with fashion designers in ${city}: You're not worried about routine samples. You're worried about pitch samples that arrive on time. The collection pieces for a buyer meeting. The designs that'll land the order.`,

  // ═══════════════════════════════════════════════════════════════════
  // TIER 3: MOTIVATED (Operational)
  // ═══════════════════════════════════════════════════════════════════

  estate_agent: (city: string) =>
    `I've noticed something with estate agents in ${city}: You're not worried about routine property moves. You're worried about completion documents that need to arrive by Friday. The contracts that close the deal. The paperwork that locks in your commission.`,

  realtor: (city: string) =>
    `I've noticed something with realtors in ${city}: You're not worried about standard deliveries. You're worried about closing documents that have a deadline. The deed that needs to reach the buyer by closing day. The paperwork that finalizes the sale.`,

  lettings: (city: string) =>
    `I've noticed something with lettings agencies in ${city}: You're not worried about routine mail. You're worried about tenancy documents with deadlines. The agreements that need to reach tenants on time. The paperwork that keeps the letting moving.`,

  accounting_firm: (city: string) =>
    `I've noticed something with accounting firms in ${city}: You're not worried about routine mail. You're worried about tax season deliveries. The client documents that need to reach the office by tax deadline. The filings that clients are counting on.`,

  tax_service: (city: string) =>
    `I've noticed something with tax services in ${city}: You're not worried about regular deliveries. You're worried about deadline season pickups. The tax documents that clients need filed by April 15th. The return materials that have a hard stop.`,

  architecture_firm: (city: string) =>
    `I've noticed something with architecture firms in ${city}: You're not worried about routine deliveries. You're worried about project plans that have deadlines. The drawings that need to reach the contractor. The blueprints that keep the project on schedule.`,

  construction_company: (city: string) =>
    `I've noticed something with construction companies in ${city}: You're not worried about regular supply runs. You're worried about materials that keep the site moving. The supplies that a crew is waiting for. The equipment that determines if you stay on schedule.`,

  florist: (city: string) =>
    `I've noticed something with florists in ${city}: You're not worried about routine deliveries. You're worried about event flowers that can't wait. The arrangement that needs to arrive before the wedding. The flowers that a customer is counting on.`,

  event_planning: (city: string) =>
    `I've noticed something with event planners in ${city}: You're not worried about regular deliveries. You're worried about event day materials. The decorations that need to arrive before setup. The supplies that an event is depending on.`,

  retail: (city: string) =>
    `I've noticed something with retail stores in ${city}: You're not worried about routine stock. You're worried about seasonal inventory. The stock that needs to arrive before the holiday rush. The merchandise that customers are coming in to buy.`,

  hospitality: (city: string) =>
    `I've noticed something with hospitality businesses in ${city}: You're not worried about regular deliveries. You're worried about urgent supply needs. The inventory that a restaurant needs by Friday dinner service. The supplies that guests are expecting.`,

  restaurant: (city: string) =>
    `I've noticed something with restaurants in ${city}: You're not worried about routine supply runs. You're worried about ingredient deliveries for service. The fresh stock that needs to arrive before dinner. The supplies that diners are counting on.`,

  cafe: (city: string) =>
    `I've noticed something with cafes in ${city}: You're not worried about regular stock. You're worried about morning deliveries before opening. The ingredients that customers need in their morning coffee. The supplies that determine your opening time.`,

  // Fallback for unknown categories
  default: (city: string) =>
    `I've noticed something with businesses in ${city}: You're not worried about routine operations. You're worried about time-sensitive deliveries that matter to your bottom line.`,
};

export function getSeedPlant(businessType: string, city: string): string {
  const seedPlantFn = SEED_PLANT_MAP[businessType.toLowerCase()] || SEED_PLANT_MAP.default;
  return seedPlantFn(city);
}
