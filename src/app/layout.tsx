import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Projekt AI — Narzędzie szkoleniowe",
  description: "Platforma szkoleniowa z agentami AI dla edukatorów",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
