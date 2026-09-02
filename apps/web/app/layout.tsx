import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.traderlabs.in"),
  title: {
    default: "TraderLabs — Plan. Execute. Review. Improve.",
    template: "%s | TraderLabs",
  },
  description:
    "A premium trading journal for Indian equity, crypto, and swing traders. Track trades, analyze performance, calculate risk, and improve your trading systematically.",
  keywords: ["trading journal", "stock trading", "swing trading", "crypto trading", "Indian equity", "trade analysis", "risk calculator", "TraderLabs"],
  authors: [{ name: "TraderLabs" }],
  creator: "TraderLabs",
  publisher: "TraderLabs",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "TraderLabs — Your Ultimate Trading Journal",
    description: "Track trades, analyze performance, and improve your edge with our premium trading journal.",
    url: "https://www.traderlabs.in",
    siteName: "TraderLabs",
    images: [
      {
        url: "/og-image.png", // Will default to nothing if not present, but good practice
        width: 1200,
        height: 630,
        alt: "TraderLabs Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TraderLabs — Your Ultimate Trading Journal",
    description: "Track trades, analyze performance, and improve your edge.",
    creator: "@TraderLabs",
    images: ["/og-image.png"],
  },
  verification: {
    google: "6lVkmBYmvNlsNtkw6uCbljw7ct5Nhs00TUk3xPBrLjk",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('theme-preference') || 'system';
                var effectiveTheme = theme;
                if (theme === 'system') {
                  effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                if (effectiveTheme === 'dark') {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
                
                var accent = localStorage.getItem('accent-preference') || 'blue';
                document.documentElement.setAttribute('data-accent', accent);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
