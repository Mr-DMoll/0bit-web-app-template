"use client";

export default function ManagerProjectsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 4px" }}>Projects</h1>
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>Projects you are managing</p>
      </div>

      <div style={{
        background: "var(--color-card-bg)",
        border: "1px solid var(--color-card-border)",
        borderRadius: "12px",
        padding: "56px 0",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>📁</div>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 4px" }}>No projects yet</p>
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>
          Projects assigned to you by an admin will appear here
        </p>
      </div>
    </div>
  );
}
