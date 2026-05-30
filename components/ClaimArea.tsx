import ModalCTA from "./ModalCTA";

export default function ClaimArea() {
  return (
    <section className="bg-[#0D0D0D] py-24 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <h2 className="font-sans font-black text-white text-4xl md:text-6xl leading-tight tracking-tight">
          Claim y<span className="font-display italic font-normal">o</span>ur
          <br />area.
        </h2>

        <div>
          <p className="text-[#666666] text-base mb-8">
            367 drivers earning consistently. Set your radius. Jobs come to you.
          </p>
          <ModalCTA
            label="Claim now →"
            source="claim_area"
            className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
          />
        </div>
      </div>
    </section>
  );
}
