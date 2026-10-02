import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RoleNavbar from "@/components/RoleNavbar";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cedex Logistics | Lebanese Regional Courier & COD Engine",
  description: "Fast, reliable parcel delivery, live tracking, and COD collection across Lebanon.",
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