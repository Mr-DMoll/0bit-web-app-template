"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/shared/context/AuthContext";

const ROLE_ROUTES: Record<string, string> = {
  SUPER_ADMIN: "/super-admin",
  ADMIN:       "/admin",
  MANAGER:     "/manager",
  DEVELOPER:   "/developer",
  CLIENT:      "/client",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px", fontSize: "14px", color: "#fff",
  outline: "none", boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "12px", fontWeight: 600,
  color: "rgba(255,255,255,0.5)", marginBottom: "6px",
  textTransform: "uppercase", letterSpacing: "0.06em",
};

export default function LoginPage() {
  const router              = useRouter();
  const { login, user, isLoading } = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  // Redirect as soon as user is set
  useEffect(() => {
    if (!isLoading && user) {
      router.push(ROLE_ROUTES[user.role] ?? "/");
    }
  }, [user, isLoading, router]);

 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 57px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "linear-gradient(135deg, #84cc16, #65a30d)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: "22px", fontWeight: 900,
            color: "#0f172a",
          }}>
            O
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
            Sign in to your O-Bit account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px", padding: "32px",
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoFocus
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#84cc16"; e.target.style.boxShadow = "0 0 0 3px rgba(132,204,22,0.12)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: "12px", color: "#84cc16", textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  style={{ ...inputStyle, paddingRight: "52px" }}
                  onFocus={(e) => { e.target.style.borderColor = "#84cc16"; e.target.style.boxShadow = "0 0 0 3px rgba(132,204,22,0.12)"; }}
                  onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: "12px", color: "rgba(255,255,255,0.4)",
                    fontWeight: 500,
                  }}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: "10px 14px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "8px", fontSize: "13px", color: "#f87171",
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "12px",
                background: loading ? "rgba(132,204,22,0.5)" : "#84cc16",
                border: "none", borderRadius: "8px",
                fontSize: "14px", fontWeight: 700, color: "#0f172a",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.15s",
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
          O-Bit Agency Platform
        </p>
      </div>
    </div>
  );
}
