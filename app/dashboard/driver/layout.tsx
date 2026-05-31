import DriverHeartbeat from "@/components/DriverHeartbeat";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DriverHeartbeat />
      {children}
    </>
  );
}
