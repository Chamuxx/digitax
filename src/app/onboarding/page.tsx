"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Building2, IdCard } from "lucide-react";

export default function OnboardingPage() {
  const [nic, setNic] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nic) {
      toast.error("Please provide your NIC.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nic }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save profile");
      }

      toast.success("Profile setup complete!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to complete setup");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary shadow-glow grid place-items-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <Card className="border-border/50 shadow-xl bg-card/60 backdrop-blur-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
              <CardDescription className="mt-2">
                To link your assessed properties to this account, please provide your National Identity Card (NIC) number.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nic" className="text-sm font-medium">
                    National Identity Card (NIC) *
                  </Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nic"
                      required
                      placeholder="e.g. 199012345678"
                      className="pl-10 h-11"
                      value={nic}
                      onChange={(e) => setNic(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary text-primary-foreground font-semibold shadow-glow-sm hover:shadow-glow transition-all"
                  disabled={saving}
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Continue to Dashboard"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
