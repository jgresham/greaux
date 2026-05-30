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

const ACCENT = '#0F238C';
const YEARS = [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029];
const HIST_COUNT = 3;
const FINAL_INDEX = YEARS.length - 1;

const SEGMENT_COLORS = {
  euv:      '#0F238C',
  duv:      '#1297E4',
  services: '#F0A800',
};

const SEGMENT_LABELS = {
  euv:      'EUV Systems',
  duv:      'DUV & Other Systems',
  services: 'Installed Base Mgmt.',
};

// ASML CY net sales (EUR billions). Source: ASML Q4 2022, 2023, 2024 earnings press releases.
// "duv" includes all non-EUV systems: DUV immersion/dry, metrology, and inspection.
// "services" = installed base management (field service + upgrade options).
// 2023 DUV surge driven by China pull-forward orders ahead of Dutch/US export restrictions.
const BASE = {
  2022: { euv: 7.00, duv: 8.50, services: 5.70 },
  2023: { euv: 9.10, duv: 12.90, services: 5.60 },
  2024: { euv: 8.30, duv: 13.50, services: 6.50 },
};

const DEFAULTS = {
  euvCAGR:      15,
  duvCAGR:       5,
  servicesCAGR: 10,
  netMargin:    27,
  peMultiple:   30,
  sharesB:      0.394,
};

const TOOLTIPS = {
  euvCAGR:      "CAGR from CY2024 base of €8.3B. Driven by High-NA EUV (EXE:5000) ramp at Intel, TSMC 2nm, and Samsung progression. Low-NA NXE:3800E capacity additions also ongoing.",
  duvCAGR:      "CAGR from CY2024 base of €13.5B. Includes DUV (immersion, dry), metrology, and inspection. China export restrictions limit upside; mature node demand provides a floor.",
  servicesCAGR: "CAGR from CY2024 base of €6.5B. Grows as global EUV+DUV installed base expands. Recurring and predictable — each EUV in the field generates substantial annual service revenue.",
  netMargin:    "GAAP net margin. ASML's CY2024 net margin was 26.8% (€7.57B / €28.3B). High R&D spend on High-NA EUV limits near-term margin expansion.",
  peMultiple:   "P/E applied to modeled 2029 GAAP net income (EUR). ASML typically trades 25–40x due to its global monopoly on EUV. Default of 30x is near the lower bound of recent range.",
  sharesB:      "Diluted shares (billions). ASML had ~393.6M diluted shares in CY2024. Systematic buyback programme reduces share count over time.",
};

const sourceNotes = [
  "CY2022–CY2024 revenue from ASML Q4 2022, 2023, and 2024 earnings press releases (ASML.com investor relations).",
  "2023 DUV revenue surge (+52% YoY): China customers pulled forward orders ahead of tightening Dutch/US export controls on advanced DUV.",
  "2024 EUV revenue: 44 systems revenue-recognized (vs. 53 in 2023). First High-NA EUV (EXE:5000) shipments began in 2024.",
  "Installed base management revenue (services + field options) grows with the expanding EUV and DUV installed base.",
  "ASML is the sole global supplier of EUV lithography systems. High-NA EUV is required for sub-2nm nodes.",
  "All revenue figures in EUR billions. ASML reports in EUR; primary exchange listing on Euronext Amsterdam and NASDAQ.",
];

const OPERATING_METRICS = {
  euvYears:    ['2020', '2021', '2022', '2023', '2024', '2025*', '2026*', '2027*'],
  euvActual:   [3.00,   5.40,   7.00,  9.10,   8.30,   null,    null,    null],
  euvProj:     [null,   null,   null,  null,   null,   9.55,    10.98,   12.63],
  svcYears:    ['2020', '2021', '2022', '2023', '2024', '2025*', '2026*', '2027*'],
  svcActual:   [3.80,   4.60,   5.70,  5.60,   6.50,   null,    null,    null],
  svcProj:     [null,   null,   null,  null,   null,   7.15,    7.87,    8.65],
};

