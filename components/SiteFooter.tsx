import Link from "next/link";

const COLS = [
  {
    heading: "Platform",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "Pricing", href: "/pricing" },
      { label: "Post a job", href: "/contact" },
    ],
  },
  {
    heading: "For Drivers",
    links: [
      { label: "Join the platform", href: "/contact" },
      { label: "Claim your area", href: "/contact" },
      { label: "Driver login", href: "/contact" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/contact" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy policy", href: "#" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-white border-t border-[#E8E8E8]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          <div>
            <div className="inline-block">
              <p className="font-sans font-black text-[#0D0D0D] text-sm tracking-tight whitespace-nowrap">
                Saint <span className="font-display italic font-normal">&amp;</span> Story
              </p>
              <div className="border-t border-[#0D0D0D] mt-1.5 mb-1.5" />
              <p className="font-sans font-medium text-[#0D0D0D] text-[9px] tracking-[0.3em] uppercase">
                Logistics
              </p>
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.18em] mb-4">
                {col.heading}
              </h3>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-[#0D0D0D] hover:text-[#888888] transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#E8E8E8] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#888888]">
            &copy; {new Date().getFullYear()} Saint &amp; Story Logistics Limited
          </p>
          <div className="flex gap-6 text-xs text-[#888888]">
            <Link href="#" className="hover:text-[#0D0D0D] transition-colors">Terms</Link>
            <Link href="#" className="hover:text-[#0D0D0D] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#0D0D0D] transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
