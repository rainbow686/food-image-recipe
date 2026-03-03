import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Food Image to Recipe | AI Recipe Generator",
  description: "Turn food photos into recipes with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
