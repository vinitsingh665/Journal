import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "Trade Journal — Plan. Execute. Review. Improve.",
  description:
    "A premium trading journal for Indian equity and swing traders. Track trades, analyze performance, and improve your trading systematically.",
  keywords: "trading journal, stock trading, swing trading, Indian equity, trade analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
