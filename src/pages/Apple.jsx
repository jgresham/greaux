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

const ACCENT = '#0071e3';
const YEARS = [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029];
const HIST_COUNT = 3;
const FINAL_INDEX = YEARS.length - 1;

const SEGMENT_COLORS = {
  iphone:    '#0071e3',
  services:  '#34C759',
  mac:       '#FF9500',
  ipad:      '#BF5AF2',
  wearables: '#FF3B30',
};

const SEGMENT_LABELS = {
  iphone:    'iPhone',
  services:  'Services',
  mac:       'Mac',
  ipad:      'iPad',
  wearables: 'Wearables & Home',
};

const BASE = {
  2022: { iphone: 205.49, services: 78.13, mac: 40.18, ipad: 29.29, wearables: 41.24 },
  2023: { iphone: 200.58, services: 85.20, mac: 29.36, ipad: 28.30, wearables: 39.84 },
  2024: { iphone: 201.18, services: 96.17, mac: 29.98, ipad: 26.69, wearables: 37.01 },
};

const DEFAULTS = {
  iphoneCAGR:    5,
  servicesCAGR:  14,
  macCAGR:       6,
  ipadCAGR:      4,
  wearablesCAGR: 5,
  netMargin:     25,
  peMultiple:    30,
  sharesB:       13.5,
};

const TOOLTIPS = {
  iphoneCAGR:    'CAGR from the FY2024 base of $201.2B. AI-driven iPhone upgrade cycle and India market expansion are the key swing factors.',
  servicesCAGR:  'CAGR from the FY2024 base of $96.2B. Driven by App Store growth, Apple Intelligence monetization, iCloud+ expansion, and Apple TV+ subscriber growth.',
  macCAGR:       'CAGR from the FY2024 base of $30.0B. M-series chip advantage drives enterprise and creative-professional adoption.',
  ipadCAGR:      'CAGR from the FY2024 base of $26.7B. Mature category with modest growth from M-chip iPads and enterprise use cases.',
  wearablesCAGR: 'CAGR from the FY2024 base of $37.0B. Driven by Apple Watch health features, AirPods Pro refresh cycles, and spatial computing accessories.',
  netMargin:     "GAAP net margin. Apple's FY2024 GAAP net income was $93.7B on $391.0B revenue (~24.0%). Services mix improvement and operating leverage can push this higher.",
  peMultiple:    'P/E multiple applied to modeled FY2029 net income. Apple historically trades at 28–34x forward earnings.',
  sharesB:       'Diluted shares in billions. Apple had ~15.2B diluted shares in FY2024. With ~$90B/year in buybacks, shares decline materially. Default assumes ~1.35B repurchased annually on average.',
};

const sourceNotes = [
  'FY2022–FY2024 product and service revenue from Apple Annual Reports (Form 10-K). Fiscal year ends late September.',
  'FY2024 Services revenue of $96.2B grew 13% YoY, reflecting App Store, iCloud, and Apple TV+ growth.',
  'iPhone revenue is approximately flat FY2022–FY2024; next growth catalyst is Apple Intelligence on iPhone 16 and newer.',
  'Net margin default of 25% is slightly above FY2024 GAAP (~24%) and reflects Services mix improvement over the projection period.',
  'Share count reduction assumes ~$90B/year in buybacks at gradually rising share prices.',
];

const OPERATING_METRICS = {
  servicesYears: ['FY2019', 'FY2020', 'FY2021', 'FY2022', 'FY2023', 'FY2024'],
  servicesRevenueB: [46.29, 53.77, 68.43, 78.13, 85.20, 96.17],
  mixYears: ['FY2022', 'FY2023', 'FY2024'],
  iphoneSharePct: [52.1, 52.3, 51.4],
  servicesSharePct: [19.8, 22.2, 24.6],
  otherProductsPct: [28.1, 25.5, 24.0],
};

