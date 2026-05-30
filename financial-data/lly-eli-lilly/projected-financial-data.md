# Eli Lilly Projected Financial Data

## Summary

This file stores the estimated and modeled default values used by the Eli Lilly page in greaux. Officially reported historical data belongs in `known-revenue-and-product-numbers.md`.

The app models:

- Revenue: product-category revenue across Mounjaro, Zepbound, Foundayo, oncology, immunology, and other products.
- Earnings: modeled performance income using a single performance-margin assumption across product categories.
- Valuation: modeled 2030 performance income multiplied by a P/E multiple, then divided by diluted shares for an implied LLY share price.

## App Source Files

Update these together when changing the default model:

- `src/pages/EliLilly.jsx`
- `src/pages/Home.jsx`
- `src/components/PageMeta.jsx`
- `financial-data/lly-eli-lilly/known-revenue-and-product-numbers.md`
- `financial-data/lly-eli-lilly/projected-financial-data.md`

## Projection Sources And Rationale

| Input | Default | Source/Rationale | Label |
| --- | ---: | --- | --- |
| 2026 total revenue anchor | Approximately $83.9B model output | Lilly updated FY2026 guidance range is $82B-$85B. The default segment model is set near the guidance midpoint. | Company guidance plus model-derived allocation |
| Mounjaro 2030 sales | $36.2B | Evaluate Pharma forecast cited by Fierce Pharma and other coverage. | Third-party analyst estimate |
| Zepbound 2030 sales | $25.5B | Evaluate Pharma forecast cited by Fierce Pharma. | Third-party analyst estimate |
| Foundayo 2030 sales | $14.2B | Visible Alpha/S&P Global Market Intelligence coverage forecast Foundayo revenue climbing to $14.2B by 2030. | Third-party analyst estimate |
| Foundayo 2027 sales | $4.9B external reference; app ramp uses $4.15B for 2027 | S&P Global/Visible Alpha coverage forecast $4.9B in 2027. App ramp is slightly below this to keep total Lilly 2027 revenue conservative. | Third-party analyst estimate and scenario assumption |
| Oncology CAGR | 6% | Scenario assumption from FY2025 reported oncology revenue base. | Scenario assumption |
| Immunology CAGR | 14% | Scenario assumption reflecting growth from newer products such as Ebglyss and Omvoh. | Scenario assumption |
| Other products CAGR | -2% | Scenario assumption reflecting expected pressure in legacy products and product mix shifts. | Scenario assumption |
| Performance margin | 48% | Within Lilly's updated 2026 guidance range of 47.0%-48.5%. | Company guidance used as scenario default |
| 2030 P/E multiple | 38x | Scenario valuation multiple for a high-growth large-cap pharma company. | Scenario assumption |
| Diluted shares | 0.895B | Lilly 2026 guidance assumes approximately 895M shares outstanding. | Company guidance |

## Default Revenue Projection

All figures are in USD billions.

| Year | Mounjaro | Zepbound | Foundayo | Oncology | Immunology | Other products | Total revenue | Label |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 2025 | 22.96 | 13.54 | 0.00 | 9.38 | 5.25 | 14.05 | 65.18 | Official historical actual plus grouped residual |
| 2026 projected | 34.60 | 18.80 | 0.80 | 9.94 | 5.98 | 13.77 | 83.89 | Projected |
| 2027 projected | 35.00 | 20.48 | 4.15 | 10.53 | 6.82 | 13.49 | 90.47 | Projected |
| 2028 projected | 35.40 | 22.15 | 7.50 | 11.17 | 7.77 | 13.22 | 97.21 | Projected |
| 2029 projected | 35.80 | 23.82 | 10.85 | 11.84 | 8.86 | 12.96 | 104.13 | Projected |
| 2030 projected | 36.20 | 25.50 | 14.20 | 12.55 | 10.10 | 12.70 | 111.25 | Projected |

## Default Earnings Projection

Earnings are modeled performance income, not GAAP net income by product. The default performance margin is 48%.

