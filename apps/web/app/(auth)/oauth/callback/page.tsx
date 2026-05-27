"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function OAuthCallbackInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const to    = searchParams.get("to") ?? "/";
    if (token) localStorage.setItem("auth_token", token);
    window.location.href = to;
  }, [searchParams]);

  return (
    <div style={{
      minHeight: "calc(100vh - 57px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.08)",
          borderTopColor: "var(--color-accent)",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
          Signing you in...
        </p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "calc(100vh - 57px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "14px", color: "rgba(255,255,255,0.4)",
      }}>
        Signing you in...
      </div>
    }>
      <OAuthCallbackInner />
    </Suspense>
  );
}
