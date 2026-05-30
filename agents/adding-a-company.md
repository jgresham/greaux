# Adding A Company To greaux

greaux is a company growth projection and visualization tool. New company or protocol pages should combine sourced financial history, transparent assumptions, and interactive revenue and profit projections.

## Placement

- Add source notes and financial references under `financial-data/<company-slug>/`.
- Use `financial-data/<ticker>-<company-slug>/` for public companies when a ticker is available, matching the existing `financial-data/tsla-tesla/` pattern.
- Use `financial-data/<company-slug>/` for private companies.
- For crypto networks, protocols, funds, or other non-corporate assets with a ticker, use the same ticker-slug pattern when it improves discoverability, such as `financial-data/uni-uniswap/`.
- Create both `known-revenue-and-product-numbers.md` and `projected-financial-data.md` in the company folder.
- `known-revenue-and-product-numbers.md` is only for known, officially reported numbers.
- `projected-financial-data.md` is for unknown, estimated, or modeled numbers used as projection defaults.
- Keep this guide in `agents/` and keep root `AGENTS.md` as the pointer future coding agents will see first.

## Required Deliverables

1. Create or update the landing-page card in `src/pages/Home.jsx`. The card description field should list the company's main product segments or revenue drivers only — for example `'Data Center · Gaming · Automotive · Instinct.'` Do not add adjectives, marketing language, or product taglines. No fluff.
2. Use the company's official logo or official wordmark treatment where practical.
3. Use an official or clearly brand-aligned accent color.
4. Create a company page with two bar charts:
   - Revenue projection by segment.
   - Profit, earnings, operating income, or contribution projection by segment.
5. Add user input fields for the main 2-6 products, services, or product categories the company sells.
6. Make the input fields section collapsible and collapsed by default.
7. Make the input fields update both charts and all relevant summary metrics.
8. Include a projected share price for public companies and/or a projected company valuation for every company page.
9. Add two additional operating-metric charts below the collapsed input section, such as unit sales, subscribers, deliveries, deployment volume, store count, bookings, launch cadence, or other important non-financial scale indicators.
10. Every time-series chart on greaux, including revenue, profit/earnings, and operating-metric charts, should include 3-5 future projection data points beyond the latest actual or estimated period.
11. Add company-specific SEO and sharing metadata.
12. Store only known, officially reported historical data in `financial-data/<company-folder>/known-revenue-and-product-numbers.md`.
13. Store unknown or estimated app default projection assumptions and resulting default outputs in `financial-data/<company-folder>/projected-financial-data.md`.

## Financial Research Standard

Keep the two financial-data files conceptually separate.

- `known-revenue-and-product-numbers.md`: use primary official sources only. For public companies, use SEC filings such as 10-K, 10-Q, 8-K, S-1, investor presentations filed with the SEC, and the company's investor relations site. For private companies, use company-published metrics, official announcements, audited statements if available, and credible regulatory documents.
- `known-revenue-and-product-numbers.md`: do not include analyst estimates, YouTube/X researcher estimates, model assumptions, inferred segment splits, or projection defaults. If a number is not officially reported by the company or a regulator, it belongs in `projected-financial-data.md`.
- `projected-financial-data.md`: use this for unknown data and numbers that must be estimated to power the app, including analyst estimates, consensus estimates, sell-side or buy-side research, reputable industry research, YouTube analysts, X account researchers, newsletter writers, private-market data providers, third-party protocol data aggregators, and your own clearly explained model-derived assumptions.
- For crypto companies, tokens, DAOs, and decentralized protocols that do not publish SEC-style filings or audited revenue statements, use verifiable onchain and market-data sources for historical values, such as Token Terminal, Dune Analytics dashboards, CoinGecko, DefiLlama, protocol subgraphs, chain explorers, and official smart-contract data.
- For decentralized protocols, keep official mechanism facts in `known-revenue-and-product-numbers.md` and put third-party or onchain historical operating series such as fees, volume, TVL, users, token supply, market cap, FDV, or protocol revenue in `projected-financial-data.md` unless the protocol publishes those exact values officially. Label these as verifiable onchain data, third-party historical data, or market data, not officially reported data.
- Include links next to the data they support.
- Clearly label every figure as officially reported, company-provided, regulatory, analyst estimate, third-party estimate, researcher estimate, model-derived, or scenario assumption.
- Include source dates and note whether a figure is fiscal year, calendar year, quarterly, trailing-twelve-month, or point-in-time.

## Projection Defaults

Default growth, margin, and valuation assumptions belong in `projected-financial-data.md` and should be grounded in public, well-reasoned estimates.

- Prefer named analyst reports, consensus estimates, company guidance, market research from established firms, credible financial data providers, thoughtful YouTube analysts, X account researchers, industry newsletters, or independent modelers with transparent assumptions.
- Valuation defaults should also be sourced. For public companies, use a clear multiple or market-cap/share-price method. For private companies, use credible valuation reports, secondary-market/tender references, or a sourced revenue multiple, and label speculation clearly.
- Avoid unsupported guesses. If a default is an inference, say so in the markdown file and explain the calculation briefly.
- Put every projection source in `financial-data/<company-folder>/projected-financial-data.md`.
- Keep default assumptions conservative enough that the first page load feels like a reasonable base case, not a promotional bull case.
- If sources disagree widely, document the range and choose a clear base-case default.

