// Shared §9 data: honesty ratings (0–4) by cycle, candidate, and voter trust band.
// Source: plain-language.md §9 footnote [1]. Variables documented there.

export const CYCLES = [
  {
    key: '2016',
    year: 2016,
    role: 'Trump challenger',
    crossover: true,
    dem: { name: 'Clinton', color: '#2c5b9c', low: 0.54, high: 1.77 },
    rep: { name: 'Trump',   color: '#b8240f', low: 1.58, high: 0.93 },
  },
  {
    key: '2020',
    year: 2020,
    role: 'Trump incumbent',
    crossover: false,
    dem: { name: 'Biden',   color: '#2c5b9c', low: 1.43, high: 1.66 },
    rep: { name: 'Trump',   color: '#b8240f', low: 0.96, high: 1.36 },
  },
  {
    key: '2024',
    year: 2024,
    role: 'Trump challenger',
    crossover: true,
    dem: { name: 'Harris',  color: '#2c5b9c', low: 0.98, high: 2.37 },
    rep: { name: 'Trump',   color: '#b8240f', low: 1.39, high: 0.81 },
  },
]
