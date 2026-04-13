import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AEGIS — Global News Intelligence Dashboard",
  description:
    "AI-powered global news intelligence dashboard with interactive 3D globe visualization. Get AI-summarized, verified, and cross-referenced news updates from around the world.",
  keywords: ["news", "AI", "intelligence", "globe", "geopolitics", "dashboard"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="h-screen w-screen overflow-hidden bg-[#020617]">
        {children}
      </body>
    </html>
  );
}
