"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { MapPicker } from "@/components/MapPicker";
import { PlanEditor } from "@/components/PlanEditor";
import { Point, polygonArea } from "@/lib/geometry";
import { calculateTax } from "@/lib/taxEngine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner"; // Using sonner as it was installed earlier

export default function NewProperty() {
  const router = useRouter();
  
  // Location
  const [lat, setLat] = useState(6.9271);
  const [lng, setLng] = useState(79.8612);

  // Geometry
  const [points, setPoints] = useState<Point[]>([]);
  const area = useMemo(() => {
    return points.length >= 3 ? polygonArea(points) : 0;
  }, [points]);

  // Attributes
  const [flooring, setFlooring] = useState("cement");
  const [floors, setFloors] = useState(1);
  const [hasPool, setHasPool] = useState(false);
  const [hasGarage, setHasGarage] = useState(false);
  const [gardenSize, setGardenSize] = useState("none");
  const [usage, setUsage] = useState("residential");
  
  // Assignment
  const [email, setEmail] = useState("");
  const [nic, setNic] = useState("");

  const [saving, setSaving] = useState(false);

  // Live tax calc
  const taxAmount = useMemo(() => {
    return calculateTax(area, {
      flooring, floors, hasPool, hasGarage, gardenSize, usage
    });
  }, [area, flooring, floors, hasPool, hasGarage, gardenSize, usage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (points.length < 3) {
      toast.error("Please draw a closed house plan on the editor.");
      return;
    }
    if (!email || !nic) {
      toast.error("Please provide both User Email and NIC.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: { lat, lng },
          area,
          geometry: points,
          attributes: { flooring, floors, hasPool, hasGarage, gardenSize, usage },
          taxAmount,
          assignedUserEmail: email,
          assignedUserNIC: nic,
        })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      toast.success("Property assessed successfully!");
      router.push("/admin");
    } catch (err: any) {
      toast.error(err.message || "Failed to save property");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <AppHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">New Tax Assessment</h1>
          <p className="text-muted-foreground mt-1">Map the property, set attributes, and assign to a user.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          <div className="xl:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Location Mapping</CardTitle>
              </CardHeader>
              <CardContent>
                <MapPicker lat={lat} lng={lng} onChange={(l, g) => { setLat(l); setLng(g); }} height={350} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. House Footprint</CardTitle>
              </CardHeader>
              <CardContent>
                <PlanEditor value={points} onChange={setPoints} height={350} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>3. Property Attributes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Usage Type</Label>
                  <Select value={usage} onValueChange={setUsage}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Flooring Type</Label>
                  <Select value={flooring} onValueChange={setFlooring}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cement">Cement</SelectItem>
                      <SelectItem value="tile">Tile</SelectItem>
                      <SelectItem value="marble">Marble</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Number of Floors</Label>
                  <Input type="number" min={1} value={floors} onChange={e => setFloors(Number(e.target.value))} />
                </div>

                <div className="space-y-2">
                  <Label>Garden Size</Label>
                  <Select value={gardenSize} onValueChange={setGardenSize}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="pool" checked={hasPool} onCheckedChange={(c) => setHasPool(!!c)} />
                  <Label htmlFor="pool">Has Swimming Pool</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="garage" checked={hasGarage} onCheckedChange={(c) => setHasGarage(!!c)} />
                  <Label htmlFor="garage">Has Garage</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. User Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Owner's Email Address</Label>
                  <Input type="email" required placeholder="user@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Owner's NIC</Label>
                  <Input required placeholder="e.g. 199012345678" value={nic} onChange={e => setNic(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Calculation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-muted-foreground">Base Area</span>
                  <span className="font-medium">{area.toFixed(1)} sqft</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-muted-foreground">Effective Area (x{floors})</span>
                  <span className="font-medium">{(area * floors).toFixed(1)} sqft</span>
                </div>
                <div className="pt-4 border-t flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Tax</span>
                  <span className="text-2xl font-bold text-primary">LKR {taxAmount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full" disabled={saving || area === 0}>
              {saving ? "Saving..." : "Finalize Assessment"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
