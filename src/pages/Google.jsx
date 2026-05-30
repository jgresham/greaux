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

const ACCENT = '#4285F4';
const YEARS = [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029];
const HIST_COUNT = 3;
const FINAL_INDEX = YEARS.length - 1;

const SEGMENT_COLORS = {
  search:  '#4285F4',
  youtube: '#EA4335',
  cloud:   '#34A853',
  subs:    '#FBBC05',
  network: '#8a8fa8',
};

const SEGMENT_LABELS = {
  search:  'Google Search',
  youtube: 'YouTube Ads',
  cloud:   'Google Cloud',
  subs:    'Subscriptions & Platforms',
  network: 'Google Network',
};

// Alphabet CY segment revenue (USD billions). Source: Form 10-K filings.
// "subs" = Google subscriptions, platforms & devices (Google One, YouTube Premium, Pixel, Workspace).
// "network" = Google Network Members' properties (AdSense, AdMob, Google Ad Manager).
const BASE = {
  2022: { search: 162.45, youtube: 29.24, cloud: 26.28, subs: 29.06, network: 35.81 },
  2023: { search: 175.03, youtube: 31.51, cloud: 33.09, subs: 34.00, network: 33.76 },
  2024: { search: 198.09, youtube: 36.15, cloud: 43.22, subs: 40.29, network: 32.64 },
};

const DEFAULTS = {
  searchCAGR:  10,
  youtubeCAGR: 12,
  cloudCAGR:   25,
  subsCAGR:    12,
  networkCAGR:  3,
  netMargin:   28,
  peMultiple:  22,
  sharesB:     12.3,
};

const TOOLTIPS = {
  searchCAGR:  "CAGR from CY2024 base of $198.1B. AI Overviews expanding query coverage; Search ad prices resilient. Modest deceleration from ~12% in 2023–2024.",
  youtubeCAGR: "CAGR from CY2024 base of $36.2B. Connected TV ad spend shift, YouTube Shorts monetization ramp, and direct-response growth.",
  cloudCAGR:   "CAGR from CY2024 base of $43.2B. GCP gaining enterprise share through Gemini integration, BigQuery, and Vertex AI. Smaller base than AWS/Azure supports faster growth.",
  subsCAGR:    "CAGR from CY2024 base of $40.3B. Google One surpassed 100M paid subscribers in 2023. YouTube Premium and Google Workspace seats growing.",
  networkCAGR: "CAGR from CY2024 base of $32.6B. AdSense and AdMob under structural pressure from third-party cookie deprecation and first-party signal shift.",
  netMargin:   "GAAP net margin. Alphabet's 2024 GAAP net margin was ~28.6% on $100.1B net income. Cloud segment turning highly profitable accelerates margin expansion.",
  peMultiple:  "P/E applied to modeled 2029 GAAP net income. Alphabet has traded at 20–25x forward earnings. Default of 22x is near the low end of recent range.",
  sharesB:     "Diluted shares. Alphabet had ~12.3B diluted shares at end of 2024. Authorized $70B+ buyback in 2024; default assumes modest continued reduction.",
};

const sourceNotes = [
  "2022–2024 segment revenue from Alphabet Inc. Form 10-K filings (filed Feb 2023, 2024, 2025).",
  "Google Cloud: $43.2B in CY2024 (+28.8% YoY). First full year of positive operating income for Cloud segment.",
  "YouTube Ads: $36.2B CY2024. Flat 2022–2023 due to macro; re-accelerating in 2024 via CTV and Shorts.",
  "Subscriptions & Platforms includes Google One (100M+ paid), YouTube Premium, Pixel devices, and Google Workspace.",
  "Google Network revenue declined from $35.8B (2022) to $32.6B (2024) reflecting cookie deprecation and signal loss.",
  "2024 Alphabet GAAP net income: $100.1B. Net margin: 28.6%. Diluted EPS: $8.04.",
];

