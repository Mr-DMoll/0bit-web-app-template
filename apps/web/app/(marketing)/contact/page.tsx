"use client";

import { useState } from "react";
import { BRAND } from "@/shared/config/branding.config";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px", fontSize: "14px", color: "#fff",
  outline: "none", boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "12px", fontWeight: 600,
  color: "rgba(255,255,255,0.5)", marginBottom: "6px",
  textTransform: "uppercase", letterSpacing: "0.06em",
};

const CONTACT_ITEMS = [
  { label: "Response time", value: "Within 1 business day" },
  { label: "Email", value: "hello@example.com" },
  { label: "Based in", value: "Remote-first" },
];

export default function ContactPage() {
  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [company,     setCompany]     = useState("");
  const [message,     setMessage]     = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent,      setIsSent]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setError(null);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setIsSent(true);
    } catch {
      setError("Something went wrong. Please try emailing us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "var(--color-accent)";
    e.target.style.boxShadow = "0 0 0 3px rgba(132,204,22,0.12)";
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "rgba(255,255,255,0.1)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div style={{ background: "#080c18", paddingTop: "57px" }}>

      {/* Hero */}
      <section style={{ padding: "100px 40px 80px", textAlign: "center", maxWidth: "640px", margin: "0 auto" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>Contact</p>
        <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: "20px" }}>
          Let's talk about<br />your project.
        </h1>
        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
          Fill in the form and we'll be in touch within one business day. No sales scripts — just a real conversation.
        </p>
      </section>

      {/* Body */}
      <section style={{ padding: "0 40px 100px", maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 420px", gap: "64px", alignItems: "start" }}>

        {/* Form */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "40px" }}>
          {isSent ? (
            <div style={{ textAlign: "center", padding: "40px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--color-accent-subtle)", border: "1px solid var(--color-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", color: "var(--color-accent)" }}>
                ✓
              </div>
              <div>
                <p style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Message sent!</p>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                  Thanks, {name.split(" ")[0]}. We'll get back to you within one business day.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Your name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Work email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Company <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc." style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              <div>
                <label style={labelStyle}>Tell us about your project</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What are you building? What's the timeline? Any constraints we should know about?"
                  required
                  rows={6}
                  style={{ ...inputStyle, resize: "vertical", minHeight: "140px" }}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>

              {error && (
                <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", fontSize: "13px", color: "#f87171" }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: "13px", background: isSubmitting ? "var(--color-accent-subtle)" : "var(--color-accent)",
                  border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 700,
                  color: "var(--color-accent-text)", cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
              >
                {isSubmitting ? "Sending..." : "Send message"}
              </button>
            </form>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden" }}>
            {CONTACT_ITEMS.map(({ label, value }) => (
              <div key={label} style={{ padding: "20px 24px", background: "#080c18", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>{label}</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{value}</span>
              </div>
            ))}
          </div>

          {/* What to expect */}
          <div style={{ padding: "28px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "16px" }}>What happens next</h3>
            <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px", counterReset: "steps" }}>
              {[
                "We read your message carefully and do a bit of research on your context.",
                "You get a personal reply (not a template) within one business day.",
                "If there's a fit, we schedule a 30-minute intro call.",
              ].map((step, i) => (
                <li key={i} style={{ display: "flex", gap: "14px", fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--color-accent)", width: "18px", flexShrink: 0, paddingTop: "2px" }}>0{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
            © {BRAND.year} {BRAND.name}. All rights reserved.
          </p>
        </div>

      </section>
    </div>
  );
}
