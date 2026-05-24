"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, MapPin, TrendingUp, ArrowRight, Plus, Clock } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useUser } from "@clerk/nextjs";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";

export default function UserDashboard() {
  const [properties, setProperties] = useState<any[]>([]);
  const [declaredProperties, setDeclaredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    async function initDashboard() {
      try {
        // First check profile to see if NIC exists
        const profileRes = await fetch("/api/user/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (!profileData.exists || !profileData.user?.nic) {
            router.push("/onboarding");
            return;
          }
        }

        const [res, declaredRes] = await Promise.all([
          fetch("/api/properties"),
          fetch("/api/declared-properties")
        ]);

        if (res.ok) {
          const data = await res.json();
          setProperties(data);
        }
        if (declaredRes.ok) {
          const declaredData = await declaredRes.json();
          setDeclaredProperties(declaredData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    initDashboard();
  }, [router]);

  const totalTax = properties.reduce((acc, p) => acc + p.taxAmount, 0);

  return (
    <ProtectedRoute requireRole="user">
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Home className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">My Properties</h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Welcome back,{" "}
                <span className="text-foreground font-medium">
                  {user?.firstName || user?.primaryEmailAddress?.emailAddress}
                </span>
                . View your assessed properties and tax details below.
              </p>
            </div>
            <Link href="/dashboard/declare">
              <Button className="bg-primary text-primary-foreground shadow-glow-sm hover:shadow-glow transition-all font-semibold flex items-center gap-2 h-10">
                <Plus className="h-4 w-4" /> Declare New Property
              </Button>
            </Link>
          </div>


          {/* Summary card — only shown if there are properties */}
          {!loading && properties.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card className="border-border/50 bg-card/60">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Properties</p>
                      <p className="text-2xl font-bold">{properties.length}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-400/10 grid place-items-center">
                      <Home className="h-5 w-5 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Annual Tax</p>
                      <p className="text-xl font-bold text-primary">
                        LKR{" "}
                        {totalTax.toLocaleString("en-LK", {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pending Declarations */}
          {!loading && declaredProperties.filter(p => p.status === 'pending').length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-400" /> Pending Assessments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {declaredProperties.filter(p => p.status === 'pending').map((prop) => (
                  <Card key={prop._id} className="border-border/50 bg-card/60 backdrop-blur-xl">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-sm font-semibold">{prop.address}</CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            Owner: {prop.fullName} ({prop.phone})
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-[10px] text-orange-400 border-orange-400/30 bg-orange-400/10">
                          Pending
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 text-xs text-muted-foreground">
                      Submitted on {new Date(prop.createdAt).toLocaleDateString("en-LK")}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Assessed Properties */}
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Assessed Properties
          </h2>
          {loading ? (
            <div className="grid place-items-center h-48">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : properties.length === 0 ? (
            <Card className="text-center py-16 border-dashed border-border/70">
              <CardContent>
                <div className="h-16 w-16 rounded-2xl bg-muted/50 grid place-items-center mx-auto mb-4">
                  <Home className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <CardTitle className="mb-2 text-lg">No properties found</CardTitle>
                <CardDescription className="max-w-sm mx-auto">
                  No assessed properties are linked to your account yet. Contact your municipal council if you believe this is an error.
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {properties.map((prop) => (
                <Link key={prop._id} href={`/property/${prop._id}`}>
                  <Card className="hover:border-primary/40 hover:shadow-glow-sm transition-all duration-300 cursor-pointer h-full group bg-card/60">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                            {prop.address || "Assessed Property"}
                          </CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            NIC: {prop.assignedUserNIC}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-[10px] capitalize flex-shrink-0">
                          {prop.attributes?.usage || "residential"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-muted/40 rounded-lg p-2.5">
                          <div className="text-xs text-muted-foreground mb-0.5">Area</div>
                          <div className="font-semibold text-sm">
                            {prop.area.toFixed(1)} sqft
                          </div>
                        </div>
                        <div className="bg-primary/5 border border-primary/10 rounded-lg p-2.5">
                          <div className="text-xs text-muted-foreground mb-0.5">Annual Tax</div>
                          <div className="font-bold text-sm text-primary">
                            LKR{" "}
                            {prop.taxAmount.toLocaleString("en-LK", {
                              maximumFractionDigits: 0,
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Assessed {new Date(prop.createdAt).toLocaleDateString("en-LK")}
                        </div>
                        <span className="text-xs text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          View details <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
