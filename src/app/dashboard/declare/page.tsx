"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ChevronLeft, Home, Building } from "lucide-react";
import Link from "next/link";

export default function DeclarePropertyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  // Profile check
  const [nic, setNic] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Form
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.exists && data.user?.nic) {
            setNic(data.user.nic);
            // Auto-fill full name if available
            const fn = [data.user.firstName, data.user.lastName].filter(Boolean).join(" ");
            if (fn) setFullName(fn);
          } else {
            // Should not happen if dashboard enforces onboarding, but just in case
            router.push("/onboarding");
          }
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !address || !phone) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/declared-properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, address, phone }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to declare property");
      }

      toast.success("Property declared successfully! It is now pending assessment.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to declare property");
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile) {
    return (
      <ProtectedRoute requireRole="user">
        <div className="flex flex-col min-h-screen">
          <AppHeader />
          <div className="flex-1 grid place-items-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireRole="user">
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Declare New Property</h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Submit a property to be assessed by the municipal council.
                </p>
              </div>
            </div>
          </div>

          <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardTitle className="text-lg">Property Information</CardTitle>
              <CardDescription>
                Provide the exact location and owner details for this property.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="nic" className="text-xs">
                    Owner's NIC
                  </Label>
                  <Input
                    id="nic"
                    value={nic}
                    disabled
                    className="bg-muted/50 h-9"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    This is linked to your verified account profile.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs">
                    Owner's Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    required
                    placeholder="e.g. John Doe"
                    className="h-9"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs">
                    Contact Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    required
                    type="tel"
                    placeholder="e.g. 0771234567"
                    className="h-9"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs">
                    Property Address *
                  </Label>
                  <Input
                    id="address"
                    required
                    placeholder="e.g. 123 Main St, Colombo 03"
                    className="h-9"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-primary text-white font-semibold shadow-glow-sm hover:shadow-glow transition-all"
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      "Submit Property for Assessment"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
