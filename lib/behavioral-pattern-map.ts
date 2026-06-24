/**
 * BEHAVIORAL PATTERN MAP
 *
 * Maps industry-specific behavioral markers that reveal delivery/logistics problems.
 * NOT common challenges. NOT generic pain points.
 *
 * Instead: What specific behaviors does someone exhibit when they have THIS problem?
 * What would they be DOING? What would they say? What would they worry about?
 *
 * Permission lines are generated from these patterns, not from problem lists.
 *
 * EVERY INDUSTRY MOVES SOMETHING.
 * These patterns capture how they experience delivery/logistics friction.
 */

export type IndustryType =
  | "law-firm"
  | "ecommerce"
  | "healthcare"
  | "manufacturing"
  | "logistics"
  | "retail"
  | "restaurant"
  | "professional-services"
  | "florist"
  | "catering"
  | "photography"
  | "beauty-cosmetics"
  | "pharmaceutical"
  | "agriculture"
  | "construction"
  | "hvac"
  | "plumbing"
  | "electrical"
  | "moving"
  | "events"
  | "automotive"
  | "veterinary"
  | "fitness"
  | "hotel"
  | "bank"
  | "dental"
  | "spa-wellness"
  | "salon"
  | "bookstore"
  | "furniture"
  | "electronics"
  | "office-supplies"
  | "hardware"
  | "grocery-distribution"
  | "beverage"
  | "bakery"
  | "coffee-shop"
  | "bar"
  | "laundry-dry-cleaning"
  | "printing"
  | "advertising"
  | "design-studio"
  | "software"
  | "it-services"
  | "accounting"
  | "consulting"
  | "real-estate"
  | "recruitment"
  | "university"
  | "school"
  | "daycare"
  | "nursing-home"
  | "mental-health"
  | "pet-store"
  | "grooming"
  | "gym"
  | "sports-facility"
  | "zoo"
  | "theater"
  | "concert-venue"
  | "sports-team"
  | "tattoo"
  | "piercing"
  | "barber"
  | "animal-shelter"
  | "art-gallery"
  | "museum"
  | "chemical-distribution"
  | "security"
  | "government-agency"
  | "nonprofit"
  | "insurance"
  | "financial-services"
  | "travel-agency"
  | "car-rental"
  | "taxi-service"
  | "publishing"
  | "training"
  | "art-supplies"
  | "gift-shop"
  | "antique"
  | "vintage"
  | "jewelry"
  | "watch"
  | "bridal"
  | "costume"
  | "fabric"
  | "craft"
  | "pet-services"
  | "dog-walking"
  | "pet-training"
  | "aquarium"
  | "theme-park"
  | "cinema"
  | "streaming"
  | "gaming"
  | "esports"
  | "music-studio"
  | "recording"
  | "podcast"
  | "video-production"
  | "photography-studio"
  | "wedding"
  | "party-rental"
  | "entertainment"
  | "dj-service"
  | "music-lessons"
  | "dance-studio"
  | "martial-arts"
  | "yoga-studio"
  | "pilates"
  | "coaching"
  | "therapy"
  | "counseling"
  | "dental-laboratory"
  | "medical-device"
  | "laboratory"
  | "testing"
  | "inspection"
  | "surveying"
  | "architecture"
  | "engineering"
  | "environmental"
  | "waste-management"
  | "recycling"
  | "solar"
  | "renewable-energy"
  | "utility"
  | "telecom"
  | "isp"
  | "datacenter"
  | "cloud-services"
  | "hosting"
  | "saas"
  | "finance-tech"
  | "crypto"
  | "trading"
  | "investment"
  | "wealth-management"
  | "mortgage"
  | "loans"
  | "payroll"
  | "accounting-firm"
  | "tax"
  | "audit"
  | "compliance"
  | "legal-tech"
  | "paralegal"
  | "notary"
  | "translation"
  | "interpretation"
  | "writing"
  | "editing"
  | "proofreading"
  | "transcription"
  | "podcast-production"
  | "voiceover"
  | "acting"
  | "modeling"
  | "talent-agency"
  | "casting"
  | "production-house"
  | "animation"
  | "vfx"
  | "3d-printing"
  | "additive-manufacturing"
  | "rapid-prototyping"
  | "machine-shop"
  | "welding"
  | "metal-fabrication"
  | "woodworking"
  | "carpentry"
  | "masonry"
  | "roofing"
  | "painting"
  | "landscaping"
  | "nursery"
  | "garden-center"
  | "greenhouse"
  | "aquaculture"
  | "hydroponics"
  | "mushroom-farming"
  | "beekeeping"
  | "vineyard"
  | "winery"
  | "distillery"
  | "brewery"
  | "craft-brewery"
  | "coffee-roaster"
  | "tea-importer"
  | "spice-distributor"
  | "candy-manufacturer"
  | "chocolate"
  | "ice-cream"
  | "dairy"
  | "meat-processing"
  | "seafood"
  | "fishery"
  | "farm"
  | "organic"
  | "cold-storage"
  | "warehouse"
  | "fulfillment"
  | "reverse-logistics"
  | "export-import"
  | "shipping"
  | "freight"
  | "distribution-center"
  | "port-operator"
  | "customs-broker"
  | "consolidator"
  | "third-party-logistics"
  | "last-mile"
  | "courier"
  | "parcel"
  | "mail"
  | "package"
  | "overnight"
  | "food-delivery"
  | "grocery-delivery"
  | "pharmacy-delivery"
  | "medical-delivery"
  | "blood-bank"
  | "organ-transplant"
  | "tissue-bank"
  | "specimen-transport";

