import { Briefcase, Bus, Car, FileText, HelpCircle, Mail, Newspaper, Plane, Ship, Shield, Train, type LucideIcon } from 'lucide-react';
import { InfoPage as InfoPageType } from '../types';

const INFO_CONTENT: Record<InfoPageType, {
  title: string;
  kicker: string;
  body: string;
  bullets: string[];
  icon: LucideIcon;
}> = {
  flights: {
    title: 'Flights',
    kicker: 'Fast long-distance travel',
    body: 'Compare airport-to-airport options for Indian metro routes and international journeys. Fare and schedule integrations can be connected through flight provider APIs.',
    bullets: ['Domestic and international route options', 'Airport transfer reminders', 'Indicative INR fare ranges'],
    icon: Plane,
  },
  trains: {
    title: 'Trains',
    kicker: 'Rail-first India planning',
    body: 'Use train options for city-center travel, pilgrim towns, overnight journeys, and routes where rail is more practical than flying.',
    bullets: ['Indian Railways and IRCTC-oriented labels', 'Good for temple towns and medium-distance corridors', 'Schedule API integration ready as a next step'],
    icon: Train,
  },
  buses: {
    title: 'Buses',
    kicker: 'Intercity coach routes',
    body: 'Bus routes help cover towns, hill stations, and last-mile destinations that do not always have a direct rail or air connection.',
    bullets: ['Useful for hill stations and smaller cities', 'Works well with overnight routes', 'Can connect to bus partner APIs later'],
    icon: Bus,
  },
  ferries: {
    title: 'Ferries',
    kicker: 'Water and coastal travel',
    body: 'Ferry options are shown where relevant for islands, coastal towns, river crossings, and local water transport.',
    bullets: ['Best for select coastal and island routes', 'Useful for local transfer planning', 'Clearly separated from road and rail routes'],
    icon: Ship,
  },
  'car-rentals': {
    title: 'Car rentals',
    kicker: 'Flexible road journeys',
    body: 'Road trips and rentals are helpful for final-mile travel, hill routes, national parks, and places where fixed schedules are limiting.',
    bullets: ['Live road route support via OSRM', 'Good for scenic and flexible trips', 'Rental provider links can be added later'],
    icon: Car,
  },
  careers: {
    title: 'Careers',
    kicker: 'Build travel tools with us',
    body: 'Wayfinder is being shaped into an India-first travel planning product. Future roles may include frontend, data partnerships, routing, and travel content.',
    bullets: ['Frontend product engineering', 'Travel data partnerships', 'Destination research and content'],
    icon: Briefcase,
  },
  press: {
    title: 'Press',
    kicker: 'Wayfinder updates',
    body: 'For press and product updates, Wayfinder can share progress on India-focused route discovery, popular route data, and multimodal planning.',
    bullets: ['India-first route planning', 'Google Maps display support', 'Future provider API integrations'],
    icon: Newspaper,
  },
  faqs: {
    title: 'FAQs',
    kicker: 'Common questions',
    body: 'Wayfinder compares route choices and maps. Some prices and schedules are estimates until booking-grade provider APIs are connected.',
    bullets: ['Maps may use Google Maps embeds', 'Driving routes can use live OSRM data', 'Flight, train, and bus fares need provider APIs for live booking accuracy'],
    icon: HelpCircle,
  },
  contact: {
    title: 'Contact',
    kicker: 'Contact details',
    body: 'ADIARU SOFT SOLUTIONS PRIVATE LIMITED provides Wayfinder product support, route coverage requests, and travel technology partnership conversations.',
    bullets: ['ADIARU SOFT SOLUTIONS PRIVATE LIMITED', 'Hyderabad, India - 500090', 'Ph : +91-8380097432'],
    icon: Mail,
  },
  privacy: {
    title: 'Privacy policy',
    kicker: 'Simple privacy overview',
    body: 'Wayfinder stores only what is needed to improve route search, such as origin and destination search records when Supabase is configured.',
    bullets: ['No payment data is collected in this prototype', 'Search history may be logged for route popularity', 'Third-party maps and APIs may receive route queries'],
    icon: Shield,
  },
  terms: {
    title: 'Terms of use',
    kicker: 'Prototype usage terms',
    body: 'Wayfinder is a planning aid. Always confirm final schedules, fares, visas, road conditions, and booking rules with official providers.',
    bullets: ['Estimated fares are not booking guarantees', 'Maps and routes are informational', 'Provider terms apply when external services are used'],
    icon: FileText,
  },
};

interface InfoPageProps {
  page: InfoPageType;
}

export default function InfoPage({ page }: InfoPageProps) {
  const content = INFO_CONTENT[page];
  const Icon = content.icon;

  return (
    <main className="bg-white">
      <section className="bg-gradient-to-br from-green-50 via-white to-orange-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-center gap-2 text-sm font-semibold text-green-800 mb-4">
            <Icon size={18} className="text-orange-500" />
            {content.kicker}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-950">{content.title}</h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">{content.body}</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid gap-4">
          {content.bullets.map((bullet, index) => (
            <div key={bullet} className="flex gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-green-800 text-sm font-bold flex items-center justify-center shrink-0">
                {index + 1}
              </div>
              <p className="text-gray-700">{bullet}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
