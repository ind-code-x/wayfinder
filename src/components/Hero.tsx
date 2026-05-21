import { Plane, Train, Bus, Car, Ship } from 'lucide-react';
import SearchBar from './SearchBar';
import { SearchQuery } from '../types';
import { getCopy, LanguageCode } from '../lib/i18n';

const MODES = [
  { Icon: Plane, label: 'Fly' },
  { Icon: Train, label: 'Train' },
  { Icon: Bus, label: 'Bus' },
  { Icon: Car, label: 'Drive' },
  { Icon: Ship, label: 'Ferry' },
];

interface HeroProps {
  onSearch: (query: SearchQuery) => void;
  language: LanguageCode;
}

export default function Hero({ onSearch, language }: HeroProps) {
  const copy = getCopy(language);

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
      <img
        src="https://commons.wikimedia.org/wiki/Special:Redirect/file/India%20gate%20new%20delhi.jpg?width=1800"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-green-950/75 via-slate-950/45 to-orange-900/70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_36%)]" />

      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
          {MODES.map(({ Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20"
            >
              <Icon size={12} />
              {label}
            </div>
          ))}
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight tracking-tight">
          {copy.getFromAnywhere}
          <br />
          <span className="text-orange-300">{copy.toEverywhere}</span>
        </h1>
        <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          {copy.heroSubtitle}
        </p>

        <div className="flex justify-center">
          <SearchBar onSearch={onSearch} language={language} />
        </div>

        <p className="mt-5 text-white/50 text-xs">
          {copy.routeCount}
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
