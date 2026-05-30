# Tesla (TSLA) Projected Financial Data

Last updated: 2026-05-30

Scope: default projection assumptions currently used by the greaux Tesla page. These are scenario-model defaults, not Tesla guidance and not investment advice.

App source:
- `src/data.js`
- `src/pages/Tesla.jsx`

Units:
- Revenue, earnings, valuation, and market cap figures are USD billions unless otherwise noted.
- Robotaxi ride counts are annual rides.
- Optimus unit counts are annual humanoid robots sold.
- Share count is diluted shares outstanding in billions.

## Source Links

- Tesla FY 2025 Form 10-K: https://www.sec.gov/Archives/edgar/data/1318605/000162828026003952/tsla-20251231.htm
- Tesla investor relations SEC filings: https://ir.tesla.com/sec-filings
- Tesla Q4 and FY 2025 Update: https://ir.tesla.com/_flysystem/s3/sec/000162828026003837/tsla-20260128-gen.pdf
- ARK Invest Tesla 2029 valuation model: https://www.ark-invest.com/articles/valuation-models/arks-tesla-price-target-2029
- ARK Invest Tesla valuation model repository: https://github.com/arkinvest/ark-invest-tesla-valuation-model
- Axios Tesla Cybercab and Optimus event recap: https://www.axios.com/2024/10/11/tesla-robotaxi-tesla-cybercab-we-robot-musk
- Axios Optimus autonomy and price context: https://www.axios.com/2024/10/17/elon-musk-tesla-optimus-humanoid-robot
- Joe Tegtmeyer X post with Giga Texas Cybercab count: https://x.com/JoeTegtmeyer/status/2043825656631619687
- TechSpot Cybercab production and continuous manufacturing context: https://www.techspot.com/news/112198-tesla-moves-cybercab-concept-factory-floor-but-lowers.html

## Projection Philosophy

The greaux default Tesla case is intentionally more conservative than highly bullish Robotaxi-centered models such as ARK's 2029 Tesla valuation work. It keeps the existing automotive, energy, and services businesses as the dominant default revenue base while adding early Robotaxi and Optimus revenue ramps.

The page currently uses 2020-2024 reported history as the model base and projects 2025-2029. If the app is later rebased to 2025 reported actuals, update this file and `src/data.js` together.

## Default Input Assumptions

| App field | Default | Source basis | Notes |
| --- | ---: | --- | --- |
| `autoCAGR` | 12% | Tesla SEC filings and conservative scenario calibration | Automotive growth is modeled as a rebound from the 2024 base, well below ARK's Robotaxi-driven valuation intensity. |
| `energyCAGR` | 30% | Tesla FY 2025 Form 10-K and ARK energy-storage discussion | Tesla reported 27% energy revenue growth in 2025 and 46.7 GWh of storage deployments; ARK expects storage growth to outpace vehicle growth. |
| `svcCAGR` | 18% | Tesla FY 2025 Form 10-K | Tesla reported services and other revenue up 19% in 2025; the default rounds slightly below that rate. |
| `rides2027` | 50,000,000 | ARK Robotaxi model and Tesla Cybercab timing references | Conservative early-scale paid ride scenario. |
| `rides2028` | 200,000,000 | ARK Robotaxi model and Tesla Cybercab timing references | Scenario ramp, not Tesla guidance. |
| `rides2029` | 600,000,000 | ARK Robotaxi model and Tesla Cybercab timing references | Still materially smaller than bullish Robotaxi network cases. |
| `revenuePerRide` | $2.50 | ARK ride-hail economics as directional reference | Represents Tesla platform revenue per ride, not gross fare. |
| `optimusSold2027` | 50,000 | Tesla roadmap and Optimus commercialization commentary | Early external sales scenario after initial production ramp. |
| `optimusSold2028` | 200,000 | Tesla roadmap and Optimus commercialization commentary | Scenario ramp below stated eventual capacity ambitions. |
| `optimusSold2029` | 500,000 | Tesla roadmap and Optimus commercialization commentary | Scenario ramp below Tesla's stated long-term humanoid scale. |
| `optimusASP` | $25,000 | Axios recap of Musk's $20k-$30k Optimus target | Midpoint of the public target range. |
| `autoMargin` | 10% | Tesla reported automotive gross margin and net-profit calibration | Net margin assumption below reported automotive gross margin to account for operating expenses and taxes. |
| `energyMargin` | 15% | Tesla reported energy gross margin and net-profit calibration | Net margin assumption below reported energy gross margin. |
| `svcMargin` | 12% | Tesla services growth and margin trend | Scenario margin for services, charging, insurance, used vehicles, and other grouped revenue. |
| `roboMargin` | 65% | ARK Robotaxi model directionally supports high software/network margins | High-margin platform assumption; very sensitive to autonomy adoption and utilization. |
| `optimusMargin` | 20% | Hardware-product scenario margin | Assumes scaled manufacturing but not software-like margins. |
| `sharesB` | 3.2 | Tesla SEC filings, rounded | Diluted shares outstanding assumption used for share-price math. |
| `valuationMethod` | `ps` | Scenario choice | Uses revenue multiple by default because early Robotaxi and Optimus earnings are uncertain. |
| `psRatio` | 8x | High-growth public-company scenario multiple | Produces a base-case valuation below ARK's 2029 share-price target. |
| `peRatio` | 80x | High-growth earnings-multiple scenario | Alternative input when users switch to P/E. |

