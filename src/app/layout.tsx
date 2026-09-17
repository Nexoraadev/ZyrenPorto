import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ContentProtectionProvider } from "@/components/layout/ContentProtectionProvider";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ClientShell } from "@/components/layout/ClientShell";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap", preload: true });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap", preload: false });

export const metadata: Metadata = {
  title: { default: "Zyrenn — Portfolio", template: "%s | Zyrenn" },
  description: "Portfolio of Reavlenia Arezha — Full-stack developer crafting modern, high-performance web experiences.",
  keywords: ["portfolio", "developer", "fullstack", "nextjs", "react", "web"],
  authors: [{ name: "Reavlenia Arezha" }],
  creator: "Reavlenia Arezha",
  openGraph: { type: "website", locale: "id_ID", siteName: "Zyrenn Portfolio" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-dark-950 text-dark-100 min-h-screen`}>
        <ThemeProvider>
          <ContentProtectionProvider>
            <ClientShell>
              {children}
            </ClientShell>
          </ContentProtectionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
