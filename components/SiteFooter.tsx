import Link from "next/link";

const COLUMNS = [
  {
    heading: "For Customers",
    links: [
      { label: "Find a Professional", href: "/" },
      { label: "How it works", href: "/#how" },
      { label: "Login", href: "/contact" },
      { label: "Mobile App", href: "#" },
    ],
  },
  {
    heading: "For Professionals",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "Pricing", href: "/pricing" },
      { label: "Join as a Driver", href: "/contact" },
      { label: "Help centre", href: "/contact" },
      { label: "Mobile App", href: "#" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "About Saint & Story", href: "/contact" },
      { label: "Careers", href: "#" },
      { label: "Affiliates", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
];

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="7" fill="#0b6cff" />
      <path d="M8 11L14 16L8 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 11L22 16L16 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-14 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Three link columns */}
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-xs font-bold text-navy uppercase tracking-[0.12em] mb-4">{col.heading}</h3>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-muted hover:text-navy transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Need help? */}
          <div>
            <h3 className="text-xs font-bold text-navy uppercase tracking-[0.12em] mb-4">Need help?</h3>
            <Link
              href="/contact"
              className="inline-block bg-brand hover:bg-brand-dark text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors mb-5"
            >
              Contact us
            </Link>
            <div className="flex items-center gap-3 mb-5">
              {/* Facebook */}
              <a href="#" className="text-muted hover:text-navy transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="text-muted hover:text-navy transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>

            {/* Country selector */}
            <div className="flex items-center gap-2 text-sm text-muted">
              <span>🇬🇧</span>
              <span className="font-medium text-navy">United Kingdom</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LogoMark />
            <p className="text-xs text-muted">
              &copy; {new Date().getFullYear()} Saint &amp; Story Logistics Limited. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
            <Link href="#" className="hover:text-navy transition-colors">Terms &amp; Conditions</Link>
            <Link href="#" className="hover:text-navy transition-colors">Cookie policy</Link>
            <Link href="#" className="hover:text-navy transition-colors">Privacy policy</Link>

            {/* Trustpilot badge */}
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#00b67a" />
              </svg>
              <span className="font-semibold text-[#00b67a]">Trustpilot</span>
              <span className="text-gray-400">4.8 · 300 reviews</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
