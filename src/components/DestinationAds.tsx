import { ExternalLink, Hotel, MapPin, Megaphone, Phone, Star, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { SponsoredAd } from '../types';

interface DestinationAdsProps {
  destination: string;
}

function destinationCity(destination: string): string {
  return destination.split(',')[0].trim() || destination.trim();
}

export default function DestinationAds({ destination }: DestinationAdsProps) {
  const [ads, setAds] = useState<SponsoredAd[]>([]);
  const [loading, setLoading] = useState(false);
  const city = useMemo(() => destinationCity(destination), [destination]);

  useEffect(() => {
    const client = supabase;
    if (!client || !city) return;

    setLoading(true);
    void client
      .rpc('expire_sponsored_ads')
      .then(() => client
      .from('sponsored_ads')
      .select('*')
      .eq('status', 'active')
      .eq('payment_status', 'paid')
      .gt('subscription_expires_at', new Date().toISOString())
      .or(`city.ilike.%${city}%,destination.ilike.%${city}%`)
      .order('created_at', { ascending: false })
      .limit(8))
      .then(({ data, error }) => {
        if (!error && data) setAds(data as SponsoredAd[]);
        else setAds([]);
        setLoading(false);
      }, () => {
        setAds([]);
        setLoading(false);
      });
  }, [city]);

  if (!loading && ads.length === 0) return null;

  return (
    <section className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Megaphone size={18} className="text-orange-600" />
          <div>
            <h2 className="font-bold text-gray-900">Promoted stays and travel help near {city}</h2>
            <p className="text-xs text-gray-500">Paid listings from hotels and travel agencies for this destination.</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
          Sponsored
        </span>
      </div>

      {loading ? (
        <div className="p-5 text-sm text-gray-400">Loading promoted listings...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          <div className="flex gap-3 overflow-x-auto p-4">
            {ads.map(ad => {
              const TypeIcon = ad.business_type === 'hotel' ? Hotel : Users;
              return (
                <article key={ad.id} className="w-[280px] shrink-0 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                  <div className="flex gap-3">
                    <img
                      src={ad.image_url}
                      alt={ad.business_name}
                      className="w-24 h-24 object-cover rounded-lg bg-gray-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-sm text-gray-900 leading-tight line-clamp-2">{ad.business_name}</h3>
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                            <TypeIcon size={13} className="text-orange-600" />
                            <span>{ad.business_type === 'hotel' ? 'Hotel room' : 'Travel agency'}</span>
                          </div>
                        </div>
                      </div>

                      {ad.rating_text && (
                        <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-gray-800">
                          <Star size={13} className="fill-orange-400 text-orange-400" />
                          {ad.rating_text}
                        </div>
                      )}

                      <p className="mt-2 line-clamp-2 text-xs text-gray-600">{ad.description}</p>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {ad.distance_text && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-700">
                            <MapPin size={12} className="text-green-700" />
                            {ad.distance_text}
                          </span>
                        )}
                        {ad.price_text && (
                          <span className="rounded-full bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-700">
                            {ad.price_text}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href={ad.map_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-pink-600 px-3 py-2 text-xs font-bold text-white hover:bg-pink-700"
                        >
                          View deal
                          <ExternalLink size={12} />
                        </a>
                        <a
                          href={`tel:${ad.contact_phone}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:border-orange-300"
                        >
                          <Phone size={12} />
                          Call
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="min-h-[240px] bg-slate-50">
            <iframe
              title={`${city} promoted listings map`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${city} hotels travel agency`)}&output=embed`}
              className="h-full min-h-[240px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      )}
    </section>
  );
}
