"use client";

import { useEffect, useState } from "react";
import DriverModalCTA from "./DriverModalCTA";

type Side = "customer" | "driver";

const CUSTOMER_ROW_ONE = [
  "Home moves", "Office relocations", "Student moves", "Same-day delivery",
  "Piano transport", "Furniture removal", "Home moves", "Office relocations",
  "Student moves", "Same-day delivery", "Piano transport", "Furniture removal",
];

const CUSTOMER_ROW_TWO = [
  "Long distance", "Courier runs", "Storage drops", "Flat pack assembly",
  "Man & van", "Full removals", "Long distance", "Courier runs",
  "Storage drops", "Flat pack assembly", "Man & van", "Full removals",
];

const DRIVER_ROW_ONE = [
  "London", "Manchester", "Birmingham", "Leeds", "Sheffield", "Liverpool",
  "Bristol", "Edinburgh", "Glasgow", "Cardiff", "Newcastle", "Nottingham",
  "London", "Manchester", "Birmingham", "Leeds", "Sheffield", "Liverpool",
  "Bristol", "Edinburgh", "Glasgow", "Cardiff", "Newcastle", "Nottingham",
];

const DRIVER_ROW_TWO = [
  "Brighton", "Oxford", "Cambridge", "Leicester", "Coventry", "Southampton",
  "Portsmouth", "Reading", "Derby", "Plymouth", "Stoke", "Wolverhampton",
  "Brighton", "Oxford", "Cambridge", "Leicester", "Coventry", "Southampton",
  "Portsmouth", "Reading", "Derby", "Plymouth", "Stoke", "Wolverhampton",
];

export default function ForEveryMove() {
  const [side, setSide] = useState<Side>("customer");

  useEffect(() => {
    const handler = (e: Event) => {
      setSide((e as CustomEvent<{ side: Side }>).detail.side);
    };
    document.addEventListener("hero-side-change", handler);
    return () => document.removeEventListener("hero-side-change", handler);
  }, []);

  const isDriver = side === "driver";
  const rowOne = isDriver ? DRIVER_ROW_ONE : CUSTOMER_ROW_ONE;
  const rowTwo = isDriver ? DRIVER_ROW_TWO : CUSTOMER_ROW_TWO;

  return (
    <section className="bg-[#F5F5F5] py-24 border-t border-[#E8E8E8] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-14">
        <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-5xl leading-tight tracking-tight">
          {isDriver ? (
            <>W<span className="font-display italic font-normal">o</span>rk anywhere in the UK.</>
          ) : (
            <>For every kind of m<span className="font-display italic font-normal">o</span>ve.</>
          )}
        </h2>
      </div>

      <div className="space-y-3 mb-20">
        <div className="flex gap-3 animate-marquee whitespace-nowrap">
          {rowOne.map((item, i) => (
            <span
              key={i}
              className="inline-block border border-[#E8E8E8] bg-white text-[#0D0D0D] text-sm font-medium px-5 py-2.5 rounded-full"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="flex gap-3 animate-marquee-reverse whitespace-nowrap">
          {rowTwo.map((item, i) => (
            <span
              key={i}
              className="inline-block border border-[#E8E8E8] bg-white text-[#0D0D0D] text-sm font-medium px-5 py-2.5 rounded-full"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:items-end justify-between gap-8">
        {isDriver ? (
          <>
            <p className="font-sans font-black text-[#0D0D0D] text-2xl md:text-4xl leading-tight tracking-tight">
              J<span className="font-display italic font-normal">o</span>bs come to you.
              <br />In y<span className="font-display italic font-normal">o</span>ur area. On y<span className="font-display italic font-normal">o</span>ur terms.
            </p>
            <DriverModalCTA
              label="Join as driver →"
              source="for_every_move_driver"
              className="shrink-0 bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
          </>
        ) : (
          <>
            <p className="font-sans font-black text-[#0D0D0D] text-2xl md:text-4xl leading-tight tracking-tight">
              We&apos;ve done the hard part.
              <br />
              Now just get m<span className="font-display italic font-normal">o</span>ving.
            </p>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); document.dispatchEvent(new CustomEvent("open-lead-modal")); }}
              className="shrink-0 bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            >
              Post a job →
            </a>
          </>
        )}
      </div>
    </section>
  );
}
