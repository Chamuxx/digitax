"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PlusCircle, MapPin } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useUser } from "@clerk/nextjs";

export default function AdminDashboard() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch("/api/properties");
        if (res.ok) {
          const data = await res.json();
          setProperties(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage and assess property taxes.</p>
          </div>
          <Link href="/admin/properties/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Assessment
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid place-items-center h-48">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : properties.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <CardTitle className="mb-2">No properties assessed yet</CardTitle>
              <CardDescription>Click "New Assessment" to add your first property.</CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <Link key={prop._id} href={`/property/${prop._id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Property Details</CardTitle>
                    <CardDescription className="truncate">
                      User: {prop.assignedUserEmail} | NIC: {prop.assignedUserNIC}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Area</div>
                        <div className="font-medium">{prop.area.toFixed(1)} sqft</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Tax Assessed</div>
                        <div className="font-medium text-primary">LKR {prop.taxAmount.toFixed(2)}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-muted-foreground">Location</div>
                        <div className="font-mono text-xs mt-1 bg-muted p-1.5 rounded truncate">
                          {prop.location.lat.toFixed(5)}, {prop.location.lng.toFixed(5)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
