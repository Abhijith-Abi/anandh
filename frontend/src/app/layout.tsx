import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Academic Portal — Student Analytics & Performance Insights",
  description:
    "A comprehensive academic analytics platform for tracking student performance, attendance, and insights across departments.",
  metadataBase: new URL("https://academic-portal.vercel.app"),
  openGraph: {
    title: "Academic Portal — Student Analytics",
    description:
      "Track student performance, attendance, and academic insights with a modern analytics dashboard.",
    url: "https://academic-portal.vercel.app",
    siteName: "Academic Portal",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Academic Portal — Student Analytics & Performance Insights",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Academic Portal — Student Analytics",
    description:
      "Track student performance, attendance, and academic insights with a modern analytics dashboard.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/icon.png",
    shortcut: "/icon.png",
  },
  themeColor: "#0f1729",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
