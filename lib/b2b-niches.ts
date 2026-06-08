export interface B2BNiche {
  slug: string;
  title: string;
  heroHeadline: string;
  heroSub: string;
  badge: string;
  painPoints: string[];
  whatWeHandle: string[];
  testimonials: { initials: string; name: string; business: string; quote: string }[];
  faqs: { q: string; a: string }[];
  metaTitle: string;
  metaDescription: string;
}

export const B2B_NICHES: Record<string, B2BNiche> = {
  florists: {
    slug: "florists",
    title: "Florists",
    heroHeadline: "Your supplier runs.\nOur drivers.",
    badge: "Same-day logistics · Florists · UK-wide",
    heroSub: "Market collection to your shop. Customer deliveries. Emergency stock runs. Fixed price, driver confirmed in 15 minutes.",
    painPoints: ["Supplier didn't show", "Late market collections", "Customer delivery failures", "No reliable courier"],
    whatWeHandle: [
      "Daily market and supplier collections",
      "Same-day customer deliveries",
      "Emergency stock transfers between branches",
      "Wedding and event delivery runs",
    ],
    testimonials: [
      { initials: "SM", name: "Sarah M.", business: "Petal & Co, Manchester", quote: "We were losing £300 a week to missed market runs. Fixed price, same driver, done. This is what we needed." },
      { initials: "TK", name: "Tom K.", business: "The Flower Room, Leeds", quote: "Wedding deliveries used to be a stress. Now I book the night before and it just works." },
      { initials: "AO", name: "Amara O.", business: "Bloom & Co, London", quote: "Same driver every Tuesday and Thursday. She knows our route better than we do." },
    ],
    faqs: [
      { q: "Can you handle daily market collections?", a: "Yes — we can set up a standing run so the same driver collects from your supplier every morning. Fixed price, same time, no booking needed each day." },
      { q: "How quickly can you respond for an emergency run?", a: "Driver confirmed in 15 minutes. For urgent stock runs, we operate 7am to 10pm, seven days a week." },
      { q: "Is the price fixed even for regular runs?", a: "Always fixed. Agreed up front, locked in. No surprises, no mileage additions on the day." },
      { q: "Do you cover deliveries to customers too?", a: "Yes — same-day customer deliveries, event runs, and multi-drop routes. One price, one driver, tracked end to end." },
    ],
    metaTitle: "Same-Day Logistics for Florists UK | Fixed Price | Saint & Story",
    metaDescription: "Reliable supplier runs and customer deliveries for florists across the UK. Fixed price, driver confirmed in 15 minutes. No contract needed.",
  },

  restaurants: {
    slug: "restaurants",
    title: "Restaurants",
    heroHeadline: "Supplier runs.\nNo drama.",
    badge: "Same-day logistics · Restaurants · UK-wide",
    heroSub: "Emergency stock. Supplier collections. Catering delivery. Fixed price, driver confirmed in 15 minutes. We keep your kitchen running.",
    painPoints: ["Supplier no-shows", "Emergency ingredient runs", "Out of stock mid-service", "No reliable delivery partner"],
    whatWeHandle: [
      "Emergency supplier and ingredient runs",
      "Daily market and wholesaler collections",
      "Catering and event delivery",
      "Equipment and furniture moves",
    ],
    testimonials: [
      { initials: "PL", name: "Priya L.", business: "Spice House, Birmingham", quote: "Our supplier let us down on a Friday night. Called Saint & Story, had a driver at the wholesaler in 20 minutes. Saved the service." },
      { initials: "JO", name: "James O.", business: "The Larder, Bristol", quote: "We run a standing order every Monday for market collection. Never missed a week." },
      { initials: "NB", name: "Nia B.", business: "Café Morto, Cardiff", quote: "Fixed price is the thing. Every other courier was variable. We know exactly what Tuesday costs now." },
    ],
    faqs: [
      { q: "Can you do emergency runs during service?", a: "Yes. Driver confirmed in 15 minutes. We operate 7am to 10pm, 7 days a week — including Friday and Saturday evenings." },
      { q: "Can we set up a regular weekly collection?", a: "Yes — standing orders mean the job generates automatically each week. Same driver, same time, no re-booking." },
      { q: "Do you handle temperature-sensitive ingredients?", a: "We use appropriate vehicles and can include insulated transport on request. Discuss your requirements when you book." },
      { q: "Is there a minimum order?", a: "No minimum. Single runs from a nearby supplier to a city-centre delivery are handled the same way as larger operations." },
    ],
    metaTitle: "Restaurant Logistics UK | Supplier Runs | Fixed Price | Saint & Story",
    metaDescription: "Emergency ingredient runs, supplier collections and catering delivery for restaurants across the UK. Fixed price. Driver in 15 minutes.",
  },

  retailers: {
    slug: "retailers",
    title: "Retailers",
    heroHeadline: "Stock here.\nCustomers everywhere.",
    badge: "Same-day logistics · Retailers · UK-wide",
    heroSub: "Stock transfers between branches, same-day customer delivery, supplier runs. Fixed price, driver confirmed in 15 minutes.",
    painPoints: ["Stock in wrong location", "Same-day delivery requests", "Supplier collection needed urgently", "No reliable logistics partner"],
    whatWeHandle: [
      "Inter-branch stock transfers",
      "Same-day customer delivery",
      "Supplier and warehouse collections",
      "Returns and exchange logistics",
    ],
    testimonials: [
      { initials: "RW", name: "Rachel W.", business: "The Gift Room, Glasgow", quote: "We have three branches. Stock transfers used to take days. Now it's same-day, fixed price, done." },
      { initials: "KM", name: "Kyle M.", business: "Threads, Sheffield", quote: "A customer ordered online and needed it same-day. We called, driver was there in 20 minutes. First time we've offered that." },
      { initials: "DC", name: "Diana C.", business: "Bloom Boutique, Edinburgh", quote: "Our supplier is 12 miles away. The weekly run is now a standing order. We don't think about it anymore." },
    ],
    faqs: [
      { q: "Can you do same-day delivery to our customers?", a: "Yes — same-day customer delivery across the UK. Fixed price confirmed before the driver leaves." },
      { q: "Can you move stock between our branches?", a: "Yes — single items to full van loads. Fixed price, tracked, confirmed within 15 minutes." },
      { q: "Do you handle high-value items?", a: "Yes. All moves are fully insured in transit. Discuss specific requirements when you book." },
      { q: "Can we set up a regular weekly stock run?", a: "Yes — standing orders automate the job each week. Same driver, same price, no re-booking." },
    ],
    metaTitle: "Retail Logistics UK | Stock Transfers & Same-Day Delivery | Saint & Story",
    metaDescription: "Inter-branch stock transfers, same-day customer delivery and supplier runs for retailers across the UK. Fixed price. Driver in 15 minutes.",
  },

  legal: {
    slug: "legal",
    title: "Legal Firms",
    heroHeadline: "Confidential.\nOn time.\nEvery time.",
    badge: "Legal courier · Document delivery · UK-wide",
    heroSub: "Time-sensitive document delivery. Court runs. Signed contracts. Fixed price, driver confirmed in 15 minutes. Chain of custody on every delivery.",
    painPoints: ["Court deadlines", "Last-minute document signing", "Inter-office transfer", "No reliable confidential courier"],
    whatWeHandle: [
      "Court and tribunal document delivery",
      "Urgent contract and signature runs",
      "Inter-office and branch transfers",
      "Confidential document collection and delivery",
    ],
    testimonials: [
      { initials: "HB", name: "H. Barrow", business: "Barrow & Co Solicitors, London", quote: "Court filing deadline, 90 minutes to go. Driver collected and was at the court in 40 minutes. This is the only service we use now." },
      { initials: "MF", name: "M. Fairfield", business: "Fairfield LLP, Manchester", quote: "We have a standing weekly run to our Manchester and Leeds offices. Fixed price, tracked, never late." },
      { initials: "SR", name: "S. Reeves", business: "Reeves Law, Birmingham", quote: "Client needed a contract signed and returned same afternoon. Sorted. Fixed price, confirmed receipt." },
    ],
    faqs: [
      { q: "Can you handle confidential documents?", a: "Yes. Every driver is verified and background-checked. For sensitive deliveries, we can arrange sealed-envelope confirmation on collection and delivery." },
      { q: "Can you meet court deadlines?", a: "Driver confirmed in 15 minutes. We operate 7am to 10pm, seven days a week. For urgent court runs, call us directly: 0203 051 7408." },
      { q: "Do you provide proof of delivery?", a: "Yes — confirmation with timestamp on delivery. We keep records on every run." },
      { q: "Can we set up a regular inter-office run?", a: "Yes — standing orders automate the weekly run. Same driver, same time, same price." },
    ],
    metaTitle: "Legal Courier UK | Document Delivery | Fixed Price | Saint & Story",
    metaDescription: "Confidential document delivery, court runs and inter-office transfers for legal firms across the UK. Fixed price. Driver confirmed in 15 minutes.",
  },

  "estate-agents": {
    slug: "estate-agents",
    title: "Estate Agents",
    heroHeadline: "Show home ready.\nEvery time.",
    badge: "Property logistics · Estate Agents · UK-wide",
    heroSub: "Show home staging, clearances between sales, furniture moves. Fixed price, driver confirmed in 15 minutes. We keep your property pipeline moving.",
    painPoints: ["Show home not ready", "Clearance between sales", "Furniture staging needed quickly", "No reliable property logistics"],
    whatWeHandle: [
      "Show home staging and furniture moves",
      "Property clearances between sales",
      "Office-to-property equipment runs",
      "Promotional material and signage delivery",
    ],
    testimonials: [
      { initials: "CL", name: "Charlotte L.", business: "Prime Properties, London", quote: "We had a viewing at 2pm and the show home needed clearing. Called at 10am. Done by 1:30. Incredible." },
      { initials: "MT", name: "Mark T.", business: "Meridian Homes, Leeds", quote: "Weekly staging moves across three properties. Standing order. We don't book anymore — it just happens." },
      { initials: "YA", name: "Yemi A.", business: "Capital Estates, Birmingham", quote: "Fixed price meant I could quote my vendor accurately. No nasty surprises on move day." },
    ],
    faqs: [
      { q: "Can you do urgent show home clears?", a: "Yes — driver confirmed in 15 minutes. For property clears, we can often be on site within the hour." },
      { q: "Can you move furniture between properties?", a: "Yes — single pieces to full show home sets. Fixed price, fully insured, no surprises." },
      { q: "Do you handle property clearances?", a: "Yes — full or partial clearances with responsible disposal. Fixed price confirmed before we arrive." },
      { q: "Can we set up a regular staging run?", a: "Yes — standing orders mean the job generates automatically each week across your property portfolio." },
    ],
    metaTitle: "Property Logistics for Estate Agents UK | Fixed Price | Saint & Story",
    metaDescription: "Show home staging, property clearances and furniture moves for estate agents across the UK. Fixed price. Driver confirmed in 15 minutes.",
  },
};

export function getNiche(slug: string): B2BNiche | null {
  return B2B_NICHES[slug] ?? null;
}

export const B2B_NICHE_SLUGS = Object.keys(B2B_NICHES);
