import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Smartdwell Intern Tracker",
  description: "Training progress tracker for Smartdwell Technologies interns",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F4F4F4] min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
