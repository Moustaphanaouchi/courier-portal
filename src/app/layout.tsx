import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RoleNavbar from "@/components/RoleNavbar";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Courier Portal | Lebanese Regional Logistics",
  description: "B2B Courier, Hub Dispatching & Dual Currency USD/LBP COD Engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        <LanguageProvider>
          <RoleNavbar />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}