import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const sanitizeUsername = (username: string): string => {
  // Remove HTML tags and trim whitespace
  const noTags = username.replace(/[<>]/g, '');
  
  // Only allow letters, numbers, spaces, and common symbols
  const cleaned = noTags.replace(/[^a-zA-Z0-9\s_-]/g, '');
  
  // Trim and enforce length limits
  return cleaned.trim().slice(0, 20);
};