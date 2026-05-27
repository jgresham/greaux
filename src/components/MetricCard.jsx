import Tooltip from './Tooltip';

export default function MetricCard({ label, value, sub, tooltip, accent }) {
  return (
    <div style={{
      background: 'var(--bg3)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {accent && (
        <span style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 2,
          background: accent,
          borderRadius: '16px 16px 0 0',
        }} />
      )}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11,
        fontFamily: 'var(--mono)',
        color: 'var(--text3)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </div>
      <div style={{
        fontSize: 28,
        fontWeight: 700,
        color: accent || 'var(--text)',
        lineHeight: 1.1,
        fontFamily: 'var(--font)',
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
          {sub}
        </div>
      )}
    </div>
  );
}
