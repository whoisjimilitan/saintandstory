import { Movement } from "@/lib/prospect-types";

interface ProspectMovementCardProps {
  movement: Movement;
}

export function ProspectMovementCard({ movement }: ProspectMovementCardProps) {
  return (
    <div className="bg-white border border-[#E8E8E8] rounded-2xl p-8">
      <h3 className="text-[#0D0D0D] font-sans font-black text-2xl tracking-tight mb-4">
        {movement.type}
      </h3>

      <p className="text-[#0D0D0D] text-base leading-relaxed mb-6">
        {movement.briefDescription}
      </p>

      <div className="border-t border-[#E8E8E8] pt-4">
        <p className="text-[#0D0D0D] text-sm font-semibold mb-2">How Saint & Story helps:</p>
        <p className="text-[#555555] text-base leading-relaxed">
          {movement.howWeSolveIt}
        </p>
      </div>
    </div>
  );
}
