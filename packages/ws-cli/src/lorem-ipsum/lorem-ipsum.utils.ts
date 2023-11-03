// Get random integers from a range
export function randomFromRange(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min));
}

// Get random integers from a range great equal or greater than 1
export function randomPositiveFromRange(min: number, max: number): number {
  return Math.max(1, randomFromRange(min, max));
}

// Get standard deviation amount by using percentage
export function getStandardDeviation(value: number, percentage: number): number {
  return Math.ceil(value * percentage);
}

// Try to parse a value and return default value if it could not parsed as number
export function parseIntWithDefault(value: string, defaultValue: number = 8): number {
  let finalValue = parseInt(value, 10);
  if (Number.isNaN(finalValue)) {
    finalValue = defaultValue;
  }
  return finalValue;
}
