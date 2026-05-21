import { RouteOption, TransportMode } from '../types';
import { generateRoutes } from './routeGenerator';

interface Place {
  name: string;
  country?: string;
  displayName: string;
  placeType?: string;
  lat: number;
  lon: number;
}

interface OsrmRoute {
  distance: number;
  duration: number;
  geometry?: {
    coordinates: [number, number][];
  };
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';
const PETROL_PRICE_INR_PER_LITRE = 105;
const SELF_DRIVE_MILEAGE_KM_PER_LITRE = 15;
const CAB_BASE_FARE_INR = 120;
const CAB_RATE_INR_PER_KM = 18;

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function haversineKm(from: Place, to: Place): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthKm = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lon - from.lon);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function daysUntilTravel(travelDate?: string): number {
  if (!travelDate) return 14;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(`${travelDate}T00:00:00`);
  return Math.max(0, Math.ceil((date.getTime() - today.getTime()) / 86_400_000));
}

function dateFareFactor(mode: TransportMode, travelDate?: string): number {
  const days = daysUntilTravel(travelDate);
  const date = travelDate ? new Date(`${travelDate}T00:00:00`) : new Date();
  const weekend = [0, 5, 6].includes(date.getDay());
  const month = date.getMonth();
  const peakSeason = [4, 5, 9, 10, 11].includes(month);
  const lastMinute = days <= 3;
  const close = days <= 10;

  let factor = 1;
  if (mode === 'fly') factor += lastMinute ? 0.35 : close ? 0.18 : days > 30 ? -0.08 : 0;
  if (mode === 'train') factor += lastMinute ? 0.08 : 0;
  if (mode === 'bus') factor += lastMinute ? 0.12 : close ? 0.05 : 0;
  if (weekend && mode !== 'drive') factor += 0.08;
  if (peakSeason && mode !== 'drive') factor += 0.12;

  return Math.max(0.85, factor);
}

function estimatePrice(mode: TransportMode, distanceKm: number, travelDate?: string): [number, number] {
  const base = mode === 'fly'
    ? Math.max(2500, Math.round(distanceKm * 4.2))
    : mode === 'train'
    ? Math.max(180, Math.round(distanceKm * 1.6))
    : mode === 'bus'
    ? Math.max(250, Math.round(distanceKm * 1.25))
    : mode === 'drive'
    ? Math.max(500, Math.round(distanceKm * 7.5))
    : Math.max(300, Math.round(distanceKm * 1.4));

  const factor = dateFareFactor(mode, travelDate);
  const from = Math.round(base * factor);
  return [from, Math.round(from * 1.55)];
}

function selfDriveBreakdown(distanceKm: number): { fuelCost: number; cabFare: number; notes: string[]; breakdown: { label: string; value: string }[] } {
  const litres = distanceKm / SELF_DRIVE_MILEAGE_KM_PER_LITRE;
  const fuelCost = Math.round(litres * PETROL_PRICE_INR_PER_LITRE);
  const tollParkingBuffer = Math.round(Math.max(250, distanceKm * 1.1));
  const selfDriveTotal = fuelCost + tollParkingBuffer;
  const cabFare = Math.round(CAB_BASE_FARE_INR + distanceKm * CAB_RATE_INR_PER_KM);

  return {
    fuelCost: selfDriveTotal,
    cabFare,
    notes: [
      `Petrol assumed at ₹${PETROL_PRICE_INR_PER_LITRE}/L`,
      `Mileage assumed at ${SELF_DRIVE_MILEAGE_KM_PER_LITRE} km/L`,
      `Cab estimate uses ₹${CAB_RATE_INR_PER_KM}/km plus base fare`,
    ],
    breakdown: [
      { label: 'Petrol estimate', value: `₹${fuelCost.toLocaleString('en-IN')}` },
      { label: 'Toll/parking buffer', value: `₹${tollParkingBuffer.toLocaleString('en-IN')}` },
      { label: 'Self-drive total', value: `₹${selfDriveTotal.toLocaleString('en-IN')}` },
      { label: 'Cab estimate', value: `₹${cabFare.toLocaleString('en-IN')}` },
    ],
  };
}

