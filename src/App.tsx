"use client";
import { useMemo, useRef, useState } from "react";
import {
  ChartScatter,
  BookOpen,
  FlaskConical,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { DataEditor } from "@/components/lab/data-editor";
import { Lessons, CorrelationMeter } from "@/components/lab/lessons";
import { useLabTools } from "@/components/lab/webmcp";
import { ScatterPlot } from "@/components/lab/scatter-plot";
import {
  calculate,
  exampleRows,
  format,
  interpretation,
  validPoints,
  type Observation,
} from "@/lib/statistics";
export default function App() {
  const [rows, setRows] = useState<Observation[]>(exampleRows);
  const [dataset, setDataset] = useState("starter");
  const [selected, setSelected] = useState<string | null>(null);
  const [showLine, setShowLine] = useState(true),
    [residuals, setResiduals] = useState(false);
  useLabTools(rows, (observations) => {
    setRows(observations);
    setDataset("custom");
    setSelected(null);
  });
  const nextId = useRef(100);
  const points = useMemo(() => validPoints(rows), [rows]);
  const stats = useMemo(() => calculate(points), [points]);
  const insight = interpretation(stats.r);
  const selectedPoint = points.find((p) => p.id === selected);
  function loadExample(key: string) {
    setRows(exampleRows(key));
    setDataset(key);
    setSelected(null);
  }
  function change(id: string, key: "x" | "y", value: string) {
    setRows((old) =>
      old.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    );
    setDataset("custom");
  }
  function addObservation() {
    const id = `new-${nextId.current++}`;
    setRows((old) => [...old, { id, x: "", y: "" }]);
    setDataset("custom");
    requestAnimationFrame(() => document.getElementById(`x-${id}`)?.focus());
  }
  function random() {
    const sign = Math.random() > 0.5 ? 1 : -1;
    setRows(
      Array.from({ length: 12 }, (_, i) => ({
        id: `random-${nextId.current++}`,
        x: String(i + 1),
        y: (sign * (i + 1) + Math.random() * 10).toFixed(1),
      })),
    );
    setDataset("random");
    setSelected(null);
  }
  return (
    <>
      <a className="skip-link" href="#playground">
        Skip to playground
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#">
            <span className="brand-icon">
              <ChartScatter size={22} />
            </span>
            stat<span>lab</span>
            <span className="brand-divider" />
            <span className="brand-caption">
              A little data. A lot of discovery.
            </span>
          </a>
          <nav aria-label="Main navigation">
            <a className="nav-active" href="#playground">
              Playground
            </a>
            <a href="#concepts">The concepts</a>
            <a href="#quiz">Test yourself</a>
          </nav>
          <span className="course-label">
            <BookOpen size={15} /> Probability & Statistics
          </span>
        </div>
      </header>
      <main className="page-shell">
        <section className="hero">
          <div className="eyebrow">
            <span className="module-pill">MODULE 03</span>
            <span>THE INTERACTIVE SERIES</span>
          </div>
          <h1>
            Correlation & Regression <span>Playground</span>
            <span className="title-dot">.</span>
          </h1>
          <p className="hero-subtitle">
            Enter data. See the relationship. Understand the mathematics.
          </p>
          <p className="hero-description">
            Explore how two variables move together, one observation at a time.
          </p>
        </section>
        <section
          id="playground"
          className="playground-section"
          aria-label="Interactive data playground"
        >
          <div className="section-bar">
            <div>
              <FlaskConical size={17} />
              <h2>The experiment</h2>
              <span className="section-bar-divider" />
              <span>Change a value. Watch what happens.</span>
            </div>
            <span className="live-label">
              <span /> Live calculations
            </span>
          </div>
          <div className="workspace">
            <DataEditor
              rows={rows}
              dataset={dataset}
              selected={selected}
              onSelect={setSelected}
              onChange={change}
              onExample={loadExample}
              onAdd={addObservation}
              onDelete={(id) => {
                setRows((old) => old.filter((row) => row.id !== id));
                setDataset("custom");
              }}
              onRandom={random}
              onClear={() => {
                setRows([]);
                setDataset("custom");
                setSelected(null);
              }}
            />
            <section className="panel plot-panel" aria-labelledby="plot-title">
              <div className="plot-heading">
                <div>
                  <h2 id="plot-title">The relationship, visualized</h2>
                  <p>Your observations and their line of best fit.</p>
                </div>
                <span className={`relationship-badge ${insight.tone}`}>
                  <TrendingUp size={14} />
                  {stats.r === null
                    ? stats.n >= 2
                      ? "Undefined relationship"
                      : "Awaiting data"
                    : stats.r < -0.1
                      ? "Negative relationship"
                      : stats.r > 0.1
                        ? "Positive relationship"
                        : "No linear relationship"}
                </span>
              </div>
              <div className="plot-toolbar">
                <div className="plot-legend">
                  <span>
                    <i className="dot-key" /> Observations
                  </span>
                  <span>
                    <i className="line-key" /> Regression line
                  </span>
                </div>
                <div className="plot-toggles">
                  <label>
                    <Switch
                      size="sm"
                      checked={showLine}
                      onCheckedChange={setShowLine}
                      aria-label="Show regression line"
                    />{" "}
                    Line
                  </label>
                  <label>
                    <Switch
                      size="sm"
                      checked={residuals}
                      onCheckedChange={setResiduals}
                      aria-label="Show residuals"
                    />{" "}
                    Residuals
                  </label>
                </div>
              </div>
              <ScatterPlot
                points={points}
                stats={stats}
                showLine={showLine}
                residuals={residuals}
                selected={selected}
                onSelect={setSelected}
              />
              <div className="plot-footer">
                <span>
                  {selectedPoint
                    ? `Selected observation: X = ${selectedPoint.x}, Y = ${selectedPoint.y}`
                    : "Select a point to inspect its values."}
                </span>
                <span>
                  <b>{stats.n}</b> observations
                </span>
              </div>
            </section>
          </div>
          <div
            className="stats-strip"
            aria-label="Calculated statistics"
            aria-live="polite"
            aria-atomic="true"
          >
            {[
              {
                title: "Pearson correlation",
                symbol: "r",
                value: format(stats.r),
                note: "Strength & direction",
                blue: true,
              },
              {
                title: "Explained variation",
                symbol: "R²",
                value: format(stats.r2),
                note:
                  stats.r2 === null
                    ? "Proportion explained"
                    : `${format(stats.r2 * 100, 1)}% of variation in Y`,
              },
              {
                title: "Slope",
                symbol: "b",
                value: format(stats.slope),
                note: "Change in Y per unit X",
              },
              {
                title: "Y-intercept",
                symbol: "a",
                value: format(stats.intercept),
                note: "Predicted Y at X = 0",
              },
              {
                title: "Observations",
                symbol: "n",
                value: String(stats.n),
                note: `x̄ = ${format(stats.meanX, 2)}  ·  ȳ = ${format(stats.meanY, 2)}`,
              },
            ].map((metric) => (
              <div
                className={`stat ${metric.blue ? "stat-primary" : ""}`}
                key={metric.symbol}
              >
                <div className="stat-label">
                  {metric.title}
                  <span>{metric.symbol}</span>
                </div>
                <div
                  className="stat-value"
                  data-testid={`stat-${metric.symbol}`}
                >
                  {metric.value}
                </div>
                <p>{metric.note}</p>
              </div>
            ))}
          </div>
          <div className="interpretation-row">
            <div className="insight">
              <span className="insight-icon">
                <Lightbulb size={20} />
              </span>
              <div>
                <h3>
                  {stats.reason
                    ? "A small note about your data"
                    : insight.label}
                </h3>
                <p>{stats.reason ?? insight.description}</p>
              </div>
            </div>
            <div className="equation-block">
              <span>YOUR REGRESSION EQUATION</span>
              <strong>
                {stats.slope !== null && stats.intercept !== null ? (
                  <>
                    ŷ = {format(stats.intercept, 2)}{" "}
                    {stats.slope < 0 ? "−" : "+"}{" "}
                    {format(Math.abs(stats.slope), 2)}x
                  </>
                ) : stats.normalizedSlope !== null ? (
                  "Coefficients out of range"
                ) : (
                  "ŷ = a + bx"
                )}
              </strong>
            </div>
          </div>
          {stats.n === 2 && !stats.reason && (
            <p className="data-caveat">
              Two distinct observations always produce a perfect line. Add more
              data before drawing conclusions.
            </p>
          )}
          {stats.normalizedSlope !== null &&
            (stats.slope === null || stats.intercept === null) && (
              <p className="data-caveat">
                One or more coefficients exceed numerical range. The plot still
                uses the stable normalized fit.
              </p>
            )}
          <CorrelationMeter r={stats.r} />
        </section>
        <Lessons onExample={loadExample} />
      </main>
      <footer className="site-footer">
        <span className="brand footer-brand">
          <ChartScatter size={20} />
          statlab
        </span>
        <span>Made for curious minds. Grounded in mathematics.</span>
        <span>Probability & Statistics · Module 03</span>
      </footer>
    </>
  );
}