const OPERATING_METRICS = {
  cloudYears:     ['2019', '2020', '2021', '2022', '2023', '2024', "2025*", "2026*", "2027*"],
  cloudActual:    [8.92, 13.06, 19.21, 26.28, 33.09, 43.22, null, null, null],
  cloudProj:      [null, null, null, null, null, null, 54.0, 67.5, 84.4],
  youtubeYears:   ['2019', '2020', '2021', '2022', '2023', '2024', "2025*", "2026*", "2027*"],
  youtubeActual:  [15.15, 19.77, 28.85, 29.24, 31.51, 36.15, null, null, null],
  youtubeProj:    [null, null, null, null, null, null, 40.5, 45.4, 50.8],
};

const fmt    = (n, d = 0) => new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const fmtUsdB = v => v >= 1000 ? `$${fmt(v / 1000, 2)}T` : `$${fmt(v, v < 10 ? 2 : 1)}B`;
const fmtUsd  = v => `$${fmt(v, v < 100 ? 2 : 0)}`;

function projectCAGR(base, cagr, count = 5) {
  return Array.from({ length: count }, (_, i) =>
    Number((base * Math.pow(1 + cagr / 100, i + 1)).toFixed(2))
  );
}

function sumAt(obj, i) {
  return Object.values(obj).reduce((s, a) => s + (a[i] ?? 0), 0);
}

function buildProjections(params) {
  const hist = Object.keys(SEGMENT_COLORS).map(seg => [seg, [
    BASE[2022][seg], BASE[2023][seg], BASE[2024][seg],
  ]]);

  const proj = {
    search:  projectCAGR(BASE[2024].search,  params.searchCAGR),
    youtube: projectCAGR(BASE[2024].youtube, params.youtubeCAGR),
    cloud:   projectCAGR(BASE[2024].cloud,   params.cloudCAGR),
    subs:    projectCAGR(BASE[2024].subs,    params.subsCAGR),
    network: projectCAGR(BASE[2024].network, params.networkCAGR),
  };

  const revenue = Object.fromEntries(hist.map(([seg, h]) => [seg, [...h, ...proj[seg]]]));
  const earnings = Object.fromEntries(
    Object.entries(revenue).map(([seg, arr]) => [
      seg, arr.map(v => Number((v * params.netMargin / 100).toFixed(2))),
    ])
  );

  const total2024      = sumAt(revenue, 2);
  const total2029      = sumAt(revenue, FINAL_INDEX);
  const earnings2029   = sumAt(earnings, FINAL_INDEX);
  const marketCap      = earnings2029 * params.peMultiple;
  const sharePrice     = params.sharesB > 0 ? marketCap / params.sharesB : 0;
  const eps2029        = params.sharesB > 0 ? earnings2029 / params.sharesB : 0;
  const cagr5y         = total2024 > 0 ? (Math.pow(total2029 / total2024, 1 / 5) - 1) * 100 : 0;
  const cloudShare2029 = total2029 > 0 ? revenue.cloud[FINAL_INDEX] / total2029 * 100 : 0;

  return { revenue, earnings, total2024, total2029, earnings2029, marketCap, sharePrice, eps2029, cagr5y, cloudShare2029 };
}

