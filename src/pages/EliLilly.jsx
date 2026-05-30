import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import MetricCard from '../components/MetricCard';
import Tooltip from '../components/Tooltip';
import CollapsibleSection from '../components/CollapsibleSection';
import InsightBarChart from '../components/InsightBarChart';
import InsightCard from '../components/InsightCard';
import PageMeta, { PAGE_META } from '../components/PageMeta';

Chart.register(...registerables);

const ACCENT = '#d52b1e';
const YEARS = [2025, 2026, 2027, 2028, 2029, 2030];
const HIST_COUNT = 1;
const FINAL_INDEX = YEARS.length - 1;

const SEGMENT_COLORS = {
  mounjaro: '#4da3ff',
  zepbound: '#ff6b9d',
  foundayo: '#e8ff47',
  oncology: '#a78bfa',
  immunology: '#3ddea0',
  other: '#ffb347',
};

const SEGMENT_LABELS = {
  mounjaro: 'Mounjaro',
  zepbound: 'Zepbound',
  foundayo: 'Foundayo',
  oncology: 'Oncology',
  immunology: 'Immunology',
  other: 'Other products',
};

const BASE_2025 = {
  mounjaro: 22.965,
  zepbound: 13.542,
  foundayo: 0,
  oncology: 9.376,
  immunology: 5.247,
  other: 14.049,
};

const DEFAULTS = {
  mounjaro2026: 34.6,
  mounjaro2030: 36.2,
  zepbound2026: 18.8,
  zepbound2030: 25.5,
  foundayo2026: 0.8,
  foundayo2030: 14.2,
  oncologyCAGR: 6,
  immunologyCAGR: 14,
  otherCAGR: -2,
  performanceMargin: 48,
  peMultiple: 38,
  sharesB: 0.895,
};

const TOOLTIPS = {
  mounjaro: '2030 Mounjaro sales target. Default is aligned with Evaluate Pharma coverage cited by Fierce Pharma.',
  zepbound: '2030 Zepbound sales target. Default is aligned with Evaluate Pharma coverage cited by Fierce Pharma.',
  foundayo: '2030 Foundayo/orforglipron sales target. Default uses Visible Alpha consensus coverage from S&P Global.',
  cagr: 'Compound annual growth rate from the 2025 base year.',
  performanceMargin: 'Lilly defines performance margin as gross margin less R&D and marketing, selling and administrative expenses, divided by revenue.',
  peMultiple: 'Valuation multiple applied to modeled 2030 performance income.',
  shares: 'Diluted shares in billions. Default uses Lilly 2026 guidance assumption of approximately 895 million shares.',
  earnings: 'Earnings here are modeled performance income allocated across product categories, not GAAP net income by product.',
};

const sourceNotes = [
  '2025 product revenue uses Lilly 2025 Form 10-K product disaggregation.',
  '2026 default revenue is anchored to Lilly guidance of $82B to $85B after Q1 2026.',
  'Mounjaro and Zepbound 2030 defaults are aligned with Evaluate Pharma forecasts cited by Fierce Pharma.',
  'Foundayo 2030 default uses Visible Alpha consensus coverage published by S&P Global Market Intelligence.',
  'Earnings are modeled with a performance-margin input and are not product-level GAAP net income.',
];

const OPERATING_METRICS = {
  tirzepatideYears: [2023, 2024, 2025, '2026*', '2027*', '2028*', '2029*', '2030*'],
  mounjaroActualB: [5.163, 11.54, 22.965, null, null, null, null, null],
  zepboundActualB: [0.176, 4.926, 13.542, null, null, null, null, null],
  foundayoActualB: [0, 0, 0, null, null, null, null, null],
  marketShareYears: ['Q1 2026', '2027*', '2028*', '2029*', '2030*'],
  usIncretinShareActual: [60.1, null, null, null, null],
  usIncretinShareProjected: [null, 62.0, 63.0, 63.5, 64.0],
  internationalIncretinShareActual: [53.2, null, null, null, null],
  internationalIncretinShareProjected: [null, 55.0, 56.5, 57.5, 58.0],
};

const fmt = (n, decimals = 0) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

const fmtUsdB = value =>
  value >= 1000 ? `$${fmt(value / 1000, 2)}T` : `$${fmt(value, value < 10 ? 2 : 1)}B`;

