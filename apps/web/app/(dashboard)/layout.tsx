import Sidebar from "@/shared/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display:   "flex",
      minHeight: "100vh",
      backgroundColor: "var(--color-bg)",
    }}>
      <Sidebar />
      <main style={{
        flex:      1,
        padding:   "28px 32px",
        overflowY: "auto",
        minWidth:  0,
      }}>
        {children}
      </main>
    </div>
  );
}
