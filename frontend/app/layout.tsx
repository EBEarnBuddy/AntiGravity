import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import BackendHealthCheck from "@/components/BackendHealthCheck";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Zen+Dots&family=Geo&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" style={{ fontFamily: "'Geo', sans-serif" }}>
        <Providers>
          <BackendHealthCheck />
          {children}
        </Providers>
      </body>
    </html>
  );
}