const fmtUsd = value => `$${fmt(value, value < 100 ? 2 : 0)}`;

function ramp(start, end, count = 5) {
  return Array.from({ length: count }, (_, index) =>
    Number((start + (end - start) * (index / (count - 1))).toFixed(2))
  );
}

function projectCAGR(lastValue, cagr, count = 5) {
  return Array.from({ length: count }, (_, index) =>
    Number((lastValue * Math.pow(1 + cagr / 100, index + 1)).toFixed(2))
  );
}

function sumAt(series, index) {
  return Object.values(series).reduce((sum, values) => sum + values[index], 0);
}

function buildProjections(params) {
  const revenue = {
    mounjaro: [BASE_2025.mounjaro, ...ramp(params.mounjaro2026, params.mounjaro2030)],
    zepbound: [BASE_2025.zepbound, ...ramp(params.zepbound2026, params.zepbound2030)],
    foundayo: [BASE_2025.foundayo, ...ramp(params.foundayo2026, params.foundayo2030)],
    oncology: [BASE_2025.oncology, ...projectCAGR(BASE_2025.oncology, params.oncologyCAGR)],
    immunology: [BASE_2025.immunology, ...projectCAGR(BASE_2025.immunology, params.immunologyCAGR)],
    other: [BASE_2025.other, ...projectCAGR(BASE_2025.other, params.otherCAGR)],
  };

  const earnings = Object.fromEntries(
    Object.entries(revenue).map(([key, values]) => [
      key,
      values.map(value => Number((value * params.performanceMargin / 100).toFixed(2))),
    ])
  );

  const total2025 = sumAt(revenue, 0);
  const total2026 = sumAt(revenue, 1);
  const total2030 = sumAt(revenue, FINAL_INDEX);
  const earnings2030 = sumAt(earnings, FINAL_INDEX);
  const marketCap2030 = earnings2030 * params.peMultiple;
  const sharePrice2030 = params.sharesB > 0 ? marketCap2030 / params.sharesB : 0;
  const eps2030 = params.sharesB > 0 ? earnings2030 / params.sharesB : 0;
  const cagr5y = total2025 > 0 ? (Math.pow(total2030 / total2025, 1 / 5) - 1) * 100 : 0;
  const glpShare2030 = total2030 > 0
    ? (revenue.mounjaro[FINAL_INDEX] + revenue.zepbound[FINAL_INDEX] + revenue.foundayo[FINAL_INDEX]) / total2030 * 100
    : 0;

  return {
    revenue,
    earnings,
    total2025,
    total2026,
    total2030,
    earnings2030,
    marketCap2030,
    sharePrice2030,
    eps2030,
    cagr5y,
    glpShare2030,
  };
}

function makeDatasets(full, color, label) {
  const actualData = full.map((value, index) => index < HIST_COUNT ? value : null);
  const projectionData = full.map((value, index) => index >= HIST_COUNT ? value : null);

  return [
    {
      label,
      tooltipLabel: label,
      data: actualData,
      backgroundColor: color,
      stack: 'stack',
      borderRadius: { topLeft: 3, topRight: 3 },
      borderSkipped: false,
    },
    {
      label: 'projected',
      tooltipLabel: `${label} projected`,
      data: projectionData,
      backgroundColor: `${color}55`,
      borderColor: color,
      borderWidth: 1.5,
      borderDash: [4, 3],
      stack: 'stack',
      borderRadius: { topLeft: 3, topRight: 3 },
      borderSkipped: false,
    },
  ];
}

