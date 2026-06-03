import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * UTILITY: cn (Class Name)
 * 
 * Analogy:
 * Think of this function like an automatic clothing coordinator.
 * If you try to wear a blue shirt and a red shirt at the same time (conflicting Tailwind classes),
 * this coordinator intelligently picks the most recent garment (the last class) and makes sure
 * your outfit looks clean and matching (resolves style collisions)!
 */
export function cn(...inputs: ClassValue[]) {
  // 1. clsx combines all active string names and condition variables into one long string.
  // 2. twMerge makes sure that the last conflicting Tailwind class wins (e.g. if we have px-4 and px-6).
  return twMerge(clsx(inputs))
}
