import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Karsaz - پلتفرم خدمات حرفه ای شما",
  description: "بهترین متخصصان را برای نیازهای خود بیابید.",
  manifest: "/manifest.json", // Add manifest link
  themeColor: "#1a202c", // Define theme color
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <Header />
        <main className="pt-16 pb-20">
          <div className="container mx-auto px-4">
            {children}
          </div>
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
