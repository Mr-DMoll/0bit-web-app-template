"use client";

import { useState } from "react";
import SidebarClient from "./SidebarClient";
import TopNav from "./TopNav";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{
      display:         "flex",
      height:          "100vh",
      overflow:        "hidden",
      backgroundColor: "var(--color-bg)",
    }}>
      {/* LEFT COLUMN — sidebar owns full height */}
      <SidebarClient
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />

      {/* RIGHT COLUMN — top nav + scrollable content */}
      <div style={{
        flex:          1,
        display:       "flex",
        flexDirection: "column",
        overflow:      "hidden",
        minWidth:      0,
      }}>
        <TopNav />
        <main style={{
          flex:      1,
          overflowY: "auto",
          padding:   "28px 32px",
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
