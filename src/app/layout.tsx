import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Favaro's Online NotePad",
  description: "A simple online notepad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
        {children}
      </body>
    </html>
  );
}
