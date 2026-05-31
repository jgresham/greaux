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

const ACCENT = '#E60012';
const YEARS = [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
const HIST_COUNT = 3;
const FINAL_INDEX = YEARS.length - 1;

const SEGMENT_COLORS = {
  hpc:        '#E60012',
  smartphone: '#4da3ff',
  iot:        '#34A853',
  automotive: '#FBBC05',
  other:      '#a78bfa',
};

const SEGMENT_LABELS = {
  hpc:        'HPC',
  smartphone: 'Smartphone',
  iot:        'IoT',
  automotive: 'Automotive',
  other:      'DCE & Other',
};

// TSMC CY platform revenue (USD billions). Source: TSMC Q4 2024 Management Report, SEC Form 6-K.
// Totals converted from TWD at approximate annual average rates (CY2022: 30.5, CY2023: 31.0, CY2024: 32.2).
// "other" combines Digital Consumer Electronics (DCE) and "Others" platform categories.
// CY2023 HPC was impacted by post-COVID inventory correction; re-accelerated sharply in CY2024 via AI.
const BASE = {
  2022: { hpc: 31.14, smartphone: 29.59, iot: 6.83, automotive: 3.79, other: 4.55 },
  2023: { hpc: 29.80, smartphone: 26.33, iot: 4.85, automotive: 4.16, other: 4.17 },
  2024: { hpc: 45.94, smartphone: 31.53, iot: 5.41, automotive: 4.50, other: 2.70 },
};

const DEFAULTS = {
  hpcCAGR:        22,
  smartphoneCAGR:  8,
  iotCAGR:        10,
  automotiveCAGR: 15,
  otherCAGR:       5,
  netMargin:      40,
  peMultiple:     20,
  sharesB:         5.19,
};

const TOOLTIPS = {
  hpcCAGR:        "CAGR from CY2024 base of $45.9B. AI accelerator demand — Nvidia Blackwell/Rubin, AMD MI300 series, Apple M-series, Amazon Trainium, Google TPU — are the primary drivers. TSMC is the sole manufacturer of the world's most advanced AI chips.",
  smartphoneCAGR: "CAGR from CY2024 base of $31.5B. Apple A-series, Qualcomm Snapdragon, and MediaTek on 3nm/5nm nodes. Steady volume with ASP uplift from on-device AI features driving node upgrades.",
  iotCAGR:        "CAGR from CY2024 base of $5.4B. Edge AI inference, wearables, and industrial automation migrating to advanced nodes for power efficiency.",
  automotiveCAGR: "CAGR from CY2024 base of $4.5B. ADAS processors, EV power management, and in-vehicle compute. Growth is real but slower than HPC due to long automotive qualification cycles.",
  otherCAGR:      "CAGR from CY2024 base of $2.7B. Combines DCE (TV, gaming consoles) and 'Others' platform. DCE is in secular decline; modest combined growth assumes stable industrial demand.",
  netMargin:      "GAAP net margin. TSMC's CY2024 net margin was ~40.5% ($36.5B / $90.1B). Near-monopoly on leading-edge foundry services sustains premium pricing power.",
  peMultiple:     "P/E applied to modeled 2030 GAAP net income. TSMC trades at lower multiples than US tech peers due to geopolitical risk premium (Taiwan Strait). USD ADS share price.",
  sharesB:        "ADS equivalents (billions). Each TSMC ADS = 5 ordinary shares. ~25,929M ordinary shares / 5 = ~5,186M ADS in CY2024. Share price output is USD per ADS.",
};

const sourceNotes = [
  "CY2022–CY2024 platform revenue from TSMC Q4 2024 Management Report and SEC Form 6-K filings.",
  "Total CY2024 net revenue: NT$2,894.3B (~$90.1B USD at ~32.2 TWD/USD average). Record annual revenue.",
  "HPC platform grew +58% YoY in CY2024 driven by Nvidia, AMD, Apple, Amazon, and Google AI chip demand.",
  "Advanced nodes (7nm and below): 53% of CY2022 revenue → 58% in CY2023 → 69% in CY2024.",
  "TSMC CY2024 Q4 alone was NT$868.5B (~$26.9B USD) — record single quarter.",
  "ADS share price is in USD (1 ADS = 5 TSMC ordinary shares on NYSE).",
];

const OPERATING_METRICS = {
  hpcYears:      ['2022', '2023', '2024', '2025*', '2026*', '2027*'],
  hpcActual:     [31.14, 29.80, 45.94, null, null, null],
  hpcProj:       [null, null, null, 56.0, 68.3, 83.4],
  nodeYears:     ['2022', '2023', '2024', '2025*', '2026*', '2027*'],
  advancedActual:[40.2, 40.2, 62.2, null, null, null],
  matureActual:  [35.7, 29.1, 27.9, null, null, null],
  advancedProj:  [null, null, null, 82.5, 104.0, 130.0],
  matureProj:    [null, null, null, 27.5, 26.5, 25.0],
};

const fmt    = (n, d = 0) => new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const fmtUsdB = v => v >= 1000 ? `$${fmt(v / 1000, 2)}T` : `$${fmt(v, v < 10 ? 2 : 1)}B`;
const fmtUsd  = v => `$${fmt(v, v < 100 ? 2 : 0)}`;

function projectCAGR(base, cagr, count = 6) {
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
    hpc:        projectCAGR(BASE[2024].hpc,        params.hpcCAGR),
    smartphone: projectCAGR(BASE[2024].smartphone, params.smartphoneCAGR),
    iot:        projectCAGR(BASE[2024].iot,        params.iotCAGR),
    automotive: projectCAGR(BASE[2024].automotive, params.automotiveCAGR),
    other:      projectCAGR(BASE[2024].other,      params.otherCAGR),
  };

  const revenue = Object.fromEntries(hist.map(([seg, h]) => [seg, [...h, ...proj[seg]]]));
  const earnings = Object.fromEntries(
    Object.entries(revenue).map(([seg, arr]) => [
      seg, arr.map(v => Number((v * params.netMargin / 100).toFixed(2))),
    ])
  );

  const total2024      = sumAt(revenue, 2);
  const total2030      = sumAt(revenue, FINAL_INDEX);
  const earnings2030   = sumAt(earnings, FINAL_INDEX);
  const marketCap      = earnings2030 * params.peMultiple;
  const sharePrice     = params.sharesB > 0 ? marketCap / params.sharesB : 0;
  const eps2030        = params.sharesB > 0 ? earnings2030 / params.sharesB : 0;
  const cagr6y         = total2024 > 0 ? (Math.pow(total2030 / total2024, 1 / 6) - 1) * 100 : 0;
  const hpcShare2030   = total2030 > 0 ? revenue.hpc[FINAL_INDEX] / total2030 * 100 : 0;

  return { revenue, earnings, total2024, total2030, earnings2030, marketCap, sharePrice, eps2030, cagr6y, hpcShare2030 };
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
        aria-label={`Stacked bar chart of TSMC ${type} by platform 2022 through 2030`}>
        TSMC {type} by platform, 2022–2024 actual and 2025–2030 projected.
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
      <SectionCard title="HPC" accent={SEGMENT_COLORS.hpc}>
        <SliderField label="CAGR from 2024" id="hpcCAGR" value={params.hpcCAGR}
          min={5} max={50} tooltip={TOOLTIPS.hpcCAGR} onChange={set('hpcCAGR')} />
      </SectionCard>
      <SectionCard title="Smartphone" accent={SEGMENT_COLORS.smartphone}>
        <SliderField label="CAGR from 2024" id="smartphoneCAGR" value={params.smartphoneCAGR}
          min={0} max={20} tooltip={TOOLTIPS.smartphoneCAGR} accent={SEGMENT_COLORS.smartphone} onChange={set('smartphoneCAGR')} />
      </SectionCard>
      <SectionCard title="IoT" accent={SEGMENT_COLORS.iot}>
        <SliderField label="CAGR from 2024" id="iotCAGR" value={params.iotCAGR}
          min={0} max={30} tooltip={TOOLTIPS.iotCAGR} accent={SEGMENT_COLORS.iot} onChange={set('iotCAGR')} />
      </SectionCard>
      <SectionCard title="Automotive" accent={SEGMENT_COLORS.automotive}>
        <SliderField label="CAGR from 2024" id="automotiveCAGR" value={params.automotiveCAGR}
          min={0} max={35} tooltip={TOOLTIPS.automotiveCAGR} accent={SEGMENT_COLORS.automotive} onChange={set('automotiveCAGR')} />
      </SectionCard>
      <SectionCard title="DCE &amp; Other" accent={SEGMENT_COLORS.other}>
        <SliderField label="CAGR from 2024" id="otherCAGR" value={params.otherCAGR}
          min={-10} max={15} tooltip={TOOLTIPS.otherCAGR} accent={SEGMENT_COLORS.other} onChange={set('otherCAGR')} />
      </SectionCard>
      <SectionCard title="Margin &amp; Valuation" accent={ACCENT}>
        <SliderField label="GAAP net margin" id="netMargin" value={params.netMargin}
          min={25} max={55} tooltip={TOOLTIPS.netMargin} onChange={set('netMargin')} />
        <SliderField label="2030 P/E multiple" id="peMultiple" value={params.peMultiple}
          min={10} max={40} unit="x" tooltip={TOOLTIPS.peMultiple} onChange={set('peMultiple')} />
        <NumberField label="ADS count" value={params.sharesB} min={4.5} max={6.0} step={0.01}
          suffix="B ADS (1 ADS = 5 ordinary shares)" tooltip={TOOLTIPS.sharesB} onChange={set('sharesB')} />
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

export function TsmcLogoMark({ width = 100, fill = '#E60012' }) {
  return (
    <svg viewBox="0 0 210 56" width={width} aria-label="TSMC logo" role="img" style={{ display: 'block' }}>
      <text y="50" fontFamily="Arial, Helvetica, sans-serif" fontSize="62" fontWeight="900" letterSpacing="4" fill={fill}>TSMC</text>
    </svg>
  );
}

export default function TsmcPage() {
  const [params, setParams] = useState(DEFAULTS);
  const projections = useMemo(() => buildProjections(params), [params]);

  return (
    <>
      <PageMeta {...PAGE_META.tsmc} />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid var(--border)', padding: '0.65rem 2.5rem', background: 'var(--bg)' }}>
          <Link to="/"
            style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = ACCENT}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
            ← greaux
          </Link>
        </div>

        <header style={{ background: 'linear-gradient(180deg, rgba(230,0,18,0.06) 0%, transparent 100%)', borderBottom: '1px solid var(--border)', padding: '2rem 2.5rem 1.75rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 11, fontFamily: 'var(--mono)', color: ACCENT, border: '1px solid rgba(230,0,18,0.34)', borderRadius: 100, padding: '5px 14px', marginBottom: 10, letterSpacing: '0.06em' }}>
                  TSM · TSMC FOUNDRY MODEL
                </div>
                <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.15, marginBottom: 8 }}>
                  TSMC Revenue<br />
                  <span style={{ color: ACCENT }}>Growth Dashboard</span>
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--mono)', maxWidth: 720, lineHeight: 1.6 }}>
                  2022–2024 actuals · Projected 2025–2030 · USD billions · Calendar year · ADS share price
                </p>
              </div>
              <div style={{ maxWidth: 360, fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', lineHeight: 1.55, textAlign: 'right' }}>
                2022–2024 platform revenue from TSMC Form 6-K filings. Projections are scenario defaults. Not financial advice.
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem 2.5rem', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
            <MetricCard label="2024 Revenue"    value={fmtUsdB(projections.total2024)}      sub="Actual · TSMC 6-K"                    accent={ACCENT} />
            <MetricCard label="2030 Revenue"    value={fmtUsdB(projections.total2030)}      sub={`${fmt(projections.cagr6y, 1)}% CAGR`} accent="var(--accent)" />
            <MetricCard label="2030 Earnings"   value={fmtUsdB(projections.earnings2030)}   sub={`${params.netMargin}% GAAP margin`}   accent="var(--green)" />
            <MetricCard label="2030 Valuation"  value={fmtUsdB(projections.marketCap)}      sub={`${params.peMultiple}x P/E`}          accent="var(--pink)" />
            <MetricCard label="HPC Share 2030"  value={`${fmt(projections.hpcShare2030, 0)}%`} sub="of 2030 revenue"                   accent={SEGMENT_COLORS.hpc} />
            <MetricCard label="2030 ADS Price"  value={fmtUsd(projections.sharePrice)}      sub={`EPS ${fmtUsd(projections.eps2030)}`} accent={ACCENT} />
          </div>

          <section style={{ background: 'linear-gradient(135deg, var(--bg2) 0%, rgba(230,0,18,0.05) 100%)', border: '1px solid rgba(230,0,18,0.28)', borderRadius: 'var(--radius-lg)', padding: '1.6rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                2030 Projected ADS Price (USD)
              </div>
              <div style={{ fontSize: 'clamp(42px, 7vw, 66px)', fontWeight: 700, color: ACCENT, lineHeight: 1, marginBottom: 10 }}>
                {fmtUsd(projections.sharePrice)}
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
                <span>{fmtUsdB(projections.marketCap)} market cap</span>
                <span>{fmtUsdB(projections.earnings2030)} GAAP net income</span>
                <span>{params.sharesB}B ADS</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'right' }}>
              <span style={{ color: 'rgba(230,0,18,0.72)' }}>Adjust platform CAGRs, margin, and P/E below</span>
              <span>{fmt(projections.hpcShare2030, 0)}% of 2030 revenue from HPC</span>
              <span>{params.peMultiple}x P/E on modeled GAAP net income</span>
            </div>
          </section>

          <section style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Annual revenue by platform (USD)</h2>
                <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>2022–2024 actual; * denotes projected years</p>
              </div>
              <SegmentLegend />
            </div>
            <StackedBarChart projections={projections} type="revenue" />
          </section>

          <section style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Annual earnings by platform (USD)</h2>
                <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>GAAP earnings = revenue × net margin scenario</p>
              </div>
              <SegmentLegend />
            </div>
            <StackedBarChart projections={projections} type="earnings" />
          </section>

          <CollapsibleSection
            eyebrow="Scenario controls"
            title="Adjust projection assumptions"
            description="Platform CAGRs from the 2024 base, GAAP net margin, P/E multiple, and ADS count."
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
            <InsightCard title="HPC platform revenue" subtitle="HPC surpassed Smartphone as TSMC's largest revenue platform in 2023 and grew 58% YoY in 2024. AI chip demand from Nvidia, AMD, Apple, and hyperscalers is the primary driver.">
              <InsightBarChart
                labels={OPERATING_METRICS.hpcYears}
                unit="B" decimals={1}
                ariaLabel="TSMC HPC revenue 2022 to 2024 with projections through 2027"
                datasets={[
                  { label: 'HPC',       data: OPERATING_METRICS.hpcActual, backgroundColor: SEGMENT_COLORS.hpc },
                  { label: 'projected', data: OPERATING_METRICS.hpcProj,   backgroundColor: `${SEGMENT_COLORS.hpc}55` },
                ]}
              />
            </InsightCard>

            <InsightCard title="Advanced vs. mature node revenue" subtitle="Advanced nodes (7nm and below) grew from 53% of revenue (2022) to 69% (2024), driven by AI chip demand on 5nm and 3nm. 2nm ramp begins in 2025.">
              <InsightBarChart
                labels={OPERATING_METRICS.nodeYears}
                unit="B" decimals={1}
                ariaLabel="TSMC advanced vs mature node revenue 2022 to 2024 with projections through 2027"
                datasets={[
                  { label: 'Advanced (≤7nm)',    data: OPERATING_METRICS.advancedActual, backgroundColor: SEGMENT_COLORS.hpc },
                  { label: 'Mature (≥8nm)',      data: OPERATING_METRICS.matureActual,   backgroundColor: SEGMENT_COLORS.smartphone },
                  { label: 'projected',          data: OPERATING_METRICS.advancedProj,   backgroundColor: `${SEGMENT_COLORS.hpc}55` },
                  { label: 'projected',          data: OPERATING_METRICS.matureProj,     backgroundColor: `${SEGMENT_COLORS.smartphone}55` },
                ]}
              />
            </InsightCard>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
            {sourceNotes.map(note => <SourcePill key={note}>{note}</SourcePill>)}
          </div>
        </main>

        <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 2.5rem', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'center' }}>
          Not financial advice · Historical data from TSMC SEC filings · USD revenue converted from TWD · Projections are illustrative
        </footer>
      </div>
    </>
  );
}
