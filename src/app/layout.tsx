import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SIM-PBMD — Sistem Informasi Pemeliharaan Barang Milik Daerah",
  description:
    "Pencatatan, pengendalian, monitoring, dan pelaporan pemeliharaan Barang Milik Daerah.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
