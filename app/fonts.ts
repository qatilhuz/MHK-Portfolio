import localFont from "next/font/local";

export const charmonman = localFont({
  src: [
    { path: "./fonts/Charmonman-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Charmonman-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-charmonman",
  display: "swap",
  preload: true,
});
