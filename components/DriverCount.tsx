"use client";

import { useEffect, useState } from "react";
import { getDriverCount } from "@/lib/driverCount";

interface Props {
  className?: string;
}

export default function DriverCount({ className }: Props) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    setCount(getDriverCount());
  }, []);

  if (count === null) return <span className={className}>367</span>;
  return <span className={className}>{count.toLocaleString()}</span>;
}
