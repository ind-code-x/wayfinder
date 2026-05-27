import { RouteOption, TransportMode } from '../types';

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function seededRand(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  const r = x - Math.floor(x);
  return Math.floor(r * (max - min + 1)) + min;
}

const OPERATORS: Record<TransportMode, string[]> = {
  fly: ['IndiGo', 'Air India', 'Akasa Air', 'SpiceJet', 'Vistara'],
  train: ['Indian Railways', 'IRCTC', 'Vande Bharat', 'Rajdhani Express', 'Shatabdi Express'],
  bus: ['redBus', 'APSRTC', 'KSRTC', 'MSRTC', 'IntrCity SmartBus', 'State transport operators'],
  drive: ['Self drive', 'Rental car partners', 'Cab operators'],
  ferry: ['Local ferry operators', 'Inland water transport'],
};

const FREQUENCIES: Record<TransportMode, string[]> = {
  fly: ['Multiple daily flights', 'Hourly flights', '2-3 flights per day', 'Daily flights'],
  train: ['Check IRCTC schedules', 'Several daily', 'Daily', 'Multiple weekly'],
  bus: ['Every 2 hours', 'Several daily', 'Daily', 'Multiple daily'],
  drive: ['Anytime'],
  ferry: ['Daily', 'Several weekly', '2-3 times daily'],
};

export function generateRoutes(from: string, to: string): RouteOption[] {
  const seed = hash(from.toLowerCase() + to.toLowerCase());
  const dist = seededRand(seed, 200, 9000);
  const domesticIndia = from.toLowerCase().includes('india') && to.toLowerCase().includes('india');
  const isLongHaul = dist > 3000;
  const isMedium = dist > 800 && dist <= 3000;

  const modes: TransportMode[] = domesticIndia
    ? ['fly', 'train', 'bus', 'drive']
    : isLongHaul
    ? ['fly', 'bus']
    : isMedium
    ? ['fly', 'train', 'bus', 'drive']
    : ['drive', 'train', 'bus', 'fly'];

  if (seededRand(seed + 99, 0, 1) === 1 && !isLongHaul && !domesticIndia) {
    modes.push('ferry');
  }

  const uniqueModes = [...new Set(modes)];

  return uniqueModes.map((mode, i) => {
    const s = seed + i * 37;
    const baseMins = mode === 'fly'
      ? Math.round((dist / 800) * 60) + seededRand(s, 30, 90)
      : mode === 'train'
      ? Math.round((dist / 120) * 60)
      : mode === 'bus'
      ? Math.round((dist / 80) * 60)
      : mode === 'drive'
      ? Math.round((dist / 100) * 60)
      : Math.round((dist / 30) * 60);

    const hours = Math.floor(baseMins / 60);
    const mins = baseMins % 60;
    const duration = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;

    const basePrice = mode === 'fly'
      ? seededRand(s + 1, 2500, 45000)
      : mode === 'train'
      ? seededRand(s + 1, 180, 4500)
      : mode === 'bus'
      ? seededRand(s + 1, 250, 3500)
      : mode === 'drive'
      ? seededRand(s + 1, 500, 12000)
      : seededRand(s + 1, 300, 4500);

    const stops = mode === 'fly' ? seededRand(s + 2, 0, 1) : 0;
    const opPool = OPERATORS[mode];
    const op1 = opPool[seededRand(s + 3, 0, opPool.length - 1)];
    const op2 = opPool[seededRand(s + 4, 0, opPool.length - 1)];
    const operators = op1 === op2 ? [op1] : [op1, op2];
    const freqPool = FREQUENCIES[mode];
    const frequency = freqPool[seededRand(s + 5, 0, freqPool.length - 1)];

    const highlights: string[] = [];
    if (mode === 'fly' && stops === 0) highlights.push('Direct flight');
    if (mode === 'fly' && stops > 0) highlights.push(`${stops} stop`);
    if (mode === 'train') highlights.push('City center to city center');
    if (mode === 'bus') highlights.push('Budget-friendly');
    if (mode === 'drive') highlights.push('Most flexible');
    if (mode === 'ferry') highlights.push('Scenic sea crossing');
    highlights.push(`~${dist} km`);

    return {
      id: `${mode}-${i}`,
      mode,
      duration,
      durationMinutes: baseMins,
      priceFrom: basePrice,
      priceTo: basePrice + seededRand(s + 6, 250, 6000),
      currency: 'INR',
      stops,
      operators,
      distance: `${dist} km`,
      frequency,
      highlights,
    };
  }).sort((a, b) => {
    const order: Record<TransportMode, number> = { fly: 0, train: 1, bus: 2, drive: 3, ferry: 4 };
    return order[a.mode] - order[b.mode];
  });
}

export function getBestRoute(routes: RouteOption[]): RouteOption | undefined {
  return routes.reduce((best, r) =>
    !best || r.durationMinutes < best.durationMinutes ? r : best
  , undefined as RouteOption | undefined);
}
