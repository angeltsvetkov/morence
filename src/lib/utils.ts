import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Language } from "../contexts/LanguageContext";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export function generateUniqueSlug(): string {
  // Generate a unique slug using timestamp and random characters
  const timestamp = Date.now().toString(36); // Convert timestamp to base36
  const randomPart = Math.random().toString(36).substring(2, 8); // Generate random string
  return `apt-${timestamp}-${randomPart}`;
}

export function formatPrice(amount: number, language: Language): string {
  const formattedAmount = amount.toFixed(2);
  
  switch (language) {
    case 'bg':
      return `${formattedAmount} лв.`;
    case 'en':
      return `€${formattedAmount}`;
    case 'ru':
      return `€${formattedAmount}`;
    default:
      return `€${formattedAmount}`;
  }
}

export function getCurrencySymbol(language: Language): string {
  switch (language) {
    case 'bg':
      return 'лв.';
    case 'en':
      return '€';
    case 'ru':
      return '€';
    default:
      return '€';
  }
}
