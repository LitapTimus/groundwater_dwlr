export const STATIONS = [
  {
    id: 'S001',
    name: 'Sector 18 Reservoir',
    lat: 28.5700,
    lng: 77.3000,
    level: 12.5,
    status: 'Safe',
    rechargeRate: 150,
    trend: 'Stable',
    history: [
      { date: '2025-01', level: 12.2 },
      { date: '2025-02', level: 12.3 },
      { date: '2025-03', level: 12.4 },
      { date: '2025-04', level: 12.5 },
    ],
    forecast: 12.6
  },
  {
    id: 'S002',
    name: 'Industrial Area Phase 2',
    lat: 28.5500,
    lng: 77.3400,
    level: 28.4,
    status: 'Critical',
    rechargeRate: 80,
    trend: 'Declining',
    history: [
      { date: '2025-01', level: 27.5 },
      { date: '2025-02', level: 27.8 },
      { date: '2025-03', level: 28.1 },
      { date: '2025-04', level: 28.4 },
    ],
    forecast: 29.0
  },
  {
    id: 'S003',
    name: 'Green Valley Park',
    lat: 28.5900,
    lng: 77.3200,
    level: 8.2,
    status: 'Safe',
    rechargeRate: 220,
    trend: 'Improving',
    history: [
      { date: '2025-01', level: 8.5 },
      { date: '2025-02', level: 8.4 },
      { date: '2025-03', level: 8.3 },
      { date: '2025-04', level: 8.2 },
    ],
    forecast: 8.0
  },
  {
    id: 'S004',
    name: 'Market Sector 44',
    lat: 28.5600,
    lng: 77.3600,
    level: 18.9,
    status: 'Semi-Critical',
    rechargeRate: 110,
    trend: 'Stable',
    history: [
      { date: '2025-01', level: 18.8 },
      { date: '2025-02', level: 18.8 },
      { date: '2025-03', level: 18.9 },
      { date: '2025-04', level: 18.9 },
    ],
    forecast: 19.1
  },
  {
    id: 'S005',
    name: 'Tech Zone IV',
    lat: 28.6100,
    lng: 77.3700,
    level: 32.1,
    status: 'Critical',
    rechargeRate: 45,
    trend: 'Rapid Decline',
    history: [
      { date: '2025-01', level: 30.2 },
      { date: '2025-02', level: 30.8 },
      { date: '2025-03', level: 31.5 },
      { date: '2025-04', level: 32.1 },
    ],
    forecast: 33.5
  }
];

export const ALERTS = [
  { id: 1, type: 'critical', message: 'S005 - Tech Zone IV water level dropped by 2m in last 3 months.', date: '2025-04-15' },
  { id: 2, type: 'warning', message: 'S004 - Market Sector 44 approaching critical zone.', date: '2025-04-14' },
  { id: 3, type: 'info', message: 'Recharge simulation complete for Zone A.', date: '2025-04-12' },
];

export const DEMAND_DATA = [
  { year: 2020, supply: 500, demand: 450 },
  { year: 2021, supply: 490, demand: 470 },
  { year: 2022, supply: 480, demand: 490 },
  { year: 2023, supply: 470, demand: 520 },
  { year: 2024, supply: 460, demand: 550 },
  { year: 2025, supply: 450, demand: 580 },
];
