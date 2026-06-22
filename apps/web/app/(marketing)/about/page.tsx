import { BRAND } from "@/shared/config/branding.config";
import Link from "next/link";

const VALUES = [
  { title: "Craft over speed", desc: "We move fast, but we don't cut corners. Code quality and user experience are non-negotiable." },
  { title: "Embedded partnership", desc: "We work as part of your team, not as a vendor at arm's length. Your Slack, your standups." },
  { title: "Outcome focused", desc: "We measure success by your metrics — not ours. Features shipped are only valuable if they move the needle." },
  { title: "Radical transparency", desc: "Honest estimates. Clear blockers. No surprises. You always know where things stand." },
];

const TEAM = [
  { name: "—", role: "Founder & Lead Engineer", bio: "10+ years building products across fintech, logistics, and SaaS." },
  { name: "—", role: "Design Lead", bio: "Background in product design at scale. Obsessed with reducing friction." },
  { name: "—", role: "Full-stack Engineer", bio: "Specialist in data-heavy apps and API integrations." },
];

export default function AboutPage() {
  return (
    <div style={{ background: "#080c18", paddingTop: "57px" }}>

      {/* Hero */}
      <section style={{ padding: "100px 40px 80px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>About</p>
        <h1 style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: "24px" }}>
          We build the software<br />your team deserves.
        </h1>
        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: "560px", margin: "0 auto" }}>
          {BRAND.name} is a product studio specialising in custom web applications, internal tools, and client-facing platforms for growing businesses.
        </p>
      </section>

      {/* Mission */}
      <section style={{ padding: "80px 40px", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: "20px" }}>Our mission</h2>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: "16px" }}>
              Most software projects fail not because of bad ideas, but because of poor execution — bloated teams, misaligned incentives, and slow feedback loops.
            </p>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
              We exist to change that. By keeping teams small and communication direct, we ship faster and build things that last.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {[["50+", "Projects"], ["98%", "Satisfaction"], ["< 2wk", "Kickoff"], ["3yrs", "Avg. retention"]].map(([v, l]) => (
              <div key={l} style={{ padding: "28px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{v}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "4px" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: "100px 40px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "56px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>Values</p>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>How we operate</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
          {VALUES.map(({ title, desc }) => (
            <div key={title} style={{ padding: "32px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "10px" }}>{title}</h3>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: "0 40px 100px 40px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "56px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>Team</p>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>The people behind the work</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          {TEAM.map(({ name, role, bio }) => (
            <div key={role} style={{ padding: "32px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--color-accent-subtle)", border: "1px solid var(--color-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "var(--color-accent)", marginBottom: "16px" }}>
                {BRAND.logoMark}
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{name}</div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-accent)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{role}</div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6, margin: 0 }}>{bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "0 40px 100px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto", padding: "56px", background: "rgba(132,204,22,0.05)", border: "1px solid rgba(132,204,22,0.15)", borderRadius: "24px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: "12px" }}>Work with us</h2>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)", marginBottom: "32px", lineHeight: 1.7 }}>Tell us about your project and we'll get back to you within one business day.</p>
          <Link href="/contact" style={{ display: "inline-block", padding: "14px 32px", background: "var(--color-accent)", borderRadius: "10px", fontSize: "14px", fontWeight: 700, color: "var(--color-accent-text)", textDecoration: "none" }}>
            Get in touch
          </Link>
        </div>
      </section>

    </div>
  );
}
