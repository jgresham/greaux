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

const ACCENT = '#76b900';
const YEARS = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
const HIST_COUNT = 3;
const FINAL_INDEX = YEARS.length - 1;

const SEGMENT_COLORS = {
  dataCenter: '#76b900',
  gaming:     '#4da3ff',
  profViz:    '#a78bfa',
  automotive: '#ffb347',
  oem:        '#5a5a72',
};

const SEGMENT_LABELS = {
  dataCenter: 'Data Center',
  gaming:     'Gaming',
  profViz:    'Professional Visualization',
  automotive: 'Automotive',
  oem:        'OEM & Other',
};

// Nvidia fiscal year actuals (FY ending late January of that calendar year)
const BASE = {
  2023: { dataCenter: 15.01, gaming: 9.07, profViz: 1.54, automotive: 0.90, oem: 0.45 },
  2024: { dataCenter: 47.53, gaming: 10.45, profViz: 1.55, automotive: 1.09, oem: 0.30 },
  2025: { dataCenter: 115.19, gaming: 11.44, profViz: 1.87, automotive: 1.69, oem: 0.31 },
};

const DEFAULTS = {
  dataCenterCAGR: 25,
  gamingCAGR: 7,
  profVizCAGR: 12,
  automotiveCAGR: 40,
  oemCAGR: 2,
  netMargin: 55,
  peMultiple: 30,
  sharesB: 24.0,
};

const TOOLTIPS = {
  dataCenterCAGR: 'Projected CAGR from the FY2025 base of $115.2B. Driven by Blackwell GPU demand, NVLink domains, and inference infrastructure build-out.',
  gamingCAGR: 'Projected CAGR from the FY2025 base of $11.4B. Driven by RTX upgrade cycle and laptop GPU attach rates.',
  profVizCAGR: 'Projected CAGR from the FY2025 base of $1.9B. Driven by RTX workstation and Omniverse enterprise adoption.',
  automotiveCAGR: 'Projected CAGR from the FY2025 base of $1.7B. Driven by DRIVE Thor design wins ramping across OEM fleets.',
  oemCAGR: 'Projected CAGR from the FY2025 base of $0.3B. Includes embedded module and crypto-mining GPU tail.',
  netMargin: "Nvidia's net income as a percentage of revenue. FY2025 actual was ~55.8%, reflecting high-ASP datacenter GPU mix.",
  peMultiple: 'Price-to-earnings multiple applied to modeled 2030 net income.',
  sharesB: 'Diluted shares in billions. Default reflects FY2025 level (~24.8B) with modest buyback reduction assumed through 2030.',
};

const sourceNotes = [
  'FY2023–FY2025 segment revenue from Nvidia Annual Reports (10-K). Fiscal year ends late January.',
  'FY2026 Data Center includes Blackwell ramp; Nvidia guided ≥$43B revenue for Q1 FY2026 alone.',
  'Automotive CAGR anchored to Nvidia DRIVE Thor design-win pipeline disclosed at GTC 2025.',
  'Net margin default of 55% matches FY2025 GAAP net income / revenue.',
  'Earnings and share price are modeled outputs — not Nvidia guidance.',
];

const OPERATING_METRICS = {
  historicalYears: ['FY2022', 'FY2023', 'FY2024', 'FY2025'],
  dataCenterActualB: [10.61, 15.01, 47.53, 115.19],
  gamingActualB: [12.46, 9.07, 10.45, 11.44],
  automotiveActualB: [0.57, 0.90, 1.09, 1.69],
  mixYears: ['FY2023', 'FY2024', 'FY2025'],
  dcSharePct: [55.6, 78.0, 88.3],
  gamingSharePct: [33.6, 17.2, 8.8],
  otherSharePct: [10.8, 4.8, 2.9],
};

const fmt = (n, decimals = 0) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

const fmtUsdB = value =>
  value >= 1000 ? `$${fmt(value / 1000, 2)}T` : `$${fmt(value, value < 10 ? 2 : 1)}B`;

const fmtUsd = value => `$${fmt(value, value < 100 ? 2 : 0)}`;

function projectCAGR(lastValue, cagr, count = 5) {
  return Array.from({ length: count }, (_, i) =>
    Number((lastValue * Math.pow(1 + cagr / 100, i + 1)).toFixed(2))
  );
}

