import type { Metadata } from "next";
import Nav from "@/components/Nav";
import DriverModalCTA from "@/components/DriverModalCTA";
import DriverCount from "@/components/DriverCount";

export const metadata: Metadata = {
  title: "Man and Van Driver Jobs UK | Keep 100% | Saint & Story",
  description:
    "Self-employed removal and man-and-van driver work in your area. Keep 100% of every job. £9.99/month flat fee. No commission. Paid same day.",
  openGraph: {
    title: "Man and Van Driver Jobs UK | Keep 100% | Saint & Story",
    description:
      "Self-employed removal and man-and-van driver work in your area. Keep 100% of every job. £9.99/month flat fee. No commission.",
    url: "https://saintandstoryltd.co.uk/for-drivers",
    siteName: "Saint & Story",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Man and Van Driver Jobs UK | Keep 100%",
    description:
      "Self-employed removal and man-and-van driver work. Keep 100% of every job. £9.99/month. No commission.",
  },
};

const STEPS = [
  { num: "01", title: "Create your profile", desc: "Set your area, van size, and rate. Transit, Luton, Sprinter — all welcome. Live in minutes." },
  { num: "02", title: "Post your availability", desc: "Tell us when you're free. Customers in your area see you." },
  { num: "03", title: "Get booked and deliver", desc: "Show up, do what you do best. Every job builds your rating." },
  { num: "04", title: "Get paid", desc: "Finish a job at 3pm. Money in your account before 4pm." },
];

const EARNINGS = [
  { stat: "£150", label: "Avg. day" },
  { stat: "4–5", label: "Bookings per week" },
  { stat: "£9.99", label: "Founding rate/month" },
  { stat: null, label: "Drivers listed" },
];

const WEEK = [
  { day: "Monday", jobs: "2 jobs", earn: "£300" },
  { day: "Wednesday", jobs: "1 job", earn: "£150" },
  { day: "Saturday", jobs: "2 jobs", earn: "£300" },
];

const FEATURES = [
  { title: "Your profile, live 24/7.", desc: "Searchable by every customer in your area. No cold calling. No ad spend." },
  { title: "You set the calendar.", desc: "Post when you're free. Customers book around you, not the other way round." },
  { title: "Founding rate — £9.99/month.", desc: "Locked forever. Weekly billing launches at 100 drivers. You're grandfathered." },
  { title: "All van sizes welcome.", desc: "Transit, Luton, Sprinter — whatever you drive, there's work for you here." },
  { title: "Build your name.", desc: "Higher rating means you appear first when customers search your area." },
  { title: "Paid within the hour.", desc: "Finish a job at 3pm. Money in your account before 4pm. No chasing, no delays." },
];

const REVIEWS = [
  {
    initials: "TO",
    name: "Tom O.",
    location: "London",
    quote: "Posted my availability Sunday night. Had two bookings by Monday morning.",
  },
  {
    initials: "DF",
    name: "Daniel F.",
    location: "Birmingham",
    quote: "Profile went live Monday. Three jobs booked by Wednesday. £9.99 paid back before lunch.",
  },
  {
    initials: "MK",
    name: "Marcus K.",
    location: "Manchester",
    quote: "I post my week on Sunday. By Monday it's full. Best thing I've done for my business.",
  },
];

