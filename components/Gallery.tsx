import Image from "next/image";

const photos = [
  { seed: "movers1", alt: "Professional movers loading a van" },
  { seed: "movers2", alt: "Team carefully wrapping furniture" },
  { seed: "movers3", alt: "Moving van on a London street" },
  { seed: "movers4", alt: "Boxes packed and ready to go" },
  { seed: "movers5", alt: "Happy customer after a successful move" },
  { seed: "movers6", alt: "Office relocation in progress" },
];

export default function Gallery() {
  return (
    <section className="bg-[#F8F8FA] py-16">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">
          Moves completed across London &amp; the UK
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.seed} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-200">
              <Image
                src={`https://picsum.photos/seed/${photo.seed}/600/450`}
                alt={photo.alt}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
