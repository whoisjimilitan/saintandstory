"use client";

import { useEffect, useState } from "react";
import ModalCTA from "./ModalCTA";
import DriverModalCTA from "./DriverModalCTA";
import DriverCount from "./DriverCount";

type Side = "customer" | "driver";

export default function ClaimArea() {
  const [side, setSide] = useState<Side>("customer");

  useEffect(() => {
    const handler = (e: Event) => {
      setSide((e as CustomEvent<{ side: Side }>).detail.side);
    };
    document.addEventListener("hero-side-change", handler);
    return () => document.removeEventListener("hero-side-change", handler);
  }, []);

  return (
    <section id="claim" className="bg-[#0D0D0D] py-24 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        {side === "driver" ? (
          <>
            <h2 className="font-sans font-black text-white text-4xl md:text-6xl leading-tight tracking-tight">
              G<span className="font-display italic font-normal">e</span>t
              <br />b<span className="font-display italic font-normal">o</span>oked.
            </h2>
            <div>
              <p className="font-sans font-medium text-white/80 text-lg leading-relaxed mb-8">
                <DriverCount /> drivers already earning.
                <br />
                P<span className="font-display italic font-normal">o</span>st y<span className="font-display italic font-normal">o</span>ur availability.
                <br />
                Keep everything y<span className="font-display italic font-normal">o</span>u earn.
              </p>
              <DriverModalCTA
                label="Join as driver →"
                source="claim_area_driver"
                className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
              />
            </div>
          </>
        ) : (
          <>
            <h2 className="font-sans font-black text-white text-4xl md:text-6xl leading-tight tracking-tight">
              Ready t<span className="font-display italic font-normal">o</span>
              <br />m<span className="font-display italic font-normal">o</span>ve?
            </h2>
            <div>
              <p className="font-sans font-medium text-white/80 text-lg leading-relaxed mb-8">
                Tell us what&apos;s moving.
                <br />
                Matched t<span className="font-display italic font-normal">o</span> a verified driver.
                <br />
                Fixed price. N<span className="font-display italic font-normal">o</span> surprises.
              </p>
              <ModalCTA
                label="Get a fixed price — free →"
                source="claim_area_customer"
                className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
              />
            </div>
          </>
        )}

      </div>
    </section>
  );
}
