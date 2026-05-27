# Tesla Revenue Dashboard

An interactive revenue growth dashboard for Tesla, built with React + Vite + Chart.js.

## Features

- Stacked bar chart: Automotive, Energy & Storage, Services, Robotaxi
- 5 years historical (2020–2024) + 5-year projections (2025–2029)
- Interactive sliders for CAGR assumptions per segment
- Robotaxi ride volume and revenue-per-ride inputs
- Live metric cards: 2024 actual, 2029 projected, 5Y CAGR, Robotaxi contribution
- Tooltip info icons explaining financial terms like CAGR

## Local development

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

### One-time setup

1. Push this repo to GitHub
2. Go to **Settings → Pages** in your repo
3. Under **Source**, select **GitHub Actions**
4. Push to `main` — `.github/workflows/deploy.yml` handles the rest

Your site will be live at:
```
https://<your-username>.github.io/tesla-revenue-dashboard/
```

## Project structure

```
src/
  data.js                  # Historical data, projection logic, defaults
  App.jsx                  # Root layout and state
  components/
    RevenueChart.jsx        # Chart.js stacked bar chart
    InputPanel.jsx          # Sliders + number inputs
    MetricCard.jsx          # Summary metric cards
    ChartLegend.jsx         # Custom chart legend
    Tooltip.jsx             # Info icon with tooltip popup
```

## Customizing for another company

1. Edit `src/data.js` — swap `HISTORICAL` values and `DEFAULTS`
2. Update `SEGMENT_LABELS` and `SEGMENT_COLORS`
3. Adjust inputs in `InputPanel.jsx` to match that company's key drivers
4. Update title/ticker in `App.jsx`

## Tech stack

React 18 · Vite 5 · Chart.js 4 · GitHub Actions · GitHub Pages
