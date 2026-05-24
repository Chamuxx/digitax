"use client";

import { useMemo, useRef, useState } from "react";
import { Point, polygonArea, sideLengths } from "@/lib/geometry";
import { Button } from "@/components/ui/button";
import { Undo2, Trash2, Check, Maximize, Minimize } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: Point[];
  onChange?: (pts: Point[]) => void;
  readOnly?: boolean;
  referencePolygon?: Point[];
  /** scale: pixels per foot (display only) */
  scale?: number;
  height?: number;
}

const SVG_W = 600;

export function PlanEditor({ value, onChange, readOnly = false, referencePolygon, scale = 6, height = 360 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [closed, setClosed] = useState(value.length >= 3);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const points = value;

  const getSnappedPoint = (e: React.MouseEvent<SVGSVGElement> | React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current!;
    let pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    
    const ctm = svg.getScreenCTM();
    if (ctm) {
      pt = pt.matrixTransform(ctm.inverse());
    }
    
    return {
      x: Math.round(pt.x / scale),
      y: Math.round(pt.y / scale)
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

  const rightAngleData = useMemo(() => {
    if (points.length < 2 || !mousePos || closed) return null;
    const p1 = points[points.length - 2];
    const p2 = points[points.length - 1];
    
    // v1 is vector from p2 to p1
    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
    // v2 is vector from p2 to mousePos
    const v2 = { x: mousePos.x - p2.x, y: mousePos.y - p2.y };
    
    if ((v1.x === 0 && v1.y === 0) || (v2.x === 0 && v2.y === 0)) return null;
    
    const dot = v1.x * v2.x + v1.y * v2.y;
    // Right angle if dot product is 0
    if (dot === 0) {
      const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
      const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
      // Normalized vectors
      const nv1 = { x: v1.x / len1, y: v1.y / len1 };
      const nv2 = { x: v2.x / len2, y: v2.y / len2 };
      
      const size = 0.8; // size of the corner square in grid units
      // We only draw it if the lines are long enough to fit the square
      if (len1 < size || len2 < size) return null;
      
      const ptA = { x: p2.x + nv1.x * size, y: p2.y + nv1.y * size };
      const ptB = { x: ptA.x + nv2.x * size, y: ptA.y + nv2.y * size };
      const ptC = { x: p2.x + nv2.x * size, y: p2.y + nv2.y * size };
      
      return { ptA, ptB, ptC };
    }
    return null;
  }, [points, mousePos, closed]);

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
  const refPtsStr = referencePolygon?.map(p => `${p.x * scale},${p.y * scale}`).join(" ");
  const gridSize = scale; // 1 ft

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  return (
    <div className={cn("space-y-3", isFullscreen ? "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-6 flex flex-col" : "")}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          {readOnly
            ? `Polygon: ${points.length} points · Area: ${area.toFixed(1)} ft²`
            : closed
              ? `Closed · Area: ${area.toFixed(1)} ft²`
              : points.length === 0 
                ? "Click to start drawing. Each grid square = 1 ft."
                : points.length < 3 
                  ? "Click to add corners."
                  : "Click start point or 'Close shape' to finish."}
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          {!readOnly && (
            <>
              <Button type="button" size="sm" variant="outline" onClick={undo} disabled={!points.length || closed}>
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={clear} disabled={!points.length}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button type="button" size="sm" onClick={close} disabled={points.length < 3 || closed}>
                <Check className="h-4 w-4 mr-1" /> Close shape
              </Button>
            </>
          )}
        </div>
      </div>

      <div className={cn("border rounded-lg overflow-hidden bg-muted/30 relative", isFullscreen ? "flex-1" : "")} style={!isFullscreen ? { height } : undefined}>
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

          {/* Reference polygon (e.g. ground floor) */}
          {referencePolygon && referencePolygon.length > 0 && (
            <polygon 
              points={refPtsStr} 
              fill="none" 
              stroke="hsl(var(--muted-foreground) / 0.4)" 
              strokeWidth="1.5" 
              strokeDasharray="4 4"
              className="pointer-events-none"
            />
          )}

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
             <g>
               <line 
                  x1={points[points.length - 1].x * scale} 
                  y1={points[points.length - 1].y * scale}
                  x2={mousePos.x * scale}
                  y2={mousePos.y * scale}
                  stroke={isHoveringStart ? "hsl(var(--emerald-500, 150 80% 40%))" : rightAngleData ? "hsl(var(--orange-500, 24.6 95% 53.1%))" : "hsl(var(--primary) / 0.5)"}
                  strokeWidth="2"
                  strokeDasharray={rightAngleData ? "none" : "4 4"}
               />
               {!isHoveringStart && (
                 <text 
                   x={((points[points.length - 1].x + mousePos.x) / 2) * scale} 
                   y={(((points[points.length - 1].y + mousePos.y) / 2) * scale) - 8} 
                   textAnchor="middle"
                   className="fill-primary transition-all duration-100" 
                   style={{ fontSize: 12, fontWeight: 700, paintOrder: "stroke", stroke: "hsl(var(--background))", strokeWidth: 3 }}
                 >
                   {Math.sqrt(Math.pow(mousePos.x - points[points.length - 1].x, 2) + Math.pow(mousePos.y - points[points.length - 1].y, 2)).toFixed(1)} ft
                 </text>
               )}
               {rightAngleData && (
                 <polyline 
                   points={`${rightAngleData.ptA.x * scale},${rightAngleData.ptA.y * scale} ${rightAngleData.ptB.x * scale},${rightAngleData.ptB.y * scale} ${rightAngleData.ptC.x * scale},${rightAngleData.ptC.y * scale}`}
                   fill="none"
                   stroke="hsl(var(--orange-500, 24.6 95% 53.1%))"
                   strokeWidth="2"
                   strokeLinecap="round"
                   strokeLinejoin="round"
                 />
               )}
             </g>
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

