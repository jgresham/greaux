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

const YEARS = [2025, 2026, 2027, 2028, 2029, 2030];
const EST_COUNT = 1;

const SEGMENT_COLORS = {
  starlink: '#4da3ff',
  launch: '#e8ff47',
  gov: '#3ddea0',
  dragon: '#ffb347',
  starship: '#ff6b9d',
};

const SEGMENT_LABELS = {
  starlink: 'Starlink',
  launch: 'Launch Services',
  gov: 'Government Systems',
  dragon: 'Dragon',
  starship: 'Starship',
};

const BASE_2025 = {
  starlink: 11.4,
  launch: 4.1,
  gov: 2.1,
  dragon: 1.1,
  starship: 0.0,
};

const DEFAULTS = {
  starlinkCAGR: 24,
  launchCAGR: 12,
  govCAGR: 18,
  dragonCAGR: 7,
  starship2030Revenue: 6,
  starlinkMargin: 30,
  launchMargin: 18,
  govMargin: 16,
  dragonMargin: 12,
  starshipMargin: -35,
  valuationSalesMultiple: 18.5,
};

const TOOLTIPS = {
  cagr: 'Compound annual growth rate for the projected period. SpaceX is private, so these are scenario inputs, not company guidance.',
  margin: 'Estimated operating margin by segment. Earnings here means segment revenue multiplied by this margin assumption.',
  starshipRevenue: 'Illustrative 2030 Starship revenue. The model ramps this from near zero because Starship is still a development-stage business line.',
  totalRevenue: 'Estimated 2025 baseline plus projected 2026-2030 segment revenue under your assumptions.',
  valuation: 'Estimated company valuation calculated as projected 2030 revenue multiplied by the valuation multiple. Default is anchored near Sacra’s 2025 revenue-to-valuation relationship.',
  privateData: 'SpaceX does not publish audited segment financials. Baseline revenue and segment mix are private-company estimates.',
};

const sourceNotes = [
  '2025 baseline is illustrative and anchored to private-company revenue estimates from Sacra and Payload.',
  'Starlink scale uses public customer milestones as the largest operating signal.',
  'Launch cadence is public, but segment revenue and margins are not reported by SpaceX.',
  'Starship revenue is modeled as a scenario input, not current recurring revenue.',
];

const OPERATING_METRICS = {
  launchYears: [2020, 2021, 2022, 2023, 2024, 2025, '2026*', '2027*', '2028*', '2029*', '2030*'],
  orbitalLaunchesActual: [25, 31, 61, 96, 134, 165, null, null, null, null, null],
  orbitalLaunchesProjected: [null, null, null, null, null, null, 185, 210, 240, 275, 315],
  starlinkMilestones: [
    'Jan 2022',
    'Dec 2022',
    'Dec 2023',
    'Dec 2024',
    'Dec 2025',
    'Feb 2026',
    'Dec 2026*',
    'Dec 2027*',
    'Dec 2028*',
    'Dec 2029*',
    'Dec 2030*',
  ],
  starlinkCustomersActualM: [0.145, 1.0, 2.3, 4.6, 9.0, 10.0, null, null, null, null, null],
  starlinkCustomersProjectedM: [null, null, null, null, null, null, 16.8, 24.0, 33.0, 44.0, 56.0],
  payloadMassYears: [2023, 2024, 2025, '2026*', '2027*', '2028*', '2029*', '2030*'],
  payloadMassActualMetricTons: [1210, 1699, 2213, null, null, null, null, null],
  payloadMassProjectedMetricTons: [null, null, null, 2600, 3300, 4300, 5600, 7300],
};

const fmt = (n, decimals = 0) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);

const fmtValuation = valueB =>
  valueB >= 1000 ? `$${fmt(valueB / 1000, 2)}T` : `$${fmt(valueB, 0)}B`;

function projectCAGR(lastValue, cagr, n) {
  return Array.from({ length: n }, (_, i) =>
    Number((lastValue * Math.pow(1 + cagr / 100, i + 1)).toFixed(2))
  );
}

function rampToTarget(target) {
  return [0.03, 0.08, 0.2, 0.5, 1].map(weight => Number((target * weight).toFixed(2)));
}

function sumAt(series, index) {
  return Object.values(series).reduce((sum, values) => sum + values[index], 0);
}

function segmentEarnings(series, margin) {
  return series.map(value => Number((value * margin / 100).toFixed(2)));
}