function makeDatasets(full, color, label) {
  return [
    {
      label,
      tooltipLabel: label,
      data: full.map((v, i) => i < HIST_COUNT ? v : null),
      backgroundColor: color,
      stack: 'stack',
      borderRadius: { topLeft: 3, topRight: 3 },
      borderSkipped: false,
    },
    {
      label: 'projected',
      tooltipLabel: `${label} projected`,
      data: full.map((v, i) => i >= HIST_COUNT ? v : null),
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
          <span style={{ width: 10, height: 10, borderRadius: 2, background: SEGMENT_COLORS[key], flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</span>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ width: 10, height: 10, borderRadius: 2, border: '1.5px dashed rgba(255,255,255,0.3)', flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>projected</span>
      </div>
    </div>
  );
}

function StackedBarChart({ projections, type }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const source = type === 'earnings' ? projections.earnings : projections.revenue;

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: YEARS.map((y, i) => i >= HIST_COUNT ? `${y}*` : String(y)),
        datasets: Object.keys(SEGMENT_LABELS).flatMap(k =>
          makeDatasets(source[k], SEGMENT_COLORS[k], SEGMENT_LABELS[k])
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
                const i = items[0].dataIndex;
                return i >= HIST_COUNT ? `${YEARS[i]} projected` : `${YEARS[i]} actual`;
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
            ticks: { color: '#5a5a72', font: { family: "'DM Mono', monospace", size: 12 }, autoSkip: false },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.05)' },
            border: { display: false },
            ticks: { color: '#5a5a72', font: { family: "'DM Mono', monospace", size: 12 }, callback: v => `$${v}B` },
          },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [source]);

  return (
    <div style={{ position: 'relative', width: '100%', height: type === 'earnings' ? 310 : 360 }}>
      <canvas ref={canvasRef} role="img"
        aria-label={`Stacked bar chart of Alphabet ${type} by segment 2022 through 2029`}>
        Alphabet {type} by segment, 2022–2024 actual and 2025–2029 projected.
      </canvas>
    </div>
  );
}

function SliderField({ label, id, value, min, max, step = 1, unit = '%', tooltip, accent = ACCENT, onChange }) {
  const decimals = step < 1 ? String(step).split('.')[1]?.length || 1 : 0;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)' }}>
          {label}{tooltip && <Tooltip text={tooltip} />}
        </div>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 500, color: accent, minWidth: 64, textAlign: 'right' }}>
          {fmt(value, decimals)}{unit}
        </span>
      </div>
      <input type="range" id={id} min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

