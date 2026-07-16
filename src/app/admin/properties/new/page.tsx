"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  MapPin,
  PenTool,
  Settings,
  UserPlus,
  Calculator,
  ChevronLeft,
  Info,
  CheckCircle2,
  User,
  Phone,
} from "lucide-react";
import Link from "next/link";

export default function NewProperty() {
  const router = useRouter();

  // Location (default: Kurunegala, Sri Lanka)
  const [lat, setLat] = useState(7.4818);
  const [lng, setLng] = useState(80.3609);

  // Geometry
  const [floorPoints, setFloorPoints] = useState<Point[][]>([[]]);
  const area = useMemo(
    () => floorPoints.reduce((acc, pts) => acc + (pts.length >= 3 ? polygonArea(pts) : 0), 0),
    [floorPoints]
  );

  // Attributes
  const [flooring, setFlooring] = useState("cement");
  const [floors, setFloors] = useState(1);
  const [hasPool, setHasPool] = useState(false);
  const [hasGarage, setHasGarage] = useState(false);
  const [gardenSize, setGardenSize] = useState("none");
  const [usage, setUsage] = useState("residential");
  const [yearBuilt, setYearBuilt] = useState<number | "">(
    new Date().getFullYear()
  );

  useEffect(() => {
    setFloorPoints((prev) => {
      if (prev.length === floors) return prev;
      if (prev.length < floors) {
        return [...prev, ...Array.from({ length: floors - prev.length }, () => [])];
      }
      return prev.slice(0, floors);
    });
  }, [floors]);

  // Assignment
  const [email, setEmail] = useState("");
  const [nic, setNic] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [declaredPropertyId, setDeclaredPropertyId] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [saving, setSaving] = useState(false);

  // NIC Search
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (nic.length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/admin/declared-properties/search?nic=${encodeURIComponent(nic)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setShowDropdown(data.length > 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [nic]);

  const handleSelectUser = (property: any) => {
    setNic(property.userNIC);
    setFirstName(property.fullName);
    setLastName(""); // the full name is just stored in firstName here for display
    setAddress(property.address);
    setPhone(property.phone);
    setDeclaredPropertyId(property._id);
    setEmail("assigned-via-nic@digitax.local"); // fallback since we don't have email in declared prop right now, though it's linked by NIC anyway.
    setShowDropdown(false);
  };

  // Live tax calc
  const taxAmount = useMemo(
    () =>
      calculateTax(area, {
        flooring,
        floors,
        hasPool,
        hasGarage,
        gardenSize,
        usage,
      }, true), // isMultiFloorDrawn = true
    [area, flooring, floors, hasPool, hasGarage, gardenSize, usage]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (floorPoints.some((pts) => pts.length < 3)) {
      toast.error("Please ensure all requested floors have a closed footprint with at least 3 points.");
      return;
    }
    if (!email || !nic) {
      toast.error("Please search and select a registered owner by NIC.");
      return;
    }

    setSaving(true);
    try {
      // Save the property
      const propRes = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: { lat, lng },
          area,
          geometry: floorPoints[0], // ground floor
          floorGeometries: floorPoints, // all floors
          attributes: {
            flooring,
            floors,
            hasPool,
            hasGarage,
            gardenSize,
            usage,
            yearBuilt: yearBuilt || undefined,
          },
          taxAmount,
          assignedUserEmail: email,
          assignedUserNIC: nic,
          declaredPropertyId,
        }),
      });

      if (!propRes.ok) {
        throw new Error(await propRes.text());
      }

      toast.success("Property assessed and assigned successfully!");
      router.push("/admin");
    } catch (err: any) {
      toast.error(err.message || "Failed to save property");
    } finally {
      setSaving(false);
    }
  };

  const stepSections = [
    { icon: MapPin, label: "Location", done: true },
    { icon: PenTool, label: "Footprint", done: area > 0 },
    { icon: Settings, label: "Attributes", done: true },
    { icon: UserPlus, label: "Assignment", done: !!(email && nic) },
  ];

  return (
    <ProtectedRoute requireRole="admin">
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">
              New Tax Assessment
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Map the property, define the footprint, set attributes, and assign to the owner.
            </p>
          </div>

          {/* Progress steps */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-1">
            {stepSections.map((s, i) => (
              <div
                key={s.label}
                className="flex items-center gap-2 px-3 py-2 rounded-full border bg-card/60 text-xs font-medium whitespace-nowrap flex-shrink-0"
              >
                <s.icon className="h-3.5 w-3.5 text-primary" />
                <span>{s.label}</span>
                {s.done && i > 0 && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left column: Map + Plan */}
            <div className="xl:col-span-2 space-y-6">
              {/* Step 1: Location */}
              <Card className="border-border/50 bg-card/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-blue-400/10 grid place-items-center">
                      <MapPin className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">1. Location Mapping</CardTitle>
                      <CardDescription className="text-xs">
                        Click on the map or drag the marker to pin the property.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <MapPicker
                    lat={lat}
                    lng={lng}
                    onChange={(l, g) => {
                      setLat(l);
                      setLng(g);
                    }}
                    height={380}
                  />
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Info className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>
                      Coordinates:{" "}
                      <span className="font-mono">
                        {lat.toFixed(5)}, {lng.toFixed(5)}
                      </span>
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: House Footprint */}
              <Card className="border-border/50 bg-card/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-purple-400/10 grid place-items-center">
                      <PenTool className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">2. House Footprint</CardTitle>
                      <CardDescription className="text-xs">
                        Click to add corners, close the shape to calculate area.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {floorPoints.map((pts, idx) => {
                    const isGround = idx === 0;
                    // Upper floors are locked until the floor immediately below is closed (length >= 3)
                    const prevFloorComplete = isGround || floorPoints[idx - 1].length >= 3;
                    const isReadOnly = !prevFloorComplete;

                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-primary">
                            {isGround ? "Ground Floor" : `Floor ${idx + 1}`}
                          </h4>
                          {!isGround && !prevFloorComplete && (
                            <span className="text-xs text-orange-500 font-medium">
                              Complete Floor {idx} first
                            </span>
                          )}
                        </div>
                        <PlanEditor
                          value={pts}
                          onChange={(newPts) => {
                            setFloorPoints((prev) => {
                              const newFloorPoints = [...prev];
                              newFloorPoints[idx] = newPts;
                              return newFloorPoints;
                            });
                          }}
                          readOnly={isReadOnly}
                          referencePolygon={!isGround ? floorPoints[0] : undefined}
                          height={isGround ? 360 : 300}
                        />
                      </div>
                    );
                  })}
                  {area > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-muted-foreground">
                        Footprint area:{" "}
                        <span className="font-semibold text-foreground">
                          {area.toFixed(2)} ft²
                        </span>
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column: Attributes + Assignment + Summary */}
            <div className="space-y-5">
              {/* Step 3: Attributes */}
              <Card className="border-border/50 bg-card/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-orange-400/10 grid place-items-center">
                      <Settings className="h-4 w-4 text-orange-400" />
                    </div>
                    <CardTitle className="text-base">3. Property Attributes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Usage Type</Label>
                      <Select value={usage} onValueChange={setUsage}>
                        <SelectTrigger id="usage-select" className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Flooring</Label>
                      <Select value={flooring} onValueChange={setFlooring}>
                        <SelectTrigger id="flooring-select" className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cement">Cement</SelectItem>
                          <SelectItem value="tile">Tile</SelectItem>
                          <SelectItem value="marble">Marble</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Number of Floors</Label>
                      <Input
                        id="floors-input"
                        type="number"
                        min={1}
                        max={20}
                        className="h-9 text-sm"
                        value={floors}
                        onChange={(e) => setFloors(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Year Built</Label>
                      <Input
                        id="year-built-input"
                        type="number"
                        min={1900}
                        max={new Date().getFullYear()}
                        className="h-9 text-sm"
                        value={yearBuilt}
                        onChange={(e) =>
                          setYearBuilt(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Garden Size</Label>
                    <Select value={gardenSize} onValueChange={setGardenSize}>
                      <SelectTrigger id="garden-select" className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 pt-1">
                    <Label className="text-xs text-muted-foreground">Amenities</Label>
                    <div className="flex items-center space-x-2 p-2.5 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                      <Checkbox
                        id="pool"
                        checked={hasPool}
                        onCheckedChange={(c) => setHasPool(!!c)}
                      />
                      <Label htmlFor="pool" className="text-sm cursor-pointer flex-1">
                        Swimming Pool
                      </Label>
                      {hasPool && (
                        <Badge variant="secondary" className="text-[10px]">+20%</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 p-2.5 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                      <Checkbox
                        id="garage"
                        checked={hasGarage}
                        onCheckedChange={(c) => setHasGarage(!!c)}
                      />
                      <Label htmlFor="garage" className="text-sm cursor-pointer flex-1">
                        Garage
                      </Label>
                      {hasGarage && (
                        <Badge variant="secondary" className="text-[10px]">+10%</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 4: User Assignment */}
              <Card className="border-border/50 bg-card/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-cyan-400/10 grid place-items-center">
                      <UserPlus className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">4. Owner Assignment</CardTitle>
                      <CardDescription className="text-xs">
                        Search and select a registered user by NIC.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5 relative" ref={dropdownRef}>
                    <Label className="text-xs">Search Owner NIC *</Label>
                    <Input
                      id="owner-nic-input"
                      required
                      className="h-9 text-sm"
                      placeholder="e.g. 199012345678"
                      value={nic}
                      onChange={(e) => {
                        setNic(e.target.value);
                        if (declaredPropertyId) {
                          setDeclaredPropertyId("");
                          setAddress("");
                          setPhone("");
                        }
                      }}
                      onFocus={() => {
                        if (searchResults.length > 0) setShowDropdown(true);
                      }}
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-8">
                        <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {showDropdown && searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover text-popover-foreground border rounded-md shadow-md max-h-48 overflow-y-auto">
                        {searchResults.map((p) => (
                          <div
                            key={p._id}
                            className="px-3 py-2.5 text-sm hover:bg-accent cursor-pointer border-b last:border-0 flex flex-col gap-1"
                            onClick={() => handleSelectUser(p)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-primary">{p.address}</span>
                              <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-600 border-orange-200">Pending</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground flex flex-col gap-0.5 mt-0.5">
                              <span className="flex items-center gap-1"><User className="h-3 w-3" /> {p.fullName} (NIC: {p.userNIC})</span>
                              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {p.phone}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {declaredPropertyId && (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3 shadow-inner mt-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-primary/10">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm text-primary">Property Selected</span>
                      </div>
                      <div className="grid gap-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Address</div>
                            <div className="text-sm font-medium">{address}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Owner</div>
                              <div className="text-sm font-medium">{firstName}</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Contact</div>
                              <div className="text-sm font-medium">{phone}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tax Calculation Summary */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 grid place-items-center">
                      <Calculator className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-base">Tax Summary</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {[
                    { label: "Total Drawn Area", value: `${area.toFixed(1)} ft²` },
                    {
                      label: "Base Rate",
                      value: "LKR 10 / ft²",
                    },
                    {
                      label: "Usage",
                      value:
                        usage === "commercial"
                          ? "Commercial (×1.5)"
                          : "Residential (×1.0)",
                    },
                    {
                      label: "Flooring",
                      value:
                        flooring === "marble"
                          ? "Marble (×1.5)"
                          : flooring === "tile"
                          ? "Tile (×1.2)"
                          : "Cement (×1.0)",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between items-center text-xs"
                    >
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-medium">{row.value}</span>
                    </div>
                  ))}
                  <div className="border-t border-primary/20 pt-3 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Annual Tax</span>
                      <span className="text-xl font-black text-primary">
                        LKR{" "}
                        {taxAmount.toLocaleString("en-LK", {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <Button
                type="submit"
                id="finalize-assessment-btn"
                size="lg"
                className="w-full bg-gradient-primary text-white shadow-glow-sm hover:shadow-glow transition-all font-semibold"
                disabled={saving || area === 0}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving Assessment...
                  </span>
                ) : (
                  "Finalize Assessment"
                )}
              </Button>

              {area === 0 && (
                <p className="text-xs text-muted-foreground text-center -mt-2">
                  Draw a closed house plan to enable saving.
                </p>
              )}
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}
