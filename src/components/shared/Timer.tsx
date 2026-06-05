// Copyright (c) 2026 Nagravision SARL
import { cn } from "@/lib/utils";

interface TimerProps {
  seconds: number;
  className?: string;
}

export function Timer({ seconds, className }: TimerProps) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formatTime = () => {
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    return `${seconds}s`;
  };

  return (
    <div
      className={cn(
        "fixed top-6 right-24 px-6 py-3 rounded-lg bg-timer-bg/90 backdrop-blur-sm border border-border",
        "font-mono text-2xl text-foreground tabular-nums",
        "shadow-lg",
        className,
      )}
    >
      {formatTime()}
    </div>
  );
}
