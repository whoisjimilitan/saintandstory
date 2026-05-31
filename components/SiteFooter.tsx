import Link from "next/link";

const CITIES = [
  { label: "London home moves", href: "/london-home-moves" },
  { label: "Manchester office moves", href: "/manchester-office-moves" },
  { label: "Birmingham removals", href: "/birmingham-removals" },
  { label: "Leeds removals", href: "/leeds-removals" },
  { label: "Bristol removals", href: "/bristol-removals" },
  { label: "Liverpool removals", href: "/liverpool-removals" },
  { label: "Glasgow removals", href: "/glasgow-removals" },
  { label: "Sheffield removals", href: "/sheffield-removals" },
  { label: "Manchester removals", href: "/manchester-removals" },
  { label: "Nottingham removals", href: "/nottingham-removals" },
  { label: "Edinburgh removals", href: "/edinburgh-removals" },
  { label: "Cardiff removals", href: "/cardiff-removals" },
  { label: "Leicester removals", href: "/leicester-removals" },
  { label: "Coventry removals", href: "/coventry-removals" },
  { label: "Newcastle removals", href: "/newcastle-removals" },
  { label: "South London removals", href: "/south-london-removals" },
  { label: "East London removals", href: "/east-london-removals" },
  { label: "Oxford removals", href: "/oxford-removals" },
  { label: "Cambridge removals", href: "/cambridge-removals" },
  { label: "Brighton removals", href: "/brighton-removals" },
  { label: "Reading removals", href: "/reading-removals" },
  { label: "Southampton removals", href: "/southampton-removals" },
  { label: "Derby removals", href: "/derby-removals" },
  { label: "Wolverhampton removals", href: "/wolverhampton-removals" },
  { label: "Norwich removals", href: "/norwich-removals" },
];

const SERVICES = [
  { label: "Home moves", href: "/services" },
  { label: "Office relocations", href: "/office-moves" },
  { label: "Student moves", href: "/student-moves" },
  { label: "Piano moving", href: "/piano-moving" },
  { label: "Same-day delivery", href: "/services" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
];

const PLATFORM = [
  { label: "For drivers", href: "/for-drivers" },
  { label: "Get the app", href: "/app" },
  { label: "Contact", href: "/contact" },
];

export default function SiteFooter() {
  return (
    <footer className="bg-white border-t border-[#E8E8E8]">
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Cities grid */}
        <div className="mb-14">
          <h3 className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.18em] mb-5">Cities we serve</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {CITIES.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-[#888888] hover:text-[#0D0D0D] transition-colors py-1"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16 border-t border-[#E8E8E8] pt-12">
          {/* Logo */}
          <div>
            <div className="inline-block mb-4">
              <p className="font-sans font-black text-[#0D0D0D] text-sm tracking-tight whitespace-nowrap">
                Saint <span className="font-display italic font-normal">&amp;</span> Story
              </p>
              <div className="border-t border-[#0D0D0D] mt-1.5 mb-1.5" />
              <p className="font-sans font-medium text-[#0D0D0D] text-[9px] tracking-[0.3em] uppercase">
                Logistics
              </p>
            </div>
            <p className="text-[#888888] text-xs leading-relaxed max-w-[160px]">
              Fixed price removals across the UK. Verified drivers. Done properly.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.18em] mb-4">Services</h3>
            <ul className="space-y-2.5">
              {SERVICES.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-[#0D0D0D] hover:text-[#888888] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.18em] mb-4">Platform</h3>
            <ul className="space-y-2.5">
              {PLATFORM.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-[#0D0D0D] hover:text-[#888888] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.18em] mb-4">Contact</h3>
            <ul className="space-y-2.5">
              <li>
                <a href="tel:+442082344444" className="text-sm text-[#0D0D0D] hover:text-[#888888] transition-colors">
                  0208 234 4444
                </a>
              </li>
              <li>
                <a href="mailto:hello@saintandstoryltd.co.uk" className="text-sm text-[#0D0D0D] hover:text-[#888888] transition-colors">
                  hello@saintandstoryltd.co.uk
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#E8E8E8] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#888888]">
            &copy; {new Date().getFullYear()} Saint &amp; Story Logistics Limited
          </p>
          <div className="flex gap-6 text-xs text-[#888888]">
            <Link href="/contact" className="hover:text-[#0D0D0D] transition-colors">Contact us</Link>
            <a href="mailto:hello@saintandstoryltd.co.uk" className="hover:text-[#0D0D0D] transition-colors">hello@saintandstoryltd.co.uk</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