## Known Data Markdown File

Create a file such as:

```text
financial-data/<company-folder>/known-revenue-and-product-numbers.md
```

This file is for known, officially reported numbers only. Use this structure unless the company requires something more specific:

```markdown
# <Company> Known Revenue And Product Numbers

## Summary

Briefly describe what is officially reported and which periods are covered.

## Known Official Historical Data

| Period | Metric | Value | Segment/Product | Source | Notes |
| --- | --- | ---: | --- | --- | --- |

## Product Or Segment Drivers

Document the 2-6 major products, services, or categories used in the dashboard.

## Operating Metrics

Document known official non-financial operating metrics, such as unit sales, subscribers, deliveries, deployment volume, store count, bookings, or launch cadence.

## Source Links

- [Source title](https://example.com) - what this source supports.

## Caveats

List known gaps, private-company limitations, non-GAAP issues, or reporting limitations.
```

Also create:

```text
financial-data/<company-folder>/projected-financial-data.md
```

This file is for unknown, estimated, modeled, and projection-default data. It should contain:

- The exact default inputs used by the app.
- The resulting default revenue projection table.
- The resulting default profit, earnings, operating income, or contribution projection table.
- The resulting default projection table for every time-series operating-metric chart, with 3-5 future projection data points per chart.
- The resulting default share price and/or valuation output.
- Source links and rationale for every default growth, margin, unit-volume, ASP, and valuation assumption.
- Analyst estimates, consensus estimates, third-party estimates, YouTube analyst estimates, X account researcher estimates, industry-newsletter estimates, model-derived values, and scenario assumptions.
- Clear labels for analyst estimates, third-party estimates, researcher estimates, model-derived values, and scenario assumptions.
- A note naming the app source files that must be updated together with the markdown.

## Page And Model Requirements

- Create the page in `src/pages/<Company>.jsx`.
- Add a route in `src/App.jsx`.
- Add the company to the `companies` array in `src/pages/Home.jsx`.
- Keep the page visually consistent with existing company dashboards.
- Include bar charts for both revenue and profit/earnings.
- Every time-series chart on greaux should include 3-5 future projection data points beyond the latest actual or estimated period.
- Visually distinguish actual or known values from projected values, such as lighter bars, dashed outlines, projected labels, or a clear legend.
- For bar-chart legends, put the descriptive wording on the actual or known series label, and label the matching transparent/dashed projection series simply `projected`.
- Use stacked bars when showing product or segment mix.
- Provide user controls for the main 2-6 revenue drivers and margin/profit assumptions.
- Put those controls inside the shared collapsed assumptions section. The first page load should show charts and metrics before dense controls.
- Make controls numeric and easy to scan, such as sliders, number fields, or compact segmented controls.
- Include summary metric cards that respond to user input, including projected revenue, profit/earnings, CAGR or growth rate, and projected share price and/or company valuation.
- For public companies, include projected share price when share count and valuation inputs are part of the model; also show total company valuation when practical.
- For private companies, include projected company valuation instead of share price unless a credible share-count model is available.
- Add two "interesting" operating charts below the collapsed inputs. Reuse `InsightCard` and `InsightBarChart` when possible.
- Time-series operating charts should also include 3-5 forward projection points and document their assumptions in `projected-financial-data.md`.
- Label private-company estimates and analyst-derived values clearly in the page copy.
- Avoid standalone explanatory callout blocks like "Model boundary"; keep caveats concise in the header, source notes, tooltips, and financial-data markdown.

## SEO And Sharing Metadata

Add company-specific metadata through `src/components/PageMeta.jsx`.

Recommended metadata:

- `title`
- `description`
- canonical path
- `keywords`
- `robots`
- Open Graph title, description, URL, image, image alt text, type, site name, and locale
- Twitter/X `summary_large_image` title, description, image, and image alt text
- JSON-LD `WebPage` schema with an `Organization` in `about`

For hash-routed pages, also create a static share page under:

```text
public/<company-slug>/index.html
```

Create or update a share preview image under:

```text
public/og-<company-slug>.svg
```

## Final Checks

- Run `npm run build`.
- Start or reuse the local Vite server.
- Open the company page in the browser.
- Verify both charts render.
- Verify the assumptions/input section is collapsed by default and expands cleanly.
- Verify changing inputs updates revenue, profit/earnings, and summary metrics.
- Verify projected share price and/or valuation updates when its related inputs change.
- Verify both operating-metric charts render below the inputs.
- Verify every time-series chart includes 3-5 future projection data points and that projected values are visually distinct from actual or known values.
- Verify bar-chart legends use descriptive labels for actual or known series and only `projected` for their matching transparent/dashed projection series.
- Verify `projected-financial-data.md` matches the default values and default outputs currently produced by the app.
- Check the console for errors.
- Confirm the landing card logo, accent color, and link work.
- Confirm page title, description, canonical, Open Graph, Twitter, and JSON-LD metadata are present.
