"use client";

import { Mail, Webhook, Database, Train, Globe } from "lucide-react";

interface Integration {
  key:         string;
  label:       string;
  description: string;
  status:      "connected" | "not_configured" | "coming_soon";
  icon:        React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

const INTEGRATIONS: Integration[] = [
  {
    key:         "supabase",
    label:       "Supabase",
    description: "PostgreSQL database and connection pooling via PgBouncer.",
    status:      "connected",
    icon:        Database,
  },
  {
    key:         "resend",
    label:       "Resend",
    description: "Transactional email for invites, password resets, and notifications.",
    status:      "connected",
    icon:        Mail,
  },
  {
    key:         "railway",
    label:       "Railway",
    description: "API server deployment and environment management.",
    status:      "connected",
    icon:        Train,
  },
  {
    key:         "vercel",
    label:       "Vercel",
    description: "Frontend deployment and CDN for the web application.",
    status:      "connected",
    icon:        Globe,
  },
  {
    key:         "webhook",
    label:       "Webhooks",
    description: "Send HTTP callbacks to your own endpoints on platform events.",
    status:      "coming_soon",
    icon:        Webhook,
  },
];

const STATUS_CONFIG = {
  connected:      { label: "Connected",      bg: "var(--color-success-subtle)", color: "var(--color-success)" },
  not_configured: { label: "Not configured", bg: "var(--color-warning-subtle)", color: "var(--color-warning)" },
  coming_soon:    { label: "Coming soon",    bg: "var(--color-bg-subtle)",      color: "var(--color-text-muted)" },
};

export default function IntegrationsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
          Integrations
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "4px" }}>
          Connected services and third-party tools
        </p>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
        {INTEGRATIONS.map((integration) => {
          const Icon   = integration.icon;
          const status = STATUS_CONFIG[integration.status];
          const canConfigure = integration.status === "not_configured";

          return (
            <div
              key={integration.key}
              style={{
                background:   "var(--color-card-bg)",
                border:       "1px solid var(--color-card-border)",
                borderRadius: "var(--radius-xl)",
                boxShadow:    "var(--color-card-shadow)",
                padding:      "24px",
                display:      "flex",
                flexDirection: "column",
                gap:          "16px",
              }}
            >
              {/* Icon + status */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{
                  width:          "44px",
                  height:         "44px",
                  borderRadius:   "var(--radius-lg)",
                  background:     "var(--color-bg-subtle)",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  color:          "var(--color-text-secondary)",
                }}>
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <span style={{
                  padding:       "3px 10px",
                  borderRadius:  "var(--radius-pill)",
                  fontSize:      "11px",
                  fontWeight:    700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  background:    status.bg,
                  color:         status.color,
                }}>
                  {status.label}
                </span>
              </div>

              {/* Info */}
              <div>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "6px" }}>
                  {integration.label}
                </div>
                <div style={{ fontSize: "13px", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                  {integration.description}
                </div>
              </div>

              {/* Action */}
              {canConfigure && (
                <button style={{
                  padding:      "9px 16px",
                  background:   "var(--color-accent-subtle)",
                  border:       "1px solid var(--color-accent)",
                  borderRadius: "var(--radius-md)",
                  fontSize:     "13px",
                  fontWeight:   600,
                  color:        "var(--color-accent)",
                  cursor:       "pointer",
                  textAlign:    "left",
                }}>
                  Configure →
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
