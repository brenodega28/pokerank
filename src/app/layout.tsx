import type { Metadata, Viewport } from "next";
import { Pixelify_Sans, Press_Start_2P } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
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
    default: "PokéRanked: my tier board",
    template: "PokéRanked: %s",
  },
  description: "Rank every main-series Pokémon game by Pokédex, region, story and soundtrack.",
};

export const viewport: Viewport = {
  themeColor: "#282840",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${pressStart.variable} ${pixelify.variable}`}>
      <body>
        <div className="bg-grass-tiles flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
