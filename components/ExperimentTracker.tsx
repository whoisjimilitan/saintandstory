"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

export default function ExperimentTracker({ variant }: { variant: "control" | "test" }) {
  useEffect(() => {
    posthog.capture("$experiment_started", {
      experiment: "first-batch-2",
      variant,
    });
  }, [variant]);

  return null;
}
