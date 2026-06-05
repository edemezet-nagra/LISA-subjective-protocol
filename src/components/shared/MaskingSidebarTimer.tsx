// Copyright (c) 2026 Nagravision SARL
import React from "react";

interface MaskingSidebarTimerProps {
  timeRemaining: number;
  unit?: "ms" | "s";
}

export function MaskingSidebarTimer({
  timeRemaining,
  unit = "s",
}: MaskingSidebarTimerProps) {
  let seconds = 0;

  if (unit === "ms") {
    seconds = Math.ceil(timeRemaining / 1000);
  } else {
    seconds = timeRemaining;
  }

  seconds = Math.max(0, seconds);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <div className="text-center">
      <div className="text-4xl font-mono font-bold text-primary tabular-nums mb-2">
        {minutes}:{remainingSeconds.toString().padStart(2, "0")}
      </div>
      <h3 className="text-lg font-medium text-muted-foreground">
        Masking Tools
      </h3>
    </div>
  );
}
