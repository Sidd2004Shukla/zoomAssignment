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
