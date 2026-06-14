import { LeadActionCard } from "@/components/leads/LeadActionCard";
import { ReadyTodayCard } from "@/components/leads/ReadyTodayCard";

// Mock data for demo purposes
const mockLeadA1 = {
  id: "lead-a1",
  businessName: "ABC Florist - London",
  category: "florist",
  tier: "A" as const,
  score: 92,
  email: "sales@abcflorist.co.uk",
  phone: "020-1234-5678",
  website: "https://abcflorist.co.uk",
  challenges: [
    "Finding reliable supplier networks",
    "Managing seasonal demand",
    "Reducing customer acquisition costs",
  ],
  opportunities: [
    "Automated subscription deliveries",
    "Wedding/event specific marketing",
    "Customer loyalty program automation",
  ],
  painPoint:
    "We struggle with consistent supply during peak seasons and lose customers to bigger chains",
  reviewRating: 4.3,
  primaryAngle: "lead-generation",
  primaryHook: "More event bookings = more revenue per customer per month",
  secondaryAngle: "customer-retention",
  secondaryHook: "Keep customers coming back = lifetime value increases",
  angleReasoning:
    "Florists live on event orders and repeat customers. Lead generation gets them in the door.",
  emailSubject: "ABC Florist - More event bookings strategy",
  emailBody: `Hi,

I work with florists across London. One thing I keep hearing: more event bookings = consistent revenue stream.

ABC Florist has strong reviews (4.3⭐) which means quality is there. The challenge is getting events in the door consistently.

I've helped similar florists add 3-5 wedding bookings per month just by improving how they're found online.

Would you be open to a quick chat about what's working for others?

Cheers,
James`,
};

const mockLeadA2 = {
  id: "lead-a2",
  businessName: "XYZ Accountants",
  category: "accountant",
  tier: "A" as const,
  score: 85,
  email: "info@xyzaccounts.co.uk",
  phone: "0121-1234-5678",
  website: "https://xyzaccounts.co.uk",
  challenges: [
    "Attracting high-value clients",
    "Improving client communication",
    "Building recurring revenue",
  ],
  opportunities: [
    "Client intake automation",
    "Matter management systems",
    "Client portal and communication",
  ],
  painPoint:
    "We're spending too much time on administrative work instead of billable hours",
  reviewRating: 4.7,
  primaryAngle: "revenue-growth",
  primaryHook: "Recurring client relationships = stable revenue per month",
  secondaryAngle: "automation",
  secondaryHook: "Less admin time = more billable hours = higher profitability",
  angleReasoning:
    "Law practices benefit most from recurring revenue and client stickiness.",
  emailSubject: "Recurring revenue strategy for XYZ Accountants",
  emailBody: `Hi,

I work with accountants across the Midlands. One thing distinguishes growing practices: recurring client relationships.

XYZ Accountants has excellent reviews (4.7⭐) which shows client trust is strong. The growth opportunity is in deepening those relationships.

I've helped similar firms add recurring revenue through better client engagement systems.

Worth a 15-minute call?

Best,
James`,
};

const mockLeadB1 = {
  id: "lead-b1",
  businessName: "DEF Dental Practice",
  category: "dental",
  tier: "B" as const,
  score: 68,
  email: "reception@defdentalcare.co.uk",
  phone: "0161-9876-5432",
  challenges: [
    "Attracting new patients",
    "Managing appointment no-shows",
    "Building patient retention",
  ],
  opportunities: [
    "Patient acquisition campaigns",
    "Appointment reminder automation",
    "Referral program management",
  ],
  painPoint:
    "New patient acquisition is expensive and appointment no-shows are killing profitability",
  reviewRating: 4.1,
  primaryAngle: "lead-generation",
  primaryHook: "More new patients = full schedule = predictable income",
  angleReasoning:
    "Dental practices have high lifetime value per patient. New patient acquisition is the growth lever.",
  emailSubject: "More new patients for DEF Dental Practice",
  emailBody: `Hi,

Working with dental practices across Manchester. Most tell us: more new patient bookings = full schedule = predictable revenue.

DEF Dental has good reviews (4.1⭐) which builds trust. Getting those first 5-10 new patients per month consistently is the challenge.

I've helped similar practices increase new patient bookings by 30% with targeted strategies.

Quick chat?

Best`,
};

