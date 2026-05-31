import { Link } from 'react-router-dom';
import GreauxLogo from '../components/GreauxLogo';
import PageMeta, { PAGE_META } from '../components/PageMeta';
import { NvidiaLogoMark } from './Nvidia';
import { AmdLogoMark } from './AMD';
import { AppleLogoMark } from './Apple';
import { MicrosoftLogoMark } from './Microsoft';
import { GoogleLogoMark } from './Google';
import { AmazonLogoMark } from './Amazon';
import { AsmlLogoMark } from './ASML';
import { TsmcLogoMark } from './TSMC';
import { RobinhoodLogoMark } from './Robinhood';

const companies = [
  {
    ticker: 'TSLA',
    name: 'Tesla, Inc.',
    description: 'Automotive · Energy · Robotaxi · Optimus.',
    accent: '#e82127',
    to: '/tesla',
    logo: 'tesla',
    stats: [
      { label: '2024 Revenue', value: '$97.7B' },
      { label: 'Projection through', value: '2029' },
    ],
    badge: '◆',
  },
  {
    ticker: 'PRIVATE',
    name: 'SpaceX',
    description: 'Starlink · Launch · Dragon · Starship.',
    accent: '#4da3ff',
    to: '/spacex',
    logo: 'spacex',
    stats: [
      { label: '2025 Revenue', value: '$18.7B e' },
      { label: 'Projection through', value: '2030' },
    ],
    badge: '◇',
  },
  {
    ticker: 'UNI',
    name: 'Uniswap',
    description: 'DEX volume · Swap fees · Fee switch.',
    accent: '#ff007a',
    to: '/uniswap',
    logo: 'uniswap',
    stats: [
      { label: '2025 Fees', value: '$1.06B' },
      { label: 'Default switch', value: '0.05%' },
    ],
    badge: '◈',
  },
  {
    ticker: 'AMD',
    name: 'AMD',
    description: 'Data Center · Client · Gaming · Embedded.',
    accent: '#ED1C24',
    to: '/amd',
    logo: 'amd',
    stats: [
      { label: '2024 Revenue', value: '$25.8B' },
      { label: 'Projection through', value: '2029' },
    ],
    badge: '◆',
  },
  {
    ticker: 'NVDA',
    name: 'Nvidia',
    description: 'Data Center · Gaming · Automotive · Instinct.',
    accent: '#76b900',
    to: '/nvidia',
    logo: 'nvidia',
    stats: [
      { label: 'FY2025 Revenue', value: '$130.5B' },
      { label: 'Projection through', value: 'FY2030' },
    ],
    badge: '◆',
  },
  {
    ticker: 'LLY',
    name: 'Eli Lilly',
    description: 'Mounjaro · Zepbound · Foundayo · Oncology.',
    accent: '#d52b1e',
    to: '/lilly',
    logo: 'lilly',
    stats: [
      { label: '2025 Revenue', value: '$65.2B' },
      { label: '2026 Guide', value: '$82-85B' },
    ],
    badge: '✦',
  },
  {
    ticker: 'AAPL',
    name: 'Apple',
    description: 'iPhone · Services · Mac · iPad · Wearables.',
    accent: '#0071e3',
    to: '/apple',
    logo: 'apple',
    stats: [
      { label: 'FY2024 Revenue', value: '$391.0B' },
      { label: 'Projection through', value: 'FY2029' },
    ],
    badge: '◆',
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft',
    description: 'Intelligent Cloud · Productivity & Business · Personal Computing.',
    accent: '#00A4EF',
    to: '/microsoft',
    logo: 'microsoft',
    stats: [
      { label: 'FY2024 Revenue', value: '$245.1B' },
      { label: 'Projection through', value: 'FY2029' },
    ],
    badge: '◆',
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet',
    description: 'Google Search · YouTube · Google Cloud · Subscriptions.',
    accent: '#4285F4',
    to: '/google',
    logo: 'google',
    stats: [
      { label: '2024 Revenue', value: '$350.0B' },
      { label: 'Projection through', value: '2029' },
    ],
    badge: '◆',
  },
  {
    ticker: 'AMZN',
    name: 'Amazon',
    description: 'AWS · Advertising · Third-Party Sellers · Subscriptions · Stores.',
    accent: '#FF9900',
    to: '/amazon',
    logo: 'amazon',
    stats: [
      { label: '2024 Revenue', value: '$637.9B' },
      { label: 'Projection through', value: '2029' },
    ],
    badge: '◆',
  },
  {
    ticker: 'ASML',
    name: 'ASML',
    description: 'EUV Lithography · DUV Systems · Installed Base Mgmt.',
    accent: '#0F238C',
    to: '/asml',
    logo: 'asml',
    stats: [
      { label: '2024 Revenue', value: '€28.3B' },
      { label: 'Projection through', value: '2029' },
    ],
    badge: '◆',
  },
  {
    ticker: 'TSM',
    name: 'TSMC',
    description: 'HPC · Smartphone · IoT · Automotive · Advanced Nodes.',
    accent: '#E60012',
    to: '/tsmc',
    logo: 'tsmc',
    stats: [
      { label: '2024 Revenue', value: '$90.1B' },
      { label: 'Projection through', value: '2029' },
    ],
    badge: '◆',
  },
  {
    ticker: 'HOOD',
    name: 'Robinhood',
    description: 'Transaction Revenue · Net Interest · Robinhood Gold.',
    accent: '#CCFF00',
    to: '/robinhood',
    logo: 'robinhood',
    stats: [
      { label: '2024 Revenue', value: '$2.95B' },
      { label: 'Projection through', value: '2029' },
    ],
    badge: '◆',
  },
];

