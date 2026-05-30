# Uniswap Projected Financial Data

## Summary

This file stores the third-party historical baselines, projection assumptions, and default outputs used by the Uniswap page in greaux. These are not official Uniswap revenue or earnings statements.

The app models:

- Revenue: total swap fees paid by swappers, split between LP fees and protocol fee-switch capture.
- Earnings: fee-switch capture only, excluding LP fees.
- Valuation: 2030 fee-switch capture multiplied by a protocol fee-capture multiple, then divided by circulating UNI supply for an implied UNI price.

## App Source Files

Update these together when changing the default model:

- `src/pages/Uniswap.jsx`
- `src/pages/Home.jsx`
- `src/components/PageMeta.jsx`
- `financial-data/uni-uniswap/known-revenue-and-product-numbers.md`
- `financial-data/uni-uniswap/projected-financial-data.md`

## Third-Party Historical Baselines Used By The App

Data was fetched on 2026-05-30 from DefiLlama APIs and aggregated by calendar year. The app uses 2021-2025 as the latest complete-year history and projects 2026-2030.

| Year | Swap volume ($B) | Total swap fees ($B) | Year-end TVL ($B) | Source | Label |
| --- | ---: | ---: | ---: | --- | --- |
| 2021 | 644.8 | 1.576 | 8.40 | DefiLlama fees, DEX volume, and TVL APIs | Third-party historical |
| 2022 | 581.1 | 0.828 | 3.31 | DefiLlama fees, DEX volume, and TVL APIs | Third-party historical |
| 2023 | 422.8 | 0.598 | 3.73 | DefiLlama fees, DEX volume, and TVL APIs | Third-party historical |
| 2024 | 712.0 | 1.095 | 5.90 | DefiLlama fees, DEX volume, and TVL APIs | Third-party historical |
| 2025 | 1,021.6 | 1.057 | 4.01 | DefiLlama fees, DEX volume, and TVL APIs | Third-party historical |
| 2026 YTD through 2026-05-30 | 241.3 | 0.253 | 3.26 latest | DefiLlama fees, DEX volume, and TVL APIs | Third-party partial-year context, not used as app baseline |

## Current UNI Market Inputs

CoinGecko data fetched on 2026-05-30:

