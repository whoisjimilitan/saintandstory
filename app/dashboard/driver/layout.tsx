import DriverHeartbeat from "@/components/DriverHeartbeat";
import DriverNavigation from "@/components/DriverNavigation";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DriverHeartbeat />
      <div className="flex min-h-screen bg-[#FAF9F7]">
        <DriverNavigation />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </>
  );
}