| Year | Mounjaro | Zepbound | Foundayo | Oncology | Immunology | Other products | Total earnings | Label |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 2025 | 11.02 | 6.50 | 0.00 | 4.50 | 2.52 | 6.74 | 31.29 | Model-derived from actual revenue |
| 2026 projected | 16.61 | 9.02 | 0.38 | 4.77 | 2.87 | 6.61 | 40.27 | Projected |
| 2027 projected | 16.80 | 9.83 | 1.99 | 5.05 | 3.27 | 6.48 | 43.43 | Projected |
| 2028 projected | 16.99 | 10.63 | 3.60 | 5.36 | 3.73 | 6.35 | 46.66 | Projected |
| 2029 projected | 17.18 | 11.43 | 5.21 | 5.68 | 4.25 | 6.22 | 49.98 | Projected |
| 2030 projected | 17.38 | 12.24 | 6.82 | 6.02 | 4.85 | 6.10 | 53.40 | Projected |

## Operating-Metric Chart Defaults

Every time-series chart includes future projection data points beyond the latest actual or estimated period.

### Tirzepatide Franchise Revenue

| Year | Mounjaro ($B) | Zepbound ($B) | Foundayo ($B) | Label |
| --- | ---: | ---: | ---: | --- |
| 2023 | 5.16 | 0.18 | 0.00 | Official historical actual |
| 2024 | 11.54 | 4.93 | 0.00 | Official historical actual |
| 2025 | 22.96 | 13.54 | 0.00 | Official historical actual |
| 2026 projected | 34.60 | 18.80 | 0.80 | Projected |
| 2027 projected | 35.00 | 20.48 | 4.15 | Projected |
| 2028 projected | 35.40 | 22.15 | 7.50 | Projected |
| 2029 projected | 35.80 | 23.82 | 10.85 | Projected |
| 2030 projected | 36.20 | 25.50 | 14.20 | Projected |

### Incretin Market Share

| Period | U.S. Lilly share | International Lilly share | Label |
| --- | ---: | ---: | --- |
| Q1 2026 | 60.1% | 53.2% | Official market-share metric from Lilly presentation |
| 2027 projected | 62.0% | 55.0% | Scenario projection |
| 2028 projected | 63.0% | 56.5% | Scenario projection |
| 2029 projected | 63.5% | 57.5% | Scenario projection |
| 2030 projected | 64.0% | 58.0% | Scenario projection |

## Default Valuation Output

| Metric | Default output | Formula | Label |
| --- | ---: | --- | --- |
| 2030 projected revenue | $111.25B | Sum of segment revenue | Projected |
| 2030 projected performance income | $53.40B | Revenue x 48% performance margin | Projected |
| 2030 projected EPS | $59.67 | $53.40B / 0.895B shares | Scenario valuation |
| 2030 projected market cap | $2.03T | $53.40B x 38 P/E | Scenario valuation |
| 2030 implied share price | $2,268 | $2.03T / 0.895B shares | Scenario valuation |
| 2025-2030 revenue CAGR | 11.3% | $65.18B to $111.25B over five years | Model-derived |
| 2030 GLP-1 franchise share of revenue | 68% | Mounjaro + Zepbound + Foundayo / total revenue | Model-derived |

## Source Links

- [Eli Lilly 2025 Form 10-K](https://investor.lilly.com/static-files/0d64699c-0cc7-490e-9152-b2ba1de08634) - official historical revenue and product revenue.
- [Eli Lilly Q1 2026 earnings release](https://investor.lilly.com/node/54176) - official Q1 2026 actuals, updated 2026 guidance, performance-margin guidance, and share-count assumption.
- [Eli Lilly Q1 2026 earnings presentation](https://investor.lilly.com/static-files/587c9bd3-6551-45c3-989d-ab60c49036bb) - key product revenue and incretin market share operating metrics.
- [Fierce Pharma coverage of Evaluate Pharma 2030 forecasts](https://www.fiercepharma.com/pharma/2030-eli-lilly-will-generate-113b-drug-sales-including-62b-mounjaro-zepbound-evaluate) - Mounjaro and Zepbound 2030 default targets.
- [S&P Global Market Intelligence coverage of Visible Alpha Foundayo forecasts](https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/wegovy-s-early-lead-to-narrow-as-eli-lilly-prepares-foundayo-launch) - Foundayo 2027 and 2030 sales reference points.
- [Statista 2030 pharma sales forecast](https://www.statista.com/statistics/1315643/sales-forecast-of-leading-pharmaceutical-companies-globally/) - broad 2030 Lilly sales context.

## Caveats

- Product-level earnings are not reported by Lilly and are model-derived.
- Foundayo projection defaults are uncertain because the product launched in 2026.
- The default P/E multiple is a scenario assumption, not an analyst consensus price target.
- The model does not explicitly forecast acquired IPR&D, special charges, tax changes, foreign exchange, policy changes, or future share repurchases beyond the diluted share-count input.
