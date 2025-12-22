const colorRange = [
  [214, 73, 73], // red
  [240, 199, 74], // yellow
  [46, 175, 67], // green
] as const;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const getColor = (
  value: number,
  min: number = 0,
  max: number = 1
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
  const mid = min + (max - min) / 2;

  let c0: readonly number[];
  let c1: readonly number[];
  let t: number;

  if (v <= mid) {
    // red -> yellow
    c0 = colorRange[0];
    c1 = colorRange[1];
    t = (v - min) / (mid - min || 1); // avoid 0 div if weird bounds
  } else {
    // yellow -> green
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
