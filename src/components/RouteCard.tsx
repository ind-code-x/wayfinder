import { Plane, Train, Bus, Car, Ship, Clock, Repeat, Users, ChevronRight, Radio, type LucideIcon } from 'lucide-react';
import { RouteOption, TransportMode } from '../types';
import { formatCurrency } from '../lib/currency';

const MODE_CONFIG: Record<TransportMode, {
  icon: LucideIcon;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  fly: {
    icon: Plane,
    label: 'Fly',
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  train: {
    icon: Train,
    label: 'Train',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  bus: {
    icon: Bus,
    label: 'Bus',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  drive: {
    icon: Car,
    label: 'Drive',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  ferry: {
    icon: Ship,
    label: 'Ferry',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
};

interface RouteCardProps {
  route: RouteOption;
  isBest?: boolean;
  isSelected?: boolean;
  onSelect?: (route: RouteOption) => void;
}

export default function RouteCard({ route, isBest, isSelected, onSelect }: RouteCardProps) {
  const config = MODE_CONFIG[route.mode];
  const Icon = config.icon;
  const isDrive = route.mode === 'drive';
  const updatedAt = route.updatedAt
    ? new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(route.updatedAt))
    : null;

  return (
    <div className={`relative bg-white rounded-2xl border-2 ${isSelected ? 'border-green-700 shadow-lg shadow-green-100' : isBest ? 'border-orange-400 shadow-lg shadow-orange-100' : 'border-gray-100 hover:border-gray-200'} transition-all hover:shadow-md group overflow-hidden`}>
      {isBest && (
        <div className="absolute top-0 left-0 right-0 bg-orange-500 text-white text-xs font-semibold text-center py-1 tracking-wide">
          BEST OPTION
        </div>
      )}

      <div className={`p-5 ${isBest ? 'pt-8' : ''}`}>
        <div className="flex items-start justify-between gap-4">
          {/* Left: mode + operators */}
          <div className="flex items-start gap-3 min-w-0">
            <div className={`w-12 h-12 rounded-xl ${config.bgColor} ${config.borderColor} border flex items-center justify-center shrink-0`}>
              <Icon size={22} className={config.color} />
            </div>
            <div className="min-w-0">
              <div className={`text-sm font-bold ${config.color} uppercase tracking-wider`}>{config.label}</div>
              {route.title && (
                <div className="text-sm font-semibold text-gray-900 mt-0.5 line-clamp-2">
                  {route.title}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-0.5 truncate">
                {route.operators.slice(0, 2).join(' / ')}
              </div>
            </div>
          </div>

          {/* Right: price */}
          <div className="text-right shrink-0">
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(route.priceFrom, route.currency)}
            </div>
            <div className="text-xs text-gray-400">
              {isDrive
                ? `cab est. ${formatCurrency(route.priceTo, route.currency)}`
                : route.priceTo > route.priceFrom
                ? `to ${formatCurrency(route.priceTo, route.currency)} / person`
                : 'per person'}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Clock size={14} className="text-gray-400" />
            <span className="font-medium">{route.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Repeat size={14} className="text-gray-400" />
            <span>{route.frequency}</span>
          </div>
          {route.stops > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Users size={14} className="text-gray-400" />
              <span>{route.stops} stop{route.stops > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Highlights */}
        <div className="mt-3 flex flex-wrap gap-2">
          {route.highlights.map((h, i) => (
            <span key={i} className="inline-block text-xs bg-gray-50 border border-gray-100 text-gray-500 rounded-full px-2.5 py-1">
              {h}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-4 flex items-center justify-end gap-3">
          <div className="mr-auto flex items-center gap-1.5 text-xs text-gray-400">
            <Radio size={13} className={route.source === 'live' ? 'text-emerald-500' : 'text-gray-400'} />
            <span>{route.source === 'live' ? 'Live' : 'Estimated'}{updatedAt ? ` ${updatedAt}` : ''}</span>
          </div>
          <button
            type="button"
            onClick={() => onSelect?.(route)}
            className={`flex items-center gap-1.5 text-sm font-semibold ${config.color} group-hover:gap-2.5 transition-all`}
          >
            View details
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
