interface StatusPillProps {
  status: "pending" | "active" | "success" | "error" | "online" | "offline";
  text: string;
}

const statusStyles = {
  pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  active: "bg-blue-50 text-blue-700 border border-blue-200",
  success: "bg-green-50 text-green-700 border border-green-200",
  error: "bg-red-50 text-red-700 border border-red-200",
  online: "bg-green-50 text-green-700 border border-green-200",
  offline: "bg-gray-50 text-gray-700 border border-gray-200",
};

export function StatusPill({ status, text }: StatusPillProps) {
  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.1em] ${statusStyles[status]}`}>
      {text}
    </span>
  );
}
