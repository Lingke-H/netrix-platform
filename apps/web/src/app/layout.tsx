import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeTrix",
  description: "AI-native academic co-creation network for UNNC students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

