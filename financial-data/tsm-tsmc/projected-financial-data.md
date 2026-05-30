# TSMC Projected Financial Data

App source file: `src/pages/TSMC.jsx`

## Default Projection Inputs

| Input | Default Value | Source / Rationale |
| --- | --- | --- |
| HPC CAGR | 22% | AI chip demand from Nvidia (Blackwell/Rubin), AMD (MI series), Apple (M-series), Amazon (Trainium), Google (TPU), and Microsoft (Maia). TSMC is sole manufacturer at leading-edge. Source: TSMC investor day, analyst consensus. |
| Smartphone CAGR | 8% | Apple A-series, Qualcomm Snapdragon, MediaTek on 3nm/5nm. On-device AI driving migration to advanced nodes with ASP uplift. Source: IDC smartphone forecast, analyst consensus. |
| IoT CAGR | 10% | Edge AI inference, wearables, industrial automation. Source: IDC IoT forecast. |
| Automotive CAGR | 15% | ADAS, EV compute, in-cabin infotainment. Long qualification cycles but secular growth. Source: Gartner automotive chip forecast. |
| DCE & Other CAGR | 5% | DCE in secular decline; small overall category. Source: analyst consensus. |
| GAAP net margin | 40% | CY2024 was 40.5%. Near-monopoly on leading-edge foundry sustains pricing power; CoWoS packaging adds capacity and margin upside. Source: TSMC Annual Report CY2024. |
| P/E multiple | 20x | TSMC trades at a discount to US megacap tech due to geopolitical risk premium (Taiwan Strait). 20x is mid-range. Source: Bloomberg consensus. |
| ADS count | 5.19B | CY2024: ~25,929M ordinary shares ÷ 5 = ~5,186M ADS. TSMC has modest buybacks. Source: TSMC Form 20-F CY2024. |

## Default Revenue Projections (USD Billions)

| Year | HPC | Smartphone | IoT | Automotive | DCE & Other | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| CY2022 (actual) | 31.14 | 29.59 | 6.83 | 3.79 | 4.55 | 75.90 |
| CY2023 (actual) | 29.80 | 26.33 | 4.85 | 4.16 | 4.17 | 69.31 |
| CY2024 (actual) | 45.94 | 31.53 | 5.41 | 4.50 | 2.70 | 90.08 |
| CY2025 (projected) | 56.05 | 34.05 | 5.95 | 5.18 | 2.84 | 104.07 |
| CY2026 (projected) | 68.38 | 36.77 | 6.55 | 5.95 | 2.98 | 120.63 |
| CY2027 (projected) | 83.42 | 39.71 | 7.20 | 6.84 | 3.13 | 140.30 |
| CY2028 (projected) | 101.77 | 42.89 | 7.92 | 7.87 | 3.29 | 163.74 |
| CY2029 (projected) | 124.16 | 46.32 | 8.71 | 9.05 | 3.45 | 191.69 |

## Default Earnings Projections (40% net margin scenario)

| Year | Total Revenue | GAAP Net Income |
| --- | ---: | ---: |
| CY2029 (projected) | $191.7B | $76.7B |

## Default Valuation Output

- CY2029 EPS (ADS): $76.7B / 5.19B ADS = $14.78
- CY2029 ADS Price: $14.78 × 20x P/E = **$296**
- CY2029 Market Cap: $76.7B × 20x = $1.53T

## Operating Metric Charts

### HPC Platform Revenue History (CY2022–CY2024) + Projections

| Year | Value (USD B) | Type |
| --- | ---: | --- |
| CY2022 | 31.14 | actual |
| CY2023 | 29.80 | actual (inventory correction) |
| CY2024 | 45.94 | actual (+54% YoY; AI surge) |
| CY2025 | 56.0 | projected (22% CAGR default) |
| CY2026 | 68.3 | projected |
| CY2027 | 83.4 | projected |

### Advanced vs. Mature Node Revenue (CY2022–CY2024) + Projections

Advanced nodes defined as 7nm and below. Percentages from TSMC quarterly presentations.

| Year | Advanced (≤7nm) (USD B) | Mature (≥8nm) (USD B) | Type |
| --- | ---: | ---: | --- |
| CY2022 | 40.2 | 35.7 | actual (53% advanced) |
| CY2023 | 40.2 | 29.1 | actual (58% advanced) |
| CY2024 | 62.2 | 27.9 | actual (69% advanced) |
| CY2025 | 82.5 | 27.5 | projected |
| CY2026 | 104.0 | 26.5 | projected |
| CY2027 | 130.0 | 25.0 | projected |

## Sources

- TSMC Q4 2024 Management Report (January 2025) — platform revenue breakdown
- TSMC Form 6-K CY2024 (filed with SEC, January 2025)
- TSMC Form 20-F CY2024 — ADS structure, diluted share count
- TSMC Q4 2024 Investor Conference — node mix percentages
- IDC Worldwide Semiconductor Forecast, 2024 — end-market growth rates
- Gartner Semiconductor Forecast, 2024 — automotive chip growth