const fmt = (n, decimals = 0) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

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
    iphone:    projectCAGR(BASE[2024].iphone,    params.iphoneCAGR),
    services:  projectCAGR(BASE[2024].services,  params.servicesCAGR),
    mac:       projectCAGR(BASE[2024].mac,       params.macCAGR),
    ipad:      projectCAGR(BASE[2024].ipad,      params.ipadCAGR),
    wearables: projectCAGR(BASE[2024].wearables, params.wearablesCAGR),
  };

  const revenue = Object.fromEntries(hist.map(([seg, h]) => [seg, [...h, ...proj[seg]]]));

  const earnings = Object.fromEntries(
    Object.entries(revenue).map(([seg, arr]) => [
      seg, arr.map(v => Number((v * params.netMargin / 100).toFixed(2))),
    ])
  );

  const total2024    = sumAt(revenue, 2);
  const total2029    = sumAt(revenue, FINAL_INDEX);
  const earnings2029 = sumAt(earnings, FINAL_INDEX);
  const marketCap    = earnings2029 * params.peMultiple;
  const sharePrice   = params.sharesB > 0 ? marketCap / params.sharesB : 0;
  const eps2029      = params.sharesB > 0 ? earnings2029 / params.sharesB : 0;
  const cagr5y       = total2024 > 0 ? (Math.pow(total2029 / total2024, 1 / 5) - 1) * 100 : 0;
  const servicesShare2029 = total2029 > 0 ? revenue.services[FINAL_INDEX] / total2029 * 100 : 0;

  return { revenue, earnings, total2024, total2029, earnings2029, marketCap, sharePrice, eps2029, cagr5y, servicesShare2029 };
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
        labels: YEARS.map((y, i) => i >= HIST_COUNT ? `FY${y}*` : `FY${y}`),
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
                return i >= HIST_COUNT ? `FY${YEARS[i]} projected` : `FY${YEARS[i]} actual`;
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
        aria-label={`Stacked bar chart of Apple ${type} by segment FY2022 through FY2029`}>
        Apple {type} by segment, FY2022–FY2024 actual and FY2025–FY2029 projected.
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
      <SectionCard title="iPhone" accent={SEGMENT_COLORS.iphone}>
        <SliderField label="CAGR from FY2024" id="iphoneCAGR" value={params.iphoneCAGR}
          min={0} max={20} tooltip={TOOLTIPS.iphoneCAGR} onChange={set('iphoneCAGR')} />
      </SectionCard>
      <SectionCard title="Services" accent={SEGMENT_COLORS.services}>
        <SliderField label="CAGR from FY2024" id="servicesCAGR" value={params.servicesCAGR}
          min={5} max={30} tooltip={TOOLTIPS.servicesCAGR} accent={SEGMENT_COLORS.services} onChange={set('servicesCAGR')} />
      </SectionCard>
      <SectionCard title="Products" accent={SEGMENT_COLORS.mac}>
        <SliderField label="Mac CAGR from FY2024" id="macCAGR" value={params.macCAGR}
          min={0} max={20} tooltip={TOOLTIPS.macCAGR} accent={SEGMENT_COLORS.mac} onChange={set('macCAGR')} />
        <SliderField label="iPad CAGR from FY2024" id="ipadCAGR" value={params.ipadCAGR}
          min={-5} max={15} tooltip={TOOLTIPS.ipadCAGR} accent={SEGMENT_COLORS.ipad} onChange={set('ipadCAGR')} />
        <SliderField label="Wearables CAGR from FY2024" id="wearablesCAGR" value={params.wearablesCAGR}
          min={0} max={20} tooltip={TOOLTIPS.wearablesCAGR} accent={SEGMENT_COLORS.wearables} onChange={set('wearablesCAGR')} />
      </SectionCard>
      <SectionCard title="Margin &amp; Valuation" accent={ACCENT}>
        <SliderField label="GAAP net margin" id="netMargin" value={params.netMargin}
          min={18} max={35} tooltip={TOOLTIPS.netMargin} onChange={set('netMargin')} />
        <SliderField label="FY2029 P/E multiple" id="peMultiple" value={params.peMultiple}
          min={15} max={50} unit="x" tooltip={TOOLTIPS.peMultiple} onChange={set('peMultiple')} />
        <NumberField label="Diluted shares" value={params.sharesB} min={10} max={16} step={0.1}
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

export function AppleLogoMark({ width = 32, fill = '#0071e3' }) {
  const h = width * (1000 / 814);
  return (
    <svg viewBox="0 0 814 1000" width={width} height={h}
      aria-label="Apple logo" role="img" style={{ display: 'block' }}>
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"
        fill={fill} />
    </svg>
  );
}

