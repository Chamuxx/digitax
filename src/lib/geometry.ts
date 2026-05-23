export interface Point {
  x: number;
  y: number;
}

export function polygonArea(points: Point[]): number {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
}

export function sideLengths(points: Point[]): number[] {
  if (points.length < 2) return [];
  const lengths: number[] = [];
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const dx = points[i].x - points[j].x;
    const dy = points[i].y - points[j].y;
    lengths.push(Math.sqrt(dx * dx + dy * dy));
  }
  return lengths;
}
