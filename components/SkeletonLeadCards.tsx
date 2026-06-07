export function SkeletonLeadCards({ count }: { count: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
        <div
          key={i}
          className="h-24 bg-gradient-to-r from-[#F5F5F5] via-[#EEEEEE] to-[#F5F5F5] rounded-xl animate-pulse border border-[#E8E8E8]"
        />
      ))}
      {count > 5 && (
        <div className="text-center py-2">
          <p className="text-[12px] text-[#888888]">Loading {count} leads...</p>
        </div>
      )}
    </div>
  );
}
