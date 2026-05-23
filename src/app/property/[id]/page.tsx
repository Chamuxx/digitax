"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { MapPicker } from "@/components/MapPicker";
import { PlanEditor } from "@/components/PlanEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, ChevronLeft } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function PropertyDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperty() {
      try {
        const res = await fetch(`/api/properties/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProperty(data);
        } else {
          router.push("/dashboard");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProperty();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <div className="flex-1 grid place-items-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!property) return null;

  const isAdmin = user?.publicMetadata?.role === "admin";
  const backLink = isAdmin ? "/admin" : "/dashboard";

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <AppHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Button variant="ghost" size="sm" onClick={() => router.push(backLink)} className="mb-2 -ml-3">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Property Tax Details</h1>
            <p className="text-muted-foreground mt-1">Assessed on {new Date(property.createdAt).toLocaleDateString()}</p>
          </div>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print Report
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Location Map</CardTitle>
              </CardHeader>
              <CardContent>
                <MapPicker lat={property.location.lat} lng={property.location.lng} readOnly height={350} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>House Footprint</CardTitle>
              </CardHeader>
              <CardContent>
                <PlanEditor value={property.geometry} readOnly height={350} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Owner Email</span>
                  <span className="font-medium text-right break-all">{property.assignedUserEmail}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Owner NIC</span>
                  <span className="font-medium text-right">{property.assignedUserNIC}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Base Area</span>
                  <span className="font-medium">{property.area.toFixed(1)} sqft</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Usage Type</span>
                  <span className="font-medium capitalize">{property.attributes.usage}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Flooring</span>
                  <span className="font-medium capitalize">{property.attributes.flooring}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Floors</span>
                  <span className="font-medium">{property.attributes.floors}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Garden Size</span>
                  <span className="font-medium capitalize">{property.attributes.gardenSize}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Amenities</span>
                  <span className="font-medium text-right">
                    {property.attributes.hasPool && "Pool"} 
                    {property.attributes.hasPool && property.attributes.hasGarage && ", "}
                    {property.attributes.hasGarage && "Garage"}
                    {!property.attributes.hasPool && !property.attributes.hasGarage && "None"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6 text-center">
                <div className="text-muted-foreground mb-2">Annual Assessed Tax</div>
                <div className="text-4xl font-bold text-primary">LKR {property.taxAmount.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
