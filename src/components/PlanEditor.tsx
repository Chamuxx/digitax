"use client";

import { useMemo, useRef, useState } from "react";
import { Point, polygonArea, sideLengths } from "@/lib/geometry";
import { Button } from "@/components/ui/button";
import { Undo2, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: Point[];
  onChange?: (pts: Point[]) => void;
  readOnly?: boolean;
  /** scale: pixels per foot (display only) */
  scale?: number;
  height?: number;
}

const SVG_W = 600;

export function PlanEditor({ value, onChange, readOnly = false, scale = 6, height = 360 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [closed, setClosed] = useState(value.length >= 3);
  const [mousePos, setMousePos] = useState<Point | null>(null);

  const points = value;

  const getSnappedPoint = (e: React.MouseEvent<SVGSVGElement> | React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    return {
      x: Math.round(px / scale),
      y: Math.round(py / scale)
    };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (readOnly || closed) {
      setMousePos(null);
      return;
    }
    setMousePos(getSnappedPoint(e));
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  const isHoveringStart = useMemo(() => {
    if (!mousePos || points.length < 3) return false;
    return mousePos.x === points[0].x && mousePos.y === points[0].y;
  }, [mousePos, points]);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (readOnly || closed) return;
    
    const p = getSnappedPoint(e);
    
    // Check if clicking start point to close
    if (points.length >= 3 && p.x === points[0].x && p.y === points[0].y) {
      setClosed(true);
      setMousePos(null);
      return;
    }
    
    onChange?.([...points, p]);
  };

  const undo = () => {
    onChange?.(points.slice(0, -1));
  };
  const clear = () => { 
    onChange?.([]); 
    setClosed(false); 
    setMousePos(null);
  };
  const close = () => { 
    if (points.length >= 3) {
      setClosed(true); 
      setMousePos(null);
    }
  };

  const area = useMemo(() => (closed ? polygonArea(points) : 0), [points, closed]);
  const sides = useMemo(() => (closed ? sideLengths(points) : []), [points, closed]);

  const ptsStr = points.map(p => `${p.x * scale},${p.y * scale}`).join(" ");
  const gridSize = scale * 5; // 5 ft

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          {readOnly
            ? `Polygon: ${points.length} points · Area: ${area.toFixed(1)} ft²`
            : closed
              ? `Closed · Area: ${area.toFixed(1)} ft²`
              : points.length === 0 
                ? "Click to start drawing. Each grid square = 5 ft."
                : points.length < 3 
                  ? "Click to add corners."
                  : "Click start point or 'Close shape' to finish."}
        </div>
        {!readOnly && (
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={undo} disabled={!points.length || closed}>
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={clear} disabled={!points.length}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" onClick={close} disabled={points.length < 3 || closed}>
              <Check className="h-4 w-4 mr-1" /> Close shape
            </Button>
          </div>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden bg-muted/30 relative" style={{ height }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${height}`}
          className={cn("w-full h-full", !readOnly && !closed ? "cursor-crosshair" : "cursor-default")}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
              <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {points.length > 0 && (
            closed ? (
              <polygon 
                points={ptsStr} 
                fill="hsl(var(--primary) / 0.15)" 
                stroke="hsl(var(--primary))" 
                strokeWidth="2" 
                className="transition-all duration-300"
              />
            ) : (
              <polyline 
                points={ptsStr} 
                fill="none" 
                stroke="hsl(var(--primary))" 
                strokeWidth="2" 
              />
            )
          )}

          {/* Preview line from last point to mouse cursor */}
          {!closed && points.length > 0 && mousePos && (
             <line 
                x1={points[points.length - 1].x * scale} 
                y1={points[points.length - 1].y * scale}
                x2={mousePos.x * scale}
                y2={mousePos.y * scale}
                stroke={isHoveringStart ? "hsl(var(--emerald-500, 150 80% 40%))" : "hsl(var(--primary) / 0.5)"}
                strokeWidth="2"
                strokeDasharray="4 4"
             />
          )}
          
          {/* If hovering start and polygon can be closed, fill the tentative polygon lightly */}
          {!closed && points.length >= 2 && mousePos && isHoveringStart && (
             <polygon 
                points={`${ptsStr} ${mousePos.x * scale},${mousePos.y * scale}`} 
                fill="hsl(var(--primary) / 0.05)" 
                className="pointer-events-none transition-all duration-300"
             />
          )}

          {/* Render confirmed points */}
          {points.map((p, i) => {
            const isStart = i === 0;
            const isClosing = isStart && isHoveringStart;
            return (
              <circle 
                key={i} 
                cx={p.x * scale} 
                cy={p.y * scale} 
                r={isClosing ? "6" : "4"} 
                fill={isClosing ? "hsl(var(--emerald-500, 150 80% 40%))" : "hsl(var(--primary))"} 
                stroke="white" 
                strokeWidth="1.5"
                className="transition-all duration-200"
              />
            );
          })}

          {/* Preview circle at current mouse position */}
          {!closed && mousePos && !isHoveringStart && (
             <circle 
                cx={mousePos.x * scale} 
                cy={mousePos.y * scale} 
                r="4" 
                fill="hsl(var(--primary) / 0.5)" 
                stroke="white" 
                strokeWidth="1.5" 
                className="pointer-events-none"
             />
          )}

          {/* Side length labels when closed */}
          {closed && points.map((p, i) => {
            const next = points[(i + 1) % points.length];
            const mx = (p.x + next.x) / 2 * scale;
            const my = (p.y + next.y) / 2 * scale;
            return (
              <text key={`l-${i}`} x={mx} y={my - 4} textAnchor="middle"
                className="fill-foreground transition-all duration-300" style={{ fontSize: 11, fontWeight: 600, paintOrder: "stroke", stroke: "hsl(var(--background))", strokeWidth: 3 }}>
                {sides[i].toFixed(1)} ft
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