const mockLeadC1 = {
  id: "lead-c1",
  businessName: "GHI Event Management",
  category: "event-organiser",
  tier: "C" as const,
  score: 45,
  email: "contact@ghievents.co.uk",
  challenges: [
    "Finding consistent event bookings",
    "Managing vendor coordination",
  ],
  opportunities: ["Event booking platforms", "Client collaboration tools"],
  emailSubject: "Event booking growth strategy",
  emailBody: `Hi,

We work with event organizers helping them get more bookings.

Interested in a quick chat?`,
};

export default function UIPreviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Lead Card UI System
          </h1>
          <p className="text-gray-600">
            Internal preview of lead decision card components. Not production.
          </p>
        </div>

        {/* READY TODAY SECTION */}
        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              🟢 READY TODAY Queue
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Tier A leads with score &gt;= 30. Top priority for outreach.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReadyTodayCard
              id={mockLeadA1.id}
              businessName={mockLeadA1.businessName}
              category={mockLeadA1.category}
              score={mockLeadA1.score}
              email={mockLeadA1.email}
              phone={mockLeadA1.phone}
              primaryHook={mockLeadA1.primaryHook}
              emailSubject={mockLeadA1.emailSubject}
              emailBody={mockLeadA1.emailBody}
              onMarkContacted={() =>
                console.log("Marked contacted:", mockLeadA1.id)
              }
            />
            <ReadyTodayCard
              id={mockLeadA2.id}
              businessName={mockLeadA2.businessName}
              category={mockLeadA2.category}
              score={mockLeadA2.score}
              email={mockLeadA2.email}
              phone={mockLeadA2.phone}
              primaryHook={mockLeadA2.primaryHook}
              emailSubject={mockLeadA2.emailSubject}
              emailBody={mockLeadA2.emailBody}
              onMarkContacted={() =>
                console.log("Marked contacted:", mockLeadA2.id)
              }
            />
          </div>
        </section>

        {/* TIER A DETAILED CARDS */}
        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              🔴 Tier A Full Detail Cards
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete lead action cards with all sections.
            </p>
          </div>
          <div className="space-y-6">
            <LeadActionCard
              id={mockLeadA1.id}
              businessName={mockLeadA1.businessName}
              category={mockLeadA1.category}
              tier={mockLeadA1.tier}
              score={mockLeadA1.score}
              email={mockLeadA1.email}
              phone={mockLeadA1.phone}
              website={mockLeadA1.website}
              challenges={mockLeadA1.challenges}
              opportunities={mockLeadA1.opportunities}
              painPoint={mockLeadA1.painPoint}
              reviewRating={mockLeadA1.reviewRating}
              primaryAngle={mockLeadA1.primaryAngle}
              primaryHook={mockLeadA1.primaryHook}
              secondaryAngle={mockLeadA1.secondaryAngle}
              secondaryHook={mockLeadA1.secondaryHook}
              angleReasoning={mockLeadA1.angleReasoning}
              emailSubject={mockLeadA1.emailSubject}
              emailBody={mockLeadA1.emailBody}
              onMarkContacted={() =>
                console.log("Marked contacted:", mockLeadA1.id)
              }
              onViewBrief={() => console.log("Viewing brief:", mockLeadA1.id)}
            />
            <LeadActionCard
              id={mockLeadA2.id}
              businessName={mockLeadA2.businessName}
              category={mockLeadA2.category}
              tier={mockLeadA2.tier}
              score={mockLeadA2.score}
              email={mockLeadA2.email}
              phone={mockLeadA2.phone}
              website={mockLeadA2.website}
              challenges={mockLeadA2.challenges}
              opportunities={mockLeadA2.opportunities}
              painPoint={mockLeadA2.painPoint}
              reviewRating={mockLeadA2.reviewRating}
              primaryAngle={mockLeadA2.primaryAngle}
              primaryHook={mockLeadA2.primaryHook}
              secondaryAngle={mockLeadA2.secondaryAngle}
              secondaryHook={mockLeadA2.secondaryHook}
              angleReasoning={mockLeadA2.angleReasoning}
              emailSubject={mockLeadA2.emailSubject}
              emailBody={mockLeadA2.emailBody}
              onMarkContacted={() =>
                console.log("Marked contacted:", mockLeadA2.id)
              }
              onViewBrief={() => console.log("Viewing brief:", mockLeadA2.id)}
            />
          </div>
        </section>

        {/* TIER B CARDS */}
        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              🟡 Tier B Cards
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Secondary priority prospects.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <LeadActionCard
              id={mockLeadB1.id}
              businessName={mockLeadB1.businessName}
              category={mockLeadB1.category}
              tier={mockLeadB1.tier}
              score={mockLeadB1.score}
              email={mockLeadB1.email}
              phone={mockLeadB1.phone}
              challenges={mockLeadB1.challenges}
              opportunities={mockLeadB1.opportunities}
              painPoint={mockLeadB1.painPoint}
              reviewRating={mockLeadB1.reviewRating}
              primaryAngle={mockLeadB1.primaryAngle}
              primaryHook={mockLeadB1.primaryHook}
              angleReasoning={mockLeadB1.angleReasoning}
              emailSubject={mockLeadB1.emailSubject}
              emailBody={mockLeadB1.emailBody}
              onMarkContacted={() =>
                console.log("Marked contacted:", mockLeadB1.id)
              }
              onViewBrief={() => console.log("Viewing brief:", mockLeadB1.id)}
            />
          </div>
        </section>

        {/* TIER C CARDS */}
        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              ⚪ Tier C Cards
            </h2>
            <p className="text-sm text-gray-600 mt-1">Lower priority prospects.</p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <LeadActionCard
              id={mockLeadC1.id}
              businessName={mockLeadC1.businessName}
              category={mockLeadC1.category}
              tier={mockLeadC1.tier}
              score={mockLeadC1.score}
              email={mockLeadC1.email}
              emailSubject={mockLeadC1.emailSubject}
              emailBody={mockLeadC1.emailBody}
              challenges={mockLeadC1.challenges}
              opportunities={mockLeadC1.opportunities}
              onMarkContacted={() =>
                console.log("Marked contacted:", mockLeadC1.id)
              }
              onViewBrief={() => console.log("Viewing brief:", mockLeadC1.id)}
            />
          </div>
        </section>

        {/* COMPONENT INVENTORY */}
        <section className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Component Inventory
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-blue-50 rounded">
              <div className="font-semibold text-blue-900">
                LeadActionCard.tsx
              </div>
              <div className="text-xs text-blue-700 mt-1">Full detail card</div>
            </div>
            <div className="p-3 bg-green-50 rounded">
              <div className="font-semibold text-green-900">
                ReadyTodayCard.tsx
              </div>
              <div className="text-xs text-green-700 mt-1">Priority queue</div>
            </div>
            <div className="p-3 bg-purple-50 rounded">
              <div className="font-semibold text-purple-900">
                EmailPreviewBlock.tsx
              </div>
              <div className="text-xs text-purple-700 mt-1">Email display</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded">
              <div className="font-semibold text-yellow-900">
                ProspectInsightBlock.tsx
              </div>
              <div className="text-xs text-yellow-700 mt-1">Challenges/opps</div>
            </div>
            <div className="p-3 bg-red-50 rounded">
              <div className="font-semibold text-red-900">
                OutreachStrategyBlock.tsx
              </div>
              <div className="text-xs text-red-700 mt-1">Angles & hooks</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="font-semibold text-gray-900">/admin/ui-preview</div>
              <div className="text-xs text-gray-700 mt-1">This page</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
