"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setSessionFromTokens } from "@/lib/api/auth";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const params = new URLSearchParams(hash.slice(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (accessToken) {
      setSessionFromTokens(accessToken, refreshToken ?? undefined)
        .then(() => {
          setStatus("ok");
          window.history.replaceState(null, "", "/");
          router.replace("/");
        })
        .catch(() => setStatus("error"));
    } else {
      setStatus("error");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {status === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-gray-600">Signing you in...</p>
        </div>
      )}
      {status === "error" && (
        <div className="text-center">
          <p className="text-red-600 font-medium">Authentication failed.</p>
          <button
            onClick={() => router.replace("/")}
            className="mt-4 text-blue-600 hover:underline"
          >
            Go to login
          </button>
        </div>
      )}
    </div>
  );
}
