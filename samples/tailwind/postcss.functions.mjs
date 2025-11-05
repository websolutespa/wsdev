
/**
 * Converts pixel values to rem units
 * @param {number} unit - The pixel value to convert
 * @returns {string} - The rem value with 3 decimal precision (e.g., "1.000rem")
 */
function rem(unit) {
  return `${(unit / 16).toPrecision(3)}rem`;
}

/**
 * Creates a fluid scaling factor using viewport width
 * This function generates a value between 0 and 1 based on viewport width
 * @param {number} min - Minimum viewport width in pixels
 * @param {number} max - Maximum viewport width in pixels
 * @returns {string} - CSS clamp expression for fluid scaling
 */
function fluid(min, max) {
  return `clamp(0px, calc( (100vw - ${min}px) / (${max} - ${min}) ), 1px)`;
}

/**
 * Creates a responsive value that scales between min and max based on fluid factor
 * This works in conjunction with the --fluid CSS custom property
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {string} - CSS calc expression for responsive scaling
 */
function range(min, max) {
  return `calc(${min} * 1px + var(--fluid) * (${max} - ${min}))`;
}

/**
 * Internal helper function that calculates min/max size values for responsive scaling
 * Uses a scaling factor based on the input number with a cap at 160
 * @param {number} number - The base size value
 * @returns {Array<number>} - Array containing [min, max] values
 */
function size_(number) {
  // Create a scaling factor (0-1) based on the number, capped at 160
  const s = Math.min(number, 160) / 160;
  // Calculate minimum value: reduce the number by half its scaling factor, floor to even number
  const min = Math.floor((number - (number * 0.5 * s)) / 2) * 2;
  const max = number;
  return [min, max];
}

/**
 * Creates a responsive size value that scales fluidly between calculated min/max
 * @param {number} number - The target size value in pixels
 * @returns {string} - CSS calc expression for fluid responsive sizing
 */
function size(number) {
  const [min, max] = size_(number);
  return `calc(${min} * 1px + var(--fluid) * (${max} - ${min}))`;
}

/**
 * Creates a responsive size value multiplied by 4 (useful for larger spacing/sizing)
 * @param {number} number - The base size value
 * @returns {string} - CSS calc expression for 4x fluid responsive sizing
 */
function size4(number) {
  return size(number * 4);
}

/**
 * PostCSS functions export
 * These functions can be used in CSS files as custom functions
 * Usage examples:
 * - font-size: --rem(18); // Converts 18px to rem
 * - width: --size(24); // Creates fluid responsive width
 * - padding: --size4(8); // Creates fluid responsive padding (32px equivalent)
 */
export const functions = {
  '--rem': rem,      // Convert px to rem
  '--fluid': fluid,  // Generate fluid scaling factor
  '--range': range,  // Create responsive range values
  '--size': size,    // Generate fluid responsive sizes
  '--size4': size4,  // Generate 4x fluid responsive sizes
};

/*
// ------------------------------------------------
// Development helper: Log size calculations for values 4-200 (increments of 4)
// This helps developers see how the size_ function calculates min/max pairs
// Comment out or remove in production
new Array(50).fill(0).map((_, i) => {
  return (i + 1) * 4;
}).forEach((i) => {
  console.log(size_(i));
});
*/
