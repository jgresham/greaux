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

const ACCENT = '#ff007a';
const YEARS = [2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
const HIST_COUNT = 5;
const FINAL_INDEX = YEARS.length - 1;

const HISTORICAL = {
  totalFeesB: [1.575805705, 0.828175182, 0.597680583, 1.09489385, 1.057194977],
  volumeB: [644.824904506, 581.053366351, 422.83062609, 711.998600502, 1021.594495824],
  tvlB: [8.399903436, 3.306274915, 3.726205092, 5.897923748, 4.008799394],
};

const DEFAULTS = {
  volumeCAGR: 10,
  averageFeeBps: 10.4,
  feeSwitchPct: 0.05,
  tvlCAGR: 8,
  feeMultiple: 20,
  uniSupplyB: 0.636,
};

const COLORS = {
  lpFees: '#4da3ff',
  protocolCapture: '#ff007a',
  volume: '#3ddea0',
  tvl: '#ffb347',
  valuation: '#e8ff47',
};

const TOOLTIPS = {
  volumeCAGR: 'Annual DEX volume growth from the 2025 baseline. This is a scenario input, not Uniswap guidance.',
  averageFeeBps: 'Projected average swap fee paid by swappers, in basis points. 10 bps equals 0.10% of swap volume.',
  feeSwitchPct: 'Protocol fee switch as a percent of swap volume. Official v2 and common 30 bps v3 mechanics point to 0.05%, not 0.5%.',
  tvlCAGR: 'Annual growth in total value locked from the 2025 year-end DefiLlama baseline.',
  feeMultiple: 'Valuation multiple applied to modeled 2030 protocol fee-switch capture.',
  uniSupply: 'Circulating UNI supply in billions. Default is the CoinGecko figure fetched May 30, 2026.',
  earnings: 'Protocol earnings here exclude LP fees and model only fee-switch capture routed to protocol-controlled collection contracts.',
};

const sourceNotes = [
  'DefiLlama daily fees and DEX volume are aggregated annually for the historical baseline.',
  'Revenue is modeled as total swap fees paid by swappers, split between LP fees and fee-switch capture.',
  'Earnings exclude LP fees and include only modeled protocol fee-switch capture.',
  'Historical earnings bars are counterfactual; current capture depends on governance-configured pools and fee adapters.',
  'Uniswap Labs interface fee is 0% as of its January 2026 support article and is not separately modeled.',
  'Official Uniswap docs list 0.05% protocol fees on v2 and common 0.30% v3 pools, not 0.5%.',
];

const fmt = (n, decimals = 0) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

const fmtUsdB = value => `$${fmt(value, value < 10 ? 2 : 1)}B`;
const fmtUsd = value => `$${fmt(value, value < 100 ? 2 : 0)}`;
const fmtPct = value => `${fmt(value, value < 1 ? 2 : 1)}%`;

function projectCAGR(lastValue, cagr, count, decimals = 3) {
  return Array.from({ length: count }, (_, index) =>
    Number((lastValue * Math.pow(1 + cagr / 100, index + 1)).toFixed(decimals))
  );
}

function buildUniswapModel(params) {
  const projectedVolume = projectCAGR(HISTORICAL.volumeB[HIST_COUNT - 1], params.volumeCAGR, 5);
  const projectedTvl = projectCAGR(HISTORICAL.tvlB[HIST_COUNT - 1], params.tvlCAGR, 5);
  const projectedFees = projectedVolume.map(value =>
    Number((value * params.averageFeeBps / 10000).toFixed(3))
  );

  const volumeFull = [...HISTORICAL.volumeB, ...projectedVolume];
  const tvlFull = [...HISTORICAL.tvlB, ...projectedTvl];
  const totalFeesFull = [...HISTORICAL.totalFeesB, ...projectedFees];

  const protocolCaptureFull = totalFeesFull.map((fees, index) =>
    Number(Math.min(fees, volumeFull[index] * params.feeSwitchPct / 100).toFixed(3))
  );
  const lpFeesFull = totalFeesFull.map((fees, index) =>
    Number(Math.max(fees - protocolCaptureFull[index], 0).toFixed(3))
  );

  const totalFees2025 = totalFeesFull[HIST_COUNT - 1];
  const totalFees2030 = totalFeesFull[FINAL_INDEX];
  const protocol2030 = protocolCaptureFull[FINAL_INDEX];
  const valuation2030 = protocol2030 * params.feeMultiple;
  const uniPrice2030 = params.uniSupplyB > 0 ? valuation2030 / params.uniSupplyB : 0;
  const feeCAGR = totalFees2025 > 0
    ? (Math.pow(totalFees2030 / totalFees2025, 1 / 5) - 1) * 100
    : 0;
  const protocolShare2030 = totalFees2030 > 0 ? protocol2030 / totalFees2030 * 100 : 0;

  return {
    volumeFull,
    tvlFull,
    totalFeesFull,
    protocolCaptureFull,
    lpFeesFull,
    totalFees2025,
    totalFees2030,
    protocol2030,
    valuation2030,
    uniPrice2030,
    feeCAGR,
    protocolShare2030,
  };
}

function splitSeries(full, color, label, stack = 'stack') {
  return [
    {
      label,
      tooltipLabel: label,
      data: full.map((value, index) => index < HIST_COUNT ? value : null),
      backgroundColor: color,
      stack,
      borderRadius: { topLeft: 3, topRight: 3 },
      borderSkipped: false,
    },
    {
      label: 'projected',
      tooltipLabel: `${label} projected`,
      data: full.map((value, index) => index >= HIST_COUNT ? value : null),
      backgroundColor: `${color}55`,
      borderColor: color,
      borderWidth: 1.5,
      borderDash: [4, 3],
      stack,
      borderRadius: { topLeft: 3, topRight: 3 },
      borderSkipped: false,
    },
  ];
}

function FeeLegend({ items }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{
            width: 10,
            height: 10,
            borderRadius: 2,
            background: item.color,
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>{item.label}</span>
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

function PairedBarChart({ series, stacked = true, ariaLabel }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: YEARS.map((year, index) => index >= HIST_COUNT ? `${year}*` : String(year)),
        datasets: series.flatMap(item => splitSeries(item.data, item.color, item.label, item.stack)),
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
                const index = items[0].dataIndex;
                return index >= HIST_COUNT ? `${YEARS[index]} projected` : `${YEARS[index]} historical`;
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
            stacked,
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: '#5a5a72',
              font: { family: "'DM Mono', monospace", size: 12 },
              autoSkip: false,
            },
          },
          y: {
            stacked,
            beginAtZero: true,
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

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [ariaLabel, series, stacked]);

  return (
    <div style={{ position: 'relative', width: '100%', height: stacked ? 360 : 300 }}>
      <canvas ref={canvasRef} role="img" aria-label={ariaLabel}>
        {ariaLabel}
      </canvas>
    </div>
  );
}

function SliderField({ label, id, value, min, max, step = 1, unit = '%', tooltip, accent = ACCENT, onChange }) {
  const decimals = step < 1 ? String(step).split('.')[1]?.length || 1 : 0;

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
          color: accent,
          minWidth: 62,
          textAlign: 'right',
        }}>
          {fmt(value, decimals)}{unit}
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
      <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accent }} />
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
      <SectionCard title="DEX Activity" accent={COLORS.volume}>
        <SliderField
          label="Swap volume CAGR"
          id="volumeCAGR"
          value={params.volumeCAGR}
          min={-20}
          max={35}
          tooltip={TOOLTIPS.volumeCAGR}
          accent={COLORS.volume}
          onChange={set('volumeCAGR')}
        />
        <SliderField
          label="Average swap fee"
          id="averageFeeBps"
          value={params.averageFeeBps}
          min={1}
          max={35}
          step={0.1}
          unit=" bps"
          tooltip={TOOLTIPS.averageFeeBps}
          accent={COLORS.volume}
          onChange={set('averageFeeBps')}
        />
      </SectionCard>

      <SectionCard title="Fee Switch" accent={COLORS.protocolCapture}>
        <SliderField
          label="Protocol fee switch"
          id="feeSwitchPct"
          value={params.feeSwitchPct}
          min={0}
          max={0.5}
          step={0.01}
          unit="%"
          tooltip={TOOLTIPS.feeSwitchPct}
          accent={COLORS.protocolCapture}
          onChange={set('feeSwitchPct')}
        />
        <SliderField
          label="TVL CAGR"
          id="tvlCAGR"
          value={params.tvlCAGR}
          min={-20}
          max={30}
          tooltip={TOOLTIPS.tvlCAGR}
          accent={COLORS.tvl}
          onChange={set('tvlCAGR')}
        />
      </SectionCard>

      <SectionCard title="Valuation" accent={COLORS.valuation}>
        <SliderField
          label="2030 fee multiple"
          id="feeMultiple"
          value={params.feeMultiple}
          min={5}
          max={50}
          step={1}
          unit="x"
          tooltip={TOOLTIPS.feeMultiple}
          accent={COLORS.valuation}
          onChange={set('feeMultiple')}
        />
        <NumberField
          label="Circulating UNI supply"
          value={params.uniSupplyB}
          min={0.1}
          max={1.0}
          step={0.001}
          suffix="B UNI"
          tooltip={TOOLTIPS.uniSupply}
          onChange={set('uniSupplyB')}
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

