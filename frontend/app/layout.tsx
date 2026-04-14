import "./globals.css";
import type { ReactNode } from "react";

import { ReminderToast } from "@/components/ReminderToast";
import { RingVoiceButton } from "@/components/RingVoiceButton";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto min-h-screen max-w-6xl p-6">{children}</main>
        <RingVoiceButton />
        <ReminderToast />
      </body>
    </html>
  );
}

