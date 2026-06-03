import { Movement } from "@/lib/prospect-types";
import { ProspectMovementCard } from "./ProspectMovementCard";

interface ProspectMovementsProps {
  movements: Movement[];
}

export function ProspectMovements({ movements }: ProspectMovementsProps) {
  return (
    <section className="bg-white py-16 px-6 border-t border-[#E8E8E8]">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-[#0D0D0D] font-sans font-black text-3xl md:text-4xl tracking-tight mb-12">
          Delivery Situations We Believe Matter
        </h2>

        <div className="space-y-6">
          {movements.map((movement) => (
            <ProspectMovementCard key={movement.type} movement={movement} />
          ))}
        </div>
      </div>
    </section>
  );
}
