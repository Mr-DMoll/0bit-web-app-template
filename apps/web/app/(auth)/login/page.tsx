import { Suspense } from "react";
import LoginPage from "@/features/auth/pages/LoginPage";

export default function LoginRoute() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
