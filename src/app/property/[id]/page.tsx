"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { MapPicker } from "@/components/MapPicker";
import { PlanEditor } from "@/components/PlanEditor";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Printer,
  ChevronLeft,
  MapPin,
  Home,
  Calendar,
  Layers,
  Waves,
  Car,
  Flower2,
  Building2,
  Trash2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

interface PropertyData {
  _id: string;
  location: { lat: number; lng: number };
  area: number;
  geometry: { x: number; y: number }[];
  floorGeometries?: { x: number; y: number }[][];
  attributes: {
    flooring: string;
    floors: number;
    hasPool: boolean;
    hasGarage: boolean;
    gardenSize: string;
    usage: string;
    yearBuilt?: number;
  };
  taxAmount: number;
  assignedUserEmail: string;
  assignedUserNIC: string;
  createdAt: string;
}

export default function PropertyDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = user?.publicMetadata?.role === "admin";
  const backLink = isAdmin ? "/admin" : "/dashboard";

  useEffect(() => {
    async function fetchProperty() {
      try {
        const res = await fetch(`/api/properties/${id}`);
        if (res.ok) {
          setProperty(await res.json());
        } else {
          router.push(backLink);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProperty();
  }, [id, router, backLink]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this property assessment? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Property assessment deleted.");
        router.push("/admin");
      } else {
        const data = await res.json();
        throw new Error(data.error);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <div className="flex-1 grid place-items-center">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin h-10 w-10 border-2 border-primary border-t-transparent rounded-full" />
            <p className="text-sm text-muted-foreground">Loading assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const amenities = [
    property.attributes.hasPool && {
      icon: Waves,
      label: "Swimming Pool",
      color: "text-blue-400",
    },
    property.attributes.hasGarage && {
      icon: Car,
      label: "Garage",
      color: "text-orange-400",
    },
    property.attributes.gardenSize !== "none" && {
      icon: Flower2,
      label: `Garden (${property.attributes.gardenSize})`,
      color: "text-emerald-400",
    },
  ].filter(Boolean) as { icon: any; label: string; color: string }[];

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {/* Page header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(backLink)}
              className="mb-2 -ml-2 no-print"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {isAdmin ? "Back to Dashboard" : "Back to My Properties"}
            </Button>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              Property Tax Assessment
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Assessed on{" "}
              {new Date(property.createdAt).toLocaleDateString("en-LK", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 no-print">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              id="print-report-btn"
            >
              <Printer className="mr-1.5 h-4 w-4" />
              Print Report
            </Button>
            {isAdmin && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                id="delete-property-btn"
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            )}
          </div>
        </div>

        {/* Tax highlight banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-hero border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print-full">
          <div>
            <p className="text-white/60 text-sm">Annual Assessed Tax</p>
            <p className="text-3xl font-black text-gradient">
              LKR{" "}
              {property.taxAmount.toLocaleString("en-LK", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="flex gap-3">
            <Badge
              variant="outline"
              className="border-primary/30 text-primary text-xs capitalize"
            >
              {property.attributes.usage}
            </Badge>
            <Badge
              variant="outline"
              className="border-primary/30 text-primary text-xs"
            >
              {property.attributes.floors} Floor{property.attributes.floors > 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Map + Plan */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="border-border/50 bg-card/60 print-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  Property Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MapPicker
                  lat={property.location.lat}
                  lng={property.location.lng}
                  readOnly
                  height={320}
                />
                <div className="mt-2 text-xs text-muted-foreground font-mono">
                  {property.location.lat.toFixed(6)},{" "}
                  {property.location.lng.toFixed(6)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/60 print-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Home className="h-4 w-4 text-purple-400" />
                    House Footprint
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    Total Area: <span className="font-semibold text-foreground">{property.area.toFixed(2)} ft²</span>
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {property.floorGeometries && property.floorGeometries.length > 1 ? (
                  <Tabs defaultValue="floor-0" className="w-full">
                    <TabsList className="mb-4 flex flex-wrap h-auto gap-1 bg-transparent p-0">
                      {property.floorGeometries.map((_, idx) => (
                        <TabsTrigger
                          key={idx}
                          value={`floor-${idx}`}
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
                        >
                          {idx === 0 ? "Ground Floor" : `Floor ${idx + 1}`}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {property.floorGeometries.map((geom, idx) => (
                      <TabsContent key={idx} value={`floor-${idx}`} className="mt-0">
                        <PlanEditor
                          value={geom}
                          readOnly
                          height={320}
                        />
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  <PlanEditor
                    value={property.geometry}
                    readOnly
                    height={320}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Details */}
          <div className="space-y-5">
            {/* Owner info */}
            <Card className="border-border/50 bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                  Owner Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Email", value: property.assignedUserEmail },
                  { label: "NIC", value: property.assignedUserNIC },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="text-xs text-muted-foreground mb-0.5">{row.label}</div>
                    <div className="text-sm font-medium break-all">{row.value}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Building attributes */}
            <Card className="border-border/50 bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                  Building Attributes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      icon: Layers,
                      label: "Flooring",
                      value: property.attributes.flooring,
                      color: "text-amber-400",
                    },
                    {
                      icon: Building2,
                      label: "Floors",
                      value: `${property.attributes.floors}`,
                      color: "text-blue-400",
                    },
                    {
                      icon: Home,
                      label: "Usage",
                      value: property.attributes.usage,
                      color: "text-purple-400",
                    },
                    ...(property.attributes.yearBuilt
                      ? [
                          {
                            icon: Calendar,
                            label: "Year Built",
                            value: `${property.attributes.yearBuilt}`,
                            color: "text-emerald-400",
                          },
                        ]
                      : []),
                  ].map((attr) => (
                    <div
                      key={attr.label}
                      className="bg-muted/30 rounded-xl p-3 border border-border/50"
                    >
                      <attr.icon className={`h-4 w-4 ${attr.color} mb-1.5`} />
                      <div className="text-xs text-muted-foreground">{attr.label}</div>
                      <div className="text-sm font-semibold capitalize mt-0.5">
                        {attr.value}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="border-border/50 bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                  Amenities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {amenities.length > 0 ? (
                  <div className="space-y-2">
                    {amenities.map((a) => (
                      <div
                        key={a.label}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30 border border-border/50"
                      >
                        <a.icon className={`h-4 w-4 ${a.color}`} />
                        <span className="text-sm font-medium">{a.label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No special amenities recorded.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Tax breakdown */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                  Tax Calculation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {[
                  ...(property.floorGeometries && property.floorGeometries.length > 0
                    ? [
                        {
                          label: "Total Drawn Area",
                          value: `${property.area.toFixed(1)} ft²`,
                        },
                      ]
                    : [
                        {
                          label: "Base Area",
                          value: `${property.area.toFixed(1)} ft²`,
                        },
                        {
                          label: `Effective Area (×${property.attributes.floors})`,
                          value: `${(property.area * property.attributes.floors).toFixed(1)} ft²`,
                        },
                      ]),
                  { label: "Base Rate", value: "LKR 10 / ft²" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between items-center text-xs"
                  >
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium">{row.value}</span>
                  </div>
                ))}
                <div className="border-t border-primary/20 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">Annual Tax</span>
                    <span className="text-2xl font-black text-primary">
                      LKR{" "}
                      {property.taxAmount.toLocaleString("en-LK", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
