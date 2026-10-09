import assert from "node:assert/strict";
import test from "node:test";
import {
  calculate,
  parseValue,
  validPoints,
  exampleRows,
  format,
} from "../src/lib/statistics.ts";
const close = (actual, expected, tol = 1e-12) =>
  assert.ok(
    actual !== null &&
      Math.abs(actual - expected) <= tol * Math.max(1, Math.abs(expected)),
    `${actual} ≠ ${expected}`,
  );
const stats = (x, y) =>
  calculate(x.map((v, i) => ({ id: String(i), x: v, y: y[i] })));
test("syllabus example agrees with independently derived exact moments", () => {
  const s = calculate(validPoints(exampleRows()));
  assert.equal(s.n, 6);
  close(s.meanX, 37 / 6);
  close(s.meanY, 43 / 6);
  close(s.slope, 287 / 281);
  close(s.intercept, 244 / 281);
  close(s.r, 287 / Math.sqrt(281 * 329));
  close(s.r2, 82369 / 92449);
  const sse = validPoints(exampleRows()).reduce(
    (sum, p) => sum + (p.y - s.intercept - s.slope * p.x) ** 2,
    0,
  );
  close(sse, 1680 / 281);
  close(s.r2, 1 - sse / (329 / 6));
});
test("positive and negative exact linear fits", () => {
  for (const b of [2, -3]) {
    const s = stats(
      [-2, -1, 0, 1, 2],
      [-2, -1, 0, 1, 2].map((x) => 1 + b * x),
    );
    close(s.slope, b);
    close(s.intercept, 1);
    close(s.r, Math.sign(b));
    close(s.r2, 1);
  }
});
test("a nonlinear relationship can have exactly zero Pearson correlation", () => {
  const s = stats([-2, -1, 0, 1, 2], [4, 1, 0, 1, 4]);
  close(s.r, 0);
  close(s.r2, 0);
  close(s.slope, 0);
  close(s.intercept, 2);
});
test("empty and single pair retain valid count and means without an invented fit", () => {
  const empty = stats([], []);
  assert.equal(empty.n, 0);
  assert.equal(empty.meanX, null);
  assert.equal(empty.slope, null);
  const single = stats([3], [4]);
  assert.equal(single.meanX, 3);
  assert.equal(single.meanY, 4);
  assert.equal(single.r, null);
  assert.equal(single.slope, null);
});
test("constant X has no unique regression", () => {
  const s = stats([2, 2, 2], [1, 2, 3]);
  assert.equal(s.r, null);
  assert.equal(s.r2, null);
  assert.equal(s.slope, null);
});
test("constant Y has a horizontal fit but undefined r and R squared", () => {
  const s = stats([1, 2, 3], [7, 7, 7]);
  assert.equal(s.r, null);
  assert.equal(s.r2, null);
  close(s.slope, 0);
  close(s.intercept, 7);
});
test("duplicate points count as separate observations", () => {
  const s = stats([1, 1, 2, 2, 3, 3], [2, 2, 4, 4, 6, 6]);
  assert.equal(s.n, 6);
  close(s.slope, 2);
  close(s.r, 1);
});
test("finite extreme magnitudes do not overflow centered moments", () => {
  const s = stats([-1e308, 0, 1e308], [-5e307, 0, 5e307]);
  close(s.slope, 0.5);
  close(s.r, 1);
  close(s.intercept, 0);
});
test("tiny finite values do not underflow centered moments", () => {
  const s = stats([1e-200, 2e-200, 3e-200], [2e-200, 4e-200, 6e-200]);
  close(s.slope, 2);
  close(s.r, 1);
});
test("small variation at a large offset remains measurable", () => {
  const s = stats([1e15, 1e15 + 1, 1e15 + 2], [4, 6, 8]);
  close(s.slope, 2);
  assert.equal(s.intercept, -2e15 + 4);
  close(s.r, 1);
});
test("two distinct points give a perfect fit", () => {
  const s = stats([1, 2], [8, 4]);
  close(s.r, -1);
  close(s.r2, 1);
});
test("unrepresentable coefficient is null while normalized fit remains usable", () => {
  const s = stats([1e-308, 2e-308], [1e308, -1e308]);
  assert.equal(s.slope, null);
  close(s.r, -1);
  assert.ok(Number.isFinite(s.normalizedSlope));
  assert.equal(format(s.slope), "—");
});
test("numbers are parsed strictly, with no blank-as-zero or nonfinite values", () => {
  for (const v of [
    "",
    " ",
    "abc",
    "NaN",
    "Infinity",
    "1e999",
    "2 apples",
    "0x20",
    "1,2",
  ])
    assert.equal(parseValue(v), null);
  assert.equal(parseValue(" -2.5e+3 "), -2500);
  assert.equal(parseValue(".4"), 0.4);
  const points = validPoints([
    { id: "a", x: "", y: "1" },
    { id: "b", x: "2", y: "-3.1" },
  ]);
  assert.equal(points.length, 1);
});
test("all five example presets produce intended correlation", () => {
  for (const key of [
    "positive",
    "negative",
    "none",
    "perfectPositive",
    "perfectNegative",
  ]) {
    const s = calculate(validPoints(exampleRows(key)));
    if (key === "positive") assert.ok(s.r > 0.9);
    if (key === "negative") assert.ok(s.r < -0.9);
    if (key === "none") close(s.r, 0);
    if (key === "perfectPositive") close(s.r, 1);
    if (key === "perfectNegative") close(s.r, -1);
  }
});
test("finite intercept survives overflowing intermediate product", () => {
  const s = stats([1e308, 1.1e308, 1.2e308], [1e308, 1.2e308, 1.4e308]);
  close(s.slope, 2);
  close(s.intercept, -1e308);
});
test("subnormal means and intercept are reconstructed before final rounding", () => {
  const m = Number.MIN_VALUE,
    s = stats([m, 2 * m], [2 * m, 3 * m]);
  assert.equal(s.meanX, 2 * m);
  assert.equal(s.meanY, 2 * m);
  assert.equal(s.intercept, m);
  assert.equal(s.slope, 1);
});
test("numeric underflow is not silently accepted as an observation of zero", () => {
  assert.equal(parseValue("1e-400"), null);
  assert.equal(parseValue("0e-400"), 0);
});