## Default Revenue Projection Output

| Year | Automotive | Energy & Storage | Services & Other | Robotaxi | Optimus | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 2025 | 86.35 | 13.13 | 11.92 | 0.00 | 0.00 | 111.40 |
| 2026 | 96.71 | 17.07 | 14.06 | 0.00 | 0.00 | 127.84 |
| 2027 | 108.32 | 22.19 | 16.59 | 0.13 | 1.25 | 148.48 |
| 2028 | 121.32 | 28.85 | 19.58 | 0.50 | 5.00 | 175.25 |
| 2029 | 135.88 | 37.50 | 23.11 | 1.50 | 12.50 | 210.49 |

## Default Earnings Projection Output

| Year | Automotive | Energy & Storage | Services & Other | Robotaxi | Optimus | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 2025 | 8.63 | 1.97 | 1.43 | 0.00 | 0.00 | 12.03 |
| 2026 | 9.67 | 2.56 | 1.69 | 0.00 | 0.00 | 13.92 |
| 2027 | 10.83 | 3.33 | 1.99 | 0.08 | 0.25 | 16.48 |
| 2028 | 12.13 | 4.33 | 2.35 | 0.33 | 1.00 | 20.14 |
| 2029 | 13.59 | 5.63 | 2.77 | 0.97 | 2.50 | 25.46 |

## Default Valuation Output

| Metric | Default output | Notes |
| --- | ---: | --- |
| 2024 revenue base used by app | 97.3 | Sum of 2024 automotive, energy, and services history in `src/data.js`. |
| 2029 projected revenue | 210.49 | Sum of all modeled segments. |
| 2024-2029 revenue CAGR | 16.7% | Calculated from 2024 app revenue base to 2029 projected revenue. |
| 2029 projected earnings | 25.46 | Segment revenue multiplied by default net margin assumptions. |
| Valuation method | P/S | Default app setting. |
| P/S multiple | 8x | User-editable default. |
| 2029 projected company valuation | 1,683.92 | 2029 projected revenue multiplied by 8x. |
| Diluted shares | 3.2 | User-editable default. |
| 2029 projected share price | $526 | Projected valuation divided by diluted shares. |
| Implied P/E | 66.1x | Projected valuation divided by projected earnings. |

## Product Chart Projection Defaults

Product chart projections are shown with lighter/dashed bars in the app. They are operating-metric scenarios, not Tesla guidance.

### Vehicle Deliveries

