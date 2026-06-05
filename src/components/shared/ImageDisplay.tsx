// Copyright (c) 2026 Nagravision SARL
import { cn } from "@/lib/utils";

interface ImageDisplayProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageDisplay({ src, alt, className }: ImageDisplayProps) {
  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center",
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        className="w-full h-full object-contain drop-shadow-2xl animate-fade-in"
      />
    </div>
  );
}
