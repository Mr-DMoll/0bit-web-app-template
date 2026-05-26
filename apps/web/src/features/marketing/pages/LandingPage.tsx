"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0f1a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "system-ui, sans-serif",
    }}>
      {/* Logo */}
      <div style={{
        width: "64px", height: "64px", borderRadius: "16px",
        background: "linear-gradient(135deg, #84cc16, #65a30d)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "28px", fontWeight: 900, color: "#0f172a",
        marginBottom: "32px",
      }}>
        A
      </div>

      {/* Headline */}
      <h1 style={{
        fontSize: "clamp(32px, 5vw, 56px)",
        fontWeight: 800, color: "#fff",
        textAlign: "center", marginBottom: "16px",
        lineHeight: 1.1,
      }}>
        Welcome to{" "}
        <span style={{ color: "#84cc16" }}>My App</span>
      </h1>

      <p style={{
        fontSize: "18px", color: "rgba(255,255,255,0.5)",
        textAlign: "center", maxWidth: "480px",
        marginBottom: "48px", lineHeight: 1.6,
      }}>
        Replace this with your product description. This is a Koveral template — ready to customise.
      </p>

      {/* CTA */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/login" style={{
          padding: "14px 32px",
          background: "#84cc16",
          borderRadius: "10px",
          fontSize: "15px", fontWeight: 700,
          color: "#0f172a", textDecoration: "none",
          transition: "opacity 0.15s",
        }}>
          Sign In
        </Link>
        <Link href="/register" style={{
          padding: "14px 32px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "10px",
          fontSize: "15px", fontWeight: 600,
          color: "#fff", textDecoration: "none",
        }}>
          Create Account
        </Link>
      </div>

      {/* Footer */}
      <p style={{
        position: "absolute", bottom: "24px",
        fontSize: "12px", color: "rgba(255,255,255,0.2)",
      }}>
        Powered by Koveral
      </p>
    </div>
  );
}
