"use client";
import { useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  CircleHelp,
  FlaskConical,
  Lightbulb,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  calculate,
  EXAMPLES,
  exampleRows,
  format,
  validPoints,
} from "@/lib/statistics";
function MiniPlot({ kind }: { kind: "positive" | "negative" | "none" }) {
  const data = EXAMPLES[kind];
  return (
    <svg
      className="mini-plot"
      viewBox="0 0 240 110"
      role="img"
      aria-label={`${kind === "none" ? "No linear" : kind} correlation example`}
    >
      <path d="M20 10v85h205" stroke="#dde5f1" fill="none" />
      {[30, 55, 80].map((y) => (
        <path
          key={y}
          d={`M20 ${y}h205`}
          stroke="#edf1f7"
          strokeDasharray="3 4"
        />
      ))}
      {kind !== "none" && (
        <path
          d={kind === "positive" ? "M30 87L218 20" : "M30 20L218 87"}
          stroke={kind === "positive" ? "#4b71e8" : "#9a7acf"}
          strokeWidth="1.5"
          opacity=".5"
        />
      )}
      {data.x.map((x, i) => (
        <circle
          key={i}
          cx={20 + x * 20}
          cy={98 - data.y[i] * 6}
          r="3.5"
          fill={kind === "negative" ? "#9a7acf" : "#5b7ce8"}
          stroke="white"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}
export function CorrelationMeter({ r }: { r: number | null }) {
  return (
    <div className="correlation-meter">
      <div className="meter-heading">
        <span>THE CORRELATION SPECTRUM</span>
        <strong>r = {format(r)}</strong>
      </div>
      <div className="meter-track">
        <span className="meter-zero" />
        {r !== null && (
          <span
            className="meter-marker"
            style={{ left: `${(r + 1) * 50}%` }}
            aria-label={`Current r ${format(r)}`}
          />
        )}
      </div>
      <div className="meter-labels">
        <span>
          −1 <small>Negative</small>
        </span>
        <span>
          0 <small>No linear correlation</small>
        </span>
        <span>
          +1 <small>Positive</small>
        </span>
      </div>
    </div>
  );
}
export function Lessons({ onExample }: { onExample: (key: string) => void }) {
  const [outlier, setOutlier] = useState(10);
  const demo = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: `demo-${i}`,
        x: i + 1,
        y: i === 7 ? outlier : i + 3,
      })),
    [outlier],
  );
  const stats = useMemo(() => calculate(demo), [demo]);
  const fit = (x: number) => (stats.intercept ?? 0) + (stats.slope ?? 0) * x;
  const load = (key: string) => {
    onExample(key);
    document
      .getElementById("playground")
      ?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
      <section id="concepts" className="learning-section">
        <div className="learning-heading">
          <div className="eyebrow">
            <span className="section-number">02</span> BUILD YOUR INTUITION
          </div>
          <h2>There’s a story in the scatter.</h2>
          <p>
            Read the pattern first. Then let the mathematics put a number to it.
          </p>
        </div>
        <div className="concept-grid">
          <article className="concept-main">
            <div className="topic-tag">
              <BookOpen size={15} /> UNDERSTANDING CORRELATION
            </div>
            <h3>Do these variables move together?</h3>
            <p>
              Correlation measures the{" "}
              <strong>strength and direction of a linear relationship</strong>{" "}
              between two variables. Pearson’s r puts that relationship on a
              scale from −1 to +1.
            </p>
            <div className="formula-card">
              <div className="math-formula">
                r ={" "}
                <span className="fraction">
                  <span>Cov(X, Y)</span>
                  <span>
                    σ<sub>x</sub> σ<sub>y</sub>
                  </span>
                </span>
              </div>
              <span>−1 ≤ r ≤ 1</span>
            </div>
            <p className="formula-caption">
              Covariance describes how X and Y vary together. Dividing by their
              standard deviations makes r unitless. Use a consistent sample or
              population convention.
            </p>
            <div className="concept-callout">
              <Lightbulb size={17} />
              <p>
                <strong>A pattern is not a cause.</strong> Correlation alone
                doesn’t show that changing X causes a change in Y.
              </p>
            </div>
          </article>
          <div className="pattern-list">
            {(
              [
                {
                  key: "positive",
                  title: "Positive correlation",
                  description: "Higher X tends to come with higher Y.",
                  range: "r → +1",
                },
                {
                  key: "negative",
                  title: "Negative correlation",
                  description: "Higher X tends to come with lower Y.",
                  range: "r → −1",
                },
                {
                  key: "none",
                  title: "Little or no linear correlation",
                  description: "No clear upward or downward linear trend.",
                  range: "r ≈ 0",
                },
              ] as const
            ).map((item) => (
              <button
                className="pattern-card"
                key={item.key}
                onClick={() => load(item.key)}
                aria-label={`Explore ${item.title.toLowerCase()} in the playground`}
              >
                <MiniPlot kind={item.key} />
                <div>
                  <div className="pattern-title">
                    <h4>{item.title}</h4>
                    <span>{item.range}</span>
                  </div>
                  <p>{item.description}</p>
                  <span className="pattern-action">Explore this dataset</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="regression-section">
        <div className="regression-copy">
          <div className="topic-tag">
            <SlidersHorizontal size={15} /> UNDERSTANDING REGRESSION
          </div>
          <h2>One line. The best possible fit.</h2>
          <p>
            Simple linear regression models Y from X. The best-fit line
            minimizes the sum of <strong>squared vertical distances</strong>{" "}
            between observed Y values and their predictions.
          </p>
          <div className="regression-formula">
            ŷ = <span>a</span> + <span>b</span>x
          </div>
          <div className="coefficient-explanations">
            <div>
              <span>a</span>
              <p>
                <strong>The intercept</strong>Predicted Y when X is zero.
              </p>
            </div>
            <div>
              <span>b</span>
              <p>
                <strong>The slope</strong>Change in predicted Y for one more
                unit of X.
              </p>
            </div>
          </div>
          <div className="slope-example">
            For ŷ = 0.87 + 1.02x, each extra unit of X adds about{" "}
            <strong>1.02 units</strong> to predicted Y.
          </div>
          <details className="math-details">
            <summary>See the mathematics</summary>
            <div>
              <p className="math-line">
                b = Σ[(xᵢ − x̄)(yᵢ − ȳ)] / Σ[(xᵢ − x̄)²]
              </p>
              <p className="math-line">a = ȳ − bx̄</p>
              <p className="math-line">R² = 1 − SSE/SST = r²</p>
              <p>
                SSE = Σ(yᵢ − ŷᵢ)² and SST = Σ(yᵢ − ȳ)². The equality R² = r²
                applies to simple least-squares regression with an intercept and
                nonconstant X and Y.
              </p>
            </div>
          </details>
        </div>
        <aside className="r2-explainer">
          <span className="r2-symbol">
            R<sup>2</sup>
          </span>
          <span className="topic-tag">HOW MUCH DOES THE LINE EXPLAIN?</span>
          <h3>A measure of the fit.</h3>
          <p>
            R² is the proportion of observed variation in Y accounted for by the
            fitted model.
          </p>
          <div className="r2-demo">
            <div>
              <span>Example: R² = 0.81</span>
              <strong>81%</strong>
            </div>
            <div className="r2-track">
              <span />
            </div>
            <div className="r2-key">
              <span>
                <i /> Explained by the model
              </span>
              <span>19% remains</span>
            </div>
          </div>
          <p className="r2-note">
            It isn’t the percentage of correct predictions, and it doesn’t prove
            causation. With only two distinct points, even a perfect fit is weak
            evidence about a population.
          </p>
        </aside>
      </section>
      <section className="outlier-section">
        <div className="outlier-copy">
          <div className="eyebrow">
            <span className="section-number">03</span> TRY A LITTLE EXPERIMENT
          </div>
          <h2>
            One point can change
            <br />
            the whole picture.
          </h2>
          <p>
            Move the gold point up or down. Watch the line tilt and r
            change—even though seven observations stay exactly the same.
          </p>
          <div className="slider-label">
            <label id="outlier-label">Gold point’s Y value</label>
            <output>{outlier.toFixed(1)}</output>
          </div>
          <Slider
            value={[outlier]}
            min={0}
            max={20}
            step={0.1}
            onValueChange={(v) => setOutlier(v[0])}
            aria-labelledby="outlier-label"
            className="outlier-slider"
          />
          <div className="slider-extents">
            <span>0 · move down</span>
            <span>20 · move up</span>
          </div>
          <button
            className="text-button demo-reset"
            onClick={() => setOutlier(10)}
          >
            <RotateCcw size={14} /> Reset the experiment
          </button>
          <div className="outlier-observation">
            <Sparkles size={16} />
            <p>
              {Math.abs(outlier - 10) < 0.05
                ? "All eight points lie on a straight line. Try moving the gold point away."
                : outlier < 4
                  ? "That one point pulls the line downward and weakens the positive relationship."
                  : "The point pulls the line toward itself. Greater distance from the pattern usually weakens the linear fit."}
            </p>
          </div>
        </div>
        <div className="outlier-plot">
          <div className="demo-stats">
            <div>
              <span>Pearson r</span>
              <strong>{format(stats.r)}</strong>
            </div>
            <div>
              <span>R²</span>
              <strong>{format(stats.r2)}</strong>
            </div>
            <div>
              <span>Slope</span>
              <strong>{format(stats.slope)}</strong>
            </div>
          </div>
          <svg
            viewBox="0 0 500 270"
            className="demo-svg"
            role="img"
            aria-label={`Experiment scatter plot, selected point X 8, Y ${outlier}. r ${format(stats.r)}.`}
          >
            <defs>
              <clipPath id="demo-clip">
                <rect x="45" y="15" width="420" height="220" />
              </clipPath>
            </defs>
            {[0, 5, 10, 15, 20].map((y) => (
              <g key={y}>
                <path
                  d={`M45 ${235 - y * 11}H465`}
                  stroke="#e1e8f5"
                  strokeDasharray="4 5"
                />
                <text
                  x="31"
                  y={239 - y * 11}
                  textAnchor="end"
                  fill="#63718a"
                  fontSize="12"
                >
                  {y}
                </text>
              </g>
            ))}
            {[0, 2, 4, 6, 8, 10].map((x) => (
              <g key={x}>
                <path
                  d={`M${45 + x * 42} 15V235`}
                  stroke="#e1e8f5"
                  strokeDasharray="4 5"
                />
                <text
                  x={45 + x * 42}
                  y="258"
                  textAnchor="middle"
                  fill="#63718a"
                  fontSize="12"
                >
                  {x}
                </text>
              </g>
            ))}
            <text
              x="257"
              y="269"
              textAnchor="middle"
              fill="#63718a"
              fontSize="10"
            >
              X variable
            </text>
            <g clipPath="url(#demo-clip)">
              <path
                d={`M45 ${235 - fit(0) * 11}L465 ${235 - fit(10) * 11}`}
                stroke="#6381e6"
                strokeWidth="2"
              />
              {demo.map((point, i) => (
                <g key={point.id}>
                  {i === 7 && (
                    <circle
                      cx={45 + point.x * 42}
                      cy={235 - point.y * 11}
                      r="13"
                      fill="#f9b64c"
                      opacity=".2"
                    />
                  )}
                  <circle
                    cx={45 + point.x * 42}
                    cy={235 - point.y * 11}
                    r={i === 7 ? 7 : 5}
                    fill={i === 7 ? "#eaa136" : "#6280e9"}
                    stroke="white"
                    strokeWidth="2"
                  />
                </g>
              ))}
            </g>
          </svg>
          <p className="demo-caption">
            Seven fixed observations. One influential point.
          </p>
        </div>
      </section>
      <Quiz />
      <section className="takeaways">
        <div>
          <span className="eyebrow">TAKE IT WITH YOU</span>
          <h2>Three ideas to remember.</h2>
        </div>
        <div>
          <span>01</span>
          <p>
            <strong>r describes the relationship.</strong>Direction and
            strength, from −1 to +1. Zero r can hide a curved pattern.
          </p>
        </div>
        <div>
          <span>02</span>
          <p>
            <strong>The line makes predictions.</strong>Its slope describes a
            change in predicted Y for each unit of X.
          </p>
        </div>
        <div>
          <span>03</span>
          <p>
            <strong>R² describes the fit.</strong>Variation in Y accounted for
            by the model. A good fit is not causation.
          </p>
        </div>
      </section>
      <div className="syllabus-note">
        <BookOpen size={17} />
        <p>
          <strong>A stepping stone into Module 3.</strong> Rank correlation
          compares ranks; partial correlation adjusts for other variables;
          multiple correlation relates Y to a set of predictors; multiple
          regression fits more than one predictor. This lab builds the
          two-variable foundation.
        </p>
      </div>
    </>
  );
}
const QUESTIONS = [
  {
    question: "If r = −0.92, what does it indicate?",
    options: [
      "A strong positive relationship",
      "A strong negative relationship",
      "No linear relationship",
      "A perfect negative relationship",
    ],
    correct: 1,
    explanation:
      "The minus sign gives the direction. A magnitude close to 1 indicates a strong linear relationship; perfect negative correlation is exactly −1.",
  },
  {
    question: "What does R² = 0.81 mean?",
    options: [
      "81% of points lie on the fitted line",
      "The model explains 81% of observed variation in Y",
      "X causes 81% of the changes in Y",
      "The predictions are always 81% accurate",
    ],
    correct: 1,
    explanation:
      "R² compares residual variation with total variation around the mean of Y. It describes this model’s fit, not causation or prediction accuracy.",
  },
  {
    question: "For ŷ = 3 + 2x, what does the slope mean?",
    options: [
      "Y starts at 2 when X is zero",
      "Predicted Y increases by 2 per extra unit of X",
      "The correlation coefficient is 2",
      "Y always equals twice X",
    ],
    correct: 1,
    explanation:
      "The slope is 2: each extra unit of X adds 2 to predicted Y. The intercept, 3, is the predicted Y when X is zero.",
  },
  {
    question:
      "If Pearson’s r is approximately zero, which statement is justified?",
    options: [
      "X and Y must be independent",
      "There cannot be any relationship",
      "There is little linear association",
      "A regression line cannot be calculated",
    ],
    correct: 2,
    explanation:
      "Pearson’s r describes linear association. A strong nonlinear pattern, such as a U-shaped curve, can still have r = 0.",
  },
];
function Quiz() {
  const [current, setCurrent] = useState(0),
    [answers, setAnswers] = useState<(number | null)[]>([
      null,
      null,
      null,
      null,
    ]),
    [finished, setFinished] = useState(false);
  const question = QUESTIONS[current],
    answer = answers[current],
    correct = answer === question.correct,
    score = answers.filter((v, i) => v === QUESTIONS[i].correct).length;
  function reset() {
    setCurrent(0);
    setAnswers([null, null, null, null]);
    setFinished(false);
  }
  return (
    <section id="quiz" className="quiz-section">
      <div className="quiz-intro">
        <div className="eyebrow">
          <span className="section-number">04</span> CHECK YOUR UNDERSTANDING
        </div>
        <h2>
          A quick check.
          <br />A stronger intuition.
        </h2>
        <p>
          Four questions to connect the numbers with what they actually mean.
        </p>
        <div
          className="quiz-progress"
          aria-label={`${answers.filter((v) => v !== null).length} of 4 answered`}
        >
          {QUESTIONS.map((_, i) => (
            <button
              className={`${i === current && !finished ? "current" : ""} ${answers[i] !== null ? "answered" : ""}`}
              key={i}
              onClick={() => {
                setCurrent(i);
                setFinished(false);
              }}
              aria-label={`Go to question ${i + 1}`}
              aria-current={i === current ? "step" : undefined}
            >
              {answers[i] !== null ? <Check size={14} /> : i + 1}
            </button>
          ))}
        </div>
      </div>
      <div className="quiz-card">
        {finished ? (
          <div className="quiz-results">
            <span className="quiz-result-icon">
              <FlaskConical size={30} />
            </span>
            <span className="topic-tag">EXPERIMENT COMPLETE</span>
            <h3>{score} / 4 correct</h3>
            <p>
              {score === 4
                ? "You’ve connected the patterns, the predictions, and the mathematics."
                : "A little more exploration goes a long way. Review the questions or try again."}
            </p>
            <div>
              <button className="button button-primary" onClick={reset}>
                <RotateCcw size={14} /> Try again
              </button>
              <button
                className="button"
                onClick={() => {
                  setCurrent(0);
                  setFinished(false);
                }}
              >
                Review answers
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="quiz-top">
              <span>QUESTION {String(current + 1).padStart(2, "0")} OF 04</span>
              <CircleHelp size={18} />
            </div>
            <h3>{question.question}</h3>
            <RadioGroup
              key={current}
              value={answer === null ? "" : String(answer)}
              onValueChange={(v) =>
                setAnswers((old) =>
                  old.map((a, i) => (i === current ? Number(v) : a)),
                )
              }
              aria-label={question.question}
              className="quiz-options"
            >
              {question.options.map((option, i) => (
                <label
                  key={i}
                  className={`quiz-option ${answer === i ? "selected" : ""} ${answer !== null && i === question.correct ? "correct-option" : ""}`}
                >
                  <RadioGroupItem value={String(i)} aria-label={option} />
                  <span className="option-letter">{"ABCD"[i]}</span>
                  <span>{option}</span>
                  {answer !== null && i === question.correct && (
                    <Check size={16} />
                  )}
                </label>
              ))}
            </RadioGroup>
            {answer !== null && (
              <div
                role="status"
                className={`quiz-feedback ${correct ? "correct" : "incorrect"}`}
              >
                <strong>
                  {correct ? "That’s right." : "Not quite. Here’s why."}
                </strong>
                <p>{question.explanation}</p>
              </div>
            )}
            <div className="quiz-bottom">
              <span>
                {answer === null
                  ? "Choose an answer for instant feedback."
                  : `${answers.filter((v) => v !== null).length} of 4 answered`}
              </span>
              <button
                className="button button-primary"
                disabled={answer === null}
                onClick={() =>
                  current < 3 ? setCurrent(current + 1) : setFinished(true)
                }
              >
                {current === 3 ? "See results" : "Next question"}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
