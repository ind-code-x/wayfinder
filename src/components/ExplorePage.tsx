import { ArrowRight, CalendarDays, MapPin, Sparkles } from 'lucide-react';
import { SearchQuery } from '../types';
import { getDailyExplorePlaces } from '../lib/exploreIndia';

interface ExplorePageProps {
  onSearch: (query: SearchQuery) => void;
}

const CATEGORY_STYLES: Record<string, string> = {
  Temple: 'bg-orange-50 text-orange-700 border-orange-100',
  'Hill Station': 'bg-green-50 text-green-800 border-green-100',
  City: 'bg-blue-50 text-blue-800 border-blue-100',
  Beach: 'bg-cyan-50 text-cyan-800 border-cyan-100',
  Heritage: 'bg-amber-50 text-amber-800 border-amber-100',
  Nature: 'bg-lime-50 text-lime-800 border-lime-100',
};

export default function ExplorePage({ onSearch }: ExplorePageProps) {
  const places = getDailyExplorePlaces();
  const featured = places[0];
  const today = new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <main className="bg-white">
      <section className="bg-gradient-to-br from-orange-50 via-white to-green-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-center gap-2 text-sm font-semibold text-green-800 mb-4">
            <Sparkles size={17} className="text-orange-500" />
            Updated daily for India travel discovery
          </div>
          <div className="grid lg:grid-cols-[1fr_430px] gap-8 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-950 leading-tight">
                Explore India’s best places to visit
              </h1>
              <p className="mt-4 text-gray-600 text-lg max-w-2xl">
                Discover temples, hill stations, heritage cities, beaches, wildlife escapes, and route ideas you can search instantly.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                <CalendarDays size={16} />
                Today’s guide: {today}
              </div>
            </div>

            <button
              onClick={() => onSearch({ from: featured.searchFrom, to: featured.searchTo })}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] text-left shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gradient-to-br from-green-100 via-white to-orange-100"
            >
              <img
                src={featured.imageUrl}
                alt={featured.name}
                onError={event => {
                  event.currentTarget.style.display = 'none';
                }}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className={`inline-flex border rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_STYLES[featured.category]}`}>
                  Today’s featured {featured.category}
                </span>
                <h2 className="mt-3 text-2xl font-bold text-white">{featured.name}</h2>
                <p className="text-white/75 text-sm">{featured.state}</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {places.map(place => (
            <article key={place.id} className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-green-100 via-white to-orange-100">
                <img
                  src={place.imageUrl}
                  alt={place.name}
                  onError={event => {
                    event.currentTarget.style.display = 'none';
                  }}
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-3 top-3">
                  <span className={`inline-flex border rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_STYLES[place.category]}`}>
                    {place.category}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-950">{place.name}</h2>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                      <MapPin size={14} className="text-green-700" />
                      {place.state}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{place.summary}</p>
                <div className="mt-4 text-xs font-semibold text-gray-500">{place.bestFor}</div>
                <button
                  type="button"
                  onClick={() => onSearch({ from: place.searchFrom, to: place.searchTo })}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-green-800 hover:text-orange-600"
                >
                  Search route
                  <ArrowRight size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