function TeslaLogo() {
  return (
    <svg viewBox="0 0 254.584 253.502" width="34" height="34" aria-label="Tesla logo" role="img">
      <g transform="translate(-45.84,-64.297)">
        <path d="M 173.146,317.299 208.622,117.78 c 33.815,0 44.481,3.708 46.021,18.843 0,0 22.684,-8.458 34.125,-25.636 C 244.122,90.299 199.263,89.366 199.263,89.366 l -26.176,31.882 0.059,-0.004 -26.176,-31.883 c 0,0 -44.86,0.934 -89.5,21.622 11.431,17.178 34.124,25.636 34.124,25.636 1.549,-15.136 12.202,-18.844 45.79,-18.868 l 35.762,199.548" fill="#e82127"/>
        <path d="m 173.132,80.157 c 36.09,-0.276 77.399,5.583 119.687,24.014 5.652,-10.173 7.105,-14.669 7.105,-14.669 C 253.697,71.213 210.406,64.954 173.127,64.797 135.85,64.954 92.561,71.214 46.34,89.502 c 0,0 2.062,5.538 7.1,14.669 42.28,-18.431 83.596,-24.29 119.687,-24.014 h 0.005" fill="#e82127"/>
      </g>
    </svg>
  );
}

function SpaceXLogo() {
  return (
    <svg viewBox="0 0 331.644 40.825" width="150" height="19" aria-label="SpaceX logo" role="img">
      <g>
        <path fill="#f0eff8" d="M77.292,15.094H49.249l-1.039,0.777v24.947h7.763v-9.355l0.741-0.664h20.579c5.196,0,7.632-1.398,7.632-4.985v-5.728C84.924,16.493,82.489,15.094,77.292,15.094 M77.292,24.317c0,1.69-1.118,2.041-3.554,2.041H56.799l-0.827-0.804V20.21l0.741-0.678h17.025c2.436,0,3.554,0.347,3.554,2.045V24.317z"/>
        <polyline fill="#f0eff8" points="99.081,19.813 105.761,29.6 105.391,30.548 90.618,30.548 86.847,35.187 108.837,35.187 110.361,36.115 113.775,40.824 122.659,40.824 103.186,14.775"/>
        <polyline fill="#f0eff8" points="187.418,35.757 187.418,28.833 188.217,28.143 203.079,28.143 203.079,23.734 179.524,23.734 179.524,40.823 214.27,40.823 214.27,36.435 188.252,36.435"/>
        <rect x="179.524" y="15.094" fill="#f0eff8" width="35.113" height="4.848"/>
        <path fill="#f0eff8" d="M140.361,19.685h28.288c-0.436-3.597-2.668-4.595-8.33-4.595H140.06c-6.389,0-8.427,1.247-8.427,6.082v13.565c0,4.84,2.038,6.087,8.427,6.087h20.259c5.745,0,7.945-1.079,8.095-4.81h-28.053l-0.832-0.783V20.209"/>
        <path fill="#f0eff8" d="M29.333,25.118H8.754l-0.606-0.667v-4.402l0.603-0.466h27.742l0.379-0.927c-0.945-2.431-3.392-3.565-7.936-3.565H9.665c-6.385,0-8.426,1.247-8.426,6.082v2.844c0,4.841,2.041,6.086,8.426,6.086h20.533l0.645,0.566v4.602l-0.526,0.718H6.83v-0.022H0.678c0,0-0.704,0.353-0.677,0.518c0.525,3.382,2.829,4.34,8.345,4.34h20.987c6.384,0,8.486-1.247,8.486-6.087v-3.543C37.819,26.363,35.717,25.118,29.333,25.118"/>
        <path fill="#f0eff8" d="M236.725,14.988h-11.551l-0.627,1.193l12.828,9.351c2.43-1.407,5.074-2.833,7.95-4.24"/>
        <path fill="#f0eff8" d="M247.075,32.603l11.275,8.222h11.692l0.484-1.089L253.69,27.413C251.454,29.054,249.245,30.787,247.075,32.603"/>
        <path fill="#a7a9ac" d="M235.006,40.806h-10.451l-0.883-1.383C230.778,32.562,262.56,3.151,331.644,0C331.644,0,273.658,1.956,235.006,40.806"/>
      </g>
    </svg>
  );
}

