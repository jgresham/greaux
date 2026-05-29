# greaux

greaux is a company growth projection and visualization tool. It turns known operating history, segment assumptions, and scenario inputs into interactive dashboards for comparing how different growth drivers can shape future revenue, earnings, and operating scale.

The app is built with React, Vite, and Chart.js.

## Current Models

- Tesla: revenue and earnings projections across Automotive, Energy & Storage, Services & Other, Robotaxi, and Optimus.
- SpaceX: estimated revenue and earnings projections across Starlink, Launch Services, Government Systems, Dragon, and Starship.

## Features

- Interactive company dashboards with charts, metric cards, assumptions, and explanatory context.
- Segment-level modeling for revenue, margins, and contribution to projected outcomes.
- Company-specific inputs for important growth drivers, such as Robotaxi rides, Optimus unit sales, and average selling price.
- Source-oriented financial data stored under `financial-data/`.
- SEO and sharing metadata for the landing page and company-specific pages.
- Dark, compact dashboard UI optimized for scanning and scenario comparison.

## Local Development

```bash
npm install
npm run dev
```

The local Vite app is served with the `/greaux/` base path. Common local routes:

```text
http://127.0.0.1:5173/greaux/
http://127.0.0.1:5173/greaux/#/tesla
http://127.0.0.1:5173/greaux/#/spacex
```

## Build And Deploy

Create a production build:

```bash
npm run build
```

Deploy the built app to GitHub Pages via the configured `gh-pages` script:

```bash
npm run deploy
```

The configured production base path is `/greaux/`.

## Project Structure

```text
financial-data/
  spacex/
    known-revenue-and-product-numbers.md
  tsla-tesla/
    known-revenue-and-product-numbers.md
public/
  og-greaux.svg
  og-spacex.svg
  og-tesla.svg
  spacex/index.html
  tesla/index.html
src/
  App.jsx
  data.js
  components/
    ChartLegend.jsx
    CollapsibleSection.jsx
    EarningsChart.jsx
    InputPanel.jsx
    InsightBarChart.jsx
    InsightCard.jsx
    MetricCard.jsx
    PageMeta.jsx
    RevenueChart.jsx
    Tooltip.jsx
  pages/
    Home.jsx
    SpaceX.jsx
    Tesla.jsx
```

## Adding Another Company

Follow `agents/adding-a-company.md`. In short: add sourced financial data under `financial-data/`, create a company dashboard with revenue and profit charts, wire the route and landing-page card, and add company-specific SEO/share metadata.

## Notes

greaux is for scenario modeling and visualization. It is not financial advice, and projection outputs are only as reliable as the assumptions and source data behind them.

## Tech Stack

React 18 · Vite 5 · Chart.js 4 · GitHub Pages
