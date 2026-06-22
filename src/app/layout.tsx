import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lemurの博客",
    template: "%s | Lemurの博客",
  },
  description: "前端爪的技术博客，记录 Next.js、React、TypeScript、Tailwind CSS 等前端技术的学习与实践。",
  keywords: ["前端", "Next.js", "React", "TypeScript", "Tailwind CSS", "技术博客", "MDX"],
  authors: [{ name: "Lemur" }],
  creator: "Lemur",
  publisher: "Lemur",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Lemurの博客",
    description: "前端爪的技术博客，记录前端技术的学习与实践。",
    siteName: "Lemurの博客",
    locale: "zh_CN",
    type: "website",
    url: "https://blog.lemur.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lemurの博客",
    description: "前端爪的技术博客，记录前端技术的学习与实践。",
  },
  alternates: {
    types: {
      "application/rss+xml": "https://blog.lemur.dev/feed.xml",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark:[color-scheme:dark]`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
