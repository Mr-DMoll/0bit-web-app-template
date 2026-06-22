import { Suspense } from "react";
import VerifyPage from "@/features/auth/pages/VerifyPage";

export default function Page() {
  return (
    <Suspense>
      <VerifyPage />
    </Suspense>
  );
}
