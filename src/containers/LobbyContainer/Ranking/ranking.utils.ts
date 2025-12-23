type Color = [number, number, number];
type ColorRange = [Color, Color, Color];

const COLOR_RANGE_PERCENTAGE: ColorRange = [
  [214, 73, 73], // red
  [240, 199, 74], // yellow
  [46, 175, 67], // green
];

export const MCR_COLOR_RANGE: ColorRange = [
  [500, 0, 0], // red
  [60, 60, 60], // gray
  [0, 500, 0], // green
];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const getColor = (
  value: number,
  min: number = 0,
  max: number = 1,
  mid: number = min + (max - min) / 2,
  colorRange: ColorRange = COLOR_RANGE_PERCENTAGE
): string => {
  if (
    !Number.isFinite(value) ||
    !Number.isFinite(min) ||
    !Number.isFinite(max)
  ) {
    return `rgb(${colorRange[0].join(", ")})`;
  }
  if (max === min) {
    return `rgb(${colorRange[1].join(", ")})`;
  }

  // Clamp value to [min, max]
  const v = Math.min(max, Math.max(min, value));

  let c0: readonly number[];
  let c1: readonly number[];
  let t: number;

  if (v <= mid) {
    // color 1 -> color 2
    c0 = colorRange[0];
    c1 = colorRange[1];
    t = (v - min) / (mid - min || 1); // avoid 0 div if weird bounds
  } else {
    // color 2 -> color 1
    c0 = colorRange[1];
    c1 = colorRange[2];
    t = (v - mid) / (max - mid || 1);
  }

  t = clamp01(t);

  const r = Math.round(lerp(c0[0], c1[0], t));
  const g = Math.round(lerp(c0[1], c1[1], t));
  const b = Math.round(lerp(c0[2], c1[2], t));

  return `rgb(${r}, ${g}, ${b})`;
};
