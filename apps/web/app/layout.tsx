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
