export default function GreauxLogo({ size = 40 }) {
  const h = size;
  const w = size * (31 / 32); // maintain bar-chart proportions
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 31 32"
      width={w}
      height={h}
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <rect x="0"  y="22" width="6" height="9"  rx="1.5" fill="#e8ff47" fillOpacity="0.4"/>
      <rect x="8"  y="16" width="6" height="15" rx="1.5" fill="#e8ff47" fillOpacity="0.6"/>
      <rect x="16" y="8"  width="6" height="23" rx="1.5" fill="#e8ff47" fillOpacity="0.82"/>
      <rect x="24" y="0"  width="7" height="31" rx="1.5" fill="#e8ff47"/>
      <polyline
        points="3,22 11,16 19,8 27.5,0"
        stroke="#e8ff47"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.45"
      />
    </svg>
  );
}
