import { Suspense } from "react";
import SetPasswordPage from "@/features/auth/pages/SetPasswordPage";

export default function Page() {
  return (
    <Suspense>
      <SetPasswordPage />
    </Suspense>
  );
}
