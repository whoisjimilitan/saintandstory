interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  type?: "default" | "success" | "warning" | "error";
}

interface TimelineProps {
  events: TimelineEvent[];
}

const typeColors = {
  default: "bg-[#E8E8E8]",
  success: "bg-[#10b981]",
  warning: "bg-[#FBBF24]",
  error: "bg-[#EF4444]",
};

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${typeColors[event.type || "default"]}`} />
            {index < events.length - 1 && (
              <div className="w-0.5 h-12 bg-[#E8E8E8] mt-2" />
            )}
          </div>
          <div className="pb-4 flex-1">
            <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
              {event.timestamp}
            </p>
            <p className="font-medium text-[#0D0D0D] text-sm mt-1">
              {event.title}
            </p>
            {event.description && (
              <p className="text-[#888888] text-xs mt-1">
                {event.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
