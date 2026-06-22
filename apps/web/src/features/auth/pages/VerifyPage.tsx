"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/features/auth/services/auth.service";
import { BRAND } from "@/shared/config/branding.config";

export default function VerifyPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get("email") ?? "";

  const [code,        setCode]        = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending,  setIsResending]  = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [resendMsg,   setResendMsg]   = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const handleChange = (index: number, value: string) => {
    // Only accept single digit
    const digit = value.replace(/\D/g, "").slice(-1);
    const next  = [...code];
    next[index] = digit;
    setCode(next);
    // Auto advance
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto submit when all filled
    if (digit && index === 5 && next.every((d) => d)) {
      handleSubmit(next.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split("");
      setCode(next);
      handleSubmit(pasted);
    }
  };

  const handleSubmit = async (otp?: string) => {
    const finalCode = otp ?? code.join("");
    if (finalCode.length < 6) return;
    setIsSubmitting(true); setError(null);
    try {
      await authService.verifyCode({ email, code: finalCode });
      router.push("/login");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Invalid code. Please try again.");
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true); setResendMsg(null);
    try {
      await authService.resendVerification(email);
      setResendMsg("A new code has been sent to your email.");
      setTimeout(() => setResendMsg(null), 4000);
    } catch {
      setResendMsg("Failed to resend. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 57px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: "22px", fontWeight: 900, color: "var(--color-accent-text)",
          }}>O</div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
            Verify your email
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
            Enter the 6-digit code sent to<br />
            <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{email || "your email"}</span>
          </p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* OTP inputs */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                disabled={isSubmitting}
                style={{
                  width: "46px", height: "54px",
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${digit ? "var(--color-accent)" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: "10px",
                  fontSize: "22px", fontWeight: 700, color: "#fff",
                  textAlign: "center", outline: "none",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  boxShadow: digit ? "0 0 0 3px rgba(132,204,22,0.12)" : "none",
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--color-accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(132,204,22,0.12)"; }}
                onBlur={(e)  => {
                  if (!digit) {
                    e.target.style.borderColor = "rgba(255,255,255,0.1)";
                    e.target.style.boxShadow = "none";
                  }
                }}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", fontSize: "13px", color: "#f87171", textAlign: "center" }}>
              {error}
            </div>
          )}

          {/* Resend message */}
          {resendMsg && (
            <div style={{ padding: "10px 14px", background: "rgba(132,204,22,0.08)", border: "1px solid var(--color-accent-border)", borderRadius: "8px", fontSize: "13px", color: "var(--color-accent)", textAlign: "center" }}>
              {resendMsg}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={() => handleSubmit()}
            disabled={code.some((d) => !d) || isSubmitting}
            style={{
              width: "100%", padding: "12px",
              background: code.every((d) => d) && !isSubmitting ? "var(--color-accent)" : "var(--color-accent-subtle)",
              border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 700,
              color: "var(--color-accent-text)", cursor: code.every((d) => d) && !isSubmitting ? "pointer" : "not-allowed",
            }}
          >
            {isSubmitting ? "Verifying..." : "Verify email"}
          </button>

          {/* Resend */}
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Didn't receive a code? </span>
            <button
              onClick={handleResend}
              disabled={isResending}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "var(--color-accent)", fontWeight: 500 }}
            >
              {isResending ? "Sending..." : "Resend"}
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
          {BRAND.name}
        </p>
      </div>
    </div>
  );
}
