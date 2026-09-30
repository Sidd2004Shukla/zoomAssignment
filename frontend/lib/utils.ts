import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateMeetingCode(): string {
  const randNum = (digits: number) => {
    let result = "";
    for (let i = 0; i < digits; i++) {
      result += Math.floor(Math.random() * 10).toString();
    }
    return result;
  };
  return `${randNum(3)}-${randNum(4)}-${randNum(3)}`;
}

export function getPersonalMeetingCode(userId: string): string {
  if (!userId) return "100-000-0000";
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  const positive = (Math.abs(hash) % 9000000000) + 1000000000;
  const str = positive.toString().padStart(10, "0");
  return `${str.slice(0, 3)}-${str.slice(3, 7)}-${str.slice(7)}`;
}
