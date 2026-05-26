import { Suspense } from "react";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";

export default function ResetPasswordRoute() {
  return (
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  );
}
