import { BRAND } from "@/shared/config/branding.config";
import Link from "next/link";

const TIERS = [
  {
    name: "Starter",
    price: "From $3k",
    period: "/ project",
    desc: "For founders validating an idea or teams that need a quick win.",
    highlight: false,
    features: [
      "Up to 4 weeks engagement",
      "1 senior engineer",
      "Figma designs included",
      "Deployment & handover",
      "14 days post-launch support",
    ],
    cta: "Start a conversation",
    ctaHref: "/contact",
  },
  {
    name: "Growth",
    price: "From $8k",
    period: "/ month",
    desc: "For teams that need a dedicated product partner on an ongoing basis.",
    highlight: true,
    features: [
      "Ongoing monthly retainer",
      "2–3 senior engineers + designer",
      "Weekly demos & planning",
      "Priority support & SLA",
      "Architecture review included",
      "Unlimited revision rounds",
    ],
    cta: "Apply for Growth",
    ctaHref: "/intake",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For larger organisations needing embedded teams, compliance, or scale.",
    highlight: false,
    features: [
      "Dedicated team of 4–8",
      "Embedded in your workflow",
      "NDA & custom contracts",
      "On-site visits available",
      "SOC 2 / compliance support",
      "Executive reporting",
    ],
    cta: "Talk to us",
    ctaHref: "/contact",
  },
];

const FAQ = [
  { q: "Do you work with early-stage startups?", a: "Yes. Many of our best relationships started at the idea stage. We're comfortable with uncertainty and help you prioritise ruthlessly." },
  { q: "What happens after the project ends?", a: "We offer a 14-day support window on all fixed-scope projects. Growth clients get continuous support as part of the retainer." },
  { q: "Can we hire the team after working together?", a: "We ask that you don't solicit our team members during an engagement. After 12 months, we're happy to discuss referrals." },
  { q: "Do you work with non-technical founders?", a: "Absolutely. Translating business goals into a technical roadmap is one of the core things we do." },
  { q: "What's the typical timeline to get started?", a: "Most projects kick off within two weeks of signing. For retainers we often start with a one-week discovery sprint." },
  { q: "Do you offer equity arrangements?", a: "Occasionally, for the right project. Reach out and we can discuss what makes sense for both sides." },
];

export default function PricingPage() {
  return (
    <div style={{ background: "#080c18", paddingTop: "57px" }}>

      {/* Hero */}
      <section style={{ padding: "100px 40px 80px", textAlign: "center", maxWidth: "720px", margin: "0 auto" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>Pricing</p>
        <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: "20px" }}>
          Transparent pricing.<br />No surprises.
        </h1>
        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
          Whether you need a one-off build or a long-term partner, we have an engagement model that fits.
        </p>
      </section>

      {/* Tiers */}
      <section style={{ padding: "40px 40px 100px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", alignItems: "start" }}>
          {TIERS.map(({ name, price, period, desc, highlight, features, cta, ctaHref }) => (
            <div key={name} style={{
              padding: "36px",
              background: highlight ? "rgba(132,204,22,0.06)" : "rgba(255,255,255,0.04)",
              border: highlight ? "1px solid var(--color-accent-border)" : "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              position: "relative",
            }}>
              {highlight && (
                <div style={{ position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)", background: "var(--color-accent)", color: "var(--color-accent-text)", fontSize: "11px", fontWeight: 800, padding: "4px 14px", borderRadius: "0 0 8px 8px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Most popular
                </div>
              )}
              <div style={{ marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: highlight ? "var(--color-accent)" : "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "8px" }}>
                <span style={{ fontSize: "36px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{price}</span>
                {period && <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)" }}>{period}</span>}
              </div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: "28px", minHeight: "40px" }}>{desc}</p>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
                    <span style={{ color: "var(--color-accent)", fontSize: "13px", marginTop: "2px", flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={ctaHref} style={{
                display: "block", textAlign: "center",
                padding: "12px",
                background: highlight ? "var(--color-accent)" : "rgba(255,255,255,0.08)",
                border: highlight ? "none" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px", fontSize: "14px", fontWeight: 700,
                color: highlight ? "#0a0f1a" : "#fff", textDecoration: "none",
              }}>
                {cta}
              </Link>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(255,255,255,0.25)", marginTop: "32px" }}>
          All prices in USD. Scope-based projects quoted individually. VAT may apply.
        </p>
      </section>

      {/* FAQ */}
      <section style={{ padding: "0 40px 100px", maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>FAQ</p>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Common questions</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden" }}>
          {FAQ.map(({ q, a }) => (
            <div key={q} style={{ padding: "28px 32px", background: "#080c18" }}>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>{q}</div>
              <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>{a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "0 40px 100px", textAlign: "center" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto", padding: "56px", background: "rgba(132,204,22,0.05)", border: "1px solid rgba(132,204,22,0.15)", borderRadius: "24px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: "12px" }}>Still have questions?</h2>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)", marginBottom: "32px", lineHeight: 1.7 }}>
            Drop us a message and we'll get back to you within one business day.
          </p>
          <Link href="/contact" style={{ display: "inline-block", padding: "14px 32px", background: "var(--color-accent)", borderRadius: "10px", fontSize: "14px", fontWeight: 700, color: "var(--color-accent-text)", textDecoration: "none" }}>
            Contact {BRAND.name}
          </Link>
        </div>
      </section>

    </div>
  );
}
