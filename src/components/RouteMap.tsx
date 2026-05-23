import { Bus, Car, Clock, ExternalLink, Footprints, IndianRupee, MapPin, Plane, Shuffle, Train, type LucideIcon } from 'lucide-react';
import { ItineraryLegMode, RouteOption, TransportMode } from '../types';
import { formatCurrency } from '../lib/currency';

const MODE_STYLE: Record<TransportMode, { color: string; stroke: string; icon: LucideIcon; name: string }> = {
  fly: { color: 'text-sky-700', stroke: '#0284c7', icon: Plane, name: 'Flight' },
  train: { color: 'text-emerald-700', stroke: '#059669', icon: Train, name: 'Train' },
  bus: { color: 'text-amber-700', stroke: '#d97706', icon: Bus, name: 'Bus' },
  drive: { color: 'text-orange-700', stroke: '#ea580c', icon: Car, name: 'Drive' },
  ferry: { color: 'text-blue-700', stroke: '#2563eb', icon: MapPin, name: 'Ferry' },
};

const LEG_STYLE: Record<ItineraryLegMode, { color: string; bg: string; bar: string; icon: LucideIcon; name: string }> = {
  fly: { color: 'text-sky-700', bg: 'bg-sky-50', bar: 'bg-teal-500', icon: Plane, name: 'Plane' },
  train: { color: 'text-emerald-700', bg: 'bg-emerald-50', bar: 'bg-emerald-600', icon: Train, name: 'Train' },
  bus: { color: 'text-orange-700', bg: 'bg-orange-50', bar: 'bg-orange-500', icon: Bus, name: 'Bus' },
  drive: { color: 'text-orange-700', bg: 'bg-orange-50', bar: 'bg-orange-500', icon: Car, name: 'Drive' },
  ferry: { color: 'text-blue-700', bg: 'bg-blue-50', bar: 'bg-blue-600', icon: MapPin, name: 'Ferry' },
  walk: { color: 'text-gray-600', bg: 'bg-gray-50', bar: 'bg-gray-300', icon: Footprints, name: 'Walk' },
  transfer: { color: 'text-gray-600', bg: 'bg-gray-50', bar: 'bg-gray-300', icon: Shuffle, name: 'Transfer' },
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
            <h2 className="font-bold text-gray-900">{route.legs?.length ? route.title ?? `${style.name} details` : `${style.name} details`}</h2>
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

        {route.legs?.length ? (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Detailed travel plan</h3>
            <div className="space-y-3">
              {route.legs.map((leg, index) => {
                const legStyle = LEG_STYLE[leg.mode];
                const LegIcon = legStyle.icon;
                const isConnector = leg.mode === 'walk' || leg.mode === 'transfer';

                return (
                  <div key={`${leg.mode}-${leg.fromName}-${leg.toName}-${index}`} className={isConnector ? 'rounded-xl bg-gray-50 border border-gray-100 p-3' : 'rounded-xl bg-white border border-gray-100 p-3 shadow-sm'}>
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`w-9 h-9 rounded-full ${legStyle.bg} ${legStyle.color} border border-white shadow-sm flex items-center justify-center`}>
                          <LegIcon size={18} />
                        </div>
                        {!isConnector && <div className={`w-1 flex-1 min-h-20 rounded-full mt-1 ${legStyle.bar}`} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="font-bold text-sm text-gray-900">{leg.fromName}</div>
                          {leg.fromArea && <div className="text-xs text-gray-500">{leg.fromArea}</div>}
                        </div>

                        <div className="my-4 text-sm text-gray-700">
                          <span>{leg.duration}</span>
                          <span className="mx-1 text-gray-300">•</span>
                          <span>{legStyle.name}</span>
                          {leg.distance && (
                            <>
                              <span className="mx-1 text-gray-300">•</span>
                              <span>{leg.distance}</span>
                            </>
                          )}
                          {leg.frequency && (
                            <>
                              <span className="mx-1 text-gray-300">•</span>
                              <span>{leg.frequency}</span>
                            </>
                          )}
                        </div>

                        {leg.operator && (
                          <span className={`inline-flex rounded-md px-2 py-1 text-xs font-bold ${leg.mode === 'fly' ? 'bg-teal-500 text-white' : leg.mode === 'bus' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                            {leg.operator}
                          </span>
                        )}

                        {(leg.priceFrom || leg.priceTo) && (
                          <div className="mt-2 text-sm font-semibold text-gray-900">
                            {formatCurrency(leg.priceFrom ?? 0, route.currency)}
                            {leg.priceTo && leg.priceTo > (leg.priceFrom ?? 0) ? `-${formatCurrency(leg.priceTo, route.currency)}` : ''}
                          </div>
                        )}

                        <div className="mt-4">
                          <div className="font-bold text-sm text-gray-900">{leg.toName}</div>
                          {leg.toArea && <div className="text-xs text-gray-500">{leg.toArea}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
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
        )}

        {(route.fareBreakdown?.length || route.fareProviders?.length || route.bookingLinks?.length || route.fareNotes?.length) && (
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
              <ul className="mb-3 space-y-1.5">
                {route.fareNotes.map(note => (
                  <li key={note} className="text-xs text-gray-500 leading-relaxed">
                    {note}
                  </li>
                ))}
              </ul>
            )}
            {route.bookingLinks && route.bookingLinks.length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                  Compare live fares
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {route.bookingLinks.map(link => (
                    <a
                      key={`${link.provider}-${link.label}`}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-orange-200 hover:bg-orange-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate">{link.label}</span>
                        <span className="block text-xs font-normal text-gray-400">{link.provider}</span>
                      </span>
                      <ExternalLink size={14} className="shrink-0 text-orange-600" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            {route.fareProviders && route.fareProviders.length > 0 && (
              <div className="mb-3 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Top cheapest operators from Google
                </div>
                {route.fareProviders.map((provider, index) => (
                  <div key={`${provider.operator}-${index}`} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-gray-800 truncate">
                          {index + 1}. {provider.operator}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {provider.title}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-green-700">
                          {provider.price ? formatCurrency(provider.price, route.currency) : 'Check fare'}
                        </div>
                        {provider.link && (
                          <a
                            href={provider.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
                          >
                            Open
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>
                    {provider.snippet && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                        {provider.snippet}
                      </p>
                    )}
                  </div>
                ))}
              </div>
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
