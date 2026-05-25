import { ArrowRight, Plane, Train, Bus, Car, Ship, Filter, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { RouteOption, TransportMode } from '../types';
import RouteCard from './RouteCard';
import RouteMap from './RouteMap';
import DestinationAds from './DestinationAds';
import { getBestRoute } from '../lib/routeGenerator';
import { formatCurrency } from '../lib/currency';

const MODE_TABS: { mode: TransportMode | 'all'; label: string; icon: LucideIcon }[] = [
  { mode: 'all', label: 'All', icon: Filter },
  { mode: 'fly', label: 'Fly', icon: Plane },
  { mode: 'train', label: 'Train', icon: Train },
  { mode: 'bus', label: 'Bus', icon: Bus },
  { mode: 'drive', label: 'Drive', icon: Car },
  { mode: 'ferry', label: 'Ferry', icon: Ship },
];

interface RouteResultsProps {
  from: string;
  to: string;
  routes: RouteOption[];
}

export default function RouteResults({ from, to, routes }: RouteResultsProps) {
  const [activeMode, setActiveMode] = useState<TransportMode | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price' | 'duration'>('recommended');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(routes[0]?.id ?? null);

  const bestRoute = getBestRoute(routes);
  const availableModes = new Set(routes.map(r => r.mode));
  const liveCount = routes.filter(r => r.source === 'live').length;
  const updateTimes = routes
    .map(r => r.updatedAt)
    .filter(Boolean)
    .sort();
  const lastUpdated = updateTimes[updateTimes.length - 1];

  const filtered = routes.filter(r => activeMode === 'all' || r.mode === activeMode);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price') return a.priceFrom - b.priceFrom;
    if (sortBy === 'duration') return a.durationMinutes - b.durationMinutes;
    return a.durationMinutes - b.durationMinutes;
  });
  const selectedRoute = routes.find(route => route.id === selectedRouteId) ?? sorted[0] ?? routes[0];

  useEffect(() => {
    setSelectedRouteId(routes[0]?.id ?? null);
  }, [routes]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Route header */}
      <div className="flex items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
            <span>{from}</span>
            <ArrowRight size={20} className="text-orange-500 shrink-0" />
            <span>{to}</span>
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {routes.length} way{routes.length !== 1 ? 's' : ''} to get there
            {lastUpdated && (
              <span className="ml-2 text-gray-400">
                {' '}{liveCount > 0 ? `${liveCount} live` : 'Estimated'} route{liveCount === 1 ? '' : 's'} updated{' '}
                {new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(lastUpdated))}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {MODE_TABS.filter(t => t.mode === 'all' || availableModes.has(t.mode as TransportMode)).map(tab => {
          const Icon = tab.icon;
          const active = activeMode === tab.mode;
          return (
            <button
              key={tab.mode}
              onClick={() => setActiveMode(tab.mode)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                active
                  ? 'bg-green-700 text-white border-green-700 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-orange-400 hover:text-green-700'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400 whitespace-nowrap">Sort by:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm text-gray-700 border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none cursor-pointer"
          >
            <option value="recommended">Recommended</option>
            <option value="price">Cheapest</option>
            <option value="duration">Fastest</option>
          </select>
        </div>
      </div>

      {/* Results grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Filter size={32} className="mx-auto mb-3 opacity-40" />
          <p>No routes found for this transport mode.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-6 items-start">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sorted.map(route => (
              <RouteCard
                key={route.id}
                route={route}
                isBest={route.id === bestRoute?.id && activeMode === 'all' && sortBy === 'recommended'}
                isSelected={route.id === selectedRoute?.id}
                onSelect={route => setSelectedRouteId(route.id)}
              />
            ))}
          </div>
          {selectedRoute && <RouteMap route={selectedRoute} from={from} to={to} />}
        </div>
      )}

      {/* Overview stats */}
      <div className="mt-10 bg-gray-50 rounded-2xl p-6 border border-gray-100">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Overview: {from} to {to}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {routes.slice(0, 4).map(r => (
            <div key={r.id} className="bg-white rounded-xl p-3 border border-gray-100">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{r.mode}</div>
              <div className="font-bold text-gray-800">{r.duration}</div>
              <div className="text-sm text-green-700 font-medium">from {formatCurrency(r.priceFrom, r.currency)}</div>
            </div>
          ))}
        </div>
      </div>

      <DestinationAds destination={to} />
    </div>
  );
}
