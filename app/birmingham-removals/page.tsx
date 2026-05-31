import type { Metadata } from "next";
import CityLandingPage, { buildMetadata, type CityPageData } from "@/components/CityLandingPage";

const data: CityPageData = {
  city: "Birmingham",
  headline: "Birmingh<span class=\"font-display italic font-normal\">a</span>m rem<span class=\"font-display italic font-normal\">o</span>v<span class=\"font-display italic font-normal\">a</span>ls.<br />D<span class=\"font-display italic font-normal\">o</span>ne right.",
  sub: "Post your job in 60 seconds. We match you to a verified Birmingham driver. Fixed price, no surprises.",
  stats: [
    { stat: "4.9★", label: "Verified reviews" },
    { stat: "< 60s", label: "Response time" },
    { stat: "Fixed", label: "Price. Always." },
    { stat: "B1–B45", label: "All postcodes" },
  ],
  steps: [
    { num: "01", title: "Post your job", desc: "60 seconds. No account needed. Free to post." },
    { num: "02", title: "We find your driver", desc: "Verified Birmingham driver, matched and confirmed by our team." },
    { num: "03", title: "Confirm your price", desc: "Fixed. Locked before anything moves. No surprises." },
    { num: "04", title: "Move day", desc: "On time. Professional. Done properly." },
  ],
  testimonials: [
    {
      initials: "SK",
      name: "Sara K.",
      location: "Edgbaston → Moseley",
      quote: "Called within a minute of posting. Fixed price confirmed on the spot. Driver was early, careful, and professional. Couldn't fault a thing.",
    },
    {
      initials: "MR",
      name: "Marcus R.",
      location: "Digbeth → Harborne",
      quote: "4-bed move across Birmingham. Two vans, team of three. Everything in the right room, not one scratch. Worth every penny.",
    },
    {
      initials: "AH",
      name: "Anya H.",
      location: "Sutton Coldfield → Bournville",
      quote: "Same-day move sorted by 11am. Didn't think it was possible. These guys made it look easy.",
    },
  ],
  faq: [
    { q: "Do you cover all Birmingham postcodes?", a: "Yes — every B postcode from B1 to B45, including Sutton Coldfield, Solihull, and surrounding areas. 7 days a week, 7am to 10pm." },
    { q: "Is the price fixed or an estimate?", a: "Always fixed. The price confirmed on the call is the price you pay. Nothing is added on the day without your explicit approval." },
    { q: "How quickly can you match me?", a: "Within 60 seconds of posting your job, our team calls to confirm a verified driver and locked quote." },
    { q: "Can I book same-day in Birmingham?", a: "Yes — same-day is available most days. Post before 10am for best availability. Urgent? Call us directly." },
    { q: "Are drivers background-checked?", a: "Every driver is verified, insured, and rated by real customers before they're assigned to any job. No exceptions." },
  ],
  source: "birmingham_removals",
};

export const metadata: Metadata = buildMetadata(data);

export default function BirminghamRemovals() {
  return <CityLandingPage data={data} />;
}
