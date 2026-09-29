import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { LogProvider } from "@/lib/store";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EazyLog — Log it. Don't sweat it.",
  description: "The calorie tracker for people who hate calorie tracking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-[#0B0C0F]">
        <div className="app-shell">
          <LogProvider>{children}</LogProvider>
        </div>
      </body>
    </html>
  );
}
