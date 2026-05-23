"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export function ProtectedRoute({ children, requireRole }: { children: ReactNode; requireRole?: "admin" | "user" }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.replace("/sign-in");
    } else if (isLoaded && user && requireRole) {
      const role = user.publicMetadata?.role;
      if (role !== requireRole) {
        router.replace(role === "admin" ? "/admin" : "/dashboard");
      }
    }
  }, [isLoaded, user, requireRole, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (requireRole && user.publicMetadata?.role !== requireRole) {
    return null;
  }

  return <>{children}</>;
}
