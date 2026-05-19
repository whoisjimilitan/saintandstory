export default function Footer() {
  return (
    <footer className="bg-[#0D0E1F] border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#E8244A] rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-white font-semibold">Saint &amp; Story Logistics</span>
          </div>

          <div className="flex items-center gap-8">
            {[
              { label: "How It Works", href: "#how" },
              { label: "Services", href: "#services" },
              { label: "Testimonials", href: "#testimonials" },
              { label: "FAQ", href: "#faq" },
              { label: "Get a Quote", href: "#quote" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-white/40 text-sm hover:text-white/70 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <p className="text-white/30 text-sm">&copy; 2025 Saint &amp; Story Logistics. London, UK.</p>
        </div>
      </div>
    </footer>
  );
}
