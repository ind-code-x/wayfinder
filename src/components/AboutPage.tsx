import { Compass, Globe2, Map, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="bg-white">
      <section className="bg-gradient-to-br from-orange-50 via-white to-green-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-center gap-2 text-sm font-semibold text-green-800 mb-4">
            <Compass size={17} className="text-orange-500" />
            About Wayfinder
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-950 leading-tight">
            We help travelers find the best way across India and beyond.
          </h1>
          <p className="mt-4 text-gray-600 text-lg max-w-3xl">
            Wayfinder is a travel route planning website for comparing flights, trains, buses, driving, and local transfers in one clean search.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Map, title: 'Route-first planning', text: 'We show the journey as options, not just isolated tickets.' },
            { icon: Globe2, title: 'India-focused discovery', text: 'Popular routes, temples, hill stations, cities, beaches, and heritage trips are surfaced for Indian travelers.' },
            { icon: ShieldCheck, title: 'Transparent data', text: 'Live maps and estimated prices are clearly labeled until booking APIs are connected.' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <Icon size={24} className="text-green-700 mb-4" />
                <h2 className="text-lg font-bold text-gray-950">{item.title}</h2>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-orange-100 bg-orange-50/60 p-6">
          <h2 className="text-2xl font-bold text-gray-950">Our direction</h2>
          <p className="mt-3 text-gray-700 leading-8">
            The product is being shaped into an India-friendly multimodal travel planner: real route discovery, real maps, better popular routes, and eventually live schedules and fares through trusted provider APIs.
          </p>
        </div>
      </section>
    </main>
  );
}
