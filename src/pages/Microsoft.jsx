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

const ACCENT = '#00A4EF';
const YEARS = [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
const HIST_COUNT = 3;
const FINAL_INDEX = YEARS.length - 1;

const SEGMENT_COLORS = {
  cloud:        '#00A4EF',
  productivity: '#7FBA00',
  computing:    '#F25022',
};

const SEGMENT_LABELS = {
  cloud:        'Intelligent Cloud',
  productivity: 'Productivity & Business',
  computing:    'More Personal Computing',
};

const BASE = {
  2022: { cloud: 75.25, productivity: 63.36, computing: 59.65 },
  2023: { cloud: 87.91, productivity: 69.27, computing: 54.73 },
  2024: { cloud: 107.47, productivity: 77.70, computing: 59.93 },
};

const DEFAULTS = {
  cloudCAGR:        20,
  productivityCAGR: 12,
  computingCAGR:     5,
  netMargin:        36,
  peMultiple:       30,
  sharesB:          7.20,
};

const TOOLTIPS = {
  cloudCAGR:        'CAGR from the FY2024 base of $107.5B. Azure AI Services, OpenAI partnership (Copilot for Azure), and cloud migration drive continued growth.',
  productivityCAGR: 'CAGR from the FY2024 base of $77.7B. Microsoft 365 Copilot seat attach, Teams Premium, Dynamics 365, and LinkedIn revenue growth.',
  computingCAGR:    'CAGR from the FY2024 base of $59.9B. Windows Commercial licensing, Xbox Game Pass, Surface, and Bing/Copilot search monetization.',
  netMargin:        "GAAP net margin. Microsoft's FY2024 GAAP net income was $88.1B on $245.1B revenue (~35.9%). High-margin cloud and software mix supports 35–40% margins.",
  peMultiple:       'P/E multiple applied to modeled FY2030 net income.',
  sharesB:          'Diluted shares in billions. Microsoft had ~7.43B diluted shares in FY2024. ~$25B/year in buybacks at rising prices yields modest reduction.',
};

const sourceNotes = [
  'FY2022–FY2024 segment revenue from Microsoft Annual Reports (Form 10-K). Fiscal year ends June 30.',
  'FY2024 Intelligent Cloud grew 21% YoY to $107.5B, driven by Azure and AI services.',
  'Azure revenue is not separately disclosed; it is the primary driver within Intelligent Cloud alongside SQL Server, Windows Server, and GitHub.',
  'Net margin default of 36% matches FY2024 GAAP and assumes stable software/cloud mix through FY2030.',
  'FY2024 Productivity & Business Processes includes Office 365, LinkedIn (~$17B), and Dynamics 365.',
];

const OPERATING_METRICS = {
  cloudYears: ['FY2020', 'FY2021', 'FY2022', 'FY2023', 'FY2024'],
  cloudRevenueB: [48.37, 60.08, 75.25, 87.91, 107.47],
  icGrowthYears: ['FY2022', 'FY2023', 'FY2024'],
  icGrowthPct: [25.1, 16.8, 22.3],
  pbpGrowthPct: [13.9, 9.4, 12.1],
  mpcGrowthPct: [2.5, -8.2, 9.5],
};

const fmt = (n, decimals = 0) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

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
    cloud:        projectCAGR(BASE[2024].cloud,        params.cloudCAGR),
    productivity: projectCAGR(BASE[2024].productivity, params.productivityCAGR),
    computing:    projectCAGR(BASE[2024].computing,    params.computingCAGR),
  };

  const revenue = Object.fromEntries(hist.map(([seg, h]) => [seg, [...h, ...proj[seg]]]));

  const earnings = Object.fromEntries(
    Object.entries(revenue).map(([seg, arr]) => [
      seg, arr.map(v => Number((v * params.netMargin / 100).toFixed(2))),
    ])
  );

  const total2024    = sumAt(revenue, 2);
  const total2030    = sumAt(revenue, FINAL_INDEX);
  const earnings2030 = sumAt(earnings, FINAL_INDEX);
  const marketCap    = earnings2030 * params.peMultiple;
  const sharePrice   = params.sharesB > 0 ? marketCap / params.sharesB : 0;
  const eps2030      = params.sharesB > 0 ? earnings2030 / params.sharesB : 0;
  const cagr6y       = total2024 > 0 ? (Math.pow(total2030 / total2024, 1 / 6) - 1) * 100 : 0;
  const cloudShare2030 = total2030 > 0 ? revenue.cloud[FINAL_INDEX] / total2030 * 100 : 0;

  return { revenue, earnings, total2024, total2030, earnings2030, marketCap, sharePrice, eps2030, cagr6y, cloudShare2030 };
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
        aria-label={`Stacked bar chart of Microsoft ${type} by segment FY2022 through FY2030`}>
        Microsoft {type} by segment, FY2022–FY2024 actual and FY2025–FY2030 projected.
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
      <SectionCard title="Intelligent Cloud" accent={SEGMENT_COLORS.cloud}>
        <SliderField label="CAGR from FY2024" id="cloudCAGR" value={params.cloudCAGR}
          min={5} max={45} tooltip={TOOLTIPS.cloudCAGR} onChange={set('cloudCAGR')} />
      </SectionCard>
      <SectionCard title="Productivity &amp; Business" accent={SEGMENT_COLORS.productivity}>
        <SliderField label="CAGR from FY2024" id="productivityCAGR" value={params.productivityCAGR}
          min={5} max={25} tooltip={TOOLTIPS.productivityCAGR} accent={SEGMENT_COLORS.productivity} onChange={set('productivityCAGR')} />
      </SectionCard>
      <SectionCard title="Personal Computing" accent={SEGMENT_COLORS.computing}>
        <SliderField label="CAGR from FY2024" id="computingCAGR" value={params.computingCAGR}
          min={-5} max={20} tooltip={TOOLTIPS.computingCAGR} accent={SEGMENT_COLORS.computing} onChange={set('computingCAGR')} />
      </SectionCard>
      <SectionCard title="Margin &amp; Valuation" accent={ACCENT}>
        <SliderField label="GAAP net margin" id="netMargin" value={params.netMargin}
          min={25} max={50} tooltip={TOOLTIPS.netMargin} onChange={set('netMargin')} />
        <SliderField label="FY2030 P/E multiple" id="peMultiple" value={params.peMultiple}
          min={15} max={50} unit="x" tooltip={TOOLTIPS.peMultiple} onChange={set('peMultiple')} />
        <NumberField label="Diluted shares" value={params.sharesB} min={6.5} max={8.0} step={0.05}
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

