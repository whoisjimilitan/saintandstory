import Link from "next/link";

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function JobResponsePage({ searchParams }: Props) {
  const { status } = await searchParams;

  const config = {
    accepted: {
      heading: "Job confirmed.",
      sub: "The customer has been notified. Check your dashboard for full details.",
      cta: "Go to dashboard",
      href: "/dashboard/driver",
    },
    declined: {
      heading: "Got it.",
      sub: "We'll find another driver. No action needed from you.",
      cta: "Back to dashboard",
      href: "/dashboard/driver",
    },
    already_responded: {
      heading: "Already done.",
      sub: "You've already responded to this job.",
      cta: "Go to dashboard",
      href: "/dashboard/driver",
    },
  }[status ?? ""] ?? {
    heading: "Something went wrong.",
    sub: "Please contact us if you need help.",
    cta: "Go home",
    href: "/",
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="bg-[#0D0D0D] rounded-2xl px-8 py-10 mb-6">
          <h1 className="font-sans font-black text-white text-3xl tracking-tight mb-3">
            {config.heading}
          </h1>
          <p className="text-white/65 text-sm leading-relaxed">{config.sub}</p>
        </div>
        <Link
          href={config.href}
          className="inline-block bg-white border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-7 py-3 rounded-full text-sm transition-colors"
        >
          {config.cta} →
        </Link>
      </div>
    </div>
  );
}
