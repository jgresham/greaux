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

const ACCENT = '#ED1C24';
const YEARS = [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029];
const HIST_COUNT = 3;
const FINAL_INDEX = YEARS.length - 1;

const SEGMENT_COLORS = {
  dataCenter: '#ED1C24',
  client:     '#4da3ff',
  gaming:     '#ffb347',
  embedded:   '#a78bfa',
};

const SEGMENT_LABELS = {
  dataCenter: 'Data Center',
  client:     'Client',
  gaming:     'Gaming',
  embedded:   'Embedded',
};

// AMD calendar-year segment revenue (USD billions). FY2022 includes ~10.5 months of Xilinx.
const BASE = {
  2022: { dataCenter: 6.04, client: 6.20, gaming: 6.81, embedded: 4.56 },
  2023: { dataCenter: 6.50, client: 4.64, gaming: 5.84, embedded: 5.70 },
  2024: { dataCenter: 12.66, client: 7.07, gaming: 2.80, embedded: 3.24 },
};

const DEFAULTS = {
  dataCenterCAGR: 30,
  clientCAGR:     12,
  gamingCAGR:      5,
  embeddedCAGR:   18,
  netMargin:      24,
  peMultiple:     35,
  sharesB:        1.60,
};

const TOOLTIPS = {
  dataCenterCAGR: 'CAGR from the 2024 base of $12.7B. Driven by Instinct MI300X/MI350 GPU ramp for AI inference, EPYC Turin server CPU adoption, and ROCm software ecosystem growth.',
  clientCAGR: 'CAGR from the 2024 base of $7.1B. Driven by Ryzen AI PC refresh cycle and continued laptop CPU share gains.',
  gamingCAGR: 'CAGR from the 2024 base of $2.8B. Default assumes a modest recovery as next-gen console semi-custom contracts ramp from 2026 onward.',
  embeddedCAGR: 'CAGR from the 2024 base of $3.2B. Driven by inventory digestion recovery in industrial/auto/comms and Versal AI Edge design wins.',
  netMargin: 'Non-GAAP net margin. AMD\'s GAAP margin is depressed by Xilinx acquisition intangible amortization (~$3B/year through ~2026). Non-GAAP forward margin is a better proxy for earnings power.',
  peMultiple: 'P/E multiple applied to modeled 2029 non-GAAP net income.',
  sharesB: 'Diluted shares in billions. AMD had ~1.62B diluted shares in FY2024. Default assumes modest buyback reduction.',
};

const sourceNotes = [
  '2022–2024 segment revenue from AMD Annual Reports (10-K). FY2022 includes ~10.5 months of Xilinx post-acquisition.',
  'FY2024 Data Center revenue of $12.7B reflects MI300X ramp; AMD guided strong continued growth in 2025.',
  'Gaming decline from $6.8B (2022) to $2.8B (2024) reflects end of current PlayStation 5 / Xbox Series semi-custom cycle.',
  'Embedded decline from peak reflects channel inventory digestion; AMD guided recovery to begin in 2025.',
  'Net margin default uses non-GAAP basis. GAAP is materially lower due to Xilinx intangible amortization.',
];

