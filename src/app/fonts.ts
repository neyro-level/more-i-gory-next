import { Montserrat } from "next/font/google";

export const montserrat = Montserrat({
  display: "swap",
  fallback: ["Arial", "sans-serif"],
  subsets: ["cyrillic", "latin"],
  style: "normal",
  variable: "--font-montserrat",
  weight: "variable",
});
