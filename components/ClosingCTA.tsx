import ModalCTA from "./ModalCTA";

export default function ClosingCTA() {
  return (
    <section
      className="relative py-24 px-6 text-center overflow-hidden bg-navy"
      style={{
        backgroundImage: "url('/hero-van.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-[#0F172A]/82" />
      <div className="relative z-10 max-w-2xl mx-auto">
        <h2 className="font-black text-white text-3xl md:text-5xl leading-[1.1] tracking-tight mb-6">
          No searching.<br />No comparing.<br />No surprises.
        </h2>
        <p className="text-white/60 text-base mb-10">
          That&apos;s the Saint &amp; Story promise.
        </p>
        <ModalCTA
          label="Get a free quote"
          source="closing_cta"
          className="inline-block bg-brand hover:bg-brand-dark text-white font-bold px-10 py-4 rounded-lg text-sm transition-colors"
        />
      </div>
    </section>
  );
}
