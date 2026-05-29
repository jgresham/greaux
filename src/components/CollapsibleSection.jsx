import { useState } from 'react';

export default function CollapsibleSection({
  title,
  eyebrow,
  description,
  accent = 'var(--accent)',
  defaultOpen = false,
  children,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section style={{ marginBottom: '1.75rem' }}>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(open => !open)}
        style={{
          width: '100%',
          background: 'var(--bg2)',
          border: `1px solid ${isOpen ? accent : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          color: 'var(--text)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          textAlign: 'left',
          transition: 'border-color 0.2s, background 0.2s',
        }}
      >
        <span style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
          {eyebrow && (
            <span style={{
              fontSize: 11,
              fontFamily: 'var(--mono)',
              color: accent,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              {eyebrow}
            </span>
          )}
          <span style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--text)',
            lineHeight: 1.2,
          }}>
            {title}
          </span>
          {description && (
            <span style={{
              fontSize: 12,
              fontFamily: 'var(--mono)',
              color: 'var(--text3)',
              lineHeight: 1.5,
            }}>
              {description}
            </span>
          )}
        </span>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
          color: isOpen ? accent : 'var(--text3)',
          fontSize: 12,
          fontFamily: 'var(--mono)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {isOpen ? 'Hide inputs' : 'Show inputs'}
          <span style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            border: `1px solid ${isOpen ? accent : 'var(--border2)'}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            lineHeight: 1,
          }}>
            {isOpen ? '-' : '+'}
          </span>
        </span>
      </button>

      {isOpen && (
        <div style={{ marginTop: 14 }}>
          {children}
        </div>
      )}
    </section>
  );
}
