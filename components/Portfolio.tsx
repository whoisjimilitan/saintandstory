import Image from "next/image";

const jobs = [
  {
    title: "3-Bed Home, Hackney",
    tag: "Home Move",
    items: "156 items",
    time: "4 hrs",
    img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=450&fit=crop",
  },
  {
    title: "Office Fit-Out, Canary Wharf",
    tag: "Commercial",
    items: "28 desks",
    time: "1 weekend",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=450&fit=crop",
  },
  {
    title: "Studio Flat, Clapham",
    tag: "Home Move",
    items: "62 items",
    time: "90 min",
    img: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&h=450&fit=crop",
  },
  {
    title: "5-Bed Family Home, Wimbledon",
    tag: "Large Move",
    items: "347 items",
    time: "1 day",
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=450&fit=crop",
  },
  {
    title: "Piano + Antiques, Chelsea",
    tag: "Specialist",
    items: "Fragile items",
    time: "2 hrs",
    img: "https://images.unsplash.com/photo-1518544897598-d3c0040f1089?w=600&h=450&fit=crop",
  },
  {
    title: "Long Distance, Edinburgh",
    tag: "UK-Wide",
    items: "210 items",
    time: "1 day",
    img: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&h=450&fit=crop",
  },
];

export default function Portfolio() {
  return (
    <section className="bg-white py-14 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-14">
          <span className="text-[10px] font-semibold text-[#E8244A] uppercase tracking-[0.4em]">
            Our work
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#0D0E17] mt-3 mb-3">
            Moves we&apos;re proud of.
          </h2>
          <p className="text-[#0D0E17]/40 text-sm max-w-sm mx-auto">
            Every job is handled the same way: carefully, on time, and to a standard worth showing.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {jobs.map((job) => (
            <div
              key={job.title}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#0D0E17]/8"
            >
              <Image
                src={job.img}
                alt={job.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0E17]/80 via-[#0D0E17]/20 to-transparent" />
              {/* Tag */}
              <div className="absolute top-4 left-4">
                <span className="bg-[#E8244A] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  {job.tag}
                </span>
              </div>
              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="font-display text-white font-semibold text-lg leading-snug mb-2">
                  {job.title}
                </p>
                <div className="flex items-center gap-4 text-white/50 text-xs">
                  <span>{job.items}</span>
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  <span>{job.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="#quote"
            className="inline-block bg-[#0D0E17] hover:bg-[#08090F] text-white font-bold px-8 py-4 rounded-xl transition-colors text-sm"
          >
            Book your move today &rarr;
          </a>
        </div>

      </div>
    </section>
  );
}
