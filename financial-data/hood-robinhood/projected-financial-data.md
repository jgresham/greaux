# Robinhood Projected Financial Data

App source file: `src/pages/Robinhood.jsx`

## Default Projection Inputs

| Input | Default Value | Source / Rationale |
| --- | --- | --- |
| Transaction CAGR | 20% | From CY2024 base of $1.65B. Options growing steadily; crypto highly cyclical but secular adoption trend; futures and index options expansion in 2025+. 20% reflects continued product expansion and moderate crypto cycle tailwind. Source: Robinhood 10-K CY2024, analyst consensus. |
| Net Interest CAGR | 10% | From CY2024 base of $1.11B. AUC growth (88% YoY in 2024) partially offsets Fed rate cuts. Cash sweep at 4.5%+ is a durable earnings driver. 10% reflects AUC compounding with modest rate headwinds. Source: Robinhood 10-K CY2024. |
| Other Revenue CAGR | 15% | From CY2024 base of $195M. Robinhood Gold subscriptions growing toward 3M+; cash card, index funds, and prediction markets add incremental revenue. Source: Robinhood earnings calls, analyst consensus. |
| GAAP net margin | 25% | CY2024 was 47.8% — exceptional due to crypto cycle and operating leverage. Normalized 25% reflects sustainable profitability as headcount and product investments resume. Source: analyst consensus, Robinhood management guidance. |
| P/E multiple | 25x | HOOD trades between traditional broker multiples (~20x Schwab) and growth fintech multiples (30-40x). 25x is mid-range base case. Source: Bloomberg consensus. |
| Diluted shares | 0.908B | CY2024 diluted weighted average: ~907.8M. Buybacks partially offset RSU dilution. Source: Robinhood 10-K CY2024. |

## Default Revenue Projections (USD Billions)

| Year | Transaction | Net Interest | Other | Total |
| --- | ---: | ---: | ---: | ---: |
| CY2022 (actual) | 0.814 | 0.424 | 0.120 | 1.358 |
| CY2023 (actual) | 0.785 | 0.929 | 0.151 | 1.865 |
| CY2024 (actual) | 1.647 | 1.109 | 0.195 | 2.951 |
| CY2025 (projected) | 1.976 | 1.220 | 0.224 | 3.420 |
| CY2026 (projected) | 2.372 | 1.342 | 0.258 | 3.972 |
| CY2027 (projected) | 2.846 | 1.476 | 0.297 | 4.619 |
| CY2028 (projected) | 3.415 | 1.624 | 0.341 | 5.380 |
| CY2029 (projected) | 4.098 | 1.786 | 0.393 | 6.277 |

## Default Earnings Projections (25% net margin scenario)

| Year | Total Revenue | GAAP Net Income |
| --- | ---: | ---: |
| CY2029 (projected) | $6.28B | $1.57B |

## Default Valuation Output

- CY2029 EPS: $1.57B / 0.908B shares = $1.73
- CY2029 Share Price: $1.73 × 25x P/E = **$43**
- CY2029 Market Cap: $1.57B × 25x = $39.3B

## Operating Metric Charts

### Monthly Active Users (MAU)

| Year | Value (M users) | Type |
| --- | ---: | --- |
| CY2021 | 21.3 | actual (peak; COVID retail boom) |
| CY2022 | 11.4 | actual |
| CY2023 | 10.9 | actual (near trough) |
| CY2024 | 14.9 | actual (+37% YoY recovery) |
| CY2025 | 17.5 | projected |
| CY2026 | 21.0 | projected |
| CY2027 | 25.0 | projected |

### Assets Under Custody (AUC)

| Year | Value (USD B) | Type |
| --- | ---: | --- |
| CY2022 | 62.2 | actual |
| CY2023 | 102.6 | actual (+65% YoY) |
| CY2024 | 193.0 | actual (+88% YoY; record) |
| CY2025 | 250.0 | projected |
| CY2026 | 310.0 | projected |
| CY2027 | 380.0 | projected |

## Sources

- Robinhood Form 10-K CY2024 (filed February 2025) — revenue breakdown, MAU, AUC
- Robinhood Form 10-K CY2023 (filed February 2024)
- Robinhood Form 10-K CY2022 (filed February 2023)
- Robinhood Q4 CY2024 Earnings Release — Robinhood Gold subscriber count
- Wall Street consensus estimates via Bloomberg, Q4 2024
