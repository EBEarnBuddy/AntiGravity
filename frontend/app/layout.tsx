import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import BackendHealthCheck from "@/components/BackendHealthCheck";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EarnBuddy | Connect, Collaborate, Create",
  description: "The platform for founders, freelancers, and builders.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased font-sans`}>
        <Providers>
          <BackendHealthCheck />
          {children}
        </Providers>
      </body>
    </html>
  );
}
