"use client";

import { useState } from "react";

const TESTIMONIALS = [
  {
    name: "Rachel M.",
    location: "Hackney",
    quote: "We'd been badly let down by another firm the week before. Called Saint & Story in a panic — they were back to me in 90 seconds with a fixed price. Team showed up early and had us done by lunch.",
  },
  {
    name: "Damien K.",
    location: "Manchester",
    quote: "Moved our whole agency — six rooms of kit — over a Bank Holiday weekend. Not a single scratched monitor. The lads were professional and seemed to genuinely enjoy the job. Already booked them for our Bristol office.",
  },
  {
    name: "Fiona T.",
    location: "Edinburgh",
    quote: "The fixed price was what sold me. Every other company wanted to assess additional charges on the day. Saint & Story quoted £285 and charged £285. Full stop.",
  },
  {
    name: "James O.",
    location: "Birmingham",
    quote: "Rang at 8am needing a same-day move. Confirmed at 8:02. Team arrived by 10:30. I nearly fell off my chair. Five stars isn't enough.",
  },
  {
    name: "Yemi A.",
    location: "Bristol",
    quote: "Third move in four years. I don't even bother looking elsewhere now.",
  },
];

export default function TestimonialCarousel() {
  const [active, setActive] = useState(0);
  const t = TESTIMONIALS[active];

  return (
    <section className="bg-surface py-16 md:py-24 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-6 text-center">

        <p className="text-xs font-semibold text-brand uppercase tracking-[0.18em] mb-14">What customers say</p>

        <blockquote className="font-sans text-navy text-xl md:text-2xl font-medium leading-relaxed mb-8 min-h-[7rem]">
          &ldquo;{t.quote}&rdquo;
        </blockquote>

        <p className="text-gray-500 text-sm font-semibold mb-1">{t.name}</p>
        <p className="text-gray-400 text-xs mb-10">{t.location}</p>

        <div className="flex justify-center gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Review ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === active
                  ? "w-6 h-2 bg-brand"
                  : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
