"use client";

interface EmailResponse {
  id: string;
  responseType: "YES" | "MAYBE" | "NO" | "NO_RESPONSE";
  respondedAt?: Date;
  emailSentAt: Date;
}

interface ResponsesSectionProps {
  prospectId: string;
  responses: EmailResponse[];
}

export function ResponsesSection({ prospectId, responses }: ResponsesSectionProps) {
  const getTemperature = (type: string) => {
    const temps: Record<string, string> = {
      YES: "ULTRA_HOT",
      MAYBE: "WARM",
      NO: "COLD",
      NO_RESPONSE: "COLD",
    };
    return temps[type] || "COLD";
  };

  const getTemperatureColor = (type: string) => {
    const colors: Record<string, string> = {
      ULTRA_HOT: "text-red-600",
      WARM: "text-amber-600",
      COLD: "text-gray-600",
    };
    return colors[getTemperature(type)] || "text-gray-600";
  };

  const getHoursSince = (date: Date) => {
    const hours = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60));
    if (hours < 1) return "< 1h";
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  if (responses.length === 0) {
    return (
      <div className="bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg p-6">
        <p className="text-sm text-[#888888]">No responses yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.15em]">
        Response History
      </h3>
      {responses.map((response) => (
        <div key={response.id} className="border border-[#E8E8E8] rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${getTemperatureColor(response.responseType)}`}>
                {getTemperature(response.responseType)}
              </p>
              <p className="text-xs text-[#888888] mt-1">
                Responded {getHoursSince(response.respondedAt || response.emailSentAt)} ago
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase">
                {response.responseType}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
