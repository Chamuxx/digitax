"use client";

import { AppHeader } from "@/components/AppHeader";
import { MapPicker } from "@/components/MapPicker";
import { PlanEditor } from "@/components/PlanEditor";
import { useState } from "react";
import { Point } from "@/lib/geometry";

export default function Home() {
  const [points, setPoints] = useState<Point[]>([]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Column - Map */}
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Location Picker</h2>
            <p className="text-sm text-muted-foreground mt-1">Select the property location on the map.</p>
          </div>
          <div className="bg-card border rounded-xl shadow-sm p-4">
            <MapPicker lat={40.7128} lng={-74.0060} height={400} />
          </div>
        </div>

        {/* Right Column - Plan Editor */}
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Property Plan</h2>
            <p className="text-sm text-muted-foreground mt-1">Draw the boundary of the property.</p>
          </div>
          <div className="bg-card border rounded-xl shadow-sm p-4">
            <PlanEditor value={points} onChange={setPoints} height={400} />
          </div>
        </div>
      </main>
    </div>
  );
}