The vehicle deliveries chart uses Tesla reported deliveries through 2025 as the actual history. The forward years are a greaux base-case unit ramp from 1.64M total deliveries in 2025 to 2.54M in 2029, approximately 11.6% CAGR. This is intentionally close to the app's default automotive revenue CAGR and remains below the kind of Robotaxi-led upside embedded in ARK's 2029 Tesla valuation work.

| Year | Model 3/Y actual | Other actual | Model 3/Y projected | Other projected | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| 2020 | 0.443M | 0.057M | - | - | 0.500M |
| 2021 | 0.911M | 0.025M | - | - | 0.936M |
| 2022 | 1.247M | 0.067M | - | - | 1.314M |
| 2023 | 1.740M | 0.069M | - | - | 1.809M |
| 2024 | 1.704M | 0.085M | - | - | 1.789M |
| 2025 | 1.585M | 0.051M | - | - | 1.636M |
| 2026 | - | - | 1.740M | 0.070M | 1.810M |
| 2027 | - | - | 1.920M | 0.100M | 2.020M |
| 2028 | - | - | 2.120M | 0.140M | 2.260M |
| 2029 | - | - | 2.340M | 0.200M | 2.540M |

### Energy Storage Deployments

The energy storage deployment chart uses Tesla reported storage deployments through 2025 as actual history. The projection applies the app's 30% default energy growth rate to the 2025 deployment base, supported directionally by Tesla's 49% 2025 storage deployment growth, Megapack capacity expansion, and ARK's expectation that storage can grow faster than vehicle volume.

| Year | Actual deployments | Projected deployments |
| --- | ---: | ---: |
| 2020 | 3.0 GWh | - |
| 2021 | 4.0 GWh | - |
| 2022 | 6.5 GWh | - |
| 2023 | 14.7 GWh | - |
| 2024 | 31.4 GWh | - |
| 2025 | 46.7 GWh | - |
| 2026 | - | 60.7 GWh |
| 2027 | - | 78.9 GWh |
| 2028 | - | 102.5 GWh |
| 2029 | - | 133.3 GWh |

## Product Chart: Robotaxis Produced

This chart is an operating-metric visualization, not an official Tesla production disclosure. The April 2026 anchor uses Joe Tegtmeyer's X-based Giga Texas observation of about 53 Cybercabs visible in groups and driving around the outbound lot, plus about a dozen more at crash testing. The app rounds this to 65 observed Cybercabs for the April 2026 bar.

Forward months are scenario projections. They assume a slow early S-curve ramp as Cybercab production moves from observed low-volume builds toward higher monthly output.

| Month | Units produced | Source type | Source basis | Notes |
| --- | ---: | --- | --- | --- |
| Apr. 2026 | 65 | X researcher estimate | Joe Tegtmeyer Giga Texas flyover | Observed count, not official Tesla production. |
| May 2026 | 90 | Scenario assumption | Greaux projection | First projected month after the observed X count. |
| Jun. 2026 | 135 | Scenario assumption | Greaux projection | Assumes early ramp improvement. |
| Jul. 2026 | 200 | Scenario assumption | Greaux projection | Assumes production learning and validation continue. |
| Aug. 2026 | 300 | Scenario assumption | Greaux projection | Assumes gradual S-curve acceleration. |
| Sep. 2026 | 450 | Scenario assumption | Greaux projection | Fifth projected month after the observed X count. |

## Caveats

- Tesla does not provide guidance for Robotaxi rides, Optimus external sales, Optimus ASP, or long-term segment net margins in the structure used by greaux.
- Tesla has not officially reported monthly Cybercab production counts in the structure used by the product chart.
- The Robotaxis produced chart uses an X researcher observation and should not be treated as an official production number.
- ARK's published 2029 Tesla valuation is much more bullish than the greaux defaults, especially around Robotaxi contribution. The default case here is intentionally a lower-intensity base case.
- Tesla's reported 2025 actuals are documented in `known-revenue-and-product-numbers.md`; the current app model still starts from 2024 history.
- Revisit this file whenever `src/data.js` defaults change.
