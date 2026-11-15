import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Shell } from "@/components/ui/shell";
import "./globals.css";

const vazir = localFont({
  src: [
    { path: "../fonts/Vazirmatn-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Vazirmatn-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata: Metadata = {
  title: "آلبوم جهان",
  description: "آلبوم و دایرةالمعارف آسمان برای نیایش، ساخته‌ی یاسین.",
  manifest: "./manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07050f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body style={{ fontFamily: "var(--font-vazir), Tahoma, sans-serif" }}>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
