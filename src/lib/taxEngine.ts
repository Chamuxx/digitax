export interface TaxAttributes {
  flooring: string;
  floors: number;
  hasPool: boolean;
  hasGarage: boolean;
  gardenSize: string;
  usage: string;
}

const BASE_RATE = 10; // 10 currency units per square foot

export function calculateTax(area: number, attributes: TaxAttributes): number {
  let multiplier = 1.0;

  // Usage multiplier
  if (attributes.usage === "commercial") multiplier *= 1.5;

  // Flooring multiplier
  if (attributes.flooring === "tile") multiplier *= 1.2;
  else if (attributes.flooring === "marble") multiplier *= 1.5;

  // Amenities
  if (attributes.hasPool) multiplier *= 1.2;
  if (attributes.hasGarage) multiplier *= 1.1;

  // Garden size
  if (attributes.gardenSize === "small") multiplier *= 1.05;
  else if (attributes.gardenSize === "medium") multiplier *= 1.1;
  else if (attributes.gardenSize === "large") multiplier *= 1.2;

  // Multiply by number of floors since area is usually just ground footprint
  const totalEffectiveArea = area * (attributes.floors || 1);

  const totalTax = totalEffectiveArea * BASE_RATE * multiplier;

  return Math.round(totalTax * 100) / 100; // Round to 2 decimal places
}
