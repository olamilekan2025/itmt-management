import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import AuthSessionProvider from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";

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
  title: "ITMT Management System",
  description: "ITMT Academy Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen antialiased">
        <AuthSessionProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthSessionProvider>
      </body>
    </html>
  );
}