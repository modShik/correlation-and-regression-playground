"use client";
import { useId } from "react";
import {
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  XAxis,
  YAxis,
} from "recharts";
import { ChartScatter } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { format, type Point, type Statistics } from "@/lib/statistics";
type Props = {
  points: Point[];
  stats: Statistics;
  showLine?: boolean;
  residuals?: boolean;
  selected?: string | null;
  onSelect?: (id: string) => void;
  compact?: boolean;
};
export function ScatterPlot({
  points,
  stats,
  showLine = true,
  residuals = false,
  selected,
  onSelect,
  compact = false,
}: Props) {
  const id = useId();
  const data = points.map((point, i) => ({
    ...point,
    px: stats.xAxis.values[i],
    py: stats.yAxis.values[i],
    index: i,
  }));
  const b = stats.normalizedSlope;
  // All drawing happens in bounded coordinates; raw magnitudes cannot overflow the plot.
  const prediction = (x: number) =>
    stats.yAxis.mean + (b ?? 0) * (x - stats.xAxis.mean);
  let left = -1.2,
    right = 1.2;
  if (b !== null && b !== 0) {
    const x1 = stats.xAxis.mean + (-1.2 - stats.yAxis.mean) / b;
    const x2 = stats.xAxis.mean + (1.2 - stats.yAxis.mean) / b;
    left = Math.max(left, Math.min(x1, x2));
    right = Math.min(right, Math.max(x1, x2));
  }
  const usesOffset = (axis: Statistics["xAxis"]) =>
    !axis.constant && Math.abs(axis.origin) / axis.scale > 1e5;
  const axisLabel = (name: string, axis: Statistics["xAxis"]) =>
    usesOffset(axis) ? `${name} − (${axis.origin})` : `${name} variable`;
  const tick = (v: number, axis: Statistics["xAxis"]) => {
    const raw = usesOffset(axis)
      ? axis.scale * v
      : axis.origin + axis.scale * v;
    if (!Number.isFinite(raw)) return "";
    if (Math.abs(raw) >= 1e5 || (raw !== 0 && Math.abs(raw) < 0.01))
      return raw.toExponential(1);
    return Number(raw.toPrecision(4)).toString();
  };
  if (!points.length)
    return (
      <Empty className="plot-empty">
        <EmptyHeader>
          <ChartScatter size={32} />
          <EmptyTitle>Your next discovery starts with a point.</EmptyTitle>
          <EmptyDescription>
            Add X and Y values, or load an example to bring the chart to life.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  return (
    <div
      className={`scatter-chart ${compact ? "compact" : ""}`}
      role="group"
      aria-label={`Scatter plot of ${points.length} observations. ${stats.r === null ? "Correlation undefined." : `Pearson r ${format(stats.r)}.`}`}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        initialDimension={{ width: 740, height: compact ? 230 : 340 }}
      >
        <ComposedChart
          data={data}
          margin={{
            top: 22,
            right: 25,
            bottom: compact ? 18 : 28,
            left: compact ? 4 : 12,
          }}
          accessibilityLayer
        >
          <CartesianGrid stroke="#e7edf4" strokeDasharray="3 4" vertical />
          <XAxis
            type="number"
            dataKey="px"
            domain={[-1.2, 1.2]}
            ticks={stats.xAxis.constant ? [0] : [-1, -0.5, 0, 0.5, 1]}
            allowDataOverflow
            tickFormatter={(v) => tick(v, stats.xAxis)}
            axisLine={{ stroke: "#d6deea" }}
            tickLine={false}
            tick={{ fill: "#63718a", fontSize: 12 }}
            dy={8}
            label={{
              value: axisLabel("X", stats.xAxis),
              position: "insideBottom",
              offset: compact ? -12 : -20,
              style: { fill: "#63718a", fontSize: 12 },
            }}
          />
          <YAxis
            type="number"
            dataKey="py"
            domain={[-1.2, 1.2]}
            ticks={stats.yAxis.constant ? [0] : [-1, -0.5, 0, 0.5, 1]}
            allowDataOverflow
            tickFormatter={(v) => tick(v, stats.yAxis)}
            width={compact ? 48 : 66}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#63718a", fontSize: 12 }}
            label={
              compact
                ? undefined
                : {
                    value: axisLabel("Y", stats.yAxis),
                    angle: -90,
                    position: "insideLeft",
                    offset: -5,
                    style: { fill: "#63718a", fontSize: 12 },
                  }
            }
          />
          {residuals &&
            b !== null &&
            data.map((p) => (
              <ReferenceLine
                key={p.id}
                segment={[
                  { x: p.px, y: p.py },
                  { x: p.px, y: prediction(p.px) },
                ]}
                stroke="#f0a545"
                strokeDasharray="4 3"
                ifOverflow="hidden"
              />
            ))}
          {showLine && b !== null && (
            <ReferenceLine
              segment={[
                { x: left, y: prediction(left) },
                { x: right, y: prediction(right) },
              ]}
              stroke="#4263e8"
              strokeWidth={2.5}
              ifOverflow="hidden"
            />
          )}
          <Scatter
            name="Observations"
            data={data}
            isAnimationActive={false}
            shape={(props: unknown) => {
              const { cx, cy, payload } = props as {
                cx: number;
                cy: number;
                payload: (typeof data)[number];
              };
              if (!Number.isFinite(cx) || !Number.isFinite(cy)) return <g />;
              return (
                <g
                  className="plot-point"
                  role={onSelect ? "button" : undefined}
                  tabIndex={onSelect ? 0 : undefined}
                  aria-label={`Observation ${payload.index + 1}: X ${payload.x}, Y ${payload.y}. Select to inspect.`}
                  onClick={() => onSelect?.(payload.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect?.(payload.id);
                    }
                  }}
                >
                  <title>{`Observation ${payload.index + 1} · X: ${payload.x} · Y: ${payload.y}`}</title>
                  <circle cx={cx} cy={cy} r={14} fill="transparent" />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={selected === payload.id ? 9 : 6.5}
                    fill={selected === payload.id ? "#f3a63a" : "#5375ee"}
                    stroke="white"
                    strokeWidth={2.5}
                  />
                  {selected === payload.id && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={13}
                      fill="none"
                      stroke="#f3a63a"
                      strokeOpacity={0.4}
                    />
                  )}
                </g>
              );
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <span id={id} className="sr-only">
        The accompanying data editor provides all exact observation values.
      </span>
    </div>
  );
}
