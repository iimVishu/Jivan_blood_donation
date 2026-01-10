"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    switch (session.user.role) {
      case "admin":
        router.push("/dashboard/admin");
        break;
      case "hospital":
        router.push("/dashboard/hospital");
        break;
      case "recipient":
        router.push("/dashboard/recipient");
        break;
      case "donor":
      default:
        router.push("/dashboard/donor");
        break;
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
    </div>
  );
}
