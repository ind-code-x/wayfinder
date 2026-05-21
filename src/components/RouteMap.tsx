import { Bus, Car, Clock, ExternalLink, IndianRupee, MapPin, Plane, Train, type LucideIcon } from 'lucide-react';
import { RouteOption, TransportMode } from '../types';
import { formatCurrency } from '../lib/currency';

const MODE_STYLE: Record<TransportMode, { color: string; stroke: string; icon: LucideIcon; name: string }> = {
  fly: { color: 'text-sky-700', stroke: '#0284c7', icon: Plane, name: 'Flight' },
  train: { color: 'text-emerald-700', stroke: '#059669', icon: Train, name: 'Train' },
  bus: { color: 'text-amber-700', stroke: '#d97706', icon: Bus, name: 'Bus' },
  drive: { color: 'text-orange-700', stroke: '#ea580c', icon: Car, name: 'Drive' },
  ferry: { color: 'text-blue-700', stroke: '#2563eb', icon: MapPin, name: 'Ferry' },
};

interface RouteMapProps {
  route: RouteOption;
  from: string;
  to: string;
}

function buildSteps(route: RouteOption, from: string, to: string): string[] {
  if (route.mode === 'fly') {
    return [
      `Travel from ${from} to the nearest airport`,
      `Fly with ${route.operators.slice(0, 2).join(' or ')}`,
      `Continue from the arrival airport to ${to}`,
    ];
  }

  if (route.mode === 'train') {
    return [
      `Reach the main railway station near ${from}`,
      `Take ${route.operators[0]} services toward ${to}`,
      `Use local transport for the final transfer`,
    ];
  }

  if (route.mode === 'bus') {
    return [
      `Board an intercity coach from ${from}`,
      `Compare services from ${route.operators.slice(0, 2).join(' or ')}`,
      `Arrive near ${to} and complete the local transfer`,
    ];
  }

  if (route.mode === 'drive') {
    return [
      `Start from ${from}`,
      'Follow the live road route shown on the map',
      `Arrive in ${to}`,
    ];
  }

  return [`Start from ${from}`, `Take available ferry services`, `Arrive in ${to}`];
}

function googleMapsUrl(from: string, to: string, mode: TransportMode): string {
  const params = new URLSearchParams({
    api: '1',
    origin: from,
    destination: to,
  });

  if (mode === 'drive') params.set('travelmode', 'driving');
  if (mode === 'train' || mode === 'bus') params.set('travelmode', 'transit');

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function googleEmbedUrl(from: string, to: string, mode: TransportMode): string {
  const params = new URLSearchParams({
    saddr: from,
    daddr: to,
    output: 'embed',
  });

  if (mode === 'drive') params.set('dirflg', 'd');
  if (mode === 'train') params.set('dirflg', 'r');
  if (mode === 'bus') params.set('dirflg', 'h');

  return `https://maps.google.com/maps?${params.toString()}`;
}

export default function RouteMap({ route, from, to }: RouteMapProps) {
  const style = MODE_STYLE[route.mode];
  const Icon = style.icon;
  const isDrive = route.mode === 'drive';
  const steps = buildSteps(route, from, to);
  const mapFrom = route.fromPlace ?? from;
  const mapTo = route.toPlace ?? to;
  const mapsUrl = googleMapsUrl(mapFrom, mapTo, route.mode);

  return (
    <aside className="bg-white border border-gray-200 rounded-2xl overflow-hidden xl:sticky xl:top-6">
      <div className="relative bg-slate-50 border-b border-gray-100 h-72">
        <iframe
          title={`${from} to ${to} map`}
          src={googleEmbedUrl(mapFrom, mapTo, route.mode)}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm border border-gray-200"
        >
          Google Maps
          <ExternalLink size={13} />
        </a>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
            <Icon size={22} className={style.color} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{style.name} details</h2>
            <p className="text-sm text-gray-500">{route.fromPlace ?? from} to {route.toPlace ?? to}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-5">
          <div className="rounded-xl bg-gray-50 p-3">
            <Clock size={16} className="text-gray-400 mb-1" />
            <div className="text-sm font-bold text-gray-800">{route.duration}</div>
            <div className="text-xs text-gray-400">Duration</div>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <IndianRupee size={16} className="text-gray-400 mb-1" />
            <div className="text-sm font-bold text-gray-800">{formatCurrency(route.priceFrom, route.currency)}</div>
            <div className="text-xs text-gray-400">
              {isDrive ? 'self-drive total' : `to ${formatCurrency(route.priceTo, route.currency)}`}
            </div>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <MapPin size={16} className="text-gray-400 mb-1" />
            <div className="text-sm font-bold text-gray-800">{route.distance}</div>
            <div className="text-xs text-gray-400">Distance</div>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Route steps</h3>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-50 text-green-800 text-xs font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-600">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {(route.fareBreakdown?.length || route.fareNotes?.length) && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Fare details</h3>
            {route.fareBreakdown && route.fareBreakdown.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {route.fareBreakdown.map(item => (
                  <div key={item.label} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                    <div className="text-xs text-gray-400">{item.label}</div>
                    <div className="text-sm font-bold text-gray-800 mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
            )}
            {route.fareNotes && route.fareNotes.length > 0 && (
              <ul className="space-y-1.5">
                {route.fareNotes.map(note => (
                  <li key={note} className="text-xs text-gray-500 leading-relaxed">
                    {note}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs text-gray-500">
          {route.source === 'live'
            ? 'The map is shown with Google Maps. Road timings come from live OSRM routing; booking-grade fares need a transport provider API.'
            : 'The map is shown with Google Maps. These travel times and fares are estimates until flight, rail, or bus provider APIs are connected.'}
        </div>
      </div>
    </aside>
  );
}
