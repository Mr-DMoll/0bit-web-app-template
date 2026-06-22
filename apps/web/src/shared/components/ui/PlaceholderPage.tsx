"use client";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div style={{
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      minHeight:      "60vh",
      gap:            "12px",
    }}>
      <div style={{
        width:          "48px",
        height:         "48px",
        borderRadius:   "12px",
        background:     "var(--color-bg-secondary)",
        border:         "2px dashed var(--color-border)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       "22px",
      }}>
        🚧
      </div>
      <h1 style={{
        fontSize:      "20px",
        fontWeight:    700,
        color:         "var(--color-text-primary)",
        letterSpacing: "-0.02em",
      }}>
        {title}
      </h1>
      <p style={{
        fontSize: "14px",
        color:    "var(--color-text-muted)",
      }}>
        {description ?? "This page is under construction."}
      </p>
    </div>
  );
}
