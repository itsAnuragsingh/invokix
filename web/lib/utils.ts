import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function bumpVersion(current: string): string {
  const parts = current.split(".").map(Number)
  if (parts.some((n) => isNaN(n))) return "1.1"
  parts[parts.length - 1] += 1
  return parts.join(".")
}
