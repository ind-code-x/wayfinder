import { Compass } from 'lucide-react';
import { PageView } from '../types';

interface FooterProps {
  onNavigate: (view: PageView) => void;
}

const links: { section: string; items: { label: string; view: PageView }[] }[] = [
  {
    section: 'Transport',
    items: [
      { label: 'Flights', view: 'flights' },
      { label: 'Trains', view: 'trains' },
      { label: 'Buses', view: 'buses' },
      { label: 'Ferries', view: 'ferries' },
      { label: 'Car rentals', view: 'car-rentals' },
    ],
  },
  {
    section: 'Company',
    items: [
      { label: 'About us', view: 'about' },
      { label: 'Blog', view: 'blog' },
      { label: 'Careers', view: 'careers' },
      { label: 'Press', view: 'press' },
    ],
  },
  {
    section: 'Help',
    items: [
      { label: 'FAQs', view: 'faqs' },
      { label: 'Contact', view: 'contact' },
      { label: 'Privacy policy', view: 'privacy' },
      { label: 'Terms of use', view: 'terms' },
    ],
  },
];

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 mb-4 group"
            >
              <Compass size={22} className="text-orange-400 group-hover:scale-110 transition-transform" />
              <span className="text-white font-bold text-lg">
                way<span className="text-orange-400">finder</span>
              </span>
            </button>
            <p className="text-sm leading-relaxed">
              The world's travel search engine. Find the best way to get from A to B, anywhere on earth.
            </p>
          </div>

          {links.map(({ section, items }) => (
            <div key={section}>
              <h4 className="text-white text-sm font-semibold mb-3">{section}</h4>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item.view}>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.view)}
                      className="text-left text-sm hover:text-orange-400 transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>&copy; {new Date().getFullYear()} Wayfinder. All rights reserved.</p>
          <p>Made with care for travelers worldwide by AdiAru Soft Solutions Pvt Ltd</p>
        </div>
      </div>
    </footer>
  );
}
