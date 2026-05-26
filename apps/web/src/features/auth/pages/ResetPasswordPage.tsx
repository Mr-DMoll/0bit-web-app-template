"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { BRAND } from "@/shared/config/branding.config";

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

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8        },
    { label: "Uppercase",     pass: /[A-Z]/.test(password)      },
    { label: "Lowercase",     pass: /[a-z]/.test(password)      },
    { label: "Number",        pass: /[0-9]/.test(password)      },
  ];
  const passed = checks.filter((c) => c.pass).length;
  const barColor = passed <= 1 ? "#ef4444" : passed <= 3 ? "#f59e0b" : "var(--color-accent)";

  if (!password) return null;

  return (
    <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", gap: "4px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            height: "3px", flex: 1, borderRadius: "999px",
            background: i <= passed ? barColor : "rgba(255,255,255,0.1)",
            transition: "background 0.2s",
          }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
        {checks.map(({ label, pass }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: pass ? "var(--color-accent)" : "rgba(255,255,255,0.3)" }}>
              {pass ? "✓" : "○"}
            </span>
            <span style={{ fontSize: "12px", color: pass ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email") ?? "";

  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw,          setShowPw]          = useState(false);
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [isDone,          setIsDone]          = useState(false);

  useEffect(() => { if (!token) router.replace("/login"); }, [token, router]);
  if (!token) return null;

  const isValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true); setError(null);
    try {
      await apiClient.post(endpoints.auth.resetPassword, { token, email, password });
      setIsDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(
        msg?.includes("expired")
          ? "This reset link has expired. Please request a new one."
          : msg ?? "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 57px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: "22px", fontWeight: 900, color: "var(--color-accent-text)",
          }}>O</div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
            Create new password
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
            Choose a strong password for your account
          </p>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px", padding: "32px",
        }}>
          {isDone ? (
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "50%",
                background: "var(--color-accent-subtle)", border: "1px solid var(--color-accent-subtle)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", color: "var(--color-accent)",
              }}>✓</div>
              <div>
                <p style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>Password reset</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Redirecting you to sign in...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={labelStyle}>New password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    autoFocus
                    style={{ ...inputStyle, paddingRight: "52px" }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--color-accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(132,204,22,0.12)"; }}
                    onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    style={{
                      position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 500,
                    }}
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              <div>
                <label style={labelStyle}>Confirm password</label>
                <input
                  type={showPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "var(--color-accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(132,204,22,0.12)"; }}
                  onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p style={{ fontSize: "12px", color: "#f87171", marginTop: "5px" }}>Passwords do not match</p>
                )}
              </div>

              {error && (
                <div style={{
                  padding: "10px 14px",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "8px", fontSize: "13px", color: "#f87171",
                }}>
                  {error}
                  {error.includes("expired") && (
                    <Link href="/forgot-password" style={{ display: "block", marginTop: "6px", color: "var(--color-accent)", textDecoration: "none", fontSize: "12px" }}>
                      Request a new reset link →
                    </Link>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                style={{
                  width: "100%", padding: "12px",
                  background: isValid && !isSubmitting ? "var(--color-accent)" : "var(--color-accent-subtle)",
                  border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 700,
                  color: "var(--color-accent-text)", cursor: isValid && !isSubmitting ? "pointer" : "not-allowed",
                }}
              >
                {isSubmitting ? "Resetting..." : "Reset password"}
              </button>

              <Link href="/login" style={{ textAlign: "center", fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
                ← Back to sign in
              </Link>
            </form>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
          {BRAND.name}
        </p>
      </div>
    </div>
  );
}