function buildProjections(params) {
  const revenue = {
    starlink: [BASE_2025.starlink, ...projectCAGR(BASE_2025.starlink, params.starlinkCAGR, 5)],
    launch: [BASE_2025.launch, ...projectCAGR(BASE_2025.launch, params.launchCAGR, 5)],
    gov: [BASE_2025.gov, ...projectCAGR(BASE_2025.gov, params.govCAGR, 5)],
    dragon: [BASE_2025.dragon, ...projectCAGR(BASE_2025.dragon, params.dragonCAGR, 5)],
    starship: [BASE_2025.starship, ...rampToTarget(params.starship2030Revenue)],
  };

  const earnings = {
    starlink: segmentEarnings(revenue.starlink, params.starlinkMargin),
    launch: segmentEarnings(revenue.launch, params.launchMargin),
    gov: segmentEarnings(revenue.gov, params.govMargin),
    dragon: segmentEarnings(revenue.dragon, params.dragonMargin),
    starship: segmentEarnings(revenue.starship, params.starshipMargin),
  };

  const total2025 = sumAt(revenue, 0);
  const total2030 = sumAt(revenue, 5);
  const earnings2030 = sumAt(earnings, 5);
  const valuation2030 = total2030 * params.valuationSalesMultiple;
  const cagr5y = (Math.pow(total2030 / total2025, 1 / 5) - 1) * 100;
  const starlinkShare2030 = total2030 > 0 ? revenue.starlink[5] / total2030 * 100 : 0;

  return { revenue, earnings, total2025, total2030, earnings2030, valuation2030, cagr5y, starlinkShare2030 };
}

