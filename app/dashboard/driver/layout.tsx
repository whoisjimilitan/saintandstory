import DriverHeartbeat from "@/components/DriverHeartbeat";
import DriverNavigation from "@/components/DriverNavigation";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DriverHeartbeat />
      <div className="flex flex-col lg:flex-row min-h-screen bg-[#FAF9F7]">
        <div className="lg:w-64 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
          <DriverNavigation />
        </div>
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </>
  );
}
