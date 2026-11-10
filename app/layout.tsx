import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./components/Providers";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "ACAC — AFIT Cowrywise Ambassadors Competition",
  description:
    "The AFIT Cowrywise Ambassadors Competition tests financial intellect, economic defense, and strategic acumen among AFIT leaders.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="font-sans bg-[#F7F9FC] text-[#082552] antialiased">
        <Providers><SiteHeader />
        {children}
        <SiteFooter /></Providers>
      </body>
    </html>
  );
}