const OPERATING_METRICS = {
  dcYears: ['2019', '2020', '2021', '2022', '2023', '2024'],
  dcRevenueB: [1.27, 1.68, 3.68, 6.04, 6.50, 12.66],
  gamingYears: ['2022', '2023', '2024'],
  gamingRevenueB: [6.81, 5.84, 2.80],
  embeddedYears: ['2022', '2023', '2024'],
  embeddedRevenueB: [4.56, 5.70, 3.24],
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
    dataCenter: projectCAGR(BASE[2024].dataCenter, params.dataCenterCAGR),
    client:     projectCAGR(BASE[2024].client,     params.clientCAGR),
    gaming:     projectCAGR(BASE[2024].gaming,     params.gamingCAGR),
    embedded:   projectCAGR(BASE[2024].embedded,   params.embeddedCAGR),
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
  const dcShare2029  = total2029 > 0 ? revenue.dataCenter[FINAL_INDEX] / total2029 * 100 : 0;

  return { revenue, earnings, total2024, total2029, earnings2029, marketCap, sharePrice, eps2029, cagr5y, dcShare2029 };
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
        aria-label={`Stacked bar chart of AMD ${type} by segment 2022 through 2029`}>
        AMD {type} by segment, 2022–2024 actual and 2025–2029 projected.
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
      <SectionCard title="Data Center" accent={SEGMENT_COLORS.dataCenter}>
        <SliderField label="CAGR from 2024" id="dcCAGR" value={params.dataCenterCAGR}
          min={0} max={70} tooltip={TOOLTIPS.dataCenterCAGR} onChange={set('dataCenterCAGR')} />
      </SectionCard>
      <SectionCard title="Client" accent={SEGMENT_COLORS.client}>
        <SliderField label="CAGR from 2024" id="clientCAGR" value={params.clientCAGR}
          min={-10} max={30} tooltip={TOOLTIPS.clientCAGR} accent={SEGMENT_COLORS.client} onChange={set('clientCAGR')} />
      </SectionCard>
      <SectionCard title="Gaming" accent={SEGMENT_COLORS.gaming}>
        <SliderField label="CAGR from 2024" id="gamingCAGR" value={params.gamingCAGR}
          min={-20} max={30} tooltip={TOOLTIPS.gamingCAGR} accent={SEGMENT_COLORS.gaming} onChange={set('gamingCAGR')} />
      </SectionCard>
      <SectionCard title="Embedded" accent={SEGMENT_COLORS.embedded}>
        <SliderField label="CAGR from 2024" id="embeddedCAGR" value={params.embeddedCAGR}
          min={-10} max={50} tooltip={TOOLTIPS.embeddedCAGR} accent={SEGMENT_COLORS.embedded} onChange={set('embeddedCAGR')} />
      </SectionCard>
      <SectionCard title="Margin &amp; Valuation" accent={ACCENT}>
        <SliderField label="Non-GAAP net margin" id="netMargin" value={params.netMargin}
          min={10} max={45} tooltip={TOOLTIPS.netMargin} onChange={set('netMargin')} />
        <SliderField label="2029 P/E multiple" id="peMultiple" value={params.peMultiple}
          min={10} max={80} unit="x" tooltip={TOOLTIPS.peMultiple} onChange={set('peMultiple')} />
        <NumberField label="Diluted shares" value={params.sharesB} min={1.2} max={1.8} step={0.01}
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

export function AmdLogoMark({ width = 100, fill = '#ED1C24' }) {
  const h = width * (190.803 / 800);
  return (
    <svg viewBox="0 0 800 190.803" width={width} height={h}
      aria-label="AMD logo" role="img" style={{ display: 'block' }}>
      <path d="M187.888 178.122H143.52l-13.573-32.738H56.003l-12.366 32.738H0L66.667 12.776h47.761zM91.155 52.286L66.912 116.53h50.913zm257.901-39.51h35.88v165.346h-41.219V74.842l-44.608 51.877h-6.301l-44.605-51.877V178.12h-41.219V12.776h35.88l53.092 61.336zm140.319 0c60.364 0 91.391 37.573 91.391 82.909 0 47.517-30.058 82.437-96 82.437h-68.369V12.776zm-31.762 135.041h26.906c41.457 0 53.823-28.129 53.823-52.377 0-28.368-15.276-52.363-54.308-52.363h-26.422v104.74zm205.156-95.836L610.797 0H800v189.21l-51.972-51.975V51.981zm-.061 10.416L609.2 115.903v74.899h74.889l53.505-53.506h-74.886z"
        fill={fill} />
    </svg>
  );
}

export default function AmdPage() {
  const [params, setParams] = useState(DEFAULTS);
  const projections = useMemo(() => buildProjections(params), [params]);

  return (
    <>
      <PageMeta {...PAGE_META.amd} />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid var(--border)', padding: '0.65rem 2.5rem', background: 'var(--bg)' }}>
          <Link to="/"
            style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = ACCENT}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
            ← greaux
          </Link>
        </div>

        <header style={{ background: 'linear-gradient(180deg, rgba(237,28,36,0.06) 0%, transparent 100%)', borderBottom: '1px solid var(--border)', padding: '2rem 2.5rem 1.75rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 11, fontFamily: 'var(--mono)', color: ACCENT, border: '1px solid rgba(237,28,36,0.34)', borderRadius: 100, padding: '5px 14px', marginBottom: 10, letterSpacing: '0.06em' }}>
                  <AmdLogoMark width={52} fill={ACCENT} />
                  AMD · DATA CENTER & AI MODEL
                </div>
                <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.15, marginBottom: 8 }}>
                  AMD Revenue<br />
                  <span style={{ color: ACCENT }}>Growth Dashboard</span>
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--mono)', maxWidth: 720, lineHeight: 1.6 }}>
                  2022–2024 actuals · Projected 2025–2029 · All figures in USD billions · Calendar year
                </p>
              </div>
              <div style={{ maxWidth: 360, fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', lineHeight: 1.55, textAlign: 'right' }}>
                2022–2024 segment revenue from AMD 10-K filings. Projections are scenario defaults. Not financial advice.
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem 2.5rem', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
            <MetricCard label="2024 Revenue"   value={fmtUsdB(projections.total2024)}    sub="Actual · Form 10-K"              accent={ACCENT} />
            <MetricCard label="2029 Revenue"   value={fmtUsdB(projections.total2029)}    sub={`${fmt(projections.cagr5y, 1)}% CAGR`} accent="var(--accent)" />
            <MetricCard label="2029 Earnings"  value={fmtUsdB(projections.earnings2029)} sub={`${params.netMargin}% non-GAAP margin`} accent="var(--green)" />
            <MetricCard label="2029 Valuation" value={fmtUsdB(projections.marketCap)}    sub={`${params.peMultiple}x P/E`}     accent="var(--pink)" />
            <MetricCard label="DC Share 2029"  value={`${fmt(projections.dcShare2029, 0)}%`} sub="of 2029 revenue"             accent={SEGMENT_COLORS.dataCenter} />
            <MetricCard label="2029 Share Price" value={fmtUsd(projections.sharePrice)}  sub={`EPS ${fmtUsd(projections.eps2029)}`} accent={ACCENT} />
          </div>

          {/* Share price hero */}
          <section style={{ background: 'linear-gradient(135deg, var(--bg2) 0%, rgba(237,28,36,0.05) 100%)', border: '1px solid rgba(237,28,36,0.28)', borderRadius: 'var(--radius-lg)', padding: '1.6rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                2029 Projected Share Price
              </div>
              <div style={{ fontSize: 'clamp(42px, 7vw, 66px)', fontWeight: 700, color: ACCENT, lineHeight: 1, marginBottom: 10 }}>
                {fmtUsd(projections.sharePrice)}
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
                <span>{fmtUsdB(projections.marketCap)} market cap</span>
                <span>{fmtUsdB(projections.earnings2029)} non-GAAP net income</span>
                <span>{params.sharesB}B diluted shares</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'right' }}>
              <span style={{ color: 'rgba(237,28,36,0.72)' }}>Adjust segment CAGRs, margin, and P/E below</span>
              <span>{fmt(projections.dcShare2029, 0)}% of 2029 revenue from Data Center</span>
              <span>{params.peMultiple}x P/E on modeled non-GAAP net income</span>
            </div>
          </section>

          {/* Revenue chart */}
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

          {/* Earnings chart */}
          <section style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Annual earnings by segment</h2>
                <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>Non-GAAP earnings = revenue × net margin scenario</p>
              </div>
              <SegmentLegend />
            </div>
            <StackedBarChart projections={projections} type="earnings" />
          </section>

          <CollapsibleSection
            eyebrow="Scenario controls"
            title="Adjust projection assumptions"
            description="Segment CAGRs from the 2024 base, non-GAAP net margin, P/E multiple, and shares outstanding."
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
            <InsightCard title="Data Center revenue history" subtitle="EPYC server CPU and Instinct GPU revenue from 2019 through 2024. MI300X ramp drove the step-change in 2024.">
              <InsightBarChart
                labels={OPERATING_METRICS.dcYears}
                unit="B" decimals={1}
                ariaLabel="AMD Data Center revenue 2019 to 2024"
                datasets={[{ label: 'Data Center', data: OPERATING_METRICS.dcRevenueB, backgroundColor: SEGMENT_COLORS.dataCenter }]}
              />
            </InsightCard>

            <InsightCard title="Gaming & Embedded cycle" subtitle="Gaming semi-custom peaked with current PlayStation 5 / Xbox Series cycle. Embedded is recovering from post-peak inventory digestion.">
              <InsightBarChart
                labels={OPERATING_METRICS.gamingYears}
                unit="B" decimals={1}
                ariaLabel="AMD Gaming and Embedded revenue 2022 to 2024"
                datasets={[
                  { label: 'Gaming',   data: OPERATING_METRICS.gamingRevenueB,   backgroundColor: SEGMENT_COLORS.gaming },
                  { label: 'Embedded', data: OPERATING_METRICS.embeddedRevenueB, backgroundColor: SEGMENT_COLORS.embedded },
                ]}
              />
            </InsightCard>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
            {sourceNotes.map(note => <SourcePill key={note}>{note}</SourcePill>)}
          </div>
        </main>

        <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 2.5rem', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'center' }}>
          Not financial advice · Historical data from AMD SEC filings and investor materials · Projections are illustrative
        </footer>
      </div>
    </>
  );
}