export interface BehavioralPattern {
  // What specific action reveals the problem?
  behavior: string;

  // Permission line that references this behavior
  permissionLine: string;

  // Emotional resonance - what feeling does this trigger?
  emotion: "frustration" | "anxiety" | "embarrassment" | "urgency" | "powerlessness";

  // Geographic variation (optional) - how does location change the pattern?
  locationVariation?: {
    UK?: string;
    London?: string;
    regional?: string;
  };
}

export const behavioralPatternMap: Record<IndustryType, BehavioralPattern[]> = {
  "law-firm": [
    {
      behavior: "Partner personally driving documents to court",
      permissionLine:
        "If you haven't had to personally deliver documents to court in the last quarter, you don't need us.",
      emotion: "embarrassment",
      locationVariation: {
        London:
          "If your partners haven't personally driven to the Old Bailey in the last month, this isn't for you.",
      },
    },
    {
      behavior: "Losing client trust due to late filings",
      permissionLine:
        "If clients still trust your delivery timeline, keep doing what you're doing.",
      emotion: "anxiety",
    },
    {
      behavior: "Paying premium rates for urgent same-day courier",
      permissionLine:
        "If you're not regularly paying rush fees for urgent filings, ignore this.",
      emotion: "frustration",
    },
  ],

  ecommerce: [
    {
      behavior: "Paying premium rush fees during peak season",
      permissionLine:
        "If you're not paying surge pricing during peak season, you're not at scale yet.",
      emotion: "frustration",
      locationVariation: {
        UK: "If you're handling Black Friday without calling backup couriers, you've got a secret.",
      },
    },
    {
      behavior: "Primary courier hitting capacity limits",
      permissionLine:
        "If your main courier still has spare capacity in November, you're growing slower than expected.",
      emotion: "powerlessness",
    },
    {
      behavior: "Turning away orders due to delivery constraints",
      permissionLine:
        "If you've never had to tell a customer 'sorry, we can't ship that today', you're not growing fast enough.",
      emotion: "embarrassment",
    },
  ],

  healthcare: [
    {
      behavior: "Medication shortages affecting patient care",
      permissionLine:
        "If you've never had a medication delivery impact patient timelines, you're managing something simpler than most healthcare operations.",
      emotion: "anxiety",
    },
    {
      behavior: "Calling multiple couriers to find temperature control capability",
      permissionLine:
        "If your procurement team isn't juggling multiple courier services to find temperature control, this might not be relevant.",
      emotion: "frustration",
    },
    {
      behavior: "Paying premium for urgent medical supply delivery",
      permissionLine:
        "If emergency supply deliveries aren't a regular line item in your budget, you're either lucky or smaller than we usually work with.",
      emotion: "powerlessness",
    },
  ],

  manufacturing: [
    {
      behavior: "Production line idle waiting for courier delivery",
      permissionLine:
        "If your production line hasn't sat idle waiting for a parts delivery, you've got an unusually reliable supplier.",
      emotion: "powerlessness",
      locationVariation: {
        UK: "If you haven't had to pause manufacturing while waiting for courier pickup from your supplier, your supply chain is tighter than most.",
      },
    },
    {
      behavior: "Unable to take new orders due to courier capacity constraints",
      permissionLine:
        "If courier availability isn't limiting your ability to take new contracts, you're not at capacity yet.",
      emotion: "frustration",
    },
    {
      behavior: "Supply chain delays causing missed deadlines to customers",
      permissionLine:
        "If your delivery delays to customers aren't linked to courier issues, stop reading.",
      emotion: "anxiety",
    },
  ],

  logistics: [
    {
      behavior: "Turning down work because driver capacity is maxed",
      permissionLine:
        "If you haven't had to say 'sorry, we're fully booked' to a good customer this quarter, you're underutilized.",
      emotion: "frustration",
      locationVariation: {
        London:
          "If your London operation isn't regularly at capacity during peak hours, you're not charging enough.",
      },
    },
    {
      behavior: "Drivers working consistent overtime during peak periods",
      permissionLine:
        "If your drivers aren't regularly working overtime on Thursdays and Fridays, you're not handling typical volume.",
      emotion: "powerlessness",
    },
    {
      behavior: "Unable to handle route overflow without external help",
      permissionLine:
        "If overflow routes aren't a weekly reality, your customers probably aren't pushing you hard enough.",
      emotion: "frustration",
    },
  ],

  retail: [
    {
      behavior: "Store managers texting about urgent stock shortages",
      permissionLine:
        "If your store managers aren't texting about urgent stock gaps on weekends, your locations aren't busy enough.",
      emotion: "urgency",
      locationVariation: {
        London:
          "If you're not getting emergency stock requests from London stores during busy shopping periods, your inventory system is overstocked.",
      },
    },
    {
      behavior: "Unable to fulfill customer orders due to delivery delays",
      permissionLine:
        "If you've never had to tell a customer 'we're out of stock and can't get it until next week', you're managing small volumes.",
      emotion: "embarrassment",
    },
    {
      behavior: "Paying premium for next-day stock delivery",
      permissionLine:
        "If you're not regularly paying next-day courier rates to prevent stock-outs, you're either overstocked or not growing.",
      emotion: "frustration",
    },
  ],

  restaurant: [
    {
      behavior: "Menu improvisation due to failed ingredient delivery",
      permissionLine:
        "If you haven't had to improvise a menu because an ingredient delivery failed, your suppliers are either perfect or you're not busy enough.",
      emotion: "embarrassment",
      locationVariation: {
        London:
          "If you've never had to change your specials because a Friday night delivery didn't arrive, you're running a quiet kitchen.",
      },
    },
    {
      behavior: "Paying emergency premium rates for mid-service ingredient delivery",
      permissionLine:
        "If you haven't paid rush delivery fees during service hours, your suppliers are unusually reliable.",
      emotion: "frustration",
    },
    {
      behavior: "Losing revenue due to ingredient unavailability",
      permissionLine:
        "If supply delays aren't costing you covers during peak service, your menu flexibility is solving a problem most restaurants don't have.",
      emotion: "powerlessness",
    },
  ],

  "professional-services": [
    {
      behavior: "Personally delivering client deliverables due to courier delays",
      permissionLine:
        "If you haven't personally delivered a client report to meet a deadline, your clients are probably forgiving or you're not pushing delivery timelines.",
      emotion: "embarrassment",
    },
    {
      behavior: "Apologizing to clients for late deliveries",
      permissionLine:
        "If you haven't had to apologize to a client for a late delivery affecting their timeline, you're either early-bird shippers or not client-facing enough.",
      emotion: "anxiety",
    },
    {
      behavior: "Paying premium courier costs to maintain client credibility",
      permissionLine:
        "If maintaining delivery credibility to clients isn't a regular expense, your service guarantees probably aren't aggressive.",
      emotion: "frustration",
    },
  ],
};

/**
 * Generate a Stage 1 Permission line based on industry and location
 *
 * Returns the most psychologically resonant behavioral pattern for that industry,
 * optionally adapted for location.
 */
export function generatePermissionLine(
  industry: IndustryType,
  location?: string
): string {
  const patterns = behavioralPatternMap[industry];

  if (!patterns || patterns.length === 0) {
    return "If you're already happy with your current logistics setup, no need to read further.";
  }

  // Select the first pattern (highest emotional resonance)
  const pattern = patterns[0];

  // If location is London or UK, use location-specific variation if available
  if (location && pattern.locationVariation) {
    if (location.toLowerCase().includes("london") && pattern.locationVariation.London) {
      return pattern.locationVariation.London;
    }
    if (location.toLowerCase().includes("uk") && pattern.locationVariation.UK) {
      return pattern.locationVariation.UK;
    }
  }

  return pattern.permissionLine;
}

/**
 * Get all behavioral patterns for an industry
 * Useful for understanding what this business is probably experiencing
 */
export function getBehavioralPatterns(industry: IndustryType): BehavioralPattern[] {
  return behavioralPatternMap[industry] || [];
}
