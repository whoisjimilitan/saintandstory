import type { Metadata } from "next";
import CityLandingPage, { buildMetadata, type CityPageData } from "@/components/CityLandingPage";

const data: CityPageData = {
  city: "Sheffield",
  headline: "Sheffield rem<span class=\"font-display italic font-normal\">o</span>v<span class=\"font-display italic font-normal\">a</span>ls.<br />Fixed.<br />Fuss-free.",
  sub: "Post your Sheffield removal in 60 seconds. We match you to a verified local driver. Fixed price, no surprises.",
  stats: [
    { stat: "4.9★", label: "Verified reviews" },
    { stat: "< 15m", label: "Response time" },
    { stat: "Fixed", label: "Price. Always." },
    { stat: "S1–S36", label: "All postcodes" },
  ],
  steps: [
    { num: "01", title: "Post your job", desc: "60 seconds. No account needed. Free to post." },
    { num: "02", title: "We find your driver", desc: "Verified Sheffield driver, matched by our team and confirmed." },
    { num: "03", title: "Confirm your price", desc: "Fixed on the call. Locked before anything moves." },
    { num: "04", title: "Move day", desc: "Professional, on time, done properly." },
  ],
  testimonials: [
    {
      initials: "TG",
      name: "Tom G.",
      location: "Ecclesall → Walkley",
      quote: "Student move from halls to a shared house. Fixed price, showed up on time, handled everything without fuss. Will use again.",
    },
    {
      initials: "SB",
      name: "Sarah B.",
      location: "Hillsborough → Woodseats",
      quote: "Posted at 8am, confirmed by 8:02. Driver arrived exactly on time. Everything loaded, moved, and unloaded without a scratch.",
    },
    {
      initials: "RH",
      name: "Rob H.",
      location: "Crookes → Dore",
      quote: "Fixed price is just honest. Other companies gave vague estimates. Saint & Story gave me a number and stuck to it. Brilliant.",
    },
  ],
  faq: [
    { q: "Do you cover all Sheffield postcodes?", a: "We cover all S postcodes from the city centre to Chesterfield and Rotherham. 7 days a week, 7am to 10pm." },
    { q: "Do you do student moves in Sheffield?", a: "Student moves are a speciality. Halls to flat, flat to flat, Sheffield to anywhere in the UK. Fixed price." },
    { q: "Is the price fixed?", a: "Completely fixed. Confirmed on the call before anything moves. Nothing added on the day without your approval." },
    { q: "How fast is the response?", a: "We call within 15 minutes of posting. Driver matched and price locked before we hang up." },
    { q: "What if something gets damaged?", a: "Every move is fully insured. We handle damage claims directly. No complicated process." },
  ],
  source: "sheffield_removals",
};

export const metadata: Metadata = buildMetadata(data);

export default function SheffieldRemovals() {
  return <CityLandingPage data={data} />;
}
