"use client";

import { Building2, LogOut, Menu, X, Home, LayoutDashboard, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  const role = user?.publicMetadata?.role as string | undefined;

  const adminLinks = [
    { href: "/admin", label: "Assessments", icon: LayoutDashboard },
    { href: "/admin/properties/new", label: "New Property", icon: PlusCircle },
  ];

  const userLinks = [
    { href: "/dashboard", label: "My Properties", icon: Home },
  ];

  const navLinks = role === "admin" ? adminLinks : userLinks;

  return (
    <>
      <header className="border-b border-border/50 glass sticky top-0 z-30">
        <div className="container flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="h-9 w-9 rounded-lg bg-gradient-primary shadow-glow grid place-items-center group-hover:shadow-glow transition-all duration-300">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight hidden sm:block">
              <div className="font-bold text-sm">DigiTax</div>
              <div className="text-[10px] text-muted-foreground -mt-0.5">Property Assessment Portal</div>
            </div>
          </Link>

          {/* Desktop nav */}
          {isLoaded && user && (
            <nav className="hidden md:flex gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-smooth",
                    pathname === link.href || (link.href !== "/admin" && link.href !== "/dashboard" && pathname.startsWith(link.href))
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {isLoaded && user ? (
              <>
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-medium leading-tight truncate max-w-[160px]">
                    {user.primaryEmailAddress?.emailAddress}
                  </div>
                  <div className="text-[10px] text-muted-foreground capitalize mt-0.5">
                    {role === "admin" ? "🛡️ Admin" : "👤 User"}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="hidden sm:flex"
                  id="sign-out-button"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5" />
                  Sign out
                </Button>
                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-9 w-9"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  id="mobile-menu-button"
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              </>
            ) : isLoaded ? (
              <div className="flex items-center gap-2">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && isLoaded && user && (
        <div className="fixed inset-0 z-20 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-16 bottom-0 w-64 glass border-l border-border p-4 flex flex-col gap-3">
            <div className="pb-3 border-b border-border">
              <div className="text-sm font-medium">{user.primaryEmailAddress?.emailAddress}</div>
              <div className="text-xs text-muted-foreground capitalize mt-0.5">
                {role === "admin" ? "🛡️ Admin" : "👤 User"}
              </div>
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth",
                  pathname === link.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            <div className="mt-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="w-full"
                id="mobile-sign-out-button"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