function UniswapLogo() {
  return (
    <svg viewBox="0 0 188 42" width="132" height="30" aria-label="Uniswap logo" role="img">
      <defs>
        <linearGradient id="uniswapLogoGradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ff007a" />
          <stop offset="100%" stopColor="#fc72ff" />
        </linearGradient>
      </defs>
      <circle cx="21" cy="21" r="19" fill="url(#uniswapLogoGradient)" />
      <path
        d="M13 13c4.9 1.1 7.3 4.1 7.3 9.1v5.3c0 2.2 1.2 3.6 3.5 3.6s3.6-1.4 3.6-3.6V13h5.8v14.3c0 5.5-3.6 8.9-9.4 8.9-5.7 0-9.3-3.4-9.3-8.9v-4.9c0-2.8-1.2-4.4-3.8-5.3L13 13z"
        fill="#fff"
      />
      <text x="52" y="28" fill="#f0eff8" fontFamily="Inter, Arial, sans-serif" fontSize="24" fontWeight="800">
        Uniswap
      </text>
    </svg>
  );
}

function LillyLogo() {
  return (
    <img
      src={`${import.meta.env.BASE_URL}lilly-logo.svg`}
      alt="Lilly"
      style={{
        display: 'block',
        width: 74,
        height: 42,
        objectFit: 'contain',
      }}
    />
  );
}

function CompanyLogo({ logo }) {
  if (logo === 'tesla') return <TeslaLogo />;
  if (logo === 'spacex') return <SpaceXLogo />;
  if (logo === 'uniswap') return <UniswapLogo />;
  if (logo === 'lilly') return <LillyLogo />;
  if (logo === 'nvidia') return <NvidiaLogoMark width={110} fill="#76b900" />;
  if (logo === 'amd') return <AmdLogoMark width={100} fill="#ED1C24" />;
  if (logo === 'apple') return <AppleLogoMark width={32} fill="#0071e3" />;
  if (logo === 'microsoft') return <MicrosoftLogoMark size={36} />;
  if (logo === 'google') return <GoogleLogoMark width={100} />;
  if (logo === 'amazon') return <AmazonLogoMark width={90} />;
  if (logo === 'asml') return <AsmlLogoMark width={90} fill="#0F238C" />;
  if (logo === 'tsmc') return <TsmcLogoMark width={90} fill="#E60012" />;
  if (logo === 'robinhood') return <RobinhoodLogoMark width={120} />;
  return null;
}

function CompanyCard({ ticker, name, description, accent, to, stats, badge, logo }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: 'none',
        display: 'flex',
        height: 260,
      }}
    >
      <div
        style={{
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          cursor: 'pointer',
          transition: 'border-color 0.2s, transform 0.15s',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          height: '100%',
          width: '100%',
          boxSizing: 'border-box',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = accent;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* Top accent bar */}
        <span style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 2,
          background: accent,
          borderRadius: '16px 16px 0 0',
        }} />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          minHeight: 38,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontFamily: 'var(--mono)',
            color: accent,
            border: `1px solid ${accent}40`,
            borderRadius: 100,
            padding: '3px 10px',
            alignSelf: 'flex-start',
            letterSpacing: '0.06em',
          }}>
            {badge} {ticker}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            color: accent,
            flexShrink: 0,
            maxWidth: 160,
          }}>
            <CompanyLogo logo={logo} />
          </div>
        </div>

        {/* Company name */}
        <div>
          <div style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
            marginBottom: 6,
          }}>
            {name}
          </div>
          <div style={{
            fontSize: 13,
            color: 'var(--text3)',
            fontFamily: 'var(--mono)',
            lineHeight: 1.5,
          }}>
            {description}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 24, marginTop: 'auto' }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--mono)' }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          fontSize: 12, fontFamily: 'var(--mono)',
          color: accent,
          letterSpacing: '0.04em',
        }}>
          Open model →
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <>
      <PageMeta {...PAGE_META.home} />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{
          borderBottom: '1px solid var(--border)',
          padding: '2.5rem 2.5rem 2rem',
          background: 'linear-gradient(180deg, rgba(232,255,71,0.03) 0%, transparent 100%)',
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <GreauxLogo size={52} />
              <div style={{
                fontSize: 'clamp(36px, 6vw, 56px)',
                fontWeight: 800,
                color: 'var(--text)',
                letterSpacing: '-0.04em',
                lineHeight: 1,
              }}>
                greaux
              </div>
            </div>
            <p style={{
              fontSize: 15,
              color: 'var(--text3)',
              fontFamily: 'var(--mono)',
              maxWidth: 480,
            }}>
              Interactive company and protocol projection models — adjust assumptions, see outcomes.
            </p>
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem 2.5rem', maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <div style={{
            fontSize: 11,
            fontFamily: 'var(--mono)',
            color: 'var(--text3)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '1.25rem',
          }}>
            Models
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
            alignItems: 'stretch',
          }}>
            {companies.map(c => (
              <CompanyCard key={c.ticker} {...c} />
            ))}
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
          Not financial advice · Projections are illustrative
        </footer>
      </div>
    </>
  );
}
