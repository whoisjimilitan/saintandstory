"use client";

import { useState } from "react";
import Image from "next/image";

const TESTIMONIALS = [
  {
    name: "Rachel M., Hackney",
    quote: "We'd been badly let down by another firm the week before. Called Saint & Story in a panic — they were back to me in 90 seconds with a fixed price. Team showed up early and had us done by lunch. Unreal.",
  },
  {
    name: "Damien K., Manchester",
    quote: "Moved our whole agency — six rooms of kit — over a Bank Holiday weekend. Not a single scratched monitor. The lads were professional and seemed to genuinely enjoy the job. Already booked them for our Bristol office.",
  },
  {
    name: "Fiona T., Edinburgh",
    quote: "The fixed price was what sold me. Every other company wanted to assess 'additional charges on the day.' Saint & Story quoted £285 and charged £285. Full stop.",
  },
  {
    name: "James O., Birmingham",
    quote: "Rang at 8am needing a same-day move. Confirmed at 8:02. Team arrived by 10:30. I nearly fell off my chair. Five stars isn't enough.",
  },
  {
    name: "Yemi A., Bristol",
    quote: "Third move in four years. I don't even bother looking elsewhere now.",
  },
];

// Floating profile images — staggered heights for the wave effect
const PROFILES = [
  { seed: 10, x: "2%",  y: 28  },
  { seed: 22, x: "12%", y: 8   },
  { seed: 34, x: "22%", y: 44  },
  { seed: 46, x: "33%", y: 12  },
  { seed: 58, x: "44%", y: 0   },
  { seed: 67, x: "55%", y: 16  },
  { seed: 79, x: "65%", y: 38  },
  { seed: 88, x: "76%", y: 6   },
  { seed: 91, x: "87%", y: 28  },
  { seed: 99, x: "96%", y: 14  },
];

export default function TestimonialCarousel() {
  const [active, setActive] = useState(0);
  const t = TESTIMONIALS[active];

  return (
    <section className="bg-surface py-16 md:py-24 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">

        {/* Floating circular profiles */}
        <div className="relative h-[100px] md:h-[120px] mb-14 select-none pointer-events-none">
          {PROFILES.map((p) => (
            <div
              key={p.seed}
              className="absolute w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-white shadow-md overflow-hidden"
              style={{ left: p.x, top: p.y }}
            >
              <Image
                src={`https://picsum.photos/seed/face${p.seed}/64/64`}
                alt=""
                width={64}
                height={64}
                className="object-cover w-full h-full"
                unoptimized
              />
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="max-w-2xl mx-auto text-center min-h-[9rem]">
          <blockquote className="text-navy text-xl md:text-2xl font-medium leading-relaxed mb-5 transition-all">
            &ldquo;{t.quote}&rdquo;
          </blockquote>
          <p className="text-muted text-sm font-semibold">{t.name}</p>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`rounded-full transition-all ${
                i === active ? "w-6 h-2.5 bg-brand" : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
