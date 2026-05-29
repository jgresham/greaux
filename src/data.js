export const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029];
export const HIST_COUNT = 5;

export const HISTORICAL = {
  auto:   [25.6, 44.1, 67.2, 78.5, 77.1],
  energy: [1.99, 2.79, 3.91, 6.00, 10.1],
  svc:    [2.31, 3.80, 6.09, 8.32, 10.1],
};

export const OPERATING_METRICS = {
  years: [2020, 2021, 2022, 2023, 2024, 2025],
  model3YDeliveriesM: [0.443, 0.911, 1.247, 1.740, 1.704, 1.585],
  otherDeliveriesM: [0.057, 0.025, 0.067, 0.069, 0.085, 0.051],
  storageDeploymentsGWh: [3.0, 4.0, 6.5, 14.7, 31.4, 46.7],
};

export const SEGMENT_COLORS = {
  auto:   '#4da3ff',
  energy: '#3ddea0',
  svc:    '#ffb347',
  robo:   '#ff6b9d',
  optimus: '#a78bfa',
};

export const SEGMENT_LABELS = {
  auto:   'Automotive',
  energy: 'Energy & Storage',
  svc:    'Services & Other',
  robo:   'Robotaxi',
  optimus: 'Optimus',
};

export function projectCAGR(lastValue, cagr, n) {
  return Array.from({ length: n }, (_, i) =>
    parseFloat((lastValue * Math.pow(1 + cagr / 100, i + 1)).toFixed(2))
  );
}

export function calcRobotaxi(rides2027, rides2028, rides2029, revenuePerRide) {
  return [
    0, 0,
    parseFloat((rides2027 * revenuePerRide / 1e9).toFixed(2)),
    parseFloat((rides2028 * revenuePerRide / 1e9).toFixed(2)),
    parseFloat((rides2029 * revenuePerRide / 1e9).toFixed(2)),
  ];
}

export function calcOptimus(units2027, units2028, units2029, averagePrice) {
  return [
    0, 0,
    parseFloat((units2027 * averagePrice / 1e9).toFixed(2)),
    parseFloat((units2028 * averagePrice / 1e9).toFixed(2)),
    parseFloat((units2029 * averagePrice / 1e9).toFixed(2)),
  ];
}

export function buildProjections({
  autoCAGR, energyCAGR, svcCAGR,
  rides2027, rides2028, rides2029, revenuePerRide,
  optimusSold2027, optimusSold2028, optimusSold2029, optimusASP,
  autoMargin, energyMargin, svcMargin, roboMargin, optimusMargin,
  sharesB, valuationMethod, psRatio, peRatio,
}) {
  const auto   = projectCAGR(HISTORICAL.auto[4],   autoCAGR,   5);
  const energy = projectCAGR(HISTORICAL.energy[4], energyCAGR, 5);
  const svc    = projectCAGR(HISTORICAL.svc[4],    svcCAGR,    5);
  const robo   = calcRobotaxi(rides2027, rides2028, rides2029, revenuePerRide);
  const optimus = calcOptimus(optimusSold2027, optimusSold2028, optimusSold2029, optimusASP);

  const autoFull   = [...HISTORICAL.auto,   ...auto];
  const energyFull = [...HISTORICAL.energy, ...energy];
  const svcFull    = [...HISTORICAL.svc,    ...svc];
  const roboFull   = [0, 0, 0, 0, 0, ...robo];
  const optimusFull = [0, 0, 0, 0, 0, ...optimus];

  const total2024 = HISTORICAL.auto[4] + HISTORICAL.energy[4] + HISTORICAL.svc[4];
  const total2029 = autoFull[9] + energyFull[9] + svcFull[9] + roboFull[9] + optimusFull[9];
  const cagr5y    = (Math.pow(total2029 / total2024, 1 / 5) - 1) * 100;

  // Earnings by segment (margin × revenue)
  const autoEarnings   = autoFull.map(v => parseFloat((v * autoMargin / 100).toFixed(2)));
  const energyEarnings = energyFull.map(v => parseFloat((v * energyMargin / 100).toFixed(2)));
  const svcEarnings    = svcFull.map(v => parseFloat((v * svcMargin / 100).toFixed(2)));
  const roboEarnings   = roboFull.map(v => parseFloat((v * roboMargin / 100).toFixed(2)));
  const optimusEarnings = optimusFull.map(v => parseFloat((v * optimusMargin / 100).toFixed(2)));

  const earnings2029 = autoEarnings[9] + energyEarnings[9] + svcEarnings[9] + roboEarnings[9] + optimusEarnings[9];

  // Valuation → market cap in $B
  const marketCapB = valuationMethod === 'ps'
    ? total2029 * psRatio
    : earnings2029 * peRatio;

  // Share price = market cap ($B) / shares ($B shares) → $/share
  const sharePrice2029 = sharesB > 0 ? marketCapB / sharesB : 0;
  const impliedPS = total2029 > 0 ? marketCapB / total2029 : null;
  const impliedPE = earnings2029 > 0 ? marketCapB / earnings2029 : null;

  return {
    autoFull, energyFull, svcFull, roboFull, optimusFull,
    total2024, total2029, cagr5y,
    autoEarnings, energyEarnings, svcEarnings, roboEarnings, optimusEarnings,
    earnings2029, marketCapB, sharePrice2029, impliedPS, impliedPE,
  };
}

export const DEFAULTS = {
  autoCAGR: 12,
  energyCAGR: 30,
  svcCAGR: 18,
  rides2027: 50_000_000,
  rides2028: 200_000_000,
  rides2029: 600_000_000,
  revenuePerRide: 2.50,
  optimusSold2027: 50_000,
  optimusSold2028: 200_000,
  optimusSold2029: 500_000,
  optimusASP: 25_000,
  // segment net margins
  autoMargin: 10,
  energyMargin: 15,
  svcMargin: 12,
  roboMargin: 65,
  optimusMargin: 20,
  // valuation
  sharesB: 3.2,
  valuationMethod: 'ps',
  psRatio: 8,
  peRatio: 80,
};

export const TOOLTIPS = {
  cagr: 'Compound Annual Growth Rate — the steady annual rate that gets you from a starting value to an ending value over multiple years, smoothed out.',
  robotaxiRides: 'Estimated number of paid Robotaxi rides in that year. Tesla earns a revenue cut from each fare on its autonomous platform.',
  revenuePerRide: "Tesla's estimated net revenue per Robotaxi ride — the platform's take from each fare. Analyst estimates range from $1–$4.",
  optimusRobots: 'Estimated Optimus humanoid robots sold in that year. Defaults assume public sales begin in 2027 and ramp below Tesla’s stated first-line capacity.',
  optimusASP: 'Average selling price per Optimus robot. Default sits near the midpoint of Elon Musk’s roughly $20k–$30k long-term target range.',
  total2029: 'Sum of all segments at the end of the 5-year projection window, based on your assumptions.',
  margin: 'Net profit margin — the percentage of revenue that becomes net income after all costs and taxes.',
  psRatio: 'Price-to-Sales ratio — market cap divided by annual revenue. Higher implies the market expects stronger future growth.',
  peRatio: 'Price-to-Earnings ratio — market cap divided by annual net income. Classic valuation multiple.',
  sharesB: 'Total diluted shares outstanding in billions. Tesla currently has ~3.2B diluted shares.',
  sharePrice: '2029 projected share price derived from your valuation multiple applied to that year\'s revenue or earnings, divided by shares outstanding.',
};
