"use client";

import { useState } from "react";
import Image from "next/image";

const TESTIMONIALS = [
  { name: "Jim", quote: "Saint & Story was easy to use and I received sensible quotes. I had a professional arrive the next day and he did an excellent job." },
  { name: "Michelle", quote: "Great service, I'd totally recommend it. Excellent way to find a professional you need." },
  { name: "David", quote: "Incredibly smooth from start to finish. The driver was professional, careful with my furniture, and finished ahead of schedule." },
  { name: "Sarah", quote: "I was worried about moving my piano but the team handled it perfectly. Will definitely use again." },
  { name: "Marcus", quote: "Same-day service and still managed to be cheaper than other quotes I got. Fantastic." },
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
