import type { Metadata } from "next";
import CityLandingPage, { buildMetadata, type CityPageData } from "@/components/CityLandingPage";
import ModalProvider from "@/components/ModalProvider";
import AutoOpenModal from "@/components/AutoOpenModal";

const data: CityPageData = {
  city: "Bristol",
  headline: "Brist<span class=\"font-display italic font-normal\">o</span>l removals.<br />Pr<span class=\"font-display italic font-normal\">o</span>perly d<span class=\"font-display italic font-normal\">o</span>ne.",
sub: "Fixed price. Verified driver. Response to call within 15 minutes of posting.",
  stats: [
    { stat: "4.9★", label: "Verified reviews" },
    { stat: "< 15m", label: "Response time" },
    { stat: "Fixed", label: "Price. Always." },
    { stat: "BS1–BS41", label: "All postcodes" },
  ],
  steps: [
    { num: "01", title: "Tell us what's moving.", desc: "Fill in the basics. 60 seconds. No account needed." },
    { num: "02", title: "Driver confirmed", desc: "Verified Bristol driver, confirmed, confirmed, and briefed by us." },
    { num: "03", title: "Confirm your price", desc: "Fixed before anything moves. No surprises on move day." },
    { num: "04", title: "Move day", desc: "Professional, on time, done properly." },
  ],
  testimonials: [
    {
      initials: "HB",
      name: "Hannah B.",
      location: "Clifton → Bedminster",
      quote: "Clifton town house with narrow stairs and no parking. Driver came prepared with the right equipment and didn't charge extra. Impressed.",
    },
    {
      initials: "OW",
      name: "Owen W.",
      location: "Easton → Southville",
      quote: "Fixed price quoted. Fixed price paid. That alone puts them ahead of every other removal company I've used in Bristol.",
    },
    {
      initials: "RL",
      name: "Rachel L.",
      location: "Stokes Croft → Filton",
      quote: "Posted on a Sunday morning. Called back in under a minute. Driver confirmed for Monday. Whole thing done before lunch.",
    },
  ],
  faq: [
    { q: "Do you cover the whole Bristol area?", a: "We cover all BS postcodes including Bath, Clevedon, and surrounding areas. Seven days a week, 7am to 10pm." },
    { q: "What about narrow streets and no parking?", a: "Bristol's tricky streets are our speciality. Parking permits and access challenges are handled upfront, included in your fixed price." },
    { q: "Is the price fixed?", a: "Completely fixed. Confirmed on the call before anything moves. No additions without your explicit approval." },
    { q: "Can you do same-day in Bristol?", a: "Same-day is available most days. Post before 10am for the best slots." },
    { q: "Are your drivers vetted?", a: "Every driver is background-checked, insured, and rated by real Bristol customers. You always know who's coming." },
  ],
  source: "bristol_removals",
};

export const metadata: Metadata = buildMetadata(data);

export default function BristolRemovals() {
  return (
    <>
      <ModalProvider />
      <AutoOpenModal delayMs={800} />
      <CityLandingPage data={data} />
    </>
  );
}
