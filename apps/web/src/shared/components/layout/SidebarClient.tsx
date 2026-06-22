"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/shared/context/AuthContext";
import { NAV_CONFIG } from "@/shared/config/nav.config";
import { BRAND } from "@/shared/config/branding.config";
import {
  LayoutDashboard, FolderKanban, Users, UserCircle,
  FileText, Receipt, UsersRound, Activity, ScrollText,
  Settings, Shield, ToggleLeft, Plug,
  ChevronRight, ChevronLeft,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  LayoutDashboard, FolderKanban, Users, UserCircle,
  FileText, Receipt, UsersRound, Activity, ScrollText,
  Settings, Shield, ToggleLeft, Plug,
};

interface Props {
  isOpen:   boolean;
  onToggle: () => void;
}

export default function SidebarClient({ isOpen, onToggle }: Props) {
  const pathname = usePathname();
  const { user } = useAuth();

  const role   = (user?.role ?? "") as keyof typeof NAV_CONFIG;
  const groups = NAV_CONFIG[role] ?? [];

  const w = isOpen ? "var(--sidebar-expanded)" : "var(--sidebar-collapsed)";

  const isActive = (href: string) =>
    pathname === href ||
    (href.split("/").length > 2 && pathname.startsWith(href + "/"));

  return (
    <aside style={{
      width:           w,
      minWidth:        w,
      height:          "100vh",
      backgroundColor: "var(--color-sidebar-bg)",
      borderRight:     "1px solid var(--color-sidebar-border)",
      display:         "flex",
      flexDirection:   "column",
      flexShrink:      0,
      overflow:        "hidden",
      transition:      "width var(--transition-base), min-width var(--transition-base)",
      position:        "relative",
      zIndex:          20,
    }}>

      {/* ── Logo ─────────────────────────────────────────────────────────────── */}
      <div style={{
        height:         "var(--topnav-height)",
        display:        "flex",
        alignItems:     "center",
        gap:            "10px",
        padding:        "0 14px",
        borderBottom:   "1px solid var(--color-sidebar-border)",
        flexShrink:     0,
        overflow:       "hidden",
        justifyContent: isOpen ? "flex-start" : "center",
      }}>
        <div style={{
          width:          "30px",
          height:         "30px",
          borderRadius:   "var(--radius-md)",
          background:     "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontSize:       "13px",
          fontWeight:     800,
          color:          "#fff",
          flexShrink:     0,
          letterSpacing:  "-0.02em",
        }}>
          {BRAND.logoMark}
        </div>

        {isOpen && (
          <span style={{
            fontSize:      "15px",
            fontWeight:    700,
            color:         "var(--color-sidebar-text-active)",
            whiteSpace:    "nowrap",
            letterSpacing: "-0.02em",
          }}>
            {BRAND.name}
          </span>
        )}
      </div>

      {/* ── Nav groups ───────────────────────────────────────────────────────── */}
      <nav style={{
        flex:          1,
        padding:       "12px 8px",
        display:       "flex",
        flexDirection: "column",
        gap:           "4px",
        overflowY:     "auto",
        overflowX:     "hidden",
      }}>
        {groups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: gi < groups.length - 1 ? "8px" : 0 }}>
            {/* Section label — only when sidebar is open and group has a label */}
            {isOpen && group.label && (
              <div style={{
                padding:       "4px 10px 4px",
                fontSize:      "10px",
                fontWeight:    700,
                color:         "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                opacity:       0.6,
              }}>
                {group.label}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {group.items.map((item) => {
                const Icon   = ICON_MAP[item.icon];
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!isOpen ? item.label : undefined}
                    style={{
                      display:        "flex",
                      alignItems:     "center",
                      gap:            "10px",
                      padding:        "9px 10px",
                      borderRadius:   "var(--radius-md)",
                      fontSize:       "13.5px",
                      fontWeight:     active ? 600 : 400,
                      color:          active
                        ? "var(--color-sidebar-text-active)"
                        : "var(--color-sidebar-text)",
                      background:     active
                        ? "var(--color-sidebar-item-active-bg)"
                        : "transparent",
                      textDecoration: "none",
                      whiteSpace:     "nowrap",
                      overflow:       "hidden",
                      justifyContent: isOpen ? "flex-start" : "center",
                      position:       "relative",
                      transition:     "background var(--transition-fast), color var(--transition-fast)",
                    }}
                    className={`sidebar-nav-link${active ? " active" : ""}`}
                  >
                    {active && (
                      <span style={{
                        position:     "absolute",
                        left:         0,
                        top:          "20%",
                        bottom:       "20%",
                        width:        "3px",
                        borderRadius: "0 3px 3px 0",
                        background:   "var(--color-sidebar-indicator)",
                      }} />
                    )}
                    {Icon && (
                      <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                    )}
                    {isOpen && (
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Divider between groups */}
            {gi < groups.length - 1 && (
              <div style={{
                height:     "1px",
                background: "var(--color-sidebar-border)",
                margin:     "8px 4px 0",
                opacity:    0.5,
              }} />
            )}
          </div>
        ))}
      </nav>

      {/* ── Toggle button ────────────────────────────────────────────────────── */}
      <div style={{
        padding:    "12px 8px",
        borderTop:  "1px solid var(--color-sidebar-border)",
        flexShrink: 0,
      }}>
        <button
          onClick={onToggle}
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: isOpen ? "flex-start" : "center",
            gap:            "10px",
            width:          "100%",
            padding:        "9px 10px",
            borderRadius:   "var(--radius-md)",
            background:     "transparent",
            border:         "none",
            cursor:         "pointer",
            color:          "var(--color-sidebar-text)",
            fontSize:       "13.5px",
            fontWeight:     400,
            whiteSpace:     "nowrap",
            transition:     "background var(--transition-fast), color var(--transition-fast)",
          }}
          className="sidebar-nav-link"
        >
          {isOpen
            ? <><ChevronLeft size={17} strokeWidth={1.8} /><span>Collapse</span></>
            : <ChevronRight size={17} strokeWidth={1.8} />
          }
        </button>
      </div>
    </aside>
  );
}
