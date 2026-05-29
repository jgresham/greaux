export default function InsightCard({ title, subtitle, children }) {
  return (
    <section style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
          {title}
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)', lineHeight: 1.5 }}>
          {subtitle}
        </p>
      </div>
      {children}
    </section>
  );
}
