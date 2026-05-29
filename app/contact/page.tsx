import type { Metadata } from "next";
import Nav from "@/components/Nav";
import MobileBar from "@/components/MobileBar";
import QuoteForm from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Contact Us | Saint & Story Logistics",
  description: "Get in touch with Saint & Story Logistics. Free quotes, same-day availability, and a 1-minute response guarantee.",
};

export default function ContactPage() {
  return (
    <main className="pb-20 md:pb-0">
      <Nav />

      {/* Hero */}
      <section className="bg-white pt-28 pb-14 md:pt-36 md:pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-[10px] font-bold text-[#E8244A] uppercase tracking-[0.4em]">Get in touch</span>
          <h1 className="font-sans font-black text-[#0D0E17] text-4xl md:text-5xl leading-[1.05] tracking-tight mt-3 mb-4">
            Let&apos;s talk about<br />
            <span className="text-[#E8244A]">your move.</span>
          </h1>
          <p className="text-[#0D0E17]/50 text-lg max-w-md mx-auto">
            Fill in the form and we&apos;ll get back to you within 1 minute. Or call us directly — we answer 7 days a week.
          </p>
        </div>
      </section>

      {/* Contact grid */}
      <section className="bg-[#F6F7FA] py-14 md:py-20 px-6">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Left — details */}
          <div>
            <div className="space-y-6 mb-10">
              {[
                {
                  icon: (
                    <svg className="w-5 h-5 text-[#E8244A]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  ),
                  label: "Phone",
                  value: "+44 7885 465680",
                  href: "tel:+447885465680",
                },
                {
                  icon: (
                    <svg className="w-5 h-5 text-[#E8244A]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  ),
                  label: "Email",
                  value: "hello@saintandstory.com",
                  href: "mailto:hello@saintandstory.com",
                },
                {
                  icon: (
                    <svg className="w-5 h-5 text-[#E8244A]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  ),
                  label: "Hours",
                  value: "Mon–Sun, 7am–10pm",
                  href: null,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#E8244A]/10 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#0D0E17]/40 uppercase tracking-[0.2em] mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm font-semibold text-[#0D0E17] hover:text-[#E8244A] transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-[#0D0E17]">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Response time callout */}
            <div className="border border-[#E8244A]/20 rounded-2xl p-6 bg-white">
              <p className="text-[#0D0E17]/35 text-[10px] uppercase tracking-[0.4em] font-semibold mb-1">Average response time</p>
              <p className="font-display text-[#E8244A] text-4xl font-semibold">1 minute</p>
              <p className="text-[#0D0E17]/30 text-xs mt-2">Mon–Sun, 7am–10pm</p>
            </div>
          </div>

          {/* Right — form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#0D0E17]/8">
            <h2 className="font-sans font-black text-[#0D0E17] text-lg mb-1">Request a free quote</h2>
            <p className="text-[#0D0E17]/40 text-sm mb-6">We&apos;ll call you within 1 minute to discuss your move.</p>
            <QuoteForm />
          </div>

        </div>
      </section>

      <MobileBar />
    </main>
  );
}
