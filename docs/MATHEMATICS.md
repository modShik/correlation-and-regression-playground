# Mathematical conventions

## Pearson correlation

Correlation measures the strength and direction of a **linear** relationship. The lab calculates:

```text
r = Sxy / sqrt(Sxx × Syy)
Sxy = Σ[(xi − mean(X))(yi − mean(Y))]
Sxx = Σ[(xi − mean(X))²]
Syy = Σ[(yi − mean(Y))²]
```

The common sample/population normalization cancels in r when used consistently. The result lies between −1 and +1. Descriptive strength labels are teaching conventions, not significance tests. Correlation does not establish causation, and r near zero can coexist with a nonlinear relationship.

## Ordinary least-squares regression

The model contains an intercept:

```text
y_hat = a + b × x
b = Sxy / Sxx
a = mean(Y) − b × mean(X)
```

The fitted line minimizes the sum of squared vertical residuals.

For nonconstant X and Y in this simple regression with an intercept:

```text
R² = 1 − SSE / SST = r²
SSE = Σ(yi − y_hat_i)²
SST = Σ(yi − mean(Y))²
```

The implementation uses `r²`, and the tests independently verify its agreement with `1 − SSE/SST` for the supplied dataset.

## Numerical behavior

- Empty or one-observation datasets show available counts/means without inventing a fit.
- Invalid or incomplete rows are visibly excluded; blanks are not treated as zero.
- Duplicate observations are retained and count separately.
- Constant X gives undefined r and no unique regression slope.
- Constant Y with varying X gives a horizontal line; r and R² are undefined.
- Two distinct points produce a perfect line, which is weak evidence about a population.
- Independent axis normalization and compensated sums avoid overflow in squared values.
- No fixed variance tolerance discards valid very small inputs.
- Predictions are drawn in normalized coordinates. Unrepresentable coefficients are shown as unavailable.
- Inputs use IEEE-754 doubles. Text that overflows, or a nonzero number that underflows to zero, is rejected.

## Default example

```text
X = 2, 4, 5, 7, 9, 10
Y = 3, 5, 7, 6, 10, 12

n         = 6
mean(X)   = 37 / 6
mean(Y)   = 43 / 6
r         ≈ 0.9439104362
R²        ≈ 0.8909669115
slope     = 287 / 281 ≈ 1.0213523132
intercept = 244 / 281 ≈ 0.8683274021
SSE       = 1680 / 281
```

Run `npm test` to verify these results and the numerical edge cases.