async function geocode(query: string): Promise<Place> {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '1',
  });

  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`);
  if (!response.ok) throw new Error(`Could not find ${query}`);

  const [result] = await response.json();
  if (!result) throw new Error(`Could not find ${query}`);

  return {
    name: result.name || query,
    country: result.address?.country,
    displayName: result.display_name || result.name || query,
    placeType: result.addresstype || result.type,
    lat: Number(result.lat),
    lon: Number(result.lon),
  };
}

async function getDrivingRoute(from: Place, to: Place): Promise<OsrmRoute> {
  const coords = `${from.lon},${from.lat};${to.lon},${to.lat}`;
  const response = await fetch(`${OSRM_URL}/${coords}?overview=full&geometries=geojson&alternatives=false`);
  if (!response.ok) throw new Error('Could not load live road route');

  const data = await response.json();
  const route = data.routes?.[0];
  if (!route) throw new Error('Could not load live road route');

  return route;
}

function createRoute(
  mode: TransportMode,
  distanceKm: number,
  durationMinutes: number,
  index: number,
  origin: Place,
  destination: Place,
  travelDate?: string,
  roadPath: [number, number][] = [],
  extraHighlights: string[] = []
): RouteOption {
  const [estimatedFrom, estimatedTo] = estimatePrice(mode, distanceKm, travelDate);
  const driveCosts = mode === 'drive' ? selfDriveBreakdown(distanceKm) : null;
  const priceFrom = driveCosts?.fuelCost ?? estimatedFrom;
  const priceTo = driveCosts?.cabFare ?? estimatedTo;
  const isIndiaRoute = origin.country === 'India' && destination.country === 'India';
  const labels: Record<TransportMode, string[]> = {
    fly: isIndiaRoute ? ['IndiGo', 'Air India', 'Akasa Air'] : ['Airline partners', 'Skyscanner'],
    train: isIndiaRoute ? ['Indian Railways', 'IRCTC'] : ['National rail operators'],
    bus: isIndiaRoute ? ['redBus', 'State transport operators'] : ['Coach operators'],
    drive: isIndiaRoute ? ['Live road route', 'Self drive / rental car'] : ['Live road route', 'Rental car partners'],
    ferry: isIndiaRoute ? ['Local ferry operators'] : ['Direct Ferries', 'Local ferry operators'],
  };
  const frequencies: Record<TransportMode, string> = {
    fly: 'Check airline schedules',
    train: isIndiaRoute ? 'Check IRCTC schedules' : 'Check rail schedules',
    bus: 'Check coach schedules',
    drive: 'Anytime',
    ferry: 'Check ferry schedules',
  };
  const endpointPath: [number, number][] = [
    [origin.lon, origin.lat],
    [destination.lon, destination.lat],
  ];

  return {
    id: `${mode}-${index}`,
    mode,
    title: mode === 'fly' ? `Fly to ${destination.name}` : undefined,
    duration: formatDuration(durationMinutes),
    durationMinutes,
    priceFrom,
    priceTo,
    currency: 'INR',
    stops: mode === 'fly' && distanceKm > 2500 ? 1 : 0,
    operators: labels[mode],
    distance: `${Math.round(distanceKm).toLocaleString()} km`,
    frequency: frequencies[mode],
    highlights: [
      ...extraHighlights,
      mode === 'drive' ? 'Live road distance' : 'Estimated from live distance',
      travelDate ? `Travel date ${new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(new Date(`${travelDate}T00:00:00`))}` : 'Flexible date',
      `~${Math.round(distanceKm).toLocaleString()} km`,
    ],
    source: mode === 'drive' ? 'live' : 'estimated',
    updatedAt: new Date().toISOString(),
    routePath: mode === 'drive' && roadPath.length > 1 ? roadPath : endpointPath,
    fromPlace: [origin.name, origin.country].filter(Boolean).join(', '),
    toPlace: [destination.name, destination.country].filter(Boolean).join(', '),
    travelDate,
    fareNotes: driveCosts?.notes ?? [
      'Estimated fare changes by travel date, weekend demand, and peak season.',
      'Connect provider APIs for live cheapest ticket prices.',
    ],
    fareBreakdown: driveCosts?.breakdown,
  };
}

function applyDateToRange(priceFrom: number, priceTo: number, mode: TransportMode, travelDate?: string): [number, number] {
  const factor = dateFareFactor(mode, travelDate);
  return [Math.round(priceFrom * factor), Math.round(priceTo * factor)];
}

function buildInternationalFlightOptions(origin: Place, destination: Place, travelDate?: string): RouteOption[] {
  const distanceKm = haversineKm(origin, destination);
  const destinationName = destination.country || destination.name;
  const isCanada = destinationName.toLowerCase() === 'canada';
  const airports = isCanada
    ? [
        { city: 'Montréal', airport: 'Montréal-Pierre Elliott Trudeau International Airport', minutes: 21 * 60 + 30, priceFrom: 65680, priceTo: 130787, stops: 1 },
        { city: 'Vancouver', airport: 'Vancouver International Airport', minutes: 23 * 60 + 40, priceFrom: 47380, priceTo: 200727, stops: 1 },
        { city: 'Toronto', airport: 'Toronto Pearson International Airport', minutes: 22 * 60 + 20, priceFrom: 65750, priceTo: 201157, stops: 1 },
        { city: 'Ottawa', airport: 'Ottawa Macdonald-Cartier International Airport', minutes: 24 * 60 + 5, priceFrom: 60436, priceTo: 170543, stops: 2 },
      ]
    : [
        { city: destination.name, airport: `${destination.name} International Airport`, minutes: Math.round((distanceKm / 820) * 60 + 180), priceFrom: Math.max(32000, Math.round(distanceKm * 5.2)), priceTo: Math.max(85000, Math.round(distanceKm * 12.5)), stops: 1 },
      ];

  return airports.map((airport, index) => {
    const [priceFrom, priceTo] = applyDateToRange(airport.priceFrom, airport.priceTo, 'fly', travelDate);
    return {
      id: `fly-${index}`,
      mode: 'fly',
      title: `Fly to ${airport.airport}`,
      duration: formatDuration(airport.minutes),
      durationMinutes: airport.minutes,
      priceFrom,
      priceTo,
      currency: 'INR',
      stops: airport.stops,
      operators: ['Air India', 'Air Canada', 'Emirates', 'Qatar Airways'],
      distance: `${Math.round(distanceKm).toLocaleString()} km`,
      frequency: 'Check airline schedules',
      highlights: [
        `${airport.stops} stop${airport.stops > 1 ? 's' : ''}`,
        'International flight option',
        travelDate ? `Travel date ${new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(new Date(`${travelDate}T00:00:00`))}` : 'Flexible date',
        `Arrive near ${airport.city}`,
      ],
      source: 'estimated',
      updatedAt: new Date().toISOString(),
      routePath: [
        [origin.lon, origin.lat],
        [destination.lon, destination.lat],
      ],
      fromPlace: [origin.name, origin.country].filter(Boolean).join(', '),
      toPlace: destination.country || destination.name,
      travelDate,
      fareNotes: [
        'Estimated flight range adjusts for travel date, weekend demand, and peak season.',
        'Connect Amadeus, Duffel, Skyscanner, or airline APIs for live cheapest fares.',
      ],
    } satisfies RouteOption;
  });
}

function buildLiveOptions(route: OsrmRoute, origin: Place, destination: Place, travelDate?: string): RouteOption[] {
  const roadDistanceKm = route.distance / 1000;
  const driveMinutes = Math.max(1, Math.round(route.duration / 60));
  const straightLineAdjustedKm = roadDistanceKm * 0.78;
  const roadPath = route.geometry?.coordinates ?? [];
  const routes: RouteOption[] = [
    createRoute('drive', roadDistanceKm, driveMinutes, 0, origin, destination, travelDate, roadPath),
  ];

  if (roadDistanceKm > 120) {
    routes.push(createRoute('bus', roadDistanceKm, Math.round(driveMinutes * 1.28), routes.length, origin, destination, travelDate, roadPath, ['Budget-friendly']));
  }

  if (roadDistanceKm > 180 && roadDistanceKm < 1800) {
    routes.push(createRoute('train', roadDistanceKm, Math.round(driveMinutes * 0.72), routes.length, origin, destination, travelDate, roadPath, ['City center to city center']));
  }

  if (roadDistanceKm > 450) {
    const flightMinutes = Math.round((straightLineAdjustedKm / 780) * 60 + 105);
    routes.push(createRoute('fly', straightLineAdjustedKm, flightMinutes, routes.length, origin, destination, travelDate, roadPath, ['Fastest long-distance option']));
  }

  return routes.sort((a, b) => {
    const order: Record<TransportMode, number> = { fly: 0, train: 1, bus: 2, drive: 3, ferry: 4 };
    return order[a.mode] - order[b.mode];
  });
}

export async function findRoutes(from: string, to: string, travelDate?: string): Promise<RouteOption[]> {
  try {
    const [origin, destination] = await Promise.all([geocode(from), geocode(to)]);
    const international = origin.country && destination.country && origin.country !== destination.country;
    const veryLongDistance = haversineKm(origin, destination) > 2500;

    if (international || veryLongDistance || destination.placeType === 'country') {
      return buildInternationalFlightOptions(origin, destination, travelDate);
    }

    const roadRoute = await getDrivingRoute(origin, destination);
    return buildLiveOptions(roadRoute, origin, destination, travelDate);
  } catch (error) {
    console.warn('Live route lookup failed. Falling back to estimated routes.', error);
    return generateRoutes(from, to).map(route => ({
      ...route,
      source: 'estimated',
      updatedAt: new Date().toISOString(),
      travelDate,
    }));
  }
}
