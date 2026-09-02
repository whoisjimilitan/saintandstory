interface AvatarProps {
  initials: string;
  name: string;
  role: "Customer" | "Driver";
}

export default function IllustratedAvatar({ initials, name, role }: AvatarProps) {
  const colorMap: Record<string, string> = {
    SM: "bg-slate-700",
    TO: "bg-slate-600",
    PK: "bg-slate-500",
    DF: "bg-slate-800",
    JR: "bg-slate-700",
    AS: "bg-slate-600",
    MC: "bg-slate-800",
    NK: "bg-slate-500",
    RP: "bg-slate-700",
    EJ: "bg-slate-600",
    CP: "bg-slate-800",
    TS: "bg-slate-700",
  };

  const bgColor = colorMap[initials] || "bg-slate-600";

  return (
    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${bgColor}`}>
      <span className="text-white text-[10px] font-bold leading-none">{initials}</span>
    </div>
  );
}
