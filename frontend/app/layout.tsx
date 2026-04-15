import "./globals.css";
import type { ReactNode } from "react";

import { ReminderToast } from "@/components/ReminderToast";

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

