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

const ACCENT = '#FF9900';
const YEARS = [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
const HIST_COUNT = 3;
const FINAL_INDEX = YEARS.length - 1;

const SEGMENT_COLORS = {
  aws:        '#FF9900',
  ads:        '#4da3ff',
  thirdParty: '#34A853',
  subs:       '#a78bfa',
  stores:     '#f87171',
};

const SEGMENT_LABELS = {
  aws:        'AWS',
  ads:        'Advertising',
  thirdParty: 'Third-Party Seller Services',
  subs:       'Subscriptions',
  stores:     'Online & Physical Stores',
};

// Amazon CY segment net sales (USD billions). Source: Form 10-K filings.
// "stores" combines Online stores + Physical stores + Other (incl. Freight, Pharmacy).
// 2022 "Other" segment = $3.6B; 2023 = $5.0B; 2024 = $9.9B.
const BASE = {
  2022: { aws: 80.10, ads: 37.74, thirdParty: 117.72, subs: 35.22, stores: 242.54 },
  2023: { aws: 90.76, ads: 46.91, thirdParty: 140.05, subs: 40.03, stores: 256.86 },
  2024: { aws: 107.57, ads: 56.20, thirdParty: 159.39, subs: 40.83, stores: 273.93 },
};

const DEFAULTS = {
  awsCAGR:        18,
  adsCAGR:        16,
  thirdPartyCAGR: 10,
  subsCAGR:        7,
  storesCAGR:      5,
  netMargin:      12,
  peMultiple:     35,
  sharesB:        10.5,
};

const TOOLTIPS = {
  awsCAGR:        "CAGR from CY2024 base of $107.6B. AWS is gaining AI workload share via Bedrock, Trainium chips, and enterprise cloud migration tailwinds.",
  adsCAGR:        "CAGR from CY2024 base of $56.2B. Amazon DSP, sponsored products, and Prime Video advertising are among the fastest-growing ad platforms globally.",
  thirdPartyCAGR: "CAGR from CY2024 base of $159.4B. Marketplace take-rate expansion and FBA growth as seller base grows internationally.",
  subsCAGR:       "CAGR from CY2024 base of $40.8B. Amazon Prime memberships relatively mature in the US; growth from price increases and international expansion.",
  storesCAGR:     "CAGR from CY2024 base of $273.9B. Online stores, physical retail (Whole Foods, Amazon Go), and Other. Lower growth as e-commerce penetration matures.",
  netMargin:      "GAAP net margin. Amazon reached 9.3% in CY2024 ($59.2B net income), up from negative in 2022. AWS mix shift and operating leverage drive continued improvement.",
  peMultiple:     "P/E applied to modeled 2030 GAAP net income. Amazon has historically traded at high multiples reflecting its reinvestment and growth optionality.",
  sharesB:        "Diluted shares. Amazon had approximately 10.5B diluted shares in CY2024.",
};

const sourceNotes = [
  "2022–2024 segment revenue from Amazon.com, Inc. Form 10-K filings (filed Feb 2023, 2024, 2025).",
  "AWS operating income: $22.8B (2022), $39.8B (2023), $57.7B (2024). AWS is the primary source of operating profit.",
  "Third-party seller services: Amazon's single largest revenue segment at $159.4B in CY2024.",
  "Amazon reported CY2024 net income of $59.2B (9.3% GAAP margin), up from a net loss in 2022.",
  "Advertising services reached $56.2B in CY2024, growing 18% YoY. Prime Video ads launched in January 2024.",
  "Stores includes online stores ($242.4B), physical stores ($21.6B), and other ($9.9B) in CY2024.",
];

const OPERATING_METRICS = {
  awsYears:    ['2019', '2020', '2021', '2022', '2023', '2024', '2025*', '2026*', '2027*'],
  awsActual:   [35.03, 45.37, 62.20, 80.10, 90.76, 107.57, null, null, null],
  awsProj:     [null, null, null, null, null, null, 127.0, 149.9, 176.8],
  adsYears:    ['2020', '2021', '2022', '2023', '2024', '2025*', '2026*', '2027*'],
  adsActual:   [21.45, 31.16, 37.74, 46.91, 56.20, null, null, null],
  adsProj:     [null, null, null, null, null, 65.2, 75.6, 87.7],
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
    aws:        projectCAGR(BASE[2024].aws,        params.awsCAGR),
    ads:        projectCAGR(BASE[2024].ads,        params.adsCAGR),
    thirdParty: projectCAGR(BASE[2024].thirdParty, params.thirdPartyCAGR),
    subs:       projectCAGR(BASE[2024].subs,       params.subsCAGR),
    stores:     projectCAGR(BASE[2024].stores,     params.storesCAGR),
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
  const awsShare2030 = total2030 > 0 ? revenue.aws[FINAL_INDEX] / total2030 * 100 : 0;

  return { revenue, earnings, total2024, total2030, earnings2030, marketCap, sharePrice, eps2030, cagr6y, awsShare2030 };
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
        aria-label={`Stacked bar chart of Amazon ${type} by segment 2022 through 2030`}>
        Amazon {type} by segment, 2022–2024 actual and 2025–2030 projected.
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
      <SectionCard title="AWS" accent={SEGMENT_COLORS.aws}>
        <SliderField label="CAGR from 2024" id="awsCAGR" value={params.awsCAGR}
          min={5} max={40} tooltip={TOOLTIPS.awsCAGR} onChange={set('awsCAGR')} />
      </SectionCard>
      <SectionCard title="Advertising" accent={SEGMENT_COLORS.ads}>
        <SliderField label="CAGR from 2024" id="adsCAGR" value={params.adsCAGR}
          min={5} max={35} tooltip={TOOLTIPS.adsCAGR} accent={SEGMENT_COLORS.ads} onChange={set('adsCAGR')} />
      </SectionCard>
      <SectionCard title="Third-Party Seller Services" accent={SEGMENT_COLORS.thirdParty}>
        <SliderField label="CAGR from 2024" id="thirdPartyCAGR" value={params.thirdPartyCAGR}
          min={0} max={25} tooltip={TOOLTIPS.thirdPartyCAGR} accent={SEGMENT_COLORS.thirdParty} onChange={set('thirdPartyCAGR')} />
      </SectionCard>
      <SectionCard title="Subscriptions" accent={SEGMENT_COLORS.subs}>
        <SliderField label="CAGR from 2024" id="subsCAGR" value={params.subsCAGR}
          min={0} max={20} tooltip={TOOLTIPS.subsCAGR} accent={SEGMENT_COLORS.subs} onChange={set('subsCAGR')} />
      </SectionCard>
      <SectionCard title="Online &amp; Physical Stores" accent={SEGMENT_COLORS.stores}>
        <SliderField label="CAGR from 2024" id="storesCAGR" value={params.storesCAGR}
          min={0} max={15} tooltip={TOOLTIPS.storesCAGR} accent={SEGMENT_COLORS.stores} onChange={set('storesCAGR')} />
      </SectionCard>
      <SectionCard title="Margin &amp; Valuation" accent={ACCENT}>
        <SliderField label="GAAP net margin" id="netMargin" value={params.netMargin}
          min={5} max={30} tooltip={TOOLTIPS.netMargin} onChange={set('netMargin')} />
        <SliderField label="2030 P/E multiple" id="peMultiple" value={params.peMultiple}
          min={15} max={80} unit="x" tooltip={TOOLTIPS.peMultiple} onChange={set('peMultiple')} />
        <NumberField label="Diluted shares" value={params.sharesB} min={9} max={12} step={0.1}
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

export function AmazonLogoMark({ width = 110 }) {
  return (
    <svg viewBox="0 0 152 54" width={width} aria-label="Amazon logo" role="img" style={{ display: 'block' }}>
      <text x="2" y="38" fontFamily="Arial, Helvetica, sans-serif" fontSize="42" fontWeight="bold" fill="#f0eff8" letterSpacing="-1">amazon</text>
      <path d="M16,47 Q76,63 136,47" fill="none" stroke="#FF9900" strokeWidth="4" strokeLinecap="round"/>
      <polygon points="128,41 140,47 131,54" fill="#FF9900"/>
    </svg>
  );
}

export default function AmazonPage() {
  const [params, setParams] = useState(DEFAULTS);
  const projections = useMemo(() => buildProjections(params), [params]);

  return (
    <>
      <PageMeta {...PAGE_META.amazon} />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid var(--border)', padding: '0.65rem 2.5rem', background: 'var(--bg)' }}>
          <Link to="/"
            style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = ACCENT}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
            ← greaux
          </Link>
        </div>

        <header style={{ background: 'linear-gradient(180deg, rgba(255,153,0,0.06) 0%, transparent 100%)', borderBottom: '1px solid var(--border)', padding: '2rem 2.5rem 1.75rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 11, fontFamily: 'var(--mono)', color: ACCENT, border: '1px solid rgba(255,153,0,0.34)', borderRadius: 100, padding: '5px 14px', marginBottom: 10, letterSpacing: '0.06em' }}>
                  AMZN · AMAZON MODEL
                </div>
                <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.15, marginBottom: 8 }}>
                  Amazon Revenue<br />
                  <span style={{ color: ACCENT }}>Growth Dashboard</span>
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--mono)', maxWidth: 720, lineHeight: 1.6 }}>
                  2022–2024 actuals · Projected 2025–2030 · All figures in USD billions · Calendar year
                </p>
              </div>
              <div style={{ maxWidth: 360, fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', lineHeight: 1.55, textAlign: 'right' }}>
                2022–2024 segment revenue from Amazon Form 10-K filings. Projections are scenario defaults. Not financial advice.
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem 2.5rem', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
            <MetricCard label="2024 Revenue"    value={fmtUsdB(projections.total2024)}      sub="Actual · Form 10-K"                    accent={ACCENT} />
            <MetricCard label="2030 Revenue"    value={fmtUsdB(projections.total2030)}      sub={`${fmt(projections.cagr6y, 1)}% CAGR`}  accent="var(--accent)" />
            <MetricCard label="2030 Earnings"   value={fmtUsdB(projections.earnings2030)}   sub={`${params.netMargin}% GAAP margin`}    accent="var(--green)" />
            <MetricCard label="2030 Valuation"  value={fmtUsdB(projections.marketCap)}      sub={`${params.peMultiple}x P/E`}           accent="var(--pink)" />
            <MetricCard label="AWS Share 2030"  value={`${fmt(projections.awsShare2030, 0)}%`} sub="of 2030 revenue"                    accent={SEGMENT_COLORS.aws} />
            <MetricCard label="2030 Share Price" value={fmtUsd(projections.sharePrice)}     sub={`EPS ${fmtUsd(projections.eps2030)}`}  accent={ACCENT} />
          </div>

          <section style={{ background: 'linear-gradient(135deg, var(--bg2) 0%, rgba(255,153,0,0.05) 100%)', border: '1px solid rgba(255,153,0,0.28)', borderRadius: 'var(--radius-lg)', padding: '1.6rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                2030 Projected Share Price
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
              <span style={{ color: 'rgba(255,153,0,0.72)' }}>Adjust segment CAGRs, margin, and P/E below</span>
              <span>{fmt(projections.awsShare2030, 0)}% of 2030 revenue from AWS</span>
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
            <InsightCard title="AWS revenue history" subtitle="AWS grew from $35B (2019) to $107.6B (2024). AWS operating income of $57.7B in 2024 is the primary driver of Amazon's profitability.">
              <InsightBarChart
                labels={OPERATING_METRICS.awsYears}
                unit="B" decimals={1}
                ariaLabel="AWS revenue 2019 to 2024 with projections through 2027"
                datasets={[
                  { label: 'AWS',       data: OPERATING_METRICS.awsActual, backgroundColor: SEGMENT_COLORS.aws },
                  { label: 'projected', data: OPERATING_METRICS.awsProj,   backgroundColor: `${SEGMENT_COLORS.aws}55` },
                ]}
              />
            </InsightCard>

            <InsightCard title="Advertising revenue growth" subtitle="Amazon Advertising grew from $21.5B (2020) to $56.2B (2024). Prime Video ads launched in January 2024, adding incremental inventory.">
              <InsightBarChart
                labels={OPERATING_METRICS.adsYears}
                unit="B" decimals={1}
                ariaLabel="Amazon Advertising revenue 2020 to 2024 with projections through 2027"
                datasets={[
                  { label: 'Advertising', data: OPERATING_METRICS.adsActual, backgroundColor: SEGMENT_COLORS.ads },
                  { label: 'projected',   data: OPERATING_METRICS.adsProj,   backgroundColor: `${SEGMENT_COLORS.ads}55` },
                ]}
              />
            </InsightCard>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
            {sourceNotes.map(note => <SourcePill key={note}>{note}</SourcePill>)}
          </div>
        </main>

        <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 2.5rem', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'center' }}>
          Not financial advice · Historical data from Amazon SEC filings · Projections are illustrative
        </footer>
      </div>
    </>
  );
}
