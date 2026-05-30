# SpaceX Projected Financial Data

Last updated: 2026-05-30

Scope: default projection assumptions currently used by the greaux SpaceX page. SpaceX is private, so all financial baselines, segment splits, margins, and valuation outputs should be treated as estimates or scenario assumptions.

App source:
- `src/pages/SpaceX.jsx`

Units:
- Revenue, earnings, and valuation figures are USD billions unless otherwise noted.
- Growth rates and margins are annual percentages.

## Source Links

- Sacra SpaceX revenue, valuation, and funding profile: https://sacra.com/c/spacex/
- Sacra SpaceX valuation scenarios: https://sacra.com/c/spacex/valuation/
- Payload SpaceX 2024 revenue estimate: https://payloadspace.com/estimating-spacexs-2024-revenue/
- Space Exploration Technologies Corp. S-1 filed May 20, 2026: https://www.sec.gov/Archives/edgar/data/1181412/000162828026036936/spaceexplorationtechnologi.htm
- Advanced Television summary of Quilty Space Starlink 2026 forecast: https://www.advanced-television.com/2026/03/24/forecast-spacex-tracking-to-20bn-revenue-in-2026/
- ARK Invest SpaceX 2030 valuation model: https://www.ark-invest.com/articles/valuation-models/ark-expected-value-spacex-2030
- Space.com 2025 SpaceX launch cadence recap: https://www.space.com/space-exploration/private-spaceflight/spacex-shatters-its-rocket-launch-record-yet-again-167-orbital-flights-in-2025
- SpaceXNow launch statistics: https://spacexnow.com/stats
- Via Satellite Starlink 1M subscriber milestone: https://www.satellitetoday.com/connectivity/2022/12/19/spacex-starlink-internet-service-surpasses-1m-subscribers/
- Starlink subscriber milestone table and official-post references: https://en.wikipedia.org/wiki/Starlink#Subscribers

## Projection Philosophy

The greaux default SpaceX case starts with Sacra's estimated 2025 total revenue and Starlink revenue, uses Payload's 2024 model as a directional cross-check for launch and government demand, and keeps Starship as a scenario input because it has no mature recurring revenue base.

The valuation default uses a revenue multiple because SpaceX is private, reinvests heavily, and does not publish audited net income by segment.

## Default 2025 Revenue Baseline

| Segment | 2025 default revenue | Source basis | Notes |
| --- | ---: | --- | --- |
| Starlink | 11.40 | Sacra | Largest reported-estimate operating signal in the model. |
| Launch Services | 4.10 | Sacra and Payload | Payload estimated 2024 launch revenue at $4.2B; greaux uses $4.1B as the 2025 launch baseline in the current app. |
| Government Systems | 2.10 | Payload and Sacra | Directional bucket for Starshield, national-security, civil, and other government systems work. |
| Dragon | 1.10 | Payload model components and public crew/cargo cadence | Stable crew/cargo scenario bucket. |
| Starship | 0.00 | Scenario assumption | Development-stage business line; current model starts revenue at zero. |
| Total | 18.70 | Sacra | Matches Sacra's estimated 2025 SpaceX revenue. |

## Default Input Assumptions

| App field | Default | Source basis | Notes |
| --- | ---: | --- | --- |
| `starlinkCAGR` | 24% | Sacra, Payload, and public Starlink customer milestones | Below Sacra's more aggressive base/bull growth scenarios; reflects continued subscriber and enterprise/government growth with deceleration. |
| `launchCAGR` | 12% | Payload launch model and launch cadence sources | Payload estimated launch revenue grew 19% in 2024; default assumes slower forward growth because many launches are internal Starlink missions. |
| `govCAGR` | 18% | Payload government and defense demand notes | Government systems remain a fast-growth bucket, but below Starlink's default growth rate. |
| `dragonCAGR` | 7% | Public crew/cargo cadence and mature-service calibration | Mature, lower-growth service line. |
| `starship2030Revenue` | 6.00 | Scenario assumption | Illustrative 2030 revenue target; not company guidance. |
| `starlinkMargin` | 30% | Sacra Starlink profitability commentary and model calibration | Lower than some operating-profit estimates to allow for corporate costs and reinvestment. |
| `launchMargin` | 18% | Private-company scenario margin | Launch economics are helped by reuse but offset by internal launches and development spending. |
| `govMargin` | 16% | Private-company scenario margin | Government systems can be profitable but are modeled below Starlink. |
| `dragonMargin` | 12% | Mature-service scenario margin | Stable but lower-growth service line. |
| `starshipMargin` | -35% | Development-stage scenario margin | Assumes Starship remains investment-heavy through the projection window. |
| `valuationSalesMultiple` | 18.5x | Sacra 2025 valuation/revenue relationship | Rounded from Sacra's estimated 2025 valuation divided by estimated 2025 revenue; user-editable. |

## Default Revenue Projection Output

