import { Search, Map, Ticket } from 'lucide-react';
import { getCopy, LanguageCode } from '../lib/i18n';

const STEPS = [
  {
    icon: Search,
    title: 'Enter your route',
    description: 'Type in your origin and destination — cities, airports, towns, anywhere in the world.',
    color: 'text-green-700',
    bg: 'bg-green-50',
  },
  {
    icon: Map,
    title: 'Compare all options',
    description: 'We instantly show you every way to get there — flights, trains, buses, driving, and ferries.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Ticket,
    title: 'Book the best deal',
    description: 'Choose the option that fits your budget and schedule, then book directly with the provider.',
    color: 'text-blue-800',
    bg: 'bg-blue-50',
  },
];

interface HowItWorksProps {
  language: LanguageCode;
}

export default function HowItWorks({ language }: HowItWorksProps) {
  const copy = getCopy(language);

  return (
    <section className="py-16 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900">{copy.howItWorks}</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">
            {copy.howItWorksSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center mb-4`}>
                  <Icon size={28} className={step.color} />
                </div>
                <div className="w-6 h-6 rounded-full bg-orange-100 text-green-800 text-xs font-bold flex items-center justify-center mb-3">
                  {i + 1}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
