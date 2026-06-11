export interface CityConfig {
  slug: string;
  name: string;
  displayName: string;
  tagline: string;
  region: string;
  seoTitle: string;
  seoDescription: string;
  activeDrivers: number;
  monthlyJobs: number;
  avgEarningsPerWeek: string;
  avgJobValue: string;
  timeToFirstBooking: string;
  heroSubtitle: string;
  testimonials: Array<{
    initials: string;
    name: string;
    location: string;
    quote: string;
  }>;
  features: Array<{
    title: string;
    desc: string;
  }>;
  faqs: Array<{
    q: string;
    a: string;
  }>;
}

export const CITIES: Record<string, CityConfig> = {
  london: {
    slug: "london",
    name: "London",
    displayName: "London",
    tagline: "Post. Get booked. Keep it all.",
    region: "London",
    seoTitle: "Driver Work in London | Post. Get Booked. Keep It All. | Saint & Story",
    seoDescription: "Post your availability in London. Get booked by verified customers in your area. Keep 100% of every job. £9.99/month. No commissions.",
    activeDrivers: 47,
    monthlyJobs: 340,
    avgEarningsPerWeek: "£350",
    avgJobValue: "£145",
    timeToFirstBooking: "48 hours",
    heroSubtitle: "Post your availability. London customers find and book you directly. £9.99/month. Keep 100% of every job.",
    testimonials: [
      {
        initials: "TO",
        name: "Tom O.",
        location: "London",
        quote: "Posted my availability Sunday night. Had two confirmed bookings by Monday morning. £9.99 covered before I'd even had breakfast.",
      },
      {
        initials: "MK",
        name: "Marcus K.",
        location: "South London",
        quote: "I post my week on Sunday. By Monday it's full. No cold calls, no ads, no chasing. Best thing I've done for my business.",
      },
      {
        initials: "DF",
        name: "Daniel F.",
        location: "North London",
        quote: "Profile went live Monday. Three bookings confirmed by Wednesday. Other platforms took 20% of every job. Here I keep everything.",
      },
    ],
    features: [
      { title: "Your profile, live 24/7.", desc: "Searchable by every customer in London. No cold calling. No ad spend." },
      { title: "You set the calendar.", desc: "Post when you're free. London customers book around you, not the other way round." },
      { title: "£9.99 a month.", desc: "That's it. Keep 100% of every job. Your first booking covers the month." },
      { title: "Build your name.", desc: "Higher rating means you appear first when London customers search your area." },
    ],
    faqs: [
      { q: "How do I get my first booking in London?", a: "Create your profile, post your availability, and go live. London is our highest-demand market — most drivers receive their first booking within 48 hours of going live." },
      { q: "What does the £9.99 cover?", a: "Your driver profile — verified, searchable, with your availability shown to every customer looking for a driver in London. That's the only cost. No per-job cuts, no commissions, ever." },
      { q: "Do I have to accept every booking?", a: "No. You post when you're available and customers book around your schedule. You're always in full control of when and where you work." },
      { q: "How do I get paid?", a: "Daily, directly to your account. No chasing invoices, no waiting for end-of-month payouts. You finish the job, the money moves." },
      { q: "What van size do I need?", a: "Any size — from a small Ford Transit Connect to a Luton or curtainsider. You set your vehicle type in your profile and customers who need your size find you." },
      { q: "What if I'm not available some weeks?", a: "You simply don't post availability that week. The platform shows exactly when you're free. No minimum commitment, no penalty for downtime." },
      { q: "Is there enough demand in London?", a: "London is our highest-volume market. Hundreds of jobs posted every week across all 33 boroughs. Drivers with complete profiles and good ratings consistently stay fully booked." },
      { q: "Can I cover multiple London areas?", a: "Yes. Set your radius to cover multiple boroughs. Most drivers set a 10–15 mile radius from their base — the wider your area, the more jobs you'll see." },
    ],
  },
  manchester: {
    slug: "manchester",
    name: "Manchester",
    displayName: "Manchester",
    tagline: "Direct bookings. Your earnings. No middleman.",
    region: "North West",
    seoTitle: "Driver Jobs Manchester | Get Booked Direct | Keep 100% | Saint & Story",
    seoDescription: "Get booked directly by Manchester customers. Keep 100% of every job. £9.99/month flat fee. No commission. Pay same day.",
    activeDrivers: 32,
    monthlyJobs: 240,
    avgEarningsPerWeek: "£320",
    avgJobValue: "£140",
    timeToFirstBooking: "3 days",
    heroSubtitle: "Post your availability. Get booked by Manchester customers. Keep everything you earn. £9.99/month.",
    testimonials: [
      {
        initials: "AP",
        name: "Ahmed P.",
        location: "Stockport",
        quote: "Went live Wednesday. Had my first booking by Friday. Two more by Monday. This is way better than chasing calls all day.",
      },
      {
        initials: "JL",
        name: "James L.",
        location: "Manchester City Centre",
        quote: "I was sceptical at first. Three weeks in, I'm earning £400+ a week. No one taking a cut. Can't ask for better.",
      },
      {
        initials: "RK",
        name: "Raj K.",
        location: "Tameside",
        quote: "The Manchester market is hungry. Post Monday, fully booked by Wednesday. One van, serious income.",
      },
    ],
    features: [
      { title: "Booked by real customers.", desc: "Manchester homes and businesses book you directly. No intermediaries. You own the relationship." },
      { title: "Work your way.", desc: "Post the days you want. Skip the ones you don't. You're in control, not the algorithm." },
      { title: "£9.99/month. That's all.", desc: "Keep 100% of every job. No hidden fees. First booking covers the month." },
      { title: "Built for Manchester drivers.", desc: "Growing market, less saturation than London. Drivers here stay busy and earn more." },
    ],
    faqs: [
      { q: "How quick can I start earning in Manchester?", a: "Most drivers get their first booking within 3 days of going live. Manchester demand is strong — complete your profile, post your availability, and wait for the bookings to come in." },
      { q: "What's the typical earning in Manchester?", a: "Most active drivers earn £300–400 per week. It depends on your area, vehicle size, and how consistently you post availability. Some earn more." },
      { q: "Is there really enough work in Manchester?", a: "Yes. We post 200+ jobs per month across Greater Manchester — city centre, suburbs, outer areas. Good mix of small moves and larger jobs." },
      { q: "How do I cover multiple Manchester areas?", a: "Set your radius in your profile. Most drivers cover 10–15 miles from their base. The bigger your area, the more jobs you see." },
      { q: "Do I need a big van?", a: "No. We have jobs for Transit-size vans all the way up to Lutons. What matters is being clear about what you have." },
      { q: "What if I miss a week?", a: "Just don't post that week. The platform only shows availability when you're actually free. Zero penalty." },
      { q: "How do I get paid?", a: "Daily. Finish a job by 3pm, money's in your account by 4pm. It's that straightforward." },
      { q: "Can I really keep 100%?", a: "Yes. £9.99/month is your only cost. No commissions, no cuts, no surprise fees." },
    ],
  },
  birmingham: {
    slug: "birmingham",
    name: "Birmingham",
    displayName: "Birmingham",
    tagline: "Your schedule. Your earnings. Your business.",
    region: "Midlands",
    seoTitle: "Driver Jobs Birmingham | Direct Bookings | Keep Everything | Saint & Story",
    seoDescription: "Get booked directly in Birmingham. Keep 100% of every job. £9.99/month. No commission. Paid same day.",
    activeDrivers: 28,
    monthlyJobs: 210,
    avgEarningsPerWeek: "£310",
    avgJobValue: "£138",
    timeToFirstBooking: "3–4 days",
    heroSubtitle: "Post when you're free. Birmingham customers book you directly. Keep all your earnings. £9.99/month.",
    testimonials: [
      {
        initials: "DM",
        name: "David M.",
        location: "Birmingham",
        quote: "I was doing removals part-time. Posted Thursday, got my first booking Friday. Now I do 3–4 jobs a week on my own terms.",
      },
      {
        initials: "CP",
        name: "Chris P.",
        location: "Wolverhampton",
        quote: "The Midlands market is underrated. Not as crowded as London, but solid demand. I'm averaging £80/job and staying busy.",
      },
      {
        initials: "SM",
        name: "Shaun M.",
        location: "Solihull",
        quote: "Simple platform. No messing around. Post, get booked, do the job, get paid. This is how it should be.",
      },
    ],
    features: [
      { title: "Direct customer bookings.", desc: "Birmingham residents and businesses book your van directly. You keep the relationship." },
      { title: "Flexible hours that work.", desc: "Post your available days and times. Work as much or as little as you want." },
      { title: "£9.99. Full stop.", desc: "One flat monthly fee. Keep 100% of every job you do." },
      { title: "Growing Birmingham demand.", desc: "More jobs than drivers right now. It's a seller's market for drivers here." },
    ],
    faqs: [
      { q: "How much can I earn in Birmingham?", a: "Most drivers earn £280–350 per week. Depends on your van size and how many days you post. Active drivers stay fully booked." },
      { q: "How quickly do I get my first booking?", a: "Usually 3–4 days. Post your profile Thursday or Friday, expect your first booking by the following Monday." },
      { q: "Is there enough work in Birmingham?", a: "Yes. We have 200+ jobs posted monthly across Birmingham and surrounding areas. Less crowded than London, but steady demand." },
      { q: "What's the typical job?", a: "Mix of small moves (bedroom furniture, house moves, storage) and larger house removals. £100–200 range is common." },
      { q: "Can I work just weekends?", a: "Yes. Post only Saturday and Sunday if that suits you. No minimums, no pressure." },
      { q: "How do I get paid?", a: "Daily transfer. Finish by 3pm, money arrives by 4pm. No invoicing, no waiting." },
      { q: "What if I want to cover a bigger area?", a: "Set your radius to 15–20 miles. That covers Birmingham, Solihull, Wolverhampton, and surrounding towns." },
      { q: "Do I lose any money to fees?", a: "No. £9.99/month and you keep everything else. That's it." },
    ],
  },
  leeds: {
    slug: "leeds",
    name: "Leeds",
    displayName: "Leeds",
    tagline: "Post your calendar. Keep your money.",
    region: "Yorkshire",
    seoTitle: "Driver Jobs Leeds | Get Booked Direct | 100% Earnings | Saint & Story",
    seoDescription: "Direct driver bookings in Leeds. Keep 100% of every job. £9.99/month. No commission. Same-day pay.",
    activeDrivers: 25,
    monthlyJobs: 185,
    avgEarningsPerWeek: "£300",
    avgJobValue: "£135",
    timeToFirstBooking: "4 days",
    heroSubtitle: "Post your days. Get booked by Leeds customers. Keep everything. £9.99/month.",
    testimonials: [
      {
        initials: "NK",
        name: "Neil K.",
        location: "Leeds",
        quote: "Tried other platforms. They take 20–30%. This one? You keep it all. That's a game changer.",
      },
      {
        initials: "LT",
        name: "Lauren T.",
        location: "Headingley",
        quote: "I started part-time. Been at this for 6 weeks now. Four bookings a week on average. Can't believe it took me so long to try this.",
      },
      {
        initials: "MT",
        name: "Martin T.",
        location: "Beeston",
        quote: "Leeds is booming. Lot of house moves, lot of students moving. Plenty of work. And they pay you properly.",
      },
    ],
    features: [
      { title: "Customers find you directly.", desc: "No middleman. Leeds customers see your profile and book your van straight away." },
      { title: "You control everything.", desc: "When you work, how much you charge, what jobs you take. It's your business." },
      { title: "£9.99/month. Nothing more.", desc: "That covers your profile, your visibility, everything. Keep all your earnings." },
      { title: "Yorkshire demand is strong.", desc: "Growing market, plenty of house moves, removals, and small jobs throughout Leeds." },
    ],
    faqs: [
      { q: "What kind of work is available in Leeds?", a: "House moves, furniture delivery, student relocations, storage moves, local removals. £100–200 per job is typical." },
      { q: "How much do drivers earn here?", a: "£280–330 per week is normal for active drivers. More if you cover a bigger area." },
      { q: "How long before I get booked?", a: "Most drivers get their first booking within 4 days of posting their profile." },
      { q: "Is Leeds as busy as London?", a: "Different market. Not as high volume, but less crowded too. You'll get steady work without fighting for every job." },
      { q: "Do I need a specific van size?", a: "No. We have work for Transit-size vans, Lutons, and everything in between." },
      { q: "Can I just work part-time?", a: "Absolutely. Post two days a week if that works for you. No minimums." },
      { q: "How do payments work?", a: "Daily transfers. Finish your job, get paid same day. No end-of-month waiting." },
      { q: "What's the commitment?", a: "None. Post when you want, stop when you want. £9.99/month and you're in." },
    ],
  },
  glasgow: {
    slug: "glasgow",
    name: "Glasgow",
    displayName: "Glasgow",
    tagline: "Scotland's driver platform.",
    region: "Scotland",
    seoTitle: "Driver Jobs Glasgow | Direct Bookings | Keep 100% | Saint & Story",
    seoDescription: "Get booked directly in Glasgow. Keep 100% of every job. £9.99/month. No commission. Paid same day.",
    activeDrivers: 22,
    monthlyJobs: 165,
    avgEarningsPerWeek: "£290",
    avgJobValue: "£130",
    timeToFirstBooking: "4–5 days",
    heroSubtitle: "Post your availability. Get booked by Glasgow customers. Keep your earnings. £9.99/month.",
    testimonials: [
      {
        initials: "GR",
        name: "Gary R.",
        location: "Glasgow",
        quote: "The tax side was my worry. They explained it clearly. Got my first booking two days later. No regrets.",
      },
      {
        initials: "ES",
        name: "Emma S.",
        location: "South Side",
        quote: "Running a one-van operation. This platform lets me stay busy without chasing leads. Brilliant.",
      },
      {
        initials: "IW",
        name: "Ian W.",
        location: "East Kilbride",
        quote: "Scottish drivers deserve a platform that treats them fair. This is it. Simple, no nonsense.",
      },
    ],
    features: [
      { title: "Direct bookings from Glasgow.", desc: "Customers in Glasgow find and book you directly. You own the booking." },
      { title: "Flexible, always.", desc: "Post the days you're free. Customers book around your schedule." },
      { title: "£9.99/month flat fee.", desc: "Keep 100%. No commissions, no sneaky charges." },
      { title: "Growing Glasgow market.", desc: "Strong demand across Glasgow and surrounding areas. Steady work for drivers who post." },
    ],
    faqs: [
      { q: "How does tax work in Scotland?", a: "You're self-employed. Keep records of earnings and mileage. We provide clarity on what you need to report to HMRC." },
      { q: "What's typical earnings in Glasgow?", a: "£280–320 per week for active drivers. Good mix of small moves and larger house removals." },
      { q: "How fast do I get booked?", a: "Usually 4–5 days after posting your profile." },
      { q: "Is there enough work?", a: "Yes. 160+ jobs posted monthly across Glasgow. Not as saturated as southern markets." },
      { q: "What van sizes work?", a: "Any. Transit, Luton, box van. Post your type and customers find you." },
      { q: "Can I just do weekends?", a: "Yes. Post Saturday and Sunday only if that's your schedule." },
      { q: "When do I get paid?", a: "Daily. No waiting around. Money in your account by next business day." },
      { q: "What if I take a week off?", a: "Just don't post. Zero penalty. Pick it back up whenever." },
    ],
  },
};

export function getCityConfig(slug: string): CityConfig | null {
  return CITIES[slug] || null;
}

export function getCityList(): CityConfig[] {
  return Object.values(CITIES);
}

export function getCitySlugs(): string[] {
  return Object.keys(CITIES);
}
