import { ArrowRight, BookOpen, MapPinned, Route } from 'lucide-react';

export default function BlogPage() {
  return (
    <main className="bg-white">
      <section className="bg-gradient-to-br from-green-50 via-white to-orange-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-center gap-2 text-sm font-semibold text-green-800 mb-4">
            <BookOpen size={17} className="text-orange-500" />
            Wayfinder Travel Blog
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-950 leading-tight">
            How to plan a smarter India trip with routes, not guesses
          </h1>
          <p className="mt-4 text-gray-600 text-lg">
            A practical guide for comparing flights, trains, buses, and road options before you book.
          </p>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg leading-8 text-gray-700">
            India travel is rarely a single-mode decision. A Delhi to Jaipur trip may be faster by train than flight after airport transfers. Hyderabad to Goa may be easiest by flight for a weekend, while Bengaluru to Hampi often makes more sense by road or overnight bus.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 my-8">
            {[
              { icon: Route, title: 'Compare the full route', text: 'Look at the door-to-door journey, not only the main transport leg.' },
              { icon: MapPinned, title: 'Check the last mile', text: 'Stations and airports can sit far from temples, beaches, or hill towns.' },
              { icon: ArrowRight, title: 'Keep alternatives ready', text: 'Weather, peak season, and sold-out trains can change the best option.' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                  <Icon size={20} className="text-orange-500 mb-3" />
                  <h2 className="text-base font-bold text-gray-900">{item.title}</h2>
                  <p className="text-sm text-gray-600 mt-2">{item.text}</p>
                </div>
              );
            })}
          </div>

          <h2 className="text-2xl font-bold text-gray-950 mt-10">A good planning flow</h2>
          <p className="text-gray-700 leading-8">
            Start with your origin and destination, then compare every practical mode. For metro routes, flights may win on speed but lose on cost. For pilgrim towns, trains and buses often reach closer to the actual temple area. For hill stations, the final road segment matters most, so total travel time should include the climb.
          </p>

          <h2 className="text-2xl font-bold text-gray-950 mt-10">What Wayfinder is built to do</h2>
          <p className="text-gray-700 leading-8">
            Wayfinder helps travelers see the shape of a journey quickly: route options, indicative fares, travel time, operators, maps, and local context. The goal is to make travel planning feel less like opening ten tabs and more like comparing clear choices.
          </p>

          <h2 className="text-2xl font-bold text-gray-950 mt-10">What comes next</h2>
          <p className="text-gray-700 leading-8">
            The next big step is connecting booking-grade provider APIs for flights, trains, and buses. Maps and route discovery are already useful, but real schedules and fares will make the product a stronger end-to-end travel planner for India.
          </p>
        </div>
      </article>
    </main>
  );
}
