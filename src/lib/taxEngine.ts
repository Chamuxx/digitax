export interface TaxAttributes {
  flooring: string;
  floors: number;
  hasPool: boolean;
  hasGarage: boolean;
  gardenSize: string;
  usage: string;
  roofingMaterial?: string;
  wallType?: string;
  propertyCondition?: string;
  amenities?: string[];
}

const BASE_RATE = 10; // 10 currency units per square foot

export function calculateTax(area: number, attributes: TaxAttributes, isMultiFloorDrawn: boolean = false): number {
  let multiplier = 1.0;

  // Usage multiplier
  if (attributes.usage === "commercial") multiplier *= 1.5;

  // Flooring multiplier
  if (attributes.flooring === "tile") multiplier *= 1.2;
  else if (attributes.flooring === "marble") multiplier *= 1.5;

  // Amenities
  const am = attributes.amenities || [];
  if (attributes.hasPool || am.includes("swimming_pool")) multiplier *= 1.2; // +20%
  if (attributes.hasGarage || am.includes("garage")) multiplier *= 1.1; // +10%
  if (am.includes("air_conditioning")) multiplier *= 1.15; // +15%
  if (am.includes("solar_panels")) multiplier *= 0.9; // -10% (Eco Discount)
  if (am.includes("security_system")) multiplier *= 1.05; // +5%
  if (am.includes("backup_generator")) multiplier *= 1.1; // +10%
  if (am.includes("overhead_water_tank")) multiplier *= 1.05; // +5%

  // Garden size
  if (attributes.gardenSize === "small") multiplier *= 1.05;
  else if (attributes.gardenSize === "medium") multiplier *= 1.1;
  else if (attributes.gardenSize === "large") multiplier *= 1.2;

  // Multiply by number of floors since area is usually just ground footprint
  // UNLESS `isMultiFloorDrawn` is true, in which case `area` is already the exact sum of all drawn floors.
  const totalEffectiveArea = isMultiFloorDrawn ? area : area * (attributes.floors || 1);

  const totalTax = totalEffectiveArea * BASE_RATE * multiplier;

  return Math.round(totalTax * 100) / 100; // Round to 2 decimal places
}
