import { Building2, CheckCircle2, ImagePlus, IndianRupee, Loader2, MapPin, Megaphone, Phone } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { supabase } from '../lib/supabase';
import { SponsoredAdType } from '../types';

const INITIAL_FORM = {
  businessType: 'hotel' as SponsoredAdType,
  businessName: '',
  destination: '',
  city: '',
  description: '',
  mapUrl: '',
  contactPhone: '',
  contactEmail: '',
  websiteUrl: '',
  priceText: '',
  ratingText: '',
  distanceText: '',
  paymentReference: '',
};

export default function AdvertisePage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const update = (key: keyof typeof INITIAL_FORM, value: string) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (!supabase) {
      setMessage({ type: 'error', text: 'Supabase is not configured. Add your Supabase environment variables first.' });
      return;
    }

    if (!imageFile) {
      setMessage({ type: 'error', text: 'Please upload one listing image.' });
      return;
    }

    setLoading(true);

    try {
      const extension = imageFile.name.split('.').pop() || 'jpg';
      const imagePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from('ad-images')
        .upload(imagePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicImage } = supabase.storage
        .from('ad-images')
        .getPublicUrl(imagePath);

      const { error: insertError } = await supabase
        .from('sponsored_ads')
        .insert({
          business_type: form.businessType,
          business_name: form.businessName.trim(),
          destination: form.destination.trim(),
          city: form.city.trim(),
          description: form.description.trim(),
          image_url: publicImage.publicUrl,
          map_url: form.mapUrl.trim(),
          contact_phone: form.contactPhone.trim(),
          contact_email: form.contactEmail.trim() || null,
          website_url: form.websiteUrl.trim() || null,
          price_text: form.priceText.trim() || null,
          rating_text: form.ratingText.trim() || null,
          distance_text: form.distanceText.trim() || null,
          payment_reference: form.paymentReference.trim(),
          status: 'active',
        });

      if (insertError) throw insertError;

      setForm(INITIAL_FORM);
      setImageFile(null);
      setMessage({ type: 'success', text: 'Your promoted listing was submitted and is now active for matching destination searches.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Could not submit listing. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-gradient-to-b from-orange-50 via-white to-green-50">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 items-start">
          <div className="lg:sticky lg:top-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
              <Megaphone size={16} />
              Promote on Wayfinder
            </div>
            <h1 className="mt-5 text-4xl sm:text-5xl font-black text-gray-950 leading-tight">
              Get your hotel or travel agency in front of travelers.
            </h1>
            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
              Submit your business details, image, location link and payment reference. Your listing appears on destination search pages like Pune, Hyderabad, Goa and more.
            </p>

            <div className="mt-6 grid gap-3">
              {[
                ['Destination targeting', 'Ads show when travelers search routes to your city.'],
                ['Image-led cards', 'Hotel rooms, packages and agency offers get a prominent card.'],
                ['Direct leads', 'Travelers can call you or open your location/deal link.'],
              ].map(([title, text]) => (
                <div key={title} className="flex gap-3 rounded-xl bg-white border border-gray-100 p-4">
                  <CheckCircle2 size={20} className="text-green-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-gray-900">{title}</div>
                    <div className="text-sm text-gray-500">{text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="sm:col-span-2">
                <span className="text-sm font-semibold text-gray-700">Business type</span>
                <select
                  value={form.businessType}
                  onChange={event => update('businessType', event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:border-orange-400"
                >
                  <option value="hotel">Hotel room / stay</option>
                  <option value="travel_agency">Travel agency / package</option>
                </select>
              </label>

              <Input label="Business name" value={form.businessName} onChange={value => update('businessName', value)} icon="building" required />
              <Input label="Destination" value={form.destination} onChange={value => update('destination', value)} placeholder="Pune, India" icon="map" required />
              <Input label="City" value={form.city} onChange={value => update('city', value)} placeholder="Pune" required />
              <Input label="Phone" value={form.contactPhone} onChange={value => update('contactPhone', value)} icon="phone" required />
              <Input label="Email" value={form.contactEmail} onChange={value => update('contactEmail', value)} type="email" />
              <Input label="Website / booking link" value={form.websiteUrl} onChange={value => update('websiteUrl', value)} type="url" />
              <Input label="Price text" value={form.priceText} onChange={value => update('priceText', value)} placeholder="Rooms from ₹5,500" icon="rupee" />
              <Input label="Rating text" value={form.ratingText} onChange={value => update('ratingText', value)} placeholder="9.2 Superb" />
              <Input label="Distance text" value={form.distanceText} onChange={value => update('distanceText', value)} placeholder="3 km from Pune" />
              <Input label="Google Maps location link" value={form.mapUrl} onChange={value => update('mapUrl', value)} type="url" icon="map" required />
              <Input label="Payment reference / UPI ID" value={form.paymentReference} onChange={value => update('paymentReference', value)} placeholder="UPI transaction ID" required />

              <label className="sm:col-span-2">
                <span className="text-sm font-semibold text-gray-700">Description</span>
                <textarea
                  value={form.description}
                  onChange={event => update('description', event.target.value)}
                  required
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:border-orange-400"
                  placeholder="Describe rooms, travel packages, airport pickup, sightseeing, facilities..."
                />
              </label>

              <label className="sm:col-span-2 rounded-xl border-2 border-dashed border-gray-200 p-5 cursor-pointer hover:border-orange-300">
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <ImagePlus size={18} className="text-orange-600" />
                  Upload listing image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={event => setImageFile(event.target.files?.[0] ?? null)}
                  className="mt-3 block w-full text-sm text-gray-500"
                  required
                />
                {imageFile && <span className="mt-2 block text-xs text-green-700">{imageFile.name}</span>}
              </label>
            </div>

            {message && (
              <div className={`mt-4 rounded-xl p-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-bold text-white hover:bg-orange-700 disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Megaphone size={18} />}
              Pay and submit listing
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  icon?: 'building' | 'map' | 'phone' | 'rupee';
  required?: boolean;
}

function Input({ label, value, onChange, type = 'text', placeholder, icon, required }: InputProps) {
  const Icon = icon === 'building' ? Building2 : icon === 'map' ? MapPin : icon === 'phone' ? Phone : icon === 'rupee' ? IndianRupee : null;

  return (
    <label>
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <div className="relative mt-1">
        {Icon && <Icon size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
        <input
          type={type}
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl border border-gray-200 py-3 outline-none focus:border-orange-400 ${Icon ? 'pl-10 pr-3' : 'px-3'}`}
        />
      </div>
    </label>
  );
}
