"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Home, MapPin } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useUser } from "@clerk/nextjs";

export default function UserDashboard() {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
          <p className="text-muted-foreground mt-1">View your assessed properties and tax details.</p>
        </div>

        {loading ? (
          <div className="grid place-items-center h-48">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : properties.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Home className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <CardTitle className="mb-2">No properties found</CardTitle>
              <CardDescription>We couldn't find any properties assessed under your email address.</CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <Link key={prop._id} href={`/property/${prop._id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Assessed Property
                    </CardTitle>
                    <CardDescription className="truncate">
                      NIC: {prop.assignedUserNIC}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4 pb-4 border-b">
                      <div>
                        <div className="text-muted-foreground">Area</div>
                        <div className="font-medium">{prop.area.toFixed(1)} sqft</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Annual Tax</div>
                        <div className="font-medium text-primary text-lg">LKR {prop.taxAmount.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      Assessed on {new Date(prop.createdAt).toLocaleDateString()}
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
