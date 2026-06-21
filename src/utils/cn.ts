import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Une clases y resuelve conflictos de Tailwind: la última clase del consumidor gana. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
