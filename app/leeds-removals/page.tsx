import type { Metadata } from "next";
import CityLandingPage, { buildMetadata, type CityPageData } from "@/components/CityLandingPage";

const data: CityPageData = {
  city: "Leeds",
  headline: "Leeds rem<span class=\"font-display italic font-normal\">o</span>v<span class=\"font-display italic font-normal\">a</span>ls.<br />Fixed price.<br />N<span class=\"font-display italic font-normal\">o</span> dr<span class=\"font-display italic font-normal\">a</span>m<span class=\"font-display italic font-normal\">a</span>.",
  sub: "Post your job in 60 seconds. Verified Leeds driver matched and confirmed. Fixed price guaranteed.",
  stats: [
    { stat: "4.9★", label: "Verified reviews" },
    { stat: "< 15m", label: "Response time" },
    { stat: "Fixed", label: "Price. Always." },
    { stat: "LS1–LS29", label: "All postcodes" },
  ],
  steps: [
    { num: "01", title: "Tell us what's moving.", desc: "Fill in the basics. 60 seconds. No account needed." },
    { num: "02", title: "We find your driver", desc: "Verified Leeds driver, matched and confirmed by our team." },
    { num: "03", title: "Confirm your price", desc: "Fixed before anything moves. Locked on the call." },
    { num: "04", title: "Move day", desc: "On time. Professional. Exactly as confirmed." },
  ],
  testimonials: [
    {
      initials: "JP",
      name: "James P.",
      location: "Headingley → Chapel Allerton",
      quote: "Student move sorted in an afternoon. Fixed price, no van hire, no stress. They even helped with the flat pack I hadn't built yet.",
    },
    {
      initials: "LM",
      name: "Lucy M.",
      location: "Roundhay → Horsforth",
      quote: "3-bed house move. Driver was professional, careful, and ten minutes early. The price quoted was the price paid. Simple.",
    },
    {
      initials: "DT",
      name: "Dev T.",
      location: "City Centre → Meanwood",
      quote: "Called at 9:01am. Driver confirmed by 9:03. Same-day move completed by 2pm. That kind of efficiency deserves five stars.",
    },
  ],
  faq: [
    { q: "Do you cover all Leeds postcodes?", a: "We cover all LS postcodes from the city centre to Otley, Wetherby, and beyond. Seven days a week, 7am to 10pm." },
    { q: "Is the price fixed or an estimate?", a: "Fixed. Always. The number on the call is the number you pay. No additions on move day." },
    { q: "Can I book a student move in Leeds?", a: "Student moves are a speciality. End of term, halls to flat, Leeds to any UK city. Fixed price, no van hire." },
    { q: "How quickly do you respond?", a: "Our team calls within 15 minutes of you posting. Driver matched and price locked before we hang up." },
    { q: "Are drivers vetted?", a: "Every driver is background-checked, insured, and rated by real customers. You always know who's coming." },
  ],
  source: "leeds_removals",
};

export const metadata: Metadata = buildMetadata(data);

export default function LeedsRemovals() {
  return <CityLandingPage data={data} />;
}
