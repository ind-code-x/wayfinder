import { Compass, Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { PageView } from '../types';
import { getCopy, LANGUAGES, LanguageCode } from '../lib/i18n';

interface HeaderProps {
  transparent?: boolean;
  onLogoClick: () => void;
  activeView?: PageView;
  onNavigate: (view: PageView) => void;
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
}

const NAV_ITEMS: { label: string; view: PageView }[] = [
  { label: 'Explore', view: 'explore' },
  { label: 'Blog', view: 'blog' },
  { label: 'About', view: 'about' },
  { label: 'Advertise', view: 'advertise' },
];

export default function Header({ transparent, onLogoClick, activeView = 'home', onNavigate, language, onLanguageChange }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const copy = getCopy(language);
  const currentLanguage = LANGUAGES.find(item => item.code === language) ?? LANGUAGES[0];

  const base = transparent
    ? 'absolute top-0 left-0 right-0 z-50'
    : 'sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm';

  const textColor = transparent ? 'text-white' : 'text-gray-700';
  const logoColor = transparent ? 'text-white' : 'text-green-700';

  return (
    <header className={base}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 group"
        >
          <div className={`${logoColor} group-hover:scale-110 transition-transform`}>
            <Compass size={28} strokeWidth={2.5} />
          </div>
          <span className={`text-xl font-bold tracking-tight ${logoColor}`}>
            way<span className={transparent ? 'text-orange-300' : 'text-orange-500'}>finder</span>
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.view}
              type="button"
              onClick={() => onNavigate(item.view)}
              className={`text-sm font-medium transition-colors ${
                activeView === item.view
                  ? transparent ? 'text-orange-300' : 'text-green-700'
                  : `${textColor} hover:text-orange-400`
              }`}
            >
              {item.view === 'explore' ? copy.explore : item.view === 'blog' ? copy.blog : item.view === 'about' ? copy.about : item.label}
            </button>
          ))}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLanguageOpen(!languageOpen)}
              className={`flex items-center gap-1.5 text-sm font-medium ${textColor} hover:text-orange-400 transition-colors`}
              aria-expanded={languageOpen}
            >
              <Globe size={15} />
              {currentLanguage.label}
            </button>
            {languageOpen && (
              <div className="absolute right-0 mt-3 w-44 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
                {LANGUAGES.map(item => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      onLanguageChange(item.code);
                      setLanguageOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 ${item.code === language ? 'text-green-700 font-semibold' : 'text-gray-700'}`}
                  >
                    {item.nativeName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <button
          className={`md:hidden ${textColor}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open navigation menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.view}
              type="button"
              onClick={() => {
                onNavigate(item.view);
                setMenuOpen(false);
              }}
              className={`text-left text-sm font-medium ${activeView === item.view ? 'text-green-700' : 'text-gray-700 hover:text-green-700'}`}
            >
              {item.view === 'explore' ? copy.explore : item.view === 'blog' ? copy.blog : item.view === 'about' ? copy.about : item.label}
            </button>
          ))}
          <div className="border-t border-gray-100 pt-3">
            <div className="text-xs font-semibold text-gray-400 mb-2">Language</div>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map(item => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => onLanguageChange(item.code)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm ${item.code === language ? 'border-green-700 text-green-700 bg-green-50' : 'border-gray-100 text-gray-700'}`}
                >
                  {item.nativeName}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
