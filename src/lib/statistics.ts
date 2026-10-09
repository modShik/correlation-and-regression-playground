export type Point = { id: string; x: number; y: number };
export type Observation = { id: string; x: string; y: string };
export type Axis = {
  origin: number;
  scale: number;
  values: number[];
  mean: number;
  constant: boolean;
};
export type Statistics = {
  n: number;
  meanX: number | null;
  meanY: number | null;
  r: number | null;
  r2: number | null;
  slope: number | null;
  intercept: number | null;
  xAxis: Axis;
  yAxis: Axis;
  normalizedSlope: number | null;
  reason: string | null;
};
const finite = (v: number) => (Number.isFinite(v) ? v : null);
export function sum(values: number[]) {
  let total = 0,
    correction = 0;
  for (const v of values) {
    const y = v - correction;
    const next = total + y;
    correction = next - total - y;
    total = next;
  }
  return total;
}
function axis(values: number[]): Axis {
  if (!values.length)
    return { origin: 0, scale: 1, values: [], mean: 0, constant: true };
  let lo = values[0],
    hi = values[0];
  for (const v of values) {
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }
  const origin = lo === hi ? lo : lo / 2 + hi / 2;
  const scale = Math.max(Math.abs(lo - origin), Math.abs(hi - origin)) || 1;
  const normalized = values.map((v) => (v - origin) / scale);
  return {
    origin,
    scale,
    values: normalized,
    mean: sum(normalized) / values.length,
    constant: lo === hi,
  };
}
export function parseValue(value: string): number | null {
  if (
    !value.trim() ||
    !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim())
  )
    return null;
  const parsed = finite(Number(value));
  if (parsed === 0 && /[1-9]/.test(value.trim().split(/e/i)[0])) return null;
  return parsed;
}
export function validPoints(rows: Observation[]): Point[] {
  return rows.flatMap((row) => {
    const x = parseValue(row.x),
      y = parseValue(row.y);
    return x === null || y === null ? [] : [{ id: row.id, x, y }];
  });
}
export function calculate(points: Point[]): Statistics {
  const n = points.length,
    xAxis = axis(points.map((p) => p.x)),
    yAxis = axis(points.map((p) => p.y));
  const dx = xAxis.values.map((x) => x - xAxis.mean),
    dy = yAxis.values.map((y) => y - yAxis.mean);
  const xx = sum(dx.map((x) => x * x)),
    yy = sum(dy.map((y) => y * y)),
    xy = sum(dx.map((x, i) => x * dy[i]));
  const reconstructMean = (axis: Axis) =>
    Math.abs(axis.origin) < 1e-300 && axis.scale < 1e-300
      ? finite(axis.scale * (axis.origin / axis.scale + axis.mean))
      : finite(axis.origin + axis.scale * axis.mean);
  const meanX = n ? reconstructMean(xAxis) : null;
  const meanY = n ? reconstructMean(yAxis) : null;
  const normalizedSlope = n >= 2 && !xAxis.constant && xx > 0 ? xy / xx : null;
  const r =
    n >= 2 && !xAxis.constant && !yAxis.constant && xx > 0 && yy > 0
      ? Math.max(-1, Math.min(1, xy / Math.sqrt(xx) / Math.sqrt(yy)))
      : null;
  let slope: number | null = null;
  if (normalizedSlope !== null) {
    if (normalizedSlope === 0) slope = 0;
    else {
      const direct = normalizedSlope * (yAxis.scale / xAxis.scale);
      const alternate = (normalizedSlope * yAxis.scale) / xAxis.scale;
      const candidate =
        Number.isFinite(direct) && direct !== 0 ? direct : alternate;
      slope = candidate === 0 ? null : finite(candidate);
    }
  }
  let intercept =
    slope !== null && meanX !== null && meanY !== null
      ? finite(meanY - slope * meanX)
      : null;
  if (
    normalizedSlope !== null &&
    (intercept === null || xAxis.scale < 1e-300 || yAxis.scale < 1e-300)
  ) {
    intercept =
      normalizedSlope === 0
        ? meanY
        : finite(
            yAxis.scale *
              (yAxis.origin / yAxis.scale +
                yAxis.mean -
                normalizedSlope * (xAxis.origin / xAxis.scale + xAxis.mean)),
          );
  }
  const reason =
    n < 2
      ? "Add at least two complete observations to find a relationship."
      : xAxis.constant
        ? "All X values are equal. Pearson’s r is undefined, and a unique regression slope cannot be fitted."
        : yAxis.constant
          ? "All Y values are equal. The regression line is horizontal; r and R² are undefined because Y has no variation."
          : null;
  return {
    n,
    meanX,
    meanY,
    r,
    r2: r === null ? null : r * r,
    slope,
    intercept,
    normalizedSlope,
    xAxis,
    yAxis,
    reason,
  };
}
export function format(value: number | null, digits = 3): string {
  if (value === null || !Number.isFinite(value)) return "—";
  if (Object.is(value, -0) || value === 0) return (0).toFixed(digits);
  if (Math.abs(value) >= 1e6 || Math.abs(value) < Math.pow(10, -digits))
    return value.toExponential(2);
  return value.toFixed(digits);
}
export function interpretation(r: number | null) {
  if (r === null)
    return {
      label: "Relationship undefined",
      description: "A correlation needs variation in both variables.",
      tone: "neutral",
    };
  const magnitude = Math.abs(r),
    direction = r < 0 ? "negative" : "positive";
  const strength =
    magnitude > 1 - 1e-12
      ? "Perfect"
      : magnitude >= 0.7
        ? "Strong"
        : magnitude >= 0.4
          ? "Moderate"
          : "Weak";
  return {
    label:
      magnitude < 0.1
        ? "Little or no linear correlation"
        : `${strength} ${direction} correlation`,
    description:
      magnitude < 0.1
        ? "There is little linear association. A nonlinear pattern may still exist."
        : r < 0
          ? "As X increases, Y tends to decrease."
          : "The variables tend to increase together.",
    tone: r < -0.1 ? "negative" : r > 0.1 ? "positive" : "neutral",
  };
}
export const EXAMPLES: Record<
  string,
  { name: string; x: number[]; y: number[] }
> = {
  starter: {
    name: "Starter observations",
    x: [2, 4, 5, 7, 9, 10],
    y: [3, 5, 7, 6, 10, 12],
  },
  positive: {
    name: "Strong positive correlation",
    x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    y: [2, 4, 3, 6, 5, 8, 7, 10, 9, 12],
  },
  negative: {
    name: "Strong negative correlation",
    x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    y: [12, 10, 11, 8, 9, 5, 6, 3, 4, 1],
  },
  none: {
    name: "Weak / no linear correlation",
    x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    y: [5, 8, 2, 10, 4, 4, 10, 2, 8, 5],
  },
  perfectPositive: {
    name: "Perfect positive correlation",
    x: [1, 2, 3, 4, 5, 6, 7, 8],
    y: [3, 5, 7, 9, 11, 13, 15, 17],
  },
  perfectNegative: {
    name: "Perfect negative correlation",
    x: [1, 2, 3, 4, 5, 6, 7, 8],
    y: [17, 15, 13, 11, 9, 7, 5, 3],
  },
};
export function exampleRows(key = "starter"): Observation[] {
  const example = EXAMPLES[key] ?? EXAMPLES.starter;
  return example.x.map((x, i) => ({
    id: `point-${i}`,
    x: String(x),
    y: String(example.y[i]),
  }));
}
