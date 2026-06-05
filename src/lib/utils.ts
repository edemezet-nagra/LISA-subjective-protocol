// Based on shadcn/ui - MIT License (https://github.com/shadcn-ui/ui)
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
