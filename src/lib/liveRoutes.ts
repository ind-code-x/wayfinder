import { ItineraryLeg, RouteOption, TransportMode } from '../types';
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

function searchUrl(base: string, query: string): string {
  return `${base}${encodeURIComponent(query)}`;
}

function buildBookingLinks(mode: TransportMode, from: string, to: string, travelDate?: string): NonNullable<RouteOption['bookingLinks']> {
  const dateText = travelDate ? ` ${travelDate}` : '';
  const routeText = `${from} to ${to}${dateText}`;

  if (mode === 'fly') {
    return [
      { label: 'Compare flights', provider: 'Google Flights search', url: searchUrl('https://www.google.com/search?q=', `${routeText} flights`) },
      { label: 'Check airline fares', provider: 'MakeMyTrip', url: searchUrl('https://www.makemytrip.com/flights/?s=', `${routeText} flights`) },
      { label: 'Compare flight deals', provider: 'Skyscanner', url: searchUrl('https://www.skyscanner.co.in/transport/flights/search?q=', `${routeText} flights`) },
      { label: 'Search flight offers', provider: 'Goibibo', url: searchUrl('https://www.goibibo.com/flights/?s=', `${routeText} flights`) },
    ];
  }

  if (mode === 'bus') {
    return [
      { label: 'Compare bus tickets', provider: 'redBus', url: searchUrl('https://www.redbus.in/search?search=', `${routeText} bus`) },
      { label: 'Check bus fares', provider: 'AbhiBus', url: searchUrl('https://www.abhibus.com/search?search=', `${routeText} bus`) },
      { label: 'Search bus options', provider: 'MakeMyTrip Bus', url: searchUrl('https://www.makemytrip.com/bus-tickets/search?search=', `${routeText} bus`) },
      { label: 'Compare coach fares', provider: 'Google search', url: searchUrl('https://www.google.com/search?q=', `${routeText} bus ticket fare`) },
    ];
  }

  if (mode === 'train') {
    return [
      { label: 'Check train tickets', provider: 'IRCTC', url: 'https://www.irctc.co.in/nget/train-search' },
      { label: 'Search train schedules', provider: 'Google search', url: searchUrl('https://www.google.com/search?q=', `${routeText} train ticket fare IRCTC`) },
      { label: 'Check train options', provider: 'ConfirmTkt', url: searchUrl('https://www.confirmtkt.com/rbooking-d/trains/from/', routeText) },
    ];
  }

  if (mode === 'drive') {
    return [
      { label: 'Open road route', provider: 'Google Maps', url: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&travelmode=driving` },
      { label: 'Compare cab fares', provider: 'Google search', url: searchUrl('https://www.google.com/search?q=', `${routeText} cab fare`) },
      { label: 'Search car rentals', provider: 'Google search', url: searchUrl('https://www.google.com/search?q=', `${routeText} self drive car rental`) },
    ];
  }

  return [
    { label: 'Search booking options', provider: 'Google search', url: searchUrl('https://www.google.com/search?q=', `${routeText} travel ticket fare`) },
  ];
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function addMinutes(...minutes: number[]): number {
  return minutes.reduce((total, value) => total + value, 0);
}

function sumLegPrices(legs: ItineraryLeg[]): [number, number] {
  return legs.reduce<[number, number]>((total, leg) => [
    total[0] + (leg.priceFrom ?? 0),
    total[1] + (leg.priceTo ?? leg.priceFrom ?? 0),
  ], [0, 0]);
}

function cityName(place: Place): string {
  return [place.name, place.country].filter(Boolean).join(', ');
}

function placeFromQuery(query: string): Place {
  const parts = query.split(',').map(part => part.trim()).filter(Boolean);
  const name = parts[0] || query;
  const country = parts.find(part => part.toLowerCase() === 'india') ?? parts[parts.length - 1];

  return {
    name,
    country,
    displayName: query,
    lat: 0,
    lon: 0,
  };
}

function airportFor(place: Place): { name: string; area: string; code?: string } {
  const display = `${place.name} ${place.displayName}`.toLowerCase();
  if (display.includes('hyderabad')) return { name: 'Rajiv Gandhi International Airport', area: 'Shamshabad', code: 'HYD' };
  if (display.includes('mumbai')) return { name: 'Chhatrapati Shivaji Maharaj International Airport', area: 'Mumbai', code: 'BOM' };
  if (display.includes('pune')) return { name: 'Pune International Airport', area: 'Lohegaon', code: 'PNQ' };
  if (display.includes('bengaluru') || display.includes('bangalore')) return { name: 'Kempegowda International Airport', area: 'Devanahalli', code: 'BLR' };
  if (display.includes('delhi')) return { name: 'Indira Gandhi International Airport', area: 'Delhi', code: 'DEL' };
  if (display.includes('chennai')) return { name: 'Chennai International Airport', area: 'Meenambakkam', code: 'MAA' };
  if (display.includes('kolkata')) return { name: 'Netaji Subhas Chandra Bose International Airport', area: 'Dum Dum', code: 'CCU' };
  return { name: `${place.name} Airport`, area: place.name };
}

function railwayStationFor(place: Place): { name: string; area: string; code?: string } {
  const display = `${place.name} ${place.displayName}`.toLowerCase();
  if (display.includes('hyderabad')) return { name: 'Hyderabad Deccan Nampally', area: 'Hyderabad', code: 'HYB' };
  if (display.includes('secunderabad')) return { name: 'Secunderabad Junction', area: 'Secunderabad', code: 'SC' };
  if (display.includes('pune')) return { name: 'Pune Junction', area: 'Pune', code: 'PUNE' };
  if (display.includes('mumbai')) return { name: 'Chhatrapati Shivaji Maharaj Terminus', area: 'Mumbai', code: 'CSMT' };
  if (display.includes('bengaluru') || display.includes('bangalore')) return { name: 'KSR Bengaluru City Junction', area: 'Bengaluru', code: 'SBC' };
  if (display.includes('delhi')) return { name: 'New Delhi Railway Station', area: 'Delhi', code: 'NDLS' };
  if (display.includes('chennai')) return { name: 'MGR Chennai Central', area: 'Chennai', code: 'MAS' };
  if (display.includes('kolkata')) return { name: 'Howrah Junction', area: 'Kolkata', code: 'HWH' };
  return { name: `${place.name} Railway Station`, area: place.name };
}

function buildFlightBusLegs(origin: Place, destination: Place, airMinutes: number, flightFrom: number, flightTo: number): ItineraryLeg[] {
  const originAirport = airportFor(origin);
  const destinationAirport = airportFor(destination);
  const destinationText = `${destination.name} ${destination.displayName}`.toLowerCase();
  const useMumbaiTransfer = destinationText.includes('pune');
  const arrivalAirport = useMumbaiTransfer
    ? { name: 'Chhatrapati Shivaji Maharaj International Airport', area: 'Mumbai', code: 'BOM' }
    : destinationAirport;

  const transferBus: ItineraryLeg[] = useMumbaiTransfer
    ? [
        {
          mode: 'walk',
          fromName: arrivalAirport.name,
          fromArea: arrivalAirport.area,
          toName: 'Vileparle',
          toArea: 'Bandra',
          duration: '8m',
          durationMinutes: 8,
          distance: '630 metres',
        },
        {
          mode: 'bus',
          fromName: 'Vileparle',
          fromArea: 'Bandra',
          toName: 'Vanaj',
          toArea: destination.name,
          duration: '2h 3m',
          durationMinutes: 123,
          operator: 'AC Shivneri',
          frequency: 'Every 30 minutes',
          priceFrom: 290,
          priceTo: 710,
        },
      ]
    : [
        {
          mode: 'bus',
          fromName: arrivalAirport.name,
          fromArea: arrivalAirport.area,
          toName: destination.name,
          toArea: destination.country,
          duration: '45m',
          durationMinutes: 45,
          operator: 'Airport shuttle',
          frequency: 'Frequent',
          priceFrom: 120,
          priceTo: 360,
        },
      ];

  return [
    {
      mode: 'bus',
      fromName: 'Gandhi Bhavan',
      fromArea: cityName(origin),
      toName: originAirport.name,
      toArea: originAirport.area,
      duration: '52m',
      durationMinutes: 52,
      operator: 'Airport bus',
      frequency: 'Hourly',
      priceFrom: 150,
      priceTo: 260,
    },
    {
      mode: 'fly',
      fromName: `${origin.name} (${originAirport.code ?? 'Airport'})`,
      fromArea: origin.country,
      toName: `${arrivalAirport.name}${arrivalAirport.code ? ` (${arrivalAirport.code})` : ''}`,
      toArea: arrivalAirport.area,
      duration: formatDuration(airMinutes),
      durationMinutes: airMinutes,
      operator: 'IndiGo / Air India',
      priceFrom: flightFrom,
      priceTo: flightTo,
    },
    ...transferBus,
  ];
}

function buildBusViaLegs(origin: Place, destination: Place, totalMinutes: number, priceFrom: number, priceTo: number): ItineraryLeg[] {
  const text = `${origin.name} ${destination.name}`.toLowerCase();
  const via = text.includes('hyderabad') && text.includes('pune') ? 'Solapur' : 'major interchange';
  const firstMinutes = Math.round(totalMinutes * 0.58);
  const secondMinutes = totalMinutes - firstMinutes - 25;
  const firstPrice = Math.round(priceFrom * 0.55);
  const secondPrice = priceFrom - firstPrice;

  return [
    {
      mode: 'bus',
      fromName: origin.name,
      fromArea: origin.country,
      toName: via,
      toArea: 'Transfer point',
      duration: formatDuration(firstMinutes),
      durationMinutes: firstMinutes,
      operator: 'Intercity bus',
      frequency: 'Every 1-2 hours',
      priceFrom: firstPrice,
      priceTo: Math.round(priceTo * 0.55),
    },
    {
      mode: 'transfer',
      fromName: via,
      toName: via,
      duration: '25m',
      durationMinutes: 25,
      operator: 'Transfer',
    },
    {
      mode: 'bus',
      fromName: via,
      fromArea: 'Bus stand',
      toName: destination.name,
      toArea: destination.country,
      duration: formatDuration(Math.max(45, secondMinutes)),
      durationMinutes: Math.max(45, secondMinutes),
      operator: 'State transport / private bus',
      frequency: 'Frequent',
      priceFrom: secondPrice,
      priceTo: Math.max(secondPrice, Math.round(priceTo * 0.45)),
    },
  ];
}

function buildTrainLegs(origin: Place, destination: Place, railMinutes: number, priceFrom: number, priceTo: number): ItineraryLeg[] {
  const originStation = railwayStationFor(origin);
  const destinationStation = railwayStationFor(destination);
  const cityAccessMinutes = Math.min(45, Math.max(18, Math.round(railMinutes * 0.08)));
  const finalAccessMinutes = Math.min(40, Math.max(15, Math.round(railMinutes * 0.06)));
  const mainTrainMinutes = Math.max(60, railMinutes - cityAccessMinutes - finalAccessMinutes);

  return [
    {
      mode: 'bus',
      fromName: origin.name,
      fromArea: origin.country,
      toName: originStation.name,
      toArea: originStation.area,
      duration: formatDuration(cityAccessMinutes),
      durationMinutes: cityAccessMinutes,
      operator: 'Local bus / metro',
      frequency: 'Frequent',
      priceFrom: 30,
      priceTo: 120,
    },
    {
      mode: 'train',
      fromName: `${originStation.name}${originStation.code ? ` (${originStation.code})` : ''}`,
      fromArea: originStation.area,
      toName: `${destinationStation.name}${destinationStation.code ? ` (${destinationStation.code})` : ''}`,
      toArea: destinationStation.area,
      duration: formatDuration(mainTrainMinutes),
      durationMinutes: mainTrainMinutes,
      operator: 'Indian Railways',
      frequency: 'Check IRCTC schedules',
      priceFrom,
      priceTo,
    },
    {
      mode: 'bus',
      fromName: destinationStation.name,
      fromArea: destinationStation.area,
      toName: destination.name,
      toArea: destination.country,
      duration: formatDuration(finalAccessMinutes),
      durationMinutes: finalAccessMinutes,
      operator: 'Local bus / cab',
      frequency: 'Frequent',
      priceFrom: 40,
      priceTo: 180,
    },
  ];
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
      'Use the booking links below to compare live prices before payment.',
    ],
    fareBreakdown: driveCosts?.breakdown,
    bookingLinks: buildBookingLinks(mode, origin.name, destination.name, travelDate),
  };
}

function createMixedFlightRoute(
  distanceKm: number,
  flightMinutes: number,
  index: number,
  origin: Place,
  destination: Place,
  travelDate?: string,
  roadPath: [number, number][] = []
): RouteOption {
  const [baseFrom, baseTo] = estimatePrice('fly', distanceKm, travelDate);
  const flightFrom = Math.max(1800, Math.round(baseFrom * 0.75));
  const flightTo = Math.max(flightFrom, Math.round(baseTo * 0.75));
  const legs = buildFlightBusLegs(origin, destination, flightMinutes, flightFrom, flightTo);
  const [priceFrom, priceTo] = sumLegPrices(legs);
  const durationMinutes = addMinutes(...legs.map(leg => leg.durationMinutes));
  const arrivalAirport = legs.find(leg => leg.mode === 'fly')?.toName.replace(/\s*\([A-Z]{3}\)$/, '') ?? destination.name;

  return {
    id: `mixed-fly-${index}`,
    mode: 'fly',
    title: `Fly to ${arrivalAirport}, bus`,
    duration: formatDuration(durationMinutes),
    durationMinutes,
    priceFrom,
    priceTo,
    currency: 'INR',
    stops: Math.max(1, legs.length - 1),
    operators: ['Airport bus', 'IndiGo / Air India', 'State bus'],
    distance: `${Math.round(distanceKm).toLocaleString()} km`,
    frequency: 'Flight plus local transfer',
    highlights: [
      'Mixed travel plan',
      'Airport and city transfers included',
      travelDate ? `Travel date ${new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(new Date(`${travelDate}T00:00:00`))}` : 'Flexible date',
    ],
    legs,
    source: 'estimated',
    updatedAt: new Date().toISOString(),
    routePath: roadPath.length > 1 ? roadPath : [
      [origin.lon, origin.lat],
      [destination.lon, destination.lat],
    ],
    fromPlace: cityName(origin),
    toPlace: cityName(destination),
    travelDate,
    fareNotes: [
      'This mixed plan includes local transfers plus the main ticket estimate.',
      'Use the booking links below to compare live prices before payment.',
    ],
    bookingLinks: buildBookingLinks('fly', origin.name, destination.name, travelDate),
  };
}

function addBusLegs(route: RouteOption, origin: Place, destination: Place): RouteOption {
  const legs = buildBusViaLegs(origin, destination, route.durationMinutes, route.priceFrom, route.priceTo);
  return {
    ...route,
    title: route.title ?? `Bus via ${legs[0].toName}`,
    legs,
    stops: Math.max(route.stops, 1),
    operators: ['Intercity bus', 'State transport', 'Private operators'],
    frequency: 'Multiple departures',
    highlights: ['Bus interchange route', ...route.highlights.filter(item => item !== 'Budget-friendly')],
  };
}

function addTrainLegs(route: RouteOption, origin: Place, destination: Place): RouteOption {
  const legs = buildTrainLegs(origin, destination, route.durationMinutes, route.priceFrom, route.priceTo);
  const [priceFrom, priceTo] = sumLegPrices(legs);
  const durationMinutes = addMinutes(...legs.map(leg => leg.durationMinutes));

  return {
    ...route,
    title: `Train to ${railwayStationFor(destination).name}, local transfer`,
    duration: formatDuration(durationMinutes),
    durationMinutes,
    priceFrom,
    priceTo,
    legs,
    stops: Math.max(route.stops, 2),
    operators: ['Local transfer', 'Indian Railways', 'Local bus / cab'],
    frequency: 'Rail plus station transfers',
    highlights: ['Mixed train plan', 'Station transfers included', ...route.highlights.filter(item => item !== 'City center to city center')],
    fareNotes: [
      'This train plan includes station access and final local transfer estimates.',
      'Use IRCTC and booking links below to confirm train availability and final fare.',
    ],
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
        'Use the booking links below to compare live prices before payment.',
      ],
      bookingLinks: buildBookingLinks('fly', origin.name, airport.city, travelDate),
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
    const busRoute = createRoute('bus', roadDistanceKm, Math.round(driveMinutes * 1.28), routes.length, origin, destination, travelDate, roadPath, ['Budget-friendly']);
    routes.push(addBusLegs(busRoute, origin, destination));
  }

  if (roadDistanceKm > 180 && roadDistanceKm < 1800) {
    const trainRoute = createRoute('train', roadDistanceKm, Math.round(driveMinutes * 0.72), routes.length, origin, destination, travelDate, roadPath, ['City center to city center']);
    routes.push(addTrainLegs(trainRoute, origin, destination));
  }

  if (roadDistanceKm > 450) {
    const flightMinutes = Math.round((straightLineAdjustedKm / 780) * 60 + 105);
    routes.push(createMixedFlightRoute(straightLineAdjustedKm, flightMinutes, routes.length, origin, destination, travelDate, roadPath));
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
    let routeOptions: RouteOption[];

    if (international || veryLongDistance || destination.placeType === 'country') {
      return buildInternationalFlightOptions(origin, destination, travelDate);
    }

    const roadRoute = await getDrivingRoute(origin, destination);
    routeOptions = buildLiveOptions(roadRoute, origin, destination, travelDate);
    return routeOptions;
  } catch (error) {
    console.warn('Live route lookup failed. Falling back to estimated routes.', error);
    const fallbackOrigin = placeFromQuery(from);
    const fallbackDestination = placeFromQuery(to);
    const fallbackRoutes: RouteOption[] = generateRoutes(from, to).map(route => ({
      ...route,
      source: 'estimated' as const,
      updatedAt: new Date().toISOString(),
      travelDate,
      bookingLinks: buildBookingLinks(route.mode, from, to, travelDate),
      fareNotes: [
        ...(route.fareNotes ?? []),
        'Use the booking links below to compare live prices before payment.',
      ],
    }));
    return fallbackRoutes.map(route => {
      if (route.mode === 'train') return addTrainLegs(route, fallbackOrigin, fallbackDestination);
      if (route.mode === 'bus') return addBusLegs(route, fallbackOrigin, fallbackDestination);
      return route;
    });
  }
}
