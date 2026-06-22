"use client";

import Link from "next/link";
import { BRAND } from "@/shared/config/branding.config";

// ─── SECTION: HERO ────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "120px 40px 80px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Glow */}
      <div style={{
        position: "absolute", top: "20%", left: "50%",
        transform: "translateX(-50%)",
        width: "600px", height: "600px",
        background: "radial-gradient(ellipse, rgba(132,204,22,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        display: "inline-flex", alignItems: "center", gap: "8px",
        padding: "6px 14px",
        background: "rgba(132,204,22,0.08)",
        border: "1px solid var(--color-accent-border)",
        borderRadius: "999px",
        fontSize: "12px", fontWeight: 600, color: "var(--color-accent)",
        letterSpacing: "0.06em", textTransform: "uppercase",
        marginBottom: "32px",
      }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-accent)", display: "inline-block" }} />
        Now open for new clients
      </div>

      <h1 style={{
        fontSize: "clamp(40px, 6vw, 72px)",
        fontWeight: 800, color: "#fff",
        lineHeight: 1.05, letterSpacing: "-0.03em",
        maxWidth: "800px", marginBottom: "24px",
      }}>
        Built for teams that{" "}
        <span style={{
          background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          move fast
        </span>
      </h1>

      <p style={{
        fontSize: "18px", color: "rgba(255,255,255,0.5)",
        maxWidth: "520px", lineHeight: 1.7, marginBottom: "48px",
      }}>
        {BRAND.tagline}
      </p>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/intake" style={{
          padding: "14px 32px", background: "var(--color-accent)",
          borderRadius: "10px", fontSize: "15px", fontWeight: 700,
          color: "var(--color-accent-text)", textDecoration: "none",
        }}>
          Start a project
        </Link>
        <a href="#work" style={{
          padding: "14px 32px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "10px", fontSize: "15px", fontWeight: 600,
          color: "#fff", textDecoration: "none",
        }}>
          See our work
        </a>
      </div>

      {/* Stats row */}
      <div style={{
        display: "flex", gap: "48px", marginTop: "80px",
        flexWrap: "wrap", justifyContent: "center",
      }}>
        {[
          { value: "50+", label: "Projects shipped" },
          { value: "98%", label: "Client satisfaction" },
          { value: "< 2wk", label: "Average kickoff" },
        ].map(({ value, label }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{value}</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", marginTop: "4px" }}>{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── SECTION: WORK ────────────────────────────────────────────────────────────
const WORK_ITEMS = [
  { tag: "Web App", title: "Client portal & billing dashboard", desc: "End-to-end portal with invoicing, project tracking, and role-based access." },
  { tag: "Mobile", title: "Field operations platform", desc: "Real-time job dispatch and reporting app for distributed teams." },
  { tag: "Automation", title: "Lead qualification pipeline", desc: "AI-assisted intake flow that routes and scores inbound enquiries automatically." },
  { tag: "Data", title: "Executive analytics suite", desc: "Live dashboards pulling from five data sources into one unified view." },
  { tag: "Integration", title: "ERP ↔ eCommerce sync", desc: "Bi-directional connector keeping inventory, orders, and fulfilment in sync." },
  { tag: "Design system", title: "Component library & docs", desc: "Shared tokens, 80+ components, and interactive Storybook documentation." },
];

function Work() {
  return (
    <section id="work" style={{ padding: "120px 40px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ marginBottom: "64px" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>Selected work</p>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Problems solved,<br />products shipped.
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden" }}>
        {WORK_ITEMS.map(({ tag, title, desc }) => (
          <div key={title} style={{
            padding: "32px", background: "#080c18",
            transition: "background 0.15s",
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#080c18"; }}
          >
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{tag}</span>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "10px 0 8px", lineHeight: 1.3 }}>{title}</h3>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── SECTION: SERVICES ────────────────────────────────────────────────────────
const SERVICES = [
  { icon: "⬡", title: "Product Design", items: ["Discovery & research", "UX wireframing", "UI design systems", "Prototype & test"] },
  { icon: "◈", title: "Engineering", items: ["Full-stack web apps", "API design & integration", "Mobile (React Native)", "DevOps & infrastructure"] },
  { icon: "◎", title: "Growth & Ops", items: ["Analytics & tracking", "CRM configuration", "Workflow automation", "Reporting dashboards"] },
];

function Services() {
  return (
    <section id="services" style={{ padding: "120px 40px", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "64px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>Services</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Everything your<br />product needs.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          {SERVICES.map(({ icon, title, items }) => (
            <div key={title} style={{
              padding: "36px", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px",
            }}>
              <div style={{ fontSize: "24px", marginBottom: "16px" }}>{icon}</div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "20px" }}>{title}</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {items.map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
                    <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--color-accent)", flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION: PROCESS ─────────────────────────────────────────────────────────
const STEPS = [
  { n: "01", title: "Discovery", desc: "We listen first. A focused kick-off session maps your goals, constraints, and success metrics before a single line of code is written." },
  { n: "02", title: "Design", desc: "Rapid wireframes become high-fidelity prototypes. You review, we iterate — usually two rounds before development begins." },
  { n: "03", title: "Build", desc: "Agile two-week sprints with weekly demos. You see real progress, not status reports." },
  { n: "04", title: "Ship & Support", desc: "We handle deployment, monitoring, and post-launch support. When you grow, we're already familiar with your stack." },
];

function Process() {
  return (
    <section id="process" style={{ padding: "120px 40px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ marginBottom: "64px" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>How we work</p>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          A process designed<br />for predictability.
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden" }}>
        {STEPS.map(({ n, title, desc }) => (
          <div key={n} style={{
            display: "grid", gridTemplateColumns: "80px 200px 1fr",
            alignItems: "start", gap: "32px",
            padding: "32px 36px", background: "#080c18",
            transition: "background 0.15s",
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#080c18"; }}
          >
            <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--color-accent)", letterSpacing: "0.06em" }}>{n}</span>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: 0, paddingTop: "1px" }}>{title}</h3>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: 0 }}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── SECTION: ABOUT ───────────────────────────────────────────────────────────
function About() {
  return (
    <section id="about" style={{
      padding: "120px 40px",
      background: "rgba(255,255,255,0.02)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>About us</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "24px" }}>
            Small team.<br />High output.
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: "16px" }}>
            We're a focused product studio that embeds with founders and growth-stage teams to build software that actually ships.
          </p>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: "40px" }}>
            No bloated teams, no account managers. Just senior engineers and designers who care about your outcome.
          </p>
          <Link href="/about" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            fontSize: "14px", fontWeight: 600, color: "var(--color-accent)", textDecoration: "none",
          }}>
            More about us →
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { label: "Founded", value: String(BRAND.year) },
            { label: "Team size", value: "< 10" },
            { label: "Clients served", value: "50+" },
            { label: "Avg. engagement", value: "3 months" },
          ].map(({ label, value }) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "20px 24px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
            }}>
              <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>{label}</span>
              <span style={{ fontSize: "20px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION: CTA ─────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section style={{ padding: "120px 40px", textAlign: "center" }}>
      <div style={{
        maxWidth: "640px", margin: "0 auto",
        padding: "64px", background: "rgba(132,204,22,0.05)",
        border: "1px solid rgba(132,204,22,0.15)", borderRadius: "24px",
      }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: "16px" }}>
          Ready to build?
        </h2>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)", marginBottom: "40px", lineHeight: 1.7 }}>
          Tell us what you're working on. We'll respond within one business day.
        </p>
        <Link href="/intake" style={{
          display: "inline-block",
          padding: "16px 40px", background: "var(--color-accent)",
          borderRadius: "10px", fontSize: "15px", fontWeight: 700,
          color: "var(--color-accent-text)", textDecoration: "none",
        }}>
          Start a project
        </Link>
      </div>
    </section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <Hero />
      <Work />
      <Services />
      <Process />
      <About />
      <CTA />
    </>
  );
}