function makeDatasets(full, color, label) {
  const estimateData = full.map((value, index) => index < EST_COUNT ? value : null);
  const projectionData = full.map((value, index) => index >= EST_COUNT ? value : null);

  return [
    {
      label,
      data: estimateData,
      backgroundColor: color,
      stack: 'stack',
      borderRadius: { topLeft: 3, topRight: 3 },
      borderSkipped: false,
    },
    {
      label: `__proj__${label}`,
      data: projectionData,
      backgroundColor: `${color}55`,
      borderColor: color,
      borderWidth: 1.5,
      stack: 'stack',
      borderRadius: { topLeft: 3, topRight: 3 },
      borderSkipped: false,
      borderDash: [4, 3],
    },
  ];
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
        labels: YEARS.map(year => year >= 2026 ? `${year}*` : `${year}e`),
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
              label(ctx) {
                if (ctx.dataset.label.startsWith('__proj__')) return null;
                const value = ctx.raw;
                if (value === null || value === 0) return null;
                return `${ctx.dataset.label}: $${value.toFixed(1)}B`;
              },
              title(items) {
                const year = YEARS[items[0].dataIndex];
                return year === 2025 ? '2025 estimated baseline' : `${year} projected`;
              },
            },
            filter: item => !item.dataset.label.startsWith('__proj__'),
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

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [source]);

  return (
    <div style={{ position: 'relative', width: '100%', height: type === 'earnings' ? 300 : 360 }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Stacked bar chart of SpaceX ${type} by segment from 2025 to 2030`}
      >
        SpaceX {type} by segment, 2025 estimated and 2026-2030 projected.
      </canvas>
    </div>
  );
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
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>
            {label}
          </span>
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

function SliderField({ label, id, value, min, max, step = 1, unit = '%', tooltip, onChange }) {
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
          color: '#4da3ff',
          minWidth: 54,
          textAlign: 'right',
        }}>
          {value}{unit}
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
      <span style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: accent,
      }} />
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
      <SectionCard title="Starlink" accent={SEGMENT_COLORS.starlink}>
        <SliderField
          label="Annual growth rate"
          id="starlinkCAGR"
          value={params.starlinkCAGR}
          min={0}
          max={60}
          tooltip={TOOLTIPS.cagr}
          onChange={set('starlinkCAGR')}
        />
        <SliderField
          label="Operating margin"
          id="starlinkMargin"
          value={params.starlinkMargin}
          min={-20}
          max={60}
          tooltip={TOOLTIPS.margin}
          onChange={set('starlinkMargin')}
        />
      </SectionCard>

      <SectionCard title="Launch Services" accent={SEGMENT_COLORS.launch}>
        <SliderField
          label="Annual growth rate"
          id="launchCAGR"
          value={params.launchCAGR}
          min={-10}
          max={40}
          tooltip={TOOLTIPS.cagr}
          onChange={set('launchCAGR')}
        />
        <SliderField
          label="Operating margin"
          id="launchMargin"
          value={params.launchMargin}
          min={-20}
          max={50}
          tooltip={TOOLTIPS.margin}
          onChange={set('launchMargin')}
        />
      </SectionCard>

      <SectionCard title="Government Systems" accent={SEGMENT_COLORS.gov}>
        <SliderField
          label="Annual growth rate"
          id="govCAGR"
          value={params.govCAGR}
          min={-10}
          max={50}
          tooltip={TOOLTIPS.cagr}
          onChange={set('govCAGR')}
        />
        <SliderField
          label="Operating margin"
          id="govMargin"
          value={params.govMargin}
          min={-20}
          max={50}
          tooltip={TOOLTIPS.margin}
          onChange={set('govMargin')}
        />
      </SectionCard>

      <SectionCard title="Dragon" accent={SEGMENT_COLORS.dragon}>
        <SliderField
          label="Annual growth rate"
          id="dragonCAGR"
          value={params.dragonCAGR}
          min={-10}
          max={30}
          tooltip={TOOLTIPS.cagr}
          onChange={set('dragonCAGR')}
        />
        <SliderField
          label="Operating margin"
          id="dragonMargin"
          value={params.dragonMargin}
          min={-20}
          max={50}
          tooltip={TOOLTIPS.margin}
          onChange={set('dragonMargin')}
        />
      </SectionCard>

      <SectionCard title="Starship" accent={SEGMENT_COLORS.starship}>
        <NumberField
          label="Revenue in 2030"
          value={params.starship2030Revenue}
          min={0}
          max={60}
          step={0.5}
          suffix="USD B"
          tooltip={TOOLTIPS.starshipRevenue}
          onChange={set('starship2030Revenue')}
        />
        <SliderField
          label="Operating margin"
          id="starshipMargin"
          value={params.starshipMargin}
          min={-100}
          max={50}
          tooltip={TOOLTIPS.margin}
          onChange={set('starshipMargin')}
        />
      </SectionCard>

      <SectionCard title="Valuation" accent="#f0eff8">
        <SliderField
          label="2030 revenue multiple"
          id="valuationSalesMultiple"
          value={params.valuationSalesMultiple}
          min={5}
          max={40}
          step={0.5}
          unit="x"
          tooltip={TOOLTIPS.valuation}
          onChange={set('valuationSalesMultiple')}
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

export default function SpaceXPage() {
  const [params, setParams] = useState(DEFAULTS);
  const projections = useMemo(() => buildProjections(params), [params]);

  return (
    <>
      <PageMeta {...PAGE_META.spacex} />
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
            onMouseEnter={event => event.currentTarget.style.color = '#4da3ff'}
            onMouseLeave={event => event.currentTarget.style.color = 'var(--text3)'}
          >
            &lt;- greaux
          </Link>
        </div>

        <header style={{
          background: 'linear-gradient(180deg, rgba(77,163,255,0.04) 0%, transparent 100%)',
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
                  color: '#4da3ff',
                  border: '1px solid rgba(77,163,255,0.28)',
                  borderRadius: 100,
                  padding: '5px 12px',
                  marginBottom: 10,
                  letterSpacing: '0.06em',
                }}>
                  SPACEX · PRIVATE COMPANY PROJECTION MODEL
                </div>
                <h1 style={{
                  fontSize: 'clamp(24px, 4vw, 36px)',
                  fontWeight: 700,
                  color: 'var(--text)',
                  lineHeight: 1.15,
                  marginBottom: 8,
                }}>
                  SpaceX Revenue<br />
                  <span style={{ color: '#4da3ff' }}>Growth Dashboard</span>
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--mono)', maxWidth: 650, lineHeight: 1.6 }}>
                  Estimated 2025 baseline · Projected 2026-2030 · All figures in USD billions
                </p>
              </div>
              <div style={{
                maxWidth: 330,
                fontSize: 12,
                fontFamily: 'var(--mono)',
                color: 'var(--text3)',
                lineHeight: 1.55,
                textAlign: 'right',
              }}>
                SpaceX is private. Revenue, margins, and valuation are not reported like a public issuer; this model is illustrative.
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
              label="2025 Revenue Est."
              value={`$${fmt(projections.total2025, 1)}B`}
              sub="Private-company baseline"
              accent="#4da3ff"
              tooltip={TOOLTIPS.privateData}
            />
            <MetricCard
              label="2030 Projected"
              value={`$${fmt(projections.total2030, 1)}B`}
              sub="Based on your assumptions"
              accent="var(--accent)"
              tooltip={TOOLTIPS.totalRevenue}
            />
            <MetricCard
              label="5-Year CAGR"
              value={`${fmt(projections.cagr5y, 1)}%`}
              sub="2025e to 2030"
              accent="var(--green)"
              tooltip={TOOLTIPS.cagr}
            />
            <MetricCard
              label="2030 Earnings"
              value={`$${fmt(projections.earnings2030, 1)}B`}
              sub="Segment revenue x margin"
              accent="var(--amber)"
              tooltip={TOOLTIPS.margin}
            />
            <MetricCard
              label="2030 Valuation"
              value={fmtValuation(projections.valuation2030)}
              sub={`${params.valuationSalesMultiple}x projected revenue`}
              accent="var(--pink)"
              tooltip={TOOLTIPS.valuation}
            />
            <MetricCard
              label="Starlink Share"
              value={`${fmt(projections.starlinkShare2030, 0)}%`}
              sub="Of projected 2030 revenue"
              accent={SEGMENT_COLORS.starlink}
            />
          </div>

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
                  Annual revenue by segment
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                  2025e is estimated; * denotes projected years
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
                  Annual earnings by segment
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                  Earnings = revenue x segment operating margin
                </p>
              </div>
              <SegmentLegend />
            </div>
            <StackedBarChart projections={projections} type="earnings" />
          </section>

          <CollapsibleSection
            eyebrow="Scenario controls"
            title="Adjust projection assumptions"
            description="Segment growth, Starship revenue, operating margin, and valuation inputs."
            accent="#4da3ff"
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
                onMouseEnter={event => { event.target.style.borderColor = '#4da3ff'; event.target.style.color = '#4da3ff'; }}
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
              title="Launch cadence"
              subtitle="Reported through 2025; * years use a base-case cadence ramp."
            >
              <InsightBarChart
                labels={OPERATING_METRICS.launchYears}
                unit=""
                decimals={0}
                ariaLabel="SpaceX annual orbital launches from 2020 through 2030, with 2026 through 2030 projected"
                datasets={[
                  {
                    label: 'Orbital launches',
                    data: OPERATING_METRICS.orbitalLaunchesActual,
                    backgroundColor: '#e8ff47',
                  },
                  {
                    label: 'projected',
                    data: OPERATING_METRICS.orbitalLaunchesProjected,
                    backgroundColor: '#e8ff4755',
                    borderColor: '#e8ff47',
                    borderWidth: 1.5,
                    borderDash: [4, 3],
                  },
                ]}
              />
            </InsightCard>

            <InsightCard
              title="Starlink active customers"
              subtitle="Public milestones through Feb. 2026; * years use a decelerating growth scenario."
            >
              <InsightBarChart
                labels={OPERATING_METRICS.starlinkMilestones}
                unit="M"
                decimals={1}
                ariaLabel="Starlink active customer milestones from January 2022 through 2030, with December 2026 through 2030 projected"
                datasets={[
                  {
                    label: 'Active customers',
                    data: OPERATING_METRICS.starlinkCustomersActualM,
                    backgroundColor: '#4da3ff',
                  },
                  {
                    label: 'projected',
                    data: OPERATING_METRICS.starlinkCustomersProjectedM,
                    backgroundColor: '#4da3ff55',
                    borderColor: '#4da3ff',
                    borderWidth: 1.5,
                    borderDash: [4, 3],
                  },
                ]}
              />
            </InsightCard>

            <InsightCard
              title="Payload mass launched"
              subtitle="Official 2023-2025 S-1 history; * years are base-case mass-to-orbit projections."
            >
              <InsightBarChart
                labels={OPERATING_METRICS.payloadMassYears}
                unit=" t"
                decimals={0}
                ariaLabel="SpaceX total payload mass launched to orbit by year from 2023 through 2030, with 2026 through 2030 projected"
                datasets={[
                  {
                    label: 'Mass to orbit',
                    data: OPERATING_METRICS.payloadMassActualMetricTons,
                    backgroundColor: '#3ddea0',
                  },
                  {
                    label: 'projected',
                    data: OPERATING_METRICS.payloadMassProjectedMetricTons,
                    backgroundColor: '#3ddea055',
                    borderColor: '#3ddea0',
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
          Not financial advice · SpaceX is private · Baseline and projections are illustrative
        </footer>
      </div>
    </>
  );
}
