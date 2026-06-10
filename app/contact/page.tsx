import type { Metadata } from "next";
import Nav from "@/components/Nav";
import MobileBar from "@/components/MobileBar";
import ModalCTA from "@/components/ModalCTA";

export const metadata: Metadata = {
  title: "Contact Saint & Story | UK Removal Company | 0203 051 7408",
  description: "Get a free removal quote from Saint & Story. Response to call back within 15 minutes, seven days a week. Call 0203 051 7408 or tell us about your move online.",
};

const DETAILS = [
  { label: "Phone", value: "0203 051 7408", href: "tel:+442030517408" },
  { label: "Email", value: "hello@saintandstoryltd.co.uk", href: "mailto:hello@saintandstoryltd.co.uk" },
  { label: "Hours", value: "Mon–Sun, 7am–10pm", href: null },
];

export default function ContactPage() {
  return (
    <main className="pb-20 md:pb-0">
      <Nav />

      <section className="bg-white pt-28 pb-16 md:pt-36 md:pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-5">
            Get in touch
          </p>
          <h1 className="font-sans font-black text-[#0D0D0D] text-4xl md:text-5xl leading-[1.05] tracking-tight mb-4">
            Let&apos;s talk ab<span className="font-display italic font-normal">o</span>ut
            <br />y<span className="font-display italic font-normal">o</span>ur move.
          </h1>
          <p className="text-[#888888] text-base max-w-sm">
            Fill in the form. Response to call back within 15 minutes.
          </p>
        </div>
      </section>

      <section className="bg-[#F5F5F5] py-16 md:py-20 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          <div>
            <div className="space-y-6 mb-10">
              {DETAILS.map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-1">
                    {item.label}
                  </p>
                  {item.href ? (
                    <a href={item.href} className="text-sm font-semibold text-[#0D0D0D] hover:text-[#888888] transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-[#0D0D0D]">{item.value}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="border border-[#E8E8E8] rounded-2xl p-6 bg-white">
              <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-2">
                Average response time
              </p>
              <p className="font-sans font-black text-[#0D0D0D] text-4xl tracking-tight">
                15 m<span className="font-display italic font-normal">i</span>nutes
              </p>
              <p className="text-[#888888] text-xs mt-2">Mon–Sun, 7am–10pm</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-[#E8E8E8] flex flex-col gap-6">
            <div>
              <h2 className="font-sans font-black text-[#0D0D0D] text-lg mb-1">Request a free quote</h2>
              <p className="text-[#888888] text-sm">Tell us about your move. Response to call back within 15 minutes.</p>
            </div>
            <ModalCTA
              label="Get a fixed price — free →"
              source="contact_page"
              className="w-full bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold py-4 rounded-full text-sm transition-colors"
            />
            <p className="text-[#888888] text-xs">No obligation. Fixed price on the call.</p>
          </div>

        </div>
      </section>

      <MobileBar />
    </main>
  );
}
