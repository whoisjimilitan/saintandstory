"use client";

import Image from "next/image";
import posthog from "posthog-js";

const services = [
  {
    title: "Residential Relocation",
    desc: "Full-service home moves across London and the UK. We pack, load, transport, and unpack — so you don't have to lift a finger.",
    img: "https://picsum.photos/seed/homeMove/600/350",
  },
  {
    title: "Commercial Relocation",
    desc: "Professional office and business moves with minimal disruption. Planned around your schedule so you're back up and running fast.",
    img: "https://picsum.photos/seed/officeMove/600/350",
  },
  {
    title: "Packing & Storage",
    desc: "Expert packing with quality materials, plus secure, climate-controlled storage solutions for any duration.",
    img: "https://picsum.photos/seed/storageUnit/600/350",
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs font-semibold text-[#E8244A] uppercase tracking-widest">
              What We Do
            </span>
            <h2 className="text-4xl font-bold text-[#0D0E1F] mt-3">
              Our Services
            </h2>
          </div>
          <a
            href="#quote"
            className="text-sm font-medium text-[#0D0E1F] hover:text-[#E8244A] transition-colors"
          >
            View all services →
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.title}
              className="group rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <Image
                  src={s.img}
                  alt={s.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-[#0D0E1F] mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  {s.desc}
                </p>
                <a
                  href="#quote"
                  onClick={() => posthog.capture("service_learn_more_clicked", { service: s.title })}
                  className="text-sm font-medium text-[#E8244A] flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Learn More →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
