/**
 * Industry + Pressure Prepopulation Engine
 *
 * Structured mapping: Industry → Pressure Scenarios → Email Templates
 * No manual email writing required from operators.
 *
 * RULE: Operators select [Industry] + [Pressure Type]
 * RESULT: System auto-generates scenario + prebuilt email
 */

export interface PressureScenario {
  scenario_id: string;
  title: string;
  description: string;
  observation: string;
  validation_question: string;
}

export interface IndustryPressureMapping {
  industry: string;
  industry_id: string;
  pressure_types: {
    pressure_type: string;
    scenarios: PressureScenario[];
  }[];
}

export const INDUSTRY_PRESSURE_LIBRARY: IndustryPressureMapping[] = [
  {
    industry: "Logistics & Delivery",
    industry_id: "logistics",
    pressure_types: [
      {
        pressure_type: "Delivery delays",
        scenarios: [
          {
            scenario_id: "logistics_peak_clustering",
            title: "Peak-Time Delivery Clustering",
            description: "Multiple deliveries arrive simultaneously during peak hours, creating bottlenecks",
            observation: "Some logistics operations run into timing pressure during parts of the day where delivery demand and route capacity don't line up cleanly.",
            validation_question: "Does that reflect your situation at all?",
          },
          {
            scenario_id: "logistics_last_mile",
            title: "Last-Mile Routing Inefficiency",
            description: "Final delivery leg shows poor routing optimization, creating delays",
            observation: "We see a lot of operations where the last-mile routing tends to create small delays or backlog during peak periods.",
            validation_question: "Is that something you deal with?",
          },
          {
            scenario_id: "logistics_driver_availability",
            title: "Driver Availability Gaps",
            description: "Driver supply doesn't match demand spikes",
            observation: "In logistics, there's usually a mismatch between when you need driver capacity and when it's actually available.",
            validation_question: "Have you run into that?",
          },
        ],
      },
      {
        pressure_type: "Operations chaos",
        scenarios: [
          {
            scenario_id: "logistics_handoff_failure",
            title: "Warehouse-to-Route Handoff Failures",
            description: "Communication gaps between warehouse and routing teams cause coordination issues",
            observation: "When warehouse teams and routing teams need to coordinate tightly, small handoff misses tend to compound during busy periods.",
            validation_question: "Does that happen for you?",
          },
        ],
      },
    ],
  },
  {
    industry: "Restaurants & Food Service",
    industry_id: "restaurants",
    pressure_types: [
      {
        pressure_type: "Delivery delays",
        scenarios: [
          {
            scenario_id: "restaurant_service_backlog",
            title: "Lunch/Dinner Service Backlog Spikes",
            description: "Customer volume during peak service times exceeds kitchen + front-of-house capacity",
            observation: "Most restaurants hit a moment during peak service where customer demand and internal capacity don't line up—creating order backlog and wait time pressure.",
            validation_question: "Is that a real issue for you?",
          },
        ],
      },
      {
        pressure_type: "Operations chaos",
        scenarios: [
          {
            scenario_id: "restaurant_kitchen_timing",
            title: "Kitchen-to-Front-of-House Timing Mismatch",
            description: "Kitchen prep speed doesn't match front-of-house service rhythm",
            observation: "In service environments, there's usually a coordination gap between when food is ready and when servers can deliver it.",
            validation_question: "Have you noticed that pressure?",
          },
          {
            scenario_id: "restaurant_supplier_disruption",
            title: "Supplier Delay Chain Disruption",
            description: "Supplier delays cascade through prep and service",
            observation: "When suppliers run late, it creates a ripple effect through prep and service that's hard to catch in real-time.",
            validation_question: "Is supplier timing something that disrupts your service?",
          },
        ],
      },
    ],
  },
  {
    industry: "Pharmacies & Healthcare",
    industry_id: "pharmacies",
    pressure_types: [
      {
        pressure_type: "Delivery delays",
        scenarios: [
          {
            scenario_id: "pharmacy_morning_surge",
            title: "Prescription Surge During Morning Hours",
            description: "Morning hours create extreme volume spike for prescription filling",
            observation: "Pharmacies typically see a clustering effect in the morning where prescription volume spikes and staff capacity gets stretched.",
            validation_question: "Does that pattern exist in your operation?",
          },
        ],
      },
      {
        pressure_type: "Customer complaints",
        scenarios: [
          {
            scenario_id: "pharmacy_compliance_delays",
            title: "Compliance Verification Delays",
            description: "Insurance/compliance checks create prescription fulfillment delays",
            observation: "Most pharmacies have a moment where compliance verification—insurance checks, prior auth delays—creates a backlog.",
            validation_question: "Is that a real delay source for you?",
          },
        ],
      },
      {
        pressure_type: "Operations chaos",
        scenarios: [
          {
            scenario_id: "pharmacy_stock_replenishment",
            title: "Stock Replenishment Lag",
            description: "Inventory doesn't sync with demand, creating out-of-stock situations",
            observation: "The gap between when you run low on stock and when it actually arrives creates small service interruptions.",
            validation_question: "Is stock coordination something that creates friction?",
          },
        ],
      },
    ],
  },
  {
    industry: "Retail & E-commerce",
    industry_id: "retail",
    pressure_types: [
      {
        pressure_type: "Delivery delays",
        scenarios: [
          {
            scenario_id: "retail_checkout_surge",
            title: "Checkout Queue Surges",
            description: "Customer volume creates checkout bottlenecks",
            observation: "In retail, there's usually a point during peak hours where checkout speed can't keep pace with customer flow.",
            validation_question: "Does that happen during your busy periods?",
          },
        ],
      },
      {
        pressure_type: "Operations chaos",
        scenarios: [
          {
            scenario_id: "retail_fulfillment_bottleneck",
            title: "Online Order Fulfillment Bottlenecks",
            description: "Warehouse-to-customer order fulfillment creates delays",
            observation: "When online orders spike, the time between order and fulfillment tends to stretch.",
            validation_question: "Is fulfillment speed something you optimize for?",
          },
          {
            scenario_id: "retail_stock_mismatch",
            title: "Stock Mismatch Between Systems",
            description: "Physical inventory doesn't match system inventory",
            observation: "Most retail operations have a gap where system stock and actual stock on shelves don't match, especially after busy sales periods.",
            validation_question: "Is inventory accuracy a pain point?",
          },
        ],
      },
    ],
  },
  {
    industry: "Estate Agents & Property",
    industry_id: "estate_agents",
    pressure_types: [
      {
        pressure_type: "Customer complaints",
        scenarios: [
          {
            scenario_id: "estate_enquiry_response",
            title: "Enquiry Response Delays",
            description: "Incoming enquiries pile up faster than they can be responded to",
            observation: "Property enquiries tend to cluster at certain times, and response time becomes a bottleneck—especially for high-volume periods.",
            validation_question: "Does lead response time create friction in your process?",
          },
        ],
      },
      {
        pressure_type: "Operations chaos",
        scenarios: [
          {
            scenario_id: "estate_viewing_overload",
            title: "Viewing Scheduling Overload",
            description: "Viewing appointment coordination creates scheduling chaos",
            observation: "When viewings cluster, coordinating multiple properties, viewers, and available times becomes coordination-heavy.",
            validation_question: "Is viewing coordination something you feel the pressure of?",
          },
          {
            scenario_id: "estate_followup_dropoff",
            title: "Lead Follow-Up Drop-Off",
            description: "Initial leads don't get follow-up attention because team is busy with other tasks",
            observation: "There's often a gap where hot leads from earlier don't get follow-up because the team is handling immediate viewings.",
            validation_question: "Does follow-up consistency become an issue?",
          },
        ],
      },
    ],
  },
  {
    industry: "Professional Services",
    industry_id: "professional_services",
    pressure_types: [
      {
        pressure_type: "Customer complaints",
        scenarios: [
          {
            scenario_id: "services_client_communication",
            title: "Client Communication Response Delays",
            description: "Client requests/queries take too long to be answered",
            observation: "In service work, there's often a lag between when a client asks a question and when they get a substantive response.",
            validation_question: "Is client communication speed something you worry about?",
          },
        ],
      },
      {
        pressure_type: "Operations chaos",
        scenarios: [
          {
            scenario_id: "services_project_handoff",
            title: "Project Handoff Between Team Members",
            description: "Work transitions between team members create information loss",
            observation: "When projects move between team members, there's usually a moment where context gets lost.",
            validation_question: "Have you noticed handoff inefficiencies in your work?",
          },
        ],
      },
    ],
  },
  {
    industry: "Construction & Trades",
    industry_id: "construction",
    pressure_types: [
      {
        pressure_type: "Delivery delays",
        scenarios: [
          {
            scenario_id: "construction_material_delays",
            title: "Material Delivery Delays",
            description: "Job site readiness depends on material arrivals that don't line up",
            observation: "Construction jobs often hit a point where material delivery timing creates idle periods or workflow delays.",
            validation_question: "Is material timing coordination a real issue?",
          },
        ],
      },
      {
        pressure_type: "Operations chaos",
        scenarios: [
          {
            scenario_id: "construction_crew_coordination",
            title: "Crew Coordination Across Multiple Sites",
            description: "Managing crew availability across multiple job sites creates scheduling friction",
            observation: "When you're juggling crews across sites, scheduling conflicts and coordination gaps tend to pile up.",
            validation_question: "Does crew scheduling create operational friction?",
          },
        ],
      },
    ],
  },
];