function NumberField({ label, value, min, max, step, tooltip, suffix, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>
        {label}{tooltip && <Tooltip text={tooltip} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="number" min={min} max={max} value={value} step={step}
          onChange={e => onChange(Number(e.target.value))} style={{ flex: 1 }} />
        {suffix && <span style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap', fontFamily: 'var(--mono)' }}>{suffix}</span>}
      </div>
    </div>
  );
}

function SectionCard({ title, accent, children }) {
  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
      <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accent }} />
      <div style={{ marginBottom: 18, fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function InputPanel({ params, onChange }) {
  const set = key => v => onChange({ ...params, [key]: v });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
      <SectionCard title="Google Search" accent={SEGMENT_COLORS.search}>
        <SliderField label="CAGR from 2024" id="searchCAGR" value={params.searchCAGR}
          min={0} max={20} tooltip={TOOLTIPS.searchCAGR} onChange={set('searchCAGR')} />
      </SectionCard>
      <SectionCard title="YouTube Ads" accent={SEGMENT_COLORS.youtube}>
        <SliderField label="CAGR from 2024" id="youtubeCAGR" value={params.youtubeCAGR}
          min={0} max={30} tooltip={TOOLTIPS.youtubeCAGR} accent={SEGMENT_COLORS.youtube} onChange={set('youtubeCAGR')} />
      </SectionCard>
      <SectionCard title="Google Cloud" accent={SEGMENT_COLORS.cloud}>
        <SliderField label="CAGR from 2024" id="cloudCAGR" value={params.cloudCAGR}
          min={5} max={60} tooltip={TOOLTIPS.cloudCAGR} accent={SEGMENT_COLORS.cloud} onChange={set('cloudCAGR')} />
      </SectionCard>
      <SectionCard title="Subscriptions &amp; Platforms" accent={SEGMENT_COLORS.subs}>
        <SliderField label="CAGR from 2024" id="subsCAGR" value={params.subsCAGR}
          min={0} max={25} tooltip={TOOLTIPS.subsCAGR} accent={SEGMENT_COLORS.subs} onChange={set('subsCAGR')} />
      </SectionCard>
      <SectionCard title="Google Network" accent={SEGMENT_COLORS.network}>
        <SliderField label="CAGR from 2024" id="networkCAGR" value={params.networkCAGR}
          min={-10} max={10} tooltip={TOOLTIPS.networkCAGR} accent={SEGMENT_COLORS.network} onChange={set('networkCAGR')} />
      </SectionCard>
      <SectionCard title="Margin &amp; Valuation" accent={ACCENT}>
        <SliderField label="GAAP net margin" id="netMargin" value={params.netMargin}
          min={15} max={45} tooltip={TOOLTIPS.netMargin} onChange={set('netMargin')} />
        <SliderField label="2029 P/E multiple" id="peMultiple" value={params.peMultiple}
          min={10} max={50} unit="x" tooltip={TOOLTIPS.peMultiple} onChange={set('peMultiple')} />
        <NumberField label="Diluted shares" value={params.sharesB} min={10} max={14} step={0.1}
          suffix="B shares" tooltip={TOOLTIPS.sharesB} onChange={set('sharesB')} />
      </SectionCard>
    </div>
  );
}

function SourcePill({ children }) {
  return (
    <span style={{ border: '1px solid var(--border)', borderRadius: 100, padding: '5px 10px', color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 11, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

export function GoogleLogoMark({ width = 120 }) {
  return (
    <svg viewBox="0 0 308 88" width={width} aria-label="Google logo" role="img" style={{ display: 'block' }}>
      <text y="76" fontFamily="Arial, Helvetica, sans-serif" fontSize="88" fontWeight="bold" letterSpacing="-3">
        <tspan fill="#4285F4">G</tspan>
        <tspan fill="#EA4335">o</tspan>
        <tspan fill="#FBBC05">o</tspan>
        <tspan fill="#4285F4">g</tspan>
        <tspan fill="#34A853">l</tspan>
        <tspan fill="#EA4335">e</tspan>
      </text>
    </svg>
  );
}

export default function GooglePage() {
  const [params, setParams] = useState(DEFAULTS);
  const projections = useMemo(() => buildProjections(params), [params]);

  return (
    <>
      <PageMeta {...PAGE_META.google} />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid var(--border)', padding: '0.65rem 2.5rem', background: 'var(--bg)' }}>
          <Link to="/"
            style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = ACCENT}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
            ← greaux
          </Link>
        </div>

        <header style={{ background: 'linear-gradient(180deg, rgba(66,133,244,0.06) 0%, transparent 100%)', borderBottom: '1px solid var(--border)', padding: '2rem 2.5rem 1.75rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 11, fontFamily: 'var(--mono)', color: ACCENT, border: '1px solid rgba(66,133,244,0.34)', borderRadius: 100, padding: '5px 14px', marginBottom: 10, letterSpacing: '0.06em' }}>
                  GOOGL · ALPHABET MODEL
                </div>
                <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.15, marginBottom: 8 }}>
                  Alphabet Revenue<br />
                  <span style={{ color: ACCENT }}>Growth Dashboard</span>
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--mono)', maxWidth: 720, lineHeight: 1.6 }}>
                  2022–2024 actuals · Projected 2025–2029 · All figures in USD billions · Calendar year
                </p>
              </div>
              <div style={{ maxWidth: 360, fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', lineHeight: 1.55, textAlign: 'right' }}>
                2022–2024 segment revenue from Alphabet Form 10-K filings. Projections are scenario defaults. Not financial advice.
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem 2.5rem', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
            <MetricCard label="2024 Revenue"    value={fmtUsdB(projections.total2024)}      sub="Actual · Form 10-K"                   accent={ACCENT} />
            <MetricCard label="2029 Revenue"    value={fmtUsdB(projections.total2029)}      sub={`${fmt(projections.cagr5y, 1)}% CAGR`} accent="var(--accent)" />
            <MetricCard label="2029 Earnings"   value={fmtUsdB(projections.earnings2029)}   sub={`${params.netMargin}% GAAP margin`}   accent="var(--green)" />
            <MetricCard label="2029 Valuation"  value={fmtUsdB(projections.marketCap)}      sub={`${params.peMultiple}x P/E`}          accent="var(--pink)" />
            <MetricCard label="Cloud Share 2029" value={`${fmt(projections.cloudShare2029, 0)}%`} sub="of 2029 revenue"                accent={SEGMENT_COLORS.cloud} />
            <MetricCard label="2029 Share Price" value={fmtUsd(projections.sharePrice)}     sub={`EPS ${fmtUsd(projections.eps2029)}`} accent={ACCENT} />
          </div>

          <section style={{ background: 'linear-gradient(135deg, var(--bg2) 0%, rgba(66,133,244,0.05) 100%)', border: '1px solid rgba(66,133,244,0.28)', borderRadius: 'var(--radius-lg)', padding: '1.6rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                2029 Projected Share Price
              </div>
              <div style={{ fontSize: 'clamp(42px, 7vw, 66px)', fontWeight: 700, color: ACCENT, lineHeight: 1, marginBottom: 10 }}>
                {fmtUsd(projections.sharePrice)}
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
                <span>{fmtUsdB(projections.marketCap)} market cap</span>
                <span>{fmtUsdB(projections.earnings2029)} GAAP net income</span>
                <span>{params.sharesB}B diluted shares</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'right' }}>
              <span style={{ color: 'rgba(66,133,244,0.72)' }}>Adjust segment CAGRs, margin, and P/E below</span>
              <span>{fmt(projections.cloudShare2029, 0)}% of 2029 revenue from Google Cloud</span>
              <span>{params.peMultiple}x P/E on modeled GAAP net income</span>
            </div>
          </section>

          <section style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Annual revenue by segment</h2>
                <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>2022–2024 actual; * denotes projected years</p>
              </div>
              <SegmentLegend />
            </div>
            <StackedBarChart projections={projections} type="revenue" />
          </section>

          <section style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Annual earnings by segment</h2>
                <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>GAAP earnings = revenue × net margin scenario</p>
              </div>
              <SegmentLegend />
            </div>
            <StackedBarChart projections={projections} type="earnings" />
          </section>

          <CollapsibleSection
            eyebrow="Scenario controls"
            title="Adjust projection assumptions"
            description="Segment CAGRs from the 2024 base, GAAP net margin, P/E multiple, and diluted shares outstanding."
            accent={ACCENT}
          >
            <InputPanel params={params} onChange={setParams} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button onClick={() => setParams(DEFAULTS)}
                style={{ background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', fontSize: 13, fontFamily: 'var(--mono)', padding: '8px 16px', borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'border-color 0.2s, color 0.2s' }}
                onMouseEnter={e => { e.target.style.borderColor = ACCENT; e.target.style.color = ACCENT; }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.color = 'var(--text2)'; }}>
                Reset to defaults
              </button>
            </div>
          </CollapsibleSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: '1.75rem' }}>
            <InsightCard title="Google Cloud revenue growth" subtitle="GCP grew from $8.9B (2019) to $43.2B (2024), reaching profitability for the first time in 2023. Gemini and Vertex AI are accelerating enterprise adoption.">
              <InsightBarChart
                labels={OPERATING_METRICS.cloudYears}
                unit="B" decimals={1}
                ariaLabel="Google Cloud revenue 2019 to 2024 with projections through 2027"
                datasets={[
                  { label: 'Google Cloud',    data: OPERATING_METRICS.cloudActual, backgroundColor: SEGMENT_COLORS.cloud },
                  { label: 'projected', data: OPERATING_METRICS.cloudProj,  backgroundColor: `${SEGMENT_COLORS.cloud}55` },
                ]}
              />
            </InsightCard>

            <InsightCard title="YouTube advertising revenue" subtitle="YouTube reached $36.2B in ad revenue in 2024. Growth paused in 2022 due to macro headwinds; re-accelerating via connected TV and Shorts monetization.">
              <InsightBarChart
                labels={OPERATING_METRICS.youtubeYears}
                unit="B" decimals={1}
                ariaLabel="YouTube advertising revenue 2019 to 2024 with projections through 2027"
                datasets={[
                  { label: 'YouTube Ads',     data: OPERATING_METRICS.youtubeActual, backgroundColor: SEGMENT_COLORS.youtube },
                  { label: 'projected', data: OPERATING_METRICS.youtubeProj,  backgroundColor: `${SEGMENT_COLORS.youtube}55` },
                ]}
              />
            </InsightCard>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
            {sourceNotes.map(note => <SourcePill key={note}>{note}</SourcePill>)}
          </div>
        </main>

        <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 2.5rem', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'center' }}>
          Not financial advice · Historical data from Alphabet SEC filings · Projections are illustrative
        </footer>
      </div>
    </>
  );
}
