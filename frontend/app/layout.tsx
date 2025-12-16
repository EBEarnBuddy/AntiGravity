import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

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
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
