import type { Metadata } from "next";
import CityLandingPage, { buildMetadata, type CityPageData } from "@/components/CityLandingPage";

const data: CityPageData = {
  city: "Bristol",
  headline: "Brist<span class=\"font-display italic font-normal\">o</span>l rem<span class=\"font-display italic font-normal\">o</span>v<span class=\"font-display italic font-normal\">a</span>ls.<br />Pr<span class=\"font-display italic font-normal\">o</span>perly d<span class=\"font-display italic font-normal\">o</span>ne.",
  sub: "Fixed price. Verified driver. We call within 15 minutes of posting. No surprises.",
  stats: [
    { stat: "4.9★", label: "Verified reviews" },
    { stat: "< 15m", label: "Response time" },
    { stat: "Fixed", label: "Price. Always." },
    { stat: "BS1–BS41", label: "All postcodes" },
  ],
  steps: [
    { num: "01", title: "Post your job", desc: "60 seconds. No account needed. Free to post." },
    { num: "02", title: "We find your driver", desc: "Verified Bristol driver — matched, confirmed, and briefed by us." },
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
    { q: "Do you cover the whole Bristol area?", a: "Yes — all BS postcodes including Bath, Clevedon, and the surrounding area. 7 days a week, 7am to 10pm." },
    { q: "What about narrow streets and no parking?", a: "Bristol's tricky streets are our speciality. Parking permits and access challenges are handled upfront — included in your fixed price." },
    { q: "Is the price fixed?", a: "Completely fixed. Confirmed on the call before anything moves. No additions without your explicit approval." },
    { q: "Can you do same-day in Bristol?", a: "Yes — same-day is available most days. Post before 10am for best availability." },
    { q: "Are your drivers vetted?", a: "Every driver is background-checked, insured, and rated by real Bristol customers. You always know who's coming." },
  ],
  source: "bristol_removals",
};

export const metadata: Metadata = buildMetadata(data);

export default function BristolRemovals() {
  return <CityLandingPage data={data} />;
}
