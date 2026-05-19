export default function FounderQuote() {
  return (
    <section className="bg-[#0D0E17] py-14 md:py-24 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — text */}
          <div>
            <span className="text-[10px] font-semibold text-[#E8244A] uppercase tracking-[0.4em] block mb-4">
              A message from our founder
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-white leading-tight mb-6">
              Why I started<br />
              <span className="italic text-[#E8244A]">Saint &amp; Story.</span>
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-md">
              Every move I&apos;d seen before starting this company had the same problem: people were
              treated like cargo, not customers. I built Saint &amp; Story to change that — a team
              that actually shows up, communicates, and cares about every item in your home.
            </p>

            {/* Founder identity */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E8244A]/15 border border-[#E8244A]/30 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-[#E8244A]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">The Founder</p>
                <p className="text-white/35 text-xs mt-0.5">Saint &amp; Story Logistics &middot; London</p>
              </div>
            </div>
          </div>

          {/* Right — video placeholder */}
          <div className="relative">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#080910] border border-white/8 group cursor-pointer">

              {/* Subtle gradient background */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 35% 50%, rgba(232,36,74,0.12) 0%, transparent 65%), linear-gradient(135deg, #0d0e17 0%, #080910 100%)",
                }}
              />

              {/* Scanline texture overlay */}
              <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 4px)" }}
              />

              {/* Centre content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                {/* Outer ring */}
                <div className="relative">
                  <div className="absolute -inset-3 rounded-full border border-[#E8244A]/25 animate-pulse" />
                  <div className="w-16 h-16 rounded-full bg-[#E8244A]/10 border border-[#E8244A]/40 flex items-center justify-center group-hover:bg-[#E8244A]/20 transition-colors">
                    <svg className="w-7 h-7 text-[#E8244A] fill-current ml-1" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                <div className="text-center px-6">
                  <p className="text-white/70 text-sm font-medium">Meet the founder</p>
                  <p className="text-white/30 text-xs mt-1">Video coming soon</p>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#E8244A] animate-pulse" />
                  <p className="text-white/40 text-xs">Placeholder — drop your recording here when ready</p>
                </div>
              </div>

            </div>

            {/* Soft glow beneath */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-8 bg-[#E8244A]/15 blur-2xl rounded-full" />
          </div>

        </div>
      </div>
    </section>
  );
}
