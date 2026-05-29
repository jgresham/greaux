# Adding A Company To greaux

greaux is a company growth projection and visualization tool. New company pages should combine sourced financial history, transparent assumptions, and interactive revenue and profit projections.

## Placement

- Add source notes and financial references under `financial-data/<company-slug>/`.
- Use `financial-data/<ticker>-<company-slug>/` for public companies when a ticker is available, matching the existing `financial-data/tsla-tesla/` pattern.
- Use `financial-data/<company-slug>/` for private companies.
- Keep this guide in `agents/` and keep root `AGENTS.md` as the pointer future coding agents will see first.

## Required Deliverables

1. Create or update the landing-page card in `src/pages/Home.jsx`.
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
10. Add company-specific SEO and sharing metadata.
11. Store the supporting source notes in `financial-data/<company-folder>/`.

## Financial Research Standard

Use primary sources first.

- For public companies, start with SEC filings such as 10-K, 10-Q, 8-K, S-1, investor presentations filed with the SEC, and the company's investor relations site.
- For private companies, start with company-published metrics, official announcements, audited statements if available, credible regulatory documents, and reputable third-party estimates.
- Put verified historical revenue, profit, unit sales, product counts, segment metrics, and operating KPIs in the company markdown file.
- Include links to SEC filings, company pages, investor presentations, and other references next to the data they support.
- Clearly label every figure as reported, company-provided, analyst estimate, third-party estimate, or model assumption.
- Include source dates and note whether a figure is fiscal year, calendar year, quarterly, trailing-twelve-month, or point-in-time.

## Projection Defaults

Default growth and margin assumptions should be grounded in public, well-respected analyst views or reputable industry research.

- Prefer named analyst reports, consensus estimates, company guidance, market research from established firms, or credible financial data providers.
- Valuation defaults should also be sourced. For public companies, use a clear multiple or market-cap/share-price method. For private companies, use credible valuation reports, secondary-market/tender references, or a sourced revenue multiple, and label speculation clearly.
- Avoid unsupported guesses. If a default is an inference, say so in the markdown file and explain the calculation briefly.
- Put every projection source in `financial-data/<company-folder>/`.
- Keep default assumptions conservative enough that the first page load feels like a reasonable base case, not a promotional bull case.
- If sources disagree widely, document the range and choose a clear base-case default.

## Company Markdown File

Create a file such as:

```text
financial-data/<company-folder>/known-revenue-and-product-numbers.md
```

Use this structure unless the company requires something more specific:

```markdown
# <Company> Known Revenue And Product Numbers

## Summary

Briefly describe what is reported, what is estimated, and what the dashboard models.

## Verified Historical Data

| Period | Metric | Value | Segment/Product | Source | Notes |
| --- | --- | ---: | --- | --- | --- |

## Product Or Segment Drivers

Document the 2-6 major products, services, or categories used in the dashboard.

## Operating Metrics

Document the two non-financial operating metrics shown below the input section.

## Projection Assumptions

| Assumption | Default | Source | Notes |
| --- | ---: | --- | --- |

## Source Links

- [Source title](https://example.com) - what this source supports.

## Caveats

List known gaps, private-company limitations, non-GAAP issues, or model simplifications.
```

## Page And Model Requirements

- Create the page in `src/pages/<Company>.jsx`.
- Add a route in `src/App.jsx`.
- Add the company to the `companies` array in `src/pages/Home.jsx`.
- Keep the page visually consistent with existing company dashboards.
- Include bar charts for both revenue and profit/earnings.
- Use stacked bars when showing product or segment mix.
- Provide user controls for the main 2-6 revenue drivers and margin/profit assumptions.
- Put those controls inside the shared collapsed assumptions section. The first page load should show charts and metrics before dense controls.
- Make controls numeric and easy to scan, such as sliders, number fields, or compact segmented controls.
- Include summary metric cards that respond to user input, including projected revenue, profit/earnings, CAGR or growth rate, and projected share price and/or company valuation.
- For public companies, include projected share price when share count and valuation inputs are part of the model; also show total company valuation when practical.
- For private companies, include projected company valuation instead of share price unless a credible share-count model is available.
- Add two "interesting" operating charts below the collapsed inputs. Reuse `InsightCard` and `InsightBarChart` when possible.
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
- Check the console for errors.
- Confirm the landing card logo, accent color, and link work.
- Confirm page title, description, canonical, Open Graph, Twitter, and JSON-LD metadata are present.