export default function ApplePage() {
  const [params, setParams] = useState(DEFAULTS);
  const projections = useMemo(() => buildProjections(params), [params]);

  return (
    <>
      <PageMeta {...PAGE_META.apple} />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid var(--border)', padding: '0.65rem 2.5rem', background: 'var(--bg)' }}>
          <Link to="/"
            style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = ACCENT}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
            ← greaux
          </Link>
        </div>

        <header style={{ background: `linear-gradient(180deg, rgba(0,113,227,0.06) 0%, transparent 100%)`, borderBottom: '1px solid var(--border)', padding: '2rem 2.5rem 1.75rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 11, fontFamily: 'var(--mono)', color: ACCENT, border: `1px solid rgba(0,113,227,0.34)`, borderRadius: 100, padding: '5px 14px', marginBottom: 10, letterSpacing: '0.06em' }}>
                  <AppleLogoMark width={14} fill={ACCENT} />
                  AAPL · PRODUCT & SERVICES MODEL
                </div>
                <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.15, marginBottom: 8 }}>
                  Apple Revenue<br />
                  <span style={{ color: ACCENT }}>Growth Dashboard</span>
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--mono)', maxWidth: 720, lineHeight: 1.6 }}>
                  FY2022–FY2024 actuals · Projected FY2025–FY2029 · All figures in USD billions · Fiscal year ends late September
                </p>
              </div>
              <div style={{ maxWidth: 360, fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', lineHeight: 1.55, textAlign: 'right' }}>
                FY2022–FY2024 actuals from Apple 10-K filings. Fiscal year ends late September. Projections are scenario defaults.
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem 2.5rem', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
            <MetricCard label="FY2024 Revenue"   value={fmtUsdB(projections.total2024)}    sub="Actual · Form 10-K"              accent={ACCENT} />
            <MetricCard label="FY2029 Revenue"   value={fmtUsdB(projections.total2029)}    sub={`${fmt(projections.cagr5y, 1)}% CAGR`} accent="var(--accent)" />
            <MetricCard label="FY2029 Earnings"  value={fmtUsdB(projections.earnings2029)} sub={`${params.netMargin}% GAAP margin`} accent="var(--green)" />
            <MetricCard label="FY2029 Valuation" value={fmtUsdB(projections.marketCap)}    sub={`${params.peMultiple}x P/E`}     accent="var(--pink)" />
            <MetricCard label="Services Share FY2029" value={`${fmt(projections.servicesShare2029, 0)}%`} sub="of FY2029 revenue" accent={SEGMENT_COLORS.services} />
            <MetricCard label="FY2029 Share Price" value={fmtUsd(projections.sharePrice)}  sub={`EPS ${fmtUsd(projections.eps2029)}`} accent={ACCENT} />
          </div>

          <section style={{ background: `linear-gradient(135deg, var(--bg2) 0%, rgba(0,113,227,0.05) 100%)`, border: `1px solid rgba(0,113,227,0.28)`, borderRadius: 'var(--radius-lg)', padding: '1.6rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                FY2029 Projected Share Price
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
              <span style={{ color: `rgba(0,113,227,0.72)` }}>Adjust segment CAGRs, margin, and P/E below</span>
              <span>{fmt(projections.servicesShare2029, 0)}% of FY2029 revenue from Services</span>
              <span>{params.peMultiple}x P/E on modeled GAAP net income</span>
            </div>
          </section>

          <section style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Annual revenue by segment</h2>
                <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>FY2022–FY2024 actual; * denotes projected years</p>
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
            description="Segment CAGRs from the FY2024 base, GAAP net margin, P/E multiple, and diluted share count."
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
            <InsightCard title="Services revenue history" subtitle="Apple Services has grown from $46B in FY2019 to $96B in FY2024, expanding from 12% to 25% of total revenue.">
              <InsightBarChart
                labels={OPERATING_METRICS.servicesYears}
                unit="B" decimals={1}
                ariaLabel="Apple Services revenue FY2019 to FY2024"
                datasets={[{ label: 'Services', data: OPERATING_METRICS.servicesRevenueB, backgroundColor: SEGMENT_COLORS.services }]}
              />
            </InsightCard>

            <InsightCard title="Revenue mix shift" subtitle="Services share of total Apple revenue has grown while iPhone share has stayed relatively stable.">
              <InsightBarChart
                labels={OPERATING_METRICS.mixYears}
                unit="%" decimals={1}
                ariaLabel="Apple revenue mix by segment FY2022 to FY2024"
                datasets={[
                  { label: 'iPhone %',          data: OPERATING_METRICS.iphoneSharePct,   backgroundColor: SEGMENT_COLORS.iphone },
                  { label: 'Services %',         data: OPERATING_METRICS.servicesSharePct, backgroundColor: SEGMENT_COLORS.services },
                  { label: 'Other Products %',   data: OPERATING_METRICS.otherProductsPct, backgroundColor: SEGMENT_COLORS.mac },
                ]}
              />
            </InsightCard>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
            {sourceNotes.map(note => <SourcePill key={note}>{note}</SourcePill>)}
          </div>
        </main>

        <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 2.5rem', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'center' }}>
          Not financial advice · Historical data from Apple SEC filings and investor materials · Projections are illustrative
        </footer>
      </div>
    </>
  );
}
