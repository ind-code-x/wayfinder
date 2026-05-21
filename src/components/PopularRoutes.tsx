import { ArrowRight, RefreshCw, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PopularRoute, SearchQuery } from '../types';
import { getCopy, LanguageCode } from '../lib/i18n';

interface PopularRoutesProps {
  onSearch: (query: SearchQuery) => void;
  language: LanguageCode;
}

const INDIA_POPULAR_ROUTES: PopularRoute[] = [
  { id: 'india-1', from_location: 'Delhi, India', to_location: 'Mumbai, India', from_country: 'India', to_country: 'India', image_url: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Gateway%20of%20India-Mumbai-Maharashtra-DSC%200174.jpg?width=900', search_count: 6466940 },
  { id: 'india-2', from_location: 'Delhi, India', to_location: 'Bengaluru, India', from_country: 'India', to_country: 'India', image_url: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Vidhansoudha.jpg?width=900', search_count: 4779347 },
  { id: 'india-3', from_location: 'Bengaluru, India', to_location: 'Mumbai, India', from_country: 'India', to_country: 'India', image_url: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Gateway%20of%20India-Mumbai-Maharashtra-DSC%200174.jpg?width=900', search_count: 4114574 },
  { id: 'india-4', from_location: 'Delhi, India', to_location: 'Kolkata, India', from_country: 'India', to_country: 'India', image_url: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Victoria_memorial_kolkata.jpg?width=900', search_count: 3431999 },
  { id: 'india-5', from_location: 'Hyderabad, India', to_location: 'Delhi, India', from_country: 'India', to_country: 'India', image_url: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/India%20gate%20new%20delhi.jpg?width=900', search_count: 1526514 },
  { id: 'india-6', from_location: 'Hyderabad, India', to_location: 'Mumbai, India', from_country: 'India', to_country: 'India', image_url: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Charminar%20of%20Hyderabad%20Telangana.jpg?width=900', search_count: 1114072 },
];

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export default function PopularRoutes({ onSearch, language }: PopularRoutesProps) {
  const [routes, setRoutes] = useState<PopularRoute[]>(INDIA_POPULAR_ROUTES);
  const [loading, setLoading] = useState(false);
  const copy = getCopy(language);

  useEffect(() => {
    const refreshRoutes = () => {
      if (!supabase) {
        setRoutes(INDIA_POPULAR_ROUTES);
        return;
      }

      setLoading(true);
      void supabase
        .from('popular_routes')
        .select('*')
        .or('from_country.eq.India,to_country.eq.India')
        .order('search_count', { ascending: false })
        .limit(6)
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setRoutes(data as PopularRoute[]);
          } else {
            setRoutes(INDIA_POPULAR_ROUTES);
          }
          setLoading(false);
        }, () => {
          setRoutes(INDIA_POPULAR_ROUTES);
          setLoading(false);
        });
    };

    refreshRoutes();

    const channel = supabase
      ?.channel('popular-india-routes-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'popular_routes' },
        refreshRoutes
      )
      .subscribe();

    return () => {
      if (channel) supabase?.removeChannel(channel);
    };
  }, []);

  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-green-700" />
          <h2 className="text-2xl font-bold text-gray-900">{copy.popularRoutes}</h2>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          {copy.autoUpdated}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {routes.map(route => (
          <button
            key={route.id}
            onClick={() => onSearch({ from: route.from_location, to: route.to_location })}
            className="group relative rounded-2xl overflow-hidden aspect-[4/3] text-left focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <img
              src={route.image_url}
              alt={`${route.from_location} to ${route.to_location}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <span>{route.from_location.replace(', India', '')}</span>
                <ArrowRight size={16} className="text-orange-300" />
                <span>{route.to_location.replace(', India', '')}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-white/70 text-xs">
                  {route.from_country !== route.to_country
                    ? `${route.from_country} -> ${route.to_country}`
                    : route.from_country}
                </span>
                <span className="text-xs text-orange-300 font-medium">
                  {formatCount(route.search_count)} searches
                </span>
              </div>
            </div>

            <div className="absolute inset-0 ring-2 ring-inset ring-orange-400 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
          </button>
        ))}
      </div>
    </section>
  );
}