const fmt    = (n, d = 0) => new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const fmtEurB = v => v >= 1000 ? `€${fmt(v / 1000, 2)}T` : `€${fmt(v, v < 10 ? 2 : 1)}B`;
const fmtEur  = v => `€${fmt(v, v < 100 ? 2 : 0)}`;

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
    euv:      projectCAGR(BASE[2024].euv,      params.euvCAGR),
    duv:      projectCAGR(BASE[2024].duv,      params.duvCAGR),
    services: projectCAGR(BASE[2024].services, params.servicesCAGR),
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
  const euvShare2029   = total2029 > 0 ? revenue.euv[FINAL_INDEX] / total2029 * 100 : 0;

  return { revenue, earnings, total2024, total2029, earnings2029, marketCap, sharePrice, eps2029, cagr5y, euvShare2029 };
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
                return `${ctx.dataset.tooltipLabel || ctx.dataset.label}: ${fmtEurB(ctx.raw)}`;
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
            ticks: { color: '#5a5a72', font: { family: "'DM Mono', monospace", size: 12 }, callback: v => `€${v}B` },
          },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [source]);

  return (
    <div style={{ position: 'relative', width: '100%', height: type === 'earnings' ? 310 : 360 }}>
      <canvas ref={canvasRef} role="img"
        aria-label={`Stacked bar chart of ASML ${type} by segment 2022 through 2029`}>
        ASML {type} by segment, 2022–2024 actual and 2025–2029 projected.
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
      <SectionCard title="EUV Systems" accent={SEGMENT_COLORS.euv}>
        <SliderField label="CAGR from 2024" id="euvCAGR" value={params.euvCAGR}
          min={0} max={40} tooltip={TOOLTIPS.euvCAGR} onChange={set('euvCAGR')} />
      </SectionCard>
      <SectionCard title="DUV &amp; Other Systems" accent={SEGMENT_COLORS.duv}>
        <SliderField label="CAGR from 2024" id="duvCAGR" value={params.duvCAGR}
          min={-10} max={20} tooltip={TOOLTIPS.duvCAGR} accent={SEGMENT_COLORS.duv} onChange={set('duvCAGR')} />
      </SectionCard>
      <SectionCard title="Installed Base Mgmt." accent={SEGMENT_COLORS.services}>
        <SliderField label="CAGR from 2024" id="servicesCAGR" value={params.servicesCAGR}
          min={0} max={20} tooltip={TOOLTIPS.servicesCAGR} accent={SEGMENT_COLORS.services} onChange={set('servicesCAGR')} />
      </SectionCard>
      <SectionCard title="Margin &amp; Valuation" accent={ACCENT}>
        <SliderField label="GAAP net margin" id="netMargin" value={params.netMargin}
          min={15} max={45} tooltip={TOOLTIPS.netMargin} onChange={set('netMargin')} />
        <SliderField label="2029 P/E multiple" id="peMultiple" value={params.peMultiple}
          min={15} max={60} unit="x" tooltip={TOOLTIPS.peMultiple} onChange={set('peMultiple')} />
        <NumberField label="Diluted shares" value={params.sharesB} min={0.35} max={0.42} step={0.001}
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

export function AsmlLogoMark({ width = 100, fill = '#0F238C' }) {
  return (
    <svg viewBox="0 0 184 56" width={width} aria-label="ASML logo" role="img" style={{ display: 'block' }}>
      <text y="50" fontFamily="Arial, Helvetica, sans-serif" fontSize="62" fontWeight="900" letterSpacing="4" fill={fill}>ASML</text>
    </svg>
  );
}

export default function AsmlPage() {
  const [params, setParams] = useState(DEFAULTS);
  const projections = useMemo(() => buildProjections(params), [params]);

  return (
    <>
      <PageMeta {...PAGE_META.asml} />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid var(--border)', padding: '0.65rem 2.5rem', background: 'var(--bg)' }}>
          <Link to="/"
            style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = ACCENT}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
            ← greaux
          </Link>
        </div>

        <header style={{ background: 'linear-gradient(180deg, rgba(15,35,140,0.08) 0%, transparent 100%)', borderBottom: '1px solid var(--border)', padding: '2rem 2.5rem 1.75rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 11, fontFamily: 'var(--mono)', color: ACCENT, border: '1px solid rgba(15,35,140,0.4)', borderRadius: 100, padding: '5px 14px', marginBottom: 10, letterSpacing: '0.06em' }}>
                  ASML · SEMICONDUCTOR EQUIPMENT MODEL
                </div>
                <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.15, marginBottom: 8 }}>
                  ASML Revenue<br />
                  <span style={{ color: ACCENT }}>Growth Dashboard</span>
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--mono)', maxWidth: 720, lineHeight: 1.6 }}>
                  2022–2024 actuals · Projected 2025–2029 · All figures in EUR billions · Calendar year
                </p>
              </div>
              <div style={{ maxWidth: 360, fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', lineHeight: 1.55, textAlign: 'right' }}>
                2022–2024 revenue from ASML earnings press releases. Projections are scenario defaults. Not financial advice.
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem 2.5rem', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
            <MetricCard label="2024 Revenue"    value={fmtEurB(projections.total2024)}      sub="Actual · CY2024"                      accent={ACCENT} />
            <MetricCard label="2029 Revenue"    value={fmtEurB(projections.total2029)}      sub={`${fmt(projections.cagr5y, 1)}% CAGR`} accent="var(--accent)" />
            <MetricCard label="2029 Earnings"   value={fmtEurB(projections.earnings2029)}   sub={`${params.netMargin}% GAAP margin`}   accent="var(--green)" />
            <MetricCard label="2029 Valuation"  value={fmtEurB(projections.marketCap)}      sub={`${params.peMultiple}x P/E`}          accent="var(--pink)" />
            <MetricCard label="EUV Share 2029"  value={`${fmt(projections.euvShare2029, 0)}%`} sub="of 2029 revenue"                   accent={SEGMENT_COLORS.euv} />
            <MetricCard label="2029 Share Price" value={fmtEur(projections.sharePrice)}     sub={`EPS ${fmtEur(projections.eps2029)} EUR`} accent={ACCENT} />
          </div>

          <section style={{ background: 'linear-gradient(135deg, var(--bg2) 0%, rgba(15,35,140,0.07) 100%)', border: '1px solid rgba(15,35,140,0.32)', borderRadius: 'var(--radius-lg)', padding: '1.6rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                2029 Projected Share Price (EUR)
              </div>
              <div style={{ fontSize: 'clamp(42px, 7vw, 66px)', fontWeight: 700, color: ACCENT, lineHeight: 1, marginBottom: 10 }}>
                {fmtEur(projections.sharePrice)}
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
                <span>{fmtEurB(projections.marketCap)} market cap</span>
                <span>{fmtEurB(projections.earnings2029)} GAAP net income</span>
                <span>{params.sharesB}B diluted shares</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'right' }}>
              <span style={{ color: 'rgba(15,35,140,0.8)' }}>Adjust segment CAGRs, margin, and P/E below</span>
              <span>{fmt(projections.euvShare2029, 0)}% of 2029 revenue from EUV systems</span>
              <span>{params.peMultiple}x P/E on modeled GAAP net income</span>
            </div>
          </section>

          <section style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Annual revenue by segment (EUR)</h2>
                <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>2022–2024 actual; * denotes projected years</p>
              </div>
              <SegmentLegend />
            </div>
            <StackedBarChart projections={projections} type="revenue" />
          </section>

          <section style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Annual earnings by segment (EUR)</h2>
                <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>GAAP earnings = revenue × net margin scenario</p>
              </div>
              <SegmentLegend />
            </div>
            <StackedBarChart projections={projections} type="earnings" />
          </section>

          <CollapsibleSection
            eyebrow="Scenario controls"
            title="Adjust projection assumptions"
            description="Segment CAGRs from the 2024 base (EUR), GAAP net margin, P/E multiple, and diluted shares outstanding."
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
            <InsightCard title="EUV system revenue history" subtitle="EUV revenue grew from ~€3B (2020) to €9.1B (2023) before dipping to €8.3B in 2024 as fewer units were revenue-recognized. High-NA EUV ramp begins 2025.">
              <InsightBarChart
                labels={OPERATING_METRICS.euvYears}
                unit="B" decimals={1}
                ariaLabel="ASML EUV system revenue 2020 to 2024 with projections through 2027"
                datasets={[
                  { label: 'EUV Systems',   data: OPERATING_METRICS.euvActual, backgroundColor: SEGMENT_COLORS.euv },
                  { label: 'projected', data: OPERATING_METRICS.euvProj,   backgroundColor: `${SEGMENT_COLORS.euv}55` },
                ]}
              />
            </InsightCard>

            <InsightCard title="Installed base management revenue" subtitle="Service and field option revenue compounds steadily as the global EUV and DUV installed base grows. Each EUV system generates substantial annual recurring revenue.">
              <InsightBarChart
                labels={OPERATING_METRICS.svcYears}
                unit="B" decimals={1}
                ariaLabel="ASML installed base management revenue 2020 to 2024 with projections through 2027"
                datasets={[
                  { label: 'Installed Base Mgmt.',   data: OPERATING_METRICS.svcActual, backgroundColor: SEGMENT_COLORS.services },
                  { label: 'projected', data: OPERATING_METRICS.svcProj,   backgroundColor: `${SEGMENT_COLORS.services}55` },
                ]}
              />
            </InsightCard>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
            {sourceNotes.map(note => <SourcePill key={note}>{note}</SourcePill>)}
          </div>
        </main>

        <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 2.5rem', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'center' }}>
          Not financial advice · Historical data from ASML earnings press releases · All figures in EUR · Projections are illustrative
        </footer>
      </div>
    </>
  );
}
