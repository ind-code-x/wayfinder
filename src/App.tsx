import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import RouteResults from './components/RouteResults';
import PopularRoutes from './components/PopularRoutes';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import SearchBar from './components/SearchBar';
import ExplorePage from './components/ExplorePage';
import BlogPage from './components/BlogPage';
import AboutPage from './components/AboutPage';
import InfoPage from './components/InfoPage';
import { SearchQuery, RouteOption, PageView, InfoPage as InfoPageType } from './types';
import { findRoutes } from './lib/liveRoutes';
import { supabase } from './lib/supabase';
import { LanguageCode } from './lib/i18n';

const INFO_VIEWS: PageView[] = [
  'flights',
  'trains',
  'buses',
  'ferries',
  'car-rentals',
  'careers',
  'press',
  'faqs',
  'contact',
  'privacy',
  'terms',
];

export default function App() {
  const [view, setView] = useState<PageView>('home');
  const [query, setQuery] = useState<SearchQuery | null>(null);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>('en');

  const handleSearch = async (q: SearchQuery) => {
    setLoading(true);
    setQuery(q);
    setView('results');

    supabase?.from('searches').insert({
      from_location: q.from,
      to_location: q.to,
      travel_date: q.travelDate || null,
    });

    const results = await findRoutes(q.from, q.to, q.travelDate);
    setRoutes(results);
    setLoading(false);
  };

  const handleLogoClick = () => {
    setView('home');
    setQuery(null);
    setRoutes([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (nextView: PageView) => {
    setView(nextView);
    setQuery(null);
    setRoutes([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (view === 'results') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [view, query]);

  return (
    <div className="min-h-screen bg-white">
      {view === 'home' ? (
        <>
          <Header transparent onLogoClick={handleLogoClick} onNavigate={handleNavigate} activeView={view} language={language} onLanguageChange={setLanguage} />
          <Hero onSearch={handleSearch} language={language} />
          <PopularRoutes onSearch={handleSearch} language={language} />
          <HowItWorks language={language} />
          <Footer onNavigate={handleNavigate} />
        </>
      ) : view === 'results' ? (
        <>
          <Header onLogoClick={handleLogoClick} onNavigate={handleNavigate} activeView={view} language={language} onLanguageChange={setLanguage} />

          <div className="bg-gradient-to-r from-orange-600 via-white to-green-700 py-4 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
              <SearchBar
                onSearch={handleSearch}
                initialFrom={query?.from}
                initialTo={query?.to}
                initialTravelDate={query?.travelDate}
                compact
                language={language}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
                <div className="absolute inset-0 rounded-full border-4 border-green-600 border-t-transparent animate-spin" />
              </div>
              <p className="text-gray-500 text-sm">
                Checking live routes from{' '}
                <span className="font-semibold text-gray-700">{query?.from}</span> to{' '}
                <span className="font-semibold text-gray-700">{query?.to}</span>...
              </p>
            </div>
          ) : (
            query && <RouteResults from={query.from} to={query.to} routes={routes} />
          )}

          <Footer onNavigate={handleNavigate} />
        </>
      ) : (
        <>
          <Header onLogoClick={handleLogoClick} onNavigate={handleNavigate} activeView={view} language={language} onLanguageChange={setLanguage} />
          {view === 'explore' && <ExplorePage onSearch={handleSearch} />}
          {view === 'blog' && <BlogPage />}
          {view === 'about' && <AboutPage />}
          {INFO_VIEWS.includes(view) && <InfoPage page={view as InfoPageType} />}
          <Footer onNavigate={handleNavigate} />
        </>
      )}
    </div>
  );
}
