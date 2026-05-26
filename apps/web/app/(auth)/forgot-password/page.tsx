import { Suspense } from "react";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";

export default function Page() {
  return (
    <Suspense>
      <ForgotPasswordPage />
    </Suspense>
  );
}
