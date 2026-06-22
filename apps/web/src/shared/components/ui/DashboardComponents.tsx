"use client";

// ─── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({
  title,
  value,
  color,
  sub,
}: {
  title: string;
  value: string;
  color?: string;
  sub?: string;
}) {
  return (
    <div
      style={{
        padding:         "20px 24px",
        borderRadius:    "var(--radius-lg)",
        background:      "var(--color-card-bg)",
        border:          "1px solid var(--color-card-border)",
        boxShadow:       "var(--color-card-shadow)",
        position:        "relative",
        overflow:        "hidden",
      }}
    >
      {color && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`}
        />
      )}
      <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "8px" }}>
        {title}
      </p>
      <p style={{ fontSize: "28px", fontWeight: 300, color: "var(--color-text-primary)", lineHeight: 1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "6px" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── ActivityItem ──────────────────────────────────────────────────────────────
export function ActivityItem({ text, time }: { text: string; time: string }) {
  return (
    <div
      style={{
        display:      "flex",
        alignItems:   "flex-start",
        gap:          "12px",
        paddingBottom: "12px",
        borderBottom: "1px solid var(--color-border)",
      }}
      className="last-of-type:border-0 last-of-type:pb-0"
    >
      <div
        style={{
          width:        "8px",
          height:       "8px",
          borderRadius: "50%",
          background:   "var(--color-accent)",
          marginTop:    "6px",
          flexShrink:   0,
        }}
      />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{text}</p>
        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "3px" }}>{time}</p>
      </div>
    </div>
  );
}

// ─── HealthMetric ──────────────────────────────────────────────────────────────
export function HealthMetric({
  label,
  status,
  percentage,
}: {
  label: string;
  status: "Operational" | "Warning" | "Degraded";
  percentage: number;
}) {
  const color =
    status === "Operational" ? "#22c55e" :
    status === "Warning"     ? "#f59e0b" : "#ef4444";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{label}</span>
        <span style={{ fontSize: "12px", color, fontWeight: 500 }}>{status}</span>
      </div>
      <div
        style={{
          width: "100%", height: "6px",
          borderRadius: "999px",
          background: "var(--color-border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percentage}%`,
            background: color,
            borderRadius: "999px",
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────
export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding:      "24px",
        borderRadius: "var(--radius-lg)",
        background:   "var(--color-card-bg)",
        border:       "1px solid var(--color-card-border)",
        boxShadow:    "var(--color-card-shadow)",
      }}
    >
      <h3
        style={{
          fontSize:     "15px",
          fontWeight:   600,
          color:        "var(--color-text-primary)",
          marginBottom: "16px",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── ProjectRow ───────────────────────────────────────────────────────────────
export function ProjectRow({
  name,
  status,
  progress,
  client,
  deadline,
}: {
  name: string;
  status: string;
  progress: number;
  client?: string;
  deadline?: string;
}) {
  const statusColor =
    status === "Active"    ? { bg: "var(--color-accent-subtle)",  text: "var(--color-accent)" } :
    status === "Review"    ? { bg: "rgba(59,130,246,0.1)",  text: "#3b82f6" } :
    status === "On Hold"   ? { bg: "rgba(245,158,11,0.1)",  text: "#f59e0b" } :
    status === "Complete"  ? { bg: "rgba(34,197,94,0.1)",   text: "#22c55e" } :
                             { bg: "rgba(148,163,184,0.1)", text: "#94a3b8" };

  return (
    <div
      style={{
        display:       "flex",
        alignItems:    "center",
        gap:           "12px",
        padding:       "12px 0",
        borderBottom:  "1px solid var(--color-border)",
      }}
      className="last-of-type:border-0 last-of-type:pb-0"
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "2px" }}>
          {name}
        </p>
        {client && (
          <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{client}</p>
        )}
      </div>
      {deadline && (
        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
          {deadline}
        </p>
      )}
      <div style={{ width: "80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
          <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{progress}%</span>
        </div>
        <div style={{ height: "4px", background: "var(--color-border)", borderRadius: "999px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "var(--color-accent)", borderRadius: "999px" }} />
        </div>
      </div>
      <span
        style={{
          fontSize:     "11px",
          fontWeight:   500,
          padding:      "3px 8px",
          borderRadius: "999px",
          background:   statusColor.bg,
          color:        statusColor.text,
          whiteSpace:   "nowrap",
        }}
      >
        {status}
      </span>
    </div>
  );
}
