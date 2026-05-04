import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alpaca Audit CRM",
  description: "SEO Audit Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ka">
      <body>{children}</body>
    </html>
  );
}
