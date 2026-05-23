"use client";

import { Building2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function AppHeader() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  const role = user?.publicMetadata?.role as string | undefined;

  return (
    <header className="border-b bg-card/60 backdrop-blur-sm sticky top-0 z-30">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-lg bg-gradient-primary grid place-items-center shadow-glow group-hover:scale-105 transition-smooth">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold">CivicTax</div>
            <div className="text-[11px] text-muted-foreground -mt-0.5">Property Assessment Portal</div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          {isLoaded && user && (
            <>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium leading-tight">{user.primaryEmailAddress?.emailAddress}</div>
                <div className="text-xs text-muted-foreground capitalize">{role ?? "—"}</div>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1.5" /> Sign out
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
