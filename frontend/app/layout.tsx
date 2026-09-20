import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DRISHTI — Sustainable Agriculture Assistant",
  description: "Trustworthy, explainable, forecast-aware precision agriculture tool for Indian farmers.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="hi"
      className={`${inter.variable} ${notoSansDevanagari.variable} antialiased`}
    >
      <body className="min-h-[100dvh] bg-[#132A1D] text-[#1A1D1A] flex justify-center sm:py-4">
        <main className="relative w-full max-w-[420px] h-[100dvh] sm:h-full sm:min-h-[800px] sm:max-h-[900px] bg-[#F7F8F6] sm:rounded-[40px] overflow-hidden shadow-2xl flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
