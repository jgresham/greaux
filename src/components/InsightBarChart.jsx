import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const fmt = (value, decimals = 0) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

export default function InsightBarChart({
  labels,
  datasets,
  ariaLabel,
  height = 260,
  stacked = false,
  unit = '',
  decimals = 0,
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const shouldSkipXTicks = labels.length > 8;

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: datasets.map(dataset => ({
          borderRadius: 3,
          borderSkipped: false,
          stack: stacked ? 'stack' : undefined,
          ...dataset,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400, easing: 'easeInOutQuart' },
        plugins: {
          legend: {
            display: datasets.length > 1,
            labels: {
              color: '#9898b0',
              boxWidth: 10,
              boxHeight: 10,
              padding: 14,
              font: { family: "'DM Mono', monospace", size: 11 },
            },
          },
          tooltip: {
            backgroundColor: '#1e1e28',
            borderColor: 'rgba(255,255,255,0.12)',
            borderWidth: 1,
            titleColor: '#f0eff8',
            bodyColor: '#9898b0',
            padding: 12,
            callbacks: {
              label(ctx) {
                return `${ctx.dataset.label}: ${fmt(ctx.raw, decimals)}${unit}`;
              },
            },
          },
        },
        scales: {
          x: {
            stacked,
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: '#5a5a72',
              font: { family: "'DM Mono', monospace", size: 12 },
              autoSkip: shouldSkipXTicks,
              maxTicksLimit: shouldSkipXTicks ? 6 : undefined,
              maxRotation: 0,
            },
          },
          y: {
            stacked,
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.05)' },
            border: { display: false },
            ticks: {
              color: '#5a5a72',
              font: { family: "'DM Mono', monospace", size: 12 },
              callback: value => `${fmt(value, decimals)}${unit}`,
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [ariaLabel, datasets, decimals, height, labels, shouldSkipXTicks, stacked, unit]);

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <canvas ref={canvasRef} role="img" aria-label={ariaLabel}>
        {ariaLabel}
      </canvas>
    </div>
  );
}