| Metric | Value | Source | Label |
| --- | ---: | --- | --- |
| UNI price | $3.06 | [CoinGecko UNI page](https://www.coingecko.com/en/coins/uniswap) | Third-party market data |
| UNI market cap | $1.95B | [CoinGecko UNI page](https://www.coingecko.com/en/coins/uniswap) | Third-party market data |
| UNI fully diluted valuation | $2.74B | [CoinGecko UNI page](https://www.coingecko.com/en/coins/uniswap) | Third-party market data |
| Circulating UNI supply | 0.636B UNI | [CoinGecko UNI page](https://www.coingecko.com/en/coins/uniswap) | Third-party market data |
| Total UNI supply | 0.895B UNI | [CoinGecko UNI page](https://www.coingecko.com/en/coins/uniswap) | Third-party market data |

## Default Projection Inputs

| Input | Default | Source/Rationale | Label |
| --- | ---: | --- | --- |
| Swap volume CAGR | 10.0% | Scenario assumption using 2025 DefiLlama volume as the base year; chosen as a moderate base case for DEX growth. | Scenario assumption |
| Average swap fee | 10.4 bps | Model-derived from the recent relationship between DefiLlama total fees and DEX volume, near the 2025 average. | Model-derived |
| Protocol fee switch | 0.05% of swap volume | Official Uniswap docs list 0.05% protocol capture on v2 and common 0.30% v3 pools when protocol fees are active. | Official mechanism used as scenario default |
| TVL CAGR | 8.0% | Scenario assumption from the 2025 year-end DefiLlama TVL baseline. | Scenario assumption |
| 2030 fee-capture multiple | 20x | Scenario valuation multiple applied to fee-switch capture; intended as a base case for a cash-flowing protocol. | Scenario assumption |
| Circulating UNI supply | 0.636B UNI | CoinGecko circulating supply fetched 2026-05-30. | Third-party market data |
| Uniswap Labs interface fee | 0% | Official Uniswap Labs support article says interface fees are 0% as of December 27, 2025. | Official mechanism |

## Default Revenue Projection

Revenue means total swap fees paid by swappers. The app splits those fees between LP fees and fee-switch capture. Historical fee-switch capture is shown as a counterfactual using the selected fee-switch rate when the active collection history is not separately modeled.

The app labels the earnings chart with an asterisk because the historical earnings bars are modeled as if the selected fee switch applied across the period. Official Uniswap docs describe protocol fees as active in the current rollout for all v2 pools and selected v3 pools, but current capture still depends on governance-configured pools and fee adapters.

| Year | Swap volume ($B) | Total swap fees / revenue ($B) | LP fees ($B) | Fee-switch capture ($B) | Label |
| --- | ---: | ---: | ---: | ---: | --- |
| 2021 | 644.8 | 1.576 | 1.253 | 0.322 | Third-party historical with scenario split |
| 2022 | 581.1 | 0.828 | 0.538 | 0.291 | Third-party historical with scenario split |
| 2023 | 422.8 | 0.598 | 0.386 | 0.211 | Third-party historical with scenario split |
| 2024 | 712.0 | 1.095 | 0.739 | 0.356 | Third-party historical with scenario split |
| 2025 | 1,021.6 | 1.057 | 0.546 | 0.511 | Third-party historical with scenario split |
| 2026 projected | 1,123.8 | 1.169 | 0.607 | 0.562 | Projected |
| 2027 projected | 1,236.1 | 1.286 | 0.668 | 0.618 | Projected |
| 2028 projected | 1,359.7 | 1.414 | 0.734 | 0.680 | Projected |
| 2029 projected | 1,495.7 | 1.556 | 0.808 | 0.748 | Projected |
| 2030 projected | 1,645.3 | 1.711 | 0.888 | 0.823 | Projected |

## Default Earnings Projection

Earnings exclude LP fees. Earnings are modeled as protocol fee-switch capture only.

| Year | Protocol earnings ($B) | Formula | Label |
| --- | ---: | --- | --- |
| 2021 | 0.322 | Min(total swap fees, swap volume x 0.05%) | Counterfactual historical scenario |
| 2022 | 0.291 | Min(total swap fees, swap volume x 0.05%) | Counterfactual historical scenario |
| 2023 | 0.211 | Min(total swap fees, swap volume x 0.05%) | Counterfactual historical scenario |
| 2024 | 0.356 | Min(total swap fees, swap volume x 0.05%) | Counterfactual historical scenario |
| 2025 | 0.511 | Min(total swap fees, swap volume x 0.05%) | Counterfactual historical scenario |
| 2026 projected | 0.562 | Min(projected swap fees, projected swap volume x 0.05%) | Projected |
| 2027 projected | 0.618 | Min(projected swap fees, projected swap volume x 0.05%) | Projected |
| 2028 projected | 0.680 | Min(projected swap fees, projected swap volume x 0.05%) | Projected |
| 2029 projected | 0.748 | Min(projected swap fees, projected swap volume x 0.05%) | Projected |
| 2030 projected | 0.823 | Min(projected swap fees, projected swap volume x 0.05%) | Projected |

## Operating-Metric Chart Defaults

Every time-series chart includes five projection points beyond the latest complete historical year.

| Year | DEX volume ($B) | TVL ($B) | Label |
| --- | ---: | ---: | --- |
| 2021 | 644.8 | 8.40 | Third-party historical |
| 2022 | 581.1 | 3.31 | Third-party historical |
| 2023 | 422.8 | 3.73 | Third-party historical |
| 2024 | 712.0 | 5.90 | Third-party historical |
| 2025 | 1,021.6 | 4.01 | Third-party historical |
| 2026 projected | 1,123.8 | 4.33 | Projected |
| 2027 projected | 1,236.1 | 4.68 | Projected |
| 2028 projected | 1,359.7 | 5.05 | Projected |
| 2029 projected | 1,495.7 | 5.45 | Projected |
| 2030 projected | 1,645.3 | 5.89 | Projected |

## Default Valuation Output

| Metric | Default output | Formula | Label |
| --- | ---: | --- | --- |
| 2030 protocol earnings | $0.823B | 2030 fee-switch capture | Projected |
| 2030 UNI/protocol value | $16.45B | $0.823B x 20 | Scenario valuation |
| Implied UNI price | $25.87 | $16.45B / 0.636B UNI | Scenario valuation |
| Fee CAGR | 10.1% | 2025 total swap fees to 2030 total swap fees | Model-derived |

## Source Links

- [Uniswap protocol fee configuration](https://developers.uniswap.org/contracts/protocol-fee/fee-setting-rational) - official fee split and 0.05% protocol-fee mechanics.
- [Uniswap Labs fee support article](https://support.uniswap.org/hc/en-us/articles/20131678274957-What-are-Uniswap-Labs-fees) - official 0% interface-fee status.
- [DefiLlama Uniswap fees page](https://defillama.com/fees/uniswap) - third-party fee dashboard.
- [DefiLlama fees API](https://api.llama.fi/summary/fees/uniswap?dataType=dailyFees) - daily fee series used for annual aggregates.
- [DefiLlama DEX volume API](https://api.llama.fi/summary/dexs/uniswap?excludeTotalDataChart=false&excludeTotalDataChartBreakdown=false) - daily DEX volume series used for annual aggregates.
- [DefiLlama Uniswap TVL API](https://api.llama.fi/protocol/uniswap) - historical TVL series used for year-end TVL.
- [CoinGecko UNI page](https://www.coingecko.com/en/coins/uniswap) - UNI price, market cap, FDV, and supply inputs.

## Caveats

- DefiLlama values are third-party analytics, not official Uniswap financial statements.
- The current app does not separately model Uniswap Labs interface fees because the official support article lists them at 0%.
- Fee-switch capture is capped at total swap fees in the app, so users cannot model protocol capture greater than fees paid by swappers.
- The earnings chart is not a historical statement of UNI-holder distributions; it is modeled fee-switch capture, with pre-rollout periods shown counterfactually.
- The default multiple is a scenario assumption, not an analyst consensus price target.