export function MicrosoftLogoMark({ size = 32 }) {
  return (
    <svg viewBox="0 0 23 23" width={size} height={size}
      aria-label="Microsoft logo" role="img" style={{ display: 'block' }}>
      <path fill="#f35325" d="M1 1h10v10H1z" />
      <path fill="#81bc06" d="M12 1h10v10H12z" />
      <path fill="#05a6f0" d="M1 12h10v10H1z" />
      <path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
  );
}

export default function MicrosoftPage() {
  const [params, setParams] = useState(DEFAULTS);
  const projections = useMemo(() => buildProjections(params), [params]);

  return (
    <>
      <PageMeta {...PAGE_META.microsoft} />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid var(--border)', padding: '0.65rem 2.5rem', background: 'var(--bg)' }}>
          <Link to="/"
            style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = ACCENT}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
            ← greaux
          </Link>
        </div>

        <header style={{ background: `linear-gradient(180deg, rgba(0,164,239,0.06) 0%, transparent 100%)`, borderBottom: '1px solid var(--border)', padding: '2rem 2.5rem 1.75rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 11, fontFamily: 'var(--mono)', color: ACCENT, border: `1px solid rgba(0,164,239,0.34)`, borderRadius: 100, padding: '5px 14px', marginBottom: 10, letterSpacing: '0.06em' }}>
                  <MicrosoftLogoMark size={14} />
                  MSFT · CLOUD & AI MODEL
                </div>
                <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.15, marginBottom: 8 }}>
                  Microsoft Revenue<br />
                  <span style={{ color: ACCENT }}>Growth Dashboard</span>
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--mono)', maxWidth: 720, lineHeight: 1.6 }}>
                  FY2022–FY2024 actuals · Projected FY2025–FY2030 · All figures in USD billions · Fiscal year ends June 30
                </p>
              </div>
              <div style={{ maxWidth: 360, fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', lineHeight: 1.55, textAlign: 'right' }}>
                FY2022–FY2024 segment revenue from Microsoft 10-K filings. Fiscal year ends June 30. Projections are scenario defaults.
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem 2.5rem', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
            <MetricCard label="FY2024 Revenue"   value={fmtUsdB(projections.total2024)}    sub="Actual · Form 10-K"              accent={ACCENT} />
            <MetricCard label="FY2030 Revenue"   value={fmtUsdB(projections.total2030)}    sub={`${fmt(projections.cagr6y, 1)}% CAGR`} accent="var(--accent)" />
            <MetricCard label="FY2030 Earnings"  value={fmtUsdB(projections.earnings2030)} sub={`${params.netMargin}% GAAP margin`} accent="var(--green)" />
            <MetricCard label="FY2030 Valuation" value={fmtUsdB(projections.marketCap)}    sub={`${params.peMultiple}x P/E`}     accent="var(--pink)" />
            <MetricCard label="Cloud Share FY2030" value={`${fmt(projections.cloudShare2030, 0)}%`} sub="of FY2030 revenue"       accent={SEGMENT_COLORS.cloud} />
            <MetricCard label="FY2030 Share Price" value={fmtUsd(projections.sharePrice)}  sub={`EPS ${fmtUsd(projections.eps2030)}`} accent={ACCENT} />
          </div>

          <section style={{ background: `linear-gradient(135deg, var(--bg2) 0%, rgba(0,164,239,0.05) 100%)`, border: `1px solid rgba(0,164,239,0.28)`, borderRadius: 'var(--radius-lg)', padding: '1.6rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                FY2030 Projected Share Price
              </div>
              <div style={{ fontSize: 'clamp(42px, 7vw, 66px)', fontWeight: 700, color: ACCENT, lineHeight: 1, marginBottom: 10 }}>
                {fmtUsd(projections.sharePrice)}
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
                <span>{fmtUsdB(projections.marketCap)} market cap</span>
                <span>{fmtUsdB(projections.earnings2030)} GAAP net income</span>
                <span>{params.sharesB}B diluted shares</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'right' }}>
              <span style={{ color: `rgba(0,164,239,0.72)` }}>Adjust segment CAGRs, margin, and P/E below</span>
              <span>{fmt(projections.cloudShare2030, 0)}% of FY2030 revenue from Intelligent Cloud</span>
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
            <InsightCard title="Intelligent Cloud revenue" subtitle="Azure-driven cloud segment has grown from $48B in FY2020 to $107B in FY2024, compounding at ~22% annually.">
              <InsightBarChart
                labels={OPERATING_METRICS.cloudYears}
                unit="B" decimals={1}
                ariaLabel="Microsoft Intelligent Cloud revenue FY2020 to FY2024"
                datasets={[{ label: 'Intelligent Cloud', data: OPERATING_METRICS.cloudRevenueB, backgroundColor: SEGMENT_COLORS.cloud }]}
              />
            </InsightCard>

            <InsightCard title="Segment revenue growth rates" subtitle="Intelligent Cloud YoY growth outpaces the other two segments. Personal Computing dipped in FY2023 during the PC market downturn.">
              <InsightBarChart
                labels={OPERATING_METRICS.icGrowthYears}
                unit="%" decimals={1}
                ariaLabel="Microsoft segment YoY revenue growth rates FY2022 to FY2024"
                datasets={[
                  { label: 'Intelligent Cloud %',  data: OPERATING_METRICS.icGrowthPct,  backgroundColor: SEGMENT_COLORS.cloud },
                  { label: 'Productivity %',        data: OPERATING_METRICS.pbpGrowthPct, backgroundColor: SEGMENT_COLORS.productivity },
                  { label: 'Personal Computing %',  data: OPERATING_METRICS.mpcGrowthPct, backgroundColor: SEGMENT_COLORS.computing },
                ]}
              />
            </InsightCard>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
            {sourceNotes.map(note => <SourcePill key={note}>{note}</SourcePill>)}
          </div>
        </main>

        <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 2.5rem', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'center' }}>
          Not financial advice · Historical data from Microsoft SEC filings and investor materials · Projections are illustrative
        </footer>
      </div>
    </>
  );
}
