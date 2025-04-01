import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('NGN', '₦');
}

export function maskEmail(email: string): string {
  if (!email) return '';
  const [username, domain] = email.split('@');
  return `${username.charAt(0)}***@${domain.charAt(0)}***${domain.slice(-4)}`;
}

export function getInitials(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase();
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function createEvent<T>(eventName: string) {
  return eventName;
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  if (phone.length !== 11) return phone;
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3');
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function calculateProgress(total: number, remaining: number): number {
  if (total <= 0) return 0;
  const completed = total - remaining;
  return (completed / total) * 100;
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
