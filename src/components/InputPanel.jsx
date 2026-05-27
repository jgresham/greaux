import Tooltip from './Tooltip';
import { TOOLTIPS } from '../data';

function SliderField({ label, id, value, min, max, step = 1, unit = '%', tooltip, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
          color: 'var(--accent)',
          minWidth: 48,
          textAlign: 'right',
        }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        id={id}
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
      <div style={{
        display: 'flex', justifyContent: 'space-between',
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

function NumberField({ label, value, step, tooltip, suffix, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 13, color: 'var(--text2)',
        marginBottom: 6,
      }}>
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="number"
          value={value}
          step={step}
          onChange={e => onChange(Number(e.target.value))}
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

function SectionCard({ icon, title, children }) {
  return (
    <div style={{
      background: 'var(--bg3)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 18,
        fontSize: 12,
        fontFamily: 'var(--mono)',
        color: 'var(--text3)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}

function MethodToggle({ value, onChange }) {
  const btn = (method, label) => (
    <button
      onClick={() => onChange(method)}
      style={{
        flex: 1,
        padding: '6px 0',
        fontSize: 12,
        fontFamily: 'var(--mono)',
        fontWeight: 500,
        border: '1px solid var(--border2)',
        borderRadius: 'var(--radius)',
        cursor: 'pointer',
        transition: 'background 0.15s, color 0.15s, border-color 0.15s',
        background: value === method ? 'var(--accent)' : 'transparent',
        color: value === method ? '#0a0a12' : 'var(--text2)',
        borderColor: value === method ? 'var(--accent)' : 'var(--border2)',
      }}
    >
      {label}
    </button>
  );
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Based on</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {btn('ps', 'Price / Sales')}
        {btn('pe', 'Price / Earnings')}
      </div>
    </div>
  );
}

export default function InputPanel({ params, onChange }) {
  const set = key => val => onChange({ ...params, [key]: val });

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: 14,
    }}>
      <SectionCard icon="🚗" title="Automotive">
        <SliderField
          label="Annual growth rate"
          id="autoCAGR"
          value={params.autoCAGR}
          min={0} max={40}
          tooltip={TOOLTIPS.cagr}
          onChange={set('autoCAGR')}
        />
        <SliderField
          label="Net margin"
          id="autoMargin"
          value={params.autoMargin}
          min={0} max={40}
          tooltip={TOOLTIPS.margin}
          onChange={set('autoMargin')}
        />
      </SectionCard>

      <SectionCard icon="⚡" title="Energy & Storage">
        <SliderField
          label="Annual growth rate"
          id="energyCAGR"
          value={params.energyCAGR}
          min={0} max={80}
          tooltip={TOOLTIPS.cagr}
          onChange={set('energyCAGR')}
        />
        <SliderField
          label="Net margin"
          id="energyMargin"
          value={params.energyMargin}
          min={0} max={50}
          tooltip={TOOLTIPS.margin}
          onChange={set('energyMargin')}
        />
      </SectionCard>

      <SectionCard icon="🔧" title="Services & Other">
        <SliderField
          label="Annual growth rate"
          id="svcCAGR"
          value={params.svcCAGR}
          min={0} max={50}
          tooltip={TOOLTIPS.cagr}
          onChange={set('svcCAGR')}
        />
        <SliderField
          label="Net margin"
          id="svcMargin"
          value={params.svcMargin}
          min={0} max={40}
          tooltip={TOOLTIPS.margin}
          onChange={set('svcMargin')}
        />
      </SectionCard>

      <SectionCard icon="🤖" title="Robotaxi">
        <NumberField
          label="Rides in 2027"
          value={params.rides2027 / 1_000_000}
          step={1}
          suffix="M rides"
          tooltip={TOOLTIPS.robotaxiRides}
          onChange={val => set('rides2027')(val * 1_000_000)}
        />
        <NumberField
          label="Rides in 2028"
          value={params.rides2028 / 1_000_000}
          step={5}
          suffix="M rides"
          onChange={val => set('rides2028')(val * 1_000_000)}
        />
        <NumberField
          label="Rides in 2029"
          value={params.rides2029 / 1_000_000}
          step={10}
          suffix="M rides"
          onChange={val => set('rides2029')(val * 1_000_000)}
        />
        <NumberField
          label="Revenue per ride"
          value={params.revenuePerRide}
          step={0.25}
          suffix="USD / ride"
          tooltip={TOOLTIPS.revenuePerRide}
          onChange={set('revenuePerRide')}
        />
        <SliderField
          label="Net margin"
          id="roboMargin"
          value={params.roboMargin}
          min={0} max={90}
          tooltip={TOOLTIPS.margin}
          onChange={set('roboMargin')}
        />
      </SectionCard>

      <SectionCard icon="💰" title="Valuation">
        <MethodToggle value={params.valuationMethod} onChange={set('valuationMethod')} />
        {params.valuationMethod === 'ps' ? (
          <SliderField
            label="Price / Sales ratio"
            id="psRatio"
            value={params.psRatio}
            min={1} max={30} step={0.5}
            unit="×"
            tooltip={TOOLTIPS.psRatio}
            onChange={set('psRatio')}
          />
        ) : (
          <SliderField
            label="Price / Earnings ratio"
            id="peRatio"
            value={params.peRatio}
            min={10} max={300} step={5}
            unit="×"
            tooltip={TOOLTIPS.peRatio}
            onChange={set('peRatio')}
          />
        )}
        <NumberField
          label="Shares outstanding"
          value={params.sharesB}
          step={0.1}
          suffix="B shares"
          tooltip={TOOLTIPS.sharesB}
          onChange={set('sharesB')}
        />
      </SectionCard>
    </div>
  );
}
