export default function Commitment() {
  return (
    <section className="bg-[#0D0E1F] py-24">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <span className="text-xs font-semibold text-[#E8244A] uppercase tracking-widest block mb-6">
          A message from our founder
        </span>

        <blockquote className="text-2xl md:text-3xl font-semibold text-white leading-snug mb-8">
          &ldquo;We built Saint &amp; Story because every move deserves the care
          and attention of a fresh start — not the chaos of an afterthought.
          Amazing moves don&apos;t happen by accident. We make them happen on purpose.&rdquo;
        </blockquote>

        <p className="text-white font-semibold text-sm">The Founder</p>
        <p className="text-white/30 text-sm mt-1">Saint &amp; Story Logistics, London</p>

        <div className="mt-10">
          <a
            href="#quote"
            className="inline-block bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-bold px-8 py-4 rounded-xl transition-colors text-sm"
          >
            Get your free quote →
          </a>
        </div>
      </div>
    </section>
  );
}