/**
 * Get pressure scenarios for a specific industry
 */
export function getPressureScenariosForIndustry(
  industry: string
): IndustryPressureMapping | undefined {
  return INDUSTRY_PRESSURE_LIBRARY.find(
    (item) =>
      item.industry_id === industry.toLowerCase() ||
      item.industry === industry
  );
}

/**
 * Get scenarios for a specific pressure type in an industry
 */
export function getPressureScenariosForType(
  industry: string,
  pressureType: string
): PressureScenario[] {
  const industryData = getPressureScenariosForIndustry(industry);
  if (!industryData) return [];

  const pressureData = industryData.pressure_types.find(
    (pt) => pt.pressure_type === pressureType
  );
  return pressureData?.scenarios || [];
}

/**
 * Generate email from industry + pressure + scenario
 */
export function generateEmailFromScenario(scenario: PressureScenario): {
  subject: string;
  body: string;
} {
  return {
    subject: `Quick question about ${scenario.title.toLowerCase()}`,
    body: `${scenario.observation}\n\n${scenario.validation_question}`,
  };
}

/**
 * Get all available industries
 */
export function getAvailableIndustries(): string[] {
  return INDUSTRY_PRESSURE_LIBRARY.map((item) => item.industry);
}

/**
 * Get all pressure types for an industry
 */
export function getPressureTypesForIndustry(industry: string): string[] {
  const industryData = getPressureScenariosForIndustry(industry);
  return industryData?.pressure_types.map((pt) => pt.pressure_type) || [];
}
