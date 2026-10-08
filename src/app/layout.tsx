import type { Metadata } from "next";
import { Pixelify_Sans, Press_Start_2P } from "next/font/google";
import "./globals.css";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
});

const pixelify = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixelify",
});

export const metadata: Metadata = {
  title: {
    default: "Tierdex",
    template: "%s · Tierdex",
  },
  description: "Rank every main-series Pokémon game by Pokédex, region, story and soundtrack.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${pressStart.variable} ${pixelify.variable}`}>
      <body>
        <div className="bg-overworld min-h-screen">{children}</div>
      </body>
    </html>
  );
}
