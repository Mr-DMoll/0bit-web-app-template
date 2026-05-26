import { Suspense } from "react";
import SetPasswordPage from "@/features/auth/pages/SetPasswordPage";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <SetPasswordPage />
    </Suspense>
  );
}
