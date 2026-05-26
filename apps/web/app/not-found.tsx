import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--color-bg)",
      padding: "24px",
      fontFamily: "inherit",
    }}>
      <div style={{ textAlign: "center", maxWidth: "420px" }}>
        <p style={{
          fontSize: "96px",
          fontWeight: 800,
          color: "var(--color-accent)",
          lineHeight: 1,
          marginBottom: "8px",
          letterSpacing: "-0.04em",
        }}>
          404
        </p>
        <h1 style={{
          fontSize: "22px",
          fontWeight: 600,
          color: "var(--color-text-primary)",
          marginBottom: "10px",
        }}>
          Page not found
        </h1>
        <p style={{
          fontSize: "14px",
          color: "var(--color-text-muted)",
          lineHeight: 1.6,
          marginBottom: "32px",
        }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/" style={{
          display: "inline-block",
          padding: "11px 28px",
          background: "var(--color-accent)",
          color: "var(--color-accent-text)",
          borderRadius: "var(--radius-md)",
          fontSize: "14px",
          fontWeight: 700,
          textDecoration: "none",
        }}>
          Go back home
        </Link>
      </div>
    </div>
  );
}