export default function ForDriversPage() {
  return (
    <main className="pb-20 md:pb-0">
      <Nav />

      {/* Hero */}
      <section className="bg-white pt-16 min-h-[85vh] flex items-center border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-6 py-20 w-full">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-5">
            Driver jobs · Man and van · Removal work
          </p>
          <h1 className="font-sans font-black text-[#0D0D0D] text-5xl md:text-6xl xl:text-7xl leading-[1.0] tracking-tight mb-6 max-w-2xl">
            Y<span className="font-display italic font-normal">o</span>ur van.
            <br />Y<span className="font-display italic font-normal">o</span>ur diary.
            <br />Y<span className="font-display italic font-normal">o</span>ur inc<span className="font-display italic font-normal">o</span>me.
          </h1>
          <p className="text-[#888888] text-base mb-10 max-w-sm">
            Post your availability. Customers find you. <DriverCount /> removal and man-and-van drivers already earning.
          </p>
          <div className="flex flex-wrap gap-3">
            <DriverModalCTA
              label="Join as driver →"
              source="for_drivers_hero"
              className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
            <a
              href="#how"
              className="border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#0D0D0D] py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {EARNINGS.map(({ stat, label }) => (
            <div key={label}>
              {stat ? (
                <p className="font-sans font-black text-white text-3xl md:text-4xl tracking-tight mb-1">{stat}</p>
              ) : (
                <p className="font-sans font-black text-white text-3xl md:text-4xl tracking-tight mb-1">
                  <DriverCount />
                </p>
              )}
              <p className="text-white/70 text-xs uppercase tracking-[0.15em]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fee callout */}
      <section className="bg-[#F5F5F5] py-12 px-6 border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-2">
              Founding rate
            </p>
            <p className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight">
              £9.99<span className="font-sans font-medium text-[#888888] text-base ml-1">/month</span>
            </p>
            <p className="text-[#888888] text-xs mt-1">Locked forever. Closes at 100 drivers.</p>
          </div>
          <div className="h-px md:h-12 w-full md:w-px bg-[#E8E8E8]" />
          <p className="text-[#0D0D0D] text-sm font-medium max-w-xs">
            No cuts per job. Keep 100% of what you earn. First booking covers the month.
          </p>
          <div className="h-px md:h-12 w-full md:w-px bg-[#E8E8E8]" />
          <div className="max-w-xs space-y-2">
            <p className="text-[#888888] text-sm">
              Avg. day: £150. Fee covered in your first job. Paid within the hour.
            </p>
            <p className="text-[#0D0D0D] text-sm font-medium">
              AnyVan takes 30% of every job. We take £9.99 a month. You do the maths.
            </p>
          </div>
        </div>
      </section>

      {/* Real week */}
      <section className="bg-white py-24 px-6 border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-5">
            What a real week looks like
          </p>
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-12">
            £750 this week.
            <br />£9.99 all m<span className="font-display italic font-normal">o</span>nth.
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {WEEK.map(({ day, jobs, earn }) => (
              <div key={day} className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl px-6 py-5">
                <p className="text-[#888888] text-xs uppercase tracking-[0.15em] mb-3">{day}</p>
                <p className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight mb-1">{earn}</p>
                <p className="text-[#888888] text-xs">{jobs}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-[#E8E8E8] pt-8 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12">
            <div>
              <p className="text-[#888888] text-xs uppercase tracking-[0.15em] mb-1">Week total</p>
              <p className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight">£750</p>
            </div>
            <div className="h-px sm:h-8 w-full sm:w-px bg-[#E8E8E8]" />
            <div>
              <p className="text-[#888888] text-xs uppercase tracking-[0.15em] mb-1">Monthly fee</p>
              <p className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight">£9.99</p>
            </div>
            <div className="h-px sm:h-8 w-full sm:w-px bg-[#E8E8E8]" />
            <div>
              <p className="text-[#888888] text-xs uppercase tracking-[0.15em] mb-1">You keep</p>
              <p className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight">Everything.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-16">
            H<span className="font-display italic font-normal">o</span>w it
            w<span className="font-display italic font-normal">o</span>rks.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {STEPS.map((s) => (
              <div key={s.num}>
                <span className="font-sans font-black text-[#E8E8E8] text-4xl leading-none block mb-4">{s.num}</span>
                <h3 className="font-sans font-bold text-[#0D0D0D] text-sm mb-1">{s.title}</h3>
                <p className="text-[#888888] text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#F5F5F5] py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight">
            Built f<span className="font-display italic font-normal">o</span>r
            <br />rem<span className="font-display italic font-normal">o</span>val
            <br />and man-and-van
            <br />drivers.
          </h2>
          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white border border-[#E8E8E8] rounded-2xl px-6 py-5">
                <p className="font-sans font-bold text-[#0D0D0D] text-sm mb-1">{f.title}</p>
                <p className="text-[#888888] text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-14">
            Drivers wh<span className="font-display italic font-normal">o</span>
            <br />made the switch.
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {REVIEWS.map((r) => (
              <div key={r.name} className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl p-6">
                <p className="text-[#0D0D0D] text-sm leading-relaxed mb-6">&ldquo;{r.quote}&rdquo;</p>
                <div className="flex items-center gap-3 border-t border-[#E8E8E8] pt-5">
                  <div className="w-8 h-8 rounded-full bg-[#0D0D0D] flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] font-bold">{r.initials}</span>
                  </div>
                  <div>
                    <p className="text-[#0D0D0D] text-sm font-semibold">{r.name}</p>
                    <p className="text-[#888888] text-xs">{r.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0D0D0D] py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <h2 className="font-sans font-black text-white text-4xl md:text-5xl leading-tight tracking-tight">
            G<span className="font-display italic font-normal">e</span>t
            <br />b<span className="font-display italic font-normal">o</span>oked.
          </h2>
          <div>
            <p className="font-sans font-medium text-white/80 text-lg leading-relaxed mb-8">
              <DriverCount /> removal and man-and-van drivers already earning.
              <br />
              P<span className="font-display italic font-normal">o</span>st y<span className="font-display italic font-normal">o</span>ur availability.
              <br />
              Keep everything y<span className="font-display italic font-normal">o</span>u earn.
            </p>
            <DriverModalCTA
              label="Join as driver →"
              source="for_drivers_cta"
              className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#E8E8E8] px-4 py-3">
        <DriverModalCTA
          label="Join as driver →"
          source="for_drivers_mobile"
          className="block w-full bg-[#0D0D0D] hover:bg-[#333333] text-white text-center font-semibold py-3.5 rounded-full text-sm transition-colors"
        />
      </div>
    </main>
  );
}
