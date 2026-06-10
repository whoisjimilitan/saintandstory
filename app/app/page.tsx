import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ModalCTA from "@/components/ModalCTA";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Get the App | Saint & Story Logistics",
  description: "Post jobs, track your move, and manage everything from your phone. Add Saint & Story to your home screen — works on iPhone and Android.",
};

const FEATURES = [
  {
    title: "Fixed price in minutes.",
    desc: "Tap, fill in the details, submit. Our team calls you back within 15 minutes with a locked price.",
  },
  {
    title: "Track your move in real time.",
    desc: "From driver confirmed to job complete. Every status update on your home screen.",
  },
  {
    title: "All your jobs, one place.",
    desc: "Past jobs, upcoming moves, tracking links. Everything accessible without logging in each time.",
  },
  {
    title: "Works offline.",
    desc: "Moving day chaos? Your job details are cached and available even without signal.",
  },
];

const INSTALL_STEPS_IOS = [
  { num: "01", step: "Open saintandstoryltd.co.uk in Safari" },
  { num: "02", step: "Tap the Share button (square with arrow)" },
  { num: "03", step: "Scroll down and tap \"Add to Home Screen\"" },
  { num: "04", step: "Tap \"Add\" — done" },
];

const INSTALL_STEPS_ANDROID = [
  { num: "01", step: "Open saintandstoryltd.co.uk in Chrome" },
  { num: "02", step: "Tap the three-dot menu in the top right" },
  { num: "03", step: "Tap \"Add to Home screen\"" },
  { num: "04", step: "Tap \"Add\" — done" },
];

export default function AppPage() {
  return (
    <main>
      <Nav />

      <section className="bg-white pt-16 min-h-[70vh] flex items-center border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-6 py-20 w-full">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-5">
            Mobile app
          </p>
          <h1 className="font-sans font-black text-[#0D0D0D] text-5xl md:text-6xl xl:text-7xl leading-[1.0] tracking-tight mb-6 max-w-2xl">
            Saint <span className="font-display italic font-normal">&amp;</span> St<span className="font-display italic font-normal">o</span>ry
            <br />in y<span className="font-display italic font-normal">o</span>ur
            <br />p<span className="font-display italic font-normal">o</span>cket.
          </h1>
          <p className="text-[#888888] text-base mb-10 max-w-sm">
            Add to your home screen. Works on iPhone and Android. No app store needed.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#ios"
              className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            >
              iPhone instructions →
            </a>
            <a
              href="#android"
              className="border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            >
              Android instructions
            </a>
          </div>
        </div>
      </section>

      <section className="bg-[#F5F5F5] py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-14">
            Everything at a tap.
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white border border-[#E8E8E8] rounded-2xl p-7">
                <h3 className="font-sans font-bold text-[#0D0D0D] text-base mb-2">{f.title}</h3>
                <p className="text-[#888888] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ios" className="bg-white py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">iPhone · Safari</p>
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-8">
              Add t<span className="font-display italic font-normal">o</span>
              <br />h<span className="font-display italic font-normal">o</span>me screen.
            </h2>
            <p className="text-[#888888] text-sm leading-relaxed">
              No App Store. No download. Installs in 15 seconds and lives on your home screen exactly like a native app.
            </p>
          </div>
          <div className="space-y-3">
            {INSTALL_STEPS_IOS.map((s) => (
              <div key={s.num} className="flex items-start gap-4 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl px-5 py-4">
                <span className="font-sans font-black text-[#888888] text-sm shrink-0">{s.num}</span>
                <p className="text-[#0D0D0D] text-sm font-medium">{s.step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="android" className="bg-[#F5F5F5] py-24 px-6 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">Android · Chrome</p>
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl leading-tight tracking-tight mb-8">
              Install
              <br />fr<span className="font-display italic font-normal">o</span>m
              <br />Chr<span className="font-display italic font-normal">o</span>me.
            </h2>
            <p className="text-[#888888] text-sm leading-relaxed">
              Works on all Android devices with Chrome. Install in seconds — no Play Store account required.
            </p>
          </div>
          <div className="space-y-3">
            {INSTALL_STEPS_ANDROID.map((s) => (
              <div key={s.num} className="flex items-start gap-4 bg-white border border-[#E8E8E8] rounded-xl px-5 py-4">
                <span className="font-sans font-black text-[#888888] text-sm shrink-0">{s.num}</span>
                <p className="text-[#0D0D0D] text-sm font-medium">{s.step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0D0D0D] py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <h2 className="font-sans font-black text-white text-4xl md:text-5xl leading-tight tracking-tight">
            Ready t<span className="font-display italic font-normal">o</span>
            <br />get m<span className="font-display italic font-normal">o</span>ving?
          </h2>
          <div>
            <p className="font-sans font-medium text-white/80 text-lg leading-relaxed mb-8">
              Tell us your move. Response to call back with a fixed price.
            </p>
            <ModalCTA
              label="Get a fixed price — free →"
              source="app_page_cta"
              className="inline-block bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold px-7 py-3.5 rounded-full text-sm transition-colors"
            />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
