/*
  # Wayfinder India - Search and Popular Routes Schema

  Run this file in the Supabase SQL editor for the project used by your
  VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY values.

  Tables:
    - searches: records route searches from the website, including travel date.
    - popular_routes: India-focused route cards shown on the home page.

  Automation:
    - Every inserted search increments the matching popular route when possible.
    - New India-related searches are added to popular_routes with a safe default image.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location text NOT NULL DEFAULT '',
  to_location text NOT NULL DEFAULT '',
  travel_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.searches
  ADD COLUMN IF NOT EXISTS travel_date date;

ALTER TABLE public.searches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert searches" ON public.searches;
CREATE POLICY "Anyone can insert searches"
  ON public.searches FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can read searches" ON public.searches;
CREATE POLICY "Authenticated users can read searches"
  ON public.searches FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS public.popular_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location text NOT NULL DEFAULT '',
  to_location text NOT NULL DEFAULT '',
  from_country text NOT NULL DEFAULT 'India',
  to_country text NOT NULL DEFAULT 'India',
  image_url text NOT NULL DEFAULT '',
  search_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.popular_routes
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.popular_routes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read popular routes" ON public.popular_routes;
CREATE POLICY "Anyone can read popular routes"
  ON public.popular_routes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE UNIQUE INDEX IF NOT EXISTS popular_routes_from_to_unique
  ON public.popular_routes (lower(from_location), lower(to_location));

CREATE INDEX IF NOT EXISTS popular_routes_search_count_idx
  ON public.popular_routes (search_count DESC);

CREATE INDEX IF NOT EXISTS searches_created_at_idx
  ON public.searches (created_at DESC);

CREATE OR REPLACE FUNCTION public.default_popular_route_image(destination text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN destination ILIKE '%mumbai%' THEN 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Gateway%20of%20India-Mumbai-Maharashtra-DSC%200174.jpg?width=900'
    WHEN destination ILIKE '%bengaluru%' OR destination ILIKE '%bangalore%' THEN 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Vidhansoudha.jpg?width=900'
    WHEN destination ILIKE '%kolkata%' THEN 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Victoria_memorial_kolkata.jpg?width=900'
    WHEN destination ILIKE '%hyderabad%' THEN 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Charminar%20of%20Hyderabad%20Telangana.jpg?width=900'
    WHEN destination ILIKE '%pune%' THEN 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Shaniwarwada%20Pune.jpg?width=900'
    WHEN destination ILIKE '%chennai%' THEN 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Chennai%20Central.jpg?width=900'
    WHEN destination ILIKE '%jaipur%' THEN 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Hawa%20Mahal%202011.jpg?width=900'
    WHEN destination ILIKE '%goa%' THEN 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Palolem%20Beach%2C%20Goa.jpg?width=900'
    WHEN destination ILIKE '%delhi%' THEN 'https://commons.wikimedia.org/wiki/Special:Redirect/file/India%20gate%20new%20delhi.jpg?width=900'
    ELSE 'https://commons.wikimedia.org/wiki/Special:Redirect/file/India%20gate%20new%20delhi.jpg?width=900'
  END
$$;

CREATE OR REPLACE FUNCTION public.route_country(location text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN location ILIKE '%india%' THEN 'India'
    WHEN position(',' in location) > 0 THEN trim(split_part(location, ',', array_length(string_to_array(location, ','), 1)))
    ELSE 'India'
  END
$$;

CREATE OR REPLACE FUNCTION public.update_popular_route_from_search()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF trim(NEW.from_location) = '' OR trim(NEW.to_location) = '' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.popular_routes (
    from_location,
    to_location,
    from_country,
    to_country,
    image_url,
    search_count,
    updated_at
  )
  VALUES (
    NEW.from_location,
    NEW.to_location,
    public.route_country(NEW.from_location),
    public.route_country(NEW.to_location),
    public.default_popular_route_image(NEW.to_location),
    1,
    now()
  )
  ON CONFLICT (lower(from_location), lower(to_location))
  DO UPDATE SET
    search_count = public.popular_routes.search_count + 1,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS searches_update_popular_routes ON public.searches;
CREATE TRIGGER searches_update_popular_routes
  AFTER INSERT ON public.searches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_popular_route_from_search();

DELETE FROM public.popular_routes
WHERE (from_country <> 'India' OR to_country <> 'India')
  AND from_location IN ('London', 'New York', 'Tokyo', 'Sydney', 'Barcelona', 'Amsterdam');

INSERT INTO public.popular_routes (
  from_location,
  to_location,
  from_country,
  to_country,
  image_url,
  search_count,
  updated_at
) VALUES
  ('Delhi, India', 'Mumbai, India', 'India', 'India', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Gateway%20of%20India-Mumbai-Maharashtra-DSC%200174.jpg?width=900', 6466940, now()),
  ('Delhi, India', 'Bengaluru, India', 'India', 'India', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Vidhansoudha.jpg?width=900', 4779347, now()),
  ('Bengaluru, India', 'Mumbai, India', 'India', 'India', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Gateway%20of%20India-Mumbai-Maharashtra-DSC%200174.jpg?width=900', 4114574, now()),
  ('Delhi, India', 'Kolkata, India', 'India', 'India', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Victoria_memorial_kolkata.jpg?width=900', 3431999, now()),
  ('Hyderabad, India', 'Delhi, India', 'India', 'India', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/India%20gate%20new%20delhi.jpg?width=900', 1526514, now()),
  ('Hyderabad, India', 'Mumbai, India', 'India', 'India', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Charminar%20of%20Hyderabad%20Telangana.jpg?width=900', 1114072, now()),
  ('Hyderabad, India', 'Pune, India', 'India', 'India', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Shaniwarwada%20Pune.jpg?width=900', 728420, now()),
  ('Chennai, India', 'Bengaluru, India', 'India', 'India', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Vidhansoudha.jpg?width=900', 689310, now()),
  ('Mumbai, India', 'Goa, India', 'India', 'India', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Palolem%20Beach%2C%20Goa.jpg?width=900', 612875, now())
ON CONFLICT (lower(from_location), lower(to_location))
DO UPDATE SET
  from_country = EXCLUDED.from_country,
  to_country = EXCLUDED.to_country,
  image_url = EXCLUDED.image_url,
  search_count = GREATEST(public.popular_routes.search_count, EXCLUDED.search_count),
  updated_at = now();
