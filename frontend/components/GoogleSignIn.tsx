"use client";

import { useState } from "react";
import { getGoogleAuthUrl } from "@/lib/api";
import { MOCK_USER_ID } from "@/lib/user";
import { Chrome } from "lucide-react";

export function GoogleSignIn() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const { url } = await getGoogleAuthUrl(MOCK_USER_ID);
      window.location.href = url;
    } catch (error) {
      console.error("Failed to get auth URL:", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50"
    >
      <Chrome className="w-5 h-5" />
      {isLoading ? "Connecting..." : "Continue with Google"}
    </button>
  );
}
