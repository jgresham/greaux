# Uniswap Known Revenue And Product Numbers

## Summary

Uniswap is a decentralized exchange protocol, not a reporting company. It does not publish audited revenue, net income, token-holder earnings, or product sales statements in the way a public company does.

This file therefore stores only official Uniswap-published facts that define the fee mechanics used by the app. Third-party historical fee, volume, TVL, market-cap, and token-supply data used as model inputs live in `projected-financial-data.md`.

## Known Official Historical Data

| Period | Metric | Value | Segment/Product | Source | Notes |
| --- | --- | ---: | --- | --- | --- |
| Current Uniswap docs, accessed 2026-05-30 | v2 LP fee when protocol fee is active | 0.25% of swap volume | Swap fees | [Uniswap protocol fee docs](https://developers.uniswap.org/contracts/protocol-fee/fee-setting-rational) | Official docs say the protocol fee redirects part of swap fees away from LPs. |
| Current Uniswap docs, accessed 2026-05-30 | v2 protocol fee when enabled | 0.05% of swap volume | Fee switch | [Uniswap protocol fee docs](https://developers.uniswap.org/contracts/protocol-fee/fee-setting-rational) | This is 5 bps, not 0.5%. |
| Current Uniswap docs, accessed 2026-05-30 | v3 0.01% tier split | 0.0075% LP / 0.0025% protocol | Fee switch | [Uniswap protocol fee docs](https://developers.uniswap.org/contracts/protocol-fee/fee-setting-rational) | Applies to configured pools in the current rollout. |
| Current Uniswap docs, accessed 2026-05-30 | v3 0.05% tier split | 0.0375% LP / 0.0125% protocol | Fee switch | [Uniswap protocol fee docs](https://developers.uniswap.org/contracts/protocol-fee/fee-setting-rational) | Applies to configured pools in the current rollout. |
| Current Uniswap docs, accessed 2026-05-30 | v3 0.30% tier split | 0.25% LP / 0.05% protocol | Fee switch | [Uniswap protocol fee docs](https://developers.uniswap.org/contracts/protocol-fee/fee-setting-rational) | Matches the default fee-switch input in the app. |
| Current Uniswap docs, accessed 2026-05-30 | v3 1.00% tier split | 0.8334% LP / 0.1666% protocol | Fee switch | [Uniswap protocol fee docs](https://developers.uniswap.org/contracts/protocol-fee/fee-setting-rational) | Applies to configured pools in the current rollout. |
| Uniswap Labs support article updated 2026-01-20 | Uniswap Labs interface fee | 0% | Interface and wallet | [Uniswap Labs fee support article](https://support.uniswap.org/hc/en-us/articles/20131678274957-What-are-Uniswap-Labs-fees) | Separate from protocol fees voted on by governance. |

## Product Or Segment Drivers

| Driver | Officially reported? | How the app uses it |
| --- | --- | --- |
| Swap fees paid by swappers | Mechanism reported; aggregate dollars not officially reported here | App treats total swap fees as gross revenue-like activity. |
| LP fees | Mechanism reported; aggregate dollars not officially reported here | App shows LP fees as part of gross fee revenue but excludes them from earnings. |
| Protocol fee switch | Official fee mechanics reported | App uses 0.05% of swap volume as the default protocol capture assumption. |
| Uniswap Labs interface fee | Official fee level reported | App models this as 0% and does not add a separate Labs fee stream. |

## Operating Metrics

Uniswap does not publish an official annual audited series for DEX volume, total swap fees, or TVL in this file. The dashboard uses DefiLlama third-party historical data for those operating metrics, documented in `projected-financial-data.md`.

## Source Links

- [Uniswap protocol fee configuration](https://developers.uniswap.org/contracts/protocol-fee/fee-setting-rational) - official protocol fee split table and current rollout mechanics.
- [Uniswap Labs fee support article](https://support.uniswap.org/hc/en-us/articles/20131678274957-What-are-Uniswap-Labs-fees) - official Uniswap Labs interface fee status.

## Caveats

- Uniswap is a protocol, not a public issuer with SEC-filed revenue and earnings statements.
- The app's historical dollar values for fees, volume, TVL, UNI supply, market cap, and FDV are third-party or market data, not official company-reported numbers.
- "Earnings" in the app means modeled fee-switch capture routed to protocol-controlled fee collection, excluding LP fees.
