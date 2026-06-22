import DashboardShell from "@/shared/components/layout/DashboardShell";
import { AuthGuard } from "@/shared/components/guards/AuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