function UniswapMark() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #ff007a 0%, #fc72ff 100%)',
      color: '#fff',
      fontFamily: 'var(--mono)',
      fontSize: 10,
      fontWeight: 700,
      lineHeight: 1,
    }}>
      U
    </span>
  );
}

export default function UniswapPage() {
  const [params, setParams] = useState(DEFAULTS);
  const projections = useMemo(() => buildUniswapModel(params), [params]);

  const revenueSeries = useMemo(() => [
    { label: 'LP fees', color: COLORS.lpFees, data: projections.lpFeesFull, stack: 'fees' },
    { label: 'Fee-switch capture', color: COLORS.protocolCapture, data: projections.protocolCaptureFull, stack: 'fees' },
  ], [projections.lpFeesFull, projections.protocolCaptureFull]);

  const earningsSeries = useMemo(() => [
    { label: 'Fee-switch capture', color: COLORS.protocolCapture, data: projections.protocolCaptureFull, stack: 'earnings' },
  ], [projections.protocolCaptureFull]);

  return (
    <>
      <PageMeta {...PAGE_META.uniswap} />
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
            onMouseEnter={event => event.currentTarget.style.color = ACCENT}
            onMouseLeave={event => event.currentTarget.style.color = 'var(--text3)'}
          >
            &lt;- greaux
          </Link>
        </div>

        <header style={{
          background: 'linear-gradient(180deg, rgba(255,0,122,0.06) 0%, transparent 100%)',
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
                  color: ACCENT,
                  border: '1px solid rgba(255,0,122,0.28)',
                  borderRadius: 100,
                  padding: '5px 12px',
                  marginBottom: 10,
                  letterSpacing: '0.06em',
                }}>
                  <UniswapMark />
                  UNI · DECENTRALIZED EXCHANGE MODEL
                </div>
                <h1 style={{
                  fontSize: 'clamp(24px, 4vw, 36px)',
                  fontWeight: 700,
                  color: 'var(--text)',
                  lineHeight: 1.15,
                  marginBottom: 8,
                }}>
                  Uniswap Fee Switch<br />
                  <span style={{ color: ACCENT }}>Growth Dashboard</span>
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--mono)', maxWidth: 720, lineHeight: 1.6 }}>
                  Historical 2021-2025 · Projected 2026-2030 · All figures in USD billions
                </p>
              </div>
              <div style={{
                maxWidth: 360,
                fontSize: 12,
                fontFamily: 'var(--mono)',
                color: 'var(--text3)',
                lineHeight: 1.55,
                textAlign: 'right',
              }}>
                Gross revenue is total swap fees paid by swappers. Earnings exclude LP fees and model protocol fee-switch capture only.
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
              label="2025 Swap Fees"
              value={fmtUsdB(projections.totalFees2025)}
              sub="DefiLlama total fees"
              accent={COLORS.lpFees}
            />
            <MetricCard
              label="2030 Swap Fees"
              value={fmtUsdB(projections.totalFees2030)}
              sub={`${fmt(params.averageFeeBps, 1)} bps on projected volume`}
              accent="var(--accent)"
            />
            <MetricCard
              label="Fee Switch"
              value={fmtPct(params.feeSwitchPct)}
              sub="Default is 5 bps"
              accent={COLORS.protocolCapture}
              tooltip={TOOLTIPS.feeSwitchPct}
            />
            <MetricCard
              label="2030 Earnings"
              value={fmtUsdB(projections.protocol2030)}
              sub="LP fees excluded"
              accent={COLORS.tvl}
              tooltip={TOOLTIPS.earnings}
            />
            <MetricCard
              label="2030 UNI Value"
              value={fmtUsdB(projections.valuation2030)}
              sub={`${params.feeMultiple}x fee-switch capture`}
              accent={COLORS.valuation}
            />
            <MetricCard
              label="Implied UNI"
              value={fmtUsd(projections.uniPrice2030)}
              sub={`${fmt(params.uniSupplyB, 3)}B UNI supply`}
              accent={ACCENT}
            />
          </div>

          <section style={{
            background: 'linear-gradient(135deg, var(--bg2) 0%, rgba(255,0,122,0.045) 100%)',
            border: '1px solid rgba(255,0,122,0.28)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.6rem 2rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
          }}>
            <div>
              <div style={{
                fontSize: 11,
                fontFamily: 'var(--mono)',
                color: ACCENT,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 10,
              }}>
                2030 Protocol Valuation Scenario
              </div>
              <div style={{
                fontSize: 'clamp(42px, 7vw, 66px)',
                fontWeight: 700,
                color: ACCENT,
                lineHeight: 1,
                marginBottom: 10,
              }}>
                {fmtUsdB(projections.valuation2030)}
              </div>
              <div style={{
                display: 'flex',
                gap: 20,
                flexWrap: 'wrap',
                fontSize: 12,
                fontFamily: 'var(--mono)',
                color: 'var(--text3)',
              }}>
                <span>{fmtUsdB(projections.protocol2030)} fee-switch capture</span>
                <span>{params.feeMultiple}x multiple</span>
                <span>{fmtUsd(projections.uniPrice2030)} per UNI</span>
              </div>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontSize: 12,
              fontFamily: 'var(--mono)',
              color: 'var(--text3)',
              textAlign: 'right',
            }}>
              <span style={{ color: 'rgba(255,0,122,0.68)' }}>
                Adjust fee switch, volume, and multiple below
              </span>
              <span>{fmtPct(projections.feeCAGR)} swap-fee CAGR from 2025 to 2030</span>
              <span>{fmt(projections.protocolShare2030, 1)}% of 2030 swap fees captured by protocol</span>
            </div>
          </section>

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
                  Annual swap fees by recipient
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                  Revenue = total fees paid by swappers; * denotes projected years
                </p>
              </div>
              <FeeLegend items={[
                { label: 'LP fees', color: COLORS.lpFees },
                { label: 'Fee-switch capture', color: COLORS.protocolCapture },
              ]} />
            </div>
            <PairedBarChart
              series={revenueSeries}
              stacked
              ariaLabel="Uniswap annual swap fees by recipient from 2021 through 2030, with 2026 through 2030 projected"
            />
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
                  Annual protocol earnings*
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                  Earnings = fee-switch capture only; LP fees are excluded
                </p>
                <p style={{ fontSize: 11, color: ACCENT, fontFamily: 'var(--mono)', marginTop: 6, lineHeight: 1.5 }}>
                  * Historical bars are modeled as if the selected fee switch applied; current capture depends on governance-configured pools.
                </p>
              </div>
              <FeeLegend items={[{ label: 'Fee-switch capture', color: COLORS.protocolCapture }]} />
            </div>
            <PairedBarChart
              series={earningsSeries}
              stacked={false}
              ariaLabel="Uniswap annual protocol earnings from fee-switch capture from 2021 through 2030, with 2026 through 2030 projected"
            />
          </section>

          <CollapsibleSection
            eyebrow="Scenario controls"
            title="Adjust projection assumptions"
            description="DEX volume, average fee rate, fee-switch capture, TVL, and UNI valuation inputs."
            accent={ACCENT}
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
                onMouseEnter={event => { event.target.style.borderColor = ACCENT; event.target.style.color = ACCENT; }}
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
              title="DEX volume"
              subtitle="DefiLlama annual volume through 2025; * years use the default volume CAGR."
            >
              <InsightBarChart
                labels={YEARS.map((year, index) => index >= HIST_COUNT ? `${year}*` : String(year))}
                unit="B"
                decimals={0}
                ariaLabel="Uniswap annual DEX volume from 2021 through 2030, with 2026 through 2030 projected"
                datasets={[
                  {
                    label: 'Swap volume',
                    data: projections.volumeFull.map((value, index) => index < HIST_COUNT ? value : null),
                    backgroundColor: COLORS.volume,
                  },
                  {
                    label: 'projected',
                    data: projections.volumeFull.map((value, index) => index >= HIST_COUNT ? value : null),
                    backgroundColor: `${COLORS.volume}55`,
                    borderColor: COLORS.volume,
                    borderWidth: 1.5,
                    borderDash: [4, 3],
                  },
                ]}
              />
            </InsightCard>

            <InsightCard
              title="Total value locked"
              subtitle="DefiLlama year-end TVL through 2025; * years use the default TVL CAGR."
            >
              <InsightBarChart
                labels={YEARS.map((year, index) => index >= HIST_COUNT ? `${year}*` : String(year))}
                unit="B"
                decimals={1}
                ariaLabel="Uniswap total value locked from 2021 through 2030, with 2026 through 2030 projected"
                datasets={[
                  {
                    label: 'TVL',
                    data: projections.tvlFull.map((value, index) => index < HIST_COUNT ? value : null),
                    backgroundColor: COLORS.tvl,
                  },
                  {
                    label: 'projected',
                    data: projections.tvlFull.map((value, index) => index >= HIST_COUNT ? value : null),
                    backgroundColor: `${COLORS.tvl}55`,
                    borderColor: COLORS.tvl,
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
          Not financial advice · Uniswap protocol model · Historical operating data from DefiLlama
        </footer>
      </div>
    </>
  );
}
