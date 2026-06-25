import type { Metadata } from "next";
import CityLandingPage, { buildMetadata, type CityPageData } from "@/components/CityLandingPage";
import ModalProvider from "@/components/ModalProvider";
import AutoOpenModal from "@/components/AutoOpenModal";

const data: CityPageData = {
  city: "Glasgow",
  headline: "Glasg<span class=\"font-display italic font-normal\">o</span>w removals.<br />N<span class=\"font-display italic font-normal\">o</span> fuss.<br />Fixed price.",
sub: "Tell us about your Glasgow removal. Verified driver confirmed. from the first call.",
  stats: [
    { stat: "4.9★", label: "Verified reviews" },
    { stat: "< 15m", label: "Response time" },
    { stat: "Fixed", label: "Price. Always." },
    { stat: "G1–G78", label: "All postcodes" },
  ],
  steps: [
    { num: "01", title: "Tell us what's moving.", desc: "Fill in the basics. 60 seconds. No account needed." },
    { num: "02", title: "Driver confirmed", desc: "Verified Glasgow driver, confirmed." },
    { num: "03", title: "Confirm your price", desc: "Fixed on the call before anything moves." },
    { num: "04", title: "Move day", desc: "On time. Professional. Done properly." },
  ],
  testimonials: [
    {
      initials: "FD",
      name: "Fiona D.",
      location: "West End → Southside",
      quote: "Tenement flat, third floor, no lift. Driver and assistant handled it without a word of complaint. Everything arrived intact. Outstanding.",
    },
    {
      initials: "KM",
      name: "Kieran M.",
      location: "Merchant City → Partick",
      quote: "Fixed price confirmed on the call. Exactly that paid at the end. First time I've felt genuinely confident booking a removal.",
    },
    {
      initials: "IG",
      name: "Isla G.",
      location: "Shawlands → Bearsden",
      quote: "Brilliant from start to finish. Posted Sunday afternoon, driver confirmed Sunday evening for Monday morning. Seamless.",
    },
  ],
  faq: [
    { q: "Do you cover all Glasgow postcodes?", a: "We cover all G postcodes including Paisley, Rutherglen, and surrounding areas. Seven days a week, 7am to 10pm." },
    { q: "Can you handle tenement flats?", a: "Tenements are something Handling deal with every day in Glasgow. Narrow stairs and high floors at no extra charge." },
    { q: "Is the price fixed?", a: "Completely fixed. Confirmed before anything moves. Nothing added on move day without your approval." },
    { q: "Can you move the same day?", a: "Same-day is available most days. Post before 10am for the best slots." },
    { q: "Are your drivers vetted?", a: "Every driver is background-checked, insured, and rated by real customers before being assigned any job." },
  ],
  source: "glasgow_removals",
};

export const metadata: Metadata = buildMetadata(data);

export default function GlasgowRemovals() {
  return (
    <>
      <ModalProvider />
      <AutoOpenModal delayMs={800} />
      <CityLandingPage data={data} />
    </>
  );
}
