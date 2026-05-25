/*
  # Sponsored Ads for Hotels and Travel Agencies

  Creates:
    - public.sponsored_ads: paid/promoted listings shown near route results.
    - storage bucket ad-images: public listing images uploaded by advertisers.

  MVP payment model:
    - The form requires a payment_reference field.
    - Listings are inserted as active so they can publish immediately.
    - Later, connect Razorpay/Stripe webhooks and change status only after verified payment.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.sponsored_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_type text NOT NULL CHECK (business_type IN ('hotel', 'travel_agency')),
  business_name text NOT NULL,
  destination text NOT NULL,
  city text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  map_url text NOT NULL,
  contact_phone text NOT NULL,
  contact_email text,
  website_url text,
  price_text text,
  rating_text text,
  distance_text text,
  payment_reference text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsored_ads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active sponsored ads" ON public.sponsored_ads;
CREATE POLICY "Anyone can read active sponsored ads"
  ON public.sponsored_ads FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

DROP POLICY IF EXISTS "Anyone can submit sponsored ads" ON public.sponsored_ads;
CREATE POLICY "Anyone can submit sponsored ads"
  ON public.sponsored_ads FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'active');

CREATE INDEX IF NOT EXISTS sponsored_ads_city_status_idx
  ON public.sponsored_ads (lower(city), status, created_at DESC);

CREATE INDEX IF NOT EXISTS sponsored_ads_destination_status_idx
  ON public.sponsored_ads (lower(destination), status, created_at DESC);

CREATE OR REPLACE FUNCTION public.touch_sponsored_ads_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sponsored_ads_touch_updated_at ON public.sponsored_ads;
CREATE TRIGGER sponsored_ads_touch_updated_at
  BEFORE UPDATE ON public.sponsored_ads
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_sponsored_ads_updated_at();

INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-images', 'ad-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Anyone can read ad images" ON storage.objects;
CREATE POLICY "Anyone can read ad images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'ad-images');

DROP POLICY IF EXISTS "Anyone can upload ad images" ON storage.objects;
CREATE POLICY "Anyone can upload ad images"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'ad-images');

INSERT INTO public.sponsored_ads (
  business_type,
  business_name,
  destination,
  city,
  description,
  image_url,
  map_url,
  contact_phone,
  contact_email,
  website_url,
  price_text,
  rating_text,
  distance_text,
  payment_reference,
  status
) VALUES
  (
    'hotel',
    'JW Marriott Pune',
    'Pune, India',
    'Pune',
    'Premium rooms near central Pune with restaurants, pool and business travel facilities.',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
    'https://www.google.com/maps/search/?api=1&query=JW%20Marriott%20Pune',
    '+91-8380097432',
    'contact@wayfinderinfo.com',
    'https://www.google.com/search?q=JW+Marriott+Pune',
    'Rooms from ₹9,000',
    '9.2 Superb',
    '3 km from Pune',
    'seed-demo',
    'active'
  ),
  (
    'hotel',
    'Lemon Tree Premier City Center Pune',
    'Pune, India',
    'Pune',
    'Comfortable city-center hotel option for families, business travelers and weekend stays.',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80',
    'https://www.google.com/maps/search/?api=1&query=Lemon%20Tree%20Premier%20City%20Center%20Pune',
    '+91-8380097432',
    'contact@wayfinderinfo.com',
    'https://www.google.com/search?q=Lemon+Tree+Premier+City+Center+Pune',
    'Rooms from ₹5,500',
    '8.1 Very Good',
    '2.4 km from Pune',
    'seed-demo',
    'active'
  ),
  (
    'travel_agency',
    'Pune Weekend Trips',
    'Pune, India',
    'Pune',
    'Local cab packages, sightseeing plans, airport pickup and nearby hill station day trips.',
    'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=900&q=80',
    'https://www.google.com/maps/search/?api=1&query=Pune%20travel%20agency',
    '+91-8380097432',
    'contact@wayfinderinfo.com',
    'https://www.google.com/search?q=Pune+travel+agency',
    'Packages from ₹2,499',
    'Trusted local agency',
    'Serves Pune routes',
    'seed-demo',
    'active'
  );
