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

const ACCENT = '#CCFF00';
const YEARS = [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
const HIST_COUNT = 3;
const FINAL_INDEX = YEARS.length - 1;

const SEGMENT_COLORS = {
  transaction: '#CCFF00',
  interest:    '#4da3ff',
  other:       '#a78bfa',
};

const SEGMENT_LABELS = {
  transaction: 'Transaction-Based',
  interest:    'Net Interest',
  other:       'Other Revenue',
};

// Robinhood CY revenue (USD billions). Source: Robinhood Form 10-K CY2022, 2023, 2024.
// "transaction" = options + equities + crypto net revenues combined.
// "interest" = net interest revenues (margin, stock lending, cash sweep, interest on customer deposits).
// "other" = Gold subscriptions, proxy/transfer fees, cash card, other services.
// CY2022: $1.358B total. CY2023: $1.865B. CY2024: $2.951B (record; first profitable year).
const BASE = {
  2022: { transaction: 0.814, interest: 0.424, other: 0.120 },
  2023: { transaction: 0.785, interest: 0.929, other: 0.151 },
  2024: { transaction: 1.647, interest: 1.109, other: 0.195 },
};

const DEFAULTS = {
  transactionCAGR: 20,
  interestCAGR:    10,
  otherCAGR:       15,
  netMargin:       25,
  peMultiple:      25,
  sharesB:         0.908,
};

const TOOLTIPS = {
  transactionCAGR: "CAGR from CY2024 base of $1.65B. Options remains the largest transaction category; crypto grew ~700% YoY in 2024 driven by meme coins and retail speculation. Continued product expansion (futures, index options, prediction markets) supports high-teens to 20% CAGR. Source: Robinhood 10-K CY2024.",
  interestCAGR:    "CAGR from CY2024 base of $1.11B. Earned on margin balances, stock lending, uninvested cash sweep (4.5%+ rates), and cash card program. Sensitive to Fed funds rate. 10% default assumes modest rate cuts and continued AUC growth. Source: Robinhood 10-K CY2024.",
  otherCAGR:       "CAGR from CY2024 base of $195M. Includes Robinhood Gold premium subscriptions ($5/mo, growing toward 3M+ subscribers), proxy/transfer agent fees, and cash card interchange. Fastest-growing in % terms but smallest in absolute size. Source: Robinhood 10-K CY2024.",
  netMargin:       "GAAP net margin. CY2024 was 47.8% ($1,411M / $2,951M) — exceptionally high due to crypto upswing and operating leverage. A normalized 25% reflects sustainable profitability as headcount and R&D investments resume. Source: Robinhood 10-K CY2024.",
  peMultiple:      "P/E applied to modeled 2030 GAAP net income. Robinhood trades at a premium to traditional brokers (Schwab ~20x) but discount to high-growth fintech. 25x reflects mid-case for a maturing retail brokerage with crypto optionality. Source: Bloomberg consensus.",
  sharesB:         "Diluted shares (billions). CY2024 diluted weighted average shares: ~907.8M. Robinhood has been repurchasing shares alongside RSU dilution. Source: Robinhood 10-K CY2024.",
};

const sourceNotes = [
  "CY2022–CY2024 revenue from Robinhood Form 10-K filings (EDGAR).",
  "CY2024: First profitable year in Robinhood history. GAAP net income $1,411M (+$1,952M YoY turnaround).",
  "Crypto transaction revenue: $358M (2022) → $126M (2023) → $672M (2024). Volatile — tied to crypto cycle.",
  "Options revenue: $327M (2022) → $353M (2023) → $695M (2024). Largest, most durable transaction category.",
  "Net interest income grew 3.3× from 2022 to 2023 as rates rose; continues growing with AUC expansion.",
  "CY2024 MAU: 14.9M. Assets Under Custody: $193B (+88% YoY). Robinhood Gold: 2.6M+ subscribers.",
];

const OPERATING_METRICS = {
  mauYears:    ['2021', '2022', '2023', '2024', '2025*', '2026*', '2027*'],
  mauActual:   [21.3,   11.4,   10.9,  14.9,   null,    null,    null],
  mauProj:     [null,   null,   null,  null,   17.5,    21.0,    25.0],
  aucYears:    ['2022', '2023', '2024', '2025*', '2026*', '2027*'],
  aucActual:   [62.2,   102.6, 193.0,  null,    null,    null],
  aucProj:     [null,   null,  null,   250.0,   310.0,   380.0],
};

const fmt     = (n, d = 0) => new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const fmtUsdB = v => {
  if (v >= 1000) return `$${fmt(v / 1000, 1)}T`;
  if (v >= 1)    return `$${fmt(v, 1)}B`;
  return `$${fmt(v * 1000, 0)}M`;
};
const fmtUsd = v => `$${fmt(v, v < 100 ? 2 : 0)}`;

function projectCAGR(base, cagr, count = 6) {
  return Array.from({ length: count }, (_, i) =>
    Number((base * Math.pow(1 + cagr / 100, i + 1)).toFixed(3))
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
    transaction: projectCAGR(BASE[2024].transaction, params.transactionCAGR),
    interest:    projectCAGR(BASE[2024].interest,    params.interestCAGR),
    other:       projectCAGR(BASE[2024].other,       params.otherCAGR),
  };

  const revenue = Object.fromEntries(hist.map(([seg, h]) => [seg, [...h, ...proj[seg]]]));
  const earnings = Object.fromEntries(
    Object.entries(revenue).map(([seg, arr]) => [
      seg, arr.map(v => Number((v * params.netMargin / 100).toFixed(3))),
    ])
  );

  const total2024          = sumAt(revenue, 2);
  const total2030          = sumAt(revenue, FINAL_INDEX);
  const earnings2030       = sumAt(earnings, FINAL_INDEX);
  const marketCap          = earnings2030 * params.peMultiple;
  const sharePrice         = params.sharesB > 0 ? marketCap / params.sharesB : 0;
  const eps2030            = params.sharesB > 0 ? earnings2030 / params.sharesB : 0;
  const cagr6y             = total2024 > 0 ? (Math.pow(total2030 / total2024, 1 / 6) - 1) * 100 : 0;
  const transactionShare29 = total2030 > 0 ? revenue.transaction[FINAL_INDEX] / total2030 * 100 : 0;

  return { revenue, earnings, total2024, total2030, earnings2030, marketCap, sharePrice, eps2030, cagr6y, transactionShare29 };
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
            ticks: {
              color: '#5a5a72',
              font: { family: "'DM Mono', monospace", size: 12 },
              callback: v => v >= 1 ? `$${v}B` : v > 0 ? `$${(v * 1000).toFixed(0)}M` : '$0',
            },
          },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [source]);

  return (
    <div style={{ position: 'relative', width: '100%', height: type === 'earnings' ? 310 : 360 }}>
      <canvas ref={canvasRef} role="img"
        aria-label={`Stacked bar chart of Robinhood ${type} by category 2022 through 2030`}>
        Robinhood {type} by category, 2022–2024 actual and 2025–2030 projected.
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
      <SectionCard title="Transaction Revenue" accent={SEGMENT_COLORS.transaction}>
        <SliderField label="CAGR from 2024" id="transactionCAGR" value={params.transactionCAGR}
          min={0} max={50} tooltip={TOOLTIPS.transactionCAGR} onChange={set('transactionCAGR')} />
      </SectionCard>
      <SectionCard title="Net Interest Revenue" accent={SEGMENT_COLORS.interest}>
        <SliderField label="CAGR from 2024" id="interestCAGR" value={params.interestCAGR}
          min={-10} max={30} tooltip={TOOLTIPS.interestCAGR} accent={SEGMENT_COLORS.interest} onChange={set('interestCAGR')} />
      </SectionCard>
      <SectionCard title="Other Revenue" accent={SEGMENT_COLORS.other}>
        <SliderField label="CAGR from 2024" id="otherCAGR" value={params.otherCAGR}
          min={0} max={40} tooltip={TOOLTIPS.otherCAGR} accent={SEGMENT_COLORS.other} onChange={set('otherCAGR')} />
      </SectionCard>
      <SectionCard title="Margin &amp; Valuation" accent={ACCENT}>
        <SliderField label="GAAP net margin" id="netMargin" value={params.netMargin}
          min={0} max={55} tooltip={TOOLTIPS.netMargin} onChange={set('netMargin')} />
        <SliderField label="2030 P/E multiple" id="peMultiple" value={params.peMultiple}
          min={10} max={60} unit="x" tooltip={TOOLTIPS.peMultiple} onChange={set('peMultiple')} />
        <NumberField label="Diluted shares" value={params.sharesB} min={0.80} max={1.10} step={0.001}
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

export function RobinhoodLogoMark({ width = 130 }) {
  return (
    <svg viewBox="0 0 200 44" width={width} aria-label="Robinhood logo" role="img" style={{ display: 'block' }}>
      {/* Feather icon */}
      <path
        d="M14 3 C10 7, 7 12, 8 20 C9 26, 13 30, 17 30 C14 24, 14 17, 18 12 C21 8, 25 7, 25 7 C21 10, 19 16, 21 22 C23 28, 26 30, 26 30 C23 24, 23 17, 27 12 C28 10, 29 9, 29 9 C28 14, 29 22, 32 28 C33 26, 34 22, 33 16 C32 10, 28 5, 22 3 C19 2, 16 2, 14 3 Z"
        fill={ACCENT}
      />
      {/* robinhood wordmark */}
      <text x="40" y="30" fontFamily="Arial, Helvetica, sans-serif" fontSize="22" fontWeight="700" fill="#f0eff8" letterSpacing="-0.3">robinhood</text>
    </svg>
  );
}

export default function RobinhoodPage() {
  const [params, setParams] = useState(DEFAULTS);
  const projections = useMemo(() => buildProjections(params), [params]);

  return (
    <>
      <PageMeta {...PAGE_META.robinhood} />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid var(--border)', padding: '0.65rem 2.5rem', background: 'var(--bg)' }}>
          <Link to="/"
            style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = ACCENT}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
            ← greaux
          </Link>
        </div>

        <header style={{ background: 'linear-gradient(180deg, rgba(204,255,0,0.06) 0%, transparent 100%)', borderBottom: '1px solid var(--border)', padding: '2rem 2.5rem 1.75rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 11, fontFamily: 'var(--mono)', color: ACCENT, border: '1px solid rgba(204,255,0,0.35)', borderRadius: 100, padding: '5px 14px', marginBottom: 10, letterSpacing: '0.06em' }}>
                  HOOD · RETAIL BROKERAGE MODEL
                </div>
                <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.15, marginBottom: 8 }}>
                  Robinhood Revenue<br />
                  <span style={{ color: ACCENT }}>Growth Dashboard</span>
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--mono)', maxWidth: 720, lineHeight: 1.6 }}>
                  2022–2024 actuals · Projected 2025–2030 · USD · Calendar year · First profitable year: 2024
                </p>
              </div>
              <div style={{ maxWidth: 360, fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', lineHeight: 1.55, textAlign: 'right' }}>
                2022–2024 revenue from Robinhood Form 10-K filings. Projections are scenario defaults. Not financial advice.
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem 2.5rem', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
            <MetricCard label="2024 Revenue"        value={fmtUsdB(projections.total2024)}         sub="Actual · Robinhood 10-K"               accent={ACCENT} />
            <MetricCard label="2030 Revenue"         value={fmtUsdB(projections.total2030)}         sub={`${fmt(projections.cagr6y, 1)}% CAGR`}  accent="var(--accent)" />
            <MetricCard label="2030 Earnings"        value={fmtUsdB(projections.earnings2030)}      sub={`${params.netMargin}% GAAP margin`}     accent="var(--green)" />
            <MetricCard label="2030 Valuation"       value={fmtUsdB(projections.marketCap)}         sub={`${params.peMultiple}x P/E`}            accent="var(--pink)" />
            <MetricCard label="Transaction Sh. 2030" value={`${fmt(projections.transactionShare29, 0)}%`} sub="of 2030 revenue"               accent={SEGMENT_COLORS.transaction} />
            <MetricCard label="2030 Share Price"     value={fmtUsd(projections.sharePrice)}         sub={`EPS ${fmtUsd(projections.eps2030)}`}   accent={ACCENT} />
          </div>

          <section style={{ background: 'linear-gradient(135deg, var(--bg2) 0%, rgba(204,255,0,0.05) 100%)', border: '1px solid rgba(204,255,0,0.28)', borderRadius: 'var(--radius-lg)', padding: '1.6rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                2030 Projected Share Price (USD)
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
              <span style={{ color: 'rgba(204,255,0,0.72)' }}>Adjust revenue CAGRs, margin, and P/E below</span>
              <span>{fmt(projections.transactionShare29, 0)}% of 2030 revenue from transactions</span>
              <span>{params.peMultiple}x P/E on modeled GAAP net income</span>
            </div>
          </section>

          <section style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Annual revenue by category (USD)</h2>
                <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>2022–2024 actual; * denotes projected years</p>
              </div>
              <SegmentLegend />
            </div>
            <StackedBarChart projections={projections} type="revenue" />
          </section>

          <section style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Annual earnings by category (USD)</h2>
                <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>GAAP earnings = revenue × net margin scenario</p>
              </div>
              <SegmentLegend />
            </div>
            <StackedBarChart projections={projections} type="earnings" />
          </section>

          <CollapsibleSection
            eyebrow="Scenario controls"
            title="Adjust projection assumptions"
            description="Revenue category CAGRs from the 2024 base, GAAP net margin, P/E multiple, and diluted shares outstanding."
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
            <InsightCard title="Monthly Active Users (MAU)" subtitle="MAU peaked at 21.3M in 2021 (COVID-era retail boom) before declining to 10.9M in 2023. Crypto and meme stock cycles drive re-engagement. CY2024 saw a strong recovery to 14.9M.">
              <InsightBarChart
                labels={OPERATING_METRICS.mauYears}
                unit="M" decimals={1}
                ariaLabel="Robinhood Monthly Active Users 2021 to 2024 with projections through 2027"
                datasets={[
                  { label: 'MAU',       data: OPERATING_METRICS.mauActual, backgroundColor: ACCENT },
                  { label: 'projected', data: OPERATING_METRICS.mauProj,   backgroundColor: `${ACCENT}55` },
                ]}
              />
            </InsightCard>

            <InsightCard title="Assets Under Custody (AUC)" subtitle="AUC grew 88% YoY in 2024 to $193B, driven by net deposits and equity/crypto market appreciation. AUC is the foundation of net interest income — higher AUC means more cash sweep and margin revenue.">
              <InsightBarChart
                labels={OPERATING_METRICS.aucYears}
                unit="B" decimals={0}
                ariaLabel="Robinhood Assets Under Custody 2022 to 2024 with projections through 2027"
                datasets={[
                  { label: 'AUC',       data: OPERATING_METRICS.aucActual, backgroundColor: SEGMENT_COLORS.interest },
                  { label: 'projected', data: OPERATING_METRICS.aucProj,   backgroundColor: `${SEGMENT_COLORS.interest}55` },
                ]}
              />
            </InsightCard>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
            {sourceNotes.map(note => <SourcePill key={note}>{note}</SourcePill>)}
          </div>
        </main>

        <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 2.5rem', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'center' }}>
          Not financial advice · Historical data from Robinhood 10-K SEC filings · Projections are illustrative
        </footer>
      </div>
    </>
  );
}
