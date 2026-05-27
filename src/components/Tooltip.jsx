import { useState, useRef, useEffect } from 'react';

export default function Tooltip({ text }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="More information"
        style={{
          width: 18, height: 18,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.05)',
          color: 'var(--text2)',
          fontSize: 11,
          fontFamily: 'var(--mono)',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          lineHeight: 1,
          transition: 'border-color 0.2s, color 0.2s',
        }}
      >?</button>
      {open && (
        <span style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 220,
          background: 'var(--bg3)',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--radius)',
          padding: '10px 12px',
          fontSize: 12,
          lineHeight: 1.6,
          color: 'var(--text2)',
          zIndex: 100,
          pointerEvents: 'none',
          whiteSpace: 'normal',
        }}>
          <span style={{
            position: 'absolute',
            bottom: -5,
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: 8, height: 8,
            background: 'var(--bg3)',
            borderRight: '1px solid var(--border2)',
            borderBottom: '1px solid var(--border2)',
          }} />
          {text}
        </span>
      )}
    </span>
  );
}
