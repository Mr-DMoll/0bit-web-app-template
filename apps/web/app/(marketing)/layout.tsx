"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/shared/config/branding.config";

// ─── SHARED NAV ───────────────────────────────────────────────────────────────
function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome   = pathname === "/";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "16px 40px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(8,12,24,0.9)" : "rgba(8,12,24,0.4)",
      backdropFilter: "blur(12px)",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      transition: "all 0.3s ease",
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "8px",
          background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "16px", fontWeight: 900, color: "var(--color-accent-text)",
        }}>{BRAND.logoMark}</div>
        <span style={{ fontSize: "18px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
          {BRAND.name}
        </span>
      </Link>

      {/* Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        {isHome ? (
          // Anchor links on home page
          ["Work", "Services", "Process", "About"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`}
              style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", textDecoration: "none", fontWeight: 500, transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
            >{l}</a>
          ))
        ) : (
          // Page links on other pages
          [
            { label: "Home",    href: "/"        },
            { label: "About",   href: "/about"   },
            { label: "Pricing", href: "/pricing" },
            { label: "Contact", href: "/contact" },
          ].map(({ label, href }) => (
            <Link key={label} href={href}
              style={{
                fontSize: "14px", fontWeight: 500, textDecoration: "none", transition: "color 0.15s",
                color: pathname === href ? "#fff" : "rgba(255,255,255,0.5)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = pathname === href ? "#fff" : "rgba(255,255,255,0.5)")}
            >{label}</Link>
          ))
        )}
      </div>

      {/* CTA */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <Link href="/login" style={{
          fontSize: "13px", color: "rgba(255,255,255,0.5)",
          textDecoration: "none", fontWeight: 500, transition: "color 0.15s",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
        >
          Client portal
        </Link>
        <Link href="/intake" style={{
          padding: "8px 18px", background: "var(--color-accent)", borderRadius: "8px",
          fontSize: "13px", fontWeight: 700, color: "var(--color-accent-text)",
          textDecoration: "none", transition: "opacity 0.15s",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Start a project
        </Link>
      </div>
    </nav>
  );
}

// ─── SHARED FOOTER ────────────────────────────────────────────────────────────
function MarketingFooter() {
  return (
    <footer style={{
      padding: "40px",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      background: "#080c18",
    }}>
      <div style={{
        maxWidth: "1100px", margin: "0 auto",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap", gap: "20px",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 900, color: "var(--color-accent-text)" }}>{BRAND.logoMark}</div>
          <span style={{ fontSize: "16px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{BRAND.name}</span>
        </Link>

        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.2)" }}>
          © {new Date().getFullYear()} {BRAND.name}. {BRAND.tagline}
        </p>

        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          {[
            { label: "Home",    href: "/"        },
            { label: "About",   href: "/about"   },
            { label: "Pricing", href: "/pricing" },
            { label: "Contact", href: "/contact" },
            { label: "Portal",  href: "/login"   },
          ].map(({ label, href }) => (
            <Link key={label} href={href}
              style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
            >{label}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── MARKETING LAYOUT ─────────────────────────────────────────────────────────
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#080c18", minHeight: "100vh" }}>
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
