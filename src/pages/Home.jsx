import { Link } from 'react-router-dom';

const companies = [
  {
    ticker: 'TSLA',
    name: 'Tesla, Inc.',
    description: 'Automotive · Energy · Robotaxi platform revenue model with interactive segment projections.',
    accent: '#e8ff47',
    to: '/tesla',
    stats: [
      { label: '2024 Revenue', value: '$97.7B' },
      { label: 'Projection through', value: '2029' },
    ],
    badge: '◆',
  },
];

function CompanyCard({ ticker, name, description, accent, to, stats, badge }) {
  return (
    <Link
      to={to}
      style={{ textDecoration: 'none' }}
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

        {/* Ticker badge */}
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '2.5rem 2.5rem 2rem',
        background: 'linear-gradient(180deg, rgba(232,255,71,0.03) 0%, transparent 100%)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: 800,
            color: 'var(--text)',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            marginBottom: 14,
          }}>
            greaux
          </div>
          <p style={{
            fontSize: 15,
            color: 'var(--text3)',
            fontFamily: 'var(--mono)',
            maxWidth: 480,
          }}>
            Interactive equity projection models — adjust assumptions, see outcomes.
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
          alignItems: 'start',
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
  );
}
