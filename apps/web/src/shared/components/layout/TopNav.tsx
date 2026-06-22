"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/context/AuthContext";
import { useTheme } from "@/shared/context/ThemeContext";
import { Bell, ChevronDown, User, Settings, LogOut, Sun, Moon, Check } from "lucide-react";

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ initials, size = 32 }: { initials: string; size?: number }) {
  return (
    <div style={{
      width:           size,
      height:          size,
      borderRadius:    "var(--radius-pill)",
      background:      "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "center",
      fontSize:        size * 0.38,
      fontWeight:      700,
      color:           "#fff",
      flexShrink:      0,
      letterSpacing:   "-0.01em",
      userSelect:      "none",
    }}>
      {initials}
    </div>
  );
}

// ─── Dropdown item ────────────────────────────────────────────────────────────
function DropdownItem({
  icon: Icon, label, onClick, href, danger, extra,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  extra?: React.ReactNode;
}) {
  const base: React.CSSProperties = {
    display:     "flex",
    alignItems:  "center",
    gap:         "10px",
    padding:     "8px 12px",
    borderRadius: "var(--radius-md)",
    fontSize:    "13.5px",
    fontWeight:  400,
    color:       danger ? "var(--color-danger)" : "var(--color-text-secondary)",
    background:  "transparent",
    border:      "none",
    cursor:      "pointer",
    width:       "100%",
    textAlign:   "left",
    textDecoration: "none",
    transition:  "background var(--transition-fast), color var(--transition-fast)",
  };

  const hoverBg  = danger ? "var(--color-danger-subtle)" : "var(--color-accent-subtle)";
  const hoverClr = danger ? "var(--color-danger)"        : "var(--color-text-primary)";

  const handlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      (e.currentTarget as HTMLElement).style.background = hoverBg;
      (e.currentTarget as HTMLElement).style.color      = hoverClr;
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      (e.currentTarget as HTMLElement).style.background = "transparent";
      (e.currentTarget as HTMLElement).style.color = danger ? "var(--color-danger)" : "var(--color-text-secondary)";
    },
  };

  const content = (
    <>
      <span style={{ display: "flex", flexShrink: 0 }}><Icon size={15} strokeWidth={1.8} /></span>
      <span style={{ flex: 1 }}>{label}</span>
      {extra}
    </>
  );

  if (href) {
    return <Link href={href} style={base} {...handlers}>{content}</Link>;
  }
  return <button type="button" style={base} onClick={onClick} {...handlers}>{content}</button>;
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ height: "1px", background: "var(--color-border)", margin: "4px 0" }} />;
}

// ─── TOP NAV ──────────────────────────────────────────────────────────────────
export default function TopNav() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName =
    user?.displayName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "User";

  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.push("/login");
  };

  return (
    <header style={{
      height:          "var(--topnav-height)",
      backgroundColor: "var(--color-topnav-bg)",
      borderBottom:    "1px solid var(--color-topnav-border)",
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "flex-end",
      padding:         "0 24px",
      gap:             "8px",
      flexShrink:      0,
      position:        "relative",
      zIndex:          10,
    }}>

      {/* ── Bell ──────────────────────────────────────────────────────────── */}
      <Link
        href="/notifications"
        style={{
          position:       "relative",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          width:          "36px",
          height:         "36px",
          borderRadius:   "var(--radius-md)",
          color:          "var(--color-text-secondary)",
          transition:     "background var(--transition-fast), color var(--transition-fast)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--color-accent-subtle)";
          e.currentTarget.style.color      = "var(--color-accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color      = "var(--color-text-secondary)";
        }}
        title="Notifications"
      >
        <Bell size={18} strokeWidth={1.8} />
        {/* Unread badge — shown when there are notifications */}
        <span style={{
          position:    "absolute",
          top:         "6px",
          right:       "6px",
          width:       "7px",
          height:      "7px",
          borderRadius: "var(--radius-pill)",
          background:  "var(--color-accent)",
          border:      "2px solid var(--color-topnav-bg)",
        }} />
      </Link>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div style={{ width: "1px", height: "20px", background: "var(--color-border)" }} />

      {/* ── Avatar + dropdown ─────────────────────────────────────────────── */}
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setDropdownOpen((o) => !o)}
          style={{
            display:     "flex",
            alignItems:  "center",
            gap:         "8px",
            padding:     "4px 8px 4px 4px",
            borderRadius: "var(--radius-pill)",
            background:  dropdownOpen ? "var(--color-accent-subtle)" : "transparent",
            border:      dropdownOpen
              ? "1px solid var(--color-accent-border)"
              : "1px solid transparent",
            cursor:      "pointer",
            transition:  "background var(--transition-fast), border-color var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            if (!dropdownOpen) {
              e.currentTarget.style.background   = "var(--color-accent-subtle)";
              e.currentTarget.style.borderColor  = "var(--color-accent-border)";
            }
          }}
          onMouseLeave={(e) => {
            if (!dropdownOpen) {
              e.currentTarget.style.background   = "transparent";
              e.currentTarget.style.borderColor  = "transparent";
            }
          }}
        >
          <Avatar initials={initials} size={28} />
          <span style={{
            fontSize:   "13.5px",
            fontWeight: 500,
            color:      "var(--color-text-primary)",
            maxWidth:   "120px",
            overflow:   "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {displayName}
          </span>
          <ChevronDown
            size={14}
            strokeWidth={2}
            style={{
              color:     "var(--color-text-muted)",
              transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform var(--transition-fast)",
            }}
          />
        </button>

        {/* ── Dropdown panel ──────────────────────────────────────────────── */}
        {dropdownOpen && (
          <div style={{
            position:    "absolute",
            top:         "calc(100% + 8px)",
            right:       0,
            minWidth:    "200px",
            background:  "var(--color-card-bg)",
            border:      "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            boxShadow:   "var(--color-card-shadow), 0 8px 32px rgba(0,0,0,0.12)",
            padding:     "6px",
            zIndex:      100,
          }}>
            {/* User info */}
            <div style={{
              padding:      "8px 12px 10px",
              marginBottom: "2px",
            }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                {displayName}
              </div>
              <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                {user?.email}
              </div>
            </div>

            <Divider />

            <DropdownItem
              icon={User}
              label="Profile"
              href="/profile"
              onClick={() => setDropdownOpen(false)}
            />
            <DropdownItem
              icon={Settings}
              label="Settings"
              href="/settings"
              onClick={() => setDropdownOpen(false)}
            />

            <Divider />

            {/* Theme toggle */}
            <DropdownItem
              icon={theme === "dark" ? Sun : Moon}
              label={theme === "dark" ? "Light mode" : "Dark mode"}
              onClick={() => { toggle(); setDropdownOpen(false); }}
              extra={
                <span style={{
                  fontSize:    "10px",
                  fontWeight:  600,
                  color:       "var(--color-accent)",
                  background:  "var(--color-accent-subtle)",
                  padding:     "2px 6px",
                  borderRadius: "var(--radius-pill)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  {theme === "dark" ? "light" : "dark"}
                </span>
              }
            />

            <Divider />

            <DropdownItem
              icon={LogOut}
              label="Sign out"
              onClick={handleLogout}
              danger
            />
          </div>
        )}
      </div>
    </header>
  );
}
