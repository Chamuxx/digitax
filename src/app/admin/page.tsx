"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  PlusCircle,
  MapPin,
  LayoutDashboard,
  TrendingUp,
  Building2,
  Search,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface Stats {
  totalProperties: number;
  totalTax: number;
  avgTax: number;
  maxTax: number;
}

export default function AdminDashboard() {
  const [properties, setProperties] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { user } = useUser();

  useEffect(() => {
    async function fetchAll() {
      try {
        const [propsRes, statsRes] = await Promise.all([
          fetch("/api/properties"),
          fetch("/api/admin/stats"),
        ]);
        if (propsRes.ok) {
          const data = await propsRes.json();
          setProperties(data);
          setFiltered(data);
        }
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    if (!q) {
      setFiltered(properties);
    } else {
      setFiltered(
        properties.filter(
          (p) =>
            p.assignedUserEmail?.toLowerCase().includes(q) ||
            p.assignedUserNIC?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, properties]);

  const statCards = stats
    ? [
        {
          label: "Total Properties",
          value: stats.totalProperties,
          icon: Building2,
          color: "text-blue-400",
          bg: "bg-blue-400/10",
          format: (v: number) => v.toString(),
        },
        {
          label: "Total Tax Revenue",
          value: stats.totalTax,
          icon: DollarSign,
          color: "text-emerald-400",
          bg: "bg-emerald-400/10",
          format: (v: number) => `LKR ${v.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`,
        },
        {
          label: "Average Tax",
          value: stats.avgTax,
          icon: BarChart3,
          color: "text-purple-400",
          bg: "bg-purple-400/10",
          format: (v: number) => `LKR ${v.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`,
        },
        {
          label: "Highest Tax",
          value: stats.maxTax,
          icon: TrendingUp,
          color: "text-orange-400",
          bg: "bg-orange-400/10",
          format: (v: number) => `LKR ${v.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`,
        },
      ]
    : [];

  return (
    <ProtectedRoute requireRole="admin">
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">

          {/* Page Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Manage property assessments and tax calculations.
              </p>
            </div>
            <Link href="/admin/properties/new">
              <Button id="new-assessment-btn" className="bg-gradient-primary text-white shadow-glow-sm hover:shadow-glow transition-all">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Assessment
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((s) => (
                <Card key={s.label} className="border-border/50 bg-card/60">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                        <p className="text-lg font-bold leading-tight">{s.format(s.value)}</p>
                      </div>
                      <div className={`h-9 w-9 rounded-lg ${s.bg} grid place-items-center flex-shrink-0`}>
                        <s.icon className={`h-4.5 w-4.5 ${s.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="property-search"
              placeholder="Search by email or NIC..."
              className="pl-9 bg-card/60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Properties Grid */}
          {loading ? (
            <div className="grid place-items-center h-48">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filtered.length === 0 ? (
            <Card className="text-center py-16 border-dashed border-border/70">
              <CardContent>
                <div className="h-16 w-16 rounded-2xl bg-muted/50 grid place-items-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <CardTitle className="mb-2 text-lg">
                  {search ? "No matching properties" : "No properties assessed yet"}
                </CardTitle>
                <CardDescription className="mb-6">
                  {search
                    ? `No results for "${search}". Try a different search.`
                    : 'Click "New Assessment" to add your first property.'}
                </CardDescription>
                {!search && (
                  <Link href="/admin/properties/new">
                    <Button id="empty-new-btn">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create First Assessment
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-3">
                Showing {filtered.length} of {properties.length} properties
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((prop) => (
                  <Link key={prop._id} href={`/property/${prop._id}`}>
                    <Card className="hover:border-primary/40 hover:shadow-glow-sm transition-all duration-300 cursor-pointer h-full group bg-card/60">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm font-semibold truncate">
                              {prop.assignedUserEmail}
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                              NIC: {prop.assignedUserNIC}
                            </CardDescription>
                          </div>
                          <Badge
                            variant="secondary"
                            className="ml-2 text-[10px] capitalize flex-shrink-0"
                          >
                            {prop.attributes?.usage || "residential"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div className="bg-muted/40 rounded-lg p-2.5">
                            <div className="text-xs text-muted-foreground mb-0.5">Area</div>
                            <div className="font-semibold text-sm">
                              {prop.area.toFixed(1)} sqft
                            </div>
                          </div>
                          <div className="bg-primary/5 border border-primary/10 rounded-lg p-2.5">
                            <div className="text-xs text-muted-foreground mb-0.5">Annual Tax</div>
                            <div className="font-bold text-sm text-primary">
                              LKR {prop.taxAmount.toLocaleString("en-LK", { maximumFractionDigits: 0 })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="font-mono truncate">
                            {prop.location.lat.toFixed(4)}, {prop.location.lng.toFixed(4)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1.5">
                          Assessed {new Date(prop.createdAt).toLocaleDateString("en-LK")}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
