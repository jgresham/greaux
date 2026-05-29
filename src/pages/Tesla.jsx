import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MetricCard from '../components/MetricCard';
import RevenueChart from '../components/RevenueChart';
import EarningsChart from '../components/EarningsChart';
import InputPanel from '../components/InputPanel';
import ChartLegend from '../components/ChartLegend';
import CollapsibleSection from '../components/CollapsibleSection';
import InsightBarChart from '../components/InsightBarChart';
import InsightCard from '../components/InsightCard';
import PageMeta, { PAGE_META } from '../components/PageMeta';
import { buildProjections, DEFAULTS, OPERATING_METRICS, SEGMENT_COLORS, TOOLTIPS } from '../data';

const fmt = (n, decimals = 0) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);

const fmtValuation = valueB =>
  valueB >= 1000 ? `$${fmt(valueB / 1000, 2)}T` : `$${fmt(valueB, 0)}B`;

export default function TeslaPage() {
  const [params, setParams] = useState(DEFAULTS);
  const proj = useMemo(() => buildProjections(params), [params]);

  const psLabel = proj.impliedPS != null ? `P/S ${fmt(proj.impliedPS, 1)}×` : 'P/S —';
  const peLabel = proj.impliedPE != null ? `P/E ${fmt(proj.impliedPE, 1)}×` : 'P/E —';
  const mktCapT = proj.marketCapB / 1000;

  return (
    <>
      <PageMeta {...PAGE_META.tesla} />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Back nav */}
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
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
        >
          ← greaux
        </Link>
      </div>

      <header style={{
        background: 'linear-gradient(180deg, rgba(232,255,71,0.04) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '2rem 2.5rem 1.75rem',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 11, fontFamily: 'var(--mono)',
                color: 'var(--accent)',
                border: '1px solid rgba(232,255,71,0.25)',
                borderRadius: 100,
                padding: '5px 12px',
                marginBottom: 10,
                letterSpacing: '0.06em',
              }}>
                {/* Tesla T logo — paths from Tesla Motors SVG (Wikimedia Commons) */}
                <svg viewBox="0 0 254.584 253.502" width="11" height="11" aria-hidden="true">
                  <g transform="translate(-45.84,-64.297)">
                    <path d="M 173.146,317.299 208.622,117.78 c 33.815,0 44.481,3.708 46.021,18.843 0,0 22.684,-8.458 34.125,-25.636 C 244.122,90.299 199.263,89.366 199.263,89.366 l -26.176,31.882 0.059,-0.004 -26.176,-31.883 c 0,0 -44.86,0.934 -89.5,21.622 11.431,17.178 34.124,25.636 34.124,25.636 1.549,-15.136 12.202,-18.844 45.79,-18.868 l 35.762,199.548" fill="#e82127"/>
                    <path d="m 173.132,80.157 c 36.09,-0.276 77.399,5.583 119.687,24.014 5.652,-10.173 7.105,-14.669 7.105,-14.669 C 253.697,71.213 210.406,64.954 173.127,64.797 135.85,64.954 92.561,71.214 46.34,89.502 c 0,0 2.062,5.538 7.1,14.669 42.28,-18.431 83.596,-24.29 119.687,-24.014 h 0.005" fill="#e82127"/>
                  </g>
                </svg>
                TSLA · INTERACTIVE PROJECTION MODEL
              </div>
              <h1 style={{
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontWeight: 700,
                color: 'var(--text)',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                marginBottom: 8,
              }}>
                Tesla Revenue<br />
                <span style={{ color: 'var(--accent)' }}>Growth Dashboard</span>
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                Historical 2020–2024 · Projected 2025–2029 · All figures in USD billions
              </p>
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6,
              fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)',
            }}>
              <span>Data: Tesla investor reports</span>
              <span style={{ color: 'rgba(232,255,71,0.5)' }}>Projections are illustrative</span>
            </div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: '2rem 2.5rem', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Summary metric cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: '2rem',
        }}>
          <MetricCard label="2024 Revenue" value={`$${fmt(proj.total2024, 1)}B`} sub="Actual · all segments" accent="var(--blue)" />
          <MetricCard label="2029 Projected" value={`$${fmt(proj.total2029, 1)}B`} sub="Based on your assumptions" accent="var(--accent)" tooltip={TOOLTIPS.total2029} />
          <MetricCard label="2029 Valuation" value={fmtValuation(proj.marketCapB)} sub={params.valuationMethod === 'ps' ? `${params.psRatio}x revenue` : `${params.peRatio}x earnings`} accent="var(--amber)" tooltip={TOOLTIPS.sharePrice} />
          <MetricCard label="5-Year CAGR" value={`${fmt(proj.cagr5y, 1)}%`} sub="2024 → 2029" accent="var(--green)" tooltip={TOOLTIPS.cagr} />
          <MetricCard label="Robotaxi 2029" value={`$${fmt(proj.roboFull[9], 1)}B`} sub="Platform revenue" accent="var(--pink)" />
          <MetricCard label="Optimus 2029" value={`$${fmt(proj.optimusFull[9], 1)}B`} sub="Humanoid revenue" accent={SEGMENT_COLORS.optimus} />
        </div>

        {/* Prominent share price projection */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bg2) 0%, rgba(232,255,71,0.04) 100%)',
          border: '1px solid rgba(232,255,71,0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem 2rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
        }}>
          <div>
            <div style={{
              fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--accent)',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
            }}>
              2029 Projected Share Price
            </div>
            <div style={{
              fontSize: 'clamp(48px, 7vw, 72px)',
              fontWeight: 700,
              color: 'var(--accent)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              marginBottom: 10,
            }}>
              ${fmt(proj.sharePrice2029)}
            </div>
            <div style={{
              display: 'flex', gap: 20, flexWrap: 'wrap',
              fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)',
            }}>
              <span>{psLabel}</span>
              <span>{peLabel}</span>
              <span>Mkt Cap ${fmt(mktCapT, 1)}T</span>
              <span>Net Income ${fmt(proj.earnings2029, 1)}B</span>
            </div>
          </div>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 6,
            fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)',
            textAlign: 'right',
          }}>
            <span style={{ color: 'rgba(232,255,71,0.5)' }}>Adjust valuation inputs below</span>
            <span>{params.valuationMethod === 'ps' ? `Based on P/Sales = ${params.psRatio}×` : `Based on P/Earnings = ${params.peRatio}×`}</span>
            <span>{fmt(params.sharesB, 1)}B diluted shares</span>
          </div>
        </div>

        {/* Revenue chart */}
        <div style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            marginBottom: '1.25rem',
          }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                Annual revenue by segment
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                * denotes projected years — adjust inputs below to update
              </p>
            </div>
            <ChartLegend />
          </div>
          <RevenueChart projections={proj} />
        </div>

        {/* Earnings chart */}
        <div style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            marginBottom: '1.25rem',
          }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                Annual earnings by segment
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                Net income = revenue × segment net margin · adjust margins in inputs below
              </p>
            </div>
            <ChartLegend />
          </div>
          <EarningsChart projections={proj} />
        </div>

        <CollapsibleSection
          eyebrow="Scenario controls"
          title="Adjust projection assumptions"
          description="Growth rates, margins, Robotaxi, Optimus, and valuation inputs."
          accent="var(--accent)"
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
              onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.color = 'var(--text2)'; }}
            >
              Reset to defaults
            </button>
          </div>
        </CollapsibleSection>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
          marginBottom: '2rem',
        }}>
          <InsightCard
            title="Vehicle deliveries"
            subtitle="Reported annual deliveries, split by Tesla's Model 3/Y and Other Models groups."
          >
            <InsightBarChart
              labels={OPERATING_METRICS.years}
              stacked
              unit="M"
              decimals={2}
              ariaLabel="Tesla annual vehicle deliveries by product group from 2020 through 2025"
              datasets={[
                {
                  label: 'Model 3/Y',
                  data: OPERATING_METRICS.model3YDeliveriesM,
                  backgroundColor: '#4da3ff',
                },
                {
                  label: 'Other Models',
                  data: OPERATING_METRICS.otherDeliveriesM,
                  backgroundColor: '#ffb347',
                },
              ]}
            />
          </InsightCard>

          <InsightCard
            title="Energy storage deployments"
            subtitle="Annual storage deployed in GWh, a useful scale marker for Tesla Energy."
          >
            <InsightBarChart
              labels={OPERATING_METRICS.years}
              unit=" GWh"
              decimals={1}
              ariaLabel="Tesla annual energy storage deployments in gigawatt-hours from 2020 through 2025"
              datasets={[
                {
                  label: 'Storage deployed',
                  data: OPERATING_METRICS.storageDeploymentsGWh,
                  backgroundColor: '#3ddea0',
                },
              ]}
            />
          </InsightCard>
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
        Not financial advice · Historical data from Tesla SEC filings · Built with React + Chart.js
      </footer>
      </div>
    </>
  );
}
