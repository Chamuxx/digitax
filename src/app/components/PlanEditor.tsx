import { useMemo, useRef, useState } from "react";
import { Point, polygonArea, sideLengths } from "@/lib/geometry";
import { Button } from "@/components/ui/button";
import { Undo2, Trash2, Check } from "lucide-react";

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

  // Compute bounding box for centering / display when readOnly
  const points = value;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (readOnly || closed) return;
    const rect = svgRef.current!.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    // Convert to feet, snap to nearest foot
    const x = Math.round(px / scale);
    const y = Math.round(py / scale);
    onChange?.([...points, { x, y }]);
  };

  const undo = () => onChange?.(points.slice(0, -1));
  const clear = () => { onChange?.([]); setClosed(false); };
  const close = () => { if (points.length >= 3) setClosed(true); };

  const area = useMemo(() => (closed ? polygonArea(points) : 0), [points, closed]);
  const sides = useMemo(() => (closed ? sideLengths(points) : []), [points, closed]);

  // Build the polyline / polygon path string
  const ptsStr = points.map(p => `${p.x * scale},${p.y * scale}`).join(" ");

  // Grid pattern
  const gridSize = scale * 5; // 5 ft

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          {readOnly
            ? `Polygon: ${points.length} points · Area: ${area.toFixed(1)} ft²`
            : closed
              ? `Closed · Area: ${area.toFixed(1)} ft²`
              : "Click to add corners. Each grid square = 5 ft."}
        </div>
        {!readOnly && (
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={undo} disabled={!points.length || closed}>
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={clear}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" onClick={close} disabled={points.length < 3 || closed}>
              <Check className="h-4 w-4 mr-1" /> Close shape
            </Button>
          </div>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden bg-muted/30" style={{ height }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${height}`}
          className="w-full h-full cursor-crosshair"
          onClick={handleClick}
        >
          <defs>
            <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
              <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {points.length > 0 && (
            closed ? (
              <polygon points={ptsStr} fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth="2" />
            ) : (
              <polyline points={ptsStr} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
            )
          )}

          {points.map((p, i) => (
            <circle key={i} cx={p.x * scale} cy={p.y * scale} r="4" fill="hsl(var(--primary))" stroke="white" strokeWidth="1.5" />
          ))}

          {/* Side length labels when closed */}
          {closed && points.map((p, i) => {
            const next = points[(i + 1) % points.length];
            const mx = (p.x + next.x) / 2 * scale;
            const my = (p.y + next.y) / 2 * scale;
            return (
              <text key={`l-${i}`} x={mx} y={my - 4} textAnchor="middle"
                className="fill-foreground" style={{ fontSize: 11, fontWeight: 600, paintOrder: "stroke", stroke: "white", strokeWidth: 3 }}>
                {sides[i].toFixed(1)} ft
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
