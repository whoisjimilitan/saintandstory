import type { Metadata } from "next";
import CityLandingPage, { buildMetadata, type CityPageData } from "@/components/CityLandingPage";

const data: CityPageData = {
  city: "Liverpool",
  headline: "Liverp<span class=\"font-display italic font-normal\">o</span><span class=\"font-display italic font-normal\">o</span>l rem<span class=\"font-display italic font-normal\">o</span>v<span class=\"font-display italic font-normal\">a</span>ls.<br />Fixed. Fast.<br />Pr<span class=\"font-display italic font-normal\">o</span>per.",
  sub: "Post your job in 60 seconds. Verified Liverpool driver matched and confirmed. No guesswork, no surprises.",
  stats: [
    { stat: "4.9★", label: "Verified reviews" },
    { stat: "< 15m", label: "Response time" },
    { stat: "Fixed", label: "Price. Always." },
    { stat: "L1–L40", label: "All postcodes" },
  ],
  steps: [
    { num: "01", title: "Post your job", desc: "60 seconds. No account needed. Free to post." },
    { num: "02", title: "We find your driver", desc: "Verified Liverpool driver selected and briefed by our team." },
    { num: "03", title: "Confirm your price", desc: "Fixed on the call. Locked before anything moves." },
    { num: "04", title: "Move day", desc: "Professional, punctual, properly done." },
  ],
  testimonials: [
    {
      initials: "CB",
      name: "Clare B.",
      location: "Aigburth → Crosby",
      quote: "3-bed terrace, two flights of stairs, no lift. Team handled it without complaint or extra charge. Exactly what was quoted.",
    },
    {
      initials: "NM",
      name: "Niall M.",
      location: "Baltic Triangle → Wavertree",
      quote: "Called at 8:57am. Driver confirmed by 9:00. Same-day move done by 1pm. These guys are genuinely different.",
    },
    {
      initials: "PW",
      name: "Paula W.",
      location: "Toxteth → West Derby",
      quote: "Fixed price is everything. No guessing, no surprises, no arguments on the day. Brilliant service, start to finish.",
    },
  ],
  faq: [
    { q: "Do you cover all Liverpool postcodes?", a: "We cover all L postcodes from the city centre to Southport and the Wirral. Seven days a week, 7am to 10pm." },
    { q: "Is the price truly fixed?", a: "Absolutely. The price confirmed on our call is what you pay. Nothing is added on move day without your approval." },
    { q: "How fast is the response?", a: "We call within 15 minutes of you posting. Driver assigned and price locked before we hang up." },
    { q: "Can you move same-day in Liverpool?", a: "Same-day availability most days. Post before 10am. Urgent? Call us directly." },
    { q: "What if something gets damaged?", a: "Every move is fully insured. We handle any damage claim directly. No complicated process." },
  ],
  source: "liverpool_removals",
};

export const metadata: Metadata = buildMetadata(data);

export default function LiverpoolRemovals() {
  return <CityLandingPage data={data} />;
}