function SegmentLegend() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
      {Object.entries(SEGMENT_LABELS).map(([key, label]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{
            width: 10,
            height: 10,
            borderRadius: 2,
            background: SEGMENT_COLORS[key],
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</span>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{
          width: 10,
          height: 10,
          borderRadius: 2,
          border: '1.5px dashed rgba(255,255,255,0.3)',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 13, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
          projected
        </span>
      </div>
    </div>
  );
}

function StackedBarChart({ projections, type }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const source = type === 'earnings' ? projections.earnings : projections.revenue;

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: YEARS.map((year, index) => index >= HIST_COUNT ? `${year}*` : String(year)),
        datasets: Object.keys(SEGMENT_LABELS).flatMap(key =>
          makeDatasets(source[key], SEGMENT_COLORS[key], SEGMENT_LABELS[key])
        ),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400, easing: 'easeInOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e1e28',
            borderColor: 'rgba(255,255,255,0.12)',
            borderWidth: 1,
            titleColor: '#f0eff8',
            bodyColor: '#9898b0',
            padding: 12,
            callbacks: {
              title(items) {
                const index = items[0].dataIndex;
                return index >= HIST_COUNT ? `${YEARS[index]} projected` : `${YEARS[index]} actual`;
              },
              label(ctx) {
                if (ctx.raw === null || ctx.raw === 0) return null;
                return `${ctx.dataset.tooltipLabel || ctx.dataset.label}: ${fmtUsdB(ctx.raw)}`;
              },
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: '#5a5a72',
              font: { family: "'DM Mono', monospace", size: 12 },
              autoSkip: false,
            },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.05)' },
            border: { display: false },
            ticks: {
              color: '#5a5a72',
              font: { family: "'DM Mono', monospace", size: 12 },
              callback: value => `$${value}B`,
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [source]);

  return (
    <div style={{ position: 'relative', width: '100%', height: type === 'earnings' ? 310 : 360 }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Stacked bar chart of Eli Lilly ${type} by product category from 2025 through 2030`}
      >
        Eli Lilly {type} by product category, 2025 actual and 2026-2030 projected.
      </canvas>
    </div>
  );
}

function SliderField({ label, id, value, min, max, step = 1, unit = '%', tooltip, accent = ACCENT, onChange }) {
  const decimals = step < 1 ? String(step).split('.')[1]?.length || 1 : 0;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)' }}>
          {label}
          {tooltip && <Tooltip text={tooltip} />}
        </div>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 14,
          fontWeight: 500,
          color: accent,
          minWidth: 64,
          textAlign: 'right',
        }}>
          {fmt(value, decimals)}{unit}
        </span>
      </div>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
      />
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 4,
        fontSize: 11,
        fontFamily: 'var(--mono)',
        color: 'var(--text3)',
      }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function NumberField({ label, value, min, max, step, tooltip, suffix, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 13,
        color: 'var(--text2)',
        marginBottom: 6,
      }}>
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          step={step}
          onChange={event => onChange(Number(event.target.value))}
          style={{ flex: 1 }}
        />
        {suffix && (
          <span style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap', fontFamily: 'var(--mono)' }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function SectionCard({ title, accent, children }) {
  return (
    <div style={{
      background: 'var(--bg3)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accent }} />
      <div style={{
        marginBottom: 18,
        fontSize: 12,
        fontFamily: 'var(--mono)',
        color: 'var(--text3)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function InputPanel({ params, onChange }) {
  const set = key => value => onChange({ ...params, [key]: value });

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: 14,
    }}>
      <SectionCard title="Tirzepatide" accent={SEGMENT_COLORS.mounjaro}>
        <NumberField
          label="Mounjaro 2030 sales"
          value={params.mounjaro2030}
          min={20}
          max={65}
          step={0.5}
          suffix="USD B"
          tooltip={TOOLTIPS.mounjaro}
          onChange={set('mounjaro2030')}
        />
        <NumberField
          label="Zepbound 2030 sales"
          value={params.zepbound2030}
          min={10}
          max={55}
          step={0.5}
          suffix="USD B"
          tooltip={TOOLTIPS.zepbound}
          onChange={set('zepbound2030')}
        />
      </SectionCard>

      <SectionCard title="Foundayo" accent={SEGMENT_COLORS.foundayo}>
        <NumberField
          label="Foundayo 2030 sales"
          value={params.foundayo2030}
          min={0}
          max={35}
          step={0.5}
          suffix="USD B"
          tooltip={TOOLTIPS.foundayo}
          onChange={set('foundayo2030')}
        />
        <NumberField
          label="Foundayo 2026 sales"
          value={params.foundayo2026}
          min={0}
          max={5}
          step={0.1}
          suffix="USD B"
          onChange={set('foundayo2026')}
        />
      </SectionCard>

      <SectionCard title="Other Medicines" accent={SEGMENT_COLORS.immunology}>
        <SliderField
          label="Oncology CAGR"
          id="oncologyCAGR"
          value={params.oncologyCAGR}
          min={-5}
          max={20}
          tooltip={TOOLTIPS.cagr}
          accent={SEGMENT_COLORS.oncology}
          onChange={set('oncologyCAGR')}
        />
        <SliderField
          label="Immunology CAGR"
          id="immunologyCAGR"
          value={params.immunologyCAGR}
          min={-5}
          max={35}
          tooltip={TOOLTIPS.cagr}
          accent={SEGMENT_COLORS.immunology}
          onChange={set('immunologyCAGR')}
        />
        <SliderField
          label="Other products CAGR"
          id="otherCAGR"
          value={params.otherCAGR}
          min={-15}
          max={15}
          tooltip={TOOLTIPS.cagr}
          accent={SEGMENT_COLORS.other}
          onChange={set('otherCAGR')}
        />
      </SectionCard>

      <SectionCard title="Margin And Valuation" accent={ACCENT}>
        <SliderField
          label="Performance margin"
          id="performanceMargin"
          value={params.performanceMargin}
          min={35}
          max={60}
          tooltip={TOOLTIPS.performanceMargin}
          onChange={set('performanceMargin')}
        />
        <SliderField
          label="2030 P/E multiple"
          id="peMultiple"
          value={params.peMultiple}
          min={15}
          max={60}
          step={1}
          unit="x"
          tooltip={TOOLTIPS.peMultiple}
          onChange={set('peMultiple')}
        />
        <NumberField
          label="Diluted shares"
          value={params.sharesB}
          min={0.75}
          max={1.05}
          step={0.001}
          suffix="B shares"
          tooltip={TOOLTIPS.shares}
          onChange={set('sharesB')}
        />
      </SectionCard>
    </div>
  );
}

function SourcePill({ children }) {
  return (
    <span style={{
      border: '1px solid var(--border)',
      borderRadius: 100,
      padding: '5px 10px',
      color: 'var(--text3)',
      fontFamily: 'var(--mono)',
      fontSize: 11,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

function LillyLogo({ compact = false }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}lilly-logo.svg`}
      alt="Lilly"
      style={{
        display: 'block',
        width: compact ? 42 : 84,
        height: compact ? 24 : 47,
        objectFit: 'contain',
      }}
    />
  );
}

export default function EliLillyPage() {
  const [params, setParams] = useState(DEFAULTS);
  const projections = useMemo(() => buildProjections(params), [params]);
  const tirzepatideProjectedYears = [1, 2, 3, 4, 5];

  return (
    <>
      <PageMeta {...PAGE_META.lilly} />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          borderBottom: '1px solid var(--border)',
          padding: '0.65rem 2.5rem',
          background: 'var(--bg)',
        }}>
          <Link
            to="/"
            style={{
              fontSize: 12,
              fontFamily: 'var(--mono)',
              color: 'var(--text3)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'color 0.15s',
            }}
            onMouseEnter={event => event.currentTarget.style.color = ACCENT}
            onMouseLeave={event => event.currentTarget.style.color = 'var(--text3)'}
          >
            &lt;- greaux
          </Link>
        </div>

        <header style={{
          background: 'linear-gradient(180deg, rgba(213,43,30,0.06) 0%, transparent 100%)',
          borderBottom: '1px solid var(--border)',
          padding: '2rem 2.5rem 1.75rem',
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 11,
                  fontFamily: 'var(--mono)',
                  color: ACCENT,
                  border: '1px solid rgba(213,43,30,0.34)',
                  borderRadius: 100,
                  padding: '5px 12px',
                  marginBottom: 10,
                  letterSpacing: '0.06em',
                }}>
                  <LillyLogo compact />
                  LLY - PHARMA PROJECTION MODEL
                </div>
                <h1 style={{
                  fontSize: 'clamp(24px, 4vw, 36px)',
                  fontWeight: 700,
                  color: 'var(--text)',
                  lineHeight: 1.15,
                  marginBottom: 8,
                }}>
                  Eli Lilly Revenue<br />
                  <span style={{ color: ACCENT }}>Growth Dashboard</span>
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--mono)', maxWidth: 720, lineHeight: 1.6 }}>
                  Historical 2025 - Projected 2026-2030 - All figures in USD billions
                </p>
              </div>
              <div style={{
                maxWidth: 360,
                fontSize: 12,
                fontFamily: 'var(--mono)',
                color: 'var(--text3)',
                lineHeight: 1.55,
                textAlign: 'right',
              }}>
                2025 actuals are from Lilly's 10-K. Projections are scenario defaults anchored to company guidance and public analyst forecasts.
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem 2.5rem', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            marginBottom: '1.5rem',
          }}>
            <MetricCard
              label="2025 Revenue"
              value={fmtUsdB(projections.total2025)}
              sub="Actual - Form 10-K"
              accent={ACCENT}
            />
            <MetricCard
              label="2026 Projected"
              value={fmtUsdB(projections.total2026)}
              sub="Anchored to guidance"
              accent="var(--accent)"
            />
            <MetricCard
              label="2030 Revenue"
              value={fmtUsdB(projections.total2030)}
              sub={`${fmt(projections.cagr5y, 1)}% CAGR`}
              accent="var(--green)"
            />
            <MetricCard
              label="2030 Earnings"
              value={fmtUsdB(projections.earnings2030)}
              sub={`${params.performanceMargin}% performance margin`}
              accent="var(--amber)"
              tooltip={TOOLTIPS.earnings}
            />
            <MetricCard
              label="2030 Valuation"
              value={fmtUsdB(projections.marketCap2030)}
              sub={`${params.peMultiple}x performance income`}
              accent="var(--pink)"
            />
            <MetricCard
              label="2030 Share Price"
              value={fmtUsd(projections.sharePrice2030)}
              sub={`EPS ${fmtUsd(projections.eps2030)}`}
              accent={SEGMENT_COLORS.foundayo}
            />
          </div>

          <section style={{
            background: 'linear-gradient(135deg, var(--bg2) 0%, rgba(213,43,30,0.045) 100%)',
            border: '1px solid rgba(213,43,30,0.28)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.6rem 2rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
          }}>
            <div>
              <div style={{
                fontSize: 11,
                fontFamily: 'var(--mono)',
                color: ACCENT,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 10,
              }}>
                2030 Projected Share Price
              </div>
              <div style={{
                fontSize: 'clamp(42px, 7vw, 66px)',
                fontWeight: 700,
                color: ACCENT,
                lineHeight: 1,
                marginBottom: 10,
              }}>
                {fmtUsd(projections.sharePrice2030)}
              </div>
              <div style={{
                display: 'flex',
                gap: 20,
                flexWrap: 'wrap',
                fontSize: 12,
                fontFamily: 'var(--mono)',
                color: 'var(--text3)',
              }}>
                <span>{fmtUsdB(projections.marketCap2030)} market cap</span>
                <span>{fmtUsdB(projections.earnings2030)} performance income</span>
                <span>{params.sharesB}B diluted shares</span>
              </div>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontSize: 12,
              fontFamily: 'var(--mono)',
              color: 'var(--text3)',
              textAlign: 'right',
            }}>
              <span style={{ color: 'rgba(213,43,30,0.72)' }}>
                Adjust product targets, margin, and valuation below
              </span>
              <span>{fmt(projections.glpShare2030, 0)}% of 2030 revenue from GLP-1 franchise</span>
              <span>{params.peMultiple}x P/E on modeled performance income</span>
            </div>
          </section>

          <section style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: '1.25rem',
            }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                  Annual revenue by product category
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                  2025 actual; * denotes projected years
                </p>
              </div>
              <SegmentLegend />
            </div>
            <StackedBarChart projections={projections} type="revenue" />
          </section>

          <section style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: '1.25rem',
            }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                  Annual earnings by product category
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                  Earnings = revenue x performance margin scenario
                </p>
              </div>
              <SegmentLegend />
            </div>
            <StackedBarChart projections={projections} type="earnings" />
          </section>

          <CollapsibleSection
            eyebrow="Scenario controls"
            title="Adjust projection assumptions"
            description="Product revenue targets, category growth rates, performance margin, and valuation inputs."
            accent={ACCENT}
          >
            <InputPanel params={params} onChange={setParams} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button
                onClick={() => setParams(DEFAULTS)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border2)',
                  color: 'var(--text2)',
                  fontSize: 13,
                  fontFamily: 'var(--mono)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={event => { event.target.style.borderColor = ACCENT; event.target.style.color = ACCENT; }}
                onMouseLeave={event => { event.target.style.borderColor = 'var(--border2)'; event.target.style.color = 'var(--text2)'; }}
              >
                Reset to defaults
              </button>
            </div>
          </CollapsibleSection>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 16,
            marginBottom: '1.75rem',
          }}>
            <InsightCard
              title="Tirzepatide franchise"
              subtitle="Mounjaro and Zepbound actuals through 2025; * years follow default product targets."
            >
              <InsightBarChart
                labels={OPERATING_METRICS.tirzepatideYears}
                stacked
                unit="B"
                decimals={1}
                ariaLabel="Eli Lilly tirzepatide franchise revenue from 2023 through 2030, with 2026 through 2030 projected"
                datasets={[
                  {
                    label: 'Mounjaro',
                    data: OPERATING_METRICS.mounjaroActualB,
                    backgroundColor: SEGMENT_COLORS.mounjaro,
                  },
                  {
                    label: 'projected',
                    data: [null, null, null, ...tirzepatideProjectedYears.map(index => projections.revenue.mounjaro[index])],
                    backgroundColor: `${SEGMENT_COLORS.mounjaro}55`,
                    borderColor: SEGMENT_COLORS.mounjaro,
                    borderWidth: 1.5,
                    borderDash: [4, 3],
                  },
                  {
                    label: 'Zepbound',
                    data: OPERATING_METRICS.zepboundActualB,
                    backgroundColor: SEGMENT_COLORS.zepbound,
                  },
                  {
                    label: 'projected',
                    data: [null, null, null, ...tirzepatideProjectedYears.map(index => projections.revenue.zepbound[index])],
                    backgroundColor: `${SEGMENT_COLORS.zepbound}55`,
                    borderColor: SEGMENT_COLORS.zepbound,
                    borderWidth: 1.5,
                    borderDash: [4, 3],
                  },
                  {
                    label: 'Foundayo',
                    data: OPERATING_METRICS.foundayoActualB,
                    backgroundColor: SEGMENT_COLORS.foundayo,
                  },
                  {
                    label: 'projected',
                    data: [null, null, null, ...tirzepatideProjectedYears.map(index => projections.revenue.foundayo[index])],
                    backgroundColor: `${SEGMENT_COLORS.foundayo}55`,
                    borderColor: SEGMENT_COLORS.foundayo,
                    borderWidth: 1.5,
                    borderDash: [4, 3],
                  },
                ]}
              />
            </InsightCard>

            <InsightCard
              title="Incretin market share"
              subtitle="Q1 2026 actual market share from Lilly earnings presentation; * years are scenario projections."
            >
              <InsightBarChart
                labels={OPERATING_METRICS.marketShareYears}
                unit="%"
                decimals={1}
                ariaLabel="Eli Lilly U.S. and international incretin market share from Q1 2026 through 2030, with 2027 through 2030 projected"
                datasets={[
                  {
                    label: 'U.S. share',
                    data: OPERATING_METRICS.usIncretinShareActual,
                    backgroundColor: SEGMENT_COLORS.mounjaro,
                  },
                  {
                    label: 'projected',
                    data: OPERATING_METRICS.usIncretinShareProjected,
                    backgroundColor: `${SEGMENT_COLORS.mounjaro}55`,
                    borderColor: SEGMENT_COLORS.mounjaro,
                    borderWidth: 1.5,
                    borderDash: [4, 3],
                  },
                  {
                    label: 'International share',
                    data: OPERATING_METRICS.internationalIncretinShareActual,
                    backgroundColor: SEGMENT_COLORS.immunology,
                  },
                  {
                    label: 'projected',
                    data: OPERATING_METRICS.internationalIncretinShareProjected,
                    backgroundColor: `${SEGMENT_COLORS.immunology}55`,
                    borderColor: SEGMENT_COLORS.immunology,
                    borderWidth: 1.5,
                    borderDash: [4, 3],
                  },
                ]}
              />
            </InsightCard>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
            {sourceNotes.map(note => <SourcePill key={note}>{note}</SourcePill>)}
          </div>
        </main>

        <footer style={{
          borderTop: '1px solid var(--border)',
          padding: '1.25rem 2.5rem',
          fontSize: 12,
          fontFamily: 'var(--mono)',
          color: 'var(--text3)',
          textAlign: 'center',
        }}>
          Not financial advice - Historical data from Lilly SEC filings and investor materials - Projections are illustrative
        </footer>
      </div>
    </>
  );
}
