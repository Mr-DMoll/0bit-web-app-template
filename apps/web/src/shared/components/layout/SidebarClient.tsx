"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/shared/context/AuthContext";
import { useTheme } from "@/shared/context/ThemeContext";
import { type NavItem } from "@/shared/config/nav.config";
import { NAV_CONFIG } from "@/shared/config/nav.config";


import {
  LayoutDashboard, FolderKanban, Users, UserCircle,
  FileText, Receipt, UsersRound, Activity, ScrollText,
  Settings, LogOut, Sun, Moon, CheckSquare, Palette,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  LayoutDashboard, FolderKanban, Users, UserCircle,
  FileText, Receipt, UsersRound, Activity, ScrollText,
  Settings, LogOut, CheckSquare, Palette,
};

interface Props {
  navItems: NavItem[];
  role: string;
}

export default function SidebarClient() {
  const [isHovered, setIsHovered] = useState(false);
  const pathname  = usePathname();
  const { logout, user } = useAuth();

  const role     = (user?.role ?? "") as keyof typeof NAV_CONFIG;
  const navItems = NAV_CONFIG[role] ?? [];

  const { theme, toggle } = useTheme();

  const displayName =
    user?.displayName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "";

  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "O";

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width:           isHovered ? "var(--sidebar-expanded)" : "var(--sidebar-collapsed)",
        minWidth:        isHovered ? "var(--sidebar-expanded)" : "var(--sidebar-collapsed)",
        transition:      "width var(--transition-base), min-width var(--transition-base)",
        backgroundColor: "var(--color-sidebar-bg)",
        borderRight:     "1px solid var(--color-sidebar-border)",
        boxShadow:       "var(--color-sidebar-shadow)",
        display:         "flex",
        flexDirection:   "column",
        height:          "100vh",
        position:        "sticky",
        top:             0,
        overflow:        "hidden",
        zIndex:          10,
        flexShrink:      0,
      }}
    >
      {/* ── Brand ──────────────────────────────────────────────────────────── */}
      <div style={{
        padding:        "16px 12px",
        display:        "flex",
        alignItems:     "center",
        gap:            "10px",
        justifyContent: isHovered ? "flex-start" : "center",
        borderBottom:   "1px solid var(--color-sidebar-border)",
        flexShrink:     0,
        minHeight:      "64px",
      }}>
        {/* Avatar / Logo mark */}
        <div style={{
          width:           "34px",
          height:          "34px",
          borderRadius:    "9px",
          background:      "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          flexShrink:      0,
          fontSize:        "13px",
          fontWeight:      800,
          color:           "var(--color-accent-text)",
          letterSpacing:   "-0.02em",
        }}>
          {initials}
        </div>

        {isHovered && (
          <div style={{ overflow: "hidden" }}>
            <div style={{
              fontSize:      "13px",
              fontWeight:    700,
              color:         "var(--color-text-primary)",
              lineHeight:    1.2,
              whiteSpace:    "nowrap",
              overflow:      "hidden",
              textOverflow:  "ellipsis",
              maxWidth:      "130px",
            }}>
              {displayName || "O-Bit"}
            </div>
            <div style={{
              fontSize:      "9px",
              fontWeight:    700,
              color:         "var(--color-accent-text)",
              background:    "var(--color-accent)",
              borderRadius:  "3px",
              padding:       "1px 6px",
              display:       "inline-block",
              marginTop:     "4px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              whiteSpace:    "nowrap",
            }}>
              {role.replace(/_/g, " ")}
            </div>
          </div>
        )}
      </div>

      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <nav style={{
        flex:          1,
        padding:       "10px 8px",
        display:       "flex",
        flexDirection: "column",
        gap:           "1px",
        overflowY:     "auto",
        overflowX:     "hidden",
      }}>
        {navItems.map((item) => {
          const Icon     = ICON_MAP[item.icon];    

          const isActive =   pathname === item.href ||  (item.href.split("/").length > 2 && pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={!isHovered ? item.label : undefined}
              className="sidebar-nav-link"
              style={{
                display:        "flex",
                alignItems:     "center",
                gap:            "10px",
                padding:        "9px 10px",
                justifyContent: isHovered ? "flex-start" : "center",
                borderRadius:   "var(--radius-sm)",
                fontSize:       "13px",
                fontWeight:     isActive ? 600 : 400,
                color:          isActive
                  ? "var(--color-sidebar-text-active)"
                  : "var(--color-sidebar-text)",
                background:     isActive
                  ? "var(--color-sidebar-item-active)"
                  : "transparent",
                transition:     "background var(--transition-fast), color var(--transition-fast)",
                whiteSpace:     "nowrap",
                textDecoration: "none",
              }}
            >
              {Icon && <Icon size={16} />}
              {isHovered && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom ─────────────────────────────────────────────────────────── */}
      <div style={{
        padding:       "8px",
        borderTop:     "1px solid var(--color-sidebar-border)",
        display:       "flex",
        flexDirection: "column",
        gap:           "1px",
        flexShrink:    0,
      }}>
        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={!isHovered ? (theme === "dark" ? "Light mode" : "Dark mode") : undefined}
          style={{
            display:        "flex",
            alignItems:     "center",
            gap:            "10px",
            padding:        "9px 10px",
            justifyContent: isHovered ? "flex-start" : "center",
            borderRadius:   "var(--radius-sm)",
            fontSize:       "13px",
            color:          "var(--color-sidebar-text)",
            background:     "transparent",
            border:         "none",
            cursor:         "pointer",
            width:          "100%",
            whiteSpace:     "nowrap",
            transition:     "background var(--transition-fast), color var(--transition-fast)",
          }}
          className="sidebar-nav-link"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          {isHovered && (
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          )}
        </button>

        {/* Profile */}
        <Link
          href="/profile"
          title={!isHovered ? "Profile" : undefined}
          className="sidebar-nav-link"
          style={{
            display:        "flex",
            alignItems:     "center",
            gap:            "10px",
            padding:        "9px 10px",
            justifyContent: isHovered ? "flex-start" : "center",
            borderRadius:   "var(--radius-sm)",
            fontSize:       "13px",
            color:          pathname === "/profile"
              ? "var(--color-sidebar-text-active)"
              : "var(--color-sidebar-text)",
            background:     pathname === "/profile"
              ? "var(--color-sidebar-item-active)"
              : "transparent",
            whiteSpace:     "nowrap",
            textDecoration: "none",
          }}
        >
          <UserCircle size={16} />
          {isHovered && <span>Profile</span>}
        </Link>

        {/* Settings */}
        <Link
          href="/settings"
          title={!isHovered ? "Settings" : undefined}
          className="sidebar-nav-link"
          style={{
            display:        "flex",
            alignItems:     "center",
            gap:            "10px",
            padding:        "9px 10px",
            justifyContent: isHovered ? "flex-start" : "center",
            borderRadius:   "var(--radius-sm)",
            fontSize:       "13px",
            color:          pathname === "/settings"
              ? "var(--color-sidebar-text-active)"
              : "var(--color-sidebar-text)",
            background:     pathname === "/settings"
              ? "var(--color-sidebar-item-active)"
              : "transparent",
            whiteSpace:     "nowrap",
            textDecoration: "none",
          }}
        >
          <Settings size={16} />
          {isHovered && <span>Settings</span>}
        </Link>

        {/* Sign out */}
        <button
          onClick={logout}
          title={!isHovered ? "Sign Out" : undefined}
          className="sidebar-sign-out"
          style={{
            display:        "flex",
            alignItems:     "center",
            gap:            "10px",
            padding:        "9px 10px",
            justifyContent: isHovered ? "flex-start" : "center",
            borderRadius:   "var(--radius-sm)",
            fontSize:       "13px",
            color:          "var(--color-sidebar-text)",
            background:     "transparent",
            border:         "none",
            cursor:         "pointer",
            width:          "100%",
            whiteSpace:     "nowrap",
            transition:     "background var(--transition-fast), color var(--transition-fast)",
          }}
        >
          <LogOut size={16} />
          {isHovered && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