function sumSegments(segObj, index) {
  return Object.values(segObj).reduce((sum, arr) => sum + (arr[index] ?? 0), 0);
}

function buildProjections(params) {
  const hist = Object.keys(SEGMENT_COLORS).map(seg => [seg, [
    BASE[2023][seg],
    BASE[2024][seg],
    BASE[2025][seg],
  ]]);

  const projMap = {
    dataCenter: projectCAGR(BASE[2025].dataCenter, params.dataCenterCAGR),
    gaming:     projectCAGR(BASE[2025].gaming,     params.gamingCAGR),
    profViz:    projectCAGR(BASE[2025].profViz,     params.profVizCAGR),
    automotive: projectCAGR(BASE[2025].automotive,  params.automotiveCAGR),
    oem:        projectCAGR(BASE[2025].oem,         params.oemCAGR),
  };

  const revenue = Object.fromEntries(
    hist.map(([seg, histArr]) => [seg, [...histArr, ...projMap[seg]]])
  );

  const earnings = Object.fromEntries(
    Object.entries(revenue).map(([seg, arr]) => [
      seg,
      arr.map(v => Number((v * params.netMargin / 100).toFixed(2))),
    ])
  );

  const total2025    = sumSegments(revenue, 2);
  const total2030    = sumSegments(revenue, FINAL_INDEX);
  const earnings2030 = sumSegments(earnings, FINAL_INDEX);
  const marketCap    = earnings2030 * params.peMultiple;
  const sharePrice   = params.sharesB > 0 ? marketCap / params.sharesB : 0;
  const eps2030      = params.sharesB > 0 ? earnings2030 / params.sharesB : 0;
  const cagr5y       = total2025 > 0 ? (Math.pow(total2030 / total2025, 1 / 5) - 1) * 100 : 0;
  const dcShare2030  = total2030 > 0 ? revenue.dataCenter[FINAL_INDEX] / total2030 * 100 : 0;

  return { revenue, earnings, total2025, total2030, earnings2030, marketCap, sharePrice, eps2030, cagr5y, dcShare2030 };
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
        aria-label={`Stacked bar chart of Nvidia ${type} by segment FY2023 through FY2030`}>
        Nvidia {type} by segment, FY2023–FY2025 actual and FY2026–FY2030 projected.
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
          {label}
          {tooltip && <Tooltip text={tooltip} />}
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
        {label}
        {tooltip && <Tooltip text={tooltip} />}
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
  const set = key => value => onChange({ ...params, [key]: value });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
      <SectionCard title="Data Center" accent={SEGMENT_COLORS.dataCenter}>
        <SliderField label="CAGR from FY2025" id="dcCAGR" value={params.dataCenterCAGR}
          min={0} max={60} tooltip={TOOLTIPS.dataCenterCAGR} onChange={set('dataCenterCAGR')} />
      </SectionCard>
      <SectionCard title="Gaming" accent={SEGMENT_COLORS.gaming}>
        <SliderField label="CAGR from FY2025" id="gamingCAGR" value={params.gamingCAGR}
          min={-10} max={30} tooltip={TOOLTIPS.gamingCAGR} accent={SEGMENT_COLORS.gaming} onChange={set('gamingCAGR')} />
      </SectionCard>
      <SectionCard title="Professional Visualization" accent={SEGMENT_COLORS.profViz}>
        <SliderField label="CAGR from FY2025" id="profVizCAGR" value={params.profVizCAGR}
          min={-5} max={40} tooltip={TOOLTIPS.profVizCAGR} accent={SEGMENT_COLORS.profViz} onChange={set('profVizCAGR')} />
      </SectionCard>
      <SectionCard title="Automotive" accent={SEGMENT_COLORS.automotive}>
        <SliderField label="CAGR from FY2025" id="automotiveCAGR" value={params.automotiveCAGR}
          min={0} max={80} tooltip={TOOLTIPS.automotiveCAGR} accent={SEGMENT_COLORS.automotive} onChange={set('automotiveCAGR')} />
      </SectionCard>
      <SectionCard title="Margin &amp; Valuation" accent={ACCENT}>
        <SliderField label="Net margin" id="netMargin" value={params.netMargin}
          min={30} max={70} tooltip={TOOLTIPS.netMargin} onChange={set('netMargin')} />
        <SliderField label="2030 P/E multiple" id="peMultiple" value={params.peMultiple}
          min={10} max={80} unit="x" tooltip={TOOLTIPS.peMultiple} onChange={set('peMultiple')} />
        <NumberField label="Diluted shares" value={params.sharesB} min={18} max={26} step={0.1}
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

export function NvidiaLogoMark({ width = 100, fill = '#76b900' }) {
  return (
    <svg viewBox="316.2 33.8 630.2 118.2" width={width} height={width * (118.2 / 630.2)}
      aria-label="Nvidia logo" role="img" style={{ display: 'block' }}>
      <path d="M578.2 34v118h33.3V34h-33.3zm-262-.2v118.1h33.6V60.2l26.2.1c8.6 0 14.6 2.1 18.7 6.5 5.3 5.6 7.4 14.7 7.4 31.2v53.9h32.6V86.7c0-46.6-29.7-52.9-58.7-52.9h-59.8zm315.7.2v118h54c28.8 0 38.2-4.8 48.3-15.5 7.2-7.5 11.8-24.1 11.8-42.2 0-16.6-3.9-31.4-10.8-40.6C723 37.2 705.2 34 678.6 34h-46.7zm33 25.6h14.3c20.8 0 34.2 9.3 34.2 33.5s-13.4 33.6-34.2 33.6h-14.3V59.6zM530.2 34l-27.8 93.5L475.8 34h-36l38 118h48l38.4-118h-34zm231.4 118h33.3V34h-33.3v118zM855 34l-46.5 117.9h32.8l7.4-20.9h55l7 20.8h35.7L899.5 34H855zm21.6 21.5l20.2 55.2h-41l20.8-55.2z"
        fill={fill} />
    </svg>
  );
}

export default function NvidiaPage() {
  const [params, setParams] = useState(DEFAULTS);
  const projections = useMemo(() => buildProjections(params), [params]);

  return (
    <>
      <PageMeta {...PAGE_META.nvidia} />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid var(--border)', padding: '0.65rem 2.5rem', background: 'var(--bg)' }}>
          <Link to="/"
            style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = ACCENT}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
            ← greaux
          </Link>
        </div>

        <header style={{ background: 'linear-gradient(180deg, rgba(118,185,0,0.06) 0%, transparent 100%)', borderBottom: '1px solid var(--border)', padding: '2rem 2.5rem 1.75rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 11, fontFamily: 'var(--mono)', color: ACCENT, border: '1px solid rgba(118,185,0,0.34)', borderRadius: 100, padding: '5px 14px', marginBottom: 10, letterSpacing: '0.06em' }}>
                  <NvidiaLogoMark width={62} fill={ACCENT} />
                  NVDA · AI INFRASTRUCTURE MODEL
                </div>
                <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.15, marginBottom: 8 }}>
                  Nvidia Revenue<br />
                  <span style={{ color: ACCENT }}>Growth Dashboard</span>
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--mono)', maxWidth: 720, lineHeight: 1.6 }}>
                  FY2023–FY2025 actuals · Projected FY2026–FY2030 · All figures in USD billions · Fiscal year ends late January
                </p>
              </div>
              <div style={{ maxWidth: 360, fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', lineHeight: 1.55, textAlign: 'right' }}>
                FY2023–FY2025 segment revenue from Nvidia 10-K filings. Projections are scenario defaults. Not financial advice.
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem 2.5rem', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
            <MetricCard label="FY2025 Revenue" value={fmtUsdB(projections.total2025)} sub="Actual · Form 10-K" accent={ACCENT} />
            <MetricCard label="FY2030 Revenue" value={fmtUsdB(projections.total2030)} sub={`${fmt(projections.cagr5y, 1)}% CAGR`} accent="var(--accent)" />
            <MetricCard label="FY2030 Earnings" value={fmtUsdB(projections.earnings2030)} sub={`${params.netMargin}% net margin`} accent="var(--green)" />
            <MetricCard label="FY2030 Valuation" value={fmtUsdB(projections.marketCap)} sub={`${params.peMultiple}x P/E`} accent="var(--pink)" />
            <MetricCard label="Data Center Share" value={`${fmt(projections.dcShare2030, 0)}%`} sub="of FY2030 revenue" accent={SEGMENT_COLORS.dataCenter} />
            <MetricCard label="FY2030 Share Price" value={fmtUsd(projections.sharePrice)} sub={`EPS ${fmtUsd(projections.eps2030)}`} accent={ACCENT} />
          </div>

          {/* Share price hero */}
          <section style={{ background: 'linear-gradient(135deg, var(--bg2) 0%, rgba(118,185,0,0.05) 100%)', border: '1px solid rgba(118,185,0,0.28)', borderRadius: 'var(--radius-lg)', padding: '1.6rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                FY2030 Projected Share Price
              </div>
              <div style={{ fontSize: 'clamp(42px, 7vw, 66px)', fontWeight: 700, color: ACCENT, lineHeight: 1, marginBottom: 10 }}>
                {fmtUsd(projections.sharePrice)}
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
                <span>{fmtUsdB(projections.marketCap)} market cap</span>
                <span>{fmtUsdB(projections.earnings2030)} net income</span>
                <span>{params.sharesB}B diluted shares</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'right' }}>
              <span style={{ color: 'rgba(118,185,0,0.72)' }}>Adjust segment CAGRs, margin, and P/E below</span>
              <span>{fmt(projections.dcShare2030, 0)}% of FY2030 revenue from Data Center</span>
              <span>{params.peMultiple}x P/E on modeled net income</span>
            </div>
          </section>

          {/* Revenue chart */}
          <section style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Annual revenue by segment</h2>
                <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>FY2023–FY2025 actual; * denotes projected years</p>
              </div>
              <SegmentLegend />
            </div>
            <StackedBarChart projections={projections} type="revenue" />
          </section>

          {/* Earnings chart */}
          <section style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Annual earnings by segment</h2>
                <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>Earnings = revenue × net margin scenario</p>
              </div>
              <SegmentLegend />
            </div>
            <StackedBarChart projections={projections} type="earnings" />
          </section>

          <CollapsibleSection
            eyebrow="Scenario controls"
            title="Adjust projection assumptions"
            description="Segment CAGRs from the FY2025 base, net margin, P/E multiple, and shares outstanding."
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
            <InsightCard title="Data Center revenue" subtitle="FY2022–FY2025 actuals. Powered by H100, H200, and Blackwell GPU ramp for AI training and inference.">
              <InsightBarChart
                labels={OPERATING_METRICS.historicalYears}
                unit="B" decimals={1}
                ariaLabel="Nvidia Data Center revenue FY2022 to FY2025"
                datasets={[
                  { label: 'Data Center', data: OPERATING_METRICS.dataCenterActualB, backgroundColor: SEGMENT_COLORS.dataCenter },
                  { label: 'Gaming',      data: OPERATING_METRICS.gamingActualB,     backgroundColor: SEGMENT_COLORS.gaming },
                  { label: 'Automotive',  data: OPERATING_METRICS.automotiveActualB, backgroundColor: SEGMENT_COLORS.automotive },
                ]}
              />
            </InsightCard>

            <InsightCard title="Revenue segment mix" subtitle="Data Center share of total revenue has grown from 56% in FY2023 to 88% in FY2025.">
              <InsightBarChart
                labels={OPERATING_METRICS.mixYears}
                unit="%" decimals={1}
                ariaLabel="Nvidia revenue segment mix FY2023 to FY2025"
                datasets={[
                  { label: 'Data Center %', data: OPERATING_METRICS.dcSharePct,     backgroundColor: SEGMENT_COLORS.dataCenter },
                  { label: 'Gaming %',      data: OPERATING_METRICS.gamingSharePct,  backgroundColor: SEGMENT_COLORS.gaming },
                  { label: 'Other %',       data: OPERATING_METRICS.otherSharePct,   backgroundColor: SEGMENT_COLORS.oem },
                ]}
              />
            </InsightCard>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
            {sourceNotes.map(note => <SourcePill key={note}>{note}</SourcePill>)}
          </div>
        </main>

        <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 2.5rem', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'center' }}>
          Not financial advice · Historical data from Nvidia SEC filings and investor materials · Projections are illustrative
        </footer>
      </div>
    </>
  );
}
