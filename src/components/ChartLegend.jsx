import { SEGMENT_COLORS, SEGMENT_LABELS } from '../data';

export default function ChartLegend() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
      {Object.entries(SEGMENT_LABELS).map(([key, label]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{
            width: 10, height: 10,
            borderRadius: 2,
            background: SEGMENT_COLORS[key],
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 13, color: 'var(--text2)', fontFamily: 'var(--font)' }}>
            {label}
          </span>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{
          width: 10, height: 10,
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
