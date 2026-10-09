"use client";
import { useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { calculate, type Observation, validPoints } from "@/lib/statistics";
type Tool = {
  name: string;
  title: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown;
};
type Context = {
  registerTool: (
    tool: Tool,
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
};
export function useLabTools(
  rows: Observation[],
  replace: (rows: Observation[]) => void,
) {
  const state = useRef({ rows, replace });
  state.current = { rows, replace };
  useEffect(() => {
    const context = (document as Document & { modelContext?: Context })
      .modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const read = () => {
      const s = calculate(validPoints(state.current.rows));
      return {
        observations: state.current.rows,
        n: s.n,
        r: s.r,
        r2: s.r2,
        slope: s.slope,
        intercept: s.intercept,
        meanX: s.meanX,
        meanY: s.meanY,
        note: s.reason,
      };
    };
    const tools: Tool[] = [
      {
        name: "read_statistics",
        title: "Read playground statistics",
        description:
          "Read current observations and calculated correlation and regression statistics.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        execute: read,
      },
      {
        name: "replace_observations",
        title: "Replace playground observations",
        description:
          "Replace all observations with the supplied numerical X/Y pairs and update the visible plot and statistics.",
        inputSchema: {
          type: "object",
          properties: {
            points: {
              type: "array",
              maxItems: 1000,
              items: {
                type: "object",
                properties: { x: { type: "number" }, y: { type: "number" } },
                required: ["x", "y"],
                additionalProperties: false,
              },
            },
          },
          required: ["points"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input: unknown) {
          const value = input as { points?: unknown[] };
          if (
            !value ||
            !Array.isArray(value.points) ||
            value.points.length > 1000
          )
            throw new Error(
              "Supply an array of at most 1000 finite X/Y pairs.",
            );
          const observations = value.points.map((point, i) => {
            const p = point as { x?: unknown; y?: unknown };
            if (
              !p ||
              typeof p.x !== "number" ||
              typeof p.y !== "number" ||
              !Number.isFinite(p.x) ||
              !Number.isFinite(p.y)
            )
              throw new Error("Every X and Y must be a finite number.");
            return { id: `tool-${i}`, x: String(p.x), y: String(p.y) };
          });
          flushSync(() => state.current.replace(observations));
          return read();
        },
      },
    ];
    for (const tool of tools) {
      try {
        void Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {
        /* The playground works without experimental browser APIs. */
      }
    }
    return () => lifecycle.abort();
  }, []);
}
