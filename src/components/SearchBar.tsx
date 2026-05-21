import { CalendarDays, MapPin, Search, ArrowRightLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SearchQuery } from '../types';
import { getCopy, LanguageCode } from '../lib/i18n';

interface SearchBarProps {
  onSearch: (query: SearchQuery) => void;
  initialFrom?: string;
  initialTo?: string;
  initialTravelDate?: string;
  compact?: boolean;
  language: LanguageCode;
}

const SUGGESTIONS = [
  'Hyderabad, India', 'Bhimashankar, India', 'Mumbai, India', 'Delhi, India',
  'Bengaluru, India', 'Chennai, India', 'Kolkata, India', 'Pune, India',
  'Goa, India', 'Jaipur, India', 'Varanasi, India', 'Tirupati, India',
  'Rameswaram, India', 'Shimla, India', 'Ooty, India', 'Munnar, India',
  'Hampi, India', 'Udaipur, India', 'Kaziranga National Park, India',
  'London', 'Paris', 'New York', 'Tokyo', 'Sydney', 'Barcelona',
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function editDistance(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i++) {
    current[0] = i;
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[b.length];
}

function localSuggestions(term: string): string[] {
  const normalizedTerm = normalize(term);
  if (!normalizedTerm) return [];

  return SUGGESTIONS
    .map(suggestion => {
      const normalizedSuggestion = normalize(suggestion);
      const startsWith = normalizedSuggestion.startsWith(normalizedTerm);
      const includes = normalizedSuggestion.includes(normalizedTerm);
      const distance = editDistance(normalizedTerm, normalizedSuggestion.slice(0, Math.max(normalizedTerm.length, 4)));
      return {
        suggestion,
        score: startsWith ? 0 : includes ? 1 : distance + 2,
      };
    })
    .filter(item => item.score <= Math.max(4, Math.floor(normalizedTerm.length / 2)))
    .sort((a, b) => a.score - b.score)
    .map(item => item.suggestion)
    .slice(0, 5);
}

function mergeSuggestions(primary: string[], fallback: string[]): string[] {
  return [...new Set([...primary, ...fallback])].slice(0, 5);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function SearchBar({ onSearch, initialFrom = '', initialTo = '', initialTravelDate = todayISO(), compact = false, language }: SearchBarProps) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [travelDate, setTravelDate] = useState(initialTravelDate);
  const [fromFocus, setFromFocus] = useState(false);
  const [toFocus, setToFocus] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const copy = getCopy(language);

  useEffect(() => {
    const controller = new AbortController();
    const term = from.trim();

    if (term.length < 2) {
      setFromSuggestions([]);
      return;
    }

    const fallback = localSuggestions(term);

    const timeout = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: term, format: 'jsonv2', addressdetails: '1', limit: '5' });
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        const places = data
          .map((place: { name?: string; address?: { country?: string } }) =>
            [place.name, place.address?.country].filter(Boolean).join(', ')
          )
          .filter(Boolean);
        setFromSuggestions(mergeSuggestions(places, fallback));
      } catch {
        if (!controller.signal.aborted) setFromSuggestions(fallback);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [from]);

  useEffect(() => {
    const controller = new AbortController();
    const term = to.trim();

    if (term.length < 2) {
      setToSuggestions([]);
      return;
    }

    const fallback = localSuggestions(term);

    const timeout = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: term, format: 'jsonv2', addressdetails: '1', limit: '5' });
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        const places = data
          .map((place: { name?: string; address?: { country?: string } }) =>
            [place.name, place.address?.country].filter(Boolean).join(', ')
          )
          .filter(Boolean);
        setToSuggestions(mergeSuggestions(places, fallback));
      } catch {
        if (!controller.signal.aborted) setToSuggestions(fallback);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [to]);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (from.trim() && to.trim()) {
      onSearch({
        from: fromSuggestions[0] ?? from.trim(),
        to: toSuggestions[0] ?? to.trim(),
        travelDate,
      });
    }
  };

  const containerClass = compact
    ? 'relative z-50 bg-white rounded-xl shadow-md border border-gray-200 flex flex-col sm:flex-row overflow-visible'
    : 'relative z-50 bg-white rounded-2xl shadow-2xl flex flex-col lg:flex-row overflow-visible';

  const inputClass = compact
    ? 'text-sm h-12 px-4 text-gray-800 placeholder-gray-400 bg-transparent outline-none w-full'
    : 'text-base h-16 px-5 text-gray-800 placeholder-gray-400 bg-transparent outline-none w-full';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl">
      <div className={containerClass}>
        {/* From */}
        <div className="relative flex items-center flex-1 border-b sm:border-b-0 sm:border-r border-gray-200">
          <MapPin size={compact ? 16 : 18} className="ml-4 text-green-700 shrink-0" />
          <input
            value={from}
            onChange={e => setFrom(e.target.value)}
            onFocus={() => setFromFocus(true)}
            onBlur={() => setTimeout(() => setFromFocus(false), 150)}
            placeholder={copy.fromPlaceholder}
            className={inputClass}
            autoComplete="off"
          />
          {fromFocus && fromSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 z-[80] overflow-y-auto max-h-72 overscroll-contain">
              {normalize(fromSuggestions[0]) !== normalize(from) && (
                <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-orange-600 bg-orange-50">
                  Did you mean?
                </div>
              )}
              {fromSuggestions.map(s => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={() => { setFrom(s); setFromFocus(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-green-800 flex items-center gap-2"
                >
                  <MapPin size={13} className="text-gray-400" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Swap button */}
        <button
          type="button"
          onClick={handleSwap}
          className="self-center mx-2 p-2 rounded-full hover:bg-orange-50 text-gray-400 hover:text-green-700 transition-colors shrink-0"
          title="Swap"
        >
          <ArrowRightLeft size={compact ? 14 : 16} />
        </button>

        {/* To */}
        <div className="relative flex items-center flex-1 border-t sm:border-t-0 sm:border-l border-gray-200">
          <MapPin size={compact ? 16 : 18} className="ml-4 text-green-700 shrink-0" />
          <input
            value={to}
            onChange={e => setTo(e.target.value)}
            onFocus={() => setToFocus(true)}
            onBlur={() => setTimeout(() => setToFocus(false), 150)}
            placeholder={copy.toPlaceholder}
            className={inputClass}
            autoComplete="off"
          />
          {toFocus && toSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 z-[80] overflow-y-auto max-h-72 overscroll-contain">
              {normalize(toSuggestions[0]) !== normalize(to) && (
                <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-orange-600 bg-orange-50">
                  Did you mean?
                </div>
              )}
              {toSuggestions.map(s => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={() => { setTo(s); setToFocus(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-green-800 flex items-center gap-2"
                >
                  <MapPin size={13} className="text-gray-400" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Travel date */}
        <div className="relative flex items-center flex-1 border-t lg:border-t-0 lg:border-l border-gray-200">
          <CalendarDays size={compact ? 16 : 18} className="ml-4 text-orange-500 shrink-0" />
          <input
            value={travelDate}
            min={todayISO()}
            onChange={e => setTravelDate(e.target.value)}
            type="date"
            className={inputClass}
            aria-label="Travel date"
          />
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={!from.trim() || !to.trim()}
          className={`${compact ? 'h-12 px-5 text-sm' : 'h-16 px-8 text-base'} shrink-0 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold flex items-center gap-2 transition-colors sm:rounded-r-2xl ${compact ? 'rounded-b-xl sm:rounded-b-none sm:rounded-r-xl' : 'rounded-b-2xl sm:rounded-b-none'}`}
        >
          <Search size={compact ? 15 : 18} />
          {!compact && <span>{copy.search}</span>}
        </button>
      </div>
    </form>
  );
}