| Year | Starlink | Launch Services | Government Systems | Dragon | Starship | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 2025e | 11.40 | 4.10 | 2.10 | 1.10 | 0.00 | 18.70 |
| 2026 | 14.14 | 4.59 | 2.48 | 1.18 | 0.18 | 22.57 |
| 2027 | 17.53 | 5.14 | 2.92 | 1.26 | 0.48 | 27.33 |
| 2028 | 21.74 | 5.76 | 3.45 | 1.35 | 1.20 | 33.50 |
| 2029 | 26.95 | 6.45 | 4.07 | 1.44 | 3.00 | 41.91 |
| 2030 | 33.42 | 7.23 | 4.80 | 1.54 | 6.00 | 52.99 |

## Default Earnings Projection Output

| Year | Starlink | Launch Services | Government Systems | Dragon | Starship | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 2025e | 3.42 | 0.74 | 0.34 | 0.13 | 0.00 | 4.63 |
| 2026 | 4.24 | 0.83 | 0.40 | 0.14 | -0.06 | 5.55 |
| 2027 | 5.26 | 0.93 | 0.47 | 0.15 | -0.17 | 6.64 |
| 2028 | 6.52 | 1.04 | 0.55 | 0.16 | -0.42 | 7.85 |
| 2029 | 8.09 | 1.16 | 0.65 | 0.17 | -1.05 | 9.02 |
| 2030 | 10.03 | 1.30 | 0.77 | 0.18 | -2.10 | 10.18 |

## Default Valuation Output

| Metric | Default output | Notes |
| --- | ---: | --- |
| 2025 estimated revenue base | 18.70 | Current app baseline. |
| 2030 projected revenue | 52.99 | Sum of all modeled segments. |
| 2025-2030 revenue CAGR | 23.2% | Calculated from estimated 2025 revenue to 2030 projected revenue. |
| 2030 projected earnings | 10.18 | Segment revenue multiplied by default margin assumptions. |
| Valuation revenue multiple | 18.5x | User-editable default. |
| 2030 projected company valuation | 980.32 | Projected 2030 revenue multiplied by 18.5x. |
| Starlink share of 2030 revenue | 63.1% | Starlink projected revenue divided by total projected revenue. |

## Product Chart Projection Defaults

Product chart projections are shown with lighter/dashed bars in the app. They are operating-metric scenarios, not SpaceX guidance.

### Launch Cadence

The launch cadence chart keeps the current 2020-2025 public annual-launch history, then projects a base-case ramp from 165 launches in 2025 to 315 launches in 2030. This assumes continued Falcon reuse, Starlink deployment demand, and a gradual Starship contribution, but stays below highly aggressive Starship-dominant cadence cases.

| Year | Actual launches | Projected launches |
| --- | ---: | ---: |
| 2020 | 25 | - |
| 2021 | 31 | - |
| 2022 | 61 | - |
| 2023 | 96 | - |
| 2024 | 134 | - |
| 2025 | 165 | - |
| 2026 | - | 185 |
| 2027 | - | 210 |
| 2028 | - | 240 |
| 2029 | - | 275 |
| 2030 | - | 315 |

### Starlink Active Customers

The Starlink customer chart uses public milestones through February 2026 as actual history. The 2026 projection anchors to Quilty Space's 16.8M year-end subscriber forecast, then uses a decelerating growth path to 56M active customers by 2030. This is far below very high long-term LEO-market upside scenarios, but preserves the rapid scaling direction in Sacra, Payload, Quilty, and ARK-style SpaceX work.

| Date | Actual customers | Projected customers |
| --- | ---: | ---: |
| Jan. 2022 | 0.145M | - |
| Dec. 2022 | 1.0M | - |
| Dec. 2023 | 2.3M | - |
| Dec. 2024 | 4.6M | - |
| Dec. 2025 | 9.0M | - |
| Feb. 2026 | 10.0M | - |
| Dec. 2026 | - | 16.8M |
| Dec. 2027 | - | 24.0M |
| Dec. 2028 | - | 33.0M |
| Dec. 2029 | - | 44.0M |
| Dec. 2030 | - | 56.0M |

### Payload Mass Launched

The payload mass chart uses the SpaceX S-1 "Mass to Orbit" annual values for 2023-2025. Forward years use a base-case projection that combines the launch cadence scenario with rising average mass per launch as Starlink V2/V3 and Starship contribute more payload capacity. This is a model-derived projection, not an official SpaceX forecast.

| Year | Actual mass to orbit | Projected mass to orbit |
| --- | ---: | ---: |
| 2023 | 1,210 metric tons | - |
| 2024 | 1,699 metric tons | - |
| 2025 | 2,213 metric tons | - |
| 2026 | - | 2,600 metric tons |
| 2027 | - | 3,300 metric tons |
| 2028 | - | 4,300 metric tons |
| 2029 | - | 5,600 metric tons |
| 2030 | - | 7,300 metric tons |

## Caveats

- SpaceX does not publish audited segment revenue, segment operating income, net income, or share count.
- Starship revenue and margin defaults are intentionally speculative.
- Product chart projections are operating-metric scenarios and are not company guidance.
- Sacra and Payload estimates can differ from other private-market estimates; if the app defaults change, update this file with the new source rationale.
- Revisit this file whenever `src/pages/SpaceX.jsx` defaults change.
