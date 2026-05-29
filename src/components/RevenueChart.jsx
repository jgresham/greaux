import { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { YEARS, HIST_COUNT, SEGMENT_COLORS, SEGMENT_LABELS } from '../data';

Chart.register(...registerables);

function makeDatasets(full, color, label, histCount) {
  const histData = full.map((v, i) => i < histCount ? v : null);
  const projData = full.map((v, i) => i >= histCount ? v : null);
  return [
    {
      label,
      data: histData,
      backgroundColor: color,
      stack: 'stack',
      borderRadius: { topLeft: 3, topRight: 3 },
      borderSkipped: false,
    },
    {
      label: '__proj__' + label,
      data: projData,
      backgroundColor: color + '55',
      borderColor: color,
      borderWidth: 1.5,
      stack: 'stack',
      borderRadius: { topLeft: 3, topRight: 3 },
      borderSkipped: false,
      borderDash: [4, 3],
    },
  ];
}

export default function RevenueChart({ projections }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const { autoFull, energyFull, svcFull, roboFull, optimusFull } = projections;
    const labels = YEARS.map(y => y >= 2025 ? `${y}*` : String(y));

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          ...makeDatasets(autoFull,   SEGMENT_COLORS.auto,   SEGMENT_LABELS.auto,   HIST_COUNT),
          ...makeDatasets(energyFull, SEGMENT_COLORS.energy, SEGMENT_LABELS.energy, HIST_COUNT),
          ...makeDatasets(svcFull,    SEGMENT_COLORS.svc,    SEGMENT_LABELS.svc,    HIST_COUNT),
          ...makeDatasets(roboFull,   SEGMENT_COLORS.robo,   SEGMENT_LABELS.robo,   HIST_COUNT),
          ...makeDatasets(optimusFull, SEGMENT_COLORS.optimus, SEGMENT_LABELS.optimus, HIST_COUNT),
        ],
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
              label(ctx) {
                if (ctx.dataset.label.startsWith('__proj__')) return null;
                const v = ctx.raw;
                if (v === null || v === 0) return null;
                return `${ctx.dataset.label}: $${v.toFixed(1)}B`;
              },
              title(items) {
                const yr = YEARS[items[0].dataIndex];
                return yr >= 2025 ? `${yr} (projected)` : String(yr);
              },
            },
            filter: item => !item.dataset.label.startsWith('__proj__'),
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: '#5a5a72',
              font: { family: "'DM Mono', monospace", size: 12 },
              autoSkip: false,
            },
          },
          y: {
            stacked: true,
            grid: { color: 'rgba(255,255,255,0.05)' },
            border: { display: false },
            ticks: {
              color: '#5a5a72',
              font: { family: "'DM Mono', monospace", size: 12 },
              callback: v => `$${v}B`,
            },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [projections]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 360 }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Stacked bar chart of Tesla annual revenue by segment 2020 to 2029, with 2025-2029 projected"
      >
        Tesla revenue by segment, 2020–2029. Historical 2020–2024; projected 2025–2029.
      </canvas>
    </div>
  );
}
