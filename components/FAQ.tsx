"use client";

import { useState } from "react";
import posthog from "posthog-js";

const categories = [
  {
    label: "Booking & Availability",
    items: [
      {
        q: "Can I book a same-day or last-minute move?",
        a: "Yes — same-day is our speciality. Fill out the form and we confirm your team within 1 minute. Need someone in the next few hours? Call us directly at +44 7885 465680 and we will do everything we can to make it happen.",
      },
      {
        q: "How far in advance do I need to book?",
        a: "You don't. We accommodate last-minute moves daily. That said, if you have a specific date in mind, booking earlier gives you more flexibility on timing. Either way, we'll make it work.",
      },
      {
        q: "Can I change or cancel my booking?",
        a: "Yes. Reschedule at no extra cost as long as you give us at least 24 hours notice. If something changes last minute, call us — we'll do our best to accommodate.",
      },
      {
        q: "Do you operate outside London?",
        a: "Yes. We cover all of the UK. Moving to Manchester, Edinburgh, Bristol, anywhere — just tell us where you are going and we'll get it done.",
      },
    ],
  },
  {
    label: "Pricing & Payment",
    items: [
      {
        q: "Are there any hidden fees?",
        a: "Never. The number we quote is the number you pay. We confirm the full cost before we arrive — no surprises on moving day.",
      },
      {
        q: "What is included in the price?",
        a: "Van, driver, and movers. Loading, transporting, and unloading are all included. Packing materials and storage are optional extras — always quoted upfront before you commit.",
      },
      {
        q: "How does payment work?",
        a: "A 50% deposit secures your booking. The remaining balance is due on the day of the move, once everything is complete to your satisfaction.",
      },
      {
        q: "What if something gets damaged?",
        a: "Every move is fully insured. If anything is damaged we cover it. No arguments, no complicated claim process — we sort it.",
      },
    ],
  },
  {
    label: "The Move Itself",
    items: [
      {
        q: "Will my walls and floors be protected?",
        a: "Yes. Our teams use floor runners, corner guards, and furniture wrapping as standard on every job. We treat your home exactly as we'd treat our own.",
      },
      {
        q: "Do you move pianos, safes, or oversized items?",
        a: "Yes. We have specialist equipment and trained teams for heavy, fragile, or awkward items. Just tell us what needs moving when you enquire and we'll plan accordingly.",
      },
      {
        q: "Do I need to be present during the move?",
        a: "Not necessarily. Many of our customers hand over a key and we handle everything. We keep you updated throughout via text or phone.",
      },
      {
        q: "What if there's no lift or the access is difficult?",
        a: "We handle it. Narrow staircases, no-lift buildings, awkward parking — our teams are experienced with all of these. Just let us know in advance and we'll plan the right team and equipment.",
      },
    ],
  },
];

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  function handleToggle() {
    if (!open) {
      posthog.capture("faq_item_opened", { question: q });
    }
    setOpen(!open);
  }
  return (
    <div className="border-b border-[#0D0E17]/8 last:border-0">
      <button
        onClick={handleToggle}
        className="w-full flex items-start justify-between py-5 text-left gap-6 group"
      >
        <span className="font-medium text-[#0D0E17] text-sm leading-snug group-hover:text-[#E8244A] transition-colors">
          {q}
        </span>
        <span
          className="shrink-0 text-[#E8244A] text-xl leading-none mt-0.5 transition-transform duration-200"
          style={{ transform: open ? "rotate(45deg)" : "none" }}
        >
          +
        </span>
      </button>
      {open && (
        <p className="text-[#0D0E17]/55 text-sm leading-relaxed pb-5">{a}</p>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="bg-white py-14 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-14">
          <span className="text-[10px] font-semibold text-[#E8244A] uppercase tracking-[0.4em]">
            FAQ
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#0D0E17] mt-3 mb-3">
            Questions you&apos;re thinking right now.
          </h2>
          <p className="text-[#0D0E17]/40 text-sm max-w-sm mx-auto">
            We&apos;ve answered the most common ones below. Still not sure?{" "}
            <a href="tel:+447885465680" className="text-[#E8244A] underline underline-offset-2">
              Call us now.
            </a>
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {categories.map((cat) => (
            <div key={cat.label}>
              <h3 className="text-[10px] font-bold text-[#0D0E17] uppercase tracking-[0.4em] mb-4 pb-3 border-b border-[#0D0E17]/10">
                {cat.label}
              </h3>
              {cat.items.map((item) => (
                <Item key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          ))}
        </div>

        <div className="text-center mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#quote"
            onClick={() => posthog.capture("faq_quote_clicked")}
            className="inline-block bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-bold px-8 py-4 rounded-xl transition-colors text-sm"
          >
            Get a free quote &rarr;
          </a>
          <a
            href="tel:+447885465680"
            onClick={() => posthog.capture("faq_phone_clicked")}
            className="inline-flex items-center gap-2 border border-[#0D0E17]/20 hover:border-[#0D0E17]/40 text-[#0D0E17] font-semibold px-8 py-4 rounded-xl transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
            </svg>
            +44 7885 465680
          </a>
        </div>

      </div>
    </section>
  );
}
