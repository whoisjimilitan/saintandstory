"use client";

interface GoodMorningItem {
  action: string;
  source: string;
  severity: "low" | "medium" | "high";
}

interface GoodMorningSectionProps {
  items: GoodMorningItem[];
}

export default function GoodMorningSection({ items }: GoodMorningSectionProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="mb-16">
      <h1 className="font-sans font-black text-[#0D0D0D] text-5xl tracking-tight mb-8">
        Good Morning.
      </h1>

      <div className="bg-white border border-[#E8E8E8] rounded px-8 py-8">
        <div className="space-y-4">
          {items.map((item, idx) => (
            <p key={idx} className="text-base leading-relaxed text-[#0D0D0D]">
              <span className={`font-semibold ${getSeverityColor(item.severity)}`}>
                {item.action}
              </span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case "high":
      return "text-[#CC6600]";
    case "medium":
      return "text-[#0D0D0D]";
    default:
      return "text-[#666666]";
  }
}
