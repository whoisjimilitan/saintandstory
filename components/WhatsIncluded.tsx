const INCLUSIONS = [
  "Professional van & driver",
  "2 trained movers",
  "Loading & unloading",
  "Furniture blankets",
  "Floor & wall protection",
  "Real-time GPS tracking",
  "£50,000 insurance",
  "Same-day option",
];

const WHY_DIFFERENT = [
  "No middleman. No marketplace. Just us.",
  "Fixed price confirmed on your first call.",
  "Vetted, uniformed, background-checked teams only.",
  "No agency staff. Ever.",
];

export default function WhatsIncluded() {
  return (
    <section className="bg-white py-16 md:py-24 px-6 border-t border-gray-100">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 md:gap-16">

        <div>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
              <h3 className="font-black text-navy text-sm">What&apos;s Included</h3>
            </div>
            {INCLUSIONS.map((item, i) => (
              <div
                key={item}
                className={`flex items-center justify-between px-5 py-2.5 ${i < INCLUSIONS.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <span className="text-sm text-gray-600">{item}</span>
                <span className="text-brand font-bold text-sm">✓</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-black text-navy text-lg mb-6">Why we work differently</h3>
          <div className="space-y-4">
            {WHY_DIFFERENT.map((item) => (
              <p key={item} className="text-sm text-gray-600 flex gap-3">
                <span className="text-brand font-bold shrink-0">—</span>
                {item}
              </p>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-black text-navy text-lg mb-4">Movers you can trust.</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Every Saint &amp; Story team is background-checked, trained, and uniformed.
            We don&apos;t sub-contract, we don&apos;t use agency staff, and we don&apos;t renegotiate
            prices at your door. What we quote is what you pay. Every time.
          </p>
        </div>

      </div>
    </section>
  );
}
