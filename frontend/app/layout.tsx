import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ReminderToast } from "@/components/ReminderToast";

export const metadata: Metadata = {
  title: "Ring AI",
  description: "Voice-first neural agent for knowledge and workflow.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <ReminderToast />
      </body>
    </html>
  );
}

