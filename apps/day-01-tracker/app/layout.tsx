import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "30 apps in 30 days",
  description: "Personal challenge tracker and portfolio dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
