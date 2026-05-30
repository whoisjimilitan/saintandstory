const PRESS = ["BBC", "Daily Mail", "The Guardian", "Harper's Bazaar", "Cosmopolitan"];

export default function PressStrip() {
  return (
    <section className="bg-white border-b border-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-[0.25em] mb-6">
          As seen in
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {PRESS.map((name) => (
            <span
              key={name}
              className="text-gray-300 font-bold text-base tracking-tight select-none"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
