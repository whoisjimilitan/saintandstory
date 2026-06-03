import { ProspectPageBusiness } from "@/lib/prospect-types";

interface ProspectHeroProps {
  business: ProspectPageBusiness;
}

export function ProspectHero({ business }: ProspectHeroProps) {
  return (
    <section className="bg-[#0D0D0D] pt-20 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-4">
          Prospect Intelligence
        </p>

        <h1 className="text-white font-sans font-black text-4xl md:text-5xl leading-tight tracking-tight mb-6">
          {business.name}
        </h1>

        <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
          We spent some time understanding the delivery situations that often occur
          within businesses like {business.name}.
        </p>

        <p className="text-white/50 text-sm mt-4">
          {business.category} {business.city && `• ${business.city}`}
        </p>
      </div>
    </section>
  );
}
