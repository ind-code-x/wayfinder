import { Building2, CheckCircle2, ImagePlus, IndianRupee, Loader2, MapPin, Megaphone, Phone, ShieldCheck } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { SponsoredAdType } from '../types';

const PROMOTION_AMOUNT_INR = 299;
const SUBSCRIPTION_DAYS = 30;
const PAYMENT_PAGE_URL = import.meta.env.VITE_RAZORPAY_PAYMENT_PAGE_URL as string | undefined;

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
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canSubmit = useMemo(() => (
    form.businessName &&
    form.destination &&
    form.city &&
    form.description &&
    form.mapUrl &&
    form.contactPhone &&
    form.contactEmail &&
    form.paymentReference &&
    imageFile
  ), [form, imageFile]);

  const update = (key: keyof typeof INITIAL_FORM, value: string) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const handlePayClick = () => {
    setPaymentStarted(true);
    if (PAYMENT_PAGE_URL) {
      const url = new URL(PAYMENT_PAGE_URL);
      const successUrl = new URL(window.location.href);
      successUrl.search = '?payment=success';
      url.searchParams.set('amount', String(PROMOTION_AMOUNT_INR));
      url.searchParams.set('redirect_url', successUrl.toString());
      if (form.contactEmail) url.searchParams.set('email', form.contactEmail);
      if (form.contactPhone) url.searchParams.set('phone', form.contactPhone);
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
    } else {
      setMessage({
        type: 'error',
        text: 'Razorpay payment page URL is not configured yet. Add VITE_RAZORPAY_PAYMENT_PAGE_URL after creating your Razorpay Payment Page.',
      });
    }
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

    if (!form.paymentReference.trim()) {
      setMessage({ type: 'error', text: 'Please complete payment and enter the Razorpay payment ID/reference.' });
      return;
    }

    setLoading(true);

    try {
      const subscriptionStart = new Date();
      const subscriptionEnd = new Date(subscriptionStart);
      subscriptionEnd.setDate(subscriptionEnd.getDate() + SUBSCRIPTION_DAYS);
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
          payment_amount_inr: PROMOTION_AMOUNT_INR,
          payment_status: 'paid',
          subscription_plan: 'monthly',
          subscription_starts_at: subscriptionStart.toISOString(),
          subscription_expires_at: subscriptionEnd.toISOString(),
          status: 'active',
        });

      if (insertError) throw insertError;

      setForm(INITIAL_FORM);
      setImageFile(null);
      setPaymentStarted(false);
      setMessage({ type: 'success', text: 'Payment reference saved. Your one-month promoted listing is now active for matching destination searches.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Could not submit listing. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#f6f7fb]">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="h-14 w-14 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
            <Megaphone size={24} className="text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">ADIARU SOFT SOLUTIONS PRIVATE LIMITED</p>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950">Promote your hotel or travel agency for 1 month</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_480px] gap-8 items-start">
          <section className="space-y-6">
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-5">
                <Building2 size={19} className="text-orange-600" />
                <h2 className="text-lg font-bold text-gray-900">Listing details</h2>
              </div>

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
                <Input label="Google Maps location link" value={form.mapUrl} onChange={value => update('mapUrl', value)} type="url" icon="map" required />
                <Input label="Website / booking link" value={form.websiteUrl} onChange={value => update('websiteUrl', value)} type="url" />
                <Input label="Price text" value={form.priceText} onChange={value => update('priceText', value)} placeholder="Rooms from Rs 5,500" icon="rupee" />
                <Input label="Rating text" value={form.ratingText} onChange={value => update('ratingText', value)} placeholder="9.2 Superb" />
                <Input label="Distance text" value={form.distanceText} onChange={value => update('distanceText', value)} placeholder="3 km from Pune" />

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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                ['Destination targeting', 'Shown on matching route searches.'],
                ['Image-led card', 'Hotel/package appears with map link.'],
                ['Direct leads', 'Customers can call or open your offer.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-xl bg-white border border-gray-100 p-4">
                  <CheckCircle2 size={18} className="text-green-700 mb-2" />
                  <div className="font-bold text-gray-900 text-sm">{title}</div>
                  <div className="text-xs text-gray-500 mt-1">{text}</div>
                </div>
              ))}
            </div>
          </section>

          <aside className="lg:sticky lg:top-24 rounded-2xl bg-white shadow-xl shadow-gray-200/70 border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-green-700" />
                <h2 className="text-xl font-black text-gray-950">Payment Details</h2>
              </div>
              <div className="mt-1 h-1 w-10 rounded-full bg-blue-500" />

              <div className="mt-8 space-y-5">
                <PaymentRow label="Amount">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 font-bold text-gray-950">
                    ₹ {PROMOTION_AMOUNT_INR.toFixed(2)}
                    <span className="ml-2 text-xs font-semibold text-gray-500">/ 1 month</span>
                  </div>
                </PaymentRow>

                <PaymentRow label="Plan">
                  <div className="rounded-lg border border-green-100 bg-green-50 px-3 py-3 text-sm font-bold text-green-700">
                    Monthly promotion, expires automatically after {SUBSCRIPTION_DAYS} days
                  </div>
                </PaymentRow>

                <PaymentRow label="Email">
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={event => update('contactEmail', event.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-400"
                  />
                </PaymentRow>

                <PaymentRow label="Phone">
                  <input
                    type="tel"
                    value={form.contactPhone}
                    onChange={event => update('contactPhone', event.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-400"
                  />
                </PaymentRow>

                <PaymentRow label="Payment ID">
                  <input
                    type="text"
                    value={form.paymentReference}
                    onChange={event => update('paymentReference', event.target.value)}
                    required
                    placeholder="Enter Razorpay payment ID"
                    className="w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-400"
                  />
                </PaymentRow>
              </div>

              {message && (
                <div className={`mt-5 rounded-xl p-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message.text}
                </div>
              )}

              {paymentStarted && (
                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
                  After payment, copy the Razorpay payment ID/reference here and submit your listing.
                  The ad stops displaying automatically after one month, but the record stays in the database.
                </div>
              )}
            </div>

            <div className="grid grid-cols-[1fr_180px] border-t border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 px-6 text-xs font-bold text-gray-500">
                UPI / Visa / RuPay / NetBanking
              </div>
              <div className="grid">
                <button
                  type="button"
                  onClick={handlePayClick}
                  className="bg-blue-500 px-4 py-5 font-black text-white hover:bg-blue-600"
                >
                  Pay ₹ {PROMOTION_AMOUNT_INR.toFixed(2)}
                </button>
                <button
                  type="submit"
                  disabled={loading || !canSubmit}
                  className="bg-orange-600 px-4 py-4 text-sm font-black text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <Loader2 size={18} className="mx-auto animate-spin" /> : 'Submit Ad'}
                </button>
              </div>
            </div>
          </aside>
        </form>
      </section>
    </main>
  );
}

interface PaymentRowProps {
  label: string;
  children: React.ReactNode;
}

function PaymentRow({ label, children }: PaymentRowProps) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      {children}
    </div>
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
